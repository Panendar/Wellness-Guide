import React, { useState, useEffect } from 'react';
import * as API from '../../services/apiService';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [userData, statsData, achievementsData, favoritesData] = await Promise.all([
        API.getProfile(),
        API.getUserStats(),
        API.getUserAchievements(),
        API.getFavorites(5),
      ]);

      setUser(userData);
      setStats(statsData);
      setAchievements(achievementsData);
      setFavorites(favoritesData);
      setError(null);
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="profile-error">
          <p className="error-message">⚠️ {error}</p>
          <button onClick={fetchProfileData} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-banner">
          <div className="banner-gradient"></div>
        </div>
        
        <div className="profile-info-section">
          <div className="profile-avatar-container">
            <div className="profile-avatar">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="avatar-badge">
              {stats?.current_streak > 0 ? '🔥' : '⭐'}
            </div>
          </div>

          <div className="profile-details">
            <h1 className="profile-name">{user?.full_name || user?.username}</h1>
            <p className="profile-username">@{user?.username}</p>
            <p className="profile-email">{user?.email}</p>
            <p className="profile-joined">
              Member since {formatDate(user?.created_at)}
            </p>
          </div>

          <button className="edit-profile-btn" onClick={() => setEditMode(true)}>
            Edit Profile
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="profile-stats-grid">
        <div className="profile-stat-card">
          <div className="stat-icon-large">💪</div>
          <h3 className="stat-number">{stats?.total_sessions || 0}</h3>
          <p className="stat-label">Total Sessions</p>
        </div>

        <div className="profile-stat-card">
          <div className="stat-icon-large">⏱️</div>
          <h3 className="stat-number">{formatTime(stats?.total_minutes || 0)}</h3>
          <p className="stat-label">Practice Time</p>
        </div>

        <div className="profile-stat-card">
          <div className="stat-icon-large">🔥</div>
          <h3 className="stat-number">{stats?.current_streak || 0} days</h3>
          <p className="stat-label">Current Streak</p>
        </div>

        <div className="profile-stat-card">
          <div className="stat-icon-large">🏆</div>
          <h3 className="stat-number">{stats?.longest_streak || 0} days</h3>
          <p className="stat-label">Best Streak</p>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="profile-section">
        <div className="section-header">
          <h2 className="section-title">🏅 Achievements</h2>
          <span className="achievement-count">
            {achievements.length} earned
          </span>
        </div>

        {achievements.length > 0 ? (
          <div className="achievements-showcase">
            {achievements.slice(0, 6).map((ua) => (
              <div key={ua.id} className="achievement-badge-card">
                <div className="achievement-badge-icon">
                  {ua.achievement.badge_icon}
                </div>
                <h4 className="achievement-badge-title">
                  {ua.achievement.title}
                </h4>
                <p className="achievement-badge-desc">
                  {ua.achievement.description}
                </p>
                <p className="achievement-unlocked-date">
                  Unlocked {formatDate(ua.unlocked_at)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p className="empty-icon">🎯</p>
            <p className="empty-message">No achievements yet</p>
            <p className="empty-hint">Complete sessions to unlock badges!</p>
          </div>
        )}

        {achievements.length > 6 && (
          <button className="view-all-btn">
            View All {achievements.length} Achievements →
          </button>
        )}
      </div>

      {/* Favorite Yogasanas */}
      <div className="profile-section">
        <div className="section-header">
          <h2 className="section-title">❤️ Favorite Yogasanas</h2>
          <span className="favorite-count">
            {stats?.total_favorites || 0} saved
          </span>
        </div>

        {favorites.length > 0 ? (
          <div className="favorites-list">
            {favorites.map((fav) => (
              <div key={fav.id} className="favorite-item">
                <div className="favorite-icon">🧘</div>
                <div className="favorite-details">
                  <h4 className="favorite-name">{fav.yogasana_name}</h4>
                  <p className="favorite-added">
                    Added {formatDate(fav.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p className="empty-icon">💖</p>
            <p className="empty-message">No favorites yet</p>
            <p className="empty-hint">Bookmark yogasanas you love!</p>
          </div>
        )}

        {favorites.length > 0 && (
          <button className="view-all-btn">
            View All Favorites →
          </button>
        )}
      </div>

      {/* Activity Summary */}
      <div className="profile-section">
        <h2 className="section-title">📊 Activity Summary</h2>
        
        <div className="activity-stats-grid">
          <div className="activity-stat">
            <div className="activity-stat-header">
              <span className="activity-stat-icon">📅</span>
              <span className="activity-stat-label">This Week</span>
            </div>
            <p className="activity-stat-value">{stats?.weekly_sessions || 0} sessions</p>
            <p className="activity-stat-detail">{formatTime(stats?.weekly_minutes || 0)}</p>
          </div>

          <div className="activity-stat">
            <div className="activity-stat-header">
              <span className="activity-stat-icon">⭐</span>
              <span className="activity-stat-label">Achievements</span>
            </div>
            <p className="activity-stat-value">{stats?.total_achievements || 0} unlocked</p>
            <p className="activity-stat-detail">Keep going!</p>
          </div>

          <div className="activity-stat">
            <div className="activity-stat-header">
              <span className="activity-stat-icon">🎯</span>
              <span className="activity-stat-label">Challenges</span>
            </div>
            <p className="activity-stat-value">{stats?.total_challenges_completed || 0} completed</p>
            <p className="activity-stat-detail">Daily dedication</p>
          </div>
        </div>
      </div>

      {/* Last Practice */}
      {stats?.last_practice_date && (
        <div className="profile-section">
          <h2 className="section-title">🕐 Recent Activity</h2>
          <div className="last-practice-card">
            <div className="last-practice-icon">✅</div>
            <div className="last-practice-content">
              <h4>Last Practice Session</h4>
              <p className="last-practice-date">
                {new Date(stats.last_practice_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editMode && (
        <div className="modal-overlay" onClick={() => setEditMode(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="modal-close" onClick={() => setEditMode(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-message">
                Profile editing feature coming soon! 🚀
              </p>
              <p className="modal-hint">
                You'll be able to update your name, avatar, and preferences.
              </p>
            </div>
            <div className="modal-footer">
              <button className="modal-btn-secondary" onClick={() => setEditMode(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
