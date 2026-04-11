"""
Transaction schemas
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class TransferRequest(BaseModel):
    """Transfer request schema"""
    recipient_account_number: str
    amount: Decimal = Field(..., gt=0)
    purpose: Optional[str] = None


class DepositRequest(BaseModel):
    """Deposit request schema"""
    account_number: str
    amount: Decimal = Field(..., gt=0)
    purpose: Optional[str] = None


class WithdrawRequest(BaseModel):
    """Withdraw request schema"""
    amount: Decimal = Field(..., gt=0)
    purpose: Optional[str] = None


class TransactionResponse(BaseModel):
    """Transaction response schema"""
    id: UUID
    account_id: UUID
    created_at: datetime
    amount: Decimal
    direction: str
    kind: str
    purpose: Optional[str] = None
    reference: Optional[str] = None
    counterparty_account_id: Optional[UUID] = None
    counterparty_name: Optional[str] = None
    transfer_group_id: Optional[UUID] = None
    
    class Config:
        from_attributes = True


class BillServiceResponse(BaseModel):
    """Bill service response schema"""
    id: UUID
    name: str
    description: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class BillPaymentRequest(BaseModel):
    """Bill payment request schema"""
    bill_service_id: UUID
    amount: Decimal = Field(..., gt=0)
    purpose: Optional[str] = None


class BillPaymentResponse(BaseModel):
    """Bill payment response schema"""
    id: UUID
    user_id: UUID
    account_id: UUID
    bill_service_id: UUID
    amount: Decimal
    paid_at: datetime
    purpose: Optional[str] = None
    transaction_id: Optional[UUID] = None
    
    class Config:
        from_attributes = True

