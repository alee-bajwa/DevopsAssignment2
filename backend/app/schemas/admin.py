"""
Admin schemas
"""
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID


class AdminStatsResponse(BaseModel):
    """Admin statistics response schema"""
    total_users: int
    total_accounts: int
    total_transactions: int
    active_today: int
    user_growth_percentage: float
    transaction_volume_today: float
    recent_signups: list


class AdminActionResponse(BaseModel):
    """Admin action response schema"""
    id: int
    admin_user_id: Optional[UUID] = None
    action_type: str
    target_user_id: Optional[UUID] = None
    details: Optional[Dict[str, Any]] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

