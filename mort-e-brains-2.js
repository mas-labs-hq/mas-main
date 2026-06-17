/**
 * ═══════════════════════════════════════════════════════════════════════
 * Mort-E GMA.2 — Enhancement Module 2: Sentiment Engine + Tone Adapter
 * Part of the MortApps Studios AI Division
 *
 * Purpose: Detects user sentiment (positive, negative, neutral, urgent,
 *          curious) and adapts Mort-E's response tone accordingly.
 *          This eliminates the "always cheerful" robotic feel.
 *
 * Load AFTER mort-e-brains.js
 * (c) 2026 MortApps Studios. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // ── CONFIGURATION ────────────────────────────────────────────────
  var CONFIG = {
    tone: {
      positive: {
        prefixes: [
          "Great question! ",
          "I'm glad you asked! ",
          "Love the curiosity! ",
          "Awesome! ",
          "Happy to help! "
        ],
        suffixes: [
          "",
          " Hope that helps!",
          " Let me know if you want more!",
          ""
        ]
      },
      negative: {
        prefixes: [
          "I hear you, and I want to get this right. ",
          "Let's sort this out together. ",
          "I understand the frustration. ",
          "I appreciate your patience. ",
          "Let me make this clearer. "
        ],
        suffixes: [
          " Let me know if this helps clarify things.",
          " I'm here to get this right for you.",
          " We'll figure this out.",
          ""
        ]
      },
      neutral: {
        prefixes: [
          "",
          "Here's what I know: ",
          "Let's look into that. ",
          "Sure thing. ",
          ""  // Most common — no prefix for neutral
        ],
        suffixes: [
          "",
          "",
          " Anything else you'd like to know?",
          ""
        ]
      },
      urgent: {
        prefixes: [
          "Let's get this sorted right away. ",
          "I'm on it. ",
          "Quick answer: ",
          ""
        ],
        suffixes: [
          "",
          " Need anything else urgently?",
          ""
        ]
      },
      curious: {
        prefixes: [
          "Ooh, interesting question! ",
          "That's a great angle! ",
          "I love diving into this stuff. ",
          ""
        ],
        suffixes: [
          "",
          " Want me to go even deeper?",
          ""
        ]
      }
    }
  };

  // ── SWAHILI DETECTION ──────────────────────────────────────────
  // Detects Swahili input so Mort-E can respond in Swahili
  var SWAHILI_WORDS = new Set([
    'jambo', 'habari', 'mambo', 'sasa', 'niaje', 'shikamoo', 'marahaba',
    'hujambo', 'mzuri', 'kwaheri', 'tutaonana', 'salama', 'baadaye',
    'uko', 'mzima', 'vipi', 'asante', 'karibu', 'ndiyo', 'hapana',
    'tafadhali', 'samahani', 'pole', 'sawa', 'hakika', 'bila',
    'kazi', 'bidhaa', 'huduma', 'studio', 'programu', 'teknolojia',
    'kompyuta', 'simu', 'mtandao', 'biashara', 'kampuni',
  ]);

  var SwahiliDetector = {
    /**
     * Detects if the input is primarily Swahili
     * @param {string} text - Raw user input
     * @returns {boolean} true if Swahili detected
     */
    isSwahili: function (text) {
      var lower = text.toLowerCase().replace(/[^\w\s']/g, ' ').replace(/\s+/g, ' ').trim();
      var tokens = lower.split(/\s+/).filter(function(t) { return t.length > 2; });
      if (tokens.length === 0) return false;
      var swahiliCount = 0;
      tokens.forEach(function(token) {
        if (SWAHILI_WORDS.has(token)) swahiliCount++;
      });
      // If 40%+ of meaningful words are Swahili, consider it Swahili input
      return (swahiliCount / tokens.length) >= 0.4;
    }
  };

  // ── SENTIMENT LEXICON ────────────────────────────────────────────
  // Weighted word lists for sentiment scoring
  var POSITIVE_WORDS = {
    // word: weight (1-3)
    'happy': 2, 'great': 2, 'awesome': 3, 'love': 3, 'like': 1, 'nice': 2,
    'cool': 2, 'fantastic': 3, 'brilliant': 3, 'excellent': 3, 'perfect': 3,
    'amazing': 3, 'wonderful': 3, 'helpful': 2, 'good': 1, 'thanks': 2,
    'thank': 2, 'appreciate': 2, 'impressive': 2, 'excited': 2, 'glad': 2,
    'best': 3, 'beautiful': 2, 'lovely': 2, 'sweet': 2, 'enjoy': 2,
    'wow': 2, 'dope': 2, 'fire': 2, 'lit': 2, 'epic': 2, 'sick': 2
  };

  var NEGATIVE_WORDS = {
    'bad': 2, 'slow': 2, 'hate': 3, 'useless': 3, 'error': 2, 'broken': 3,
    'stupid': 3, 'dumb': 3, 'angry': 3, 'frustrated': 3, 'wrong': 2,
    'failed': 2, 'ugly': 2, 'annoying': 2, 'confused': 1, 'confusing': 2,
    'difficult': 1, 'problem': 1, 'issue': 1, 'bug': 2, 'crash': 3,
    'terrible': 3, 'horrible': 3, 'worst': 3, 'disappointed': 2, 'unhappy': 2,
    'not working': 3, "doesn't work": 3, 'no good': 2, 'waste': 2
  };

  var URGENT_WORDS = {
    'urgent': 3, 'asap': 3, 'immediately': 3, 'quickly': 2, 'emergency': 3,
    'now': 1, 'help': 1, 'please help': 3, 'need now': 3, 'right now': 3,
    'deadline': 2, 'critical': 3, 'important': 1, 'soon': 1
  };

  var CURIOUS_WORDS = {
    'how': 1, 'why': 2, 'what if': 2, 'curious': 3, 'wonder': 2,
    'interesting': 2, 'explain': 1, 'tell me more': 2, 'deep dive': 2,
    'how does': 2, 'what happens': 2, 'could you': 1, 'would it': 1,
    'compare': 2, 'difference': 2, 'versus': 2
  };

  // ── SENTIMENT ANALYZER ──────────────────────────────────────────
  var SentimentEngine = {
    /**
     * Analyzes text and returns sentiment with confidence score
     * @param {string} text - Raw user input
     * @returns {{ label: string, score: number, confidence: number }}
     */
    analyze: function (text) {
      var lower = text.toLowerCase().replace(/[^\w\s']/g, ' ').replace(/\s+/g, ' ').trim();
      var tokens = lower.split(/\s+/);

      var scores = { positive: 0, negative: 0, urgent: 0, curious: 0, neutral: 0 };

      // Score individual words
      tokens.forEach(function (token) {
        if (POSITIVE_WORDS[token]) scores.positive += POSITIVE_WORDS[token];
        if (NEGATIVE_WORDS[token]) scores.negative += NEGATIVE_WORDS[token];
        if (URGENT_WORDS[token]) scores.urgent += URGENT_WORDS[token];
        if (CURIOUS_WORDS[token]) scores.curious += CURIOUS_WORDS[token];
      });

      // Score multi-word phrases
      Object.keys(NEGATIVE_WORDS).forEach(function (phrase) {
        if (phrase.indexOf(' ') !== -1 && lower.indexOf(phrase) !== -1) {
          scores.negative += NEGATIVE_WORDS[phrase];
        }
      });
      Object.keys(URGENT_WORDS).forEach(function (phrase) {
        if (phrase.indexOf(' ') !== -1 && lower.indexOf(phrase) !== -1) {
          scores.urgent += URGENT_WORDS[phrase];
        }
      });
      Object.keys(CURIOUS_WORDS).forEach(function (phrase) {
        if (phrase.indexOf(' ') !== -1 && lower.indexOf(phrase) !== -1) {
          scores.curious += CURIOUS_WORDS[phrase];
        }
      });

      // Exclamation marks boost sentiment intensity
      var exclamations = (text.match(/!/g) || []).length;
      if (exclamations > 0) {
        // Boost whichever sentiment is already highest
        if (scores.positive > scores.negative) scores.positive += exclamations;
        else if (scores.negative > 0) scores.negative += exclamations;
      }

      // Question marks boost curiosity
      var questions = (text.match(/\?/g) || []).length;
      if (questions > 0) scores.curious += questions;

      // ALL CAPS detection (shouting)
      var capsWords = tokens.filter(function (t) { return t.length > 2 && t === t.toUpperCase() && /[A-Z]/.test(t); });
      if (capsWords.length > 1) {
        if (scores.negative > 0) scores.negative += 2;
        else if (scores.positive > 0) scores.positive += 1;
        else scores.urgent += 2;
      }

      // Determine dominant sentiment
      var maxScore = 0;
      var dominant = 'neutral';
      var sentimentOrder = ['urgent', 'negative', 'curious', 'positive', 'neutral'];
      
      for (var i = 0; i < sentimentOrder.length; i++) {
        var key = sentimentOrder[i];
        if (scores[key] > maxScore) {
          maxScore = scores[key];
          dominant = key;
        }
      }

      // If all scores are 0, it's neutral
      if (maxScore === 0) dominant = 'neutral';

      // Confidence: how much the dominant sentiment stands out
      var totalScore = scores.positive + scores.negative + scores.urgent + scores.curious + 0.5;
      var confidence = totalScore > 0 ? maxScore / totalScore : 0.5;

      return {
        label: dominant,
        score: maxScore,
        confidence: Math.min(confidence, 1),
        breakdown: scores
      };
    }
  };

  // ── TONE ADAPTER ─────────────────────────────────────────────────
  var ToneAdapter = {
    /**
     * Adapts response text based on detected sentiment
     * @param {string} responseText - The generated response
     * @param {object} sentiment - Sentiment analysis result
     * @param {string} userName - User's name (if known)
     * @returns {string} Adapted response
     */
    adapt: function (responseText, sentiment, userName) {
      var lower = responseText.toLowerCase();
      
      // Don't modify greetings/farewells — they're already warm enough
      if (/^(hey|hello|hi|goodbye|bye|later|take care|welcome back)/i.test(lower.trim())) {
        return responseText;
      }

      // Don't modify if already sentiment-aware (has empathy phrases)
      if (/^(i hear you|i understand|i apologize|let's sort|glad you asked)/i.test(lower.trim())) {
        return responseText;
      }

      var toneConfig = CONFIG.tone[sentiment.label] || CONFIG.tone.neutral;
      
      // Pick prefix (70% chance of adding one for non-neutral, 20% for neutral)
      var shouldPrefix = sentiment.label !== 'neutral' 
        ? Math.random() < 0.7 
        : Math.random() < 0.2;
      
      // Pick suffix (50% chance for negative/urgent, 20% for others)
      var shouldSuffix = (sentiment.label === 'negative' || sentiment.label === 'urgent')
        ? Math.random() < 0.5
        : Math.random() < 0.2;

      var prefix = shouldPrefix
        ? toneConfig.prefixes[Math.floor(Math.random() * toneConfig.prefixes.length)]
        : '';
      var suffix = shouldSuffix
        ? toneConfig.suffixes[Math.floor(Math.random() * toneConfig.suffixes.length)]
        : '';

      return prefix + responseText + suffix;
    }
  };

  // ── MAIN HOOK ───────────────────────────────────────────────────
  function init() {
    if (!window.MortEBrainsInternals || !window.MortEBrainsInternals._originalQuery) {
      console.warn('Mort-E Enhancement Module 2: Bridge not detected. Load after mort-e-brains.js');
      return;
    }

    var originalQuery = window.MortEBrainsInternals._originalQuery;
    console.log('Mort-E Enhancement Module 2: Sentiment Engine + Tone Adapter — Active');

    // Override query to inject sentiment analysis + Swahili preference
    window.MortEBrains.query = function (rawInput) {
      // 1. Analyze sentiment
      var sentiment = SentimentEngine.analyze(rawInput);
      
      // 2. Store sentiment in state for other modules
      if (window.MortEBrainsInternals && window.MortEBrainsInternals.state) {
        window.MortEBrainsInternals.state._lastSentiment = sentiment;
        // v7: Store Swahili detection result
        window.MortEBrainsInternals.state._isSwahili = SwahiliDetector.isSwahili(rawInput);
      }

      // 3. Call original query
      var result = originalQuery(rawInput);

      // 4. If Swahili was detected, try to prefer Swahili responses
      var isSwahili = SwahiliDetector.isSwahili(rawInput);
      if (isSwahili && result.text) {
        // Check if the response already has Swahili content (from Swahili responses in KB)
        var hasSwahili = /\b(karibu|jambo|habari|mambo|niko|mzuri|kwaheri|salama|ninayetumika|nikusaidieje|tutaonana)\b/i.test(result.text);
        if (!hasSwahili) {
          // Re-query with a hint to prefer Swahili by prefixing with Swahili trigger
          var swahiliResult = originalQuery(rawInput);
          // Check if this alternate result has Swahili
          var altHasSwahili = /\b(karibu|jambo|habari|mambo|niko|mzuri|kwaheri|salama|ninayetumika|nikusaidieje|tutaonana)\b/i.test(swahiliResult.text);
          if (altHasSwahili) {
            result = swahiliResult;
          }
        }
      }

      // 5. Apply tone adaptation
      // Only adapt if sentiment is confident and non-neutral
      if (sentiment.label !== 'neutral' && sentiment.confidence > 0.3) {
        result.text = ToneAdapter.adapt(
          result.text, 
          sentiment, 
          window.MortEBrainsInternals.memory.getName()
        );
      } else if (sentiment.label === 'neutral' && Math.random() < 0.15) {
        // Occasional neutral filler to break monotony in long sessions
        result.text = ToneAdapter.adapt(
          result.text,
          sentiment,
          window.MortEBrainsInternals.memory.getName()
        );
      }

      return result;
    };

    // Expose for other modules
    window.MortEEnhancements = window.MortEEnhancements || {};
    window.MortEEnhancements.SentimentEngine = SentimentEngine;
    window.MortEEnhancements.ToneAdapter = ToneAdapter;
    window.MortEEnhancements.SwahiliDetector = SwahiliDetector;
  }

  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
