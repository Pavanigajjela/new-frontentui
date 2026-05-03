import React, { useState } from "react";
import "./ForgotPassword.css"; // your CSS file
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Email is required");
      setType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/password/forgot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("OTP sent to your email");
        setType("success");

        // ✅ store email
        localStorage.setItem("resetEmail", email);

        // ✅ navigate to verify OTP page
        setTimeout(() => {
          navigate("/verify-otp", {
            state: { email }
          });
        }, 1500);
      } else {
        setMessage(data.message || "Something went wrong");
        setType("error");
      }
    } catch (error) {
      console.error(error);
      setMessage("Network error. Try again.");
      setType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-wrapper">
      <div className="forgot-container">

        {/* LEFT SIDE */}
        <div className="forgot-left">
          <h2>Forgot Password</h2>

          <div className="flow">
            <span className="active">Email</span> → OTP → Reset
          </div>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>

          {/* MESSAGE */}
          {message && (
            <p className={type === "success" ? "success-msg" : "error-msg"}>
              {message}
            </p>
          )}

          {/* BACK TO LOGIN */}
          <p className="back-login" onClick={() => navigate("/login")}>
            ← Back to Login
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="forgot-right">
          <div className="forgot-card">
            <h2>Reset Your Password 🔐</h2>
            <p>
              Enter your email to receive an OTP and reset your password securely.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;