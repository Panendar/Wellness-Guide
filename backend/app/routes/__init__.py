from fastapi import APIRouter

# Import route modules
from app.routes import (
    auth, routines, progress, recommendations,
    stats, favorites, achievements, yogasanas, settings, challenges
)

# Create API router
api_router = APIRouter(prefix="/api/v1")

# Include route modules
api_router.include_router(auth.router)
api_router.include_router(routines.router)
api_router.include_router(progress.router)
api_router.include_router(recommendations.router)
api_router.include_router(stats.router)
api_router.include_router(favorites.router)
api_router.include_router(achievements.router)
api_router.include_router(yogasanas.router)
api_router.include_router(settings.router)
api_router.include_router(challenges.router)

__all__ = ["api_router"]
