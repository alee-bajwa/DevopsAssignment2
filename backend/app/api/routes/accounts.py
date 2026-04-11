"""
Account routes
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.account import Account
from app.schemas.account import AccountResponse, BalanceResponse


router = APIRouter(prefix="/api/accounts", tags=["Accounts"])


@router.get("/me", response_model=List[AccountResponse])
def get_user_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's accounts
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of user's accounts
    """
    accounts = db.query(Account).filter(Account.user_id == current_user.id).all()
    return accounts


@router.get("/me/balance", response_model=BalanceResponse)
def get_account_balance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's account balance
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Account balance information
    """
    account = db.query(Account).filter(
        Account.user_id == current_user.id,
        Account.is_active == True
    ).first()
    
    if not account:
        return {"error": "No active account found"}
    
    return {
        "account_id": account.id,
        "account_number": account.account_number,
        "balance": account.balance,
        "currency": account.currency
    }

