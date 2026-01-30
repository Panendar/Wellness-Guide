"""
User statistics and session logging endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import (
    get_db, User, SessionLog, UserStats, Progress
)
from app.auth import get_current_user
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/api/v1", tags=["stats"])


# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class SessionLogRequest(BaseModel):
    """Request model for logging a practice session"""
    routine_id: Optional[int] = None
    duration_minutes: int
    yogasanas_practiced: List[str]  # List of yogasana IDs
    notes: Optional[str] = None


class SessionLogResponse(BaseModel):
    """Response model for session log"""
    id: int
    user_id: int
    routine_id: Optional[int]
    duration_minutes: int
    yogasanas_practiced: List[str]
    notes: Optional[str]
    completed_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class UserStatsResponse(BaseModel):
    """Response model for user statistics"""
    total_sessions: int
    total_minutes: int
    current_streak: int
    longest_streak: int
    total_favorites: int
    total_challenges_completed: int
    total_achievements: int
    last_practice_date: Optional[datetime]
    weekly_sessions: int
    weekly_minutes: int

    class Config:
        from_attributes = True


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def calculate_streak(user_id: int, db: Session) -> tuple[int, int]:
    """
    Calculate current and longest streak for a user.
    A streak continues if there's a session logged on that day.
    Returns: (current_streak, longest_streak)
    """
    sessions = db.query(SessionLog).filter(
        SessionLog.user_id == user_id
    ).order_by(SessionLog.completed_at.desc()).all()

    if not sessions:
        return 0, 0

    current_streak = 0
    longest_streak = 0
    temp_streak = 0
    last_date = None

    for session in sessions:
        session_date = session.completed_at.date()

        if last_date is None:
            # First session - check if it's today or yesterday
            today = datetime.utcnow().date()
            if session_date == today or session_date == (today - timedelta(days=1)):
                temp_streak = 1
            else:
                temp_streak = 0
        else:
            # Check if consecutive day
            if session_date == (last_date - timedelta(days=1)):
                temp_streak += 1
            else:
                # Streak broken
                longest_streak = max(longest_streak, temp_streak)
                temp_streak = 1

        last_date = session_date

    longest_streak = max(longest_streak, temp_streak)
    
    # Current streak is temp_streak if last session is recent
    today = datetime.utcnow().date()
    if last_date and (last_date == today or last_date == (today - timedelta(days=1))):
        current_streak = temp_streak
    else:
        current_streak = 0

    return current_streak, longest_streak


def update_user_stats(user_id: int, db: Session):
    """Update or create user statistics cache"""
    # Get or create UserStats
    user_stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    
    if not user_stats:
        user_stats = UserStats(user_id=user_id)
        db.add(user_stats)

    # Calculate stats
    sessions = db.query(SessionLog).filter(SessionLog.user_id == user_id).all()
    total_sessions = len(sessions)
    total_minutes = sum(s.duration_minutes for s in sessions) if sessions else 0
    
    current_streak, longest_streak = calculate_streak(user_id, db)
    
    # Get last practice date
    last_session = db.query(SessionLog).filter(
        SessionLog.user_id == user_id
    ).order_by(SessionLog.completed_at.desc()).first()
    last_practice_date = last_session.completed_at if last_session else None

    # Update stats
    user_stats.total_sessions = total_sessions
    user_stats.total_minutes = total_minutes
    user_stats.current_streak = current_streak
    user_stats.longest_streak = longest_streak
    user_stats.last_practice_date = last_practice_date
    user_stats.updated_at = datetime.utcnow()

    db.commit()
    return user_stats


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/users/stats", response_model=UserStatsResponse)
def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's statistics (total sessions, minutes, streaks, etc.)
    """
    user_stats = db.query(UserStats).filter(UserStats.user_id == current_user.id).first()
    
    if not user_stats:
        # Create initial stats if not exists
        user_stats = update_user_stats(current_user.id, db)

    # Calculate weekly stats
    one_week_ago = datetime.utcnow() - timedelta(days=7)
    weekly_sessions = db.query(SessionLog).filter(
        SessionLog.user_id == current_user.id,
        SessionLog.completed_at >= one_week_ago
    ).count()
    
    weekly_minutes = db.query(SessionLog).filter(
        SessionLog.user_id == current_user.id,
        SessionLog.completed_at >= one_week_ago
    ).with_entities(
        db.func.sum(SessionLog.duration_minutes)
    ).scalar() or 0

    return UserStatsResponse(
        total_sessions=user_stats.total_sessions,
        total_minutes=user_stats.total_minutes,
        current_streak=user_stats.current_streak,
        longest_streak=user_stats.longest_streak,
        total_favorites=user_stats.total_favorites,
        total_challenges_completed=user_stats.total_challenges_completed,
        total_achievements=user_stats.total_achievements,
        last_practice_date=user_stats.last_practice_date,
        weekly_sessions=weekly_sessions,
        weekly_minutes=weekly_minutes
    )


@router.post("/session-logs", response_model=SessionLogResponse, status_code=201)
def log_session(
    session_log: SessionLogRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Log a completed practice session
    """
    db_session_log = SessionLog(
        user_id=current_user.id,
        routine_id=session_log.routine_id,
        duration_minutes=session_log.duration_minutes,
        yogasanas_practiced=session_log.yogasanas_practiced,
        notes=session_log.notes,
        completed_at=datetime.utcnow()
    )
    
    db.add(db_session_log)
    db.commit()
    db.refresh(db_session_log)

    # Update user stats
    update_user_stats(current_user.id, db)

    return SessionLogResponse.from_attributes(db_session_log)


@router.get("/session-logs", response_model=List[SessionLogResponse])
def get_session_logs(
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's session history with optional date range filter
    
    Query Parameters:
    - limit: Number of sessions to return (default: 50, max: 500)
    - offset: Number of sessions to skip (default: 0)
    - start_date: Optional filter (format: YYYY-MM-DD)
    - end_date: Optional filter (format: YYYY-MM-DD)
    """
    query = db.query(SessionLog).filter(SessionLog.user_id == current_user.id)

    # Apply date filters if provided
    if start_date:
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(SessionLog.completed_at >= start)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format. Use YYYY-MM-DD")

    if end_date:
        try:
            end = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1)
            query = query.filter(SessionLog.completed_at < end)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_date format. Use YYYY-MM-DD")

    sessions = query.order_by(SessionLog.completed_at.desc()).offset(offset).limit(limit).all()
    
    return [SessionLogResponse.from_attributes(s) for s in sessions]


@router.get("/session-logs/stats")
def get_session_stats(
    period: str = Query("week", regex="^(day|week|month)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get aggregated session statistics for a given period.
    
    Parameters:
    - period: 'day', 'week', or 'month'
    """
    if period == "day":
        days_back = 1
    elif period == "week":
        days_back = 7
    else:  # month
        days_back = 30

    start_date = datetime.utcnow() - timedelta(days=days_back)
    
    sessions = db.query(SessionLog).filter(
        SessionLog.user_id == current_user.id,
        SessionLog.completed_at >= start_date
    ).all()

    total_sessions = len(sessions)
    total_minutes = sum(s.duration_minutes for s in sessions) if sessions else 0
    avg_duration = total_minutes / total_sessions if total_sessions > 0 else 0

    return {
        "period": period,
        "total_sessions": total_sessions,
        "total_minutes": total_minutes,
        "average_duration": round(avg_duration, 2),
        "sessions": [SessionLogResponse.from_attributes(s) for s in sessions]
    }
