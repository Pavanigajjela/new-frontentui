# Login UI - Complete Workflow Guide

## Overview
This document describes the complete user workflow implemented in the login-ui application with proper API integration.

---

## 🌐 Complete User Journey

### **1. SIGNUP FLOW (Signup → Email Verification → Landing Page)**

```
Landing Page (/)
    ↓
[User clicks "Sign Up"]
    ↓
Signup Page (/signup)
    ├─ User fills form with:
    │  - First Name, Last Name
    │  - Email, Password, Confirm Password
    │  - Mobile Number, Date of Birth
    │  - Profile Photo (optional)
    │  - Additional Details (optional)
    ├─ Clicks "Register" Button
    └─ API: POST /auth/register
        ↓
        [Registration Successful]
        [OTP sent to email]
        ↓
Verify Email OTP (/verify-otp)
    ├─ User enters 6-digit OTP received on email
    ├─ Clicks "Verify Email"
    └─ API: POST /auth/verify-email
        ↓
        [Email Verified Successfully]
        ↓
Landing Page (/) - User is now registered and verified
```

**Key Features:**
- Password strength indicator
- Profile photo upload with validation
- Form validation before submission
- OTP resend functionality (60-second timer)
- Auto-navigate with state passing

---

### **2. LOGIN WITH PASSWORD (Login Page → Landing Page)**

```
Landing Page (/)
    ↓
[User clicks "Login" or navigates to /login]
    ↓
Login Page (/login)
    ├─ User enters:
    │  - Email
    │  - Password
    ├─ Clicks "Login" Button
    └─ API: POST /auth/login/password
        ↓
        [Login Successful]
        ↓
Landing Page (/) - User is authenticated
```

**Key Features:**
- Email and password validation
- Error handling with user-friendly messages
- Redirect to forgot password option

---

### **3. SIGNUP → ALREADY HAVE ACCOUNT (From Signup Page)**

```
Signup Page (/signup)
    ├─ "Already have an account? Login →" button
    └─ Navigates to Login Page (/login)
```

---

### **4. LOGIN WITH OTP FLOW (Send OTP → Verify OTP → Landing Page)**

```
Landing Page (/) / Login Page (/login)
    ↓
[User clicks "Login with OTP"]
    ↓
Send OTP Page (/send-otp)
    ├─ User enters email
    ├─ Clicks "Send OTP" Button
    └─ API: POST /auth/login/otp/request
        ↓
        [OTP sent to email]
        [Auto-navigate after 2 seconds]
        ↓
Verify Login OTP (/verify-login-otp)
    ├─ User enters 6-digit OTP
    ├─ Clicks "Verify OTP"
    └─ API: POST /auth/login/otp/verify
        ↓
        [OTP Verified Successfully]
        [User is logged in]
        ↓
Landing Page (/) - User is authenticated
```

**Key Features:**
- Email validation
- OTP input with individual digit boxes
- Auto-focus between OTP input boxes
- Copy-paste OTP support
- 60-second timer for OTP
- Resend OTP functionality
- Change email option
- Back to password login option

---

## 📡 API Endpoints

| Flow | Method | Endpoint | Body |
|------|--------|----------|------|
| Signup | POST | `/auth/register` | All signup fields (see Signup.jsx) |
| Verify Email | POST | `/auth/verify-email` | `{ email, otp }` |
| Login Password | POST | `/auth/login/password` | `{ email, password }` |
| Request OTP | POST | `/auth/login/otp/request` | `{ email }` |
| Verify OTP | POST | `/auth/login/otp/verify` | `{ email, otp }` |

**Base URL:** `https://matted-ascent-specimen.ngrok-free.dev`

---

## 🗂️ Component Structure

```
src/
├── App.jsx                           (Main routing setup)
├── LandingPage.jsx                   (Entry point - shows after login)
│
├── Signup/
│   ├── Signup.jsx                    (Registration form)
│   └── Signup.css
│
├── Login/
│   ├── LoginPage.jsx                 (Password login)
│   ├── LoginPage.css
│   ├── LoginWithOTP.jsx              (Verify OTP during login)
│   ├── LoginWithOTP.css              (shares VerifyOTP.css)
│   ├── ForgotPassword.jsx            (Optional)
│   ├── ForgotPassword.css
│
├── OTP/
│   ├── SendOTP.jsx                   (Request OTP for login)
│   ├── SendOTP.css
│   ├── RegisterVerifyOTP.jsx         (Email verification after signup)
│   ├── VerifyOTP.css                 (Shared with LoginWithOTP)
│
└── Reset/
    ├── ResetPassword.jsx             (Optional)
    └── ResetPassword.css
```

---

## 📋 Route Configuration

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | LandingPage | Main page (after login) |
| `/signup` | Signup | Registration form |
| `/verify-otp` | RegisterVerifyOTP | Email verification after signup |
| `/login` | LoginPage | Password-based login |
| `/send-otp` | SendOTP | Request OTP for login |
| `/verify-login-otp` | LoginWithOTP | Verify OTP during login |
| `/forgot-password` | ForgotPassword | Password recovery |
| `/reset-password` | ResetPassword | Password reset |

---

## 💾 LocalStorage Keys

