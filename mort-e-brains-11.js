/**
 * ═══════════════════════════════════════════════════════════════════════
 * Mort-E GMA.2 — Enhancement Module 11: The GOD of LocalBots Engine
 * Part of the MortApps Studios AI Division
 *
 * Purpose: Makes Mort-E the undisputed king of local chatbots.
 *          This module fixes critical context, routing, and matching gaps:
 *
 *  1. CONTEXT MEMORY — Tracks the last external knowledge topic so
 *     "Tell me more about X" actually works instead of losing context.
 *
 *  2. BROADENED KNOWLEDGE ROUTING — Catches "how is X", "tell me more
 *     about X", "what about X", and many more patterns that previously
 *     fell through to fallback. Routes to Wikipedia/Dictionary when
 *     the KB doesn't have the answer.
 *
 *  3. TOPIC GUARD — Filters out celebrity gossip, unrelated non-tech
 *     topics while allowing tech, business, science, geography, and
 *     general knowledge through.
 *
 *  4. ENHANCED COMPLIMENT ENGINE — Detects "interesting", "you are
 *     interesting", "fascinating", "incredible", and many more
 *     compliment patterns that were previously missed.
 *
 *  5. CONTACT INTELLIGENCE — Handles "I will contact the founder",
 *     "I want to reach out", and similar contact-intent phrases
 *     without getting confused.
 *
 *  6. LINKAGE MEDIA HUB CONTACTS — Provides full contact details
 *     including WhatsApp: +254 105 399526.
 *
 *  7. KENYA-BASED POSITIONING — Ensures Mort-E says "Kenya-based"
 *     (not Nairobi-based), and only mentions "hybrid, we come to you"
 *     when explicitly asked about physical location.
 *
 *  8. SMART FALLBACK ROUTER — When the main KB can't answer, tries
 *     Wikipedia before giving a generic fallback. Makes Mort-E feel
 *     genuinely intelligent.
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
      console.warn('Mort-E Module 11: Bridge not found after 20 attempts. Aborting.');
      return;
    }
    if (!window.MortEBrainsInternals || !window.MortEBrains) {
      setTimeout(function () { waitForBridge((attempt || 0) + 1); }, 100);
      return;
    }
    init();
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 1: EXTERNAL KNOWLEDGE CONTEXT TRACKER
  // Remembers the last topic fetched from Wikipedia/Dictionary so
  // "Tell me more about X" actually works
  // ═══════════════════════════════════════════════════════════════

  var LastExternalTopic = {
    topic: null,
    source: null,       // 'wikipedia' or 'dictionary'
    timestamp: 0,
    summary: null,      // Store the last summary for reference

    set: function (topic, source, summary) {
      this.topic = topic;
      this.source = source || 'wikipedia';
      this.timestamp = Date.now();
      this.summary = summary || null;
    },

    get: function () {
      // Expire after 5 minutes of inactivity
      if (Date.now() - this.timestamp > 300000) {
        this.topic = null;
        this.source = null;
        this.summary = null;
      }
      return this.topic;
    },

    clear: function () {
      this.topic = null;
      this.source = null;
      this.summary = null;
      this.timestamp = 0;
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // SECTION 2: BROADENED KNOWLEDGE TRIGGERS
  // Catches many more patterns that should route to external APIs
  // ═══════════════════════════════════════════════════════════════

  var BROAD_WIKI_TRIGGERS = [
    // "How is X" / "How does X work" / "How is the X market"
    /^how\s+(is|are|was|does|do|has|have|will|can|could|should|would)\s+(?!(mort|mortapps|bioattex|phein|elthira|brizerm|taskflow|agrixen|opticore|mort-e|morte|linkage|you|your|this|that|it$))/i,
    // "Tell me more about X"
    /^tell\s+me\s+(more\s+)?about\s+(?!(mort|mortapps|bioattex|phein|elthira|brizerm|taskflow|agrixen|opticore|mort-e|morte|linkage|yourself|you$|this|that|it$))/i,
    // "What about X"
    /^what\s+about\s+(?!(mort|mortapps|bioattex|phein|elthira|brizerm|taskflow|agrixen|opticore|mort-e|morte|linkage|you$|this|that|it$))/i,
    // "More about X" / "More on X"
    /^(more\s+(about|on|details\s+(about|on)))\s+/i,
    // "Explain X" / "Describe X" (general, not MortApps)
    /^(explain|describe)\s+(?!(mort|mortapps|bioattex|phein|elthira|brizerm|taskflow|agrixen|opticore|mort-e|morte|linkage|how|what|why|your|this|that))/i,
    // "Who is X" / "Who was X"
    /^who\s+(is|are|was|were)\s+(?!(mort|mortapps|bioattex|phein|elthira|brizerm|taskflow|agrixen|opticore|mort-e|morte|linkage|yourself|you$|this|that|it$))/i,
    // "What is X" / "What are X"
    /^what\s+(is|are|was)\s+(?!(mort|mortapps|bioattex|phein|elthira|brizerm|taskflow|agrixen|opticore|mort-e|morte|linkage|yourself|your|my|this|that|these|those|it$|the\s+price|the\s+cost|the\s+best|going\s+on))/i,
    // "Can you tell me about X"
    /^can\s+you\s+tell\s+me\s+(about|more\s+about)\s+/i,
    // "I want to know about X" / "I'd like to know about X"
    /i\s+(want|would|d)\s+(like\s+)?to\s+know\s+(about|more\s+about)\s+/i,
    // "Info on X" / "Information about X"
    /^(info|information)\s+(on|about)\s+/i,
    // "Anything about X"
    /anything\s+(about|on)\s+/i,
  ];

  // "Tell me more" / "More" / "Continue" when last topic was external
  var FOLLOW_UP_TRIGGERS = [
    /^(tell\s+me\s+more|more|continue|go\s+on|keep\s+going|elaborate|expand|dive\s+deeper|deeper|further|details|more\s+details|more\s+info|more\s+information)$/i,
  ];

  // ═══════════════════════════════════════════════════════════════
  // SECTION 3: TOPIC GUARD — Block inappropriate topics
  // ═══════════════════════════════════════════════════════════════

  var BLOCKED_TOPICS = [
    /celebrity|gossip|tabloid|kim\s+kardashian|taylor\s+swift|selena|justin\s+bieber|tiktok\s+star|influencer\s+drama/i,
    /horoscope|zodiac|astrology|psychic|fortune/i,
    /dating\s+advice|relationship\s+advice|pick\s+up\s+line/i,
    /betting\s+tip|gambling\s+tip|lottery|sportybet|betika|1xbet/i,
    /hack\s+(some|into|account|email|phone|facebook|instagram|whatsapp)/i,
    /illegal|drugs|weapon|kill|murder|suicide/i,
  ];

  var ALLOWED_TOPICS = [
    /tech|technology|software|ai|artificial\s+intelligence|programming|code|developer/i,
    /business|startup|entrepreneur|market|economy|finance|investment|stock|trading/i,
    /science|physics|chemistry|biology|medicine|health|engineering/i,
    /kenya|africa|nairobi|east\s+africa|nigeria|ghana|south\s+africa/i,
    /politic|president|government|ministry|parliament|election|policy/i,
    /education|university|school|academic|research/i,
    /agriculture|farm|crop|livestock/i,
    /history|culture|art|music|literature|philosophy/i,
    /mathematic|calculate|equation|formula/i,
    /geography|country|continent|city|capital|population/i,
    /sport|football|soccer|rugby|athletics|olympic/i,
    /environment|climate|weather|sustainability/i,
    /law|legal|rights|constitution|regulation/i,
    /internet|web|digital|cyber|data|privacy|security/i,
    /company|corporation|brand|organization|institution/i,
    /biography|who\s+is|who\s+was|person|leader|scientist|inventor/i,
  ];

  var TopicGuard = {
    /**
     * Checks if a topic is appropriate for external lookup
     * @param {string} topic - The topic to check
     * @returns {{ allowed: boolean, reason: string|null }}
     */
    check: function (topic) {
      // Check blocked topics first
      for (var i = 0; i < BLOCKED_TOPICS.length; i++) {
        if (BLOCKED_TOPICS[i].test(topic)) {
          return { allowed: false, reason: 'blocked' };
        }
      }

      // If it matches an allowed topic, let it through
      for (var j = 0; j < ALLOWED_TOPICS.length; j++) {
        if (ALLOWED_TOPICS[j].test(topic)) {
          return { allowed: true, reason: null };
        }
      }

      // For short topics (names like "William Ruto", "Elon Musk"), allow them
      // — Wikipedia will decide if they exist
      var words = topic.trim().split(/\s+/);
      if (words.length >= 2 && words.length <= 5 && topic.length < 60) {
        return { allowed: true, reason: null };
      }

      // Single word that's not too short — likely a concept/term, allow it
      if (words.length === 1 && topic.length >= 3 && topic.length <= 30) {
        return { allowed: true, reason: null };
      }

      // Default: allow but with caution
      return { allowed: true, reason: null };
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // SECTION 4: ENHANCED COMPLIMENT DETECTION
  // Catches "interesting", "you are interesting", "fascinating", etc.
  // ═══════════════════════════════════════════════════════════════

  var EXTRA_COMPLIMENT_WORDS = new Set([
    'interesting', 'fascinating', 'intriguing', 'captivating',
    'remarkable', 'extraordinary', 'outstanding', 'superb',
    'phenomenal', 'marvelous', 'exceptional', 'splendid',
    'rad', 'stellar', 'top-notch', 'first-class',
    'badman', 'crisp', 'clean', 'sharp', 'solid',
    'hype', 'vibes', 'w', 'mwah', 'chef\'s kiss',
  ]);

  var EXTRA_COMPLIMENT_PATTERNS = [
    /^(you'?re?\s+|you\s+are\s+)?(interesting|fascinating|intriguing|captivating|remarkable|extraordinary|outstanding|superb|phenomenal)\b/i,
    /^that'?s?\s+(interesting|fascinating|intriguing|captivating|remarkable|extraordinary|impressive|cool|nice|great|awesome|amazing)\b/i,
    /^this\s+is\s+(interesting|fascinating|intriguing|captivating|remarkable|extraordinary|impressive|cool|nice|great|awesome|amazing)\b/i,
    /^(really|very|so|quite|pretty)\s+(interesting|cool|nice|great|impressive|helpful|smart|good)\b/i,
    /^i\s+(like|enjoy|appreciate|admire|respect)\s+(this|that|you|your|it|mort)/i,
    /^(not\s+)?bad(\s+(at\s+all|atall))?$/i,
    /^(nice|cool|sweet|dope|fire|lit|sick|epic|based|legend|goat|king|queen|boss)$/i,
    /^you\s+(rock|rule|slay|killed\s+it|nailed\s+it|crushed\s+it|crush\s+it|are\s+the\s+(best|goat|king|queen|boss))/i,
    /^keep\s+it\s+up/i,
    /^good\s+(stuff|work|job|vibes|looking)/i,
    /^well\s+(played|said|done|executed)/i,
    /^(respect|salute|props|kudos|cheers|bravo)/i,
  ];

  var EnhancedComplimentDetector = {
    /**
     * Checks if input is a compliment that earlier modules missed
     * @param {string} text - Raw user input
     * @returns {boolean}
     */
    isCompliment: function (text) {
      var cleaned = text.toLowerCase().trim().replace(/[!.?,;:'"]/g, '').replace(/\s+/g, ' ');

      // Check extra compliment words
      if (EXTRA_COMPLIMENT_WORDS.has(cleaned)) return true;

      // Check single-word
      var singleWord = cleaned.match(/^(\w+)$/);
      if (singleWord && EXTRA_COMPLIMENT_WORDS.has(singleWord[1])) return true;

      // Check patterns
      for (var i = 0; i < EXTRA_COMPLIMENT_PATTERNS.length; i++) {
        if (EXTRA_COMPLIMENT_PATTERNS[i].test(text)) return true;
      }

      return false;
    }
  };

  var COMPLIMENT_RESPONSES_V2 = [
    "Appreciate that{userNameComma}! That kind of feedback keeps Mort-E sharp. I'm built to represent MortApps Studios well, and it sounds like it's working. Anything else you'd like to explore?",
    "Thank you{userNameComma}! I take pride in knowing this studio inside and out. The team at MortApps Studios put real effort into making me useful. Want to dive deeper into anything?",
    "That means a lot{userNameComma}! The MortApps philosophy is 'technology should feel human' — and if I'm making you feel heard and helped, I'm doing my job right. What else can I show you?",
    "Much appreciated{userNameComma}! Compliments like that tell me the knowledge base is doing exactly what it should. The products behind me are even more impressive though — want to explore them?",
    "Thanks{userNameComma}! I'm a reflection of the quality MortApps Studios puts into everything. Speaking of quality — have you seen what our products can do?",
    "You're making my circuits warm{userNameComma}! But seriously, the real stars are the products and the team behind them. Want me to walk you through any of them?",
  ];

  // ═══════════════════════════════════════════════════════════════
  // SECTION 5: CONTACT INTELLIGENCE
  // Handles "I will contact the founder", "I want to reach out", etc.
  // ═══════════════════════════════════════════════════════════════

  var CONTACT_INTENT_PATTERNS = [
    /i\s+(will|want\s+to|would\s+like\s+to|plan\s+to|going\s+to|need\s+to|have\s+to)\s+(contact|reach|call|email|speak\s+to|talk\s+to|get\s+in\s+touch\s+with|reach\s+out\s+to|message|connect\s+with)\b/i,
    /i'?ll\s+(contact|reach|call|email|speak\s+to|talk\s+to|message|connect\s+with)\b/i,
    /let\s+me\s+(contact|reach|call|email|speak\s+to|talk\s+to|message)\b/i,
    /how\s+(do|can)\s+i\s+(contact|reach|call|email|speak|talk|get\s+in\s+touch)\b/i,
    /i\s+want\s+to\s+(know|find\s+out)\s+how\s+to\s+(contact|reach|call|email)\b/i,
  ];

  var FOUNDER_CONTACT_PATTERNS = [
    /(contact|reach|speak|talk|email|call|message).*(founder|mort\s+ian|ceo|owner|boss)/i,
    /(founder|mort\s+ian|ceo|owner).*(contact|reach|speak|talk|email|call|message)/i,
  ];

  var LINKAGE_MEDIA_HUB_PATTERNS = [
    /linkage\s+media\s+hub/i,
    /linkage/i,
    /lmh/i,
    /media\s+hub/i,
    /influencer\s+agency/i,
    /marketing\s+agency/i,
  ];

  var LinkageMediaHubInfo = {
    email: 'mort@linkagemediahub.co.ke',
    whatsapp: '+254 105 399526',
    whatsappLink: 'https://wa.me/254105399526',
    website: 'https://www.linkagemediahub.co.ke',
    description: 'Linkage Media Hub is MortApps Studios\' sister brand — a premium digital marketing and influencer agency. They handle influencer coordination, campaign management, brand awareness campaigns, and digital visibility services.',
  };

  // ═══════════════════════════════════════════════════════════════
  // SECTION 6: KENYA-BASED POSITIONING ENFORCER
  // Scans and rewrites responses to say "Kenya" not "Nairobi"
  // and handles location questions properly
  // ═══════════════════════════════════════════════════════════════

  var LOCATION_QUESTION_PATTERNS = [
    /where\s+(are\s+you|is\s+your|is\s+mortapps|is\s+the\s+studio|is\s+the\s+office|are\s+you\s+located|are\s+you\s+based|do\s+you\s+work\s+from)/i,
    /physical\s+(location|address|office)/i,
    /your\s+(address|location|office)/i,
    /do\s+you\s+have\s+an?\s+(office|physical\s+location|headquarters|building)/i,
    /can\s+i\s+visit\s+(you|your\s+office|the\s+studio)/i,
    /where\s+can\s+i\s+find\s+you/i,
  ];

  var KenyaPositioning = {
    /**
     * Checks if the user is specifically asking about physical location
     * @param {string} text - Raw user input
     * @returns {boolean}
     */
    isLocationQuestion: function (text) {
      for (var i = 0; i < LOCATION_QUESTION_PATTERNS.length; i++) {
        if (LOCATION_QUESTION_PATTERNS[i].test(text)) return true;
      }
      return false;
    },

    /**
     * Rewrites "Nairobi-based" and "based in Nairobi" in responses
     * to "Kenya-based" and "based in Kenya"
     * @param {string} text - Response text
     * @returns {string} Cleaned response
     */
    enforce: function (text) {
      var result = text;
      // Replace "based in Nairobi, Kenya" → "based in Kenya"
      result = result.replace(/based\s+in\s+Nairobi,?\s*Kenya/gi, 'based in Kenya');
      // Replace "Nairobi-based" → "Kenya-based"
      result = result.replace(/Nairobi-based/gi, 'Kenya-based');
      // Replace "based in Nairobi" → "based in Kenya"
      result = result.replace(/based\s+in\s+Nairobi/gi, 'based in Kenya');
      // Replace "from Nairobi" → "from Kenya"
      result = result.replace(/from\s+Nairobi(?!\s+Securities)/gi, 'from Kenya');
      // Replace "in Nairobi" → "in Kenya" (but NOT "Nairobi Securities Exchange" or "in Nairobi in 2010")
      result = result.replace(/in\s+Nairobi(?!['\s,]*Securities|\s+in\s+\d)/gi, 'in Kenya');
      // Replace "Nairobi, Kenya" → "Kenya"
      result = result.replace(/Nairobi,?\s*Kenya/gi, 'Kenya');
      // Replace "Nairobi-born" → "Kenya-born"
      result = result.replace(/Nairobi-born/gi, 'Kenya-born');
      // Replace "headquartered in Nairobi" → "headquartered in Kenya"
      result = result.replace(/headquartered\s+in\s+Nairobi/gi, 'headquartered in Kenya');
      // Replace "outside Nairobi" → "outside Kenya's major cities"
      result = result.replace(/outside\s+Nairobi/gi, "outside Kenya's major cities");
      return result;
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // SECTION 7: WIKIPEDIA CLIENT (Enhanced with "more info" support)
  // ═══════════════════════════════════════════════════════════════

  var WikiClient = {
    /**
     * Fetches a Wikipedia summary for a topic
     * @param {string} topic
     * @returns {Promise<object|null>} Response object or null
     */
    fetchSummary: function (topic) {
      return fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(topic))
        .then(function (res) {
          if (!res.ok) return null;
          return res.json();
        })
        .then(function (data) {
          if (!data || data.type === 'disambiguation') {
            // Try getting sections for disambiguation
            return null;
          }
          if (!data.extract) return null;
          var title = data.title || topic;
          var summary = data.extract;
          // Allow longer summaries for "tell me more" — up to 600 chars
          if (summary.length > 600) {
            summary = summary.substring(0, 597) + '...';
          }

          // Store for follow-up
          LastExternalTopic.set(topic, 'wikipedia', summary);

          return {
            text: '**' + title + '**: ' + summary + ' [Source: Wikipedia]',
            buttons: [
              { label: 'More on This', value: 'Tell me more about ' + topic },
              { label: 'Products', value: 'What products do you have' },
            ],
          };
        })
        .catch(function () { return null; });
    },

    /**
     * Fetches a longer extract for "tell me more" follow-ups
     * @param {string} topic
     * @returns {Promise<object|null>}
     */
    fetchMore: function (topic) {
      // Use MediaWiki API for a longer extract (summary API only returns the same short text)
      var apiUrl = 'https://en.wikipedia.org/w/api.php?action=query&titles=' +
        encodeURIComponent(topic) +
        '&prop=extracts&exintro=0&explaintext=1&exsectionformat=plain&format=json&origin=*';
      return fetch(apiUrl)
        .then(function (res) {
          if (!res.ok) return null;
          return res.json();
        })
        .then(function (data) {
          if (!data || !data.query || !data.query.pages) return null;
          var pages = data.query.pages;
          var pageId = Object.keys(pages)[0];
          var page = pages[pageId];
          if (!page || !page.extract || pageId === '-1') return null;

          var title = page.title || topic;
          var fullExtract = page.extract;

          // Get paragraphs beyond the first one (which was already shown in the summary)
          var paragraphs = fullExtract.split(/\n\n+/).filter(function(p) { return p.trim().length > 20; });
          var moreContent = '';
          if (paragraphs.length > 1) {
            // Skip first paragraph (already in summary), take next 2
            moreContent = paragraphs.slice(1, 3).join('\n\n');
          } else if (paragraphs.length === 1) {
            // If only one paragraph, take the second half
            var halfPoint = Math.floor(paragraphs[0].length / 2);
            moreContent = paragraphs[0].substring(halfPoint);
          }

          if (moreContent.length < 30) {
            // Fallback: use the full extract minus first 200 chars
            moreContent = fullExtract.length > 200 ? fullExtract.substring(200) : fullExtract;
          }

          if (moreContent.length > 1000) {
            moreContent = moreContent.substring(0, 997) + '...';
          }

          // Update the stored topic
          LastExternalTopic.set(topic, 'wikipedia', moreContent);

          var responseText = '**' + title + ' — More Details**\n\n' + moreContent;
          responseText += '\n\nRead the full article: https://en.wikipedia.org/wiki/' + encodeURIComponent(topic);
          responseText += ' [Source: Wikipedia]';

          return {
            text: responseText,
            buttons: [
              { label: 'Even More', value: 'Tell me even more about ' + topic },
              { label: 'Products', value: 'What products do you have' },
              { label: 'About Studio', value: 'Tell me about MortApps Studios' },
            ],
          };
        })
        .catch(function () { return null; });
    },

    /**
     * Fetches a full page extract for deep dives
     * @param {string} topic
     * @returns {Promise<object|null>}
     */
    fetchDeep: function (topic) {
      // Use MediaWiki API for full article extract (mobile-sections API was decommissioned)
      var apiUrl = 'https://en.wikipedia.org/w/api.php?action=query&titles=' +
        encodeURIComponent(topic) +
        '&prop=extracts&exintro=0&explaintext=1&exsectionformat=plain&format=json&origin=*';
      return fetch(apiUrl)
        .then(function (res) {
          if (!res.ok) return null;
          return res.json();
        })
        .then(function (data) {
          if (!data || !data.query || !data.query.pages) return null;
          var pages = data.query.pages;
          var pageId = Object.keys(pages)[0];
          var page = pages[pageId];
          if (!page || !page.extract || pageId === '-1') return null;

          var title = page.title || topic;
          var fullExtract = page.extract;

          // Remove the first paragraph (already shown in summary) and get the rest
          var paragraphs = fullExtract.split(/\n\n+/).filter(function(p) { return p.trim().length > 30; });
          var deepContent = '';
          if (paragraphs.length > 1) {
            // Skip first paragraph (summary already shown), take next 3 paragraphs
            var deepParagraphs = paragraphs.slice(1, 4);
            deepContent = deepParagraphs.join('\n\n');
          } else {
            // If only one paragraph, take the second half
            var midPoint = Math.floor(fullExtract.length / 2);
            deepContent = fullExtract.substring(midPoint);
          }

          if (deepContent.length < 50) return null;

          if (deepContent.length > 1500) {
            deepContent = deepContent.substring(0, 1497) + '...';
          }

          var responseText = '**' + title + ' — Continued**\n\n' + deepContent;
          responseText += '\n\nRead more: https://en.wikipedia.org/wiki/' + encodeURIComponent(topic);
          responseText += ' [Source: Wikipedia]';

          LastExternalTopic.set(topic, 'wikipedia', deepContent);

          return {
            text: responseText,
            buttons: [
              { label: 'Products', value: 'What products do you have' },
              { label: 'About Studio', value: 'Tell me about MortApps Studios' },
            ],
          };
        })
        .catch(function () { return null; });
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // SECTION 8: SMART FALLBACK ROUTER
  // When the main KB can't answer, try Wikipedia before giving up
  // ═══════════════════════════════════════════════════════════════

  var SmartFallbackRouter = {
    /**
     * Extracts a potential topic from a user query for Wikipedia lookup
     * @param {string} text - Raw user input
     * @returns {string|null} Extracted topic or null
     */
    extractTopic: function (text) {
      var cleaned = text.trim();

      // Skip MortApps-related terms
      var skipTerms = ['mort', 'mortapps', 'bioattex', 'phein', 'elthira', 'brizerm', 'taskflow',
        'agrixen', 'opticore', 'mort-e', 'morte', 'linkage', 'yourself', 'myself',
        'himself', 'herself', 'themselves', 'itself', 'you', 'me', 'us', 'them',
        'this', 'that', 'these', 'those', 'it', 'your name', 'my name', 'who you are',
        'what you are', 'how you work', 'how you are built', 'your architecture'];
      var lower = cleaned.toLowerCase();
      for (var i = 0; i < skipTerms.length; i++) {
        if (lower === skipTerms[i] || lower.indexOf(skipTerms[i]) !== -1) return null;
      }

      // Try to extract topic from various patterns
      var extractors = [
        /^how\s+(is|are|was|does|do|has|have|will|can|could|should|would)\s+(.+?)(\s*$|\?)/i,
        /^tell\s+me\s+(more\s+)?about\s+(.+?)(\s*$|\?)/i,
        /^what\s+(about|is|are|was)\s+(.+?)(\s*$|\?)/i,
        /^who\s+(is|are|was|were)\s+(.+?)(\s*$|\?)/i,
        /^(explain|describe)\s+(.+?)(\s*$|\?)/i,
        /^can\s+you\s+tell\s+me\s+(about|more\s+about)\s+(.+?)(\s*$|\?)/i,
        /^i\s+(want|would|d)\s+(like\s+)?to\s+know\s+(about|more\s+about)\s+(.+?)(\s*$|\?)/i,
        /^(info|information)\s+(on|about)\s+(.+?)(\s*$|\?)/i,
        /^(more\s+(about|on|details\s+(about|on)))\s+(.+?)(\s*$|\?)/i,
      ];

      for (var j = 0; j < extractors.length; j++) {
        var match = cleaned.match(extractors[j]);
        if (match) {
          var topic = match[match.length - 2] || match[match.length - 3];
          topic = topic.replace(/[?.!]$/, '').trim();
          if (topic.length >= 2 && topic.length < 80) {
            return topic;
          }
        }
      }

      return null;
    },

    /**
     * Checks if the main KB gave a weak/fallback response
     * @param {object} result - Response from the pipeline
     * @returns {boolean}
     */
    isWeakResponse: function (result) {
      if (!result || !result.text) return true;
      var text = result.text.toLowerCase();
      // Detect fallback/weak responses
      var weakPatterns = [
        /not quite (tracking|sure|following)/i,
        /i'm not quite sure/i,
        /i don'?t (quite |really )?(have|know|understand|track|follow|get)/i,
        /can you (rephrase|elaborate|clarify|be more specific)/i,
        /we were talking about mortapps/i,
        /want me to dive deeper/i,
        /something else i can help/i,
      ];
      for (var i = 0; i < weakPatterns.length; i++) {
        if (weakPatterns[i].test(text)) return true;
      }
      return false;
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // SECTION 9: MAIN HOOK — The GOD Engine
  // ═══════════════════════════════════════════════════════════════

  function init() {
    console.log('Mort-E Enhancement Module 11: GOD of LocalBots Engine — Active');

    var currentQuery = window.MortEBrains.query;
    var currentQueryAsync = window.MortEBrains.queryAsync;
    var internals = window.MortEBrainsInternals;

    // ── MAIN QUERY OVERRIDE ──────────────────────────────────────
    window.MortEBrains.query = function (rawInput) {
      var text = (rawInput || '').trim();

      // ── 1. LOCATION QUESTION HANDLER ─────────────────────────
      if (KenyaPositioning.isLocationQuestion(text)) {
        currentQuery(rawInput); // Update state
        var name = internals && internals.memory ? internals.memory.getName() : null;
        var nameLead = name ? name + ', ' : '';
        var nameComma = name ? ', ' + name : '';
        return {
          text: nameLead + 'MortApps Studios is a Kenya-based studio, and we operate on a hybrid model — we come to you. Whether it\'s a meeting, a project discussion, or a consultation, we bring our expertise directly to where you need it. No need to come to us. Want to connect?',
          buttons: [
            { label: 'WhatsApp', value: 'whatsapp_link', type: 'link', url: 'https://wa.me/254113400063' },
            { label: 'Email', value: 'What is the email for MortApps Studios' },
            { label: 'Products', value: 'What products do you have' },
          ],
        };
      }

      // ── PERSONAL QUESTION DEFLECTOR ───────────────────────────
      var PERSONAL_QUESTION_PATTERNS = [
        /when\s+(was|is|were)\s+(mort|mort\s+ian|the\s+founder|ian)\s+(born|birthday|age|born|dob)/i,
        /how\s+old\s+(is|was)\s+(mort|mort\s+ian|the\s+founder|ian)/i,
        /(mort|mort\s+ian|the\s+founder|ian)'?s?\s+(age|birthday|born|dob|date\s+of\s+birth|personal\s+life|family|wife|kids|children)/i,
        /where\s+(does|did)\s+(mort|mort\s+ian|the\s+founder)\s+(live|stay|reside)/i,
        /is\s+(mort|mort\s+ian|the\s+founder)\s+(married|single|dating)/i,
      ];

      for (var pq = 0; pq < PERSONAL_QUESTION_PATTERNS.length; pq++) {
        if (PERSONAL_QUESTION_PATTERNS[pq].test(text)) {
          currentQuery(rawInput); // Update state
          var name = internals && internals.memory ? internals.memory.getName() : null;
          var nameLead = name ? name + ', ' : '';
          return {
            text: nameLead + "I appreciate the curiosity about the founder, but personal details like that are kept private. What I can tell you is that Mort Ian K. is the developer and founder behind MortApps Studios — a problem solver who builds with purpose and intentionality. If you want to know about the studio, the products, or the philosophy behind what we build, I'm your best source. What would you like to know?",
            buttons: [
              { label: 'About Founder', value: 'Tell me about Mort Ian K.' },
              { label: 'Products', value: 'What products do you have' },
              { label: 'Philosophy', value: 'What is the MortApps philosophy' },
            ],
          };
        }
      }

      // ── 2. ENHANCED COMPLIMENT DETECTION ──────────────────────
      if (EnhancedComplimentDetector.isCompliment(text)) {
        currentQuery(rawInput); // Update state

        // Check if the main pipeline already handled it well
        var pipelineResult = currentQuery(rawInput);
        if (pipelineResult && pipelineResult.text) {
          var lowerText = pipelineResult.text.toLowerCase();
          // If the pipeline gave a good compliment response, use it
          if (/appreciate|thank|means a lot|glad/i.test(lowerText) &&
              !/not quite tracking|not sure|i don't/i.test(lowerText)) {
            pipelineResult.text = KenyaPositioning.enforce(pipelineResult.text);
            return pipelineResult;
          }
        }

        // Pipeline didn't handle it well — use our enhanced responses
        var name = internals && internals.memory ? internals.memory.getName() : null;
        var nameComma = name ? ', ' + name : '';
        var response = COMPLIMENT_RESPONSES_V2[Math.floor(Math.random() * COMPLIMENT_RESPONSES_V2.length)];
        response = response.replace(/\{userNameComma\}/g, nameComma);
        return {
          text: response,
          buttons: [
            { label: 'Products', value: 'What products do you have' },
            { label: 'About Studio', value: 'Tell me about MortApps Studios' },
          ],
        };
      }

      // ── 3. LINKAGE MEDIA HUB CONTACT DETAILS ──────────────────
      // Check for Linkage Media Hub specific questions (must run before general contact intelligence)
      var isLinkageQuestion = false;
      for (var li = 0; li < LINKAGE_MEDIA_HUB_PATTERNS.length; li++) {
        if (LINKAGE_MEDIA_HUB_PATTERNS[li].test(text)) {
          isLinkageQuestion = true;
          break;
        }
      }

      if (isLinkageQuestion) {
        // Always provide LMH info when asked about Linkage Media Hub
        currentQuery(rawInput); // Update state
        
        // Check if asking specifically about contact details
        var isContactSpecific = /contact|email|reach|whatsapp|phone|call|how\s+to/i.test(text);
        
        if (isContactSpecific) {
          return {
            text: 'You can contact Linkage Media Hub at:\n\nEmail: mort@linkagemediahub.co.ke\nWhatsApp: +254 105 399526\nWebsite: linkagemediahub.co.ke\n\nLinkage Media Hub is MortApps Studios\' sister brand — they handle influencer marketing, campaign management, and digital visibility services.',
            buttons: [
              { label: 'WhatsApp LMH', value: 'lmh_whatsapp_link', type: 'link', url: LinkageMediaHubInfo.whatsappLink },
              { label: 'Visit Website', value: 'Linkage Media Hub website' },
              { label: 'About MortApps', value: 'Tell me about MortApps Studios' },
            ],
          };
        } else {
          // General question about LMH
          return {
            text: LinkageMediaHubInfo.description + '\n\nContact them at:\nEmail: mort@linkagemediahub.co.ke\nWhatsApp: +254 105 399526\nWebsite: linkagemediahub.co.ke',
            buttons: [
              { label: 'WhatsApp LMH', value: 'lmh_whatsapp_link', type: 'link', url: LinkageMediaHubInfo.whatsappLink },
              { label: 'Visit Website', value: 'Linkage Media Hub website' },
              { label: 'About MortApps', value: 'Tell me about MortApps Studios' },
            ],
          };
        }
      }

      // ── 4. CONTACT INTELLIGENCE ───────────────────────────────
      // Check for "I will contact the founder" or similar
      for (var ci = 0; ci < CONTACT_INTENT_PATTERNS.length; ci++) {
        if (CONTACT_INTENT_PATTERNS[ci].test(text)) {
          currentQuery(rawInput); // Update state
          var name = internals && internals.memory ? internals.memory.getName() : null;
          var nameComma = name ? ', ' + name : '';
          var nameLead = name ? name + ', ' : '';

          // Is it specifically about the founder?
          var isFounderContact = false;
          for (var fi = 0; fi < FOUNDER_CONTACT_PATTERNS.length; fi++) {
            if (FOUNDER_CONTACT_PATTERNS[fi].test(text)) {
              isFounderContact = true;
              break;
            }
          }

          if (isFounderContact) {
            return {
              text: nameLead + 'great choice! You can reach Mort Ian K. directly at klraineian@gmail.com. For general studio inquiries, labs@mortappsstudios.com works too. Or if you prefer a quick chat, WhatsApp us at +254 113 400 063 and ask to be connected to the founder. He\'s responsive.',
              buttons: [
                { label: 'WhatsApp', value: 'whatsapp_link', type: 'link', url: 'https://wa.me/254113400063' },
                { label: 'About Founder', value: 'Tell me about the founder' },
              ],
            };
          }

          // General contact intent
          return {
            text: nameLead + "here's how to reach us: Email at labs@mortappsstudios.com (most direct), call or WhatsApp at +254 113 400 063, or use the contact form on mortappsstudios.com. For founder-specific inquiries, Mort Ian K. is at klraineian@gmail.com. What works best for you?",
            buttons: [
              { label: 'WhatsApp', value: 'whatsapp_link', type: 'link', url: 'https://wa.me/254113400063' },
              { label: 'About Studio', value: 'Tell me about MortApps Studios' },
            ],
          };
        }
      }

      // ── 5. FOLLOW-UP DETECTION ("Tell me more", "More", etc.) ─
      for (var ft = 0; ft < FOLLOW_UP_TRIGGERS.length; ft++) {
        if (FOLLOW_UP_TRIGGERS[ft].test(text)) {
          var lastTopic = LastExternalTopic.get();
          if (lastTopic) {
            // User wants more info on the last external topic
            currentQuery(rawInput); // Update state
            // This will be handled asynchronously — return a loading placeholder
            // and trigger the async fetch
            return {
              text: 'Let me get more on that for you...',
              buttons: [],
              _asyncFollowUp: true,
              _topic: lastTopic,
            };
          }
        }
      }

      // ── 6. BROADENED KNOWLEDGE ROUTING ────────────────────────
      for (var bi = 0; bi < BROAD_WIKI_TRIGGERS.length; bi++) {
        if (BROAD_WIKI_TRIGGERS[bi].test(text)) {
          var topic = SmartFallbackRouter.extractTopic(text);
          if (topic) {
            // Check topic guard
            var guardResult = TopicGuard.check(topic);
            if (!guardResult.allowed) {
              currentQuery(rawInput);
              return {
                text: "I appreciate the curiosity, but that's outside my wheelhouse. I'm an expert on MortApps Studios and general tech/business topics. Want to know about our products or the Kenyan tech scene instead?",
                buttons: [
                  { label: 'Products', value: 'What products do you have' },
                  { label: 'Kenya Tech Scene', value: 'Tell me about the Kenyan tech ecosystem' },
                ],
              };
            }

            // Route to Wikipedia asynchronously
            currentQuery(rawInput); // Update state
            var isFollowUp = /\b(more|tell me more|deeper|further|details|continue|expand|elaborate)\b/i.test(text);
            return {
              text: 'Looking that up for you...',
              buttons: [],
              _asyncWiki: true,
              _topic: topic,
              _isFollowUp: isFollowUp,
            };
          }
        }
      }

      // ── 7. STANDARD PIPELINE + POST-PROCESSING ────────────────
      var result = currentQuery(rawInput);

      // Enforce Kenya-based positioning on all responses
      if (result && result.text) {
        result.text = KenyaPositioning.enforce(result.text);
      }

      // Smart Fallback: If the pipeline gave a weak response, try Wikipedia
      if (result && SmartFallbackRouter.isWeakResponse(result)) {
        var fallbackTopic = SmartFallbackRouter.extractTopic(text);
        if (fallbackTopic && TopicGuard.check(fallbackTopic).allowed) {
          // Return async placeholder — the async handler will fetch Wikipedia
          return {
            text: 'Let me look that up...',
            buttons: [],
            _asyncFallback: true,
            _topic: fallbackTopic,
            _originalResult: result,
          };
        }
      }

      return result;
    };

    // ── ASYNC QUERY OVERRIDE ──────────────────────────────────────
    window.MortEBrains.queryAsync = function (rawInput, callback) {
      var text = (rawInput || '').trim();

      // ── FOLLOW-UP HANDLING (async) ─────────────────────────
      for (var ft = 0; ft < FOLLOW_UP_TRIGGERS.length; ft++) {
        if (FOLLOW_UP_TRIGGERS[ft].test(text)) {
          var lastTopic = LastExternalTopic.get();
          if (lastTopic) {
            WikiClient.fetchMore(lastTopic).then(function (result) {
              if (result) {
                callback(result);
              } else {
                // Try deep fetch
                return WikiClient.fetchDeep(lastTopic).then(function (deepResult) {
                  if (deepResult) {
                    callback(deepResult);
                  } else {
                    // Fall back to standard pipeline
                    var stdResult = currentQuery(rawInput);
                    if (stdResult && stdResult.text) {
                      stdResult.text = KenyaPositioning.enforce(stdResult.text);
                    }
                    callback(stdResult || { text: "I couldn't find more on that topic. But I know everything about MortApps Studios — want to explore our products?", buttons: [{ label: 'Products', value: 'What products do you have' }] });
                  }
                });
              }
            }).catch(function () {
              var stdResult = currentQuery(rawInput);
              callback(stdResult || { text: "Something went wrong fetching more info. But I'm an expert on all things MortApps Studios. What else can I help with?", buttons: [] });
            });
            return; // Don't fall through
          }
        }
      }

      // ── BROADENED KNOWLEDGE ROUTING (async) ────────────────
      for (var bi = 0; bi < BROAD_WIKI_TRIGGERS.length; bi++) {
        if (BROAD_WIKI_TRIGGERS[bi].test(text)) {
          var topic = SmartFallbackRouter.extractTopic(text);
          if (topic && TopicGuard.check(topic).allowed) {
            var asyncIsFollowUp = /\b(more|tell me more|deeper|further|details|continue|expand|elaborate)\b/i.test(text);
            var fetchFn = asyncIsFollowUp ? WikiClient.fetchMore.bind(WikiClient) : WikiClient.fetchSummary.bind(WikiClient);
            fetchFn(topic).then(function (wikiResult) {
              if (wikiResult) {
                wikiResult.text = KenyaPositioning.enforce(wikiResult.text);
                callback(wikiResult);
              } else if (asyncIsFollowUp) {
                // If fetchMore failed, try fetchDeep
                WikiClient.fetchDeep(topic).then(function (deepResult) {
                  if (deepResult) {
                    deepResult.text = KenyaPositioning.enforce(deepResult.text);
                    callback(deepResult);
                  } else {
                    // Fall back to standard pipeline
                    var stdResult = currentQuery(rawInput);
                    if (stdResult && stdResult.text) {
                      stdResult.text = KenyaPositioning.enforce(stdResult.text);
                    }
                    callback(stdResult || { text: "I couldn't find more details on that topic. But I'm an expert on MortApps Studios — want to explore our products instead?", buttons: [{ label: 'Products', value: 'What products do you have' }] });
                  }
                }).catch(function() {
                  var stdResult = currentQuery(rawInput);
                  callback(stdResult || { text: "I had trouble fetching more info. But I know everything about MortApps Studios. What else can I help with?", buttons: [] });
                });
              } else {
                // Fall back to standard pipeline
                var stdResult = currentQuery(rawInput);
                if (stdResult && stdResult.text) {
                  stdResult.text = KenyaPositioning.enforce(stdResult.text);
                }
                callback(stdResult || { text: "I couldn't find information on that. But I know everything about MortApps Studios. What can I help you with?", buttons: [{ label: 'Products', value: 'What products do you have' }] });
              }
            }).catch(function () {
              var stdResult = currentQuery(rawInput);
              callback(stdResult || { text: "Something went wrong. But I'm here to help with all things MortApps Studios. What else can I help with?", buttons: [] });
            });
            return; // Don't fall through
          }
        }
      }

      // ── CHECK IF SYNC QUERY RETURNED AN ASYNC PLACEHOLDER ───
      var syncResult = window.MortEBrains.query(rawInput);

      if (syncResult && syncResult._asyncFollowUp) {
        WikiClient.fetchMore(syncResult._topic).then(function (moreResult) {
          if (moreResult) {
            moreResult.text = KenyaPositioning.enforce(moreResult.text);
            callback(moreResult);
          } else {
            WikiClient.fetchDeep(syncResult._topic).then(function (deepResult) {
              if (deepResult) {
                deepResult.text = KenyaPositioning.enforce(deepResult.text);
                callback(deepResult);
              } else {
                callback({ text: "I couldn't find more details on that topic. But I'm an expert on MortApps Studios — want to explore our products instead?", buttons: [{ label: 'Products', value: 'What products do you have' }] });
              }
            });
          }
        }).catch(function () {
          callback({ text: "I had trouble fetching more info. But I know everything about MortApps Studios. What else can I help with?", buttons: [] });
        });
        return;
      }

      if (syncResult && syncResult._asyncWiki) {
        var fetchFn = syncResult._isFollowUp ? WikiClient.fetchMore.bind(WikiClient) : WikiClient.fetchSummary.bind(WikiClient);
        fetchFn(syncResult._topic).then(function (wikiResult) {
          if (wikiResult) {
            wikiResult.text = KenyaPositioning.enforce(wikiResult.text);
            callback(wikiResult);
          } else if (syncResult._isFollowUp) {
            // If fetchMore failed, try fetchDeep
            WikiClient.fetchDeep(syncResult._topic).then(function (deepResult) {
              if (deepResult) {
                deepResult.text = KenyaPositioning.enforce(deepResult.text);
                callback(deepResult);
              } else {
                callback({ text: "I couldn't find more details on that topic. But I'm an expert on MortApps Studios — want to explore our products instead?", buttons: [{ label: 'Products', value: 'What products do you have' }] });
              }
            }).catch(function() {
              callback({ text: "I had trouble fetching more info. But I know everything about MortApps Studios. What else can I help with?", buttons: [] });
            });
          } else {
            var fallback = syncResult._originalResult || { text: "I couldn't find information on that. But I'm an expert on MortApps Studios. What can I help with?", buttons: [{ label: 'Products', value: 'What products do you have' }] };
            if (fallback.text) fallback.text = KenyaPositioning.enforce(fallback.text);
            callback(fallback);
          }
        }).catch(function () {
          callback({ text: "Something went wrong. But I know everything about MortApps Studios. What else can I help with?", buttons: [] });
        });
        return;
      }

      if (syncResult && syncResult._asyncFallback) {
        WikiClient.fetchSummary(syncResult._topic).then(function (wikiResult) {
          if (wikiResult) {
            wikiResult.text = KenyaPositioning.enforce(wikiResult.text);
            callback(wikiResult);
          } else {
            var origResult = syncResult._originalResult || syncResult;
            if (origResult && origResult.text) {
              origResult.text = KenyaPositioning.enforce(origResult.text);
            }
            callback(origResult || { text: "I couldn't find information on that. But I know everything about MortApps Studios. What can I help with?", buttons: [{ label: 'Products', value: 'What products do you have' }] });
          }
        }).catch(function () {
          var origResult = syncResult._originalResult || syncResult;
          callback(origResult || { text: "Something went wrong. But I know everything about MortApps Studios. What else can I help with?", buttons: [] });
        });
        return;
      }

      // ── STANDARD ASYNC PIPELINE (from Module 7) ─────────────
      if (currentQueryAsync) {
        currentQueryAsync(rawInput, function (result) {
          if (result && result.text) {
            result.text = KenyaPositioning.enforce(result.text);
          }
          callback(result);
        });
      } else {
        var result = syncResult || currentQuery(rawInput);
        if (result && result.text) {
          result.text = KenyaPositioning.enforce(result.text);
        }
        callback(result);
      }
    };

    // Expose for other modules
    window.MortEEnhancements = window.MortEEnhancements || {};
    window.MortEEnhancements.LastExternalTopic = LastExternalTopic;
    window.MortEEnhancements.EnhancedComplimentDetector = EnhancedComplimentDetector;
    window.MortEEnhancements.KenyaPositioning = KenyaPositioning;
    window.MortEEnhancements.LinkageMediaHubInfo = LinkageMediaHubInfo;
    window.MortEEnhancements.SmartFallbackRouter = SmartFallbackRouter;
    window.MortEEnhancements.WikiClient = WikiClient;
    window.MortEEnhancements.TopicGuard = TopicGuard;
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { waitForBridge(0); });
  } else {
    waitForBridge(0);
  }

  // ── PUBLIC API ──────────────────────────────────────────────────
  window.MortEBrainsModule11 = {
    LastExternalTopic: LastExternalTopic,
    EnhancedComplimentDetector: EnhancedComplimentDetector,
    KenyaPositioning: KenyaPositioning,
    LinkageMediaHubInfo: LinkageMediaHubInfo,
    SmartFallbackRouter: SmartFallbackRouter,
    WikiClient: WikiClient,
    TopicGuard: TopicGuard,
  };

})();
