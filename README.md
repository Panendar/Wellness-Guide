# 🧘 Wellness Guide - Complete Full-Stack Application

> A modern, full-featured yoga and wellness recommendation application with AI-powered suggestions, user authentication, routine management, and progress tracking.

[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?logo=python)](https://www.python.org/)
[![Docker](https://img.shields.io/badge/Docker-Supported-2496ED?logo=docker)](https://www.docker.com/)

---

## ✨ Features

### 🔐 User Authentication
- **Secure signup/login** with bcrypt password hashing
- **JWT token-based** authentication
- **Multi-user** support with isolated data
- **Session management** across devices

### 🎯 AI-Powered Recommendations
- **Smart goal analysis** using Google Gemini API
- **Personalized yoga** suggestions based on wellness goals
- **Custom routine** creation from recommendations

### 📋 Routine Management
- **Create, edit, delete** custom yoga routines
- **Save routines** to persistent database
- **Manage routine** status (active/inactive)
- **Quick access** to saved routines

### 📊 Progress Tracking
- **Log practice** sessions with duration
- **Track statistics** (total time, streak, favorites)
- **View history** of all practice sessions
- **Analyze progress** over time
- **Calculate streaks** for motivation

### 💾 Data Persistence
- **SQLite database** (or PostgreSQL for production)
- **Cross-device sync** - access routines anywhere
- **Automatic timestamps** for all records
- **Secure user data** isolation

### 🎨 User Interface
- **Modern, responsive design** for all devices
- **Intuitive navigation** between modes
- **Real-time timers** for practice sessions
- **Beautiful authentication screens**
- **User dashboard** with profile info

---

## 🚀 Quick Start

### Option 1: Docker Compose (Easiest)
```bash
# One command to start everything
docker-compose up

# Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Manual Setup

#### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

#### Frontend
```bash
npm install
npm start
```

---

## 📚 Documentation

| Guide | Purpose |
|-------|---------|
| **[QUICK_START.md](QUICK_START.md)** | 10-minute setup guide ⭐ START HERE |
| **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)** | Frontend-backend integration details |
| **[DOCKER_GUIDE.md](DOCKER_GUIDE.md)** | Docker & Docker Compose setup |
| **[backend/README.md](backend/README.md)** | Detailed backend API documentation |
| **[PROJECT_ANALYSIS.md](PROJECT_ANALYSIS.md)** | Complete project analysis & architecture |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│     React Frontend (Port 3000)      │
│  ┌─────────────────────────────────┐│
│  │ Authentication (Login/Signup)   ││
│  │ Configure Mode (Goals & Routines)││
│  │ Practice Mode (Timers)          ││
│  │ Progress Dashboard              ││
│  └─────────────────────────────────┘│
└────────────┬────────────────────────┘
             │ HTTP/JSON
┌────────────▼────────────────────────┐
│   FastAPI Backend (Port 8000)       │
│  ┌─────────────────────────────────┐│
│  │ /auth (Login, Signup, Profile)  ││
│  │ /routines (CRUD operations)     ││
│  │ /progress (Tracking & Stats)    ││
│  └─────────────────────────────────┘│
│              │
│              ▼
│  ┌─────────────────────────────────┐│
│  │   SQLite Database               ││
│  │  - Users                        ││
│  │  - Routines                     ││
│  │  - Progress                     ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

## 📁 Project Structure

```
Wellness-Guide/
├── src/                              # React Frontend
│   ├── components/
│   │   ├── Auth/                     # Login/Signup components
│   │   ├── Configure/                # Goal & routine setup
│   │   ├── Practice/                 # Practice sessions & timer
│   │   └── shared/                   # Reusable components
│   ├── services/
│   │   ├── apiService.js             # Backend API integration
│   │   ├── llmService.js             # Gemini AI integration
│   │   └── yogasanaService.js        # Yoga data management
│   ├── App.js                        # Main app component
│   ├── App.css                       # Global styles
│   └── .env                          # Frontend configuration
│
├── backend/                          # Python FastAPI Backend
│   ├── app/
│   │   ├── routes/
│   │   │   ├── auth.py              # Authentication endpoints
│   │   │   ├── routines.py          # Routine management
│   │   │   └── progress.py          # Progress tracking
│   │   ├── database.py              # SQLAlchemy models & setup
│   │   ├── auth.py                  # JWT & password utilities
│   │   └── schemas.py               # Pydantic validators
│   ├── main.py                      # FastAPI app entry point
│   ├── config.py                    # Configuration
│   └── requirements.txt             # Python dependencies
│
├── Dockerfile                       # Frontend container
├── docker-compose.yml               # Multi-container setup
├── package.json                     # Dependencies
├── QUICK_START.md                   # Quick setup guide
├── INTEGRATION_GUIDE.md             # Integration details
└── DOCKER_GUIDE.md                  # Docker setup
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Create account
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/profile` - Get user profile

### Routines
- `POST /api/v1/routines/` - Create routine
- `GET /api/v1/routines/` - Get all routines
- `PUT /api/v1/routines/{id}` - Update routine
- `DELETE /api/v1/routines/{id}` - Delete routine

### Progress
- `POST /api/v1/progress/` - Log practice
- `GET /api/v1/progress/stats` - Get statistics
- `GET /api/v1/progress/history` - Get history

**Full API Documentation:** http://localhost:8000/docs

---

## 🛠️ Technology Stack

### Frontend
- React 19.2.3
- CSS3 with modern layouts
- Fetch API
- React Hooks

### Backend
- FastAPI 0.104.1
- Python 3.8+
- SQLAlchemy ORM
- JWT Authentication
- SQLite/PostgreSQL

### External Services
- Google Gemini API (AI recommendations)

---

## 🚀 Deployment

```bash
# Docker Compose
docker-compose up -d

# Access
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

For cloud deployment, see [DOCKER_GUIDE.md](DOCKER_GUIDE.md)

---

## 📝 License

Open source for educational purposes.

---

## 🎯 Next Steps

1. **Start:** Run `docker-compose up`
2. **Read:** [QUICK_START.md](QUICK_START.md)
3. **Explore:** http://localhost:3000
4. **Learn:** Check guides

---

Happy coding! 🚀✨
