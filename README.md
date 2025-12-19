# PWA Notifications Demo

A simple Progressive Web App (PWA) that demonstrates push notifications functionality.

## Features

- Installable on Android and iOS devices
- Sends local notifications every 10 seconds
- Works offline with Service Worker caching
- Clean, responsive UI

## Live Demo

Visit: [https://vladlunachev.github.io/pwa-notifications/](https://vladlunachev.github.io/pwa-notifications/)

## How to Use

1. Visit the live demo URL on your Android phone
2. Click "Enable Notifications" and grant permission
3. Click "Start Notifications" to begin receiving notifications every 10 seconds
4. Install the app by tapping the browser menu and selecting "Add to Home Screen" or "Install App"
5. Once installed, the app will work even when offline

## Installation on Android

1. Open the URL in Chrome or another browser
2. Tap the menu (three dots) in the top right
3. Select "Add to Home Screen" or "Install App"
4. The app icon will appear on your home screen

## Technical Details

- Pure HTML, CSS, and JavaScript (no frameworks)
- Service Worker for offline functionality and notifications
- Web App Manifest for installability
- Uses the Notifications API for local notifications

## Files

- `index.html` - Main application page
- `app.js` - Application logic and notification handling
- `sw.js` - Service Worker for offline support and notifications
- `manifest.json` - PWA manifest for installability
- `style.css` - Styling
- `icon-192.png`, `icon-512.png` - App icons

## Note

This demo uses **local notifications** triggered by JavaScript, not push notifications from a server. For true push notifications, you would need a backend server to send push messages via the Web Push API.

## License

MIT
