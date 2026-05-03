# Frontend API Integration Guide

## Overview
This document describes the complete frontend implementation of the authentication and profile management APIs.

## API Endpoints Used

### 1. **Upload Profile Photo**
- **URL**: `https://matted-ascent-specimen.ngrok-free.dev/auth/upload/profile-photo`
- **Method**: POST
- **Headers**: 
  - Authorization: Bearer {accessToken}
  - No Content-Type header (multipart form data)
- **Body**: FormData with file
- **Response**:
  ```json
  {
    "success": true,
    "message": "Profile photo uploaded successfully (512x512)",
    "data": "http://localhost:8080/uploads/a89d0d65-80ff-4f58-839d-dbe050047c83.jpg",
    "timestamp": "2026-02-24T19:49:13.1334657"
  }
  ```

### 2. **Logout**
- **URL**: `https://matted-ascent-specimen.ngrok-free.dev/auth/logout`
- **Method**: POST
- **Headers**: 
  - Authorization: Bearer {accessToken}
  - Content-Type: application/json
- **Body**: Empty or {}
- **Response**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

### 3. **Update Profile**
- **URL**: `https://matted-ascent-specimen.ngrok-free.dev/users/me`
- **Method**: PUT
- **Headers**: 
  - Authorization: Bearer {accessToken}
  - Content-Type: application/json
- **Body**:
  ```json
  {
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
  ```

### 4. **Get Profile**
- **URL**: `https://matted-ascent-specimen.ngrok-free.dev/users/me`
- **Method**: GET
- **Headers**: 
  - Authorization: Bearer {accessToken}
  - Content-Type: application/json

## File Structure

```
src/
├── services/
│   └── api.js                 # Centralized API service file
├── pages/
│   ├── Profile.jsx            # Profile management page
│   └── Profile.css            # Profile page styles
├── App.jsx                    # Updated with Profile route
└── LandingPage.jsx            # Updated with logout logic
```

## Implementation Details

### 1. API Service File (`src/services/api.js`)

This file contains all API endpoints organized in modules:

#### `authAPI.logout()`
```javascript
import { authAPI } from './services/api';

const response = await authAPI.logout();
```

#### `userAPI.updateProfile(profileData)`
```javascript
import { userAPI } from './services/api';

const response = await userAPI.updateProfile({
  firstName: "John",
  lastName: "Doe",
  // ... other fields
});
```

#### `userAPI.uploadProfilePhoto(file)`
```javascript
import { userAPI } from './services/api';

const response = await userAPI.uploadProfilePhoto(file);
```

#### `userAPI.getProfile()`
```javascript
import { userAPI } from './services/api';

const response = await userAPI.getProfile();
```

#### `apiUtils`
Utility functions for auth state management:
```javascript
import { apiUtils } from './services/api';

// Clear auth data on logout
apiUtils.clearAuthData();

// Store auth data after login
apiUtils.storeAuthData(data);

// Check if authenticated
const isAuth = apiUtils.isAuthenticated();

// Get auth token
const token = apiUtils.getAuthToken();
```

### 2. Profile Page (`src/pages/Profile.jsx`)

The Profile component provides:
- **Photo Upload**: Upload and preview profile photo (max 5MB)
- **Personal Information**: Edit first name, last name, email, mobile, DOB
- **Address**: Edit city, state, country
- **Professional**: Edit organization/company

**Features**:
- Form validation
- Photo preview before upload
- Auto-save on photo upload
- Redirect to home after saving
- Error and success notifications
- Responsive design

### 3. LandingPage Updates

Updated with:
- `useNavigate` hook for routing
- `handleLogout()` function that calls API
- Navigation to `/profile` route for profile editing
- Proper auth state management

## Usage Examples

### Example 1: Login Flow (Already Implemented)
```javascript
// User logs in via LoginPage
// accessToken is stored in localStorage
// isLoggedIn state is set to true
```

### Example 2: Edit Profile
```javascript
// User clicks "Edit Profile" in the dropdown menu
// Navigates to /profile route
// Profile component loads existing profile using userAPI.getProfile()
// User edits fields and clicks "Save Changes"
// userAPI.updateProfile() is called
// User is redirected to home with success notification
```

### Example 3: Upload Profile Photo
```javascript
// On Profile page, user selects a photo
// Photo preview is shown
// userAPI.uploadProfilePhoto() is called
// Success message displayed with new photo URL
// Photo URL is stored in profile data
```

### Example 4: Logout
```javascript
// User clicks "Logout" in profile dropdown
// handleLogout() calls authAPI.logout()
// Auth data is cleared from localStorage
// User is redirected to home page
// Page is reloaded
```

## Authentication Flow

```
Login
  ↓
Store accessToken in localStorage
  ↓
Include Bearer token in all API requests
  ↓
On Logout
  ↓
Call logout API
  ↓
Clear all auth data
  ↓
Redirect to login
```

## Error Handling

All API calls include error handling:

```javascript
try {
  const response = await userAPI.updateProfile(data);
  
  if (response.success) {
    // Handle success
    setMessage({ text: "Success message", type: "success" });
  } else {
    // Handle API error
    setMessage({ 
      text: response.message || "Default error message", 
      type: "error" 
    });
  }
} catch (error) {
  // Handle network error
  console.error("Error:", error);
  setMessage({ 
    text: "Network error occurred", 
    type: "error" 
  });
}
```

## State Management

The application uses React hooks for state management:

**Profile Component**:
- `loading`: API call in progress
- `photoLoading`: Photo upload in progress
- `message`: Success/error notifications
- `profile`: User profile data
- `photoPreview`: Image preview URL

**LandingPage Component**:
- `isLoggedIn`: Authentication status
- `userName`: Display name
- `userEmail`: User email
- `showProfileMenu`: Profile menu visibility

## LocalStorage Keys

```javascript
localStorage.getItem("isLoggedIn")      // "true" or "false"
localStorage.getItem("userEmail")       // user@example.com
localStorage.getItem("accessToken")     // JWT token
localStorage.getItem("refreshToken")    // Refresh token
localStorage.getItem("userId")          // User ID
localStorage.getItem("userData")        // Full user object (JSON)
```

## Next Steps

1. **Integrate with Backend**: Ensure backend endpoints are working correctly
2. **Test All Flows**: Test login, profile edit, photo upload, and logout
3. **Add Refresh Token**: Implement token refresh logic if needed
4. **Error Boundaries**: Add error boundary component for better error handling
5. **Loading States**: Add proper loading indicators
6. **Validation**: Enhance form validation (password strength, email format, etc.)

## Troubleshooting

### Issue: 401 Unauthorized
- **Cause**: Invalid or expired token
- **Solution**: User needs to login again

### Issue: 403 Forbidden
- **Cause**: User doesn't have permission
- **Solution**: Check user role and permissions

### Issue: Photo upload fails
- **Cause**: File size too large or wrong format
- **Solution**: Show clear validation messages

### Issue: CORS errors
- **Cause**: ngrok API blocked by browser
- **Solution**: Ensure ngrok URL is accessible, check browser console

## Best Practices

1. ✅ Always include Bearer token in headers
2. ✅ Clear sensitive data on logout
3. ✅ Validate user input before sending
4. ✅ Show loading states during API calls
5. ✅ Handle errors gracefully
6. ✅ Redirect unauthorized users to login
7. ✅ Use FormData for file uploads
8. ✅ Store tokens securely (never in URL)
