import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../api/fastor';
import { isValidPhoneNumber } from '../utils/validation';

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.trim();

    if (!isValidPhoneNumber(cleanPhone)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);

    try {
      await registerUser(cleanPhone);
      navigate('/otp', { state: { phone: cleanPhone } });
    } catch (err) {
      setError(err.message || 'Unable to send code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container screen-auth">
      <div className="auth-content">
        <div className="auth-header">
          <h1 className="auth-title">Enter Your Mobile Number</h1>
          <p className="auth-subtitle">
            We will send you the 4 digit verification code
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="input-group">
            <input
              type="tel"
              id="phone-input"
              className={`text-input ${error ? 'input-error' : ''}`}
              placeholder="Enter Mobile Number"
              value={phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                setPhone(val);
                if (error) setError('');
              }}
              disabled={isLoading}
              maxLength={10}
              aria-label="Mobile Number"
              autoFocus
            />
          </div>

          {error && (
            <div className="form-error-banner" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !phone}
          >
            {isLoading ? 'Sending...' : 'Send Code'}
          </button>
        </form>
      </div>
    </div>
  );
}
