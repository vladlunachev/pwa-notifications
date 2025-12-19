let notificationInterval = null;
let notificationCount = 0;

const statusEl = document.getElementById('status');
const enableBtn = document.getElementById('enableNotifications');
const startBtn = document.getElementById('startNotifications');
const stopBtn = document.getElementById('stopNotifications');
const logEntriesEl = document.getElementById('logEntries');

function updateStatus(message, type = '') {
    statusEl.textContent = message;
    statusEl.className = 'status ' + type;
}

function addLogEntry(message) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    const timestamp = new Date().toLocaleTimeString();
    entry.textContent = `[${timestamp}] ${message}`;
    logEntriesEl.insertBefore(entry, logEntriesEl.firstChild);

    if (logEntriesEl.children.length > 50) {
        logEntriesEl.removeChild(logEntriesEl.lastChild);
    }
}

async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('sw.js');
            console.log('Service Worker registered:', registration);
            addLogEntry('Service Worker registered successfully');
            updateStatus('Service Worker ready. Click "Enable Notifications" to continue.', 'success');
            return registration;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            addLogEntry('Service Worker registration failed: ' + error.message);
            updateStatus('Service Worker registration failed', 'error');
            throw error;
        }
    } else {
        throw new Error('Service Workers not supported');
    }
}

async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        updateStatus('Notifications not supported', 'error');
        addLogEntry('Notifications are not supported in this browser');
        return false;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            updateStatus('Notification permission granted!', 'success');
            addLogEntry('Notification permission granted');
            startBtn.disabled = false;
            enableBtn.disabled = true;
            return true;
        } else {
            updateStatus('Notification permission denied', 'error');
            addLogEntry('Notification permission denied');
            return false;
        }
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        updateStatus('Error requesting permission', 'error');
        return false;
    }
}

function showNotification() {
    notificationCount++;
    const title = `PWA Notification #${notificationCount}`;
    const options = {
        body: `This is notification number ${notificationCount} sent at ${new Date().toLocaleTimeString()}`,
        icon: 'icon-192.png',
        badge: 'icon-192.png',
        vibrate: [200, 100, 200],
        tag: 'pwa-notification',
        requireInteraction: false,
        data: {
            dateOfArrival: Date.now(),
            primaryKey: notificationCount
        },
        actions: [
            { action: 'explore', title: 'Explore' },
            { action: 'close', title: 'Close' }
        ]
    };

    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, options);
            addLogEntry(`Notification #${notificationCount} sent via Service Worker`);
        });
    } else {
        new Notification(title, options);
        addLogEntry(`Notification #${notificationCount} sent directly`);
    }
}

function startNotifications() {
    if (notificationInterval) {
        clearInterval(notificationInterval);
    }

    showNotification();

    notificationInterval = setInterval(() => {
        showNotification();
    }, 10000);

    startBtn.disabled = true;
    stopBtn.disabled = false;
    updateStatus('Notifications running (every 10 seconds)', 'success');
    addLogEntry('Started notification timer');
}

function stopNotifications() {
    if (notificationInterval) {
        clearInterval(notificationInterval);
        notificationInterval = null;
    }

    startBtn.disabled = false;
    stopBtn.disabled = true;
    updateStatus('Notifications stopped', '');
    addLogEntry('Stopped notification timer');
}

enableBtn.addEventListener('click', requestNotificationPermission);
startBtn.addEventListener('click', startNotifications);
stopBtn.addEventListener('click', stopNotifications);

window.addEventListener('load', async () => {
    try {
        await registerServiceWorker();

        if (Notification.permission === 'granted') {
            updateStatus('Ready to send notifications!', 'success');
            startBtn.disabled = false;
            enableBtn.disabled = true;
        } else if (Notification.permission === 'denied') {
            updateStatus('Notification permission denied. Please enable in browser settings.', 'error');
        }
    } catch (error) {
        updateStatus('Initialization failed: ' + error.message, 'error');
    }
});

window.addEventListener('beforeunload', () => {
    stopNotifications();
});
