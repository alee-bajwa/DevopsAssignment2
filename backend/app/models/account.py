"""
Account model
"""
from sqlalchemy import Column, String, Boolean, DateTime, Numeric, Enum, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.core.database import Base


class AccountType(str, enum.Enum):
    """Account type enum"""
    MAIN = "main"
    SAVINGS = "savings"


class Account(Base):
    """Account model"""
    __tablename__ = "accounts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    account_type = Column(Enum(AccountType), nullable=False)
    account_number = Column(String(32), nullable=False, unique=True, index=True)
    currency = Column(String(3), nullable=False, default="USD")
    balance = Column(Numeric(18, 2), nullable=False, default=0.00)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    
    # Constraints
    __table_args__ = (
        CheckConstraint('balance >= 0', name='positive_balance'),
    )
    
    # Relationships
    user = relationship("User", back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account", cascade="all, delete-orphan")

