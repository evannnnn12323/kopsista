const CACHE_NAME = 'koperasi-sekolah-v3';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './database.js',
  './style.css',
  './school_logo.png',
  './login_illustration.png'
];

// Install Event - Skip waiting immediately
self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

// Activate Event - Clean ALL old caches & claim clients
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.map(key => caches.delete(key)));
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - NETWORK FIRST (always get fresh content)
self.addEventListener('fetch', event => {
  if (event.request.url.startsWith('http')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Only use cache as fallback when completely offline
        return caches.match(event.request);
      })
    );
  }
});
