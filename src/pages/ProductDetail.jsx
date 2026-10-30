import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getItemById } from '../data/menu';
import { calculateItemTotal, formatPrice } from '../utils/price';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const item = getItemById(id);

  const [qty, setQty] = useState(1);
  const defaultPortion =
    item?.portions && item.portions.length > 0 ? item.portions[0] : null;
  const [selectedPortion, setSelectedPortion] = useState(defaultPortion);

  if (!item) {
    return (
      <div className="page-container item-not-found-screen">
        <div className="not-found-card">
          <h2 className="not-found-title">Item not found</h2>
          <p className="not-found-desc">
            The item you requested does not exist in our menu.
          </p>
          <Link to="/" className="btn btn-primary not-found-btn">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const portionExtra = selectedPortion?.extra || 0;
  const runningTotal = calculateItemTotal(item.price, portionExtra, qty);

  const handleDecrement = () => {
    setQty((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setQty((prev) => Math.min(20, prev + 1));
  };

  const handleAddToCart = () => {
    const cartEntry = {
      id: item.id,
      name: item.name,
      portion: selectedPortion?.id || 'standard',
      portionName: selectedPortion?.name || 'Standard',
      qty,
      total: runningTotal,
    };

    addToCart(cartEntry);
    showToast(`Added to cart · ${formatPrice(runningTotal)}`);
  };

  return (
    <div className="page-container screen-product-detail">
      {/* Hero Image with overlaid subtle orange back arrow */}
      <div className="detail-hero-wrapper">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="detail-back-btn"
          aria-label="Back"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FF5701"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        <img
          src={item.image}
          alt={item.name}
          className="detail-hero-img"
        />
      </div>

      <div className="detail-content">
        {/* Divider */}
        <div className="detail-divider" />

        {/* Unit Price and Stepper Row */}
        <div className="price-stepper-row">
          <span className="detail-unit-price">
            {formatPrice(item.price)}
          </span>

          <div className="qty-stepper" role="group" aria-label="Quantity stepper">
            <button
              type="button"
              className="qty-circle-btn"
              onClick={handleDecrement}
              disabled={qty <= 1}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="qty-value" aria-live="polite">
              {qty}
            </span>
            <button
              type="button"
              className="qty-circle-btn"
              onClick={handleIncrement}
              disabled={qty >= 20}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="detail-divider" />

        {/* Item Title and Description */}
        <div className="item-info-block">
          <h1 className="item-detail-title">{item.name}</h1>
          <p className="item-detail-desc">{item.description}</p>
        </div>

        {/* Portion selection */}
        {item.portions && item.portions.length > 0 && (
          <div className="portion-block">
            <h2 className="portion-heading">Personal portion</h2>

            <div
              className="portion-list"
              role="radiogroup"
              aria-label="Portion size"
            >
              {item.portions.map((option) => {
                const isSelected = selectedPortion?.id === option.id;
                const formattedDiff =
                  option.extra > 0
                    ? `+${formatPrice(option.extra).replace('₹', '₹')}`
                    : `${formatPrice(0)}`;

                return (
                  <label
                    key={option.id}
                    className="portion-row"
                    onClick={() => setSelectedPortion(option)}
                  >
                    <span className="portion-label">{option.name}</span>
                    <span className="portion-leader-line" aria-hidden="true" />
                    <span className="portion-extra-price">{formattedDiff}</span>

                    <span
                      className={`portion-radio ${
                        isSelected ? 'radio-selected' : ''
                      }`}
                      aria-checked={isSelected}
                      role="radio"
                    >
                      {isSelected && <span className="radio-inner-dot" />}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Pinned Bottom Add to Cart */}
      <div className="detail-bottom-pinned">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleAddToCart}
        >
          Add to cart · {formatPrice(runningTotal)}
        </button>
      </div>
    </div>
  );
}
