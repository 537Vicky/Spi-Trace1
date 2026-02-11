from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import re
import bcrypt
from models import db, User

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

def is_valid_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def hash_password(password):
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def check_password(password, hashed):
    """Verify password"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

@auth_bp.route('/register', methods=['POST', 'OPTIONS'])
def register():
    """Register a new user"""
    if request.method == 'OPTIONS':
        return '', 204
    
    data = request.json or {}
    email = (data.get('email') or '').strip()
    password = (data.get('password') or '').strip()
    name = (data.get('name') or '').strip()
    
    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400
    
    if not is_valid_email(email):
        return jsonify({"error": "invalid email format"}), 400
    
    if len(password) < 6:
        return jsonify({"error": "password must be at least 6 characters"}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "email already exists"}), 409
    
    try:
        user = User(
            email=email,
            password_hash=hash_password(password),
            name=name or email.split('@')[0],
            role='client'
        )
        db.session.add(user)
        db.session.commit()
        return jsonify({
            "message": "user created successfully",
            "user": user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    """Login user"""
    if request.method == 'OPTIONS':
        return '', 204
    
    data = request.json or {}
    email = (data.get('email') or '').strip()
    password = (data.get('password') or '').strip()
    
    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400
    
    if not is_valid_email(email):
        return jsonify({"error": "invalid email format"}), 400
    
    user = User.query.filter_by(email=email).first()
    
    if user and check_password(password, user.password_hash):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "message": "login successful",
            "access_token": access_token,
            "user": user.to_dict()
        }), 200
    
    return jsonify({"error": "invalid email or password"}), 401

@auth_bp.route('/me', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_current_user():
    """Get current user info"""
    if request.method == 'OPTIONS':
        return '', 204
    
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "user not found"}), 404
    
    return jsonify(user.to_dict()), 200