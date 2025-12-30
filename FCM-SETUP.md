# Firebase Cloud Messaging Setup Guide

This guide will help you set up Firebase Cloud Messaging (FCM) for your PWA and enable push notifications from a server.

## Prerequisites

1. A Firebase project (you mentioned you already have one!)
2. Your PWA must be served over HTTPS (or localhost for testing)

## Step 1: Get Firebase Configuration

### A. Web App Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon) → **General**
4. Scroll down to **Your apps** section
5. If you haven't added a web app, click **Add app** and select **Web** (</> icon)
6. Copy the `firebaseConfig` object

### B. VAPID Key (Web Push Certificate)

1. In Firebase Console, go to **Project Settings** → **Cloud Messaging**
2. Scroll to **Web Push certificates**
3. If you don't have a key pair, click **Generate key pair**
4. Copy the **Key pair** value (this is your VAPID key)

### C. Service Account Key (for Server)

1. In Firebase Console, go to **Project Settings** → **Service accounts**
2. Click **Generate new private key**
3. Click **Generate key** - this downloads a JSON file
4. Save this file as `firebase-service-account.json` in your project root

## Step 2: Configure the PWA

1. Open `firebase-config.js` and replace the placeholder values with your actual Firebase configuration:

```javascript
export const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};

export const vapidKey = "YOUR_ACTUAL_VAPID_KEY";
```

2. Make sure you replace ALL the placeholder values!

## Step 3: Enable Cloud Messaging API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **APIs & Services** → **Library**
4. Search for "Firebase Cloud Messaging API"
5. Click on it and click **Enable**

## Step 4: Setup the Server

1. Make sure you have `firebase-service-account.json` in your project root
2. The server is already configured in `server.js`
3. Start the server:

```bash
npm run server
```

The server will run on `http://localhost:3000`

## Step 5: Test the Setup

### On your PWA:

1. Open your PWA (make sure it's on HTTPS or localhost)
2. Click **Enable Notifications**
3. Grant permission when prompted
4. Copy the **FCM Token** that appears on the page

### Send a test notification:

**Option 1: Using the test script**

```bash
node send-test-notification.js
```

Follow the prompts to enter your FCM token and notification details.

**Option 2: Using curl**

```bash
curl -X POST http://localhost:3000/send \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_FCM_TOKEN_HERE",
    "title": "Test Notification",
    "body": "Hello from the server!"
  }'
```

**Option 3: Using Postman or any HTTP client**

- **URL:** `POST http://localhost:3000/send`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "token": "YOUR_FCM_TOKEN_HERE",
  "title": "Test Notification",
  "body": "Hello from the server!",
  "data": {
    "customKey": "customValue"
  }
}
```

## Server API Endpoints

### GET /
Returns server information and available endpoints.

### POST /send
Send a notification to a specific device.

**Request Body:**
```json
{
  "token": "device_fcm_token",
  "title": "Notification Title",
  "body": "Notification Body",
  "data": {
    "key": "value"
  }
}
```

### POST /send-to-topic
Send a notification to all devices subscribed to a topic.

**Request Body:**
```json
{
  "topic": "news",
  "title": "Notification Title",
  "body": "Notification Body",
  "data": {
    "key": "value"
  }
}
```

## Troubleshooting

### "Firebase not initialized" error
- Make sure `firebase-service-account.json` exists in your project root
- Verify the JSON file is valid and contains the correct credentials

### Token not appearing in PWA
- Make sure you've replaced the placeholder values in `firebase-config.js`
- Check browser console for errors
- Ensure you're on HTTPS or localhost
- Check that the service worker is registered successfully

### Notifications not received
- Verify Cloud Messaging API is enabled in Google Cloud Console
- Make sure the FCM token is correct and not expired
- Check browser console and server logs for errors
- Ensure notification permission is granted

### CORS errors
- The server is configured with CORS enabled
- If issues persist, check your browser's CORS settings

## Important Security Notes

1. **NEVER commit `firebase-config.js` or `firebase-service-account.json` to git**
2. These files are already in `.gitignore`
3. For production, use environment variables for sensitive data
4. Keep your VAPID key and service account credentials secure

## Next Steps

- Store FCM tokens in a database for your users
- Implement topic subscriptions for group notifications
- Add custom notification actions
- Handle notification clicks to open specific pages
- Implement notification badges and sounds

## Testing on Mobile

1. Make sure your PWA is deployed to a server with HTTPS
2. Install the PWA on your mobile device
3. Grant notification permission
4. Copy the FCM token from the device
5. Send notifications from your server using that token

Even when the PWA is closed or in the background, you'll receive notifications!
