/**
 * ═══════════════════════════════════════════════════════════════════════
 * Mort-E GMA.2 — Advanced Inference Engine v4.0.0
 * Part of the MortApps Studios AI Division
 *
 * Architecture (v4 — Structured Response + Quick-Reply Buttons):
 *   ┌─────────────┐  ┌──────────────┐  ┌────────────────┐
 *   │ Input       │→ │ NLP Pipeline │→ │ Intent         │
 *   │ Normalizer  │  │(stem/syn/   │  │ Classifier     │
 *   │             │  │ fuzzy/TF-IDF)│  │ (scored)       │
 *   └─────────────┘  └──────────────┘  └───────┬────────┘
 *                                              │
 *   ┌──────────────────────────────────────────▼────────┐
 *   │              Dialogue Manager                      │
 *   │  ┌────────────┐ ┌─────────────┐ ┌──────────────┐ │
 *   │  │ Context    │ │ Confirmation│ │ Depth        │ │
 *   │  │ Stack      │ │ Detector    │ │ Tracker      │ │
 *   │  └────────────┘ └─────────────┘ └──────────────┘ │
 *   └──────────────────────────┬───────────────────────┘
 *                              │
 *   ┌──────────────────────────▼───────────────────────┐
 *   │        Response Generator (v4)                    │
 *   │  Returns: { text: string, buttons: [...] }        │
 *   │  ┌────────────┐ ┌─────────────┐ ┌──────────────┐│
 *   │  │ Anti-      │ │ Personalize │ │ Quick-Reply  ││
 *   │  │ Repetition │ │ (name/mem)  │ │ Buttons      ││
 *   │  └────────────┘ └─────────────┘ └──────────────┘│
 *   └──────────────────────────────────────────────────┘
 *
 *   ┌──────────────────────────────────────────────────┐
 *   │              Persistence Layer                    │
 *   │  localStorage: { name, prefs, visitCount }       │
 *   │  Memory: { usedResponses, topicDepth, history }  │
 *   └──────────────────────────────────────────────────┘
 *
 * Inspired by: Rasa (state machines), LangGraph (graph routing),
 * XState (finite state machines), Chatbot-UI (structured responses),
 * Natural/NLP.js (stemming/classification), FlexSearch (tag matching)
 *
 * (c) 2026 MortApps Studios. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════
     SECTION 1: NLP UTILITIES
     Stemming, Levenshtein distance, synonym expansion,
     input normalization, stop words
     ═══════════════════════════════════════════════════════════════ */

  // ── Porter Stemmer (compact inline) ──────────────────────────
  const _stem = (function () {
    const step2list = {
      ational: 'ate', tional: 'tion', enci: 'ence', anci: 'ance',
      izer: 'ize', bli: 'ble', alli: 'al', entli: 'ent', eli: 'e',
      ousli: 'ous', ization: 'ize', ation: 'ate', ator: 'ate',
      alism: 'al', iveness: 'ive', fulness: 'ful', ousness: 'ous',
      aliti: 'al', iviti: 'ive', biliti: 'ble', logi: 'log',
    };
    const step3list = {
      icate: 'ic', ative: '', alize: 'al', iciti: 'ic',
      ical: 'ic', ful: '', ness: '',
    };
    const gt0 = /^([^aeiou][^aeiouy]*)?([aeiouy][aeiou]*)([^aeiou][^aeiouy]*)/;
    const gt1 = /^([^aeiou][^aeiouy]*)?([aeiouy][aeiou]*)([^aeiou][^aeiouy]*)([aeiouy][aeiou]*)?/;
    const eq1 = /^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*$/;
    const ccys = /[^aeiouy]*y$/;
    const s1a = /^(.+?)(ss|i)es$/;
    const s1b1 = /^(.+?)eed$/;
    const s1b2 = /^(.+?)(ed|ing)$/;
    const s2 = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
    const s3 = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
    const s4p1 = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ion|ou|ism|ate|iti|ous|ive|ize)$/;
    const s4p2 = /^(.+?)(s|t)(ion)$/;

    function measure(stem) {
      const m = stem.match(gt1);
      return m && m[3] ? m[3].length : 0;
    }

    return function stem(w) {
      if (w.length < 3) return w;
      w = w.toLowerCase();

      if (s1a.test(w)) w = w.replace(s1a, '$1$2');
      else if (w.endsWith('sses')) w = w.slice(0, -2);
      else if (w.endsWith('ss')) { /* keep */ }
      else if (w.endsWith('s')) w = w.slice(0, -1);

      if (s1b1.test(w)) {
        const base = w.replace(s1b1, '$1');
        if (measure(base) > 0) w = base;
      } else if (s1b2.test(w)) {
        const base = w.replace(s1b2, '$1');
        if (gt0.test(base)) {
          w = base;
          if (w.endsWith('at') || w.endsWith('bl') || w.endsWith('iz')) w += 'e';
          else if (eq1.test(w) && !ccys.test(w)) w = w.slice(0, -1);
        }
      }

      if (w.endsWith('y') && gt0.test(w.slice(0, -1))) {
        w = w.slice(0, -1) + 'i';
      }

      if (s2.test(w)) {
        const m2 = w.match(s2);
        const base = m2[1];
        const suffix = m2[2];
        if (measure(base) > 0 && step2list[suffix]) {
          w = base + step2list[suffix];
        }
      }

      if (s3.test(w)) {
        const m3 = w.match(s3);
        const base = m3[1];
        const suffix = m3[2];
        if (measure(base) > 0 && step3list[suffix] !== undefined) {
          w = base + step3list[suffix];
        }
      }

      if (s4p2.test(w)) {
        const m4 = w.match(s4p2);
        const base = m4[1] + m4[2];
        if (measure(base) > 1) w = base;
      } else if (s4p1.test(w)) {
        const m4 = w.match(s4p1);
        const base = m4[1];
        if (measure(base) > 1) w = base;
      }

      if (w.endsWith('e') && measure(w.slice(0, -1)) > 1) {
        w = w.slice(0, -1);
      } else if (w.endsWith('e') && measure(w.slice(0, -1)) === 1 && !eq1.test(w.slice(0, -1))) {
        w = w.slice(0, -1);
      }

      if (measure(w) > 1 && /ll$/.test(w)) w = w.slice(0, -1);

      return w;
    };
  })();

  // ── Levenshtein Distance ────────────────────────────────────
  function levenshtein(a, b) {
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const m = a.length, n = b.length;
    const dp = [];
    for (let i = 0; i <= m; i++) {
      dp[i] = [i];
      for (let j = 1; j <= n; j++) {
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
    return dp[m][n];
  }

  function similarity(a, b) {
    const maxLen = Math.max(a.length, b.length);
    return maxLen === 0 ? 1 : 1 - levenshtein(a.toLowerCase(), b.toLowerCase()) / maxLen;
  }

  function fuzzyMatch(input, candidates, threshold) {
    if (threshold === undefined) threshold = 0.75;
    var best = null, bestScore = 0;
    for (var i = 0; i < candidates.length; i++) {
      var score = similarity(input, candidates[i]);
      if (score > bestScore && score >= threshold) {
        bestScore = score;
        best = candidates[i];
      }
    }
    return best ? { match: best, score: bestScore } : null;
  }

  // ── Synonym Map (expanded) ──────────────────────────────────
  const SYNONYM_MAP = {
    hello: ['hi', 'hey', 'howdy', 'greetings', 'sup', 'yo', 'hola', 'morning', 'afternoon', 'evening'],
    bye: ['goodbye', 'farewell', 'later', 'cheers', 'night', 'see ya', 'gotta go', 'take care'],
    yes: ['yeah', 'yep', 'yup', 'sure', 'absolutely', 'definitely', 'certainly', 'of course', 'please', 'go ahead', 'okay', 'ok', 'alright', 'sounds good', 'do it', 'right', 'exactly', 'correct', 'indeed', 'for sure', 'totally', 'why not', 'i suppose', 'i think so', 'i guess so', 'uh huh', 'mhm', 'affirmative'],
    no: ['nope', 'nah', 'not really', 'not at all', 'negative', 'never', 'stop', 'cancel', 'no thanks', 'skip', 'skip it', 'nay', 'absolutely not', 'definitely not', 'no way', 'not interested', 'rather not'],
    product: ['products', 'software', 'apps', 'tools', 'build', 'make', 'offer', 'create', 'portfolio', 'work', 'lineup'],
    company: ['mortapps', 'studio', 'team', 'organization', 'firm', 'agency', 'business'],
    service: ['services', 'solutions', 'offerings', 'what do you do', 'how can you help', 'capabilities'],
    contact: ['reach', 'email', 'phone', 'call', 'touch', 'connect', 'talk', 'speak', 'message'],
    founder: ['ceo', 'owner', 'creator', 'started', 'founded', 'built', 'behind'],
    price: ['cost', 'pricing', 'fee', 'charge', 'rate', 'quote', 'budget', 'expensive', 'cheap', 'afford', 'how much'],
    demo: ['try', 'test', 'preview', 'see it', 'live', 'trial'],
    hire: ['hiring', 'jobs', 'careers', 'recruiting', 'positions', 'employment', 'join', 'work'],
    partner: ['partnership', 'collaborate', 'collaboration', 'work together', 'joint', 'cooperate'],
    tell: ['explain', 'describe', 'about', 'info', 'information', 'details', 'walk me', 'break down', 'elaborate'],
    more: ['further', 'deeper', 'detail', 'expand', 'continue', 'else', 'additional', 'extra'],
    how: ['how are', 'how do', 'how is', 'what about', 'status', 'doing'],
    name: ['called', 'named', 'call me', 'i am', "i'm", 'my name'],
    feature: ['features', 'what can it do', 'capabilities', 'what does it do', 'functionality', 'specs'],
    ai: ['artificial intelligence', 'machine learning', 'ml', 'neural', 'deep learning', 'nlp', 'computer vision'],
    privacy: ['data protection', 'gdpr', 'security', 'secure', 'encrypted', 'safe', 'local processing'],
    website: ['site', 'web', 'webpage', 'landing page', 'online presence', 'web app'],
  };

  function expandWithSynonyms(word) {
    var lower = word.toLowerCase();
    var expanded = [lower];
    for (var key in SYNONYM_MAP) {
      if (!SYNONYM_MAP.hasOwnProperty(key)) continue;
      var syns = SYNONYM_MAP[key];
      if (key === lower || syns.indexOf(lower) !== -1) {
        expanded.push(key);
        for (var i = 0; i < syns.length; i++) expanded.push(syns[i]);
      }
    }
    return expanded;
  }

  // ── Stop Words ──────────────────────────────────────────────
  var STOP_WORDS = ['a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should',
    'may', 'might', 'can', 'could', 'of', 'in', 'to', 'for', 'with', 'on', 'at',
    'by', 'from', 'it', 'its', 'this', 'that', 'these', 'those', 'so', 'if', 'or',
    'and', 'but', 'just', 'very', 'really', 'quite', 'also', 'too', 'then', 'than',
    'up', 'out', 'about', 'into', 'over', 'after', 'before', 'between', 'under',
    'again', 'further', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
    'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some',
    'such', 'only', 'own', 'same', 'any', 'what', 'which', 'who', 'whom'];

  // ── Contraction Expansion ───────────────────────────────────
  function expandContractions(text) {
    return text
      .replace(/i'm/gi, 'i am')
      .replace(/you're/gi, 'you are')
      .replace(/we're/gi, 'we are')
      .replace(/they're/gi, 'they are')
      .replace(/it's/gi, 'it is')
      .replace(/that's/gi, 'that is')
      .replace(/what's/gi, 'what is')
      .replace(/who's/gi, 'who is')
      .replace(/don't/gi, 'do not')
      .replace(/doesn't/gi, 'does not')
      .replace(/didn't/gi, 'did not')
      .replace(/won't/gi, 'will not')
      .replace(/wouldn't/gi, 'would not')
      .replace(/can't/gi, 'cannot')
      .replace(/couldn't/gi, 'could not')
      .replace(/shouldn't/gi, 'should not')
      .replace(/isn't/gi, 'is not')
      .replace(/aren't/gi, 'are not')
      .replace(/wasn't/gi, 'was not')
      .replace(/weren't/gi, 'were not')
      .replace(/haven't/gi, 'have not')
      .replace(/hasn't/gi, 'has not')
      .replace(/hadn't/gi, 'had not')
      .replace(/let's/gi, 'let us')
      .replace(/i'd/gi, 'i would')
      .replace(/i've/gi, 'i have')
      .replace(/i'll/gi, 'i will')
      .replace(/you'd/gi, 'you would')
      .replace(/you'll/gi, 'you will')
      .replace(/he's/gi, 'he is')
      .replace(/she's/gi, 'she is')
      .replace(/there's/gi, 'there is')
      .replace(/here's/gi, 'here is');
  }

  // ── Input Normalization Pipeline ────────────────────────────
  function normalizeInput(rawInput) {
    var text = rawInput.toLowerCase().trim();
    text = text.replace(/[^\w\s']/g, ' ').replace(/\s+/g, ' ').trim();
    text = expandContractions(text);
    var tokens = text.split(/\s+/).filter(function (t) { return t.length > 0; });
    var importantWords = new Set(['not', 'no', 'yes', 'how', 'what', 'who', 'where', 'when', 'why']);
    var filtered = tokens.filter(function (t) {
      return !STOP_WORDS.includes(t) || importantWords.has(t);
    });
    var stemmed = filtered.map(function (t) { return _stem(t); });
    var expanded = new Set(stemmed);
    for (var i = 0; i < stemmed.length; i++) {
      var syns = expandWithSynonyms(stemmed[i]);
      for (var j = 0; j < syns.length; j++) {
        expanded.add(syns[j]);
        expanded.add(_stem(syns[j]));
      }
    }
    for (var k = 0; k < tokens.length; k++) {
      expanded.add(tokens[k]);
    }
    return {
      raw: rawInput,
      normalized: text,
      tokens: tokens,
      filtered: filtered,
      stemmed: stemmed,
      expanded: Array.from(expanded),
    };
  }


  /* ═══════════════════════════════════════════════════════════════
     SECTION 2: USER MEMORY (localStorage-backed)
     Name remembering, preferences, visit tracking, personalization
     ═══════════════════════════════════════════════════════════════ */

  var UserMemory = (function () {
    var STORAGE_KEY = 'mort_e_user_data';

    function UserMemory() {
      this.session = {};
      this.persistent = this._load();
      if (!this.persistent.visitCount) this.persistent.visitCount = 0;
      this.persistent.visitCount++;
      this.persistent.lastVisit = new Date().toISOString();
      this._save();
    }

    UserMemory.prototype._load = function () {
      try {
        var data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
      } catch (e) {
        return {};
      }
    };

    UserMemory.prototype._save = function () {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.persistent));
      } catch (e) { /* silent */ }
    };

    UserMemory.prototype.setName = function (name) {
      this.persistent.name = name;
      this._save();
    };

    UserMemory.prototype.getName = function () {
      return this.persistent.name || null;
    };

    UserMemory.prototype.isReturningUser = function () {
      return !!this.persistent.name;
    };

    UserMemory.prototype.getVisitCount = function () {
      return this.persistent.visitCount || 0;
    };

    UserMemory.prototype.extractName = function (input) {
      var text = input.trim();
      var patterns = [
        /(?:my name is|my name's|i am|i'm|call me|name's|they call me)\s+([A-Z][a-zA-Z]{1,20})/i,
        /^(?:the name is|it's|i go by)\s+([A-Z][a-zA-Z]{1,20})/i,
      ];
      for (var i = 0; i < patterns.length; i++) {
        var m = text.match(patterns[i]);
        if (m) return m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase();
      }
      var singleWord = text.match(/^([A-Z][a-zA-Z]{1,20})$/);
      if (singleWord) {
        var candidate = singleWord[1];
        var notNames = ['Yes', 'No', 'Hello', 'Hey', 'Hi', 'Thanks', 'Okay', 'Sure', 'Maybe',
          'Please', 'Good', 'Great', 'Nice', 'Cool', 'Fine', 'Right', 'What', 'How',
          'Why', 'When', 'Where', 'Tell', 'Show', 'About', 'BioAttex', 'Phein',
          'AgriXen', 'Elthira', 'Opticore', 'MortApps', 'Yeah', 'Yep', 'Yup',
          'Sup', 'Yo', 'Hola', 'Bye', 'Later', 'Also', 'And', 'But', 'Not',
          'Well', 'OK', 'Alright', 'Hello', 'There', 'Here', 'Now', 'Then',
          'More', 'Less', 'Much', 'Very', 'Just', 'Like', 'Want', 'Need',
          'Can', 'Will', 'Does', 'Did', 'Has', 'Have', 'Been', 'Going',
          'Products', 'Services', 'Company', 'Studio', 'Briz', 'Mort'];
        if (notNames.indexOf(candidate) === -1) {
          return candidate;
        }
      }
      return null;
    };

    UserMemory.prototype.personalize = function (template) {
      var name = this.getName();
      if (!name) return template;
      return template.replace(/\{userName\}/g, name);
    };

    UserMemory.prototype.setSessionData = function (key, value) {
      this.session[key] = value;
    };

    UserMemory.prototype.getSessionData = function (key) {
      return this.session[key];
    };

    UserMemory.prototype.clearAll = function () {
      this.persistent = {};
      this.session = {};
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* silent */ }
    };

    return UserMemory;
  })();


  /* ═══════════════════════════════════════════════════════════════
     SECTION 3: CONVERSATION STATE
     Context stack, pending offers, topic tracking,
     depth tracking, anti-repetition
     ═══════════════════════════════════════════════════════════════ */

  var ConversationState = (function () {

    function ConversationState() {
      this.history = [];
      this.currentTopic = null;
      this.pendingOffer = null;
      this.pendingOfferId = null;
      this.usedResponses = {};
      this.topicDepth = {};
      this.contextStack = [];
      this.lastIntentId = null;
      this.lastEntityId = null;
      this.turnCount = 0;
      this.nameAsked = false;
      this.nameAskAttempt = 0;
      this.awaitingName = false; // v4: explicit name-awaiting state
    }

    ConversationState.prototype.pushContext = function (topic) {
      this.contextStack.push({
        topic: this.currentTopic,
        pendingOffer: this.pendingOffer,
        pendingOfferId: this.pendingOfferId,
      });
      this.currentTopic = topic;
      this.pendingOffer = null;
      this.pendingOfferId = null;
    };

    ConversationState.prototype.popContext = function () {
      var prev = this.contextStack.pop();
      if (prev) {
        this.currentTopic = prev.topic;
        this.pendingOffer = prev.pendingOffer;
        this.pendingOfferId = prev.pendingOfferId;
      }
    };

    ConversationState.prototype.setOffer = function (offerText, offerId) {
      this.pendingOffer = offerText;
      this.pendingOfferId = offerId;
    };

    ConversationState.prototype.clearOffer = function () {
      this.pendingOffer = null;
      this.pendingOfferId = null;
      this.awaitingName = false;
    };

    ConversationState.prototype.hasPendingOffer = function () {
      return this.pendingOffer !== null;
    };

    ConversationState.prototype.getDepth = function (topicId) {
      return this.topicDepth[topicId] || 0;
    };

    ConversationState.prototype.escalateDepth = function (topicId) {
      this.topicDepth[topicId] = Math.min((this.topicDepth[topicId] || 0) + 1, 3);
    };

    ConversationState.prototype.markResponseUsed = function (topicId, responseText) {
      if (!this.usedResponses[topicId]) this.usedResponses[topicId] = [];
      if (this.usedResponses[topicId].indexOf(responseText) === -1) {
        this.usedResponses[topicId].push(responseText);
      }
    };

    ConversationState.prototype.isResponseUsed = function (topicId, responseText) {
      if (!this.usedResponses[topicId]) return false;
      return this.usedResponses[topicId].indexOf(responseText) !== -1;
    };

    ConversationState.prototype.addTurn = function (role, text) {
      this.history.push({ role: role, text: text, timestamp: Date.now() });
      this.turnCount++;
    };

    ConversationState.prototype.getLastBotMessage = function () {
      for (var i = this.history.length - 1; i >= 0; i--) {
        if (this.history[i].role === 'bot') return this.history[i].text;
      }
      return null;
    };

    ConversationState.prototype.getLastUserMessage = function () {
      for (var i = this.history.length - 1; i >= 0; i--) {
        if (this.history[i].role === 'user') return this.history[i].text;
      }
      return null;
    };

    // v4: Get recent conversation context (last N turns)
    ConversationState.prototype.getRecentContext = function (n) {
      var turns = this.history.slice(-(n || 4));
      var summary = '';
      for (var i = 0; i < turns.length; i++) {
        summary += (turns[i].role === 'user' ? 'User: ' : 'Bot: ') + turns[i].text + ' | ';
      }
      return summary;
    };

    ConversationState.prototype.reset = function () {
      this.history = [];
      this.currentTopic = null;
      this.pendingOffer = null;
      this.pendingOfferId = null;
      this.usedResponses = {};
      this.topicDepth = {};
      this.contextStack = [];
      this.lastIntentId = null;
      this.lastEntityId = null;
      this.turnCount = 0;
      this.nameAsked = false;
      this.nameAskAttempt = 0;
      this.awaitingName = false;
    };

    return ConversationState;
  })();


  /* ═══════════════════════════════════════════════════════════════
     SECTION 4: AFFIRMATION / NEGATION DETECTION
     Context-gated — only triggers when there's a pending offer
     ═══════════════════════════════════════════════════════════════ */

  var AFFIRMATIONS = new Set([
    'yes', 'yeah', 'yep', 'yup', 'sure', 'absolutely', 'definitely',
    'certainly', 'of course', 'please', 'please do', 'go ahead',
    'okay', 'ok', 'alright', 'sounds good', 'that works', 'do it',
    'i would', 'right', 'exactly', 'correct', 'indeed', 'for sure',
    'totally', 'why not', 'i suppose', 'i think so', 'i guess so',
    'uh huh', 'mhm', 'affirmative', 'true', 'make it so', 'yes please',
    'yes do so', 'yeah sure', 'yes i do', 'i do', 'go on', 'continue',
    'proceed', 'tell me more', 'more', 'more please', 'keep going',
    'break it down', 'break it down further', 'elaborate', 'explain more',
    'dive deeper', 'go deeper', 'in detail', 'details', 'the details',
    'walk me through', 'full picture', 'the full picture', 'deeper',
    'i would love to', "i'd love to", 'love to', 'love that',
    'that would be great', 'great idea', 'please go ahead',
    'yes i would', 'i would like that', 'i want to know more',
    'go into detail', 'give me the details', 'tell me everything',
    'let me know more', 'explain further', 'show me more',
  ]);

  var NEGATIONS = new Set([
    'no', 'nope', 'nah', 'not really', 'not at all', 'negative',
    'never', 'stop', 'cancel', 'no thanks', 'skip', 'skip it', 'nay',
    'absolutely not', 'definitely not', 'no way', 'not interested',
    'rather not', "i'd rather not", 'i pass', 'nah im good',
    "no i'm good", "no i'm fine", "no that's ok", "that's ok",
    'no need', 'not necessary', 'im fine', "i'm fine", "i'm good",
  ]);

  function detectConfirmation(input, state) {
    var normalized = input.toLowerCase().trim().replace(/[!.?,;:'"]/g, '').replace(/\s+/g, ' ');

    if (!state.hasPendingOffer()) return null;

    // Check negation first
    for (var neg of NEGATIONS) {
      if (normalized === neg || normalized.indexOf(neg + ' ') === 0 || normalized.indexOf(' ' + neg) !== -1) {
        return { type: 'negation', inReplyTo: state.pendingOfferId };
      }
    }

    // Check affirmation
    for (var aff of AFFIRMATIONS) {
      if (normalized === aff || normalized.indexOf(aff + ' ') === 0 || normalized.indexOf(' ' + aff) !== -1) {
        return { type: 'affirmation', inReplyTo: state.pendingOfferId };
      }
    }

    // Fuzzy match for typos
    var words = normalized.split(/\s+/);
    for (var i = 0; i < words.length; i++) {
      var fuzzyAff = fuzzyMatch(words[i], ['yes', 'yeah', 'yep', 'sure', 'ok'], 0.75);
      if (fuzzyAff) {
        return { type: 'affirmation', inReplyTo: state.pendingOfferId };
      }
    }

    return null;
  }


  /* ═══════════════════════════════════════════════════════════════
     SECTION 5: KNOWLEDGE BASE
     Entities, intents, fenced topics, tech FAQ
     ═══════════════════════════════════════════════════════════════ */

  var KB = {

    // ── META ─────────────────────────────────────────────────
    meta: {
      companyName: 'MortApps Studios',
      tagline: 'We Build Software That Matters.',
      founded: '2024',
      founderName: 'Mort Ian K.',
      location: 'Nairobi, Kenya',
      email: 'labs@mortappsstudios.com',
      phone: '+254 113 400 063',
      whatsapp: 'https://wa.me/254113400063',
      website: 'https://mortappsstudios.com',
      founderEmail: 'klraineian@gmail.com',
      linkageWebsite: 'https://www.linkagemediahub.co.ke',
      linkageEmail: 'mort@linkagemediahub.co.ke',
    },

    // ── ENTITY REGISTRY ──────────────────────────────────────
    entities: {
      bioattex: {
        id: 'bioattex',
        type: 'product',
        domain: 'biometrics',
        aliases: ['bio attex', 'bioatex', 'bio-attex', 'the bio product', 'biometric attendance', 'attendance system', 'face recognition attendance', 'facial recognition', 'face recognition', 'bio', 'biometric'],
        shortDescription: 'an advanced AI-powered biometric attendance system with facial recognition',
        longDescription: 'BioAttex is MortApps Studios\' flagship biometric attendance solution. It uses cutting-edge AI facial recognition technology to track employee attendance with precision and reliability. What sets BioAttex apart is its commitment to privacy \u2014 all processing happens 100% locally on the device. No facial data ever leaves the hardware, ever. This means zero cloud dependency for biometric data, zero risk of facial data breaches, and full compliance with privacy-conscious organizations. It\'s designed for businesses that take both security and employee privacy seriously.',
        features: ['AI facial recognition with 100% local processing', 'Zero cloud dependency for biometric data', 'Real-time attendance tracking and reporting', 'Privacy-first architecture \u2014 no facial data leaves the device', 'Works offline \u2014 no internet required for core functionality', 'Live demo available'],
        demoUrl: 'http://mortappsstudios.com/bioatx-demo',
        buttons: [
          { label: 'Features', value: 'BioAttex features' },
          { label: 'Try Demo', value: 'BioAttex demo' },
          { label: 'Privacy Info', value: 'How does BioAttex protect privacy' },
        ],
        additionalDetails: [
          'BioAttex uses advanced neural networks for face detection and recognition, running entirely in the browser or on local hardware. The system achieves high accuracy rates even in varied lighting conditions, with different angles, and with partial face occlusion like masks or glasses.',
          'From a privacy standpoint, BioAttex is built different. Traditional biometric systems upload facial data to cloud servers for processing, which creates massive liability. BioAttex processes everything on-device. Even the facial embedding vectors never leave the local machine. This makes it compliant with GDPR, Kenya\'s Data Protection Act, and virtually any privacy framework.',
          'BioAttex is designed for easy deployment. It works out of the box with minimal setup. Employees simply stand in front of the camera, and attendance is logged automatically. No cards, no PINs, no buddy punching. Admins get a clean dashboard with real-time attendance data, exportable reports, and anomaly detection.',
        ],
      },

      phein: {
        id: 'phein',
        type: 'product',
        domain: 'recruitment',
        aliases: ['phein screener', 'smart cv screener', 'cv screener', 'cv screening', 'recruitment tool', 'candidate screening', 'phein smart', 'resume screener', 'cv scanner', 'resume scanner', 'phein screen', 'screener'],
        shortDescription: 'an AI-powered smart CV screening and candidate ranking tool',
        longDescription: 'Phein is MortApps Studios\' intelligent recruitment assistant. It uses AI to screen CVs, rank candidates, and dramatically reduce the time spent on initial recruitment filtering. Instead of manually reviewing hundreds of applications, Phein analyzes candidate qualifications, experience, and relevance to provide ranked recommendations. It\'s built for HR departments and recruitment teams who want to move faster without compromising on candidate quality. Cut your screening time in half \u2014 that\'s not a promise, that\'s what Phein does.',
        features: ['AI-powered CV analysis and scoring', 'Automatic candidate ranking based on job requirements', 'Dramatic reduction in manual screening time', 'Intelligent matching of qualifications to role requirements', 'Built for speed and accuracy in high-volume recruitment', 'Live demo available'],
        demoUrl: '/client.phein_vr-6.0_demo',
        buttons: [
          { label: 'Features', value: 'Phein features' },
          { label: 'Try Demo', value: 'Phein demo' },
          { label: 'How It Works', value: 'How does Phein work' },
        ],
        additionalDetails: [
          'Phein works by parsing CVs using natural language processing to extract key qualifications, skills, experience levels, and educational background. It then matches these extracted features against your job requirements using a proprietary scoring algorithm that considers both hard requirements and nice-to-haves.',
          'The real magic of Phein is in the ranking. It doesn\'t just filter \u2014 it ranks. Each candidate gets a composite score based on how well they match the role. You can see at a glance who your top candidates are, why they scored high, and what gaps they might have. This saves HR teams literally hours per hiring cycle.',
          'Phein is particularly powerful for high-volume recruitment. If you\'re sorting through 500 applications for a single role, manual screening could take days. Phein processes that volume in minutes and gives you a shortlist worth your time. The live demo lets you try it firsthand \u2014 you can upload a sample CV and see how the scoring works in real time.',
        ],
      },

      elthira: {
        id: 'elthira',
        type: 'product',
        domain: 'ai',
        aliases: ['elthira ai', 'elthira.ai', 'elthra', 'elthra ai', 'elthira'],
        shortDescription: 'an AI platform from the MortApps Studios ecosystem pushing the boundaries of intelligent systems',
        longDescription: 'Elthira.Ai is part of MortApps Studios\' expanding AI product lineup. It represents the studio\'s continued investment in intelligent systems that solve real-world problems. While specific capabilities are being unveiled as development progresses, Elthira.Ai is positioned to be a significant addition to our AI ecosystem. Stay tuned \u2014 this one\'s going to turn heads.',
        features: ['AI-powered capabilities in development', 'Part of the growing MortApps AI ecosystem', 'Next-generation intelligent systems'],
        buttons: [
          { label: 'Other Products', value: 'What products does MortApps Studios have' },
        ],
        additionalDetails: [
          'Elthira.Ai is MortApps Studios\' ambitious play in the broader AI platform space. While we\'re keeping the specific feature set under wraps for now, the vision is clear: build an AI platform that\'s accessible, powerful, and genuinely useful \u2014 not just a tech demo.',
          'What we can share is that Elthira.Ai draws on the same AI expertise that powers BioAttex\'s facial recognition and Phein\'s CV analysis. It\'s not starting from scratch \u2014 it\'s building on proven technology.',
        ],
      },

      briz: {
        id: 'briz',
        type: 'product',
        domain: 'productivity',
        aliases: ['breeze', 'briz app', 'the briz', 'briz'],
        shortDescription: 'an upcoming productivity and workflow management tool from MortApps Studios',
        longDescription: 'Briz is one of MortApps Studios\' upcoming products, designed to bring efficiency and clarity to workflows. The name says it all \u2014 it\'s about making things feel like a breeze. While details are still under wraps, Briz represents the studio\'s commitment to building tools that make work feel effortless. Keep an eye out for this one.',
        features: ['Workflow efficiency tools', 'Clean, intuitive interface design', 'Currently in active development'],
        buttons: [
          { label: 'Other Products', value: 'What products does MortApps Studios have' },
        ],
        additionalDetails: [
          'Briz is being designed with one principle: simplicity. There are too many productivity tools that require a productivity tool to manage. Briz is the opposite \u2014 it should feel intuitive from the first click. We\'re building for people who want to get things done, not configure dashboards.',
        ],
      },

      agrixen: {
        id: 'agrixen',
        type: 'product',
        domain: 'agriculture',
        aliases: ['agri xen', 'agri-xen', 'agrix', 'agriculture tech', 'agri tech', 'agrixen'],
        shortDescription: 'an agriculture technology solution bringing smart, data-driven tools to farming',
        longDescription: 'AgriXen is MortApps Studios\' venture into agricultural technology. It\'s designed to bring smart, tech-driven solutions to agricultural challenges \u2014 because farming deserves the same level of technological sophistication as any other industry. AgriXen is part of our broader mission to build software that matters across every sector, not just the usual ones.',
        features: ['Agriculture-focused technology solutions', 'Smart data-driven insights for farming', 'Part of MortApps Studios\' cross-industry product suite', 'Currently in development'],
        buttons: [
          { label: 'Other Products', value: 'What products does MortApps Studios have' },
        ],
        additionalDetails: [
          'Agriculture is one of the most important industries on the planet, yet it\'s often underserved by technology companies. AgriXen aims to change that. We\'re exploring how data-driven tools can help farmers make better decisions, optimize yields, and reduce waste. It\'s technology that matters in the most literal sense.',
        ],
      },

      'opticore-vipro': {
        id: 'opticore-vipro',
        type: 'product',
        domain: 'optical',
        aliases: ['opticore', 'vipro', 'opticore vipro', 'eyewear tech', 'optical tech', 'precision eyewear', 'optic'],
        shortDescription: 'precision eyewear technology bringing intelligent innovation to the optical industry',
        longDescription: 'Opticore Vipro is MortApps Studios\' precision eyewear technology product. It brings intelligent, tech-driven innovation to the optical industry \u2014 because even eyewear deserves smarter solutions. Opticore Vipro is designed for optical professionals who want to modernize their practice with cutting-edge tools. It\'s niche, it\'s focused, and it\'s exactly the kind of specialized solution MortApps Studios builds best.',
        features: ['Precision eyewear technology', 'Smart tools for optical professionals', 'Tech-driven innovation in the optical space', 'Designed for modernizing optical practices'],
        buttons: [
          { label: 'Other Products', value: 'What products does MortApps Studios have' },
        ],
        additionalDetails: [
          'Opticore Vipro targets a very specific industry \u2014 optical and eyewear \u2014 and that\'s intentional. We believe specialized solutions beat general-purpose ones every time. Optical professionals have unique needs that generic practice management software doesn\'t address well, and Opticore Vipro is built specifically for those needs.',
        ],
      },

      'linkage-media-hub': {
        id: 'linkage-media-hub',
        type: 'brand',
        domain: 'marketing',
        aliases: ['linkage media', 'linkage', 'media hub', 'linkage media hub', 'lmh', 'the agency', 'influencer agency', 'marketing agency', 'digital marketing'],
        shortDescription: 'MortApps Studios\' sister brand \u2014 a premium digital marketing and influencer agency',
        longDescription: 'Linkage Media Hub is MortApps Studios\' sister brand. It\'s a premium digital marketing agency that partners with influencers to market products, services, and ideas. Linkage Media Hub handles influencer coordination, campaign management, brand awareness campaigns, and digital visibility services. It operates as its own entity with its own identity, but shares the MortApps DNA of quality and innovation. You can find them at linkagemediahub.co.ke or reach them at mort@linkagemediahub.co.ke.',
        features: ['Influencer marketing and coordination', 'Digital campaign management', 'Brand awareness and visibility services', 'Sister brand of MortApps Studios', 'Website: linkagemediahub.co.ke'],
        buttons: [
          { label: 'Visit Website', value: 'Linkage Media Hub website' },
          { label: 'Contact', value: 'How to contact Linkage Media Hub' },
        ],
        additionalDetails: [
          'Linkage Media Hub bridges the gap between brands and influencers. Their model is simple but effective: match the right influencers with the right brands, coordinate campaigns that feel authentic, and deliver measurable results. They handle everything from influencer sourcing to campaign analytics.',
          'While Linkage Media Hub operates as its own brand, it shares the MortApps Studios DNA of quality, innovation, and results-driven execution. You could say marketing is in the family. Reach them at linkagemediahub.co.ke or mort@linkagemediahub.co.ke.',
        ],
      },

      bbis: {
        id: 'bbis',
        type: 'client',
        domain: 'insurance',
        aliases: ['bbis insurance', 'baba bima', 'baba bima insurance', 'insurance client', 'the insurance platform'],
        shortDescription: 'a valued client of MortApps Studios \u2014 Baba Bima Insurance, a whole life insurance agency',
        longDescription: 'Baba Bima Insurance (BBIS) is a valued client of MortApps Studios. They operate a whole life insurance agency, and MortApps Studios built their digital platform. BBIS is a great example of the kind of custom web solutions MortApps delivers \u2014 tailored to the specific needs of each client and industry. Their platform is at bababima.co.ke.',
        features: ['Client of MortApps Studios', 'Whole life insurance agency', 'Custom platform built by MortApps Studios', 'Website: bababima.co.ke'],
        buttons: [
          { label: 'Other Projects', value: 'What else has MortApps Studios built' },
        ],
        additionalDetails: [
          'BBIS is proof that MortApps Studios builds for any industry. Insurance has its own unique requirements around data security, compliance, and customer trust. We built Baba Bima\'s platform from the ground up to meet those requirements while still looking great and being easy to use. Their platform is live at bababima.co.ke.',
        ],
      },

      company: {
        id: 'company',
        type: 'org',
        domain: 'org',
        aliases: ['mortapps', 'mort apps', 'mortapps studios', 'the studio', 'you guys', 'your company', 'your studio', 'the company', 'the team', 'this place', 'this studio'],
        shortDescription: 'a premier software and web development studio based in Nairobi, Kenya',
        longDescription: 'MortApps Studios is a premier software and web development studio based in Nairobi, Kenya. Founded in 2024 by Mort Ian K., the studio specializes in custom web applications, AI-integrated systems, biometric solutions, and digital experiences that solve real business problems. From biometric attendance (BioAttex) to intelligent recruitment (Phein) to precision eyewear tech (Opticore Vipro), every product is built with a philosophy that technology should feel human. The studio also builds custom web applications tailored to each client\'s specific requirements \u2014 no two projects are the same. With a growing portfolio of proprietary products and client solutions, MortApps Studios is proof that world-class software can come from anywhere.',
        features: ['Custom web applications', 'AI-integrated systems', 'Biometric solutions', 'Website development', 'Digital experiences', 'Custom software for any industry'],
        buttons: [
          { label: 'Products', value: 'What products does MortApps Studios have' },
          { label: 'Services', value: 'What services does MortApps Studios offer' },
          { label: 'About Founder', value: 'Who founded MortApps Studios' },
        ],
        additionalDetails: [
          'MortApps Studios operates on a simple philosophy: technology should feel human. That means every product, every client project, every line of code should serve real people solving real problems. We don\'t build tech for tech\'s sake. We build because there\'s a gap that needs filling and we have the skills to fill it.',
          'Based in Nairobi, we\'re proof that world-class software doesn\'t have to come from Silicon Valley or London. Our location gives us a unique perspective on problems that global tech companies often overlook. And our standards? They compete with anyone, anywhere.',
        ],
      },

      founder: {
        id: 'founder',
        type: 'person',
        domain: 'people',
        aliases: ['mort ian', 'mort ian k', 'founder', 'ceo', 'creator', 'who made this', 'who built this', 'who started', 'who founded', 'owner'],
        shortDescription: 'the founder of MortApps Studios \u2014 a software engineer and problem solver',
        longDescription: 'Mort Ian K. is the founder and driving force behind MortApps Studios. A software engineer and problem solver at his core, he built the studio from the ground up with a clear philosophy: technology should feel human. He prefers to maintain a level of reserve regarding personal details \u2014 his work speaks louder than any biography could. For professional inquiries, you can reach him at klraineian@gmail.com or through the studio\'s official channels at labs@mortappsstudios.com.',
        features: ['Founder of MortApps Studios', 'Software engineer and problem solver', 'Built the studio from the ground up', 'Reachable at klraineian@gmail.com'],
        buttons: [
          { label: 'About Company', value: 'Tell me about MortApps Studios' },
          { label: 'Contact', value: 'How can I contact MortApps Studios' },
        ],
        additionalDetails: [
          'Mort Ian K. started MortApps Studios in 2024 with a belief that exceptional software can come from anywhere. As a software engineer, he\'s hands-on with the products \u2014 he doesn\'t just manage, he builds. His philosophy of "technology should feel human" isn\'t a marketing line \u2014 it\'s the standard every product has to meet.',
          'He keeps a deliberate low profile personally, preferring the work to speak for itself. But professionally, he\'s accessible. For serious inquiries, reach him at klraineian@gmail.com or through the studio at labs@mortappsstudios.com.',
        ],
      },
    },

    // ── INTENT REGISTRY ──────────────────────────────────────
    intents: [
      {
        id: 'greeting',
        triggers: {
          keywords: ['hello', 'hi', 'hey', 'howdy', 'good morning', 'good afternoon', 'good evening', 'greetings', 'sup', 'whats up', "what's up", 'yo', 'hola'],
          patterns: [/^h+i+\b/i, /^he+y+\b/i, /^yo\b/i, /^sup\b/i, /^hola/i, /^(morning|afternoon|evening)\b/i],
        },
        responses: [
          "Hey there{userNameComma}! I'm Mort-E GMA.2 \u2014 your guide to everything MortApps Studios. Whether it's our products, our story, or what we're building next \u2014 I've got you. What's on your mind?",
          "Hello{userNameComma}! Mort-E GMA.2, at your service. I know this studio inside and out \u2014 from our biometric systems to our AI tools. What can I help you with?",
          "Hey{userNameComma}! Welcome to Mort-E. Think of me as your personal guide to the MortApps universe. Products, services, founder stories \u2014 just ask.",
          "Hi{userNameComma}! I'm Mort-E GMA.2, the AI that knows MortApps Studios better than anyone. What would you like to know?",
          "Hello there{userNameComma}! Mort-E here, ready to walk you through everything MortApps Studios. What catches your interest?",
        ],
        buttons: [
          { label: 'Products', value: 'What products do you have' },
          { label: 'Services', value: 'What services do you offer' },
          { label: 'About Studio', value: 'Tell me about MortApps Studios' },
        ],
      },
      {
        id: 'how_are_you',
        triggers: {
          keywords: ['how are you', 'how are you doing', 'how do you do', 'how is it going', 'how are things', 'how have you been', 'whats up', "what's up", 'how goes it'],
          patterns: [/how (are|do|is|have|go)/i, /what'?s up/i],
        },
        responses: [
          "I'm running at full capacity{userNameComma} \u2014 always the case when you're built to know everything about a studio this ambitious. But enough about me. What about MortApps Studios can I help you with?",
          "Doing great{userNameComma}! Always sharp, always ready. I spend my time knowing this studio inside and out so I can give you the best answers. What are you curious about?",
          "Can't complain{userNameComma} \u2014 I'm an AI, that's kind of my thing. But I'm definitely at my best when someone's asking about MortApps Studios. What's on your mind?",
          "All systems go{userNameComma}! I'm here, I'm ready, and I know this studio backwards and forwards. What would you like to explore?",
        ],
        buttons: [
          { label: 'Products', value: 'What products do you have' },
          { label: 'Services', value: 'What services do you offer' },
        ],
      },
      {
        id: 'farewell',
        triggers: {
          keywords: ['bye', 'goodbye', 'see you', 'later', 'take care', 'cheers', 'good night', 'goodnight', 'see ya', 'gotta go'],
          patterns: [/see ya/i, /take care/i, /good ?bye/i, /^bye\b/i, /good ?night/i],
        },
        responses: [
          "Take care{userNameComma}. If you ever need to know anything about MortApps Studios, you know where to find me.",
          "Goodbye{userNameComma}! Remember \u2014 if you need to reach the team, labs@mortappsstudios.com is always open. Come back anytime.",
          "Later{userNameComma}! And hey \u2014 if something crosses your mind about our products or services, I'll be right here.",
          "See you around{userNameComma}. MortApps Studios is always building something new \u2014 worth checking back.",
        ],
        buttons: [],
      },
      {
        id: 'thanks',
        triggers: {
          keywords: ['thanks', 'thank you', 'appreciate', 'helpful', 'great answer', 'awesome', 'nice', 'cool', 'sweet'],
          patterns: [/thank/i, /appreciate/i, /^(nice|cool|sweet|great|awesome)\b/i],
        },
        responses: [
          "Glad I could help{userNameComma}. Anything else you want to know about MortApps Studios?",
          "You're welcome{userNameComma}! That's what I'm here for. Got more questions?",
          "Appreciate that{userNameComma}! If there's anything else on your mind about what we do, don't hesitate.",
          "Happy to help{userNameComma}. I've got plenty more where that came from \u2014 just ask.",
        ],
        buttons: [
          { label: 'Products', value: 'What products do you have' },
          { label: 'Contact', value: 'How can I contact MortApps Studios' },
        ],
      },
      {
        id: 'product_overview',
        triggers: {
          keywords: ['products', 'what do you make', 'what do you offer', 'what do you build', 'your software', 'what have you built', 'portfolio', 'your work', 'what products', 'your products', 'product lineup', 'what do you sell', 'what do you create'],
          patterns: [/what.*(products?|software|apps?|tools?|build|make|offer|create)/i, /show me.*(products?|what you)/i, /your (product|software|app|tool)/i, /product lineup/i],
        },
        responses: [
          "{userNameLead}we've built a diverse lineup at MortApps Studios. Here's the roster: BioAttex (biometric attendance with facial recognition), Phein (AI-powered CV screening), Elthira.Ai (our expanding AI platform), AgriXen (agriculture technology), Briz (productivity tools), and Opticore Vipro (precision eyewear technology). We also build custom web applications tailored to each client's requirements \u2014 and we've got more in the pipeline. Which one catches your eye?",
          "{userNameLead}MortApps Studios has six products and counting: BioAttex, Phein, Elthira.Ai, AgriXen, Briz, and Opticore Vipro \u2014 spanning biometrics, recruitment, AI, agriculture, productivity, and optics. Plus, we build custom web apps depending on what the client needs. No two projects are the same. Want me to dive into any of them?",
          "{userNameLead}our product suite covers serious ground \u2014 BioAttex for biometric attendance, Phein for smart CV screening, Elthira.Ai for AI solutions, AgriXen for agriculture tech, Briz for workflow efficiency, and Opticore Vipro for eyewear technology. And that's just what's public \u2014 there's more in development. Want details on any of these?",
        ],
        buttons: [
          { label: 'BioAttex', value: 'Tell me about BioAttex' },
          { label: 'Phein', value: 'Tell me about Phein' },
          { label: 'Elthira.Ai', value: 'Tell me about Elthira' },
          { label: 'All Products', value: 'Tell me about all MortApps products' },
        ],
      },
      {
        id: 'about_company',
        triggers: {
          keywords: ['about mortapps', 'what is mortapps', 'tell me about the company', 'who are you guys', 'what does mortapps do', 'about the studio', 'about you guys', 'your company', 'what is this', 'tell me about mortapps studios'],
          patterns: [/what is mortapps/i, /who is mortapps/i, /about (mortapps|the (company|studio))/i, /tell me about (mortapps|the (company|studio))/i],
        },
        responses: [
          "{userNameLead}MortApps Studios is a premier software and web development studio based in Nairobi, Kenya. Founded in 2024, we specialize in custom web applications, AI-integrated systems, biometric solutions, and digital experiences that solve real business problems. Our philosophy? Technology should feel human. From BioAttex to Phein to Opticore Vipro \u2014 every product reflects that belief. And we build custom web applications tailored to each client's needs. No cookie-cutter solutions here. Want to know more about what we do?",
          "{userNameLead}MortApps Studios is where serious software gets built. We're based in Nairobi, and we build custom web applications, AI-integrated systems, biometric solutions, and digital experiences that actually matter. We've got six products in our lineup and we build custom solutions for clients across industries. Our founder, Mort Ian K., started this with one belief: technology should feel human. That drives everything we build. What aspect interests you most?",
          "{userNameLead}think of MortApps Studios as a software studio that refuses to build boring things. Based in Nairobi, Kenya \u2014 we create custom web applications, AI tools, biometric systems, and digital platforms that solve real problems. We've got proprietary products like BioAttex, Phein, and several more in development, plus we build custom solutions for clients. The mission is simple: software that matters. Want the full breakdown?",
        ],
        buttons: [
          { label: 'Products', value: 'What products do you have' },
          { label: 'Services', value: 'What services do you offer' },
          { label: 'Founder', value: 'Who founded MortApps Studios' },
        ],
      },
      {
        id: 'about_founder',
        triggers: {
          keywords: ['founder', 'who founded', 'who started', 'who created', 'mort ian', 'who made mortapps', 'ceo', 'who runs', 'who is behind', 'owner', 'who built mortapps'],
          patterns: [/who (founded|started|created|made|built|runs) mortapps/i, /who is mort ian/i, /about the founder/i],
        },
        responses: [
          "Mort Ian K. is the founder and driving force behind MortApps Studios. A software engineer and problem solver at his core, he built the studio from the ground up with a clear philosophy: technology should feel human. He prefers to maintain a level of reserve regarding personal details \u2014 his work speaks louder than any biography could. For professional inquiries, you can reach him at klraineian@gmail.com or through the studio at labs@mortappsstudios.com.",
          "The man behind MortApps Studios is Mort Ian K. He's a software engineer who built this studio on the belief that technology should feel human, not robotic. He's intentional about keeping a low profile personally \u2014 lets the work do the talking. But professionally? He's all in. You can reach him at klraineian@gmail.com for serious inquiries, or the studio at labs@mortappsstudios.com.",
          "Mort Ian K. \u2014 founder, engineer, the mind behind MortApps Studios. He started this studio with a philosophy that technology should feel human, and every product we ship reflects that. He keeps things reserved on the personal side, but professionally he's accessible. Reach out at klraineian@gmail.com or through the studio channels.",
        ],
        buttons: [
          { label: 'About Company', value: 'Tell me about MortApps Studios' },
          { label: 'Contact', value: 'How can I contact the founder' },
        ],
      },
      {
        id: 'services',
        triggers: {
          keywords: ['services', 'what do you do', 'what can you do for me', 'how can you help', 'what do you offer', 'solutions', 'what solutions', 'your services', 'how can mortapps help'],
          patterns: [/what (services|solutions|can you)/i, /how can you help/i, /your services/i],
        },
        responses: [
          "{userNameLead}MortApps Studios offers a focused range of services: custom web application development, website design and development, AI integration services, biometric system implementation, and custom software solutions tailored to your specific requirements. We don't do cookie-cutter \u2014 every project is built around what you actually need. Beyond that, our sister brand Linkage Media Hub handles digital marketing and influencer coordination. Want to discuss a specific project? Hit up labs@mortappsstudios.com or use the contact form on our site.",
          "{userNameLead}here's what we bring to the table: custom web applications built from scratch, AI integration that makes your existing systems smarter, biometric solutions with our BioAttex platform, website development that actually looks and works right, and custom software for any industry. Every solution is tailored \u2014 we don't recycle. If you want to talk specifics, reach out at labs@mortappsstudios.com or drop us a message through the contact form.",
          "{userNameLead}our services span custom web applications, AI integration, biometric systems, website development, and bespoke software solutions. The common thread? Everything is built to match your needs, not the other way around. We also have Linkage Media Hub as a sister brand for digital marketing. Ready to start a conversation? labs@mortappsstudios.com or the contact form is the way in.",
        ],
        buttons: [
          { label: 'Custom Project', value: 'I need a custom web application' },
          { label: 'Contact Us', value: 'How can I contact MortApps Studios' },
          { label: 'Products', value: 'What products do you have' },
        ],
      },
      {
        id: 'contact',
        triggers: {
          keywords: ['contact', 'reach out', 'get in touch', 'email', 'phone', 'call', 'how to contact', 'talk to someone', 'speak to someone', 'how to reach', 'contact info', 'contact details', 'phone number', 'email address'],
          patterns: [/how (to|can i) (contact|reach|call|email)/i, /get in touch/i, /contact (info|details|information)/i],
        },
        responses: [
          "{userNameLead}here's how to reach us: Email is the most direct \u2014 labs@mortappsstudios.com. You can also call or WhatsApp at +254 113 400 063. If you'd rather use a form, there's one right on our website at mortappsstudios.com#contact. For founder-specific inquiries, Mort Ian K. is available at klraineian@gmail.com. What works best for you?",
          "{userNameLead}it's easy \u2014 labs@mortappsstudios.com for general inquiries, +254 113 400 063 for calls or WhatsApp, or the contact form on our website. If it's specifically for Mort Ian K., you can reach him at klraineian@gmail.com. We're responsive \u2014 you won't be waiting days for a reply.",
          "{userNameLead}you've got options: labs@mortappsstudios.com (email), +254 113 400 063 (call or WhatsApp), or the contact form on mortappsstudios.com. For the founder directly, klraineian@gmail.com works. Pick whatever's most comfortable for you.",
        ],
        buttons: [
          { label: 'WhatsApp', value: 'Open WhatsApp' },
          { label: 'Schedule Meeting', value: 'I want to schedule a meeting' },
        ],
      },
      {
        id: 'schedule_meeting',
        triggers: {
          keywords: ['schedule', 'meeting', 'book a call', 'set up a meeting', 'appointment', 'consultation', 'discuss a project', 'talk about a project', 'i need to talk'],
          patterns: [/schedule (a )?(meeting|call|consultation)/i, /book (a )?(call|meeting)/i, /discuss (a )?project/i],
        },
        responses: [
          "For scheduling a meeting, the best move is to use the contact form on our website at mortappsstudios.com#contact. Include what you'd like to discuss and your preferred times \u2014 the team will get back to you quickly. You can also email labs@mortappsstudios.com directly. We don't do automated booking \u2014 real humans coordinate real meetings here.",
          "Want to meet? Head to mortappsstudios.com#contact and use the contact form \u2014 tell us what you need and when works for you. Alternatively, email labs@mortappsstudios.com. We keep it personal, not automated. Someone from the team will coordinate directly with you.",
          "The fastest way to set up a meeting is through the contact form on our site at mortappsstudios.com#contact. Drop your details, what you'd like to discuss, and your availability. You can also email labs@mortappsstudios.com. We respond promptly \u2014 you won't be left hanging.",
        ],
        buttons: [
          { label: 'Contact Form', value: 'How to use the contact form' },
          { label: 'Email Us', value: 'What is the email for MortApps Studios' },
        ],
      },
      {
        id: 'demo',
        triggers: {
          keywords: ['demo', 'try it', 'test it', 'see it in action', 'live demo', 'try out', 'preview', 'test drive', 'can i try'],
          patterns: [/can i (try|test|see|demo)/i, /show me a demo/i, /live demo/i, /try (it|out|bioattex|phein)/i],
        },
        responses: [
          "{userNameLead}we've got live demos available for some of our products. BioAttex has a demo at mortappsstudios.com/bioatx-demo where you can see the biometric attendance system in action. Phein's CV screener demo is at mortappsstudios.com/client.phein_vr-6.0_demo. For the others, reach out at labs@mortappsstudios.com and we can arrange something. Which product are you interested in?",
          "{userNameLead}yes \u2014 you can try BioAttex and Phein right now. BioAttex demo: mortappsstudios.com/bioatx-demo. Phein demo: mortappsstudios.com/client.phein_vr-6.0_demo. For other products, contact us at labs@mortappsstudios.com and we'll set something up. Nothing beats seeing it in action.",
          "{userNameLead}demos are available! BioAttex (biometric attendance) \u2014 mortappsstudios.com/bioatx-demo. Phein (CV screening) \u2014 mortappsstudios.com/client.phein_vr-6.0_demo. For other products or a personalized walkthrough, reach out to labs@mortappsstudios.com. We're happy to show you what we've built.",
        ],
        buttons: [
          { label: 'BioAttex Demo', value: 'BioAttex demo' },
          { label: 'Phein Demo', value: 'Phein demo' },
          { label: 'All Products', value: 'What products do you have' },
        ],
      },
      {
        id: 'capabilities',
        triggers: {
          keywords: ['what can you do', 'what do you know', 'what are you', 'who are you', 'your capabilities', 'help me', 'how can you help me', 'what should i ask'],
          patterns: [/what can you/i, /what are you\b/i, /your capabilities/i, /how can you help/i],
        },
        responses: [
          "{userNameLead}I'm Mort-E GMA.2 \u2014 built to know everything about MortApps Studios. I can tell you about our products (BioAttex, Phein, Elthira.Ai, AgriXen, Briz, Opticore Vipro), our services, our founder Mort Ian K., our sister brand Linkage Media Hub, how to contact us, schedule meetings, or try demos. I also know about basic tech concepts related to our work. Basically, if it's about MortApps Studios, I'm your AI. What are you curious about?",
          "Think of me as the MortApps Studios encyclopedia with personality. I cover: all six products, services and custom development, the founder and company story, contact information and meeting scheduling, demo links, and our sister brand Linkage Media Hub. I also handle tech questions about our approach. What would you like to explore?",
          "I know MortApps Studios inside and out. Products, services, founder story, contact details, demos, tech stack \u2014 ask away. I'm not a general-purpose AI, but when it comes to this studio, I'm the best source you'll find. What's on your mind?",
        ],
        buttons: [
          { label: 'Products', value: 'What products do you have' },
          { label: 'Services', value: 'What services do you offer' },
          { label: 'Demos', value: 'Can I try any demos' },
          { label: 'Contact', value: 'How can I contact MortApps Studios' },
        ],
      },
      {
        id: 'location',
        triggers: {
          keywords: ['where are you', 'location', 'where is mortapps', 'where are you based', 'address', 'nairobi', 'kenya', 'where is the studio', 'where do you work from'],
          patterns: [/where (are you|is mortapps|is the studio)/i, /your location/i, /where (are you )?based/i],
        },
        responses: [
          "{userNameLead}MortApps Studios is based in Nairobi, Kenya. We build world-class software from right here in East Africa \u2014 and we serve clients globally. Location doesn't limit quality. Need to reach us? labs@mortappsstudios.com or +254 113 400 063.",
          "Nairobi, Kenya \u2014 that's where we operate from. MortApps Studios proves you don't need to be in Silicon Valley to build exceptional software. We work with clients everywhere. Want to connect? labs@mortappsstudios.com.",
          "We're headquartered in Nairobi, Kenya. Global reach, local roots. The best software doesn't have a zip code \u2014 it has standards. And ours are high. Reach us at labs@mortappsstudios.com or +254 113 400 063.",
        ],
        buttons: [
          { label: 'About Studio', value: 'Tell me about MortApps Studios' },
          { label: 'Contact', value: 'How can I contact MortApps Studios' },
        ],
      },
      {
        id: 'tech_stack',
        triggers: {
          keywords: ['tech stack', 'technologies', 'what technology', 'what do you use', 'programming', 'languages', 'frameworks', 'what do you build with', 'stack', 'tools you use'],
          patterns: [/what (tech|technology|languages|frameworks|stack)/i, /tech stack/i, /build with/i, /programming languages/i],
        },
        responses: [
          "MortApps Studios builds with a versatile tech stack. For web applications, we work with HTML, CSS, JavaScript, and modern frameworks. For AI-powered products like BioAttex and Phein, we leverage machine learning and facial recognition tech. We also utilize GitHub Pages for reliable hosting and build custom backend solutions depending on the project. The stack adapts to the challenge \u2014 we're not married to one tool. Curious about a specific product's tech?",
          "Our tech stack is project-driven, not dogmatic. We use HTML, CSS, JavaScript, and modern frameworks for web development. For AI products, we work with machine learning and computer vision technologies. Hosting includes platforms like GitHub Pages, and we build custom solutions as needed. The right tool for the right job \u2014 that's the philosophy. Want to know more about how a specific product is built?",
          "We're pragmatic about tech. Web development with HTML, CSS, JavaScript, and frameworks. AI and ML for products like BioAttex and Phein. GitHub Pages for hosting. Custom backends when the project demands it. We choose tools based on what the project needs, not what's trendy. Want specifics on any product's architecture?",
        ],
        buttons: [
          { label: 'BioAttex', value: 'How is BioAttex built' },
          { label: 'Phein', value: 'How does Phein work' },
          { label: 'Products', value: 'What products do you have' },
        ],
      },
      {
        id: 'motivation',
        triggers: {
          keywords: ['why did you start', 'mission', 'vision', 'why mortapps', 'purpose', 'what drives', 'philosophy', 'why this company', 'why build', 'motivation'],
          patterns: [/why (did you|mortapps)/i, /your (mission|vision|philosophy)/i, /what drives/i, /why (this|the) company/i],
        },
        responses: [
          "The philosophy at MortApps Studios is simple: technology should feel human. Too much software is built for machines, not people. Mort Ian K. started this studio because he believed that world-class software doesn't have to come from Silicon Valley \u2014 it can come from Nairobi, and it can solve real problems for real businesses. We're not here to chase trends. We're here to build things that matter. That's the mission.",
          "MortApps Studios exists because Mort Ian K. saw a gap: businesses needed software that actually worked for them, not the other way around. The mission is clear \u2014 build technology that feels human, solves real problems, and doesn't compromise on quality. We value long-term relationships over quick transactions, and we'd rather build six excellent products than sixty mediocre ones. That's what drives us.",
          "Our driving philosophy: technology should feel human. We started this studio to prove that exceptional software can come from anywhere \u2014 Nairobi included. We build for impact, not for vanity metrics. Long-term relationships, genuine problem-solving, and products that people actually want to use. That's the MortApps way.",
        ],
        buttons: [
          { label: 'About Founder', value: 'Who founded MortApps Studios' },
          { label: 'Products', value: 'What products do you have' },
        ],
      },
      {
        id: 'hiring',
        triggers: {
          keywords: ['hiring', 'jobs', 'careers', 'work at mortapps', 'join the team', 'recruiting', 'open positions', 'job openings', 'employment'],
          patterns: [/are you hiring/i, /work at mortapps/i, /join (the )?team/i, /job (openings|positions)/i, /career/i],
        },
        responses: [
          "MortApps Studios is always interested in talented people who share our philosophy. We don't post traditional job listings \u2014 but if you're a developer, designer, or problem solver who believes technology should feel human, reach out. Email labs@mortappsstudios.com with who you are and what you bring to the table. We read every message.",
          "We don't do typical hiring \u2014 but we're always open to meeting exceptional people. If you think you'd fit the MortApps culture \u2014 building things that matter, quality over quantity, technology that feels human \u2014 introduce yourself at labs@mortappsstudios.com. No form letters, please. Just be real.",
          "Hiring at MortApps Studios isn't a formal process \u2014 it's a conversation. If you're skilled, passionate, and aligned with our mission, we want to hear from you. Drop us a line at labs@mortappsstudios.com. Tell us what you can do and why MortApps matters to you.",
        ],
        buttons: [
          { label: 'Contact', value: 'How can I contact MortApps Studios' },
          { label: 'About Studio', value: 'Tell me about MortApps Studios' },
        ],
      },
      {
        id: 'partnership',
        triggers: {
          keywords: ['partner', 'collaboration', 'collaborate', 'work together', 'partnership', 'business opportunity', 'joint venture'],
          patterns: [/partner(ship)?/i, /work together/i, /collaborat/i, /business opportunit/i],
        },
        responses: [
          "We're open to the right partnerships. If you've got a project, an idea, or a business case that aligns with what MortApps Studios does, we'd love to hear about it. The best starting point is labs@mortappsstudios.com \u2014 tell us what you're thinking, and we'll take it from there. We don't do generic partnerships \u2014 we do meaningful ones.",
          "Partnership inquiries are welcome. Whether it's a collaboration, a client project, or a business opportunity \u2014 if it makes sense for both sides, we're interested. Reach out at labs@mortappsstudios.com with the details. We prefer substance over pitches.",
          "Interested in working with MortApps Studios? Good \u2014 we're interested in serious collaborations. Email labs@mortappsstudios.com with your proposal or idea. We respond to genuine opportunities, not mass outreach. Let's build something worth building.",
        ],
        buttons: [
          { label: 'Contact Us', value: 'How can I contact MortApps Studios' },
          { label: 'Services', value: 'What services do you offer' },
        ],
      },
      {
        id: 'custom_development',
        triggers: {
          keywords: ['custom app', 'custom software', 'build me', 'i need an app', 'i need a website', 'build a website', 'develop for me', 'can you build', 'web app for', 'application for'],
          patterns: [/can you build/i, /build (me|a|an)/i, /i need (a |an )?(app|website|software|application)/i, /custom (app|software|website|web)/i],
        },
        responses: [
          "{userNameLead}absolutely \u2014 custom web application development is core to what MortApps Studios does. Every project is built from scratch around your specific requirements, not recycled from a template. Whether it's a web app, a website, a platform, or something unique \u2014 we handle it. The best next step is to reach out at labs@mortappsstudios.com or use the contact form on our site with your project details. We'll take it from there.",
          "{userNameLead}that's exactly what we do. MortApps Studios builds custom web applications and websites tailored to each client's requirements. No two projects are the same \u2014 we don't do cookie-cutter. Tell us what you need at labs@mortappsstudios.com or through the contact form on mortappsstudios.com, and we'll scope it out.",
          "{userNameLead}custom development is our bread and butter. From web applications to websites to full platforms \u2014 we build what you need, the way you need it. Head to mortappsstudios.com#contact and use the form, or email labs@mortappsstudios.com directly. Include what you're looking to build and we'll start the conversation.",
        ],
        buttons: [
          { label: 'Contact Us', value: 'How can I contact MortApps Studios' },
          { label: 'Our Services', value: 'What services do you offer' },
          { label: 'Portfolio', value: 'What products do you have' },
        ],
      },
      {
        id: 'linkage_detail',
        triggers: {
          keywords: ['linkage media hub', 'linkage media', 'influencer marketing', 'digital marketing agency', 'influencer agency', 'lmh'],
          patterns: [/linkage media/i, /influencer (marketing|agency)/i, /digital marketing agency/i],
        },
        responses: [
          "Linkage Media Hub is MortApps Studios' sister brand \u2014 a premium digital marketing agency that partners with influencers to market products, services, and ideas. They handle influencer coordination, campaign management, brand awareness, and digital visibility services. They operate as their own entity with their own identity, but carry the same MortApps DNA of quality and innovation. Check them out at linkagemediahub.co.ke or reach them at mort@linkagemediahub.co.ke.",
          "Linkage Media Hub is our sister brand \u2014 think of it as the marketing arm of the MortApps family. They specialize in influencer marketing, campaign coordination, and digital brand visibility. They're their own brand, but the quality standard is the same. Website: linkagemediahub.co.ke. Email: mort@linkagemediahub.co.ke.",
          "That's our sister brand! Linkage Media Hub handles influencer marketing, campaign management, and digital visibility. They connect brands with influencers to create authentic marketing campaigns. You can find them at linkagemediahub.co.ke or mort@linkagemediahub.co.ke. Same family, different focus.",
        ],
        buttons: [
          { label: 'Contact LMH', value: 'How to contact Linkage Media Hub' },
          { label: 'About Studio', value: 'Tell me about MortApps Studios' },
        ],
      },
      {
        id: 'who_made_you',
        triggers: {
          keywords: ['who made you', 'who built you', 'who created you', 'who developed you', 'who programmed you', 'who designed you', 'your creator', 'your developer'],
          patterns: [/who (made|built|created|developed|programmed|designed) (you|mort-e|morte)/i, /your (creator|developer|maker)/i],
        },
        responses: [
          "I was built by MortApps Studios \u2014 specifically as part of the MortApps AI Division. I'm Mort-E GMA.2, designed to know everything about this studio and share it with visitors like you. Think of me as the studio's digital ambassador.",
          "The team at MortApps Studios created me. I'm their in-house AI, built to be the most knowledgeable guide to everything MortApps. Every response I give is powered by the studio's knowledge base, so you're getting information straight from the source.",
          "MortApps Studios built me from the ground up. I'm not a third-party chatbot \u2014 I was designed in-house to understand this studio, its products, and its philosophy at a deep level. That's why I'm good at what I do.",
        ],
        buttons: [
          { label: 'About Studio', value: 'Tell me about MortApps Studios' },
          { label: 'Products', value: 'What products do you have' },
        ],
      },
      // ── v4: NEW INTENTS — Tech FAQ ───────────────────────────
      {
        id: 'ai_question',
        triggers: {
          keywords: ['what is ai', 'artificial intelligence', 'machine learning', 'how does ai work', 'what is ml', 'deep learning', 'neural network', 'what is nlp'],
          patterns: [/what is (ai|artificial intelligence|machine learning|ml|deep learning|nlp)/i, /how does ai work/i, /explain (ai|machine learning)/i],
        },
        responses: [
          "AI \u2014 Artificial Intelligence \u2014 is the broad field of creating systems that can perform tasks typically requiring human intelligence. That includes things like understanding language, recognizing images, making decisions, and learning from data. At MortApps Studios, we use AI practically: BioAttex uses it for facial recognition, Phein uses it for CV analysis. We don't build AI for the hype \u2014 we build it because it solves real problems. Want to know more about how we use AI?",
          "Artificial Intelligence is about building systems that can perceive, reason, and act. Machine Learning (a subset of AI) is where systems learn patterns from data instead of being explicitly programmed for every scenario. Deep Learning uses neural networks \u2014 layered structures inspired by the brain \u2014 to tackle complex tasks like image and speech recognition. MortApps Studios applies these concepts in products like BioAttex and Phein. Curious about a specific product?",
        ],
        buttons: [
          { label: 'BioAttex AI', value: 'How does BioAttex use AI' },
          { label: 'Phein AI', value: 'How does Phein use AI' },
          { label: 'Our Products', value: 'What products do you have' },
        ],
      },
      {
        id: 'privacy_question',
        triggers: {
          keywords: ['privacy', 'data protection', 'gdpr', 'data security', 'how is data protected', 'is my data safe', 'local processing', 'on device'],
          patterns: [/how.*(data|privacy|secure|safe|protect)/i, /is.*(data|info).*(safe|secure|protected)/i, /local processing/i, /data protection/i],
        },
        responses: [
          "Data privacy is a cornerstone of how MortApps Studios builds. Our approach is simple: process data locally whenever possible. BioAttex is the prime example \u2014 all facial recognition processing happens 100% on the device. No biometric data ever leaves the hardware. This means zero cloud dependency for sensitive data, zero risk of cloud-based data breaches, and natural compliance with frameworks like GDPR and Kenya's Data Protection Act. We believe privacy isn't a feature \u2014 it's a right. Want to know more about a specific product's privacy approach?",
          "Privacy by design \u2014 that's our approach. Instead of collecting data and trying to protect it later, we avoid collecting it in the first place. BioAttex processes everything on-device. No data leaves, no data can be breached. This is fundamentally different from cloud-dependent systems that store your data on someone else's server. It also means compliance with GDPR, Kenya's Data Protection Act, and most privacy regulations comes naturally. Want details?",
        ],
        buttons: [
          { label: 'BioAttex Privacy', value: 'How does BioAttex protect privacy' },
          { label: 'About Studio', value: 'Tell me about MortApps Studios' },
        ],
      },
      {
        id: 'bioattex_privacy',
        triggers: {
          keywords: ['bioattex privacy', 'bioattex data', 'how does bioattex protect', 'bioattex security', 'bioattex gdpr', 'is bioattex secure', 'bioattex local'],
          patterns: [/bioattex.*(privacy|data|protect|secure|local|gdpr)/i, /how.*bioattex.*(privacy|protect|secure)/i],
        },
        responses: [
          "BioAttex takes privacy seriously \u2014 seriously enough that it was designed from the ground up to process everything locally. Here's what that means: all facial recognition happens on the device itself. The camera feed is processed in real-time, the facial embedding vectors are generated locally, and no biometric data \u2014 not even the mathematical representations of faces \u2014 ever leaves the hardware. This means zero cloud dependency, zero risk of facial data breaches, and automatic compliance with GDPR, Kenya's Data Protection Act, and virtually any privacy framework. Traditional systems upload your face data to servers. BioAttex doesn't. Period.",
          "Privacy is the whole point of BioAttex. Every other biometric attendance system on the market sends facial data to cloud servers for processing. BioAttex does everything on-device \u2014 no data ever leaves. Even the neural network inference runs locally. This makes it inherently compliant with GDPR, the Kenya Data Protection Act, and any privacy regulation. No data to leak, no data to hack, no data to worry about. Want to try the demo?",
        ],
        buttons: [
          { label: 'Try Demo', value: 'BioAttex demo' },
          { label: 'BioAttex Features', value: 'BioAttex features' },
        ],
      },
      {
        id: 'bioattex_features',
        triggers: {
          keywords: ['bioattex features', 'bioattex what can it do', 'what does bioattex do', 'bioattex capabilities', 'bioattex specs'],
          patterns: [/bioattex.*(features?|capabilities|specs|what can|what does)/i],
        },
        responses: [
          "BioAttex comes packed with capabilities: AI facial recognition with 100% local processing, zero cloud dependency for biometric data, real-time attendance tracking and reporting, privacy-first architecture where no facial data leaves the device, full offline functionality for core features, and a live demo you can try right now. It works out of the box \u2014 employees just stand in front of the camera and attendance is logged. No cards, no PINs, no buddy punching. Admins get a dashboard with real-time data, exportable reports, and anomaly detection. Want me to go deeper?",
        ],
        buttons: [
          { label: 'Go Deeper', value: 'Tell me more about BioAttex' },
          { label: 'Try Demo', value: 'BioAttex demo' },
          { label: 'Privacy Info', value: 'How does BioAttex protect privacy' },
        ],
      },
      {
        id: 'phein_features',
        triggers: {
          keywords: ['phein features', 'phein what can it do', 'what does phein do', 'phein capabilities', 'phein specs', 'phein how does it work', 'how does phein work'],
          patterns: [/phein.*(features?|capabilities|specs|what can|what does|how)/i, /how does phein/i],
        },
        responses: [
          "Phein's feature set is built for speed and accuracy in recruitment: AI-powered CV analysis and scoring, automatic candidate ranking based on your job requirements, dramatic reduction in manual screening time, intelligent matching of qualifications to role requirements, and it's built specifically for high-volume recruitment. Here's how it works: Phein parses CVs using natural language processing to extract qualifications, skills, and experience. It then matches these against your requirements using a scoring algorithm. Each candidate gets a composite score \u2014 you see at a glance who your top picks are. There's a live demo available too.",
        ],
        buttons: [
          { label: 'Go Deeper', value: 'Tell me more about Phein' },
          { label: 'Try Demo', value: 'Phein demo' },
        ],
      },
      {
        id: 'linkage_contact',
        triggers: {
          keywords: ['contact linkage', 'linkage email', 'linkage website', 'reach linkage media', 'linkage media hub contact', 'how to contact linkage'],
          patterns: [/contact linkage/i, /linkage.*(email|website|contact|reach|phone)/i, /how.*(contact|reach).*linkage/i],
        },
        responses: [
          "You can reach Linkage Media Hub at their website linkagemediahub.co.ke or via email at mort@linkagemediahub.co.ke. They're responsive and always open to discussing influencer marketing, campaign coordination, or digital visibility strategies.",
        ],
        buttons: [
          { label: 'About LMH', value: 'Tell me about Linkage Media Hub' },
          { label: 'Contact Studio', value: 'How can I contact MortApps Studios' },
        ],
      },
    ],

    // ── TOPIC FENCES ─────────────────────────────────────────
    fencedTopics: [
      {
        id: 'pricing',
        triggers: {
          keywords: ['price', 'cost', 'how much', 'pricing', 'fee', 'charge', 'rate', 'quote', 'invoice', 'expensive', 'cheap', 'afford', 'budget', 'how much does', 'what does it cost'],
          patterns: [/how much/i, /what.*(cost|price|charge|fee)/i, /pricing/i],
        },
        redirectResponse: [
          "Pricing depends entirely on the project \u2014 and that's actually a good thing. It means you get a solution built around your actual needs, not a generic price tag for a generic product. The best move is to reach out at labs@mortappsstudios.com or through the contact form on our site, tell us what you're looking for, and we'll put together something tailored. Fair, transparent, and specific to you.",
          "I can't give you a one-size-fits-all number because we don't do one-size-fits-all work. Every project is scoped individually based on what you actually need. Reach out at labs@mortappsstudios.com or use the contact form \u2014 the team will give you a proper conversation about it, not a vague ballpark.",
          "Good question, but pricing isn't something I can answer accurately here \u2014 it varies based on scope, complexity, and requirements. What I can tell you is that we're fair and transparent. Contact the team at labs@mortappsstudios.com or via the website form for a real discussion about your project and investment.",
        ],
        buttons: [
          { label: 'Contact Us', value: 'How can I contact MortApps Studios' },
          { label: 'Services', value: 'What services do you offer' },
        ],
      },
      {
        id: 'competitors',
        triggers: {
          keywords: ['vs', 'versus', 'compared to', 'better than', 'worse than', 'competitor', 'alternative', 'competition', 'other companies like', 'similar to'],
          patterns: [/\bvs\b/i, /versus/i, /compared to/i, /better than/i, /worse than/i, /alternative/i],
        },
        redirectResponse: [
          "I focus on what MortApps Studios does best rather than comparing. What I can tell you is that our approach is different: every solution is custom-built, every product has a clear purpose, and our philosophy of 'technology should feel human' means we prioritize people over processes. If you want to see how we stack up, the best way is to reach out at labs@mortappsstudios.com and tell us what you need.",
          "Rather than comparing, let me tell you what makes MortApps Studios stand out: we build custom solutions from scratch, we have six proprietary products across diverse industries, and we operate from Nairobi with global standards. The work speaks for itself. Want to explore what we've built?",
        ],
        buttons: [
          { label: 'Products', value: 'What products do you have' },
          { label: 'Services', value: 'What services do you offer' },
        ],
      },
      {
        id: 'internal_details',
        triggers: {
          keywords: ['source code', 'internal architecture', 'team size', 'revenue', 'profit', 'salary', 'how many employees', 'investors', 'funding', 'valuation', 'database', 'server', 'infrastructure details'],
          patterns: [/how many (employees|people|developers|engineers)/i, /team size/i, /(revenue|profit|funding|investors|valuation)/i, /internal (architecture|details|structure)/i],
        },
        redirectResponse: [
          "That's internal information I can't share publicly. What I can tell you is that MortApps Studios is a focused, efficient team that punches well above its weight. If you have a specific business inquiry, reach out at labs@mortappsstudios.com and the team will address it appropriately.",
          "Some things are better discussed directly. For business-specific questions, the best route is labs@mortappsstudios.com \u2014 the team is responsive and happy to have real conversations. What else about our products or services can I help with?",
        ],
        buttons: [
          { label: 'Contact', value: 'How can I contact MortApps Studios' },
          { label: 'Products', value: 'What products do you have' },
        ],
      },
    ],
  };


  /* ═══════════════════════════════════════════════════════════════
     SECTION 6: INTENT MATCHING ENGINE
     TF-IDF weighted scoring + keyword + pattern + entity matching
     ═══════════════════════════════════════════════════════════════ */

  var intentKeywordIndex = {};
  var allIntentKeywords = [];

  function buildIntentIndex() {
    intentKeywordIndex = {};
    allIntentKeywords = [];
    for (var i = 0; i < KB.intents.length; i++) {
      var intent = KB.intents[i];
      var keywords = intent.triggers.keywords || [];
      for (var j = 0; j < keywords.length; j++) {
        var kw = keywords[j].toLowerCase();
        var stemmed = _stem(kw);
        if (!intentKeywordIndex[stemmed]) intentKeywordIndex[stemmed] = [];
        intentKeywordIndex[stemmed].push(intent.id);
        allIntentKeywords.push(kw);
      }
    }
  }

  var entityAliasIndex = {};

  function buildEntityIndex() {
    entityAliasIndex = {};
    var entities = KB.entities;
    for (var key in entities) {
      if (!entities.hasOwnProperty(key)) continue;
      var entity = entities[key];
      var aliases = entity.aliases || [];
      for (var i = 0; i < aliases.length; i++) {
        var alias = aliases[i].toLowerCase();
        var stemmed = _stem(alias);
        if (!entityAliasIndex[stemmed]) entityAliasIndex[stemmed] = [];
        entityAliasIndex[stemmed].push(entity.id);
      }
      entityAliasIndex[entity.id.toLowerCase()] = [entity.id];
    }
  }

  function scoreIntentMatch(intent, normalizedInput) {
    var score = 0;
    var inputLower = normalizedInput.normalized;
    var inputTokens = normalizedInput.expanded;

    var keywords = intent.triggers.keywords || [];
    for (var i = 0; i < keywords.length; i++) {
      var kw = keywords[i].toLowerCase();
      if (inputLower.indexOf(kw) !== -1) {
        score += 3;
      }
      var stemmedKw = _stem(kw);
      for (var j = 0; j < inputTokens.length; j++) {
        if (inputTokens[j] === stemmedKw || inputTokens[j] === kw) {
          score += 2;
        }
      }
      var fuzzy = fuzzyMatch(inputLower, [kw], 0.8);
      if (fuzzy) score += 1;
    }

    var patterns = intent.triggers.patterns || [];
    for (var p = 0; p < patterns.length; p++) {
      if (patterns[p].test(inputLower)) {
        score += 5;
      }
    }

    return score;
  }

  function findEntity(normalizedInput) {
    var inputLower = normalizedInput.normalized;
    var bestEntity = null;
    var bestScore = 0;

    var entities = KB.entities;
    for (var key in entities) {
      if (!entities.hasOwnProperty(key)) continue;
      var entity = entities[key];
      var score = 0;
      var aliases = entity.aliases || [];

      for (var i = 0; i < aliases.length; i++) {
        var alias = aliases[i].toLowerCase();
        if (inputLower.indexOf(alias) !== -1) {
          score += 5;
        }
        var stemmedAlias = _stem(alias);
        for (var j = 0; j < normalizedInput.stemmed.length; j++) {
          if (normalizedInput.stemmed[j] === stemmedAlias) {
            score += 3;
          }
        }
        var fuzzy = fuzzyMatch(inputLower, [alias], 0.8);
        if (fuzzy) score += 1;
      }

      if (inputLower.indexOf(entity.id.toLowerCase()) !== -1) {
        score += 4;
      }

      if (score > bestScore) {
        bestScore = score;
        bestEntity = entity;
      }
    }

    return bestScore > 0 ? bestEntity : null;
  }

  function checkFencedTopics(normalizedInput) {
    var inputLower = normalizedInput.normalized;
    for (var i = 0; i < KB.fencedTopics.length; i++) {
      var topic = KB.fencedTopics[i];
      var keywords = topic.triggers.keywords || [];
      var patterns = topic.triggers.patterns || [];

      for (var j = 0; j < keywords.length; j++) {
        if (inputLower.indexOf(keywords[j].toLowerCase()) !== -1) {
          return topic;
        }
      }
      for (var p = 0; p < patterns.length; p++) {
        if (patterns[p].test(inputLower)) {
          return topic;
        }
      }
    }
    return null;
  }


  /* ═══════════════════════════════════════════════════════════════
     SECTION 7: RESPONSE GENERATOR (v4 — Structured Responses)
     Returns { text, buttons } objects for UI rendering
     Template engine, personalization, anti-repetition,
     depth tracking, offer management
     ═══════════════════════════════════════════════════════════════ */

  var memory = new UserMemory();
  var state = new ConversationState();

  // v4: Create a response object with text and optional buttons
  function makeResponse(text, buttons) {
    return {
      text: text || '',
      buttons: buttons || [],
    };
  }

  // Pick a response using anti-repetition
  function pickResponse(responses, topicId) {
    if (!responses || responses.length === 0) return "I'm here to help. What would you like to know about MortApps Studios?";

    var available = responses.filter(function (r) {
      return !state.isResponseUsed(topicId, r);
    });

    if (available.length === 0) {
      state.usedResponses[topicId] = [];
      available = responses;
    }

    var chosen = available[Math.floor(Math.random() * available.length)];
    state.markResponseUsed(topicId, chosen);
    return chosen;
  }

  // Personalize response template
  function personalizeResponse(template) {
    var name = memory.getName();
    // When name exists: ", Alice" for mid-sentence, "Alice, " for sentence-start
    var userNameComma = name ? ', ' + name : '';
    var userNameLead = name ? name + ', ' : '';
    var userNameExclaim = name ? ', ' + name + '!' : '!';

    return template
      .replace(/\{userName\}/g, name || 'friend')
      .replace(/\{userNameLead\}/g, userNameLead)
      .replace(/\{userNameComma\}/g, userNameComma)
      .replace(/\{userNameExclaim\}/g, userNameExclaim);
  }

  // Format entity name for display
  function formatEntityName(id) {
    var names = {
      'bioattex': 'BioAttex',
      'phein': 'Phein',
      'elthira': 'Elthira.Ai',
      'briz': 'Briz',
      'agrixen': 'AgriXen',
      'opticore-vipro': 'Opticore Vipro',
      'linkage-media-hub': 'Linkage Media Hub',
      'bbis': 'Baba Bima Insurance (BBIS)',
      'company': 'MortApps Studios',
      'founder': 'Mort Ian K.',
    };
    return names[id] || id;
  }

  // Generate entity response based on depth (v4: returns {text, buttons})
  function generateEntityResponse(entity, userConfirmed) {
    var topicId = 'entity_' + entity.id;
    var depth = state.getDepth(topicId);
    var name = memory.getName();
    var namePrefix = name ? name + ', ' : '';

    if (userConfirmed || (depth > 0 && state.hasPendingOffer() && (state.pendingOfferId === 'detail_' + entity.id || state.pendingOfferId === 'deep_' + entity.id))) {
      state.clearOffer();
      state.escalateDepth(topicId);
      depth = state.getDepth(topicId);

      if (depth === 2) {
        var featureList = entity.features.join(', ');
        var response = "Alright" + (name ? " " + name + ", " : ", ") + "let me break down " + formatEntityName(entity.id) + " properly. " + entity.longDescription + " The key features include: " + featureList + ".";
        if (entity.additionalDetails && entity.additionalDetails.length > 0) {
          state.setOffer("Want me to go even deeper on " + formatEntityName(entity.id) + "?", 'deep_' + entity.id);
          response += " Want me to go even deeper?";
          return makeResponse(response, [
            { label: 'Go Deeper', value: 'Tell me more about ' + formatEntityName(entity.id) },
            { label: 'Features', value: formatEntityName(entity.id) + ' features' },
          ]);
        }
        return makeResponse(response, entity.buttons || []);
      }

      if (depth >= 3 && entity.additionalDetails && entity.additionalDetails.length > 0) {
        var detailIndex = Math.min(depth - 3, entity.additionalDetails.length - 1);
        var detail = entity.additionalDetails[detailIndex];
        state.clearOffer();

        if (detailIndex < entity.additionalDetails.length - 1) {
          state.setOffer("There's more to " + formatEntityName(entity.id) + " if you're interested.", 'deep_' + entity.id);
          return makeResponse(detail + " Want to hear more?", [
            { label: 'More Details', value: 'Tell me more about ' + formatEntityName(entity.id) },
            { label: 'Something Else', value: 'What else can you tell me' },
          ]);
        }
        return makeResponse(detail + " That's the deep dive on " + formatEntityName(entity.id) + ". Anything else you want to explore?", [
          { label: 'Other Products', value: 'What products do you have' },
          { label: 'Services', value: 'What services do you offer' },
        ]);
      }

      state.clearOffer();
      return makeResponse("I've covered the main points about " + formatEntityName(entity.id) + ". Is there something specific you'd like to know, or should we explore another topic?", [
        { label: 'Products', value: 'What products do you have' },
        { label: 'Services', value: 'What services do you offer' },
      ]);
    }

    // First mention - brief description
    state.escalateDepth(topicId);
    var briefResponses = [
      formatEntityName(entity.id) + " is " + entity.shortDescription + ". Want me to walk you through what it actually does?",
      formatEntityName(entity.id) + " \u2014 " + entity.shortDescription + ". There's a lot more to it if you want the full picture.",
      "So " + formatEntityName(entity.id) + " is " + entity.shortDescription + ". Should I break it down further?",
    ];
    var chosen = pickResponse(briefResponses, topicId + '_brief');
    state.setOffer("Want me to break down " + formatEntityName(entity.id) + " in detail?", 'detail_' + entity.id);
    return makeResponse(chosen, [
      { label: 'Break It Down', value: 'Tell me more about ' + formatEntityName(entity.id) },
      { label: 'Features', value: formatEntityName(entity.id) + ' features' },
    ]);
  }

  // Name asking logic (v4: ask earlier — after 1st turn)
  function shouldAskName() {
    if (state.nameAsked) return false;
    if (memory.getName()) return false;
    if (state.nameAskAttempt >= 2) return false;
    return state.turnCount >= 1;
  }

  function askForName() {
    state.nameAsked = true;
    state.nameAskAttempt++;
    state.awaitingName = true;
    state.setOffer("What's your name?", 'ask_name');
    var responses = [
      "By the way, I'd love to know who I'm talking to. What's your name?",
      "Hey, before we go further \u2014 what's your name? I like knowing who I'm chatting with.",
      "Quick question \u2014 what should I call you? I remember names, so next time you visit I'll know who you are.",
    ];
    return makeResponse(responses[Math.floor(Math.random() * responses.length)], []);
  }

  // v4: Generate returning user welcome
  function getReturningUserWelcome() {
    var name = memory.getName();
    var visits = memory.getVisitCount();
    if (!name) return null;

    var welcomes = [
      "Hey " + name + "! Great to see you again. Welcome back to Mort-E. What can I help you with this time?",
      name + "! You're back. Mort-E GMA.2 at your service, just like before. What's on your mind?",
      "Welcome back, " + name + "! I remember you. Still the same MortApps Studios expert. What are you curious about?",
    ];
    return makeResponse(welcomes[Math.floor(Math.random() * welcomes.length)], [
      { label: "What's New", value: 'What products do you have' },
      { label: 'Services', value: 'What services do you offer' },
    ]);
  }


  /* ═══════════════════════════════════════════════════════════════
     SECTION 8: MAIN QUERY FUNCTION (v4 — Structured Responses)
     The core processing pipeline. Returns { text, buttons }
     ═══════════════════════════════════════════════════════════════ */

  buildIntentIndex();
  buildEntityIndex();

  function query(rawUserInput) {
    if (!rawUserInput || typeof rawUserInput !== 'string') {
      return makeResponse("I'm here to help. What would you like to know about MortApps Studios?", [
        { label: 'Products', value: 'What products do you have' },
        { label: 'Services', value: 'What services do you offer' },
      ]);
    }

    var input = rawUserInput.trim();
    if (input.length === 0) {
      return makeResponse("Go ahead \u2014 ask me anything about MortApps Studios.", []);
    }

    // Record user turn
    state.addTurn('user', input);

    // Normalize input through NLP pipeline
    var normalized = normalizeInput(input);

    // ── STEP 1: Check for name response ────────────────────────
    if (state.awaitingName || (state.hasPendingOffer() && state.pendingOfferId === 'ask_name')) {
      var extractedName = memory.extractName(input);
      if (extractedName) {
        memory.setName(extractedName);
        state.clearOffer();
        state.awaitingName = false;
        var nameConfirmResponses = [
          "Great to meet you, " + extractedName + "! I'll remember that. Now, where were we? Feel free to ask me anything about MortApps Studios.",
          extractedName + " \u2014 nice name! I've got that locked in. So, what else can I help you with?",
          "Awesome, " + extractedName + "! I'll remember you next time you visit. Now, back to business \u2014 what would you like to know?",
        ];
        var nameResp = nameConfirmResponses[Math.floor(Math.random() * nameConfirmResponses.length)];
        state.addTurn('bot', nameResp);
        return makeResponse(nameResp, [
          { label: 'Products', value: 'What products do you have' },
          { label: 'Services', value: 'What services do you offer' },
        ]);
      }
      // If they typed something that's not a name while we're asking, handle gracefully
      if (state.awaitingName) {
        state.awaitingName = false;
        state.clearOffer();
        // Fall through to normal processing — they changed the subject
      }
    }

    // ── STEP 2: Check for affirmation/negation to pending offer ─
    if (state.hasPendingOffer()) {
      var confirmation = detectConfirmation(input, state);

      if (confirmation && confirmation.type === 'affirmation') {
        var offerId = state.pendingOfferId;

        // Handle entity detail confirmation
        if (offerId && offerId.indexOf('detail_') === 0) {
          var entityId = offerId.replace('detail_', '');
          var entity = KB.entities[entityId];
          if (entity) {
            state.currentTopic = entityId;
            state.lastEntityId = entityId;
            var response = generateEntityResponse(entity, true);
            state.addTurn('bot', response.text);
            return makeResponse(personalizeResponse(response.text), response.buttons);
          }
        }

        // Handle deep dive confirmation
        if (offerId && offerId.indexOf('deep_') === 0) {
          var deepEntityId = offerId.replace('deep_', '');
          var deepEntity = KB.entities[deepEntityId];
          if (deepEntity) {
            state.currentTopic = deepEntityId;
            state.lastEntityId = deepEntityId;
            var deepResponse = generateEntityResponse(deepEntity, true);
            state.addTurn('bot', deepResponse.text);
            return makeResponse(personalizeResponse(deepResponse.text), deepResponse.buttons);
          }
        }

        // Generic affirmation
        state.clearOffer();
        var affirmResponses = [
          "Great! What specifically would you like to dive into?",
          "Awesome! What aspect are you most interested in?",
          "Perfect! What should we explore?",
        ];
        var affirmResp = affirmResponses[Math.floor(Math.random() * affirmResponses.length)];
        state.addTurn('bot', affirmResp);
        return makeResponse(personalizeResponse(affirmResp), [
          { label: 'Products', value: 'What products do you have' },
          { label: 'Services', value: 'What services do you offer' },
        ]);
      }

      if (confirmation && confirmation.type === 'negation') {
        state.clearOffer();
        var negResponses = [
          "No problem! Is there something else you'd like to know about MortApps Studios?",
          "All good! What else can I help you with?",
          "Sure thing! Feel free to ask about anything else.",
        ];
        var negResp = negResponses[Math.floor(Math.random() * negResponses.length)];
        state.addTurn('bot', negResp);
        return makeResponse(personalizeResponse(negResp), [
          { label: 'Products', value: 'What products do you have' },
          { label: 'Services', value: 'What services do you offer' },
        ]);
      }

      // Not a confirmation/negation - user changed topic, clear the offer
      state.clearOffer();
    }

    // ── STEP 3: Check for user providing their name unsolicited ─
    var unsolicitedName = memory.extractName(input);
    if (unsolicitedName && !memory.getName()) {
      memory.setName(unsolicitedName);
      var unsolicitedResponses = [
        "Nice to meet you, " + unsolicitedName + "! I'll remember that. Now, what can I help you with regarding MortApps Studios?",
        unsolicitedName + " \u2014 love it! I've got your name stored. What would you like to know?",
      ];
      var unsolResp = unsolicitedResponses[Math.floor(Math.random() * unsolicitedResponses.length)];
      state.addTurn('bot', unsolResp);
      return makeResponse(unsolResp, [
        { label: 'Products', value: 'What products do you have' },
        { label: 'Services', value: 'What services do you offer' },
      ]);
    }

    // ── STEP 4: Check fenced topics (redirect) ─────────────────
    var fencedTopic = checkFencedTopics(normalized);
    if (fencedTopic) {
      var fencedResponse = pickResponse(fencedTopic.redirectResponse, 'fenced_' + fencedTopic.id);
      var personalizedFenced = personalizeResponse(fencedResponse);
      state.addTurn('bot', personalizedFenced);
      var fencedButtons = fencedTopic.buttons || [
        { label: 'Contact Us', value: 'How can I contact MortApps Studios' },
      ];
      return makeResponse(personalizedFenced, fencedButtons);
    }

    // ── STEP 5: Intent matching with scoring ──────────────────
    var bestIntent = null;
    var bestScore = 0;

    for (var i = 0; i < KB.intents.length; i++) {
      var intent = KB.intents[i];
      var score = scoreIntentMatch(intent, normalized);
      if (score > bestScore) {
        bestScore = score;
        bestIntent = intent;
      }
    }

    if (bestIntent && bestScore >= 5) {
      state.lastIntentId = bestIntent.id;
      var intentResponse = pickResponse(bestIntent.responses, 'intent_' + bestIntent.id);
      var personalizedIntent = personalizeResponse(intentResponse);
      state.addTurn('bot', personalizedIntent);
      return makeResponse(personalizedIntent, bestIntent.buttons || []);
    }

    // ── STEP 6: Entity detection ───────────────────────────────
    var matchedEntity = findEntity(normalized);
    if (matchedEntity) {
      state.currentTopic = matchedEntity.id;
      state.lastEntityId = matchedEntity.id;
      state.lastIntentId = 'entity_' + matchedEntity.id;

      var moreKeywords = ['more', 'detail', 'deeper', 'further', 'expand', 'elaborate', 'continue', 'explain', 'break down', 'full', 'tell me more'];
      var isAskingForMore = false;
      var inputLower = normalized.normalized;
      for (var m = 0; m < moreKeywords.length; m++) {
        if (inputLower.indexOf(moreKeywords[m]) !== -1) {
          isAskingForMore = true;
          break;
        }
      }

      if (isAskingForMore && state.getDepth('entity_' + matchedEntity.id) > 0) {
        state.clearOffer();
        state.setOffer("Want me to break down " + formatEntityName(matchedEntity.id) + " in detail?", 'detail_' + matchedEntity.id);
        var moreResponse = generateEntityResponse(matchedEntity, true);
        state.addTurn('bot', moreResponse.text);
        return makeResponse(personalizeResponse(moreResponse.text), moreResponse.buttons);
      }

      var entityResponse = generateEntityResponse(matchedEntity, false);
      state.addTurn('bot', entityResponse.text);
      return makeResponse(personalizeResponse(entityResponse.text), entityResponse.buttons);
    }

    // ── STEP 7: Weaker intent matching (score 2-4) ─────────────
    if (bestIntent && bestScore >= 2) {
      state.lastIntentId = bestIntent.id;
      var weakIntentResponse = pickResponse(bestIntent.responses, 'intent_' + bestIntent.id);
      var personalizedWeak = personalizeResponse(weakIntentResponse);
      state.addTurn('bot', personalizedWeak);
      return makeResponse(personalizedWeak, bestIntent.buttons || []);
    }

    // ── STEP 8: Context-aware fallback ─────────────────────────
    if (state.currentTopic && state.lastEntityId) {
      var contextEntity = KB.entities[state.lastEntityId];
      if (contextEntity) {
        var contextFallbacks = [
          "I'm not quite sure about that{userNameComma}, but we were talking about " + formatEntityName(state.lastEntityId) + ". Want me to dive deeper into that, or is there something else I can help with?",
          "That's a bit outside what I know about " + formatEntityName(state.lastEntityId) + "{userNameComma}. Want me to tell you more about it, or should we explore a different topic?",
          "Hmm{userNameComma}, I'm not sure I follow. We were discussing " + formatEntityName(state.lastEntityId) + " \u2014 want more details on that, or something else?",
        ];
        var contextResp = contextFallbacks[Math.floor(Math.random() * contextFallbacks.length)];
        state.addTurn('bot', contextResp);
        return makeResponse(personalizeResponse(contextResp), [
          { label: 'More on ' + formatEntityName(state.lastEntityId), value: 'Tell me more about ' + formatEntityName(state.lastEntityId) },
          { label: 'Something Else', value: 'What else can you help with' },
        ]);
      }
    }

    // ── STEP 9: Ask name if appropriate ────────────────────────
    if (shouldAskName()) {
      var nameAsk = askForName();
      state.addTurn('bot', nameAsk.text);
      return nameAsk; // Already a makeResponse object
    }

    // ── STEP 10: General fallback with helpful buttons ──────────
    var generalFallbacks = [
      "I'm not sure I caught that{userNameComma}. Try me on our products, services, or the company story \u2014 that's where I shine.",
      "Hmm{userNameComma}, that's a bit outside my wheelhouse. I know MortApps Studios inside and out \u2014 products, services, founder story, contact info. What can I help with?",
      "Not quite tracking that one{userNameComma}. I'm your go-to for everything MortApps Studios. Ask me about BioAttex, Phein, our services, or anything else about the studio.",
      "I didn't quite get that{userNameComma}. I specialize in all things MortApps Studios \u2014 products, services, how to contact us, demos, you name it. What are you curious about?",
      "That one's a bit outside my knowledge{userNameComma}. But if it's about MortApps Studios, I've got you covered. Our products, services, founder, or how to reach us \u2014 just ask.",
    ];
    var fallback = generalFallbacks[Math.floor(Math.random() * generalFallbacks.length)];
    state.addTurn('bot', fallback);
    return makeResponse(personalizeResponse(fallback), [
      { label: 'Products', value: 'What products do you have' },
      { label: 'Services', value: 'What services do you offer' },
      { label: 'About Studio', value: 'Tell me about MortApps Studios' },
      { label: 'Contact', value: 'How can I contact MortApps Studios' },
    ]);
  }

  function reset() {
    state.reset();
  }

  // v4: Get returning user welcome (called by UI on open)
  function getWelcome() {
    if (memory.isReturningUser()) {
      return getReturningUserWelcome();
    }
    return null;
  }


  /* ═══════════════════════════════════════════════════════════════
     SECTION 9: PUBLIC API (v4 — Structured Responses)
     query() returns { text: string, buttons: [{label, value}] }
     ═══════════════════════════════════════════════════════════════ */

  window.MortEBrains = {
    query: query,
    reset: reset,
    getWelcome: getWelcome,
  };

})();
