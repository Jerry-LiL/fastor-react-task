import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginWithOtp, registerUser } from '../api/fastor';
import { isValidOtp } from '../utils/validation';
import OtpInput from '../components/OtpInput';

export default function Otp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const phone = location.state?.phone || '9818979450';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [resendStatus, setResendStatus] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setResendStatus('');

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
    setResendStatus('');
    setIsResending(true);

    try {
      await registerUser(phone);
      setResendStatus('Verification code resent successfully!');
      setOtp('');
    } catch (err) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="page-container screen-auth">
      <div className="auth-nav-bar">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="back-icon-btn"
          aria-label="Go back to mobile number screen"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
      </div>

      <div className="auth-content">
        <div className="auth-header">
          <h1 className="auth-title">OTP Verification</h1>
          <p className="auth-subtitle">
            Enter the verification code we just sent on your Mobile Number.
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
          />

          {error && (
            <div className="form-error-banner" role="alert">
              {error}
            </div>
          )}

          {resendStatus && (
            <div className="form-success-banner" role="status">
              {resendStatus}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isVerifying || otp.length < 6}
          >
            {isVerifying ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="resend-text">
            Didn't received code?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="link-button"
            >
              {isResending ? 'Resending...' : 'Resend'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
