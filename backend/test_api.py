"""
Comprehensive test suite for Wellness Guide API
Tests all endpoints: authentication, CRUD operations, edge cases, error handling, data validation
"""

import pytest
import json
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import app and database
import sys
sys.path.insert(0, '.')
from main import app
from app.database import Base, get_db, SessionLocal

# Create test database
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"
test_engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

Base.metadata.create_all(bind=test_engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture(autouse=True)
def reset_db():
    """Reset database before each test"""
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def test_user():
    """Create a test user"""
    response = client.post(
        "/api/v1/auth/signup",
        json={
            "email": "testuser@example.com",
            "password": "TestPassword123!",
            "full_name": "Test User"
        }
    )
    assert response.status_code == 201
    return response.json()


@pytest.fixture
def auth_headers(test_user):
    """Get auth headers for test user"""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "testuser@example.com",
            "password": "TestPassword123!"
        }
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ============================================================================
# AUTHENTICATION TESTS
# ============================================================================

class TestAuthentication:
    """Test authentication endpoints"""

    def test_signup_success(self):
        """Test successful user registration"""
        response = client.post(
            "/api/v1/auth/signup",
            json={
                "email": "newuser@example.com",
                "password": "SecurePass123!",
                "full_name": "New User"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert data["full_name"] == "New User"
        assert "id" in data

    def test_signup_duplicate_email(self):
        """Test signup with existing email"""
        client.post(
            "/api/v1/auth/signup",
            json={
                "email": "test@example.com",
                "password": "Password123!",
                "full_name": "User One"
            }
        )
        response = client.post(
            "/api/v1/auth/signup",
            json={
                "email": "test@example.com",
                "password": "DifferentPass123!",
                "full_name": "User Two"
            }
        )
        assert response.status_code == 400

    def test_signup_invalid_email(self):
        """Test signup with invalid email format"""
        response = client.post(
            "/api/v1/auth/signup",
            json={
                "email": "invalid-email",
                "password": "Password123!",
                "full_name": "Test User"
            }
        )
        assert response.status_code == 422

    def test_signup_weak_password(self):
        """Test signup with weak password"""
        response = client.post(
            "/api/v1/auth/signup",
            json={
                "email": "test@example.com",
                "password": "weak",
                "full_name": "Test User"
            }
        )
        # Should fail due to password validation
        assert response.status_code in [422, 400]

    def test_login_success(self, test_user):
        """Test successful login"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "testuser@example.com",
                "password": "TestPassword123!"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_invalid_credentials(self, test_user):
        """Test login with wrong password"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "testuser@example.com",
                "password": "WrongPassword123!"
            }
        )
        assert response.status_code == 401

    def test_login_nonexistent_user(self):
        """Test login with non-existent email"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "nouser@example.com",
                "password": "AnyPassword123!"
            }
        )
        assert response.status_code == 401

    def test_token_expiration(self, test_user):
        """Test token expiration handling"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "testuser@example.com",
                "password": "TestPassword123!"
            }
        )
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Token should be valid immediately
        response = client.get("/api/v1/users/profile", headers=headers)
        assert response.status_code == 200


# ============================================================================
# USER PROFILE TESTS
# ============================================================================

