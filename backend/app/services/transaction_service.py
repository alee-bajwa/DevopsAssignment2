"""
Transaction service
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from uuid import UUID, uuid4
from decimal import Decimal
from datetime import datetime
import string
import random

from app.models.account import Account
from app.models.transaction import Transaction, TransactionDirection, TransactionKind
from app.models.transaction import BillService, BillPayment


def generate_transaction_reference() -> str:
    """Generate a unique transaction reference"""
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    random_chars = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"TXN{timestamp}{random_chars}"


def get_account_by_number(db: Session, account_number: str) -> Account:
    """Get account by account number"""
    # Clean the account number: remove spaces, trim whitespace, convert to uppercase
    # This handles cases where users copy formatted numbers like "ACC1 2345 6789 0"
    clean_account_number = account_number.strip().replace(' ', '').replace('-', '').upper()
    
    account = db.query(Account).filter(Account.account_number == clean_account_number).first()
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Account not found. Please check the account number and try again."
        )
    if not account.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is not active"
        )
    return account


def get_user_account(db: Session, user_id: UUID) -> Account:
    """Get user's primary account"""
    # First check if user has any accounts at all
    all_accounts = db.query(Account).filter(Account.user_id == user_id).all()
    
    if not all_accounts:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No account found for user. Please contact support. User ID: {user_id}"
        )
    
    # Get active account
    account = db.query(Account).filter(
        Account.user_id == user_id,
        Account.is_active == True
    ).first()
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your account is not active. Please contact support."
        )
    return account


def transfer_money(
    db: Session,
    sender_account: Account,
    recipient_account_number: str,
    amount: Decimal,
    purpose: str = None,
    user_id: UUID = None,
    ip_address: str = None
) -> tuple[Transaction, Transaction]:
    """
    Transfer money between accounts
    
    Args:
        db: Database session
        sender_account: Sender's account object
        recipient_account_number: Recipient's account number
        amount: Amount to transfer
        purpose: Transfer purpose (optional)
        user_id: User initiating the transfer
        ip_address: IP address of the request
        
    Returns:
        Tuple of (debit_transaction, credit_transaction)
        
    Raises:
        HTTPException: If insufficient funds or invalid recipient
    """
    # Get recipient account
    recipient_account = get_account_by_number(db, recipient_account_number)
    
    # Validate transfer
    if sender_account.id == recipient_account.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot transfer to your own account. Please enter a different recipient account number."
        )
    
    if sender_account.balance < amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient funds"
        )
    
    # Generate transfer group ID and reference
    transfer_group_id = uuid4()
    reference = generate_transaction_reference()
    
    try:
        # Update balances
        sender_account.balance -= amount
        recipient_account.balance += amount
        
        # Create debit transaction (sender)
        debit_txn = Transaction(
            account_id=sender_account.id,
            amount=amount,
            direction=TransactionDirection.DEBIT,
            kind=TransactionKind.TRANSFER,
            purpose=purpose,
            reference=reference,
            initiated_by=user_id,
            counterparty_account_id=recipient_account.id,
            counterparty_name=recipient_account.user.full_name,
            transfer_group_id=transfer_group_id,
            created_by_ip=ip_address
        )
        
        # Create credit transaction (recipient)
        credit_txn = Transaction(
            account_id=recipient_account.id,
            amount=amount,
            direction=TransactionDirection.CREDIT,
            kind=TransactionKind.TRANSFER,
            purpose=purpose,
            reference=reference,
            initiated_by=user_id,
            counterparty_account_id=sender_account.id,
            counterparty_name=sender_account.user.full_name,
            transfer_group_id=transfer_group_id,
            created_by_ip=ip_address
        )
        
        db.add(debit_txn)
        db.add(credit_txn)
        db.commit()
        db.refresh(debit_txn)
        db.refresh(credit_txn)
        
        return debit_txn, credit_txn
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Transfer failed"
        )


def deposit_money(
    db: Session,
    account_number: str,
    amount: Decimal,
    purpose: str = None,
    user_id: UUID = None,
    ip_address: str = None
) -> Transaction:
    """
    Deposit money into an account (admin only)
    
    Args:
        db: Database session
        account_number: Account number
        amount: Amount to deposit
        purpose: Deposit purpose
        user_id: User initiating the deposit
        ip_address: IP address
        
    Returns:
        Transaction object
    """
    account = get_account_by_number(db, account_number)
    
    try:
        # Update balance
        account.balance += amount
        
        # Create transaction
        transaction = Transaction(
            account_id=account.id,
            amount=amount,
            direction=TransactionDirection.CREDIT,
            kind=TransactionKind.DEPOSIT,
            purpose=purpose,
            reference=generate_transaction_reference(),
            initiated_by=user_id,
            created_by_ip=ip_address
        )
        
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        
        return transaction
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Deposit failed"
        )


def withdraw_money(
    db: Session,
    account: Account,
    amount: Decimal,
    purpose: str = None,
    user_id: UUID = None,
    ip_address: str = None
) -> Transaction:
    """
    Withdraw money from an account
    
    Args:
        db: Database session
        account: Account object
        amount: Amount to withdraw
        purpose: Withdrawal purpose
        user_id: User initiating the withdrawal
        ip_address: IP address
        
    Returns:
        Transaction object
        
    Raises:
        HTTPException: If insufficient funds
    """
    if account.balance < amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient funds"
        )
    
    try:
        # Update balance
        account.balance -= amount
        
        # Create transaction
        transaction = Transaction(
            account_id=account.id,
            amount=amount,
            direction=TransactionDirection.DEBIT,
            kind=TransactionKind.WITHDRAWAL,
            purpose=purpose,
            reference=generate_transaction_reference(),
            initiated_by=user_id,
            created_by_ip=ip_address
        )
        
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        
        return transaction
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Withdrawal failed"
        )


def pay_bill(
    db: Session,
    user_id: UUID,
    account: Account,
    bill_service_id: UUID,
    amount: Decimal,
    purpose: str = None,
    ip_address: str = None
) -> BillPayment:
    """
    Pay a bill
    
    Args:
        db: Database session
        user_id: User ID
        account: User's account
        bill_service_id: Bill service ID
        amount: Amount to pay
        purpose: Payment purpose
        ip_address: IP address
        
    Returns:
        BillPayment object
        
    Raises:
        HTTPException: If insufficient funds or bill service not found
    """
    # Check bill service exists
    bill_service = db.query(BillService).filter(BillService.id == bill_service_id).first()
    if not bill_service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bill service not found"
        )
    
    # Check balance
    if account.balance < amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient funds"
        )
    
    try:
        # Update balance
        account.balance -= amount
        
        # Create transaction
        transaction = Transaction(
            account_id=account.id,
            amount=amount,
            direction=TransactionDirection.DEBIT,
            kind=TransactionKind.BILL_PAYMENT,
            purpose=purpose or f"Bill payment to {bill_service.name}",
            reference=generate_transaction_reference(),
            initiated_by=user_id,
            counterparty_name=bill_service.name,
            created_by_ip=ip_address
        )
        db.add(transaction)
        db.flush()
        
        # Create bill payment record
        bill_payment = BillPayment(
            user_id=user_id,
            account_id=account.id,
            bill_service_id=bill_service_id,
            amount=amount,
            purpose=purpose,
            transaction_id=transaction.id,
            created_by_ip=ip_address
        )
        db.add(bill_payment)
        db.commit()
        db.refresh(bill_payment)
        
        return bill_payment
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Bill payment failed"
        )

