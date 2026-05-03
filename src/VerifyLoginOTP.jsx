// src/Login/LoginVerifyOTP.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from './services/api';
import './VerifyOTP.css';

const LoginVerifyOTP = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(null);

  useEffect(() => {
    // Get email from sessionStorage (set by LoginWithOTP page)
    const storedEmail = sessionStorage.getItem('loginOtpEmail');
    if (!storedEmail) {
      setMessage({ 
        text: 'Session expired. Please request OTP again.', 
        type: 'error' 
      });
      setTimeout(() => navigate('/send-otp'), 2000);
    } else {
      setEmail(storedEmail);
    }

    // Start countdown timer
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

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
      setMessage({ text: 'Session expired. Please try again.', type: 'error' });
      return;
    }
    
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      // ✅ CORRECT ENDPOINT for LOGIN OTP verification
      const response = await fetch(`${API_BASE_URL}/auth/login/otp/verify`, {
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
          text: 'Login successful! Redirecting...', 
          type: 'success' 
        });
        
        // Store login data
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('userId', data.data.userId);
        
        // Clear session storage
        sessionStorage.removeItem('loginOtpEmail');
        
        setTimeout(() => {
          navigate('/');
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
      console.error('Login OTP verification error:', error);
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
      // ✅ CORRECT ENDPOINT for requesting LOGIN OTP
      const response = await fetch(`${API_BASE_URL}/auth/login/otp/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ 
          text: 'OTP resent successfully! Please check your email.', 
          type: 'success' 
        });
        setTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        
        // Restart timer
        const interval = setInterval(() => {
          setTimer((prevTimer) => {
            if (prevTimer <= 1) {
              clearInterval(interval);
              setCanResend(true);
              return 0;
            }
            return prevTimer - 1;
          });
        }, 1000);
      } else {
        setMessage({ 
          text: data.message || 'Failed to resend OTP. Please try again.', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Resend error:', error);
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
          <h2>Login with OTP</h2>
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
            {loading ? 'Verifying...' : 'Login'}
          </button>

          <div className="footer-links">
            <button onClick={() => navigate('/login')} className="link-btn">
              Back to Password Login
            </button>
            <span className="separator">•</span>
            <button onClick={() => navigate('/send-otp')} className="link-btn">
              Use Different Email
            </button>
          </div>
        </div>

        <div className="verify-right">
          <div className="verify-card">
            <div className="icon">🔐</div>
            <h3>Secure Login</h3>
            <p>Enter the 6-digit code sent to your email</p>
            <ul className="feature-list">
              <li>✓ Secure one-time password</li>
              <li>✓ Valid for 10 minutes</li>
              <li>✓ No password needed</li>
              <li>✓ Instant access</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyLoginOTP;