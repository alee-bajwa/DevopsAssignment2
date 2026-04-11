"""
Bill payment routes
"""
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.transaction import BillService
from app.schemas.transaction import BillServiceResponse, BillPaymentRequest, BillPaymentResponse
from app.services.transaction_service import get_user_account, pay_bill


router = APIRouter(prefix="/api/bills", tags=["Bills"])


@router.get("/services", response_model=List[BillServiceResponse])
def get_bill_services(
    db: Session = Depends(get_db)
):
    """
    Get all available bill services
    
    Args:
        db: Database session
        
    Returns:
        List of bill services
    """
    services = db.query(BillService).all()
    return services


@router.post("/pay", response_model=BillPaymentResponse)
def pay_bill_service(
    request: BillPaymentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    http_request: Request = None
):
    """
    Pay a bill
    
    Args:
        request: Bill payment request
        current_user: Current authenticated user
        db: Database session
        http_request: HTTP request for IP address
        
    Returns:
        Bill payment details
    """
    # Get user's account
    account = get_user_account(db, current_user.id)
    
    ip_address = http_request.client.host if http_request else None
    
    bill_payment = pay_bill(
        db=db,
        user_id=current_user.id,
        account=account,
        bill_service_id=request.bill_service_id,
        amount=request.amount,
        purpose=request.purpose,
        ip_address=ip_address
    )
    
    return bill_payment

