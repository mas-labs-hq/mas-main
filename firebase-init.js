/**
 * ═══════════════════════════════════════════════════════════════════════
 * MortApps Studios — Firebase Integration Module
 * Cross-device engagement tracking & newsletter capture
 *
 * Features:
 *   - Blog likes / shares / views (Realtime Database)
 *   - Newsletter email capture (Realtime Database)
 *   - Mort-E chat analytics (Realtime Database)
 *   - Demo click tracking (Realtime Database)
 *   - Session deduplication (localStorage guard per action)
 *
 * Database Structure:
 *   /blog_posts/{slug}/likes     — number
 *   /blog_posts/{slug}/shares    — number
 *   /blog_posts/{slug}/views     — number
 *   /newsletter_emails/{pushId}  — { email, timestamp, source }
 *   /mort_e_analytics/sessions   — number
 *   /mort_e_analytics/messages   — number
 *   /mort_e_analytics/intents/{intentId}/count — number
 *   /demo_clicks/{productSlug}   — number
 *
 * (c) 2026 MortApps Studios. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // ── Firebase Config ──────────────────────────────────────────────
  var firebaseConfig = {
    apiKey: "AIzaSyBFNpwG8F104JMcwhhXkrk2HbyM80jjbZM",
    authDomain: "mortapps-studios.firebaseapp.com",
    databaseURL: "https://mortapps-studios-default-rtdb.firebaseio.com",
    projectId: "mortapps-studios",
    storageBucket: "mortapps-studios.firebasestorage.app",
    messagingSenderId: "978442778256",
    appId: "1:978442778256:web:f66b4f1f0f770ce08e4a15",
    measurementId: "G-THGT2GHZ35"
  };

  // ── Initialize Firebase (compat SDK) ─────────────────────────────
  try {
    firebase.initializeApp(firebaseConfig);
    if (typeof firebase.analytics === 'function') {
      firebase.analytics();
    }
  } catch (e) {
    console.warn('[MortApps Firebase] Init error:', e.message);
  }

  var db = firebase.database();

  // ── Local Deduplication Helpers ──────────────────────────────────
  // Prevents a single user from infinitely incrementing counters
  var DEDUP_PREFIX = 'mas_firebase_';

  function hasActed(actionKey) {
    try { return !!localStorage.getItem(DEDUP_PREFIX + actionKey); }
    catch (e) { return false; }
  }

  function markActed(actionKey) {
    try { localStorage.setItem(DEDUP_PREFIX + actionKey, Date.now().toString()); }
    catch (e) { /* silent */ }
  }

  // ── Safe Counter Increment ───────────────────────────────────────
  function incrementCounter(path, amount) {
    var ref = db.ref(path);
    return ref.transaction(function (current) {
      return (current || 0) + (amount || 1);
    });
  }

  // ── Safe Counter Read ────────────────────────────────────────────
  function readCounter(path, callback) {
    db.ref(path).once('value').then(function (snap) {
      callback(snap.val() || 0);
    }).catch(function (err) {
      console.warn('[MortApps Firebase] Read error at ' + path + ':', err.message);
      callback(0);
    });
  }

  // ── Listen to Counter (real-time) ────────────────────────────────
  function listenCounter(path, callback) {
    db.ref(path).on('value', function (snap) {
      callback(snap.val() || 0);
    }, function (err) {
      console.warn('[MortApps Firebase] Listen error at ' + path + ':', err.message);
    });
  }


  /* ═══════════════════════════════════════════════════════════════
     BLOG: VIEWS
     Auto-increment on page load, deduplicated per session per slug
     ═══════════════════════════════════════════════════════════════ */
  function trackView(slug) {
    var key = 'view_' + slug;
    if (hasActed(key)) return; // One view per session per post
    markActed(key);
    incrementCounter('blog_posts/' + slug + '/views');
  }


  /* ═══════════════════════════════════════════════════════════════
     BLOG: LIKES
     One like per user per post (localStorage guard)
     ═══════════════════════════════════════════════════════════════ */
  function toggleLike(slug) {
    var key = 'like_' + slug;
    if (hasActed(key)) {
      // Already liked — unlike
      try { localStorage.removeItem(DEDUP_PREFIX + key); } catch (e) { /* silent */ }
      incrementCounter('blog_posts/' + slug + '/likes', -1);
      return false; // Returns unliked state
    } else {
      markActed(key);
      incrementCounter('blog_posts/' + slug + '/likes', 1);
      return true; // Returns liked state
    }
  }

  function hasLiked(slug) {
    return hasActed('like_' + slug);
  }


  /* ═══════════════════════════════════════════════════════════════
     BLOG: SHARES
     Increment on share action (no dedup — user can share multiple times)
     ═══════════════════════════════════════════════════════════════ */
  function trackShare(slug) {
    incrementCounter('blog_posts/' + slug + '/shares');
  }


  /* ═══════════════════════════════════════════════════════════════
     BLOG: READ ALL COUNTERS
     Returns { likes, shares, views } for a slug
     ═══════════════════════════════════════════════════════════════ */
  function getPostStats(slug, callback) {
    db.ref('blog_posts/' + slug).once('value').then(function (snap) {
      var data = snap.val() || {};
      callback({
        likes: data.likes || 0,
        shares: data.shares || 0,
        views: data.views || 0,
      });
    }).catch(function (err) {
      console.warn('[MortApps Firebase] Stats error:', err.message);
      callback({ likes: 0, shares: 0, views: 0 });
    });
  }


  /* ═══════════════════════════════════════════════════════════════
     NEWSLETTER: EMAIL CAPTURE
     Saves email to Realtime Database with timestamp and source page
     ═══════════════════════════════════════════════════════════════ */
  function subscribeNewsletter(email, source) {
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return Promise.reject(new Error('Invalid email address'));
    }
    // Deduplicate: one subscription per email per device
    var key = 'newsletter_' + email.toLowerCase();
    if (hasActed(key)) {
      return Promise.resolve({ duplicate: true });
    }
    markActed(key);

    return db.ref('newsletter_emails').push({
      email: email.trim().toLowerCase(),
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      source: source || 'unknown',
    });
  }


  /* ═══════════════════════════════════════════════════════════════
     MORT-E CHAT ANALYTICS
     Track sessions opened, messages sent, and top intents
     ═══════════════════════════════════════════════════════════════ */
  var mortESessionKey = 'mort_e_session_tracked';
  var mortESessionId = null;

  function trackMortESession() {
    // One session per page load
    if (hasActed(mortESessionKey)) return;
    markActed(mortESessionKey);
    mortESessionId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    incrementCounter('mort_e_analytics/sessions');
  }

  function trackMortEMessage() {
    incrementCounter('mort_e_analytics/messages');
  }

  function trackMortEIntent(intentId) {
    if (!intentId) return;
    incrementCounter('mort_e_analytics/intents/' + intentId + '/count');
  }


  /* ═══════════════════════════════════════════════════════════════
     DEMO CLICK TRACKING
     Track how many times each product demo is clicked
     ═══════════════════════════════════════════════════════════════ */
  function trackDemoClick(productSlug) {
    incrementCounter('demo_clicks/' + productSlug);
  }


  /* ═══════════════════════════════════════════════════════════════
     UTILITY: Format Numbers (1.2K, 3.5M, etc.)
     ═══════════════════════════════════════════════════════════════ */
  function formatNumber(num) {
    if (num === null || num === undefined) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
  }


  /* ═══════════════════════════════════════════════════════════════
     PUBLIC API — Exposed as window.MortAppsFirebase
     ═══════════════════════════════════════════════════════════════ */
  window.MortAppsFirebase = {
    // Blog
    trackView: trackView,
    toggleLike: toggleLike,
    hasLiked: hasLiked,
    trackShare: trackShare,
    getPostStats: getPostStats,
    listenCounter: listenCounter,
    readCounter: readCounter,
    formatNumber: formatNumber,

    // Newsletter
    subscribeNewsletter: subscribeNewsletter,

    // Mort-E Analytics
    trackMortESession: trackMortESession,
    trackMortEMessage: trackMortEMessage,
    trackMortEIntent: trackMortEIntent,

    // Demo Clicks
    trackDemoClick: trackDemoClick,

    // Raw access (advanced)
    db: db,
  };

})();
