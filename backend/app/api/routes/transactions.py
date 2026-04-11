"""
Transaction routes
"""
from fastapi import APIRouter, Depends, Request, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.api.deps import get_current_user, get_current_admin
from app.models.user import User
from app.models.transaction import Transaction
from app.schemas.transaction import (
    TransferRequest, DepositRequest, WithdrawRequest, TransactionResponse
)
from app.services.transaction_service import (
    get_user_account, transfer_money, deposit_money, withdraw_money
)


router = APIRouter(prefix="/api/transactions", tags=["Transactions"])


@router.get("/me", response_model=List[TransactionResponse])
def get_user_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    direction: Optional[str] = None,
    kind: Optional[str] = None
):
    """
    Get current user's transactions with optional filters
    
    Args:
        current_user: Current authenticated user
        db: Database session
        limit: Number of transactions to return (pagination)
        offset: Number of transactions to skip (pagination)
        direction: Filter by transaction direction (credit/debit)
        kind: Filter by transaction kind
        
    Returns:
        List of transactions
    """
    # Get user's account
    account = get_user_account(db, current_user.id)
    
    # Build query
    query = db.query(Transaction).filter(Transaction.account_id == account.id)
    
    if direction:
        query = query.filter(Transaction.direction == direction)
    
    if kind:
        query = query.filter(Transaction.kind == kind)
    
    # Order by created_at descending and apply pagination
    transactions = query.order_by(Transaction.created_at.desc()).offset(offset).limit(limit).all()
    
    return transactions


@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction_details(
    transaction_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get transaction details by ID
    
    Args:
        transaction_id: Transaction UUID
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Transaction details
    """
    # Get user's account
    account = get_user_account(db, current_user.id)
    
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.account_id == account.id
    ).first()
    
    if not transaction:
        return {"error": "Transaction not found"}
    
    return transaction


@router.post("/transfer", response_model=TransactionResponse)
def create_transfer(
    request: TransferRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    http_request: Request = None
):
    """
    Transfer money to another account
    
    Args:
        request: Transfer request
        current_user: Current authenticated user
        db: Database session
        http_request: HTTP request for IP address
        
    Returns:
        Debit transaction details
    """
    # Get user's account
    account = get_user_account(db, current_user.id)
    
    # Get IP address
    ip_address = http_request.client.host if http_request else None
    
    # Perform transfer
    debit_txn, credit_txn = transfer_money(
        db=db,
        sender_account=account,
        recipient_account_number=request.recipient_account_number,
        amount=request.amount,
        purpose=request.purpose,
        user_id=current_user.id,
        ip_address=ip_address
    )
    
    return debit_txn


@router.post("/deposit", response_model=TransactionResponse)
def create_deposit(
    request: DepositRequest,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
    http_request: Request = None
):
    """
    Deposit money into an account (admin only)
    
    Args:
        request: Deposit request
        current_user: Current authenticated admin user
        db: Database session
        http_request: HTTP request for IP address
        
    Returns:
        Transaction details
    """
    ip_address = http_request.client.host if http_request else None
    
    transaction = deposit_money(
        db=db,
        account_number=request.account_number,
        amount=request.amount,
        purpose=request.purpose,
        user_id=current_user.id,
        ip_address=ip_address
    )
    
    return transaction


@router.post("/withdraw", response_model=TransactionResponse)
def create_withdrawal(
    request: WithdrawRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    http_request: Request = None
):
    """
    Withdraw money from account
    
    Args:
        request: Withdraw request
        current_user: Current authenticated user
        db: Database session
        http_request: HTTP request for IP address
        
    Returns:
        Transaction details
    """
    # Get user's account
    account = get_user_account(db, current_user.id)
    
    ip_address = http_request.client.host if http_request else None
    
    transaction = withdraw_money(
        db=db,
        account=account,
        amount=request.amount,
        purpose=request.purpose,
        user_id=current_user.id,
        ip_address=ip_address
    )
    
    return transaction

