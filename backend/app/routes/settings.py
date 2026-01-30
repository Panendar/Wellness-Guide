"""
User settings and preferences endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db, User, UserSettings
from app.auth import get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/v1", tags=["settings"])


# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class UserSettingsResponse(BaseModel):
    """Response model for user settings"""
    notifications_enabled: bool
    daily_reminder_enabled: bool
    sound_enabled: bool
    dark_mode: bool
    daily_reminder_time: str
    preferred_difficulty: str

    class Config:
        from_attributes = True


class UserSettingsUpdate(BaseModel):
    """Request model for updating user settings"""
    notifications_enabled: Optional[bool] = None
    daily_reminder_enabled: Optional[bool] = None
    sound_enabled: Optional[bool] = None
    dark_mode: Optional[bool] = None
    daily_reminder_time: Optional[str] = None
    preferred_difficulty: Optional[str] = None


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_or_create_settings(user_id: int, db: Session) -> UserSettings:
    """Get existing settings or create default ones"""
    settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    
    if not settings:
        settings = UserSettings(
            user_id=user_id,
            notifications_enabled=True,
            daily_reminder_enabled=True,
            sound_enabled=True,
            dark_mode=False,
            daily_reminder_time="07:00",
            preferred_difficulty="all"
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return settings


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/user/settings", response_model=UserSettingsResponse)
def get_user_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's settings and preferences
    """
    settings = get_or_create_settings(current_user.id, db)
    return UserSettingsResponse.from_attributes(settings)


@router.put("/user/settings", response_model=UserSettingsResponse)
def update_user_settings(
    settings_update: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update user's settings and preferences
    """
    settings = get_or_create_settings(current_user.id, db)

    # Update only provided fields
    if settings_update.notifications_enabled is not None:
        settings.notifications_enabled = settings_update.notifications_enabled

    if settings_update.daily_reminder_enabled is not None:
        settings.daily_reminder_enabled = settings_update.daily_reminder_enabled

    if settings_update.sound_enabled is not None:
        settings.sound_enabled = settings_update.sound_enabled

    if settings_update.dark_mode is not None:
        settings.dark_mode = settings_update.dark_mode

    if settings_update.daily_reminder_time is not None:
        # Validate time format (HH:MM)
        try:
            datetime.strptime(settings_update.daily_reminder_time, "%H:%M")
            settings.daily_reminder_time = settings_update.daily_reminder_time
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid time format. Use HH:MM (24-hour format)"
            )

    if settings_update.preferred_difficulty is not None:
        valid_difficulties = ["beginner", "intermediate", "advanced", "all"]
        if settings_update.preferred_difficulty not in valid_difficulties:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid difficulty. Must be one of: {', '.join(valid_difficulties)}"
            )
        settings.preferred_difficulty = settings_update.preferred_difficulty

    settings.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(settings)

    return UserSettingsResponse.from_attributes(settings)


@router.post("/user/settings/reset")
def reset_user_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Reset user's settings to default values
    """
    settings = get_or_create_settings(current_user.id, db)
    
    settings.notifications_enabled = True
    settings.daily_reminder_enabled = True
    settings.sound_enabled = True
    settings.dark_mode = False
    settings.daily_reminder_time = "07:00"
    settings.preferred_difficulty = "all"
    settings.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(settings)

    return {
        "message": "Settings reset to default values",
        "settings": UserSettingsResponse.from_attributes(settings)
    }
