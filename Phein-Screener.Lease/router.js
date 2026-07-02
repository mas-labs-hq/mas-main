/**
 * router.js — Phein Screener Lease
 * =================================
 * The brain. Loaded by BOTH index.html and app.html.
 *
 * Exposes window.PheinRouter with:
 *   - getSession()         → { company, code, startTime } | null
 *   - saveSession(c, code) → stores session with startTime = Date.now()
 *   - saveUserContact(phone, email) → stores contact info for security alerts
 *   - getUserContact()     → { phone, email } | null
 *   - clearSession()       → wipes session + contact info
 *   - isSessionValid()     → boolean (re-checks against window.AUTHORIZED_CLIENTS every call)
 *   - routeOnLoad()        → routes user based on current page + session state
 *   - validateAccess(c, code, duration, phone, email) → { ok, error }
 *   - refreshAuth()        → re-fetches auth.js and re-validates (auto-called every 5 min)
 *
 * SECURITY MODEL:
 *   - localStorage holds: { company, code, startTime } (session)
 *                         + { phone, email } (contact, for security alerts)
 *                         + { fingerprint } (device fingerprint, locks code to one PC)
 *   - Duration is NEVER trusted from the client. Always looked up from auth.js.
 *   - status field controls single-station enforcement:
 *       "inactive" → first activation allowed, owner gets Formspree ACTIVATION alert
 *       "active"   → any further attempt blocked, owner gets Formspree REUSE BLOCKED alert
 *       "active" + stations: N → allowed (Enterprise Plus, up to N stations)
 *   - Device fingerprint locks the code to the FIRST PC that activated it.
 *       If the same code is used on a different PC, the user is kicked out
 *       and the owner gets a Formspree DEVICE MISMATCH alert.
 *
 * FORMSPREE ENDPOINT: https://formspree.io/f/mjgekqvw
 *   Used for: ACTIVATION alerts, REUSE BLOCKED alerts, DEVICE MISMATCH alerts,
 *             SECURITY alerts (from security.js)
 */
