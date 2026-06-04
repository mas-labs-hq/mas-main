/**
 * ============================================
 * AI DETECTION LENS — Detection Engine v2.0
 * ============================================
 * A 7-signal weighted ensemble system that
 * analyzes statistical patterns in CV text to
 * estimate the probability of AI-generated or
 * AI-assisted content.
 *
 * Signals:
 *   1. VBA  — Vocabulary Bias Analysis (30%)
 *   2. SBA  — Sentence Burstiness Analysis (15%)
 *   3. SCS  — Specificity & Concreteness (20%)
 *   4. SUD  — Structural Uniformity Detection (10%)
 *   5. TCD  — Transition & Connector Density (10%)
 *   6. RPD  — Repetitive Pattern Detection (10%)
 *   7. HLA  — Hedging Language Absence (5%)
 *
 * Section Weights (fairness):
 *   Experience: 40% | Summary: 20% | Cover Letter: 20%
 *   Education: 15% | Skills: 5%
 *
 * Output: { overallScore, band, signals, sectionScores,
 *           triggeredFlags, evidence, interviewSuggestions }
 * ============================================
 * MortApps Studios | Phein Screener v8.1
 * ============================================
 */

var AIDetectionEngine = (function() {
    'use strict';

    // =============================================
    // TIERED AI VOCABULARY DICTIONARY
    // Tier 1 = near-exclusive AI fingerprint (3x)
    // Tier 2 = corporate overuse by AI (1.5x)
    // Tier 3 = formal connectors AI uses more (1x)
    // =============================================
    var VOCAB_TIER1 = [
        // --- AI Poetry / Literary Metaphors ---
        'delve', 'delved', 'delving',
        'tapestry',
        'nuanced', 'nuance',
        'paramount',
        'pivotal',
        'underscore', 'underscored', 'underscores',
        'realm', 'realm of',
        'testament', 'a testament to',
        'multifaceted', 'multifaceted approach',
        'unwavering', 'unwavering commitment',
        'resonate', 'resonates', 'resonating',
        'transformative', 'transformative journey',
        'ever-evolving', 'ever-evolving landscape',
        'holistic', 'holistic approach',
        'groundbreaking',
        'paradigm', 'paradigm shift',
        'interconnected', 'interconnected world',
        'proactive', 'proactive approach',
        'dynamic environment',

        // --- AI CV Action Verbs (rare in real human CVs) ---
        'spearhead', 'spearheaded', 'spearheading',
        'orchestrate', 'orchestrated', 'orchestrating',
        'champion', 'championed', 'championing',
        'cultivate', 'cultivated', 'cultivating',
        'catalyze', 'catalyzed', 'catalyzing',
        'architect', 'architected', 'architecting',
        'pioneer', 'pioneered', 'pioneering',
        'amplify', 'amplified', 'amplifying',
        'revolutionize', 'revolutionized', 'revolutionizing',
        'traverse', 'traversed', 'traversing',
        'propel', 'propelled', 'propelling',
        'unleash', 'unleashed', 'unleashing',
        'unveil', 'unveiled', 'unveiling',
        'unlock', 'unlocked', 'unlocking',
        'harness', 'harnessed', 'harnessing',
        'embark', 'embarked', 'embarking',
        'augment', 'augmented', 'augmenting',
        'surpass', 'surpassed', 'surpassing',
        'elevate', 'elevated', 'elevating',

        // --- AI Adverbs (signature modifiers) ---
        'synergistic', 'synergistically',
        'meticulously', 'meticulous',
        'seamless', 'seamlessly',
        'comprehensively', 'comprehensive',
        'strategically', 'strategic',
        'meticulously',
        'proactively',
        'collaboratively',
        'innovatively',
        'diligently',
        'effectively',
        'consistently',
        'efficiently',
        'seamlessly',
        'synergistically',
        'meticulously',
        'proactively',
        'methodically',
        'systematically',
        'autonomously',
        'dynamically',
        'robustly',
        'thoughtfully',
        'purposefully',

        // --- AI-Favorite Multi-Word Phrases ---
        'comprehensive understanding',
        'meaningful impact',
        'driving results',
        'results-driven',
        'stakeholder management',
        'cross-functional collaboration',
        'best practices',
        'continuous improvement',
        'passionate about',
        'dedicated to',
        'track record of',
        'proven ability to',
        'strong background in',
        'extensive experience in',
        'results-driven professional',
        'proven track record',
        'passionate and innovative',
        'fast-paced agile',
        'fostered a culture',
        'fostering a culture',
        'industry-best practices',
        'industry-leading',
        'value-driven',
        'high-impact',
        'mission-critical',
        'state-of-the-art',
        'cutting-edge',
        'best-in-class',
        'end-to-end',
        'game-changing',
        'operational excellence',
        'technical excellence',
        'business growth',
        'business value',
        'deliver actionable',
        'actionable insights',
        'data-driven decision',
        'data-driven insights',
        'ensuring alignment',
        'ensuring adherence',
        'enabling teams',
        'resulting in enhanced',
        'resulting in improved',
        'resulting in increased',
        'resulting in significant',
        'driving efficiency',
        'driving innovation',
        'driving growth',
        'driving adoption',
        'driving engagement',
        'driving excellence',
        'progressive experience',
        'adept at harnessing',
        'adept at navigating',
        'natural mentor',
        'committed to fostering',
        'committed to delivering',
        'committed to excellence',
        'committed to driving',
        'demonstrated expertise',
        'demonstrated ability',
        'demonstrated success',
        'demonstrated proficiency',
        'hands-on experience',
        'deep understanding',
        'in-depth knowledge',
        'thorough understanding',
        'robust understanding',
        'extensive knowledge',
        'strong proficiency',
        'leveraging industry-best',
        'leveraging my',
        'tailored solutions',
        'scalable solutions',
        'innovative solutions',
        'comprehensive solutions',
        'streamlined processes',
        'streamlined workflows'
    ];

    var VOCAB_TIER2 = [
        // Corporate buzzwords AI overuses
        'leverage', 'leveraging',
        'streamline', 'streamlining',
        'robust', 'robust framework',
        'innovative', 'innovative solutions',
        'dynamic', 'dynamic professional',
        'optimize', 'optimizing', 'optimized',
        'empower', 'empowering', 'empowered', 'empowerment',
        'facilitate', 'facilitating', 'facilitated',
        'collaborate', 'collaborating', 'collaborative',
        'drive', 'driving',
        'enhance', 'enhancing', 'enhanced', 'enhancement',
        'utilize', 'utilizing', 'utilized',
        'demonstrate', 'demonstrated',
        'passionate', 'passionate about',
        'enthusiastic', 'enthusiastic about',
        'self-motivated',
        'detail-oriented',
        'fast-paced environment',
        'team player',
        'strong communication skills',
        'scalable', 'scalability',
        'bespoke',
        'disrupt', 'disruption',
        'impactful',
        'accelerate', 'accelerated',
        'align', 'aligned', 'alignment',
        'mentor', 'mentored', 'mentoring',
        'stakeholder', 'stakeholders',
        'remodel', 'remodeled', 'refactor',
        'aggregate', 'aggregated',
        'contextualize',
        'operationalize',
        'democratize',
        'incentivize',
        'cross-functional',
        'multidisciplinary',
        'multidimensional',
        'visionary',
        'versatile',
        'adaptable',
        'resourceful',
        'proactive',
        'proficient',
        'adept',
        'conversant',
        'consistently',
        'efficiently'
    ];

    var VOCAB_TIER3 = [
        // Formal connectors AI uses more
        'furthermore', 'moreover', 'additionally',
        'consequently', 'nevertheless', 'nonetheless',
        'in conclusion', 'to summarize',
        'it is worth noting', 'it is important to note',
        'it should be noted', 'notably',
        'in this regard', 'in light of',
        'as a result', 'owing to',
        'with regard to', 'in respect to',
        'it follows that', 'given that',
        'taking into consideration',
        'bearing in mind', 'the fact that',
        'subsequently', 'accordingly',
        'specifically', 'generally',
        'essentially', 'ultimately',
        'particularly', 'invariably',
        'predominantly', 'largely',
        'importantly', 'significantly',
        'indeed', 'thus', 'hence',
        'alternatively', 'conversely',
        'importantly'
    ];

    // =============================================
    // AI CONNECTOR PATTERNS
    // Words/phrases AI uses to connect clauses
    // in a "perfectly polished" way
    // =============================================
    var AI_CONNECTORS = [
        'ensuring', 'ensuring that', 'ensuring the',
        'enabling', 'enabling the', 'enabling teams',
        'resulting in', 'resulting from',
        'while maintaining',
        'while ensuring',
        'while driving',
        'by leveraging',
        'through the use of',
        'through comprehensive',
        'through strategic',
        'through proactive',
        'in alignment with',
        'in accordance with',
        'in collaboration with',
        'in support of',
        'as part of',
        'with a focus on',
        'with an emphasis on',
        'utilizing a combination of',
        'utilizing industry',
        'utilizing modern',
        'utilizing best'
    ];

    // =============================================
    // AI CV BULLET STARTER VERBS
    // Past-tense action verbs AI overwhelmingly
    // prefers at the start of CV bullet points
    // =============================================
    var AI_BULLET_VERBS = [
        'spearheaded', 'orchestrated', 'championed', 'cultivated',
        'facilitated', 'streamlined', 'leveraged', 'optimized',
        'revolutionized', 'amplified', 'empowered', 'fostered',
        'catalyzed', 'architected', 'pioneered', 'drove',
        'delivered', 'executed', 'implemented', 'deployed',
        'migrated', 'integrated', 'transformed', 'established',
        'developed', 'designed', 'built', 'created',
        'managed', 'led', 'coordinated', 'mentored',
        'utilized', 'collaborated', 'contributed', 'supported',
        'participated', 'assisted', 'engaged', 'aligned'
    ];

    // =============================================
    // TRANSITION & CONNECTOR WORDS
    // =============================================
    var TRANSITIONS = [
        'furthermore', 'moreover', 'additionally', 'in addition',
        'consequently', 'therefore', 'thus', 'hence',
        'nevertheless', 'nonetheless', 'however', 'although',
        'meanwhile', 'subsequently', 'accordingly', 'similarly',
        'likewise', 'conversely', 'in contrast', 'on the other hand',
        'as a result', 'for this reason', 'in summary',
        'to conclude', 'in conclusion', 'notably',
        'importantly', 'significantly', 'specifically',
        'essentially', 'ultimately', 'particularly',
        'invariably', 'predominantly', 'largely'
    ];

    // =============================================
    // HEDGING LANGUAGE (humans use these naturally)
    // =============================================
    var HEDGE_WORDS = [
        'i think', 'i believe', 'mostly', 'usually', 'generally',
        'probably', 'likely', 'perhaps', 'maybe', 'possibly',
        'i suppose', 'i guess', 'kind of', 'sort of',
        'more or less', 'to some extent', 'fairly',
        'quite', 'rather', 'somewhat', 'arguably',
        'in my opinion', 'from my perspective', 'as far as i know',
        'i\'m not sure', 'i would say', 'i feel like',
        'roughly', 'approximately', 'around', 'about',
        'honestly', 'tbh', 'tbh i', 'to be honest',
        'i reckon', 'i\'d say', 'if i\'m being honest',
        'fair enough', 'pretty much', 'not gonna lie',
        'i mean', 'look, ', 'well, ', 'right, ',
        'basically', 'essentially', 'for what it\'s worth',
        'obviously', 'nothing fancy', 'sort of thing',
        'haven\'t got', 'keep meaning to', 'day to day',
        'to be fair', 'the usual', 'the odd',
        'i suppose', 'i was like', 'the thing is'
    ];

    // =============================================
    // SECTION WEIGHTS
    // =============================================
    var SECTION_WEIGHTS = {
        'experience': 0.40,
        'summary': 0.20,
        'cover_letter': 0.20,
        'education': 0.15,
        'skills': 0.05
    };

    // =============================================
    // SIGNAL WEIGHTS (total = 1.0)
    // VBA 32% — most reliable signal for CV analysis
    // TCD 6% — less useful for CVs (AI uses verbs, not transitions)
    // RPD 14% — parallel verb detection is very powerful for CVs
    // SCS 22% — vagueness vs concreteness is strong differentiator
    // =============================================
    var SIGNAL_WEIGHTS = {
        vba: 0.32,
        sba: 0.13,
        scs: 0.22,
        sud: 0.08,
        tcd: 0.06,
        rpd: 0.14,
        hla: 0.05
    };

    // =============================================
    // HELPER: Split text into sentences
    // =============================================
    function splitSentences(text) {
        if (!text || text.length < 20) return [];
        var sentences = text.split(/(?<=[.!?])\s+/);
        var clean = [];
        for (var i = 0; i < sentences.length; i++) {
            var s = sentences[i].trim();
            if (s.length >= 8 && s.length < 300) {
                clean.push(s);
            }
        }
        return clean;
    }

    // =============================================
    // HELPER: Get word count
    // =============================================
    function wordCount(text) {
        if (!text) return 0;
        return text.split(/\s+/).filter(function(w) { return w.length > 0; }).length;
    }

    // =============================================
    // HELPER: Extract CV sections from raw text
    // =============================================
    function extractSections(text) {
        if (!text) return { summary: '', experience: '', education: '', skills: '', cover_letter: '' };

        var lower = text.toLowerCase();
        var sections = { summary: '', experience: '', education: '', skills: '', cover_letter: '' };

        var boundaries = [
            { name: 'experience', start: /(?:work\s*experience|professional\s*experience|employment\s*(?:history|record)|career\s*(?:history|summary|overview)|relevant\s*experience)/i, end: /(?:education|academic|qualifications|certifications?|skills|technical\s*skills|references|interests|hobbies|languages?\b)/i },
            { name: 'education', start: /(?:education|academic\s*background|academic\s*qualifications|qualifications|educational?\s*history)/i, end: /(?:skills|technical\s*skills|certifications?|references|interests|hobbies|languages?\b|professional\s*(?:development|memberships?))/i },
            { name: 'skills', start: /(?:skills|technical\s*skills|core\s*competencies|competencies|tools\s*(?:&|and)\s*technologies|technologies|proficiencies|key\s*skills|technical\s*competencies)/i, end: /(?:references|interests|hobbies|languages?\b|certifications?|professional\s*(?:development|memberships?))/i }
        ];

        var summaryPatterns = [
            /(?:professional\s*summary|career\s*summary|executive\s*summary|profile\s*summary|personal\s*statement|about\s*me|career\s*objective|objective|professional\s*profile|summary)\s*[:\-—]?\s*/i
        ];

        var summaryMatch = null;
        for (var si = 0; si < summaryPatterns.length; si++) {
            var sm = text.search(summaryPatterns[si]);
            if (sm !== -1) { summaryMatch = sm + text.substring(sm).match(summaryPatterns[si])[0].length; break; }
        }
        if (summaryMatch !== null && summaryMatch < 600) {
            var summaryEnd = text.substring(summaryMatch).search(/\n\n|\r\n\r\n|(?=[A-Z][a-z]+ (?:Experience|Education|Skills|Qualifications|Work|Employment|Professional))/);
            sections.summary = summaryEnd !== -1 ? text.substring(summaryMatch, summaryMatch + summaryEnd) : text.substring(summaryMatch, Math.min(summaryMatch + 500, text.length));
        }

        for (var bi = 0; bi < boundaries.length; bi++) {
            var b = boundaries[bi];
            var startMatch = text.search(b.start);
            if (startMatch !== -1) {
                var content = text.substring(startMatch);
                var startOffset = content.match(b.start)[0].length;
                content = content.substring(startOffset);

                var endMatch = content.search(b.end);
                if (endMatch !== -1 && endMatch > 30) {
                    sections[b.name] = content.substring(0, endMatch);
                } else {
                    sections[b.name] = content.substring(0, Math.min(content.length, 3000));
                }
            }
        }

        if (!sections.experience && !sections.education && !sections.skills) {
            sections.experience = text;
        }

        var coverLetterIndicators = ['dear hiring manager', 'dear sir', 'dear madam', 'to whom it may concern', 'i am writing', 'i am excited', 'i would like to apply', 'please accept this'];
        var coverLetterCount = 0;
        for (var ci = 0; ci < coverLetterIndicators.length; ci++) {
            if (lower.indexOf(coverLetterIndicators[ci]) !== -1) coverLetterCount++;
        }
        if (coverLetterCount >= 2 && !sections.experience) {
            sections.cover_letter = text;
        }

        return sections;
    }

    // =============================================
    // SIGNAL 1: VOCABULARY BIAS ANALYSIS (VBA)
    // Massively expanded: ~300+ entries across
    // 3 tiers + AI connectors + bullet verb patterns
    // =============================================
    function analyzeVBA(text) {
        if (!text || text.length < 50) return { score: 0, flags: [], evidence: [] };
        var lower = text.toLowerCase();
        var wc = wordCount(text);
        if (wc < 30) return { score: 0, flags: [], evidence: [] };

        var tier1Hits = 0, tier2Hits = 0, tier3Hits = 0;
        var connectorHits = 0;
        var allEvidence = [];
        var allFlags = [];

        // Check Tier 1 (3x weight) — strongest AI signals
        for (var t1 = 0; t1 < VOCAB_TIER1.length; t1++) {
            var pattern = VOCAB_TIER1[t1].toLowerCase();
            var idx = lower.indexOf(pattern);
            if (idx !== -1) {
                tier1Hits++;
                var contextStart = Math.max(0, idx - 30);
                var contextEnd = Math.min(lower.length, idx + pattern.length + 30);
                allEvidence.push({
                    word: pattern,
                    context: text.substring(contextStart, contextEnd).trim(),
                    tier: 1
                });
            }
        }

        // Check Tier 2 (1.5x weight)
        for (var t2 = 0; t2 < VOCAB_TIER2.length; t2++) {
            var p2 = VOCAB_TIER2[t2].toLowerCase();
            if (lower.indexOf(p2) !== -1) {
                tier2Hits++;
                var ctx2Start = Math.max(0, lower.indexOf(p2) - 30);
                var ctx2End = Math.min(lower.length, lower.indexOf(p2) + p2.length + 30);
                allEvidence.push({
                    word: p2,
                    context: text.substring(ctx2Start, ctx2End).trim(),
                    tier: 2
                });
            }
        }

        // Check Tier 3 (1x weight)
        for (var t3 = 0; t3 < VOCAB_TIER3.length; t3++) {
            var p3 = VOCAB_TIER3[t3].toLowerCase();
            if (lower.indexOf(p3) !== -1) {
                tier3Hits++;
            }
        }

        // Check AI Connectors (2x weight — very strong CV signal)
        for (var ci = 0; ci < AI_CONNECTORS.length; ci++) {
            var conn = AI_CONNECTORS[ci].toLowerCase();
            if (lower.indexOf(conn) !== -1) {
                connectorHits++;
            }
        }

        // Weighted hit rate per 1000 words
        var normalizedHits = ((tier1Hits * 3) + (tier2Hits * 1.5) + (tier3Hits * 1) + (connectorHits * 2)) / (wc / 1000);

        // Recalibrated scoring — much more aggressive for high hit rates
        // < 3 hits/1000 = low AI probability (0-20)
        // 3-7 = moderate (20-50)
        // 7-14 = elevated (50-75)
        // > 14 = high (75-100)
        var score;
        if (normalizedHits <= 3) {
            score = normalizedHits * 6.7; // 0-20
        } else if (normalizedHits <= 7) {
            score = 20 + ((normalizedHits - 3) * 7.5); // 20-50
        } else if (normalizedHits <= 14) {
            score = 50 + ((normalizedHits - 7) * 3.6); // 50-75
        } else {
            score = Math.min(100, 75 + ((normalizedHits - 14) * 2.5)); // 75-100
        }

        // Bonus penalty: high density of Tier 1 words is near-definitive
        if (tier1Hits >= 8) score = Math.min(100, score + 15);
        else if (tier1Hits >= 5) score = Math.min(100, score + 8);

        // Bonus penalty: AI connectors are very strong signal in CVs
        if (connectorHits >= 6) score = Math.min(100, score + 10);
        else if (connectorHits >= 4) score = Math.min(100, score + 5);

        score = Math.min(100, Math.max(0, Math.round(score)));

        if (tier1Hits >= 4) allFlags.push('High density of AI-signature vocabulary (' + tier1Hits + ' Tier 1 words)');
        if (tier2Hits >= 6) allFlags.push('Elevated corporate buzzword usage (' + tier2Hits + ' Tier 2 words)');
        if (connectorHits >= 4) allFlags.push('Excessive AI connector phrases ("ensuring", "resulting in", "enabling")');
        if (tier3Hits >= 5) allFlags.push('Excessive formal transition phrases');

        return { score: score, flags: allFlags, evidence: allEvidence };
    }

    // =============================================
    // SIGNAL 2: SENTENCE BURSTINESS ANALYSIS (SBA)
    // Measures variance in sentence lengths.
    // AI produces uniform sentence lengths.
    // Humans have bursty, varied patterns.
    // =============================================
    function analyzeSBA(text) {
        if (!text || text.length < 100) return { score: 0, flags: [] };
        var sentences = splitSentences(text);
        if (sentences.length < 4) return { score: 0, flags: [] };

        var lengths = sentences.map(function(s) { return s.split(/\s+/).length; });
        var mean = lengths.reduce(function(a, b) { return a + b; }, 0) / lengths.length;

        var variance = lengths.reduce(function(sum, l) { return sum + Math.pow(l - mean, 2); }, 0) / lengths.length;
        var stdDev = Math.sqrt(variance);
        var cv = mean > 0 ? (stdDev / mean) : 0;

        // Tightened thresholds — AI is more uniform than we initially calibrated
        var score;
        if (cv >= 0.6) {
            score = Math.max(0, Math.round((0.6 - cv) * 50 + 10));
        } else if (cv >= 0.45) {
            score = Math.round(25 + ((0.45 - cv) / 0.15) * 20);
        } else if (cv >= 0.3) {
            score = Math.round(45 + ((0.3 - cv) / 0.15) * 25);
        } else if (cv >= 0.2) {
            score = Math.round(70 + ((0.2 - cv) / 0.1) * 20);
        } else {
            score = Math.min(100, Math.round(90 + (0.2 - cv) * 50));
        }

        var flags = [];
        if (cv < 0.25) flags.push('Highly uniform sentence lengths detected');
        else if (cv < 0.35) flags.push('Unusually consistent sentence structure');

        return { score: Math.min(100, Math.max(0, score)), flags: flags };
    }

    // =============================================
    // SIGNAL 3: SPECIFICITY & CONCRETENESS (SCS)
    // EXPANDED: More vague patterns, checks for
    // empty quantification, action-metric mismatch
    // =============================================
    function analyzeSCS(text) {
        if (!text || text.length < 50) return { score: 0, flags: [], concreteness: 0 };
        var lower = text.toLowerCase();
        var wc = wordCount(text);
        if (wc < 20) return { score: 0, flags: [], concreteness: 0 };

        // Sub-A: Quantifiable metrics
        var metricPatterns = [
            /\d+[%]/g,
            /\$[\d,]+(?:\.\d{1,2})?/g,
            /[\d,]+(?:\.\d{1,2})?\s*(?:users?|customers?|clients?|projects?|teams?|members?|people|staff|employees?|reports?|applications?|systems?|servers?|sites?|branches?|accounts?|products?|orders?|transactions?|candidates?|students?|merchants?|providers?|requests?)/g,
            /\d{4}\s*[-–to]+\s*\d{4}/g,
            /\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s*\d{4}\b/gi,
            /\d+\+?\s*(?:years?|yrs?|months?|weeks?|days?)\s+(?:of\s+)?(?:experience|expertise|practice|service|tenure)/gi,
            /\b(?:ksh|kes|usd|gbp|eur|k|£)\s*[\d,]+(?:\.\d{1,2})?/gi,
        ];

        var metricCount = 0;
        for (var mi = 0; mi < metricPatterns.length; mi++) {
            var matches = text.match(metricPatterns[mi]);
            if (matches) metricCount += matches.length;
        }

        // Sub-B: Concrete anchors
        var concretePatterns = [
            /\b(?:python|java|javascript|react|angular|vue|node\.?js|sql|aws|azure|docker|kubernetes|git|linux|python|c\+\+|c#|typescript|php|ruby|go|rust|swift|kotlin)\b/gi,
            /\b(?:excel|power\s*bi|tableau|salesforce|sap|oracle|jira|confluence|figma|sketch|adobe|photoshop|illustrator)\b/gi,
            /\b(?:microsoft|google|amazon|apple|meta|facebook|twitter|linkedin|slack|trello|asana|hubspot|shopify|wordpress)\b/gi,
            /\b(?:agile|scrum|kanban|waterfall|lean|six\s*sigma|prince2|pmp|itil)\b/gi,
        ];

        var concreteCount = 0;
        for (var ci = 0; ci < concretePatterns.length; ci++) {
            var cMatches = text.match(concretePatterns[ci]);
            if (cMatches) concreteCount += cMatches.length;
        }

        var concreteness = ((metricCount + concreteCount) / (wc / 100));

        // EXPANDED vague achievement language detector
        var vaguePatterns = [
            // Original patterns
            /\b(?:significant|substantial|considerable|notable|meaningful|measurable)\s+(?:growth|improvement|impact|increase|reduction|enhancement)/gi,
            /\b(?:drove|drove\s+significant|improved|enhanced|optimized|streamlined|boosted)\s+(?:growth|efficiency|performance|productivity|results)\b/gi,
            /\b(?:played\s+a\s+(?:key|vital|crucial|pivotal)\s+role|contributed\s+significantly)\b/gi,
            /\b(?:responsible\s+for|managed|oversaw|coordinated)\s+(?:a\s+team|multiple|various|several)\b/gi,

            // NEW: AI CV vague phrases — impressive-sounding but empty
            /\b(?:enhanced\s+(?:the\s+)?(?:end-user|customer|user)\s+experience)\b/gi,
            /\b(?:drove\s+a\s+substantial\s+increase)\b/gi,
            /\b(?:significantly\s+(?:enhanced|improved|increased|reduced|boosted))\b/gi,
            /\b(?:resulting\s+in\s+(?:enhanced|improved|increased)\s+(?:scalability|reliability|efficiency|performance|engagement|growth|adoption|quality))\b/gi,
            /\b(?:high-impact|high-performance|mission-critical|business-critical)\b/gi,
            /\b(?:valuable\s+insight|actionable\s+insight|data-driven\s+insight)\b/gi,
            /\b(?:business\s+(?:growth|value|objectives|outcomes|requirements|goals))\b/gi,
            /\b(?:operational\s+(?:excellence|efficiency|performance))\b/gi,
            /\b(?:customer\s+engagement\s+metrics)\b/gi,
            /\b(?:cross-functional\s+teams?\s+(?:to|comprising))\b/gi,
            /\b(?:industry\s*(?:standards|best\s*practices|requirements))\b/gi,
            /\b(?:organizational\s*(?:objectives|goals|alignment))\b/gi,
            /\b(?:continuous\s+(?:improvement|learning|development|growth))\b/gi,
            /\b(?:professional\s+(?:growth|development|excellence))\b/gi,
            /\b(?:technical\s+(?:excellence|solutions|expertise|challenges))\b/gi,
            /\b(?:innovative\s+(?:solutions|approaches|technologies|ideas))\b/gi,
            /\b(?:best\s*practices?\s+(?:and|to|for|across))\b/gi,
            /\b(?:proven\s+(?:track\s*record|ability|experience|expertise))\b/gi
        ];

        var vagueCount = 0;
        for (var vi = 0; vi < vaguePatterns.length; vi++) {
            var vMatches = text.match(vaguePatterns[vi]);
            if (vMatches) vagueCount += vMatches.length;
        }

        // Recalibrated scoring — non-linear so high concreteness properly dominates
        // A concreteness of 4+ per 100 words is very human, should push score very low
        var concreteBase;
        if (concreteness >= 5) {
            concreteBase = Math.max(0, 10 - concreteness); // 5+ → 0-5
        } else if (concreteness >= 3) {
            concreteBase = 10 + (5 - concreteness) * 8; // 3-5 → 18-26
        } else if (concreteness >= 1.5) {
            concreteBase = 26 + (3 - concreteness) * 16; // 1.5-3 → 42-50
        } else if (concreteness >= 0.5) {
            concreteBase = 50 + (1.5 - concreteness) * 16; // 0.5-1.5 → 58-74
        } else {
            concreteBase = Math.min(95, 74 + (0.5 - concreteness) * 42); // <0.5 → 74-95
        }

        // Vague penalty: higher when concreteness is also high
        // (listing tech names + vague achievements = classic AI CV pattern)
        var vagueMultiplier = concreteness >= 3 ? 1.4 : 1.0;
        var vaguePenalty = Math.min(72, vagueCount * 8 * vagueMultiplier);

        var score = Math.min(100, Math.max(0, Math.round(concreteBase + vaguePenalty)));

        var flags = [];
        if (vagueCount >= 4 && metricCount <= 2) flags.push('Vague achievement descriptions without quantifiable metrics (' + vagueCount + ' vague phrases)');
        if (vagueCount >= 6) flags.push('Excessive AI-typical vague language patterns');
        if (concreteness < 1.5 && wc > 100) flags.push('Low specificity — few named tools, technologies, or concrete details');

        return { score: score, flags: flags, concreteness: concreteness, metricCount: metricCount, vagueCount: vagueCount };
    }

    // =============================================
    // SIGNAL 4: STRUCTURAL UNIFORMITY DETECTION (SUD)
    // =============================================
    function analyzeSUD(text) {
        if (!text || text.length < 100) return { score: 0, flags: [] };

        // Try double-newline paragraphs first (proper formatting)
        var paragraphs = text.split(/\n\s*\n|\r\n\s*\r\n/).filter(function(p) { return p.trim().length > 50; });
        if (paragraphs.length < 2) {
            // Fallback: single newlines, but skip very short lines (headers, titles, etc.)
            // PDF extraction often produces single-line "paragraphs" — increase threshold to 60 chars
            paragraphs = text.split(/\n/).filter(function(p) {
                var t = p.trim();
                return t.length > 60 && t.split(/\s+/).length >= 10;
            });
        }
        if (paragraphs.length < 3) return { score: 0, flags: [] };

        var lengths = paragraphs.map(function(p) { return wordCount(p); });
        if (lengths.length < 2) return { score: 0, flags: [] };

        var mean = lengths.reduce(function(a, b) { return a + b; }, 0) / lengths.length;
        var variance = lengths.reduce(function(sum, l) { return sum + Math.pow(l - mean, 2); }, 0) / lengths.length;
        var cv = mean > 0 ? Math.sqrt(variance) / mean : 0;

        // Bullet point uniformity
        var bullets = text.match(/^[\s]*[-*•]\s+.+$/gm);
        var bulletUniformity = 0;
        if (bullets && bullets.length >= 3) {
            var bLengths = bullets.map(function(b) { return b.split(/\s+/).length; });
            var bMean = bLengths.reduce(function(a, b) { return a + b; }, 0) / bLengths.length;
            var bVar = bLengths.reduce(function(s, l) { return s + Math.pow(l - bMean, 2); }, 0) / bLengths.length;
            bulletUniformity = bMean > 0 ? Math.sqrt(bVar) / bMean : 1;
        }

        var combinedCV = cv * 0.6 + bulletUniformity * 0.4;

        var score;
        if (combinedCV >= 0.55) {
            score = Math.max(0, Math.round(15 - combinedCV * 15));
        } else if (combinedCV >= 0.4) {
            score = Math.round(15 + ((0.55 - combinedCV) / 0.15) * 25);
        } else if (combinedCV >= 0.25) {
            score = Math.round(40 + ((0.4 - combinedCV) / 0.15) * 25);
        } else if (combinedCV >= 0.15) {
            score = Math.round(65 + ((0.25 - combinedCV) / 0.1) * 20);
        } else {
            score = Math.min(100, Math.round(85 + (0.15 - combinedCV) * 100));
        }

        var flags = [];
        if (combinedCV < 0.2) flags.push('Highly uniform paragraph and bullet structure');
        else if (combinedCV < 0.3) flags.push('Unusually consistent text block sizes');

        return { score: Math.min(100, Math.max(0, score)), flags: flags };
    }

    // =============================================
    // SIGNAL 5: TRANSITION & CONNECTOR DENSITY (TCD)
    // =============================================
    function analyzeTCD(text) {
        if (!text || text.length < 50) return { score: 0, flags: [] };
        var lower = text.toLowerCase();
        var wc = wordCount(text);
        if (wc < 30) return { score: 0, flags: [] };

        var transitionCount = 0;
        for (var i = 0; i < TRANSITIONS.length; i++) {
            var regex = new RegExp('\\b' + TRANSITIONS[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
            var matches = lower.match(regex);
            if (matches) transitionCount += matches.length;
        }

        var density = (transitionCount / (wc / 1000));

        var score;
        if (density <= 15) {
            score = Math.round(density * 1.2);
        } else if (density <= 30) {
            score = Math.round(18 + ((density - 15) / 15) * 15);
        } else if (density <= 50) {
            score = Math.round(33 + ((density - 30) / 20) * 25);
        } else if (density <= 70) {
            score = Math.round(58 + ((density - 50) / 20) * 20);
        } else {
            score = Math.min(100, Math.round(78 + ((density - 70) / 30) * 22));
        }

        var flags = [];
        if (density > 60) flags.push('High density of formal transition words and connectors');
        else if (density > 40) flags.push('Elevated use of transitional phrases');

        return { score: Math.min(100, Math.max(0, score)), flags: flags };
    }

    // =============================================
    // SIGNAL 6: REPETITIVE PATTERN DETECTION (RPD)
    // EXPANDED: Now detects parallel verb openers
    // in bullet points — the #1 AI CV pattern
    // =============================================
    function analyzeRPD(text) {
        if (!text || text.length < 100) return { score: 0, flags: [] };

        var sentences = splitSentences(text);
        var lower = text.toLowerCase();

        // --- Sub-check A: Sentence starter repetition ---
        var starters = sentences.map(function(s) {
            var words = s.trim().split(/\s+/);
            return words.slice(0, Math.min(2, words.length)).join(' ').toLowerCase().replace(/[^a-z\s]/g, '');
        });

        var starterCounts = {};
        for (var si = 0; si < starters.length; si++) {
            var s = starters[si];
            if (s.length > 2) {
                starterCounts[s] = (starterCounts[s] || 0) + 1;
            }
        }

        var uniqueStarters = Object.keys(starterCounts).length;
        var totalStarters = starters.length;
        var starterRepetitionRate = totalStarters > 0 ? (1 - (uniqueStarters / totalStarters)) : 0;

        // --- Sub-check B: Bullet point / line verb parallelism ---
        // AI writes CVs where EVERY bullet starts with a past-tense action verb
        // Handles both marked bullets (-, *, •) AND plain lines (PDF strips markers)
        var bullets = text.match(/^[\s]*[-*•]\s*.+$/gm);
        var verbStarterCount = 0;
        var nonVerbStarterCount = 0;
        var bulletTotal = 0;

        // First try marked bullets
        if (bullets && bullets.length >= 3) {
            for (var bi = 0; bi < bullets.length; bi++) {
                var bText = bullets[bi].replace(/^[\s]*[-*•]\s+/, '').trim();
                var bWords = bText.split(/\s+/);
                if (bWords.length < 2) continue;
                bulletTotal++;

                var firstWord = bWords[0].toLowerCase().replace(/[^a-z]/g, '');

                if (AI_BULLET_VERBS.indexOf(firstWord) !== -1) {
                    verbStarterCount++;
                } else {
                    nonVerbStarterCount++;
                }
            }
        }

        // FALLBACK: Line-based verb detection for PDF-extracted text
        // When no bullet markers found, check lines starting with AI action verbs
        if (bulletTotal < 3) {
            var lines = text.split('\n');
            for (var li = 0; li < lines.length; li++) {
                var line = lines[li].trim();
                if (line.length < 15 || line.length > 300) continue;
                // Skip headers, contact info, short titles
                if (line.toUpperCase() === line && line.length < 60) continue;
                if (line.indexOf('@') !== -1 || line.indexOf('http') !== -1) continue;
                if (/^\d{4}/.test(line)) continue;
                var lineWords = line.split(/\s+/);
                if (lineWords.length < 4) continue;
                var lFirst = lineWords[0].toLowerCase().replace(/[^a-z]/g, '');
                if (AI_BULLET_VERBS.indexOf(lFirst) !== -1) {
                    verbStarterCount++;
                    bulletTotal++;
                }
            }
        }

        var verbParallelRate = bulletTotal > 0 ? (verbStarterCount / bulletTotal) : 0;

        // --- Sub-check C: Punctuation naturalness ---
        var commaCount = (text.match(/,/g) || []).length;
        var semicolonCount = (text.match(/;/g) || []).length;
        var wc = wordCount(text);

        var commaRate = wc > 0 ? commaCount / wc : 0;
        var punctuationDeviation = 0;
        if (commaRate > 0) {
            punctuationDeviation = Math.abs(commaRate - 0.055) / 0.055;
        }

        // --- Sub-check D: Em-dash overuse ---
        var emDashCount = (text.match(/—|–\s/g) || []).length;
        var emDashRate = wc > 0 ? emDashCount / wc : 0;
        var emDashScore = emDashRate > 0.008 ? Math.min(30, (emDashRate - 0.008) * 3000) : 0;

        // --- Combine sub-checks ---
        var starterScore = Math.min(100, starterRepetitionRate * 200);

        // Parallel verb scoring — THIS IS THE BIG ONE for CVs
        var verbParallelScore = 0;
        if (bulletTotal >= 6) {
            // Only score when we have enough data to be meaningful
            if (verbParallelRate >= 0.99) {
                verbParallelScore = 95; // 100% = near-certain AI
            } else if (verbParallelRate >= 0.9) {
                verbParallelScore = 80;
            } else if (verbParallelRate >= 0.8) {
                verbParallelScore = 60;
            } else if (verbParallelRate >= 0.7) {
                verbParallelScore = 40;
            } else if (verbParallelRate >= 0.5) {
                verbParallelScore = 20;
            } else {
                verbParallelScore = 5;
            }
        } else if (bulletTotal >= 4 && verbParallelRate >= 0.9) {
            verbParallelScore = 55; // Smaller sample but very high rate
        }

        var punctuationScore = Math.max(0, (1 - punctuationDeviation) * 60);

        // Weighted combination: verb parallelism is the dominant sub-check
        var score = Math.min(100, Math.round(
            starterScore * 0.15 +
            verbParallelScore * 0.55 +  // 55% weight on parallel verbs — strongest CV signal
            punctuationScore * 0.20 +
            emDashScore * 0.10
        ));

        var flags = [];
        if (verbParallelRate >= 0.85 && bulletTotal >= 4) flags.push('Near-perfect bullet point verb parallelism (' + verbStarterCount + '/' + bulletTotal + ' start with action verbs)');
        else if (verbParallelRate >= 0.75 && bulletTotal >= 4) flags.push('High bullet point uniformity — most start with past-tense action verbs');
        if (starterRepetitionRate > 0.4) flags.push('Repetitive sentence opening patterns');
        if (punctuationDeviation < 0.15 && wc > 100) flags.push('Unusually consistent punctuation patterns');
        if (emDashScore > 15) flags.push('Excessive em-dash usage');

        return { score: Math.min(100, Math.max(0, score)), flags: flags };
    }

    // =============================================
    // SIGNAL 7: HEDGING LANGUAGE ABSENCE (HLA)
    // Expanded hedge word list + first-person
    // informal language bonus
    // =============================================
    function analyzeHLA(text) {
        if (!text || text.length < 80) return { score: 0, flags: [] };
        var lower = text.toLowerCase();
        var wc = wordCount(text);
        if (wc < 40) return { score: 0, flags: [] };

        var hedgeCount = 0;
        for (var i = 0; i < HEDGE_WORDS.length; i++) {
            if (lower.indexOf(HEDGE_WORDS[i]) !== -1) {
                hedgeCount++;
            }
        }

        // Bonus: First-person informal markers = very human
        var firstPersonInformal = ['i think', 'i believe', 'i feel', 'i guess', 'i mean', 'i reckon', 'tbh', 'honestly', 'pretty much', 'not gonna lie', 'if i\'m being honest', 'i\'d say'];
        var informalCount = 0;
        for (var fi = 0; fi < firstPersonInformal.length; fi++) {
            if (lower.indexOf(firstPersonInformal[fi]) !== -1) {
                informalCount++;
            }
        }

        var hedgeRate = hedgeCount / (wc / 100);

        var score;
        if (hedgeRate >= 3 || informalCount >= 4) {
            score = Math.max(0, Math.round(10 - hedgeRate * 2 - informalCount));
        } else if (hedgeRate >= 1.5) {
            score = Math.round(10 + ((3 - hedgeRate) / 1.5) * 20);
        } else if (hedgeRate >= 0.5) {
            score = Math.round(30 + ((1.5 - hedgeRate) / 1) * 25);
        } else if (hedgeRate >= 0.2) {
            score = Math.round(55 + ((0.5 - hedgeRate) / 0.3) * 20);
        } else {
            score = Math.min(100, Math.round(75 + (0.2 - hedgeRate) * 125));
        }

        var flags = [];
        if (hedgeCount === 0 && wc > 100) flags.push('Complete absence of hedging language — all statements expressed with certainty');
        else if (hedgeCount <= 1 && wc > 150) flags.push('Minimal hedging — unusually confident tone throughout');

        return { score: Math.min(100, Math.max(0, score)), flags: flags };
    }

    // =============================================
    // SECTION-LEVEL ANALYSIS
    // =============================================
    function analyzeSection(text, sectionName) {
        if (!text || text.length < 30) return { overallScore: 0, signals: {}, flags: [], evidence: [] };

        var vba = analyzeVBA(text);
        var sba = analyzeSBA(text);
        var scs = analyzeSCS(text);
        var sud = analyzeSUD(text);
        var tcd = analyzeTCD(text);
        var rpd = analyzeRPD(text);
        var hla = analyzeHLA(text);

        var weightedScore = (vba.score * SIGNAL_WEIGHTS.vba) +
                            (sba.score * SIGNAL_WEIGHTS.sba) +
                            (scs.score * SIGNAL_WEIGHTS.scs) +
                            (sud.score * SIGNAL_WEIGHTS.sud) +
                            (tcd.score * SIGNAL_WEIGHTS.tcd) +
                            (rpd.score * SIGNAL_WEIGHTS.rpd) +
                            (hla.score * SIGNAL_WEIGHTS.hla);

        var allFlags = [].concat(vba.flags, sba.flags, scs.flags, sud.flags, tcd.flags, rpd.flags, hla.flags);

        return {
            overallScore: Math.round(weightedScore),
            signals: {
                vba: vba.score,
                sba: sba.score,
                scs: scs.score,
                sud: sud.score,
                tcd: tcd.score,
                rpd: rpd.score,
                hla: hla.score
            },
            flags: allFlags,
            evidence: vba.evidence || []
        };
    }

    // =============================================
    // GENERATE INTERVIEW SUGGESTIONS
    // =============================================
    function generateInterviewSuggestions(sectionResults, overallScore) {
        var suggestions = [];
        var signals = sectionResults.signals || {};

        if (signals.vba >= 60) {
            suggestions.push('Ask the candidate to describe a complex project without relying on industry jargon or buzzwords. Authentic professionals can explain their work in plain language.');
        }
        if (signals.scs >= 55) {
            suggestions.push('Probe for specific metrics, timelines, and team sizes from their most recent role. Ask: "What was the measurable outcome of your last major project?"');
        }
        if (signals.sba >= 60) {
            suggestions.push('Ask the candidate to walk through their career journey spontaneously — natural storytellers vary their pace and detail level, while AI-generated narratives tend to sound rehearsed and uniform.');
        }
        if (signals.rpd >= 55) {
            suggestions.push('Ask the candidate to write a brief project summary on the spot during the interview. AI-generated CVs often have perfect bullet structure but the candidate may struggle to replicate this under pressure.');
        }
        if (signals.tcd >= 55) {
            suggestions.push('Inquire about a time when things did not go as planned. Genuine experience includes setbacks and pivots that add natural variety to communication styles.');
        }
        if (signals.hla >= 60) {
            suggestions.push('Ask: "What aspects of this role do you feel less confident about?" Authentic candidates acknowledge growth areas comfortably.');
        }
        if (overallScore >= 65) {
            suggestions.push('Request a live written response during the interview — ask them to draft a brief project summary or email on the spot. This helps assess authentic communication ability beyond the submitted document.');
        }

        if (suggestions.length === 0) {
            suggestions.push('The document shows patterns consistent with human authorship. Focus interview questions on technical competency and cultural fit.');
        }

        return suggestions.slice(0, 4);
    }

    // =============================================
    // MAIN ANALYSIS FUNCTION
    // =============================================
    function analyzeForAI(cvText) {
        if (!cvText || cvText.length < 50) {
            return {
                overallScore: 0,
                band: 'low',
                signals: { vba: 0, sba: 0, scs: 0, sud: 0, tcd: 0, rpd: 0, hla: 0 },
                sectionScores: {},
                triggeredFlags: [],
                evidence: [],
                interviewSuggestions: []
            };
        }

        var sections = extractSections(cvText);

        var results = {};
        var totalWeightedScore = 0;
        var totalWeight = 0;
        var allEvidence = [];
        var allFlags = [];
        var combinedSignals = { vba: 0, sba: 0, scs: 0, sud: 0, tcd: 0, rpd: 0, hla: 0 };
        var signalWeights = 0;

        for (var sectionName in SECTION_WEIGHTS) {
            var sectionText = sections[sectionName];
            if (!sectionText || sectionText.length < 30) continue;

            var weight = SECTION_WEIGHTS[sectionName];
            var analysis = analyzeSection(sectionText, sectionName);

            results[sectionName] = analysis;
            totalWeightedScore += analysis.overallScore * weight;
            totalWeight += weight;

            for (var sig in analysis.signals) {
                combinedSignals[sig] += analysis.signals[sig] * weight;
            }
            signalWeights += weight;

            allEvidence = allEvidence.concat(analysis.evidence || []);
            allFlags = allFlags.concat(analysis.flags || []);
        }

        if (totalWeight === 0) {
            var fullAnalysis = analyzeSection(cvText, 'full');
            results['full'] = fullAnalysis;
            totalWeightedScore = fullAnalysis.overallScore;
            for (var sig2 in fullAnalysis.signals) {
                combinedSignals[sig2] = fullAnalysis.signals[sig2];
            }
            allEvidence = fullAnalysis.evidence || [];
            allFlags = fullAnalysis.flags || [];
        }

        var overallScore = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
        overallScore = Math.min(100, Math.max(0, overallScore));

        for (var sig3 in combinedSignals) {
            combinedSignals[sig3] = signalWeights > 0 ? Math.round(combinedSignals[sig3] / signalWeights) : 0;
        }

        // COMPOUND SIGNAL BONUS: When multiple strong signals agree, boost score
        // This catches CVs where AI patterns are pervasive across all dimensions
        var highSignalCount = 0;
        if (combinedSignals.vba >= 70) highSignalCount++;
        if (combinedSignals.scs >= 55) highSignalCount++;
        if (combinedSignals.rpd >= 35) highSignalCount++; // Lower threshold — RPD is section-averaged
        if (combinedSignals.hla >= 60) highSignalCount++;
        if (combinedSignals.sba >= 55) highSignalCount++;

        if (highSignalCount >= 4 && overallScore >= 55 && overallScore < 90) {
            overallScore = Math.min(100, overallScore + 8);
        } else if (highSignalCount >= 3 && overallScore >= 50 && overallScore < 85) {
            overallScore = Math.min(100, overallScore + 4);
        }

        // Recalculate band after bonus

        var uniqueFlags = [];
        var flagSet = {};
        for (var fi = 0; fi < allFlags.length; fi++) {
            if (!flagSet[allFlags[fi]]) {
                flagSet[allFlags[fi]] = true;
                uniqueFlags.push(allFlags[fi]);
            }
        }

        var band;
        if (overallScore <= 24) band = 'low';
        else if (overallScore <= 49) band = 'moderate';
        else if (overallScore <= 74) band = 'elevated';
        else band = 'high';

        var topEvidence = allEvidence.slice(0, 12);

        return {
            overallScore: overallScore,
            band: band,
            signals: combinedSignals,
            sectionScores: (function() {
                var scores = {};
                for (var sn in SECTION_WEIGHTS) {
                    if (results[sn]) scores[sn] = results[sn].overallScore;
                }
                if (results['full']) scores['full'] = results['full'].overallScore;
                return scores;
            })(),
            triggeredFlags: uniqueFlags,
            evidence: topEvidence,
            interviewSuggestions: generateInterviewSuggestions(
                results[Object.keys(results)[0]] || { signals: {}, flags: [] },
                overallScore
            )
        };
    }

    // Public API
    return {
        analyzeForAI: analyzeForAI,
        _analyzeVBA: analyzeVBA,
        _analyzeSBA: analyzeSBA,
        _analyzeSCS: analyzeSCS,
        _analyzeSUD: analyzeSUD,
        _analyzeTCD: analyzeTCD,
        _analyzeRPD: analyzeRPD,
        _analyzeHLA: analyzeHLA,
        _extractSections: extractSections
    };

})();
