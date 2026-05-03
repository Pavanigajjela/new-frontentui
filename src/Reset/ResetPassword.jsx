import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ResetPassword.css";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [strength, setStrength] = useState("");

  const navigate = useNavigate();

  // 🔥 PASSWORD STRENGTH
  const checkStrength = (pass) => {
    let strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    let medium = /^(?=.*[a-z])(?=.*\d).{6,}$/;

    if (strong.test(pass)) return "Strong";
    if (medium.test(pass)) return "Medium";
    return "Weak";
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setStrength(checkStrength(value));
  };

  const handleReset = (e) => {
    e.preventDefault();

    if (strength !== "Strong") {
      setMsg("Use strong password ❌");
      return;
    }

    if (password !== confirm) {
      setMsg("Passwords not matching ❌");
      return;
    }

    setMsg("Password reset successful ✅");

    setTimeout(() => {
      navigate("/");
    }, 1500);
  };

  return (
    <div className="reset-wrapper">
      <div className="reset-container">

        {/* LEFT */}
        <div className="reset-left">
          <h2>Reset Password</h2>

          <form onSubmit={handleReset}>

            {/* PASSWORD */}
            <div className="form-group">
              <label>New Password</label>

              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                required
              />

              {/* 🔥 Strength (only when typing) */}
              {password && (
                <span className={`strength ${strength.toLowerCase()}`}>
                  {strength} Password
                </span>
              )}

              {/* 🔥 RULES (ONLY WHEN USER TYPES) */}
              {password && (
                <div className="password-rules">
                  <p className={password.length >= 8 ? "valid" : "invalid"}>
                    ✔ At least 8 characters
                  </p>

                  <p className={/[A-Z]/.test(password) ? "valid" : "invalid"}>
                    ✔ Uppercase (A-Z)
                  </p>

                  <p className={/[a-z]/.test(password) ? "valid" : "invalid"}>
                    ✔ Lowercase (a-z)
                  </p>

                  <p className={/\d/.test(password) ? "valid" : "invalid"}>
                    ✔ Number (0-9)
                  </p>

                  <p className={/[@$!%*?&]/.test(password) ? "valid" : "invalid"}>
                    ✔ Special character (@$!%*?&)
                  </p>
                </div>
              )}
            </div>

            {/* CONFIRM */}
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            <button type="submit">Reset Password</button>
          </form>

          <p className="back-login" onClick={() => navigate("/")}>
            Back to Login
          </p>

          <p className="msg">{msg}</p>
        </div>

        {/* RIGHT */}
        <div className="reset-right">
          <div className="reset-card">
            <h2>Reset Password</h2>
            <p>Use strong password to continue 🔐</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;