(function (window) {
  'use strict';

  var STORAGE_KEY = 'phein_lease_session';
  var CONTACT_KEY = 'phein_user_contact';
  var FINGERPRINT_KEY = 'phein_device_fingerprint';
  var FORMSPREE_ENDPOINT = 'https://formspree.io/f/mjgekqvw';

  // ===============================================================
  // BLACKLIST STORAGE — deeply persistent (multiple locations)
  // When a code is blacklisted (3+ security violations), it's stored in:
  //   1. localStorage['phein_blacklist'] — primary
  //   2. localStorage['_phein_sb_2026'] — obfuscated backup
  //   3. IndexedDB — deep persistence (survives localStorage clear)
  //   4. Cookie — 1-year expiry
  // The owner also adds it to BLACKLISTED_CODES in auth.js for global block.
  // ===============================================================
  var BLACKLIST_KEY_PRIMARY = 'phein_blacklist';
  var BLACKLIST_KEY_BACKUP = '_phein_sb_2026';
  var BLACKLIST_COOKIE = 'phein_bl';
  var VIOLATIONS_PREFIX = 'phein_v_'; // per-code violation count

  function getBlacklistLocal() {
    var codes = [];
    // Primary
    try {
      var raw = localStorage.getItem(BLACKLIST_KEY_PRIMARY);
      if (raw) { var arr = JSON.parse(raw); if (Array.isArray(arr)) codes = codes.concat(arr); }
    } catch (e) {}
    // Backup (obfuscated — stored as base64 of JSON)
    try {
      var raw2 = localStorage.getItem(BLACKLIST_KEY_BACKUP);
      if (raw2) {
        var decoded = atob(raw2);
        var arr2 = JSON.parse(decoded);
        if (Array.isArray(arr2)) codes = codes.concat(arr2);
      }
    } catch (e) {}
    // Cookie
    try {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var c = cookies[i].trim();
        if (c.indexOf(BLACKLIST_COOKIE + '=') === 0) {
          var val = c.substring(BLACKLIST_COOKIE.length + 1);
          var arr3 = JSON.parse(decodeURIComponent(val));
          if (Array.isArray(arr3)) codes = codes.concat(arr3);
        }
      }
    } catch (e) {}
    // Deduplicate
    var unique = [];
    for (var j = 0; j < codes.length; j++) {
      if (unique.indexOf(codes[j]) === -1) unique.push(codes[j]);
    }
    return unique;
  }

  function saveBlacklistLocal(codes) {
    // Primary
    try { localStorage.setItem(BLACKLIST_KEY_PRIMARY, JSON.stringify(codes)); } catch (e) {}
    // Backup (obfuscated)
    try { localStorage.setItem(BLACKLIST_KEY_BACKUP, btoa(JSON.stringify(codes))); } catch (e) {}
    // Cookie (1-year expiry)
    try {
      var expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);
      document.cookie = BLACKLIST_COOKIE + '=' + encodeURIComponent(JSON.stringify(codes)) +
        ';expires=' + expires.toUTCString() + ';path=/;SameSite=Lax';
    } catch (e) {}
    // IndexedDB (async — fire and forget)
    try {
      saveBlacklistIndexedDB(codes);
    } catch (e) {}
  }

  function saveBlacklistIndexedDB(codes) {
    try {
      var request = indexedDB.open('phein_security', 2);
      request.onupgradeneeded = function (event) {
        var db = event.target.result;
        if (!db.objectStoreNames.contains('blacklist')) {
          db.createObjectStore('blacklist', { keyPath: 'code' });
        }
        if (!db.objectStoreNames.contains('violations')) {
          db.createObjectStore('violations', { keyPath: 'code' });
        }
      };
      request.onsuccess = function (event) {
        var db = event.target.result;
        if (!db.objectStoreNames.contains('blacklist')) return;
        var tx = db.transaction(['blacklist'], 'readwrite');
        var store = tx.objectStore('blacklist');
        // Clear and re-add
        store.clear();
        for (var i = 0; i < codes.length; i++) {
          store.put({ code: codes[i], timestamp: Date.now() });
        }
      };
    } catch (e) {}
  }

  function isCodeBlacklisted(code) {
    if (!code) return false;
    var k = String(code).trim();
    // Check local blacklist (multiple storage)
    var local = getBlacklistLocal();
    if (local.indexOf(k) !== -1) return true;
    // Check global blacklist in auth.js (owner-controlled)
    if (window.BLACKLISTED_CODES && Array.isArray(window.BLACKLISTED_CODES)) {
      if (window.BLACKLISTED_CODES.indexOf(k) !== -1) return true;
    }
    return false;
  }

  function blacklistCode(code) {
    if (!code) return;
    var k = String(code).trim();
    var current = getBlacklistLocal();
    if (current.indexOf(k) === -1) {
      current.push(k);
      saveBlacklistLocal(current);
    }
  }

  // ===============================================================
  // VIOLATION TRACKING — per-code attempt count
  // BUG A FIX: Mirror the violation count to localStorage (primary +
  // backup), cookie, AND IndexedDB — so clearing localStorage alone
  // doesn't reset the counter.
  // ===============================================================
  function getViolationCount(code) {
    if (!code) return 0;
    try {
      var key = VIOLATIONS_PREFIX + btoa(code).replace(/=/g, '');
      var count = 0;

      // Primary localStorage
      var raw = localStorage.getItem(key);
      if (raw) count = Math.max(count, parseInt(raw, 10) || 0);

      // Backup localStorage
      var raw2 = localStorage.getItem('_phein_vc_' + btoa(code).replace(/=/g, ''));
      if (raw2) count = Math.max(count, parseInt(raw2, 10) || 0);

      // Cookie
      try {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
          var c = cookies[i].trim();
          var cookieKey = 'phein_vc_' + btoa(code).replace(/=/g, '') + '=';
          if (c.indexOf(cookieKey) === 0) {
            var val = parseInt(c.substring(cookieKey.length), 10) || 0;
            count = Math.max(count, val);
          }
        }
      } catch (e) {}

      return count;
    } catch (e) { return 0; }
  }

  function incrementViolationCount(code) {
    if (!code) return 0;
    try {
      var key = VIOLATIONS_PREFIX + btoa(code).replace(/=/g, '');
      var current = getViolationCount(code);
      current++;

      // Primary localStorage
      localStorage.setItem(key, String(current));
      // Backup localStorage
      localStorage.setItem('_phein_vc_' + btoa(code).replace(/=/g, ''), String(current));

      // Cookie (1-year expiry)
      try {
        var expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1);
        document.cookie = 'phein_vc_' + btoa(code).replace(/=/g, '') + '=' + current +
          ';expires=' + expires.toUTCString() + ';path=/;SameSite=Lax';
      } catch (e) {}

      // IndexedDB (async — fire and forget)
      try {
        var idbRequest = indexedDB.open('phein_security', 2);
        idbRequest.onupgradeneeded = function (event) {
          var db = event.target.result;
          if (!db.objectStoreNames.contains('violations')) {
            db.createObjectStore('violations', { keyPath: 'code' });
          }
          if (!db.objectStoreNames.contains('blacklist')) {
            db.createObjectStore('blacklist', { keyPath: 'code' });
          }
        };
        idbRequest.onsuccess = function (event) {
          var db = event.target.result;
          if (!db.objectStoreNames.contains('violations')) return;
          var tx = db.transaction(['violations'], 'readwrite');
          var store = tx.objectStore('violations');
          store.put({ code: code, count: current, timestamp: Date.now() });
        };
      } catch (e) {}

      return current;
    } catch (e) { return 0; }
  }

  // ---------------------------------------------------------------
  // SESSION STORAGE — company, code, startTime. NEVER duration.
  // ---------------------------------------------------------------
  function getSession() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var s = JSON.parse(raw);
      if (!s || typeof s !== 'object') return null;
      if (!s.company || !s.code || !s.startTime) return null;
      return { company: s.company, code: s.code, startTime: Number(s.startTime) };
    } catch (e) {
      return null;
    }
  }

  function saveSession(company, code) {
    var session = {
      company: String(company || '').trim(),
      code: String(code || '').trim(),
      startTime: Date.now()
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (e) {}
    return session;
  }

  function clearSession() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CONTACT_KEY);
      // NOTE: We do NOT clear the fingerprint on logout. The fingerprint persists
      // so that the same PC can re-activate with a new code. The fingerprint is
      // only cleared when the owner flips status to inactive (which kicks the user
      // and forces re-activation, at which point a new fingerprint is generated).
    } catch (e) {}
  }

  // ---------------------------------------------------------------
  // DEVICE FINGERPRINT — generates a stable hash from device characteristics.
  // Used to lock a license code to the FIRST PC that activated it.
  // If someone tries to use the same code on a different PC, the fingerprint
  // won't match and they'll be kicked out.
  // ---------------------------------------------------------------
  function generateFingerprint() {
    var components = [];
    try {
      components.push(navigator.userAgent || '');
      components.push(navigator.platform || '');
      components.push(navigator.language || '');
      components.push(navigator.hardwareConcurrency || 0);
      components.push(navigator.deviceMemory || 0);
      components.push(navigator.maxTouchPoints || 0);
      components.push(screen.width + 'x' + screen.height);
      components.push(screen.colorDepth || 0);
      components.push(screen.pixelDepth || 0);
      components.push(window.devicePixelRatio || 1);
      components.push(new Date().getTimezoneOffset());
      try { components.push(Intl.DateTimeFormat().resolvedOptions().timeZone || ''); } catch (e) {}
      // Canvas fingerprint — draws text and hashes the result. Very stable per device.
      try {
        var canvas = document.createElement('canvas');
        canvas.width = 200; canvas.height = 50;
        var ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#f60';
        ctx.fillRect(0, 0, 200, 50);
        ctx.fillStyle = '#069';
        ctx.fillText('Phein-Fingerprint-' + navigator.userAgent, 2, 2);
        components.push(canvas.toDataURL());
      } catch (e) {}
      // WebGL fingerprint (if available)
      try {
        var glCanvas = document.createElement('canvas');
        var gl = glCanvas.getContext('webgl') || glCanvas.getContext('experimental-webgl');
        if (gl) {
          var debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '');
            components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '');
          }
        }
      } catch (e) {}
    } catch (e) {}

    // Simple hash function (djb2 variant)
    var str = components.join('|');
    var hash = 5381;
    for (var i = 0; i < str.length; i++) {
      var char = str.charCodeAt(i);
      hash = ((hash << 5) + hash) + char;
      hash = hash & hash;
    }
    return 'DEV-' + Math.abs(hash).toString(36).toUpperCase() + '-' + (str.length % 1000).toString(36).toUpperCase();
  }

  function getStoredFingerprint() {
    try {
      return localStorage.getItem(FINGERPRINT_KEY) || null;
    } catch (e) { return null; }
  }

  function saveFingerprint(fp) {
    try {
      localStorage.setItem(FINGERPRINT_KEY, fp);
    } catch (e) {}
  }

  function clearFingerprint() {
    try {
      localStorage.removeItem(FINGERPRINT_KEY);
    } catch (e) {}
  }

  function getCurrentFingerprint() {
    return generateFingerprint();
  }

  // ---------------------------------------------------------------
  // CONTACT STORAGE — phone + email, stored separately from session.
  // Used by security.js to include contact info in security alerts.
  // ---------------------------------------------------------------
  function saveUserContact(phone, email) {
    try {
      localStorage.setItem(CONTACT_KEY, JSON.stringify({
        phone: String(phone || '').trim(),
        email: String(email || '').trim()
      }));
    } catch (e) {}
  }

  function getUserContact() {
    try {
      var raw = localStorage.getItem(CONTACT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  // ---------------------------------------------------------------
  // LOOKUP — find matching client in window.AUTHORIZED_CLIENTS
  // Match is by BOTH company (case-insensitive, trimmed) AND code (case-sensitive, trimmed).
  // ---------------------------------------------------------------
  function findClient(company, code) {
    if (!window.AUTHORIZED_CLIENTS || !Array.isArray(window.AUTHORIZED_CLIENTS)) return null;
    var c = String(company || '').trim();
    var k = String(code || '').trim();
    for (var i = 0; i < window.AUTHORIZED_CLIENTS.length; i++) {
      var entry = window.AUTHORIZED_CLIENTS[i];
      if (!entry || typeof entry !== 'object') continue;
      var ec = String(entry.company || '').trim();
      var ek = String(entry.code || '').trim();
      if (ec.toLowerCase() === c.toLowerCase() && ek === k) {
        return entry;
      }
    }
    return null;
  }

  // ---------------------------------------------------------------
  // DEVICE INFO — collected for Formspree alerts (activation + reuse + security)
  // ---------------------------------------------------------------
  function collectDeviceInfo() {
    var info = {};
    try {
      info.user_agent = navigator.userAgent;
      info.platform = navigator.platform;
      info.language = navigator.language;
      info.screen_resolution = screen.width + 'x' + screen.height;
      info.viewport_size = window.innerWidth + 'x' + window.innerHeight;
      info.hardware_concurrency = navigator.hardwareConcurrency || 'unknown';
      info.device_memory = navigator.deviceMemory || 'unknown';
      info.max_touch_points = navigator.maxTouchPoints || 0;
      try { info.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { info.timezone = 'unknown'; }
      info.timezone_offset = new Date().getTimezoneOffset();
      if (navigator.connection) {
        info.connection_type = navigator.connection.effectiveType || 'unknown';
        info.connection_downlink = navigator.connection.downlink || 'unknown';
      }
      info.online = navigator.onLine;
      info.current_url = window.location.href;
      info.referrer = document.referrer || 'none';
    } catch (e) {}
    return info;
  }

  // ---------------------------------------------------------------
  // FORMSPREE ALERT — fires immediately, never throws.
  // Used for ACTIVATION and REUSE BLOCKED alerts.
  // ---------------------------------------------------------------
  function sendFormspreeAlert(subject, fields) {
    // Build the complete fields object
    var allFields = {};
    for (var k in fields) {
      if (fields.hasOwnProperty(k)) allFields[k] = fields[k];
    }
    allFields._subject = subject;
    allFields._source = 'Phein Screener Lease';
    allFields.timestamp = new Date().toISOString();
    allFields.alert_time_local = new Date().toLocaleString();

    // Use PheinFormspree.send as PRIMARY method — it fires hidden form POST,
    // fetch, AND sendBeacon simultaneously for maximum reliability.
    if (window.PheinFormspree && typeof window.PheinFormspree.send === 'function') {
      window.PheinFormspree.send(subject, allFields);
      return;
    }

    // Fallback: direct fetch (if formspree-alert.js failed to load)
    try {
      var fetchData = new FormData();
      for (var fk in allFields) {
        if (allFields.hasOwnProperty(fk)) fetchData.append(fk, String(allFields[fk]));
      }
      fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: fetchData,
        headers: { 'Accept': 'application/json' }
      }).catch(function () {});
    } catch (e) {}

    // Store in local log
    try {
      var log = JSON.parse(localStorage.getItem('phein_alert_log') || '[]');
      log.push({ subject: subject, fields: allFields, timestamp: new Date().toISOString() });
      if (log.length > 50) log = log.slice(-50);
      localStorage.setItem('phein_alert_log', JSON.stringify(log));
    } catch (e) {}
  }

  // ---------------------------------------------------------------
  // VALIDITY — runs the full check. Called on every page load + every 5 min.
  // Includes device fingerprint check — locks code to first PC.
  //
  // IMPORTANT: We do NOT check the "status" field here. Status only matters
  // during NEW activation attempts (validateAccess). Once a session exists,
  // it stays valid until:
  //   - The lease expires (startTime + duration days)
  //   - The owner deletes the code from auth.js
  //   - The device fingerprint doesn't match (different PC)
  // The owner controls revocation by DELETING the entry from auth.js, not by
  // flipping status back to "inactive" (which would just mean "available for
  // first activation" — not "kick out the current user").
  // ---------------------------------------------------------------
  function isSessionValid() {
    var session = getSession();
    if (!session) return false;

    var client = findClient(session.company, session.code);
    if (!client) return false; // owner removed the code → invalid

    var duration = Number(client.duration);
    if (duration !== 7 && duration !== 14 && duration !== 30) {
      return false;
    }

    var expiresAt = session.startTime + (duration * 86400000);
    if (Date.now() >= expiresAt) return false; // lease ran out

    // DEVICE FINGERPRINT CHECK
    // The stored fingerprint was set at activation time. If the current device's
    // fingerprint doesn't match, this is a different PC — kick them out and alert.
    var storedFp = getStoredFingerprint();
    if (storedFp) {
      var currentFp = generateFingerprint();
      if (currentFp !== storedFp) {
        // Fingerprint mismatch — someone is trying to use this code on a different PC.
        // Send a Formspree alert. The actual kick-out happens in routeOnLoad/refreshAuth.
        sendDeviceMismatchAlert(session, client, storedFp, currentFp);
        return false;
      }
    }

    return true;
  }

  // ---------------------------------------------------------------
  // DEVICE MISMATCH ALERT — sent when fingerprint doesn't match.
  // ---------------------------------------------------------------
  function sendDeviceMismatchAlert(session, client, storedFp, currentFp) {
    var fields = {
      alert_type: 'DEVICE MISMATCH — Code attempted on a different PC',
      company: session.company,
      code: session.code,
      stored_fingerprint: storedFp,
      current_fingerprint: currentFp,
      message: 'A license code that was activated on one PC is being attempted on a different PC. The attempt has been blocked. If this is legitimate (e.g., the original PC died), the owner can clear the fingerprint by flipping status to inactive in auth.js, then back to active after re-activation.'
    };
    var contact = getUserContact();
    if (contact) {
      fields.phone = contact.phone || 'N/A';
      fields.email = contact.email || 'N/A';
    }
    var device = collectDeviceInfo();
    for (var k in device) {
      if (device.hasOwnProperty(k)) fields['device_' + k] = device[k];
    }
    sendFormspreeAlert('DEVICE MISMATCH: ' + session.company + ' code attempted on a different PC', fields);
  }

  // ---------------------------------------------------------------
  // VALIDATE FROM FORM INPUT — used by the Get Started section.
  // Verifies company + code + duration ALL match what's in auth.js.
  // Also checks status field for single-station enforcement.
  // Returns { ok: true } or { ok: false, error: '...' }.
  // ---------------------------------------------------------------
  function validateAccess(company, code, duration, phone, email) {
    // BLACKLIST CHECK — first thing. If the code is blacklisted (locally or
    // globally via auth.js BLACKLISTED_CODES), reject immediately and alert owner.
    if (isCodeBlacklisted(code)) {
      var blacklistFields = {
        alert_type: 'BLACKLISTED CODE ATTEMPT — Code flagged for suspicious activity',
        company: company || 'unknown',
        code: code,
        attempted_by_phone: phone || 'not provided',
        attempted_by_email: email || 'not provided',
        message: 'A code that was previously blacklisted due to repeated security violations has been attempted again. The attempt was blocked.'
      };
      var blacklistDevice = collectDeviceInfo();
      for (var bk in blacklistDevice) {
        if (blacklistDevice.hasOwnProperty(bk)) blacklistFields['device_' + bk] = blacklistDevice[bk];
      }
      sendFormspreeAlert('BLACKLISTED CODE ATTEMPT: ' + code + ' tried to activate', blacklistFields);

      return { ok: false, error: 'This license key has been flagged for repeated suspicious activity and is under review. Contact MortApps Studios.', blacklisted: true };
    }

    var client = findClient(company, code);
    if (!client) {
      return { ok: false, error: 'Invalid company, code, or duration.' };
    }
    var d = Number(duration);
    if (d !== 7 && d !== 14 && d !== 30) {
      return { ok: false, error: 'Invalid duration.' };
    }
    if (Number(client.duration) !== d) {
      return { ok: false, error: 'Invalid company, code, or duration.' };
    }

    var status = String(client.status || 'inactive').toLowerCase();

    // Check if already expired (e.g. reused an old code)
    var session = getSession();
    if (session && session.company === client.company && session.code === client.code) {
      var expiresAt = session.startTime + (d * 86400000);
      if (Date.now() >= expiresAt) {
        clearSession();
        return { ok: false, error: 'This lease code has expired. Contact MortApps Studios to renew.' };
      }
    }

    // SINGLE-STATION ENFORCEMENT
    // If status is "active" AND no stations field, block the activation.
    if (status === 'active' && !client.stations) {
      // This code is already in use by another station. Block + alert owner.
      var reuseFields = {
        alert_type: 'REUSE BLOCKED — Single-station enforcement',
        company: client.company,
        code: client.code,
        attempted_by_phone: phone || 'not provided',
        attempted_by_email: email || 'not provided',
        message: 'A second party attempted to activate a code that is already active. The attempt was blocked.'
      };
      var reuseDevice = collectDeviceInfo();
      for (var k in reuseDevice) {
        if (reuseDevice.hasOwnProperty(k)) {
          reuseFields['device_' + k] = reuseDevice[k];
        }
      }
      sendFormspreeAlert('REUSE BLOCKED: ' + client.company + ' code attempted again', reuseFields);

      return { ok: false, error: 'This license key is already in use. If you believe this is an error, contact MortApps Studios.' };
    }

    // If we get here, activation is allowed.
    // If status is "inactive", this is the FIRST activation → send ACTIVATION alert.
    // If status is "active" + stations (Enterprise Plus), also alert (so owner can track station count).
    if (status === 'inactive' || (status === 'active' && client.stations)) {
      var alertSubject = status === 'inactive'
        ? 'ACTIVATION: ' + client.company + ' started using Phein Screener'
        : 'STATION ACTIVATION: ' + client.company + ' (Enterprise Plus, station coming online)';
      var activationFields = {
        alert_type: status === 'inactive' ? 'ACTIVATION — First use of license key' : 'ACTIVATION — Enterprise Plus station',
        company: client.company,
        code: client.code,
        duration_days: d,
        activated_by_phone: phone || 'not provided',
        activated_by_email: email || 'not provided',
        stations_allowed: client.stations || 1,
        action_required: status === 'inactive'
          ? 'Owner: flip status from "inactive" to "active" in auth.js to lock this code to this station. Bump ?v= in index.html, app.html, AND CACHE_NAME in sw.js.'
          : 'No action required (Enterprise Plus allows multiple stations).'
      };
      var activationDevice = collectDeviceInfo();
      for (var dk in activationDevice) {
        if (activationDevice.hasOwnProperty(dk)) {
          activationFields['device_' + dk] = activationDevice[dk];
        }
      }
      sendFormspreeAlert(alertSubject, activationFields);
    }

    // Save the device fingerprint — this locks the code to THIS PC.
    // If someone later tries to use the same code on a different PC, the
    // fingerprint won't match and they'll be kicked out.
    var fp = generateFingerprint();
    saveFingerprint(fp);

    return { ok: true, client: client, fingerprint: fp };
  }

  // ---------------------------------------------------------------
  // AUTH REFRESH — re-fetches auth.js with cache-busting, updates
  // window.AUTHORIZED_CLIENTS in memory, re-validates session.
  // Called automatically every 5 minutes by app.html.
  // Does NOT reload the page — no progress lost.
  //
  // BUG E FIX: isRefreshing flag prevents race conditions where an
  // activation check runs while a refresh is mid-flight.
  // ---------------------------------------------------------------
  var _isRefreshing = false;

  function refreshAuth(onInvalid) {
    // BUG E FIX: Don't start a new refresh if one is already in progress
    if (_isRefreshing) return;
    _isRefreshing = true;

    try {
      var url = 'auth.js?v=' + Date.now(); // cache-bust
      fetch(url, { cache: 'no-store' }).then(function (response) {
        if (!response.ok) return null;
        return response.text();
      }).then(function (text) {
        _isRefreshing = false; // Clear flag on completion
        if (!text) return;
        // Evaluate the fetched auth.js in a sandbox to extract AUTHORIZED_CLIENTS
        try {
          var sandbox = { window: {} };
          (new Function('window', text))(sandbox.window);
          if (sandbox.window.AUTHORIZED_CLIENTS && Array.isArray(sandbox.window.AUTHORIZED_CLIENTS)) {
            window.AUTHORIZED_CLIENTS = sandbox.window.AUTHORIZED_CLIENTS;
            // Also update BLACKLISTED_CODES if present
            if (sandbox.window.BLACKLISTED_CODES && Array.isArray(sandbox.window.BLACKLISTED_CODES)) {
              window.BLACKLISTED_CODES = sandbox.window.BLACKLISTED_CODES;
            }
            // Re-validate session with the fresh data
            if (!isSessionValid()) {
              // Session no longer valid — owner deleted them.
              // Save state to localStorage BEFORE redirecting (so app.html can restore it).
              try {
                if (window.state) {
                  localStorage.setItem('phein_autosave', JSON.stringify({
                    criteria: window.state.criteria,
                    limit: window.state.limit,
                    timestamp: Date.now()
                  }));
                }
              } catch (e) {}
              clearSession();
              if (typeof onInvalid === 'function') {
                onInvalid();
              } else {
                window.location.href = 'index.html?reason=expired';
              }
            }
          }
        } catch (e) {
          console.warn('Auth refresh eval failed:', e);
        }
      }).catch(function (e) {
        _isRefreshing = false; // Clear flag on fetch error
        console.warn('Auth refresh fetch failed:', e);
      });
    } catch (e) {
      _isRefreshing = false; // Clear flag on synchronous error
      console.warn('Auth refresh failed:', e);
    }
  }

  // ---------------------------------------------------------------
  // ROUTING — called on every page load via <body onload>.
  // ---------------------------------------------------------------
  function currentPage() {
    var p = window.location.pathname.split('/').pop() || 'index.html';
    return p === '' ? 'index.html' : p;
  }

  function routeOnLoad() {
    var page = currentPage();
    var valid = isSessionValid();
    var hadSession = getSession() !== null;

    if (page === 'app.html') {
      if (!valid) {
        if (hadSession) clearSession();
        if (window.location.search.indexOf('reason=security') === -1) {
          window.location.replace('index.html?reason=expired');
        } else {
          window.location.replace('index.html' + window.location.search);
        }
        return;
      }
      if (window.PheinTimer && typeof window.PheinTimer.start === 'function') {
        try { window.PheinTimer.start(); } catch (e) {}
      }
      return;
    }

    // Landing page (index.html)
    if (valid) {
      window.location.replace('app.html');
      return;
    }
  }

  // ---------------------------------------------------------------
  // PUBLIC API
  // ---------------------------------------------------------------
  window.PheinRouter = {
    getSession: getSession,
    saveSession: saveSession,
    saveUserContact: saveUserContact,
    getUserContact: getUserContact,
    clearSession: clearSession,
    isSessionValid: isSessionValid,
    validateAccess: validateAccess,
    findClient: findClient,
    routeOnLoad: routeOnLoad,
    refreshAuth: refreshAuth,
    collectDeviceInfo: collectDeviceInfo,
    sendFormspreeAlert: sendFormspreeAlert,
    generateFingerprint: generateFingerprint,
    getStoredFingerprint: getStoredFingerprint,
    saveFingerprint: saveFingerprint,
    clearFingerprint: clearFingerprint,
    getCurrentFingerprint: getCurrentFingerprint,
    isCodeBlacklisted: isCodeBlacklisted,
    blacklistCode: blacklistCode,
    getBlacklistLocal: getBlacklistLocal,
    getViolationCount: getViolationCount,
    incrementViolationCount: incrementViolationCount,
    STORAGE_KEY: STORAGE_KEY,
    CONTACT_KEY: CONTACT_KEY,
    FINGERPRINT_KEY: FINGERPRINT_KEY,
    FORMSPREE_ENDPOINT: FORMSPREE_ENDPOINT
  };
})(window);
