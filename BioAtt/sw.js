var CACHE_NAME = 'bioattex-v6.0';
var ASSETS_TO_CACHE = [
    '/bioattex/',
    '/bioattex/index.html',
    '/bioattex/styles.css',
    '/bioattex/bio-utils.js',
    '/bioattex/storage.js',
    '/bioattex/bio-engine.js',
    '/bioattex/bio-features.js',
    '/bioattex/bio-ui.js',
    '/bioattex/manifest.json',
    '/bioattex/bioattex-icons/favicon.ico',
    '/bioattex/bioattex-icons/favicon-16x16.png',
    '/bioattex/bioattex-icons/favicon-32x32.png',
    '/bioattex/bioattex-icons/apple-touch-icon.png',
    '/bioattex/bioattex-icons/android-chrome-192x192.png',
    '/bioattex/bioattex-icons/android-chrome-512x512.png'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log('Bioattex: Caching assets for v6.0');
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(function() { return self.skipWaiting(); })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(cacheNames.map(function(cacheName) {
                if (cacheName !== CACHE_NAME) {
                    console.log('Bioattex: Removing old cache', cacheName);
                    return caches.delete(cacheName);
                }
            }));
        }).then(function() { return self.clients.claim(); })
    );
});

self.addEventListener('fetch', function(event) {
    if (event.request.method !== 'GET') return;
    if (event.request.url.includes('/api/')) return;
    if (event.request.url.includes('cdn.jsdelivr.net') || event.request.url.includes('cdnjs.cloudflare.com')) return;

    // Network-first for HTML (always get fresh version)
    if (event.request.url.endsWith('.html') || event.request.url.endsWith('/')) {
        event.respondWith(
            fetch(event.request)
                .then(function(response) {
                    if (response.status === 200) {
                        var responseClone = response.clone();
                        caches.open(CACHE_NAME).then(function(cache) {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(function() {
                    return caches.match(event.request).then(function(cachedResponse) {
                        return cachedResponse || caches.match('/bioattex/index.html');
                    });
                })
        );
        return;
    }

    // Cache-first for static assets with stale-while-revalidate
    event.respondWith(
        caches.match(event.request).then(function(cachedResponse) {
            if (cachedResponse) {
                // Update cache in background (stale-while-revalidate)
                fetch(event.request).then(function(response) {
                    if (response.status === 200) {
                        caches.open(CACHE_NAME).then(function(cache) {
                            cache.put(event.request, response);
                        });
                    }
                }).catch(function() {});
                return cachedResponse;
            }
            return fetch(event.request).then(function(response) {
                if (response.status === 200) {
                    var responseClone = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            }).catch(function() {
                return caches.match('/bioattex/index.html');
            });
        })
    );
});