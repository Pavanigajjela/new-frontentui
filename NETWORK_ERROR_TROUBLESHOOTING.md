# Network Error: Failed to Fetch - Troubleshooting Guide

## ❌ Problem
You're seeing: **"Network error: Failed to fetch"** on the Profile page

This means the React app cannot reach the backend API server.

---

## ✅ Solutions (Try in Order)

### 1. **Check if Backend Server is Running**

**Windows Command Prompt:**
```batch
netstat -ano | findstr :3000
# or whatever port your backend runs on
```

**If you see nothing** → Backend is NOT running
- Start your backend server
- Go to your backend project folder
- Run: `npm start` or `npm run dev` (depending on your setup)

---

### 2. **Verify ngrok Tunnel is Active**

The current API URL is:
```
https://matted-ascent-specimen.ngrok-free.dev
```

**Check ngrok tunnel status:**
1. Open a terminal where ngrok is running
2. Look for a line like: `Session Status        online`
3. If it says `offline` → Tunnel has disconnected

**Restart ngrok:**
```bash
# Kill previous ngrok process
# For Windows: Find ngrok.exe process and close it, or use:
taskkill /IM ngrok.exe

# Then restart ngrok
ngrok http 3000
# Replace 3000 with your backend's actual port
```

**Get the new URL:**
- Copy the new HTTPS forwarding URL from ngrok terminal
- Update `src/services/api.js` line 1: `const API_BASE_URL = "paste-new-url-here";`

---

### 3. **Test API Endpoint Directly**

**In browser, go to:**
```
https://matted-ascent-specimen.ngrok-free.dev/health
```

Expected responses:
- ✅ Any response (200, 404, etc.) = Server is reachable
- ❌ "Cannot reach server" / timeout = Server is down

---

### 4. **Check Browser Console**

Press `F12` → Go to **Console** tab

Look for error messages like:
- `Failed to fetch` → Network issue or wrong URL
- `CORS error` → Server needs CORS headers configured
- `401 Unauthorized` → Token issue (see step 6)

---

### 5. **Check API URL Configuration**

Open `src/services/api.js` line 1:

```javascript
const API_BASE_URL = "https://matted-ascent-specimen.ngrok-free.dev";
```

Verify:
- ✅ URL format is correct (starts with `https://`)
- ✅ No trailing slash
- ✅ No typos in domain name
- ✅ ngrok URL matches current tunnel

---

### 6. **Verify Authentication Token**

**In Browser Console (F12)**, run:
```javascript
localStorage.getItem("accessToken")
```

Expected:
- ✅ Long JWT token string = Token exists
- ❌ `null` = Not logged in

If token is missing:
1. Go back to home page
2. Login again
3. Return to profile

---

### 7. **Disable Browser Extensions**

Some extensions block API requests:
- Ad blockers
- VPN extensions
- Privacy extensions

**Try disabling them:**
1. Chrome: Menu → Extensions → Toggle off suspicious ones
2. Firefox: Menu → Add-ons → Disable extensions

Refresh page and retry.

---

### 8. **Check Network Connectivity**

**Verify internet connection:**
```bash
ping google.com
# If no response → Internet is down
```

**Verify you can reach the domain:**
```bash
ping matted-ascent-specimen.ngrok-free.dev
# Should get responses
```

---

### 9. **Use Diagnostic Tool in Profile Page**

When you see the error:

1. Click **"Show Diagnostics"** button
2. It will test the API connection automatically
3. Review the diagnostic information:
   - API Base URL
   - Authentication status
   - API connectivity test result

The diagnostics will tell you exactly what's wrong!

---

## 🔄 Complete Restart Procedure

If nothing above works, try a complete restart:

### Backend
```bash
# 1. Stop backend server (Ctrl+C if running)
# 2. Stop ngrok (Ctrl+C)
# 3. Restart backend:
npm start

# 4. In new terminal, restart ngrok:
ngrok http 3000

# 5. Copy new HTTPS URL from ngrok
# 6. Update src/services/api.js with new URL
```

### Frontend
```bash
# 1. Clear browser cache
# - Press Ctrl+Shift+Delete
# - Select "All time"
# - Click "Clear data"

# 2. Stop dev server (Ctrl+C)
# 3. Restart dev server:
npm run dev

# 4. Hard refresh browser:
# - Press Ctrl+Shift+R (or Cmd+Shift+R on Mac)
```

---

## 📋 Debugging Checklist

- [ ] Backend server is running on port 3000 (or configured port)
- [ ] ngrok tunnel is active and shows `online` status
- [ ] ngrok URL is updated in `src/services/api.js`
- [ ] You are logged in (access token exists in localStorage)
- [ ] No browser console errors
- [ ] Network extensions/VPN are disabled
- [ ] Internet connection is active
- [ ] API health endpoint returns response
- [ ] Used "Show Diagnostics" in Profile page

---

## 🆘 Still Not Working?

1. **Check backend logs** - Look for error messages in backend server console
2. **Check ngrok logs** - Look for 401/403/404 errors in ngrok terminal
3. **Try test endpoint** - Use curl or Postman to test API directly:
   ```bash
   curl -X GET https://matted-ascent-specimen.ngrok-free.dev/health \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```
4. **Verify API endpoints** - Make sure backend has `/users/me` route implemented
5. **Check CORS headers** - Backend should return CORS headers in response

---

## 📱 Common Scenarios

### Scenario 1: Just started backend
**Solution:** Wait 5-10 seconds for server to fully start, then refresh

### Scenario 2: ngrok tunnel expired
**Solution:** ngrok free tier tunnels expire after inactivity. Restart ngrok and update URL

### Scenario 3: Backend URL changed
**Solution:** Update `API_BASE_URL` in `src/services/api.js`

### Scenario 4: VPN/Proxy blocking
**Solution:** Disable VPN/proxy and retry

### Scenario 5: Corporate firewall
**Solution:** Test from different network (mobile hotspot)

---

## 💡 Pro Tips

- Keep ngrok terminal open and visible
- Check ngrok logs for API requests being forwarded
- Use browser DevTools Network tab to see actual HTTP requests
- Copy error messages and search them online
- Test with simple endpoint first (like `/health`)
- Use Postman to test API endpoints independently from React

---

**Need more help?**
- Check browser console: `F12` → Console tab
- Use Profile page "Show Diagnostics"
- Review backend server logs
- Verify ngrok tunnel status
