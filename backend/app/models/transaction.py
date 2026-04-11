"""
Transaction and related models
"""
from sqlalchemy import Column, String, DateTime, Numeric, Enum, ForeignKey, Text, CheckConstraint, BigInteger
from sqlalchemy.dialects.postgresql import UUID, INET, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.core.database import Base


class TransactionDirection(str, enum.Enum):
    """Transaction direction enum"""
    DEBIT = "debit"
    CREDIT = "credit"


class TransactionKind(str, enum.Enum):
    """Transaction kind enum"""
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    TRANSFER = "transfer"
    BILL_PAYMENT = "bill_payment"
    FEE = "fee"
    ADJUSTMENT = "adjustment"


class Transaction(Base):
    """Transaction model"""
    __tablename__ = "transactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, index=True)
    amount = Column(Numeric(18, 2), nullable=False)
    direction = Column(Enum(TransactionDirection), nullable=False)
    kind = Column(Enum(TransactionKind), nullable=False)
    purpose = Column(Text, nullable=True)
    reference = Column(String(64), nullable=True, index=True)
    initiated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    counterparty_account_id = Column(UUID(as_uuid=True), nullable=True)
    counterparty_name = Column(String(150), nullable=True)
    transfer_group_id = Column(UUID(as_uuid=True), nullable=True)
    created_by_ip = Column(INET, nullable=True)
    
    # Constraints
    __table_args__ = (
        CheckConstraint('amount > 0', name='positive_amount'),
        CheckConstraint('counterparty_account_id IS NULL OR counterparty_account_id <> account_id', 
                       name='chk_counterparty_diff'),
    )
    
    # Relationships
    account = relationship("Account", back_populates="transactions")


class BillService(Base):
    """Bill service model"""
    __tablename__ = "bill_services"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(150), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    
    # Relationships
    bill_payments = relationship("BillPayment", back_populates="bill_service")


class BillPayment(Base):
    """Bill payment model"""
    __tablename__ = "bill_payments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False)
    bill_service_id = Column(UUID(as_uuid=True), ForeignKey("bill_services.id"), nullable=False)
    amount = Column(Numeric(18, 2), nullable=False)
    paid_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, index=True)
    purpose = Column(Text, nullable=True)
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id"), nullable=True)
    created_by_ip = Column(INET, nullable=True)
    
    # Constraints
    __table_args__ = (
        CheckConstraint('amount > 0', name='positive_bill_amount'),
    )
    
    # Relationships
    user = relationship("User", back_populates="bill_payments")
    bill_service = relationship("BillService", back_populates="bill_payments")


class AdminAction(Base):
    """Admin action log model"""
    __tablename__ = "admin_actions"
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    admin_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action_type = Column(String(80), nullable=False)
    target_user_id = Column(UUID(as_uuid=True), nullable=True)
    details = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, index=True)

