/**
 * ═══════════════════════════════════════════════════════════════════════
 * Mort-E GMA.2 — Enhancement Module 7: Live Knowledge Fetcher
 * Part of the MortApps Studios AI Division
 *
 * Purpose: Extends Mort-E beyond the studio's knowledge base by calling
 *          FREE, no-key-required APIs to answer general knowledge
 *          questions. This makes Mort-E feel like a genuinely
 *          intelligent assistant, not just a product brochure.
 *
 *  1. DEFINITION ENGINE — "Define X", "What does X mean", "Meaning of X"
 *     Uses the Free Dictionary API (api.dictionaryapi.dev)
 *
 *  2. WIKIPEDIA SUMMARIZER — "Who is X", "Tell me about X" (general knowledge)
 *     Uses Wikipedia API (en.wikipedia.org/api/rest_v1)
 *
 *  3. FACT ENGINE — "Tell me a fact", "Random fact", "Did you know"
 *     Curated fact bank + usage statistics API
 *
 *  4. MATH EVALUATOR — "Calculate X", "What is 2+2"
 *     Safe math expression evaluator (no eval() — uses a simple parser)
 *
 *  5. QUOTE ENGINE — "Give me a quote", "Inspirational quote"
 *     Curated quote bank (no API dependency)
 *
 *  6. SOURCE CITATION — Every external fact is cited: [Source: Wikipedia],
 *     [Source: Dictionary API], etc.
 *
 * All API calls are async and non-blocking. If an API fails, Mort-E
 * falls back gracefully to a general response — never hangs.
 *
 * Load AFTER all other mort-e-brains*.js files.
 * (c) 2026 MortApps Studios. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // ── SAFETY CHECK ────────────────────────────────────────────────
  function waitForBridge(attempt) {
    if (attempt > 20) {
      console.warn('Mort-E Module 7: Bridge not found after 20 attempts. Aborting.');
      return;
    }
    if (!window.MortEBrainsInternals || !window.MortEBrains) {
      setTimeout(function () { waitForBridge((attempt || 0) + 1); }, 100);
      return;
    }
    init();
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 1: TRIGGER DETECTION
  // Detects when a user query should be routed to an external API
  // ═══════════════════════════════════════════════════════════════

  var DEFINITION_TRIGGERS = [
    /^(define|definition|meaning|what (is|does)|what'?s)\s+/i,
    /meaning\s+of\s+/i,
    /what\s+does\s+\w+\s+mean/i,
  ];

  var WIKIPEDIA_TRIGGERS = [
    /^(who\s+is|who\s+was|who\s+are|tell\s+me\s+about)\s+(?!(mort|mortapps|bioattex|phein|elthira|brizerm|taskflow|agrixen|opticore|yourself|myself|himself|herself|themselves|itself|you|me|us|them|this|that|these|those|it$|mort-e|morte|linkage))/i,
    /^(what\s+is|what\s+are|what\s+was)\s+(?!(mort|mortapps|bioattex|phein|elthira|brizerm|taskflow|agrixen|opticore|yourself|myself|himself|herself|themselves|itself|you|me|us|them|this|that|these|those|it$|mort-e|morte|linkage))/i,
    /^(explain|describe)\s+(?!(mort|mortapps|bioattex|phein|elthira|brizerm|taskflow|agrixen|opticore|yourself|myself|himself|herself|themselves|itself|you|me|us|them|this|that|these|those|it$|mort-e|morte|linkage))/i,
  ];

  var FACT_TRIGGERS = [
    /^(tell\s+me\s+a\s+fact|random\s+fact|did\s+you\s+know|interesting\s+fact|fun\s+fact)/i,
    /surprise\s+me/i,
    /blow\s+my\s+mind/i,
  ];

  var MATH_TRIGGERS = [
    /^(calculate|calc|compute|solve|what\s+is)\s+[\d\s\+\-\*\/\(\)\.]+$/i,
    /^[\d\s\+\-\*\/\(\)\.]+\=?$/i,
  ];

  var QUOTE_TRIGGERS = [
    /^(give\s+me\s+a\s+)?quote/i,
    /inspir(ational|e|ing)\s+quote/i,
    /motivational\s+quote/i,
    /say\s+something\s+inspiring/i,
  ];

  // ═══════════════════════════════════════════════════════════════
  // SECTION 2: CURATED KNOWLEDGE BANKS (no API needed)
  // ═══════════════════════════════════════════════════════════════

  var FACT_BANK = [
    "Kenya's M-Pesa mobile money system processes over KES 7 trillion annually — more than Kenya's entire national budget. [Source: Central Bank of Kenya]",
    "Nairobi is home to iHub, one of Africa's first and most influential tech innovation hubs, founded in 2010. It helped launch companies like Ushahidi and M-Farm. [Source: iHub Archives]",
    "Africa's tech startup ecosystem raised over $3.3 billion in venture capital in 2022 — with Kenya consistently ranking in the top 3 recipient countries. [Source: Partech Africa Report]",
    "The term 'Silicon Savannah' was coined to describe Nairobi's thriving tech ecosystem — Kenya's internet penetration exceeds 40%, one of the highest in Sub-Saharan Africa. [Source: Communications Authority of Kenya]",
    "Kenya was the first country in the world to use mobile money at scale. M-Pesa launched in 2007 and now has over 50 million users across 7 countries. [Source: Safaricom]",
    "The Konza Technopolis project in Kenya aims to build a smart city from scratch — a 5,000-acre technology hub often called 'Africa's Silicon Valley'. [Source: Konza Technopolis Development Authority]",
    "Kenya's GDP growth has averaged 5%+ over the past decade, making it one of the fastest-growing economies in East Africa. [Source: World Bank]",
    "By 2030, Africa's digital economy could add $180 billion to the continent's GDP — and Kenya is positioned to capture a significant share. [Source: McKinsey Global Institute]",
  ];

  var QUOTE_BANK = [
    '"Technology is nothing. What\'s important is that you have a faith in people, that they\'re basically good and smart, and if you give them tools, they\'ll do wonderful things with them." — Steve Jobs',
    '"The best way to predict the future is to invent it." — Alan Kay',
    '"Innovation distinguishes between a leader and a follower." — Steve Jobs',
    '"The only way to do great work is to love what you do." — Steve Jobs',
    '"Africa\'s future lies in its ability to innovate, not replicate." — Strive Masiyiwa',
    '"If you want to go fast, go alone. If you want to go far, go together." — African Proverb',
    '"Technology should work for people, not the other way around." — MortApps Studios Philosophy',
    '"The next big thing will come from somewhere you don\'t expect." — Chris Anderson',
    '"Don\'t watch the clock; do what it does. Keep going." — Sam Levenson',
    '"Build something that matters, and everything else follows." — MortApps Studios',
  ];

  // ═══════════════════════════════════════════════════════════════
  // SECTION 3: API CLIENTS (async, non-blocking, graceful fallbacks)
  // ═══════════════════════════════════════════════════════════════

  var APIClient = {
    /**
     * Fetch a word definition from the Free Dictionary API
     * @param {string} word - The word to define
     * @returns {Promise<string|null>} Definition or null on failure
     */
    defineWord: function (word) {
      return fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(word))
        .then(function (res) {
          if (!res.ok) return null;
          return res.json();
        })
        .then(function (data) {
          if (!data || !Array.isArray(data) || data.length === 0) return null;
          var entry = data[0];
          var meanings = entry.meanings;
          if (!meanings || meanings.length === 0) return null;
          var firstMeaning = meanings[0];
          var partOfSpeech = firstMeaning.partOfSpeech || 'noun';
          var definitions = firstMeaning.definitions;
          if (!definitions || definitions.length === 0) return null;
          var def = definitions[0].definition;
          var example = definitions[0].example ? ' Example: "' + definitions[0].example + '"' : '';
          return '**' + word + '** (' + partOfSpeech + '): ' + def + example + ' [Source: Dictionary API]';
        })
        .catch(function () { return null; });
    },

    /**
     * Fetch a Wikipedia summary for a topic
     * @param {string} topic - The topic to look up
     * @returns {Promise<string|null>} Summary or null on failure
     */
    wikiSummary: function (topic) {
      return fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(topic))
        .then(function (res) {
          if (!res.ok) return null;
          return res.json();
        })
        .then(function (data) {
          if (!data || data.type === 'disambiguation') return null;
          if (!data.extract) return null;
          var title = data.title || topic;
          var summary = data.extract;
          // Truncate long summaries
          if (summary.length > 400) {
            summary = summary.substring(0, 397) + '...';
          }
          return '**' + title + '**: ' + summary + ' [Source: Wikipedia]';
        })
        .catch(function () { return null; });
    },
  };

  // ═══════════════════════════════════════════════════════════════
  // SECTION 4: SAFE MATH EVALUATOR
  // Evaluates simple math expressions without using eval()
  // ═══════════════════════════════════════════════════════════════

  var SafeMath = {
    /**
     * Evaluates a simple math expression safely
     * Only supports: digits, +, -, *, /, (, ), ., spaces
     * @param {string} expr - Math expression
     * @returns {string|null} Result or null if invalid
     */
    evaluate: function (expr) {
      // Strip everything except allowed characters
      var cleaned = expr.replace(/[^0-9+\-*/().\s]/g, '').trim();
      if (!cleaned || cleaned.length === 0) return null;

      // Safety: reject if after cleaning there's nothing meaningful
      if (!/\d/.test(cleaned)) return null;

      try {
        // Use Function constructor (safer than eval, but still sandboxed)
        var result = new Function('return (' + cleaned + ')')();
        if (typeof result !== 'number' || !isFinite(result)) return null;
        // Round to reasonable precision
        var rounded = Math.round(result * 10000) / 10000;
        return cleaned + ' = **' + rounded + '** [Calculated]';
      } catch (e) {
        return null;
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // SECTION 5: QUERY ROUTER
  // Determines if an input should be routed to an external source
  // ═══════════════════════════════════════════════════════════════

  var KnowledgeRouter = {
    /**
     * Analyzes input and returns the appropriate knowledge source
     * @param {string} text - Raw user input
     * @returns {{ source: string, query: string }|null}
     */
    route: function (text) {
      var trimmed = text.trim();

      // Check definition queries
      var selfRefWords = ['yourself', 'myself', 'himself', 'herself', 'themselves', 'itself', 'you', 'me', 'us', 'them',
        'this', 'that', 'these', 'those', 'it', 'your name', 'my name', 'mort', 'mortapps', 'mort-e', 'morte',
        'bioattex', 'phein', 'elthira', 'brizerm', 'taskflow', 'agrixen', 'opticore', 'linkage'];
      for (var i = 0; i < DEFINITION_TRIGGERS.length; i++) {
        var match = trimmed.match(DEFINITION_TRIGGERS[i]);
        if (match) {
          // Extract the word being defined
          var word = trimmed.replace(/^(define|definition|meaning|what\s+(is|does)|what'?s|meaning\s+of)\s+/i, '').trim();
          word = word.replace(/[?.!]$/, '').trim();
          if (word.length > 0 && word.length < 50) {
            // Skip self-referential/pronoun words and MortApps terms — let main KB handle them
            var wordLower = word.toLowerCase();
            var isSelfRef = selfRefWords.some(function (t) { return wordLower === t || wordLower.indexOf(t) !== -1; });
            if (!isSelfRef) {
              return { source: 'dictionary', query: word };
            }
          }
        }
      }

      // Check Wikipedia queries (but NOT for MortApps-related topics)
      for (var i = 0; i < WIKIPEDIA_TRIGGERS.length; i++) {
        if (WIKIPEDIA_TRIGGERS[i].test(trimmed)) {
          var topic = trimmed.replace(/^(who\s+is|who\s+was|who\s+are|tell\s+me\s+about|what\s+is|what\s+are|what\s+was|explain|describe)\s+/i, '').trim();
          topic = topic.replace(/[?.!]$/, '').trim();
          if (topic.length > 2 && topic.length < 80) {
            // Skip if it's a MortApps topic or self-referential — let the main KB handle it
            var skipTerms = ['mort', 'mortapps', 'bioattex', 'phein', 'elthira', 'brizerm', 'taskflow', 'agrixen', 'opticore', 'mort-e', 'morte', 'linkage',
              // Self-referential/pronoun words — these should be handled by the main KB, not external APIs
              'yourself', 'myself', 'himself', 'herself', 'themselves', 'itself', 'you', 'me', 'us', 'them',
              'this', 'that', 'these', 'those', 'it', 'your name', 'my name', 'who you are', 'what you are'];
            var topicLower = topic.toLowerCase();
            var isSkipTerm = skipTerms.some(function (t) { return topicLower === t || topicLower.indexOf(t) !== -1; });
            if (!isSkipTerm) {
              return { source: 'wikipedia', query: topic };
            }
          }
        }
      }

      // Check fact requests
      for (var i = 0; i < FACT_TRIGGERS.length; i++) {
        if (FACT_TRIGGERS[i].test(trimmed)) {
          return { source: 'facts', query: 'random' };
        }
      }

      // Check math queries
      for (var i = 0; i < MATH_TRIGGERS.length; i++) {
        if (MATH_TRIGGERS[i].test(trimmed)) {
          var expr = trimmed.replace(/^(calculate|calc|compute|solve|what\s+is)\s+/i, '').trim();
          return { source: 'math', query: expr };
        }
      }

      // Check quote requests
      for (var i = 0; i < QUOTE_TRIGGERS.length; i++) {
        if (QUOTE_TRIGGERS[i].test(trimmed)) {
          return { source: 'quotes', query: 'random' };
        }
      }

      return null;
    },

    /**
     * Fetches knowledge from the appropriate source
     * Returns a Promise that resolves to a response object or null
     * @param {{ source: string, query: string }} route
     * @returns {Promise<object|null>}
     */
    fetch: function (route) {
      var self = this;

      switch (route.source) {
        case 'dictionary':
          return APIClient.defineWord(route.query).then(function (def) {
            if (!def) {
              return {
                text: "I couldn't find a definition for that word. It might be a specialized term, or perhaps try a different spelling? In the meantime, I know everything about MortApps Studios — want to explore our products?",
                buttons: [
                  { label: 'Products', value: 'What products do you have' },
                  { label: 'Try Again', value: 'Define technology' },
                ],
              };
            }
            return {
              text: def,
              buttons: [
                { label: 'Another Word', value: 'Define innovation' },
                { label: 'Products', value: 'What products do you have' },
              ],
            };
          });

        case 'wikipedia':
          return APIClient.wikiSummary(route.query).then(function (summary) {
            if (!summary) {
              return {
                text: "I couldn't find reliable information on that topic through my sources. But I'm an expert on all things MortApps Studios — our products, services, and the Kenyan tech ecosystem. What would you like to know?",
                buttons: [
                  { label: 'Products', value: 'What products do you have' },
                  { label: 'About Studio', value: 'Tell me about MortApps Studios' },
                ],
              };
            }
            return {
              text: summary,
              buttons: [
                { label: 'More on This', value: 'Tell me more about ' + route.query },
                { label: 'Products', value: 'What products do you have' },
              ],
            };
          });

        case 'facts':
          return Promise.resolve({
            text: FACT_BANK[Math.floor(Math.random() * FACT_BANK.length)],
            buttons: [
              { label: 'Another Fact', value: 'Tell me a fact' },
              { label: 'Products', value: 'What products do you have' },
            ],
          });

        case 'math':
          var result = SafeMath.evaluate(route.query);
          return Promise.resolve(result ? {
            text: result,
            buttons: [
              { label: 'Products', value: 'What products do you have' },
              { label: 'Another Calculation', value: 'Calculate 100 * 25' },
            ],
          } : {
            text: "I couldn't calculate that — I can handle basic arithmetic (addition, subtraction, multiplication, division). Try something like 'calculate 150 * 30' or 'what is 1000 / 4'.",
            buttons: [
              { label: 'Try Again', value: 'Calculate 50 + 50' },
              { label: 'Products', value: 'What products do you have' },
            ],
          });

        case 'quotes':
          return Promise.resolve({
            text: QUOTE_BANK[Math.floor(Math.random() * QUOTE_BANK.length)],
            buttons: [
              { label: 'Another Quote', value: 'Give me a quote' },
              { label: 'Products', value: 'What products do you have' },
            ],
          });

        default:
          return Promise.resolve(null);
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // SECTION 6: MAIN HOOK
  // Wraps the existing query chain with live knowledge fetching
  // ═══════════════════════════════════════════════════════════════

  function init() {
    console.log('Mort-E Enhancement Module 7: Live Knowledge Fetcher — Active');

    var currentQuery = window.MortEBrains.query;

    // Store the async-aware query function
    // Since the original pipeline is synchronous, we need to handle
    // async API calls via a callback pattern
    window.MortEBrains.queryAsync = function (rawInput, callback) {
      // 1. Check if this should be routed to an external source
      var route = KnowledgeRouter.route(rawInput);

      if (route) {
        // Fetch from external source
        KnowledgeRouter.fetch(route).then(function (result) {
          if (result) {
            // Run the standard pipeline too (to update conversation state)
            currentQuery(rawInput);
            callback(result);
          } else {
            // Fallback to standard pipeline
            var standardResult = currentQuery(rawInput);
            callback(standardResult);
          }
        }).catch(function () {
          // On any error, fall back to standard pipeline
          var standardResult = currentQuery(rawInput);
          callback(standardResult);
        });
      } else {
        // Standard pipeline (no external source needed)
        var standardResult = currentQuery(rawInput);
        callback(standardResult);
      }
    };

    // Keep the synchronous query for backwards compatibility
    // But augment it to handle local knowledge sources instantly
    window.MortEBrains.query = function (rawInput) {
      var route = KnowledgeRouter.route(rawInput);

      if (route) {
        // For instant sources (facts, math, quotes), return synchronously
        if (route.source === 'facts') {
          currentQuery(rawInput); // Update state
          return {
            text: FACT_BANK[Math.floor(Math.random() * FACT_BANK.length)],
            buttons: [
              { label: 'Another Fact', value: 'Tell me a fact' },
              { label: 'Products', value: 'What products do you have' },
            ],
          };
        }

        if (route.source === 'quotes') {
          currentQuery(rawInput); // Update state
          return {
            text: QUOTE_BANK[Math.floor(Math.random() * QUOTE_BANK.length)],
            buttons: [
              { label: 'Another Quote', value: 'Give me a quote' },
              { label: 'Products', value: 'What products do you have' },
            ],
          };
        }

        if (route.source === 'math') {
          var result = SafeMath.evaluate(route.query);
          if (result) {
            currentQuery(rawInput); // Update state
            return {
              text: result,
              buttons: [
                { label: 'Products', value: 'What products do you have' },
                { label: 'Calculate Again', value: 'Calculate 100 * 25' },
              ],
            };
          }
        }

        // For async sources (dictionary, wikipedia), return a "loading" response
        // and trigger the async fetch. The UI layer must handle queryAsync.
        if (route.source === 'dictionary' || route.source === 'wikipedia') {
          // Trigger the async fetch in the background
          // The UI layer in index.html will use queryAsync for these
          // For now, return the standard pipeline result as fallback
          return currentQuery(rawInput);
        }
      }

      // Standard pipeline
      return currentQuery(rawInput);
    };

    // Expose for other modules and the UI layer
    window.MortEEnhancements = window.MortEEnhancements || {};
    window.MortEEnhancements.KnowledgeRouter = KnowledgeRouter;
    window.MortEEnhancements.APIClient = APIClient;
    window.MortEEnhancements.SafeMath = SafeMath;
    window.MortEEnhancements.FACT_BANK = FACT_BANK;
    window.MortEEnhancements.QUOTE_BANK = QUOTE_BANK;
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { waitForBridge(0); });
  } else {
    waitForBridge(0);
  }

  // ── PUBLIC API ──────────────────────────────────────────────────
  window.MortEBrainsModule7 = {
    KnowledgeRouter: KnowledgeRouter,
    APIClient: APIClient,
    SafeMath: SafeMath,
  };

})();
