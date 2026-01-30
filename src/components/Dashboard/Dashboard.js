import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../services/apiService';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = API.getStoredUser();
    setUser(storedUser);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const userStats = await API.getUserStats();
      setStats(userStats);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-error">
          <p className="error-message">⚠️ {error}</p>
          <button onClick={fetchDashboardData} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="dashboard-title">
            {getGreeting()}, {user?.username || 'User'}! 👋
          </h1>
          <p className="dashboard-subtitle">
            Ready to continue your wellness journey?
          </p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="stats-grid">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <p className="stat-label">Current Streak</p>
            <h2 className="stat-value">{stats?.current_streak || 0} days</h2>
          </div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-icon">💪</div>
          <div className="stat-content">
            <p className="stat-label">Total Sessions</p>
            <h2 className="stat-value">{stats?.total_sessions || 0}</h2>
          </div>
        </div>

        <div className="stat-card stat-card-info">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <p className="stat-label">Total Time</p>
            <h2 className="stat-value">{formatTime(stats?.total_minutes || 0)}</h2>
          </div>
        </div>

        <div className="stat-card stat-card-warning">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <p className="stat-label">Achievements</p>
            <h2 className="stat-value">{stats?.total_achievements || 0}</h2>
          </div>
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="dashboard-section">
        <h2 className="section-title">This Week</h2>
        <div className="weekly-stats-grid">
          <div className="weekly-stat-card">
            <div className="weekly-stat-icon">📊</div>
            <div>
              <p className="weekly-stat-value">{stats?.weekly_sessions || 0}</p>
              <p className="weekly-stat-label">Sessions</p>
            </div>
          </div>
          <div className="weekly-stat-card">
            <div className="weekly-stat-icon">🕐</div>
            <div>
              <p className="weekly-stat-value">{formatTime(stats?.weekly_minutes || 0)}</p>
              <p className="weekly-stat-label">Practice Time</p>
            </div>
          </div>
          <div className="weekly-stat-card">
            <div className="weekly-stat-icon">🏆</div>
            <div>
              <p className="weekly-stat-value">{stats?.longest_streak || 0}</p>
              <p className="weekly-stat-label">Longest Streak</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          <button 
            className="action-card action-configure"
            onClick={() => navigate('/configure')}
          >
            <div className="action-icon">⚙️</div>
            <h3>Configure Routine</h3>
            <p>Set your wellness goals</p>
          </button>

          <button 
            className="action-card action-practice"
            onClick={() => navigate('/practice')}
          >
            <div className="action-icon">🧘</div>
            <h3>Start Practice</h3>
            <p>Begin your session</p>
          </button>

          <button 
            className="action-card action-progress"
            onClick={() => navigate('/analytics')}
          >
            <div className="action-icon">📈</div>
            <h3>View Progress</h3>
            <p>Track your journey</p>
          </button>

          <button 
            className="action-card action-challenge"
            onClick={() => navigate('/challenge')}
          >
            <div className="action-icon">🎯</div>
            <h3>Daily Challenge</h3>
            <p>Complete today's task</p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      {stats?.last_practice_date && (
        <div className="dashboard-section">
          <h2 className="section-title">Recent Activity</h2>
          <div className="recent-activity-card">
            <div className="activity-icon">✅</div>
            <div className="activity-content">
              <p className="activity-title">Last Practice Session</p>
              <p className="activity-date">
                {new Date(stats.last_practice_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Motivational Message */}
      <div className="dashboard-section">
        <div className="motivation-card">
          <div className="motivation-icon">💫</div>
          <div className="motivation-content">
            <h3>Keep Going!</h3>
            <p>
              {stats?.current_streak > 0
                ? `Amazing! You've practiced for ${stats.current_streak} days in a row. Don't break the streak!`
                : "Start your wellness journey today. Your first step awaits!"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
