/**
 * ═══════════════════════════════════════════════════════════════════════
 * Mort-E GMA.2 — Enhancement Module 3: Smart Fallback + Contextual Pivot + Gap Logger
 * Part of the MortApps Studios AI Division
 *
 * Purpose: When Mort-E doesn't understand the user, instead of a generic
 *          "I didn't catch that", this module:
 *          1. Checks if the input is close to a known topic (fuzzy match)
 *          2. Offers contextual pivots based on recent conversation
 *          3. Logs unrecognized inputs for future KB expansion
 *
 * Load AFTER mort-e-brains.js AND mort-e-brains-2.js
 * (c) 2026 MortApps Studios. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // ── CONFIGURATION ────────────────────────────────────────────────
  var CONFIG = {
    fallback: {
      similarityThreshold: 0.65,  // Lower threshold = more suggestions
      maxSuggestions: 2            // Max "Did you mean?" options
    },
    gapLogger: {
      maxEntries: 300,            // Max gaps to store
      storageKey: 'mort_e_gaps'   // localStorage key
    }
  };

  // ── FALLBACK DETECTION ──────────────────────────────────────────
  // Detects if the bot's response is a fallback (didn't understand)
  var FALLBACK_SIGNALS = [
    "i'm not sure",
    "outside my wheelhouse",
    "didn't quite get that",
    "didn't quite catch that",
    "not quite tracking",
    "a bit outside",
    "that's new to me",
    "i specialize in",
    "outside my knowledge",
    "try me on our products"
  ];

  function isFallbackResponse(text) {
    var lower = text.toLowerCase();
    for (var i = 0; i < FALLBACK_SIGNALS.length; i++) {
      if (lower.indexOf(FALLBACK_SIGNALS[i]) !== -1) return true;
    }
    return false;
  }

  // ── SMART FALLBACK ENGINE ───────────────────────────────────────
  var SmartFallback = {
    /**
     * Attempts to find close matches for unrecognized input
     * @param {string} input - User's raw input
     * @param {object} normalized - Normalized input from NLP pipeline
     * @param {object} KB - Knowledge base
     * @param {object} state - Conversation state
     * @returns {object|null} Smart fallback response or null
     */
    handle: function (input, normalized, KB, state) {
      var inputLower = normalized.normalized;
      var candidates = [];

      // Scan Intents for close matches
      if (KB.intents) {
        KB.intents.forEach(function (intent) {
          var keywords = intent.triggers.keywords || [];
          keywords.forEach(function (kw) {
            var sim = levenshteinSim(inputLower, kw.toLowerCase());
            if (sim > CONFIG.fallback.similarityThreshold) {
              candidates.push({
                type: 'intent',
                id: intent.id,
                label: kw,
                score: sim,
                buttons: intent.buttons || []
              });
            }
          });
        });
      }

      // Scan Entities for close matches
      if (KB.entities) {
        Object.values(KB.entities).forEach(function (entity) {
          var aliases = entity.aliases || [];
          aliases.forEach(function (alias) {
            var sim = levenshteinSim(inputLower, alias.toLowerCase());
            if (sim > CONFIG.fallback.similarityThreshold) {
              candidates.push({
                type: 'entity',
                id: entity.id,
                label: alias,
                score: sim,
                buttons: entity.buttons || []
              });
            }
          });
        });
      }

      // If we found close matches, offer "Did you mean?"
      if (candidates.length > 0) {
        candidates.sort(function (a, b) { return b.score - a.score; });
        var best = candidates[0];

        var text = "I didn't quite catch that, but it sounds like you might be asking about **" + best.label + "**. ";
        
        if (best.type === 'entity') {
          text += "Want me to tell you about it?";
        } else {
          text += "Is that what you meant?";
        }

        return {
          text: text,
          buttons: [
            { label: 'Yes, tell me about ' + best.label, value: 'Tell me about ' + best.label },
            { label: 'No, something else', value: 'What else can you help with' }
          ]
        };
      }

      // Contextual Pivot: Use recent conversation to suggest relevant topics
      if (state.currentTopic && state.lastEntityId) {
        var entity = KB.entities[state.lastEntityId];
        if (entity) {
          // Suggest going deeper on the current topic or pivoting to a related one
          var relatedProducts = Object.values(KB.entities)
            .filter(function (e) { return e.type === 'product' && e.id !== state.lastEntityId; })
            .slice(0, 2);

          var pivotText = "That's a bit outside my wheelhouse, but we were just discussing **" + 
            (window.MortEBrainsInternals ? window.MortEBrainsInternals.formatEntityName(state.lastEntityId) : state.lastEntityId) + 
            "**. Want me to go deeper on that";

          if (relatedProducts.length > 0) {
            pivotText += ", or explore something like **" + 
              (window.MortEBrainsInternals ? window.MortEBrainsInternals.formatEntityName(relatedProducts[0].id) : relatedProducts[0].id) + "**?";
          } else {
            pivotText += "?";
          }

          var pivotButtons = [
            { label: 'More on ' + (window.MortEBrainsInternals ? window.MortEBrainsInternals.formatEntityName(state.lastEntityId) : state.lastEntityId), value: 'Tell me more about ' + (window.MortEBrainsInternals ? window.MortEBrainsInternals.formatEntityName(state.lastEntityId) : state.lastEntityId) },
            { label: 'All Products', value: 'What products do you have' }
          ];

          if (relatedProducts.length > 0) {
            pivotButtons.splice(1, 0, {
              label: (window.MortEBrainsInternals ? window.MortEBrainsInternals.formatEntityName(relatedProducts[0].id) : relatedProducts[0].id),
              value: 'Tell me about ' + (window.MortEBrainsInternals ? window.MortEBrainsInternals.formatEntityName(relatedProducts[0].id) : relatedProducts[0].id)
            });
          }

          return {
            text: pivotText,
            buttons: pivotButtons
          };
        }
      }

      // No smart fallback possible — return null to let the standard fallback handle it
      return null;
    }
  };

  // ── LEVENSHTEIN SIMILARITY (lightweight, no deps) ──────────────
  function levenshteinSim(a, b) {
    if (!a.length) return b.length === 0 ? 1 : 0;
    if (!b.length) return 0;
    var m = a.length, n = b.length;
    var dp = [];
    for (var i = 0; i <= m; i++) {
      dp[i] = [i];
      for (var j = 1; j <= n; j++) {
        if (i === 0) { dp[i][j] = j; }
        else {
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,
            dp[i][j - 1] + 1,
            dp[i - 1][j - 1] + (a[i - 1] !== b[j - 1] ? 1 : 0)
          );
        }
      }
    }
    return 1 - dp[m][n] / Math.max(m, n);
  }

  // ── GAP LOGGER ──────────────────────────────────────────────────
  // Logs inputs that hit fallback for future KB expansion
  var GapLogger = {
    log: function (input, intent) {
      try {
        var gaps = JSON.parse(localStorage.getItem(CONFIG.gapLogger.storageKey) || '[]');
        if (gaps.length >= CONFIG.gapLogger.maxEntries) {
          gaps = gaps.slice(-Math.floor(CONFIG.gapLogger.maxEntries * 0.7)); // Trim old entries
        }
        gaps.push({
          input: input,
          matchedIntent: intent || null,
          timestamp: Date.now(),
          date: new Date().toISOString()
        });
        localStorage.setItem(CONFIG.gapLogger.storageKey, JSON.stringify(gaps));
      } catch (e) {
        // Silently fail — logging shouldn't break the chat
      }
    },

    getGaps: function () {
      try {
        return JSON.parse(localStorage.getItem(CONFIG.gapLogger.storageKey) || '[]');
      } catch (e) {
        return [];
      }
    },

    clearGaps: function () {
      try {
        localStorage.removeItem(CONFIG.gapLogger.storageKey);
      } catch (e) { /* silent */ }
    },

    getGapReport: function () {
      var gaps = this.getGaps();
      if (gaps.length === 0) return 'No gaps logged yet.';
      
      // Count frequency of each input
      var freq = {};
      gaps.forEach(function (g) {
        var key = g.input.toLowerCase().trim();
        freq[key] = (freq[key] || 0) + 1;
      });
      
      // Sort by frequency
      var sorted = Object.entries(freq).sort(function (a, b) { return b[1] - a[1]; });
      var report = 'Top unrecognized inputs:\n';
      sorted.slice(0, 20).forEach(function (entry) {
        report += '  "' + entry[0] + '" — ' + entry[1] + ' times\n';
      });
      report += '\nTotal gaps: ' + gaps.length;
      return report;
    }
  };

  // ── MAIN HOOK ───────────────────────────────────────────────────
  function init() {
    if (!window.MortEBrainsInternals || !window.MortEBrainsInternals._originalQuery) {
      console.warn('Mort-E Enhancement Module 3: Bridge not detected. Load after mort-e-brains.js');
      return;
    }

    // Get the current query function (may already be wrapped by Module 2)
    var currentQuery = window.MortEBrains.query;
    console.log('Mort-E Enhancement Module 3: Smart Fallback + Gap Logger — Active');

    // Override query to inject smart fallback
    window.MortEBrains.query = function (rawInput) {
      // 1. Call the current query (may include sentiment from Module 2)
      var result = currentQuery(rawInput);

      // 2. Check if this is a fallback response
      if (isFallbackResponse(result.text)) {
        var normalized = window.MortEBrainsInternals.normalizeInput(rawInput);
        var smartResponse = SmartFallback.handle(
          rawInput,
          normalized,
          window.MortEBrainsInternals.KB,
          window.MortEBrainsInternals.state
        );

        if (smartResponse) {
          // Log the gap for future training
          GapLogger.log(rawInput, 'smart_fallback:' + (smartResponse.text || '').substring(0, 50));
          return smartResponse;
        }

        // No smart fallback found — log the gap
        GapLogger.log(rawInput, null);
      }

      return result;
    };

    // Expose for other modules and debugging
    window.MortEEnhancements = window.MortEEnhancements || {};
    window.MortEEnhancements.SmartFallback = SmartFallback;
    window.MortEEnhancements.GapLogger = GapLogger;
  }

  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