class TestUserProfile:
    """Test user profile endpoints"""

    def test_get_profile(self, auth_headers, test_user):
        """Test getting user profile"""
        response = client.get("/api/v1/users/profile", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "testuser@example.com"
        assert data["full_name"] == "Test User"

    def test_get_profile_unauthorized(self):
        """Test getting profile without auth"""
        response = client.get("/api/v1/users/profile")
        assert response.status_code == 401

    def test_get_profile_invalid_token(self):
        """Test getting profile with invalid token"""
        headers = {"Authorization": "Bearer invalid-token"}
        response = client.get("/api/v1/users/profile", headers=headers)
        assert response.status_code == 401

    def test_update_profile(self, auth_headers):
        """Test updating user profile"""
        response = client.put(
            "/api/v1/users/profile",
            headers=auth_headers,
            json={
                "full_name": "Updated Name",
                "bio": "My wellness journey"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["full_name"] == "Updated Name"
        assert data["bio"] == "My wellness journey"

    def test_update_profile_invalid_email(self, auth_headers):
        """Test updating profile with invalid email"""
        response = client.put(
            "/api/v1/users/profile",
            headers=auth_headers,
            json={"email": "invalid-email"}
        )
        assert response.status_code == 422


# ============================================================================
# YOGASANA ENDPOINTS TESTS
# ============================================================================

class TestYogasanas:
    """Test yogasana endpoints"""

    def test_get_all_yogasanas(self):
        """Test fetching all yogasanas"""
        response = client.get("/api/v1/yogasanas")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_search_yogasanas(self):
        """Test searching yogasanas"""
        response = client.get("/api/v1/yogasanas/search?query=yoga")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_filter_by_difficulty(self):
        """Test filtering by difficulty"""
        response = client.get("/api/v1/yogasanas/filter?difficulty=beginner")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_filter_by_duration(self):
        """Test filtering by max duration"""
        response = client.get("/api/v1/yogasanas/filter?max_duration=10")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_filter_by_body_focus(self):
        """Test filtering by body focus"""
        response = client.get("/api/v1/yogasanas/filter?body_focus=back")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_filter_combined(self):
        """Test combined filters"""
        response = client.get(
            "/api/v1/yogasanas/filter?difficulty=intermediate&max_duration=15&body_focus=legs"
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


# ============================================================================
# FAVORITES TESTS
# ============================================================================

class TestFavorites:
    """Test favorite endpoints"""

    def test_add_favorite(self, auth_headers):
        """Test adding a favorite"""
        response = client.post(
            "/api/v1/favorites/add-favorite",
            headers=auth_headers,
            json={"yogasana_id": 1, "yogasana_name": "Downward Dog"}
        )
        assert response.status_code in [200, 201]

    def test_get_favorites(self, auth_headers):
        """Test fetching user favorites"""
        # Add a favorite first
        client.post(
            "/api/v1/favorites/add-favorite",
            headers=auth_headers,
            json={"yogasana_id": 1, "yogasana_name": "Downward Dog"}
        )
        
        response = client.get("/api/v1/favorites", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_remove_favorite(self, auth_headers):
        """Test removing a favorite"""
        # Add a favorite first
        client.post(
            "/api/v1/favorites/add-favorite",
            headers=auth_headers,
            json={"yogasana_id": 1, "yogasana_name": "Downward Dog"}
        )
        
        response = client.delete(
            "/api/v1/favorites/remove-favorite/1",
            headers=auth_headers
        )
        assert response.status_code in [200, 204]

    def test_check_favorite(self, auth_headers):
        """Test checking if yogasana is favorited"""
        # Add a favorite first
        client.post(
            "/api/v1/favorites/add-favorite",
            headers=auth_headers,
            json={"yogasana_id": 1, "yogasana_name": "Downward Dog"}
        )
        
        response = client.get(
            "/api/v1/favorites/check-favorite/1",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("is_favorite") == True

    def test_check_favorite_not_favorited(self, auth_headers):
        """Test checking non-favorited yogasana"""
        response = client.get(
            "/api/v1/favorites/check-favorite/999",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("is_favorite") == False

    def test_favorites_unauthorized(self):
        """Test accessing favorites without auth"""
        response = client.get("/api/v1/favorites")
        assert response.status_code == 401


# ============================================================================
# STATISTICS TESTS
# ============================================================================

class TestStatistics:
    """Test user statistics endpoints"""

    def test_get_user_stats(self, auth_headers):
        """Test fetching user statistics"""
        response = client.get("/api/v1/stats", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_sessions" in data
        assert "total_minutes" in data
        assert "current_streak" in data

    def test_log_session(self, auth_headers):
        """Test logging a practice session"""
        response = client.post(
            "/api/v1/stats/log-session",
            headers=auth_headers,
            json={
                "duration_minutes": 30,
                "yogasanas": ["Downward Dog", "Child's Pose"],
                "notes": "Great session!"
            }
        )
        assert response.status_code in [200, 201]
        data = response.json()
        assert "id" in data

    def test_log_session_invalid_duration(self, auth_headers):
        """Test logging session with invalid duration"""
        response = client.post(
            "/api/v1/stats/log-session",
            headers=auth_headers,
            json={
                "duration_minutes": -5,
                "yogasanas": ["Downward Dog"],
                "notes": "Invalid"
            }
        )
        assert response.status_code == 422

    def test_get_session_logs(self, auth_headers):
        """Test fetching session logs"""
        # Log a session first
        client.post(
            "/api/v1/stats/log-session",
            headers=auth_headers,
            json={
                "duration_minutes": 20,
                "yogasanas": ["Downward Dog"],
                "notes": "Test session"
            }
        )
        
        response = client.get(
            "/api/v1/stats/sessions?skip=0&limit=10",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_progress(self, auth_headers):
        """Test fetching progress data"""
        response = client.get("/api/v1/stats/progress", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)


# ============================================================================
# ACHIEVEMENTS TESTS
# ============================================================================

class TestAchievements:
    """Test achievement endpoints"""

    def test_get_achievements(self, auth_headers):
        """Test fetching achievements"""
        response = client.get("/api/v1/achievements", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_achievement_detail(self, auth_headers):
        """Test getting single achievement"""
        response = client.get("/api/v1/achievements/1", headers=auth_headers)
        assert response.status_code in [200, 404]

    def test_unlock_achievement(self, auth_headers):
        """Test unlocking achievement"""
        response = client.post(
            "/api/v1/achievements/unlock",
            headers=auth_headers,
            json={"achievement_id": 1}
        )
        assert response.status_code in [200, 201, 404]

    def test_get_leaderboard(self):
        """Test fetching achievement leaderboard"""
        response = client.get("/api/v1/achievements/leaderboard?limit=10")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


# ============================================================================
# DAILY CHALLENGE TESTS
# ============================================================================

class TestDailyChallenge:
    """Test daily challenge endpoints"""

    def test_get_daily_challenge(self, auth_headers):
        """Test fetching today's challenge"""
        response = client.get("/api/v1/challenges/today", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data

    def test_complete_challenge(self, auth_headers):
        """Test completing a challenge"""
        response = client.post(
            "/api/v1/challenges/complete",
            headers=auth_headers,
            json={"challenge_id": 1}
        )
        assert response.status_code in [200, 201, 404]

    def test_get_challenge_leaderboard(self):
        """Test fetching challenge leaderboard"""
        response = client.get("/api/v1/challenges/leaderboard?limit=10")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


# ============================================================================
# SETTINGS TESTS
# ============================================================================

class TestSettings:
    """Test user settings endpoints"""

    def test_get_settings(self, auth_headers):
        """Test fetching user settings"""
        response = client.get("/api/v1/settings", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)

    def test_update_settings(self, auth_headers):
        """Test updating settings"""
        response = client.put(
            "/api/v1/settings",
            headers=auth_headers,
            json={
                "notifications_enabled": True,
                "daily_reminder_time": "07:00",
                "theme": "dark"
            }
        )
        assert response.status_code == 200

    def test_update_settings_invalid_time(self, auth_headers):
        """Test updating settings with invalid time"""
        response = client.put(
            "/api/v1/settings",
            headers=auth_headers,
            json={
                "daily_reminder_time": "invalid-time"
            }
        )
        assert response.status_code == 422


# ============================================================================
# ERROR HANDLING TESTS
# ============================================================================

class TestErrorHandling:
    """Test error handling and edge cases"""

    def test_404_nonexistent_endpoint(self):
        """Test accessing non-existent endpoint"""
        response = client.get("/api/v1/nonexistent")
        assert response.status_code == 404

    def test_method_not_allowed(self):
        """Test using wrong HTTP method"""
        response = client.post("/api/v1/yogasanas")
        assert response.status_code == 405

    def test_invalid_json_body(self, auth_headers):
        """Test sending invalid JSON"""
        response = client.post(
            "/api/v1/stats/log-session",
            headers=auth_headers,
            data="invalid json",
            content_type="application/json"
        )
        assert response.status_code == 422

    def test_missing_required_field(self, auth_headers):
        """Test missing required field in request"""
        response = client.post(
            "/api/v1/stats/log-session",
            headers=auth_headers,
            json={"yogasanas": ["Downward Dog"]}
            # Missing duration_minutes
        )
        assert response.status_code == 422

    def test_extra_fields_ignored(self, auth_headers):
        """Test that extra fields are safely ignored"""
        response = client.post(
            "/api/v1/stats/log-session",
            headers=auth_headers,
            json={
                "duration_minutes": 20,
                "yogasanas": ["Downward Dog"],
                "notes": "Test",
                "extra_field": "should be ignored"
            }
        )
        assert response.status_code in [200, 201]


# ============================================================================
# DATA VALIDATION TESTS
# ============================================================================

class TestDataValidation:
    """Test input validation and data constraints"""

    def test_email_validation(self):
        """Test email format validation"""
        invalid_emails = [
            "notanemail",
            "@example.com",
            "user@",
            "user..name@example.com",
            "user @example.com"
        ]
        
        for email in invalid_emails:
            response = client.post(
                "/api/v1/auth/signup",
                json={
                    "email": email,
                    "password": "ValidPassword123!",
                    "full_name": "Test User"
                }
            )
            assert response.status_code == 422

    def test_password_requirements(self):
        """Test password validation requirements"""
        weak_passwords = [
            "short",
            "nouppercase123!",
            "NOLOWERCASE123!",
            "NoNumbers!",
            "NoSpecial123"
        ]
        
        for password in weak_passwords:
            response = client.post(
                "/api/v1/auth/signup",
                json={
                    "email": "test@example.com",
                    "password": password,
                    "full_name": "Test User"
                }
            )
            assert response.status_code in [400, 422]

    def test_string_length_validation(self, auth_headers):
        """Test string length constraints"""
        response = client.put(
            "/api/v1/users/profile",
            headers=auth_headers,
            json={
                "full_name": "x" * 300,  # Too long
                "bio": "x" * 5000  # Too long
            }
        )
        assert response.status_code == 422

    def test_numeric_range_validation(self, auth_headers):
        """Test numeric value ranges"""
        response = client.post(
            "/api/v1/stats/log-session",
            headers=auth_headers,
            json={
                "duration_minutes": 0,  # Should be > 0
                "yogasanas": ["Downward Dog"],
                "notes": "Test"
            }
        )
        assert response.status_code == 422


# ============================================================================
# RUN TESTS
# ============================================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
