from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


# ============================================================================
# USER SCHEMAS (Request/Response Models)
# ============================================================================

class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    username: str
    full_name: Optional[str] = None


class UserCreate(UserBase):
    """User creation schema"""
    password: str


class UserLogin(BaseModel):
    """User login schema"""
    username: str
    password: str


class UserResponse(UserBase):
    """User response schema"""
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserDetail(UserResponse):
    """Detailed user info with relationships"""
    routines: List['RoutineResponse'] = []
    
    class Config:
        from_attributes = True


# ============================================================================
# ROUTINE SCHEMAS
# ============================================================================

class RoutineBase(BaseModel):
    """Base routine schema"""
    title: str
    goal: str
    description: Optional[str] = None
    yogasana_ids: str  # JSON string of yogasana IDs
    duration_minutes: Optional[int] = None


class RoutineCreate(RoutineBase):
    """Routine creation schema"""
    pass


class RoutineUpdate(BaseModel):
    """Routine update schema"""
    title: Optional[str] = None
    goal: Optional[str] = None
    description: Optional[str] = None
    yogasana_ids: Optional[str] = None
    duration_minutes: Optional[int] = None
    is_active: Optional[bool] = None


class RoutineResponse(RoutineBase):
    """Routine response schema"""
    id: int
    user_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# PROGRESS SCHEMAS
# ============================================================================

class ProgressBase(BaseModel):
    """Base progress schema"""
    yogasana_id: str
    yogasana_name: str
    completion_time: int  # seconds
    is_completed: bool = False
    notes: Optional[str] = None


class ProgressCreate(BaseModel):
    """Progress creation schema"""
    routine_id: Optional[int] = None
    yogasana_id: str
    yogasana_name: str
    completion_time: int
    is_completed: bool = False
    notes: Optional[str] = None


class ProgressResponse(ProgressBase):
    """Progress response schema"""
    id: int
    user_id: int
    routine_id: Optional[int]
    practice_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class ProgressStats(BaseModel):
    """User progress statistics"""
    total_practices: int
    total_time_minutes: int
    completed_today: int
    favorite_yogasana: Optional[str] = None
    practice_streak: int = 0


# ============================================================================
# TOKEN SCHEMAS
# ============================================================================

class Token(BaseModel):
    """JWT token response"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    """Token data payload"""
    username: Optional[str] = None
