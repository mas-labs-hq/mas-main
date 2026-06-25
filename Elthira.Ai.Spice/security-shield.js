/**
 * ============================================================================
 * LEGAL NOTICE — PROPRIETARY AND CONFIDENTIAL
 * ============================================================================
 *
 * Elthira.AI × Dr Spice Organics — Security Shield
 * Copyright © 2026 MortApps Studios. All rights reserved.
 *
 * Unauthorized reverse engineering, code analysis, decompilation, or use of
 * AI tools (including but not limited to ChatGPT, Claude, Gemini, Copilot,
 * and similar) to analyze, summarize, or extract information from this code
 * is STRICTLY PROHIBITED — including for educational purposes.
 *
 * ============================================================================
 *
 * FIXES APPLIED:
 *   - Right-click no longer triggers strikes (GPT feedback)
 *   - Window-size detection disabled on touch devices (Claude P0-5)
 *   - Debugger timing downgraded to informational only, no strike (GPT #4)
 *   - Console getter downgraded to informational only, no strike (GPT #5)
 *   - PUK codes validated via SHA-256 hashes (Claude P0-2)
 *   - Responsive PUK/lockout UI with proper touch targets
 *
 * ============================================================================
 */

(function (window, document) {
    'use strict';

    var MAX_VIOLATIONS = 3;
    var PERMANENT_VIOLATIONS = 6;
    var LOCKOUT_DURATION = 24 * 60 * 60 * 1000;
    var ESCALATION_DURATION = 30;

    var STORAGE_KEY_PRIMARY = 'elthira_sec_strikes';
    var STORAGE_KEY_BACKUP = '_elthira_sb_2026';
    var STORAGE_KEY_META = 'elthira_sec_meta';
    var COOKIE_NAME = 'elthira_bl';

    // AI CRAWLER BLOCKLIST
    var AI_CRAWLER_PATTERNS = [
        /GPTBot/i, /ChatGPT-User/i, /OAI-SearchBot/i, /Claude-Web/i, /anthropic-ai/i,
        /ClaudeBot/i, /PerplexityBot/i, /Google-Extended/i, /CCBot/i, /Bytespider/i,
        /Meta-ExternalAgent/i, /FacebookBot/i, /bingbot/i, /Applebot/i, /Amazonbot/i,
        /DotBot/i, /MauiBot/i, /AhrefsBot/i, /SemrushBot/i, /Sogou/i, /YandexBot/i,
        /Baiduspider/i, /headlesschrome/i, /phantomjs/i, /selenium/i, /puppeteer/i,
        /python-requests/i, /httpclient/i, /libwww/i, /java\//i, /perl/i, /ruby/i,
        /go-http/i, /okhttp/i, /bot/i, /crawler/i, /spider/i, /scraper/i, /fetch\//i
    ];

    if (function () {
        var ua = navigator.userAgent || '';
        for (var i = 0; i < AI_CRAWLER_PATTERNS.length; i++) {
            if (AI_CRAWLER_PATTERNS[i].test(ua)) return true;
        }
        return false;
    }()) {
        try {
            if (window.ElthiraSecurity && window.ElthiraSecurity.sendIncident) {
                window.ElthiraSecurity.sendIncident('AI BLOCKED — Automated tool detected', {
                    alert_type: 'AI / Crawler Blocked',
                    user_agent: navigator.userAgent,
                    blocked_url: window.location.href
                });
            }
        } catch (e) {}
        document.documentElement.innerHTML = '<head><title>Access Denied</title></head><body style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0f172a;color:#fff;"><div style="text-align:center;padding:2rem;max-width:500px;"><h1 style="color:#dc2626;font-size:2rem;margin-bottom:1rem;">Access Denied</h1><p style="color:#94a3b8;font-size:1.1rem;line-height:1.6;">This software is protected by copyright law. Automated access, scraping, and AI analysis tools are strictly prohibited.</p></div></body>';
        throw new Error('Access denied');
    }

    // STORAGE — Multi-layer persistence
    function getMeta() {
        var meta = { lifetimeStrikes: 0, sessionStrikes: 0, lastLockoutAt: 0, permanentlyBanned: false, lockoutUntil: 0 };
        try { var raw = localStorage.getItem(STORAGE_KEY_META); if (raw) { var p = JSON.parse(raw); if (p) { meta.lifetimeStrikes = p.lifetimeStrikes||0; meta.sessionStrikes = p.sessionStrikes||0; meta.lastLockoutAt = p.lastLockoutAt||0; meta.permanentlyBanned = p.permanentlyBanned||false; meta.lockoutUntil = p.lockoutUntil||0; } } } catch (e) {}
        try { var raw2 = localStorage.getItem(STORAGE_KEY_BACKUP); if (raw2) { var d = JSON.parse(atob(raw2)); if (d) { meta.lifetimeStrikes = Math.max(meta.lifetimeStrikes, d.lifetimeStrikes||0); meta.sessionStrikes = Math.max(meta.sessionStrikes, d.sessionStrikes||0); meta.lastLockoutAt = Math.max(meta.lastLockoutAt, d.lastLockoutAt||0); meta.permanentlyBanned = meta.permanentlyBanned || d.permanentlyBanned||false; meta.lockoutUntil = Math.max(meta.lockoutUntil, d.lockoutUntil||0); } } } catch (e) {}
        try { var cookies = document.cookie.split(';'); for (var i = 0; i < cookies.length; i++) { var c = cookies[i].trim(); if (c.indexOf(COOKIE_NAME + '=') === 0) { var cd = JSON.parse(decodeURIComponent(c.substring(COOKIE_NAME.length + 1))); if (cd) { meta.lifetimeStrikes = Math.max(meta.lifetimeStrikes, cd.lifetimeStrikes||0); meta.sessionStrikes = Math.max(meta.sessionStrikes, cd.sessionStrikes||0); meta.lastLockoutAt = Math.max(meta.lastLockoutAt, cd.lastLockoutAt||0); meta.permanentlyBanned = meta.permanentlyBanned || cd.permanentlyBanned||false; meta.lockoutUntil = Math.max(meta.lockoutUntil, cd.lockoutUntil||0); } } } } catch (e) {}
        return meta;
    }

    function saveMeta(meta) {
        try { localStorage.setItem(STORAGE_KEY_META, JSON.stringify(meta)); } catch (e) {}
        try { localStorage.setItem(STORAGE_KEY_BACKUP, btoa(JSON.stringify(meta))); } catch (e) {}
        try { var expires = new Date(); expires.setFullYear(expires.getFullYear() + 1); document.cookie = COOKIE_NAME + '=' + encodeURIComponent(JSON.stringify(meta)) + ';expires=' + expires.toUTCString() + ';path=/;SameSite=Lax'; } catch (e) {}
        try { var request = indexedDB.open('elthira_security', 1); request.onupgradeneeded = function (event) { var db = event.target.result; if (!db.objectStoreNames.contains('meta')) { db.createObjectStore('meta', { keyPath: 'id' }); } }; request.onsuccess = function (event) { var db = event.target.result; if (!db.objectStoreNames.contains('meta')) return; var tx = db.transaction(['meta'], 'readwrite'); var store = tx.objectStore('meta'); store.put({ id: 'strike_meta', data: meta, timestamp: Date.now() }); }; } catch (e) {}
    }

    function isLockedOut() {
        var meta = getMeta();
        if (meta.permanentlyBanned) return 'permanent';
        if (meta.lockoutUntil > Date.now()) return '24h';
        if (meta.lockoutUntil > 0 && meta.lockoutUntil <= Date.now()) { meta.sessionStrikes = 0; meta.lockoutUntil = 0; saveMeta(meta); }
        return false;
    }

    function isFormElement(target) {
        if (!target || !target.tagName) return false;
        var tag = target.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable) return true;
        var el = target; var hops = 0;
        while (el && hops < 6) {
            if (el.classList && (el.classList.contains('selectable') || el.classList.contains('results-card') || el.classList.contains('results-content'))) return true;
            el = el.parentNode; hops++;
        }
        return false;
    }

    // WARNING POPUP
    function showWarningPopup(violationCount, isFinal24h) {
        var existing = document.getElementById('elthira-sec-warning');
        if (existing) existing.parentNode.removeChild(existing);
        var overlay = document.createElement('div');
        overlay.id = 'elthira-sec-warning';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(2,6,23,0.85);z-index:999999;display:flex;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);';
        var iconColor, bgColor, title, message, btnColor;
        if (isFinal24h) {
            iconColor = '#dc2626'; bgColor = 'rgba(239,68,68,0.12)';
            title = 'Access Restricted — 24 Hour Lockout';
            message = 'You have exceeded the maximum number of permitted security violations. Your access to Elthira.AI has been temporarily restricted for 24 hours. This incident has been reported.';
            btnColor = '#dc2626';
        } else {
            iconColor = violationCount === 1 ? '#f59e0b' : '#ea580c';
            bgColor = violationCount === 1 ? 'rgba(245,158,11,0.12)' : 'rgba(234,88,12,0.12)';
            if (violationCount === 1) {
                title = "This Action Isn't Available";
                message = "Some browser actions (like opening developer tools or copying protected content) aren't available in this app. If you didn't mean to do this, don't worry — just continue using Elthira normally. Repeated attempts will restrict your access for 24 hours.";
            } else {
                title = 'Final Warning — Strike 2 of 3';
                message = 'This is your final warning. One more attempt to access developer tools or tamper with the application will restrict your access for 24 hours. This incident has been logged.';
            }
            btnColor = violationCount === 1 ? '#f59e0b' : '#ea580c';
        }
        overlay.innerHTML = '<div style="background:#fff;border-radius:20px;padding:1.75rem 1.5rem;max-width:440px;width:100%;text-align:center;box-shadow:0 30px 60px rgba(0,0,0,0.4);max-height:90vh;overflow-y:auto;"><div style="width:64px;height:64px;border-radius:50%;margin:0 auto 1rem;display:flex;align-items:center;justify-content:center;background:' + bgColor + ';"><svg viewBox="0 0 24 24" fill="none" stroke="' + iconColor + '" stroke-width="2" style="width:32px;height:32px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div><h2 style="font-family:system-ui,sans-serif;font-size:1.25rem;font-weight:700;color:#0f172a;margin:0 0 0.75rem;">' + title + '</h2><p style="font-family:system-ui,sans-serif;font-size:0.875rem;line-height:1.6;color:#64748b;margin:0 0 1rem;white-space:pre-line;">' + message + '</p><div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:10px 12px;margin-bottom:1.25rem;text-align:left;"><div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:4px;">Incident Details Being Recorded</div><div id="elthira-warn-location" style="font-size:0.8rem;color:#475569;font-family:monospace;">Location: <span style="color:#dc2626;">Calculating...</span></div><div style="font-size:0.8rem;color:#475569;font-family:monospace;margin-top:2px;">Device: <span style="color:#dc2626;">Identified</span></div></div><button id="elthira-sec-warn-close" style="background:' + btnColor + ';color:#fff;border:none;border-radius:10px;padding:0.75rem 1.75rem;font-size:0.95rem;font-weight:600;cursor:pointer;font-family:inherit;width:100%;">I understand</button></div>';
        document.body.appendChild(overlay);
        setTimeout(function () {
            var locEl = document.getElementById('elthira-warn-location');
            if (!locEl) return;
            var ipInfo = window.ElthiraSecurity ? window.ElthiraSecurity.getIpInfo() : null;
            var patientLoc = window.ElthiraSecurity ? window.ElthiraSecurity.getPatientLocationFromStorage() : null;
            var geo = window.ElthiraSecurity ? window.ElthiraSecurity.getGeolocation() : null;
            var locText = 'Unknown';
            if (geo) locText = geo.latitude.toFixed(4) + ', ' + geo.longitude.toFixed(4) + ' (GPS)';
            else if (ipInfo && ipInfo.city && ipInfo.city !== 'Unknown') { locText = ipInfo.city + ', ' + ipInfo.country; if (patientLoc && patientLoc.county) locText += ' (County: ' + patientLoc.county + ')'; }
            else if (patientLoc && patientLoc.county) locText = patientLoc.county + ' County, Kenya (from form)';
            locEl.innerHTML = 'Location: <span style="color:#dc2626;">' + locText + '</span>';
        }, 3000);
        var closeBtn = document.getElementById('elthira-sec-warn-close');
        if (closeBtn) closeBtn.addEventListener('click', function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); });
    }

    // 24-HOUR LOCKOUT SCREEN
    var lockoutInterval = null;
    function showLockoutScreen() {
        var existing = document.getElementById('elthira-lockout');
        if (existing) return;
        var meta = getMeta();
        var remaining = meta.lockoutUntil - Date.now();
        if (remaining <= 0) return;
        var overlay = document.createElement('div');
        overlay.id = 'elthira-lockout';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:linear-gradient(135deg,#0f172a,#1e293b);z-index:999999;display:flex;align-items:center;justify-content:center;padding:1.5rem;overflow:hidden;';
        overlay.innerHTML = '<div style="text-align:center;max-width:420px;width:100%;color:#fff;"><div style="width:80px;height:80px;border-radius:50%;margin:0 auto 1.5rem;display:flex;align-items:center;justify-content:center;background:rgba(239,68,68,0.15);"><svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" style="width:40px;height:40px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div><h1 style="font-family:system-ui,sans-serif;font-size:1.5rem;font-weight:800;margin:0 0 0.5rem;letter-spacing:-0.5px;">Access Restricted</h1><p style="font-family:system-ui,sans-serif;font-size:0.9rem;color:#94a3b8;line-height:1.6;margin:0 0 2rem;">Your access has been temporarily restricted due to suspicious activity.</p><div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:1.5rem;margin-bottom:1.5rem;"><p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin:0 0 0.5rem;">Time Remaining</p><div id="elthira-lockout-timer" style="font-size:2rem;font-weight:800;font-family:monospace;color:#dc2626;letter-spacing:2px;">--:--:--</div></div></div>';
        document.body.appendChild(overlay);
        function updateTimer() {
            var meta = getMeta();
            var ms = meta.lockoutUntil - Date.now();
            if (ms <= 0) { clearInterval(lockoutInterval); if (overlay.parentNode) overlay.parentNode.removeChild(overlay); return; }
            var totalSec = Math.floor(ms / 1000);
            var h = Math.floor(totalSec / 3600);
            var m = Math.floor((totalSec % 3600) / 60);
            var s = totalSec % 60;
            var timerEl = document.getElementById('elthira-lockout-timer');
            if (timerEl) timerEl.textContent = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
        }
        updateTimer();
        lockoutInterval = setInterval(updateTimer, 1000);
    }

    // PERMANENT LOCKOUT SCREEN (responsive, with PUK hash validation)
    function showPermanentLockout() {
        var existing = document.getElementById('elthira-perm-lockout');
        if (existing) return;
        if (!document.getElementById('elthira-perm-css')) {
            var css = document.createElement('style');
            css.id = 'elthira-perm-css';
            css.textContent = '#elthira-perm-lockout{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}#elthira-perm-lockout .perm-container{max-width:500px;width:100%;margin:auto;padding:1.5rem;color:#fff;text-align:center;box-sizing:border-box;}#elthira-perm-lockout .perm-icon{width:72px;height:72px;border-radius:50%;margin:0 auto 1.25rem;display:flex;align-items:center;justify-content:center;background:rgba(220,38,38,0.15);flex-shrink:0;}#elthira-perm-lockout .perm-title{font-size:clamp(1.25rem,5vw,1.5rem);font-weight:800;margin:0 0 0.5rem;letter-spacing:-0.5px;}#elthira-perm-lockout .perm-subtitle{font-size:clamp(0.8rem,3.5vw,0.9rem);color:#94a3b8;line-height:1.55;margin:0 0 1.5rem;}#elthira-perm-lockout .perm-btn{display:block;width:100%;padding:16px;border:none;border-radius:12px;font-size:0.95rem;font-weight:600;cursor:pointer;font-family:inherit;margin-bottom:10px;min-height:52px;box-sizing:border-box;transition:transform 0.1s,opacity 0.2s;}#elthira-perm-lockout .perm-btn:active{transform:scale(0.98);}#elthira-perm-lockout .perm-btn-primary{background:linear-gradient(135deg,#2d6a4f,#1b4332);color:#fff;box-shadow:0 4px 14px rgba(45,106,79,0.35);}#elthira-perm-lockout .perm-btn-secondary{background:transparent;color:#94a3b8;border:1px solid rgba(255,255,255,0.2);}#elthira-perm-lockout .perm-form{text-align:left;margin-top:1.5rem;animation:elthira-fadein 0.3s ease;}#elthira-perm-lockout .perm-form h3{font-size:1rem;font-weight:700;margin:0 0 1rem;color:#fff;text-align:center;}#elthira-perm-lockout .perm-input{width:100%;padding:12px 14px;margin-bottom:8px;border-radius:10px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;font-size:0.9rem;box-sizing:border-box;font-family:inherit;min-height:44px;}#elthira-perm-lockout .perm-input:focus{outline:none;border-color:#2d6a4f;background:rgba(255,255,255,0.08);}#elthira-perm-lockout .perm-textarea{width:100%;padding:12px 14px;margin-bottom:12px;border-radius:10px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;font-size:0.9rem;resize:vertical;font-family:inherit;box-sizing:border-box;min-height:80px;}#elthira-perm-lockout .perm-success{text-align:center;padding:1.5rem;animation:elthira-fadein 0.3s ease;}';
            document.head.appendChild(css);
        }
        var overlay = document.createElement('div');
        overlay.id = 'elthira-perm-lockout';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:linear-gradient(135deg,#0f172a,#1e1b2e);z-index:999999;display:flex;align-items:flex-start;justify-content:center;padding:1rem;overflow-y:auto;-webkit-overflow-scrolling:touch;';
        overlay.innerHTML = '<div class="perm-container"><div class="perm-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" style="width:36px;height:36px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div><h1 class="perm-title">Access Permanently Restricted</h1><p class="perm-subtitle">Your device has been permanently restricted due to repeated suspicious activity. To request access restoration, submit an appeal for review, or enter a PUK code if you have one.</p><div id="elthira-perm-actions"><button id="elthira-appeal-btn" class="perm-btn perm-btn-primary">Request Access Review</button><button id="elthira-puk-btn" class="perm-btn perm-btn-secondary">Enter PUK Code</button></div><div id="elthira-appeal-form" class="perm-form" style="display:none;"><h3>Access Review Request</h3><input id="appeal-name" type="text" placeholder="Full Name *" class="perm-input"><input id="appeal-location" type="text" placeholder="Location (City, Country) *" class="perm-input"><input id="appeal-email" type="email" placeholder="Email Address *" class="perm-input"><input id="appeal-phone" type="tel" placeholder="Phone Number" class="perm-input"><textarea id="appeal-reason" rows="4" placeholder="Reason for Access Request *" class="perm-textarea"></textarea><button id="appeal-submit" class="perm-btn perm-btn-primary">Submit Appeal for Review</button></div><div id="elthira-puk-form" class="perm-form" style="display:none;"><h3>Enter PUK Code</h3><input id="puk-input" type="text" placeholder="ELT-PUK-XXXX-YYYY" class="perm-input" style="text-align:center;font-family:monospace;letter-spacing:1px;"><button id="puk-submit" class="perm-btn perm-btn-primary">Unlock</button><p id="puk-error" style="color:#dc2626;font-size:0.85rem;margin-top:8px;display:none;text-align:center;">Invalid PUK code. Please check and try again.</p></div></div>';
        document.body.appendChild(overlay);

        var appealBtn = document.getElementById('elthira-appeal-btn');
        var pukBtn = document.getElementById('elthira-puk-btn');
        var appealForm = document.getElementById('elthira-appeal-form');
        var pukForm = document.getElementById('elthira-puk-form');
        var actionsDiv = document.getElementById('elthira-perm-actions');

        if (appealBtn) appealBtn.addEventListener('click', function () { actionsDiv.style.display = 'none'; appealForm.style.display = 'block'; appealForm.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
        if (pukBtn) pukBtn.addEventListener('click', function () { actionsDiv.style.display = 'none'; pukForm.style.display = 'block'; pukForm.scrollIntoView({ behavior: 'smooth', block: 'center' }); var pukInput = document.getElementById('puk-input'); if (pukInput) setTimeout(function() { pukInput.focus(); }, 300); });

        var appealSubmit = document.getElementById('appeal-submit');
        if (appealSubmit) appealSubmit.addEventListener('click', function () {
            var name = (document.getElementById('appeal-name').value || '').trim();
            var location = (document.getElementById('appeal-location').value || '').trim();
            var email = (document.getElementById('appeal-email').value || '').trim();
            var phone = (document.getElementById('appeal-phone').value || '').trim();
            var reason = (document.getElementById('appeal-reason').value || '').trim();
            if (!name || !location || !email || !reason) { showSecurityToast('Please fill in all required fields (marked with *)', 'error'); return; }
            if (window.ElthiraSecurity && window.ElthiraSecurity.sendIncident) {
                window.ElthiraSecurity.sendIncident('Snooper Code! — Appeal from ' + name, { alert_type: 'PUK Appeal — Access Review Request', appeal_name: name, appeal_location: location, appeal_email: email, appeal_phone: phone, appeal_reason: reason });
            }
            appealForm.innerHTML = '<div class="perm-success"><div style="width:56px;height:56px;border-radius:50%;margin:0 auto 1rem;display:flex;align-items:center;justify-content:center;background:rgba(45,106,79,0.2);"><svg viewBox="0 0 24 24" fill="none" stroke="#2d6a4f" stroke-width="2" style="width:28px;height:28px;"><polyline points="20 6 9 17 4 12"/></svg></div><h3 style="font-size:1.1rem;font-weight:700;margin:0 0 0.5rem;color:#fff;">Appeal Submitted</h3><p style="font-size:0.9rem;color:#94a3b8;line-height:1.6;">Your appeal has been submitted for review. If approved, you will receive a PUK code via email within 24-48 hours.</p></div>';
        });

        var pukSubmit = document.getElementById('puk-submit');
        if (pukSubmit) pukSubmit.addEventListener('click', function () {
            var enteredCode = (document.getElementById('puk-input').value || '').trim();
            if (!enteredCode) { var e0 = document.getElementById('puk-error'); if (e0) { e0.style.display = 'block'; e0.textContent = 'Please enter a PUK code.'; } return; }
            var pukHashes = window.PUK_HASHES || [];
            function sha256Hex(text) { try { var encoder = new TextEncoder(); var data = encoder.encode(text); return crypto.subtle.digest('SHA-256', data).then(function (hashBuffer) { var hashArray = Array.from(new Uint8Array(hashBuffer)); return hashArray.map(function (b) { return b.toString(16).padStart(2, '0'); }).join(''); }); } catch (e) { return Promise.reject(e); } }
            sha256Hex(enteredCode).then(function (enteredHash) {
                var valid = false;
                for (var i = 0; i < pukHashes.length; i++) { if (pukHashes[i].hash && pukHashes[i].hash.toLowerCase() === enteredHash.toLowerCase()) { valid = true; break; } }
                if (valid) {
                    if (window.ElthiraSecurity && window.ElthiraSecurity.sendIncident) { window.ElthiraSecurity.sendIncident('PUK Unlock — Valid code entered (hash: ' + enteredHash.substring(0, 16) + '...)', { alert_type: 'PUK Unlock — Valid Code Entered', puk_code_hash: enteredHash }); }
                    var meta = getMeta(); meta.lifetimeStrikes = 0; meta.sessionStrikes = 0; meta.permanentlyBanned = false; meta.lockoutUntil = 0; saveMeta(meta);
                    pukForm.innerHTML = '<div class="perm-success"><div style="width:56px;height:56px;border-radius:50%;margin:0 auto 1rem;display:flex;align-items:center;justify-content:center;background:rgba(45,106,79,0.2);"><svg viewBox="0 0 24 24" fill="none" stroke="#2d6a4f" stroke-width="2" style="width:28px;height:28px;"><polyline points="20 6 9 17 4 12"/></svg></div><h3 style="font-size:1.1rem;font-weight:700;margin:0 0 0.5rem;color:#fff;">Access Restored</h3><p style="font-size:0.9rem;color:#94a3b8;">Please wait while we restore your access...</p></div>';
                    setTimeout(function () { window.location.reload(); }, 1500);
                } else {
                    var errorEl = document.getElementById('puk-error'); if (errorEl) { errorEl.style.display = 'block'; errorEl.textContent = 'Invalid PUK code. Please check and try again.'; }
                    if (window.ElthiraSecurity && window.ElthiraSecurity.sendIncident) { window.ElthiraSecurity.sendIncident('PUK Failed — Wrong code attempted (hash: ' + enteredHash.substring(0, 16) + '...)', { alert_type: 'PUK Unlock Failed — Wrong Code', attempted_code_hash: enteredHash }); }
                }
            }).catch(function () {
                var errorEl2 = document.getElementById('puk-error'); if (errorEl2) { errorEl2.style.display = 'block'; errorEl2.textContent = 'Unable to validate PUK code. Please try again.'; }
            });
        });
    }

    function showSecurityToast(message, type) {
        var existing = document.getElementById('elthira-sec-toast');
        if (existing) existing.parentNode.removeChild(existing);
        var toast = document.createElement('div');
        toast.id = 'elthira-sec-toast';
        var bgColor = type === 'error' ? '#dc2626' : '#2d6a4f';
        toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:' + bgColor + ';color:#fff;padding:14px 20px;border-radius:10px;font-size:0.9rem;font-weight:500;font-family:system-ui,sans-serif;z-index:9999999;box-shadow:0 8px 24px rgba(0,0,0,0.3);max-width:90vw;text-align:center;animation:elthira-fadein 0.3s ease;';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(function () { if (toast.parentNode) { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s ease'; setTimeout(function () { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300); } }, 3000);
    }

    // ESCALATION SCREEN
    function showEscalationScreen() {
        var existing = document.getElementById('elthira-escalation');
        if (existing) existing.parentNode.removeChild(existing);
        var refId = 'ELT-2026-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        var overlay = document.createElement('div');
        overlay.id = 'elthira-escalation';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#1a0505;z-index:9999999;display:flex;align-items:center;justify-content:center;padding:1.5rem;overflow:hidden;';
        var style = document.createElement('style');
        style.textContent = '@keyframes elthira-pulse{0%,100%{background:#1a0505;}50%{background:#2d0808;}}@keyframes elthira-fadein{0%{opacity:0;transform:translateY(5px);}100%{opacity:1;transform:translateY(0);}}';
        overlay.appendChild(style);
        overlay.style.animation = 'elthira-pulse 2s ease-in-out infinite';
        overlay.innerHTML += '<div style="text-align:center;max-width:520px;width:100%;color:#fff;position:relative;z-index:2;"><div style="width:72px;height:72px;border-radius:50%;margin:0 auto 1.25rem;display:flex;align-items:center;justify-content:center;background:rgba(220,38,38,0.2);border:2px solid rgba(220,38,38,0.4);"><svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" style="width:36px;height:36px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div><h1 style="font-family:system-ui,sans-serif;font-size:1.6rem;font-weight:900;margin:0 0 0.5rem;letter-spacing:-0.5px;color:#dc2626;text-transform:uppercase;">Security Incident Logged</h1><p style="font-family:system-ui,sans-serif;font-size:0.9rem;color:#94a3b8;line-height:1.5;margin:0 0 1.5rem;">Your device has been identified attempting unauthorized access. The following information has been recorded:</p><div id="elthira-scan-container" style="margin-bottom:1.5rem;"><div style="background:rgba(255,255,255,0.05);border:1px solid rgba(220,38,38,0.3);border-radius:12px;padding:1rem;margin-bottom:0.75rem;overflow:hidden;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;"><span style="font-size:0.75rem;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Scanning Device...</span><span id="elthira-scan-percent" style="font-size:0.75rem;color:#dc2626;font-family:monospace;">0%</span></div><div style="background:rgba(255,255,255,0.05);height:4px;border-radius:2px;overflow:hidden;"><div id="elthira-scan-bar" style="background:linear-gradient(90deg,#dc2626,#ef4444);height:100%;width:0%;transition:width 0.1s linear;"></div></div></div><div id="elthira-info-list" style="text-align:left;font-family:monospace;font-size:0.8rem;color:#94a3b8;opacity:0;"></div></div><div id="elthira-ref-id" style="display:none;margin-bottom:1.5rem;"><p style="font-size:0.75rem;color:#64748b;margin:0;">Reference ID</p><p style="font-size:1rem;color:#dc2626;font-family:monospace;font-weight:700;margin:4px 0 0;">' + refId + '</p></div><div id="elthira-reported" style="display:none;margin-bottom:1.5rem;"><p style="font-size:0.85rem;color:#94a3b8;"><span style="color:#2d6a4f;">✓</span> Reported to Dr Spice Organics<br><span style="color:#2d6a4f;">✓</span> Reported to MortApps Studios<br><span style="color:#2d6a4f;">✓</span> Incident filed with Reference ID</p></div><div id="elthira-countdown-container" style="display:none;margin-bottom:1.5rem;"><p style="font-size:0.75rem;color:#64748b;margin:0 0 4px;">Time remaining on this screen</p><div id="elthira-esc-countdown" style="font-size:1.5rem;font-weight:700;color:#dc2626;font-family:monospace;">30</div></div><button id="elthira-esc-review" style="display:none;background:transparent;color:#94a3b8;border:1px solid rgba(255,255,255,0.2);border-radius:10px;padding:12px 24px;font-size:0.9rem;font-weight:600;cursor:pointer;font-family:inherit;">Request Access Review</button></div>';
        document.body.appendChild(overlay);

        try {
            if (!window.speechSynthesis) {} else {
                var text = 'Security incident logged. Device information recorded. Reference ID logged. This incident has been reported to Dr Spice Organics and MortApps Studios.';
                function speak() { var u = new SpeechSynthesisUtterance(text); u.rate = 0.85; u.pitch = 0.7; u.volume = 1.0; window.speechSynthesis.speak(u); }
                speak();
                setTimeout(function () { speak(); }, 4000);
            }
        } catch (e) {}

        var scanBar = document.getElementById('elthira-scan-bar');
        var scanPercent = document.getElementById('elthira-scan-percent');
        var infoList = document.getElementById('elthira-info-list');
        var refIdEl = document.getElementById('elthira-ref-id');
        var reportedEl = document.getElementById('elthira-reported');
        var countdownContainer = document.getElementById('elthira-countdown-container');
        var reviewBtn = document.getElementById('elthira-esc-review');
        var ipInfo = window.ElthiraSecurity ? window.ElthiraSecurity.getIpInfo() : { ip: 'Unknown', city: 'Unknown', country: 'Unknown', isp: 'Unknown' };
        var deviceInfo = window.ElthiraSecurity ? window.ElthiraSecurity.getDeviceInfo() : { user_agent: navigator.userAgent };
        var scanProgress = 0;
        var scanInterval = setInterval(function () {
            scanProgress += 2;
            if (scanBar) scanBar.style.width = scanProgress + '%';
            if (scanPercent) scanPercent.textContent = scanProgress + '%';
            if (scanProgress === 20 && infoList) { infoList.style.opacity = '1'; infoList.style.animation = 'elthira-fadein 0.5s ease'; infoList.innerHTML = '<div style="padding:4px 0;"><span style="color:#64748b;">IP Address:</span> <span style="color:#fff;">' + ipInfo.ip + '</span></div>'; }
            if (scanProgress === 40 && infoList) infoList.innerHTML += '<div style="padding:4px 0;"><span style="color:#64748b;">Location:</span> <span style="color:#fff;">' + ipInfo.city + ', ' + ipInfo.country + '</span></div>';
            if (scanProgress === 60 && infoList) infoList.innerHTML += '<div style="padding:4px 0;"><span style="color:#64748b;">ISP:</span> <span style="color:#fff;">' + ipInfo.isp + '</span></div>';
            if (scanProgress === 80 && infoList) infoList.innerHTML += '<div style="padding:4px 0;"><span style="color:#64748b;">Browser:</span> <span style="color:#fff;">' + (deviceInfo.user_agent || 'Unknown').substring(0, 80) + '</span></div>';
            if (scanProgress === 100) {
                clearInterval(scanInterval);
                infoList.innerHTML += '<div style="padding:4px 0;"><span style="color:#64748b;">Timestamp:</span> <span style="color:#fff;">' + new Date().toLocaleString() + '</span></div>';
                if (refIdEl) refIdEl.style.display = 'block';
                if (reportedEl) reportedEl.style.display = 'block';
                if (countdownContainer) countdownContainer.style.display = 'block';
                var countdown = ESCALATION_DURATION;
                var cdEl = document.getElementById('elthira-esc-countdown');
                var cdInterval = setInterval(function () { countdown--; if (cdEl) cdEl.textContent = countdown; if (countdown <= 0) { clearInterval(cdInterval); if (reviewBtn) reviewBtn.style.display = 'inline-block'; if (countdownContainer) countdownContainer.style.display = 'none'; } }, 1000);
            }
        }, 100);
        if (reviewBtn) reviewBtn.addEventListener('click', function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); var meta = getMeta(); meta.permanentlyBanned = true; saveMeta(meta); showPermanentLockout(); });
    }

    // FLAG FUNCTION
    var lastFlagTime = 0;
    var FLAG_COOLDOWN = 2000;
    function flagDevToolsAttempt(method) {
        var now = Date.now();
        if (now - lastFlagTime < FLAG_COOLDOWN) return;
        lastFlagTime = now;
        if (window.ElthiraSecurity && typeof window.ElthiraSecurity.requestGeolocation === 'function') window.ElthiraSecurity.requestGeolocation();
        var meta = getMeta();
        if (meta.permanentlyBanned) { showPermanentLockout(); return; }
        if (meta.lockoutUntil > Date.now()) {
            if (window.ElthiraSecurity && window.ElthiraSecurity.sendIncident) window.ElthiraSecurity.sendIncident('ESCALATION — Snooping during lockout — Method: ' + method, { alert_type: 'ESCALATION — User snooping during 24h lockout', detection_method: method });
            showEscalationScreen();
            return;
        }
        meta.sessionStrikes++;
        meta.lifetimeStrikes++;
        var isThirdStrike = meta.sessionStrikes >= MAX_VIOLATIONS;
        var isPermanentStrike = meta.lifetimeStrikes >= PERMANENT_VIOLATIONS;
        if (isPermanentStrike) {
            meta.permanentlyBanned = true; saveMeta(meta);
            if (window.ElthiraSecurity && window.ElthiraSecurity.sendIncident) window.ElthiraSecurity.sendIncident('PERMANENT BAN — Strike ' + meta.lifetimeStrikes + ' — Method: ' + method, { alert_type: 'PERMANENT BAN — Maximum lifetime violations exceeded', detection_method: method, lifetime_strikes: String(meta.lifetimeStrikes) });
            showPermanentLockout();
            return;
        }
        if (isThirdStrike) {
            meta.lockoutUntil = Date.now() + LOCKOUT_DURATION; meta.lastLockoutAt = Date.now(); saveMeta(meta);
            if (window.ElthiraSecurity && window.ElthiraSecurity.sendIncident) window.ElthiraSecurity.sendIncident('LOCKOUT 24h — Strike 3 — Method: ' + method, { alert_type: '24-HOUR LOCKOUT', detection_method: method, session_strikes: String(meta.sessionStrikes), lifetime_strikes: String(meta.lifetimeStrikes) });
            showLockoutScreen();
            return;
        }
        saveMeta(meta);
        if (window.ElthiraSecurity && window.ElthiraSecurity.sendIncident) window.ElthiraSecurity.sendIncident('Security Warning — Strike ' + meta.sessionStrikes + ' of ' + MAX_VIOLATIONS + ' — Method: ' + method, { alert_type: 'Security Warning', detection_method: method, session_strikes: String(meta.sessionStrikes), lifetime_strikes: String(meta.lifetimeStrikes) });
        showWarningPopup(meta.sessionStrikes, false);
    }

    // METHOD 1 — Right-click block (NO STRIKE)
    document.addEventListener('contextmenu', function (e) { e.preventDefault(); return false; });

    // METHOD 2 — Keyboard shortcuts
    document.addEventListener('keydown', function (e) {
        var key = (e.key || '').toLowerCase(); var ctrl = e.ctrlKey || e.metaKey; var shift = e.shiftKey;
        if (e.key === 'F12') { e.preventDefault(); flagDevToolsAttempt('F12 key'); return false; }
        if (ctrl && shift && (key === 'i' || key === 'j' || key === 'c')) { e.preventDefault(); flagDevToolsAttempt('Ctrl+Shift+' + key.toUpperCase()); return false; }
        if (ctrl && key === 'u') { e.preventDefault(); flagDevToolsAttempt('Ctrl+U (view source)'); return false; }
        if (ctrl && key === 's') { e.preventDefault(); flagDevToolsAttempt('Ctrl+S (save)'); return false; }
        if (ctrl && shift && key === 'k') { e.preventDefault(); flagDevToolsAttempt('Ctrl+Shift+K (console)'); return false; }
    });

    // METHOD 3 — Copy/cut block (excludes form fields + .selectable)
    document.addEventListener('selectstart', function (e) { if (isFormElement(e.target)) return; e.preventDefault(); return false; });
    document.addEventListener('copy', function (e) { if (isFormElement(e.target)) return; e.preventDefault(); flagDevToolsAttempt('Copy attempt'); return false; });
    document.addEventListener('cut', function (e) { if (isFormElement(e.target)) return; e.preventDefault(); flagDevToolsAttempt('Cut attempt'); return false; });

    // METHOD 4 — Drag block
    document.addEventListener('dragstart', function (e) { e.preventDefault(); return false; });

    // METHOD 5 — Window size delta (touch devices: width only)
    (function () {
        var devtoolsOpen = false; var threshold = 160;
        var isTouchDevice = (navigator.maxTouchPoints || 0) > 0 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent || '');
        setInterval(function () {
            var widthDiff = window.outerWidth - window.innerWidth;
            var heightDiff = window.outerHeight - window.innerHeight;
            var open = isTouchDevice ? widthDiff > threshold : (widthDiff > threshold || heightDiff > threshold);
            if (open && !devtoolsOpen) { devtoolsOpen = true; flagDevToolsAttempt('DevTools window-size detection'); }
            devtoolsOpen = open;
        }, 1500);
    })();

    // METHOD 6 — Debugger timing (INFORMATIONAL ONLY, no strike)
    (function () {
        var lastInfoLog = 0;
        setInterval(function () {
            var start = performance.now(); debugger; var end = performance.now();
            if (end - start > 500) {
                var now = Date.now();
                if (now - lastInfoLog > 300000) {
                    lastInfoLog = now;
                    if (window.ElthiraSecurity && typeof window.ElthiraSecurity.sendIncident === 'function') {
                        window.ElthiraSecurity.sendIncident('INFORMATIONAL — Debugger timing anomaly (no strike)', { alert_type: 'INFORMATIONAL — Debugger timing anomaly', detection_method: 'DevTools debugger timing detection', elapsed_ms: String(Math.round(end - start)), note: 'Informational only. No strike incremented.' });
                    }
                }
            }
        }, 5000);
    })();

    // METHOD 7 — Console getter (INFORMATIONAL ONLY, no strike)
    (function () {
        var element = new Image(); var lastInfoLog = 0;
        Object.defineProperty(element, 'id', { get: function () {
            var now = Date.now();
            if (now - lastInfoLog > 300000) {
                lastInfoLog = now;
                if (window.ElthiraSecurity && typeof window.ElthiraSecurity.sendIncident === 'function') {
                    window.ElthiraSecurity.sendIncident('INFORMATIONAL — Console getter triggered (no strike)', { alert_type: 'INFORMATIONAL — Console getter triggered', detection_method: 'Console open detection', note: 'Informational only. No strike incremented.' });
                }
            }
            return '';
        }});
        setInterval(function () { try { console.log(element); } catch (e) {} try { console.clear(); } catch (e) {} }, 15000);
    })();

    // METHOD 8 — view-source protocol
    if (location.protocol === 'view-source:' || document.URL.indexOf('view-source:') === 0) { flagDevToolsAttempt('view-source protocol'); window.location.href = 'index.html'; }

    // ON PAGE LOAD — check lockout status
    document.addEventListener('DOMContentLoaded', function () {
        var lockStatus = isLockedOut();
        if (lockStatus === 'permanent') showPermanentLockout();
        else if (lockStatus === '24h') showLockoutScreen();
    });
    var lockStatus = isLockedOut();
    if (lockStatus === 'permanent') setTimeout(showPermanentLockout, 100);
    else if (lockStatus === '24h') setTimeout(showLockoutScreen, 100);

    // HONEYPOT
    window._elthiraConfig = function () { flagDevToolsAttempt('Honeypot: _elthiraConfig called'); return null; };
    window._elthiraLicense = function () { flagDevToolsAttempt('Honeypot: _elthiraLicense called'); return null; };
    window._elthiraSecret = function () { flagDevToolsAttempt('Honeypot: _elthiraSecret called'); return null; };

})(window, document);
