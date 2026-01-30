import React, { useState, useEffect } from 'react';
import * as API from '../../services/apiService';
import './Achievements.css';

const Achievements = () => {
  const [achievementProgress, setAchievementProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const data = await API.getAchievementProgress();
      setAchievementProgress(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (type) => {
    const colors = {
      sessions: '#10b981',
      minutes: '#3b82f6',
      streak: '#f59e0b',
      favorites: '#ec4899',
    };
    return colors[type] || '#6b7280';
  };

  const getCategoryIcon = (type) => {
    const icons = {
      sessions: '💪',
      minutes: '⏱️',
      streak: '🔥',
      favorites: '❤️',
    };
    return icons[type] || '⭐';
  };

  if (loading) {
    return (
      <div className="achievements-container">
        <div className="achievements-loading">
          <div className="spinner"></div>
          <p>Loading achievements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="achievements-container">
        <div className="achievements-error">
          <p className="error-message">⚠️ {error}</p>
          <button onClick={fetchAchievements} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const unlocked = achievementProgress?.achievements?.filter(a => a.is_unlocked) || [];
  const locked = achievementProgress?.achievements?.filter(a => !a.is_unlocked) || [];

  return (
    <div className="achievements-container">
      {/* Header */}
      <div className="achievements-header">
        <h1 className="achievements-title">🏆 Achievements</h1>
        <p className="achievements-subtitle">
          Track your progress and unlock badges as you practice
        </p>
      </div>

      {/* Summary Cards */}
      <div className="achievements-summary">
        <div className="summary-card summary-unlocked">
          <div className="summary-icon">✅</div>
          <div className="summary-content">
            <h3 className="summary-number">
              {achievementProgress?.total_unlocked || 0}
            </h3>
            <p className="summary-label">Unlocked</p>
          </div>
        </div>

        <div className="summary-card summary-total">
          <div className="summary-icon">🎯</div>
          <div className="summary-content">
            <h3 className="summary-number">
              {achievementProgress?.total_achievements || 0}
            </h3>
            <p className="summary-label">Total Available</p>
          </div>
        </div>

        <div className="summary-card summary-progress">
          <div className="summary-icon">📈</div>
          <div className="summary-content">
            <h3 className="summary-number">
              {achievementProgress?.total_achievements > 0
                ? Math.round((achievementProgress.total_unlocked / achievementProgress.total_achievements) * 100)
                : 0}%
            </h3>
            <p className="summary-label">Complete</p>
          </div>
        </div>
      </div>

      {/* Unlocked Achievements */}
      {unlocked.length > 0 && (
        <div className="achievements-section">
          <h2 className="section-title">
            ✅ Unlocked ({unlocked.length})
          </h2>
          <div className="achievements-grid">
            {unlocked.map((achievement) => (
              <div key={achievement.achievement_id} className="achievement-card achievement-unlocked">
                <div className="achievement-badge-large">
                  {achievement.badge_icon}
                </div>
                <div className="achievement-info">
                  <h3 className="achievement-name">{achievement.title}</h3>
                  <p className="achievement-description">
                    {achievement.requirement_value} {achievement.requirement_type}
                  </p>
                  <div className="achievement-unlocked-banner">
                    <span className="unlocked-icon">🎉</span>
                    <span>Unlocked!</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Achievements with Progress */}
      {locked.length > 0 && (
        <div className="achievements-section">
          <h2 className="section-title">
            🔒 In Progress ({locked.length})
          </h2>
          <div className="achievements-grid">
            {locked.map((achievement) => (
              <div key={achievement.achievement_id} className="achievement-card achievement-locked">
                <div 
                  className="achievement-badge-large locked-badge"
                  style={{ borderColor: getCategoryColor(achievement.requirement_type) }}
                >
                  {getCategoryIcon(achievement.requirement_type)}
                </div>
                <div className="achievement-info">
                  <h3 className="achievement-name">{achievement.title}</h3>
                  <p className="achievement-description">
                    Reach {achievement.requirement_value} {achievement.requirement_type}
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="achievement-progress">
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar-fill"
                        style={{ 
                          width: `${achievement.progress_percent}%`,
                          backgroundColor: getCategoryColor(achievement.requirement_type)
                        }}
                      ></div>
                    </div>
                    <div className="progress-text">
                      <span className="progress-current">
                        {achievement.current_value}
                      </span>
                      <span className="progress-separator">/</span>
                      <span className="progress-target">
                        {achievement.requirement_value}
                      </span>
                      <span className="progress-percent">
                        ({Math.round(achievement.progress_percent)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {achievementProgress?.total_achievements === 0 && (
        <div className="achievements-empty">
          <div className="empty-icon">🎯</div>
          <h3>No Achievements Available</h3>
          <p>Start practicing to unlock achievements!</p>
        </div>
      )}

      {/* Tips Section */}
      <div className="achievements-tips">
        <h3>💡 How to Unlock Achievements</h3>
        <ul className="tips-list">
          <li><strong>💪 Sessions:</strong> Complete yoga practice sessions regularly</li>
          <li><strong>⏱️ Minutes:</strong> Accumulate total practice time</li>
          <li><strong>🔥 Streaks:</strong> Practice consecutive days without missing</li>
          <li><strong>❤️ Favorites:</strong> Bookmark yogasanas you love</li>
        </ul>
      </div>
    </div>
  );
};

export default Achievements;
