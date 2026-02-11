import csv
import json
import random
import re
import time
from dataclasses import dataclass, asdict
from heapq import heappop, heappush
from typing import Dict, Iterable, List, Optional, Set, Tuple
from urllib.parse import urljoin, urlparse, urlunparse
from urllib.robotparser import RobotFileParser

import requests
from bs4 import BeautifulSoup


@dataclass
class PageFinding:
    url: str
    page_type: str
    leak_signals: Dict[str, int]
    found_keywords: List[str]


@dataclass
class CrawlReport:
    site: str
    found: bool
    findings: List[PageFinding]


class PoliteScraper:
    """
    Intelligent, polite crawler for research and security analysis.
    - Starts at the home page
    - Discovery layer from home page links
    - Respects robots.txt and rate limits
    - Avoids bypassing login/captcha/restricted content
    """

    HIGH_RISK_PATTERNS = [
        "market",
        "shop",
        "store",
        "buy",
        "sell",
        "listing",
        "product",
        "vendor",
        "seller",
        "profile",
        "dump",
        "leak",
        "paste",
        "forum",
        "thread",
    ]

    LOW_VALUE_PATTERNS = [
        "login",
        "signin",
        "signup",
        "captcha",
        "about",
        "faq",
        "rules",
        "terms",
        "privacy",
        "contact",
        "help",
        "filter",
        "sort=",
        "page=",
        "p=",
        "/page/",
    ]

    USERNAME_LABELS = [
        "username",
        "user",
        "seller",
        "vendor",
        "handle",
        "id",
    ]

    WALLET_PATTERNS = [
        r"\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b",  # BTC
        r"\b0x[a-fA-F0-9]{40}\b",  # ETH
        r"\bT[a-zA-Z0-9]{33}\b",  # TRON
    ]

    EMAIL_PATTERN = re.compile(r"\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b")
    PHONE_PATTERN = re.compile(r"\b(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{4}\b")

    def __init__(
        self,
        user_agent: str = "PoliteResearchBot/0.1 (+https://yourwebsite.com/contact; your.email@example.com)",
        requests_per_minute: float = 3.0,
        timeout: int = 12,
        proxies: Optional[List[str]] = None,
    ):
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": user_agent})
        self.timeout = timeout

        self.request_interval = 60.0 / max(0.1, requests_per_minute)
        self.last_request_time = 0.0

        self.cache: Dict[str, Tuple[float, str]] = {}
        self.proxies = proxies or []
        self.robots: Dict[str, RobotFileParser] = {}

    def _respect_rate_limit(self) -> None:
        now = time.time()
        elapsed = now - self.last_request_time
        if elapsed < self.request_interval:
            sleep_time = self.request_interval - elapsed + random.uniform(0.3, 1.2)
            print(f"Rate limiting - sleeping {sleep_time:.2f} seconds")
            time.sleep(sleep_time)
        self.last_request_time = time.time()

    def _get_proxy(self) -> Optional[Dict[str, str]]:
        if not self.proxies:
            return None
        proxy = random.choice(self.proxies)
        return {"http": proxy, "https": proxy}

    def _get_robot_parser(self, url: str) -> RobotFileParser:
        parsed = urlparse(url)
        base = f"{parsed.scheme}://{parsed.netloc}"
        if base in self.robots:
            return self.robots[base]

        robots_url = urljoin(base, "/robots.txt")
        rp = RobotFileParser()
        try:
            rp.set_url(robots_url)
            rp.read()
        except Exception:
            rp.parse("".splitlines())
        self.robots[base] = rp
        return rp

    def _allowed_by_robots(self, url: str) -> bool:
        rp = self._get_robot_parser(url)
        return rp.can_fetch(self.session.headers.get("User-Agent", "*"), url)

    def _normalize_url(self, url: str) -> str:
        parsed = urlparse(url)
        cleaned = parsed._replace(fragment="")
        return urlunparse(cleaned)

    def _is_low_value_url(self, url: str) -> bool:
        lowered = url.lower()
        return any(token in lowered for token in self.LOW_VALUE_PATTERNS)

    def _classify_url(self, url: str, anchor_text: str) -> str:
        lowered = url.lower()
        anchor = anchor_text.lower()

        if any(token in lowered for token in ("vendor", "seller", "profile")):
            return "vendor"
        if any(token in lowered for token in ("listing", "product", "item")):
            return "listing"
        if any(token in lowered for token in ("market", "shop", "store")):
            return "marketplace"
        if any(token in lowered for token in ("dump", "leak", "paste")):
            return "dump"
        if any(token in lowered for token in ("forum", "thread", "post")):
            return "forum"
        if any(token in anchor for token in ("vendor", "seller")):
            return "vendor"
        if any(token in anchor for token in ("listing", "product", "item")):
            return "listing"
        if any(token in anchor for token in ("market", "shop", "store")):
            return "marketplace"
        if any(token in anchor for token in ("dump", "leak", "paste")):
            return "dump"
        return "other"

    def _score_link(self, url: str, anchor_text: str) -> int:
        score = 0
        lowered = url.lower()
        anchor = anchor_text.lower()

        for token in self.HIGH_RISK_PATTERNS:
            if token in lowered:
                score += 3
            if token in anchor:
                score += 2

        if self._is_low_value_url(url):
            score -= 5

        return score

    def _detect_leak_signals(self, text: str) -> Dict[str, int]:
        leak_signals: Dict[str, int] = {}

        emails = self.EMAIL_PATTERN.findall(text)
        phones = self.PHONE_PATTERN.findall(text)

        if emails:
            leak_signals["emails"] = len(set(emails))
        if phones:
            leak_signals["phones"] = len(set(phones))

        wallet_count = 0
        for pattern in self.WALLET_PATTERNS:
            wallet_count += len(re.findall(pattern, text))
        if wallet_count:
            leak_signals["wallets"] = wallet_count

        username_count = 0
        lowered = text.lower()
        for label in self.USERNAME_LABELS:
            username_count += len(re.findall(rf"{label}\s*[:\-]\s*[a-zA-Z0-9_\-]{{3,}}", lowered))
        if username_count:
            leak_signals["usernames"] = username_count

        # Dump-like structure: many separators or repeated records
        line_breaks = text.count("\n")
        if line_breaks > 120:
            leak_signals["dump_structure"] = 1

        return leak_signals

    def get(self, url: str, use_cache: bool = True, max_age_seconds: int = 86400) -> Optional[str]:
        url = self._normalize_url(url)
        if use_cache and url in self.cache:
            timestamp, html = self.cache[url]
            if time.time() - timestamp < max_age_seconds:
                print(f"Cache hit: {url}")
                return html

        if not self._allowed_by_robots(url):
            print(f"Blocked by robots.txt: {url}")
            return None

        if self._is_low_value_url(url):
            print(f"Skipping low-value url: {url}")
            return None

        self._respect_rate_limit()

        try:
            resp = self.session.get(
                url,
                allow_redirects=True,
                timeout=self.timeout,
                proxies=self._get_proxy(),
            )
            resp.raise_for_status()
            html = resp.text
            self.cache[url] = (time.time(), html)
            return html
        except requests.RequestException as exc:
            print(f"Request failed: {url} -> {exc}")
            return None

    def _extract_links(self, html: str, base_url: str) -> List[Tuple[str, str]]:
        soup = BeautifulSoup(html, "html.parser")
        links: List[Tuple[str, str]] = []

        for a in soup.find_all("a", href=True):
            href = a["href"].strip()
            if not href or href.startswith(("#", "javascript:", "mailto:", "tel:")):
                continue
            full_url = urljoin(base_url, href)
            anchor_text = a.get_text(" ", strip=True)
            links.append((full_url, anchor_text))

        return links

    def _analyze_page(self, url: str, html: str, keywords: List[str]) -> PageFinding:
        soup = BeautifulSoup(html, "html.parser")
        text = soup.get_text(separator=" ", strip=True)
        lowered = text.lower()

        found_keywords = []
        for kw in keywords:
            if kw and kw.lower() in lowered:
                found_keywords.append(kw)

        leak_signals = self._detect_leak_signals(text)

        page_type = "other"
        if soup.find("table"):
            page_type = "listing"
        elif len(soup.find_all("article")) > 0:
            page_type = "forum"

        return PageFinding(
            url=url,
            page_type=page_type,
            leak_signals=leak_signals,
            found_keywords=found_keywords,
        )

    def crawl(
        self,
        start_url: str,
        keywords: List[str],
        max_pages: int = 80,
        min_priority_to_expand: int = 3,
    ) -> CrawlReport:
        parsed = urlparse(start_url)
        home_url = f"{parsed.scheme}://{parsed.netloc}"

        visited: Set[str] = set()
        findings: List[PageFinding] = []

        # Home page discovery layer
        home_html = self.get(home_url)
        if not home_html:
            return CrawlReport(site=home_url, found=False, findings=[])

        home_finding = self._analyze_page(home_url, home_html, keywords)
        if home_finding.leak_signals:
            findings.append(home_finding)

        links = self._extract_links(home_html, home_url)
        queue: List[Tuple[int, int, str, str]] = []

        for link, anchor in links:
            normalized = self._normalize_url(link)
            score = self._score_link(normalized, anchor)
            if score <= 0:
                continue
            heappush(queue, (-score, 1, normalized, anchor))

        pages_scanned = 0
        while queue and pages_scanned < max_pages:
            neg_score, depth, url, anchor = heappop(queue)
            score = -neg_score
            if url in visited:
                continue
            visited.add(url)

            html = self.get(url)
            if not html:
                continue

            page_finding = self._analyze_page(url, html, keywords)
            if page_finding.leak_signals:
                findings.append(page_finding)

            pages_scanned += 1

            # Only expand if this is a high-priority path or leak signals exist
            should_expand = score >= min_priority_to_expand or bool(page_finding.leak_signals)
            if not should_expand:
                continue

            # Dynamic depth: deeper for higher scores
            max_depth = 2 if score < 5 else 3
            if depth >= max_depth:
                continue

            for child_url, child_anchor in self._extract_links(html, url):
                normalized = self._normalize_url(child_url)
                child_score = self._score_link(normalized, child_anchor)
                if child_score <= 0:
                    continue
                heappush(queue, (-child_score, depth + 1, normalized, child_anchor))

        found = any(finding.leak_signals for finding in findings)
        return CrawlReport(site=home_url, found=found, findings=findings)

    def save_results_to_csv(self, report: CrawlReport, csv_path: str) -> None:
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["site", "found", "url", "page_type", "leak_signals", "found_keywords"])
            for finding in report.findings:
                writer.writerow([
                    report.site,
                    "FOUND" if report.found else "NOT FOUND",
                    finding.url,
                    finding.page_type,
                    json.dumps(finding.leak_signals),
                    ",".join(finding.found_keywords),
                ])

    def save_results_to_json(self, report: CrawlReport, json_path: str) -> None:
        payload = {
            "site": report.site,
            "found": report.found,
            "findings": [asdict(finding) for finding in report.findings],
        }
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)


if __name__ == "__main__":
    START_URL = "https://example.com/"
    KEYWORDS = ["password", "leak", "dump", "credentials"]

    scraper = PoliteScraper(
        user_agent="MyResearchProject/0.1 (your.email@example.com)",
        requests_per_minute=2.0,
        proxies=[],
    )

    report = scraper.crawl(start_url=START_URL, keywords=KEYWORDS)
    if report.found:
        print("FOUND")
    else:
        print("NOT FOUND")

    for finding in report.findings:
        print(f"- {finding.url} [{finding.page_type}] leak_signals={finding.leak_signals}")
        if finding.found_keywords:
            print(f"  keywords: {', '.join(finding.found_keywords)}")

    scraper.save_results_to_csv(report, "scan_results.csv")
    scraper.save_results_to_json(report, "scan_results.json")
    print("Saved results to scan_results.csv and scan_results.json")
