import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './YogasanaSearch.css';
import API from '../../services/apiService';
import YogasanaCard from '../shared/YogasanaCard';

const YogasanaSearch = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [yogasanas, setYogasanas] = useState([]);
  const [filteredYogasanas, setFilteredYogasanas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    difficulty: 'all',
    maxDuration: 'all',
    bodyFocus: 'all'
  });

  const difficultyOptions = ['all', 'beginner', 'intermediate', 'advanced'];
  const durationOptions = [
    { label: 'All Durations', value: 'all' },
    { label: '0-5 minutes', value: '5' },
    { label: '5-10 minutes', value: '10' },
    { label: '10-15 minutes', value: '15' },
    { label: '15+ minutes', value: '20' }
  ];
  const bodyFocusOptions = [
    'all',
    'legs',
    'core',
    'back',
    'arms',
    'shoulders',
    'hips',
    'chest',
    'full body'
  ];

  useEffect(() => {
    fetchAllYogasanas();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filters, yogasanas]);

  const fetchAllYogasanas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await API.getAllYogasanas();
      setYogasanas(data);
      setFilteredYogasanas(data);
    } catch (err) {
      console.error('Error fetching yogasanas:', err);
      setError('Failed to load yogasanas. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let results = [...yogasanas];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (y) =>
          y.name.toLowerCase().includes(query) ||
          y.benefits?.toLowerCase().includes(query) ||
          y.description?.toLowerCase().includes(query) ||
          y.steps?.some((step) => step.toLowerCase().includes(query))
      );
    }

    // Apply difficulty filter
    if (filters.difficulty !== 'all') {
      results = results.filter(
        (y) => y.difficulty?.toLowerCase() === filters.difficulty.toLowerCase()
      );
    }

    // Apply duration filter
    if (filters.maxDuration !== 'all') {
      const maxDur = parseInt(filters.maxDuration);
      results = results.filter((y) => {
        const duration = y.duration || 5;
        return duration <= maxDur;
      });
    }

    // Apply body focus filter
    if (filters.bodyFocus !== 'all') {
      results = results.filter((y) => {
        const bodyFocus = y.body_focus?.toLowerCase() || '';
        return bodyFocus.includes(filters.bodyFocus.toLowerCase());
      });
    }

    setFilteredYogasanas(results);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      difficulty: 'all',
      maxDuration: 'all',
      bodyFocus: 'all'
    });
  };

  const hasActiveFilters = () => {
    return (
      searchQuery.trim() !== '' ||
      filters.difficulty !== 'all' ||
      filters.maxDuration !== 'all' ||
      filters.bodyFocus !== 'all'
    );
  };

  if (loading) {
    return (
      <div className="search-loading">
        <div className="spinner"></div>
        <p>Loading yogasanas...</p>
      </div>
    );
  }

  return (
    <div className="search-container">
      <div className="search-header">
        <h1 className="search-title">🔍 Search Yogasanas</h1>
        <p className="search-subtitle">
          Discover the perfect poses for your practice
        </p>
      </div>

      {error && (
        <div className="search-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button className="btn-retry" onClick={fetchAllYogasanas}>
            Retry
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="search-bar-section">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, benefits, or description..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <h3 className="filters-title">Filters</h3>
        <div className="filters-grid">
          {/* Difficulty Filter */}
          <div className="filter-group">
            <label className="filter-label">Difficulty Level</label>
            <select
              className="filter-select"
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            >
              {difficultyOptions.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Duration Filter */}
          <div className="filter-group">
            <label className="filter-label">Max Duration</label>
            <select
              className="filter-select"
              value={filters.maxDuration}
              onChange={(e) => handleFilterChange('maxDuration', e.target.value)}
            >
              {durationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Body Focus Filter */}
          <div className="filter-group">
            <label className="filter-label">Body Focus</label>
            <select
              className="filter-select"
              value={filters.bodyFocus}
              onChange={(e) => handleFilterChange('bodyFocus', e.target.value)}
            >
              {bodyFocusOptions.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasActiveFilters() && (
          <button className="btn-clear-filters" onClick={clearFilters}>
            <span className="clear-icon">🔄</span>
            Clear All Filters
          </button>
        )}
      </div>

      {/* Results */}
      <div className="search-results">
        <div className="results-header">
          <h3 className="results-count">
            {filteredYogasanas.length} {filteredYogasanas.length === 1 ? 'Result' : 'Results'}
            {hasActiveFilters() && ' Found'}
          </h3>
        </div>

        {filteredYogasanas.length === 0 ? (
          <div className="no-results">
            <span className="no-results-icon">😔</span>
            <h3>No yogasanas found</h3>
            <p>Try adjusting your search or filters</p>
            {hasActiveFilters() && (
              <button className="btn-clear-filters-alt" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="yogasanas-grid">
            {filteredYogasanas.map((yogasana, index) => (
              <YogasanaCard key={index} yogasana={yogasana} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default YogasanaSearch;
