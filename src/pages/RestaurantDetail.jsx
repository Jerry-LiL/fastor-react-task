import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchRestaurants } from '../api/fastor';
import { RESTAURANT_DEFAULTS, FALLBACK_RESTAURANT_IMAGE } from '../utils/constants';
import LogoOverlay from '../components/LogoOverlay';
import ShareButton from '../components/ShareButton';

export default function RestaurantDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [restaurant, setRestaurant] = useState(location.state?.restaurant || null);
  const [isLoading, setIsLoading] = useState(!location.state?.restaurant);
  const [error, setError] = useState('');
  const [imgSrc, setImgSrc] = useState(
    location.state?.restaurant?.logo || FALLBACK_RESTAURANT_IMAGE
  );

  const heroContainerRef = useRef(null);
  const [overlayBounds, setOverlayBounds] = useState(null);

  // If page was directly refreshed / navigated without router state, fetch and find
  useEffect(() => {
    if (!restaurant && id && token) {
      let isMounted = true;
      setIsLoading(true);
      fetchRestaurants(token)
        .then((list) => {
          if (!isMounted) return;
          const found = list.find((item) => String(item.restaurant_id) === String(id));
          if (found) {
            setRestaurant(found);
            setImgSrc(found.logo || FALLBACK_RESTAURANT_IMAGE);
          } else {
            setError('Restaurant not found.');
          }
        })
        .catch((err) => {
          if (isMounted) setError(err.message || 'Failed to load restaurant details.');
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [id, restaurant, token]);

  const rawAddress = restaurant?.address_complete;
  const address =
    rawAddress && rawAddress !== 'null' && rawAddress.trim() !== ''
      ? rawAddress
      : RESTAURANT_DEFAULTS.address;

  const name = restaurant?.restaurant_name || 'Restaurant Detail';
  const rating = RESTAURANT_DEFAULTS.rating;
  const offers = RESTAURANT_DEFAULTS.offers;
  const description = RESTAURANT_DEFAULTS.description;

  const handleImageError = () => {
    if (imgSrc !== FALLBACK_RESTAURANT_IMAGE) {
      setImgSrc(FALLBACK_RESTAURANT_IMAGE);
    }
  };

  const handleOverlayPositionChange = useCallback((position, bounds) => {
    setOverlayBounds({
      x: position.x,
      y: position.y,
      containerWidth: bounds.containerWidth,
      containerHeight: bounds.containerHeight,
      itemWidth: bounds.itemWidth,
      itemHeight: bounds.itemHeight,
    });
  }, []);

  if (isLoading) {
    return (
      <div className="page-container screen-detail">
        <div className="detail-loading-state">
          <p>Loading restaurant details...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="page-container screen-detail">
        <div className="detail-error-state">
          <h2>Oops!</h2>
          <p>{error || 'Restaurant details could not be found.'}</p>
          <button type="button" onClick={() => navigate('/')} className="btn btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container screen-detail">
      {/* Hero Visual Container with Logo Overlay */}
      <div
        ref={heroContainerRef}
        className="hero-image-container"
        data-testid="hero-image-container"
      >
        <img
          src={imgSrc}
          alt={name}
          onError={handleImageError}
          className="hero-image"
          crossOrigin="anonymous"
        />

        {/* Back navigation icon */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="hero-back-button"
          aria-label="Go back"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        {/* Draggable Logo Overlay */}
        <LogoOverlay
          containerRef={heroContainerRef}
          onPositionChange={handleOverlayPositionChange}
        />

        {/* Hero carousel pagination dots */}
        <div className="hero-dots" aria-hidden="true">
          <span className="hero-dot active" />
          <span className="hero-dot" />
          <span className="hero-dot" />
        </div>
      </div>

      {/* Detail White Sheet */}
      <div className="detail-sheet">
        <div className="detail-sheet-header">
          <div className="detail-title-col">
            <h1 className="detail-name">{name}</h1>
            <p className="detail-area">{address}</p>
          </div>

          <div className="detail-rating-pill">
            <span className="star-icon" aria-hidden="true">★</span>
            <span className="rating-num">{rating}</span>
          </div>
        </div>

        <div className="detail-offer-badge">
          <span className="offer-tag-icon" aria-hidden="true">%</span>
          <span>{offers}</span>
        </div>

        <div className="detail-description-block">
          <p className="detail-description-text">{description}</p>
        </div>

        {/* Superimpose & Share Call-to-action */}
        <div className="detail-actions-footer">
          <div className="share-guidance">
            <span className="guidance-icon" aria-hidden="true">✨</span>
            <p>Drag the Fastor logo on the photo above to reposition, then share!</p>
          </div>
          <ShareButton
            imageSrc={imgSrc}
            restaurantName={name}
            overlayBounds={overlayBounds}
          />
        </div>
      </div>
    </div>
  );
}
