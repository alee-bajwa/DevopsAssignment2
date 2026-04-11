"""
User routes
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.auth import ChangePasswordRequest
from app.services.user_service import update_user, change_password


router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get current user information
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User information
    """
    return current_user


@router.put("/me", response_model=UserResponse)
def update_current_user(
    request: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user profile
    
    Args:
        request: User update request
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Updated user information
    """
    updated_user = update_user(
        db=db,
        user_id=current_user.id,
        full_name=request.full_name,
        email=request.email
    )
    return updated_user


@router.put("/me/password")
def change_user_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change current user password
    
    Args:
        request: Change password request
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Success message
    """
    change_password(
        db=db,
        user_id=current_user.id,
        current_password=request.current_password,
        new_password=request.new_password
    )
    
    return {"message": "Password changed successfully"}

