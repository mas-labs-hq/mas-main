/**
 * mobile-block.js — Phein Screener Lease
 * =======================================
 * PC-ONLY ACCESS BLOCK. Loaded FIRST (before security.js, auth.js, etc.)
 * in both index.html and app.html.
 *
 * WHY THIS IS AN EXTERNAL FILE (not inline in <head>):
 *   An earlier version had this code inline inside a <script> tag in <head>.
 *   On some browser/extension combinations the inline JS was briefly rendered
 *   as visible text on the page. Moving it to an external file eliminates any
 *   possibility of the source being shown to the user.
 *
 * BEHAVIOR:
 *   If a mobile/tablet device is detected, the entire document is replaced
 *   with a "Desktop Required" overlay and execution stops (throw).
 *   On PCs, the function silently returns and the rest of the page loads normally.
 *
 * A CSS fallback in styles.css (@media max-width:1023px) also blocks mobile
 * devices independently of JS, so the block is defense-in-depth.
 */
(function (window, document) {
  'use strict';

  function isMobileDevice() {
    var ua = (navigator.userAgent || navigator.vendor || window.opera || '').toString();
    var uaMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(ua);
    var touchOnly = ('ontouchstart' in window) && (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    var smallScreen = window.innerWidth < 1024;
    return uaMobile || (touchOnly && smallScreen);
  }

  if (isMobileDevice()) {
    document.documentElement.innerHTML =
      '<head><meta charset="UTF-8"><title>Desktop Required — Phein Screener</title>' +
      '<style>' +
        'body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh;' +
        'background:radial-gradient(circle at 30% 20%,#0f172a 0%,#020617 70%);' +
        'color:#fff;font-family:system-ui,-apple-system,sans-serif;text-align:center;padding:2rem;}' +
        '.icon{width:80px;height:80px;margin:0 auto 1.5rem;color:#60a5fa;opacity:0.9;}' +
        'h1{font-size:2.25rem;font-weight:800;margin:0 0 1rem;letter-spacing:-0.02em;}' +
        'p{font-size:1.05rem;line-height:1.6;max-width:520px;margin:0 auto 1.5rem;opacity:0.78;}' +
        '.foot{margin-top:2rem;font-size:0.85rem;opacity:0.55;letter-spacing:0.04em;}' +
      '</style></head>' +
      '<body>' +
        '<div>' +
          '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
            '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>' +
            '<line x1="8" y1="21" x2="16" y2="21"/>' +
            '<line x1="12" y1="17" x2="12" y2="21"/>' +
          '</svg>' +
          '<h1>Desktop Required</h1>' +
          '<p>Phein Screener is engineered for desktop computers and laptops. ' +
          'Please open this page on a PC to continue.</p>' +
          '<div class="foot">For lease inquiries, contact MortApps Studios.</div>' +
        '</div>' +
      '</body>';
    throw new Error('Mobile device blocked');
  }
})(window, document);
