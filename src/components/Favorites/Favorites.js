import React, { useState, useEffect } from 'react';
import './Favorites.css';
import API from '../../services/apiService';
import YogasanaCard from '../shared/YogasanaCard';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, [page]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await API.getFavorites({ skip: (page - 1) * 20, limit: 20 });
      
      if (data.favorites) {
        setFavorites(data.favorites);
        setHasMore(data.favorites.length === 20);
      } else if (Array.isArray(data)) {
        setFavorites(data);
        setHasMore(data.length === 20);
      } else {
        setFavorites([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError('Failed to load favorites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteChange = (yogasanaId, isFavorited) => {
    if (!isFavorited) {
      // Remove from list when unfavorited
      setFavorites(prev => prev.filter(fav => fav.yogasana_id !== yogasanaId));
    }
  };

  const handleRetry = () => {
    fetchFavorites();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && favorites.length === 0) {
    return (
      <div className="favorites-loading">
        <div className="spinner"></div>
        <p>Loading your favorites...</p>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <h1 className="favorites-title">❤️ My Favorites</h1>
        <p className="favorites-subtitle">
          Your collection of saved yogasanas ({favorites.length} {favorites.length === 1 ? 'pose' : 'poses'})
        </p>
      </div>

      {error && (
        <div className="favorites-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button className="btn-retry" onClick={handleRetry}>
            Retry
          </button>
        </div>
      )}

      {favorites.length === 0 && !loading ? (
        <div className="no-favorites">
          <span className="no-favorites-icon">💔</span>
          <h3>No favorites yet</h3>
          <p>Start adding yogasanas to your favorites by clicking the heart icon on any pose</p>
          <a href="/search" className="btn-browse">
            <span className="btn-icon">🔍</span>
            Browse Yogasanas
          </a>
        </div>
      ) : (
        <>
          <div className="favorites-grid">
            {favorites.map((favorite) => {
              // Transform favorite data to yogasana format
              const yogasana = {
                id: favorite.yogasana_id,
                name: favorite.yogasana_name,
                image_Url: favorite.yogasana_image || '/images/default-yogasana.jpg',
                benefits: favorite.yogasana_benefits || 'Benefits not available',
                difficulty: favorite.yogasana_difficulty,
                duration: favorite.yogasana_duration,
                added_date: favorite.created_at
              };

              return (
                <div key={favorite.id} className="favorite-item">
                  <YogasanaCard 
                    yogasana={yogasana} 
                    onFavoriteChange={handleFavoriteChange}
                  />
                  <div className="favorite-meta">
                    <span className="added-date">
                      Added {formatDate(favorite.created_at)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {(page > 1 || hasMore) && (
            <div className="favorites-pagination">
              <button
                className="pagination-btn"
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
              >
                ← Previous
              </button>
              <span className="page-info">Page {page}</span>
              <button
                className="pagination-btn"
                onClick={() => setPage(p => p + 1)}
                disabled={!hasMore}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Favorites;
