"""
Achievements and badges endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import (
    get_db, User, Achievement, UserAchievement, UserStats,
    SessionLog
)
from app.auth import get_current_user
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/v1", tags=["achievements"])


# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class AchievementResponse(BaseModel):
    """Response model for achievement"""
    id: int
    title: str
    description: Optional[str]
    badge_icon: str
    requirement_type: str  # 'sessions', 'minutes', 'streak', 'favorites'
    requirement_value: int
    is_active: bool

    class Config:
        from_attributes = True


class UserAchievementResponse(BaseModel):
    """Response model for user earned achievement"""
    id: int
    achievement_id: int
    achievement: AchievementResponse
    unlocked_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def initialize_default_achievements(db: Session):
    """Create default achievements if they don't exist"""
    existing = db.query(Achievement).count()
    if existing > 0:
        return

    default_achievements = [
        {
            "title": "First Step",
            "description": "Complete your first practice session",
            "badge_icon": "🧘",
            "requirement_type": "sessions",
            "requirement_value": 1,
        },
        {
            "title": "Dedicated",
            "description": "Complete 10 practice sessions",
            "badge_icon": "💪",
            "requirement_type": "sessions",
            "requirement_value": 10,
        },
        {
            "title": "Committed",
            "description": "Complete 50 practice sessions",
            "badge_icon": "🔥",
            "requirement_type": "sessions",
            "requirement_value": 50,
        },
        {
            "title": "Master",
            "description": "Complete 100 practice sessions",
            "badge_icon": "⭐",
            "requirement_type": "sessions",
            "requirement_value": 100,
        },
        {
            "title": "Time Traveler",
            "description": "Practice for 100 total minutes",
            "badge_icon": "⏱️",
            "requirement_type": "minutes",
            "requirement_value": 100,
        },
        {
            "title": "Hour Master",
            "description": "Practice for 300 total minutes",
            "badge_icon": "🕐",
            "requirement_type": "minutes",
            "requirement_value": 300,
        },
        {
            "title": "Streak Starter",
            "description": "Achieve a 3-day practice streak",
            "badge_icon": "📈",
            "requirement_type": "streak",
            "requirement_value": 3,
        },
        {
            "title": "Streak Master",
            "description": "Achieve a 7-day practice streak",
            "badge_icon": "🌟",
            "requirement_type": "streak",
            "requirement_value": 7,
        },
        {
            "title": "Collector",
            "description": "Add 5 yogasanas to favorites",
            "badge_icon": "❤️",
            "requirement_type": "favorites",
            "requirement_value": 5,
        },
        {
            "title": "Super Collector",
            "description": "Add 15 yogasanas to favorites",
            "badge_icon": "💖",
            "requirement_type": "favorites",
            "requirement_value": 15,
        },
    ]

    for ach_data in default_achievements:
        achievement = Achievement(**ach_data, is_active=True)
        db.add(achievement)

    db.commit()


def check_and_unlock_achievements(user_id: int, db: Session) -> List[int]:
    """
    Check if user has unlocked any new achievements.
    Returns list of newly unlocked achievement IDs.
    """
    newly_unlocked = []
    
    # Get user stats
    user_stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    if not user_stats:
        return newly_unlocked

    # Get all active achievements
    achievements = db.query(Achievement).filter(Achievement.is_active == True).all()

    for achievement in achievements:
        # Check if already unlocked
        existing = db.query(UserAchievement).filter(
            UserAchievement.user_id == user_id,
            UserAchievement.achievement_id == achievement.id
        ).first()

        if existing:
            continue  # Already unlocked

        # Check if requirements are met
        should_unlock = False

        if achievement.requirement_type == "sessions":
            should_unlock = user_stats.total_sessions >= achievement.requirement_value

        elif achievement.requirement_type == "minutes":
            should_unlock = user_stats.total_minutes >= achievement.requirement_value

        elif achievement.requirement_type == "streak":
            should_unlock = user_stats.current_streak >= achievement.requirement_value

        elif achievement.requirement_type == "favorites":
            should_unlock = user_stats.total_favorites >= achievement.requirement_value

        # Unlock achievement if requirements met
        if should_unlock:
            user_achievement = UserAchievement(
                user_id=user_id,
                achievement_id=achievement.id,
                unlocked_at=datetime.utcnow()
            )
            db.add(user_achievement)
            newly_unlocked.append(achievement.id)

            # Increment total achievements count
            user_stats.total_achievements += 1

    if newly_unlocked:
        db.commit()

    return newly_unlocked


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/achievements", response_model=List[AchievementResponse])
def get_all_achievements(
    db: Session = Depends(get_db)
):
    """
    Get all available achievements
    """
    # Initialize default achievements if needed
    initialize_default_achievements(db)

    achievements = db.query(Achievement).filter(
        Achievement.is_active == True
    ).all()

    return [AchievementResponse.from_attributes(a) for a in achievements]


