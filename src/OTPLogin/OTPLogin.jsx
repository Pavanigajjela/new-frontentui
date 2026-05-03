import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function OTPLogin() {

  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const verifyOTP = () => {

    if (otp === "123456") {
      navigate("/home");
    } else {
      alert("Invalid OTP");
    }

  };

  return (
    <div style={{ textAlign: "center", marginTop: "120px" }}>

      <h2>OTP Verification</h2>

      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e)=>setOtp(e.target.value)}
      />

      <br /><br />

      <button onClick={verifyOTP}>
        Verify OTP
      </button>

    </div>
  );
}

export default OTPLogin;