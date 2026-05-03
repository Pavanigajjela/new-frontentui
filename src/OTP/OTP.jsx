import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./OTP.css";

const OTP = () => {

  const [email, setEmail] = useState("");
  const [showOTP, setShowOTP] = useState(false);

  const [otp, setOtp] = useState(["","","","","",""]);
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(30);

  const inputs = useRef([]);
  const navigate = useNavigate();

  /* TIMER */
  useEffect(() => {
    if (timer > 0 && showOTP) {
      const countdown = setTimeout(() => {
        setTimer(timer - 1);
      }, 1000);

      return () => clearTimeout(countdown);
    }
  }, [timer, showOTP]);

  /* SEND OTP */
  const handleSendOTP = () => {
    if (!email) {
      setMessage("Enter email first");
      return;
    }

    setMessage("OTP sent to your email ✅");
    setShowOTP(true);
    setTimer(30);
  };

  /* OTP INPUT */
  const handleChange = (value,index) => {

    if(!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if(value && index < 5){
      inputs.current[index+1].focus();
    }
  };

  /* VERIFY OTP */
  const handleVerify = (e) => {

    e.preventDefault();

    const finalOtp = otp.join("");

    if(finalOtp === "704275"){
      setMessage("OTP Verified Successfully ✅");

      setTimeout(()=>{
        navigate("/home");
      },1000);

    }else{
      setMessage("Invalid OTP ❌");
    }
  };

  return (

    <div className="otp-wrapper">

      <div className="otp-container">

        <h2>Login with OTP</h2>

        {/* EMAIL INPUT */}
        {!showOTP && (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
            />

            <button onClick={handleSendOTP}>
              Send OTP
            </button>
          </>
        )}

        {/* OTP INPUT */}
        {showOTP && (
          <form onSubmit={handleVerify}>

            <div className="otp-inputs">
              {otp.map((data,index)=>(
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={data}
                  ref={(el)=>inputs.current[index]=el}
                  onChange={(e)=>handleChange(e.target.value,index)}
                />
              ))}
            </div>

            <button type="submit">
              Verify OTP
            </button>

            {timer > 0 ? (
              <p className="otp-timer">
                OTP expires in: {timer}s
              </p>
            ) : (
              <p className="otp-expired">
                OTP Expired. Resend again
              </p>
            )}

          </form>
        )}

        {/* MESSAGE */}
        {message && <p className="message">{message}</p>}

        {/* BACK TO LOGIN */}
        <p className="back-login" onClick={()=>navigate("/")}>
          Login with Email / Password
        </p>

      </div>

    </div>
  );
};

export default OTP;