@router.get("/user-achievements", response_model=List[UserAchievementResponse])
def get_user_achievements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's earned achievements
    """
    user_achievements = db.query(UserAchievement).filter(
        UserAchievement.user_id == current_user.id
    ).order_by(UserAchievement.unlocked_at.desc()).all()

    result = []
    for ua in user_achievements:
        achievement = db.query(Achievement).filter(
            Achievement.id == ua.achievement_id
        ).first()
        result.append({
            "id": ua.id,
            "achievement_id": ua.achievement_id,
            "achievement": AchievementResponse.from_attributes(achievement),
            "unlocked_at": ua.unlocked_at
        })

    return result


@router.post("/achievements/check")
def check_new_achievements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check for newly unlocked achievements.
    Called after completing a session, reaching a milestone, etc.
    Returns newly unlocked achievement IDs.
    """
    # Initialize default achievements
    initialize_default_achievements(db)

    # Check and unlock new achievements
    newly_unlocked_ids = check_and_unlock_achievements(current_user.id, db)

    # Get details of newly unlocked achievements
    newly_unlocked = []
    for achievement_id in newly_unlocked_ids:
        achievement = db.query(Achievement).filter(
            Achievement.id == achievement_id
        ).first()
        if achievement:
            newly_unlocked.append(AchievementResponse.from_attributes(achievement))

    return {
        "newly_unlocked": newly_unlocked,
        "count": len(newly_unlocked)
    }


@router.get("/achievements/progress")
def get_achievement_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get progress towards all achievements
    """
    initialize_default_achievements(db)

    user_stats = db.query(UserStats).filter(UserStats.user_id == current_user.id).first()
    if not user_stats:
        return {"message": "No stats found"}

    achievements = db.query(Achievement).filter(Achievement.is_active == True).all()

    progress_list = []
    for achievement in achievements:
        # Check if already unlocked
        unlocked = db.query(UserAchievement).filter(
            UserAchievement.user_id == current_user.id,
            UserAchievement.achievement_id == achievement.id
        ).first()

        # Calculate progress
        if achievement.requirement_type == "sessions":
            current_value = user_stats.total_sessions
        elif achievement.requirement_type == "minutes":
            current_value = user_stats.total_minutes
        elif achievement.requirement_type == "streak":
            current_value = user_stats.current_streak
        elif achievement.requirement_type == "favorites":
            current_value = user_stats.total_favorites
        else:
            current_value = 0

        progress_percent = min(
            (current_value / achievement.requirement_value * 100),
            100
        ) if achievement.requirement_value > 0 else 0

        progress_list.append({
            "achievement_id": achievement.id,
            "title": achievement.title,
            "badge_icon": achievement.badge_icon,
            "requirement_type": achievement.requirement_type,
            "requirement_value": achievement.requirement_value,
            "current_value": current_value,
            "progress_percent": round(progress_percent, 2),
            "is_unlocked": unlocked is not None
        })

    return {
        "achievements": progress_list,
        "total_unlocked": len([a for a in progress_list if a["is_unlocked"]]),
        "total_achievements": len(achievements)
    }
