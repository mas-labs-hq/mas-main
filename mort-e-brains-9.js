/**
 * ═══════════════════════════════════════════════════════════════════════
 * Mort-E GMA.2 — Enhancement Module 9: Advanced Conversation Memory + Persona Depth
 * Part of the MortApps Studios AI Division
 *
 * Purpose: Makes Mort-E remember, learn, and feel ALIVE across
 *          conversations. This module:
 *
 *  1. USER PROFILE BUILDER — Remembers the user's industry, interests,
 *     and conversation history. Uses this to tailor future responses.
 *     "Welcome back, Sarah! Last time you were interested in BioAttex
 *     for your school. Want to pick up where we left off?"
 *
 *  2. CONVERSATION THEME TRACKER — Detects whether the user is
 *     "shopping" (comparing products), "researching" (deep diving into
 *     one topic), or "browsing" (casual exploration). Adapts Mort-E's
 *     approach accordingly.
 *
 *  3. PERSONA DEPTH ENGINE — Mort-E has opinions, preferences, and
 *     personality quirks that make him feel real. He has a favorite
 *     product (Elthira.Ai — "because it's the most unique thing we
 *     build"), respects the founder's philosophy deeply, and has
 *     a dry wit that shows up at just the right moments.
 *
 *  4. SESSION CONTINUITY — Remembers the last 5 conversation topics
 *     across page reloads. When a returning user comes back, Mort-E
 *     can reference their previous interests naturally.
 *
 *  5. ADAPTIVE RESPONSE STRATEGY — Shopping users get comparisons.
 *     Researching users get depth. Browsing users get variety.
 *     First-time users get orientation. Returning users get continuity.
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
      console.warn('Mort-E Module 9: Bridge not found after 20 attempts. Aborting.');
      return;
    }
    if (!window.MortEBrainsInternals || !window.MortEBrains) {
      setTimeout(function () { waitForBridge((attempt || 0) + 1); }, 100);
      return;
    }
    init();
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 1: USER PROFILE BUILDER
  // Builds a persistent profile of the user across sessions
  // ═══════════════════════════════════════════════════════════════

  var STORAGE_KEY = 'mort_e_user_profile';

  var UserProfile = {
    _profile: null,

    /**
     * Loads user profile from localStorage
     */
    load: function () {
      try {
        var stored = localStorage.getItem(STORAGE_KEY);
        this._profile = stored ? JSON.parse(stored) : this._defaultProfile();
      } catch (e) {
        this._profile = this._defaultProfile();
      }
      return this._profile;
    },

    /**
     * Saves user profile to localStorage
     */
    save: function () {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this._profile));
      } catch (e) { /* silent */ }
    },

    _defaultProfile: function () {
      return {
        name: null,
        industry: null,
        interests: [],        // Topics they've asked about
        productsExplored: [],  // Products they've discussed
        visitCount: 0,
        firstVisit: null,
        lastVisit: null,
        lastTopics: [],       // Last 5 conversation topics
        conversationStyle: 'browsing', // 'shopping', 'researching', 'browsing'
        totalMessages: 0,
      };
    },

    /**
     * Records a topic the user has explored
     */
    recordInterest: function (topic) {
      if (!topic) return;
      var profile = this._profile || this.load();
      if (profile.interests.indexOf(topic) === -1) {
        profile.interests.push(topic);
        if (profile.interests.length > 20) profile.interests.shift();
      }
      profile.lastTopics.unshift(topic);
      if (profile.lastTopics.length > 5) profile.lastTopics.pop();
      this.save();
    },

    /**
     * Records a product the user has explored
     */
    recordProduct: function (productId) {
      if (!productId) return;
      var profile = this._profile || this.load();
      if (profile.productsExplored.indexOf(productId) === -1) {
        profile.productsExplored.push(productId);
      }
      this.save();
    },

    /**
     * Detects and records the user's industry from their messages
     */
    detectIndustry: function (input) {
      var industryKeywords = {
        'education': ['school', 'university', 'student', 'teacher', 'lecture', 'college', 'academic', 'campus', 'learning'],
        'healthcare': ['hospital', 'clinic', 'patient', 'doctor', 'nurse', 'medical', 'health', 'pharmacy', 'wellness'],
        'hr': ['recruitment', 'hiring', 'cv', 'resume', 'employee', 'payroll', 'attendance', 'hr', 'human resource', 'staff'],
        'finance': ['bank', 'investment', 'nse', 'stock', 'trading', 'insurance', 'loan', 'mortgage', 'financial'],
        'agriculture': ['farm', 'crop', 'livestock', 'agriculture', 'agritech', 'harvest', 'irrigation', 'soil'],
        'technology': ['software', 'app', 'website', 'development', 'ai', 'startup', 'tech', 'code', 'programming'],
        'government': ['government', 'ministry', 'county', 'public sector', 'parastatal', 'regulation'],
        'retail': ['shop', 'store', 'retail', 'ecommerce', 'customer', 'inventory', 'supplier'],
      };

      var lower = input.toLowerCase();
      for (var industry in industryKeywords) {
        var keywords = industryKeywords[industry];
        for (var i = 0; i < keywords.length; i++) {
          if (lower.indexOf(keywords[i]) !== -1) {
            var profile = this._profile || this.load();
            profile.industry = industry;
            this.save();
            return industry;
          }
        }
      }
      return null;
    },

    /**
     * Records a visit (called on each page load)
     */
    recordVisit: function () {
      var profile = this._profile || this.load();
      profile.visitCount++;
      if (!profile.firstVisit) profile.firstVisit = new Date().toISOString();
      profile.lastVisit = new Date().toISOString();
      this.save();
    },

    /**
     * Gets the user's profile
     */
    getProfile: function () {
      return this._profile || this.load();
    },

    /**
     * Gets a contextual greeting for returning users
     */
    getReturnContext: function () {
      var profile = this.getProfile();
      if (profile.visitCount <= 1) return null;

      var name = profile.name;
      var lastTopics = profile.lastTopics;
      var productsExplored = profile.productsExplored;

      var contexts = [];

      if (name) {
        if (lastTopics.length > 0) {
          contexts.push("Welcome back, " + name + "! Last time we were talking about " + lastTopics[0] + ". Want to continue from there, or explore something new?");
        } else {
          contexts.push("Welcome back, " + name + "! Great to see you again. What can I help you with this time?");
        }
      } else {
        if (lastTopics.length > 0) {
          contexts.push("Welcome back! Last time you were exploring " + lastTopics[0] + ". Want to dive deeper or check out something different?");
        }
      }

      if (contexts.length > 0) {
        return contexts[Math.floor(Math.random() * contexts.length)];
      }
      return null;
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // SECTION 2: CONVERSATION THEME TRACKER
  // Detects shopping vs researching vs browsing behavior
  // ═══════════════════════════════════════════════════════════════

  var ThemeTracker = {
    /**
     * Analyzes conversation flow to determine the user's mode
     * @param {object} state - Conversation state
     * @returns {string} 'shopping', 'researching', or 'browsing'
     */
    detectMode: function (state) {
      if (!state) return 'browsing';

      var profile = UserProfile.getProfile();
      var productsExplored = profile.productsExplored.length;
      var lastEntityId = state.lastEntityId;

      // Shopping: user has explored 2+ different products, or is comparing
      if (productsExplored >= 2) return 'shopping';

      // Researching: user has gone deep on one topic (depth >= 2)
      if (lastEntityId) {
        var topicId = 'entity_' + lastEntityId;
        var depth = state.getDepth ? state.getDepth(topicId) : 0;
        if (depth >= 2) return 'researching';
      }

      // Default: browsing
      return 'browsing';
    },

    /**
     * Gets strategy adjustments based on user mode
     * @param {string} mode - User's conversation mode
     * @returns {object} Strategy adjustments
     */
    getStrategy: function (mode) {
      switch (mode) {
        case 'shopping':
          return {
            responseStyle: 'comparative',
            buttonStyle: 'comparison',
            shouldCompare: true,
            shouldDeepDive: false,
            shouldSuggestAlternatives: true,
          };
        case 'researching':
          return {
            responseStyle: 'detailed',
            buttonStyle: 'depth',
            shouldCompare: false,
            shouldDeepDive: true,
            shouldSuggestAlternatives: false,
          };
        case 'browsing':
        default:
          return {
            responseStyle: 'overview',
            buttonStyle: 'variety',
            shouldCompare: false,
            shouldDeepDive: false,
            shouldSuggestAlternatives: true,
          };
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // SECTION 3: PERSONA DEPTH ENGINE
  // Mort-E's personality, opinions, and quirks
  // ═══════════════════════════════════════════════════════════════

  var PersonaEngine = {
    // Mort-E's personal opinions (expressed naturally, not robotically)
    opinions: {
      favoriteProduct: "Elthira.Ai",
      favoriteReason: "It's the most unique thing we build — an AI herbal wellness consultant rooted in Kenyan tradition. You won't find anything like it anywhere else in the world. That's not marketing; that's a fact.",
      onFounder: "Mort Ian K. doesn't just manage — he builds. Every product in our lineup has his fingerprints on it. The 'technology should feel human' philosophy isn't something the marketing team came up with. It's how he actually thinks.",
      onPrivacy: "Privacy isn't a feature — it's an architecture. BioAttex doesn't just claim to be private; it IS private because the data literally cannot leave your device. That's not a setting you toggle. It's how it's built.",
      onNairobi: "Kenya isn't a limitation — it's an advantage. We see problems that Silicon Valley doesn't even know exist. And we build solutions that actually work here, not solutions designed for fiber-optic internet and unlimited cloud budgets.",
    },

    // Personality quirks that surface naturally
    quirks: {
      // Occasional dry humor (appears ~10% of the time for non-serious queries)
      dryWit: [
        "I'd say I'm humble, but that would undercut the point.",
        "If I had a shilling for every time someone asked me that... I'd have exactly enough to buy nothing, because I don't use money.",
        "I know everything about MortApps Studios. Everything else is... a bonus.",
      ],
      // Occasional passion moments (when discussing philosophy or products)
      passion: [
        "This is the stuff that gets me going — ",
        "Honestly, this is where MortApps Studios really shines — ",
        "If you take one thing away from this conversation — ",
      ],
    },

    /**
     * Gets a personality-infused opener based on context
     * @param {string} mode - Conversation mode
     * @returns {string|null} A personality opener, or null for standard
     */
    getPersonaOpener: function (mode) {
      // Only inject personality ~15% of the time for natural feel
      if (Math.random() > 0.15) return null;

      if (mode === 'browsing') {
        return this.quirks.dryWit[Math.floor(Math.random() * this.quirks.dryWit.length)];
      }
      if (mode === 'researching') {
        return this.quirks.passion[Math.floor(Math.random() * this.quirks.passion.length)];
      }
      return null;
    },

    /**
     * Gets Mort-E's opinion on a topic
     * @param {string} topic - 'favoriteProduct', 'onFounder', etc.
     * @returns {string|null} Opinion text or null
     */
    getOpinion: function (topic) {
      return this.opinions[topic] || null;
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // SECTION 4: OPINION TRIGGERS
  // Detects when a user is asking for Mort-E's personal take
  // ═══════════════════════════════════════════════════════════════

  var OPINION_TRIGGERS = [
    {
      pattern: /(what'?s?\s+)?your\s+(favorite|favourite|best|preferred|top)\s+(product|tool|thing|build)/i,
      topic: 'favoriteProduct',
      response: function () {
        return "If I had to pick — and this is a personal take, not an official position — it's " + PersonaEngine.opinions.favoriteProduct + ". " + PersonaEngine.opinions.favoriteReason + " But every product in our lineup has its own reason to exist. What matters is which one solves your problem.";
      },
    },
    {
      pattern: /what\s+do\s+you\s+think\s+(about|of)\s+(the\s+)?(founder|mort|ian)/i,
      topic: 'onFounder',
      response: function () {
        return PersonaEngine.opinions.onFounder;
      },
    },
    {
      pattern: /what\s+do\s+you\s+think\s+(about|of)\s+(privacy|data|security)/i,
      topic: 'onPrivacy',
      response: function () {
        return PersonaEngine.opinions.onPrivacy;
      },
    },
    {
      pattern: /what\s+do\s+you\s+think\s+(about|of)\s+(nairobi|kenya|east\s+africa|africa)/i,
      topic: 'onNairobi',
      response: function () {
        return PersonaEngine.opinions.onNairobi;
      },
    },
  ];

  // ═══════════════════════════════════════════════════════════════
  // SECTION 5: MAIN HOOK
  // ═══════════════════════════════════════════════════════════════

  function init() {
    console.log('Mort-E Enhancement Module 9: Advanced Memory + Persona Depth — Active');

    // Initialize user profile
    UserProfile.load();
    UserProfile.recordVisit();

    var currentQuery = window.MortEBrains.query;
    var internals = window.MortEBrainsInternals;

    // Override getWelcome to include session continuity
    var originalGetWelcome = window.MortEBrains.getWelcome;
    window.MortEBrains.getWelcome = function () {
      // First check if the original has a welcome
      var existing = originalGetWelcome ? originalGetWelcome() : null;

      // Check for session continuity
      var returnContext = UserProfile.getReturnContext();
      if (returnContext) {
        return {
          text: returnContext,
          buttons: [
            { label: 'Continue', value: UserProfile.getProfile().lastTopics[0] || 'What products do you have' },
            { label: 'Start Fresh', value: 'What can you help me with' },
          ],
        };
      }

      return existing;
    };

    window.MortEBrains.query = function (rawInput) {
      // 1. Check for opinion triggers
      for (var i = 0; i < OPINION_TRIGGERS.length; i++) {
        var trigger = OPINION_TRIGGERS[i];
        if (trigger.pattern.test(rawInput)) {
          currentQuery(rawInput); // Update state
          var opinionResponse = trigger.response();
          return {
            text: opinionResponse,
            buttons: [
              { label: 'Products', value: 'What products do you have' },
              { label: 'About Studio', value: 'Tell me about MortApps Studios' },
              { label: 'Founder', value: 'Tell me about Mort Ian K.' },
            ],
          };
        }
      }

      // 2. Run standard pipeline
      var result = currentQuery(rawInput);

      // 3. Record user data
      UserProfile.detectIndustry(rawInput);
      var profile = UserProfile.getProfile();
      profile.totalMessages++;
      UserProfile.save();

      var state = internals && internals.state;
      if (state) {
        if (state.lastEntityId) {
          UserProfile.recordProduct(state.lastEntityId);
          UserProfile.recordInterest(state.lastEntityId);
        }
        if (state.lastIntentId) {
          UserProfile.recordInterest(state.lastIntentId);
        }
      }

      // 4. Detect conversation mode and apply strategy
      var mode = ThemeTracker.detectMode(state);
      var strategy = ThemeTracker.getStrategy(mode);

      // Store mode for other modules
      if (internals && internals.state) {
        internals.state._conversationMode = mode;
        internals.state._userProfile = profile;
      }

      // 5. Inject persona depth (occasionally)
      var personaOpener = PersonaEngine.getPersonaOpener(mode);
      if (personaOpener && result.text.length > 40) {
        result.text = personaOpener + ' ' + result.text;
      }

      // 6. Strategy-based button adjustments
      if (strategy.shouldCompare && mode === 'shopping') {
        // Add a comparison button if the user is shopping
        var hasComparisonBtn = result.buttons && result.buttons.some(function (b) {
          return /compare|vs|versus|difference/i.test(b.label);
        });
        if (!hasComparisonBtn && result.buttons && result.buttons.length < 4) {
          result.buttons.push({ label: 'Compare Products', value: 'How does your product compare to others' });
        }
      }

      if (strategy.shouldDeepDive && mode === 'researching') {
        // Add deep-dive button if the user is researching
        var hasDeepBtn = result.buttons && result.buttons.some(function (b) {
          return /deeper|technical|detail/i.test(b.label);
        });
        if (!hasDeepBtn && result.buttons && result.buttons.length < 4) {
          result.buttons.push({ label: 'Go Deeper', value: 'Tell me the technical details' });
        }
      }

      return result;
    };

    // Expose for other modules
    window.MortEEnhancements = window.MortEEnhancements || {};
    window.MortEEnhancements.UserProfile = UserProfile;
    window.MortEEnhancements.ThemeTracker = ThemeTracker;
    window.MortEEnhancements.PersonaEngine = PersonaEngine;
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { waitForBridge(0); });
  } else {
    waitForBridge(0);
  }

  // ── PUBLIC API ──────────────────────────────────────────────────
  window.MortEBrainsModule9 = {
    UserProfile: UserProfile,
    ThemeTracker: ThemeTracker,
    PersonaEngine: PersonaEngine,
  };

})();
