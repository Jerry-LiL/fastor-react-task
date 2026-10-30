import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginWithOtp, registerUser } from '../api/fastor';
import { isValidOtp } from '../utils/validation';
import OtpInput from '../components/OtpInput';

function formatPhone(phone = '') {
  const digits = String(phone).replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export default function Otp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const phone = location.state?.phone || '9818979450';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!isValidOtp(otp)) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }

    setIsVerifying(true);

    try {
      const data = await loginWithOtp(phone, otp);
      if (data && data.token) {
        login(data.token, data);
        navigate('/', { replace: true });
      } else {
        throw new Error('Authentication succeeded but no token was received.');
      }
    } catch (err) {
      setError(err.message || 'Incorrect OTP. Please check and try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (isResending) return;
    setError('');
    setIsResending(true);

    try {
      await registerUser(phone);
      setSecondsLeft(30);
      setOtp('');
    } catch (err) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const formattedTime = `00:${String(secondsLeft).padStart(2, '0')}`;
  const formattedPhone = formatPhone(phone);

  return (
    <div className="page-container screen-auth">
      <div className="auth-top-bar">
        <button
          type="button"
          onClick={() => navigate('/login')}
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
          <h1 className="auth-title">6-digit code</h1>
          <p className="auth-subtitle">
            Please enter the code we've sent to{' '}
            <span className="auth-target-number">+91 {formattedPhone}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="auth-form" noValidate>
          <OtpInput
            length={6}
            value={otp}
            onChange={(val) => {
              setOtp(val);
              if (error) setError('');
            }}
            disabled={isVerifying}
            autoFocus
          />

          <div className="otp-timer-row">
            I didn't receive a code{' '}
            {secondsLeft > 0 ? (
              <span className="otp-timer-count">({formattedTime})</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="resend-btn"
                disabled={isResending}
              >
                {isResending ? 'Resending...' : 'Resend'}
              </button>
            )}
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
              disabled={isVerifying || otp.length !== 6}
            >
              {isVerifying ? 'Verifying...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
