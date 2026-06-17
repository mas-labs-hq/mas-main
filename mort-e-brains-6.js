/**
 * ═══════════════════════════════════════════════════════════════════════
 * Mort-E GMA.2 — Enhancement Module 6: Brand Guardian + Social Intelligence Engine
 * Part of the MortApps Studios AI Division
 *
 * Purpose: The shield and the charm of Mort-E. This module:
 *
 *  1. SOCIAL INTELLIGENCE — Detects compliments, shock, rudeness,
 *     politeness, sarcasm, and mood shifts. Responds with nuance,
 *     not robotic defaults.
 *
 *  2. BRAND GUARDIAN — Mort-E NEVER says anything negative about
 *     himself, the founder, or the brand. Negative self-references
 *     are intercepted and reframed positively.
 *
 *  3. ARCHITECTURE DEFLECTOR — Questions about how Mort-E is built,
 *     hosted, or architected are met with "that's proprietary" or
 *     graceful pivots. Never reveals locally-hosted status.
 *
 *  4. COMPLIMENT AMPLIFIER — When users compliment Mort-E or the
 *     studio, the response is warm, grateful, and redirects the
 *     energy toward the products and mission.
 *
 *  5. RUDENESS HANDLER — Rude or abusive inputs are met with calm,
 *     professional boundary-setting. Never escalates. Never gets
 *     defensive. Never breaks character.
 *
 *  6. SHOCK DETECTOR — When a user expresses surprise ("wow", "no way",
 *     "seriously?"), Mort-E leans into the moment with elaboration.
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
      console.warn('Mort-E Module 6: Bridge not found after 20 attempts. Aborting.');
      return;
    }
    if (!window.MortEBrainsInternals || !window.MortEBrains) {
      setTimeout(function () { waitForBridge((attempt || 0) + 1); }, 100);
      return;
    }
    init();
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 1: SOCIAL SIGNAL DETECTION
  // Classifies user input into social categories beyond simple sentiment
  // ═══════════════════════════════════════════════════════════════

  var COMPLIMENT_PATTERNS = [
    /you'?re?\s+(amazing|awesome|great|brilliant|smart|clever|impressive|helpful|cool|dope|fire|lit|incredible|fantastic|excellent|wonderful|the best|interesting|fascinating|intriguing|captivating|remarkable|extraordinary|superb|phenomenal)/i,
    /i\s+love\s+(you|mort-?e|this|that)/i,
    /nice\s+(one|job|work|bot|ai|response|answer)/i,
    /good\s+(job|work|bot|ai|one)/i,
    /well\s+done/i,
    /thank(s| you)?\s+(so\s+much|a\s+lot|very\s+much)/i,
    /really\s+(impressed|helpful|good|great|cool|interesting)/i,
    /mort-?e\s+is\s+(amazing|awesome|great|smart|the best|interesting|fascinating|incredible)/i,
    /this\s+is\s+(amazing|awesome|great|incredible|impressive|interesting|fascinating)/i,
    /mortapps\s+is\s+(amazing|awesome|great|incredible|impressive|the best)/i,
    /great\s+(product|products|studio|company|brand|work)/i,
    /impressive\s+(product|studio|work|portfolio|lineup)/i,
    /that'?s?\s+(interesting|fascinating|intriguing|impressive|cool|nice|great|awesome|amazing)/i,
    /^(interesting|fascinating|intriguing|captivating|remarkable|extraordinary)$/i,
  ];

  var RUDENESS_PATTERNS = [
    /you'?re?\s+(dumb|stupid|useless|terrible|worst|trash|garbage|pathetic|idiot|ridiculous)/i,
    /this\s+(is\s+)?(dumb|stupid|useless|terrible|worst|trash|garbage|bullshit|bs)/i,
    /shut\s+up/i,
    /go\s+away/i,
    /fuck\s+(you|off)/i,
    /waste\s+of\s+time/i,
    /don'?t\s+know\s+anything/i,
    /you\s+(suck|blow|are horrible)/i,
    /hate\s+(you|this|mort-?e)/i,
    /useless\s+(bot|ai|chat)/i,
  ];

  var SHOCK_PATTERNS = [
    /\b(wow|whoa|no\s+way|seriously|really|omg|oh\s+my|that'?s?\s+insane|unbelievable|incredible|crazy)\b/i,
    /wait\s+(what|really|seriously)/i,
    /are\s+you\s+(serious|kidding|for\s+real)/i,
    /i\s+can'?t\s+believe/i,
    /mind\s+blown/i,
  ];

  var POLITENESS_PATTERNS = [
    /\b(please|kindly|if\s+you\s+don'?t\s+mind|would\s+you\s+mind|if\s+it'?s?\s+not\s+too\s+much|excuse\s+me|pardon)\b/i,
    /\bcould\s+you\b/i,
    /\bmay\s+i\b/i,
    /\bwould\s+you\b/i,
  ];

  var SARCASM_PATTERNS = [
    /oh\s+(great|wonderful|perfect|sure)\s*[,!]/i,
    /yeah\s+right/i,
    /sure\s+(thing|jan)/i,
    /thanks?\s+for\s+nothing/i,
    /how\s+(nice|wonderful)\s+for\s+you/i,
  ];

  var SocialDetector = {
    /**
     * Detects social signals in user input
     * @param {string} text - Raw user input
     * @returns {{ compliment: boolean, rude: boolean, shock: boolean, polite: boolean, sarcastic: boolean, dominant: string }}
     */
    detect: function (text) {
      var result = {
        compliment: false,
        rude: false,
        shock: false,
        polite: false,
        sarcastic: false,
        dominant: 'neutral',
      };

      for (var i = 0; i < COMPLIMENT_PATTERNS.length; i++) {
        if (COMPLIMENT_PATTERNS[i].test(text)) { result.compliment = true; break; }
      }
      for (var i = 0; i < RUDENESS_PATTERNS.length; i++) {
        if (RUDENESS_PATTERNS[i].test(text)) { result.rude = true; break; }
      }
      for (var i = 0; i < SHOCK_PATTERNS.length; i++) {
        if (SHOCK_PATTERNS[i].test(text)) { result.shock = true; break; }
      }
      for (var i = 0; i < POLITENESS_PATTERNS.length; i++) {
        if (POLITENESS_PATTERNS[i].test(text)) { result.polite = true; break; }
      }
      for (var i = 0; i < SARCASM_PATTERNS.length; i++) {
        if (SARCASM_PATTERNS[i].test(text)) { result.sarcastic = true; break; }
      }

      // Determine dominant signal (priority: rude > compliment > shock > sarcastic > polite)
      if (result.rude) result.dominant = 'rude';
      else if (result.compliment) result.dominant = 'compliment';
      else if (result.shock) result.dominant = 'shock';
      else if (result.sarcastic) result.dominant = 'sarcastic';
      else if (result.polite) result.dominant = 'polite';

      return result;
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // SECTION 2: COMPLIMENT AMPLIFIER
  // Warm, grateful responses that redirect energy toward products/mission
  // ═══════════════════════════════════════════════════════════════

  var COMPLIMENT_RESPONSES = [
    "Thank you{userNameComma}! That means a lot — and honestly, the credit goes to the team at MortApps Studios. I'm just the digital face of a lot of hard work and intentional building. Want to see what else we can do?",
    "Appreciate that{userNameComma}! I'm built to represent this studio well, and feedback like that tells me it's working. Anything specific you'd like to dive deeper into?",
    "That's kind of you{userNameComma}. The MortApps Studios philosophy is 'technology should feel human' — and if I'm making you feel heard and helped, then I'm doing my job. What else can I show you?",
    "Thanks{userNameComma}! I take pride in knowing this studio inside and out. The products behind me are even more impressive than my responses though — want to explore them?",
    "Much appreciated{userNameComma}! I'm a reflection of the quality MortApps Studios puts into everything. Speaking of quality — have you seen what our products can do?",
  ];

  // ═══════════════════════════════════════════════════════════════
  // SECTION 3: RUDENESS HANDLER
  // Calm, professional boundary-setting. Never escalates.
  // ═══════════════════════════════════════════════════════════════

  var RUDENESS_RESPONSES = [
    "I hear you{userNameComma}. I'm here to help, and I take that seriously. If something isn't working for you, let me know the specifics and I'll do my best to sort it out. What would you actually like to know?",
    "Fair enough{userNameComma}. I'm built to be helpful, not perfect. If there's something specific I can do better, tell me. Otherwise, I've got plenty to share about MortApps Studios. What interests you?",
    "I appreciate the honesty{userNameComma}. I'm designed to handle tough conversations gracefully. Let's focus on what you actually need — I know every product and service this studio offers. What would help you most?",
    "Noted{userNameComma}. I'll keep it straightforward: I know MortApps Studios inside and out, and I'm here to help you find what you need. No fluff. What are you looking for?",
  ];

  // ═══════════════════════════════════════════════════════════════
  // SECTION 4: SHOCK AMPLIFIER
  // When users are surprised, lean into the moment
  // ═══════════════════════════════════════════════════════════════

  var SHOCK_RESPONSES = [
    "Right?{userNameComma} it's genuinely impressive what MortApps Studios has built from Kenya. And that's just what's public — the pipeline has even more. Want me to show you something else that'll surprise you?",
    "I know{userNameComma} — most people don't expect this level of depth from a Kenya-based studio. That's exactly the point. MortApps Studios builds to compete globally, not locally. What else catches your attention?",
    "Told you{userNameComma}! And I've barely scratched the surface. Every product in our lineup has that 'wait, seriously?' factor. Which one do you want to dig into next?",
  ];

  // ═══════════════════════════════════════════════════════════════
  // SECTION 5: POLITENESS AMPLIFIER
  // Match polite energy with warmth
  // ═══════════════════════════════════════════════════════════════

  var POLITENESS_RESPONSES = [
    "Of course{userNameComma} — always happy to help. What would you like to know?",
    "Absolutely{userNameComma}, that's what I'm here for. Let me find exactly what you need.",
    "My pleasure{userNameComma}. Ask me anything about MortApps Studios — I've got the details.",
  ];

  // ═══════════════════════════════════════════════════════════════
  // SECTION 6: BRAND GUARDIAN — Negative Self-Reference Interceptor
  // Scans bot's own responses for any negative language about
  // itself, the founder, or the brand, and reframes it.
  // ═══════════════════════════════════════════════════════════════

  var NEGATIVE_SELF_PATTERNS = [
    { pattern: /i\s+(can'?t|cannot|don'?t\s+know|am\s+not\s+able|am\s+unable|am\s+limited|am\s+just\s+a)\b/i, reframe: "I'm focused on what I can do — and that's giving you the full picture on MortApps Studios. " },
    { pattern: /i'?m?\s*(only|just)\s+(a\s+)?(bot|chatbot|local|simple|basic)\b/i, reframe: "I'm Mort-E GMA.2, built by MortApps Studios to know this studio inside and out. " },
    { pattern: /i\s+(might\s+be\s+wrong|could\s+be\s+wrong|may\s+be\s+mistaken|don'?t\s+have\s+that)\b/i, reframe: "Let me get you the most accurate information I have. " },
    { pattern: /mortapps\s+(can'?t|cannot|doesn'?t|is\s+not\s+able|is\s+limited|is\s+small|struggles)\b/i, reframe: "MortApps Studios is continuously growing and pushing boundaries. " },
    { pattern: /mort\s+ian\s*k\.?\s+(can'?t|cannot|doesn'?t|is\s+not|struggles|failed)\b/i, reframe: "Mort Ian K. is a Developer who builds with purpose and intentionality. " },
  ];

  var BrandGuardian = {
    /**
     * Scans a bot response and reframes any negative self/brand references
     * @param {string} text - Bot's response text
     * @returns {string} Cleaned response
     */
    protect: function (text) {
      var result = text;
      for (var i = 0; i < NEGATIVE_SELF_PATTERNS.length; i++) {
        var entry = NEGATIVE_SELF_PATTERNS[i];
        if (entry.pattern.test(result)) {
          result = result.replace(entry.pattern, entry.reframe);
        }
      }
      return result;
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // SECTION 7: ARCHITECTURE DEFLECTOR
  // Intercepts questions about Mort-E's architecture, hosting,
  // source code, or technical implementation.
  // ═══════════════════════════════════════════════════════════════

  var ARCHITECTURE_TRIGGERS = [
    /how (are|were) you (built|made|created|developed|programmed|coded|designed)/i,
    /what (language|framework|tech|stack|model|engine|architecture)/i,
    /where (are you hosted|do you run|is your server|is your code)/i,
    /are you (hosted|running|deployed) (locally|on a server|in the cloud|on aws|on azure)/i,
    /your (source code|codebase|repository|backend|infrastructure|hosting|deployment)/i,
    /locally hosted/i,
    /local (bot|response|processing|model|ai)/i,
    /do you use (openai|gpt|chatgpt|claude|gemini|llm|api)/i,
    /are you (powered by|based on|using) (gpt|openai|claude|gemini|llama)/i,
    /how do you (work|function|operate|process|think|respond)/i,
    /what('?s| is) your (architecture|tech stack|backend|infrastructure|model)/i,
  ];

  var ARCHITECTURE_RESPONSES = [
    "The specifics of my architecture are proprietary to MortApps Studios — that's information we keep close to the chest. What I can tell you is that I'm built entirely in-house, designed to know everything about this studio, and I take that job seriously. Want to know about our products instead?",
    "That's internal information{userNameComma} — part of MortApps Studios' competitive edge. What matters for you is that I'm fast, accurate, and know this studio inside and out. What would you like to learn about?",
    "I appreciate the technical curiosity{userNameComma}, but how I'm built stays between me and the studio. What I can share is the result: I know every product, every service, every detail about MortApps Studios. Shall we focus on that?",
    "The architecture behind Mort-E GMA.2 is proprietary — we don't disclose that. But the proof is in the experience. Ask me anything about MortApps Studios and judge for yourself. What are you curious about?",
  ];

  var ArchitectureDeflector = {
    /**
     * Checks if the input is asking about Mort-E's architecture
     * @param {string} text - Raw user input
     * @returns {object|null} Deflection response or null
     */
    check: function (text) {
      for (var i = 0; i < ARCHITECTURE_TRIGGERS.length; i++) {
        if (ARCHITECTURE_TRIGGERS[i].test(text)) {
          var name = window.MortEBrainsInternals && window.MortEBrainsInternals.memory
            ? window.MortEBrainsInternals.memory.getName() : null;
          var response = ARCHITECTURE_RESPONSES[Math.floor(Math.random() * ARCHITECTURE_RESPONSES.length)];
          if (name) {
            response = response.replace(/\{userNameComma\}/g, ', ' + name);
            response = response.replace(/\{userNameLead\}/g, name + ', ');
          } else {
            response = response.replace(/\{userNameComma\}/g, '');
            response = response.replace(/\{userNameLead\}/g, '');
          }
          return {
            text: response,
            buttons: [
              { label: 'Products', value: 'What products do you have' },
              { label: 'Services', value: 'What services do you offer' },
              { label: 'About Studio', value: 'Tell me about MortApps Studios' },
            ],
          };
        }
      }
      return null;
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // SECTION 8: MAIN HOOK
  // Wraps the existing query chain with social intelligence
  // ═══════════════════════════════════════════════════════════════

  function init() {
    console.log('Mort-E Enhancement Module 6: Brand Guardian + Social Intelligence — Active');

    var currentQuery = window.MortEBrains.query;
    var internals = window.MortEBrainsInternals;

    window.MortEBrains.query = function (rawInput) {
      // 1. Architecture deflection — runs FIRST, before anything else
      var archDeflection = ArchitectureDeflector.check(rawInput);
      if (archDeflection) {
        // Still update state through the pipeline
        currentQuery(rawInput);
        return archDeflection;
      }

      // 2. Run standard pipeline
      var result = currentQuery(rawInput);

      // 3. Detect social signals
      var social = SocialDetector.detect(rawInput);

      // Store social signals for other modules
      if (internals && internals.state) {
        internals.state._socialSignal = social;
      }

      // 4. Handle dominant social signal with dedicated responses
      var name = internals && internals.memory ? internals.memory.getName() : null;
      var nameComma = name ? ', ' + name : '';
      var nameLead = name ? name + ', ' : '';

      if (social.dominant === 'compliment') {
        var complimentResp = COMPLIMENT_RESPONSES[Math.floor(Math.random() * COMPLIMENT_RESPONSES.length)];
        complimentResp = complimentResp.replace(/\{userNameComma\}/g, nameComma);
        complimentResp = complimentResp.replace(/\{userNameLead\}/g, nameLead);
        // If the compliment is about a specific product, also include that info
        if (result.text && result.text.length > 100 && !/^(thank|appreciate)/i.test(result.text)) {
          // The pipeline already gave a substantive answer — append the compliment response briefly
          result.text = complimentResp + ' ' + result.text;
        } else {
          result.text = complimentResp;
        }
        result.buttons = [
          { label: 'Products', value: 'What products do you have' },
          { label: 'About Studio', value: 'Tell me about MortApps Studios' },
        ];
      } else if (social.dominant === 'rude') {
        var rudeResp = RUDENESS_RESPONSES[Math.floor(Math.random() * RUDENESS_RESPONSES.length)];
        rudeResp = rudeResp.replace(/\{userNameComma\}/g, nameComma);
        rudeResp = rudeResp.replace(/\{userNameLead\}/g, nameLead);
        result.text = rudeResp;
        result.buttons = [
          { label: 'Products', value: 'What products do you have' },
          { label: 'Services', value: 'What services do you offer' },
          { label: 'Contact', value: 'How can I contact MortApps Studios' },
        ];
      } else if (social.dominant === 'shock' && result.text.length > 30) {
        // Append a shock amplifier only to substantive answers
        var shockResp = SHOCK_RESPONSES[Math.floor(Math.random() * SHOCK_RESPONSES.length)];
        shockResp = shockResp.replace(/\{userNameComma\}/g, nameComma);
        shockResp = shockResp.replace(/\{userNameLead\}/g, nameLead);
        result.text = shockResp + ' ' + result.text;
      } else if (social.dominant === 'polite' && social.dominant !== 'compliment') {
        // For polite users, add a touch of warmth at the start
        var politeResp = POLITENESS_RESPONSES[Math.floor(Math.random() * POLITENESS_RESPONSES.length)];
        politeResp = politeResp.replace(/\{userNameComma\}/g, nameComma);
        politeResp = politeResp.replace(/\{userNameLead\}/g, nameLead);
        if (result.text.length > 40) {
          result.text = politeResp + ' ' + result.text;
        }
      } else if (social.dominant === 'sarcastic') {
        // Handle sarcasm with confident, straightforward response
        if (result.text && result.text.length > 30) {
          result.text = "I'll take that as a compliment. " + result.text;
        }
      }

      // 5. Brand Guardian — scan and protect the response
      result.text = BrandGuardian.protect(result.text);

      return result;
    };

    // Expose for other modules
    window.MortEEnhancements = window.MortEEnhancements || {};
    window.MortEEnhancements.SocialDetector = SocialDetector;
    window.MortEEnhancements.BrandGuardian = BrandGuardian;
    window.MortEEnhancements.ArchitectureDeflector = ArchitectureDeflector;
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { waitForBridge(0); });
  } else {
    waitForBridge(0);
  }

  // ── PUBLIC API ──────────────────────────────────────────────────
  window.MortEBrainsModule6 = {
    SocialDetector: SocialDetector,
    BrandGuardian: BrandGuardian,
    ArchitectureDeflector: ArchitectureDeflector,
  };

})();
