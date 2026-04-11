"""
User service
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID

from app.models.user import User
from app.core.security import verify_password, get_password_hash


def get_user_by_id(db: Session, user_id: UUID) -> User:
    """
    Get user by ID
    
    Args:
        db: Database session
        user_id: User UUID
        
    Returns:
        User object
        
    Raises:
        HTTPException: If user not found
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


def update_user(db: Session, user_id: UUID, full_name: str = None, email: str = None) -> User:
    """
    Update user information
    
    Args:
        db: Database session
        user_id: User UUID
        full_name: New full name (optional)
        email: New email (optional)
        
    Returns:
        Updated User object
        
    Raises:
        HTTPException: If user not found or email already exists
    """
    user = get_user_by_id(db, user_id)
    
    if email and email != user.email:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )
        user.email = email
    
    if full_name:
        user.full_name = full_name
    
    db.commit()
    db.refresh(user)
    return user


def change_password(db: Session, user_id: UUID, current_password: str, new_password: str) -> bool:
    """
    Change user password
    
    Args:
        db: Database session
        user_id: User UUID
        current_password: Current password
        new_password: New password
        
    Returns:
        True if password changed successfully
        
    Raises:
        HTTPException: If current password is incorrect
    """
    user = get_user_by_id(db, user_id)
    
    if not verify_password(current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    user.password_hash = get_password_hash(new_password)
    db.commit()
    return True

