from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List
from datetime import datetime, timedelta

from app.database import get_db, Progress, User
from app.models import Progress, User
from app.schemas import ProgressCreate, ProgressResponse, ProgressStats
from app.auth import get_current_user

router = APIRouter(prefix="/progress", tags=["Progress"])


@router.post("/", response_model=ProgressResponse, status_code=status.HTTP_201_CREATED)
def log_progress(
    progress: ProgressCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Log a practice session progress
    """
    db_progress = Progress(
        user_id=current_user.id,
        routine_id=progress.routine_id,
        yogasana_id=progress.yogasana_id,
        yogasana_name=progress.yogasana_name,
        completion_time=progress.completion_time,
        is_completed=progress.is_completed,
        notes=progress.notes
    )
    
    db.add(db_progress)
    db.commit()
    db.refresh(db_progress)
    
    return db_progress


@router.get("/history", response_model=List[ProgressResponse])
def get_progress_history(
    skip: int = 0,
    limit: int = 100,
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's practice history
    """
    start_date = datetime.utcnow() - timedelta(days=days)
    
    progress_records = db.query(Progress).filter(
        (Progress.user_id == current_user.id) &
        (Progress.created_at >= start_date)
    ).order_by(desc(Progress.created_at)).offset(skip).limit(limit).all()
    
    return progress_records


@router.get("/stats", response_model=ProgressStats)
def get_progress_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's progress statistics
    """
    # Total practices
    total_practices = db.query(func.count(Progress.id)).filter(
        Progress.user_id == current_user.id
    ).scalar() or 0
    
    # Total time in minutes
    total_time_seconds = db.query(func.sum(Progress.completion_time)).filter(
        Progress.user_id == current_user.id
    ).scalar() or 0
    total_time_minutes = total_time_seconds // 60
    
    # Completed today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    completed_today = db.query(func.count(Progress.id)).filter(
        (Progress.user_id == current_user.id) &
        (Progress.is_completed == True) &
        (Progress.practice_date >= today_start) &
        (Progress.practice_date < today_end)
    ).scalar() or 0
    
    # Favorite yogasana
    favorite_yogasana = db.query(Progress.yogasana_name).filter(
        Progress.user_id == current_user.id
    ).group_by(Progress.yogasana_name).order_by(
        func.count(Progress.id).desc()
    ).first()
    
    # Practice streak (consecutive days with practice)
    practice_streak = calculate_practice_streak(db, current_user.id)
    
    return ProgressStats(
        total_practices=total_practices,
        total_time_minutes=int(total_time_minutes),
        completed_today=completed_today,
        favorite_yogasana=favorite_yogasana[0] if favorite_yogasana else None,
        practice_streak=practice_streak
    )


@router.get("/routine/{routine_id}", response_model=List[ProgressResponse])
def get_routine_progress(
    routine_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get progress for a specific routine
    """
    progress_records = db.query(Progress).filter(
        (Progress.user_id == current_user.id) &
        (Progress.routine_id == routine_id)
    ).order_by(desc(Progress.created_at)).all()
    
    return progress_records


@router.get("/yogasana/{yogasana_id}", response_model=List[ProgressResponse])
def get_yogasana_progress(
    yogasana_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get progress for a specific yoga pose
    """
    progress_records = db.query(Progress).filter(
        (Progress.user_id == current_user.id) &
        (Progress.yogasana_id == yogasana_id)
    ).order_by(desc(Progress.created_at)).all()
    
    return progress_records


@router.put("/{progress_id}", response_model=ProgressResponse)
def update_progress(
    progress_id: int,
    is_completed: bool,
    notes: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update progress record
    """
    progress = db.query(Progress).filter(
        (Progress.id == progress_id) & (Progress.user_id == current_user.id)
    ).first()
    
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Progress record not found"
        )
    
    progress.is_completed = is_completed
    if notes is not None:
        progress.notes = notes
    
    db.commit()
    db.refresh(progress)
    
    return progress


@router.delete("/{progress_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_progress(
    progress_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a progress record
    """
    progress = db.query(Progress).filter(
        (Progress.id == progress_id) & (Progress.user_id == current_user.id)
    ).first()
    
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Progress record not found"
        )
    
    db.delete(progress)
    db.commit()
    
    return None


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def calculate_practice_streak(db: Session, user_id: int) -> int:
    """Calculate consecutive days of practice"""
    recent_practices = db.query(Progress).filter(
        Progress.user_id == user_id
    ).order_by(desc(Progress.practice_date)).limit(365).all()
    
    if not recent_practices:
        return 0
    
    streak = 1
    current_date = datetime.utcnow().date()
    
    for progress in recent_practices:
        practice_date = progress.practice_date.date()
        expected_date = current_date - timedelta(days=streak-1)
        
        if practice_date == expected_date:
            streak += 1
        elif practice_date < expected_date:
            break
    
    return streak - 1
