import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RESTAURANT_DEFAULTS, FALLBACK_RESTAURANT_IMAGE } from '../utils/constants';

export default function RestaurantCard({ restaurant, variant = 'list' }) {
  const navigate = useNavigate();
  const [imgSrc, setImgSrc] = useState(restaurant.logo || FALLBACK_RESTAURANT_IMAGE);

  // Address fallback when API returns string "null", actual null, or empty
  const rawAddress = restaurant.address_complete;
  const address =
    rawAddress && rawAddress !== 'null' && rawAddress.trim() !== ''
      ? rawAddress
      : RESTAURANT_DEFAULTS.address;

  const name = restaurant.restaurant_name || 'Restaurant';
  const cuisines = RESTAURANT_DEFAULTS.cuisine;
  const rating = RESTAURANT_DEFAULTS.rating;
  const cost = RESTAURANT_DEFAULTS.costForTwo;
  const offers = RESTAURANT_DEFAULTS.offers;

  const handleClick = () => {
    navigate(`/restaurant/${restaurant.restaurant_id}`, {
      state: { restaurant },
    });
  };

  const handleImageError = () => {
    if (imgSrc !== FALLBACK_RESTAURANT_IMAGE) {
      setImgSrc(FALLBACK_RESTAURANT_IMAGE);
    }
  };

  if (variant === 'horizontal') {
    return (
      <div
        className="taste-card"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        data-testid={`taste-card-${restaurant.restaurant_id}`}
      >
        <div className="taste-image-wrapper">
          <img
            src={imgSrc}
            alt={name}
            onError={handleImageError}
            className="taste-image"
            loading="lazy"
          />
        </div>
        <div className="taste-info">
          <h4 className="taste-name">{name}</h4>
          <p className="taste-area">{address.split(',')[0] || 'Connaught Place'}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="restaurant-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      data-testid={`restaurant-card-${restaurant.restaurant_id}`}
    >
      <div className="card-thumb-wrapper">
        <img
          src={imgSrc}
          alt={name}
          onError={handleImageError}
          className="card-thumb"
          loading="lazy"
        />
      </div>
      <div className="card-details">
        <div className="card-header-row">
          <h3 className="card-name">{name}</h3>
        </div>
        <p className="card-cuisines">{cuisines}</p>
        <p className="card-address">{address}</p>
        <div className="card-offers">
          <span className="card-offer-icon" aria-hidden="true">%</span>
          <span>{offers}</span>
        </div>
        <div className="card-footer-row">
          <div className="card-rating">
            <span className="star-icon" aria-hidden="true">★</span>
            <span className="rating-value">{rating}</span>
            <span className="rating-label">Popularity</span>
          </div>
          <div className="card-cost">{cost}</div>
        </div>
      </div>
    </div>
  );
}
