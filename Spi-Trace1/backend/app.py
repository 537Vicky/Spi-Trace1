from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
from datetime import datetime
import json
import uuid

from models import db, User, URL, ScanHistory
from auth import auth_bp
from simple_scanner import scan_url_for_keywords
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity

app = Flask(__name__)

# Database Configuration
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(basedir, "database.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'super-secret-key-change-this')

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)

# CORS
CORS(app, resources={r"/*": {"origins": ["http://localhost:8080", "http://localhost:8081", "http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:8080", "http://127.0.0.1:8081", "http://127.0.0.1:5173", "http://127.0.0.1:3000"]}}, supports_credentials=True)

# Register authentication blueprint
app.register_blueprint(auth_bp)

# Create tables
with app.app_context():
    db.create_all()

# ==================== URL MANAGEMENT ====================

@app.route('/api/urls', methods=['GET'])
@jwt_required()
def get_urls():
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)
        
        if user and user.role == 'admin':
            urls = URL.query.all()
        else:
            urls = URL.query.filter_by(user_id=current_user_id).all()
             
        return jsonify([url.to_dict() for url in urls]), 200
    except Exception as e:
        print(f"ERROR in get_urls: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/urls', methods=['POST'])
@jwt_required()
def create_url():
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data.get('url') or not data.get('name'):
            return jsonify({'error': 'URL and Name are required'}), 400
            
        new_url = URL(
            id=str(uuid.uuid4()),
            user_id=current_user_id,
            url=data['url'],
            name=data['name'],
            status='enabled'
        )
        
        db.session.add(new_url)
        db.session.commit()
        return jsonify(new_url.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        print(f"ERROR in create_url: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/urls/<url_id>', methods=['PUT'])
@jwt_required()
def update_url(url_id):
    try:
        current_user_id = int(get_jwt_identity())
        url = URL.query.get(url_id)
        
        if not url:
            return jsonify({'error': 'URL not found'}), 404
            
        # Check permission
        user = User.query.get(current_user_id)
        if url.user_id != current_user_id and (not user or user.role != 'admin'):
            return jsonify({'error': 'Unauthorized'}), 403

        data = request.get_json()
        if 'name' in data:
            url.name = data['name']
        if 'url' in data:
            url.url = data['url']
        if 'status' in data:
            url.status = data['status']
            
        db.session.commit()
        return jsonify(url.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        print(f"ERROR in update_url: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/urls/<url_id>', methods=['DELETE'])
@jwt_required()
def delete_url(url_id):
    try:
        current_user_id = int(get_jwt_identity())
        url = URL.query.get(url_id)
        
        if not url:
            return jsonify({'error': 'URL not found'}), 404
            
        # Check permission
        user = User.query.get(current_user_id)
        if url.user_id != current_user_id and (not user or user.role != 'admin'):
            return jsonify({'error': 'Unauthorized'}), 403
             
        db.session.delete(url)
        db.session.commit()
        return jsonify({'message': 'URL deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"ERROR in delete_url: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# ==================== SCANNING ====================

@app.route('/api/scan', methods=['POST'])
@jwt_required()
def trigger_scan():
    try:
        current_user_id = int(get_jwt_identity())
        print(f"DEBUG: Scan requested by user_id={current_user_id}")
        
        data = request.get_json()
        print(f"DEBUG: Scan params: {data}")
        keywords = data.get('keywords', [])
        
        if not keywords:
            return jsonify({'error': 'No keywords provided'}), 400
        
        # Get enabled URLs from database
        enabled_urls = URL.query.filter_by(status='enabled').all()
        
        if not enabled_urls:
            return jsonify({'error': 'No enabled URLs to scan'}), 400
        
        print(f"Starting scan with {len(keywords)} keywords and {len(enabled_urls)} URLs")
        
        scan_id = str(uuid.uuid4())
        visited_urls = []
        matches_found = []
        errors = []
        
        # Scan each URL
        for db_url in enabled_urls:
            try:
                print(f"Scanning {db_url.url}...")
                found, matched_keywords = scan_url_for_keywords(
                    url=db_url.url,
                    keywords=keywords,
                    timeout=10
                )
                
                if found:
                    print(f"✓ Found keywords on {db_url.url}: {matched_keywords}")
                    matches_found.append({
                        'url': db_url.url,
                        'keywords': matched_keywords
                    })
                else:
                    print(f"✗ No keywords found on {db_url.url}")
                    
                visited_urls.append(db_url.url)
                
            except Exception as url_error:
                error_msg = f"Error scanning {db_url.url}: {str(url_error)}"
                print(error_msg)
                errors.append(error_msg)
                import traceback
                traceback.print_exc()
        
        # Save to database
        print(f"Creating scan history: {len(visited_urls)} URLs scanned, {len(matches_found)} matches")
        scan_history = ScanHistory(
            id=scan_id,
            user_id=current_user_id,
            keywords=json.dumps(keywords),
            urls_scanned=json.dumps(visited_urls),
            matches=json.dumps(matches_found),
            errors=json.dumps(errors),
            status='complete',
            started_at=datetime.utcnow(),
            completed_at=datetime.utcnow()
        )
        
        db.session.add(scan_history)
        db.session.commit()
        print(f"Scan {scan_id} completed and saved!")
        
        return jsonify(scan_history.to_dict()), 201
        
    except Exception as e:
        print(f"FATAL ERROR in scan: {str(e)}")
        import traceback
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'error': f"Scan failed: {str(e)}"}), 500

@app.route('/api/scans', methods=['GET'])
@jwt_required()
def get_scans():
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)
        
        if user and user.role == 'admin':
            scans = ScanHistory.query.order_by(ScanHistory.started_at.desc()).all()
        else:
            scans = ScanHistory.query.filter_by(user_id=current_user_id).order_by(ScanHistory.started_at.desc()).all()
             
        return jsonify([scan.to_dict() for scan in scans]), 200
    except Exception as e:
        print(f"ERROR in get_scans: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# ==================== HEALTH CHECK ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'Backend is running'}), 200

# ==================== RUN ====================

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
