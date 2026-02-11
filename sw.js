// Service Worker for Rehab Tracker
const CACHE_NAME = 'rehab-tracker-v11';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './exercises.js',
  './js/utils.js',
  './js/state.js',
  './js/wheel-picker.js',
  './js/navigation.js',
  './js/export.js',
  './js/history.js',
  './js/progress.js',
  './js/assessments.js',
  './js/exercises-ui.js',
  './js/app.js',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js'
];

// Install Service Worker — skipWaiting ensures immediate activation
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Network-first strategy: try network, fall back to cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Update cache with fresh response
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed, fall back to cache (offline support)
        return caches.match(event.request);
      })
  );
});

// Update Service Worker — claim clients so new SW controls existing tabs
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
