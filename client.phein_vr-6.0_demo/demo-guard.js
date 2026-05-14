/**
 * ============================================
 * PHEIN SCREENER DEMO — Guard Module
 * ============================================
 * Handles all demo-specific restrictions:
 *   - Dev tools blocking
 *   - Right-click prevention
 *   - Upload limit enforcement (12 docs)
 *   - AI Skill Extraction word limit (100)
 *   - AI Detection Lens blocking
 *   - Age detection blocking
 *   - Work Authorization blocking
 * ============================================
 * MortApps Studios | Phein Screener DEMO
 * ============================================
 */
(function() {
    'use strict';

    // =============================================
    // DEMO CONFIG
    // =============================================
    var DEMO = {
        maxUploads: 12,
        maxSkillExtractionWords: 100,
        blockedFeatures: ['ai_detection', 'age_detection', 'work_authorization']
    };

    window.PheinDemo = DEMO;

    // =============================================
    // DEV TOOLS BLOCKING
    // =============================================
    (function blockDevTools() {
        var threshold = 160;
        var checkInterval;

        function detectDevTools() {
            var widthThreshold = window.outerWidth - window.innerWidth > threshold;
            var heightThreshold = window.outerHeight - window.innerHeight > threshold;
            if (widthThreshold || heightThreshold) {
                document.body.innerHTML = '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:#0f172a;display:flex;justify-content:center;align-items:center;z-index:999999;flex-direction:column;gap:1.5rem;"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg><h1 style="color:#f1f5f9;font-family:Inter,system-ui,sans-serif;font-size:1.5rem;">Access Denied</h1><p style="color:#94a3b8;font-family:Inter,system-ui,sans-serif;max-width:400px;text-align:center;line-height:1.6;">Developer tools are not available in the demo version of Phein Screener.</p></div>';
            }
        }

        checkInterval = setInterval(detectDevTools, 1000);
        window.addEventListener('resize', detectDevTools);

        // Block common dev tools shortcuts
        document.addEventListener('keydown', function(e) {
            // F12
            if (e.key === 'F12') { e.preventDefault(); return false; }
            // Ctrl+Shift+I / Cmd+Opt+I
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) { e.preventDefault(); return false; }
            // Ctrl+Shift+J / Cmd+Opt+J
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j')) { e.preventDefault(); return false; }
            // Ctrl+Shift+C / Cmd+Opt+C
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) { e.preventDefault(); return false; }
            // Ctrl+U / Cmd+U (view source)
            if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) { e.preventDefault(); return false; }
        });
    })();

    // =============================================
    // RIGHT-CLICK PREVENTION (already on body, but reinforce)
    // =============================================
    document.addEventListener('contextmenu', function(e) { e.preventDefault(); return false; });

    // =============================================
    // MOBILE / TABLET PERSISTENT BLOCK
    // Reinforces the early <head> blocker — runs
    // continuously to prevent any bypass.
    // =============================================
    (function mobileBlockReinforcement() {
        /* These checks use ONLY permanent device properties that never change
           when the user resizes their browser window (e.g., to drag-drop folders). */
        function isRealMobileDevice() {
            /* Touch-only device (no mouse/trackpad) */
            var isTouchOnly = ('ontouchstart' in window) && (navigator.maxTouchPoints > 1) && !window.matchMedia('(pointer: fine)').matches;
            /* Small physical screen hardware */
            var isSmallPhysical = (screen.width < 1024) || (screen.height < 768 && screen.width < 1280);
            /* iPadOS 13+ lies about UA */
            var isIPad = (/macintosh|mac os x/i.test(navigator.userAgent)) && navigator.maxTouchPoints > 1;
            /* Mobile/tablet user-agent */
            var ua = (navigator.userAgent || navigator.vendor || '').toLowerCase();
            var mobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet|kindle|silk|playbook|nexus [79]|pixel [0-9]|pixel fold|galaxy tab|huawei mediapad|lenovo tab|xiaomi.*tab|oppo.*pad|vivo.*pad|fire tablet|surface (go|pro)/i.test(ua);
            return isTouchOnly || isSmallPhysical || isIPad || mobileUA;
        }
        var _confirmedMobile = isRealMobileDevice();

        function killIfSmall() {
            if (!_confirmedMobile) return;
            /* Only react if a real mobile device — viewport resize irrelevant */
            document.documentElement.style.display = 'none';
            document.body.innerHTML = '';
            document.body.style.cssText = 'margin:0;padding:0;overflow:hidden;background:#0f172a;';
            var d = document.createElement('div');
            d.id = 'mobile-block-screen';
            d.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:linear-gradient(160deg,#0f172a,#1e293b,#0f172a);z-index:99999999;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:2rem;gap:1.25rem;';
            d.innerHTML =
                '<svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5"><rect x="5" y="2" width="14" height="20" rx="3"/><line x1="12" y1="18" x2="12.01" y2="18"/><path d="M9 2h6"/></svg>' +
                '<h1 style="color:#f1f5f9;font-family:Inter,system-ui,sans-serif;font-size:1.4rem;font-weight:800;margin:0;">Desktop Only</h1>' +
                '<p style="color:#94a3b8;font-family:Inter,system-ui,sans-serif;font-size:0.9rem;max-width:340px;line-height:1.7;margin:0;">Phein Screener requires a desktop or laptop with a screen width of at least 1024px.</p>';
            document.body.appendChild(d);
            document.documentElement.style.display = '';
        }
        window.addEventListener('resize', killIfSmall);
        setTimeout(killIfSmall, 500);
        setTimeout(killIfSmall, 2000);
        setInterval(killIfSmall, 5000);
    })();

    // =============================================
    // DEMO POPUP FOR BLOCKED FEATURES
    // =============================================
    window.showDemoUpgradePopup = function(featureName) {
        var isDark = document.documentElement.classList.contains('dark');
        var bg = isDark ? '#1e293b' : '#ffffff';
        var textMain = isDark ? '#f1f5f9' : '#0f172a';
        var textMuted = isDark ? '#94a3b8' : '#64748b';
        var borderColor = isDark ? '#334155' : '#e2e8f0';

        var overlay = document.createElement('div');
        overlay.id = 'demo-upgrade-popup';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);z-index:9000;display:flex;justify-content:center;align-items:center;padding:1.5rem;';

        overlay.innerHTML = '<div style="background:' + bg + ';border-radius:16px;width:100%;max-width:420px;box-shadow:0 25px 50px rgba(0,0,0,0.35);border:1px solid ' + borderColor + ';animation:modalSlideIn 0.3s ease-out;overflow:hidden;">' +
            '<div style="padding:2rem 2rem 1.5rem;text-align:center;">' +
            '<div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,rgba(37,99,235,0.1),rgba(37,99,235,0.05));display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;">' +
            '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
            '</div>' +
            '<h3 style="font-size:1.2rem;font-weight:700;color:' + textMain + ';margin-bottom:0.5rem;">Premium Feature</h3>' +
            '<p style="font-size:0.9rem;color:' + textMuted + ';line-height:1.6;margin-bottom:1.5rem;">' + featureName + ' is available in the full version of Phein Screener. Upgrade to unlock all features and accelerate your recruitment workflow.</p>' +
            '<button onclick="document.getElementById(\'demo-upgrade-popup\').remove()" style="background:linear-gradient(135deg,#2563eb,#1e40af);color:white;border:none;padding:0.75rem 2rem;border-radius:8px;font-weight:600;cursor:pointer;font-size:0.95rem;box-shadow:0 4px 15px rgba(37,99,235,0.4);width:100%;transition:all 0.2s;">Got It</button>' +
            '</div></div>';

        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
        document.body.appendChild(overlay);
    };

    // =============================================
    // UPLOAD LIMIT ENFORCEMENT
    // =============================================
    window.demoCheckUploadLimit = function(currentCount) {
        if (currentCount >= DEMO.maxUploads) {
            window.showDemoUpgradePopup('Uploading more than ' + DEMO.maxUploads + ' documents');
            return false;
        }
        return true;
    };

    // =============================================
    // SKILL EXTRACTION WORD LIMIT
    // =============================================
    window.demoLimitSkillExtraction = function() {
        var jdInput = document.getElementById('jd-input');
        if (!jdInput) return;
        var text = jdInput.value;
        var words = text.trim().split(/\s+/).length;

        if (words > DEMO.maxSkillExtractionWords) {
            window.showDemoUpgradePopup('Full AI Skill Extraction (over ' + DEMO.maxSkillExtractionWords + ' words)');
            // Truncate to max and still extract
            jdInput.value = text.trim().split(/\s+/).slice(0, DEMO.maxSkillExtractionWords).join(' ');
        }
    };

})();
