from flask import Flask, request, jsonify
import json
from datetime import datetime
import logging
import os
import threading
import time
import uuid
import requests
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

# Import database models
from models import db, User, URL, ScanHistory
from simple_scanner import scan_url_for_keywords

app = Flask(__name__)
CORS(app)

# Database Configuration
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(basedir, "database.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db.init_app(app)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)

HEADERS = {"User-Agent": "keyword-monitor/1.0"}
REQUEST_TIMEOUT_SECONDS = 10

SCANS = {}
SCANS_LOCK = threading.Lock()

def get_enabled_urls():
    """Fetch enabled URLs from database"""
    return URL.query.filter_by(status='enabled').all()


def get_all_urls():
    """Fetch all URLs from database"""
    return URL.query.all()



def run_scan(scan_id, keywords, urls):
    logging.info("scan %s started with %s url(s)", scan_id, len(urls))
    total = len(urls)
    matches = []
    errors = []

    for index, url_entry in enumerate(urls, start=1):
        url = url_entry.get("url") if isinstance(url_entry, dict) else url_entry
        if not url:
            continue

        with SCANS_LOCK:
            SCANS[scan_id]["progress"] = {
                "current": index,
                "total": total,
                "url": url,
            }

        logging.info("scan %s progress %s/%s: %s", scan_id, index, total, url)

        try:
            html, error = fetch_page_text(url)
            if not html:
                html, polite_error = fetch_page_text_polite(url)
                if not html:
                    errors.append({"url": url, "error": polite_error or error or "fetch failed"})
                    continue

            soup = BeautifulSoup(html, "html.parser")
            text = soup.get_text().lower()

            for keyword in keywords:
                if keyword.lower() in text:
                    matches.append({"keyword": keyword, "url": url})
        except Exception as exc:
            errors.append({"url": url, "error": str(exc)})

        time.sleep(0.1)

    status = "complete"
    with SCANS_LOCK:
        SCANS[scan_id]["status"] = status
        SCANS[scan_id]["matches"] = matches
        SCANS[scan_id]["errors"] = errors
        SCANS[scan_id]["completedAt"] = datetime.utcnow().isoformat()

    logging.info(
        "scan %s finished: %s match(es), %s error(s)",
        scan_id,
        len(matches),
        len(errors),
    )


@app.route("/scan", methods=["POST"])
def scan():
    data = request.json or {}
    user_input = data.get("keywords", "")
    keywords = [k.strip() for k in user_input.split(",") if k.strip()]

    urls_payload = data.get("urls")
    urls_to_scan = normalize_scan_urls(urls_payload)
    if not urls_to_scan:
        urls_to_scan = get_enabled_urls()

    if not urls_to_scan:
        return jsonify({"error": "no valid urls to scan"}), 400

    scan_id = uuid.uuid4().hex
    with SCANS_LOCK:
        SCANS[scan_id] = {
            "status": "scanning",
            "matches": [],
            "errors": [],
            "progress": {"current": 0, "total": len(urls_to_scan), "url": None},
            "startedAt": datetime.utcnow().isoformat(),
        }

    worker = threading.Thread(target=run_scan, args=(scan_id, keywords, urls_to_scan), daemon=True)
    worker.start()

    logging.info("scan %s queued", scan_id)
    return jsonify({"status": "scanning", "scan_id": scan_id})


@app.route("/scan-status/<scan_id>", methods=["GET"])
def scan_status(scan_id):
    with SCANS_LOCK:
        scan = SCANS.get(scan_id)
    if not scan:
        return jsonify({"error": "scan not found"}), 404
    return jsonify(scan)


@app.route("/api/urls", methods=["GET"])
def get_urls():
    if not URLS:
        URLS.extend(load_urls())
    return jsonify({
        "urls": URLS,
        "total": len(URLS),
        "enabled": len([u for u in URLS if u.get("status") == "enabled"]),
    })


@app.route("/api/urls", methods=["POST"])
def add_url():
    if not URLS:
        URLS.extend(load_urls())
    data = request.json or {}
    url = (data.get("url") or "").strip()
    name = (data.get("name") or "").strip()
    if not url or not name:
        return jsonify({"error": "url and name are required"}), 400

    new_url = {
        "id": str(int(datetime.utcnow().timestamp() * 1000)),
        "url": url,
        "name": name,
        "status": data.get("status", "enabled"),
        "addedAt": datetime.utcnow().isoformat(),
    }
    URLS.append(new_url)
    save_urls(URLS)
    return jsonify({"url": new_url}), 201


@app.route("/api/urls/<url_id>", methods=["PUT"])
def update_url(url_id):
    if not URLS:
        URLS.extend(load_urls())
    data = request.json or {}
    for url in URLS:
        if url.get("id") == url_id:
            url.update({k: v for k, v in data.items() if k in {"url", "name", "status"}})
            save_urls(URLS)
            return jsonify({"url": url})
    return jsonify({"error": "not found"}), 404


@app.route("/api/urls/<url_id>", methods=["DELETE"])
def delete_url(url_id):
    global URLS
    if not URLS:
        URLS.extend(load_urls())
    before = len(URLS)
    URLS = [u for u in URLS if u.get("id") != url_id]
    if len(URLS) == before:
        return jsonify({"error": "not found"}), 404
    save_urls(URLS)
    return jsonify({"ok": True})


@app.route("/api/urls/<url_id>/toggle", methods=["PATCH"])
def toggle_url(url_id):
    if not URLS:
        URLS.extend(load_urls())
    for url in URLS:
        if url.get("id") == url_id:
            url["status"] = "disabled" if url.get("status") == "enabled" else "enabled"
            save_urls(URLS)
            return jsonify({"url": url})
    return jsonify({"error": "not found"}), 404


URLS = load_urls()


if __name__ == "__main__":
    app.run(debug=True)