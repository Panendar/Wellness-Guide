import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './ProgressTracker.css';
import API from '../../services/apiService';

const ProgressTracker = () => {
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week'); // week, month, all
  const [activeTab, setActiveTab] = useState('overview'); // overview, sessions, charts

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsData, sessionsData] = await Promise.all([
        API.getUserStats(),
        API.getSessionLogs({ limit: 100 })
      ]);
      
      setStats(statsData);
      setSessions(sessionsData.sessions || sessionsData || []);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSessions = () => {
    if (!sessions.length) return [];
    
    const now = new Date();
    let startDate = new Date();
    
    if (timeRange === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      return sessions;
    }
    
    return sessions.filter(s => new Date(s.session_date) >= startDate);
  };

  const prepareChartData = () => {
    const filtered = getFilteredSessions();
    
    // Group sessions by date
    const sessionsByDate = {};
    filtered.forEach(session => {
      const date = new Date(session.session_date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      if (!sessionsByDate[date]) {
        sessionsByDate[date] = { date, sessions: 0, minutes: 0 };
      }
      sessionsByDate[date].sessions += 1;
      sessionsByDate[date].minutes += session.duration_minutes;
    });
    
    return Object.values(sessionsByDate).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
  };

  const calculateWeekdayDistribution = () => {
    const filtered = getFilteredSessions();
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const distribution = weekdays.map(day => ({ day, count: 0 }));
    
    filtered.forEach(session => {
      const dayIndex = new Date(session.session_date).getDay();
      distribution[dayIndex].count += 1;
    });
    
    return distribution;
  };

  const calculateAverages = () => {
    const filtered = getFilteredSessions();
    if (filtered.length === 0) return { avgDuration: 0, avgPerWeek: 0 };
    
    const totalMinutes = filtered.reduce((sum, s) => sum + s.duration_minutes, 0);
    const avgDuration = Math.round(totalMinutes / filtered.length);
    
    const weeks = timeRange === 'week' ? 1 : timeRange === 'month' ? 4 : 
                  Math.max(1, Math.ceil(filtered.length / 7));
    const avgPerWeek = Math.round(filtered.length / weeks);
    
    return { avgDuration, avgPerWeek };
  };

  const getMostPracticedYogasanas = () => {
    const filtered = getFilteredSessions();
    const yogasanaCounts = {};
    
    filtered.forEach(session => {
      if (session.yogasanas_practiced && Array.isArray(session.yogasanas_practiced)) {
        session.yogasanas_practiced.forEach(yogasana => {
          yogasanaCounts[yogasana] = (yogasanaCounts[yogasana] || 0) + 1;
        });
      }
    });
    
    return Object.entries(yogasanaCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <span className="error-icon">⚠️</span>
        <p>{error}</p>
        <button className="btn-retry" onClick={fetchData}>Retry</button>
      </div>
    );
  }

  const chartData = prepareChartData();
  const weekdayData = calculateWeekdayDistribution();
  const { avgDuration, avgPerWeek } = calculateAverages();
  const topYogasanas = getMostPracticedYogasanas();
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1 className="analytics-title">📊 Progress Tracker</h1>
        <p className="analytics-subtitle">Visualize your wellness journey</p>
      </div>

      {/* Time Range Selector */}
      <div className="time-range-selector">
        <button
          className={`range-btn ${timeRange === 'week' ? 'active' : ''}`}
          onClick={() => setTimeRange('week')}
        >
          Last 7 Days
        </button>
        <button
          className={`range-btn ${timeRange === 'month' ? 'active' : ''}`}
          onClick={() => setTimeRange('month')}
        >
          Last 30 Days
        </button>
        <button
          className={`range-btn ${timeRange === 'all' ? 'active' : ''}`}
          onClick={() => setTimeRange('all')}
        >
          All Time
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📈 Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'charts' ? 'active' : ''}`}
          onClick={() => setActiveTab('charts')}
        >
          📊 Charts
        </button>
        <button
          className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          📝 Sessions
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="overview-content">
          {/* Key Metrics */}
          <div className="metrics-grid">
            <div className="metric-card primary">
              <div className="metric-icon">🔥</div>
              <div className="metric-value">{stats?.current_streak || 0}</div>
              <div className="metric-label">Current Streak</div>
            </div>
            <div className="metric-card success">
              <div className="metric-icon">✅</div>
              <div className="metric-value">{stats?.total_sessions || 0}</div>
              <div className="metric-label">Total Sessions</div>
            </div>
            <div className="metric-card info">
              <div className="metric-icon">⏱️</div>
              <div className="metric-value">{formatDuration(stats?.total_minutes || 0)}</div>
              <div className="metric-label">Total Time</div>
            </div>
            <div className="metric-card warning">
              <div className="metric-icon">⭐</div>
              <div className="metric-value">{avgDuration}</div>
              <div className="metric-label">Avg Duration (min)</div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="stats-cards">
            <div className="stat-card">
              <h3>📅 Practice Frequency</h3>
              <div className="stat-value">{avgPerWeek} sessions/week</div>
              <p className="stat-description">Average based on {timeRange}</p>
            </div>
            <div className="stat-card">
              <h3>🏆 Best Streak</h3>
              <div className="stat-value">{stats?.longest_streak || 0} days</div>
              <p className="stat-description">Your longest consecutive practice</p>
            </div>
            <div className="stat-card">
              <h3>❤️ Favorites</h3>
              <div className="stat-value">{stats?.total_favorites || 0} poses</div>
              <p className="stat-description">Saved yogasanas</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Tab */}
      {activeTab === 'charts' && (
        <div className="charts-content">
          {/* Practice Trend */}
          <div className="chart-section">
            <h3 className="chart-title">📈 Practice Trend</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sessions" stroke="#10b981" strokeWidth={2} name="Sessions" />
                  <Line type="monotone" dataKey="minutes" stroke="#3b82f6" strokeWidth={2} name="Minutes" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">No data for selected time range</div>
            )}
          </div>

          {/* Weekday Distribution */}
          <div className="chart-section">
            <h3 className="chart-title">📅 Practice by Weekday</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weekdayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" name="Sessions" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Yogasanas */}
          {topYogasanas.length > 0 && (
            <div className="chart-section">
              <h3 className="chart-title">🧘 Most Practiced Yogasanas</h3>
              <div className="chart-row">
                <ResponsiveContainer width="50%" height={300}>
                  <PieChart>
                    <Pie
                      data={topYogasanas}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {topYogasanas.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="top-list">
                  {topYogasanas.map((yoga, index) => (
                    <div key={index} className="top-item">
                      <span className="rank" style={{ backgroundColor: COLORS[index] }}>
                        #{index + 1}
                      </span>
                      <span className="name">{yoga.name}</span>
                      <span className="count">{yoga.value}x</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="sessions-content">
          <h3 className="section-title">Recent Practice Sessions</h3>
          {getFilteredSessions().length === 0 ? (
            <div className="no-sessions">
              <span className="icon">📝</span>
              <p>No sessions in selected time range</p>
            </div>
          ) : (
            <div className="sessions-table-wrapper">
              <table className="sessions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Duration</th>
                    <th>Yogasanas</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredSessions().slice(0, 20).map((session, index) => (
                    <tr key={session.id || index}>
                      <td>{formatDate(session.session_date)}</td>
                      <td>
                        <span className="duration-badge">
                          {formatDuration(session.duration_minutes)}
                        </span>
                      </td>
                      <td>
                        {session.yogasanas_practiced?.length > 0 ? (
                          <div className="yogasanas-tags">
                            {session.yogasanas_practiced.slice(0, 3).map((y, i) => (
                              <span key={i} className="yogasana-tag">{y}</span>
                            ))}
                            {session.yogasanas_practiced.length > 3 && (
                              <span className="more-tag">
                                +{session.yogasanas_practiced.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="no-data">-</span>
                        )}
                      </td>
                      <td>
                        {session.notes ? (
                          <span className="notes">{session.notes}</span>
                        ) : (
                          <span className="no-data">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
