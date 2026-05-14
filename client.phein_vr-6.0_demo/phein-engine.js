/**
 * ============================================
 * PHEIN INTELLIGENCE ENGINE v3.0
 * Advanced CV screening with semantic matching,
 * qualification hierarchy, education inference,
 * experience parsing, proficiency detection,
 * experience range matching, and sound feedback.
 * ============================================
 * MortApps Studios | Nairobi, Kenya
 * ============================================
 */

var PheinEngine = (function() {
    'use strict';

    // =============================================
    // 1. QUALIFICATION HIERARCHY
    // Higher levels satisfy lower level requirements.
    // E.g., if criteria requires "diploma" (level 3),
    // a candidate with a "degree" (level 4) MATCHES.
    // =============================================
    var QUAL_LEVELS = {
        'doctorate': 6, 'phd': 6, 'ph.d': 6,
        'masters': 5, 'mba': 5, 'postgraduate': 5,
        'degree': 4, 'bachelor': 4, 'bachelors': 4,
        'diploma': 3,
        'certificate': 2, 'certification': 2,
        'kcse': 1, 'high school': 1, 'secondary': 1
    };

    // Regex patterns to detect each qualification level in CV text.
    // Ordered highest to lowest; we return the HIGHEST level found.
    var QUAL_PATTERNS = [
        {
            level: 6, name: 'doctorate',
            patterns: [
                /\bph\s*\.\s*d\b/i,
                /\bphd\b/i,
                /\bdoctorate\b/i,
                /\bdoctor\s+of\s/i,
                /\bd\s*\.\s*phil\b/i,
                /\bd\s*\.\s*sc\b/i
            ]
        },
        {
            level: 5, name: 'masters',
            patterns: [
                /\bmaster'?s?\s+(?:of|in|degree)/i,
                /\bmba\b/i,
                /\bm\s*\.\s*sc\b/i,
                /\bm\s*\.\s*a\b/i,
                /\bm\s*\.\s*com\b/i,
                /\bm\s*\.\s*ed\b/i,
                /\bmsc\b/i,
                /\bms\b(?!\s*c)/i,
                /\bpost[\s-]?graduate\s+(?:diploma|certificate)/i,
                /\bpgd\b/i,
                /\bexecutive\s+mba\b/i
            ]
        },
        {
            level: 4, name: 'degree',
            patterns: [
                /\bbachelor'?s?\s+(?:of|in|degree)/i,
                /\bb\s*\.\s*sc\b/i,
                /\bb\s*\.\s*a\b/i,
                /\bb\s*\.\s*com\b/i,
                /\bb\s*\.\s*ed\b/i,
                /\bb\s*\.\s*tech\b/i,
                /\bb\s*\.\s*eng\b/i,
                /\bundergraduate\b/i,
                /\bgraduated?\b/i,
                /\bconferred\b/i,
                /\bbachelor\b/i,
                /\bbsc\b/i,
                /\bba\b/i,
                /\bbs\b/i,
                /\bbcom\b/i,
                /\bbed\b/i,
                /\buniversity\s+(?:of|degree|educated)/i,
                /\buni\s+(?:of|degree)/i,
                /\bcampus\b/i,
                /\bfaculty\s+of\b/i,
                /\bschool\s+of\s+\w+\s+studies\b/i,
                /\bhonours?\b/i,
                /\bbaccalaureate\b/i
            ]
        },
        {
            level: 3, name: 'diploma',
            patterns: [
                /\bdiploma\b/i,
                /\bhigher\s+diploma\b/i,
                /\bnational\s+diploma\b/i,
                /\bhnd\b/i,
                /\bhnc\b/i,
                /\bpolytechnic\b/i,
                /\btechnical\s+(?:college|institute|university)\b/i,
                /\btertiary\s+(?:college|institution|education)/i
            ]
        },
        {
            level: 2, name: 'certificate',
            patterns: [
                /\bcertificate\s+in\b/i,
                /\bcertification\b/i,
                /\bcertified\s+(?:public|professional|management|accountant)/i,
                /\bprofessional\s+certificate\b/i,
                /\bcertificate\s+of\s+(?:completion|competence|proficiency)/i
            ]
        },
        {
            level: 1, name: 'secondary',
            patterns: [
                /\bhigh\s+school\b/i,
                /\bsecondary\s+(?:school|education)\b/i,
                /\bkcse\b/i,
                /\bkcpe\b/i,
                /\ba[\s-]?level\b/i,
                /\bo[\s-]?level\b/i,
                /\bgcse\b/i,
                /\bform\s*[1-6]\b/i
            ]
        }
    ];

    // =============================================
    // 2. COMPREHENSIVE SKILL ALIAS MAPS
    // Each skill maps to phrases that indicate
    // competency in that skill area.
    // NOTE: All aliases are checked with word
    // boundary awareness to prevent false matches.
    // =============================================
    var SKILL_ALIASES = {
        // ---- Accounting & Finance ----
        'accounting': ['accounting', 'accountant', 'accounts assistant', 'accounts clerk', 'financial reporting', 'financial statements', 'bookkeeping', 'general ledger', 'trial balance', 'journal entries', 'balance sheet', 'income statement', 'cash flow statement', 'cost accounting', 'management accounting', 'financial accounting', 'audit preparation', 'financial records', 'books of accounts'],
        'audit': ['audit', 'auditing', 'internal audit', 'external audit', 'statutory audit', 'auditor', 'audit report', 'audit committee', 'compliance audit', 'risk-based audit', 'audit procedures', 'audit planning'],
        'tax': ['tax', 'taxation', 'tax compliance', 'tax returns', 'tax planning', 'vat', 'value added tax', 'income tax', 'corporate tax', 'withholding tax', 'tax advisory', 'tax consultant', 'tax computations', 'tax assessment', 'kra'],
        'finance': ['finance', 'financial', 'financial management', 'financial analysis', 'corporate finance', 'investment analysis', 'treasury', 'fund management', 'asset management', 'financial planning', 'financial modeling', 'financial control'],
        'cpa': ['cpa', 'certified public accountant', 'icpak', 'c.p.a', 'acca qualified', 'acca affiliate', 'association of chartered certified accountants'],
        'bookkeeping': ['bookkeeping', 'bookkeeper', 'books of accounts', 'data entry', 'ledger maintenance', 'double entry', 'accounts payable', 'accounts receivable'],
        'budgeting': ['budgeting', 'budget', 'budget preparation', 'budget management', 'forecast', 'forecasting', 'financial projection', 'budget variance', 'budget monitoring', 'budget control'],
        'payroll': ['payroll', 'salary administration', 'compensation', 'wages', 'payslip', 'paye', 'nhif', 'nssf', 'statutory deductions', 'remuneration'],
        'financial analysis': ['financial analysis', 'ratio analysis', 'trend analysis', 'variance analysis', 'financial modeling', 'valuation', 'due diligence', 'feasibility study'],

        // ---- Banking & Insurance ----
        'banking': ['banking', 'bank', 'lending', 'credit', 'loans', 'deposits', 'branch banking', 'retail banking', 'corporate banking', 'microfinance', 'sacco'],
        'insurance': ['insurance', 'underwriting', 'claims', 'risk assessment', 'insurance policy', 'premium', 'actuarial', 'reinsurance', 'brokerage'],

        // ---- Technology & Programming ----
        'javascript': ['javascript', 'js', 'ecmascript', 'es6', 'vanilla js', 'vanilla javascript', 'es2015', 'es2020'],
        'python': ['python', 'python3', 'python 3', 'django', 'flask', 'pandas', 'numpy', 'scipy', 'jupyter', 'anaconda', 'scikit-learn', 'pytorch', 'tensorflow'],
        'java': ['java', 'j2ee', 'j2se', 'spring boot', 'spring framework', 'hibernate', 'maven', 'gradle', 'jvm'],
        'c++': ['c++', 'cpp', 'c plus plus', 'object oriented'],
        'c#': ['c#', 'c sharp', 'csharp', '.net core', 'asp.net', 'unity'],
        'react': ['react', 'reactjs', 'react.js', 'react js', 'redux', 'react hooks', 'next.js', 'nextjs'],
        'node': ['node', 'nodejs', 'node.js', 'express', 'expressjs', 'express.js', 'npm', 'deno'],
        'sql': ['sql', 'mysql', 'postgresql', 'postgres', 'sql server', 'mssql', 'tsql', 'pl/sql', 'sqlite', 'oracle database', 'mariadb', 'database query', 'sql queries', 'stored procedure', 'relational database', 'database management'],
        'html': ['html', 'html5', 'hypertext markup', 'semantic html', 'web markup'],
        'css': ['css', 'css3', 'stylesheet', 'sass', 'scss', 'less', 'tailwind', 'bootstrap', 'responsive design', 'flexbox', 'grid layout'],
        'docker': ['docker', 'containerization', 'kubernetes', 'k8s', 'docker-compose', 'devops'],
        'aws': ['aws', 'amazon web services', 'ec2', 's3', 'lambda', 'rds', 'cloud computing', 'azure', 'gcp', 'google cloud', 'cloud services'],
        'git': ['git', 'github', 'gitlab', 'bitbucket', 'version control', 'repository'],
        'linux': ['linux', 'ubuntu', 'centos', 'debian', 'fedora', 'red hat', 'shell scripting', 'bash', 'terminal', 'command line', 'unix'],
        'machine learning': ['machine learning', 'ml', 'artificial intelligence', 'ai', 'deep learning', 'neural network', 'nlp', 'natural language processing', 'computer vision', 'data science', 'data scientist'],
        'typescript': ['typescript', 'ts', 'type safety', 'interface', 'generic'],
        'angular': ['angular', 'angularjs', 'angular 2', 'rxjs', 'ngrx'],
        'vue': ['vue', 'vuejs', 'vue.js', 'vuex', 'vuetify'],

        // ---- Data & Analytics ----
        'excel': ['excel', 'microsoft excel', 'ms excel', 'spreadsheet', 'vlookup', 'pivot table', 'pivot tables', 'macros', 'vba', 'xlookup', 'index match', 'data analysis toolpak', 'conditional formatting', 'data validation'],
        'power bi': ['power bi', 'powerbi', 'ssrs', 'ssis', 'ssas', 'dax', 'business intelligence', 'bi tool', 'bi tools'],
        'tableau': ['tableau', 'qlik', 'qlikview', 'data visualization', 'dashboarding', 'dashboard creation'],
        'data analysis': ['data analysis', 'data analytics', 'analytics', 'statistical analysis', 'data mining', 'business analytics', 'insights', 'data interpretation'],
        'spss': ['spss', 'stata', 'sas', 'statistical software', 'r statistical', 'r programming', 'econometrics'],

        // ---- Marketing ----
        'marketing': ['marketing', 'digital marketing', 'brand management', 'campaign management', 'branding', 'market research', 'customer acquisition', 'lead generation', 'marketing strategy', 'guerrilla marketing'],
        'social media': ['social media', 'social media marketing', 'social media management', 'content creation', 'facebook marketing', 'instagram marketing', 'twitter', 'linkedin marketing', 'tiktok', 'social media strategy'],
        'seo': ['seo', 'search engine optimization', 'sem', 'ppc', 'google ads', 'google adwords', 'facebook ads', 'paid advertising', 'organic search', 'keyword research', 'serp', 'backlinks'],
        'content marketing': ['content marketing', 'content strategy', 'content writing', 'copywriting', 'blog', 'blogging', 'email marketing', 'newsletter', 'content calendar'],

        // ---- HR & Recruitment ----
        'hr': ['hr', 'human resources', 'human resource', 'personnel', 'people management', 'hr management', 'hrm', 'talent management', 'people operations'],
        'recruitment': ['recruitment', 'recruiting', 'talent acquisition', 'headhunting', 'sourcing', 'candidate sourcing', 'screening', 'interviewing', 'onboarding', 'shortlisting'],
        'training': ['training', 'capacity building', 'mentorship', 'coaching', 'learning and development', 'l&d', 'facilitation', 'workshop facilitation', 'skills development'],

        // ---- Management & Leadership ----
        'management': ['management', 'manager', 'managing', 'supervision', 'supervisory', 'oversight', 'administration', 'operations management', 'general management'],
        'leadership': ['leadership', 'leader', 'managed team', 'team lead', 'team leader', 'supervised', 'headed', 'directed', 'oversaw', 'coordinated', 'guided', 'mentored', 'empowered', 'delegated', 'motivated', 'inspired'],
        'project management': ['project management', 'project manager', 'pmo', 'pmp', 'prince2', 'agile', 'scrum', 'kanban', 'sprint', 'jira', 'milestone', 'deliverable', 'gantt', 'project planning', 'project execution', 'project lifecycle'],
        'strategic planning': ['strategic planning', 'strategy', 'strategic', 'strategic management', 'business strategy', 'strategic vision', 'business plan', 'competitive analysis', 'swot'],
        'operations': ['operations', 'operational', 'process improvement', 'efficiency', 'workflow', 'standard operating procedure', 'sop', 'continuous improvement'],

        // ---- Supply Chain & Logistics ----
        'supply chain': ['supply chain', 'procurement', 'purchasing', 'sourcing', 'vendor management', 'supplier', 'logistics', 'distribution', 'warehouse', 'warehousing', 'inventory', 'stock management', 'fulfillment', 'shipping', 'import', 'export', 'customs'],
        'quality assurance': ['quality assurance', 'qa', 'quality control', 'qc', 'quality management', 'iso 9001', 'total quality management', 'tqm', 'testing', 'quality standards', 'quality inspection'],

        // ---- Communication & Soft Skills ----
        'communication': ['communication', 'communicated', 'presentation', 'presenting', 'presentation skills', 'negotiation', 'negotiated', 'liaison', 'interpersonal', 'stakeholder', 'report writing', 'correspondence', 'public speaking', 'articulate', 'persuasive'],
        'problem solving': ['problem solving', 'problem-solving', 'analytical', 'analysis', 'critical thinking', 'troubleshooting', 'trouble-shooting', 'resolving', 'resolution', 'root cause'],
        'teamwork': ['teamwork', 'team player', 'collaboration', 'collaborative', 'cross-functional', 'team', 'cooperation', 'synergy', 'multidisciplinary'],
        'customer service': ['customer service', 'client service', 'customer care', 'customer support', 'client relations', 'customer satisfaction', 'client relationship', 'client facing'],

        // ---- Engineering & Technical ----
        'engineering': ['engineering', 'engineer', 'technical', 'mechanical engineering', 'electrical engineering', 'civil engineering', 'software engineering', 'chemical engineering', 'structural engineering'],
        'autocad': ['autocad', 'auto cad', 'cad', 'revit', 'solidworks', 'catia', 'drafting', 'technical drawing', 'blueprint', 'engineering drawing'],
        'electrical': ['electrical', 'electrical installation', 'wiring', 'circuit', 'power systems', 'electrical maintenance', 'electrical engineering', 'electrical technician'],
        'plumbing': ['plumbing', 'pipe fitting', 'water systems', 'drainage', 'sanitary', 'pipe installation'],

        // ---- Legal & Compliance ----
        'legal': ['legal', 'law', 'lawyer', 'advocate', 'attorney', 'barrister', 'solicitor', 'litigation', 'conveyancing', 'legal compliance', 'regulatory', 'legal framework'],
        'compliance': ['compliance', 'regulatory compliance', 'legal compliance', 'aml', 'anti-money laundering', 'kyc', 'know your customer', 'due diligence', 'risk compliance'],

        // ---- Education & Training ----
        'teaching': ['teaching', 'teacher', 'lecturer', 'tutor', 'instructor', 'educator', 'trainer', 'curriculum', 'pedagogy', 'e-learning', 'online learning', 'classroom'],
        'research': ['research', 'researcher', 'data collection', 'survey', 'fieldwork', 'investigation', 'thesis', 'dissertation', 'publication', 'academic research'],

        // ---- Design & Creative ----
        'graphic design': ['graphic design', 'designer', 'photoshop', 'illustrator', 'indesign', 'canva', 'creative suite', 'adobe', 'branding', 'visual design', 'print design'],
        'ui/ux': ['ui', 'ux', 'user interface', 'user experience', 'ui/ux', 'ux design', 'ui design', 'wireframe', 'prototype', 'figma', 'user research', 'usability', 'user-centered'],
        'web design': ['web design', 'web development', 'frontend', 'front-end', 'full stack', 'fullstack', 'responsive', 'wordpress', 'cms'],

        // ---- Sales ----
        'sales': ['sales', 'selling', 'business development', 'revenue', 'targets', 'quota', 'cold calling', 'prospecting', 'account management', 'b2b', 'b2c', 'closing', 'sales cycle', 'pipeline', 'deal closure'],

        // ---- Healthcare ----
        'nursing': ['nursing', 'nurse', 'clinical', 'patient care', 'medical', 'healthcare', 'hospital', 'pharmaceutical', 'patient assessment', 'triage'],

        // ---- Writing ----
        'writing': ['writing', 'written communication', 'writer', 'copywriting', 'content writing', 'report writing', 'technical writing', 'proposal writing', 'editing', 'proofreading', 'ghostwriting'],

        // ---- Safety ----
        'safety': ['safety', 'health and safety', 'hse', 'osha', 'fire safety', 'first aid', 'cpr', 'occupational safety', 'risk assessment', 'hazard', 'safety compliance', 'incident management'],

        // ---- Construction & Real Estate ----
        'construction': ['construction', 'building', 'site management', 'contractor', 'subcontractor', 'quantity surveying', 'site supervisor', 'building works', 'project works'],
        'real estate': ['real estate', 'property', 'property management', 'valuation', 'surveying', 'estate agent', 'letting', 'property development'],

        // ---- Agriculture ----
        'agriculture': ['agriculture', 'agribusiness', 'farming', 'crop', 'livestock', 'agronomy', 'horticulture', 'aquaculture', 'veterinary', 'agricultural extension'],

        // ---- Hospitality ----
        'hospitality': ['hospitality', 'hotel', 'tourism', 'catering', 'event planning', 'event management', 'customer experience', 'front office', 'food and beverage', 'restaurant'],
        'chef': ['chef', 'cooking', 'culinary', 'food preparation', 'kitchen', 'menu planning', 'food service', 'pastry'],
        
        // ---- Transport & Driving ----
        'driving': ['driving', 'driver', 'driving licence', 'driving license', 'defensive driving', 'forklift', 'heavy machinery', 'vehicle', 'transport', 'delivery'],

        // ---- Environment ----
        'environmental': ['environmental', 'sustainability', 'green', 'renewable', 'solar', 'wind', 'waste management', 'recycling', 'environmental impact', 'carbon footprint'],

        // ---- Procurement ----
        'procurement': ['procurement', 'purchasing', 'sourcing', 'vendor', 'supplier', 'tender', 'tendering', 'contract management', 'purchasing management', 'strategic sourcing']
    };

    // =============================================
    // 3. EDUCATION LEVEL DETECTION
    // Scans CV text and returns the HIGHEST
    // qualification level found.
    // =============================================
    function detectEducationLevel(text) {
        var maxLevel = 0;
        var detectedNames = [];
        var signals = [];

        for (var i = 0; i < QUAL_PATTERNS.length; i++) {
            var qual = QUAL_PATTERNS[i];
            for (var j = 0; j < qual.patterns.length; j++) {
                if (qual.patterns[j].test(text)) {
                    if (qual.level > maxLevel) {
                        maxLevel = qual.level;
                        detectedNames = [qual.name];
                        signals = [qual.name + ' detected'];
                    } else if (qual.level === maxLevel && detectedNames.indexOf(qual.name) === -1) {
                        detectedNames.push(qual.name);
                        signals.push(qual.name + ' detected');
                    }
                }
            }
        }

        return {
            level: maxLevel,
            name: detectedNames[0] || 'unknown',
            signals: signals
        };
    }

    // =============================================
    // 4. EXPERIENCE YEARS EXTRACTION
    // Parses multiple date/experience patterns
    // from CV text to estimate total experience.
    // =============================================
    function extractExperienceYears(text) {
        var maxYears = 0;

        // Pattern: "X years of experience/expertise/practice/work"
        var explicitYears = text.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|expertise|practice|work|working|professional)/i);
        if (explicitYears) maxYears = Math.max(maxYears, parseInt(explicitYears[1]));

        // Pattern: "Over/more than/above/at least X years"
        var overYears = text.match(/(?:over|more than|above|at least|minimum|up to|nearly|almost|approximately|around|about)\s*(\d+)\+?\s*(?:years?|yrs?)/i);
        if (overYears) maxYears = Math.max(maxYears, parseInt(overYears[1]));

        // Pattern: Date ranges "YYYY - YYYY" or "YYYY to YYYY" or "YYYY–YYYY"
        var dateRanges = text.match(/(\d{4})\s*[-\u2013\u2014to]+\s*(\d{4})/g);
        if (dateRanges) {
            var earliest = Infinity, latest = 0;
            for (var i = 0; i < dateRanges.length; i++) {
                var parts = dateRanges[i].match(/(\d{4})\s*[-\u2013\u2014to]+\s*(\d{4})/);
                if (parts) {
                    var start = parseInt(parts[1]);
                    var end = parseInt(parts[2]);
                    if (start >= 1990 && start <= new Date().getFullYear() + 1) {
                        earliest = Math.min(earliest, start);
                        latest = Math.max(latest, end);
                    }
                }
            }
            if (earliest < Infinity && latest > 0) {
                var spanYears = latest - earliest;
                if (spanYears > maxYears) maxYears = spanYears;
            }
        }

        // Pattern: "Since YYYY" or "From YYYY"
        var sinceMatch = text.match(/(?:since|from)\s*(\d{4})\s*(?:\s|$|\.|,)/i);
        if (sinceMatch) {
            var sinceYear = parseInt(sinceMatch[1]);
            var currentYear = new Date().getFullYear();
            var sinceYears = currentYear - sinceYear;
            if (sinceYears > maxYears && sinceYear >= 1990) maxYears = sinceYears;
        }

        // Pattern: "Present" or "Current" (ongoing role)
        var presentMatch = text.match(/(\d{4})\s*[-\u2013\u2014to]+\s*(?:present|current|ongoing|till date|to date|now)/i);
        if (presentMatch) {
            var presentStart = parseInt(presentMatch[1]);
            var presentYears = new Date().getFullYear() - presentStart;
            if (presentYears > maxYears && presentStart >= 1990) maxYears = presentYears;
        }

        return Math.max(0, maxYears);
    }

    // =============================================
    // 5. PROFICIENCY DETECTION
    // Scans context around a skill mention to
    // estimate proficiency level.
    // =============================================
    function detectProficiency(text, alias) {
        var lower = text.toLowerCase();
        var idx = lower.indexOf(alias.toLowerCase());
        if (idx === -1) return { level: 'unknown', multiplier: 1.0 };

        // Get surrounding context (80 chars before and after)
        var start = Math.max(0, idx - 80);
        var end = Math.min(lower.length, idx + alias.length + 80);
        var context = lower.substring(start, end);

        // Check proficiency indicators
        if (/\b(expert|advanced|proficient|skilled|strong|excellent|extensive|deep|mastery|specialist|senior)\b/i.test(context)) {
            return { level: 'expert', multiplier: 1.4 };
        }
        if (/\b(intermediate|working knowledge|competent|good|solid|adequate|familiar with)\b/i.test(context)) {
            return { level: 'intermediate', multiplier: 1.1 };
        }
        if (/\b(basic|beginner|introductory|awareness|foundational|elementary|exposure)\b/i.test(context)) {
            return { level: 'basic', multiplier: 0.6 };
        }

        return { level: 'unknown', multiplier: 1.0 };
    }

    // =============================================
    // 6. SEMANTIC SKILL MATCHING
    // The core function. For each required skill:
    //   - If it's a qualification → use hierarchy
    //   - If it has aliases → check each alias
    //   - Otherwise → simple string match
    // Returns detailed match results.
    // =============================================
    function matchSkills(text, skills) {
        var lowerText = text.toLowerCase();
        var matched = [];
        var unmatched = [];
        var details = {};

        for (var i = 0; i < skills.length; i++) {
            var skill = skills[i].toLowerCase().trim();
            if (!skill) continue;

            var found = false;
            var method = '';
            var signal = '';

            // CHECK 1: Qualification hierarchy
            var qualLevel = QUAL_LEVELS[skill];
            if (qualLevel !== undefined) {
                var edu = detectEducationLevel(lowerText);
                if (edu.level >= qualLevel) {
                    found = true;
                    method = 'qualification-hierarchy';
                    signal = edu.level > qualLevel
                        ? edu.name + ' (level ' + edu.level + ') exceeds ' + skill + ' (level ' + qualLevel + ')'
                        : skill + ' directly detected';
                }
            }

            // CHECK 2: Skill aliases
            if (!found && SKILL_ALIASES[skill]) {
                var aliases = SKILL_ALIASES[skill];
                for (var j = 0; j < aliases.length; j++) {
                    if (lowerText.indexOf(aliases[j]) !== -1) {
                        found = true;
                        method = 'semantic-alias';
                        signal = 'Matched via: "' + aliases[j] + '"';
                        break;
                    }
                }
            }

            // CHECK 3: Fallback — simple string match
            if (!found) {
                if (lowerText.indexOf(skill) !== -1) {
                    found = true;
                    method = 'direct-match';
                    signal = 'Direct string match';
                }
            }

            if (found) {
                matched.push(skill);
                details[skill] = { found: true, method: method, signal: signal };
            } else {
                unmatched.push(skill);
                details[skill] = { found: false, method: 'none', signal: 'Not found' };
            }
        }

        return { matched: matched, unmatched: unmatched, details: details };
    }

    // =============================================
    // 7. WORD-BOUNDARY SAFE MATCH HELPER
    // Prevents false positives like 'aws' matching
    // inside 'laws' or 's3' matching inside '3some'.
    // =============================================
    function wordBoundaryMatch(text, term) {
        var escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        var regex = new RegExp('(?:^|[\\s,;.:\\-\\(\\]")' + escaped + '(?:$|[\\s,;.:\\-\\)\\"!])', 'i');
        if (regex.test(text)) return true;
        // Also check if it's at the end of the string
        var endRegex = new RegExp('(?:^|[\\s,;.:\\-\\(\\]")' + escaped + '$', 'i');
        if (endRegex.test(text)) return true;
        // Also check if the full text equals the term
        if (text.toLowerCase() === term.toLowerCase()) return true;
        return false;
    }

    // =============================================
    // 8. JD SKILL EXTRACTION (v4 — HIGH PRECISION)
    // Extracts ONLY specific technical/hard skills
    // from a job description. Uses a curated pattern
    // set instead of the full SKILL_ALIASES to
    // avoid false positives from company descriptions,
    // soft skills, and environmental context.
    //
    // Soft skills, generic categories, and overly
    // broad terms are EXCLUDED from extraction.
    // Users can still manually add any skill as a
    // screening criterion.
    // =============================================

    // Curated high-precision patterns for JD extraction.
    // Only specific technology names and domain-specific
    // tools are included. Soft skills, methodologies,
    // and generic terms are excluded.
    var JD_EXTRACTION_PATTERNS = {
        // ---- Programming Languages ----
        'javascript': ['javascript', 'ecmascript', 'es6', 'vanilla javascript'],
        'python': ['python', 'python3', 'python 3', 'django', 'flask', 'pandas', 'numpy', 'scipy', 'jupyter', 'anaconda', 'scikit-learn', 'pytorch', 'tensorflow'],
        'java': ['java ', 'j2ee', 'j2se', 'spring boot', 'spring framework', 'hibernate', 'maven', 'gradle', 'jvm'],
        'c++': ['c++', 'cpp', 'c plus plus'],
        'c#': ['c#', 'c sharp', 'csharp', '.net core', 'asp.net', 'unity'],
        'typescript': ['typescript'],
        'sql': ['sql', 'mysql', 'postgresql', 'postgres', 'sql server', 'mssql', 'tsql', 'pl/sql', 'sqlite', 'oracle database', 'mariadb', 'stored procedure'],
        'html': ['html', 'html5', 'semantic html'],
        'css': ['css', 'css3', 'sass', 'scss', 'less', 'tailwind', 'bootstrap', 'flexbox'],
        'r': ['r programming', 'r statistical', 'rstudio'],
        'swift': ['swift', 'swiftui', 'xcode'],
        'kotlin': ['kotlin'],
        'go': ['golang', 'go language', 'go programming'],
        'rust': ['rust', 'rustlang'],
        'ruby': ['ruby', 'ruby on rails', 'rails'],

        // ---- Frameworks & Libraries ----
        'react': ['react', 'reactjs', 'react.js', 'react js', 'redux', 'next.js', 'nextjs'],
        'node': ['nodejs', 'node.js', 'express', 'expressjs', 'express.js', 'deno'],
        'angular': ['angular', 'angularjs', 'angular 2', 'rxjs'],
        'vue': ['vuejs', 'vue.js', 'vuex', 'vuetify'],
        '.net': ['asp.net', '.net core', '.net framework'],
        'django': ['django', 'django rest'],
        'flask': ['flask'],
        'laravel': ['laravel'],
        'spring': ['spring boot', 'spring framework', 'spring security'],

        // ---- Cloud & DevOps ----
        'docker': ['docker', 'kubernetes', 'k8s', 'docker-compose'],
        'aws': ['aws', 'amazon web services', 'cloudformation', 'cloudfront'],
        'azure': ['azure', 'microsoft azure'],
        'gcp': ['google cloud platform', 'gcp'],
        'linux': ['linux', 'ubuntu', 'centos', 'debian', 'fedora', 'red hat', 'shell scripting', 'bash scripting'],
        'git': ['git', 'github', 'gitlab', 'bitbucket', 'version control'],
        'ci/cd': ['ci/cd', 'continuous integration', 'continuous deployment', 'jenkins', 'github actions', 'gitlab ci', 'circleci', 'travis ci'],
        'terraform': ['terraform', 'ansible', 'puppet', 'chef'],
        'nginx': ['nginx', 'apache', 'iis'],

        // ---- Databases ----
        'mongodb': ['mongodb', 'mongo db'],
        'redis': ['redis'],
        'elasticsearch': ['elasticsearch'],
        'dynamodb': ['dynamodb'],

        // ---- Data Science & ML ----
        'machine learning': ['machine learning', 'deep learning', 'neural network', 'nlp', 'natural language processing', 'computer vision', 'pytorch', 'tensorflow', 'keras'],
        'data science': ['data science', 'data scientist', 'data mining', 'big data', 'hadoop', 'spark'],
        'power bi': ['power bi', 'powerbi', 'ssrs', 'ssis', 'ssas', 'dax'],
        'tableau': ['tableau', 'qlik', 'qlikview'],
        'excel': ['microsoft excel', 'ms excel', 'vlookup', 'pivot table', 'macros', 'vba', 'xlookup', 'index match', 'data analysis toolpak'],
        'spss': ['spss', 'stata', 'sas'],

        // ---- Testing ----
        'testing': ['jest', 'pytest', 'selenium', 'cypress', 'mocha', 'junit', 'unit testing', 'integration testing', 'tdd', 'bdd', 'test-driven development'],

        // ---- Architecture & Design Patterns ----
        'microservices': ['microservices', 'microservice'],
        'restful api': ['restful api', 'rest api', 'restful apis', 'rest apis', 'graphql'],
        'agile': ['agile', 'scrum', 'kanban', 'sprint planning', 'scrum master'],
        'serverless': ['serverless', 'serverless architecture', 'lambda functions'],

        // ---- Security ----
        'cybersecurity': ['cybersecurity', 'penetration testing', 'owasp', 'ethical hacking', 'information security'],
        'encryption': ['encryption', 'ssl', 'tls', 'oauth', 'jwt', 'saml'],

        // ---- UI/UX & Design ----
        'ui/ux': ['ui/ux', 'user interface', 'user experience', 'ux design', 'ui design', 'wireframe', 'figma', 'adobe xd', 'invision', 'user research', 'usability'],
        'graphic design': ['photoshop', 'illustrator', 'indesign', 'canva', 'adobe photoshop', 'adobe illustrator', 'creative suite'],
        'web design': ['wordpress', 'webflow', 'squarespace', 'wix', 'shopify'],
        '3d modeling': ['autocad', 'auto cad', 'revit', 'solidworks', 'catia', '3ds max', 'blender', 'maya'],

        // ---- Finance & Accounting ----
        'accounting': ['accounting', 'accountant', 'financial reporting', 'bookkeeping', 'general ledger', 'trial balance', 'journal entries', 'management accounting', 'financial statements'],
        'audit': ['audit', 'auditing', 'internal audit', 'external audit', 'auditor', 'statutory audit', 'risk-based audit'],
        'tax': ['tax', 'taxation', 'tax compliance', 'tax returns', 'tax planning', 'vat', 'income tax', 'corporate tax'],
        'finance': ['financial analysis', 'financial modeling', 'financial management', 'treasury', 'fund management', 'investment analysis', 'corporate finance', 'financial planning'],
        'cpa': ['cpa', 'certified public accountant', 'icpak', 'acca', 'cima'],
        'bookkeeping': ['bookkeeping', 'bookkeeper', 'double entry', 'accounts payable', 'accounts receivable'],
        'budgeting': ['budgeting', 'budget preparation', 'budget management', 'forecasting', 'financial projection'],
        'payroll': ['payroll', 'salary administration', 'paye', 'statutory deductions'],

        // ---- Banking & Insurance ----
        'banking': ['banking', 'lending', 'credit analysis', 'branch banking', 'retail banking', 'corporate banking', 'microfinance'],
        'insurance': ['insurance', 'underwriting', 'claims', 'risk assessment', 'insurance policy', 'actuarial'],

        // ---- Marketing ----
        'marketing': ['digital marketing', 'brand management', 'campaign management', 'market research', 'lead generation', 'guerrilla marketing'],
        'social media': ['social media marketing', 'social media management', 'facebook marketing', 'instagram marketing', 'tiktok'],
        'seo': ['seo', 'search engine optimization', 'sem', 'ppc', 'google ads', 'google adwords', 'keyword research', 'backlinks'],
        'content marketing': ['content marketing', 'content strategy', 'copywriting', 'email marketing'],

        // ---- HR & Recruitment ----
        'hr': ['human resources', 'human resource', 'talent management', 'talent acquisition', 'headhunting', 'hr management'],
        'recruitment': ['recruitment', 'recruiting', 'candidate sourcing', 'onboarding', 'shortlisting'],

        // ---- Management ----
        'project management': ['pmp', 'prince2', 'pmo', 'project planning', 'project execution', 'project lifecycle', 'gantt'],
        'supply chain': ['supply chain', 'procurement', 'logistics', 'warehousing', 'inventory', 'vendor management'],
        'quality assurance': ['quality assurance', 'quality control', 'quality management', 'iso 9001', 'total quality management'],

        // ---- Legal & Compliance ----
        'legal': ['lawyer', 'advocate', 'attorney', 'litigation', 'conveyancing', 'legal framework', 'regulatory'],
        'compliance': ['compliance', 'regulatory compliance', 'aml', 'anti-money laundering', 'kyc', 'know your customer', 'due diligence'],

        // ---- Engineering ----
        'electrical': ['electrical installation', 'wiring', 'circuit', 'power systems', 'electrical maintenance'],
        'plumbing': ['plumbing', 'pipe fitting', 'water systems', 'drainage'],
        'mechanical': ['mechanical engineering', 'cnc', 'welding', 'fabrication'],

        // ---- Healthcare ----
        'nursing': ['nursing', 'patient care', 'clinical', 'pharmaceutical', 'triage', 'patient assessment'],

        // ---- Education ----
        'teaching': ['teaching', 'teacher', 'lecturer', 'curriculum', 'pedagogy', 'e-learning'],

        // ---- Writing ----
        'writing': ['technical writing', 'proposal writing', 'report writing', 'ghostwriting', 'proofreading'],

        // ---- Safety ----
        'safety': ['health and safety', 'hse', 'osha', 'occupational safety', 'fire safety', 'first aid', 'risk assessment'],

        // ---- Construction & Real Estate ----
        'construction': ['construction', 'site management', 'contractor', 'quantity surveying', 'building works'],
        'real estate': ['real estate', 'property management', 'property valuation', 'estate agent'],

        // ---- Hospitality ----
        'hospitality': ['hotel management', 'tourism', 'catering', 'event planning', 'event management', 'food and beverage'],
        'chef': ['chef', 'culinary', 'food preparation', 'menu planning'],

        // ---- Transport ----
        'driving': ['driving licence', 'driving license', 'forklift', 'heavy machinery'],

        // ---- Agriculture ----
        'agriculture': ['agriculture', 'agribusiness', 'farming', 'agronomy', 'horticulture', 'aquaculture', 'veterinary'],

        // ---- Environment ----
        'environmental': ['sustainability', 'renewable energy', 'waste management', 'recycling', 'environmental impact'],

        // ---- Sales ----
        'sales': ['business development', 'b2b', 'b2c', 'cold calling', 'prospecting', 'account management', 'sales cycle']
    };

    function extractSkillsFromJD(text) {
        var lower = text.toLowerCase();
        var found = [];
        var seen = {};

        // Use ONLY the curated JD_EXTRACTION_PATTERNS
        // (not the full SKILL_ALIASES which includes
        //  soft skills and overly generic terms)
        for (var skill in JD_EXTRACTION_PATTERNS) {
            if (seen[skill]) continue;
            var aliases = JD_EXTRACTION_PATTERNS[skill];
            for (var j = 0; j < aliases.length; j++) {
                // Require aliases to be at least 5 characters
                // to avoid short/generic false positives
                if (aliases[j].length < 5) continue;
                if (wordBoundaryMatch(lower, aliases[j])) {
                    seen[skill] = true;
                    found.push(skill);
                    break;
                }
            }
        }

        // Also detect qualification requirements
        for (var i = 0; i < QUAL_PATTERNS.length; i++) {
            var qual = QUAL_PATTERNS[i];
            if (seen[qual.name]) continue;
            for (var k = 0; k < qual.patterns.length; k++) {
                if (qual.patterns[k].test(lower)) {
                    seen[qual.name] = true;
                    found.push(qual.name);
                    break;
                }
            }
        }

        // Extract experience requirements (e.g., "5 years of experience")
        var expPatterns = [
            /(?:minimum\s+)?(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|expertise|practice|work|working|professional)/i,
            /(?:at\s+least\s+)?(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|expertise|practice|work)/i
        ];
        for (var e = 0; e < expPatterns.length; e++) {
            var expMatch = expPatterns[e].exec(text);
            if (expMatch) {
                var years = parseInt(expMatch[1]);
                if (!seen['experience']) {
                    seen['experience'] = true;
                    found.push(years + '+ years experience');
                }
                break;
            }
        }

        return found;
    }

    // =============================================
    // 9. EXPERIENCE REQUIREMENT MATCHING
    // Parses experience requirements from skill strings
    // like "5+ years experience" and compares with
    // candidate's actual years. Uses >= logic so that
    // 10 years satisfies a 5-year requirement.
    // =============================================
    function matchExperienceRequirement(skill, candidateYears) {
        // Parse the skill for experience patterns like "5+ years experience", "10 years", "3+ yrs experience"
        var expMatch = skill.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:experience|exp|of experience)?/i);
        if (expMatch) {
            var requiredYears = parseInt(expMatch[1]);
            return candidateYears >= requiredYears;
        }
        return null; // Not an experience requirement
    }

    // =============================================
    // 10. FULL CANDIDATE ANALYSIS
    // Comprehensive analysis combining all engines.
    // Now includes experience range matching.
    // =============================================
    function analyzeCandidate(content, mustHave, niceToHave) {
        var lower = content.toLowerCase();

        // Run semantic skill matching
        var mustResult = matchSkills(lower, mustHave);
        var niceResult = matchSkills(lower, niceToHave);

        // Detect education level
        var education = detectEducationLevel(lower);

        // Extract experience
        var experienceYears = extractExperienceYears(lower);

        // EXPERIENCE RANGE MATCHING: If any unmatched skill is an experience
        // requirement, check if the candidate's years meet or exceed it.
        for (var u = mustResult.unmatched.length - 1; u >= 0; u--) {
            var expCheck = matchExperienceRequirement(mustResult.unmatched[u], experienceYears);
            if (expCheck === true) {
                mustResult.matched.push(mustResult.unmatched[u]);
                mustResult.details[mustResult.unmatched[u]] = {
                    found: true,
                    method: 'experience-range',
                    signal: 'Candidate has ' + experienceYears + ' years (meets requirement)'
                };
                mustResult.unmatched.splice(u, 1);
            }
        }
        for (var n = niceResult.unmatched.length - 1; n >= 0; n--) {
            var expCheckNice = matchExperienceRequirement(niceResult.unmatched[n], experienceYears);
            if (expCheckNice === true) {
                niceResult.matched.push(niceResult.unmatched[n]);
                niceResult.details[niceResult.unmatched[n]] = {
                    found: true,
                    method: 'experience-range',
                    signal: 'Candidate has ' + experienceYears + ' years (meets requirement)'
                };
                niceResult.unmatched.splice(n, 1);
            }
        }

        return {
            matchedMust: mustResult.matched,
            matchedNice: niceResult.matched,
            gaps: mustResult.unmatched,
            mustDetails: mustResult.details,
            niceDetails: niceResult.details,
            educationLevel: education,
            experienceYears: experienceYears,
            mustMatched: mustResult.matched.length,
            niceMatched: niceResult.matched.length
        };
    }

    // =============================================
    // 11. SOUND FEEDBACK ENGINE
    // Generates pleasant UI sounds using the
    // Web Audio API — no external files needed.
    // =============================================
    var audioCtx = null;
    var audioWarm = false;
    function getAudioContext() {
        if (!audioCtx) {
            try {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                audioCtx._retryQueue = [];
            } catch(e) {
                return null;
            }
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume().catch(function(){});
        }
        return audioCtx;
    }

    // Retry mechanism for sounds that fail due to suspended context
    function playWithRetry(fn) {
        var ctx = getAudioContext();
        if (!ctx) return;
        if (ctx.state === 'running') {
            try { fn(ctx); } catch(e) {}
            audioWarm = true;
        } else {
            // Context is suspended, try to resume and replay
            ctx.resume().then(function() {
                try { fn(ctx); } catch(e) {}
                audioWarm = true;
            }).catch(function() {
                // If resume fails, try once more after a short delay
                setTimeout(function() {
                    var ctx2 = getAudioContext();
                    if (ctx2 && ctx2.state === 'running') {
                        try { fn(ctx2); audioWarm = true; } catch(e) {}
                    }
                }, 200);
            });
        }
    }

    function playTone(frequency, duration, type, volume) {
        var ctx = getAudioContext();
        if (!ctx) return;
        try {
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = frequency;
            osc.type = type || 'sine';
            gain.gain.setValueAtTime(volume || 0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
        } catch(e) {}
    }

    // A pleasant "ting" sound — bright, short, clean
    function playTing() {
        playWithRetry(function(ctx) {
            // Primary tone
            var osc1 = ctx.createOscillator();
            var gain1 = ctx.createGain();
            osc1.connect(gain1); gain1.connect(ctx.destination);
            osc1.frequency.value = 1200;
            osc1.type = 'sine';
            gain1.gain.setValueAtTime(0.25, ctx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
            osc1.start(ctx.currentTime); osc1.stop(ctx.currentTime + 0.15);

            // Harmonic overtone for richness
            var osc2 = ctx.createOscillator();
            var gain2 = ctx.createGain();
            osc2.connect(gain2); gain2.connect(ctx.destination);
            osc2.frequency.value = 2400;
            osc2.type = 'sine';
            gain2.gain.setValueAtTime(0.08, ctx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            osc2.start(ctx.currentTime); osc2.stop(ctx.currentTime + 0.1);
        });
    }

    // A success "ding" — two ascending notes
    function playSuccess() {
        playWithRetry(function(ctx) {
            var osc1 = ctx.createOscillator();
            var gain1 = ctx.createGain();
            osc1.connect(gain1); gain1.connect(ctx.destination);
            osc1.frequency.value = 880;
            osc1.type = 'sine';
            gain1.gain.setValueAtTime(0.2, ctx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            osc1.start(ctx.currentTime); osc1.stop(ctx.currentTime + 0.2);

            var osc2 = ctx.createOscillator();
            var gain2 = ctx.createGain();
            osc2.connect(gain2); gain2.connect(ctx.destination);
            osc2.frequency.value = 1320;
            osc2.type = 'sine';
            gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.15);
            gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            osc2.start(ctx.currentTime + 0.15); osc2.stop(ctx.currentTime + 0.4);

            // High sparkle
            var osc3 = ctx.createOscillator();
            var gain3 = ctx.createGain();
            osc3.connect(gain3); gain3.connect(ctx.destination);
            osc3.frequency.value = 2640;
            osc3.type = 'sine';
            gain3.gain.setValueAtTime(0.06, ctx.currentTime + 0.15);
            gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
            osc3.start(ctx.currentTime + 0.15); osc3.stop(ctx.currentTime + 0.35);
        });
    }

    // =============================================
    // PUBLIC API
    // =============================================
    return {
        matchSkills: matchSkills,
        detectEducationLevel: detectEducationLevel,
        extractExperienceYears: extractExperienceYears,
        detectProficiency: detectProficiency,
        analyzeCandidate: analyzeCandidate,
        extractSkillsFromJD: extractSkillsFromJD,
        matchExperienceRequirement: matchExperienceRequirement,
        playTing: playTing,
        playSuccess: playSuccess,
        _warmUp: function() { getAudioContext(); },
        QUAL_LEVELS: QUAL_LEVELS,
        SKILL_ALIASES: SKILL_ALIASES
    };

})();
