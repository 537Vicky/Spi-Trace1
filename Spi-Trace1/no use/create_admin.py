from app import app
from models import db, User
import bcrypt

def create_admin():
    with app.app_context():
        email = "admin@darkwatch.com"
        password = "adminpassword123"
        name = "System Admin"
        
        # Check if admin exists
        existing_admin = User.query.filter_by(email=email).first()
        if existing_admin:
            print(f"Admin user {email} already exists.")
            # Optionally update password?
            return

        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        admin_user = User(
            email=email,
            password_hash=password_hash,
            name=name,
            role='admin'
        )
        
        db.session.add(admin_user)
        db.session.commit()
        print(f"Admin user created successfully:\nEmail: {email}\nPassword: {password}")

if __name__ == "__main__":
    create_admin()
