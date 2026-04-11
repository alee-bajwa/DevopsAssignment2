"""
Complete database reset and reinitialization script
Run this when you need to start fresh
"""
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

sys.path.append(".")

from app.core.database import Base
from app.core.config import settings
from app.models import User, Account, Transaction, BillService, BillPayment, AdminAction
from app.models.user import UserRole
from app.core.security import get_password_hash


def reset_database():
    """Drop all tables and recreate"""
    print("🗑️  Dropping all tables...")
    engine = create_engine(settings.DATABASE_URL)
    
    # Drop all tables
    Base.metadata.drop_all(bind=engine)
    print("✓ All tables dropped")
    
    # Create extensions and enums
    with engine.connect() as conn:
        print("\n📦 Creating extensions and enums...")
        
        # Enable UUID extension
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS pgcrypto"))
        conn.commit()
        
        # Create enums
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
                # Enum might already exist, that's okay
                pass
    
    # Create all tables
    print("\n📊 Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created successfully")


def seed_data():
    """Seed initial data"""
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        print("\n🌱 Seeding initial data...")
        
        # Create admin user
        admin_email = "admin@hakibank.com"
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
            service = BillService(**service_data)
            db.add(service)
        
        db.commit()
        print("✓ Bill services created")
        
        print("\n" + "="*60)
        print("✅ DATABASE RESET AND INITIALIZED SUCCESSFULLY!")
        print("="*60)
        print(f"Admin Login: {admin_email} / admin123")
        print("\n⚠️  IMPORTANT: Clear browser localStorage and log in again!")
        print("   In browser console, run: localStorage.clear()")
        print("="*60)
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error seeding data: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    print("="*60)
    print("DATABASE COMPLETE RESET")
    print("="*60)
    print("\n⚠️  WARNING: This will delete ALL data in the database!")
    response = input("\nAre you sure you want to continue? (yes/no): ")
    
    if response.lower() == 'yes':
        reset_database()
        seed_data()
    else:
        print("\n❌ Operation cancelled")

