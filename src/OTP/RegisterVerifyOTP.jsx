// src/Register/RegisterVerifyOTP.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';
import './VerifyOTP.css';

const RegisterVerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(null);

  // Get email from navigation state or localStorage
  useEffect(() => {
    const stateEmail = location.state?.email;
    const storageEmail = localStorage.getItem('userEmail');
    const tempData = localStorage.getItem('tempUserData');
    let parsedEmail = null;
    
    if (tempData) {
      try {
        const userData = JSON.parse(tempData);
        parsedEmail = userData.email;
      } catch (e) {
        console.error('Error parsing tempUserData:', e);
      }
    }
    
    const userEmail = stateEmail || storageEmail || parsedEmail;
    
    if (userEmail) {
      setEmail(userEmail);
    } else {
      setMessage({ 
        text: 'Email not found. Please register again.', 
        type: 'error' 
      });
      setTimeout(() => navigate('/signup'), 2000);
    }
  }, [location, navigate]);

  // Timer for resend OTP
  useEffect(() => {
    let interval;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);
    
    if (message.type === 'error') {
      setMessage({ text: '', type: '' });
    }
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyPress = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    if (pastedData && /^\d+$/.test(pastedData)) {
      const otpArray = pastedData.slice(0, 6).split('');
      const newOtp = [...otp];
      for (let i = 0; i < otpArray.length; i++) {
        newOtp[i] = otpArray[i];
      }
      setOtp(newOtp);
      setMessage({ text: '', type: '' });
      const lastFilledIndex = Math.min(otpArray.length, 5);
      const lastInput = document.getElementById(`otp-input-${lastFilledIndex}`);
      if (lastInput) lastInput.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setMessage({ text: 'Please enter complete 6-digit OTP', type: 'error' });
      return;
    }
    
    if (!email) {
      setMessage({ text: 'Email not found. Please register again.', type: 'error' });
      return;
    }
    
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim(), 
          otp: otpString 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ 
          text: data.message || 'Email verified successfully! Redirecting to login...', 
          type: 'success' 
        });
        
        // Clear temporary data
        localStorage.removeItem('userEmail');
        localStorage.removeItem('tempUserData');
        
        // Store verification status for login page
        localStorage.setItem('emailVerified', 'true');
        localStorage.setItem('verifiedEmail', email);
        
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              email: email,
              message: 'Email verified successfully! Please login to continue.' 
            } 
          });
        }, 1500);
        
      } else {
        if (data.data?.remainingAttempts !== undefined) {
          setRemainingAttempts(data.data.remainingAttempts);
          setMessage({
            text: `${data.message || 'Invalid OTP'}. ${data.data.remainingAttempts} attempts remaining.`,
            type: 'error'
          });
        } else {
          setMessage({ 
            text: data.message || data.error || 'Invalid OTP. Please try again.', 
            type: 'error' 
          });
        }
        
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => {
          document.getElementById('otp-input-0')?.focus();
        }, 100);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setMessage({ 
        text: 'Network error. Please check your connection.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setLoading(true);
    setMessage({ text: '', type: '' });
    setRemainingAttempts(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ 
          text: data.message || 'OTP resent successfully!', 
          type: 'success' 
        });
        setTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
      } else {
        setMessage({ 
          text: data.message || data.error || 'Failed to resend OTP.', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setMessage({ 
        text: 'Network error. Please try again.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-wrapper">
      <div className="verify-container">
        <div className="verify-left">
          <h2>Verify Email</h2>
          <div className="email-display">
            <p>OTP sent to <strong>{email || 'your email'}</strong></p>
            <small>Please check your spam folder if you don't see the email</small>
          </div>
          
          <div className="otp-label">Enter 6-digit OTP</div>
          <div className="otp-box" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyPress(index, e)}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {remainingAttempts !== null && (
            <div className="attempts-warning">
              ⚠️ {remainingAttempts} attempts remaining
            </div>
          )}

          <div className="timer-section">
            {!canResend ? (
              <p className="timer-text">
                Resend code in <span>{timer}</span> seconds
              </p>
            ) : (
              <button onClick={handleResendOTP} disabled={loading} className="resend-btn">
                Resend OTP
              </button>
            )}
          </div>

          {message.text && (
            <div className={`verify-message ${message.type}`}>
              {message.text}
            </div>
          )}

          <button 
            onClick={handleVerifyOTP} 
            disabled={loading || otp.join('').length !== 6} 
            className={`verify-btn ${loading ? 'loading' : ''}`}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>

          <div className="footer-links">
            <button onClick={() => navigate('/login')} className="link-btn">
              Back to Login
            </button>
            <span className="separator">•</span>
            <button onClick={() => navigate('/signup')} className="link-btn">
              Create New Account
            </button>
          </div>
        </div>

        <div className="verify-right">
          <div className="verify-card">
            <div className="icon">🔐</div>
            <h3>Email Verification</h3>
            <p>Verify your email address to access all features!</p>
            <ul className="feature-list">
              <li>✓ Secure your account</li>
              <li>✓ Access exclusive content</li>
              <li>✓ Get personalized recommendations</li>
              <li>✓ Join community discussions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterVerifyOTP;