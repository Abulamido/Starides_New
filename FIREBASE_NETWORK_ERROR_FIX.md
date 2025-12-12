# Firebase Network Request Failed - Fix Guide

## Error
```
FirebaseError: Firebase: Error (auth/network-request-failed)
```

## Root Causes

This error occurs when Firebase Auth cannot communicate with Firebase servers. Common causes:

### 1. **Browser/Network Issues** (Most Common)
- Browser extensions blocking requests (ad blockers, privacy extensions)
- Corporate firewall/proxy blocking Firebase domains
- VPN interfering with connections
- Browser privacy settings blocking third-party cookies
- Network connectivity issues

### 2. **Firebase Configuration Issues**
- Incorrect `authDomain` in Firebase config
- Missing or incorrect API keys
- Firebase project not properly set up

### 3. **CORS/Security Policy Issues**
- Content Security Policy blocking Firebase requests
- Missing allowed domains in Firebase console

## Solutions (Try in Order)

### Solution 1: Clear Browser Data & Disable Extensions ⭐ **Try This First**

1. **Clear browser cache and cookies**:
   - Chrome: `Ctrl+Shift+Delete` → Select "Cookies and other site data" and "Cached images and files"
   - Clear data for "All time"
   - Click "Clear data"

2. **Disable browser extensions** (especially ad blockers and privacy extensions):
   - Go to `chrome://extensions/`
   - Disable all extensions temporarily
   - Refresh the page and try logging in again

3. **Try Incognito/Private Mode**:
   - Open an incognito window (`Ctrl+Shift+N`)
   - Navigate to `http://localhost:3000/auth`
   - Try logging in

### Solution 2: Check Network Connectivity

1. **Verify you can reach Firebase servers**:
   ```bash
   # Test if you can reach Firebase Auth domain
   ping studio-2143552053-ccbad.firebaseapp.com
   
   # Or open in browser
   https://studio-2143552053-ccbad.firebaseapp.com
   ```

2. **Check if you're behind a firewall/proxy**:
   - If on corporate network, Firebase might be blocked
   - Try using personal network/mobile hotspot
   - Disable VPN if active

3. **Ensure these Firebase domains are accessible**:
   - `*.firebaseapp.com`
   - `*.googleapis.com`
   - `identitytoolkit.googleapis.com`

### Solution 3: Verify Firebase Configuration

1. **Check Firebase Console**:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select project: `studio-2143552053-ccbad`
   - Go to **Project Settings** → **General**
   - Verify the configuration matches:
     ```
     Project ID: studio-2143552053-ccbad
     Auth Domain: studio-2143552053-ccbad.firebaseapp.com
     API Key: AIzaSyDqtHYc1Jnfscx5X9d4vSFhgRLj8O7GpCA
     ```

2. **Check Authorized Domains**:
   - In Firebase Console → **Authentication** → **Settings** → **Authorized domains**
   - Ensure `localhost` is in the list
   - Add if missing

### Solution 4: Update Firebase Config (If Above Fails)

If the authDomain is incorrect, update `src/firebase/config.ts`:

```typescript
export const firebaseConfig = {
  "projectId": "studio-2143552053-ccbad",
  "appId": "1:347067189449:web:a72f6e514751c827266518",
  "apiKey": "AIzaSyDqtHYc1Jnfscx5X9d4vSFhgRLj8O7GpCA",
  "authDomain": "studio-2143552053-ccbad.firebaseapp.com", // ← Verify this
  "storageBucket": "studio-2143552053-ccbad.firebasestorage.app",
  "measurementId": "",
  "messagingSenderId": "347067189449"
};
```

Then restart the dev server:
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Solution 5: Browser-Specific Fixes

#### Chrome/Edge
1. Go to `chrome://settings/content/cookies`
2. Ensure "Allow all cookies" is selected OR
3. Add exception for `[*.]firebaseapp.com` and `[*.]googleapis.com`

#### Firefox
1. Go to `about:preferences#privacy`
2. Set "Enhanced Tracking Protection" to "Standard"
3. Or add exceptions for Firebase domains

#### Safari
1. Preferences → Privacy
2. Uncheck "Prevent cross-site tracking" temporarily
3. Or add Firebase domains to exceptions

### Solution 6: Check for Service Worker Issues

1. Open DevTools (`F12`)
2. Go to **Application** tab → **Service Workers**
3. If you see `firebase-messaging-sw.js`, click "Unregister"
4. Refresh the page

### Solution 7: Restart Dev Server with Clean Cache

```bash
# Stop the dev server (Ctrl+C)

# Clear Next.js cache
rm -rf .next

# Restart
npm run dev
```

## Testing After Fix

1. Open browser DevTools (`F12`)
2. Go to **Network** tab
3. Try logging in
4. Look for requests to `identitytoolkit.googleapis.com`
5. Check if they succeed (status 200) or fail

## Still Not Working?

If none of the above work, the issue might be:

### Check Browser Console for Additional Errors
1. Open DevTools (`F12`) → **Console** tab
2. Look for any additional error messages
3. Share the full error stack trace

### Verify Firebase Project Status
1. Check if Firebase project is active in [Firebase Console](https://console.firebase.google.com)
2. Ensure billing is set up if required
3. Check if there are any service outages: [Firebase Status](https://status.firebase.google.com)

### Alternative: Use Different Browser
- Try a different browser (Chrome, Firefox, Edge)
- This helps identify if it's browser-specific

## Quick Checklist

- [ ] Cleared browser cache and cookies
- [ ] Disabled browser extensions (especially ad blockers)
- [ ] Tried incognito/private mode
- [ ] Verified network connectivity to Firebase domains
- [ ] Checked Firebase Console authorized domains includes `localhost`
- [ ] Verified Firebase config is correct
- [ ] Restarted dev server
- [ ] Checked browser console for additional errors

## Most Likely Solution

**90% of the time**, this error is caused by:
1. **Browser extensions** (ad blockers, privacy extensions) blocking Firebase
2. **Browser privacy settings** blocking third-party cookies
3. **Network/firewall** blocking Firebase domains

**Quick fix**: Try incognito mode first. If it works there, the issue is browser extensions or cookies.
