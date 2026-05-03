// App.jsx
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./Login/LoginPage";
import Signup from "./Signup/Signup";
import SendOTP from "./OTP/SendOTP";
import VerifyOTP from "./OTP/RegisterVerifyOTP"; // Email verification after signup
import ForgotPassword from "./Login/ForgotPassword";
import ResetPassword from "./Reset/ResetPassword";
import LandingPage from "./LandingPage";
import LoginWithOTP from "./Login/LoginWithOTP"; // Verify Login OTP
import Profile from "./pages/Profile"; // User profile management
import ErrorBoundary from "./components/ErrorBoundary"; // Error handling
import ProtectedRoute from "./components/ProtectedRoute"; // Route protection
import EditProfile from './pages/EditProfile';


import ListDevice from "./pages/ListDevice";
import "./App.css";

function App() {

  useEffect(() => {
    const cursor = document.querySelector(".cursor");

    const moveCursor = (e) => {
      if(cursor){
        cursor.style.left = e.clientX + "px";
        cursor.style.top = e.clientY + "px";
      }
    };

    window.addEventListener("mousemove", moveCursor);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
    };
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="cursor"></div>
        <Routes>
          {/* ===== LANDING PAGE (Main Entry Point) ===== */}
          <Route path="/" element={<LandingPage />} />
          
          {/* ===== SIGNUP FLOW ===== */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          
          {/* ===== LOGIN FLOW ===== */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* ===== LOGIN WITH OTP FLOW ===== */}
          <Route path="/send-otp" element={<SendOTP />} />
          <Route path="/verify-login-otp" element={<LoginWithOTP />} />
          
          {/* ===== PASSWORD RECOVERY FLOW ===== */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          
          {/* ===== USER PROFILE (PROTECTED ROUTE) ===== */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          

// Add this route
<Route 
  path="/devices" 
  element={
    <ProtectedRoute>
      <ListDevice />
    </ProtectedRoute>
  } 
/>
          
         
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;