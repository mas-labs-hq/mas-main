/**
 * QejaLink Service Worker - ONLINE-ONLY MODE
 * Version: 2.0.0
 *
 * DESIGN PHILOSOPHY:
 * This PWA requires an internet connection. There is NO offline cache.
 * Users always get the freshest content. Updates appear instantly
 * without needing to bump a version number (though you still can for
 * the SW registration to refresh).
 *
 * WHAT THIS SW DOES:
 * - Registers the SW for PWA installability
 * - Always fetches from network (no cache)
 * - Shows a clean offline page if the user loses connection
 * - Handles the close/refresh lifecycle
 *
 * WHAT THIS SW DOES NOT DO:
 * - Cache any files for offline use
 * - Serve stale content
 * - Require version bumps to deliver updates
 */

var CACHE_NAME = 'qejalink-shell-v25';
var OFFLINE_URL = './offline.html';

// ============================================
// INSTALL - skip waiting, minimal cache (only the offline page)
// ============================================
self.addEventListener('install', function(event) {
    console.log('[QejaLink SW] Installing (online-only mode)');
    // Cache ONLY the offline fallback page, nothing else
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.add(OFFLINE_URL).catch(function(err) {
                    console.warn('[QejaLink SW] Could not cache offline page:', err);
                });
            })
            .then(function() {
                return self.skipWaiting();
            })
    );
});

// ============================================
// ACTIVATE - clean any old caches immediately
// ============================================
self.addEventListener('activate', function(event) {
    console.log('[QejaLink SW] Activating (online-only mode)');
    event.waitUntil(
        caches.keys()
            .then(function(cacheNames) {
                return Promise.all(
                    cacheNames
                        .filter(function(name) { return name.startsWith('qejalink-'); })
                        .map(function(name) {
                            console.log('[QejaLink SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(function() {
                // Re-cache the offline page after cleanup
                return caches.open(CACHE_NAME).then(function(cache) {
                    return cache.add(OFFLINE_URL).catch(function() {});
                });
            })
            .then(function() {
                return self.clients.claim();
            })
            .then(function() {
                return self.clients.matchAll().then(function(clients) {
                    clients.forEach(function(client) {
                        client.postMessage({ type: 'SW_READY', version: '2.0.0' });
                    });
                });
            })
    );
});

// ============================================
// FETCH - always go to network; offline fallback only
// ============================================
self.addEventListener('fetch', function(event) {
    var request = event.request;

    // Only handle GET requests
    if (request.method !== 'GET') return;

    // Skip cross-origin requests entirely (let browser handle them)
    if (!request.url.startsWith(self.location.origin)) return;

    // For navigation requests (HTML page loads), try network, fall back to offline page
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(function(response) {
                    // Got fresh content from network - return it
                    return response;
                })
                .catch(function() {
                    // Network failed - user is offline
                    return caches.match(OFFLINE_URL)
                        .then(function(cached) {
                            return cached || new Response(
                                '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline - QejaLink</title><style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#08090C;color:#EDEBE4;font-family:sans-serif;text-align:center;padding:2rem}div{max-width:400px}h1{color:#C9A84C;font-size:1.5rem;margin-bottom:1rem}p{color:#B0B4BE;font-size:0.95rem;line-height:1.6}button{margin-top:1.5rem;padding:0.75rem 1.5rem;background:#C9A84C;color:#08090C;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:0.9rem}</style></head><body><div><h1>You are offline</h1><p>QejaLink needs an internet connection to show you the latest house listings. Please check your connection and try again.</p><button onclick="location.reload()">Retry</button></div></body></html>',
                                { headers: { 'Content-Type': 'text/html' } }
                            );
                        });
                })
        );
        return;
    }

    // For all other assets (CSS, JS, images, etc.) - always fetch from network
    // Do NOT cache. This ensures users always get the latest version.
    event.respondWith(
        fetch(request)
            .catch(function() {
                // If network fails for a non-navigation asset, just fail
                // (browser will handle the broken asset gracefully)
                return new Response('', { status: 504, statusText: 'Offline' });
            })
    );
});

// ============================================
// MESSAGE HANDLING
// ============================================
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('[QejaLink SW] Service Worker loaded (online-only mode)');
