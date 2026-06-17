/**
 * app.js — PSF.Manager Main Application
 * ======================================
 * The brain. Handles:
 *   - SPA navigation (Dashboard, Reader, Clients, Guide)
 *   - Client manager (add, countdown, pause/resume, delete)
 *   - Notifications (sound + desktop)
 *   - Export/Import
 *   - Settings
 */
(function (window, document) {
  'use strict';

  var clients = [];
  var notifiedClients = {}; // track which clients we've already notified about
  var settings = { soundEnabled: true, notificationThreshold: 1 }; // days
  var countdownInterval = null;
  var notificationInterval = null;

  // =============================================================
  // INIT
  // =============================================================
  function init() {
    // Load settings
    PSFDB.open().then(function () {
      return PSFDB.getSetting('settings');
    }).then(function (saved) {
      // M3 FIX: merge settings with defaults instead of replacing
      settings = Object.assign({ soundEnabled: true, notificationThreshold: 1 }, saved || {});
      // Restore sound toggle UI
      var soundToggle = document.getElementById('sound-toggle');
      if (soundToggle) soundToggle.checked = settings.soundEnabled !== false;
      // H3 FIX: await loadClients before starting notifications
      return loadClients();
    }).then(function () {
      renderDashboard();
      startCountdowns();
      startNotifications();
      requestNotificationPermission();
      registerSW();
    }).catch(function (e) {
      console.warn('DB init failed, using in-memory:', e);
      loadClients().then(function () {
        renderDashboard();
        startCountdowns();
        startNotifications();
      });
    });

    // Navigation
    document.querySelectorAll('.nav-item').forEach(function (item) {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        navigate(item.getAttribute('data-view'));
      });
    });

    // Reader parse button
    var parseBtn = document.getElementById('parse-btn');
    if (parseBtn) parseBtn.addEventListener('click', handleParse);

    // Add client form
    var addForm = document.getElementById('add-client-form');
    if (addForm) addForm.addEventListener('submit', handleAddClient);

    // License type change → auto-set duration
    var licType = document.getElementById('client-license-type');
    if (licType) licType.addEventListener('change', handleLicenseTypeChange);

    // Export/Import
    var exportBtn = document.getElementById('export-btn');
    if (exportBtn) exportBtn.addEventListener('click', handleExport);
    var importBtn = document.getElementById('import-btn');
    if (importBtn) importBtn.addEventListener('click', function () { document.getElementById('import-file').click(); });
    var importFile = document.getElementById('import-file');
    if (importFile) importFile.addEventListener('change', handleImport);

    // Settings
    var soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) soundToggle.addEventListener('change', function () {
      settings.soundEnabled = soundToggle.checked;
      PSFDB.setSetting('settings', settings).catch(function () {});
    });

    // Search
    var searchInput = document.getElementById('client-search');
    if (searchInput) searchInput.addEventListener('input', function () {
      renderClientList(searchInput.value);
    });

    // Generate code button
    var genCodeBtn = document.getElementById('gen-code-btn');
    if (genCodeBtn) genCodeBtn.addEventListener('click', function () {
      var code = generateCode();
      var codeInput = document.getElementById('client-code');
      if (codeInput) codeInput.value = code;
    });
  }

  // =============================================================
  // NAVIGATION
  // =============================================================
  function navigate(view) {
    document.querySelectorAll('.view').forEach(function (v) { v.classList.remove('active'); });
    document.querySelectorAll('.nav-item').forEach(function (n) { n.classList.remove('active'); });
    var viewEl = document.getElementById('view-' + view);
    var navEl = document.querySelector('.nav-item[data-view="' + view + '"]');
    if (viewEl) viewEl.classList.add('active');
    if (navEl) navEl.classList.add('active');
    if (view === 'dashboard') renderDashboard();
    if (view === 'clients') {
      // H5 FIX: preserve search text when returning to clients view
      var searchInput = document.getElementById('client-search');
      renderClientList(searchInput ? searchInput.value : '');
    }
  }

  // =============================================================
  // DASHBOARD
  // =============================================================
  function renderDashboard() {
    var active = 0, expiring = 0, expired = 0, paused = 0;
    clients.forEach(function (c) {
      var remaining = getRemainingMs(c);
      if (c.paused) { paused++; return; }
      if (remaining <= 0) { expired++; return; }
      active++;
      if (remaining <= (settings.notificationThreshold * 86400000)) expiring++;
    });

    setText('stat-total', clients.length);
    setText('stat-active', active);
    setText('stat-expiring', expiring);
    setText('stat-expired', expired);
    setText('stat-paused', paused);

    // Recent alerts
    PSFDB.getAllAlerts().then(function (alerts) {
      var container = document.getElementById('recent-alerts');
      if (!container) return;
      if (alerts.length === 0) {
        container.innerHTML = '<p class="empty-state">No alerts parsed yet. Use the Reader to paste Formspree emails.</p>';
        return;
      }
      alerts.sort(function (a, b) { return new Date(b.timestamp) - new Date(a.timestamp); });
      var html = '';
      alerts.slice(0, 10).forEach(function (a) {
        var icon = getScenarioIcon(a.scenario);
        var color = getScenarioColor(a.scenario);
        html += '<div class="alert-item" style="border-left:3px solid ' + color + ';">' +
          '<div class="alert-item-icon" style="color:' + color + ';">' + icon + '</div>' +
          '<div class="alert-item-content">' +
          '<div class="alert-item-type">' + escapeHtml(a.fields.alert_type || a.scenario || 'Alert') + '</div>' +
          '<div class="alert-item-meta">' + escapeHtml(a.fields.company || 'Unknown') + ' · ' + escapeHtml(a.fields.alert_time_local || a.timestamp || '') + '</div>' +
          '</div></div>';
      });
      container.innerHTML = html;
    }).catch(function () {});
  }

  // =============================================================
  // READER
  // =============================================================
  function handleParse() {
    var textarea = document.getElementById('reader-input');
    var raw = textarea ? textarea.value.trim() : '';
    if (!raw) { showToast('Please paste a Formspree email first', 'warn'); return; }

    var result = PSFReader.process(raw);
    if (result.error) { showToast('Could not parse the message', 'error'); return; }

    displayParsedResult(result);

    // Save to alert history
    var alert = {
      id: 'alert-' + Date.now(),
      scenario: result.scenario,
      fields: result.fields,
      timestamp: new Date().toISOString(),
      raw: result.raw
    };
    PSFDB.addAlert(alert).catch(function () {});
  }

  function displayParsedResult(result) {
    var container = document.getElementById('reader-results');
    if (!container) return;
    container.style.display = 'block';

    var f = result.fields;
    var scenarioName = getScenarioName(result.scenario);
    var scenarioColor = getScenarioColor(result.scenario);
    var scenarioIcon = getScenarioIcon(result.scenario);

    // Build extracted info
    var infoHtml = '<div class="result-header">' +
      '<div class="result-icon" style="background:' + scenarioColor + '20;color:' + scenarioColor + ';">' + scenarioIcon + '</div>' +
      '<div><h3>' + scenarioName + '</h3><p class="result-explanation">' + escapeHtml(result.explanation) + '</p></div>' +
      '</div>';

    // Key info grid
    var keyFields = [
      ['Company', f.company],
      ['Code', f.code],
      ['Phone', f.phone || f.activated_by_phone || f.attempted_by_phone],
      ['Email', f.contact_email || f.email || f.activated_by_email || f.attempted_by_email],
      ['Duration', f.duration_days ? f.duration_days + ' days' : (f.duration || null)],
      ['Method', f.method],
      ['Violation', f.violation_count ? f.violation_count + ' of ' + (f.max_violations || '3') : null],
      ['Location', f.location],
      ['Role', f.role],
      ['Time', f.alert_time_local || f.timestamp],
      ['Timezone', f.device_timezone],
      ['Platform', f.device_platform],
      ['Screen', f.device_screen_resolution],
      ['Connection', f.device_connection_type],
      ['User Agent', f.device_user_agent || f.user_agent],
      ['URL', f.device_current_url || f.url]
    ];

    var gridHtml = '<div class="info-grid">';
    keyFields.forEach(function (kv) {
      if (kv[1]) {
        gridHtml += '<div class="info-item"><span class="info-label">' + kv[0] + '</span><span class="info-value">' + escapeHtml(kv[1]) + '</span></div>';
      }
    });
    gridHtml += '</div>';

    // Full message if present
    if (f.message) {
      gridHtml += '<div class="info-full"><span class="info-label">Message</span><p>' + escapeHtml(f.message) + '</p></div>';
    }
    if (f.action_required) {
      gridHtml += '<div class="info-full info-action"><span class="info-label">Action Required</span><p>' + escapeHtml(f.action_required) + '</p></div>';
    }

    // Templates
    var templatesHtml = '<div class="templates-section"><h4>Response Templates</h4>';
    result.templates.forEach(function (t, i) {
      templatesHtml += '<div class="template-card">' +
        '<div class="template-header">' +
        '<span class="template-title">' + escapeHtml(t.title) + '</span>' +
        '<button class="btn-copy" onclick="PSFApp.copyTemplate(' + i + ')">Copy</button>' +
        '</div>' +
        '<div class="template-subject">Subject: ' + escapeHtml(t.subject) + '</div>' +
        '<pre class="template-body" id="template-' + i + '">' + escapeHtml(t.body) + '</pre>' +
        '</div>';
    });
    templatesHtml += '</div>';

    container.innerHTML = infoHtml + gridHtml + templatesHtml;

    // Store templates for copying
    container._templates = result.templates;

    // Scroll to results
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function copyTemplate(index) {
    var container = document.getElementById('reader-results');
    if (!container || !container._templates) return;
    var template = container._templates[index];
    if (!template) return;
    var text = 'Subject: ' + template.subject + '\n\n' + template.body;
    copyToClipboard(text);
    showToast('Template copied to clipboard', 'success');
  }

  // =============================================================
  // CLIENT MANAGER
  // =============================================================
  function loadClients() {
    return PSFDB.getAllClients().then(function (data) {
      clients = data || [];
    }).catch(function () {
      clients = [];
    });
  }

  function handleAddClient(e) {
    e.preventDefault();
    var name = val('client-name');
    var company = val('client-company');
    var email = val('client-email');
    var phone = val('client-phone');
    var location = val('client-location');
    var licenseType = val('client-license-type');
    var durationDays = parseInt(val('client-duration'), 10) || 7;
    var code = val('client-code');
    var notes = val('client-notes');

    if (!name || !company) {
      showToast('Name and company are required', 'error');
      return;
    }

    var client = {
      id: 'client-' + Date.now(),
      name: name,
      company: company,
      email: email,
      phone: phone,
      location: location,
      licenseType: licenseType,
      durationDays: durationDays,
      code: code,
      notes: notes,
      startDate: Date.now(),
      paused: false,
      pauseStart: null,
      totalPausedMs: 0,
      createdAt: new Date().toISOString()
    };

    PSFDB.putClient(client).then(function () {
      clients.push(client);
      renderClientList();
      renderDashboard();
      showToast('Client added successfully', 'success');

      // Generate auth.js entry if code exists
      if (code) {
        var entry = generateAuthEntry(client);
        showAuthEntry(entry);
      }

      // Clear form
      e.target.reset();
      handleLicenseTypeChange();
    }).catch(function (err) {
      showToast('Failed to add client: ' + err.message, 'error');
    });
  }

  function handleLicenseTypeChange() {
    var type = val('client-license-type');
    var durations = {
      '7-day': 7, '14-day': 14, '30-day': 30,
      '3-month': 90, '1-year': 365,
      'Perpetual': 36500, 'Enterprise Plus': 36500
    };
    var durInput = document.getElementById('client-duration');
    if (durInput && durations[type]) durInput.value = durations[type];
  }

  function renderClientList(searchTerm) {
    var container = document.getElementById('client-list');
    if (!container) return;

    var filtered = clients;
    if (searchTerm) {
      var term = searchTerm.toLowerCase();
      filtered = clients.filter(function (c) {
        return (c.name || '').toLowerCase().indexOf(term) !== -1 ||
               (c.company || '').toLowerCase().indexOf(term) !== -1 ||
               (c.code || '').toLowerCase().indexOf(term) !== -1 ||
               (c.email || '').toLowerCase().indexOf(term) !== -1;
      });
    }

    if (filtered.length === 0) {
      container.innerHTML = '<p class="empty-state">' + (searchTerm ? 'No clients match your search.' : 'No clients yet. Add your first client above.') + '</p>';
      return;
    }

    // Sort by remaining time (expired first, then most urgent)
    filtered.sort(function (a, b) {
      return getRemainingMs(a) - getRemainingMs(b);
    });

    var html = '';
    filtered.forEach(function (c) {
      var remaining = getRemainingMs(c);
      var remainingText = formatRemaining(remaining, c.durationDays);
      var status = c.paused ? 'paused' : (remaining <= 0 ? 'expired' : 'active');
      var statusColor = status === 'expired' ? '#ef4444' : status === 'paused' ? '#94a3b8' : (remaining <= 86400000 ? "#f59e0b" : (remaining <= 604800000 ? "#eab308" : '#10b981'));
      var progress = Math.max(0, Math.min(100, 100 - (remaining / (c.durationDays * 86400000)) * 100));
      if (c.durationDays >= 36500) progress = 0; // perpetual

      html += '<div class="client-card status-' + status + '" data-id="' + c.id + '">' +
        '<div class="client-card-header">' +
          '<div class="client-info">' +
            '<div class="client-name">' + escapeHtml(c.name) + '</div>' +
            '<div class="client-company">' + escapeHtml(c.company) + (c.code ? ' · ' + escapeHtml(c.code) : '') + '</div>' +
            '<div class="client-meta">' + escapeHtml(c.licenseType || (c.durationDays + ' days')) +
              (c.email ? ' · ' + escapeHtml(c.email) : '') +
              (c.phone ? ' · ' + escapeHtml(c.phone) : '') +
              (c.location ? ' · ' + escapeHtml(c.location) : '') + '</div>' +
          '</div>' +
          '<div class="client-status">' +
            '<span class="status-badge" style="background:' + statusColor + '20;color:' + statusColor + ';">' + status.toUpperCase() + '</span>' +
            '<div class="client-countdown" style="color:' + statusColor + ';">' + remainingText + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="client-progress"><div class="client-progress-fill" style="width:' + progress + '%;background:' + statusColor + ';"></div></div>' +
        '<div class="client-actions">' +
          (c.paused
            ? '<button class="btn-icon" onclick="PSFApp.resumeClient(\'' + c.id + '\')" title="Resume"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg></button>'
            : '<button class="btn-icon" onclick="PSFApp.pauseClient(\'' + c.id + '\')" title="Pause"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg></button>'
          ) +
          '<button class="btn-icon btn-danger" onclick="PSFApp.removeClient(\'' + c.id + '\')" title="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>' +
        '</div>' +
        (c.notes ? '<div class="client-notes">' + escapeHtml(c.notes) + '</div>' : '') +
      '</div>';
    });
    container.innerHTML = html;
  }

  function pauseClient(id) {
    var c = clients.find(function (x) { return x.id === id; });
    if (!c || c.paused) return;
    var oldPaused = c.paused; var oldPauseStart = c.pauseStart;
    c.paused = true;
    c.pauseStart = Date.now();
    PSFDB.putClient(c).then(function () {
      renderClientList();
      renderDashboard();
      showToast(c.company + ' paused', 'info');
    }).catch(function (err) {
      // H1 FIX: rollback in-memory state on DB failure
      c.paused = oldPaused; c.pauseStart = oldPauseStart;
      showToast('Failed to pause: ' + err.message, 'error');
    });
  }

  function resumeClient(id) {
    var c = clients.find(function (x) { return x.id === id; });
    if (!c || !c.paused) return;
    var oldPaused = c.paused; var oldPauseStart = c.pauseStart; var oldTotal = c.totalPausedMs;
    if (c.pauseStart) {
      c.totalPausedMs += (Date.now() - c.pauseStart);
      c.pauseStart = null;
    }
    c.paused = false;
    PSFDB.putClient(c).then(function () {
      renderClientList();
      renderDashboard();
      showToast(c.company + ' resumed', 'success');
    }).catch(function (err) {
      // H1 FIX: rollback on failure
      c.paused = oldPaused; c.pauseStart = oldPauseStart; c.totalPausedMs = oldTotal;
      showToast('Failed to resume: ' + err.message, 'error');
    });
  }

  function removeClient(id) {
    var c = clients.find(function (x) { return x.id === id; });
    if (!c) return;
    if (!confirm('Delete ' + c.company + '? This cannot be undone.')) return;
    PSFDB.deleteClient(id).then(function () {
      clients = clients.filter(function (x) { return x.id !== id; });
      renderClientList();
      renderDashboard();
      showToast('Client deleted', 'info');
    }).catch(function (err) {
      showToast('Failed to delete: ' + err.message, 'error');
    });
  }

  // =============================================================
  // COUNTDOWN LOGIC
  // =============================================================
  function getRemainingMs(client) {
    var baseExpiry = client.startDate + (client.durationDays * 86400000);
    var pausedDuration = client.totalPausedMs || 0;
    if (client.paused && client.pauseStart) {
      pausedDuration += (Date.now() - client.pauseStart);
    }
    var adjustedExpiry = baseExpiry + pausedDuration;
    return adjustedExpiry - Date.now();
  }

  function formatRemaining(ms, durationDays) {
    if (ms <= 0) return 'EXPIRED';
    // M8 FIX: Perpetual licenses show "PERPETUAL"
    if (durationDays && durationDays >= 36500) return 'PERPETUAL';
    var totalSec = Math.floor(ms / 1000);
    var d = Math.floor(totalSec / 86400);
    var h = Math.floor((totalSec % 86400) / 3600);
    var m = Math.floor((totalSec % 3600) / 60);
    var s = totalSec % 60;
    if (d > 0) return d + 'd ' + h + 'h ' + m + 'm ' + s + 's';
    if (h > 0) return h + 'h ' + m + 'm ' + s + 's';
    return m + 'm ' + s + 's';
  }

  function startCountdowns() {
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(function () {
      document.querySelectorAll('.client-card').forEach(function (card) {
        var id = card.getAttribute('data-id');
        var c = clients.find(function (x) { return x.id === id; });
        if (!c) return;
        var remaining = getRemainingMs(c);
        var countdownEl = card.querySelector('.client-countdown');
        if (countdownEl) {
          countdownEl.textContent = formatRemaining(remaining, c.durationDays);
          var color = remaining <= 0 ? '#ef4444' : c.paused ? '#94a3b8' : (remaining <= 86400000 ? "#f59e0b" : (remaining <= 604800000 ? "#eab308" : '#10b981'));
          countdownEl.style.color = color;
        }
        // Update status badge if expired
        if (remaining <= 0 && !c.paused) {
          var badge = card.querySelector('.status-badge');
          if (badge && badge.textContent !== 'EXPIRED') {
            badge.textContent = 'EXPIRED';
            badge.style.background = '#ef444420';
            badge.style.color = '#ef4444';
            card.classList.add('status-expired');
          }
        }
        // Update progress bar
        var progress = Math.max(0, Math.min(100, 100 - (remaining / (c.durationDays * 86400000)) * 100));
        if (c.durationDays >= 36500) progress = 0;
        var fill = card.querySelector('.client-progress-fill');
        if (fill) fill.style.width = progress + '%';
      });

      // Also update dashboard stats
      if (document.getElementById('view-dashboard') && document.getElementById('view-dashboard').classList.contains('active')) {
        renderDashboard();
      }
    }, 1000);
  }

  // =============================================================
  // NOTIFICATIONS (sound + desktop)
  // =============================================================
  function startNotifications() {
    if (notificationInterval) clearInterval(notificationInterval);
    notificationInterval = setInterval(checkNotifications, 60000); // every minute
    checkNotifications(); // run immediately
  }

  function checkNotifications() {
    var thresholdMs = settings.notificationThreshold * 86400000;
    var today = new Date().toDateString();
    clients.forEach(function (c) {
      if (c.paused) return;
      var remaining = getRemainingMs(c);

      // H2 FIX: Use lastNotifiedDate on the client record (persisted in IndexedDB)
      // instead of in-memory notifiedClients which resets on reload.

      // Expiring soon (within threshold)
      if (remaining > 0 && remaining <= thresholdMs && c.lastNotifiedDate !== today) {
        c.lastNotifiedDate = today;
        PSFDB.putClient(c).catch(function () {});
        var urgency = remaining <= 86400000 ? 'EXPIRES TODAY' : 'EXPIRING SOON';
        var msg = c.company + ' (' + c.name + ') — ' + formatRemaining(remaining, c.durationDays) + ' remaining';
        showDesktopNotification(urgency + ': ' + c.company, msg);
        if (settings.soundEnabled) playNotificationSound();
        showToast(urgency + ': ' + msg, 'warn');
      }

      // Just expired
      var expiredToday = 'expired-' + today;
      if (remaining <= 0 && c.lastNotifiedDate !== expiredToday) {
        c.lastNotifiedDate = expiredToday;
        PSFDB.putClient(c).catch(function () {});
        showDesktopNotification('LICENSE EXPIRED: ' + c.company, c.company + ' (' + c.name + ') has expired. Contact them to renew.');
        if (settings.soundEnabled) playNotificationSound();
        showToast('EXPIRED: ' + c.company, 'error');
      }
    });
  }

  // M2 FIX: Reuse a single AudioContext instead of creating new ones each time
  var _audioCtx = null;
  function getAudioCtx() {
    if (!_audioCtx) {
      try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    }
    if (_audioCtx && _audioCtx.state === 'suspended') {
      _audioCtx.resume().catch(function () {});
    }
    return _audioCtx;
  }

  function playNotificationSound() {
    try {
      var ctx = getAudioCtx();
      if (!ctx) return;
      // First note
      var osc1 = ctx.createOscillator();
      var gain1 = ctx.createGain();
      osc1.connect(gain1); gain1.connect(ctx.destination);
      osc1.frequency.value = 880; osc1.type = 'sine';
      gain1.gain.setValueAtTime(0.3, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc1.start(ctx.currentTime); osc1.stop(ctx.currentTime + 0.4);
      // Second note (higher, 150ms later)
      setTimeout(function () {
        try {
          var osc2 = ctx.createOscillator();
          var gain2 = ctx.createGain();
          osc2.connect(gain2); gain2.connect(ctx.destination);
          osc2.frequency.value = 1320; osc2.type = 'sine';
          gain2.gain.setValueAtTime(0.25, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc2.start(ctx.currentTime); osc2.stop(ctx.currentTime + 0.3);
        } catch (e) {}
      }, 150);
    } catch (e) {}
  }

  function showDesktopNotification(title, body) {
    try {
      if (Notification && Notification.permission === 'granted') {
        new Notification(title, { body: body, icon: 'phein-icons/android-chrome-192x192.png', tag: title });
      }
    } catch (e) {}
  }

  function requestNotificationPermission() {
    try {
      if (Notification && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    } catch (e) {}
  }

  // =============================================================
  // EXPORT / IMPORT
  // =============================================================
  function handleExport() {
    PSFDB.exportAll().then(function (data) {
      var json = JSON.stringify(data, null, 2);
      var blob = new Blob([json], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'psf-manager-backup-' + new Date().toISOString().split('T')[0] + '.json';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Backup exported successfully', 'success');
    }).catch(function (err) {
      showToast('Export failed: ' + err.message, 'error');
    });
  }

  function handleImport(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (event) {
      try {
        var data = JSON.parse(event.target.result);
        if (!confirm('This will REPLACE all existing data. Continue?')) return;
        PSFDB.importAll(data).then(function () {
          loadClients().then(function () {
            renderClientList();
            renderDashboard();
            showToast('Data imported successfully', 'success');
          });
        }).catch(function (err) {
          showToast('Import failed: ' + err.message, 'error');
        });
      } catch (err) {
        showToast('Invalid backup file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset for re-import
  }

  // =============================================================
  // CODE GENERATOR
  // =============================================================
  function generateCode() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no confusing chars
    var part1 = '';
    for (var i = 0; i < 4; i++) part1 += chars[Math.floor(Math.random() * chars.length)];
    var part2 = '';
    for (var j = 0; j < 4; j++) part2 += chars[Math.floor(Math.random() * chars.length)];
    return 'PHEIN-' + part1 + '-' + part2 + '-2026';
  }

  function generateAuthEntry(client) {
    var duration = client.durationDays;
    if (duration >= 36500) duration = 30; // perpetual/enterprise → store as 30 (max valid)
    return '{ company: "' + client.company + '", code: "' + client.code + '", duration: ' + duration + ', status: "inactive" }' +
      (client.licenseType === 'Enterprise Plus' ? ' // Enterprise Plus — add stations: 3' : '');
  }

  function showAuthEntry(entry) {
    showToast('Auth.js entry: ' + entry, 'success');
    // Also try to copy to clipboard
    copyToClipboard(entry);
  }

  // =============================================================
  // HELPERS
  // =============================================================
  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }
  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }
  function escapeHtml(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }
  function copyToClipboard(text) {
    try {
      navigator.clipboard.writeText(text);
    } catch (e) {
      var ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e2) {}
      document.body.removeChild(ta);
    }
  }
  function showToast(msg, type) {
    var t = document.getElementById('psf-toast');
    if (!t) return;
    var colors = { success: '#10b981', error: '#ef4444', warn: '#f59e0b', info: '#2563eb' };
    t.style.background = colors[type] || colors.info;
    t.textContent = msg;
    t.style.opacity = '1';
    t.style.transform = 'translateX(0)';
    setTimeout(function () { t.style.opacity = '0'; t.style.transform = 'translateX(120%)'; }, 4000);
  }
  function getScenarioName(s) {
    var names = {
      activation: 'License Activated', enterprise_activation: 'Enterprise Station Activated',
      reuse_blocked: 'Reuse Blocked', device_mismatch: 'Device Mismatch',
      blacklisted: 'Code Blacklisted', blacklisted_attempt: 'Blacklisted Code Attempt',
      security_strike_1: 'Security Violation (Strike 1)', security_strike_2: 'Security Violation (Strike 2)',
      security_strike_3: 'Security Violation (Strike 3)', security_alert: 'Security Alert',
      ai_alert: 'AI Crawler Detected', purchase: 'License Purchase Request',
      review: 'Review Submitted', test: 'Test Alert', unknown: 'Unknown Alert'
    };
    return names[s] || 'Alert';
  }
  function getScenarioColor(s) {
    var colors = {
      activation: '#10b981', enterprise_activation: '#10b981',
      reuse_blocked: '#f59e0b', device_mismatch: '#f59e0b',
      blacklisted: '#ef4444', blacklisted_attempt: '#ef4444',
      security_strike_1: '#f59e0b', security_strike_2: '#f97316',
      security_strike_3: '#ef4444', security_alert: '#f59e0b',
      ai_alert: '#8b5cf6', purchase: '#2563eb', review: '#10b981',
      test: '#64748b', unknown: '#94a3b8'
    };
    return colors[s] || '#94a3b8';
  }
  function getScenarioIcon(s) {
    // Return inline SVG for each scenario
    var icons = {
      activation: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      reuse_blocked: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>',
      device_mismatch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/></svg>',
      blacklisted: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      security_strike_1: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
      security_strike_2: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
      security_strike_3: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
      purchase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
      review: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
      ai_alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
      enterprise_activation: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/></svg>',
      security_alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
      blacklisted_attempt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>',
      test: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>',
      unknown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
    };
    return icons[s] || icons.unknown;
  }
  function registerSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    }
  }

  // =============================================================
  // PUBLIC API (for inline onclick handlers)
  // =============================================================
  window.PSFApp = {
    init: init,
    navigate: navigate,
    copyTemplate: copyTemplate,
    pauseClient: pauseClient,
    resumeClient: resumeClient,
    removeClient: removeClient,
    generateCode: generateCode,
    playNotificationSound: playNotificationSound
  };

  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);
