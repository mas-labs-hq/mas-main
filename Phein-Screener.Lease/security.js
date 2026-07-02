/**
 * security.js — Phein Screener Lease
 * ===================================
 * Hardening layer. Loaded by BOTH index.html and app.html.
 *
 * RESPONSIBILITIES (all from brief section 8):
 *   8.A  PC-only access — block all phones/tablets before any other JS runs.
 *   8.B  Always-online enforcement — offline overlay, UI lock, re-validate on reconnect.
 *   8.C  DevTools blocking — 9 detection methods (right-click, kbd shortcuts,
 *        select/copy/cut, drag, window-size delta, debugger timing, console getter,
 *        view-source protocol, suspicious UA).
 *   8.D  Tripwire — POST to Formspree (mjgekqvw) with subject
 *        "SECURITY ALERT: DevTools/Tampering Attempt — {CompanyName}",
 *        with 30s cooldown + 3 alerts/session cap, then redirect to
 *        index.html?reason=security (only from app.html).
 *
 * NOTE on the mobile block:
 *   The brief specifies a SECOND mobile check that runs at the very top of <head>
 *   in BOTH HTML files (before any other JS). That early block is inlined in the
 *   HTML. This file contains the mobile CSS-overlay fallback + all other checks.
 */
(function (window, document) {
  'use strict';

  // ===============================================================
  // CONFIG — Formspree endpoint (SAME as reviews; differentiated by _subject)
  // ===============================================================
  var SECURITY_ALERT_FORMSPREE_ID = 'mjgekqvw';
  // Note: The old alertCooldown/alertCount/MAX_ALERTS_PER_SESSION system has been
  // replaced by the 3-strike violation system in router.js (getViolationCount /
  // incrementViolationCount). The new system persists across sessions and
  // blacklists the code after 3 violations.

  // ===============================================================
  // SESSION HELPER (lazy import from router.js — security.js loads first,
  // router.js loads later; we tolerate either order via direct localStorage fallback)
  // ===============================================================
  function getSession() {
    if (window.PheinRouter && typeof window.PheinRouter.getSession === 'function') {
      return window.PheinRouter.getSession();
    }
    // Direct fallback if router.js hasn't loaded yet
    try {
      var raw = localStorage.getItem('phein_lease_session');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function clearSession() {
    if (window.PheinRouter && typeof window.PheinRouter.clearSession === 'function') {
      try { window.PheinRouter.clearSession(); } catch (e) {}
    } else {
      try { localStorage.removeItem('phein_lease_session'); } catch (e) {}
    }
  }

  // ===============================================================
  // 8.D — DEVTOOLS TRIPWIRE → FORMSPREE ALERT (3-strike system)
  // ===============================================================
  function collectSecurityDeviceInfo() {
    var info = {};
    try {
      info.user_agent = navigator.userAgent;
      info.platform = navigator.platform;
      info.language = navigator.language;
      info.screen_resolution = screen.width + 'x' + screen.height;
      info.viewport_size = window.innerWidth + 'x' + window.innerHeight;
      info.device_pixel_ratio = window.devicePixelRatio;
      info.hardware_concurrency = navigator.hardwareConcurrency || 'unknown';
      info.device_memory = navigator.deviceMemory || 'unknown';
      info.max_touch_points = navigator.maxTouchPoints || 0;
      try { info.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { info.timezone = 'unknown'; }
      info.timezone_offset = new Date().getTimezoneOffset();
      if (navigator.connection) {
        info.connection_type = navigator.connection.effectiveType || 'unknown';
        info.connection_downlink = navigator.connection.downlink || 'unknown';
        info.connection_rtt = navigator.connection.rtt || 'unknown';
      }
      info.online = navigator.onLine;
      info.current_url = window.location.href;
      info.referrer = document.referrer || 'none';
    } catch (e) {}
    return info;
  }

  var MAX_VIOLATIONS = 3;

  function flagDevToolsAttempt(method) {
    var session = getSession();
    var company = (session && session.company) ? session.company : 'UNKNOWN (pre-login)';
    var code = (session && session.code) ? session.code : 'N/A';

    // ===============================================================
    // BUG B FIX: Check blacklist BEFORE incrementing violation count.
    // If the code is already blacklisted, go straight to third-strike
    // behavior (don't give them 3 fresh strikes).
    // ===============================================================
    var alreadyBlacklisted = false;
    if (code !== 'N/A' && window.PheinRouter && typeof window.PheinRouter.isCodeBlacklisted === 'function') {
      alreadyBlacklisted = window.PheinRouter.isCodeBlacklisted(code);
    }

    var violationCount;
    var isThirdStrike;

    if (alreadyBlacklisted) {
      // Already blacklisted — go straight to final strike behavior
      violationCount = MAX_VIOLATIONS;
      isThirdStrike = true;
    } else {
      // Get current violation count for this code and increment
      violationCount = 0;
      if (window.PheinRouter && typeof window.PheinRouter.getViolationCount === 'function' && code !== 'N/A') {
        violationCount = window.PheinRouter.incrementViolationCount(code);
      }
      isThirdStrike = violationCount >= MAX_VIOLATIONS;
    }

    // Get phone + email from localStorage
    var contact = { phone: 'N/A', email: 'N/A' };
    if (window.PheinRouter && typeof window.PheinRouter.getUserContact === 'function') {
      var c = window.PheinRouter.getUserContact();
      if (c) {
        contact.phone = c.phone || 'N/A';
        contact.email = c.email || 'N/A';
      }
    }

    // Determine alert level
    var alertSubject;
    var alertType;

    if (isThirdStrike) {
      alertSubject = 'CODE BLACKLISTED: ' + company + ' — 3 security violations, access revoked';
      alertType = 'CODE BLACKLISTED — Maximum security violations exceeded';
      if (window.PheinRouter && typeof window.PheinRouter.blacklistCode === 'function' && code !== 'N/A') {
        window.PheinRouter.blacklistCode(code);
      }
    } else {
      alertSubject = 'SECURITY ALERT: DevTools/Tampering Attempt — ' + company + ' (Strike ' + violationCount + ' of ' + MAX_VIOLATIONS + ')';
      alertType = 'Security Alert — DevTools / Tampering Attempt (Strike ' + violationCount + ' of ' + MAX_VIOLATIONS + ')';
    }

    // Build alert fields
    var alertFields = {
      alert_type: alertType,
      company: company,
      code: code,
      method: method,
      phone: contact.phone,
      email: contact.email,
      user_agent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      alert_time_local: new Date().toLocaleString(),
      violation_count: String(violationCount),
      max_violations: String(MAX_VIOLATIONS),
      action_taken: isThirdStrike
        ? 'CODE BLACKLISTED. The user has been kicked out and their code is now blocked. Add this code to BLACKLISTED_CODES in auth.js to enforce globally, then bump the version.'
        : 'Warning shown to user. ' + (MAX_VIOLATIONS - violationCount) + ' more violation(s) will result in permanent blacklist.'
    };

    // Append device info
    var deviceInfo = collectSecurityDeviceInfo();
    for (var key in deviceInfo) {
      if (deviceInfo.hasOwnProperty(key)) {
        alertFields['device_' + key] = String(deviceInfo[key]);
      }
    }

    // ===============================================================
    // SEND ALERT — use PheinFormspree.send as PRIMARY method.
    // It fires hidden form POST (no CORS!), fetch, AND sendBeacon
    // simultaneously for maximum reliability.
    // ===============================================================
    var fullFields = {};
    for (var afk in alertFields) {
      if (alertFields.hasOwnProperty(afk)) fullFields[afk] = alertFields[afk];
    }
    fullFields._subject = alertSubject;
    fullFields._source = 'Phein Screener Lease';

    if (window.PheinFormspree && typeof window.PheinFormspree.send === 'function') {
      window.PheinFormspree.send(alertSubject, fullFields);
    } else {
      // Fallback: direct fetch if formspree-alert.js failed to load
      try {
        var fetchData = new FormData();
        for (var fk in fullFields) {
          if (fullFields.hasOwnProperty(fk)) fetchData.append(fk, String(fullFields[fk]));
        }
        fetch('https://formspree.io/f/' + SECURITY_ALERT_FORMSPREE_ID, {
          method: 'POST',
          body: fetchData,
          headers: { 'Accept': 'application/json' }
        }).catch(function () {});
      } catch (e) {}
    }

    // Show warning popup to the user
    showSecurityWarningPopup(violationCount, isThirdStrike);

    // ===============================================================
    // REDIRECT LOGIC:
    //   Strike 1 and 2: DO NOT REDIRECT. User stays in the app.
    //                    They see the warning popup and can continue.
    //   Strike 3: Blacklist + redirect to landing after 5 seconds
    //             (5 seconds gives fetch time to complete before navigation)
    // ===============================================================
    if (isThirdStrike) {
      var page = (window.location.pathname.split('/').pop() || 'index.html');
      if (page === 'app.html') {
        setTimeout(function () {
          try { clearSession(); } catch (e) {}
          window.location.href = 'index.html?reason=blocked';
        }, 5000); // 5 seconds — gives fetch time to complete
      }
    }
    // Strikes 1 and 2: NO REDIRECT. User stays in the app.
  }

  // ===============================================================
  // SECURITY WARNING POPUP — shown to user on each violation
  // ===============================================================
  function showSecurityWarningPopup(violationCount, isFinal) {
    // Remove any existing popup
    var existing = document.getElementById('phein-security-warning');
    if (existing) existing.parentNode.removeChild(existing);

    var overlay = document.createElement('div');
    overlay.id = 'phein-security-warning';
    overlay.style.cssText = [
      'position:fixed', 'top:0', 'left:0', 'width:100vw', 'height:100vh',
      'background:rgba(2,6,23,0.85)', 'z-index:999999',
      'display:flex', 'align-items:center', 'justify-content:center',
      'padding:2rem', 'backdrop-filter:blur(6px)', '-webkit-backdrop-filter:blur(6px)',
      'animation:fadeIn 0.2s ease-out'
    ].join(';') + ';';

    var iconColor, title, message, btnText;
    if (isFinal) {
      iconColor = '#dc2626';
      title = 'Access Revoked';
      message = 'You have exceeded the maximum number of permitted security violations. Your license has been revoked and your access key has been blacklisted. This incident has been reported to MortApps Studios and is under review. You will be redirected to the home page shortly.';
      btnText = 'I understand';
    } else {
      var remaining = MAX_VIOLATIONS - violationCount;
      iconColor = '#f59e0b';
      title = 'Security Warning — Strike ' + violationCount + ' of ' + MAX_VIOLATIONS;
      message = 'Suspicious activity has been detected (attempt to access developer tools or tamper with the application). This is violation ' + violationCount + ' of ' + MAX_VIOLATIONS + '. You have ' + remaining + ' warning' + (remaining === 1 ? '' : 's') + ' remaining before your access is permanently revoked. This incident has been reported to MortApps Studios.';
      btnText = 'I understand';
    }

    overlay.innerHTML =
      '<div style="background:#fff;border-radius:20px;padding:2.5rem;max-width:480px;width:100%;text-align:center;box-shadow:0 30px 60px rgba(0,0,0,0.4);animation:scaleIn 0.25s ease-out;">' +
        '<div style="width:72px;height:72px;border-radius:50%;margin:0 auto 1.25rem;display:flex;align-items:center;justify-content:center;background:' + (isFinal ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)') + ';">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="' + iconColor + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:36px;height:36px;">' +
            '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>' +
            '<line x1="12" y1="9" x2="12" y2="13"/>' +
            '<line x1="12" y1="17" x2="12.01" y2="17"/>' +
          '</svg>' +
        '</div>' +
        '<h2 style="font-family:system-ui,sans-serif;font-size:1.5rem;font-weight:700;color:#0f172a;margin:0 0 1rem;letter-spacing:-0.02em;">' + title + '</h2>' +
        '<p style="font-family:system-ui,sans-serif;font-size:0.95rem;line-height:1.65;color:#64748b;margin:0 0 1.75rem;">' + message + '</p>' +
        '<button id="phein-security-warn-close" style="background:' + (isFinal ? '#dc2626' : '#2563eb') + ';color:#fff;border:none;border-radius:10px;padding:0.85rem 2rem;font-size:0.95rem;font-weight:600;cursor:pointer;font-family:inherit;width:100%;">' + btnText + '</button>' +
      '</div>' +
      '<style>@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes scaleIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}</style>';

    document.body.appendChild(overlay);

    var closeBtn = document.getElementById('phein-security-warn-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      });
    }
  }

  // ===============================================================
  // 8.C — DEVTOOLS BLOCKING (multi-layer)
  // ===============================================================

  // 1. Block right-click context menu
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    return false;
  });

  // 2. Block keyboard shortcuts for DevTools / view-source / save
  document.addEventListener('keydown', function (e) {
    var key = (e.key || '').toLowerCase();
    var ctrl = e.ctrlKey || e.metaKey;
    var shift = e.shiftKey;
    if (e.key === 'F12') {
      e.preventDefault(); flagDevToolsAttempt('F12 key'); return false;
    }
    if (ctrl && shift && (key === 'i' || key === 'j' || key === 'c')) {
      e.preventDefault(); flagDevToolsAttempt('Ctrl+Shift+' + key.toUpperCase()); return false;
    }
    if (ctrl && key === 'u') {
      e.preventDefault(); flagDevToolsAttempt('Ctrl+U view source'); return false;
    }
    if (ctrl && key === 's') {
      e.preventDefault(); flagDevToolsAttempt('Ctrl+S save'); return false;
    }
    if (ctrl && shift && key === 'k') {
      e.preventDefault(); flagDevToolsAttempt('Ctrl+Shift+K'); return false;
    }
  });

  // 3. Block text selection and copy/cut (anti-copy)
  // BUG C FIX: Exclude input, textarea, and select elements so users can
  // copy/paste in form fields (email, phone, access codes, reviews, etc.).
  // These listeners should only fire on non-form content.
  function isFormElement(target) {
    if (!target || !target.tagName) return false;
    var tag = target.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
  }

  document.addEventListener('selectstart', function (e) {
    if (isFormElement(e.target)) return; // allow selection in form fields
    e.preventDefault(); return false;
  });
  document.addEventListener('copy', function (e) {
    if (isFormElement(e.target)) return; // allow copy in form fields
    e.preventDefault(); flagDevToolsAttempt('Copy attempt'); return false;
  });
  document.addEventListener('cut', function (e) {
    if (isFormElement(e.target)) return; // allow cut in form fields
    e.preventDefault(); flagDevToolsAttempt('Cut attempt'); return false;
  });

  // 4. Block image dragging
  document.addEventListener('dragstart', function (e) { e.preventDefault(); return false; });

  // ===============================================================
  // AGGRESSIVE DEVTOOLS DETECTION — ONLY on app.html (the actual app),
  // NEVER on index.html (the landing page). Mobile devices are also
  // exempt because mobile browser chrome causes false positives on
  // the window-size delta check.
  // ===============================================================
  var _isMobileDevice = (function () {
    var ua = (navigator.userAgent || navigator.vendor || window.opera || '').toString();
    var uaMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(ua);
    var touchOnly = ('ontouchstart' in window) && (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    var smallScreen = window.innerWidth < 1024;
    return uaMobile || (touchOnly && smallScreen);
  })();

  var _isAppPage = (function () {
    var p = window.location.pathname.split('/').pop() || 'index.html';
    return p === 'app.html';
  })();

  // Only run aggressive detection on app.html AND on desktop (non-mobile)
  var _runAggressiveDetection = _isAppPage && !_isMobileDevice;

  // 5. DevTools detection via window-size delta
  //    SKIP on landing page and mobile (mobile browser chrome causes false positives)
  if (_runAggressiveDetection) {
    (function () {
      var devtoolsOpen = false;
      var threshold = 160;
      setInterval(function () {
        var widthDiff = window.outerWidth - window.innerWidth;
        var heightDiff = window.outerHeight - window.innerHeight;
        var open = widthDiff > threshold || heightDiff > threshold;
        if (open && !devtoolsOpen) {
          devtoolsOpen = true;
          flagDevToolsAttempt('DevTools window-size detection');
        }
        devtoolsOpen = open;
      }, 1000);
    })();
  }

  // 6. DevTools detection via debugger timing
  //    SKIP on landing page and mobile
  if (_runAggressiveDetection) {
    (function () {
      setInterval(function () {
        var start = performance.now();
        // eslint-disable-next-line no-debugger
        debugger;
        var end = performance.now();
        if (end - start > 100) {
          flagDevToolsAttempt('DevTools debugger timing detection');
        }
      }, 4000);
    })();
  }

  // 7. Console detection via object getter
  //    SKIP on landing page and mobile (console.clear() every 3s is disruptive)
  if (_runAggressiveDetection) {
    (function () {
      var element = new Image();
      Object.defineProperty(element, 'id', {
        get: function () {
          flagDevToolsAttempt('Console open detection');
          return '';
        }
      });
      setInterval(function () {
        try { console.log(element); } catch (e) {}
        try { console.clear(); } catch (e) {}
      }, 3000);
    })();
  }

  // 8. Block view-source: protocol navigation
  if (location.protocol === 'view-source:' || document.URL.indexOf('view-source:') === 0) {
    flagDevToolsAttempt('view-source protocol');
    window.location.href = 'index.html';
  }

  // 9. Detect suspicious user agents (headless browsers, curl, wget, scrapers)
  //    NOTE: AI bot blocking is handled separately in app.html only — the landing
  //    page (index.html) stays open to AI crawlers for marketing/SEO. Only the
  //    app itself (app.html) blocks AI. This check here is for general scrapers
  //    and only fires on app.html (since security.js is loaded by both pages,
  //    but the redirect target ai-warning.html is fine for both).
  (function () {
    var suspiciousUA = /headlesschrome|phantomjs|selenium|puppeteer|python-requests|httpclient|libwww|java\/|perl|ruby|go-http|okhttp/i;
    if (suspiciousUA.test(navigator.userAgent)) {
      flagDevToolsAttempt('Suspicious user agent: ' + navigator.userAgent);
      document.body.innerHTML = '<h1 style="font-family:sans-serif;text-align:center;padding:4rem;">Access denied.</h1>';
    }
  })();

  // ===============================================================
  // 8.B — ALWAYS-ONLINE ENFORCEMENT
  // ===============================================================
  function showOfflineOverlay() {
    var existing = document.getElementById('phein-offline-overlay');
    if (existing) return;
    var overlay = document.createElement('div');
    overlay.id = 'phein-offline-overlay';
    overlay.style.cssText = [
      'position:fixed', 'top:0', 'left:0', 'width:100vw', 'height:100vh',
      'background:rgba(15,23,42,0.97)', 'color:#fff',
      'display:flex', 'flex-direction:column', 'align-items:center', 'justify-content:center',
      'z-index:999999', 'font-family:system-ui,-apple-system,sans-serif', 'text-align:center',
      'padding:2rem'
    ].join(';') + ';';
    overlay.innerHTML =
      '<div style="margin-bottom:1.5rem;">' +
        '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="1.5" style="opacity:0.9;">' +
          '<path d="M1 1l22 22"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>' +
          '<path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/>' +
          '<path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>' +
          '<line x1="12" y1="20" x2="12.01" y2="20"/>' +
        '</svg>' +
      '</div>' +
      '<h2 style="font-size:1.5rem;font-weight:700;margin:0 0 0.75rem;">Connection Lost</h2>' +
      '<p style="font-size:1rem;line-height:1.6;max-width:480px;opacity:0.85;margin:0 0 1.5rem;">' +
        'Phein Screener requires an active internet connection. Reconnecting…' +
      '</p>' +
      '<div class="phein-offline-spinner" style="width:36px;height:36px;border:3px solid rgba(255,255,255,0.2);' +
        'border-top-color:#60a5fa;border-radius:50%;animation:pheinOfflineSpin 0.8s linear infinite;"></div>' +
      '<style>@keyframes pheinOfflineSpin{to{transform:rotate(360deg)}}</style>';
    document.body.appendChild(overlay);
  }

  function hideOfflineOverlay() {
    var existing = document.getElementById('phein-offline-overlay');
    if (existing) existing.parentNode.removeChild(existing);
  }

  function enforceOnline() {
    if (!navigator.onLine) {
      showOfflineOverlay();
      document.body.style.pointerEvents = 'none';
      document.body.style.filter = 'grayscale(0.5) blur(1px)';
      return false;
    }
    return true;
  }

  window.addEventListener('offline', function () {
    showOfflineOverlay();
    document.body.style.pointerEvents = 'none';
    document.body.style.filter = 'grayscale(0.5) blur(1px)';
  });

  window.addEventListener('online', function () {
    hideOfflineOverlay();
    document.body.style.pointerEvents = '';
    document.body.style.filter = '';
    // Re-validate session. If owner deleted them while offline, kick to landing.
    if (window.PheinRouter && typeof window.PheinRouter.isSessionValid === 'function') {
      if (!window.PheinRouter.isSessionValid() && window.location.pathname.indexOf('app.html') !== -1) {
        window.location.href = 'index.html?reason=expired';
      }
    }
  });

  // Initial check + periodic check every 3 seconds
  enforceOnline();
  setInterval(enforceOnline, 3000);

  // ===============================================================
  // PUBLIC API — expose flagging for app.html to call if needed.
  // ===============================================================
  window.PheinSecurity = {
    flagDevToolsAttempt: flagDevToolsAttempt,
    showOfflineOverlay: showOfflineOverlay,
    hideOfflineOverlay: hideOfflineOverlay
  };
})(window, document);
