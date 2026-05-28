/**
 * ═══════════════════════════════════════════════════════════════════════
 * MortApps Studios — Firebase Integration Module v2.0
 * Cross-device engagement tracking, newsletter capture & Google Analytics
 *
 * Features:
 *   - Blog likes / shares / views (Realtime Database)
 *   - Newsletter email capture (Realtime Database)
 *   - Mort-E chat analytics (Realtime Database)
 *   - Demo click tracking (Realtime Database)
 *   - Google Analytics custom events (demographics, engagement, real-time)
 *   - Session deduplication (localStorage guard per action)
 *   - Page view tracking with scroll depth & time-on-page
 *   - Device & traffic source detection
 *
 * Database Structure:
 *   /blog/articles/{id}/likes      — number
 *   /blog/articles/{id}/shares     — number
 *   /blog/articles/{id}/views      — number
 *   /newsletter_emails/{pushId}    — { email, timestamp, source }
 *   /mort_e_analytics/sessions     — number
 *   /mort_e_analytics/messages     — number
 *   /mort_e_analytics/intents/{id} — { count, last_topic }
 *   /mort_e_analytics/conversations/{pushId} — { session_id, messages, started, device, country }
 *   /demo_clicks/{productSlug}     — number
 *   /site_analytics/page_views/{pushId}  — { page, referrer, device, timestamp, session_id }
 *   /site_analytics/sessions/{pushId}    — { started, pages, device, browser, os, country }
 *
 * Google Analytics Events:
 *   page_view, blog_view, blog_like, blog_share
 *   newsletter_subscribe, mort_e_session, mort_e_message
 *   demo_click, scroll_depth, time_on_page
 *   session_start, session_end (with duration)
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
  var analytics = null;
  try {
    // Guard against double-initialization (e.g., page already has its own init)
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    if (typeof firebase.analytics === 'function') {
      // CRITICAL: Disable automatic page_view measurement from Firebase Analytics
      // We let gtag.js handle page_view tracking as the primary source.
      // Without this, Firebase Analytics sends its own page_view which conflicts
      // with gtag's page_view, causing GA4 dashboard to show no data.
      analytics = firebase.analytics();
      // The config below is set via gtag('config', ...) with send_page_view: true
      // Firebase Analytics auto-collection is handled by the gtag config.
    }
  } catch (e) {
    console.warn('[MortApps Firebase] Init error:', e.message);
  }

  var db = firebase.database();

  // ═══════════════════════════════════════════════════════════════
  // GOOGLE ANALYTICS HELPER (DUAL-CHANNEL)
  // Sends events to BOTH Firebase Analytics AND gtag.js (GA4)
  // - Firebase Analytics: for Firebase Console real-time & audiences
  // - gtag.js: for GA4 dashboard cards (page views, engagement, etc.)
  // This ensures ALL analytics dashboard cards populate correctly.
  // ═══════════════════════════════════════════════════════════════
  function logEvent(eventName, params) {
    // Channel 1: Firebase Analytics SDK
    if (analytics) {
      try {
        analytics.logEvent(eventName, params || {});
      } catch (e) {
        // Silent — never break the site for analytics
      }
    }
    // Channel 2: gtag.js (GA4) — this is what powers the GA4 dashboard!
    // Many GA4 dashboard cards ONLY populate from gtag events, not from
    // Firebase Analytics SDK events. Dual-channel fixes "No data available".
    if (typeof gtag === 'function') {
      try {
        gtag('event', eventName, params || {});
      } catch (e) {
        // Silent
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // DEVICE & SESSION DETECTION
  // Captures device type, browser, OS, referrer, screen size
  // ═══════════════════════════════════════════════════════════════
  var sessionId = null;
  var sessionStart = Date.now();

  function getDeviceType() {
    var ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua) || (navigator.maxTouchPoints > 1 && window.innerWidth >= 768)) return 'tablet';
    if (/mobile|iphone|ipod|android.*mobile|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  function getBrowser() {
    var ua = navigator.userAgent;
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('Edg') > -1) return 'Edge';
    if (ua.indexOf('Chrome') > -1) return 'Chrome';
    if (ua.indexOf('Safari') > -1) return 'Safari';
    if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) return 'Opera';
    return 'Other';
  }

  function getOS() {
    var ua = navigator.userAgent;
    if (ua.indexOf('Windows') > -1) return 'Windows';
    if (ua.indexOf('Mac') > -1) return 'macOS';
    if (ua.indexOf('Linux') > -1 && ua.indexOf('Android') === -1) return 'Linux';
    if (ua.indexOf('Android') > -1) return 'Android';
    if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) return 'iOS';
    return 'Other';
  }

  function getReferrer() {
    try {
      var ref = document.referrer || 'direct';
      if (ref === '') return 'direct';
      var url = new URL(ref);
      return url.hostname;
    } catch (e) {
      return 'direct';
    }
  }

  function getScreenInfo() {
    return {
      width: screen.width,
      height: screen.height,
      viewport: window.innerWidth + 'x' + window.innerHeight,
      dpr: window.devicePixelRatio || 1,
    };
  }

  function initSession() {
    var stored = sessionStorage.getItem('mas_session_id');
    if (stored) {
      sessionId = stored;
    } else {
      sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2, 8);
      sessionStorage.setItem('mas_session_id', sessionId);

      // Log session start to Firebase + GA
      var sessionData = {
        started: firebase.database.ServerValue.TIMESTAMP,
        device: getDeviceType(),
        browser: getBrowser(),
        os: getOS(),
        referrer: getReferrer(),
        screen: screen.width + 'x' + screen.height,
        viewport: window.innerWidth + 'x' + window.innerHeight,
        language: navigator.language || 'unknown',
        page: window.location.pathname,
      };

      db.ref('site_analytics/sessions').push(sessionData);
      incrementCounter('site_analytics/total_sessions');

      // Log first_visit for new sessions — GA4 uses this for the
      // "New vs Returning" and user acquisition reports
      var isFirstVisit = !localStorage.getItem('mas_returning_visitor');
      if (isFirstVisit) {
        try { localStorage.setItem('mas_returning_visitor', '1'); } catch (e) { /* silent */ }
        logEvent('first_visit', {
          device_type: getDeviceType(),
          browser: getBrowser(),
          os: getOS(),
          referrer: getReferrer(),
          language: navigator.language,
        });
      }

      // Log via gtag directly for GA4 session tracking
      // GA4 dashboard needs this for "Engaged sessions" and "Engagement time"
      if (typeof gtag === 'function') {
        try {
          gtag('event', 'session_start', {
            device_type: getDeviceType(),
            browser: getBrowser(),
            os: getOS(),
            referrer: getReferrer(),
            language: navigator.language,
          });
        } catch (e) { /* silent */ }
      }

      // Firebase Analytics session logging
      logEvent('session_start', {
        device_type: getDeviceType(),
        browser: getBrowser(),
        os: getOS(),
        referrer: getReferrer(),
        language: navigator.language,
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // PAGE VIEW TRACKING
  // Logs every page view to Firebase + GA with device & referrer info
  // ═══════════════════════════════════════════════════════════════
  function trackPageView() {
    var pageData = {
      page: window.location.pathname,
      title: document.title,
      referrer: getReferrer(),
      device: getDeviceType(),
      browser: getBrowser(),
      os: getOS(),
      language: navigator.language || 'unknown',
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      session_id: sessionId,
    };

    // Log to Realtime Database (sampling: 1 in 3 page views to control DB size)
    if (Math.random() < 0.33) {
      db.ref('site_analytics/page_views').push(pageData);
    }

    incrementCounter('site_analytics/page_views_total');

    // NOTE: We do NOT send page_view via gtag here because gtag's config
    // already has send_page_view: true, which fires automatically on page load.
    // Sending another page_view here would create duplicates in GA4.

    // Log via Firebase Analytics for Firebase Console (this is separate from gtag)
    if (analytics) {
      try {
        analytics.logEvent('page_view', {
          page_title: document.title,
          page_location: window.location.href,
          page_path: window.location.pathname,
          device_type: getDeviceType(),
          browser: getBrowser(),
          os: getOS(),
          referrer: getReferrer(),
          language: navigator.language,
        });
      } catch (e) { /* silent */ }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SCROLL DEPTH TRACKING
  // Tracks how far users scroll (25%, 50%, 75%, 100%) — engagement signal
  // ═══════════════════════════════════════════════════════════════
  var scrollMilestones = { 25: false, 50: false, 75: false, 100: false };

  function initScrollTracking() {
    var page = window.location.pathname;
    window.addEventListener('scroll', function () {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      var scrollPercent = Math.round((scrollTop / docHeight) * 100);

      [25, 50, 75, 100].forEach(function (milestone) {
        if (scrollPercent >= milestone && !scrollMilestones[milestone]) {
          scrollMilestones[milestone] = true;
          logEvent('scroll_depth', {
            percent: milestone,
            page_path: page,
            device_type: getDeviceType(),
          });
          incrementCounter('site_analytics/scroll_' + milestone);
        }
      });
    }, { passive: true });
  }

  // ═══════════════════════════════════════════════════════════════
  // TIME ON PAGE TRACKING
  // Fires at 10s, 30s, 60s, 120s, 300s — engagement & bounce signals
  // ═══════════════════════════════════════════════════════════════
  function initTimeTracking() {
    var page = window.location.pathname;
    var intervals = [10, 30, 60, 120, 300]; // seconds
    var engagementTracked = false;

    intervals.forEach(function (sec) {
      setTimeout(function () {
        logEvent('time_on_page', {
          seconds: sec,
          page_path: page,
          device_type: getDeviceType(),
        });
        incrementCounter('site_analytics/time_' + sec + 's');

        // After 10 seconds on page, fire user_engagement event
        // This is CRITICAL for GA4's "Average engagement time" card
        if (sec === 10 && !engagementTracked) {
          engagementTracked = true;
          if (typeof gtag === 'function') {
            try {
              gtag('event', 'user_engagement', {
                engagement_time_msec: 10000,
                page_path: page,
              });
            } catch (e) { /* silent */ }
          }
          if (analytics) {
            try {
              analytics.logEvent('user_engagement', {
                engagement_time_msec: 10000,
                page_path: page,
              });
            } catch (e) { /* silent */ }
          }
        }
      }, sec * 1000);
    });

    // Track session duration on page leave
    window.addEventListener('beforeunload', function () {
      var duration = Math.round((Date.now() - sessionStart) / 1000);

      // Fire final user_engagement with total time — populates GA4 engagement metrics
      if (typeof gtag === 'function') {
        try {
          gtag('event', 'user_engagement', {
            engagement_time_msec: duration * 1000,
            page_path: page,
          });
        } catch (e) { /* silent */ }
      }
      if (analytics) {
        try {
          analytics.logEvent('user_engagement', {
            engagement_time_msec: duration * 1000,
            page_path: page,
          });
        } catch (e) { /* silent */ }
      }

      logEvent('session_end', {
        duration_seconds: duration,
        page_path: page,
        device_type: getDeviceType(),
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // LOCAL DEDUPLICATION HELPERS
  // ═══════════════════════════════════════════════════════════════
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
    if (hasActed(key)) return;
    markActed(key);
    incrementCounter('blog/articles/' + slug + '/views');
    logEvent('blog_view', {
      article_id: slug,
      device_type: getDeviceType(),
      referrer: getReferrer(),
    });
  }


  /* ═══════════════════════════════════════════════════════════════
     BLOG: LIKES
     One like per user per post (localStorage guard)
     ═══════════════════════════════════════════════════════════════ */
  function toggleLike(slug) {
    var key = 'like_' + slug;
    if (hasActed(key)) {
      try { localStorage.removeItem(DEDUP_PREFIX + key); } catch (e) { /* silent */ }
      incrementCounter('blog/articles/' + slug + '/likes', -1);
      logEvent('blog_unlike', { article_id: slug });
      return false;
    } else {
      markActed(key);
      incrementCounter('blog/articles/' + slug + '/likes', 1);
      logEvent('blog_like', {
        article_id: slug,
        device_type: getDeviceType(),
      });
      return true;
    }
  }

  function hasLiked(slug) {
    return hasActed('like_' + slug);
  }


  /* ═══════════════════════════════════════════════════════════════
     BLOG: SHARES
     Increment on share action (no dedup — user can share multiple times)
     ═══════════════════════════════════════════════════════════════ */
  function trackShare(slug, platform) {
    incrementCounter('blog/articles/' + slug + '/shares');
    logEvent('blog_share', {
      article_id: slug,
      platform: platform || 'unknown',
      device_type: getDeviceType(),
    });
  }


  /* ═══════════════════════════════════════════════════════════════
     BLOG: READ ALL COUNTERS
     Returns { likes, shares, views } for a slug
     ═══════════════════════════════════════════════════════════════ */
  function getPostStats(slug, callback) {
    db.ref('blog/articles/' + slug).once('value').then(function (snap) {
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
    var key = 'newsletter_' + email.toLowerCase();
    if (hasActed(key)) {
      return Promise.resolve({ duplicate: true });
    }
    markActed(key);

    logEvent('newsletter_subscribe', {
      source: source || 'unknown',
      device_type: getDeviceType(),
    });

    return db.ref('newsletter_emails').push({
      email: email.trim().toLowerCase(),
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      source: source || 'unknown',
      device: getDeviceType(),
      session_id: sessionId,
    });
  }


  /* ═══════════════════════════════════════════════════════════════
     MORT-E CHAT ANALYTICS
     Track sessions opened, messages sent, and top intents.
     Also logs full conversation sessions for deeper analysis.
     ═══════════════════════════════════════════════════════════════ */
  var mortESessionKey = 'mort_e_session_tracked';
  var mortESessionId = null;
  var mortEMessageCount = 0;
  var mortEConversationRef = null;

  function trackMortESession() {
    if (hasActed(mortESessionKey)) return;
    markActed(mortESessionKey);
    mortESessionId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

    incrementCounter('mort_e_analytics/sessions');

    // Create a conversation record for this session
    mortEConversationRef = db.ref('mort_e_analytics/conversations').push({
      session_id: mortESessionId,
      started: firebase.database.ServerValue.TIMESTAMP,
      device: getDeviceType(),
      browser: getBrowser(),
      os: getOS(),
      language: navigator.language || 'unknown',
      messages: 0,
      topics: [],
    });

    logEvent('mort_e_session', {
      device_type: getDeviceType(),
      browser: getBrowser(),
      os: getOS(),
    });
  }

  function trackMortEMessage(topic) {
    incrementCounter('mort_e_analytics/messages');
    mortEMessageCount++;

    // Update the conversation record with message count and topic
    if (mortEConversationRef) {
      mortEConversationRef.update({
        messages: mortEMessageCount,
        last_activity: firebase.database.ServerValue.TIMESTAMP,
      });

      // Add topic if provided
      if (topic) {
        var topicKey = topic.toLowerCase().replace(/[^a-z0-9_]/g, '_').substring(0, 40);
        db.ref('mort_e_analytics/conversations/' + mortEConversationRef.key + '/topics/' + topicKey)
          .transaction(function (current) { return (current || 0) + 1; });
      }
    }

    logEvent('mort_e_message', {
      message_count: mortEMessageCount,
      topic: topic || 'unknown',
      device_type: getDeviceType(),
    });
  }

  function trackMortEIntent(intentId) {
    if (!intentId) return;
    incrementCounter('mort_e_analytics/intents/' + intentId + '/count');

    // Update last_topic on the intent record
    db.ref('mort_e_analytics/intents/' + intentId).update({
      last_used: firebase.database.ServerValue.TIMESTAMP,
    });

    // Also track via the message function for the conversation record
    trackMortEMessage(intentId);
  }


  /* ═══════════════════════════════════════════════════════════════
     DEMO CLICK TRACKING
     Track how many times each product demo is clicked,
     with device type and referrer for analytics
     ═══════════════════════════════════════════════════════════════ */
  function trackDemoClick(productSlug) {
    incrementCounter('demo_clicks/' + productSlug);

    // Log detailed click event for analytics
    db.ref('demo_clicks/' + productSlug + '/details').push({
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      device: getDeviceType(),
      browser: getBrowser(),
      referrer: getReferrer(),
      session_id: sessionId,
    });

    logEvent('demo_click', {
      product: productSlug,
      device_type: getDeviceType(),
      browser: getBrowser(),
      referrer: getReferrer(),
    });
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
     INITIALIZATION — Auto-run on script load
     ═══════════════════════════════════════════════════════════════ */
  initSession();
  trackPageView();
  initScrollTracking();
  initTimeTracking();

  // Set user properties for GA demographics (device, OS, browser)
  // This populates the "Tech" and "Demographics" reports in GA4
  if (analytics) {
    try {
      analytics.setUserProperties({
        device_type: getDeviceType(),
        browser: getBrowser(),
        os: getOS(),
        language: navigator.language || 'unknown',
      });
    } catch (e) { /* silent */ }
  }
  // Also set user properties via gtag for GA4 dashboard
  if (typeof gtag === 'function') {
    try {
      gtag('set', 'user_properties', {
        device_type: getDeviceType(),
        browser: getBrowser(),
        os: getOS(),
        language: navigator.language || 'unknown',
      });
    } catch (e) { /* silent */ }
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

    // Site Analytics (new)
    trackPageView: trackPageView,
    getDeviceType: getDeviceType,
    getBrowser: getBrowser,
    getOS: getOS,
    getReferrer: getReferrer,
    getSessionId: function () { return sessionId; },

    // GA helper (for custom events from other scripts)
    logEvent: logEvent,

    // Raw access (advanced)
    db: db,
  };

})();
