// src/Login/LoginWithOTP.jsx - Verify OTP during Login
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';
import { setProfilePhoto } from '../utils/profilePhoto';
import '../OTP/VerifyOTP.css'; // reuse OTP verification CSS

const LoginWithOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Get email from navigation state or localStorage
  useEffect(() => {
    const stateEmail = location.state?.email;
    const storageEmail = localStorage.getItem('loginEmail');
    const userEmail = stateEmail || storageEmail;
    
    if (userEmail) {
      setEmail(userEmail);
    } else {
      setMessage({ 
        text: 'Email not found. Please go back to send OTP.', 
        type: 'error' 
      });
      setTimeout(() => navigate('/send-otp'), 2000);
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
      setMessage({ text: 'Email not found. Please try again.', type: 'error' });
      return;
    }
    
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
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
          text: data.message || 'OTP verified successfully! Logging in...', 
          type: 'success' 
        });
        
        // Store user info and auth data
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        
        if (data.data?.accessToken) {
          localStorage.setItem('accessToken', data.data.accessToken);
        }
        if (data.data?.refreshToken) {
          localStorage.setItem('refreshToken', data.data.refreshToken);
        }
        if (data.data?.userId) {
          localStorage.setItem('userId', data.data.userId);
        }
        
        // Store user data
        if (data.data) {
          localStorage.setItem('userData', JSON.stringify(data.data));
          const photo = data.data.profilePhoto || data.data.user?.profilePhoto;
          if (photo) {
            setProfilePhoto(photo);
          }
        }
        
        // Clear login email from storage
        localStorage.removeItem('loginEmail');
        
        setTimeout(() => {
          navigate('/', { 
            state: { 
              email: email,
              message: 'Login successful! Welcome aboard! 🎉'
            } 
          });
        }, 1500);
        
      } else {
        setMessage({ 
          text: data.message || data.error || 'Invalid OTP. Please try again.', 
          type: 'error' 
        });
        
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
    
    try {
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
          <h2>Verify OTP</h2>
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
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <div className="footer-links">
            <button onClick={() => navigate('/send-otp')} className="link-btn">
              Change Email
            </button>
            <span className="separator">•</span>
            <button onClick={() => navigate('/login')} className="link-btn">
              Login with Password
            </button>
          </div>
        </div>

        <div className="verify-right">
          <div className="verify-card">
            <div className="icon">🔐</div>
            <h3>Login Verification</h3>
            <p>Verify your OTP to login securely!</p>
            <ul className="feature-list">
              <li>✓ Secure authentication</li>
              <li>✓ Real-time verification</li>
              <li>✓ Easy and fast</li>
              <li>✓ Protected account</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginWithOTP;