# backend/view_db.py
import sqlite3
import os

db_file = 'database.db'

if not os.path.exists(db_file):
    print(f"\n❌ Database file '{db_file}' not found!")
    print("   Run 'python app.py' first to create the database.\n")
    exit(1)

conn = sqlite3.connect(db_file)
cursor = conn.cursor()

# Check what tables exist
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()

print("DATABASE TABLES")
print("="*80)

if not tables:
    print("\nNo tables found in database!")
    print("   Run 'python app.py' to initialize the database.\n")
    conn.close()
    exit(1)

print(f"\nTables: {[t[0] for t in tables]}\n")

# Try to get users
try:
    cursor.execute('SELECT id, email, name, role, created_at FROM users')
    users = cursor.fetchall()
    
    print("="*80)
    print("USERS")
    print("="*80 + "\n")
    
    if not users:
        print("No users in database yet.\n")
    else:
        print(f"{'ID':<5} {'Email':<30} {'Name':<20} {'Role':<10} {'Created':<20}")
        print("-"*80)
        for user in users:
            print(f"{user[0]:<5} {user[1]:<30} {user[2]:<20} {user[3]:<10} {user[4]:<20}")
    print(f"\nTotal: {len(users)} users\n")
except Exception as e:
    print(f"Error reading users: {e}")

# Try to get URLs
try:
    cursor.execute('SELECT id, user_id, url, name, status FROM urls')
    urls = cursor.fetchall()
    
    print("="*80)
    print("URLS (Dark Web Sources)")
    print("="*80 + "\n")
    
    if not urls:
        print("No URLs in database yet.\n")
    else:
        print(f"{'ID':<36} {'User ID':<8} {'Name':<20} {'Status':<10} {'URL':<30}")
        print("-"*80)
        for url in urls:
            print(f"{url[0]:<36} {url[1]:<8} {url[3]:<20} {url[4]:<10} {url[2]:<30}")
    print(f"\nTotal: {len(urls)} urls\n")
except Exception as e:
    print(f"Error reading urls: {e}")

# Try to get Scan History
try:
    cursor.execute('SELECT id, user_id, status, started_at FROM scan_history')
    scans = cursor.fetchall()
    
    print("="*80)
    print("SCAN HISTORY")
    print("="*80 + "\n")
    
    if not scans:
        print("No scan history in database yet.\n")
    else:
        print(f"{'ID':<36} {'User ID':<8} {'Status':<10} {'Started':<20}")
        print("-"*80)
        for scan in scans:
            print(f"{scan[0]:<36} {scan[1]:<8} {scan[2]:<10} {scan[3]:<20}")
    print(f"\nTotal: {len(scans)} scans\n")
except Exception as e:
    print(f"Error reading scan history: {e}")

print("="*80 + "\n")
conn.close()