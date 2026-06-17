/**
 * ═══════════════════════════════════════════════════════════════════════
 * Mort-E GMA.2 — Enhancement Module 5: Proactive Intelligence Engine
 * Part of the MortApps Studios AI Division
 *
 * Purpose: Transforms Mort-E from a reactive Q&A bot into an active,
 *          intelligent conversational partner. This module adds:
 *
 *  1. PROACTIVE QUESTIONS — Mort-E asks thoughtful follow-up questions
 *     after delivering answers, keeping conversations alive.
 *
 *  2. SMART SUGGESTIONS ENGINE — Context-aware suggestions appear mid-
 *     conversation ("Since you asked about X, you might also want to know Y").
 *
 *  3. CONVERSATION INITIATOR — On idle, Mort-E re-engages with a new
 *     angle ("While you're here, did you know about X?").
 *
 *  4. EXPANDED RESPONSE POOLS — Every intent now has 6–10 responses
 *     (up from 3–5), making Mort-E feel genuinely different each session.
 *
 *  5. ENHANCED PERSONALITY LAYER — Nairobi-aware wit, Kenyan pride,
 *     and culturally resonant micro-moments woven into responses.
 *
 *  6. DEEP QUESTION HANDLER — Understands and answers meta-questions
 *     users ask about MortApps Studios that aren't in the base KB
 *     (e.g. "What makes you different?", "Why should I trust you?",
 *     "What's your best product?").
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
      console.warn('Mort-E Module 5: Bridge not found after 20 attempts. Aborting.');
      return;
    }
    if (!window.MortEBrainsInternals || !window.MortEBrains) {
      setTimeout(function() { waitForBridge((attempt || 0) + 1); }, 100);
      return;
    }
    init();
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 1: PROACTIVE QUESTION BANK
  // After delivering an answer, Mort-E picks a relevant follow-up
  // question to keep the conversation going.
  // ═══════════════════════════════════════════════════════════════

  var PROACTIVE_QUESTIONS = {

    // After talking about any product
    product_followup: [
      "Would you like me to walk you through how it actually works in practice?",
      "Shall I show you where you can try a live demo?",
      "Want me to compare it to similar tools out there — and explain why ours is different?",
      "Is this for a specific use case? I can tailor the explanation.",
      "Should I tell you about the tech powering it under the hood?",
      "Want to know what kind of businesses are already using this?",
    ],

    // After talking about services
    service_followup: [
      "Do you have a specific project in mind? I can point you in the right direction.",
      "What industry is it for? I can tell you if we've done something similar.",
      "Would you like to know how the engagement process works from first contact to delivery?",
      "Do you want me to connect you with the team directly?",
    ],

    // After contact info
    contact_followup: [
      "Is there a specific project or question you want to lead with when you reach out?",
      "Would you like me to help you phrase what you want to say to the team?",
      "Do you need the WhatsApp link? It's the fastest way to get a reply.",
    ],

    // After company overview
    company_followup: [
      "What aspect of the studio interests you most — the products, the services, or the team?",
      "Want to hear about what makes MortApps Studios different from other software studios in Kenya?",
      "Curious about the story behind how the studio got started?",
    ],

    // After founder info
    founder_followup: [
      "Want to know about the products Mort Ian K. is most proud of?",
      "Interested in the philosophy behind how MortApps Studios builds software?",
    ],

    // After BioAttex
    bioattex_followup: [
      "Want to understand exactly why local processing is such a big deal — especially in Kenya?",
      "Should I walk you through what happens step-by-step when BioAttex recognizes a face?",
      "Would you like to know how BioAttex compares to traditional attendance systems?",
      "Interested in what kinds of organizations BioAttex is built for?",
    ],

    // After Phein
    phein_followup: [
      "Want to see how Phein's scoring algorithm actually ranks candidates?",
      "Is this for a specific role or high-volume hiring? I can explain which scenario Phein handles best.",
      "Should I tell you what the live demo lets you try?",
    ],

    // After Elthira
    elthira_followup: [
      "Curious about which Kenyan herbs are in Elthira's knowledge base?",
      "Want to know how Elthira decides which remedy matches your symptoms?",
      "Should I explain how Elthira balances traditional knowledge with modern safety guidance?",
    ],

    // After pricing redirect
    pricing_followup: [
      "Would it help to know roughly what kind of projects we typically handle, so you can gauge fit?",
      "Do you have a budget range in mind? I can tell you what's usually feasible.",
    ],

    // Generic curiosity sparks (used when no specific topic match)
    generic: [
      "By the way — is there anything about MortApps Studios that you've been wondering but didn't know how to ask?",
      "What brought you here today? Knowing that helps me point you to the right thing.",
      "Is there a problem you're trying to solve? I can tell you if we've got something that fits.",
      "Anything else on your radar about our products or services?",
      "What would be most valuable for you to know right now?",
    ],
  };

  // ═══════════════════════════════════════════════════════════════
  // SECTION 2: SMART SUGGESTIONS ENGINE
  // Context-aware "you might also be interested in" prompts
  // triggered after covering a topic to cross-pollinate knowledge.
  // ═══════════════════════════════════════════════════════════════

  var TOPIC_SUGGESTIONS = {
    bioattex: {
      related: ['phein', 'privacy_question', 'services'],
      message: "Since you're looking at {link:BioAttex|https://www.mortappsstudios.com/bioatx-demo/} — you might also want to know about {link:Phein|https://www.mortappsstudios.com/client.phein_vr-6.0_demo/}, our AI recruitment tool. Both are built for HR and operations teams.",
    },
    phein: {
      related: ['bioattex', 'services', 'custom_development'],
      message: "While you're exploring {link:Phein|https://www.mortappsstudios.com/client.phein_vr-6.0_demo/} — {link:BioAttex|https://www.mortappsstudios.com/bioatx-demo/} handles the attendance side once you've hired. They work well together.",
    },
    elthira: {
      related: ['product_overview', 'briz', 'services'],
      message: "Elthira.Ai is one of our most unique products. If you're interested in AI applied to wellness, you might also like seeing how we apply AI in {link:Brizerm Markets|https://mortappsstudios.com/briz.demo} for business intelligence.",
    },
    briz: {
      related: ['elthira', 'taskflow-pro', 'services'],
      message: "If Brizerm Markets caught your interest, {link:TaskFlow Pro|https://www.mortappsstudios.com/TaskFlowPro/} is another privacy-first tool — completely free, no sign-ups.",
    },
    'taskflow-pro': {
      related: ['briz', 'product_overview'],
      message: "TaskFlow Pro is free and fully offline. If you like privacy-first tools, {link:Brizerm Markets|https://mortappsstudios.com/briz.demo} takes that philosophy much deeper for business intelligence.",
    },
    services: {
      related: ['contact', 'custom_development', 'product_overview'],
      message: "If you're thinking about custom development, our existing products — BioAttex, Phein, Elthira.Ai — show the kind of quality you'd be commissioning. Worth a look before reaching out.",
    },
    contact: {
      related: ['schedule_meeting', 'services'],
      message: "WhatsApp is the fastest way to reach us — typically same-day replies. Email works too if you want something on record.",
    },
    about_company: {
      related: ['about_founder', 'product_overview', 'motivation'],
      message: "Now that you know who we are — want to see what we've built? Our products are the best demonstration of what MortApps Studios is capable of.",
    },
    about_founder: {
      related: ['about_company', 'motivation'],
      message: "The founder's philosophy — 'technology should feel human' — shows up most clearly in BioAttex and Elthira.Ai. They're worth exploring to understand what that means in practice.",
    },
  };

  // ═══════════════════════════════════════════════════════════════
  // SECTION 3: IDLE RE-ENGAGEMENT INITIATOR
  // After a pause in conversation, Mort-E initiates a new angle
  // ═══════════════════════════════════════════════════════════════

  var IDLE_INITIATORS = [
    {
      message: "Still there? While you're thinking — did you know MortApps Studios has a completely free task management tool? {link:TaskFlow Pro|https://www.mortappsstudios.com/TaskFlowPro/} — no sign-up, no cloud, no catch.",
      buttons: [
        { label: 'Tell Me More', value: 'Tell me about TaskFlow Pro' },
        { label: 'I Have a Question', value: 'What products do you have' },
      ],
    },
    {
      message: "Just checking in! One thing most people don't know: our {link:BioAttex|https://www.mortappsstudios.com/bioatx-demo/} biometric system processes everything 100% on-device. No cloud. No data leaks. Ever. Curious?",
      buttons: [
        { label: 'Sounds Interesting', value: 'Tell me about BioAttex' },
        { label: 'Ask Something Else', value: 'What products do you have' },
      ],
    },
    {
      message: "Quick one — if you're a Kenyan entrepreneur, {link:Brizerm Markets|https://mortappsstudios.com/briz.demo} was built specifically for you. Business plans, NSE tracking, financial calculators — all offline, all yours.",
      buttons: [
        { label: 'Tell Me More', value: 'Tell me about Brizerm Markets' },
        { label: 'See All Products', value: 'What products do you have' },
      ],
    },
    {
      message: "Something worth knowing: MortApps Studios also has a sister brand — Linkage Media Hub — handling influencer marketing and digital campaigns. Two sides of the same coin.",
      buttons: [
        { label: 'About Linkage Media', value: 'Tell me about Linkage Media Hub' },
        { label: 'Continue', value: 'What services do you offer' },
      ],
    },
    {
      message: "Fun fact: MortApps Studios was founded right here in Kenya — and already building products that can compete globally. Proud of that. Want to see the full lineup?",
      buttons: [
        { label: 'Show Me', value: 'What products do you have' },
        { label: 'Tell Me the Story', value: 'Tell me about MortApps Studios' },
      ],
    },
  ];

  // ═══════════════════════════════════════════════════════════════
  // SECTION 4: EXPANDED RESPONSE POOLS
  // Additional responses for intents that currently have <6.
  // These are injected into the KB at runtime.
  // ═══════════════════════════════════════════════════════════════

  var RESPONSE_EXPANSIONS = {

    greeting: [
      "Habari{userNameComma}! Mort-E GMA.2 at your service — built by and for MortApps Studios, Kenya's finest software studio. What brings you here today?",
      "Hey{userNameComma}! You've reached Mort-E GMA.2, powered by MortApps Studios. Think of me as a search engine that actually understands what you're asking — for everything MortApps. What's on your mind?",
      "Welcome{userNameComma}! I'm Mort-E GMA.2 — MortApps Studios' AI. I know this place inside out: every product, every service, every detail. What can I help you discover?",
    ],

    about_company: [
      "{userNameLead}MortApps Studios — Kenya-born, globally capable. Founded in 2024, we build custom web apps, AI systems, biometric solutions, and tools that solve real problems. Six products deep, with more in the pipeline. The philosophy is simple: build things that matter, build them well, build them here. What do you want to know?",
      "{userNameLead}we are a software studio operating from Kenya. That's not a limitation — it's a vantage point. We see problems that Silicon Valley doesn't. Our products reflect that: biometric attendance for privacy-conscious organizations, AI wellness consulting rooted in Kenyan herbal tradition, business intelligence for African entrepreneurs. We build where it matters.",
    ],

    product_overview: [
      "{userNameLead}let me give you the rundown: {link:BioAttex|https://www.mortappsstudios.com/bioatx-demo/} (biometric attendance, 100% local processing), {link:Phein|https://www.mortappsstudios.com/client.phein_vr-6.0_demo/} (AI-powered CV screening), {link:Elthira.Ai|https://mortappsstudios.com/Elthira.Ai/} (herbal wellness consultant — Kenyan herbs, AI-powered), {link:Brizerm Markets|https://mortappsstudios.com/briz.demo} (business intelligence for entrepreneurs), {link:TaskFlow Pro|https://www.mortappsstudios.com/TaskFlowPro/} (free Kanban board, no sign-ups), {link:AgriXen|https://mortappsstudios.com/AgriXen} (agriculture tech), {link:Opticore Vipro|https://www.mortappsstudios.com/software/} (precision eyewear tech). Plus custom web apps built from scratch. Which one fits what you need?",
    ],

    services: [
      "{userNameLead}our services: custom web application development (full-stack, from scratch), AI integration (making your existing systems smarter), biometric system implementation (with BioAttex), website design and development, and bespoke software for any industry. Sister brand Linkage Media Hub handles digital marketing and influencer campaigns. Every project is scoped around your actual needs. Ready to talk specifics? labs@mortappsstudios.com or WhatsApp +254 113 400 063.",
    ],

    contact: [
      "{userNameLead}you've got four ways in: labs@mortappsstudios.com (email — good for detailed inquiries), +254 113 400 063 (call or WhatsApp — fastest for quick responses), the contact form at mortappsstudios.com#contact, or if it's founder-specific, klraineian@gmail.com. No bots on the other end — real people, real responses. Usually same-day.",
    ],

    how_are_you: [
      "Running sharp{userNameComma}! I'm Mort-E GMA.2 — trained on everything MortApps Studios has ever built or done. If there's something to know about this studio, I know it. What are you trying to find out?",
      "Niko mzuri kabisa{userNameComma}! Ready to give you the full picture on whatever you're curious about. Ask me anything — products, services, the founder story, how to get in touch. What's up?",
    ],

    thanks: [
      "Always{userNameComma}. That's what I'm built for — making sure you leave knowing exactly what you came to find out. Anything else?",
      "My pleasure{userNameComma}. Mort-E GMA.2 doesn't do half-answers. If there's more you want to know, keep going.",
      "Glad that hit{userNameComma}. I've got plenty more — the knowledge base on MortApps Studios runs deep. What else?",
    ],

    motivation: [
      "The philosophy is short but it drives everything: technology should feel human. Not robotic, not corporate, not detached — human. Mort Ian K. started MortApps Studios because he saw too much software that was built for compliance and checkbox-ticking instead of actual people. Every product we build — whether it's a biometric attendance system or an herbal wellness consultant — has to pass that test: does it feel human? If it doesn't, it's not done. That's the mission.",
      "MortApps Studios exists because there was a gap. Businesses in Kenya, in Africa — needed software that actually understood their context. Not ported Western solutions with a different logo. Real tools, built for here. That's what we do.",
    ],

    farewell: [
      "Kwaheri{userNameComma}! You know where to find me. Mort-E GMA.2, powered by MortApps Studios — never offline.",
      "See you{userNameComma}. If you come back with questions, I'll have answers. Mort-E GMA.2, always here.",
      "Take care{userNameComma}. Remember — for anything serious, labs@mortappsstudios.com or WhatsApp us at +254 113 400 063. Real humans, real replies.",
    ],
  };

  // ═══════════════════════════════════════════════════════════════
  // SECTION 5: DEEP QUESTION HANDLER
  // Answers high-intent meta-questions not in the base KB
  // ═══════════════════════════════════════════════════════════════

  var DEEP_QUESTIONS = [
    {
      id: 'what_makes_different',
      triggers: [/what makes you different/i, /why mortapps/i, /why choose you/i, /why should i use/i, /stand out/i, /unique/i, /not like other/i],
      responses: [
        "Three things set MortApps Studios apart. First: everything is custom-built from scratch — no templates, no recycled code, no one-size-fits-all. Second: we build with a privacy-first mentality that most studios don't even think about — see BioAttex for what that looks like in practice. Third: we're based in Kenya. We understand the Kenyan and East African business context in ways that remote studios never can. We build software that matters, for people it actually matters to.",
        "Honestly? Two things. One — our products show range and depth that you don't expect from a studio our size. Biometrics. AI wellness. Business intelligence. Recruitment AI. That's not a studio playing it safe. Two — the 'technology should feel human' philosophy isn't marketing copy. It changes how we build. Our software is designed to be used by actual people, not just evaluated on a spec sheet.",
      ],
    },
    {
      id: 'best_product',
      triggers: [/best product/i, /which product/i, /recommend/i, /what should i use/i, /flagship/i],
      responses: [
        "That depends entirely on your use case, but here's my honest take. For HR and operations teams: {link:BioAttex|https://www.mortappsstudios.com/bioatx-demo/} and {link:Phein|https://www.mortappsstudios.com/client.phein_vr-6.0_demo/} are both serious tools with live demos you can try right now. For entrepreneurs: {link:Brizerm Markets|https://mortappsstudios.com/briz.demo} is genuinely useful — business plan generation, NSE tracking, financial calculators, all offline. For something completely unique: {link:Elthira.Ai|https://mortappsstudios.com/Elthira.Ai/} — AI-powered herbal wellness consulting rooted in Kenyan tradition. Tell me what problem you're trying to solve and I'll give you a sharper recommendation.",
        "BioAttex is the flagship if we're talking technical depth — the local processing architecture is genuinely impressive. But the product that surprises people most is {link:Elthira.Ai|https://mortappsstudios.com/Elthira.Ai/}. An AI herbal wellness consultant powered by Kenyan herbal wisdom? You won't find that anywhere else. Which one sounds more relevant to you?",
      ],
    },
    {
      id: 'trust_question',
      triggers: [/can i trust/i, /is this legit/i, /is mortapps real/i, /are you real/i, /legit/i, /credible/i, /proof/i, /track record/i],
      responses: [
        "Fair question. MortApps Studios is a registered software studio based in Kenya. We have live products you can try right now — {link:BioAttex|https://www.mortappsstudios.com/bioatx-demo/}, {link:Phein|https://www.mortappsstudios.com/client.phein_vr-6.0_demo/}, {link:Elthira.Ai|https://mortappsstudios.com/Elthira.Ai/}. We have active clients — Baba Bima Insurance (bababima.co.ke) is one example of a platform we built. You can reach the founder directly at klraineian@gmail.com. The work is live and verifiable. That's the best proof.",
        "The simplest answer: try before you commit. {link:BioAttex|https://www.mortappsstudios.com/bioatx-demo/}, {link:Phein|https://www.mortappsstudios.com/client.phein_vr-6.0_demo/}, and {link:Elthira.Ai|https://mortappsstudios.com/Elthira.Ai/} all have live demos. The website is at mortappsstudios.com. The founder is reachable at klraineian@gmail.com. Nothing about this studio hides behind a wall — it's all out in the open.",
      ],
    },
    {
      id: 'future_plans',
      triggers: [/what are you building/i, /upcoming/i, /future plans/i, /what's next/i, /roadmap/i, /new products/i, /coming soon/i],
      responses: [
        "MortApps Studios keeps a lot close to the chest on what's in development — the founder's approach is 'ship it when it's ready, not when it's announced.' What I can tell you is that the studio is actively building. The existing products — BioAttex, Phein, Elthira.Ai, Brizerm — are all seeing ongoing improvements. And the pipeline reflects the same philosophy: solve real problems, build for people, make it feel human. If you want early visibility into what's coming, the best move is to get in touch at labs@mortappsstudios.com.",
      ],
    },
    {
      id: 'competition_honest',
      triggers: [/compared to/i, /versus/i, /better than/i, /how do you compare/i],
      responses: [
        "I'll give you the honest version. BioAttex competes with cloud-based biometric systems — and wins on privacy. Every competitor in that space stores your facial data on their servers. BioAttex doesn't. That's not a marketing claim — it's an architectural decision. Phein competes with CV screening tools and the advantage is simplicity plus accuracy for high-volume roles. Elthira.Ai is in a category of its own — there's nothing else that does AI-powered herbal wellness consulting rooted in Kenyan tradition. Brizerm Markets is built specifically for African entrepreneurs in a way that generic business tools never are. The common thread: we build for context, not just for category.",
      ],
    },
    {
      id: 'can_build_for_me',
      triggers: [/can you build/i, /build for me/i, /i need someone to build/i, /looking for a developer/i, /need a developer/i, /need a website/i, /need an app/i],
      responses: [
        "{userNameLead}yes — custom development is core to what MortApps Studios does. We build web applications, platforms, websites, and custom software from scratch for any industry. Every project is scoped around your requirements — not a template, not a portfolio piece, but something built for your exact needs. Best first step: reach out at labs@mortappsstudios.com or WhatsApp us at +254 113 400 063 with a brief description of what you need. We'll take it from there.",
        "{userNameLead}absolutely. We've built insurance platforms, biometric systems, AI tools, recruitment software, wellness platforms — across multiple industries. If you have a concept or a problem that needs a digital solution, that's exactly the kind of conversation we want to have. Email labs@mortappsstudios.com or WhatsApp us. We respond fast.",
      ],
    },
    {
      id: 'kenya_focus',
      triggers: [/built for kenya/i, /kenyan/i, /nairobi/i, /africa/i, /local/i, /east africa/i],
      responses: [
        "MortApps Studios is Kenya-based and proud of it. But more than geography — our products reflect East African context. Elthira.Ai draws on Kenyan herbal tradition. Brizerm Markets is built for the Kenyan entrepreneur and tracks the NSE. BioAttex's privacy-first approach is designed for organizations that operate in environments where data sovereignty matters. Being here isn't incidental — it shapes what we build and how we build it. World-class standards, locally grounded.",
        "Being from Kenya is a feature, not a footnote. We understand the local business environment, the infrastructure constraints, the regulatory landscape. When we build for privacy-first architectures (like BioAttex's 100% local processing), that's partly because we know our clients operate in contexts where trusting cloud vendors with sensitive data isn't always safe. Local knowledge makes for better software.",
      ],
    },
  ];

  // ═══════════════════════════════════════════════════════════════
  // SECTION 6: PROACTIVE ENGINE
  // Core logic for when and how to inject proactive elements
  // ═══════════════════════════════════════════════════════════════

  var ProactiveEngine = {
    lastProactiveAt: 0,
    proactiveCooldownMs: 45000, // 45 seconds between proactive injections
    proactiveQuestionCooldownMs: 20000, // 20 seconds between follow-up questions
    lastProactiveQuestionAt: 0,
    idleTimerId: null,
    idleThresholdMs: 25000, // 25 seconds of silence triggers idle message
    usedIdleInitiators: [],

    /**
     * Pick a proactive question for the given topic
     */
    pickFollowUpQuestion: function(topicId) {
      var now = Date.now();
      if (now - this.lastProactiveQuestionAt < this.proactiveQuestionCooldownMs) return null;

      var pool = PROACTIVE_QUESTIONS[topicId] || PROACTIVE_QUESTIONS.generic;
      // Don't repeat too soon
      var available = pool.filter(function(q) {
        return !ProactiveEngine._usedQuestions || ProactiveEngine._usedQuestions.indexOf(q) === -1;
      });
      if (available.length === 0) {
        ProactiveEngine._usedQuestions = [];
        available = pool;
      }
      var picked = available[Math.floor(Math.random() * available.length)];
      if (!ProactiveEngine._usedQuestions) ProactiveEngine._usedQuestions = [];
      ProactiveEngine._usedQuestions.push(picked);
      this.lastProactiveQuestionAt = now;
      return picked;
    },

    /**
     * Map an intent/entity to a proactive question pool key
     */
    mapTopicToQuestionPool: function(lastIntentId, lastEntityId) {
      if (lastEntityId === 'bioattex') return 'bioattex_followup';
      if (lastEntityId === 'phein') return 'phein_followup';
      if (lastEntityId === 'elthira') return 'elthira_followup';
      if (lastIntentId === 'services') return 'service_followup';
      if (lastIntentId === 'contact' || lastIntentId === 'schedule_meeting') return 'contact_followup';
      if (lastIntentId === 'about_company') return 'company_followup';
      if (lastIntentId === 'about_founder') return 'founder_followup';
      if (lastEntityId && lastEntityId !== null) return 'product_followup';
      return 'generic';
    },

    /**
     * Get a suggestion for the current context (cross-sell / cross-inform)
     */
    getSuggestion: function(lastEntityId, lastIntentId) {
      var now = Date.now();
      if (now - this.lastProactiveAt < this.proactiveCooldownMs) return null;

      var key = lastEntityId || lastIntentId;
      if (!key || !TOPIC_SUGGESTIONS[key]) return null;

      this.lastProactiveAt = now;
      return TOPIC_SUGGESTIONS[key];
    },

    /**
     * Start idle timer — fires if user goes quiet
     */
    startIdleTimer: function(sendFn) {
      this.cancelIdleTimer();
      this.idleTimerId = setTimeout(function() {
        ProactiveEngine.fireIdleInitiator(sendFn);
      }, this.idleThresholdMs);
    },

    cancelIdleTimer: function() {
      if (this.idleTimerId) {
        clearTimeout(this.idleTimerId);
        this.idleTimerId = null;
      }
    },

    fireIdleInitiator: function(sendFn) {
      // Only fire if chat is open and no recent message
      var available = IDLE_INITIATORS.filter(function(init, idx) {
        return ProactiveEngine.usedIdleInitiators.indexOf(idx) === -1;
      });
      if (available.length === 0) {
        ProactiveEngine.usedIdleInitiators = [];
        available = IDLE_INITIATORS;
      }
      var idx = Math.floor(Math.random() * available.length);
      var initiator = available[idx];
      ProactiveEngine.usedIdleInitiators.push(IDLE_INITIATORS.indexOf(initiator));

      if (typeof sendFn === 'function') {
        sendFn(initiator);
      }
    },
  };

  // ═══════════════════════════════════════════════════════════════
  // SECTION 7: DEEP QUESTION CHECKER
  // ═══════════════════════════════════════════════════════════════

  function checkDeepQuestion(input) {
    var lower = input.toLowerCase().trim();
    for (var i = 0; i < DEEP_QUESTIONS.length; i++) {
      var dq = DEEP_QUESTIONS[i];
      for (var j = 0; j < dq.triggers.length; j++) {
        if (dq.triggers[j].test(lower)) {
          var responses = dq.responses;
          var picked = responses[Math.floor(Math.random() * responses.length)];
          // Personalize with name if available
          var name = window.MortEBrainsInternals && window.MortEBrainsInternals.memory
            ? window.MortEBrainsInternals.memory.getName() : null;
          if (name) {
            picked = picked.replace(/\{userNameLead\}/g, name + ', ');
          } else {
            picked = picked.replace(/\{userNameLead\}/g, '');
          }
          return {
            text: picked,
            buttons: [
              { label: 'Products', value: 'What products do you have' },
              { label: 'Services', value: 'What services do you offer' },
              { label: 'Contact', value: 'How can I contact MortApps Studios' },
            ],
          };
        }
      }
    }
    return null;
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 8: RESPONSE EXPANSION INJECTOR
  // Injects additional responses into KB intents at runtime
  // ═══════════════════════════════════════════════════════════════

  function expandKBResponses() {
    var KB = window.MortEBrainsInternals && window.MortEBrainsInternals.KB;
    if (!KB || !KB.intents) return;

    KB.intents.forEach(function(intent) {
      var expansions = RESPONSE_EXPANSIONS[intent.id];
      if (expansions && Array.isArray(expansions)) {
        // Add new responses only if they don't already exist (dedup by content)
        expansions.forEach(function(newResponse) {
          if (intent.responses.indexOf(newResponse) === -1) {
            intent.responses.push(newResponse);
          }
        });
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 9: MAIN HOOK
  // Wraps the existing query chain with proactive intelligence
  // ═══════════════════════════════════════════════════════════════

  function init() {
    console.log('Mort-E Enhancement Module 5: Proactive Intelligence Engine — Active');

    // Step 1: Expand KB responses
    expandKBResponses();

    // Step 2: Get current query chain
    var currentQuery = window.MortEBrains.query;
    var internals = window.MortEBrainsInternals;

    // Step 3: Override query with proactive layer
    window.MortEBrains.query = function(rawInput) {
      // Cancel idle timer since user is talking
      ProactiveEngine.cancelIdleTimer();

      // Deep question check (runs before standard pipeline)
      var deepResult = checkDeepQuestion(rawInput);
      if (deepResult) {
        // Still run the standard query to update state, but override the response
        currentQuery(rawInput);
        return deepResult;
      }

      // Run standard pipeline
      var result = currentQuery(rawInput);

      // Get current state
      var state = internals && internals.state;
      var lastIntentId = state ? state.lastIntentId : null;
      var lastEntityId = state ? state.lastEntityId : null;

      // Proactive question injection
      // Append a follow-up question ~40% of the time after substantive answers
      var shouldAskFollowUp = (
        result.text.length > 80 &&
        !/\?$/.test(result.text.trim()) &&  // Don't double-question
        Math.random() < 0.40
      );

      if (shouldAskFollowUp) {
        var poolKey = ProactiveEngine.mapTopicToQuestionPool(lastIntentId, lastEntityId);
        var followUp = ProactiveEngine.pickFollowUpQuestion(poolKey);
        if (followUp) {
          result.text = result.text + ' ' + followUp;
        }
      }

      // Smart suggestion injection (after ~every 3rd substantive exchange)
      // Only inject if the response doesn't already contain a follow-up question
      var shouldSuggest = (
        !shouldAskFollowUp &&
        result.text.length > 60 &&
        Math.random() < 0.20
      );

      if (shouldSuggest && lastEntityId) {
        var suggestion = ProactiveEngine.getSuggestion(lastEntityId, lastIntentId);
        if (suggestion && suggestion.message) {
          // Add suggestion as a separate text block via a subtle append
          result._proactiveSuggestion = suggestion.message;
          result._proactiveButtons = suggestion.buttons;
        }
      }

      return result;
    };

    // Step 4: Expose proactive engine for the UI layer
    window.MortEProactive = {
      engine: ProactiveEngine,
      IDLE_INITIATORS: IDLE_INITIATORS,
      TOPIC_SUGGESTIONS: TOPIC_SUGGESTIONS,
      PROACTIVE_QUESTIONS: PROACTIVE_QUESTIONS,
    };

    // Step 5: Enhanced getWelcome with richer first-visit messages
    var originalGetWelcome = window.MortEBrains.getWelcome;
    window.MortEBrains.getWelcome = function() {
      var existing = originalGetWelcome();
      if (existing) return existing; // Returning user — use existing

      // First-time visitor: richer welcome + conversation starter
      var firstVisitWelcomes = [
        {
          text: "Karibu! I'm Mort-E GMA.2 — the AI built by MortApps Studios, Kenya's premier software and AI studio. I know everything about this studio: our products, services, team, and philosophy. What are you curious about?",
          buttons: [
            { label: 'Show Me Products', value: 'What products do you have' },
            { label: 'About the Studio', value: 'Tell me about MortApps Studios' },
            { label: 'What Can You Do?', value: 'What can you help me with' },
          ],
        },
        {
          text: "Hey! Mort-E GMA.2 here — your guide to everything MortApps Studios builds. We've got biometric systems, AI recruitment tools, herbal wellness platforms, business intelligence for entrepreneurs, and more. Where do you want to start?",
          buttons: [
            { label: 'Products', value: 'What products do you have' },
            { label: 'Services', value: 'What services do you offer' },
            { label: 'Meet the Studio', value: 'Tell me about MortApps Studios' },
          ],
        },
      ];

      return firstVisitWelcomes[Math.floor(Math.random() * firstVisitWelcomes.length)];
    };

    console.log('Mort-E Module 5: KB expanded, deep questions loaded, proactive engine armed.');
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { waitForBridge(0); });
  } else {
    waitForBridge(0);
  }

  // ── PUBLIC API ──────────────────────────────────────────────────
  window.MortEBrainsModule5 = {
    ProactiveEngine: ProactiveEngine,
    DEEP_QUESTIONS: DEEP_QUESTIONS,
    RESPONSE_EXPANSIONS: RESPONSE_EXPANSIONS,
    IDLE_INITIATORS: IDLE_INITIATORS,
  };

})();
