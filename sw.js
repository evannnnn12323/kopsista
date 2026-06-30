const CACHE_NAME = 'koperasi-sekolah-v2';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './database.js',
  './style.css',
  './school_logo.png',
  './login_illustration.png'
];

// Install Event - Caching Assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app shell and assets...');
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Cleaning Up Old Caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Serve Cache or Network
self.addEventListener('fetch', event => {
  // Hanya intercept request HTTP/HTTPS (hindari chrome-extension atau file://)
  if (event.request.url.startsWith('http')) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        return cachedResponse || fetch(event.request).catch(() => {
          // Fallback jika offline dan aset tidak di-cache
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
    );
  }
});
