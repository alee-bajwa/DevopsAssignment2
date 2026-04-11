"""
Admin routes
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timedelta

from app.core.database import get_db
from app.api.deps import get_current_admin
from app.models.user import User
from app.models.account import Account
from app.models.transaction import Transaction, AdminAction
from app.schemas.user import UserResponse, UserAdminUpdate
from app.schemas.transaction import TransactionResponse
from app.schemas.admin import AdminStatsResponse, AdminActionResponse


router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get admin dashboard statistics
    
    Args:
        current_user: Current authenticated admin user
        db: Database session
        
    Returns:
        Dashboard statistics
    """
    # Total counts
    total_users = db.query(func.count(User.id)).scalar()
    total_accounts = db.query(func.count(Account.id)).scalar()
    total_transactions = db.query(func.count(Transaction.id)).scalar()
    
    # Active today (users who made transactions today)
    today = datetime.utcnow().date()
    active_today = db.query(func.count(func.distinct(Transaction.initiated_by))).filter(
        func.date(Transaction.created_at) == today
    ).scalar()
    
    # User growth percentage (last 30 days vs previous 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    sixty_days_ago = datetime.utcnow() - timedelta(days=60)
    
    recent_users = db.query(func.count(User.id)).filter(
        User.created_at >= thirty_days_ago
    ).scalar()
    
    previous_users = db.query(func.count(User.id)).filter(
        and_(User.created_at >= sixty_days_ago, User.created_at < thirty_days_ago)
    ).scalar()
    
    user_growth_percentage = 0.0
    if previous_users > 0:
        user_growth_percentage = ((recent_users - previous_users) / previous_users) * 100
    
    # Transaction volume today
    transaction_volume_today = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        func.date(Transaction.created_at) == today
    ).scalar()
    
    # Recent signups (last 10)
    recent_signups = db.query(User).order_by(User.created_at.desc()).limit(10).all()
    recent_signups_list = [
        {
            "id": str(user.id),
            "full_name": user.full_name,
            "email": user.email,
            "created_at": user.created_at.isoformat()
        }
        for user in recent_signups
    ]
    
    return {
        "total_users": total_users or 0,
        "total_accounts": total_accounts or 0,
        "total_transactions": total_transactions or 0,
        "active_today": active_today or 0,
        "user_growth_percentage": round(user_growth_percentage, 2),
        "transaction_volume_today": float(transaction_volume_today or 0),
        "recent_signups": recent_signups_list
    }


@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None
):
    """
    Get all users with filters (admin only)
    
    Args:
        current_user: Current authenticated admin user
        db: Database session
        limit: Number of users to return
        offset: Number of users to skip
        role: Filter by role
        is_active: Filter by active status
        search: Search by name or email
        
    Returns:
        List of users
    """
    query = db.query(User)
    
    if role:
        query = query.filter(User.role == role)
    
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (User.full_name.ilike(search_pattern)) | (User.email.ilike(search_pattern))
        )
    
    users = query.order_by(User.created_at.desc()).offset(offset).limit(limit).all()
    return users


@router.put("/users/{user_id}", response_model=UserResponse)
def update_user_by_admin(
    user_id: UUID,
    request: UserAdminUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Update user (admin only)
    
    Args:
        user_id: User UUID
        request: User update request
        current_user: Current authenticated admin user
        db: Database session
        
    Returns:
        Updated user information
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"error": "User not found"}
    
    # Update fields
    if request.full_name:
        user.full_name = request.full_name
    
    if request.email:
        user.email = request.email
    
    if request.role:
        user.role = request.role
    
    if request.is_active is not None:
        user.is_active = request.is_active
        if not request.is_active:
            user.suspended_at = datetime.utcnow()
        else:
            user.suspended_at = None
    
    db.commit()
    db.refresh(user)
    
    # Log admin action
    admin_action = AdminAction(
        admin_user_id=current_user.id,
        action_type="update_user",
        target_user_id=user_id,
        details=request.dict(exclude_unset=True)
    )
    db.add(admin_action)
    db.commit()
    
    return user


@router.delete("/users/{user_id}")
def delete_user_by_admin(
    user_id: UUID,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Delete user (admin only)
    
    Args:
        user_id: User UUID
        current_user: Current authenticated admin user
        db: Database session
        
    Returns:
        Success message
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"error": "User not found"}
    
    # Log admin action before deleting
    admin_action = AdminAction(
        admin_user_id=current_user.id,
        action_type="delete_user",
        target_user_id=user_id,
        details={"email": user.email, "full_name": user.full_name}
    )
    db.add(admin_action)
    db.commit()
    
    # Delete user (cascade will delete related records)
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}


@router.get("/transactions", response_model=List[TransactionResponse])
def get_all_transactions(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    direction: Optional[str] = None,
    kind: Optional[str] = None
):
    """
    Get all transactions with filters (admin only)
    
    Args:
        current_user: Current authenticated admin user
        db: Database session
        limit: Number of transactions to return
        offset: Number of transactions to skip
        direction: Filter by transaction direction
        kind: Filter by transaction kind
        
    Returns:
        List of transactions
    """
    query = db.query(Transaction)
    
    if direction:
        query = query.filter(Transaction.direction == direction)
    
    if kind:
        query = query.filter(Transaction.kind == kind)
    
    transactions = query.order_by(Transaction.created_at.desc()).offset(offset).limit(limit).all()
    return transactions


@router.get("/actions", response_model=List[AdminActionResponse])
def get_admin_actions(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0)
):
    """
    Get admin action logs (admin only)
    
    Args:
        current_user: Current authenticated admin user
        db: Database session
        limit: Number of actions to return
        offset: Number of actions to skip
        
    Returns:
        List of admin actions
    """
    actions = db.query(AdminAction).order_by(
        AdminAction.created_at.desc()
    ).offset(offset).limit(limit).all()
    
    return actions

