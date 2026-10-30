import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../api/fastor';
import { isValidPhoneNumber } from '../utils/validation';

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [phoneDigits, setPhoneDigits] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    }
  };

  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    setPhoneDigits(digits);
    if (error) setError('');
  };

  const displayValue =
    phoneDigits.length > 5
      ? `${phoneDigits.slice(0, 5)} ${phoneDigits.slice(5)}`
      : phoneDigits;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidPhoneNumber(phoneDigits)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);

    try {
      await registerUser(phoneDigits);
      navigate('/otp', { state: { phone: phoneDigits } });
    } catch (err) {
      setError(err.message || 'Unable to send code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isComplete = phoneDigits.length === 10;

  return (
    <div className="page-container screen-auth">
      <div className="auth-top-bar">
        <button
          type="button"
          onClick={handleBack}
          className="back-arrow-btn"
          aria-label="Back"
        >
          <svg
            width="22"
            height="22"
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
      </div>

      <div className="auth-body">
        <div className="auth-header">
          <h1 className="auth-title">Sign Up to Fastor</h1>
          <p className="auth-subtitle">
            Let us know your mobile number and we will send you an OTP for
            verification.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div
            className={`phone-input-composite ${
              error ? 'composite-error' : ''
            }`}
          >
            <span className="phone-prefix">+91</span>
            <span className="phone-caret" aria-hidden="true" />
            <input
              type="tel"
              inputMode="numeric"
              id="phone-input"
              className="phone-input-field"
              placeholder="00000 00000"
              value={displayValue}
              onChange={handlePhoneChange}
              disabled={isLoading}
              maxLength={11}
              aria-label="Mobile Number"
              autoFocus
            />
          </div>

          {error && (
            <div className="form-error-banner" role="alert">
              {error}
            </div>
          )}

          <div className="auth-bottom-pinned">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !isComplete}
            >
              {isLoading ? 'Sending...' : 'Get OTP'}
            </button>

            <p className="terms-notice">
              By clicking, I accept the{' '}
              <span className="terms-bold">Terms &amp; Conditions</span> and{' '}
              <span className="terms-bold">Privacy Policy</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
