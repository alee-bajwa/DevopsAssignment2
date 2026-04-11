"""
Database initialization script
"""
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add app to path
sys.path.append(".")

from app.core.database import Base
from app.core.config import settings
from app.models import User, Account, Transaction, BillService, BillPayment, AdminAction
from app.models.user import UserRole
from app.models.account import AccountType
from app.core.security import get_password_hash


def create_tables():
    """Create all database tables"""
    engine = create_engine(settings.DATABASE_URL)
    
    # Create extensions and enums using raw SQL
    with engine.connect() as conn:
        # Enable UUID extension
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS pgcrypto"))
        conn.commit()
        
        # Create enums (if they don't exist)
        enums = [
            "CREATE TYPE account_type AS ENUM ('main','savings')",
            "CREATE TYPE txn_direction AS ENUM ('debit','credit')",
            "CREATE TYPE txn_kind AS ENUM ('deposit','withdrawal','transfer','bill_payment','fee','adjustment')",
            "CREATE TYPE user_role AS ENUM ('user','admin')"
        ]
        
        for enum_sql in enums:
            try:
                conn.execute(text(enum_sql))
                conn.commit()
            except Exception as e:
                conn.rollback()
                print(f"Enum might already exist: {e}")
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created successfully")


def seed_data():
    """Seed initial data"""
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # Create admin user if not exists
        admin_email = "admin@hakibank.com"
        admin = db.query(User).filter(User.email == admin_email).first()
        
        if not admin:
            admin = User(
                full_name="Admin User",
                email=admin_email,
                password_hash=get_password_hash("admin123"),
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(admin)
            db.commit()
            print(f"✓ Admin user created: {admin_email} / admin123")
        
        # Create sample bill services
        bill_services = [
            {"name": "Electricity Bill", "description": "Pay your electricity bills"},
            {"name": "Water Bill", "description": "Pay your water bills"},
            {"name": "Internet Service", "description": "Pay your internet bills"},
            {"name": "Phone Service", "description": "Pay your phone bills"},
            {"name": "Credit Card", "description": "Pay your credit card bills"}
        ]
        
        for service_data in bill_services:
            existing = db.query(BillService).filter(BillService.name == service_data["name"]).first()
            if not existing:
                service = BillService(**service_data)
                db.add(service)
        
        db.commit()
        print("✓ Bill services created")
        
        print("\n" + "="*60)
        print("Database initialized successfully!")
        print("="*60)
        print(f"Admin Login: {admin_email} / admin123")
        print("="*60)
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    print("Initializing database...")
    create_tables()
    seed_data()

