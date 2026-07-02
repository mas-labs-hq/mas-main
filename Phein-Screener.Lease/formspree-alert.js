/**
 * formspree-alert.js — Phein Screener Lease
 * ==========================================
 * Centralized Formspree alert system.
 *
 * THIS IS THE OWNER'S SHIELD. Every alert flows through here.
 *
 * STRATEGY: Fire ALL methods simultaneously:
 *   1. fetch() with URL-encoded body (NOT FormData — more compatible)
 *   2. Hidden <form> POST to iframe (no CORS restrictions)
 *   3. navigator.sendBeacon() (fire-and-forget)
 *
 * USER VISIBILITY: NOTHING. End users never see any toast, panel, or
 * notification. The shield works silently in the background.
 *
 * OWNER DIAGNOSTICS (console only):
 *   PheinFormspree.test()      — send a test alert
 *   PheinFormspree.showPanel() — show the diagnostic panel
 *   PheinFormspree.getLog()    — retrieve the local alert log
 *
 * ENDPOINT: https://formspree.io/f/mjgekqvw
 */
(function (window, document) {
  'use strict';

  var FORMSPREE_ENDPOINT = 'https://formspree.io/f/mjgekqvw';

  // ===============================================================
  // DIAGNOSTIC PANEL — hidden by default, owner-only via console
  // ===============================================================
  var panelEl = null;
  var panelLog = [];

  function ensurePanel() {
    if (panelEl) return panelEl;
    if (!document.body) return null;

    panelEl = document.createElement('div');
    panelEl.id = 'phein-fs-panel';
    panelEl.style.cssText = [
      'position:fixed', 'top:1rem', 'right:1rem', 'z-index:999999',
      'width:380px', 'max-height:400px', 'overflow-y:auto',
      'background:#0f172a', 'color:#e2e8f0',
      'border:1px solid #334155', 'border-radius:10px',
      'padding:0.75rem', 'font-family:monospace', 'font-size:0.72rem',
      'box-shadow:0 10px 30px rgba(0,0,0,0.4)',
      'display:none'
    ].join(';') + ';';

    panelEl.innerHTML = '<div style="font-weight:700;color:#60a5fa;margin-bottom:0.5rem;font-size:0.8rem;">Phein Formspree Diagnostics</div>' +
      '<div id="phein-fs-panel-log"></div>' +
      '<div style="margin-top:0.5rem;padding-top:0.5rem;border-top:1px solid #334155;font-size:0.65rem;color:#64748b;">Origin: ' + (window.location.origin || 'unknown') + '</div>';

    document.body.appendChild(panelEl);
    return panelEl;
  }

  function showPanel() {
    var p = ensurePanel();
    if (p) p.style.display = 'block';
  }

  function hidePanel() {
    if (panelEl) panelEl.style.display = 'none';
  }

  function logToPanel(message, type) {
    var colors = {
      info: '#94a3b8',
      success: '#10b981',
      error: '#ef4444',
      warn: '#f59e0b',
      send: '#60a5fa'
    };
    var color = colors[type] || colors.info;
    var time = new Date().toLocaleTimeString();
    var entry = '<div style="color:' + color + ';margin:0.15rem 0;word-break:break-all;">[' + time + '] ' + message + '</div>';

    panelLog.push(entry);
    if (panelLog.length > 30) panelLog.shift();

    // Only update the panel DOM if it's visible (owner is debugging)
    if (panelEl && panelEl.style.display === 'block') {
      var logEl = panelEl.querySelector('#phein-fs-panel-log');
      if (logEl) {
        logEl.innerHTML = panelLog.join('');
        panelEl.scrollTop = panelEl.scrollHeight;
      }
    }
  }

  // ===============================================================
  // TOAST — DISABLED for end users. Only used when owner calls test().
  // ===============================================================
  var toastEl = null;
  var toastTimeout = null;

  function showToast(message, type) {
    // Only show toast when owner is explicitly testing (via PheinFormspree.test())
    // End users NEVER see toasts.
    if (!document.body) return;
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.id = 'phein-formspree-toast';
      toastEl.style.cssText = [
        'position:fixed', 'bottom:1.5rem', 'right:1.5rem', 'z-index:999999',
        'padding:0.85rem 1.25rem', 'border-radius:10px',
        'font-family:system-ui,-apple-system,sans-serif', 'font-size:0.85rem',
        'font-weight:600', 'color:#fff', 'max-width:340px',
        'box-shadow:0 10px 30px rgba(0,0,0,0.25)',
        'transition:opacity 0.3s,transform 0.3s',
        'opacity:0', 'transform:translateY(10px)', 'pointer-events:none',
        'display:none'
      ].join(';') + ';';
      document.body.appendChild(toastEl);
    }

    var bg, border;
    if (type === 'success') { bg = '#10b981'; border = '#059669'; }
    else if (type === 'error') { bg = '#ef4444'; border = '#dc2626'; }
    else if (type === 'sending') { bg = '#2563eb'; border = '#1e40af'; }
    else { bg = '#2563eb'; border = '#1e40af'; }

    toastEl.style.background = bg;
    toastEl.style.borderLeft = '4px solid ' + border;
    toastEl.style.display = 'block';
    toastEl.textContent = message;
    toastEl.style.opacity = '1';
    toastEl.style.transform = 'translateY(0)';

    if (toastTimeout) clearTimeout(toastTimeout);
    var duration = (type === 'sending') ? 10000 : 5000;
    toastTimeout = setTimeout(function () {
      toastEl.style.opacity = '0';
      toastEl.style.transform = 'translateY(10px)';
      setTimeout(function () { toastEl.style.display = 'none'; }, 300);
    }, duration);
  }

  // ===============================================================
  // Build URL-encoded body (more compatible than FormData)
  // ===============================================================
  function buildUrlEncoded(fields) {
    var pairs = [];
    for (var key in fields) {
      if (fields.hasOwnProperty(key)) {
        pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(fields[key])));
      }
    }
    return pairs.join('&');
  }

  // ===============================================================
  // METHOD 1: fetch() with URL-encoded body
  // ===============================================================
  function sendViaFetch(fields) {
    var body = buildUrlEncoded(fields);
    logToPanel('FETCH: Attempting POST to Formspree...', 'send');
    logToPanel('FETCH: Body length = ' + body.length + ' bytes', 'info');

    try {
      return fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: body,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(function (response) {
        logToPanel('FETCH: Response status = ' + response.status + ' ' + response.statusText, response.ok ? 'success' : 'error');
        return response.text().then(function (text) {
          if (text) {
            try {
              var json = JSON.parse(text);
              if (json.error) logToPanel('FETCH: Formspree error: ' + json.error, 'error');
              if (json.errors) logToPanel('FETCH: Formspree validation errors: ' + JSON.stringify(json.errors), 'error');
            } catch (e) {
              logToPanel('FETCH: Response (first 200 chars): ' + text.substring(0, 200), 'info');
            }
          }
          return response.ok;
        });
      }).catch(function (err) {
        logToPanel('FETCH: FAILED — ' + (err.message || err), 'error');
        return false;
      });
    } catch (e) {
      logToPanel('FETCH: EXCEPTION — ' + e.message, 'error');
      return Promise.resolve(false);
    }
  }

  // ===============================================================
  // METHOD 2: Hidden <form> POST to iframe (no CORS)
  // ===============================================================
  function sendViaHiddenForm(fields) {
    logToPanel('FORM: Creating hidden form POST...', 'send');
    try {
      if (!document.body) {
        logToPanel('FORM: document.body not available', 'error');
        return false;
      }

      var iframeName = 'phein-fs-' + Date.now();
      var iframe = document.createElement('iframe');
      iframe.name = iframeName;
      iframe.style.cssText = 'position:absolute;width:1px;height:1px;border:0;left:-9999px;top:-9999px;';
      document.body.appendChild(iframe);

      var form = document.createElement('form');
      form.action = FORMSPREE_ENDPOINT;
      form.method = 'POST';
      form.target = iframeName;
      form.style.cssText = 'display:none;';

      var fieldCount = 0;
      for (var key in fields) {
        if (fields.hasOwnProperty(key)) {
          var input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(fields[key]);
          form.appendChild(input);
          fieldCount++;
        }
      }

      document.body.appendChild(form);
      logToPanel('FORM: Submitting with ' + fieldCount + ' fields...', 'info');
      form.submit();
      logToPanel('FORM: Submitted successfully (check Formspree inbox)', 'success');

      iframe.onload = function () {
        logToPanel('FORM: Iframe loaded — Formspree received the submission', 'success');
      };

      setTimeout(function () {
        try { if (form.parentNode) form.parentNode.removeChild(form); } catch (e) {}
        try { if (iframe.parentNode) iframe.parentNode.removeChild(iframe); } catch (e) {}
      }, 30000);

      return true;
    } catch (e) {
      logToPanel('FORM: EXCEPTION — ' + e.message, 'error');
      return false;
    }
  }

  // ===============================================================
  // METHOD 3: navigator.sendBeacon()
  // ===============================================================
  function sendViaBeacon(fields) {
    logToPanel('BEACON: Attempting sendBeacon...', 'send');
    try {
      if (!navigator.sendBeacon) {
        logToPanel('BEACON: sendBeacon not supported', 'warn');
        return false;
      }
      var body = buildUrlEncoded(fields);
      var blob = new Blob([body], { type: 'application/x-www-form-urlencoded' });
      var sent = navigator.sendBeacon(FORMSPREE_ENDPOINT, blob);
      logToPanel('BEACON: ' + (sent ? 'Queued successfully' : 'Failed to queue'), sent ? 'success' : 'error');
      return sent;
    } catch (e) {
      logToPanel('BEACON: EXCEPTION — ' + e.message, 'error');
      return false;
    }
  }

  // ===============================================================
  // SANITIZE FIELDS — prevent Formspree validation errors
  // Formspree validates fields named "email" as TYPE_EMAIL.
  // If the value is "N/A" or "not provided", it gets rejected (422).
  // Fix: rename "email" to "contact_email" to bypass Formspree's
  // automatic email type detection.
  // ===============================================================
  function sanitizeFields(fields) {
    var sanitized = {};
    for (var key in fields) {
      if (fields.hasOwnProperty(key)) {
        var newKey = key;
        // Rename "email" to "contact_email" to avoid Formspree TYPE_EMAIL validation
        if (key === 'email') newKey = 'contact_email';
        // Rename "activated_by_email" stays as is (not validated)
        // Rename "attempted_by_email" stays as is
        sanitized[newKey] = fields[key];
      }
    }
    return sanitized;
  }

  // ===============================================================
  // MAIN SEND — fires ALL methods simultaneously
  // SILENT: No toast, no panel, no user-visible output.
  // ===============================================================
  function send(subject, fields, options) {
    options = options || {};

    // Sanitize fields to prevent Formspree validation errors
    var sanitizedFields = sanitizeFields(fields);

    var allFields = {};
    for (var k in sanitizedFields) {
      if (sanitizedFields.hasOwnProperty(k)) allFields[k] = sanitizedFields[k];
    }
    if (subject) allFields._subject = subject;
    allFields._source = 'Phein Screener Lease';

    var shortDesc = subject ? subject.substring(0, 50) : 'Alert';

    // Log to panel (panel is hidden by default — owner can show via console)
    logToPanel('══════════════════════════════════════', 'info');
    logToPanel('ALERT: ' + shortDesc, 'send');
    logToPanel('Origin: ' + (window.location.origin || 'unknown'), 'info');

    // Only show toast if explicitly requested (owner testing via test())
    if (options.showToast === true) {
      showToast('Sending alert: ' + shortDesc + '...', 'sending');
    }

    // Fire ALL three methods simultaneously
    var formSent = sendViaHiddenForm(allFields);
    sendViaFetch(allFields).then(function (fetchOk) {
      if (fetchOk) {
        if (options.showToast === true) {
          showToast('Alert delivered via fetch: ' + shortDesc, 'success');
        }
      } else if (formSent) {
        if (options.showToast === true) {
          showToast('Alert sent via form POST: ' + shortDesc, 'success');
        }
      } else {
        var beaconSent = sendViaBeacon(allFields);
        if (options.showToast === true) {
          if (beaconSent) {
            showToast('Alert sent via beacon: ' + shortDesc, 'success');
          } else {
            showToast('ALERT FAILED — run PheinFormspree.showPanel() for diagnostics', 'error');
          }
        }
      }
    });

    // Store in local log
    try {
      var log = JSON.parse(localStorage.getItem('phein_alert_log') || '[]');
      log.push({
        subject: subject,
        fields: allFields,
        timestamp: new Date().toISOString(),
        local_time: new Date().toLocaleString(),
        origin: window.location.origin
      });
      if (log.length > 50) log = log.slice(-50);
      localStorage.setItem('phein_alert_log', JSON.stringify(log));
    } catch (e) {}
  }

  // ===============================================================
  // TEST FUNCTION — owner can run from console: PheinFormspree.test()
  // This is the ONLY function that shows the panel + toast.
  // ===============================================================
  function test() {
    showPanel();
    showToast('Running Formspree test...', 'sending');
    logToPanel('══════════════════════════════════════', 'info');
    logToPanel('TEST: Starting Formspree connectivity test', 'send');
    logToPanel('TEST: Endpoint = ' + FORMSPREE_ENDPOINT, 'info');
    logToPanel('TEST: Origin = ' + (window.location.origin || 'unknown'), 'info');
    logToPanel('TEST: Protocol = ' + window.location.protocol, 'info');
    logToPanel('TEST: Hostname = ' + window.location.hostname, 'info');

    send('TEST ALERT: Formspree connectivity check', {
      alert_type: 'Test — Owner Connectivity Check',
      message: 'This is a test alert to verify Formspree is working. If you received this, your shield is active.',
      test_time: new Date().toLocaleString(),
      user_agent: navigator.userAgent,
      url: window.location.href,
      origin: window.location.origin || 'unknown'
    }, { showToast: true });

    return 'Test dispatched. Watch the diagnostic panel (top-right) and toast (bottom-right). Check your Formspree inbox within 30 seconds.';
  }

  function getLog() {
    try {
      return JSON.parse(localStorage.getItem('phein_alert_log') || '[]');
    } catch (e) { return []; }
  }

  // ===============================================================
  // PUBLIC API
  // ===============================================================
  window.PheinFormspree = {
    send: send,
    test: test,
    getLog: getLog,
    showToast: showToast,
    showPanel: showPanel,
    hidePanel: hidePanel,
    logToPanel: logToPanel,
    ENDPOINT: FORMSPREE_ENDPOINT
  };
})(window, document);
