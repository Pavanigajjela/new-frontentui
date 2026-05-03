import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../services/api';
import "./SendOTP.css";

const SendOTP = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const navigate = useNavigate();

  // Timer for resend OTP
  React.useEffect(() => {
    let interval;
    if (timer > 0 && otpSent && !canResend) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, otpSent, canResend]);

  const handleSendOTP = async () => {
    // Validation
    if (!email.trim()) {
      setMessage({ text: "Please enter your email ❌", type: "error" });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ text: "Please enter a valid email address ❌", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/login/otp/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email: email.trim() }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({
          text: data.message || "OTP sent successfully! ✅",
          type: "success",
        });
        
        // Store email for the next page
        localStorage.setItem("loginEmail", email);
        
        setOtpSent(true);
        setTimer(60);
        setCanResend(false);

        // Auto navigate after 2 seconds
        setTimeout(() => {
          navigate("/verify-login-otp", { state: { email: email } });
        }, 2000);
      } else {
        setMessage({
          text: data.message || "Failed to send OTP. Please try again ❌",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      setMessage({
        text: "Network error. Please check your connection and try again ❌",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || loading) return;

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/login/otp/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email: email.trim() }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({
          text: data.message || "OTP resent successfully! ✅",
          type: "success",
        });
        setTimer(60);
        setCanResend(false);
      } else {
        setMessage({
          text: data.message || "Failed to resend OTP ❌",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      setMessage({
        text: "Network error. Please try again ❌",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading && !otpSent) {
      handleSendOTP();
    }
  };

  return (
    <div className="send-wrapper">
      <div className="send-container">
        {/* LEFT */}
        <div className="send-left">
          <h2>Login with OTP</h2>

          {!otpSent ? (
            <>
              <p className="subtitle">Enter your email to receive OTP</p>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />

              <button onClick={handleSendOTP} disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </button>

              {message.text && (
                <p
                  className={message.type === "success" ? "success-msg" : "error-msg"}
                >
                  {message.text}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="subtitle">OTP sent to {email}</p>
              <div className="email-info">
                Please check your email for the OTP
              </div>

              <div className="timer-section">
                {!canResend ? (
                  <p className="timer-text">
                    Resend OTP in <span>{timer}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="resend-btn"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              {message.text && (
                <p
                  className={message.type === "success" ? "success-msg" : "error-msg"}
                >
                  {message.text}
                </p>
              )}

              <button
                onClick={() => navigate("/verify-login-otp", { state: { email } })}
                className="proceed-btn"
              >
                Proceed to Verification
              </button>
            </>
          )}

          <div className="footer-links">
            <p className="back" onClick={() => navigate("/login")}>
              ← Back to Login
            </p>
            <p className="signup" onClick={() => navigate("/signup")}>
              Don't have an account? Sign up →
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="send-right">
          <div className="send-card">
            <h2>Secure Login 🔐</h2>
            <p>We will send a one-time password (OTP) to your email</p>
            <ul className="benefits">
              <li>✓ Secure and encrypted</li>
              <li>✓ Fast verification</li>
              <li>✓ Easy to use</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendOTP;