# 🚀 Quick Start Guide

This guide will help you test the newly implemented features.

## Prerequisites

- ✅ Node.js installed
- ✅ React project running (`npm run dev`)
- ✅ Backend API endpoints accessible
- ✅ User logged in with valid token

## Testing the Features

### 1. Login First
1. Go to http://localhost:5173/login
2. Enter valid email and password
3. Verify you're redirected to home page
4. Check localStorage for `accessToken`

### 2. Edit Profile (New Feature)
1. Click on your user avatar in the navbar
2. Click "Edit Profile"
3. You should be redirected to `/profile` page
4. The form should auto-load with your existing profile data

### 3. Upload Profile Photo (New Feature)
1. On the profile page, click "Change Photo"
2. Select an image file (JPG, PNG, or GIF)
3. Photo preview should appear
4. Should show "Photo uploaded successfully ✅" message
5. Photo URL is saved to your profile

### 4. Update Profile Information (New Feature)
1. Edit the form fields:
   - First Name
   - Last Name
   - Mobile Number
   - Date of Birth
   - City, State, Country
   - Organization
2. Click "Save Changes"
3. Should show "Profile updated successfully ✅" message
4. Should redirect back to home

### 5. Logout (Updated Feature)
1. Click on your user avatar in the navbar
2. Click "Logout"
3. Should call logout API
4. Should clear all auth data
5. Should redirect to home
6. All tokens should be removed from localStorage

## File Structure

```
src/
├── services/
│   └── api.js                          # API Service (NEW)
├── pages/
│   ├── Profile.jsx                    # Profile Page (NEW)
│   ├── Profile.css                    # Profile Styles (NEW)
│   ├── Cart.jsx
│   ├── CourseDetails.jsx
│   └── Payment.jsx
├── Login/
│   ├── LoginPage.jsx
│   ├── ForgotPassword.jsx
│   └── LoginWithOTP.jsx
├── OTP/
│   ├── SendOTP.jsx
│   └── VerifyOTP.jsx
├── App.jsx                             # UPDATED - Added Profile route
├── LandingPage.jsx                     # UPDATED - Added logout & profile link
└── index.css
```

## Browser DevTools Checklist

### Network Tab
- [ ] Check logout API call to `/auth/logout`
- [ ] Check update profile API call to `/users/me` (PUT)
- [ ] Check upload photo API call to `/auth/upload/profile-photo`
- [ ] All requests have `Authorization: Bearer {token}` header

### Console Tab
- [ ] No JavaScript errors
- [ ] No CORS errors
- [ ] Check for any API error messages

### Application Tab → Storage → localStorage
- [ ] After login:
  ```
  isLoggedIn: "true"
  userEmail: "user@example.com"
  accessToken: "jwt_token_here"
  refreshToken: "refresh_token_here"
  userId: "user_id_here"
  userData: {full user object}
  ```
- [ ] After logout: All above keys should be removed

## Common Issues & Quick Fixes

| Issue | Fix |
|-------|-----|
| "Unauthorized" error | User needs to login again, token might be expired |
| Profile page blank | Check Network tab, see if API returned data |
| Photo upload fails | Check file size (< 5MB), check file format (JPG/PNG/GIF) |
| "Cannot find Profile" | Make sure `/src/pages/Profile.jsx` exists |
| Logout not working | Check Network tab, verify logout API endpoint |

## API Endpoints Reference

### Login (Existing)
```
POST /auth/login/password
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Logout (Updated)
```
POST /auth/logout
Headers: Authorization: Bearer {token}
Response: { "success": true, "message": "Logged out successfully" }
```

### Get Profile (New)
```
GET /users/me
Headers: Authorization: Bearer {token}
Response: { "success": true, "data": { user object } }
```

### Update Profile (New)
```
PUT /users/me
Headers: Authorization: Bearer {token}
Body: {
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "mobile": "+91-9876543210",
  "dob": "1990-01-15",
  "city": "Bangalore",
  "state": "Karnataka",
  "country": "India",
  "organization": "Tech Corp"
}
Response: { "success": true, "data": { updated user object } }
```

### Upload Profile Photo (New)
```
POST /auth/upload/profile-photo
Headers: Authorization: Bearer {token}
Body: FormData { "file": File }
Response: {
  "success": true,
  "message": "Profile photo uploaded successfully (512x512)",
  "data": "http://localhost:8080/uploads/uuid.jpg"
}
```

## Code Examples

### Using the API Service

```javascript
import { authAPI, userAPI, apiUtils } from './services/api';

// Logout
const handleLogout = async () => {
  const response = await authAPI.logout();
  if (response.success) {
    apiUtils.clearAuthData();
    // redirect to login
  }
};

// Get Profile
const loadProfile = async () => {
  const response = await userAPI.getProfile();
  if (response.success) {
    setProfile(response.data);
  }
};

// Update Profile
const handleSave = async (profileData) => {
  const response = await userAPI.updateProfile(profileData);
  if (response.success) {
    // show success message
  }
};

// Upload Photo
const handlePhotoUpload = async (file) => {
  const response = await userAPI.uploadProfilePhoto(file);
  if (response.success) {
    setPhotoUrl(response.data);
  }
};

// Utilities
const isAuth = apiUtils.isAuthenticated();
const token = apiUtils.getAuthToken();
apiUtils.clearAuthData();
apiUtils.storeAuthData(userData);
```

## Performance Tips

1. **Lazy Load Profile**: Only load profile when user visits `/profile`
2. **Cache Profile Data**: Store in state to avoid repeated API calls
3. **Debounce Form Input**: Avoid unnecessary re-renders
4. **Optimize Photo**: Compress before upload
5. **Error Boundaries**: Wrap components in error boundaries

## Security Checklist

- ✅ Token stored in localStorage (consider using secure cookie)
- ✅ Authorization header included in all requests
- ✅ HTTPS only in production
- ✅ Clear sensitive data on logout
- ✅ Validate input on client side
- ✅ Never expose tokens in console/logs
- ✅ Implement CSRF protection

## Next Deployment Steps

Before deploying to production:

1. [ ] Replace ngrok URL with production URL
2. [ ] Update API_BASE_URL in api.js
3. [ ] Implement token refresh logic
4. [ ] Add error boundary component
5. [ ] Add loading skeleton screens
6. [ ] Optimize image uploads
7. [ ] Add analytics tracking
8. [ ] Setup error logging
9. [ ] Test on mobile devices
10. [ ] Performance optimization

## Need Help?

1. Check the detailed documentation in `API_INTEGRATION_GUIDE.md`
2. Review code comments in `src/services/api.js`
3. Check browser console for error messages
4. Review Network tab for API responses
5. Read component code in `src/pages/Profile.jsx`

---

**Happy Testing! 🎉**
