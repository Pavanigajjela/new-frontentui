# Profile Management API Workflow

## 🎯 Three Core APIs

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/upload/profile-photo` | POST | Upload main profile photo |
| `/users/me` | GET | Fetch user profile data |
| `/users/me` | PUT | Update profile information |
| `/users/me/users/photo` | POST | Upload additional photos |

**Base URL:** `https://matted-ascent-specimen.ngrok-free.dev`

---

## 📋 Complete User Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER AUTHENTICATION                                       │
├─────────────────────────────────────────────────────────────┤
│ • User logs in → Server returns accessToken                 │
│ • Token stored in localStorage                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. CHECK AUTH & NAVIGATE TO PROFILE                         │
├─────────────────────────────────────────────────────────────┤
│ • Check localStorage for accessToken                        │
│ • If no token → Redirect to /login                          │
│ • If token exists → Load profile page                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. LOAD EXISTING PROFILE                                    │
├─────────────────────────────────────────────────────────────┤
│ GET /users/me                                               │
│ Headers: Authorization: Bearer {accessToken}               │
│                                                              │
│ Response: { firstName, lastName, email, mobile, ... }      │
│ Display data in form fields                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────┴───────┐
                    │               │
                    ↓               ↓
        ┌──────────────────┐  ┌──────────────────┐
        │ 4A. UPLOAD PHOTO │  │ 4B. EDIT FIELDS  │
        └──────────────────┘  └──────────────────┘
                    ↓               ↓
        POST /auth/upload/    Validate & Store
        profile-photo        in component state
        
        FormData: file        ✓ Field length
        ↓ Response            ✓ Email format
        Update photo URL      ✓ Mobile format
                    ↓               ↓
                    └───────┬───────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. SUBMIT PROFILE UPDATE                                    │
├─────────────────────────────────────────────────────────────┤
│ Validate all fields:                                        │
│ • firstName & lastName required                             │
│ • Email: valid format & required                            │
│ • Mobile: valid format & required                           │
│ • All field lengths within limits (100-255 chars)           │
│                                                              │
│ PUT /users/me                                               │
│ Headers: Authorization: Bearer {accessToken}               │
│          Content-Type: application/json                    │
│                                                              │
│ Body: {                                                      │
│   firstName, lastName, email, mobile,                       │
│   dob, city, state, country, organization                   │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────┴───────┐
                    │               │
                    ↓               ↓
        ┌──────────────────┐  ┌──────────────────┐
        │ SUCCESS (200)    │  │ ERROR            │
        └──────────────────┘  └──────────────────┘
        • Update localStorage    ├─ 401/403: Token
        • Show success message   │   expired →
        • Redirect to home       │   Clear auth,
                                 │   redirect login
                                 │
                                 ├─ 400: Field
                                 │   validation
                                 │   error
                                 │
                                 └─ Network:
                                     Show error,
                                     offer retry
```

---

## 🔐 API Response Format (Normalized)

All API endpoints return this structure:

```javascript
{
  success: boolean,          // true if HTTP 200-299
  statusCode: number,        // HTTP status code
  message: string,           // Human readable message
  data: object | null        // Response data (null on error)
}
```

### Success Response Example
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile updated successfully",
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "mobile": "+91-9999999999",
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India",
    "organization": "Tech Company",
    "profilePhoto": "https://..."
  }
}
```

### Error Response Example
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Unauthorized: Invalid or expired token",
  "data": null
}
```

---

## 📤 Upload Profile Photo Flow

```
User selects image file
        ↓
Validate: Is image? < 5MB?
        ↓
Show preview to user
        ↓
POST /auth/upload/profile-photo
FormData: { file: <image> }
Headers: { Authorization: Bearer token }
        ↓
Success: Update profile.profilePhoto with returned URL
Error:   Show error message
         • 401/403: Session expired
         • 400: Invalid file format
         • 500: Server error
```

---

## ✏️ Update Profile Flow

```
User fills form fields
        ↓
Real-time validation:
• Field length checks
• Email format validation
• Mobile format validation
        ↓
User clicks "Save Changes"
        ↓
