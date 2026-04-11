"""
Account schemas
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class AccountResponse(BaseModel):
    """Account response schema"""
    id: UUID
    user_id: UUID
    account_type: str
    account_number: str
    currency: str
    balance: Decimal
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class BalanceResponse(BaseModel):
    """Balance response schema"""
    account_id: UUID
    account_number: str
    balance: Decimal
    currency: str

