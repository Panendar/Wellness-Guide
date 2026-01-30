import React, { useState, useEffect } from 'react';
import * as API from '../../services/apiService';
import './DailyChallenge.css';

const DailyChallenge = () => {
  const [challenge, setChallenge] = useState(null);
  const [progress, setProgress] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchChallengeData();
  }, []);

  const fetchChallengeData = async () => {
    try {
      setLoading(true);
      const [challengeData, progressData, leaderboardData] = await Promise.all([
        API.getDailyChallenge(),
        API.getUserChallengeProgress().catch(() => null),
        API.getChallengeLeaderboard(10),
      ]);

      setChallenge(progressData?.challenge || challengeData);
      setProgress(progressData);
      setLeaderboard(leaderboardData.leaderboard || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching challenge data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteChallenge = async () => {
    if (!challenge || progress?.completed) return;

    try {
      setCompleting(true);
      await API.completeDailyChallenge(challenge.id);
      setSuccess(true);
      
      // Refresh data
      await fetchChallengeData();
      
      // Check for new achievements
      await API.checkNewAchievements();
    } catch (err) {
      console.error('Error completing challenge:', err);
      setError(err.message);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="challenge-container">
        <div className="challenge-loading">
          <div className="spinner"></div>
          <p>Loading today's challenge...</p>
        </div>
      </div>
    );
  }

  if (error && !challenge) {
    return (
      <div className="challenge-container">
        <div className="challenge-error">
          <p className="error-message">⚠️ {error}</p>
          <button onClick={fetchChallengeData} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="challenge-container">
      {/* Header */}
      <div className="challenge-header">
        <h1 className="challenge-title">Daily Challenge 🎯</h1>
        <p className="challenge-subtitle">
          Complete today's challenge to earn points and climb the leaderboard!
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="success-banner">
          <span className="success-icon">🎉</span>
          <span>Challenge completed! You earned {progress?.completion_details?.points_earned || 0} points!</span>
        </div>
      )}

      {/* Today's Challenge Card */}
      <div className="challenge-main-card">
        <div className="challenge-badge">
          <div className="badge-icon">{progress?.completed ? '✅' : '🎯'}</div>
          <div className="badge-date">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>

        <div className="challenge-content">
          <h2 className="challenge-name">{challenge?.yogasana_name}</h2>
          <p className="challenge-description">{challenge?.challenge_description}</p>

          <div className="challenge-details">
            <div className="challenge-detail-item">
              <span className="detail-icon">🎯</span>
              <div>
                <p className="detail-label">Target</p>
                <p className="detail-value">
                  {challenge?.challenge_target} {challenge?.challenge_target > 10 ? 'seconds' : 'repetitions'}
                </p>
              </div>
            </div>

            <div className="challenge-detail-item">
              <span className="detail-icon">⭐</span>
              <div>
                <p className="detail-label">Reward</p>
                <p className="detail-value">{challenge?.reward_points} Points</p>
              </div>
            </div>
          </div>

          {progress?.completed ? (
            <div className="challenge-completed">
              <div className="completed-icon">✅</div>
              <div>
                <h3>Challenge Completed!</h3>
                <p>Completed at {new Date(progress.completion_details.completed_at).toLocaleTimeString()}</p>
                <p className="points-earned">+{progress.completion_details.points_earned} Points</p>
              </div>
            </div>
          ) : (
            <button
              className="complete-button"
              onClick={handleCompleteChallenge}
              disabled={completing}
            >
              {completing ? (
                <>
                  <span className="button-spinner"></span>
                  Completing...
                </>
              ) : (
                <>Mark as Completed</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="leaderboard-section">
        <h2 className="section-title">🏆 Leaderboard</h2>
        <p className="section-subtitle">Top challengers this month</p>

        {leaderboard.length > 0 ? (
          <div className="leaderboard-list">
            {leaderboard.map((entry, index) => (
              <div 
                key={index} 
                className={`leaderboard-item ${index < 3 ? 'leaderboard-top' : ''}`}
              >
                <div className="leaderboard-rank">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && <span className="rank-number">#{entry.rank}</span>}
                </div>
                <div className="leaderboard-user">
                  <div className="user-avatar">{entry.username.charAt(0).toUpperCase()}</div>
                  <span className="user-name">{entry.username}</span>
                </div>
                <div className="leaderboard-stats">
                  <div className="stat-item">
                    <span className="stat-icon">✅</span>
                    <span>{entry.total_completions}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">⭐</span>
                    <span>{entry.total_points}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-leaderboard">
            <p>No data yet. Be the first to complete challenges!</p>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="tips-section">
        <h3>💡 Tips for Success</h3>
        <ul className="tips-list">
          <li>Practice at the same time each day to build a habit</li>
          <li>Focus on proper form rather than speed</li>
          <li>Use a timer to track your progress accurately</li>
          <li>Complete challenges daily to maintain your streak</li>
        </ul>
      </div>
    </div>
  );
};

export default DailyChallenge;
