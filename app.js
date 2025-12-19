let notificationInterval = null;
let notificationCount = 0;
let deferredPrompt = null;

const statusEl = document.getElementById('status');
const installBtn = document.getElementById('installButton');
const enableBtn = document.getElementById('enableNotifications');
const startBtn = document.getElementById('startNotifications');
const stopBtn = document.getElementById('stopNotifications');
const logEntriesEl = document.getElementById('logEntries');
const debugInfoEl = document.getElementById('debugInfo');

function updateStatus(message, type = '') {
    statusEl.textContent = message;
    statusEl.className = 'status ' + type;
}

async function updateDebugInfo() {
    const info = [];
    info.push(`✓ Service Worker: ${('serviceWorker' in navigator) ? 'Supported' : 'Not supported'}`);

    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
        info.push(`✓ Manifest: Linked (${manifestLink.href})`);
        try {
            const response = await fetch(manifestLink.href);
            if (response.ok) {
                const manifest = await response.json();
                info.push(`✓ Manifest loaded: name="${manifest.name}"`);
                info.push(`✓ Icons: ${manifest.icons?.length || 0} defined`);
            } else {
                info.push(`❌ Manifest fetch failed: ${response.status}`);
            }
        } catch (e) {
            info.push(`❌ Manifest parse error: ${e.message}`);
        }
    } else {
        info.push(`❌ Manifest: Not linked`);
    }

    info.push(`✓ HTTPS: ${location.protocol === 'https:' ? 'Yes' : 'No'}`);
    info.push(`⏱ Install prompt: ${deferredPrompt ? 'Ready' : 'Waiting...'}`);

    if (window.matchMedia('(display-mode: standalone)').matches) {
        info.push(`✓ Already installed as PWA`);
    }

    debugInfoEl.innerHTML = '<strong>Debug Info:</strong><br>' + info.join('<br>');
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
            const registration = await navigator.serviceWorker.register('sw.js', {
                scope: '/pwa-notifications/'
            });
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

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'block';
    addLogEntry('✓ Install prompt available - showing install button');
    console.log('beforeinstallprompt event fired');
    updateDebugInfo();
});

installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) {
        addLogEntry('Install prompt not available');
        return;
    }

    installBtn.style.display = 'none';
    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);

    if (outcome === 'accepted') {
        addLogEntry('PWA installation accepted!');
        updateStatus('App installed successfully!', 'success');
    } else {
        addLogEntry('PWA installation dismissed');
        installBtn.style.display = 'block';
    }

    deferredPrompt = null;
});

window.addEventListener('appinstalled', () => {
    addLogEntry('PWA was installed successfully');
    updateStatus('App installed! You can now use it offline.', 'success');
    installBtn.style.display = 'none';
    deferredPrompt = null;
});

enableBtn.addEventListener('click', requestNotificationPermission);
startBtn.addEventListener('click', startNotifications);
stopBtn.addEventListener('click', stopNotifications);

window.addEventListener('load', async () => {
    try {
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (let registration of registrations) {
                if (registration.scope !== location.origin + '/pwa-notifications/') {
                    console.log('Unregistering old service worker:', registration.scope);
                    await registration.unregister();
                }
            }
        }

        await registerServiceWorker();

        if (Notification.permission === 'granted') {
            updateStatus('Ready to send notifications!', 'success');
            startBtn.disabled = false;
            enableBtn.disabled = true;
        } else if (Notification.permission === 'denied') {
            updateStatus('Notification permission denied. Please enable in browser settings.', 'error');
        }

        updateDebugInfo();
        setInterval(updateDebugInfo, 2000);

        setTimeout(() => {
            if (!deferredPrompt) {
                addLogEntry('⚠ Install prompt did not fire. Use browser menu to install.');
            }
        }, 5000);
    } catch (error) {
        updateStatus('Initialization failed: ' + error.message, 'error');
    }
});

window.addEventListener('beforeunload', () => {
    stopNotifications();
});
