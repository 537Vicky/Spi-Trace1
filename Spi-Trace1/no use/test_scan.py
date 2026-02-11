import requests
import json

# Test the scan endpoint
API_URL = "http://127.0.0.1:5000"

# First, login to get a token
print("Logging in...")
login_response = requests.post(f"{API_URL}/auth/login", json={
    "email": "admin@darkwatch.com",  # Change this if needed
    "password": "password123"  # Change this if needed
})

if login_response.status_code != 200:
    print(f"Login failed: {login_response.status_code}")
    print(login_response.text)
    exit(1)

token = login_response.json()['access_token']
print(f"Got token: {token[:20]}...")

# Now try to scan
print("\nTesting scan endpoint...")
scan_response = requests.post(
    f"{API_URL}/api/scan",
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    },
    json={
        "keywords": ["test", "password"]
    }
)

print(f"Status: {scan_response.status_code}")
print(f"Response: {scan_response.text}")

if scan_response.status_code == 500:
    print("\n❌ Got 500 error!")
    try:
        error_data = scan_response.json()
        print(f"Error message: {error_data.get('error', 'No error message')}")
    except:
        print("Could not parse error JSON")
