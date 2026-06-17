/* PSF.Manager Service Worker — caches all app files for offline use */
var CACHE_NAME = 'psf-manager-v1-20260618';
var ASSETS = [
  'index.html', 'styles.css', 'app.js', 'reader.js', 'db.js', 'manifest.json',
  'phein-icons/favicon.ico', 'phein-icons/favicon-32x32.png', 'phein-icons/favicon-16x16.png',
  'phein-icons/android-chrome-192x192.png', 'phein-icons/android-chrome-512x512.png',
  'phein-icons/apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      // Use per-file put instead of addAll so one failure doesn't poison the whole cache
      return Promise.all(ASSETS.map(function (url) {
        return cache.put(url, fetch(url, { cache: 'no-store' })).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (names) {
    return Promise.all(names.map(function (n) { if (n !== CACHE_NAME) return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function (response) {
      // Cache successful responses (runtime caching)
      if (response.ok && response.type === 'basic') {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(e.request, clone).catch(function(){}); });
      }
      return response;
    }).catch(function () {
      // Fallback to cache
      return caches.match(e.request).then(function (cached) {
        return cached || caches.match('index.html');
      });
    })
  );
});