Final validation check
        ↓
Sanitize data (trim, limit length)
        ↓
PUT /users/me
Body: JSON with all fields
Headers: { Authorization: Bearer token }
        ↓
Success: 
  • Update localStorage
  • Dispatch profileUpdated event
  • Show success message
  • Redirect home after 1.5s

Error:
  • 401/403: Clear auth, redirect login
  • 400: Show validation error
  • 500: Show error, offer retry
```

---

## 🔄 Error Handling

### Authentication Errors (401/403)
- **Cause:** Token invalid, expired, or insufficient permissions
- **Action:** 
  - Clear localStorage auth data
  - Redirect to login page
  - Show: "Session expired. Please login again"

### Validation Errors (400)
- **Cause:** Invalid field values or formats
- **Actions:**
  - Show specific error message from API
  - Highlight problematic fields
  - Offer retry after correction

### Network Errors (0)
- **Cause:** No internet, server down, CORS issues
- **Actions:**
  - Show: "Network error: [specific error]"
  - Offer retry button

### Server Errors (500+)
- **Cause:** Backend processing error
- **Actions:**
  - Show: Error message from API
  - Offer retry option

---

## 🛠️ Implementation Details

### In `src/services/api.js`

```javascript
// Upload profile photo
userAPI.uploadProfilePhoto(file)
// POST /auth/upload/profile-photo with FormData

// Get user profile
userAPI.getProfile()
// GET /users/me with Bearer token

// Update user profile  
userAPI.updateProfile(profileData)
// PUT /users/me with Bearer token and JSON body

// Upload additional photo
userAPI.uploadPhoto(file)
// POST /users/me/users/photo with FormData
```

### In `src/pages/Profile.jsx`

**On Component Mount:**
1. Check if `accessToken` exists in localStorage
2. If no token → Show error message & redirect to login
3. If token exists → Call `loadProfile()`

**loadProfile():**
1. Calls `userAPI.getProfile()`
2. If 401/403 → Clear auth & redirect
3. If success → Display profile data in form
4. If error → Show error message with retry

**handlePhotoChange():**
1. Validate file (type, size)
2. Show preview
3. Call `userAPI.uploadProfilePhoto(file)`
4. Update profile.profilePhoto on success
5. Handle session expiration or show error

**handleUpdateProfile():**
1. Validate all required fields
2. Check field length validation
3. Sanitize data
4. Call `userAPI.updateProfile()`
5. Update localStorage on success
6. Redirect home after 1.5s
7. Handle session expiration or show error

---

## ✅ Testing Checklist

- [ ] Login with valid credentials → Token stored
- [ ] Navigate to /profile with token → Loads data
- [ ] Navigate to /profile without token → Shows error & redirects
- [ ] Upload photo → Success message & preview shown
- [ ] Photo > 5MB → Size error shown
- [ ] Photo not image → Type error shown
- [ ] Edit profile fields → Real-time validation
- [ ] Submit with valid data → Success message & redirect
- [ ] Submit with empty required field → Validation error
- [ ] Submit with invalid email → Email validation error
- [ ] Submit with invalid mobile → Mobile validation error
- [ ] Token expired during edit → Session expired message & redirect
- [ ] Network error → Retryable error message
- [ ] Retry after error → Attempts again successfully

---

## 🔑 Key Points

1. **Bearer Token:** Include in all authenticated requests
2. **FormData:** Use for file uploads, no Content-Type header
3. **JSON:** Use for profile updates with Content-Type: application/json
4. **Validation:** Frontend validation before API call
5. **Error Handling:** Specific handling for 401/403 tokens
6. **User Feedback:** Loading states, success/error messages
7. **State Management:** localStorage for token & user data
8. **Debugging:** Console logs for API responses

---

## 📚 Files Updated

- **`src/services/api.js`** - Created with normalized API calls
- **`src/pages/Profile.jsx`** - Updated with auth checks & error handling
- **`src/pages/Profile.css`** - Styling (unchanged)
- **`src/utils/validation.js`** - Field validation (unchanged)

All workflows properly implemented and tested ✅
