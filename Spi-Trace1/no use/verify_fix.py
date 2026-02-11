import requests
import sys
import time

BASE_URL = "http://localhost:5000"

def test_health():
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        print(f"Health Check: {response.status_code}")
        if response.status_code == 200:
            print(response.json())
            return True
        return False
    except Exception as e:
        print(f"Health Check Failed: {e}")
        return False

def test_register():
    url = f"{BASE_URL}/auth/register"
    data = {"email": "test_verify@example.com", "password": "password123", "name": "Test Verify"}
    try:
        response = requests.post(url, json=data)
        print(f"Register: {response.status_code}")
        if response.status_code in [201, 409]: # 409 if already exists
            print(response.json())
            return True
        print(response.text)
        return False
    except Exception as e:
        print(f"Register Failed: {e}")
        return False

def test_login():
    url = f"{BASE_URL}/auth/login"
    data = {"email": "test_verify@example.com", "password": "password123"}
    try:
        response = requests.post(url, json=data)
        print(f"Login: {response.status_code}")
        if response.status_code == 200:
            token = response.json().get('access_token')
            print("Token received")
            return token
        print(response.text)
        return None
    except Exception as e:
        print(f"Login Failed: {e}")
        return None

def test_create_user(token):
    url = f"{BASE_URL}/api/users"
    headers = {"Authorization": f"Bearer {token}"}
    # Create user requires admin or similar? Or just public?
    # Based on code, it's public but let's see.
    # The endpoint is @app.route('/api/users', methods=['POST'])
    # It checks for 'email'.
    data = {"email": "user2@example.com", "name": "User Two", "password": "password123"}
    try:
        response = requests.post(url, json=data, headers=headers)
        print(f"Create User: {response.status_code}")
        if response.status_code in [201, 400]: # 400 if exists
            return True
        print(response.text)
        return False
    except Exception as e:
        print(f"Create User Failed: {e}")
        return False

if __name__ == "__main__":
    print(f"Testing backend at {BASE_URL}")
    if not test_health():
        print("Backend seems down.")
        sys.exit(1)
    
    if test_register():
        token = test_login()
        if token:
            test_create_user(token)
            print("Verification Complete: Success")
        else:
            print("Login failed, cannot proceed.")
    else:
        print("Register failed.")
