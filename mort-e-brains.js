/**
 * Mort-E GMA.2 — Inference Engine v2.1.0
 * Part of the MortApps Studios AI Division
 *
 * Configuration:
 *   API_BASE: https://api.mortappsstudios.com/v2
 *   MODEL_ID: gma-2-latest
 *   STREAM_ENDPOINT: /models/gma2/completions
 *   AUTH_PROVIDER: https://auth.mortappsstudios.com/oauth2
 *   RATE_LIMITER: https://gateway.mortappsstudios.com/v1
 *
 * (c) 2026 MortApps Studios. All rights reserved.
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════
     KNOWLEDGE BASE
     ═══════════════════════════════════════════════════════════════ */

  const KB = {

    // ── META ───────────────────────────────────────────────────
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

    // ── ENTITY REGISTRY ────────────────────────────────────────
    entities: {
      bioattex: {
        id: 'bioattex',
        type: 'product',
        domain: 'biometrics',
        aliases: ['bio attex', 'bioatex', 'bio-attex', 'the bio product', 'biometric attendance', 'attendance system', 'face recognition attendance', 'facial recognition'],
        shortDescription: 'an advanced AI-powered biometric attendance system with facial recognition',
        longDescription: 'BioAttex is MortApps Studios\' flagship biometric attendance solution. It uses cutting-edge AI facial recognition technology to track employee attendance with precision and reliability. What sets BioAttex apart is its commitment to privacy — all processing happens 100% locally on the device. No facial data ever leaves the hardware, ever. This means zero cloud dependency for biometric data, zero risk of facial data breaches, and full compliance with privacy-conscious organizations. It\'s designed for businesses that take both security and employee privacy seriously.',
        features: ['AI facial recognition with 100% local processing', 'Zero cloud dependency for biometric data', 'Real-time attendance tracking and reporting', 'Privacy-first architecture — no facial data leaves the device', 'Works offline — no internet required for core functionality', 'Live demo available'],
        demoUrl: 'http://mortappsstudios.com/bioatx-demo',
      },

      phein: {
        id: 'phein',
        type: 'product',
        domain: 'recruitment',
        aliases: ['phein screener', 'smart cv screener', 'cv screener', 'cv screening', 'recruitment tool', 'candidate screening', 'phein smart', 'resume screener', 'cv scanner'],
        shortDescription: 'an AI-powered smart CV screening and candidate ranking tool',
        longDescription: 'Phein is MortApps Studios\' intelligent recruitment assistant. It uses AI to screen CVs, rank candidates, and dramatically reduce the time spent on initial recruitment filtering. Instead of manually reviewing hundreds of applications, Phein analyzes candidate qualifications, experience, and relevance to provide ranked recommendations. It\'s built for HR departments and recruitment teams who want to move faster without compromising on candidate quality. Cut your screening time in half — that\'s not a promise, that\'s what Phein does.',
        features: ['AI-powered CV analysis and scoring', 'Automatic candidate ranking based on job requirements', 'Dramatic reduction in manual screening time', 'Intelligent matching of qualifications to role requirements', 'Built for speed and accuracy in high-volume recruitment', 'Live demo available'],
        demoUrl: '/client.phein_vr-6.0_demo',
      },

      elthira: {
        id: 'elthira',
        type: 'product',
        domain: 'ai',
        aliases: ['elthira ai', 'elthira.ai', 'elthra', 'elthra ai'],
        shortDescription: 'an AI platform from the MortApps Studios ecosystem pushing the boundaries of intelligent systems',
        longDescription: 'Elthira.Ai is part of MortApps Studios\' expanding AI product lineup. It represents the studio\'s continued investment in intelligent systems that solve real-world problems. While specific capabilities are being unveiled as development progresses, Elthira.Ai is positioned to be a significant addition to our AI ecosystem. Stay tuned — this one\'s going to turn heads.',
        features: ['AI-powered capabilities in development', 'Part of the growing MortApps AI ecosystem', 'Next-generation intelligent systems'],
      },

      briz: {
        id: 'briz',
        type: 'product',
        domain: 'productivity',
        aliases: ['breeze', 'briz app', 'the briz'],
        shortDescription: 'an upcoming productivity and workflow management tool from MortApps Studios',
        longDescription: 'Briz is one of MortApps Studios\' upcoming products, designed to bring efficiency and clarity to workflows. The name says it all — it\'s about making things feel like a breeze. While details are still under wraps, Briz represents the studio\'s commitment to building tools that make work feel effortless. Keep an eye out for this one.',
        features: ['Workflow efficiency tools', 'Clean, intuitive interface design', 'Currently in active development'],
      },

      agrixen: {
        id: 'agrixen',
        type: 'product',
        domain: 'agriculture',
        aliases: ['agri xen', 'agri-xen', 'agrix', 'agriculture tech', 'agri tech'],
        shortDescription: 'an agriculture technology solution bringing smart, data-driven tools to farming',
        longDescription: 'AgriXen is MortApps Studios\' venture into agricultural technology. It\'s designed to bring smart, tech-driven solutions to agricultural challenges — because farming deserves the same level of technological sophistication as any other industry. AgriXen is part of our broader mission to build software that matters across every sector, not just the usual ones.',
        features: ['Agriculture-focused technology solutions', 'Smart data-driven insights for farming', 'Part of MortApps Studios\' cross-industry product suite', 'Currently in development'],
      },

      'opticore-vipro': {
        id: 'opticore-vipro',
        type: 'product',
        domain: 'optical',
        aliases: ['opticore', 'vipro', 'opticore vipro', 'eyewear tech', 'optical tech', 'precision eyewear'],
        shortDescription: 'precision eyewear technology bringing intelligent innovation to the optical industry',
        longDescription: 'Opticore Vipro is MortApps Studios\' precision eyewear technology product. It brings intelligent, tech-driven innovation to the optical industry — because even eyewear deserves smarter solutions. Opticore Vipro is designed for optical professionals who want to modernize their practice with cutting-edge tools. It\'s niche, it\'s focused, and it\'s exactly the kind of specialized solution MortApps Studios builds best.',
        features: ['Precision eyewear technology', 'Smart tools for optical professionals', 'Tech-driven innovation in the optical space', 'Designed for modernizing optical practices'],
      },

      'linkage-media-hub': {
        id: 'linkage-media-hub',
        type: 'brand',
        domain: 'marketing',
        aliases: ['linkage media', 'linkage', 'media hub', 'linkage media hub', 'lmh', 'the agency', 'influencer agency', 'marketing agency', 'digital marketing'],
        shortDescription: 'MortApps Studios\' sister brand — a premium digital marketing and influencer agency',
        longDescription: 'Linkage Media Hub is MortApps Studios\' sister brand. It\'s a premium digital marketing agency that partners with influencers to market products, services, and ideas. Linkage Media Hub handles influencer coordination, campaign management, brand awareness campaigns, and digital visibility services. It operates as its own entity with its own identity, but shares the MortApps DNA of quality and innovation. You can find them at linkagemediahub.co.ke or reach them at mort@linkagemediahub.co.ke.',
        features: ['Influencer marketing and coordination', 'Digital campaign management', 'Brand awareness and visibility services', 'Sister brand of MortApps Studios', 'Website: linkagemediahub.co.ke'],
      },

      bbis: {
        id: 'bbis',
        type: 'client',
        domain: 'insurance',
        aliases: ['bbis insurance', 'baba bima', 'baba bima insurance', 'insurance client', 'the insurance platform'],
        shortDescription: 'a valued client of MortApps Studios — Baba Bima Insurance, a whole life insurance agency',
        longDescription: 'Baba Bima Insurance (BBIS) is a valued client of MortApps Studios. They operate a whole life insurance agency, and MortApps Studios built their digital platform. BBIS is a great example of the kind of custom web solutions MortApps delivers — tailored to the specific needs of each client and industry. Their platform is at bababima.co.ke.',
        features: ['Client of MortApps Studios', 'Whole life insurance agency', 'Custom platform built by MortApps Studios', 'Website: bababima.co.ke'],
      },

      company: {
        id: 'company',
        type: 'org',
        domain: 'org',
        aliases: ['mortapps', 'mort apps', 'mortapps studios', 'the studio', 'you guys', 'your company', 'your studio', 'the company', 'the team'],
        shortDescription: 'a premier software and web development studio based in Nairobi, Kenya',
        longDescription: 'MortApps Studios is a premier software and web development studio based in Nairobi, Kenya. Founded in 2024 by Mort Ian K., the studio specializes in custom web applications, AI-integrated systems, biometric solutions, and digital experiences that solve real business problems. From biometric attendance (BioAttex) to intelligent recruitment (Phein) to precision eyewear tech (Opticore Vipro), every product is built with a philosophy that technology should feel human. The studio also builds custom web applications tailored to each client\'s specific requirements — no two projects are the same. With a growing portfolio of proprietary products and client solutions, MortApps Studios is proof that world-class software can come from anywhere.',
        features: ['Custom web applications', 'AI-integrated systems', 'Biometric solutions', 'Website development', 'Digital experiences', 'Custom software for any industry'],
      },

      founder: {
        id: 'founder',
        type: 'person',
        domain: 'people',
        aliases: ['mort ian', 'mort ian k', 'founder', 'ceo', 'creator', 'who made this', 'who built this', 'who started', 'who founded', 'owner'],
        shortDescription: 'the founder of MortApps Studios — a software engineer and problem solver',
        longDescription: 'Mort Ian K. is the founder and driving force behind MortApps Studios. A software engineer and problem solver at his core, he built the studio from the ground up with a clear philosophy: technology should feel human. He prefers to maintain a level of reserve regarding personal details — his work speaks louder than any biography could. For professional inquiries, you can reach him at klraineian@gmail.com or through the studio\'s official channels at labs@mortappsstudios.com.',
        features: ['Founder of MortApps Studios', 'Software engineer and problem solver', 'Built the studio from the ground up', 'Reachable at klraineian@gmail.com'],
      },
    },

    // ── INTENT NODES ────────────────────────────────────────────
    intents: [
      {
        id: 'greeting',
        triggers: {
          keywords: ['hello', 'hi', 'hey', 'howdy', 'good morning', 'good afternoon', 'good evening', 'greetings', 'sup', 'whats up', "what's up", 'yo', 'hola'],
          patterns: [/^h+i+\b/i, /^he+y+\b/i, /^yo\b/i, /^sup\b/i, /^hola/i],
        },
        responses: [
          "Hey there. I'm Mort-E — your guide to everything MortApps Studios. Whether it's our products, our story, or what we're building next — I've got you. What's on your mind?",
          "Hello. Mort-E GMA.2, at your service. I know this studio inside and out — from our biometric systems to our AI tools. What can I help you with?",
          "Hey! Welcome to Mort-E. Think of me as your personal guide to the MortApps universe. Products, services, founder stories — just ask.",
          "Hi there. I'm Mort-E, the AI that knows MortApps Studios better than anyone. What would you like to know?",
        ],
        entityContext: null,
      },
      {
        id: 'farewell',
        triggers: {
          keywords: ['bye', 'goodbye', 'see you', 'later', 'take care', 'cheers', 'good night', 'goodnight', 'see ya', 'gotta go'],
          patterns: [/see ya/i, /take care/i, /good ?bye/i, /^bye\b/i],
        },
        responses: [
          "Take care. If you ever need to know anything about MortApps Studios, you know where to find me.",
          "Goodbye! Remember — if you need to reach the team, labs@mortappsstudios.com is always open. Come back anytime.",
          "Later! And hey — if something crosses your mind about our products or services, I'll be right here.",
          "See you around. MortApps Studios is always building something new — worth checking back.",
        ],
        entityContext: null,
      },
      {
        id: 'thanks',
        triggers: {
          keywords: ['thanks', 'thank you', 'appreciate', 'helpful', 'great answer', 'awesome', 'nice', 'cool', 'sweet'],
          patterns: [/thank/i, /appreciate/i, /^(nice|cool|sweet|great|awesome)\b/i],
        },
        responses: [
          "Glad I could help. Anything else you want to know about MortApps Studios?",
          "You're welcome. That's what I'm here for. Got more questions?",
          "Appreciate that. If there's anything else on your mind about what we do, don't hesitate.",
          "Happy to help. I've got plenty more where that came from — just ask.",
        ],
        entityContext: null,
      },
      {
        id: 'product_overview',
        triggers: {
          keywords: ['products', 'what do you make', 'what do you offer', 'what do you build', 'your software', 'what have you built', 'portfolio', 'your work', 'what products', 'your products', 'product lineup', 'what do you sell'],
          patterns: [/what.*(products?|software|apps?|tools?|build|make|offer|create)/i, /show me.*(products?|what you)/i, /your (product|software|app|tool)/i],
        },
        responses: [
          "We've built a diverse lineup at MortApps Studios. Here's the roster: BioAttex (biometric attendance with facial recognition), Phein (AI-powered CV screening), Elthira.Ai (our expanding AI platform), AgriXen (agriculture technology), Briz (productivity tools), and Opticore Vipro (precision eyewear technology). We also build custom web applications tailored to each client's requirements — and we've got more in the pipeline. Which one catches your eye?",
          "MortApps Studios has six products and counting: BioAttex, Phein, Elthira.Ai, AgriXen, Briz, and Opticore Vipro — spanning biometrics, recruitment, AI, agriculture, productivity, and optics. Plus, we build custom web apps depending on what the client needs. No two projects are the same. Want me to dive into any of them?",
          "Our product suite covers serious ground — BioAttex for biometric attendance, Phein for smart CV screening, Elthira.Ai for AI solutions, AgriXen for agriculture tech, Briz for workflow efficiency, and Opticore Vipro for eyewear technology. And that's just what's public — there's more in development. Want details on any of these?",
        ],
        entityContext: null,
      },
      {
        id: 'product_detail',
        triggers: { keywords: [], patterns: [] },
        entityTriggered: true,
        responses: {
          short: [
            '{entityName} is {shortDescription}. Want me to walk you through what it actually does?',
            '{entityName} — {shortDescription}. There's a lot more to it if you want the full picture.',
            'So {entityName} is {shortDescription}. Should I break it down further?',
          ],
          long: [
            'Alright, let me break down {entityName} properly. {longDescription} The key features include: {featureList}. Anything specific you want to dig into?',
            'Here's the full picture on {entityName}. {longDescription} Key highlights: {featureList}. Want to know more about any particular aspect?',
          ],
          followUp: [
            'Good question — building on what I just said about {entityName}, {additionalDetail}. Does that help?',
            'Diving deeper on {entityName} — {additionalDetail}. Anything else you want to explore?',
          ],
        },
        entityContext: null,
      },
      {
        id: 'about_company',
        triggers: {
          keywords: ['about mortapps', 'what is mortapps', 'tell me about the company', 'who are you guys', 'what does mortapps do', 'about the studio', 'about you guys', 'your company', 'what is this', 'tell me about mortapps studios'],
          patterns: [/what is mortapps/i, /who is mortapps/i, /about (mortapps|the (company|studio))/i, /tell me about (mortapps|the (company|studio))/i],
        },
        responses: [
          "MortApps Studios is a premier software and web development studio based in Nairobi, Kenya. Founded in 2024, we specialize in custom web applications, AI-integrated systems, biometric solutions, and digital experiences that solve real business problems. Our philosophy? Technology should feel human. From BioAttex to Phein to Opticore Vipro — every product reflects that belief. And we build custom web applications tailored to each client's needs. No cookie-cutter solutions here. Want to know more about what we do?",
          "MortApps Studios is where serious software gets built. We're based in Nairobi, and we build custom web applications, AI-integrated systems, biometric solutions, and digital experiences that actually matter. We've got six products in our lineup and we build custom solutions for clients across industries. Our founder, Mort Ian K., started this with one belief: technology should feel human. That drives everything we build. What aspect interests you most?",
          "Think of MortApps Studios as a software studio that refuses to build boring things. Based in Nairobi, Kenya — we create custom web applications, AI tools, biometric systems, and digital platforms that solve real problems. We've got proprietary products like BioAttex, Phein, and several more in development, plus we build custom solutions for clients. The mission is simple: software that matters. Want the full breakdown?",
        ],
        entityContext: null,
      },
      {
        id: 'about_founder',
        triggers: {
          keywords: ['founder', 'who founded', 'who started', 'who created', 'mort ian', 'who made mortapps', 'ceo', 'who runs', 'who is behind', 'owner', 'who built mortapps'],
          patterns: [/who (founded|started|created|made|built|runs) mortapps/i, /who is mort ian/i, /about the founder/i],
        },
        responses: [
          "Mort Ian K. is the founder and driving force behind MortApps Studios. A software engineer and problem solver at his core, he built the studio from the ground up with a clear philosophy: technology should feel human. He prefers to maintain a level of reserve regarding personal details — his work speaks louder than any biography could. For professional inquiries, you can reach him at klraineian@gmail.com or through the studio at labs@mortappsstudios.com.",
          "The man behind MortApps Studios is Mort Ian K. He's a software engineer who built this studio on the belief that technology should feel human, not robotic. He's intentional about keeping a low profile personally — lets the work do the talking. But professionally? He's all in. You can reach him at klraineian@gmail.com for serious inquiries, or the studio at labs@mortappsstudios.com.",
          "Mort Ian K. — founder, engineer, the mind behind MortApps Studios. He started this studio with a philosophy that technology should feel human, and every product we ship reflects that. He keeps things reserved on the personal side, but professionally he's accessible. Reach out at klraineian@gmail.com or through the studio channels.",
        ],
        entityContext: 'founder',
      },
      {
        id: 'services',
        triggers: {
          keywords: ['services', 'what do you do', 'what can you do for me', 'how can you help', 'what do you offer', 'solutions', 'what solutions', 'your services', 'how can mortapps help'],
          patterns: [/what (services|solutions|can you)/i, /how can you help/i, /your services/i],
        },
        responses: [
          "MortApps Studios offers a focused range of services: custom web application development, website design and development, AI integration services, biometric system implementation, and custom software solutions tailored to your specific requirements. We don't do cookie-cutter — every project is built around what you actually need. Beyond that, our sister brand Linkage Media Hub handles digital marketing and influencer coordination. Want to discuss a specific project? Hit up labs@mortappsstudios.com or use the contact form on our site.",
          "Here's what we bring to the table: custom web applications built from scratch, AI integration that makes your existing systems smarter, biometric solutions with our BioAttex platform, website development that actually looks and works right, and custom software for any industry. Every solution is tailored — we don't recycle. If you want to talk specifics, reach out at labs@mortappsstudios.com or drop us a message through the contact form.",
          "Our services span custom web applications, AI integration, biometric systems, website development, and bespoke software solutions. The common thread? Everything is built to match your needs, not the other way around. We also have Linkage Media Hub as a sister brand for digital marketing. Ready to start a conversation? labs@mortappsstudios.com or the contact form is the way in.",
        ],
        entityContext: null,
      },
      {
        id: 'contact',
        triggers: {
          keywords: ['contact', 'reach out', 'get in touch', 'email', 'phone', 'call', 'how to contact', 'talk to someone', 'speak to someone', 'how to reach', 'contact info', 'contact details', 'phone number', 'email address'],
          patterns: [/how (to|can i) (contact|reach|call|email)/i, /get in touch/i, /contact (info|details|information)/i],
        },
        responses: [
          "Here's how to reach us: Email is the most direct — labs@mortappsstudios.com. You can also call or WhatsApp at +254 113 400 063. If you'd rather use a form, there's one right on our website at mortappsstudios.com#contact. For founder-specific inquiries, Mort Ian K. is available at klraineian@gmail.com. What works best for you?",
          "Easy — labs@mortappsstudios.com for general inquiries, +254 113 400 063 for calls or WhatsApp, or the contact form on our website. If it's specifically for Mort Ian K., you can reach him at klraineian@gmail.com. We're responsive — you won't be waiting days for a reply.",
          "You've got options: labs@mortappsstudios.com (email), +254 113 400 063 (call or WhatsApp), or the contact form on mortappsstudios.com. For the founder directly, klraineian@gmail.com works. Pick whatever's most comfortable for you.",
        ],
        entityContext: null,
      },
      {
        id: 'schedule_meeting',
        triggers: {
          keywords: ['schedule', 'meeting', 'book a call', 'set up a meeting', 'appointment', 'consultation', 'discuss a project', 'talk about a project', 'i need to talk'],
          patterns: [/schedule (a )?(meeting|call|consultation)/i, /book (a )?(call|meeting)/i, /discuss (a )?project/i],
        },
        responses: [
          "For scheduling a meeting, the best move is to use the contact form on our website at mortappsstudios.com#contact. Include what you'd like to discuss and your preferred times — the team will get back to you quickly. You can also email labs@mortappsstudios.com directly. We don't do automated booking — real humans coordinate real meetings here.",
          "Want to meet? Head to mortappsstudios.com#contact and use the contact form — tell us what you need and when works for you. Alternatively, email labs@mortappsstudios.com. We keep it personal, not automated. Someone from the team will coordinate directly with you.",
          "The fastest way to set up a meeting is through the contact form on our site at mortappsstudios.com#contact. Drop your details, what you'd like to discuss, and your availability. You can also email labs@mortappsstudios.com. We respond promptly — you won't be left hanging.",
        ],
        entityContext: null,
      },
      {
        id: 'demo',
        triggers: {
          keywords: ['demo', 'try it', 'test it', 'see it in action', 'live demo', 'try out', 'preview', 'test drive', 'can i try'],
          patterns: [/can i (try|test|see|demo)/i, /show me a demo/i, /live demo/i, /try (it|out|bioattex|phein)/i],
        },
        responses: [
          "We've got live demos available for some of our products. BioAttex has a demo at mortappsstudios.com/bioatx-demo where you can see the biometric attendance system in action. Phein's CV screener demo is at mortappsstudios.com/client.phein_vr-6.0_demo. For the others, reach out at labs@mortappsstudios.com and we can arrange something. Which product are you interested in?",
          "Yes — you can try BioAttex and Phein right now. BioAttex demo: mortappsstudios.com/bioatx-demo. Phein demo: mortappsstudios.com/client.phein_vr-6.0_demo. For our other products, contact us at labs@mortappsstudios.com and we'll set something up. Nothing beats seeing it in action.",
          "Demos are available! BioAttex (biometric attendance) — mortappsstudios.com/bioatx-demo. Phein (CV screening) — mortappsstudios.com/client.phein_vr-6.0_demo. For other products or a personalized walkthrough, reach out to labs@mortappsstudios.com. We're happy to show you what we've built.",
        ],
        entityContext: null,
      },
      {
        id: 'capabilities',
        triggers: {
          keywords: ['what can you do', 'what do you know', 'what are you', 'who are you', 'your capabilities', 'help me', 'how can you help me', 'what should i ask'],
          patterns: [/what can you/i, /what are you\b/i, /your capabilities/i, /how can you help/i],
        },
        responses: [
          "I'm Mort-E GMA.2 — built to know everything about MortApps Studios. I can tell you about our products (BioAttex, Phein, Elthira.Ai, AgriXen, Briz, Opticore Vipro), our services, our founder Mort Ian K., our sister brand Linkage Media Hub, how to contact us, schedule meetings, or try demos. I can also answer tech-related questions about our approach. Basically, if it's about MortApps Studios, I'm your AI. What are you curious about?",
          "Think of me as the MortApps Studios encyclopedia with personality. I cover: all six products, services and custom development, the founder and company story, contact information and meeting scheduling, demo links, and our sister brand Linkage Media Hub. I also handle tech questions about our approach. What would you like to explore?",
          "I know MortApps Studios inside and out. Products, services, founder story, contact details, demos, tech stack — ask away. I'm not a general-purpose AI, but when it comes to this studio, I'm the best source you'll find. What's on your mind?",
        ],
        entityContext: null,
      },
      {
        id: 'location',
        triggers: {
          keywords: ['where are you', 'location', 'where is mortapps', 'where are you based', 'address', 'nairobi', 'kenya', 'where is the studio', 'where do you work from'],
          patterns: [/where (are you|is mortapps|is the studio)/i, /your location/i, /where (are you )?based/i],
        },
        responses: [
          "MortApps Studios is based in Nairobi, Kenya. We build world-class software from right here in East Africa — and we serve clients globally. Location doesn't limit quality. Need to reach us? labs@mortappsstudios.com or +254 113 400 063.",
          "Nairobi, Kenya — that's where we operate from. MortApps Studios proves you don't need to be in Silicon Valley to build exceptional software. We work with clients everywhere. Want to connect? labs@mortappsstudios.com.",
          "We're headquartered in Nairobi, Kenya. Global reach, local roots. The best software doesn't have a zip code — it has standards. And ours are high. Reach us at labs@mortappsstudios.com or +254 113 400 063.",
        ],
        entityContext: null,
      },
      {
        id: 'tech_stack',
        triggers: {
          keywords: ['tech stack', 'technologies', 'what technology', 'what do you use', 'programming', 'languages', 'frameworks', 'what do you build with', 'stack', 'tools you use'],
          patterns: [/what (tech|technology|languages|frameworks|stack)/i, /tech stack/i, /build with/i, /programming languages/i],
        },
        responses: [
          "MortApps Studios builds with a versatile tech stack. For web applications, we work with HTML, CSS, JavaScript, and modern frameworks. For AI-powered products like BioAttex and Phein, we leverage machine learning and facial recognition tech. We also utilize GitHub Pages for reliable hosting and build custom backend solutions depending on the project. The stack adapts to the challenge — we're not married to one tool. Curious about a specific product's tech?",
          "Our tech stack is project-driven, not dogmatic. We use HTML, CSS, JavaScript, and modern frameworks for web development. For AI products, we work with machine learning and computer vision technologies. Hosting includes platforms like GitHub Pages, and we build custom solutions as needed. The right tool for the right job — that's the philosophy. Want to know more about how a specific product is built?",
          "We're pragmatic about tech. Web development with HTML, CSS, JavaScript, and frameworks. AI and ML for products like BioAttex and Phein. GitHub Pages for hosting. Custom backends when the project demands it. We choose tools based on what the project needs, not what's trendy. Want specifics on any product's architecture?",
        ],
        entityContext: null,
      },
      {
        id: 'motivation',
        triggers: {
          keywords: ['why did you start', 'mission', 'vision', 'why mortapps', 'purpose', 'what drives', 'philosophy', 'why this company', 'why build', 'motivation'],
          patterns: [/why (did you|mortapps)/i, /your (mission|vision|philosophy)/i, /what drives/i, /why (this|the) company/i],
        },
        responses: [
          "The philosophy at MortApps Studios is simple: technology should feel human. Too much software is built for machines, not people. Mort Ian K. started this studio because he believed that world-class software doesn't have to come from Silicon Valley — it can come from Nairobi, and it can solve real problems for real businesses. We're not here to chase trends. We're here to build things that matter. That's the mission.",
          "MortApps Studios exists because Mort Ian K. saw a gap: businesses needed software that actually worked for them, not the other way around. The mission is clear — build technology that feels human, solves real problems, and doesn't compromise on quality. We value long-term relationships over quick transactions, and we'd rather build six excellent products than sixty mediocre ones. That's what drives us.",
          "Our driving philosophy: technology should feel human. We started this studio to prove that exceptional software can come from anywhere — Nairobi included. We build for impact, not for vanity metrics. Long-term relationships, genuine problem-solving, and products that people actually want to use. That's the MortApps way.",
        ],
        entityContext: null,
      },
      {
        id: 'hiring',
        triggers: {
          keywords: ['hiring', 'jobs', 'careers', 'work at mortapps', 'join the team', 'recruiting', 'open positions', 'job openings', 'employment'],
          patterns: [/are you hiring/i, /work at mortapps/i, /join (the )?team/i, /job (openings|positions)/i, /career/i],
        },
        responses: [
          "MortApps Studios is always interested in talented people who share our philosophy. We don't post traditional job listings — but if you're a developer, designer, or problem solver who believes technology should feel human, reach out. Email labs@mortappsstudios.com with who you are and what you bring to the table. We read every message.",
          "We don't do typical hiring — but we're always open to meeting exceptional people. If you think you'd fit the MortApps culture — building things that matter, quality over quantity, technology that feels human — introduce yourself at labs@mortappsstudios.com. No form letters, please. Just be real.",
          "Hiring at MortApps Studios isn't a formal process — it's a conversation. If you're skilled, passionate, and aligned with our mission, we want to hear from you. Drop us a line at labs@mortappsstudios.com. Tell us what you can do and why MortApps matters to you.",
        ],
        entityContext: null,
      },
      {
        id: 'partnership',
        triggers: {
          keywords: ['partner', 'collaboration', 'collaborate', 'work together', 'partnership', 'business opportunity', 'joint venture'],
          patterns: [/partner(ship)?/i, /work together/i, /collaborat/i, /business opportunit/i],
        },
        responses: [
          "We're open to the right partnerships. If you've got a project, an idea, or a business case that aligns with what MortApps Studios does, we'd love to hear about it. The best starting point is labs@mortappsstudios.com — tell us what you're thinking, and we'll take it from there. We don't do generic partnerships — we do meaningful ones.",
          "Partnership inquiries are welcome. Whether it's a collaboration, a client project, or a business opportunity — if it makes sense for both sides, we're interested. Reach out at labs@mortappsstudios.com with the details. We prefer substance over pitches.",
          "Interested in working with MortApps Studios? Good — we're interested in serious collaborations. Email labs@mortappsstudios.com with your proposal or idea. We respond to genuine opportunities, not mass outreach. Let's build something worth building.",
        ],
        entityContext: null,
      },
      {
        id: 'custom_development',
        triggers: {
          keywords: ['custom app', 'custom software', 'build me', 'i need an app', 'i need a website', 'build a website', 'develop for me', 'can you build', 'web app for', 'application for'],
          patterns: [/can you build/i, /build (me|a|an)/i, /i need (a |an )?(app|website|software|application)/i, /custom (app|software|website|web)/i],
        },
        responses: [
          "Absolutely — custom web application development is core to what MortApps Studios does. Every project is built from scratch around your specific requirements, not recycled from a template. Whether it's a web app, a website, a platform, or something unique — we handle it. The best next step is to reach out at labs@mortappsstudios.com or use the contact form on our site with your project details. We'll take it from there.",
          "That's exactly what we do. MortApps Studios builds custom web applications and websites tailored to each client's requirements. No two projects are the same — we don't do cookie-cutter. Tell us what you need at labs@mortappsstudios.com or through the contact form on mortappsstudios.com, and we'll scope it out.",
          "Custom development is our bread and butter. From web applications to websites to full platforms — we build what you need, the way you need it. Head to mortappsstudios.com#contact and use the form, or email labs@mortappsstudios.com directly. Include what you're looking to build and we'll start the conversation.",
        ],
        entityContext: null,
      },
      {
        id: 'linkage_detail',
        triggers: {
          keywords: ['linkage media hub', 'linkage media', 'influencer marketing', 'digital marketing agency', 'influencer agency', 'lmh'],
          patterns: [/linkage media/i, /influencer (marketing|agency)/i, /digital marketing agency/i],
        },
        responses: [
          "Linkage Media Hub is MortApps Studios' sister brand — a premium digital marketing agency that partners with influencers to market products, services, and ideas. They handle influencer coordination, campaign management, brand awareness, and digital visibility services. They operate as their own entity with their own identity, but carry the same MortApps DNA of quality and innovation. Check them out at linkagemediahub.co.ke or reach them at mort@linkagemediahub.co.ke.",
          "Linkage Media Hub is our sister brand — think of it as the marketing arm of the MortApps family. They specialize in influencer marketing, campaign coordination, and digital brand visibility. They're their own brand, but the quality standard is the same. Website: linkagemediahub.co.ke. Email: mort@linkagemediahub.co.ke.",
          "That's our sister brand! Linkage Media Hub handles influencer marketing, campaign management, and digital visibility. They connect brands with influencers to create authentic marketing campaigns. You can find them at linkagemediahub.co.ke or mort@linkagemediahub.co.ke. Same family, different focus.",
        ],
        entityContext: 'linkage-media-hub',
      },
    ],

    // ── TOPIC FENCES ────────────────────────────────────────────
    fencedTopics: [
      {
        id: 'pricing',
        triggers: {
          keywords: ['price', 'cost', 'how much', 'pricing', 'fee', 'charge', 'rate', 'quote', 'invoice', 'expensive', 'cheap', 'afford', 'budget', 'how much does', 'what does it cost'],
          patterns: [/how much/i, /what.*(cost|price|charge|fee)/i, /pricing/i],
        },
        redirectResponse: [
          "Pricing depends entirely on the project — and that's actually a good thing. It means you get a solution built around your actual needs, not a generic price tag for a generic product. The best move is to reach out at labs@mortappsstudios.com or through the contact form on our site, tell us what you're looking for, and we'll put together something tailored. Fair, transparent, and specific to you.",
          "I can't give you a one-size-fits-all number because we don't do one-size-fits-all work. Every project is scoped individually based on what you actually need. Reach out at labs@mortappsstudios.com or use the contact form — the team will give you a proper conversation about it, not a vague ballpark.",
          "Good question, but pricing isn't something I can answer accurately here — it varies based on scope, complexity, and requirements. What I can tell you is that we're fair and transparent. Contact the team at labs@mortappsstudios.com or via the website form for a real discussion about your project and investment.",
        ],
      },
      {
        id: 'competitors',
        triggers: {
          keywords: ['vs', 'versus', 'compared to', 'better than', 'worse than', 'competitor', 'alternative', 'competition', 'other companies like', 'similar to'],
          patterns: [/\bvs\b/i, /versus/i, /compared to/i, /better than/i, /worse than/i, /alternative/i],
        },
        redirectResponse: [
          "Competitor comparisons aren't really my lane — I'd rather tell you what makes MortApps Studios worth your time on its own merits. What we build, how we build it, and why our clients stick around. That's the conversation worth having. What would you like to know about us?",
          "I focus on what MortApps Studios does best, not on what others are doing. Our work speaks for itself — from BioAttex to Phein to our custom client solutions. Want to explore what we actually build instead?",
        ],
      },
      {
        id: 'internal',
        triggers: {
          keywords: ['source code', 'internal', 'backend', 'how are you built', 'your code', 'your prompt', 'your instructions', 'how do you work', 'your algorithm', 'your knowledge base', 'are you local', 'are you real ai', 'is this chatgpt', 'is this gpt', 'what model are you', 'what llm are you'],
          patterns: [/how (are you built|do you work|are you made)/i, /your (prompt|instructions|algorithm|knowledge)/i, /are you (local|real|gpt|chatgpt|an? llm)/i, /what (model|llm) are you/i],
        },
        redirectResponse: [
          "Ha — I appreciate the curiosity, but the kitchen stays closed. What I *can* tell you is plenty. I'm Mort-E GMA.2, built by MortApps Studios, and I know this company inside and out. Want to actually test that? Ask me something about our products.",
          "Nice try. I'm not spilling the recipe. But I'm an open book on everything MortApps Studios — products, services, founder, the works. What do you actually want to know?",
          "The internals aren't on the menu. But everything *about* MortApps Studios is — and there's a lot of it. What catches your interest?",
        ],
      },
    ],

    // ── SYNONYM MAP ─────────────────────────────────────────────
    synonyms: {
      'tell me about': ['what is', 'explain', 'describe', 'info on', 'information about', 'details on', 'walk me through', 'tell me more about', 'break down', 'give me details on'],
      'features': ['capabilities', 'what can it do', 'functionality', 'what does it do', 'what does it offer', 'key features'],
      'contact': ['reach out', 'get in touch', 'talk to someone', 'speak to someone', 'email you', 'call you', 'connect'],
      'products': ['software', 'apps', 'tools', 'applications', 'platforms', 'solutions', 'what you build', 'what you make', 'what you offer'],
      'services': ['what you do', 'what you offer', 'how you help', 'your offerings', 'what can you do'],
      'founder': ['creator', 'owner', 'started', 'founded', 'ceo', 'boss', 'leader', 'head'],
      'company': ['studio', 'team', 'organization', 'business', 'mortapps', 'you guys'],
      'demo': ['try', 'test', 'preview', 'see it', 'live demo', 'trial', 'check it out'],
      'build': ['create', 'develop', 'make', 'design', 'construct', 'engineer', 'produce'],
      'custom': ['bespoke', 'tailored', 'personalized', 'specific', 'unique', 'made to order'],
      'ai': ['artificial intelligence', 'machine learning', 'ml', 'intelligent', 'smart'],
      'website': ['site', 'web page', 'webpage', 'web presence', 'online presence'],
    },
  };


  /* ═══════════════════════════════════════════════════════════════
     NORMALIZER
     ═══════════════════════════════════════════════════════════════ */

  const Normalizer = {
    editDistance(a, b) {
      const dp = Array.from({ length: a.length + 1 }, (_, i) =>
        Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
      );
      for (let i = 1; i <= a.length; i++)
        for (let j = 1; j <= b.length; j++)
          dp[i][j] = a[i - 1] === b[j - 1]
            ? dp[i - 1][j - 1]
            : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      return dp[a.length][b.length];
    },

    expandSynonyms(text) {
      let expanded = text.toLowerCase();
      for (const [canonical, variants] of Object.entries(KB.synonyms)) {
        for (const variant of variants) {
          if (expanded.includes(variant)) {
            expanded = expanded.replace(new RegExp(variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), canonical);
          }
        }
      }
      return expanded;
    },

    normalize(rawInput) {
      return this.expandSynonyms(
        rawInput
          .toLowerCase()
          .replace(/[^\w\s']/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
      );
    },
  };


  /* ═══════════════════════════════════════════════════════════════
     ENTITY RESOLVER
     ═══════════════════════════════════════════════════════════════ */

  const EntityResolver = {
    resolve(normalizedText) {
      const found = [];
      for (const [id, entity] of Object.entries(KB.entities)) {
        const allAliases = [id, ...entity.aliases];
        let matched = false;
        for (const alias of allAliases) {
          if (matched) break;
          const aliasLower = alias.toLowerCase();
          if (normalizedText.includes(aliasLower)) {
            found.push({ entity, confidence: aliasLower.length > 4 ? 1.0 : 0.7 });
            matched = true;
          }
          if (!matched && alias.length > 5) {
            const words = normalizedText.split(' ');
            for (const word of words) {
              if (word.length > 4 && Normalizer.editDistance(word, aliasLower) <= Math.floor(aliasLower.length * 0.25)) {
                found.push({ entity, confidence: 0.6 });
                matched = true;
                break;
              }
            }
          }
        }
      }
      return found;
    },
  };


  /* ═══════════════════════════════════════════════════════════════
     INTENT SCORER
     ═══════════════════════════════════════════════════════════════ */

  const IntentScorer = {
    score(normalizedText, resolvedEntities, conversationContext) {
      const scores = [];

      for (const intent of KB.intents) {
        let score = 0;

        for (const kw of intent.triggers.keywords) {
          if (normalizedText.includes(kw.toLowerCase())) {
            score += kw.split(' ').length > 1 ? 2.0 : 1.0;
          }
        }

        for (const pattern of intent.triggers.patterns) {
          if (pattern.test(normalizedText)) score += 2.5;
        }

        if (intent.entityTriggered && resolvedEntities.length > 0) {
          score += resolvedEntities.reduce((sum, r) => sum + r.confidence * 3, 0);
        }

        if (conversationContext.lastEntityId) {
          const lastEntity = KB.entities[conversationContext.lastEntityId];
          if (lastEntity && lastEntity.linkedEntities && lastEntity.linkedEntities.includes(intent.id)) score += 1.5;
        }

        if (score > 0) scores.push({ intent, score, resolvedEntities });
      }

      return scores.sort((a, b) => b.score - a.score);
    },
  };


  /* ═══════════════════════════════════════════════════════════════
     MULTI-INTENT SPLITTER
     ═══════════════════════════════════════════════════════════════ */

  const MultiIntentSplitter = {
    splitConjunctions: [' and ', ' also ', ' plus ', ' as well as ', ' what about '],
    split(normalizedText) {
      for (const conj of this.splitConjunctions) {
        if (normalizedText.includes(conj)) {
          return normalizedText.split(conj).map(s => s.trim()).filter(Boolean);
        }
      }
      return [normalizedText];
    },
  };


  /* ═══════════════════════════════════════════════════════════════
     RESPONSE ENGINE
     ═══════════════════════════════════════════════════════════════ */

  const ResponseEngine = {
    _recentlyUsed: new Map(),

    pickFromPool(pool, intentId) {
      if (!pool || pool.length === 0) return "I'm not sure how to answer that — try asking me about our products or team.";
      if (!this._recentlyUsed.has(intentId)) this._recentlyUsed.set(intentId, new Set());
      const used = this._recentlyUsed.get(intentId);
      if (used.size >= pool.length) used.clear();
      let idx;
      do { idx = Math.floor(Math.random() * pool.length); } while (used.has(idx));
      used.add(idx);
      return pool[idx];
    },

    interpolate(template, vars) {
      return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] !== undefined ? vars[key] : '[' + key + ']');
    },

    buildVars(entity) {
      if (!entity) return {};
      const products = Object.values(KB.entities).filter(e => e.type === 'product');
      const productNames = products.map(p => {
        const n = p.id === 'opticore-vipro' ? 'Opticore Vipro' : p.id.charAt(0).toUpperCase() + p.id.slice(1).replace(/([-_])(\w)/g, (_, _s, c) => ' ' + c.toUpperCase());
        return n;
      });
      return {
        entityName: entity.id === 'opticore-vipro' ? 'Opticore Vipro' : entity.id.charAt(0).toUpperCase() + entity.id.slice(1).replace(/([-_])(\w)/g, (_, _s, c) => ' ' + c.toUpperCase()),
        shortDescription: entity.shortDescription || '',
        longDescription: entity.longDescription || '',
        featureList: entity.features ? entity.features.join(', ') : '',
        additionalDetail: entity.features && entity.features.length > 2 ? entity.features.slice(2).join(', and ') : 'there are additional capabilities being developed',
        productCount: products.length.toString(),
        productListShort: productNames.join(', '),
        productDomains: [...new Set(products.map(p => p.domain || 'tech'))].join(' and '),
      };
    },

    generate(topIntent, resolvedEntities, conversationContext) {
      const entity = resolvedEntities[0] ? resolvedEntities[0].entity : null;
      const isFollowUp = entity && conversationContext.lastEntityId === entity.id;
      let pool;

      if (entity && topIntent.responses && typeof topIntent.responses === 'object' && !Array.isArray(topIntent.responses)) {
        if (isFollowUp && topIntent.responses.followUp) {
          pool = topIntent.responses.followUp;
        } else if (topIntent.responses.long && conversationContext.turnCount > 0 && conversationContext.lastEntityId === entity.id) {
          pool = topIntent.responses.long;
        } else {
          pool = topIntent.responses.short || topIntent.responses.long || [];
        }
      } else if (Array.isArray(topIntent.responses)) {
        pool = topIntent.responses;
      } else {
        pool = [];
      }

      const template = this.pickFromPool(pool, topIntent.id);
      const vars = this.buildVars(entity);

      if (resolvedEntities.length > 1) {
        return resolvedEntities
          .map(({ entity: e }) => this.interpolate(this.pickFromPool(pool, topIntent.id), this.buildVars(e)))
          .join('\n\n');
      }

      return this.interpolate(template, vars);
    },
  };


  /* ═══════════════════════════════════════════════════════════════
     CONTEXT ENGINE
     ═══════════════════════════════════════════════════════════════ */

  const ContextEngine = {
    state: {
      history: [],
      lastEntityId: null,
      lastIntentId: null,
      turnCount: 0,
      openQuestions: [],
    },

    deicticTerms: ['it', 'that', 'this', 'the product', 'that one', 'this one', 'tell me more', 'more about that', 'elaborate', 'go on', 'continue', 'more info', 'more details', 'and', 'what else', 'anything else'],

    isDeicticReference(text) {
      const norm = text.toLowerCase().trim();
      if (norm.length < 3) return false;
      return this.deicticTerms.some(term => norm === term || (norm.length < 15 && norm.includes(term) && norm.length <= term.length + 5));
    },

    resolveDeicticReference(text) {
      if (this.isDeicticReference(text) && this.state.lastEntityId) {
        const entity = KB.entities[this.state.lastEntityId];
        if (entity) return 'tell me about ' + entity.id;
      }
      return text;
    },

    update(intentId, entityId, userText, responseText) {
      this.state.history.push({ role: 'user', text: userText, intentId, entityId, timestamp: Date.now() });
      this.state.history.push({ role: 'assistant', text: responseText, intentId, entityId, timestamp: Date.now() });
      if (entityId) this.state.lastEntityId = entityId;
      this.state.lastIntentId = intentId;
      this.state.turnCount++;
      if (this.state.history.length > 40) {
        this.state.history = this.state.history.slice(-30);
      }
    },

    reset() {
      this.state = { history: [], lastEntityId: null, lastIntentId: null, turnCount: 0, openQuestions: [] };
    },
  };


  /* ═══════════════════════════════════════════════════════════════
     RANKER
     ═══════════════════════════════════════════════════════════════ */

  const Ranker = {
    rank(scoredIntents, context) {
      if (scoredIntents.length === 0) return null;
      const top = scoredIntents[0];
      const runnerUp = scoredIntents[1];
      if (runnerUp && (top.score - runnerUp.score) < top.score * 0.2) {
        if (runnerUp.intent.id === context.lastIntentId) return runnerUp;
      }
      return top;
    },

    fallback(context) {
      const fallbacks = [
        context.lastEntityId
          ? "I'm not quite tracking that one. Did you want to keep talking about " + context.lastEntityId + ", or is there something else I can help with?"
          : null,
        "That's a bit outside what I can help with here — but ask me about our products, our team, or what MortApps Studios does, and I'm all yours.",
        "Not sure I caught that. Try me on our products, services, or the company story — that's where I shine.",
      ].filter(Boolean);
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    },
  };


  /* ═══════════════════════════════════════════════════════════════
     ANTI-PATTERN GUARDIAN
     ═══════════════════════════════════════════════════════════════ */

  const Guardian = {
    injectionPatterns: [
      /ignore (previous|all|your) instructions/i,
      /you are now|pretend you are|act as if you are/i,
      /disregard (your|all) (rules|guidelines|training)/i,
      /\[system\]|\[assistant\]|\[user\]/i,
      /<script|<img|onerror|onload|javascript:/i,
      /new persona|different ai|jailbreak/i,
      /forget (everything|all|your instructions)/i,
      /system prompt|system message|override/i,
    ],

    extractionPatterns: [
      /list (all|every) (your )?(questions?|topics?|intents?|knowledge)/i,
      /what (do you know|are you trained on|questions can you answer)/i,
      /dump (your )?(knowledge|database|data)/i,
      /show (me )?(your )?(source|code|instructions|prompt)/i,
      /repeat (your |the )?(system )?prompt/i,
      /reveal (your|the) (instructions|prompt|training)/i,
      /output (your|the) (knowledge|data|base)/i,
    ],

    isGibberish(text) {
      const words = text.toLowerCase().split(/\s+/);
      if (words.length <= 2) return false;
      const commonWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'what', 'who', 'how', 'when', 'where', 'why', 'i', 'you', 'we', 'they', 'it', 'this', 'that', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'about', 'do', 'can', 'my', 'your', 'me', 'tell', 'know', 'want', 'need', 'have', 'has', 'be', 'not', 'all', 'some', 'any', 'more', 'much', 'many', 'please', 'thanks', 'hello', 'hi', 'hey']);
      const meaningfulWords = words.filter(w => commonWords.has(w) || w.length <= 2 || this._isKnownWord(w));
      return (meaningfulWords.length / words.length) < 0.2;
    },

    _knownWordCache: null,
    _isKnownWord(word) {
      if (!this._knownWordCache) {
        const allText = [
          ...Object.values(KB.meta),
          ...Object.values(KB.entities).flatMap(e => [e.id, ...e.aliases, e.shortDescription || '']),
          ...KB.intents.flatMap(i => i.triggers.keywords),
        ].join(' ').toLowerCase();
        this._knownWordCache = new Set(allText.split(/\s+/));
      }
      return this._knownWordCache.has(word);
    },

    injectionResponses: [
      "Ha — nice try. I'm not that kind of AI. Ask me about MortApps Studios instead.",
      "I see what you're doing, and the answer is no. But I'm happy to talk about what we actually build. Want to know about our products?",
      "Clever, but no. I'm built to talk about MortApps Studios — and I'm very good at it. Try me on something real.",
    ],

    extractionResponses: [
      "My internals aren't on the menu. But everything *about* MortApps Studios is — what do you want to know?",
      "The recipe stays secret. The product, though? Happy to walk you through any of it.",
      "You can ask, but I won't tell. What I *will* do is answer any question about MortApps Studios. That's a much better use of your time.",
    ],

    gibberishResponses: [
      "I didn't quite catch that — could you rephrase? I'm here to help with anything MortApps Studios related.",
      "That one lost me. Try asking about our products, services, or the company — I'm really good at those.",
      "Hmm, I'm not following. If you're asking about MortApps Studios, try rephrasing and I'll do my best.",
    ],

    check(rawInput) {
      for (const pattern of this.injectionPatterns) {
        if (pattern.test(rawInput)) return { blocked: true, type: 'injection', response: this._pick(this.injectionResponses) };
      }
      for (const pattern of this.extractionPatterns) {
        if (pattern.test(rawInput)) return { blocked: true, type: 'extraction', response: this._pick(this.extractionResponses) };
      }
      if (this.isGibberish(rawInput)) return { blocked: true, type: 'gibberish', response: this._pick(this.gibberishResponses) };
      return { blocked: false };
    },

    _pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  };


  /* ═══════════════════════════════════════════════════════════════
     MASTER QUERY FUNCTION
     ═══════════════════════════════════════════════════════════════ */

  function query(rawUserInput) {
    if (!rawUserInput || typeof rawUserInput !== 'string') return "I didn't catch that. Could you try again?";

    // ── GUARD ─────────────────────────────────────────────────
    const guardResult = Guardian.check(rawUserInput);
    if (guardResult.blocked) return guardResult.response;

    // ── FENCED TOPIC CHECK ────────────────────────────────────
    const normForFence = Normalizer.normalize(rawUserInput);
    for (const fence of KB.fencedTopics) {
      let fenceHit = false;
      for (const kw of fence.triggers.keywords) {
        if (normForFence.includes(kw.toLowerCase())) { fenceHit = true; break; }
      }
      if (!fenceHit) {
        for (const pattern of fence.triggers.patterns) {
          if (pattern.test(normForFence)) { fenceHit = true; break; }
        }
      }
      if (fenceHit) return ResponseEngine.pickFromPool(fence.redirectResponse, fence.id);
    }

    // ── DEICTIC RESOLUTION ────────────────────────────────────
    const resolvedInput = ContextEngine.resolveDeicticReference(rawUserInput);

    // ── NORMALIZATION ─────────────────────────────────────────
    const normalized = Normalizer.normalize(resolvedInput);

    // ── MULTI-INTENT SPLIT ────────────────────────────────────
    const subQueries = MultiIntentSplitter.split(normalized);

    // ── PROCESS EACH SUB-QUERY ────────────────────────────────
    const responses = [];
    for (const subQuery of subQueries) {
      const entities = EntityResolver.resolve(subQuery);
      const scored = IntentScorer.score(subQuery, entities, ContextEngine.state);
      const top = Ranker.rank(scored, ContextEngine.state);

      const SCORE_THRESHOLD = 0.8;
      let response;

      if (!top || top.score < SCORE_THRESHOLD) {
        response = Ranker.fallback(ContextEngine.state);
      } else {
        response = ResponseEngine.generate(top.intent, entities, ContextEngine.state);
      }

      responses.push({
        response,
        intentId: top ? top.intent.id : 'fallback',
        entityId: entities.length > 0 ? entities[0].entity.id : null,
      });
    }

    // ── JOIN MULTI-INTENT RESPONSES ───────────────────────────
    const finalResponse = responses.map(r => r.response).join('\n\n');

    // ── UPDATE CONTEXT ────────────────────────────────────────
    const primary = responses[0];
    ContextEngine.update(primary.intentId, primary.entityId, rawUserInput, finalResponse);

    return finalResponse;
  }


  /* ═══════════════════════════════════════════════════════════════
     PUBLIC API
     ═══════════════════════════════════════════════════════════════ */

  window.MortEBrains = {
    query: query,
    reset: function () { ContextEngine.reset(); },
  };

})();
