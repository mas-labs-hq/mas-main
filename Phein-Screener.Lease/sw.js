/* ============================================================
   Phein Screener Lease — Service Worker
   Brief section 6 + 8.B requirements:
     - DO NOT cache app.html, index.html, auth.js, router.js, timer.js, security.js.
     - ONLY cache static assets: styles.css, icons, fonts, screenshots.
     - Use NETWORK-ONLY strategy for all HTML and JS files.
     - If network fails on HTML/JS, return an "offline" fallback page.
   This is REQUIRED because the app must enforce always-online (section 8).

   ============================================================
   OWNER: BUMP CACHE_NAME WHEN YOU EDIT auth.js
   ============================================================
   When you change auth.js, bump the version in THREE places:
     1. index.html  — the ?v= on its auth.js script tag
     2. app.html    — the ?v= on its auth.js script tag
     3. THIS FILE (sw.js) — the CACHE_NAME variable below

   To bump: change 'phein-lease-v1-20260617' to 'phein-lease-v1-20260618'
   (increment the last digit of the date).
   ============================================================ */

// ==================================================================
// BUMP THIS VERSION WHEN YOU EDIT auth.js:
//   'phein-lease-v1-20260617'  ->  'phein-lease-v1-20260618'
// (Also bump ?v= in index.html and app.html)
// ==================================================================
var CACHE_NAME = 'phein-lease-v1-20260618';

// Static assets that MAY be cached (anything else is treated as network-only).
var STATIC_ASSETS_TO_CACHE = [
  'styles.css',
  'phein-icons/android-chrome-192x192.png',
  'phein-icons/android-chrome-512x512.png',
  'phein-icons/apple-touch-icon.png',
  'phein-icons/favicon-16x16.png',
  'phein-icons/favicon-32x32.png',
  'phein-icons/favicon.ico',
  'screenshot-wide.png'
];

// Files that must NEVER be served from cache — always network-only.
// (HTML + all JS files. Includes reviews.js since the owner may edit it.)
var NETWORK_ONLY_PATHS = [
  'index.html',
  'app.html',
  'auth.js',
  'router.js',
  'timer.js',
  'security.js',
  'reviews.js',
  'phein-engine.js',
  'phein-features.js',
  'anti-ai.js',
  'anti-ai-ui.js',
  'manifest.json'
];

// Simple offline fallback page (returned when network fails for HTML/JS).
var OFFLINE_FALLBACK_HTML =
  '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
  '<title>Offline — Phein Screener</title>' +
  '<style>' +
    'body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh;' +
    'background:#0f172a;color:#fff;font-family:system-ui,-apple-system,sans-serif;text-align:center;padding:2rem;}' +
    'h1{font-size:1.75rem;margin-bottom:1rem;}' +
    'p{font-size:1rem;line-height:1.6;max-width:480px;opacity:0.85;}' +
    '.spinner{width:36px;height:36px;border:3px solid rgba(255,255,255,0.2);' +
    'border-top-color:#60a5fa;border-radius:50%;animation:spin 0.8s linear infinite;margin:1.5rem auto;}' +
    '@keyframes spin{to{transform:rotate(360deg)}}' +
  '</style></head><body>' +
    '<div>' +
      '<h1>Connection Lost</h1>' +
      '<p>Phein Screener requires an active internet connection. Please reconnect to continue.</p>' +
      '<div class="spinner"></div>' +
      '<p style="margin-top:1.5rem;font-size:0.85rem;opacity:0.6;">For lease inquiries, contact MortApps Studios.</p>' +
    '</div>' +
  '</body></html>';

// ------------------------------------------------------------
// INSTALL — pre-cache static assets only.
// ------------------------------------------------------------
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(STATIC_ASSETS_TO_CACHE).catch(function (err) {
        // Don't fail the install if one icon is missing — log and continue.
        console.warn('Phein Lease SW: some static assets failed to cache:', err);
      });
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

// ------------------------------------------------------------
// ACTIVATE — purge old caches.
// ------------------------------------------------------------
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// ------------------------------------------------------------
// FETCH — routing logic.
//   * HTML/JS → NETWORK-ONLY. On failure → offline fallback page.
//   * Static assets (CSS, icons, fonts, images) → cache-first.
//   * Formspree POSTs → passthrough (don't intercept).
// ------------------------------------------------------------
self.addEventListener('fetch', function (event) {
  var req = event.request;

  // Never intercept non-GET requests (Formspree POSTs, etc.).
  if (req.method !== 'GET') return;

  var url;
  try { url = new URL(req.url); } catch (e) { return; }

  // Don't intercept cross-origin requests (CDN scripts like pdf.js, Google Fonts).
  if (url.origin !== self.location.origin) return;

  // Get the path (e.g., "/styles.css" or "/index.html") and basename.
  var pathname = url.pathname;
  var basename = pathname.split('/').pop() || '';

  // Network-only for HTML and JS files (and any path in NETWORK_ONLY_PATHS).
  var isHTML = pathname.endsWith('.html') || pathname === '/' || pathname === '';
  var isJS = pathname.endsWith('.js');
  var isManifest = basename === 'manifest.json';
  var isNetworkOnly = isHTML || isJS || isManifest;

  if (isNetworkOnly) {
    event.respondWith(
      fetch(req)
        .then(function (response) {
          // Don't cache HTML/JS — always serve fresh.
          return response;
        })
        .catch(function () {
          // Network failed — return offline fallback (HTML only; for JS, return
          // an empty 503 response so the page-level offline overlay can take over).
          if (isHTML) {
            return new Response(OFFLINE_FALLBACK_HTML, {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
          }
          return new Response('// Offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'application/javascript' }
          });
        })
    );
    return;
  }

  // Static assets → cache-first with background revalidation.
  event.respondWith(
    caches.match(req).then(function (cachedResponse) {
      var networkFetchPromise = fetch(req).then(function (response) {
        if (response && response.status === 200 && response.type === 'basic') {
          var responseClone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(req, responseClone).catch(function () {});
          });
        }
        return response;
      }).catch(function () {
        // Network failed — return cached response (or undefined if not in cache).
        return cachedResponse;
      });
      // Return cached immediately if available, otherwise wait for network.
      return cachedResponse || networkFetchPromise;
    })
  );
});

// ------------------------------------------------------------
// MESSAGE — allow pages to trigger an immediate update.
// ------------------------------------------------------------
self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
