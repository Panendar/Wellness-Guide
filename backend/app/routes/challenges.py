"""
Daily challenges endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, date
from app.database import (
    get_db, User, DailyChallenge, ChallengeCompletion,
    UserStats
)
from app.auth import get_current_user
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/api/v1", tags=["challenges"])


# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class DailyChallengeResponse(BaseModel):
    """Response model for daily challenge"""
    id: int
    challenge_date: datetime
    yogasana_id: str
    yogasana_name: str
    challenge_description: str
    challenge_target: int
    reward_points: int
    is_active: bool

    class Config:
        from_attributes = True


class ChallengeCompletionRequest(BaseModel):
    """Request model for completing a challenge"""
    challenge_id: int


class ChallengeCompletionResponse(BaseModel):
    """Response model for challenge completion"""
    id: int
    user_id: int
    challenge_id: int
    completed_at: datetime
    points_earned: int

    class Config:
        from_attributes = True


class ChallengeLeaderboardEntry(BaseModel):
    """Leaderboard entry"""
    username: str
    total_completions: int
    total_points: int


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def initialize_daily_challenge(db: Session):
    """Create today's challenge if it doesn't exist"""
    today = date.today()
    existing = db.query(DailyChallenge).filter(
        db.func.date(DailyChallenge.challenge_date) == today
    ).first()

    if existing:
        return existing

    # Sample challenges for demonstration
    sample_challenges = [
        {
            "yogasana_id": "downward-dog",
            "yogasana_name": "Downward Dog",
            "challenge_description": "Hold Downward Dog pose for 30 seconds without breaking",
            "challenge_target": 30,
            "reward_points": 10,
        },
        {
            "yogasana_id": "warrior-ii",
            "yogasana_name": "Warrior II",
            "challenge_description": "Hold Warrior II pose for 45 seconds on each side",
            "challenge_target": 45,
            "reward_points": 15,
        },
        {
            "yogasana_id": "tree-pose",
            "yogasana_name": "Tree Pose",
            "challenge_description": "Balance in Tree Pose for 30 seconds on each side",
            "challenge_target": 30,
            "reward_points": 12,
        },
        {
            "yogasana_id": "child-pose",
            "yogasana_name": "Child's Pose",
            "challenge_description": "Relax in Child's Pose for 1 minute with mindfulness",
            "challenge_target": 60,
            "reward_points": 8,
        },
        {
            "yogasana_id": "cat-cow-sequence",
            "yogasana_name": "Cat-Cow Sequence",
            "challenge_description": "Complete 10 full Cat-Cow sequences with smooth transitions",
            "challenge_target": 10,
            "reward_points": 12,
        },
    ]

    # Select challenge based on day of week for variety
    today_index = today.weekday() % len(sample_challenges)
    challenge_data = sample_challenges[today_index]

    new_challenge = DailyChallenge(
        challenge_date=datetime.combine(today, datetime.min.time()),
        **challenge_data,
        is_active=True
    )
    db.add(new_challenge)
    db.commit()
    db.refresh(new_challenge)

    return new_challenge


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/daily-challenge", response_model=DailyChallengeResponse)
def get_daily_challenge(db: Session = Depends(get_db)):
    """
    Get today's daily challenge
    """
    challenge = initialize_daily_challenge(db)
    
    return DailyChallengeResponse.from_attributes(challenge)


@router.get("/daily-challenge/user-progress")
def get_user_challenge_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's progress on today's challenge
    """
    today = date.today()
    challenge = db.query(DailyChallenge).filter(
        db.func.date(DailyChallenge.challenge_date) == today
    ).first()

    if not challenge:
        challenge = initialize_daily_challenge(db)

    # Check if user completed today's challenge
    completion = db.query(ChallengeCompletion).filter(
        ChallengeCompletion.user_id == current_user.id,
        ChallengeCompletion.challenge_id == challenge.id,
        db.func.date(ChallengeCompletion.completed_at) == today
    ).first()

    return {
        "challenge": DailyChallengeResponse.from_attributes(challenge),
        "completed": completion is not None,
        "completion_details": {
            "points_earned": completion.points_earned,
            "completed_at": completion.completed_at
        } if completion else None
    }


@router.post("/daily-challenge/complete", response_model=ChallengeCompletionResponse, status_code=201)
def complete_daily_challenge(
    request: ChallengeCompletionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a challenge as completed
    """
    today = date.today()
    
    # Check if already completed
    existing = db.query(ChallengeCompletion).filter(
        ChallengeCompletion.user_id == current_user.id,
        ChallengeCompletion.challenge_id == request.challenge_id,
        db.func.date(ChallengeCompletion.completed_at) == today
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="You have already completed this challenge today"
        )

    # Get challenge
    challenge = db.query(DailyChallenge).filter(
        DailyChallenge.id == request.challenge_id
    ).first()

    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    # Create completion record
    completion = ChallengeCompletion(
        user_id=current_user.id,
        challenge_id=request.challenge_id,
        completed_at=datetime.utcnow(),
        points_earned=challenge.reward_points
    )

    db.add(completion)
    db.commit()
    db.refresh(completion)

    # Update user stats
    user_stats = db.query(UserStats).filter(UserStats.user_id == current_user.id).first()
    if user_stats:
        user_stats.total_challenges_completed += 1
        db.commit()

    return ChallengeCompletionResponse.from_attributes(completion)


@router.get("/challenges/history")
def get_challenge_history(
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's challenge completion history
    """
    completions = db.query(ChallengeCompletion).filter(
        ChallengeCompletion.user_id == current_user.id
    ).order_by(ChallengeCompletion.completed_at.desc()).offset(offset).limit(limit).all()

    # Enrich with challenge details
    history = []
    for completion in completions:
        challenge = db.query(DailyChallenge).filter(
            DailyChallenge.id == completion.challenge_id
        ).first()

        history.append({
            "completion_id": completion.id,
            "challenge": DailyChallengeResponse.from_attributes(challenge) if challenge else None,
            "completed_at": completion.completed_at,
            "points_earned": completion.points_earned
        })

    return {
        "total_completed": len(completions),
        "history": history
    }


@router.get("/challenges/leaderboard")
def get_challenge_leaderboard(
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Get global challenge leaderboard (top users by points)
    """
    # This is a simplified version - in production, you'd use more efficient queries
    user_stats = db.query(
        User.username,
        db.func.count(ChallengeCompletion.id).label("total_completions"),
        db.func.sum(ChallengeCompletion.points_earned).label("total_points")
    ).join(
        ChallengeCompletion, User.id == ChallengeCompletion.user_id
    ).group_by(
        User.id, User.username
    ).order_by(
        db.func.sum(ChallengeCompletion.points_earned).desc()
    ).limit(limit).all()

    leaderboard = []
    for rank, (username, completions, points) in enumerate(user_stats, 1):
        leaderboard.append({
            "rank": rank,
            "username": username,
            "total_completions": completions or 0,
            "total_points": points or 0
        })

    return {
        "leaderboard": leaderboard,
        "timestamp": datetime.utcnow()
    }
