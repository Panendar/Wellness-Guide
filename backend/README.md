# Wellness Guide Backend - Setup Guide

## Overview
This is a Python backend for the Wellness Guide application using FastAPI. It provides:
- User authentication (JWT tokens)
- Routine management (CRUD operations)
- Progress tracking
- Data persistence (SQLite by default)

---

## Installation & Setup

### 1. Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### 2. Create Virtual Environment
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configuration
Create a `.env` file in the `backend` directory:
```
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./wellness_guide.db
```

### 5. Run the Server
```bash
# From backend directory
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`
API Documentation: `http://localhost:8000/docs`

---

## API Endpoints

### Authentication (`/api/v1/auth`)

#### POST `/auth/signup`
Create a new user account
```json
{
  "email": "user@example.com",
  "username": "username",
  "full_name": "Full Name",
  "password": "securepassword"
}
```

#### POST `/auth/login`
Login and get JWT token
```json
{
  "username": "username",
  "password": "securepassword"
}
```

Response:
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "full_name": "Full Name",
    "is_active": true,
    "created_at": "2024-01-28T10:00:00"
  }
}
```

#### GET `/auth/profile`
Get current user profile (requires authentication)

#### POST `/auth/logout`
Logout (optional - handled client-side with token deletion)

---

### Routines (`/api/v1/routines`)

#### POST `/routines/`
Create a new routine (requires authentication)
```json
{
  "title": "Morning Yoga",
  "goal": "Improve flexibility",
  "description": "A 30-minute morning yoga routine",
  "yogasana_ids": "[\"mountain-pose\", \"tree-pose\", \"child-pose\"]",
  "duration_minutes": 30
}
```

#### GET `/routines/`
Get all routines for current user (requires authentication)

#### GET `/routines/{routine_id}`
Get specific routine (requires authentication)

#### PUT `/routines/{routine_id}`
Update routine (requires authentication)
```json
{
  "title": "Updated Title",
  "duration_minutes": 40
}
```

#### DELETE `/routines/{routine_id}`
Delete routine (requires authentication)

#### POST `/routines/{routine_id}/activate`
Set routine as active (requires authentication)

---

### Progress (`/api/v1/progress`)

#### POST `/progress/`
Log a practice session (requires authentication)
```json
{
  "routine_id": 1,
  "yogasana_id": "mountain-pose",
  "yogasana_name": "Mountain Pose",
  "completion_time": 45,
  "is_completed": true,
  "notes": "Felt great today"
}
```

#### GET `/progress/history`
Get practice history (requires authentication)

#### GET `/progress/stats`
Get user statistics (requires authentication)

Response:
```json
{
  "total_practices": 15,
  "total_time_minutes": 450,
  "completed_today": 3,
  "favorite_yogasana": "Mountain Pose",
  "practice_streak": 7
}
```

#### GET `/progress/routine/{routine_id}`
Get progress for specific routine (requires authentication)

#### GET `/progress/yogasana/{yogasana_id}`
Get progress for specific yoga pose (requires authentication)

#### PUT `/progress/{progress_id}`
Update progress record (requires authentication)

#### DELETE `/progress/{progress_id}`
Delete progress record (requires authentication)

---

## Database Schema

### Users Table
```
- id (Integer, Primary Key)
- email (String, Unique)
- username (String, Unique)
- full_name (String)
- hashed_password (String)
- is_active (Boolean)
- created_at (DateTime)
- updated_at (DateTime)
```

### Routines Table
```
- id (Integer, Primary Key)
- user_id (Integer, Foreign Key)
- title (String)
- goal (String)
- description (Text)
- yogasana_ids (Text - JSON)
- duration_minutes (Integer)
- is_active (Boolean)
- created_at (DateTime)
- updated_at (DateTime)
```

### Progress Table
```
- id (Integer, Primary Key)
- user_id (Integer, Foreign Key)
- routine_id (Integer, Foreign Key, Optional)
- yogasana_id (String)
- yogasana_name (String)
- completion_time (Integer - seconds)
- is_completed (Boolean)
- notes (Text)
- practice_date (DateTime)
- created_at (DateTime)
```

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

Token obtained from login response. Token expires after 30 minutes (configurable).

---

## Directory Structure
```
backend/
├── main.py                    (FastAPI app entry point)
├── config.py                  (Configuration settings)
├── requirements.txt           (Python dependencies)
├── .env                       (Environment variables)
├── wellness_guide.db          (SQLite database - auto-created)
└── app/
    ├── __init__.py
    ├── auth.py               (Authentication utilities)
    ├── database.py           (Database setup & models)
    ├── models.py             (SQLAlchemy models)
    ├── schemas.py            (Pydantic schemas)
    └── routes/
        ├── __init__.py
        ├── auth.py           (Authentication endpoints)
        ├── routines.py       (Routine endpoints)
        └── progress.py       (Progress endpoints)
```

---

## Features Implemented

- User authentication with JWT tokens
- User signup and login
- Secure password hashing (bcrypt)
- Routine CRUD operations
- Progress tracking
- Statistics calculation
- Practice streak tracking
- CORS support
- Comprehensive API documentation
- SQLite database with SQLAlchemy ORM
- Dependency injection for clean code

---

## Production Deployment

For production:

1. Change `SECRET_KEY` in `.env` to a strong random string
2. Use PostgreSQL instead of SQLite:
   ```
   DATABASE_URL=postgresql://user:password@localhost/wellness_guide
   ```
3. Set `reload=False` in uvicorn
4. Use a production ASGI server like Gunicorn:
   ```bash
   pip install gunicorn
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
   ```
5. Set up HTTPS/SSL certificates
6. Configure appropriate CORS origins
7. Set up environment variables securely

---

## Testing API with cURL

### Signup
```bash
curl -X POST "http://localhost:8000/api/v1/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "testpass123"
  }'
```

### Login
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123"
  }'
```

### Create Routine (replace TOKEN with actual token)
```bash
curl -X POST "http://localhost:8000/api/v1/routines/" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Morning Yoga",
    "goal": "Improve flexibility",
    "yogasana_ids": "[\"mountain-pose\"]",
    "duration_minutes": 30
  }'
```

---

## Troubleshooting

### Port already in use
```bash
# Change port in startup command
python -m uvicorn main:app --reload --port 8001
```

### Database errors
- Delete `wellness_guide.db` to reset
- Ensure database file path is correct in `.env`

### JWT errors
- Ensure token is included in Authorization header
- Check token hasn't expired
- Verify SECRET_KEY in `.env` matches

---

## Support
For issues or questions, refer to:
- FastAPI docs: https://fastapi.tiangolo.com/
- SQLAlchemy docs: https://docs.sqlalchemy.org/
- JWT (python-jose): https://github.com/mpdavis/python-jose
