import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchRestaurants } from '../api/fastor';
import RestaurantCard from '../components/RestaurantCard';

export default function Home() {
  const { token, user, logout } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [bannerIndex, setBannerIndex] = useState(0);

  const userName = user?.user_name && user.user_name !== 'Guest' ? user.user_name : 'Karan';

  const banners = [
    {
      title: 'VEGGIE FRIENDLY EATERIES',
      subtitle: 'Handpicked places for plant-based cravings',
      badge: 'TOP PICKS',
    },
    {
      title: 'WEEKEND SPECIAL DEALS',
      subtitle: 'Flat 40% OFF on partner cafes',
      badge: 'LIMITED TIME',
    },
    {
      title: 'CHEF RECOMMENDED TASTES',
      subtitle: 'Curated artisanal bakeries and gourmet treats',
      badge: 'POPULAR',
    },
  ];

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchRestaurants(token);
      setRestaurants(data);
    } catch (err) {
      setError(err.message || 'Failed to load restaurants. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  return (
    <div className="page-container screen-home">
      {/* Top Location Bar */}
      <header className="home-header">
        <div className="location-box">
          <span className="location-label">Pre Order From</span>
          <div className="location-selector">
            <span className="location-pin" aria-hidden="true">📍</span>
            <span className="location-name">Connaught Place</span>
            <span className="location-chevron" aria-hidden="true">▾</span>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="logout-btn"
          aria-label="Log out"
          title="Log out"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </header>

      {/* Greeting Card with Action Buttons */}
      <section className="user-greeting-card">
        <div className="user-greeting-meta">
          <h2 className="user-greeting-name">{userName}</h2>
          <p className="user-greeting-sub">Let's explore this evening</p>
        </div>

        <div className="quick-actions">
          <div className="quick-action-btn action-offers">
            <div className="action-icon" aria-hidden="true">%</div>
            <span className="action-label">Offers</span>
          </div>
          <div className="quick-action-btn action-wallet">
            <div className="action-icon" aria-hidden="true">💳</div>
            <span className="action-label">Wallet</span>
          </div>
        </div>
      </section>

      {/* Your Taste Section (Horizontal Scroll) */}
      <section className="section-block taste-section">
        <div className="section-header-row">
          <h3 className="section-title">Your taste</h3>
          <span className="section-link">see all &gt;</span>
        </div>

        <div className="taste-carousel">
          {isLoading ? (
            <div className="loading-placeholder">Loading places...</div>
          ) : restaurants.length > 0 ? (
            restaurants.slice(0, 6).map((item) => (
              <RestaurantCard
                key={`taste-${item.restaurant_id}`}
                restaurant={item}
                variant="horizontal"
              />
            ))
          ) : (
            <p className="empty-text">No restaurants found</p>
          )}
        </div>
      </section>

      {/* Banner Carousel */}
      <section className="section-block banner-section">
        <div className="promo-banner">
          <span className="banner-tag">{banners[bannerIndex].badge}</span>
          <h3 className="banner-title">{banners[bannerIndex].title}</h3>
          <p className="banner-sub">{banners[bannerIndex].subtitle}</p>
          <button type="button" className="banner-cta">
            Try Now
          </button>
        </div>
        <div className="carousel-dots" role="tablist" aria-label="Promo carousel pagination">
          {banners.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`dot ${i === bannerIndex ? 'active' : ''}`}
              onClick={() => setBannerIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Popular Ones Section (Vertical List) */}
      <section className="section-block popular-section">
        <div className="section-header-row">
          <h3 className="section-title">Popular Ones</h3>
        </div>

        {isLoading && (
          <div className="list-loading">
            <div className="skeleton-card" />
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        )}

        {error && (
          <div className="error-card" role="alert">
            <p>{error}</p>
            <button type="button" onClick={loadData} className="retry-btn">
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && (
          <div className="restaurant-list" data-testid="restaurant-list">
            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.restaurant_id}
                restaurant={restaurant}
                variant="list"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
