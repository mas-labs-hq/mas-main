// Bioattex Service Worker v2.1
const CACHE_NAME = 'bioattex-v2.1';
const ASSETS_TO_CACHE = [
    '/bioattex/',
    '/bioattex/index.html',
    '/bioattex/bioattex-icons/favicon.ico',
    '/bioattex/bioattex-icons/favicon-16x16.png',
    '/bioattex/bioattex-icons/favicon-32x32.png',
    '/bioattex/bioattex-icons/apple-touch-icon.png',
    '/bioattex/bioattex-icons/android-chrome-192x192.png',
    '/bioattex/bioattex-icons/android-chrome-512x512.png'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Bioattex: Caching assets');
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
                        console.log('Bioattex: Removing old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // Skip API calls - always go to network
    if (event.request.url.includes('/api/')) return;
    
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request)
                    .then((response) => {
                        // Cache successful responses
                        if (response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, responseClone);
                            });
                        }
                        return response;
                    })
                    .catch(() => {
                        // Return offline page if available
                        return caches.match('/bioattex/index.html');
                    });
            })
    );
});
