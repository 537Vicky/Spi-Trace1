from app import app, db
from models import URL, User, ScanHistory

with app.app_context():
    print("=" * 50)
    print("DATABASE CONTENTS")
    print("=" * 50)
    
    print("\n--- USERS ---")
    users = User.query.all()
    for u in users:
        print(f"ID: {u.id}, Email: {u.email}, Role: {u.role}")
    
    print("\n--- URLS ---")
    urls = URL.query.all()
    for url in urls:
        print(f"ID: {url.id}, URL: {url.url}, Name: {url.name}, Status: {url.status}, User: {url.user_id}")
    
    print("\n--- SCAN HISTORY ---")
    scans = ScanHistory.query.all()
    for scan in scans:
        print(f"ID: {scan.id}, User: {scan.user_id}, Status: {scan.status}")
    
    print("\n--- ENABLED URLS ---")
    enabled = URL.query.filter_by(status='enabled').all()
    print(f"Found {len(enabled)} enabled URLs")
    for url in enabled:
        print(f"  - {url.url}")
