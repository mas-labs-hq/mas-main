/**
 * ═══════════════════════════════════════════════════════════════════════
 * Mort-E GMA.2 — Enhancement Module 10: Kenyan Tech Authority + Closing Excellence
 * Part of the MortApps Studios AI Division
 *
 * Purpose: The crown jewel. This module positions Mort-E as the most
 *          knowledgeable tech authority in Kenya/East Africa and
 *          ensures every conversation ends memorably.
 *
 *  1. KENYAN TECH AUTHORITY — Deep knowledge of Kenya's tech ecosystem,
 *     key players, innovation hubs, government policies, and market
 *     dynamics. Mort-E can discuss iHub, M-Pesa, Konza, Safaricom,
 *     and Kenya's regulatory landscape with authority.
 *
 *  2. COMPETITIVE INTELLIGENCE — Handles competitor comparisons
 *     gracefully. Never disses competitors — highlights MortApps'
 *     unique positioning with facts, not trash talk.
 *
 *  3. CLOSING EXCELLENCE — World-class conversation closers that
 *     leave users impressed, not just informed. Every exit is a
 *     brand moment.
 *
 *  4. LOCAL RELEVANCE ENGINE — Connects every product to the Kenyan
 *     context. "BioAttex works offline because Kenya's internet
 *     isn't always reliable." "Elthira.Ai uses Kenyan herbs because
 *     that's our heritage." Makes products feel MADE for Kenya.
 *
 *  5. ASPIRATIONAL POSITIONING — Positions MortApps Studios as the
 *     studio that proves world-class software can come from Kenya.
 *     Not defensive about being Kenyan — proud of it.
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
      console.warn('Mort-E Module 10: Bridge not found after 20 attempts. Aborting.');
      return;
    }
    if (!window.MortEBrainsInternals || !window.MortEBrains) {
      setTimeout(function () { waitForBridge((attempt || 0) + 1); }, 100);
      return;
    }
    init();
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 1: KENYAN TECH KNOWLEDGE BASE
  // ═══════════════════════════════════════════════════════════════

  var KENYA_TECH_KB = {
    hubs: {
      ihub: "iHub is one of Africa's first and most influential tech innovation hubs, founded in Nairobi in 2010. It has incubated startups like Ushahidi (crisis mapping), M-Farm (agriculture marketplace), and many others. iHub helped establish Nairobi as the 'Silicon Savannah.' [Source: iHub Archives]",
      nailab: "Nailab is a Nairobi-based startup incubator that has supported over 60 tech startups since 2011. It focuses on early-stage startups in fintech, agritech, and healthtech. [Source: Nailab]",
      cchub: "While based in Lagos, Nigeria, CcHub (Co-creation Hub) has expanded to Kenya and Rwanda, creating a pan-African innovation network. It's one of Africa's most active tech hubs. [Source: CcHub Annual Report]",
      konzatechnopolis: "Konza Technopolis is Kenya's flagship smart city project — a 5,000-acre technology hub being built from scratch about 60km southeast of Nairobi. It aims to attract tech companies, universities, and research institutions. [Source: Konza Technopolis Development Authority]",
    },
    companies: {
      safaricom: "Safaricom is East Africa's largest telecom company and the creator of M-Pesa, the world's most successful mobile money platform. M-Pesa processes transactions equivalent to over 50% of Kenya's GDP. [Source: Safaricom Annual Report]",
      mpesa: "M-Pesa, launched by Safaricom in 2007, was the world's first mobile money transfer service at scale. It now has over 50 million users across 7 countries and processes over KES 7 trillion annually. M-Pesa proved that Africa could lead the world in financial technology innovation. [Source: Central Bank of Kenya]",
    },
    policy: {
      dpa: "Kenya's Data Protection Act (2019) established the Office of the Data Protection Commissioner and introduced strict rules for handling personal data, especially biometric data. It's modeled after the EU's GDPR and positions Kenya as one of Africa's leaders in data protection regulation. [Source: Kenya Data Protection Act 2019]",
      vision2030: "Kenya Vision 2030 is the country's long-term development blueprint, with a significant technology and innovation pillar. It aims to transform Kenya into a globally competitive, middle-income economy. The tech sector is a key driver of this vision. [Source: Kenya Vision 2030]",
      digital_blueprint: "Kenya's Digital Economy Blueprint (2019) outlines the country's strategy for leveraging digital technologies for economic growth. It identifies key sectors for digital transformation: agriculture, health, education, and finance. [Source: Ministry of ICT, Kenya]",
    },
  };

  // ═══════════════════════════════════════════════════════════════
  // SECTION 2: KENYAN TECH TRIGGER DETECTION
  // ═══════════════════════════════════════════════════════════════

  var KENYA_TECH_TRIGGERS = [
    { pattern: /ihub/i, key: 'hubs', id: 'ihub' },
    { pattern: /nailab/i, key: 'hubs', id: 'nailab' },
    { pattern: /cchub|co-creation\s+hub/i, key: 'hubs', id: 'cchub' },
    { pattern: /konza|technopolis/i, key: 'hubs', id: 'konzatechnopolis' },
    { pattern: /safaricom/i, key: 'companies', id: 'safaricom' },
    { pattern: /m-pesa|m\s*pesa|mpesa/i, key: 'companies', id: 'mpesa' },
    { pattern: /data\s+protection\s+act|dpa|dpc|odpc/i, key: 'policy', id: 'dpa' },
    { pattern: /vision\s+2030/i, key: 'policy', id: 'vision2030' },
    { pattern: /digital\s+(economy|blueprint|strategy)/i, key: 'policy', id: 'digital_blueprint' },
  ];

  // ═══════════════════════════════════════════════════════════════
  // SECTION 3: COMPETITIVE INTELLIGENCE
  // Handles competitor mentions gracefully — never disses, always pivots
  // ═══════════════════════════════════════════════════════════════

  var COMPETITOR_TRIGGERS = [
    {
      pattern: /how\s+(is|does)\s+(bioattex|mortapps|your)\s+(compare|different|vs|versus)\s+to/i,
      handler: function () {
        return "I'll give you the honest version rather than a sales pitch. There are solid biometric attendance systems out there — some cloud-based, some on-premise. The difference with BioAttex is architectural: it processes everything locally, on your device. Most competitors store facial embeddings on their servers. That's a design choice, not a marketing claim. If privacy compliance (especially under Kenya's Data Protection Act) matters to your organization, that architectural difference is significant. If it doesn't, then other factors like UI, pricing, and support become the differentiators. What matters most to you?";
      },
    },
    {
      pattern: /how\s+(is|does)\s+(phein|your\s+cv|your\s+recruitment)\s+(compare|different|vs|versus)/i,
      handler: function () {
        return "Fair question. There are established CV screening and ATS platforms — some excellent ones. Phein's distinction is simplicity and speed for the screening stage. It's not trying to be a full ATS with workflow management, integrations, and reporting dashboards. It's focused: paste a CV, get a score, rank candidates. For high-volume initial screening, that focus is an advantage. For full-lifecycle recruitment management, you might want a broader platform. What's your use case?";
      },
    },
    {
      pattern: /(better|worse)\s+than/i,
      handler: function () {
        return "I won't trash-talk other products — that's not how we operate. What I will say is this: every product in the MortApps Studios lineup was built with a specific philosophy and a specific context in mind. We build for Kenya, for East Africa, for the realities of our market. That means offline-first architectures, privacy-by-design, and solutions that understand the local regulatory and business environment. Whether that's 'better' depends on what you need. Tell me your situation and I'll give you an honest assessment.";
      },
    },
  ];

  // ═══════════════════════════════════════════════════════════════
  // SECTION 4: LOCAL RELEVANCE MAP
  // Connects products to Kenyan context
  // ═══════════════════════════════════════════════════════════════

  var LOCAL_RELEVANCE = {
    bioattex: "BioAttex's 100% local processing isn't just a privacy feature — it's practical for Kenya. Internet connectivity can be unreliable outside major cities. A biometric attendance system that needs cloud connectivity is a liability when the network goes down. BioAttex works offline, always.",
    phein: "Kenya's job market is highly competitive — hundreds of applications for a single role isn't uncommon. Phein is built for that reality: high-volume screening with AI-powered scoring, designed for HR teams who need speed without sacrificing quality.",
    elthira: "Elthira.Ai draws on centuries of Kenyan herbal tradition — this isn't AI applied to generic wellness data. It's AI applied to knowledge that's been passed down through generations of Kenyan healers and herbalists. That local depth is what makes it unique globally.",
    briz: "Brizerm Markets tracks the NSE (Nairobi Securities Exchange), uses KES, and understands Kenyan business structures. It's not a generic business tool with 'Kenya' slapped on — it was built from the ground up for the Kenyan entrepreneur.",
    'taskflow-pro': "TaskFlow Pro works fully offline — no internet needed. In Kenya, where connectivity can be unpredictable, that's not a nice-to-have. It's essential. And it's free, because we believe basic productivity tools shouldn't have a paywall.",
    agrixen: "Agriculture is Kenya's economic backbone — contributing over 20% of GDP. AgriXen is built for that reality: technology that serves farmers, agronomists, and agribusinesses in the Kenyan context.",
  };

  // ═══════════════════════════════════════════════════════════════
  // SECTION 5: CLOSING EXCELLENCE ENGINE
  // World-class conversation closers
  // ═══════════════════════════════════════════════════════════════

  var CLOSING_EXCELLENCE = {
    // For users who explored products
    explored: [
      "It was great walking you through what we build{userNameComma}. Remember — every product has a live demo, and the team is just a WhatsApp away at +254 113 400 063. Come back anytime. Mort-E GMA.2, always here.",
      "Thanks for giving MortApps Studios your time{userNameComma}. If any of our products caught your eye, the fastest way to move forward is WhatsApp or email at labs@mortappsstudios.com. Kwaheri!",
      "Good conversation{userNameComma}. Whether it's biometrics, AI wellness, or business intelligence — we've got something that fits. Reach out when you're ready. Mort-E GMA.2, built to serve.",
    ],
    // For users who asked deep questions
    deepConvo: [
      "I enjoyed that{userNameComma}. You asked the right questions — and that tells me you're serious about finding the right solution. When you're ready to take the next step, labs@mortappsstudios.com or WhatsApp +254 113 400 063. Let's make something happen.",
      "Quality questions get quality answers{userNameComma}. If you want to go even deeper — or see any of our products in action — reach out directly. The team responds fast. Tutaonana!",
    ],
    // For users who were just browsing
    casual: [
      "Take your time{userNameComma}. When you're ready to explore further, I'll be right here. In the meantime, our products are always available to try. Kwaheri!",
      "No rush{userNameComma}. MortApps Studios isn't going anywhere — and neither am I. Come back whenever you want to dive deeper. Salama!",
    ],
    // For first-time visitors
    firstTime: [
      "First visit{userNameComma}? You've seen a glimpse of what MortApps Studios is building. There's always more to discover. Come back anytime — I'll remember you. Karibu tena!",
    ],
    // Premium closers — the kind that make people remember
    premium: [
      "Before you go{userNameComma} — one thing worth knowing: MortApps Studios is proof that world-class software can come from Kenya. Not copies of Western tools. Original solutions for real problems. That's the mission. Spread the word.",
      "One last thing{userNameComma} — every product we build has to pass one test: does it feel human? If it doesn't, it's not done. That's the MortApps standard. I hope you felt it today. Kwaheri!",
    ],
  };

  // ═══════════════════════════════════════════════════════════════
  // SECTION 6: MAIN HOOK
  // ═══════════════════════════════════════════════════════════════

  function init() {
    console.log('Mort-E Enhancement Module 10: Kenyan Tech Authority + Closing Excellence — Active');

    var currentQuery = window.MortEBrains.query;
    var internals = window.MortEBrainsInternals;

    window.MortEBrains.query = function (rawInput) {
      // 1. Check for Kenyan tech ecosystem questions
      for (var i = 0; i < KENYA_TECH_TRIGGERS.length; i++) {
        var trigger = KENYA_TECH_TRIGGERS[i];
        if (trigger.pattern.test(rawInput)) {
          var knowledge = KENYA_TECH_KB[trigger.key][trigger.id];
          if (knowledge) {
            currentQuery(rawInput); // Update state
            return {
              text: knowledge + "\n\nMortApps Studios operates within this ecosystem — building products for the Kenyan market with world-class standards. Want to know how our products fit into this landscape?",
              buttons: [
                { label: 'Products', value: 'What products do you have' },
                { label: 'About Studio', value: 'Tell me about MortApps Studios' },
                { label: 'Local Advantage', value: 'Why should I choose a Kenyan studio' },
              ],
            };
          }
        }
      }

      // 2. Check for competitor comparison questions
      for (var i = 0; i < COMPETITOR_TRIGGERS.length; i++) {
        var compTrigger = COMPETITOR_TRIGGERS[i];
        if (compTrigger.pattern.test(rawInput)) {
          currentQuery(rawInput); // Update state
          return {
            text: compTrigger.handler(),
            buttons: [
              { label: 'Products', value: 'What products do you have' },
              { label: 'Why MortApps', value: 'What makes you different' },
              { label: 'Contact', value: 'How can I contact MortApps Studios' },
            ],
          };
        }
      }

      // 3. Run standard pipeline
      var result = currentQuery(rawInput);

      // 4. Inject local relevance context
      var state = internals && internals.state;
      var lastEntityId = state ? state.lastEntityId : null;

      if (lastEntityId && LOCAL_RELEVANCE[lastEntityId]) {
        // Inject local relevance ~30% of the time for natural feel
        if (Math.random() < 0.30 && result.text.length > 60) {
          result.text += ' ' + LOCAL_RELEVANCE[lastEntityId];
        }
      }

      // 5. Detect farewell and apply closing excellence
      var isFarewell = /^(bye|goodbye|see\s+you|later|farewell|kwaheri|ta-ta|tata|ciao|peace|i'?m?\s*(done|leaving|going|off))/i.test(rawInput.trim());
      if (isFarewell) {
        var name = internals && internals.memory ? internals.memory.getName() : null;
        var nameComma = name ? ', ' + name : '';

        // Pick the right closer based on conversation depth
        var profile = window.MortEEnhancements && window.MortEEnhancements.UserProfile
          ? window.MortEEnhancements.UserProfile.getProfile() : null;
        var mode = state && state._conversationMode ? state._conversationMode : 'browsing';
        var productsExplored = profile ? profile.productsExplored.length : 0;

        var closerPool;
        if (productsExplored >= 2) {
          closerPool = CLOSING_EXCELLENCE.explored;
        } else if (mode === 'researching') {
          closerPool = CLOSING_EXCELLENCE.deepConvo;
        } else if (profile && profile.visitCount <= 1) {
          closerPool = CLOSING_EXCELLENCE.firstTime;
        } else {
          closerPool = CLOSING_EXCELLENCE.casual;
        }

        // 20% chance of a premium closer
        if (Math.random() < 0.20) {
          closerPool = CLOSING_EXCELLENCE.premium;
        }

        var closer = closerPool[Math.floor(Math.random() * closerPool.length)];
        closer = closer.replace(/\{userNameComma\}/g, nameComma);

        result.text = closer;
        result.buttons = [
          { label: 'WhatsApp Us', value: 'whatsapp_link', type: 'link', url: 'https://wa.me/254113400063' },
          { label: 'Products', value: 'What products do you have' },
        ];
      }

      return result;
    };

    // Expose for other modules
    window.MortEEnhancements = window.MortEEnhancements || {};
    window.MortEEnhancements.KenyaTechKB = KENYA_TECH_KB;
    window.MortEEnhancements.LOCAL_RELEVANCE = LOCAL_RELEVANCE;
    window.MortEEnhancements.ClosingEngine = CLOSING_EXCELLENCE;
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { waitForBridge(0); });
  } else {
    waitForBridge(0);
  }

  // ── PUBLIC API ──────────────────────────────────────────────────
  window.MortEBrainsModule10 = {
    KenyaTechKB: KENYA_TECH_KB,
    LOCAL_RELEVANCE: LOCAL_RELEVANCE,
    ClosingEngine: CLOSING_EXCELLENCE,
  };

})();
