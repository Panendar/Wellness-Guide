import React, { useState, useEffect } from 'react';
import './PracticeHistory.css';
import API from '../../services/apiService';

const PracticeHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const sessionsPerPage = 10;

  // Filters
  const [dateFilters, setDateFilters] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchSessions();
  }, [currentPage, dateFilters]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        skip: (currentPage - 1) * sessionsPerPage,
        limit: sessionsPerPage
      };

      if (dateFilters.startDate) {
        params.start_date = dateFilters.startDate;
      }
      if (dateFilters.endDate) {
        params.end_date = dateFilters.endDate;
      }

      const data = await API.getSessionLogs(params);
      setSessions(data.sessions || data);
      
      // Calculate total pages if total count is available
      if (data.total) {
        setTotalPages(Math.ceil(data.total / sessionsPerPage));
      }
    } catch (err) {
      console.error('Error fetching session history:', err);
      setError('Failed to load practice history. Please try again.');
    } finally {
      setLoading(false);
    }
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
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleDateFilterChange = (field, value) => {
    setDateFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setDateFilters({
      startDate: '',
      endDate: ''
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPaginationRange = () => {
    const range = [];
    const delta = 2; // Show 2 pages before and after current

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      range.unshift('...');
    }
    if (currentPage + delta < totalPages - 1) {
      range.push('...');
    }

    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="history-loading">
        <div className="spinner"></div>
        <p>Loading practice history...</p>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h1 className="history-title">📅 Practice History</h1>
        <p className="history-subtitle">Track your wellness journey</p>
      </div>

      {error && (
        <div className="history-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button className="btn-retry" onClick={fetchSessions}>
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <h3 className="filters-title">Filter by Date</h3>
        <div className="date-filters">
          <div className="filter-group">
            <label className="filter-label">Start Date</label>
            <input
              type="date"
              className="date-input"
              value={dateFilters.startDate}
              onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">End Date</label>
            <input
              type="date"
              className="date-input"
              value={dateFilters.endDate}
              onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
            />
          </div>
          {(dateFilters.startDate || dateFilters.endDate) && (
            <button className="btn-clear-filters" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Sessions Table */}
      <div className="history-content">
        {sessions.length === 0 ? (
          <div className="no-sessions">
            <span className="no-sessions-icon">📝</span>
            <h3>No practice sessions found</h3>
            <p>
              {dateFilters.startDate || dateFilters.endDate
                ? 'Try adjusting your date filters'
                : 'Start practicing to see your history here'}
            </p>
          </div>
        ) : (
          <>
            <div className="sessions-table-wrapper">
              <table className="sessions-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Duration</th>
                    <th>Yogasanas Practiced</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id}>
                      <td className="session-date">
                        {formatDate(session.session_date)}
                      </td>
                      <td className="session-duration">
                        <span className="duration-badge">
                          {formatDuration(session.duration_minutes)}
                        </span>
                      </td>
                      <td className="session-yogasanas">
                        {session.yogasanas_practiced && session.yogasanas_practiced.length > 0 ? (
                          <div className="yogasanas-list">
                            {session.yogasanas_practiced.map((yogasana, idx) => (
                              <span key={idx} className="yogasana-tag">
                                {yogasana}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="no-data">No yogasanas logged</span>
                        )}
                      </td>
                      <td className="session-notes">
                        {session.notes ? (
                          <span className="notes-text">{session.notes}</span>
                        ) : (
                          <span className="no-data">No notes</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>
                
                <div className="pagination-numbers">
                  {getPaginationRange().map((page, idx) => (
                    page === '...' ? (
                      <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PracticeHistory;
