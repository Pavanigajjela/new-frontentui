# API Workflow Integration - User Profile Management

## Overview
This document describes the complete workflow for connecting the `/users/me` API endpoint with the UI components for user profile management.

---

## API Configuration

### Base URL
```
https://matted-ascent-specimen.ngrok-free.dev
```

**File**: `src/services/api.js`
- Centralized API service module
- Handles all HTTP requests with proper authentication
- Manages error handling and response formatting

---

## API Endpoints

### 1. Get User Profile
**Endpoint**: `GET /users/me`

**Service Method**: `userAPI.getProfile()`

**Location**: `src/services/api.js` (lines 127-147)

```javascript
getProfile: async () => {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return await handleResponse(response, "/users/me");
}
```

**Requirements**:
- Valid authentication token in `localStorage.accessToken`
- Bearer token in Authorization header

**Response Format**:
```javascript
{
  success: true,
  statusCode: 200,
  message: "Success",
  data: {
    firstName: string,
    lastName: string,
    email: string,
    mobile: string,
    dob: string,
    city: string,
    state: string,
    country: string,
    organization: string,
    profilePhoto: string (URL)
  }
}
```

---

### 2. Update User Profile
**Endpoint**: `PUT /users/me`

**Service Method**: `userAPI.updateProfile(profileData)`

**Location**: `src/services/api.js` (lines 149-167)

```javascript
updateProfile: async (profileData) => {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: "PUT",
    headers: getAuthHeaders(true),
    body: JSON.stringify(profileData),
  });
  return await handleResponse(response, "/users/me");
}
```

**Request Format**:
```javascript
{
  firstName: string (required),
  lastName: string (required),
  mobile: string (optional),
  dob: string (optional),
  city: string (optional),
  state: string (optional),
  country: string (optional),
  organization: string (optional)
}
```

**Response**: Same as Get Profile endpoint

---

### 3. Upload Profile Photo
**Endpoint**: `POST /auth/upload/profile-photo`

**Service Method**: `userAPI.uploadProfilePhoto(file)`

**Location**: `src/services/api.js` (lines 169-195)

```javascript
uploadProfilePhoto: async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await fetch(`${API_BASE_URL}/auth/upload/profile-photo`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return await handleResponse(response, "/auth/upload/profile-photo");
}
```

**Requirements**:
- File type: JPEG, PNG, GIF (validated on client)
- Max file size: 5MB
- Form-data format (not JSON)

---

## UI Components

### Profile View Component
**File**: `src/pages/Profile.jsx`

**Workflow**:
1. Component mounts → Check authentication
2. Call `userAPI.getProfile()` to fetch user data
3. Display profile information in read-only format
4. Option to navigate to edit profile

**Usage**:
```javascript
const response = await userAPI.getProfile();
if (response.success && response.data) {
  setProfile(response.data);
}
```

---

### Edit Profile Component
**File**: `src/pages/EditProfile.jsx` (REFACTORED)

**Workflow**:

#### 1. Load Profile
```javascript
useEffect(() => {
  if (!apiUtils.isAuthenticated()) {
    navigate("/login");
    return;
  }
  loadProfile();
}, [navigate]);

const loadProfile = async () => {
  const response = await userAPI.getProfile();
  if (response.success && response.data) {
    setProfile(response.data);
    localStorage.setItem("userData", JSON.stringify(response.data));
  }
};
```

#### 2. Update Profile
```javascript
const handleSaveChanges = async (e) => {
  e.preventDefault();
  
  const updateData = {
    firstName: profile.firstName.trim(),
    lastName: profile.lastName.trim(),
    mobile: profile.mobile || "",
    dob: profile.dob || "",
    city: profile.city || "",
    state: profile.state || "",
    country: profile.country || "",
    organization: profile.organization || "",
  };

  const response = await userAPI.updateProfile(updateData);
  if (response.success) {
    localStorage.setItem("userData", JSON.stringify(updateData));
    window.dispatchEvent(new Event("profileUpdated"));
    navigate("/profile");
  }
};
```

#### 3. Upload Photo
```javascript
const handlePhotoChange = async (e) => {
  const file = e.target.files[0];
  
  // Validation
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    setMessage({ text: "Invalid file type", type: "error" });
    return;
  }
  
  if (file.size > 5 * 1024 * 1024) {
    setMessage({ text: "File size must be less than 5MB", type: "error" });
    return;
  }

  const response = await userAPI.uploadProfilePhoto(file);
  if (response.success) {
    setProfile(prev => ({ 
      ...prev, 
      profilePhoto: response.data?.photoUrl || response.data 
    }));
  }
};
```

