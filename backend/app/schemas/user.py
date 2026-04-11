"""
User schemas
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class UserBase(BaseModel):
    """Base user schema"""
    full_name: str
    email: EmailStr


class UserCreate(UserBase):
    """User create schema"""
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    """User update schema"""
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None


class UserResponse(UserBase):
    """User response schema"""
    id: UUID
    role: str
    is_active: bool
    created_at: datetime
    suspended_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UserAdminUpdate(BaseModel):
    """Admin user update schema"""
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

