import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  BEST_SELLERS,
  PROMO_SLIDES,
  INITIAL_POPULAR_ORDERS,
} from '../data/menu';
import { formatPrice } from '../utils/price';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [orders, setOrders] = useState(INITIAL_POPULAR_ORDERS);
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef(null);

  const userName = user?.user_name || 'Karan';

  const handleCancelOrder = (orderId) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this order?'
    );
    if (confirmed) {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, cancelled: true } : order
        )
      );
    }
  };

  const handleTrackDriver = () => {
    showToast("Driver tracking isn't available in this demo");
  };

  const handleWalletClick = () => {
    showToast('Wallet coming soon');
  };

  const handleScroll = (e) => {
    const { scrollLeft, clientWidth } = e.currentTarget;
    if (clientWidth > 0) {
      const idx = Math.round(scrollLeft / clientWidth);
      setActiveSlide(idx);
    }
  };

  const scrollToSlide = (idx) => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: idx * carouselRef.current.clientWidth,
        behavior: 'smooth',
      });
      setActiveSlide(idx);
    }
  };

  return (
    <div className="page-container screen-home">
      {/* Top Location Bar */}
      <header className="home-top-header">
        <span className="location-label">Current Locations</span>
        <h2 className="location-heading">Model Town, New Delhi</h2>
      </header>
      <div className="header-divider" />

      <div className="home-content">
        {/* User Card & Action Buttons */}
        <div className="user-action-row">
          <div className="user-greeting-card">
            <span className="user-name-text">{userName}</span>
          </div>

          <div className="user-action-buttons">
            <a
              href="tel:1800123456"
              className="action-btn action-call-btn"
              aria-label="Call"
              title="Call"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </a>

            <button
              type="button"
              onClick={handleWalletClick}
              className="action-btn action-wallet-btn"
              aria-label="Wallet"
              title="Wallet"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Best Seller Section */}
        <section className="home-section best-seller-section">
          <h2 className="section-title">Best Seller</h2>
          <div className="best-seller-row" role="region" aria-label="Best Sellers">
            {BEST_SELLERS.map((item) => (
              <div
                key={item.id}
                className="best-seller-tile"
                onClick={() => navigate(`/item/${item.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(`/item/${item.id}`);
                  }
                }}
                aria-label={`${item.name} - ${formatPrice(item.price)}`}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="best-seller-img"
                  loading="lazy"
                />
                <span className="tile-price-tag">
                  {formatPrice(item.price)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Promo Carousel */}
        <section className="promo-carousel-section" aria-label="Special Offers">
          <div
            className="promo-carousel-track"
            ref={carouselRef}
            onScroll={handleScroll}
          >
            {PROMO_SLIDES.map((slide) => (
              <div
                key={slide.id}
                className="promo-card"
                onClick={() => navigate(`/item/${slide.itemId}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(`/item/${slide.itemId}`);
                  }
                }}
              >
                <div className="promo-card-left">
                  <div className="promo-ring promo-ring-top" aria-hidden="true" />
                  <div className="promo-ring promo-ring-bottom" aria-hidden="true" />
                  <p className="promo-sub">{slide.heading}</p>
                  <h3 className="promo-discount">{slide.discount}</h3>
                </div>
                <div className="promo-card-right">
                  <img
                    src={slide.image}
                    alt="Promo dish"
                    className="promo-img"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="carousel-dots" role="tablist" aria-label="Carousel pagination">
            {[0, 1, 2, 3, 4].map((dotIdx) => {
              const active =
                dotIdx === activeSlide ||
                (activeSlide >= PROMO_SLIDES.length && dotIdx === 0);
              return (
                <button
                  key={dotIdx}
                  type="button"
                  className={`carousel-dot ${active ? 'dot-active' : ''}`}
                  onClick={() => scrollToSlide(dotIdx % PROMO_SLIDES.length)}
                  aria-label={`Slide ${dotIdx + 1}`}
                  aria-selected={active}
                  role="tab"
                />
              );
            })}
          </div>
        </section>

        {/* Popular Items Section */}
        <section className="home-section popular-items-section">
          <h2 className="section-title">Popular Items</h2>

          <div className="order-items-list">
            {orders.map((order, idx) => (
              <React.Fragment key={order.id}>
                <div className="order-row">
                  <img
                    src={order.image}
                    alt={order.name}
                    className="order-img"
                    onClick={() => navigate(`/item/${order.itemId}`)}
                    style={{ cursor: 'pointer' }}
                  />

                  <div className="order-details">
                    <div className="order-meta-line">
                      <span
                        className="order-item-name"
                        onClick={() => navigate(`/item/${order.itemId}`)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            navigate(`/item/${order.itemId}`);
                          }
                        }}
                      >
                        {order.name}
                      </span>
                      <span className="order-price">
                        {formatPrice(order.price)}
                      </span>
                    </div>

                    <div className="order-sub-line">
                      <span className="order-date">{order.date}</span>
                      <span className="order-count">{order.itemCountText}</span>
                    </div>

                    <div className="order-actions-row">
                      {order.cancelled ? (
                        <span className="pill-btn pill-cancelled">
                          Cancelled
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="pill-btn pill-cancel"
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          Cancel Order
                        </button>
                      )}

                      <button
                        type="button"
                        className="pill-btn pill-track"
                        onClick={handleTrackDriver}
                      >
                        Track Driver
                      </button>
                    </div>
                  </div>
                </div>
                {idx < orders.length - 1 && (
                  <div className="order-divider" />
                )}
              </React.Fragment>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
