/**
 * timer.js — Phein Screener Lease
 * ================================
 * Renders a sticky countdown widget in the top-right corner of app.html.
 *
 * Reads session.startTime + session.code from localStorage (via PheinRouter),
 * looks up the duration from window.AUTHORIZED_CLIENTS (matched by company + code),
 * calculates remaining time, and renders "Lease ends in: Xd Yh Zm Ws".
 *
 * Updates every second. When remaining hits 0:
 *   1. PheinRouter.clearSession()
 *   2. Redirect to index.html?reason=expired
 *
 * Also, on every page load of app.html, re-run PheinRouter.isSessionValid() —
 * if false (owner deleted the code), redirect to index.html?reason=expired.
 */
(function (window, document) {
  'use strict';

  var WIDGET_ID = 'phein-lease-timer';
  var TICK_MS = 1000;
  var intervalId = null;
  var started = false;

  // ---------------------------------------------------------------
  // BUILD WIDGET DOM — injects into the header next to the license badge.
  // If the header isn't available yet (still loading), falls back to body.
  // ---------------------------------------------------------------
  function buildWidget() {
    var existing = document.getElementById(WIDGET_ID);
    if (existing) return existing;

    var wrap = document.createElement('span');
    wrap.id = WIDGET_ID;
    wrap.setAttribute('aria-live', 'polite');
    wrap.className = 'phein-header-timer';
    wrap.innerHTML =
      '<span class="phein-timer-label">Lease ends in:</span>' +
      '<span class="phein-timer-value" id="phein-timer-value">—</span>';

    // Try to inject into the header, right before the license badge.
    var badge = document.getElementById('header-license-badge');
    if (badge && badge.parentNode) {
      badge.parentNode.insertBefore(wrap, badge);
    } else {
      // Header not ready yet — append to body as fallback, will be moved later.
      document.body.appendChild(wrap);
    }
    return wrap;
  }

  // ---------------------------------------------------------------
  // MOVE WIDGET TO HEADER — called after DOM is fully loaded.
  // Ensures the timer ends up in the header even if it was initially
  // appended to body during early bootstrap.
  // ---------------------------------------------------------------
  function ensureInHeader() {
    var widget = document.getElementById(WIDGET_ID);
    if (!widget) { buildWidget(); widget = document.getElementById(WIDGET_ID); }
    if (!widget) return;
    var badge = document.getElementById('header-license-badge');
    if (badge && badge.parentNode && widget.parentNode !== badge.parentNode) {
      badge.parentNode.insertBefore(widget, badge);
    }
  }

  // ---------------------------------------------------------------
  // CALCULATE REMAINING MS — duration is ALWAYS looked up from AUTHORIZED_CLIENTS,
  // never trusted from localStorage.
  // ---------------------------------------------------------------
  function getRemainingMs() {
    var session = window.PheinRouter ? window.PheinRouter.getSession() : null;
    if (!session) return -1;

    var client = window.PheinRouter.findClient(session.company, session.code);
    if (!client) return -1; // owner removed code → expired

    var duration = Number(client.duration);
    if (duration !== 7 && duration !== 14 && duration !== 30) return -1;

    var expiresAt = session.startTime + (duration * 86400000);
    return expiresAt - Date.now();
  }

  // ---------------------------------------------------------------
  // FORMAT — "Xd Yh Zm Ws"
  // ---------------------------------------------------------------
  function formatRemaining(ms) {
    if (ms < 0) return '0d 0h 0m 0s';
    var totalSec = Math.floor(ms / 1000);
    var d = Math.floor(totalSec / 86400);
    var h = Math.floor((totalSec % 86400) / 3600);
    var m = Math.floor((totalSec % 3600) / 60);
    var s = totalSec % 60;
    return d + 'd ' + h + 'h ' + m + 'm ' + s + 's';
  }

  // ---------------------------------------------------------------
  // TICK — called every second
  // ---------------------------------------------------------------
  function tick() {
    var remaining = getRemainingMs();

    // Re-validate full session on every tick. If owner deleted code or session
    // is otherwise invalid, kick immediately. (Brief section 5: "Also: on every
    // page load of app.html, re-run isSessionValid() — if false, redirect".)
    if (window.PheinRouter && typeof window.PheinRouter.isSessionValid === 'function') {
      if (!window.PheinRouter.isSessionValid()) {
        stop();
        try { window.PheinRouter.clearSession(); } catch (e) {}
        window.location.href = 'index.html?reason=expired';
        return;
      }
    }

    if (remaining <= 0) {
      // Lease ran out
      var valEl = document.getElementById('phein-timer-value');
      if (valEl) {
        valEl.textContent = '0d 0h 0m 0s';
        valEl.classList.add('phein-timer-expired');
      }
      stop();
      try { window.PheinRouter.clearSession(); } catch (e) {}
      window.location.href = 'index.html?reason=expired';
      return;
    }

    var el = document.getElementById('phein-timer-value');
    if (el) {
      el.textContent = formatRemaining(remaining);
      // Visual warning when <24h remain
      if (remaining < 86400000) {
        el.classList.add('phein-timer-warning');
      } else {
        el.classList.remove('phein-timer-warning');
      }
    }
  }

  // ---------------------------------------------------------------
  // START — called by router.routeOnLoad() when session is valid on app.html.
  // ---------------------------------------------------------------
  function start() {
    if (started) return;
    started = true;
    buildWidget();
    ensureInHeader();
    tick(); // immediate render
    intervalId = setInterval(tick, TICK_MS);
    // Also ensure it's in the header after DOM is fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', ensureInHeader);
    }
  }

  function stop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    started = false;
  }

  // ---------------------------------------------------------------
  // BOOTSTRAP — if document is already loaded, start immediately. Otherwise wait.
  // (router.routeOnLoad() will also call start() — both paths are idempotent.)
  // ---------------------------------------------------------------
  function bootstrap() {
    var page = (window.location.pathname.split('/').pop() || 'index.html');
    if (page !== 'app.html') return; // only runs on app.html

    // Session check first
    if (window.PheinRouter && typeof window.PheinRouter.isSessionValid === 'function') {
      if (!window.PheinRouter.isSessionValid()) {
        try { window.PheinRouter.clearSession(); } catch (e) {}
        window.location.replace('index.html?reason=expired');
        return;
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start);
    } else {
      start();
    }
  }

  bootstrap();

  // ---------------------------------------------------------------
  // PUBLIC API
  // ---------------------------------------------------------------
  window.PheinTimer = {
    start: start,
    stop: stop,
    tick: tick,
    getRemainingMs: getRemainingMs,
    formatRemaining: formatRemaining
  };
})(window, document);
