# Quick Start Guide

## What You Need to Provide

Before you can test push notifications, you need to configure Firebase. Here's what you need:

### 1. Firebase Web Configuration
Edit `firebase-config.js` and replace these values from your Firebase Console:

- **apiKey**: Found in Project Settings → General → Your apps
- **authDomain**: Your project's auth domain
- **projectId**: Your Firebase project ID
- **storageBucket**: Your project's storage bucket
- **messagingSenderId**: Your messaging sender ID
- **appId**: Your web app ID
- **vapidKey**: Found in Project Settings → Cloud Messaging → Web Push certificates

### 2. Firebase Service Account
Download the service account JSON from Firebase Console:
- Go to Project Settings → Service Accounts
- Click "Generate new private key"
- Save the downloaded file as `firebase-service-account.json` in the project root

## Setup Steps (5 minutes)

1. **Configure Firebase** (see above)

2. **Start the notification server:**
   ```bash
   npm run server
   ```

3. **Open your PWA** in a browser (HTTPS or localhost)

4. **Enable notifications** by clicking the button

5. **Copy the FCM token** that appears on the page

6. **Send a test notification:**
   ```bash
   node send-test-notification.js
   ```
   Or use curl:
   ```bash
   curl -X POST http://localhost:3000/send \
     -H "Content-Type: application/json" \
     -d '{
       "token": "PASTE_YOUR_FCM_TOKEN_HERE",
       "title": "Hello!",
       "body": "This is a test notification"
     }'
   ```

## Files You Created

- ✅ `server.js` - Local server to send FCM notifications
- ✅ `firebase-config.js` - Frontend Firebase config (YOU NEED TO EDIT THIS)
- ✅ `firebase-service-account.json` - Server credentials (YOU NEED TO ADD THIS)
- ✅ `send-test-notification.js` - Helper script to send test notifications
- ✅ Updated `app.js` - Added FCM token retrieval
- ✅ Updated `sw.js` - Added push notification handling
- ✅ Updated `index.html` - Added FCM token display

## Key Concepts

### FCM Token (Device ID)
- This is a unique identifier for each device/browser
- Your PWA obtains this token after requesting notification permission
- You need this token to send notifications to a specific device
- It's displayed in the PWA UI after enabling notifications

### How It Works

1. **PWA Side:**
   - User grants notification permission
   - PWA gets an FCM token from Firebase
   - Token is displayed in the UI

2. **Server Side:**
   - Server receives a request with the FCM token
   - Server uses Firebase Admin SDK to send a notification
   - Firebase delivers the notification to the device

3. **Service Worker:**
   - Receives the push event from Firebase
   - Displays the notification to the user
   - Works even when the PWA is closed!

## Testing

### On Desktop
1. Open PWA in browser
2. Enable notifications
3. Copy FCM token
4. Send notification from server
5. See the notification appear!

### On Mobile
1. Deploy PWA to HTTPS server
2. Install PWA on phone
3. Grant notification permission
4. Copy the FCM token (you can email it to yourself)
5. Send notifications from your server
6. Notifications work even when the app is closed!

## Common Issues

**"Firebase not initialized"**
→ Add `firebase-service-account.json` to project root

**No FCM token appears**
→ Edit `firebase-config.js` with your actual Firebase credentials

**Notifications not received**
→ Enable "Firebase Cloud Messaging API" in Google Cloud Console

## Need Help?

See `FCM-SETUP.md` for detailed setup instructions and troubleshooting.
