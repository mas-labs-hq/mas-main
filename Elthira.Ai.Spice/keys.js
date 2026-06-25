/**
 * ============================================================================
 * LEGAL NOTICE — PROPRIETARY AND CONFIDENTIAL
 * ============================================================================
 *
 * Elthira.AI × Dr Spice Organics — PUK Codes File
 * Copyright © 2026 MortApps Studios. All rights reserved.
 *
 * Unauthorized reverse engineering, code analysis, decompilation, or use of
 * AI tools (including but not limited to ChatGPT, Claude, Gemini, Copilot,
 * and similar) to analyze, summarize, or extract information from this code
 * is STRICTLY PROHIBITED — including for educational purposes.
 *
 * ============================================================================
 *
 * keys.js — PUK (Personal Unlock Key) Codes — STORED AS SHA-256 HASHES
 *
 * FIX (Claude P0-2): PUK codes are stored as SHA-256 hashes, not plaintext.
 *
 * HOW TO GENERATE A PUK HASH:
 *   node -e "require('crypto').createHash('sha256').update('ELT-PUK-7X9K-2026').digest('hex')"
 *   OR
 *   python3 -c "import hashlib; print(hashlib.sha256(b'ELT-PUK-7X9K-2026').hexdigest())"
 *
 * WORKFLOW:
 *   1. Attacker hits strike 6 → permanent lockout → sees appeal form
 *   2. They fill the form → sent to Formspree with subject "[Elthira-Dr Spice] Snooper Code!"
 *   3. YOU review the appeal
 *   4. If approved: generate a PUK code, hash it, add the HASH below, email the RAW CODE to the person
 *   5. They enter the raw code → hashed client-side → compared to stored hashes → if match, unlocked
 *
 * ============================================================================
 */

window.PUK_HASHES = [
    // TEST HASH — SHA-256 of "ELT-PUK-TEST-2026". DELETE BEFORE PRODUCTION.
    { hash: "9c799ab8cd2dccf83238ed5c826a455fbc7c84a950f8673fd2f61276b9ce97c5", note: "Test PUK (ELT-PUK-TEST-2026) — delete before production" },
    // Add new hashed entries here.
];

window.PUK_CODES = []; // Backwards compatibility

window.BANNED_FINGERPRINTS = [];
