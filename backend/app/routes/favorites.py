"""
User favorites/bookmarks endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db, User, Favorite, UserStats
from app.auth import get_current_user
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/api/v1", tags=["favorites"])


# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class FavoriteResponse(BaseModel):
    """Response model for favorite"""
    id: int
    user_id: int
    yogasana_id: str
    yogasana_name: str
    created_at: datetime

    class Config:
        from_attributes = True


class AddFavoriteRequest(BaseModel):
    """Request model for adding favorite"""
    yogasana_id: str
    yogasana_name: str


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/favorites", response_model=List[FavoriteResponse])
def get_favorites(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's favorite yogasanas
    """
    favorites = db.query(Favorite).filter(
        Favorite.user_id == current_user.id
    ).order_by(Favorite.created_at.desc()).offset(offset).limit(limit).all()

    return [FavoriteResponse.from_attributes(f) for f in favorites]


@router.post("/favorites", response_model=FavoriteResponse, status_code=201)
def add_favorite(
    favorite: AddFavoriteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a yogasana to user's favorites
    """
    # Check if already favorited
    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.yogasana_id == favorite.yogasana_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="This yogasana is already in your favorites"
        )

    db_favorite = Favorite(
        user_id=current_user.id,
        yogasana_id=favorite.yogasana_id,
        yogasana_name=favorite.yogasana_name,
        created_at=datetime.utcnow()
    )

    db.add(db_favorite)
    db.commit()
    db.refresh(db_favorite)

    # Update user stats
    user_stats = db.query(UserStats).filter(UserStats.user_id == current_user.id).first()
    if user_stats:
        user_stats.total_favorites += 1
        db.commit()

    return FavoriteResponse.from_attributes(db_favorite)


@router.delete("/favorites/{yogasana_id}", status_code=204)
def remove_favorite(
    yogasana_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove a yogasana from user's favorites
    """
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.yogasana_id == yogasana_id
    ).first()

    if not favorite:
        raise HTTPException(
            status_code=404,
            detail="Favorite not found"
        )

    db.delete(favorite)
    db.commit()

    # Update user stats
    user_stats = db.query(UserStats).filter(UserStats.user_id == current_user.id).first()
    if user_stats and user_stats.total_favorites > 0:
        user_stats.total_favorites -= 1
        db.commit()

    return None


@router.get("/favorites/check/{yogasana_id}")
def check_favorite(
    yogasana_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check if a yogasana is in user's favorites
    """
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.yogasana_id == yogasana_id
    ).first()

    return {
        "yogasana_id": yogasana_id,
        "is_favorited": favorite is not None
    }
