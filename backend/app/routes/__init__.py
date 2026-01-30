from fastapi import APIRouter

# Import route modules
from app.routes import auth, routines, progress, recommendations

# Create API router
api_router = APIRouter(prefix="/api/v1")

# Include route modules
api_router.include_router(auth.router)
api_router.include_router(routines.router)
api_router.include_router(progress.router)
api_router.include_router(recommendations.router)

__all__ = ["api_router"]
