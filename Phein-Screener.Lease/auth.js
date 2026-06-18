/**
 * AUTHORIZED CLIENTS — Phein Screener Lease
 * ============================================
 * This file is the single source of truth for who can access Phein Screener.
 * The owner (MortApps Studios) manually edits this file to grant, activate,
 * or revoke access.
 *
 * ============================================================
 * THE STATUS FIELD — HOW SINGLE-STATION ENFORCEMENT WORKS
 * ============================================================
 * Every entry has a "status" field. There are two values:
 *
 *   status: "inactive"  →  The code has been issued but NOT yet activated.
 *                          The FIRST person to enter this code will be allowed in.
 *                          You will receive a Formspree alert the moment they activate.
 *                          IMPORTANT: Once activated, the user STAYS logged in even
 *                          though the status is still "inactive". They are not kicked
 *                          out. The status field only controls NEW activation attempts.
 *
 *   status: "active"    →  The code has been activated by one station.
 *                          Any FURTHER attempt to use this code will be BLOCKED.
 *                          You will receive a Formspree alert on every blocked attempt.
 *                          The original user who activated it is NOT affected — they
 *                          stay logged in until their lease expires.
 *
 * YOUR WORKFLOW:
 *   1. Issue a code to a new company. Add them below with status: "inactive".
 *   2. They enter the code on the landing page → they get in → you get a Formspree
 *      alert titled "ACTIVATION: {Company} started using Phein Screener".
 *   3. As soon as you see that alert, edit this file: change "inactive" to "active".
 *   4. Bump the cache-bust version (?v=... in index.html, app.html, AND CACHE_NAME
 *      in sw.js — all clearly marked with OWNER BUMP comments).
 *   5. Upload to your server. Within 5 minutes, the running PWA will pick up the
 *      change automatically (no reload needed, no progress lost).
 *   6. If anyone else tries the same code, they are blocked and you get a Formspree
 *      alert titled "REUSE BLOCKED: {Company} code attempted again".
 *
 * TO REVOKE ACCESS EARLY (e.g. lease violation, non-payment):
 *   DELETE the entry entirely from the array below. Do NOT flip status back to
 *   "inactive" — that would just make the code available for a NEW first activation,
 *   it would NOT kick out the current user. Only DELETING the entry kicks them out.
 *   Within 5 minutes, the user's PWA will detect the missing entry, save their work
 *   to localStorage, and redirect them to the landing page with an "expired" banner.
 *
 * ============================================================
 * ENTERPRISE PLUS — MULTI-STATION SUPPORT
 * ============================================================
 * Enterprise Plus licenses support up to 3 concurrent stations. To enable this,
 * add a "stations" field to the entry:
 *
 *   { company: "BigCorp", code: "BIG-7X9K-2026", duration: 30, status: "active", stations: 3 }
 *
 * When stations is present and >= 1, the single-station block is bypassed.
 * You will still get an ACTIVATION alert every time a new station comes online,
 * so you can monitor how many stations are in use.
 *
 * ============================================================
 * RULES
 * ============================================================
 * - Codes are CASE-SENSITIVE. Communicate the exact casing to the client.
 * - Duration MUST be 7, 14, or 30 (days). Any other value is rejected.
 * - status MUST be "inactive" or "active". Any other value is treated as inactive.
 * - Never store duration in localStorage — the router always looks it up from here.
 * - Bump the cache-bust version (?v=YYYYMMDD) in index.html, app.html, AND sw.js
 *   EVERY TIME you edit this file. See the OWNER BUMP section in those files.
 *
 * ============================================================
 * KNOWN LIMITATION — DEVICE FINGERPRINT BYPASS
 * ============================================================
 * The device fingerprint is computed from browser properties (user agent,
 * screen size, timezone, canvas hash, WebGL info) and stored in localStorage.
 * A determined user with technical knowledge could:
 *   1. Clear localStorage on their PC
 *   2. Activate the code fresh (generating a new fingerprint for that PC)
 * This is a known limitation of client-side-only licensing (no backend).
 * The fingerprint is a DETERRENT, not an absolute block. For full enforcement,
 * a server-side validation layer would be required.
 *
 * To mitigate: the owner receives an ACTIVATION alert every time a code is
 * activated, so you can monitor for suspicious re-activations and manually
 * blacklist the code (add to BLACKLISTED_CODES below) if needed.
 *
 * Current cache-bust version: 20260617
 * (When you bump, change to 20260618 in index.html, app.html, AND sw.js)
 */
window.AUTHORIZED_CLIENTS = [
  // --- LIVE SEED ENTRIES (safe to keep or delete) ---
  // These let you test the full flow end-to-end. Remove them before going live.
  { company: "Acme Corp",    code: "ACME-7X9K-2024",  duration: 7,  status: "inactive" },
  { company: "Beta LLC",     code: "BETA-4M2P-2024",  duration: 14, status: "inactive" },
  { company: "Gamma Inc",    code: "GAMMA-9R3T-2024", duration: 30, status: "inactive" },

  // --- COMMENTED EXAMPLES (uncomment + edit to add new clients) ---
  // Standard lease (single station):
  // { company: "Delta Holdings", code: "DELTA-2K8N-2024", duration: 14, status: "inactive" },

  // Enterprise Plus (3 stations):
  // { company: "MegaCorp Ltd", code: "MEGA-5W1Q-2026", duration: 30, status: "active", stations: 3 },

  // Perpetual lease:
  // { company: "Epsilon Partners", code: "EPSI-6B7V-2024", duration: 30, status: "inactive" },
];

/**
 * BLACKLISTED CODES — Global revocation list
 * ============================================================
 * When a user exceeds 3 security violations (DevTools attempts,
 * tampering, etc.), their code is automatically blacklisted on
 * their device AND you receive a Formspree alert titled
 * "CODE BLACKLISTED: {company}".
 *
 * To GLOBALLY block the code on ALL devices (not just the
 * offender's device), add the code to the array below and
 * bump the version (?v=... in index.html, app.html, sw.js).
 *
 * When a blacklisted code is entered, the user sees:
 * "This license key has been flagged for repeated suspicious
 * activity and is under review. Contact MortApps Studios."
 *
 * And you receive a Formspree alert:
 * "BLACKLISTED CODE ATTEMPT: {code} tried to activate"
 */
window.BLACKLISTED_CODES = [
  // Add codes here that have been auto-blacklisted via Formspree alerts.
  // Example: "ACME-7X9K-2024"
];
