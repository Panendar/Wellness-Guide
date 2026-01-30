from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, ForeignKey, Text, Float, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
from config import DATABASE_URL

# Create database engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


# ============================================================================
# DATABASE MODELS
# ============================================================================

class User(Base):
    """User account model"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(255))
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    routines = relationship("Routine", back_populates="owner", cascade="all, delete-orphan")
    progress = relationship("Progress", back_populates="user", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    session_logs = relationship("SessionLog", back_populates="user", cascade="all, delete-orphan")
    user_achievements = relationship("UserAchievement", back_populates="user", cascade="all, delete-orphan")
    user_settings = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    challenge_completions = relationship("ChallengeCompletion", back_populates="user", cascade="all, delete-orphan")


class Routine(Base):
    """User's custom yoga routine"""
    __tablename__ = "routines"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    goal = Column(String(255), nullable=False)
    description = Column(Text)
    yogasana_ids = Column(Text)  # JSON string of yogasana IDs
    duration_minutes = Column(Integer)  # Total routine duration
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="routines")
    progress = relationship("Progress", back_populates="routine", cascade="all, delete-orphan")


class Progress(Base):
    """User's practice progress tracking"""
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    routine_id = Column(Integer, ForeignKey("routines.id"), nullable=True)
    yogasana_id = Column(String(100))  # ID of the yoga pose
    yogasana_name = Column(String(255))
    completion_time = Column(Integer)  # Time spent in seconds
    is_completed = Column(Boolean, default=False)
    notes = Column(Text)
    practice_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="progress")
    routine = relationship("Routine", back_populates="progress")


class Favorite(Base):
    """User's favorite/bookmarked yogasanas"""
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    yogasana_id = Column(String(100), nullable=False)
    yogasana_name = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="favorites")

    # Unique constraint: one user can't favorite the same yogasana twice
    __table_args__ = (
        {"sqlite_autoincrement": True},
    )


class SessionLog(Base):
    """Log of user's practice sessions"""
    __tablename__ = "session_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    routine_id = Column(Integer, ForeignKey("routines.id"), nullable=True)
    duration_minutes = Column(Integer, nullable=False)  # Total session duration
    yogasanas_practiced = Column(JSON)  # List of yogasana IDs practiced
    notes = Column(Text)
    completed_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="session_logs")


class Achievement(Base):
    """Available achievements/badges"""
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    badge_icon = Column(String(50))  # emoji or icon name
    requirement_type = Column(String(50))  # 'sessions', 'minutes', 'streak', 'favorites'
    requirement_value = Column(Integer)  # threshold to unlock
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class UserAchievement(Base):
    """Track which achievements user has earned"""
    __tablename__ = "user_achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=False)
    unlocked_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="user_achievements")


class UserSettings(Base):
    """User preferences and settings"""
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    notifications_enabled = Column(Boolean, default=True)
    daily_reminder_enabled = Column(Boolean, default=True)
    sound_enabled = Column(Boolean, default=True)
    dark_mode = Column(Boolean, default=False)
    daily_reminder_time = Column(String(5))  # HH:MM format, default 07:00
    preferred_difficulty = Column(String(50), default="all")  # beginner, intermediate, advanced, all
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="user_settings")


class DailyChallenge(Base):
    """Daily challenges to motivate users"""
    __tablename__ = "daily_challenges"

    id = Column(Integer, primary_key=True, index=True)
    challenge_date = Column(DateTime, nullable=False)  # Date of challenge
    yogasana_id = Column(String(100), nullable=False)
    yogasana_name = Column(String(255))
    challenge_description = Column(Text)  # e.g., "Hold this pose for 30 seconds"
    challenge_target = Column(Integer)  # e.g., 30 (seconds) or 5 (repetitions)
    reward_points = Column(Integer, default=10)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ChallengeCompletion(Base):
    """Track which challenges users have completed"""
    __tablename__ = "challenge_completions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    challenge_id = Column(Integer, ForeignKey("daily_challenges.id"), nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow)
    points_earned = Column(Integer)

    # Relationships
    user = relationship("User", back_populates="challenge_completions")


class UserStats(Base):
    """Cached/aggregated user statistics for quick access"""
    __tablename__ = "user_stats"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    total_sessions = Column(Integer, default=0)
    total_minutes = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    total_favorites = Column(Integer, default=0)
    total_challenges_completed = Column(Integer, default=0)
    total_achievements = Column(Integer, default=0)
    last_practice_date = Column(DateTime)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# Create tables
def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)


# Dependency to get DB session
def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
