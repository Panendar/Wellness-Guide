import React, { useState, useEffect } from 'react';
import './YogasanaCard.css';
import API from '../../services/apiService';
import achievementTrigger from '../../services/achievementTriggerService';

function YogasanaCard({ yogasana, onFavoriteChange }) {
    const [isFavorited, setIsFavorited] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        checkFavoriteStatus();
    }, [yogasana.id]);

    const checkFavoriteStatus = async () => {
        try {
            if (API.isAuthenticated() && yogasana.id) {
                const result = await API.checkFavorite(yogasana.id);
                setIsFavorited(result.is_favorite);
            }
        } catch (err) {
            console.error('Error checking favorite status:', err);
        }
    };

    const handleFavoriteToggle = async (e) => {
        e.stopPropagation();
        
        if (!API.isAuthenticated()) {
            alert('Please login to favorite yogasanas');
            return;
        }

        setIsUpdating(true);
        try {
            if (isFavorited) {
                await API.removeFavorite(yogasana.id);
                setIsFavorited(false);
                achievementTrigger.afterRemoveFavorite();
            } else {
                await API.addFavorite(yogasana.id, yogasana.name);
                setIsFavorited(true);
                achievementTrigger.afterAddFavorite(yogasana);
            }
            
            // Notify parent component if callback provided
            if (onFavoriteChange) {
                onFavoriteChange(yogasana.id, !isFavorited);
            }
        } catch (err) {
            console.error('Error toggling favorite:', err);
            alert('Failed to update favorite. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="yogasana-card">
            <div className="card-image-wrapper">
                <img src={yogasana.image_Url} alt={yogasana.name} className="card-image" />
                <button
                    className={`favorite-btn ${isFavorited ? 'favorited' : ''} ${isUpdating ? 'updating' : ''}`}
                    onClick={handleFavoriteToggle}
                    disabled={isUpdating}
                    aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                    {isFavorited ? '❤️' : '🤍'}
                </button>
            </div>
            <div className="card-content">
                <h3 className="card-title">{yogasana.name}</h3>
                <p className="card-benefits">{yogasana.benefits}</p>
                {yogasana.difficulty && (
                    <span className={`difficulty-badge ${yogasana.difficulty.toLowerCase()}`}>
                        {yogasana.difficulty}
                    </span>
                )}
                {yogasana.duration && (
                    <span className="duration-badge">
                        ⏱️ {yogasana.duration} min
                    </span>
                )}
            </div>
        </div>
    );
}

export default YogasanaCard;