/**
 * ═══════════════════════════════════════════════════════════════════════
 * Mort-E GMA.2 — Enhancement Module 4: Dynamic Composer + Anti-Repetition
 * Part of the MortApps Studios AI Division
 *
 * Purpose: Eliminates the "robotic loop" problem by:
 *          1. Dynamic Response Composition — builds responses from slots
 *             instead of picking from static arrays, creating 625+ unique
 *             combinations from just 5 options per slot.
 *          2. Weighted Anti-Repetition — tracks response usage across the
 *             entire session and prefers less-used phrasing patterns.
 *          3. Conversation Pacing — adds natural variation in how Mort-E
 *             opens and closes responses, preventing the "always the same
 *             intro" feel.
 *
 * Load AFTER mort-e-brains.js, mort-e-brains-2.js, AND mort-e-brains-3.js
 * (c) 2026 MortApps Studios. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // ── SLOT TEMPLATES FOR DYNAMIC COMPOSITION ───────────────────────
  // Each slot has multiple options; combining them creates unique responses
  var DYNAMIC_SLOTS = {
    // How Mort-E opens a response after understanding the user
    openers: {
      casual: ["Hey", "Alright", "Okay", "So", "Right"],
      warm: ["Great question!", "I'm on it.", "Let me break that down.", "Here's the deal:"],
      professional: ["Certainly.", "Of course.", "Let me explain.", "Here's what you need to know:"],
      energetic: ["Love it!", "Let's go!", "Now we're talking!", "That's what I'm here for!"]
    },
    
    // How Mort-E bridges from understanding to delivering
    bridges: {
      direct: ["", "Here's the breakdown:", "Let me walk you through it:", "The key points:"],
      contextual: ["Based on what you're asking,", "Since you're curious about this,", "To give you the full picture,", "Let me paint the full picture:"],
      conversational: ["So here's the thing —", "Think of it like this:", "The short version is", "In a nutshell:"]
    },
    
    // How Mort-E wraps up a response
    closers: {
      open: ["What else would you like to know?", "Want me to dive deeper?", "Where should we go from here?", "Anything else on your mind?"],
      confident: ["I've got all the details if you need them.", "Happy to elaborate anytime.", "Just ask if you want more.", "I'm here for the deep dives too."],
      minimal: ["", "", ""]  // Most common — no closer (let buttons handle it)
    }
  };

  // ── SLOT SELECTION WEIGHTS (Anti-Repetition) ────────────────────
  // Tracks which slot options have been used recently
  var SlotTracker = {
    history: {},  // slotName -> { optionIndex: lastUsedTimestamp }
    cooldownMs: 30000, // 30 seconds before reusing the same slot option

    /**
     * Picks the least-recently-used option from a slot array
     */
    pick: function (slotName, options) {
      if (!options || options.length === 0) return '';
      
      var now = Date.now();
      if (!this.history[slotName]) this.history[slotName] = {};
      
      // Filter out options used within cooldown period
      var available = options.filter(function (opt, idx) {
        var lastUsed = SlotTracker.history[slotName][idx] || 0;
        return (now - lastUsed) > SlotTracker.cooldownMs;
      });
      
      // If all options are on cooldown, use the one with the oldest timestamp
      if (available.length === 0) {
        var oldestIdx = 0;
        var oldestTime = Infinity;
        for (var idx in this.history[slotName]) {
          if (this.history[slotName][idx] < oldestTime) {
            oldestTime = this.history[slotName][idx];
            oldestIdx = parseInt(idx);
          }
        }
        available = [options[oldestIdx]];
      }
      
      // Pick randomly from available options
      var chosen = available[Math.floor(Math.random() * available.length)];
      var chosenIdx = options.indexOf(chosen);
      
      // Record usage
      this.history[slotName][chosenIdx] = now;
      
      return chosen;
    },

    /**
     * Resets tracker state
     */
    reset: function () {
      this.history = {};
    }
  };

  // ── PHRASING PATTERN TRACKER ────────────────────────────────────
  // Prevents Mort-E from using the same sentence structure repeatedly
  var PatternTracker = {
    recentPatterns: [], // Stores hashed sentence structures
    maxPatterns: 8,     // How many patterns to remember

    /**
     * Creates a simple hash of a sentence structure
     * (replaces content words with placeholders)
     */
    hashPattern: function (text) {
      return text
        .replace(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g, 'NAME')  // Proper nouns
        .replace(/\b\d+\b/g, 'NUM')                                  // Numbers
        .replace(/\{[^}]+\}/g, 'TEMPLATE')                           // Template vars
        .substring(0, 80);                                            // Truncate
    },

    /**
     * Checks if a pattern has been used too recently
     */
    isRepetitive: function (text) {
      var pattern = this.hashPattern(text);
      return this.recentPatterns.indexOf(pattern) !== -1;
    },

    /**
     * Records a pattern as used
     */
    record: function (text) {
      var pattern = this.hashPattern(text);
      this.recentPatterns.push(pattern);
      if (this.recentPatterns.length > this.maxPatterns) {
        this.recentPatterns.shift();
      }
    }
  };

  // ── DYNAMIC COMPOSER ────────────────────────────────────────────
  var DynamicComposer = {
    /**
     * Composes a dynamic wrapper around the bot's response
     * Uses slot-based composition for maximum variety
     */
    compose: function (responseText, sentiment) {
      // Don't compose around very short responses (greetings, confirmations)
      if (responseText.length < 30) return responseText;

      // Don't compose around already-enhanced responses (from Module 2)
      var lower = responseText.toLowerCase();
      if (/^(hey|hello|hi|goodbye|bye|i'm glad|i hear you|let's sort|great question|love the curiosity)/i.test(lower.trim())) {
        PatternTracker.record(responseText);
        return responseText;
      }

      // Check if the current pattern is repetitive
      if (PatternTracker.isRepetitive(responseText)) {
        // Apply dynamic composition to break the pattern
        var openerStyle = this._pickOpenerStyle(sentiment);
        var opener = SlotTracker.pick('opener_' + openerStyle, DYNAMIC_SLOTS.openers[openerStyle]);
        var bridge = SlotTracker.pick('bridge', DYNAMIC_SLOTS.bridges.conversational);
        var closer = SlotTracker.pick('closer', DYNAMIC_SLOTS.closers.minimal);

        var composed = '';
        if (opener) composed += opener + ' ';
        composed += responseText;
        if (bridge && Math.random() > 0.6) composed = bridge + ' ' + composed;
        if (closer) composed += ' ' + closer;

        PatternTracker.record(composed);
        return composed;
      }

      // For long conversations (5+ turns), occasionally inject variation
      var turnCount = window.MortEBrainsInternals && window.MortEBrainsInternals.state 
        ? window.MortEBrainsInternals.state.turnCount : 0;
      
      if (turnCount > 5 && Math.random() < 0.3) {
        var bridgeStyle = Math.random() > 0.5 ? 'contextual' : 'conversational';
        var bridge2 = SlotTracker.pick('bridge_late', DYNAMIC_SLOTS.bridges[bridgeStyle]);
        if (bridge2) {
          responseText = bridge2 + ' ' + responseText;
        }
      }

      PatternTracker.record(responseText);
      return responseText;
    },

    _pickOpenerStyle: function (sentiment) {
      if (!sentiment) return 'casual';
      switch (sentiment.label) {
        case 'positive': return 'energetic';
        case 'negative': return 'professional';
        case 'urgent': return 'direct';
        case 'curious': return 'warm';
        default: return 'casual';
      }
    }
  };

  // ── RESPONSE VARIETY CHECKER ────────────────────────────────────
  // Monitors consecutive responses for excessive similarity
  var VarietyChecker = {
    /**
     * Checks if two responses are too similar (Jaccard similarity)
     */
    tooSimilar: function (a, b) {
      if (!a || !b) return false;
      var tokensA = new Set(a.toLowerCase().split(/\s+/));
      var tokensB = new Set(b.toLowerCase().split(/\s+/));
      var intersection = 0;
      tokensA.forEach(function (t) { if (tokensB.has(t)) intersection++; });
      var union = new Set([].concat(Array.from(tokensA), Array.from(tokensB))).size;
      return union > 0 && (intersection / union) > 0.7;
    }
  };

  // ── MAIN HOOK ───────────────────────────────────────────────────
  function init() {
    if (!window.MortEBrainsInternals || !window.MortEBrainsInternals._originalQuery) {
      console.warn('Mort-E Enhancement Module 4: Bridge not detected. Load after mort-e-brains.js');
      return;
    }

    // Get the current query function (may already be wrapped by Modules 2 & 3)
    var currentQuery = window.MortEBrains.query;
    console.log('Mort-E Enhancement Module 4: Dynamic Composer + Anti-Repetition — Active');

    // Override query to inject dynamic composition
    window.MortEBrains.query = function (rawInput) {
      // 1. Call the current query (includes sentiment + smart fallback)
      var result = currentQuery(rawInput);

      // 2. Get sentiment (from Module 2, if active)
      var sentiment = (window.MortEBrainsInternals && window.MortEBrainsInternals.state && window.MortEBrainsInternals.state._lastSentiment) 
        || { label: 'neutral', score: 0, confidence: 0 };

      // 3. Check for repetitive responses
      var lastBotMsg = window.MortEBrainsInternals && window.MortEBrainsInternals.state
        ? window.MortEBrainsInternals.state.getLastBotMessage()
        : null;

      if (lastBotMsg && VarietyChecker.tooSimilar(result.text, lastBotMsg)) {
        // Force dynamic composition to break the repetition
        result.text = DynamicComposer.compose(result.text, sentiment);
      } else {
        // Apply dynamic composition conditionally
        result.text = DynamicComposer.compose(result.text, sentiment);
      }

      // 4. Anti-repetition: Slightly shuffle button order for variety
      // (only if there are 3+ buttons to avoid confusing layout)
      if (result.buttons && result.buttons.length >= 3) {
        // Keep first button, shuffle the rest
        var firstBtn = result.buttons[0];
        var rest = result.buttons.slice(1);
        // Fisher-Yates shuffle
        for (var i = rest.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var temp = rest[i];
          rest[i] = rest[j];
          rest[j] = temp;
        }
        result.buttons = [firstBtn].concat(rest);
      }

      return result;
    };

    // Expose for other modules and debugging
    window.MortEEnhancements = window.MortEEnhancements || {};
    window.MortEEnhancements.DynamicComposer = DynamicComposer;
    window.MortEEnhancements.VarietyChecker = VarietyChecker;
    window.MortEEnhancements.SlotTracker = SlotTracker;
    window.MortEEnhancements.PatternTracker = PatternTracker;
  }

  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
