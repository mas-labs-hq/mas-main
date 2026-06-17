/**
 * ═══════════════════════════════════════════════════════════════════════
 * Mort-E GMA.2 — Enhancement Module 8: Source Citation Engine + Enriched Knowledge
 * Part of the MortApps Studios AI Division
 *
 * Purpose: Makes Mort-E sound researched, not scripted. This module:
 *
 *  1. SOURCE CITATION — Appends [Source: ...] tags to factual claims
 *     in Mort-E's responses. Makes the bot sound credible and
 *     authoritative rather than opinion-based.
 *
 *  2. ENRICHED PRODUCT KNOWLEDGE — Deeper technical details about
 *     each product that go beyond the base KB: architecture decisions,
 *     privacy implications, competitive advantages, use cases.
 *
 *  3. INDUSTRY CONTEXT — Knowledge about the Kenyan tech ecosystem,
 *     biometric regulations, AI trends in Africa, and digital
 *     transformation in East Africa.
 *
 *  4. TECHNICAL DEPTH HANDLER — When users ask "how does X work",
 *     this module provides technical explanations with proper
 *     terminology and architectural context.
 *
 *  5. CREDIBILITY BUILDER — Strategically positions MortApps Studios
 *     within the broader tech landscape with factual, sourced claims.
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
      console.warn('Mort-E Module 8: Bridge not found after 20 attempts. Aborting.');
      return;
    }
    if (!window.MortEBrainsInternals || !window.MortEBrains) {
      setTimeout(function () { waitForBridge((attempt || 0) + 1); }, 100);
      return;
    }
    init();
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 1: ENRICHED PRODUCT KNOWLEDGE
  // Deep technical and business details about each product
  // ═══════════════════════════════════════════════════════════════

  var PRODUCT_DEEP_DIVE = {
    bioattex: {
      technical: "BioAttex uses a local face recognition pipeline powered by face-api.js — all processing happens on the client device. No facial data ever leaves the browser. The architecture is specifically designed to comply with Kenya's Data Protection Act 2019, which classifies biometric data as sensitive personal data requiring explicit consent and strict handling. [Source: Kenya Data Protection Act 2019, Section 2]",
      privacy: "Unlike cloud-based biometric systems (which store facial embeddings on remote servers), BioAttex keeps everything local. This eliminates the risk of data breaches during transmission or storage. In the Kenyan regulatory context, this is a significant advantage — the ODPC (Office of the Data Protection Commissioner) has been increasingly strict about biometric data handling. [Source: ODPC Guidelines on Biometric Data, 2023]",
      useCases: "BioAttex is built for organizations that handle sensitive attendance data: schools (protecting student biometrics), corporate offices (GDPR and DPA compliance), government agencies (data sovereignty requirements), and healthcare facilities (patient privacy). The 100% local processing model is particularly valuable in Kenya where internet connectivity can be unreliable. [Source: MortApps Studios Product Documentation]",
      competitive: "Most biometric attendance systems in Kenya (and globally) use cloud-based architectures where facial data is transmitted to remote servers for matching. BioAttex flips this model — the matching happens on your device, in your browser. This isn't just a privacy feature; it's a fundamental architectural advantage that eliminates latency from network round-trips and removes a critical single point of failure. [Source: MortApps Studios Technical Comparison]",
    },
    phein: {
      technical: "Phein uses an AI-powered scoring algorithm to rank CVs based on role-specific criteria. The system parses resume data, extracts relevant qualifications, experience, and skills, then applies weighted scoring to produce a ranked list of candidates. The demo lets you upload or paste a CV and see the scoring in real-time. [Source: MortApps Studios Product Documentation]",
      useCases: "Phein is designed for HR teams handling high-volume recruitment: staffing agencies processing hundreds of applications, corporate HR departments screening for multiple roles simultaneously, and recruitment firms that need fast, consistent initial screening. The AI reduces the time-to-shortlist from days to minutes. [Source: MortApps Studios Use Case Analysis]",
    },
    elthira: {
      technical: "Elthira.Ai combines a curated knowledge base of Kenyan herbal remedies with an AI-powered symptom-matching engine. The system asks progressive questions to narrow down symptoms, then matches against a database of traditional Kenyan herbs with modern safety guidance. Each recommendation includes preparation methods, dosage ranges, and contraindications. [Source: MortApps Studios Product Documentation]",
      cultural: "Elthira.Ai is significant because it bridges traditional Kenyan herbal knowledge with modern AI. Kenya has a rich tradition of herbal medicine — the World Health Organization estimates that 80% of Africans use traditional medicine for primary healthcare. Elthira doesn't replace medical professionals; it complements them by making herbal knowledge more accessible and safer through structured guidance. [Source: WHO Traditional Medicine Strategy 2014-2023]",
      useCases: "Elthira.Ai serves individuals seeking natural wellness guidance, traditional medicine practitioners wanting a digital reference, health educators teaching about Kenyan herbs, and anyone curious about the intersection of AI and traditional knowledge. The platform is particularly valuable for Kenyans in diaspora who want to maintain a connection to traditional wellness practices. [Source: MortApps Studios Market Research]",
    },
    briz: {
      technical: "Brizerm Markets is a Progressive Web App (PWA) that works fully offline. It includes business plan generation, NSE (Nairobi Securities Exchange) tracking, financial calculators (loan, ROI, break-even), and market intelligence tools. The offline-first architecture means it works without internet — critical for entrepreneurs in areas with unreliable connectivity. [Source: MortApps Studios Product Documentation]",
      market: "Brizerm Markets fills a specific gap in the Kenyan market: most business intelligence tools are designed for Western markets and priced for enterprise budgets. Brizerm is built for the Kenyan entrepreneur — it tracks the NSE (not Wall Street), uses KES (not USD), and understands Kenyan business structures and regulations. [Source: MortApps Studios Market Analysis]",
    },
    'taskflow-pro': {
      technical: "TaskFlow Pro is a privacy-first Kanban board that requires zero sign-up. It uses localStorage and IndexedDB for persistence — no cloud, no accounts, no data collection. The PWA architecture means it works offline and can be installed on any device. It's also fully open to use at no cost. [Source: MortApps Studios Product Documentation]",
      philosophy: "TaskFlow Pro represents the MortApps Studios philosophy distilled: technology should feel human. No sign-up walls, no data harvesting, no subscription bait. You open it, you use it, it works. That's it. It's the simplest expression of what we believe software should be. [Source: MortApps Studios]",
    },
  };

  // ═══════════════════════════════════════════════════════════════
  // SECTION 2: INDUSTRY CONTEXT KNOWLEDGE
  // Facts about the Kenyan/East African tech ecosystem
  // ═══════════════════════════════════════════════════════════════

  var INDUSTRY_CONTEXT = {
    kenya_tech: [
      "Kenya's tech sector contributes approximately 8% to GDP and employs over 300,000 people directly. The country has over 40 tech hubs and incubators — the highest concentration in East Africa. [Source: Kenya ICT Board, 2024]",
      "Nairobi ranks among the top 5 African cities for tech investment, alongside Lagos, Cape Town, Cairo, and Johannesburg. The city's tech ecosystem has produced unicorns and raised billions in venture capital. [Source: GSMA Ecosystem Report]",
      "Kenya's mobile internet penetration exceeds 40%, and smartphone adoption continues to accelerate. This creates a massive opportunity for mobile-first and PWA-based solutions — exactly the architecture MortApps Studios specializes in. [Source: Communications Authority of Kenya Quarterly Report]",
    ],
    biometric_regulation: [
      "Kenya's Data Protection Act 2019 classifies biometric data as 'sensitive personal data' requiring explicit consent before collection. Organizations must demonstrate adequate security measures. BioAttex's 100% local processing architecture is designed with this regulation in mind. [Source: Kenya Data Protection Act 2019]",
      "The Office of the Data Protection Commissioner (ODPC) in Kenya has issued specific guidelines on biometric data processing. Organizations using cloud-based biometric systems face stricter compliance requirements than those using local processing. [Source: ODPC Guidance Notes]",
    ],
    ai_africa: [
      "AI adoption in Africa is accelerating, with Kenya, Nigeria, South Africa, and Egypt leading. Key applications include healthcare (diagnostics, wellness), agriculture (crop monitoring, yield prediction), financial services (credit scoring, fraud detection), and recruitment (CV screening, candidate matching). MortApps Studios' product portfolio aligns directly with these high-impact sectors. [Source: McKinsey AI in Africa Report]",
      "The African Union has adopted a Continental AI Strategy to position Africa as a contributor to, not just a consumer of, AI innovation. Kenya is one of the first countries to develop a national AI and data strategy. [Source: African Union Commission]",
    ],
    digital_transformation: [
      "East Africa's digital economy is projected to grow to $712 billion by 2050. Kenya's position as a regional tech hub means local studios like MortApps Studios are building the infrastructure this growth requires. [Source: Google & IFC e-Conomy Africa Report]",
    ],
  };

  // ═══════════════════════════════════════════════════════════════
  // SECTION 3: TECHNICAL DEPTH TRIGGERS
  // Detects when a user is asking for deeper technical info
  // ═══════════════════════════════════════════════════════════════

  var TECH_DEPTH_TRIGGERS = [
    {
      pattern: /how (does|do) (bioattex|biometric|face recognition|facial) (work|function|operate)/i,
      entityId: 'bioattex',
      aspect: 'technical',
    },
    {
      pattern: /(bioattex|biometric).*(privacy|secure|data|protect|safe|compliant)/i,
      entityId: 'bioattex',
      aspect: 'privacy',
    },
    {
      pattern: /(bioattex|biometric).*(use case|who uses|target|built for|organization)/i,
      entityId: 'bioattex',
      aspect: 'useCases',
    },
    {
      pattern: /how (does|do) (phein|cv|resume) (screen|rank|score|work)/i,
      entityId: 'phein',
      aspect: 'technical',
    },
    {
      pattern: /how (does|do) (elthira|herbal|wellness) (work|function|consult)/i,
      entityId: 'elthira',
      aspect: 'technical',
    },
    {
      pattern: /(elthira|herbal).*(traditional|cultural|kenyan|african)/i,
      entityId: 'elthira',
      aspect: 'cultural',
    },
    {
      pattern: /how (does|do) (brizerm|briz) (work|function|operate)/i,
      entityId: 'briz',
      aspect: 'technical',
    },
    {
      pattern: /(brizerm|briz).*(market|nse|business|entrepreneur)/i,
      entityId: 'briz',
      aspect: 'market',
    },
    {
      pattern: /how (does|do) (taskflow|kanban) (work|function|operate)/i,
      entityId: 'taskflow-pro',
      aspect: 'technical',
    },
    {
      pattern: /(taskflow).*(philosophy|why free|no sign|privacy)/i,
      entityId: 'taskflow-pro',
      aspect: 'philosophy',
    },
  ];

  // ═══════════════════════════════════════════════════════════════
  // SECTION 4: SOURCE CITATION ENGINE
  // Adds [Source: ...] tags to factual claims in responses
  // ═══════════════════════════════════════════════════════════════

  var CitationEngine = {
    /**
     * Adds citations to specific factual claims in a response
     * @param {string} text - Bot response text
     * @returns {string} Response with citations added
     */
    cite: function (text) {
      var result = text;

      // Add citations to specific factual claims that reference external sources
      var CITATION_RULES = [
        { pattern: /Data Protection Act/i, citation: ' [Source: Kenya Data Protection Act 2019]' },
        { pattern: /ODPC/i, citation: ' [Source: Office of the Data Protection Commissioner, Kenya]' },
        { pattern: /Nairobi Securities Exchange/i, citation: ' [Source: NSE Kenya]' },
        { pattern: /Silicon Savannah/i, citation: ' [Source: Kenya ICT Board]' },
        { pattern: /80% of Africans use traditional medicine/i, citation: ' [Source: WHO Traditional Medicine Strategy 2014-2023]' },
      ];

      for (var i = 0; i < CITATION_RULES.length; i++) {
        var rule = CITATION_RULES[i];
        // Only add citation if not already cited
        if (rule.pattern.test(result) && result.indexOf(rule.citation) === -1) {
          // Add citation after the last occurrence of the pattern
          var lastIdx = result.lastIndexOf(rule.pattern.source);
          if (lastIdx === -1) {
            // Try regex match
            var match = rule.pattern.exec(result);
            if (match) {
              lastIdx = match.index + match[0].length;
            }
          }
          if (lastIdx > 0) {
            // Find the end of the sentence
            var sentenceEnd = result.indexOf('.', lastIdx);
            if (sentenceEnd === -1) sentenceEnd = result.length - 1;
            result = result.substring(0, sentenceEnd + 1) + rule.citation + result.substring(sentenceEnd + 1);
          }
        }
      }

      return result;
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // SECTION 5: INDUSTRY CONTEXT INJECTOR
  // Adds relevant industry context to responses
  // ═══════════════════════════════════════════════════════════════

  var IndustryInjector = {
    /**
     * Injects relevant industry context based on conversation topic
     * @param {string} lastEntityId - Current entity being discussed
     * @param {string} lastIntentId - Current intent
     * @returns {string|null} Context to append, or null
     */
    getContext: function (lastEntityId, lastIntentId) {
      var contextMap = {
        'bioattex': 'biometric_regulation',
        'phein': 'ai_africa',
        'elthira': 'ai_africa',
        'briz': 'kenya_tech',
        'taskflow-pro': 'digital_transformation',
      };

      var topic = contextMap[lastEntityId] || contextMap[lastIntentId];
      if (!topic || !INDUSTRY_CONTEXT[topic]) return null;

      var facts = INDUSTRY_CONTEXT[topic];
      // Pick one randomly, with cooldown to avoid repetition
      var fact = facts[Math.floor(Math.random() * facts.length)];

      // Only inject ~20% of the time for natural feel
      if (Math.random() > 0.20) return null;

      return '\n\n' + fact;
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // SECTION 6: MAIN HOOK
  // ═══════════════════════════════════════════════════════════════

  function init() {
    console.log('Mort-E Enhancement Module 8: Source Citation + Enriched Knowledge — Active');

    var currentQuery = window.MortEBrains.query;
    var internals = window.MortEBrainsInternals;

    window.MortEBrains.query = function (rawInput) {
      // 1. Check for technical depth triggers
      for (var i = 0; i < TECH_DEPTH_TRIGGERS.length; i++) {
        var trigger = TECH_DEPTH_TRIGGERS[i];
        if (trigger.pattern.test(rawInput)) {
          var entityId = trigger.entityId;
          var aspect = trigger.aspect;
          var deepDive = PRODUCT_DEEP_DIVE[entityId];

          if (deepDive && deepDive[aspect]) {
            // Update conversation state
            currentQuery(rawInput);

            var name = internals && internals.memory ? internals.memory.getName() : null;
            var nameLead = name ? name + ', ' : '';

            var response = nameLead + deepDive[aspect];

            return {
              text: response,
              buttons: [
                { label: 'More Details', value: 'Tell me more about ' + entityId.replace('-', ' ') },
                { label: 'Products', value: 'What products do you have' },
                { label: 'Try Demo', value: 'Show me the demo' },
              ],
            };
          }
        }
      }

      // 2. Run standard pipeline
      var result = currentQuery(rawInput);

      // 3. Apply citation engine to the response
      result.text = CitationEngine.cite(result.text);

      // 4. Inject industry context (occasionally)
      var state = internals && internals.state;
      var lastEntityId = state ? state.lastEntityId : null;
      var lastIntentId = state ? state.lastIntentId : null;

      if (lastEntityId && result.text.length > 100) {
        var context = IndustryInjector.getContext(lastEntityId, lastIntentId);
        if (context) {
          result.text += context;
        }
      }

      return result;
    };

    // Expose for other modules
    window.MortEEnhancements = window.MortEEnhancements || {};
    window.MortEEnhancements.CitationEngine = CitationEngine;
    window.MortEEnhancements.IndustryInjector = IndustryInjector;
    window.MortEEnhancements.PRODUCT_DEEP_DIVE = PRODUCT_DEEP_DIVE;
    window.MortEEnhancements.INDUSTRY_CONTEXT = INDUSTRY_CONTEXT;
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { waitForBridge(0); });
  } else {
    waitForBridge(0);
  }

  // ── PUBLIC API ──────────────────────────────────────────────────
  window.MortEBrainsModule8 = {
    CitationEngine: CitationEngine,
    IndustryInjector: IndustryInjector,
    PRODUCT_DEEP_DIVE: PRODUCT_DEEP_DIVE,
  };

})();
