/**
 * ============================================
 * PHEIN SCREENER DEMO — Seed Data
 * ============================================
 * 12 diverse candidates for a Sales Manager
 * position. Loaded when the user clicks the
 * "Sample" button in the header.
 *
 * Mix of Kenyan, British, Japanese, American,
 * Nigerian, Indian, and German names.
 * 7 of 12 have location info.
 * ============================================
 * MortApps Studios | Phein Screener DEMO
 * ============================================
 */

(function() {
    'use strict';

    // Only run if state is available
    if (!window.state) return;

    var state = window.state;

    // =============================================
    // JOB CRITERIA — Sales Manager
    // =============================================
    state.criteria.title = 'Sales Manager';
    state.criteria.mustHave = ['sales', 'management', 'leadership', 'communication', 'revenue'];
    state.criteria.niceToHave = ['marketing', 'b2b', 'crm', 'strategic planning', 'negotiation'];

    // Update the UI fields
    var titleInput = document.getElementById('job-title');
    if (titleInput) titleInput.value = 'Sales Manager';

    var jdInput = document.getElementById('jd-input');
    if (jdInput) {
        jdInput.value = 'We are seeking an experienced Sales Manager to lead our regional sales team. The ideal candidate will have a proven track record in B2B sales, revenue growth, team leadership, and strategic planning. Key responsibilities include managing a team of 8-12 sales representatives, developing and executing sales strategies to meet quarterly revenue targets, building and maintaining client relationships, negotiating enterprise-level contracts, and collaborating with marketing to drive lead generation. Requirements: 5+ years of sales experience, 3+ years in a management role, strong communication and negotiation skills, experience with CRM platforms, and a results-driven mindset. Experience in the East African market is a plus.';
    }

    // Re-render keywords
    if (typeof renderKeywords === 'function') renderKeywords();
    if (typeof parseJobDescription === 'function') parseJobDescription();

    // =============================================
    // CANDIDATE DATA — 12 Diverse Profiles
    // =============================================
    var candidates = [
        // 1. Kenyan — Strong match, Nairobi-based
        {
            name: 'Wanjiku Kamau',
            type: 'cv',
            content: 'Wanjiku Kamau\nNairobi, Kenya\nwanjiku.kamau@email.com | +254 722 345 678\n\nProfessional Summary\nResults-driven Sales Manager with 9 years of experience in B2B sales and team leadership across East Africa. Proven track record of exceeding revenue targets by 25-40% year-over-year. Expert in building strategic partnerships and managing high-performing sales teams in competitive markets.\n\nWork Experience\nRegional Sales Manager — TechVista Solutions, Nairobi (Jan 2020 - Present)\n- Manage a team of 10 sales representatives across Kenya, Uganda, and Tanzania\n- Achieved 142% of annual revenue target in 2024 (KES 180M)\n- Developed and executed market entry strategy for Uganda, generating KES 45M in first year\n- Negotiated 3 enterprise-level contracts worth KES 60M+ each\n- Implemented CRM platform (Salesforce) across the sales team, improving pipeline visibility by 35%\n\nSenior Sales Executive — Horizon Distributors, Nairobi (Mar 2016 - Dec 2019)\n- Consistently exceeded quarterly sales targets by 20-30%\n- Built and maintained relationships with 50+ B2B clients in manufacturing and FMCG sectors\n- Led negotiations for multi-year supply agreements worth KES 120M\n- Trained and mentored 4 junior sales executives, 2 of whom were promoted\n\nSales Representative — Celtel Kenya, Nairobi (Jun 2012 - Feb 2016)\n- Managed portfolio of 30 corporate accounts\n- Grew territory revenue from KES 15M to KES 40M over 4 years\n\nEducation\nBachelor of Commerce (Marketing) — University of Nairobi, 2011\nDiploma in Sales Management — Kenya Institute of Management, 2013\n\nSkills\nSales Strategy, B2B Sales, Revenue Growth, Team Leadership, CRM (Salesforce, HubSpot), Negotiation, Strategic Planning, Client Relationship Management, Market Analysis, Communication, East African Market'
        },

        // 2. British — Very strong, London-based
        {
            name: 'James Whitfield',
            type: 'cv',
            content: 'James Whitfield\nLondon, United Kingdom\nj.whitfield@email.co.uk | +44 7700 900123\n\nProfessional Summary\nDynamic Sales Manager with 12 years of progressive experience driving revenue growth in enterprise B2B environments. Adept at building and leading high-performing teams, developing strategic sales plans, and negotiating complex multi-stakeholder deals. Demonstrated success in SaaS and technology sectors across EMEA markets.\n\nWork Experience\nHead of Sales — Meridian Tech Partners, London (Apr 2019 - Present)\n- Lead a team of 14 sales professionals across EMEA region\n- Grew regional revenue from \u00a34.2M to \u00a39.8M in 3 years (133% growth)\n- Designed and implemented strategic sales methodology improving close rate from 18% to 29%\n- Secured 5 enterprise contracts exceeding \u00a31M each in annual recurring revenue\n- Collaborated with marketing to develop lead generation campaigns generating 200+ qualified leads per quarter\n\nSales Manager — Apex Solutions Group, Manchester (Sep 2015 - Mar 2019)\n- Managed team of 8 account executives\n- Exceeded team quota by 35% for 3 consecutive years\n- Negotiated partnership deals with Fortune 500 companies\n- Implemented Salesforce CRM, reducing sales cycle by 22%\n\nSenior Account Executive — DataStream International, London (Jun 2011 - Aug 2015)\n- Top performer 3 out of 4 years, 140% average quota attainment\n- Built pipeline worth \u00a32.5M through strategic prospecting\n\nEducation\nMBA — Manchester Business School, 2015\nBachelor of Business Administration — University of Leeds, 2010\n\nSkills\nSales Management, Revenue Growth, B2B Enterprise Sales, Strategic Planning, Team Leadership, Negotiation, CRM (Salesforce, Pipedrive), SaaS Sales, EMEA Markets, Communication, Pipeline Management, Competitive Analysis'
        },

        // 3. Japanese — Strong, Tokyo-based
        {
            name: 'Takeshi Yamamoto',
            type: 'cv',
            content: 'Takeshi Yamamoto\nTokyo, Japan\nt.yamamoto@email.jp | +81 90 1234 5678\n\nProfessional Summary\nAccomplished Sales Manager with 8 years of experience in international B2B sales, specializing in technology and automotive sectors. Bilingual professional (Japanese/English) with a proven ability to bridge cultural gaps and drive cross-border revenue growth. Strong expertise in strategic account management and team development.\n\nWork Experience\nSales Manager — SakuraTech International, Tokyo (Jul 2020 - Present)\n- Lead a sales team of 7 across Japan and Southeast Asia\n- Increased regional revenue by 38% within 2 years through strategic market expansion\n- Managed key accounts including Toyota, Honda, and Nippon Steel\n- Developed bilingual sales training program improving team performance by 25%\n- Collaborated with marketing team on digital lead generation strategies\n\nInternational Sales Executive — Pacific Trade Solutions, Osaka (Mar 2017 - Jun 2020)\n- Managed B2B client portfolio generating JPY 800M annually\n- Negotiated 12 multi-year contracts with European and American partners\n- Implemented HubSpot CRM system for the international division\n\nSales Coordinator — Mitsui & Co., Tokyo (Apr 2014 - Feb 2017)\n- Supported sales operations for automotive parts division\n- Achieved 115% of individual sales targets consistently\n\nEducation\nMaster of International Business — Hitotsubashi University, 2013\nBachelor of Economics — Keio University, 2011\n\nSkills\nInternational Sales, B2B Sales, Revenue Growth, Team Leadership, Cross-Cultural Communication, Strategic Planning, CRM (HubSpot), Negotiation, Account Management, Japanese & English Markets'
        },

        // 4. Kenyan — Moderate, Mombasa-based
        {
            name: 'Odhiambo Felix Ochieng',
            type: 'cv',
            content: 'Odhiambo Felix Ochieng\nMombasa, Kenya\nfelix.odhiambo@email.com | +254 733 456 789\n\nProfessional Summary\nDedicated sales professional with 6 years of experience in FMCG and distribution sales along the Kenyan coast. Strong background in territory management and client relationship building. Looking to transition into a Sales Manager role to leverage my field experience and leadership potential.\n\nWork Experience\nSenior Sales Representative — CoastDistributors Ltd, Mombasa (Jan 2021 - Present)\n- Manage 25+ retail and wholesale accounts across Mombasa and Kilifi counties\n- Achieved 110% of monthly sales targets for 18 consecutive months\n- Trained 3 new sales representatives on territory management\n- Coordinate with marketing on promotional campaigns for product launches\n\nSales Representative — KenTrade Supplies, Mombasa (Jun 2018 - Dec 2020)\n- Grew territory revenue from KES 3M to KES 8M in 2.5 years\n- Built strong relationships with 40+ local business owners\n- Handled B2B negotiations for bulk supply contracts\n\nField Sales Agent — QuickMart, Mombasa (Mar 2016 - May 2018)\n- Conducted door-to-door and retail sales activities\n- Maintained customer satisfaction rating of 92%\n\nEducation\nDiploma in Business Administration — Mombasa Polytechnic, 2015\nCertificate in Sales and Marketing — Kenya Institute of Supplies Management, 2017\n\nSkills\nTerritory Sales, Client Relationship Management, B2B Negotiations, FMCG Distribution, Team Training, Communication, Customer Service, Revenue Tracking'
        },

        // 5. American — No location, strong experience
        {
            name: 'Patricia Holloway',
            type: 'cv',
            content: 'Patricia Holloway\np.holloway@email.com | +1 404 555 7890\n\nProfessional Summary\nStrategic Sales Manager with 11 years of experience leading high-revenue B2B sales teams in the SaaS and fintech industries. Known for building data-driven sales cultures, coaching teams to peak performance, and consistently exceeding aggressive revenue targets. Expert at navigating complex enterprise sales cycles.\n\nWork Experience\nVice President of Sales — NovaPay Solutions (Remote/Atlanta) (Feb 2020 - Present)\n- Lead a distributed team of 16 across 4 time zones\n- Drove annual contract value from $3.8M to $11.2M in under 3 years\n- Designed compensation structure that improved rep productivity by 40%\n- Negotiated the company\'s largest deal ($4.2M, 3-year contract) with a top-5 US bank\n- Partnered with marketing to create account-based marketing program generating 45% more qualified leads\n\nSales Manager — ClearView Analytics, Atlanta (May 2016 - Jan 2020)\n- Managed 8 account executives; team consistently ranked #1 in the region\n- Achieved 135% of team quota for 4 consecutive years\n- Reduced average sales cycle from 90 days to 58 days through process optimization\n- Implemented Pipedrive CRM with custom pipeline stages and automation\n\nAccount Executive — DataPath Inc., Charlotte (Aug 2012 - Apr 2016)\n- Top 5% performer company-wide for 3 years\n- Closed $2.5M in new business in 2015\n\nEducation\nMBA — Emory University Goizueta Business School, 2012\nBachelor of Science in Marketing — University of Georgia, 2009\n\nSkills\nEnterprise Sales Management, Revenue Growth, B2B Sales, Strategic Planning, Team Leadership, Negotiation, CRM (Salesforce, Pipedrive, HubSpot), SaaS Sales, Sales Operations, Communication, Data-Driven Decision Making, Coaching & Mentoring'
        },

        // 6. Nigerian — Lagos-based, strong
        {
            name: 'Chukwuemeka Adebayo',
            type: 'cv',
            content: 'Chukwuemeka Adebayo\nLagos, Nigeria\nc.adebayo@email.ng | +234 803 456 7890\n\nProfessional Summary\nResults-oriented Sales Manager with 10 years of experience driving revenue growth in West African markets. Proven expertise in building and managing high-performing sales teams, developing go-to-market strategies, and securing enterprise B2B partnerships. Deep understanding of the Nigerian and Ghanaian commercial landscape.\n\nWork Experience\nRegional Sales Manager — AfriConnect Telecom, Lagos (Aug 2019 - Present)\n- Manage a team of 12 across Nigeria and Ghana\n- Increased regional revenue by 55% from NGN 2.1B to NGN 3.3B in 2 years\n- Developed and executed sales strategy for 3 new product launches\n- Negotiated 8 enterprise deals exceeding NGN 200M each\n- Implemented Salesforce CRM across the West Africa division\n\nSales Team Lead — MegaDistributors Nigeria, Abuja (Jan 2016 - Jul 2019)\n- Led team of 6 sales executives in FMCG distribution\n- Exceeded annual sales targets by 30% for 3 consecutive years\n- Built strategic partnerships with 15 major retail chains\n- Coordinated with marketing on trade promotions increasing brand visibility by 45%\n\nSales Executive — Zenith Insurance, Lagos (Mar 2013 - Dec 2015)\n- Sold corporate insurance packages to SMEs and mid-market firms\n- Achieved 125% of annual quota in 2014\n\nEducation\nMaster of Business Administration — Lagos Business School, 2015\nBachelor of Marketing — University of Lagos, 2012\n\nSkills\nSales Management, Revenue Growth, B2B Sales, Team Leadership, Strategic Planning, CRM (Salesforce), Negotiation, West African Markets, Communication, Go-to-Market Strategy, Marketing Collaboration, Enterprise Sales'
        },

        // 7. Indian — No location, moderate
        {
            name: 'Rajesh Venkatesh',
            type: 'cv',
            content: 'Rajesh Venkatesh\nr.venkatesh@email.in | +91 98765 43210\n\nProfessional Summary\nExperienced sales professional with 7 years in IT services and B2B solution selling. Strong track record of managing client relationships and driving revenue through consultative selling approaches. Seeking a Sales Manager role to apply my technical sales background and team coordination skills.\n\nWork Experience\nSenior Sales Consultant — Infosys Technologies (Mar 2020 - Present)\n- Manage 20+ enterprise accounts in financial services vertical\n- Consistently achieved 115% of quarterly revenue targets\n- Coordinated cross-functional teams for solution design and proposal development\n- Negotiated service contracts worth $1.5M-$3M annually\n- Worked closely with marketing on webinar-based lead generation\n\nSales Executive — Wipro Limited (Jun 2017 - Feb 2020)\n- Sold IT infrastructure and cloud solutions to mid-market companies\n- Grew personal pipeline from $0.8M to $3.2M in 2 years\n- Developed strong relationships with C-suite decision makers\n- Trained 5 new hires on consultative selling methodology\n\nBusiness Development Associate — TCS (Jul 2014 - May 2017)\n- Prospected and qualified leads for enterprise software deals\n- Supported proposal writing and RFP responses\n\nEducation\nPostgraduate Diploma in Management — IIM Bangalore, 2014\nBachelor of Technology — VIT University, 2012\n\nSkills\nB2B Sales, IT Solutions Selling, Revenue Growth, Client Relationship Management, Negotiation, Communication, Team Coordination, Marketing Collaboration, Strategic Planning, CRM (Zoho, Salesforce)'
        },

        // 8. German — Berlin-based, strong
        {
            name: 'Katrina Mueller',
            type: 'cv',
            content: 'Katrina Mueller\nBerlin, Germany\nk.mueller@email.de | +49 170 1234567\n\nProfessional Summary\nBilingual Sales Manager (German/English) with 9 years of experience in industrial B2B sales across DACH and European markets. Expertise in consultative selling, complex contract negotiation, and building high-performing international sales teams. Proven ability to grow revenue in mature and emerging markets simultaneously.\n\nWork Experience\nSales Manager — RheinTech Industries, Berlin (Nov 2018 - Present)\n- Lead a team of 9 across Germany, Austria, and Switzerland\n- Grew DACH revenue from EUR 6.4M to EUR 10.8M (69% increase) over 3 years\n- Negotiated 5-year framework agreements with 3 major automotive OEMs\n- Developed strategic sales plan entering the renewable energy sector, generating EUR 2.1M in first year\n- Collaborated with marketing on trade show strategy, resulting in 35% increase in qualified leads\n- Implemented Microsoft Dynamics CRM with custom sales forecasting module\n\nSenior Sales Engineer — Bosch Rexroth, Stuttgart (Apr 2015 - Oct 2018)\n- Managed key accounts generating EUR 3.5M annually\n- Led technical sales presentations for hydraulic and automation systems\n- Achieved 130% of annual sales target in 2017\n\nSales Trainee — Siemens AG, Munich (Sep 2012 - Mar 2015)\n- Completed international sales training program\n- Rotated through 4 business units, consistently exceeding targets\n\nEducation\nMBA — ESMT Berlin, 2015\nBachelor of Industrial Engineering — TU Munich, 2012\n\nSkills\nB2B Industrial Sales, Sales Management, Revenue Growth, Strategic Planning, Team Leadership, Negotiation, CRM (MS Dynamics, Salesforce), DACH Markets, Communication, Marketing Collaboration, Consultative Selling, International Business'
        },

        // 9. Kenyan — No location, weak (career changer)
        {
            name: 'Amina Hassan',
            type: 'cv',
            content: 'Amina Hassan\namina.hassan@email.com | +254 712 345 678\n\nProfessional Summary\nCustomer-focused professional with 4 years of experience in customer service and retail operations. Strong communication skills and a passion for building client relationships. Currently pursuing opportunities in sales management to leverage my interpersonal skills and business acumen.\n\nWork Experience\nCustomer Service Team Lead — Java House Africa, Nairobi (Jan 2022 - Present)\n- Supervise team of 6 customer service representatives\n- Maintained customer satisfaction score of 94%\n- Handled escalation calls and resolved complex customer issues\n- Assisted in training new team members on service protocols\n\nRetail Supervisor — Nakumatt Holdings, Nairobi (Mar 2020 - Dec 2021)\n- Managed daily operations for a high-traffic retail location\n- Coordinated with suppliers on stock replenishment\n- Achieved 108% of monthly sales targets for promoted products\n\nCustomer Service Representative — Safaricom, Nairobi (Jun 2019 - Feb 2020)\n- Handled inbound calls and resolved customer queries\n- Consistently met call handling and satisfaction KPIs\n\nEducation\nDiploma in Business Management — Kenya Methodist University, 2018\nCertificate in Customer Service — KASNEB, 2019\n\nSkills\nCustomer Service, Communication, Team Supervision, Retail Operations, Client Relationship Management, Training, Problem Solving'
        },

        // 10. British — Manchester-based, moderate
        {
            name: 'Oliver Pemberton',
            type: 'cv',
            content: 'Oliver Pemberton\nManchester, United Kingdom\no.pemberton@email.co.uk | +44 7911 234567\n\nProfessional Summary\nMotivated Sales Manager with 7 years of experience in media and advertising sales. Skilled in managing account teams, developing client strategies, and driving revenue growth through innovative sales approaches. Looking to transition my sales leadership skills into a new industry.\n\nWork Experience\nSales Manager — Northern Media Group, Manchester (Sep 2019 - Present)\n- Manage a team of 6 sales executives selling digital and print advertising\n- Increased team revenue by 28% in the first year through process improvements\n- Developed new client acquisition strategy that added 35 accounts in 12 months\n- Collaborated with marketing on content-led sales approach generating \u00a3850K in new business\n- Implemented HubSpot CRM for pipeline tracking and reporting\n\nSenior Account Manager — AdVista Communications, Leeds (Jun 2016 - Aug 2019)\n- Managed portfolio of 25 B2B clients in retail and hospitality sectors\n- Exceeded personal targets by 22% on average over 3 years\n- Negotiated annual advertising packages worth \u00a3150K-\u00a3400K\n- Mentored 3 junior account managers\n\nAccount Executive — Signal Media Sales, Birmingham (Apr 2014 - May 2016)\n- Prospected and closed new business deals\n- Built pipeline from scratch to \u00a3500K within 18 months\n\nEducation\nBachelor of Arts in Business and Marketing — University of Manchester, 2013\n\nSkills\nSales Management, B2B Sales, Revenue Growth, Client Strategy, Team Leadership, CRM (HubSpot), Negotiation, Communication, Marketing Collaboration, Account Management, Media Sales'
        },

        // 11. Japanese/American — No location, moderate
        {
            name: 'Emily Nakamura',
            type: 'cv',
            content: 'Emily Nakamura\ne.nakamura@email.com | +1 212 555 8901\n\nProfessional Summary\nBilingual sales professional with 5 years of experience in cross-border technology sales between the US and Japan. Strong expertise in relationship-based selling, pipeline management, and cross-functional team coordination. Eager to take on a management role to drive team performance and revenue growth.\n\nWork Experience\nInternational Account Manager — GlobalLink Technologies, New York (Feb 2021 - Present)\n- Manage 15 key accounts spanning US and Japanese markets\n- Exceeded annual quota by 18% in 2023 ($2.4M vs $2.0M target)\n- Negotiated software licensing deals with Japanese enterprise clients\n- Collaborated with product and marketing teams on Japan-market go-to-launch strategy\n- Maintained 95% client retention rate across portfolio\n\nSales Development Representative — CloudBridge Solutions, San Francisco (Jun 2019 - Jan 2021)\n- Generated 200+ qualified leads through outbound prospecting\n- Supported senior account executives in deal negotiations\n- Ranked #3 out of 25 SDRs for qualified meeting generation\n\nBusiness Development Intern — Japan External Trade Organization (JETRO), New York (Jan 2019 - May 2019)\n- Researched market entry opportunities for Japanese tech firms\n- Prepared bilingual sales materials and presentations\n\nEducation\nBachelor of International Business — New York University, 2018\nExchange Program — Waseda University, Tokyo (2016-2017)\n\nSkills\nB2B Sales, Client Relationship Management, Negotiation, Cross-Cultural Communication, Marketing Collaboration, Pipeline Management, CRM (Salesforce), Bilingual (English/Japanese), Team Coordination'
        },

        // 12. Kenyan — Kisumu-based, weak (junior)
        {
            name: 'Brian Otieno',
            type: 'cv',
            content: 'Brian Otieno\nKisumu, Kenya\nbrian.otieno@email.com | +254 795 678 901\n\nProfessional Summary\nEnthusiastic and hardworking sales representative with 3 years of experience in pharmaceutical sales. Strong relationship-building skills and a deep understanding of the Western Kenya market. Seeking growth into a sales management position.\n\nWork Experience\nMedical Sales Representative — Phillips Pharmaceuticals, Kisumu (Apr 2022 - Present)\n- Cover 4 counties in Western Kenya region\n- Achieved 105% of sales target in 2023\n- Built relationships with 60+ healthcare facilities\n- Conduct product presentations to medical professionals\n\nSales Intern — Kenya Commercial Bank, Kisumu (Jan 2021 - Mar 2022)\n- Supported the retail banking sales team\n- Assisted in opening 120+ new accounts\n- Participated in customer outreach events\n\nEducation\nBachelor of Business Administration — Maseno University, 2020\n\nSkills\nTerritory Sales, Client Relationship Management, Communication, Product Presentations, Pharmaceutical Sales, Customer Outreach'
        }
    ];

    // =============================================
    // LOAD INTO STATE
    // =============================================
    // Clear existing data first
    state.cvs = [];
    state.candidates = {};
    state.lastResults = [];

    candidates.forEach(function(c) {
        var normalizedName = c.name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15);
        var docId = Date.now() + Math.random();

        // Add to candidates map
        state.candidates[normalizedName] = {
            id: docId,
            name: c.name,
            documents: {},
            combinedContent: ''
        };

        state.candidates[normalizedName].documents[c.type || 'cv'] = {
            id: docId,
            filename: c.name.replace(/\s+/g, '_') + '.pdf',
            content: c.content,
            type: c.type || 'cv'
        };

        state.candidates[normalizedName].combinedContent = c.content;

        // Add to flat cvs array
        state.cvs.push({
            id: docId,
            name: c.name,
            content: c.content,
            type: c.type || 'cv',
            candidateKey: normalizedName
        });
    });

    // Update limit to show all 12
    state.limit = 12;
    var limitInput = document.getElementById('limit-to');
    if (limitInput) limitInput.value = '12';

    // Render the CV list
    if (typeof renderCvList === 'function') renderCvList();

    // Auto-run screening
    if (typeof runScreeningProcess === 'function') {
        setTimeout(function() { runScreeningProcess(); }, 300);
    }

    // Show toast
    if (typeof showToast === 'function') {
        showToast('Sample data loaded! 12 Sales Manager candidates ready for screening.', true);
    }

})();