---

## Authentication Flow

### Token Management
Tokens are stored in `localStorage`:
```javascript
localStorage.setItem("accessToken", token);
localStorage.setItem("isLoggedIn", "true");
localStorage.setItem("userData", JSON.stringify(userData));
localStorage.setItem("userEmail", email);
```

### Auth Headers
```javascript
const getAuthHeaders = (includeContentType = true) => {
  const token = localStorage.getItem("accessToken");
  const headers = {};
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }
  
  return headers;
};
```

### Authentication Utility
```javascript
export const apiUtils = {
  isAuthenticated: () => {
    const token = localStorage.getItem("accessToken");
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    return !!token && isLoggedIn;
  },

  clearAuth: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userData");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("refreshToken");
  }
};
```

---

## Error Handling

### Response Format
```javascript
{
  success: boolean,
  statusCode: number,
  message: string,
  data: any | null
}
```

### Common Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Process data |
| 401 | Unauthorized | Clear auth, redirect to login |
| 400 | Bad Request | Display error message |
| 500 | Server Error | Show generic error message |

### Error Handler
```javascript
const handleError = (error) => {
  let friendlyMessage = error.message;
  
  if (error.message === "Failed to fetch") {
    friendlyMessage = "Cannot connect to server. Please check if backend is running.";
  }
  
  return {
    success: false,
    statusCode: 0,
    message: friendlyMessage,
    data: null,
  };
};
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    EditProfile Component                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  useEffect()                                                 │
│     ↓                                                         │
│  loadProfile()                                               │
│     ↓                                                         │
│  userAPI.getProfile()  ──→  GET /users/me  ──→  Backend     │
│     ↓                                                         │
│  setProfile(data)                                            │
│     ↓                                                         │
│  Display Form with user data                                 │
│     ↓                                                         │
│  User edits fields                                           │
│     ↓                                                         │
│  handleSaveChanges()                                         │
│     ↓                                                         │
│  userAPI.updateProfile(data)  ──→  PUT /users/me  ──→ Backend
│     ↓                                                         │
│  Success → Update localStorage → Navigate to /profile        │
│     ↓                                                         │
│  Or handlePhotoChange()                                      │
│     ↓                                                         │
│  userAPI.uploadProfilePhoto()  ──→  POST /upload/  ──→ Backend
│     ↓                                                         │
│  Success → Update preview → Save photo URL                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Best Practices

### 1. Always Check Authentication
```javascript
if (!apiUtils.isAuthenticated()) {
  navigate("/login");
  return;
}
```

### 2. Use API Service Methods
✅ **GOOD**:
```javascript
const response = await userAPI.getProfile();
```

❌ **BAD**:
```javascript
const response = await fetch(`${API_BASE_URL}/users/me`);
```

### 3. Handle All Response States
```javascript
if (response.success) {
  // Handle success
} else if (response.statusCode === 401) {
  // Handle unauthorized
  apiUtils.clearAuth();
  navigate("/login");
} else {
  // Handle other errors
  setMessage({ text: response.message, type: "error" });
}
```

### 4. Update localStorage After Changes
```javascript
localStorage.setItem("userData", JSON.stringify(updatedData));
```

### 5. Dispatch Events for Cross-Component Updates
```javascript
window.dispatchEvent(new Event("profileUpdated"));
```

---

## Testing the API

### Using the Backend Config Page
Navigate to `/backend-config` to test API endpoints directly:
- Test token validity
- Check API connectivity
- Debug response data

### Using Browser DevTools
1. Open Network tab
2. Make profile changes
3. Check request headers include Authorization
4. Verify response status and data

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid/expired token | User needs to login again |
| 400 Bad Request | Invalid field values | Validate form input |
| Cannot connect to server | Backend offline | Check backend status |
| Photo upload fails | File too large/wrong type | Validate file size and type |
| Changes not saving | Network error | Retry the request |

---

## Summary

The refactored EditProfile component now properly:
✅ Uses centralized `userAPI` service methods  
✅ Maintains consistent error handling  
✅ Properly manages authentication tokens  
✅ Updates localStorage on successful changes  
✅ Dispatches events for UI synchronization  
✅ Follows the same pattern as Profile.jsx  
✅ Removes direct fetch() calls for better maintainability  
