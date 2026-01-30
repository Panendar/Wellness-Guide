#  Wellness Guide - Complete Full-Stack Wellness Platform

> A comprehensive yoga and wellness platform with AI-powered recommendations, user authentication, practice tracking, achievements, daily challenges, and advanced analytics.

[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12.12-3776AB?logo=python)](https://www.python.org/)
[![React Router](https://img.shields.io/badge/React_Router-6.x-CA4245?logo=react-router)](https://reactrouter.com/)

---

##  Features

###  User Dashboard & Analytics
- **Interactive Dashboard** with real-time statistics
- **Weekly Activity** tracking and insights
- **Quick Actions** for common tasks
- **Progress Analytics** with visual charts
- **Personal Milestones** and achievements display

###  User Authentication & Profiles
- **Secure signup/login** with bcrypt password hashing
- **JWT token-based** authentication (30-minute expiration)
- **User Profiles** with customizable settings
- **Multi-device** session management
- **Activity Summary** and statistics overview

###  AI-Powered Recommendations
- **Smart goal analysis** using Google Gemini API
- **Personalized yoga** suggestions based on wellness goals
- **Custom routine** creation from recommendations
- **Difficulty-based** filtering and recommendations

###  Daily Challenges
- **Auto-generated** daily yoga challenges
- **Leaderboard System** with rankings and points
- **Challenge History** tracking
- **Achievement Integration** with auto-unlocks
- **Motivational Rewards** system

###  Achievements & Badges
- **10+ Achievement Types** (sessions, streaks, minutes, favorites)
- **Progress Tracking** with visual progress bars
- **Auto-Unlock System** based on activity
- **Badge Collection** showcase
- **Completion Percentages** and goals

###  Favorites System
- **One-Click Favoriting** with heart icon
- **Favorites Collection** page
- **Quick Access** to saved poses
- **Search & Filter** within favorites
- **Auto-sync** across devices

###  Advanced Search & Filtering
- **Live Search** across all yogasanas
- **Multi-Criteria Filters**:
  - Difficulty level (beginner/intermediate/advanced)
  - Duration (customizable time ranges)
  - Body focus area (legs, core, back, etc.)
- **Real-time Results** updates
- **Clear Filters** functionality

###  Practice History
- **Complete Session Logs** with timestamps
- **Pagination Support** for large datasets
- **Date Range Filtering**
- **Detailed Session Info**:
  - Duration tracking
  - Yogasanas practiced
  - Personal notes
- **Export Capabilities** (planned)

###  Routine Management
- **Create, edit, delete** custom yoga routines
- **Save routines** to persistent database
- **Manage routine status** (active/inactive)
- **Quick access** to saved routines

###  User Settings
- **Notification Preferences** (toggle on/off)
- **Daily Reminders** with custom time
- **Sound Settings** control
- **Dark Mode** support (UI ready)
- **Difficulty Preferences** customization
- **Reset to Defaults** option

###  Progress Tracking & Stats
- **Current Streak** calculation
- **Longest Streak** tracking
- **Total Sessions** count
- **Total Practice Time** monitoring
- **Achievements Earned** display
- **Weekly Metrics** visualization

###  Data Persistence
- **SQLite database** with 11 models
- **Cross-device sync** for all user data
- **Automatic timestamps** for all records
- **Secure user data** isolation
- **Relationship Management** with SQLAlchemy

###  User Interface
- **Modern, responsive design** for all devices
- **Gradient Animations** and smooth transitions
- **Mobile-First Navigation** with hamburger menu
- **Active Link Highlighting** in navigation
- **Loading States** and error handling
- **Empty State Designs** for better UX
- **Toast Notifications** for feedback

---

##  Quick Start

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

##  Documentation

| Guide | Purpose |
|-------|---------|
| **[QUICK_START.md](QUICK_START.md)** | 10-minute setup guide ⭐ START HERE |
| **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)** | Frontend-backend integration details |
| **[DOCKER_GUIDE.md](DOCKER_GUIDE.md)** | Docker & Docker Compose setup |
| **[backend/README.md](backend/README.md)** | Detailed backend API documentation |
| **[PROJECT_ANALYSIS.md](PROJECT_ANALYSIS.md)** | Complete project analysis & architecture |

---

---

##  Project Structure

```
Wellness-Guide/
├── src/                              # React Frontend
│   ├── components/
│   │   ├── Auth/                     # Login/Signup components
│   │   ├── Dashboard/                # Main dashboard with stats
│   │   ├── Profile/                  # User profile & overview
│   │   ├── Achievements/             # Achievement tracking
│   │   ├── Challenge/                # Daily challenges & leaderboard
│   │   ├── Favorites/                # Favorites collection
│   │   ├── Search/                   # Search & filter yogasanas
│   │   ├── History/                  # Practice session history
│   │   ├── Settings/                 # User preferences
│   │   ├── Configure/                # Goal & routine setup (legacy)
│   │   ├── Practice/                 # Practice sessions & timer
│   │   └── shared/                   # Reusable components
│   │       ├── Navigation.js         # Responsive navigation bar
│   │       ├── YogasanaCard.js       # Card with favorite button
│   │       └── ModeSelector.js       # Mode switcher (legacy)
│   ├── services/
│   │   ├── apiService.js             # Backend API integration (1000+ lines)
│   │   ├── llmService.js             # Gemini AI integration
│   │   ├── yogasanaService.js        # Yoga data management
│   │   └── storageService.js         # Local storage utilities
│   ├── data/
│   │   └── yogasanas.json            # Yoga pose database
│   ├── App.js                        # Main app with routing
│   ├── App.css                       # Global styles & CSS variables
│   └── .env                          # Frontend configuration
│
├── backend/                          # Python FastAPI Backend
│   ├── app/
│   │   ├── routes/
│   │   │   ├── auth.py              # Authentication endpoints
│   │   │   ├── stats.py             # User stats & session logs
│   │   │   ├── favorites.py         # Favorites management
│   │   │   ├── achievements.py      # Achievement system
│   │   │   ├── challenges.py        # Daily challenges
│   │   │   ├── settings.py          # User settings
│   │   │   ├── yogasanas.py         # Search & filter
│   │   │   ├── routines.py          # Routine management
│   │   │   ├── progress.py          # Progress tracking
│   │   │   └── recommendations.py   # AI recommendations
│   │   ├── database.py              # SQLAlchemy models (11 models)
│   │   ├── auth.py                  # JWT & password utilities
│   │   ├── schemas.py               # Pydantic validators
│   │   └── llm_utils.py             # Gemini API utilities
│   ├── main.py                      # FastAPI app entry point
│   ├── config.py                    # Configuration
│   └── requirements.txt             # Python dependencies
│
├── Dockerfile                       # Frontend container
├── docker-compose.yml               # Multi-container setup
├── package.json                     # Dependencies & scripts
├── README.md                        # This file
├── QUICK_START.md                   # Quick setup guide
├── INTEGRATION_GUIDE.md             # Integration details
└── DOCKER_GUIDE.md                  # Docker setup
```

---

##  API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /signup` - Create new account
- `POST /login` - User login (returns JWT token)
- `GET /profile` - Get user profile

### User Stats (`/api/v1/users`)
- `GET /stats` - Get comprehensive user statistics
- `POST /session-logs` - Log practice session
- `GET /session-logs` - Get session history
- `GET /session-logs/stats` - Get aggregated stats

### Favorites (`/api/v1/favorites`)
- `GET /` - Get user's favorites (paginated)
- `POST /` - Add yogasana to favorites
- `DELETE /{yogasana_id}` - Remove from favorites
- `GET /check/{yogasana_id}` - Check if favorited

### Achievements (`/api/v1/achievements`)
- `GET /` - Get all available achievements
- `GET /user-achievements` - Get user's earned badges
- `POST /check` - Check and unlock new achievements
- `GET /progress` - Get progress toward all achievements

### Daily Challenges (`/api/v1/daily-challenge`, `/api/v1/challenges`)
- `GET /daily-challenge` - Get today's challenge
- `GET /daily-challenge/user-progress` - Get completion status
- `POST /daily-challenge/complete` - Complete today's challenge
- `GET /challenges/history` - Get challenge history
- `GET /challenges/leaderboard` - Get top users by points

### User Settings (`/api/v1/user/settings`)
- `GET /` - Get user settings
- `PUT /` - Update user settings
- `POST /reset` - Reset to default settings

### Yogasanas (`/api/v1/yogasanas`)
- `GET /all` - Get all yogasanas with metadata
- `GET /search` - Search by name/benefits/description
- `GET /filter` - Filter by difficulty/duration/body focus
- `GET /by-difficulty` - Get yogasanas by difficulty level

### Routines (`/api/v1/routines`)
- `POST /` - Create new routine
- `GET /` - Get all user routines
- `PUT /{id}` - Update routine
- `DELETE /{id}` - Delete routine

### Progress (`/api/v1/progress`)
- `POST /` - Log practice session (legacy)
- `GET /stats` - Get user statistics
- `GET /history` - Get practice history

### Recommendations (`/api/v1/recommendations`)
- `POST /` - Get AI-powered yoga recommendations

**Full Interactive API Documentation:** http://localhost:8000/docs

---

##  Technology Stack

### Frontend
- **React** 19.2.3 with Hooks
- **React Router** 6.x for SPA routing
- **CSS3** with CSS Variables & Grid/Flexbox
- **Fetch API** for HTTP requests
- **JWT** token management

### Backend
- **FastAPI** 0.104.1 (async Python framework)
- **Python** 3.12.12
- **SQLAlchemy** 2.0+ (ORM)
- **Pydantic** 2.5+ (validation)
- **JWT** (python-jose)
- **Bcrypt** (passlib) for password hashing
- **SQLite** (development) / **PostgreSQL** (production ready)

### External Services
- **Google Gemini API** - AI-powered yoga recommendations

### Design System
- **Primary Color:** Emerald Green (#10b981)
- **Secondary Color:** Blue (#3b82f6)
- **Accent Color:** Orange (#f59e0b)
- **Gradients:** Multi-color animated backgrounds
- **Typography:** System fonts with custom sizing
- **Animations:** Smooth transitions & keyframe animations

---

##  Deployment

```bash
# Docker Compose
docker-compose up -d

# Access
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

For cloud deployment, see [DOCKER_GUIDE.md](DOCKER_GUIDE.md)

---

##  License

Open source for educational purposes.

---

##  Next Steps

1. **Start:** Run `docker-compose up`
2. **Read:** [QUICK_START.md](QUICK_START.md)
3. **Explore:** http://localhost:3000
4. **Learn:** Check guides

---
