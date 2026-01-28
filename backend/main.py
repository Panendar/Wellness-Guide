from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import PROJECT_NAME, PROJECT_VERSION, ALLOWED_ORIGINS, API_V1_STR
from app.database import init_db
from app.routes import api_router

# Initialize database
init_db()

# Create FastAPI app
app = FastAPI(
    title=PROJECT_NAME,
    version=PROJECT_VERSION,
    description="Backend API for Wellness Guide - Yoga & Wellness Application"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router)


# ============================================================================
# HEALTH CHECK ENDPOINTS
# ============================================================================

@app.get("/", tags=["Health"])
def read_root():
    """API root endpoint"""
    return {
        "message": "Welcome to Wellness Guide API",
        "version": PROJECT_VERSION,
        "docs": "/docs",
        "openapi_schema": "/openapi.json"
    }


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": PROJECT_NAME,
        "version": PROJECT_VERSION
    }


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error": str(exc)
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
