importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const CACHE_NAME = 'pwa-notifications-v10';
const urlsToCache = [
  '/pwa-notifications/',
  '/pwa-notifications/index.html',
  '/pwa-notifications/style.css',
  '/pwa-notifications/app.js',
  '/pwa-notifications/firebase-config.js',
  '/pwa-notifications/manifest.json',
  '/pwa-notifications/icon-192.png',
  '/pwa-notifications/icon-512.png'
];

self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return response;
        });
      }).catch(() => {
        return caches.match('/pwa-notifications/index.html');
      })
  );
});

self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event.notification.tag);
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if ('focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/pwa-notifications/');
        }
      })
  );
});

self.addEventListener('notificationclose', event => {
  console.log('Notification closed:', event.notification.tag);
});

self.addEventListener('push', event => {
  console.log('Push event received:', event);

  let notificationData = {
    title: 'New Notification',
    body: 'You have a new message',
    icon: '/pwa-notifications/icon-192.png',
    badge: '/pwa-notifications/icon-192.png'
  };

  if (event.data) {
    try {
      const data = event.data.json();
      console.log('Push notification data:', data);

      if (data.notification) {
        notificationData = {
          title: data.notification.title || notificationData.title,
          body: data.notification.body || notificationData.body,
          icon: data.notification.icon || notificationData.icon,
          badge: data.notification.badge || notificationData.badge,
          data: data.data || {}
        };
      }
    } catch (e) {
      console.log('Push event data is not JSON:', event.data.text());
      notificationData.body = event.data.text();
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data,
      vibrate: [200, 100, 200],
      tag: 'fcm-notification'
    }
  );

  event.waitUntil(promiseChain);
});
