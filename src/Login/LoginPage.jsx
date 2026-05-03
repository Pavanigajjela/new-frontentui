// src/Login/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL } from '../services/api';
import "./LoginPage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Pre-fill email from navigation state (e.g., from signup verification)
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
    if (location.state?.message) {
      setMessage(location.state.message);
      setIsError(false);
    }
  }, [location]);

  const handleLogin = async () => {
    // Validation
    if (!email || !password) {
      setMessage("Please fill all fields ❌");
      setIsError(true);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Please enter a valid email address ❌");
      setIsError(true);
      return;
    }
    
    setLoading(true);
    setMessage("");
    
    try {
      // API Call
      const response = await fetch(`${API_BASE_URL}/auth/login/password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        }),
      });

      const data = await response.json();
      
      // Debug log to see what the API returns
      console.log("Login Response:", data);

      if (data.success) {
        // FIXED: Handle token from different possible locations in response
        const authToken = data.data?.accessToken || data.data?.token || data.accessToken || data.token;
        
        if (authToken) {
          // Store user data in localStorage with consistent keys
          localStorage.setItem("accessToken", authToken);
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userEmail", email);
          
          // Store refresh token if available
          if (data.data?.refreshToken) {
            localStorage.setItem("refreshToken", data.data.refreshToken);
          }
          
          // Store user ID if available
          if (data.data?.userId || data.data?.user?.id) {
            localStorage.setItem("userId", data.data?.userId || data.data?.user?.id);
          }
          
          // Store user data
          const userData = data.data?.user || data.data || { email: email };
          localStorage.setItem("userData", JSON.stringify(userData));
          
          console.log("✅ Login successful! Token stored:", authToken.substring(0, 20) + "...");
          setMessage("Login Successful ✅ Redirecting...");
          setIsError(false);

          setTimeout(() => {
            navigate("/");
          }, 1500);
        } else {
          console.error("❌ No token found in response:", data);
          setMessage("Login response missing authentication token. Please contact support. ❌");
          setIsError(true);
        }
      } else {
        setMessage(data.message || "Login failed ❌ Please check your credentials");
        setIsError(true);
      }
    } catch (error) {
      console.error("Login error:", error);
      
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        setMessage("Network error ❌ Please check your connection and try again");
      } else {
        setMessage("Login failed ❌ Please try again");
      }
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        {/* LEFT SIDE */}
        <div className="login-left">
          <h2>Login</h2>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />

          <div className="login-options">
            <span onClick={() => navigate("/signup")}>Register</span>
            <span onClick={() => navigate("/forgot-password")}>Forgot Password?</span>
          </div>

          <button onClick={handleLogin} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="login-divider">or</div>

          <button 
            onClick={() => navigate("/send-otp")} 
            className="otp-btn"
            disabled={loading}
          >
            Login with OTP
          </button>

          {message && (
            <p className={isError ? "error-msg" : "success-msg"}>
              {message}
            </p>
          )}

          <p className="otp-text" onClick={() => navigate("/send-otp")}>
            Don't have a password? Use OTP instead →
          </p>
        </div>

        {/* RIGHT SIDE WITH S-CURVE */}
        <div className="login-right">
          <div className="login-info-card">
            <h2>Welcome Back 👋</h2>
            <p>Login to continue your journey</p>

            <button onClick={() => navigate("/signup")}>
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;