| Key | Purpose | Set By |
|-----|---------|--------|
| `userEmail` | User email (signup flow) | Signup, RegisterVerifyOTP |
| `loginEmail` | User email (login flow) | SendOTP |
| `tempUserData` | Full signup form data | Signup |
| `isLoggedIn` | Authentication status | LoginPage, RegisterVerifyOTP, LoginWithOTP |
| `accessToken` | JWT access token | LoginPage, LoginWithOTP, RegisterVerifyOTP |
| `refreshToken` | JWT refresh token | LoginPage, LoginWithOTP |
| `userId` | User ID from API | LoginPage, LoginWithOTP |
| `userData` | Full user data object | LoginPage, LoginWithOTP, RegisterVerifyOTP |

---

## ✅ Form Validations

### **Signup Form**
- ✓ First Name: Required, minimum 1 character
- ✓ Last Name: Required, minimum 1 character
- ✓ Email: Required, valid email format
- ✓ Password: Required, 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
- ✓ Confirm Password: Must match password
- ✓ Mobile: Required, 10+ digits
- ✓ DOB: Required, valid date
- ✓ Profile Photo: Optional, JPEG/PNG/JPG, max 5MB

### **Login Form**
- ✓ Email: Required, valid email format
- ✓ Password: Required, min 1 character

### **OTP Input**
- ✓ Must be exactly 6 digits
- ✓ Auto-advance between input boxes
- ✓ Backspace support for deletion
- ✓ Copy-paste support

---

## 🔒 Security Features

1. **Password Strength Indicator**
   - Visual feedback on password requirements
   - Real-time validation

2. **OTP Verification**
   - Time-based expiry (60 seconds)
   - Resend functionality
   - Attempt tracking

3. **Token Management**
   - Access token & refresh token storage
   - Secure local storage usage

4. **Form Validation**
   - Client-side validation before API calls
   - Email format validation
   - Password strength requirements

---

## 🎨 UI/UX Features

1. **Responsive Design**
   - Works on desktop and mobile
   - S-curve animations on right side

2. **User Feedback**
   - Success messages (green)
   - Error messages (red)
   - Loading states on buttons
   - Disabled state during processing

3. **Navigation**
   - Smooth transitions between pages
   - State passing via React Router
   - Persistent data in localStorage

4. **Accessibility**
   - Keyboard navigation support
   - Enter key support for form submission
   - Focus management for OTP inputs
   - ARIA-friendly components

---

## 🚀 Getting Started

### **1. Install Dependencies**
```bash
npm install
```

### **2. Start Development Server**
```bash
npm run dev
```

### **3. Application Flow**
1. Open http://localhost:5173
2. You'll see the Landing Page
3. Navigate through signup/login flows

---

## 🧪 Testing Checklist

### **Signup Flow**
- [ ] Fill signup form with valid data
- [ ] Verify password strength indicator works
- [ ] Upload profile photo and verify validation
- [ ] Click "Already have an account? Login" → Should go to login page
- [ ] Click "Register" → Should receive OTP email (check API responses)
- [ ] Enter OTP and verify → Should redirect to landing page

### **Login with Password**
- [ ] Enter valid email and password → Should login successfully
- [ ] Enter invalid credentials → Should show error message
- [ ] Click "Create Account" → Should go to signup page
- [ ] Click "Forgot Password?" → Should go to forgot password page
- [ ] Click "Login with OTP" → Should go to send-otp page

### **Login with OTP**
- [ ] Click "Login with OTP" from login page → Goes to send-otp
- [ ] Enter email and click "Send OTP" → Should request OTP
- [ ] Timer should count down 60 seconds
- [ ] Auto-navigate to verify-otp page
- [ ] Enter 6-digit OTP → Should verify and login
- [ ] Click "Resend OTP" after timer expires → Should resend
- [ ] Click "Change Email" → Should go back to send-otp

### **Navigation**
- [ ] From landing page, logout (if implemented) and login again
- [ ] Check localStorage is cleared/updated appropriately
- [ ] All transitions should be smooth without errors in console

---

## ❌ Error Handling

All components handle these error scenarios:
- Network errors (connection issues)
- API errors (invalid credentials, etc.)
- Validation errors (missing fields, invalid format)
- Timeout errors (slow connections)

Error messages display on the UI with appropriate styling:
- **Red background** - Error messages
- **Green background** - Success messages
- **Blue background** - Info messages (OTP email confirmation)

---

## 📞 API Response Format

All APIs return responses in this format:

```json
{
  "success": true/false,
  "message": "Success or error message",
  "data": {
    // Response-specific data
  }
}
```

---

## 🔗 Navigation Flow Summary

```
Landing Page
    ├─→ Signup Flow (Signup → Verify Email → Landing)
    ├─→ Login Flow (Login → Landing)
    └─→ Login OTP Flow (Send OTP → Verify OTP → Landing)
```

---

## 📝 Notes

1. **Email Storage**: Email is stored in localStorage during signup and login flows for passing to the next page
2. **Auto-Navigation**: Some pages auto-navigate after successful operations
3. **CSS Reuse**: LoginWithOTP uses VerifyOTP.css for consistent styling
4. **State Management**: React Router's `useLocation` and `useNavigate` handle state passing
5. **Token Persistence**: Tokens are stored in localStorage for API authentication

---

Last Updated: April 2026
