"""
Authentication routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.auth import SignupRequest, LoginRequest, TokenResponse
from app.services.auth_service import create_user_with_account, login_user


router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(
    request: SignupRequest,
    db: Session = Depends(get_db)
):
    """
    Register a new user with an initial account
    
    Args:
        request: Signup request with user details
        db: Database session
        
    Returns:
        Success message with account number
    """
    user, account = create_user_with_account(
        db=db,
        full_name=request.full_name,
        email=request.email,
        password=request.password,
        account_type=request.account_type,
        initial_balance=request.initial_balance
    )
    
    return {
        "message": "User created successfully",
        "account_number": account.account_number,
        "user_id": str(user.id),
        "initial_balance": float(account.balance)
    }


@router.post("/login", response_model=TokenResponse)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Login user and return JWT token
    
    Args:
        request: Login request with email and password
        db: Database session
        
    Returns:
        Access token and user information
    """
    return login_user(db, request.email, request.password)

