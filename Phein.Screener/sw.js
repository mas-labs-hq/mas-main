// Phein Service Worker v2.3
const CACHE_NAME = 'phein-v6.5';
const ASSETS_TO_CACHE = [
    '/phein/',
    '/phein/index.html',
    '/phein/phein-engine.js',
    '/phein/manifest.json',
    '/phein/sw.js',
    '/phein/phein-icons/favicon.ico',
    '/phein/phein-icons/favicon-16x16.png',
    '/phein/phein-icons/favicon-32x32.png',
    '/phein/phein-icons/apple-touch-icon.png',
    '/phein/phein-icons/android-chrome-192x192.png',
    '/phein/phein-icons/android-chrome-512x512.png'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Phein: Caching assets for v6.5');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Phein: Removing old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - network-first for HTML, cache-first for static assets
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // Skip API calls - always go to network
    if (event.request.url.includes('/api/')) return;
    
    // Network-first for HTML (always get fresh version)
    if (event.request.url.endsWith('.html') || event.request.url.endsWith('/')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request).then((cachedResponse) => {
                        return cachedResponse || caches.match('/phein/index.html');
                    });
                })
        );
        return;
    }
    
    // Cache-first for static assets (JS, CSS, images, fonts)
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Still update cache in background (stale-while-revalidate)
                    fetch(event.request).then((response) => {
                        if (response.status === 200) {
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, response);
                            });
                        }
                    }).catch(() => {});
                    return cachedResponse;
                }
                return fetch(event.request)
                    .then((response) => {
                        if (response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, responseClone);
                            });
                        }
                        return response;
                    })
                    .catch(() => {
                        return caches.match('/phein/index.html');
                    });
            })
    );
});
