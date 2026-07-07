// src/Admin/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminAuthAPI } from "../services/api";
import "../Login/LoginPage.css";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage("Please fill all fields ❌");
      setIsError(true);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Please enter a valid email address ❌");
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage("");

    const result = await adminAuthAPI.login(email, password);

    if (result.success) {
      setMessage("Admin login successful ✅ Redirecting...");
      setIsError(false);
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } else {
      setMessage(result.message || "Admin login failed ❌ Please check your credentials");
      setIsError(true);
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        {/* LEFT SIDE */}
        <div className="login-left">
          <h2>Admin Login</h2>

          <input
            type="email"
            placeholder="Enter admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />

          <button onClick={handleLogin} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          {message && (
            <p className={isError ? "error-msg" : "success-msg"}>{message}</p>
          )}

          <p className="otp-text" onClick={() => navigate("/login")}>
            Not an admin? Go to user login →
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="login-right">
          <div className="login-info-card">
            <h2>Admin Portal 🔐</h2>
            <p>Sign in with your admin credentials to continue</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
