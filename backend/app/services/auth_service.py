"""
Authentication service
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Optional
import string
import random
from datetime import datetime

from app.models.user import User, UserRole
from app.models.account import Account, AccountType
from app.models.transaction import Transaction, TransactionDirection, TransactionKind
from app.core.security import verify_password, get_password_hash, create_access_token


def generate_account_number() -> str:
    """Generate a unique account number in format: ACC + 10 random alphanumeric chars"""
    chars = string.ascii_uppercase + string.digits
    return "ACC" + ''.join(random.choices(chars, k=10))


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Authenticate a user by email and password
    
    Args:
        db: Database session
        email: User email
        password: Plain password
        
    Returns:
        User object if authentication successful, None otherwise
    """
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        return None
    
    if not verify_password(password, user.password_hash):
        return None
    
    if not user.is_active:
        return None
    
    return user


def create_user_with_account(
    db: Session, 
    full_name: str, 
    email: str, 
    password: str,
    account_type: str,
    initial_balance: float = 0.0
) -> tuple[User, Account]:
    """
    Create a new user along with their initial account
    
    Args:
        db: Database session
        full_name: User's full name
        email: User's email
        password: Plain password
        account_type: Type of account (main or savings)
        initial_balance: Initial account balance (default: 0.0)
        
    Returns:
        Tuple of (User, Account)
        
    Raises:
        HTTPException: If email already exists
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user = User(
        full_name=full_name,
        email=email,
        password_hash=get_password_hash(password),
        role=UserRole.USER
    )
    db.add(user)
    db.flush()  # Flush to get user.id
    
    # Generate unique account number
    while True:
        account_number = generate_account_number()
        existing = db.query(Account).filter(Account.account_number == account_number).first()
        if not existing:
            break
    
    # Create account with initial balance
    account = Account(
        user_id=user.id,
        account_type=AccountType.MAIN if account_type == "main" else AccountType.SAVINGS,
        account_number=account_number,
        balance=initial_balance
    )
    db.add(account)
    db.flush()  # Flush to get account.id
    
    # Create initial deposit transaction if balance > 0
    if initial_balance > 0:
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        random_chars = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        reference = f"TXN{timestamp}{random_chars}"
        
        initial_deposit = Transaction(
            account_id=account.id,
            amount=initial_balance,
            direction=TransactionDirection.CREDIT,
            kind=TransactionKind.DEPOSIT,
            purpose="Initial account deposit",
            reference=reference,
            initiated_by=user.id
        )
        db.add(initial_deposit)
    
    db.commit()
    db.refresh(user)
    db.refresh(account)
    
    return user, account


def login_user(db: Session, email: str, password: str) -> dict:
    """
    Login user and return access token
    
    Args:
        db: Database session
        email: User email
        password: User password
        
    Returns:
        Dictionary with access_token and user info
        
    Raises:
        HTTPException: If authentication fails
    """
    user = authenticate_user(db, email, password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role.value
        }
    }

