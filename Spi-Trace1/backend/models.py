from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(100))
    role = db.Column(db.String(20), default='client')  # 'client' or 'admin'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    urls = db.relationship('URL', backref='user', lazy=True, cascade='all, delete-orphan')
    scans = db.relationship('ScanHistory', backref='user', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class URL(db.Model):
    __tablename__ = 'urls'
    
    id = db.Column(db.String(50), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    url = db.Column(db.String(500), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(20), default='enabled')  # 'enabled' or 'disabled'
    added_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('user_id', 'url', name='unique_user_url'),)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'url': self.url,
            'name': self.name,
            'status': self.status,
            'added_at': self.added_at.isoformat() if self.added_at else None
        }

class ScanHistory(db.Model):
    __tablename__ = 'scan_history'
    
    id = db.Column(db.String(50), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    keywords = db.Column(db.Text, nullable=False)  # JSON string
    urls_scanned = db.Column(db.Text, nullable=False)  # JSON string
    matches = db.Column(db.Text, nullable=False)  # JSON string
    errors = db.Column(db.Text, nullable=False)  # JSON string
    status = db.Column(db.String(20), default='scanning')  # 'scanning', 'complete', 'failed'
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    progress = db.Column(db.Text, nullable=True)  # JSON string

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'keywords': json.loads(self.keywords) if self.keywords else [],
            'urls_scanned': json.loads(self.urls_scanned) if self.urls_scanned else [],
            'matches': json.loads(self.matches) if self.matches else [],
            'errors': json.loads(self.errors) if self.errors else [],
            'status': self.status,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'progress': json.loads(self.progress) if self.progress else None
        }
