/**
 * PHEIN SCREENER v8.0 — Features Module
 * All new feature logic lives here. phein-engine.js stays 100% untouched.
 * This file hooks into existing global state/functions defined in index.html.
 */
(function() {
    'use strict';

    // =============================================
    // STATE EXTENSIONS
    // =============================================
    const state = window.state || {};
    state.screeningOptions = { ai_detection: false, visa: false, salary: false, linkedin: true, location: false, age: false };
    state.candidateStatuses = {};
    state.candidateNotes = {};
    state.comparisonSelected = new Set();

    // =============================================
    // UTILITY HELPERS
    // =============================================
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function getCandidateKey(c) {
        return c.candidateKey || c.name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15);
    }

    // =============================================
    // FEATURE 1: EXPORT DROPDOWN (CSV + PDF)
    // =============================================
    window.toggleExportDropdown = function() {
        const dd = document.getElementById('export-dropdown');
        if (!dd) return;
        const isVisible = dd.style.display === 'block';
        dd.style.display = isVisible ? 'none' : 'block';
    };

    // Close dropdown on outside click
    document.addEventListener('click', function(e) {
        const dd = document.getElementById('export-dropdown');
        const btn = document.getElementById('export-btn');
        if (dd && !dd.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
            dd.style.display = 'none';
        }
    });

    window.exportToCSV = function() {
        if (!state.lastResults || !state.lastResults.length) {
            showToast('No results to export.');
            return;
        }
        const headers = ['Rank', 'Name', 'Score(%)', 'Email', 'Phone', 'Matched Skills', 'Gaps', 'Status', 'Notes', 'Visa Info', 'Salary Info'];
        const rows = state.lastResults.slice(0, state.limit).map((c, i) => {
            const key = getCandidateKey(c);
            const status = state.candidateStatuses[key] || 'None';
            const notes = state.candidateNotes[key] || '';
            let visaInfo = '';
            let salaryInfo = '';
            if (state.screeningOptions.visa && c.content) {
                const visa = extractVisaInfo(c.content);
                if (visa.found) visaInfo = visa.tags.join('; ');
            }
            if (state.screeningOptions.salary && c.content) {
                const salary = extractSalaryInfo(c.content);
                if (salary.found) salaryInfo = salary.mentions.join('; ');
            }
            return [
                i + 1,
                csvEscape(c.name),
                c.score,
                csvEscape(c.email || ''),
                csvEscape(c.phone || ''),
                csvEscape(c.matched.join('; ')),
                csvEscape(c.gaps.join('; ')),
                status,
                csvEscape(notes),
                csvEscape(visaInfo),
                csvEscape(salaryInfo)
            ].join(',');
        });

        function csvEscape(val) {
            if (!val) return '';
            val = String(val);
            if (val.includes(',') || val.includes('"') || val.includes('\n')) {
                return '"' + val.replace(/"/g, '""') + '"';
            }
            return val;
        }

        const csvContent = headers.join(',') + '\n' + rows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'phein_screening_' + new Date().toISOString().split('T')[0] + '.csv';
        a.click();
        URL.revokeObjectURL(url);
        document.getElementById('export-dropdown').style.display = 'none';
        showToast('CSV exported successfully!', true);
    };

    // =============================================
    // TOGGLE SOUND ENGINE (Unique sounds per toggle)
    // =============================================
    var _toggleAudioCtx = null;
    function _getToggleAudioCtx() {
        if (!_toggleAudioCtx) { try { _toggleAudioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {} }
        return _toggleAudioCtx;
    }
    function playToggleSound(toggleId, turningOn) {
        var ctx = _getToggleAudioCtx();
        if (!ctx) return;
        var now = ctx.currentTime;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        // Each toggle gets a unique frequency + waveform combo
        var soundMap = {
            'ai_detection': { onFreq: 380, onEnd: 520, offFreq: 340, offEnd: 280, wave: 'triangle' },
            'visa':     { onFreq: 660, onEnd: 880, offFreq: 440, offEnd: 330, wave: 'sine' },
            'salary':   { onFreq: 550, onEnd: 750, offFreq: 400, offEnd: 280, wave: 'triangle' },
            'linkedin': { onFreq: 500, onEnd: 700, offFreq: 380, offEnd: 260, wave: 'sine' },
            'location': { onFreq: 720, onEnd: 960, offFreq: 480, offEnd: 350, wave: 'triangle' },
            'age':      { onFreq: 840, onEnd: 1100, offFreq: 520, offEnd: 380, wave: 'sine' }
        };
        var s = soundMap[toggleId] || soundMap['visa'];
        var freq = turningOn ? s.onFreq : s.offFreq;
        var end  = turningOn ? s.onEnd  : s.offEnd;
        osc.type = s.wave;
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.linearRampToValueAtTime(end, now + 0.12);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
        osc.start(now); osc.stop(now + 0.17);
    }

    // =============================================
    // FEATURE 2: SCREENING OPTIONS (VISA + SALARY)
    // =============================================
    window.toggleScreeningOption = function(option) {
        var turningOn = !state.screeningOptions[option];
        state.screeningOptions[option] = turningOn;
        playToggleSound(option, turningOn);
        updateScreeningToggles();
        // Re-render if we have results
        if (state.lastResults && state.lastResults.length) {
            window.renderResults(state.lastResults.slice(0, state.limit));
        }
    };

    function updateScreeningToggles() {
        const aiToggle = document.getElementById('ai-detection-toggle');
        const visaToggle = document.getElementById('visa-toggle');
        const salaryToggle = document.getElementById('salary-toggle');
        const linkedinToggle = document.getElementById('linkedin-toggle');
        const locationToggle = document.getElementById('location-toggle');
        const ageToggle = document.getElementById('age-toggle');
        if (aiToggle) aiToggle.checked = state.screeningOptions.ai_detection;
        if (visaToggle) visaToggle.checked = state.screeningOptions.visa;
        if (salaryToggle) salaryToggle.checked = state.screeningOptions.salary;
        if (linkedinToggle) linkedinToggle.checked = state.screeningOptions.linkedin;
        if (locationToggle) locationToggle.checked = state.screeningOptions.location;
        if (ageToggle) ageToggle.checked = state.screeningOptions.age;
    }

    function extractVisaInfo(text) {
        if (!text) return { found: false, tags: [], type: 'unknown' };
        const lower = text.toLowerCase();
        const tags = [];
        const patterns = {
            'H-1B': /\bh-?1b\b/i,
            'H1B': /\bh1b\b/i,
            'Green Card': /\bgreen\s*card\b/i,
            'Tier 2': /\btier\s*2\b/i,
            'Tier 4': /\btier\s*4\b/i,
            'Work Permit': /\bwork\s*permit\b/i,
            'Right to Work': /\bright\s*to\s*work\b/i,
            'Sponsorship': /\bsponsor(ship)?\b/i,
            'Citizenship': /\bcitizenship\b/i,
            'ILR': /\bilr\b/i,
            'Indefinite Leave': /\bindefinite\s*leave\b/i,
            'EAD': /\bead\b/i,
            'OPT': /\bopt\b/i,
            'CPT': /\bcpt\b/i,
            'TN Visa': /\btn\s*visa\b/i,
            'L1 Visa': /\bl1\s*visa\b/i,
            'Skilled Worker Visa': /\bskilled\s*worker\s*visa\b/i,
            'Permanent Resident': /\bpermanent\s*resident\b/i,
            'European Settlement': /\beuropean\s*settlement/i,
            'Naturalized': /\bnaturali(sed|zed)\b/i
        };

        for (const [tag, regex] of Object.entries(patterns)) {
            if (regex.test(lower)) tags.push(tag);
        }

        if (tags.length === 0) return { found: false, tags: [], type: 'unknown' };

        const authorizedKw = ['citizenship', 'right to work', 'ilr', 'indefinite leave', 'green card', 'permanent resident', 'european settlement', 'naturalized'];
        const visaKw = ['h-1b', 'h1b', 'tier 2', 'tier 4', 'work permit', 'sponsorship', 'ead', 'opt', 'cpt', 'tn visa', 'l1 visa', 'skilled worker visa'];

        const lowerTags = tags.map(t => t.toLowerCase());
        let type = 'unknown';
        if (authorizedKw.some(k => lowerTags.some(t => t.includes(k)))) type = 'authorized';
        if (visaKw.some(k => lowerTags.some(t => t.includes(k)))) type = 'visa_required';
        if (authorizedKw.some(k => lowerTags.some(t => t.includes(k))) && visaKw.some(k => lowerTags.some(t => t.includes(k)))) {
            type = lower.indexOf('right to work') !== -1 || lower.indexOf('citizenship') !== -1 ? 'authorized' : 'visa_required';
        }

        return { found: true, tags: tags, type: type };
    }

    function extractSalaryInfo(text) {
        if (!text) return { found: false, mentions: [] };
        const lower = text.toLowerCase();
        const mentions = [];

        // Pattern: currency + number near salary keywords
        const salaryPatterns = [
            /(?:expected|current|desired|asking|base|starting|annual|salary|compensation|pay|package|remuneration|wage|income)\s*[:\-]?\s*[$\u00a3\u20acKShKES]\s*[\d,]+(?:\.\d{1,2})?(?:\s*[-\u2013to]+\s*[$\u00a3\u20acKShKES]?\s*[\d,]+(?:\.\d{1,2})?)?(?:\s*[kKmMbB]?)/gi,
            /[$\u00a3\u20acKShKES]\s*[\d,]+(?:\.\d{1,2})?(?:\s*[kKmMbB])?(?:\s*[-\u2013to]+\s*[$\u00a3\u20acKShKES]?\s*[\d,]+(?:\.\d{1,2})?)?(?:\s*[kKmMbB])?(?:\s*per\s*(?:annum|year|month|hr|hour))/gi,
            /[\d,]+(?:\.\d{1,2})?\s*[kK]\s*(?:usd|gbp|eur|kes|sh)/gi,
            /(?:salary|compensation|pay|income)\s*(?:is|:|of|range)\s*[:\-]?\s*[$\u00a3\u20acKShKES]?[\d,]+(?:\.\d{1,2})?(?:\s*[-\u2013to]+\s*[$\u00a3\u20acKShKES]?[\d,]+(?:\.\d{1,2})?)?(?:\s*[kKmMbB])?/gi,
            /(?:negotiable|open to negotiate)/i
        ];

        for (const pattern of salaryPatterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const mention = match[0].trim();
                if (mention.length > 3 && !mentions.some(m => m.toLowerCase() === mention.toLowerCase())) {
                    mentions.push(mention);
                }
            }
        }

        // Cap mentions to avoid clutter
        if (mentions.length > 3) mentions.length = 3;
        return { found: mentions.length > 0, mentions: mentions };
    }

    // =============================================
    // LOCATION EXTRACTION
    // =============================================
    function extractLocationInfo(text) {
        if (!text) return null;
        var lower = text.toLowerCase();
        var city = '', country = '';
        var cities = ['nairobi','mombasa','kisumu','nakuru','eldoret','thika','kampala','dar es salaam','dodoma','lagos','abuja','ibadan','port harcourt','cape town','johannesburg','pretoria','durban','addis ababa','kigali','accra','kumasi','london','manchester','birmingham','edinburgh','glasgow','liverpool','leeds','bristol','toronto','vancouver','montreal','calgary','sydney','melbourne','brisbane','perth','adelaide','mumbai','delhi','bangalore','chennai','hyderabad','kolkata','pune','berlin','munich','frankfurt','hamburg','paris','lyon','marseille','toulouse','dubai','abu dhabi','riyadh','jeddah','cairo','alexandria','beijing','shanghai','guangzhou','shenzhen','tokyo','osaka','singapore','kuala lumpur','penang','manila','cebu','jakarta','bangkok','hanoi','ho chi minh','sao paulo','rio de janeiro','brasilia','mexico city','guadalajara','monterrey','buenos aires','cordoba','bogota','medellin','santiago','lima','bogota'];
        var countries = ['kenya','uganda','tanzania','nigeria','south africa','ethiopia','rwanda','ghana','united kingdom','uk','england','scotland','wales','canada','australia','india','germany','france','united states','usa','u.s.','uae','emirates','saudi arabia','egypt','china','japan','singapore','malaysia','philippines','indonesia','thailand','vietnam','brazil','mexico','argentina','colombia','chile','peru','ecuador','venezuela','cuba','jamaica','trinidad','morocco','tunisia','algeria','ghana','cameroon','ivory coast','senegal','zimbabwe','zambia','malawi','mozambique','botswana','namibia','madagascar'];
        var locationKeywords = ['address','residence','resident','located','based','lives','living','city','town','county','state','province','region','country','nationality','location','postal','zip'];

        for (var ki = 0; ki < locationKeywords.length; ki++) {
            var kw = locationKeywords[ki];
            var idx = lower.indexOf(kw);
            if (idx !== -1) {
                var snippet = text.substring(idx, idx + 100).toLowerCase();
                for (var ci = 0; ci < cities.length; ci++) {
                    if (snippet.indexOf(cities[ci]) !== -1) { city = cities[ci]; break; }
                }
                for (var coi = 0; coi < countries.length; coi++) {
                    if (snippet.indexOf(countries[coi]) !== -1) { country = countries[coi]; break; }
                }
                if (city || country) break;
            }
        }
        if (!city && !country) {
            for (var fi = 0; fi < cities.length; fi++) {
                if (lower.indexOf(cities[fi]) !== -1) { city = cities[fi]; break; }
            }
            for (var fj = 0; fj < countries.length; fj++) {
                if (lower.indexOf(countries[fj]) !== -1 && countries[fj] !== country) { country = countries[fj]; break; }
            }
        }
        var cityToCountry = { 'nairobi':'Kenya','mombasa':'Kenya','kisumu':'Kenya','nakuru':'Kenya','eldoret':'Kenya','thika':'Kenya','kampala':'Uganda','dar es salaam':'Tanzania','dodoma':'Tanzania','lagos':'Nigeria','abuja':'Nigeria','cape town':'South Africa','johannesburg':'South Africa','pretoria':'South Africa','durban':'South Africa','addis ababa':'Ethiopia','kigali':'Rwanda','accra':'Ghana','kumasi':'Ghana','london':'UK','manchester':'UK','birmingham':'UK','edinburgh':'UK','toronto':'Canada','vancouver':'Canada','montreal':'Canada','sydney':'Australia','melbourne':'Australia','brisbane':'Australia','perth':'Australia','mumbai':'India','delhi':'India','bangalore':'India','chennai':'India','hyderabad':'India','kolkata':'India','pune':'India','berlin':'Germany','munich':'Germany','frankfurt':'Germany','paris':'France','lyon':'France','dubai':'UAE','abu dhabi':'UAE','riyadh':'Saudi Arabia','jeddah':'Saudi Arabia','cairo':'Egypt','alexandria':'Egypt','beijing':'China','shanghai':'China','tokyo':'Japan','osaka':'Japan','singapore':'Singapore','kuala lumpur':'Malaysia','manila':'Philippines','jakarta':'Indonesia','bangkok':'Thailand','hanoi':'Vietnam','sao paulo':'Brazil','rio de janeiro':'Brazil','mexico city':'Mexico','buenos aires':'Argentina','bogota':'Colombia','medellin':'Colombia','santiago':'Chile','lima':'Peru' };
        if (city && !country && cityToCountry[city]) country = cityToCountry[city];
        var parts = [];
        if (city) parts.push(city.charAt(0).toUpperCase() + city.slice(1));
        if (country) parts.push(country.charAt(0).toUpperCase() + country.slice(1));
        return parts.length > 0 ? parts.join(', ') : null;
    }

    // =============================================
    // AGE EXTRACTION
    // =============================================
    function extractAgeInfo(text) {
        if (!text) return null;
        var patterns = [
            /age\s*[:\-]?\s*(\d{2})/i,
            /(\d{2})\s*years?\s*old/i,
            /date\s*of\s*birth\s*[:\-]?\s*([\d\/\-\.]+)/i,
            /dob\s*[:\-]?\s*([\d\/\-\.]+)/i,
            /born\s*(?:on|in)\s*([\w\s\d,]+)/i
        ];
        for (var pi = 0; pi < patterns.length; pi++) {
            var m = text.match(patterns[pi]);
            if (m) {
                if (pi <= 1) {
                    var age = parseInt(m[1]);
                    if (age >= 18 && age <= 80) return age + ' years';
                }
                if (pi === 2 || pi === 3) {
                    var d = new Date(m[1]);
                    if (!isNaN(d.getTime())) {
                        var today = new Date();
                        var a = today.getFullYear() - d.getFullYear();
                        if (today.getMonth() < d.getMonth() || (today.getMonth() === d.getMonth() && today.getDate() < d.getDate())) a--;
                        if (a >= 18 && a <= 80) return a + ' years';
                    }
                }
            }
        }
        return null;
    }

    // =============================================
    // FEATURE 3: CANDIDATE STATUS TAGS
    // =============================================
    const STATUS_CONFIG = {
        'none': { label: 'None', bg: '#f1f5f9', color: '#64748b', darkBg: '#334155', darkColor: '#94a3b8' },
        'shortlisted': { label: 'Shortlisted', bg: '#dcfce7', color: '#166534', darkBg: 'rgba(34,197,94,0.15)', darkColor: '#86efac' },
        'rejected': { label: 'Rejected', bg: '#fee2e2', color: '#991b1b', darkBg: 'rgba(239,68,68,0.15)', darkColor: '#fca5a5' },
        'hold': { label: 'Hold', bg: '#fef3c7', color: '#92400e', darkBg: 'rgba(245,158,11,0.15)', darkColor: '#fcd34d' },
        'interview': { label: 'Interview', bg: '#dbeafe', color: '#1e40af', darkBg: 'rgba(59,130,246,0.15)', darkColor: '#93c5fd' },
        'offer': { label: 'Offer', bg: '#f3e8ff', color: '#6b21a8', darkBg: 'rgba(168,85,247,0.15)', darkColor: '#d8b4fe' }
    };

    const STATUS_CYCLE = ['none', 'shortlisted', 'interview', 'hold', 'offer', 'rejected'];

    window.cycleCandidateStatus = function(candidateKey) {
        const current = state.candidateStatuses[candidateKey] || 'none';
        const idx = STATUS_CYCLE.indexOf(current);
        const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
        if (next === 'none') {
            delete state.candidateStatuses[candidateKey];
        } else {
            state.candidateStatuses[candidateKey] = next;
        }
        // Re-render status badge only
        const badge = document.querySelector('[data-status-badge="' + candidateKey + '"]');
        if (badge) {
            badge.outerHTML = renderStatusBadge(candidateKey);
        }
    };

    function renderStatusBadge(candidateKey) {
        const status = state.candidateStatuses[candidateKey] || 'none';
        const cfg = STATUS_CONFIG[status];
        const isDark = document.documentElement.classList.contains('dark');
        const bg = isDark ? cfg.darkBg : cfg.bg;
        const color = isDark ? cfg.darkColor : cfg.color;
        const cursor = status === 'none' ? 'cursor:pointer;opacity:0.5;' : 'cursor:pointer;';
        return '<span data-status-badge="' + candidateKey + '" onclick="cycleCandidateStatus(\'' + candidateKey + '\')" ' +
            'style="display:inline-block;padding:2px 10px;border-radius:20px;font-size:0.7rem;font-weight:600;' +
            'background:' + bg + ';color:' + color + ';' + cursor + '" title="Click to change status">' +
            cfg.label + '</span>';
    }

    // =============================================
    // FEATURE 4: STATISTICS DASHBOARD
    // =============================================
    function calculateStatistics(results) {
        if (!results || results.length === 0) return null;
        const allResults = results;
        const scores = allResults.map(r => parseFloat(r.score));
        const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);

        // Score distribution
        const ranges = [
            { label: '0-30', min: 0, max: 30, count: 0 },
            { label: '31-50', min: 31, max: 50, count: 0 },
            { label: '51-70', min: 51, max: 70, count: 0 },
            { label: '71-85', min: 71, max: 85, count: 0 },
            { label: '86-100', min: 86, max: 100, count: 0 }
        ];
        scores.forEach(s => {
            for (const r of ranges) {
                if (s >= r.min && s <= r.max) { r.count++; break; }
            }
        });

        // Top matched skills
        const skillCounts = {};
        allResults.forEach(r => (r.matched || []).forEach(s => { skillCounts[s] = (skillCounts[s] || 0) + 1; }));
        const topSkills = Object.entries(skillCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

        // Top gaps
        const gapCounts = {};
        allResults.forEach(r => (r.gaps || []).forEach(g => { gapCounts[g] = (gapCounts[g] || 0) + 1; }));
        const topGaps = Object.entries(gapCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

        return {
            total: allResults.length,
            displayed: Math.min(state.limit, allResults.length),
            avg: parseFloat(avg),
            ranges,
            topSkills,
            topGaps
        };
    }

    function renderStatistics(stats) {
        if (!stats) return '';
        const isDark = document.documentElement.classList.contains('dark');
        const barBg = isDark ? '#334155' : '#e2e8f0';
        const textMuted = isDark ? '#94a3b8' : '#64748b';
        const textMain = isDark ? '#f1f5f9' : '#0f172a';

        // Average score color
        let avgColor = '#ef4444';
        if (stats.avg >= 70) avgColor = '#10b981';
        else if (stats.avg >= 50) avgColor = '#f59e0b';

        // Distribution bars
        const maxCount = Math.max(...stats.ranges.map(r => r.count), 1);
        const barColors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#059669'];
        const distHtml = stats.ranges.map((r, i) => {
            const pct = maxCount > 0 ? (r.count / maxCount) * 100 : 0;
            return '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem;">' +
                '<span style="font-size:0.7rem;width:50px;color:' + textMuted + '">' + r.label + '</span>' +
                '<div style="flex:1;height:14px;background:' + barBg + ';border-radius:3px;overflow:hidden;">' +
                '<div style="width:' + pct + '%;height:100%;background:' + barColors[i] + ';border-radius:3px;transition:width 0.5s;"></div>' +
                '</div>' +
                '<span style="font-size:0.7rem;width:20px;text-align:right;color:' + textMuted + '">' + r.count + '</span>' +
                '</div>';
        }).join('');

        // Top skills
        const skillsHtml = stats.topSkills.map(([skill, count]) =>
            '<span class="match-pill">' + escapeHtml(skill) + ' <span style="opacity:0.7">(' + count + ')</span></span>'
        ).join(' ');

        // Top gaps
        const gapsHtml = stats.topGaps.map(([gap, count]) =>
            '<span class="gap-pill">' + escapeHtml(gap) + ' <span style="opacity:0.7">(' + count + ')</span></span>'
        ).join(' ');

        return '<div id="stats-dashboard" class="card" style="margin-bottom:1.5rem;cursor:pointer;" onclick="toggleStatsPanel()">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;">' +
            '<h2 style="margin-bottom:0;border-bottom:none;padding-bottom:0;">Screening Statistics</h2>' +
            '<span id="stats-toggle-icon" style="color:' + textMuted + ';font-size:1.2rem;transition:transform 0.3s;">&#9650;</span>' +
            '</div>' +
            '<p style="font-size:0.85rem;color:' + textMuted + ';margin:0.25rem 0 0.75rem;">' + stats.total + ' candidates screened, showing top ' + stats.displayed + '</p>' +
            '<div id="stats-body">' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">' +
            '<div>' +
            '<div style="font-size:0.8rem;color:' + textMuted + ';margin-bottom:0.25rem;">Average Score</div>' +
            '<div style="font-size:2rem;font-weight:800;color:' + avgColor + ';">' + stats.avg + '%</div>' +
            '</div>' +
            '<div>' +
            '<div style="font-size:0.8rem;color:' + textMuted + ';margin-bottom:0.5rem;">Score Distribution</div>' +
            distHtml +
            '</div>' +
            '</div>' +
            (stats.topSkills.length ? '<div style="margin-top:0.75rem;"><div style="font-size:0.8rem;color:' + textMuted + ';margin-bottom:0.35rem;">Top Matched Skills</div>' + skillsHtml + '</div>' : '') +
            (stats.topGaps.length ? '<div style="margin-top:0.5rem;"><div style="font-size:0.8rem;color:' + textMuted + ';margin-bottom:0.35rem;">Most Common Gaps</div>' + gapsHtml + '</div>' : '') +
            '</div>' +
            '</div>';
    }

    window.toggleStatsPanel = function() {
        const body = document.getElementById('stats-body');
        const icon = document.getElementById('stats-toggle-icon');
        if (body) {
            const isHidden = body.style.display === 'none';
            body.style.display = isHidden ? 'block' : 'none';
            if (icon) icon.style.transform = isHidden ? 'rotate(0)' : 'rotate(180deg)';
        }
    };

    // =============================================
    // FEATURE 5: INTERVIEW QUESTIONS
    // =============================================
    const QUESTION_TEMPLATES = {
        // Technical skills
        'technical': [
            'This candidate lacks {skill}. Ask: Walk us through a project where you applied analytical or problem-solving skills that relate to {skill}.',
            'This candidate lacks {skill}. Ask: Describe a time you had to quickly learn a new tool or technology to deliver results.'
        ],
        // Soft skills
        'soft': [
            'This candidate lacks {skill}. Ask: Tell us about a situation where you demonstrated {skill} in a professional setting.',
            'This candidate lacks {skill}. Ask: Describe how you handled a challenging team dynamic that required {skill}.'
        ],
        // Generic
        'generic': [
            'This candidate lacks {skill}. Ask: Describe your experience or transferable skills relevant to {skill}.',
            'This candidate lacks {skill}. Ask: How would you approach developing this competency if offered the role?'
        ]
    };

    const SOFT_SKILLS = [
        'leadership', 'communication', 'management', 'teamwork', 'collaboration',
        'problem-solving', 'critical thinking', 'interpersonal', 'presentation',
        'negotiation', 'conflict resolution', 'time management', 'organization',
        'adaptability', 'creativity', 'innovation', 'mentoring', 'coaching',
        'strategic thinking', 'decision making', 'emotional intelligence'
    ];

    function isSoftSkill(skill) {
        const s = skill.toLowerCase();
        return SOFT_SKILLS.some(soft => s.includes(soft) || soft.includes(s));
    }

    function generateInterviewQuestions(gaps) {
        if (!gaps || gaps.length === 0) return ['All required skills matched \u2014 consider behavioral and cultural fit questions.'];
        const questions = [];
        const uniqueGaps = [...new Set(gaps)].slice(0, 4);
        uniqueGaps.forEach(gap => {
            let category = 'generic';
            if (isSoftSkill(gap)) category = 'soft';
            else category = 'technical';

            const templates = QUESTION_TEMPLATES[category];
            const template = templates[Math.floor(Math.random() * templates.length)];
            questions.push(template.replace(/{skill}/g, gap));
        });
        return questions.slice(0, 3);
    }

    function renderInterviewQuestions(gaps, candidateKey) {
        const questions = generateInterviewQuestions(gaps);
        const qId = 'iq-' + candidateKey;
        const isDark = document.documentElement.classList.contains('dark');
        const borderColor = isDark ? '#334155' : '#e2e8f0';
        const textMuted = isDark ? '#94a3b8' : '#64748b';

        const questionsHtml = questions.map(q =>
            '<div style="font-size:0.8rem;color:' + textMuted + ';padding:0.35rem 0;border-bottom:1px dashed ' + borderColor + ';">' +
            '<span style="color:var(--primary);font-weight:600;">Q:</span> ' + escapeHtml(q) +
            '</div>'
        ).join('');

        return '<div style="margin-top:0.5rem;">' +
            '<div onclick="toggleInterviewQuestions(\'' + qId + '\')" ' +
            'style="cursor:pointer;font-size:0.8rem;font-weight:600;color:var(--primary);display:flex;align-items:center;gap:0.35rem;padding:0.25rem 0;">' +
            '<span id="' + qId + '-icon" style="transition:transform 0.2s;display:inline-block;">&#9654;</span> Interview Questions' +
            '</div>' +
            '<div id="' + qId + '" style="display:none;padding:0.5rem;background:' + (isDark ? 'rgba(59,130,246,0.05)' : '#f8fafc') + ';border-radius:8px;border:1px solid ' + borderColor + ';">' +
            questionsHtml +
            '</div>' +
            '</div>';
    }

    window.toggleInterviewQuestions = function(qId) {
        const el = document.getElementById(qId);
        const icon = document.getElementById(qId + '-icon');
        if (el) {
            const isVisible = el.style.display !== 'none';
            el.style.display = isVisible ? 'none' : 'block';
            if (icon) icon.style.transform = isVisible ? 'rotate(0)' : 'rotate(90deg)';
        }
    };

    // =============================================
    // FEATURE 6: LINKEDIN URL EXTRACTION
    // =============================================
    function extractLinkedInUrl(text) {
        if (!text) return null;
        const match = text.match(/(https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-_]+)/i);
        if (match) return match[1];
        const matchPub = text.match(/(https?:\/\/(?:www\.)?linkedin\.com\/pub\/[a-zA-Z0-9\-_]+)/i);
        if (matchPub) return matchPub[1];
        return null;
    }

    function extractPortfolioUrl(text) {
        if (!text) return null;
        // Look for URLs that are NOT linkedin, common false positives, or file paths
        const urls = text.match(/(https?:\/\/(?:www\.)?[a-zA-Z0-9][-a-zA-Z0-9]*(?:\.[a-zA-Z]{2,})+(?:\/[^\s)\]"']*)?)/gi);
        if (!urls) return null;
        const skipDomains = ['linkedin.com', 'google.com', 'gmail.com', 'yahoo.com', 'outlook.com',
            'github.com', 'bitbucket.org', 'stackoverflow.com', 'facebook.com',
            'twitter.com', 'indeed.com', 'glassdoor.com', 'ziprecruiter.com',
            'pdf', '.doc', '.docx'];
        for (const url of urls) {
            const lower = url.toLowerCase();
            if (skipDomains.some(d => lower.includes(d))) continue;
            // Must have a reasonable domain
            if (/\.[a-z]{2,}\/?/.test(lower)) return url;
        }
        return null;
    }

    function renderLinkedInLinks(content) {
        if (!content) return '';
        const linkedInUrl = extractLinkedInUrl(content);
        const portfolioUrl = extractPortfolioUrl(content);
        let html = '';

        if (linkedInUrl) {
            html += '<div class="contact-item">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:#0a66c2;width:16px;height:16px;flex-shrink:0;">' +
                '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>' +
                '<rect x="2" y="9" width="4" height="12"/>' +
                '<circle cx="4" cy="4" r="2"/>' +
                '</svg>' +
                '<div class="contact-value"><a href="' + escapeHtml(linkedInUrl) + '" target="_blank" rel="noopener">LinkedIn Profile</a></div>' +
                '</div>';
        }

        if (portfolioUrl) {
            html += '<div class="contact-item">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;color:var(--primary);flex-shrink:0;">' +
                '<circle cx="12" cy="12" r="10"/>' +
                '<line x1="2" y1="12" x2="22" y2="12"/>' +
                '<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>' +
                '</svg>' +
                '<div class="contact-value"><a href="' + escapeHtml(portfolioUrl) + '" target="_blank" rel="noopener">Portfolio</a></div>' +
                '</div>';
        }

        return html;
    }

    // =============================================
    // FEATURE 7: CANDIDATE NOTES
    // =============================================
    window.toggleCandidateNote = function(candidateKey) {
        const noteBody = document.getElementById('note-body-' + candidateKey);
        const notePreview = document.getElementById('note-preview-' + candidateKey);
        const noteInput = document.getElementById('note-input-' + candidateKey);
        if (!noteBody) return;
        const isExpanded = noteBody.style.display !== 'none';
        noteBody.style.display = isExpanded ? 'none' : 'block';
        if (notePreview) notePreview.style.display = isExpanded ? 'inline' : 'none';
        if (!isExpanded && noteInput) {
            noteInput.focus();
            noteInput.setSelectionRange(noteInput.value.length, noteInput.value.length);
        }
    };

    window.saveCandidateNote = function(candidateKey, value) {
        if (value.trim()) {
            state.candidateNotes[candidateKey] = value.trim();
        } else {
            delete state.candidateNotes[candidateKey];
        }
        // Update preview
        const preview = document.getElementById('note-preview-' + candidateKey);
        if (preview) {
            preview.textContent = value.trim() ? value.trim().substring(0, 50) + (value.trim().length > 50 ? '...' : '') : '';
            preview.style.display = value.trim() ? 'inline' : 'none';
        }
    };

    function renderCandidateNote(candidateKey) {
        const note = state.candidateNotes[candidateKey] || '';
        const previewText = note ? note.substring(0, 50) + (note.length > 50 ? '...' : '') : '';
        const isDark = document.documentElement.classList.contains('dark');
        const borderColor = isDark ? '#334155' : '#e2e8f0';
        const inputBg = isDark ? '#0f172a' : '#f8fafc';

        return '<div style="margin-top:0.5rem;padding-top:0.5rem;border-top:1px dashed ' + borderColor + ';">' +
            '<div style="display:flex;align-items:center;gap:0.5rem;">' +
            '<span onclick="toggleCandidateNote(\'' + candidateKey + '\')" ' +
            'style="cursor:pointer;font-size:0.8rem;font-weight:500;color:var(--primary);display:flex;align-items:center;gap:0.25rem;">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;">' +
            '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>' +
            '<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>' +
            '</svg> Add Note</span>' +
            '<span id="note-preview-' + candidateKey + '" style="font-size:0.75rem;color:var(--text-muted);display:' + (previewText ? 'inline' : 'none') + ';">' + escapeHtml(previewText) + '</span>' +
            '</div>' +
            '<div id="note-body-' + candidateKey + '" style="display:none;margin-top:0.35rem;">' +
            '<textarea id="note-input-' + candidateKey + '" ' +
            'onblur="saveCandidateNote(\'' + candidateKey + '\', this.value)" ' +
            'oninput="saveCandidateNote(\'' + candidateKey + '\', this.value)" ' +
            'style="width:100%;min-height:60px;padding:0.5rem;border:1px solid ' + borderColor + ';border-radius:6px;font-size:0.8rem;background:' + inputBg + ';color:var(--text-main);resize:vertical;user-select:text;-webkit-user-select:text;-moz-user-select:text;" ' +
            'placeholder="Add recruiting notes about this candidate...">' + escapeHtml(note) + '</textarea>' +
            '</div>' +
            '</div>';
    }

    // =============================================
    // FEATURE 8: CANDIDATE COMPARISON (Demo: max 2)
    // =============================================
    window.toggleComparisonSelect = function(candidateKey) {
        if (state.comparisonSelected.has(candidateKey)) {
            state.comparisonSelected.delete(candidateKey);
        } else {
            if (state.comparisonSelected.size >= 2) {
                showCompareLimitPopup();
            } else {
                state.comparisonSelected.add(candidateKey);
            }
        }
        renderCompareButton();
        document.querySelectorAll('.phein-compare-checkbox').forEach(cb => {
            const key = cb.getAttribute('data-candidate-key');
            cb.checked = state.comparisonSelected.has(key);
        });
    };

    function showCompareLimitPopup() {
        var existing = document.getElementById('compare-limit-popup');
        if (existing) existing.remove();
        var isDark = document.documentElement.classList.contains('dark');
        var cardBg = isDark ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.95)';
        var titleColor = isDark ? '#f1f5f9' : '#0f172a';
        var textColor = isDark ? '#94a3b8' : '#64748b';
        var overlay = document.createElement('div');
        overlay.id = 'compare-limit-popup';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:7000;display:flex;justify-content:center;align-items:center;padding:1.5rem;';
        overlay.innerHTML =
            '<div style="background:' + cardBg + ';backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border-radius:20px;padding:2.25rem 2.5rem;max-width:440px;width:92%;box-shadow:0 25px 60px rgba(0,0,0,0.35),0 0 0 1px rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.3);animation:modalSlideIn 0.3s ease-out;text-align:center;position:relative;overflow:hidden;">' +
                '<div style="width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(79,70,229,0.08));border:2px solid rgba(99,102,241,0.2);box-shadow:0 4px 15px rgba(99,102,241,0.15);">' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" style="width:28px;height:28px;"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="8" y="14" width="8" height="7"/></svg>' +
                '</div>' +
                '<h3 style="font-size:1.2rem;font-weight:700;color:' + titleColor + ';margin-bottom:0.6rem;letter-spacing:-0.2px;">Comparison Limit Reached</h3>' +
                '<p style="font-size:0.88rem;color:' + textColor + ';line-height:1.65;margin-bottom:1.5rem;">The demo version allows comparing a maximum of <strong style="color:#6366f1;">2 candidates</strong> at a time. Unselect one before adding another, or upgrade to Premium for up to 6.</p>' +
                '<button onclick="document.getElementById(\'compare-limit-popup\').remove()" style="display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:0.7rem 2rem;border-radius:12px;border:none;background:linear-gradient(135deg,#6366f1 0%,#4f46e5 100%);color:white;font-weight:700;font-size:0.9rem;cursor:pointer;box-shadow:0 4px 15px rgba(99,102,241,0.4),0 1px 3px rgba(0,0,0,0.1);transition:all 0.25s cubic-bezier(0.4,0,0.2,1);" onmouseover="this.style.background=\'linear-gradient(135deg,#4f46e5 0%,#4338ca 100%)\';this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.background=\'linear-gradient(135deg,#6366f1 0%,#4f46e5 100%)\';this.style.transform=\'translateY(0)\'">Got It</button>' +
            '</div>';
        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
        document.body.appendChild(overlay);
    }

    function renderCompareButton() {
        let btn = document.getElementById('compare-float-btn');
        let clearBtn = document.getElementById('compare-clear-btn');
        const count = state.comparisonSelected.size;
        if (count >= 1) {
            if (!clearBtn) {
                clearBtn = document.createElement('button');
                clearBtn.id = 'compare-clear-btn';
                clearBtn.className = 'btn btn-outline';
                clearBtn.style.cssText = 'position:fixed;bottom:5.25rem;right:2rem;z-index:1000;padding:0.55rem 1rem;border-radius:30px;font-size:0.82rem;box-shadow:0 4px 15px rgba(0,0,0,0.12);display:flex;align-items:center;gap:0.35rem;';
                clearBtn.onclick = function() { clearComparisonSelection(); };
                document.body.appendChild(clearBtn);
            }
            clearBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px;"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg> Deselect All';
            clearBtn.style.display = 'flex';
        } else {
            if (clearBtn) clearBtn.style.display = 'none';
        }
        if (count >= 2) {
            if (!btn) {
                btn = document.createElement('button');
                btn.id = 'compare-float-btn';
                btn.className = 'btn btn-primary';
                btn.style.cssText = 'position:fixed;bottom:2rem;right:2rem;z-index:1000;padding:0.75rem 1.5rem;border-radius:30px;box-shadow:0 8px 25px rgba(37,99,235,0.4);display:flex;align-items:center;gap:0.5rem;';
                btn.onclick = openComparisonModal;
                document.body.appendChild(btn);
            }
            btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="8" y="14" width="8" height="7"/></svg> Compare Selected (' + count + ')';
            btn.style.display = 'flex';
        } else {
            if (btn) btn.style.display = 'none';
        }
    }

    function renderComparisonCheckbox(candidateKey) {
        const checked = state.comparisonSelected.has(candidateKey) ? 'checked' : '';
        return '<input type="checkbox" class="phein-compare-checkbox" data-candidate-key="' + candidateKey + '" ' +
            'onclick="event.stopPropagation();toggleComparisonSelect(\'' + candidateKey + '\')" ' +
            'style="position:absolute;top:0.75rem;right:0.75rem;width:18px;height:18px;cursor:pointer;accent-color:var(--primary);z-index:5;" ' + checked + ' title="Select for comparison">';
    }

    window.openComparisonModal = function() {
        if (state.comparisonSelected.size < 2) {
            showToast('Select at least 2 candidates to compare.');
            return;
        }
        const selectedKeys = [...state.comparisonSelected];
        const candidates = selectedKeys.map(key => {
            return state.lastResults.find(r => getCandidateKey(r) === key);
        }).filter(Boolean);

        if (candidates.length < 2) return;

        // Sort by score to maintain ranking (higher score = better rank)
        candidates.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));

        const modal = document.getElementById('comparison-modal');
        const body = document.getElementById('comparison-body');
        if (!modal || !body) return;

        const isDark = document.documentElement.classList.contains('dark');

        // Windowed display instead of table
        let html = '<div style="display:flex;gap:0.75rem;flex-wrap:wrap;justify-content:center;">';

        candidates.forEach(function(c, idx) {
            const rank = idx + 1;
            const rankColors = ['#fbbf24', '#94a3b8', '#b45309', '#6b7280'];
            const rankColor = isDark ? '#e2e8f0' : rankColors[idx] || '#6b7280';

            var key = getCandidateKey(c);
            var status = state.candidateStatuses[key] || 'none';
            var statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG['none'];
            var sBg = isDark ? statusCfg.darkBg : statusCfg.bg;
            var sColor = isDark ? statusCfg.darkColor : statusCfg.color;

            var matchedHtml = (c.matched || []).map(function(m) {
                return '<div style="display:flex;align-items:center;gap:0.3rem;margin-bottom:0.3rem;"><svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" style="width:13px;height:13px;flex-shrink:0;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><span style="font-size:0.8rem;">' + escapeHtml(m) + '</span></div>';
            }).join('');

            var gapsHtml = (c.gaps || []).map(function(g) {
                return '<div style="display:flex;align-items:center;gap:0.3rem;margin-bottom:0.3rem;"><svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" style="width:13px;height:13px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg><span style="font-size:0.8rem;">' + escapeHtml(g) + '</span></div>';
            }).join('');

            var extraInfo = '';
            if (c.content) {
                if (state.screeningOptions.visa) {
                    var visa = extractVisaInfo(c.content);
                    if (visa.found) extraInfo += '<span style="font-size:0.7rem;font-weight:600;color:#f59e0b;background:rgba(245,158,11,0.1);padding:1px 6px;border-radius:3px;">' + visa.tags.join(', ') + '</span> ';
                }
                if (state.screeningOptions.salary) {
                    var salary = extractSalaryInfo(c.content);
                    if (salary.found) extraInfo += '<span style="font-size:0.7rem;color:#6366f1;background:rgba(99,102,241,0.1);padding:1px 6px;border-radius:3px;">' + escapeHtml(salary.mentions[0]) + '</span> ';
                }
                if (state.screeningOptions.location) {
                    var loc = extractLocationInfo(c.content);
                    if (loc) extraInfo += '<span style="font-size:0.7rem;color:#166534;background:rgba(22,163,74,0.1);padding:1px 6px;border-radius:3px;">' + escapeHtml(loc) + '</span> ';
                }
                if (state.screeningOptions.age) {
                    var age = extractAgeInfo(c.content);
                    if (age) extraInfo += '<span style="font-size:0.7rem;color:#6b21a8;background:rgba(107,33,168,0.1);padding:1px 6px;border-radius:3px;">' + escapeHtml(age) + '</span> ';
                }
            }

            var cardBg = isDark ? '#1e293b' : 'white';
            var cardBorder = isDark ? '#334155' : '#e2e8f0';
            var dividerBorder = isDark ? '#334155' : '#f1f5f9';
            var textMuted = isDark ? '#94a3b8' : '#64748b';

            html += '<div style="flex:1;min-width:260px;max-width:340px;background:' + cardBg + ';border:1px solid ' + cardBorder + ';border-radius:14px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.08);display:flex;flex-direction:column;">' +
                '<div style="padding:0.85rem 1rem;border-bottom:2px solid ' + dividerBorder + ';display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">' +
                    '<div style="display:flex;align-items:center;gap:0.5rem;">' +
                        '<span style="font-size:0.65rem;font-weight:700;color:white;padding:2px 10px;border-radius:10px;background:' + rankColors[idx] + ';">' + rank + (rank===1?'st':rank===2?'nd':rank===3?'rd':'th') + '</span>' +
                        '<span style="font-weight:700;font-size:0.95rem;color:var(--text-main);">' + escapeHtml(c.name) + '</span>' +
                    '</div>' +
                    '<span style="font-size:1.3rem;font-weight:800;color:var(--primary);">' + c.score + '%</span>' +
                '</div>' +
                '<div style="padding:0.85rem 1rem;overflow-y:auto;flex:1;">' +
                    (status !== 'none' ? '<div style="margin-bottom:0.5rem;"><span style="background:' + sBg + ';color:' + sColor + ';padding:2px 8px;border-radius:12px;font-size:0.72rem;font-weight:600;">' + statusCfg.label + '</span></div>' : '') +
                    '<div style="font-size:0.78rem;color:' + textMuted + ';margin-bottom:0.5rem;">' + (c.email || 'N/A') + '</div>' +
                    '<div style="font-size:0.78rem;color:' + textMuted + ';margin-bottom:0.5rem;">' + (c.phone || 'N/A') + '</div>' +
                    (extraInfo ? '<div style="display:flex;flex-wrap:wrap;gap:0.25rem;margin-bottom:0.5rem;">' + extraInfo + '</div>' : '') +
                    '<div style="font-size:0.7rem;font-weight:600;color:' + textMuted + ';margin:0.4rem 0;">STRENGTHS</div>' +
                    (matchedHtml || '<div style="font-size:0.8rem;color:#94a3b8;">None detected</div>') +
                    (gapsHtml ? '<div style="font-size:0.7rem;font-weight:600;color:' + textMuted + ';margin:0.5rem 0 0.3rem;">GAPS</div>' + gapsHtml : '') +
                    (state.candidateNotes[key] ? '<div style="margin-top:0.4rem;padding:0.4rem 0.6rem;background:' + (isDark ? 'rgba(245,158,11,0.08)' : '#fef3c7') + ';border-radius:6px;font-size:0.75rem;color:#92400e;">' + escapeHtml(state.candidateNotes[key].substring(0, 100)) + '</div>' : '') +
                '</div>' +
            '</div>';
        });

        html += '</div>';

        // ===== SMART MULTI-CANDIDATE ANALYSIS =====
        var textMuted2 = isDark ? '#94a3b8' : '#64748b';
        var textMain2 = isDark ? '#f1f5f9' : '#0f172a';
        var cardBg2 = isDark ? '#1e293b' : '#ffffff';
        var cardBorder2 = isDark ? '#334155' : '#e2e8f0';
        var analysisHtml = '';

        // --- 1. SVG BAR CHART: Score comparison across ALL candidates ---
        var maxScoreVal = 100;
        var barChartWidth = Math.min(candidates.length * 120, 700);
        var barChartHeight = 180;
        var barWidth = Math.max(30, Math.min(50, (barChartWidth - 80) / candidates.length - 10));
        var barGap = (barChartWidth - 60 - barWidth * candidates.length) / Math.max(1, candidates.length);
        var chartLeft = 50;
        var chartBottom = barChartHeight - 30;
        var chartTop = 15;
        var chartHeight = chartBottom - chartTop;

        var chartSvg = '<svg viewBox="0 0 ' + barChartWidth + ' ' + barChartHeight + '" style="width:100%;max-width:' + barChartWidth + 'px;display:block;margin:0 auto;">';
        // Y-axis labels + grid lines
        for (var yi = 0; yi <= 4; yi++) {
            var yVal = yi * 25;
            var yPos = chartBottom - (yVal / maxScoreVal) * chartHeight;
            chartSvg += '<line x1="' + chartLeft + '" y1="' + yPos + '" x2="' + (barChartWidth - 10) + '" y2="' + yPos + '" stroke="' + (isDark ? '#334155' : '#e2e8f0') + '" stroke-width="1"/>';
            chartSvg += '<text x="' + (chartLeft - 8) + '" y="' + (yPos + 4) + '" text-anchor="end" fill="' + textMuted2 + '" font-size="10">' + yVal + '%</text>';
        }
        // Bars
        var barColors = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2'];
        candidates.forEach(function(c, bi) {
            var bx = chartLeft + bi * (barWidth + barGap) + barGap / 2;
            var scoreH = ((parseFloat(c.score) || 0) / maxScoreVal) * chartHeight;
            var by = chartBottom - scoreH;
            var bColor = barColors[bi % barColors.length];
            chartSvg += '<rect x="' + bx + '" y="' + by + '" width="' + barWidth + '" height="' + scoreH + '" rx="4" fill="' + bColor + '" opacity="0.85">';
            chartSvg += '<animate attributeName="height" from="0" to="' + scoreH + '" dur="0.6s" fill="freeze"/>';
            chartSvg += '<animate attributeName="y" from="' + chartBottom + '" to="' + by + '" dur="0.6s" fill="freeze"/>';
            chartSvg += '</rect>';
            chartSvg += '<text x="' + (bx + barWidth / 2) + '" y="' + (by - 6) + '" text-anchor="middle" fill="' + bColor + '" font-size="11" font-weight="700">' + c.score + '%</text>';
            // Name label (truncated)
            var nameLabel = c.name.length > 8 ? c.name.substring(0, 7) + '..' : c.name;
            chartSvg += '<text x="' + (bx + barWidth / 2) + '" y="' + (chartBottom + 16) + '" text-anchor="middle" fill="' + textMuted2 + '" font-size="9" font-weight="600">' + escapeHtml(nameLabel) + '</text>';
        });
        chartSvg += '</svg>';

        analysisHtml += '<div style="margin-top:1rem;padding:1.25rem;border-radius:12px;background:' + (isDark ? 'rgba(59,130,246,0.06)' : '#eff6ff') + ';border:1px solid ' + (isDark ? 'rgba(59,130,246,0.2)' : '#bfdbfe') + ';">' +
            '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" style="width:20px;height:20px;flex-shrink:0;"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>' +
            '<strong style="font-size:1rem;color:#2563eb;">Score Comparison</strong></div>' +
            chartSvg + '</div>';

        // --- 2. SKILL OVERLAP MATRIX: What skills do candidates share or uniquely have? ---
        var allMatched = {};
        var allGaps = {};
        candidates.forEach(function(c) {
            (c.matched || []).forEach(function(s) { allMatched[s] = (allMatched[s] || 0) + 1; });
            (c.gaps || []).forEach(function(g) { allGaps[g] = (allGaps[g] || 0) + 1; });
        });
        var universalSkills = Object.keys(allMatched).filter(function(s) { return allMatched[s] === candidates.length; });
        var rareSkills = Object.keys(allMatched).filter(function(s) { return allMatched[s] === 1; });
        var commonGaps = Object.keys(allGaps).sort(function(a, b) { return allGaps[b] - allGaps[a]; }).slice(0, 5);

        var overlapHtml = '<div style="margin-top:0.75rem;padding:1.25rem;border-radius:12px;background:' + (isDark ? 'rgba(16,185,129,0.06)' : '#f0fdf4') + ';border:1px solid ' + (isDark ? 'rgba(16,185,129,0.2)' : '#bbf7d0') + ';">' +
            '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" style="width:20px;height:20px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>' +
            '<strong style="font-size:1rem;color:#059669;">Skill Analysis</strong></div>';

        if (universalSkills.length > 0) {
            overlapHtml += '<div style="margin-bottom:0.5rem;"><span style="font-size:0.75rem;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:0.05em;">Strengths All Candidates Share:</span>' +
                '<div style="display:flex;flex-wrap:wrap;gap:0.3rem;margin-top:0.3rem;">' +
                universalSkills.map(function(s) { return '<span style="font-size:0.75rem;padding:2px 8px;border-radius:20px;background:rgba(16,185,129,0.12);color:#059669;font-weight:600;">' + escapeHtml(s) + '</span>'; }).join('') +
                '</div></div>';
        }
        if (rareSkills.length > 0) {
            var rareSkillOwners = rareSkills.map(function(s) {
                var owner = candidates.find(function(c) { return (c.matched || []).indexOf(s) !== -1; });
                return '<span style="font-size:0.75rem;padding:2px 8px;border-radius:20px;background:rgba(124,58,237,0.12);color:#7c3aed;font-weight:600;">' + escapeHtml(s) + ' <span style="opacity:0.7">(' + escapeHtml(owner ? owner.name : '?') + ')</span></span>';
            });
            overlapHtml += '<div style="margin-bottom:0.5rem;"><span style="font-size:0.75rem;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:0.05em;">Unique Skills (Differentiators):</span>' +
                '<div style="display:flex;flex-wrap:wrap;gap:0.3rem;margin-top:0.3rem;">' + rareSkillOwners.join('') + '</div></div>';
        }
        if (commonGaps.length > 0) {
            overlapHtml += '<div><span style="font-size:0.75rem;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.05em;">Common Gaps Across Candidates:</span>' +
                '<div style="display:flex;flex-wrap:wrap;gap:0.3rem;margin-top:0.3rem;">' +
                commonGaps.map(function(g) { return '<span style="font-size:0.75rem;padding:2px 8px;border-radius:20px;background:rgba(220,38,38,0.1);color:#dc2626;font-weight:600;">' + escapeHtml(g) + ' <span style="opacity:0.6">(' + allGaps[g] + '/' + candidates.length + ')</span></span>'; }).join('') +
                '</div></div>';
        }
        overlapHtml += '</div>';
        analysisHtml += overlapHtml;

        // --- 3. PER-CANDIDATE DETAILED ASSESSMENT ---
        var perCandidateHtml = '<div style="margin-top:0.75rem;padding:1.25rem;border-radius:12px;background:' + (isDark ? 'rgba(124,58,237,0.06)' : '#faf5ff') + ';border:1px solid ' + (isDark ? 'rgba(124,58,237,0.2)' : '#e9d5ff') + ';">' +
            '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2" style="width:20px;height:20px;flex-shrink:0;"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' +
            '<strong style="font-size:1rem;color:#7c3aed;">Detailed Candidate Assessments</strong></div>';

        candidates.forEach(function(c, ci) {
            var score = parseFloat(c.score) || 0;
            var matched = (c.matched || []);
            var gaps = (c.gaps || []);
            var mLen = matched.length;
            var gLen = gaps.length;
            var totalSkills = mLen + gLen;
            var matchRate = totalSkills > 0 ? Math.round((mLen / totalSkills) * 100) : 0;

            // Determine tier — brutally honest thresholds
            var tierLabel, tierColor, tierBg;
            if (score >= 85) { tierLabel = 'Outstanding Match'; tierColor = '#059669'; tierBg = isDark ? 'rgba(5,150,105,0.12)' : '#ecfdf5'; }
            else if (score >= 70) { tierLabel = 'Strong Match'; tierColor = '#2563eb'; tierBg = isDark ? 'rgba(37,99,235,0.12)' : '#eff6ff'; }
            else if (score >= 55) { tierLabel = 'Adequate Match'; tierColor = '#d97706'; tierBg = isDark ? 'rgba(217,119,6,0.12)' : '#fffbeb'; }
            else if (score >= 40) { tierLabel = 'Below Average'; tierColor = '#ea580c'; tierBg = isDark ? 'rgba(234,88,12,0.12)' : '#fff7ed'; }
            else { tierLabel = 'Not a Good Match'; tierColor = '#dc2626'; tierBg = isDark ? 'rgba(220,38,38,0.12)' : '#fef2f2'; }

            // Build assessment text — brutally honest, no sugarcoating
            var assessment = '';
            if (score >= 85) {
                assessment = escapeHtml(c.name) + ' is an <strong style="color:' + tierColor + ';">exceptional candidate</strong> who meets the vast majority of role requirements. With a score of <strong>' + score + '%</strong> and a skill match rate of <strong>' + matchRate + '%</strong>, this candidate demonstrates strong alignment with the position. ';
                if (gLen === 0) assessment += 'They have <strong>zero skill gaps</strong>, making them a complete match for the advertised requirements.';
                else assessment += 'The ' + gLen + ' identified gap' + (gLen > 1 ? 's' : '') + ' (' + gaps.slice(0, 3).map(function(g) { return escapeHtml(g); }).join(', ') + (gLen > 3 ? ' and ' + (gLen - 3) + ' more' : '') + ') are likely addressable through onboarding or minor upskilling. <strong style="color:#059669;">Strongly recommended for immediate progression.</strong>';
            } else if (score >= 70) {
                assessment = escapeHtml(c.name) + ' is a <strong style="color:' + tierColor + ';">solid candidate</strong> scoring <strong>' + score + '%</strong> with a skill match rate of <strong>' + matchRate + '%</strong>. They demonstrate competency across most required areas. ';
                if (gLen <= 2) assessment += 'With only ' + gLen + ' gap' + (gLen > 1 ? 's' : '') + ' identified, this candidate is well-positioned for the next stage. <strong style="color:#2563eb;">Recommended for shortlisting and interview.</strong>';
                else assessment += 'However, ' + gLen + ' skill gaps exist that should be probed during the interview. Verify whether these gaps are deal-breakers. <strong style="color:#2563eb;">Worth interviewing with targeted questions.</strong>';
            } else if (score >= 55) {
                assessment = escapeHtml(c.name) + ' shows <strong style="color:' + tierColor + ';">adequate but not impressive</strong> alignment with the role at <strong>' + score + '%</strong>. ' + mLen + ' out of ' + totalSkills + ' skills matched, leaving ' + gLen + ' gaps. ';
                if (matchRate < 60) assessment += 'With a match rate below 60%, this candidate falls short in more areas than they cover. ';
                if (rareSkills.length > 0) {
                    var hasRare = matched.some(function(m) { return rareSkills.indexOf(m) !== -1; });
                    if (hasRare) assessment += 'They do bring some unique skills not found in other candidates, which could be a differentiator. ';
                }
                assessment += '<strong style="color:#d97706;">Proceed with caution — only consider if no stronger candidates are available and the gaps are in trainable areas.</strong>';
            } else if (score >= 40) {
                assessment = escapeHtml(c.name) + ' is <strong style="color:' + tierColor + ';">below average</strong> for this role at <strong>' + score + '%</strong>. Only ' + mLen + ' skill' + (mLen !== 1 ? 's' : '') + ' matched against ' + gLen + ' gaps. ';
                if (matchRate < 50) assessment += 'Failing to match even half the required skills is a significant red flag. ';
                if (mLen > 0) assessment += 'Matched skills include ' + matched.slice(0, 3).map(function(m) { return escapeHtml(m); }).join(', ') + '. ';
                assessment += '<strong style="color:#ea580c;">Not recommended for this role. The skill gaps are too substantial to overlook.</strong>';
            } else {
                assessment = escapeHtml(c.name) + ' is <strong style="color:' + tierColor + ';">not a good match</strong> for this role at <strong>' + score + '%</strong>. With ' + gLen + ' gap' + (gLen > 1 ? 's' : '') + ' and only ' + mLen + ' matched skill' + (mLen !== 1 ? 's' : '') + ', this candidate does not meet the bar. ';
                if (matchRate < 40) assessment += 'A match rate below 40% indicates fundamental misalignment with the role requirements. ';
                assessment += '<strong style="color:#dc2626;">Do not proceed with this candidate for this position.</strong>';
            }

            perCandidateHtml += '<div style="padding:0.75rem;border-radius:8px;background:' + tierBg + ';border:1px solid ' + (isDark ? 'rgba(124,58,237,0.1)' : '#e9d5ff') + ';margin-bottom:0.5rem;' + (ci === 0 ? 'border-left:3px solid ' + tierColor + ';' : '') + '">' +
                '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.4rem;flex-wrap:wrap;">' +
                '<span style="font-weight:700;font-size:0.9rem;color:var(--text-main);">' + escapeHtml(c.name) + '</span>' +
                '<span style="font-size:0.7rem;font-weight:700;color:' + tierColor + ';background:' + tierBg + ';padding:2px 8px;border-radius:10px;border:1px solid ' + tierColor + ';">' + tierLabel + '</span>' +
                '<span style="font-size:0.7rem;color:' + textMuted2 + ';">Score: <strong>' + score + '%</strong> | Matched: <strong style="color:#059669;">' + mLen + '</strong> | Gaps: <strong style="color:#dc2626;">' + gLen + '</strong> | Rate: <strong>' + matchRate + '%</strong></span>' +
                '</div>' +
                '<p style="font-size:0.82rem;color:' + textMuted2 + ';line-height:1.6;margin:0;">' + assessment + '</p>' +
                '</div>';
        });

        perCandidateHtml += '</div>';
        analysisHtml += perCandidateHtml;

        // --- 4. HEAD-TO-HEAD COMPARISONS (pairwise insights for up to 6 pairs) ---
        if (candidates.length >= 2) {
            var h2hHtml = '<div style="margin-top:0.75rem;padding:1.25rem;border-radius:12px;background:' + (isDark ? 'rgba(245,158,11,0.06)' : '#fffbeb') + ';border:1px solid ' + (isDark ? 'rgba(245,158,11,0.2)' : '#fde68a') + ';">' +
                '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" style="width:20px;height:20px;flex-shrink:0;"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>' +
                '<strong style="font-size:1rem;color:#d97706;">Head-to-Head Insights</strong></div>';

            // Compare #1 against all others
            var base = candidates[0];
            for (var hi = 1; hi < candidates.length && hi <= 5; hi++) {
                var challenger = candidates[hi];
                var baseS = parseFloat(base.score) || 0;
                var challS = parseFloat(challenger.score) || 0;
                var diff = Math.abs(baseS - challS).toFixed(1);
                var leader = baseS >= challS ? base : challenger;
                var trailer = baseS >= challS ? challenger : base;

                // Find skills where one has and the other lacks
                var baseSet = new Set(base.matched || []);
                var challSet = new Set(challenger.matched || []);
                var baseAdvantage = (base.matched || []).filter(function(s) { return !challSet.has(s); });
                var challAdvantage = (challenger.matched || []).filter(function(s) { return !baseSet.has(s); });
                var sharedSkills = (base.matched || []).filter(function(s) { return challSet.has(s); });

                var verdict = '';
                if (baseS - challS >= 20) {
                    verdict = escapeHtml(leader.name) + ' has a <strong style="color:#059669;">decisive advantage</strong> of ' + diff + ' points. This is a clear differentiation in overall suitability.';
                } else if (baseS - challS >= 10) {
                    verdict = escapeHtml(leader.name) + ' holds a <strong style="color:#2563eb;">notable lead</strong> of ' + diff + ' points, though ' + escapeHtml(trailer.name) + ' may still have compensating strengths.';
                } else if (baseS - challS >= 5) {
                    verdict = 'A <strong style="color:#d97706;">modest gap</strong> of ' + diff + ' points separates these candidates. Both could be viable depending on other factors.';
                } else {
                    verdict = 'These candidates are <strong style="color:#7c3aed;">nearly tied</strong> (' + diff + ' points apart). Other differentiators like experience, culture fit, and availability should weigh heavily in the decision.';
                }

                h2hHtml += '<div style="padding:0.65rem;border-radius:8px;background:' + (isDark ? 'rgba(0,0,0,0.15)' : '#fffef5') + ';border:1px solid ' + (isDark ? 'rgba(245,158,11,0.1)' : '#fde68a') + ';margin-bottom:0.5rem;">' +
                    '<div style="font-size:0.85rem;font-weight:700;color:var(--text-main);margin-bottom:0.35rem;">' +
                    escapeHtml(base.name) + ' <span style="color:' + textMuted2 + ';font-weight:400;">vs</span> ' + escapeHtml(challenger.name) +
                    ' <span style="font-size:0.72rem;color:' + textMuted2 + ';font-weight:400;">(' + baseS + '% vs ' + challS + '%)</span></div>' +
                    '<p style="font-size:0.8rem;color:' + textMuted2 + ';line-height:1.55;margin:0 0 0.3rem;">' + verdict + '</p>';

                if (baseAdvantage.length > 0 || challAdvantage.length > 0) {
                    h2hHtml += '<div style="font-size:0.75rem;color:' + textMuted2 + ';">';
                    if (baseAdvantage.length > 0) {
                        h2hHtml += '<strong>' + escapeHtml(base.name) + ' leads with:</strong> ' + baseAdvantage.slice(0, 4).map(function(s) { return '<span style="color:#059669;font-weight:600;">' + escapeHtml(s) + '</span>'; }).join(', ');
                    }
                    if (baseAdvantage.length > 0 && challAdvantage.length > 0) h2hHtml += ' | ';
                    if (challAdvantage.length > 0) {
                        h2hHtml += '<strong>' + escapeHtml(challenger.name) + ' leads with:</strong> ' + challAdvantage.slice(0, 4).map(function(s) { return '<span style="color:#059669;font-weight:600;">' + escapeHtml(s) + '</span>'; }).join(', ');
                    }
                    if (sharedSkills.length > 0) {
                        h2hHtml += '<br><strong>Shared strengths:</strong> ' + sharedSkills.slice(0, 5).map(function(s) { return '<span style="color:#2563eb;font-weight:600;">' + escapeHtml(s) + '</span>'; }).join(', ');
                    }
                    h2hHtml += '</div>';
                }
                h2hHtml += '</div>';
            }
            h2hHtml += '</div>';
            analysisHtml += h2hHtml;
        }

        // --- 5. OVERALL RECOMMENDATION & ACTIONABLE ADVICE ---
        var top = candidates[0];
        var topScore = parseFloat(top.score) || 0;
        var recHtml = '<div style="margin-top:0.75rem;padding:1.25rem;border-radius:12px;background:' + (isDark ? 'rgba(59,130,246,0.08)' : '#eff6ff') + ';border:1px solid ' + (isDark ? 'rgba(59,130,246,0.2)' : '#bfdbfe') + ';">' +
            '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" style="width:20px;height:20px;flex-shrink:0;"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M20.66 8A10 10 0 0 0 14 2.05V8h6.66z"/><path d="M12 22c5.52 0 10-4.48 10-10h-10v10z"/></svg>' +
            '<strong style="font-size:1rem;color:#2563eb;">System Recommendation</strong></div>';

        // Verdict based on top score and spread
        var spread = candidates.length > 1 ? (parseFloat(candidates[0].score) - parseFloat(candidates[candidates.length - 1].score)).toFixed(1) : 0;
        var avgScore = (candidates.reduce(function(s, c) { return s + parseFloat(c.score || 0); }, 0) / candidates.length).toFixed(1);

        recHtml += '<p style="font-size:0.85rem;color:' + textMuted2 + ';line-height:1.65;margin:0 0 0.75rem;">';

        if (candidates.length === 2) {
            var s2 = parseFloat(candidates[1].score) || 0;
            recHtml += 'Between these two candidates, <strong style="color:var(--text-main);">' + escapeHtml(top.name) + '</strong> leads with <strong style="color:#2563eb;">' + topScore + '%</strong>, ahead by <strong>' + spread + ' points</strong>. ';
        } else {
            recHtml += 'After analyzing all <strong>' + candidates.length + ' candidates</strong> (average score: <strong>' + avgScore + '%</strong>, spread: <strong>' + spread + ' points</strong>), <strong style="color:var(--text-main);">' + escapeHtml(top.name) + '</strong> ranks highest at <strong style="color:#2563eb;">' + topScore + '%</strong>. ';
        }

        // Contextual recommendation based on score distribution
        var strongCandidates = candidates.filter(function(c) { return parseFloat(c.score) >= 70; });
        var moderateCandidates = candidates.filter(function(c) { var s = parseFloat(c.score); return s >= 55 && s < 70; });
        var weakCandidates = candidates.filter(function(c) { return parseFloat(c.score) < 55; });

        if (strongCandidates.length >= 3) {
            recHtml += 'This is a <strong style="color:#059669;">competitive pool</strong> with ' + strongCandidates.length + ' strong candidates scoring 70%+. ';
        } else if (strongCandidates.length === 1) {
            recHtml += 'There is a <strong style="color:#2563eb;">clear frontrunner</strong> with a significant gap over the rest of the pool. ';
        } else if (strongCandidates.length === 0 && moderateCandidates.length > 0) {
            recHtml += 'No candidates strongly meet the requirements, but ' + moderateCandidates.length + ' show moderate potential that could be explored through interviews. ';
        }

        if (parseFloat(spread) <= 5 && candidates.length >= 2) {
            recHtml += 'The scores are tightly clustered, suggesting these candidates have similar qualification levels. <strong>Interviews and practical assessments should be the deciding factor.</strong> ';
        }

        recHtml += '</p>';

        // Actionable recommendation list
        recHtml += '<div style="font-size:0.82rem;color:' + textMuted2 + ';line-height:1.6;">';

        if (strongCandidates.length > 0) {
            recHtml += '<div style="margin-bottom:0.4rem;"><strong style="color:#059669;">Recommended for Next Stage:</strong> ';
            recHtml += strongCandidates.map(function(c) { return '<strong style="color:var(--text-main);">' + escapeHtml(c.name) + '</strong> (' + c.score + '%)'; }).join(', ');
            recHtml += '</div>';
        }
        if (moderateCandidates.length > 0) {
            recHtml += '<div style="margin-bottom:0.4rem;"><strong style="color:#d97706;">Adequate — Proceed with Caution:</strong> ';
            recHtml += moderateCandidates.map(function(c) { return '<strong style="color:var(--text-main);">' + escapeHtml(c.name) + '</strong> (' + c.score + '%)'; }).join(', ');
            recHtml += ' — not strong enough to confidently recommend, but may be viable if no better options exist.</div>';
        }
        if (weakCandidates.length > 0) {
            recHtml += '<div style="margin-bottom:0.4rem;"><strong style="color:#dc2626;">Below Average / Not Recommended:</strong> ';
            recHtml += weakCandidates.map(function(c) { return '<strong style="color:var(--text-main);">' + escapeHtml(c.name) + '</strong> (' + c.score + '%)'; }).join(', ');
            recHtml += ' — significant skill gaps indicate fundamental misalignment with the role.</div>';
        }

        // Interview strategy advice
        recHtml += '<div style="margin-top:0.5rem;padding-top:0.5rem;border-top:1px dashed ' + (isDark ? '#334155' : '#e2e8f0') + ';">';
        recHtml += '<strong style="color:#7c3aed;">Interview Strategy:</strong> ';
        if (commonGaps.length > 0) {
            recHtml += 'Focus on the common gaps across all candidates (<strong>' + commonGaps.slice(0, 3).map(function(g) { return escapeHtml(g); }).join(', ') + '</strong>) to understand whether the talent pool generally lacks these skills or if candidates can demonstrate equivalent experience. ';
        }
        if (rareSkills.length > 0) {
            recHtml += 'Evaluate which <strong>unique differentiator skills</strong> are most valuable for the role and weight them accordingly in your final decision. ';
        }
        recHtml += '</div>';

        recHtml += '</div></div>';
        analysisHtml += recHtml;

        // --- RANKING DISCREPANCY NOTE ---
        // If a lower-ranked candidate has more total matched skills than #1, show an insight
        if (candidates.length >= 2) {
            var firstC = candidates[0];
            var firstMatchedTotal = (firstC.matched || []).length;
            for (var rdi = 1; rdi < candidates.length; rdi++) {
                var rdC = candidates[rdi];
                var rdMatchedTotal = (rdC.matched || []).length;
                if (rdMatchedTotal > firstMatchedTotal && rdMatchedTotal > 0) {
                    var rdFirstMust = (firstC.matchedMust || []).length;
                    var rdMust = (rdC.matchedMust || []).length;
                    var rdFirstMustTotal = firstC.mustTotal || 0;
                    var rdMustTotal = rdC.mustTotal || 0;
                    var insightReason = '';
                    if (rdFirstMust > rdMust) {
                        insightReason = '<strong>' + escapeHtml(firstC.name) + '</strong> matched <strong>' + rdFirstMust + '/' + rdFirstMustTotal + '</strong> Core skills (must-haves) while <strong>' + escapeHtml(rdC.name) + '</strong> matched only <strong>' + rdMust + '/' + rdMustTotal + '</strong>. Core skills carry 60% of the ranking weight, so fewer Core matches significantly reduces the overall score, even when the total skill count is higher.';
                    } else {
                        insightReason = '<strong>' + escapeHtml(firstC.name) + '</strong> achieved a stronger weighted score due to proficiency multipliers and skill relevance weighting. Phein doesn\'t just count skills — it weighs Core skills at 60% and Additional skills at 40%, with proficiency levels boosting scores for advanced expertise.';
                    }
                    analysisHtml += '<div style="margin-top:0.75rem;padding:1rem 1.25rem;border-radius:12px;background:' + (isDark ? 'rgba(245,158,11,0.08)' : '#fffbeb') + ';border:1px solid ' + (isDark ? 'rgba(251,191,36,0.25)' : '#fde68a') + ';">' +
                        '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" style="width:18px;height:18px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>' +
                        '<strong style="font-size:0.92rem;color:#d97706;">Ranking Note</strong></div>' +
                        '<div style="font-size:0.8rem;color:' + textMuted2 + ';line-height:1.65;">' +
                            '<strong>Why does ' + escapeHtml(rdC.name) + ' (Rank ' + (rdi + 1) + ', ' + rdMatchedTotal + ' matched skills) rank below ' + escapeHtml(firstC.name) + ' (Rank 1, ' + firstMatchedTotal + ' matched skills)?</strong><br><br>' + insightReason +
                        '</div></div>';
                    break; // Only show the first discrepancy found
                }
            }
        }

        body.innerHTML = html + analysisHtml;
        modal.style.display = 'flex';
    };

    window.closeComparisonModal = function() {
        const modal = document.getElementById('comparison-modal');
        if (modal) modal.style.display = 'none';
    };

    window.clearComparisonSelection = function() {
        state.comparisonSelected.clear();
        renderCompareButton();
        document.querySelectorAll('.phein-compare-checkbox').forEach(cb => cb.checked = false);
    };

    // =============================================
    // HOOK INTO EXISTING renderResults
    // =============================================
    const _originalRenderResults = window.renderResults;

    window.renderResults = function(candidates) {
        // Call original first
        _originalRenderResults(candidates);

        // Now enhance the rendered cards
        const cards = document.querySelectorAll('.candidate-card');
        cards.forEach((card, i) => {
            const c = candidates[i];
            if (!c) return;

            const key = getCandidateKey(c);

            // 1. Status badge - inject after candidate-name
            const nameEl = card.querySelector('.candidate-name');
            if (nameEl) {
                nameEl.innerHTML += ' ' + renderStatusBadge(key);
            }

            // 2. Comparison checkbox
            card.insertAdjacentHTML('afterbegin', renderComparisonCheckbox(key));

            // 3. LinkedIn + Portfolio links (gated by toggle)
            const contactInfo = card.querySelector('.contact-info');
            if (contactInfo && c.content && state.screeningOptions.linkedin) {
                const links = renderLinkedInLinks(c.content);
                if (links) contactInfo.insertAdjacentHTML('beforeend', links);
            }

            // 4. Visa + Salary info
            if (c.content) {
                let screeningHtml = '';
                if (state.screeningOptions.visa) {
                    const visa = extractVisaInfo(c.content);
                    if (visa.found) {
                        const vColor = visa.type === 'authorized' ? '#10b981' : visa.type === 'visa_required' ? '#f59e0b' : '#64748b';
                        const vLabel = visa.type === 'authorized' ? 'Authorized' : visa.type === 'visa_required' ? 'Visa Required' : 'Detected';
                        screeningHtml += '<div style="margin-top:0.35rem;display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">' +
                            '<span style="font-size:0.75rem;font-weight:600;color:' + vColor + ';background:' +
                            (visa.type === 'authorized' ? 'rgba(16,185,129,0.1)' : visa.type === 'visa_required' ? 'rgba(245,158,11,0.1)' : 'rgba(100,116,139,0.1)') +
                            ';padding:2px 8px;border-radius:4px;">' + vLabel + '</span>';
                        visa.tags.forEach(tag => {
                            screeningHtml += '<span style="font-size:0.7rem;color:' + vColor + ';background:' +
                                (visa.type === 'authorized' ? 'rgba(16,185,129,0.08)' : visa.type === 'visa_required' ? 'rgba(245,158,11,0.08)' : 'rgba(100,116,139,0.08)') +
                                ';padding:2px 6px;border-radius:3px;">' + escapeHtml(tag) + '</span>';
                        });
                        screeningHtml += '</div>';
                    }
                }
                if (state.screeningOptions.salary) {
                    const salary = extractSalaryInfo(c.content);
                    if (salary.found) {
                        screeningHtml += '<div style="margin-top:0.25rem;">';
                        salary.mentions.forEach(m => {
                            screeningHtml += '<span style="font-size:0.75rem;color:#6366f1;background:rgba(99,102,241,0.1);padding:2px 8px;border-radius:4px;display:inline-block;margin-right:0.35rem;margin-bottom:0.25rem;">' + escapeHtml(m) + '</span>';
                        });
                        screeningHtml += '</div>';
                    }
                }
                if (screeningHtml) {
                    card.insertAdjacentHTML('beforeend', screeningHtml);
                }
            }

            // 4b. Location + Age info
            if (c.content) {
                var personalHtml = '';
                if (state.screeningOptions.location) {
                    var loc = extractLocationInfo(c.content);
                    if (loc) {
                        personalHtml += '<span style="display:inline-flex;align-items:center;gap:0.3rem;background:#f0fdf4;border:1px solid #bbf7d0;color:#166534;padding:2px 8px;border-radius:4px;font-size:0.72rem;font-weight:500;margin-right:0.35rem;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' + escapeHtml(loc) + '</span>';
                    }
                }
                if (state.screeningOptions.age) {
                    var age = extractAgeInfo(c.content);
                    if (age) {
                        personalHtml += '<span style="display:inline-flex;align-items:center;gap:0.3rem;background:#f5f3ff;border:1px solid #e9d5ff;color:#6b21a8;padding:2px 8px;border-radius:4px;font-size:0.72rem;font-weight:500;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' + escapeHtml(age) + '</span>';
                    }
                }
                if (personalHtml) {
                    card.insertAdjacentHTML('beforeend', '<div style="display:flex;flex-wrap:wrap;gap:0.35rem;margin-top:0.35rem;">' + personalHtml + '</div>');
                }
            }

            // 5. Interview Questions
            if (c.gaps && c.gaps.length > 0) {
                card.insertAdjacentHTML('beforeend', renderInterviewQuestions(c.gaps, key));
            }

            // 6. Candidate Notes
            card.insertAdjacentHTML('beforeend', renderCandidateNote(key));
        });

        // 7. Statistics Dashboard
        const stats = calculateStatistics(state.lastResults || candidates);
        if (stats) {
            const resultsHeader = document.querySelector('.results-header');
            const candidatesOutput = document.getElementById('candidates-output');
            // Remove existing stats if any
            const existingStats = document.getElementById('stats-dashboard');
            if (existingStats) existingStats.remove();
            // Insert stats before candidates
            if (candidatesOutput && resultsHeader) {
                candidatesOutput.insertAdjacentHTML('beforebegin', renderStatistics(stats));
            }
        }

        // 8. Store reference for comparison
        window._pheinLastRenderedCandidates = candidates;
    };

    // =============================================
    // HOOK INTO generatePdfReport (enhance with extra columns)
    // =============================================
    const _originalGeneratePdfReport = window.generatePdfReport;

    window.generatePdfReport = function() {
        if (!state.lastResults || !state.lastResults.length) {
            showToast('No results to export.');
            document.getElementById('pdf-modal').style.display = 'none';
            return;
        }
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const agency = document.getElementById('pdf-company-name').value || 'Recruitment Report';
            const job = document.getElementById('job-title').value || 'Open Position';
            const date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

            doc.setFillColor(37, 99, 235); doc.rect(0, 0, 210, 45, 'F');
            doc.setTextColor(255, 255, 255); doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.text(agency.toUpperCase(), 20, 15);
            doc.setFontSize(24); doc.text('Candidate Screening Report', 20, 28);
            doc.setFontSize(11); doc.setFont('helvetica', 'normal'); doc.text('Position: ' + job, 20, 38);

            let y = 55;
            doc.setFillColor(248, 250, 252); doc.roundedRect(20, y, 170, 20, 3, 3, 'F');
            doc.setTextColor(100, 116, 139); doc.setFontSize(9); doc.text('Report Generated: ' + date, 25, y + 8);
            doc.text('Total Screened: ' + (state.lastResults ? state.lastResults.length : 0) + ' | Top Displayed: ' + Math.min(state.limit, state.lastResults ? state.lastResults.length : 0), 25, y + 15);
            y += 30;

            doc.setTextColor(15, 23, 42); doc.setFontSize(12); doc.setFont('helvetica', 'bold');
            doc.text('Core Competencies: ' + state.criteria.mustHave.join(', '), 20, y); y += 15;
            doc.text('Top Candidates', 20, y); y += 10;

            state.lastResults.slice(0, state.limit).forEach(function(c, i) {
                const key = getCandidateKey(c);

                // Build tag info FIRST to calculate slot height
                const status = state.candidateStatuses[key] || 'None';
                const note = state.candidateNotes[key] || '';
                let visaStr = '';
                let salaryStr = '';
                let locStr = '';
                let ageStr = '';

                if (state.screeningOptions.visa && c.content) {
                    const visa = extractVisaInfo(c.content);
                    if (visa.found) visaStr = visa.tags.join(', ');
                }
                if (state.screeningOptions.salary && c.content) {
                    const salary = extractSalaryInfo(c.content);
                    if (salary.found) salaryStr = salary.mentions.join(', ');
                }
                if (state.screeningOptions.location && c.content) {
                    const loc = extractLocationInfo(c.content);
                    if (loc) locStr = loc;
                }
                if (state.screeningOptions.age && c.content) {
                    const age = extractAgeInfo(c.content);
                    if (age) ageStr = age;
                }

                // Calculate slot height based on how many tag lines we need
                let slotHeight = 28; // base: name + score + email + matched
                let hasGaps = c.gaps && c.gaps.length > 0;
                if (hasGaps) slotHeight += 5;
                let tagLines = [];
                let tagLine1 = '';
                if (status !== 'None') tagLine1 += (tagLine1 ? ' | ' : '') + status.charAt(0).toUpperCase() + status.slice(1);
                if (visaStr) tagLine1 += (tagLine1 ? ' | ' : '') + 'Visa: ' + visaStr;
                if (tagLine1) tagLines.push(tagLine1);
                let tagLine2 = '';
                if (salaryStr) tagLine2 += 'Salary: ' + salaryStr;
                if (locStr) tagLine2 += (tagLine2 ? ' | ' : '') + 'Location: ' + locStr;
                if (ageStr) tagLine2 += (tagLine2 ? ' | ' : '') + 'Age: ' + ageStr;
                if (tagLine2) tagLines.push(tagLine2);
                let noteLine = '';
                if (note) noteLine = 'Note: ' + note.substring(0, 70);
                if (noteLine) tagLines.push(noteLine);
                slotHeight += tagLines.length * 5;

                if (y > 260) { doc.addPage(); y = 20; }

                // Single slot containing everything
                doc.setFillColor(i === 0 ? 255 : i === 1 ? 248 : 255, i === 0 ? 251 : i === 1 ? 250 : 255, i === 0 ? 235 : i === 1 ? 252 : 255);
                doc.roundedRect(20, y - 3, 170, slotHeight, 3, 3, 'FD');

                // Name + score + email (inside slot)
                doc.setTextColor(15, 23, 42); doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.text((i + 1) + '. ' + c.name, 25, y + 5);
                doc.setTextColor(37, 99, 235); doc.setFontSize(14); doc.text(c.score + '%', 185, y + 7, { align: 'right' });
                doc.setTextColor(100, 116, 139); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
                doc.text((c.email || 'N/A') + ' | ' + (c.phone || 'N/A'), 25, y + 12);
                doc.setTextColor(22, 163, 74); doc.text('Matched: ' + (c.matched || []).slice(0, 4).join(', '), 25, y + 17);

                var tagY = y + 22;
                if (hasGaps) {
                    doc.setTextColor(220, 38, 38); doc.setFontSize(7);
                    doc.text('Gaps: ' + c.gaps.slice(0, 4).join(', '), 25, tagY);
                    tagY += 5;
                }

                // Tags INSIDE the slot
                doc.setFontSize(7); doc.setTextColor(100, 116, 139);
                tagLines.forEach(function(line) {
                    doc.text(line, 25, tagY);
                    tagY += 5;
                });

                y += slotHeight + 5;
            });

            doc.setFontSize(8); doc.setTextColor(148, 163, 184);
            doc.text('Generated by Phein Screener v8.0 | MortApps Studios', 105, 290, { align: 'center' });

            doc.save(agency.replace(/[^a-z0-9]/gi, '_') + '_Report_' + new Date().toISOString().split('T')[0] + '.pdf');
            document.getElementById('pdf-modal').style.display = 'none';
            showToast('PDF Report downloaded!', true);
        } catch(e) { console.error(e); showToast('Error generating PDF.'); }
    };

    // =============================================
    // ENHANCE CLEAR SESSION
    // =============================================
    const _originalConfirmedClearSession = window.confirmedClearSession;
    window.confirmedClearSession = function() {
        // Clear new feature state
        state.candidateStatuses = {};
        state.candidateNotes = {};
        state.comparisonSelected.clear();
        state.screeningOptions = { ai_detection: false, visa: false, salary: false, linkedin: true, location: false, age: false };
        updateScreeningToggles();
        renderCompareButton();
        // Call original
        _originalConfirmedClearSession();
    };

    // =============================================
    // FEATURE 9: SMARTER JD SKILL EXTRACTION (v3)
    // Overrides PheinEngine.extractSkillsFromJD
    // to extract ONLY specific technical/hard skills.
    //
    // v3 CHANGES from v2:
    // - REMOVED fallback to engine's broad JD_EXTRACTION_PATTERNS
    //   (was leaking 'finance', 'accounting', 'audit', 'tax', etc.)
    // - EXPANDED JD_TECHNICAL_SKILLS to 60+ specific tech tools
    // - DIRECT qualification/experience extraction (no engine needed)
    // - IMPROVED section isolation with more markers
    // - HARD CAP of 20 results
    // =============================================

    // Comprehensive curated dict of SPECIFIC technical/hard skills.
    // Every entry here is a concrete tool, language, or platform —
    // NOT a domain category, soft skill, or methodology.
    var JD_TECHNICAL_SKILLS = {
        // Programming Languages
        'javascript': ['javascript', 'js', 'ecmascript', 'es6', 'vanilla javascript'],
        'python': ['python', 'python3', 'python 3'],
        'java': ['java ', 'j2ee', 'j2se'],
        'typescript': ['typescript'],
        'c++': ['c++', 'cpp', 'c plus plus'],
        'c#': ['c#', 'c sharp', 'csharp'],
        'go': ['golang', 'go language'],
        'rust': ['rust', 'rustlang'],
        'ruby': ['ruby', 'ruby on rails'],
        'swift': ['swift', 'swiftui'],
        'kotlin': ['kotlin'],
        'php': ['php'],
        'r': ['r programming', 'r statistical', 'rstudio'],
        'scala': ['scala'],

        // Frontend Frameworks
        'react': ['react', 'reactjs', 'react.js', 'react js', 'redux', 'react hooks'],
        'angular': ['angular', 'angularjs', 'angular 2'],
        'vue.js': ['vue', 'vuejs', 'vue.js'],
        'next.js': ['next.js', 'nextjs'],
        'nuxt': ['nuxt', 'nuxt.js'],
        'svelte': ['svelte'],
        'jquery': ['jquery'],

        // Backend Frameworks
        'node.js': ['node', 'nodejs', 'node.js', 'express', 'expressjs', 'nestjs'],
        'django': ['django', 'django rest'],
        'flask': ['flask'],
        'spring boot': ['spring boot', 'spring framework', 'spring security'],
        '.net': ['asp.net', '.net core', '.net framework'],
        'laravel': ['laravel'],
        'fastapi': ['fastapi'],
        'rails': ['rails'],

        // Databases
        'sql': ['sql', 'mysql', 'postgresql', 'postgres', 'sql server', 'mssql', 'tsql', 'pl/sql', 'sqlite'],
        'mongodb': ['mongodb', 'mongo db'],
        'redis': ['redis'],
        'elasticsearch': ['elasticsearch'],
        'dynamodb': ['dynamodb'],
        'oracle db': ['oracle database'],
        'mariadb': ['mariadb'],
        'cassandra': ['cassandra'],
        'neo4j': ['neo4j'],
        'firebase': ['firebase', 'firestore'],

        // Cloud & DevOps
        'docker': ['docker', 'kubernetes', 'k8s', 'docker-compose'],
        'aws': ['aws', 'amazon web services', 'cloudformation', 'cloudfront', 'ec2'],
        'azure': ['azure', 'microsoft azure'],
        'gcp': ['google cloud platform', 'gcp', 'google cloud'],
        'terraform': ['terraform', 'ansible', 'puppet', 'chef', 'infrastructure as code'],
        'jenkins': ['jenkins'],
        'github actions': ['github actions'],
        'gitlab ci': ['gitlab ci'],
        'nginx': ['nginx', 'apache httpd'],
        'linux': ['linux', 'ubuntu', 'centos', 'debian', 'shell scripting', 'bash scripting', 'bash'],

        // Version Control
        'git': ['git', 'github', 'gitlab', 'bitbucket', 'version control'],

        // Data Science & ML
        'machine learning': ['machine learning', 'deep learning', 'neural network', 'nlp', 'natural language processing', 'computer vision', 'pytorch', 'tensorflow', 'keras'],
        'data science': ['data science', 'data scientist', 'data mining', 'big data', 'hadoop', 'spark'],
        'pandas': ['pandas'],
        'numpy': ['numpy'],
        'scikit-learn': ['scikit-learn', 'sklearn'],
        'jupyter': ['jupyter', 'jupyter notebook'],

        // BI & Analytics
        'power bi': ['power bi', 'powerbi'],
        'tableau': ['tableau'],
        'excel': ['microsoft excel', 'ms excel', 'vlookup', 'pivot table', 'macros', 'vba'],
        'spss': ['spss', 'stata', 'sas'],

        // Testing
        'jest': ['jest'],
        'pytest': ['pytest'],
        'selenium': ['selenium'],
        'cypress': ['cypress'],
        'mocha': ['mocha'],
        'junit': ['junit'],
        'tdd': ['test-driven development', 'tdd', 'bdd'],
        'playwright': ['playwright'],

        // Architecture & APIs
        'microservices': ['microservices', 'microservice'],
        'restful apis': ['restful api', 'rest api', 'restful apis', 'rest apis'],
        'graphql': ['graphql'],
        'grpc': ['grpc'],
        'kafka': ['kafka'],
        'rabbitmq': ['rabbitmq'],
        'serverless': ['serverless', 'serverless architecture', 'lambda functions'],

        // Security
        'cybersecurity': ['cybersecurity', 'penetration testing', 'owasp', 'ethical hacking', 'information security'],
        'oauth': ['oauth', 'jwt', 'saml', 'ssl', 'tls'],

        // Mobile
        'react native': ['react native'],
        'flutter': ['flutter'],
        'dart': ['dart'],
        'xcode': ['xcode'],
        'android': ['android development', 'android sdk'],
        'ios': ['ios development', 'ios sdk'],

        // CMS & Low-Code
        'wordpress': ['wordpress'],
        'shopify': ['shopify'],
        'webflow': ['webflow'],
        'salesforce': ['salesforce'],

        // Enterprise Software
        'sap': ['sap'],
        'quickbooks': ['quickbooks'],
        'servicenow': ['servicenow'],
        'jira': ['jira'],

        // Other Technical
        'regex': ['regex', 'regular expression'],
        'api design': ['api design', 'api development']
    };

    // Try to isolate the requirements/qualifications sections from a JD.
    // Falls back to full text if no section headers are found.
    function isolateRequirementsSection(text) {
        var lower = text.toLowerCase();

        // Section starters — headers that BEGIN a requirements/qualifications block
        var sectionStarters = [
            'required qualifications', 'requirements:', 'requirements',
            'required skills', 'preferred qualifications', 'preferred skills',
            'desired qualifications', 'desired skills', 'qualifications:',
            'qualifications', 'technical requirements', 'technical skills:',
            'technical skills', 'required experience', 'minimum qualifications',
            'must have', 'what you\'ll need', 'what we\'re looking for',
            'ideal candidate', 'who you are', 'skills & requirements',
            'skills and requirements', 'skills required', 'required technical'
        ];

        // Find the earliest requirements section
        var bestStart = -1;
        for (var i = 0; i < sectionStarters.length; i++) {
            var idx = lower.indexOf(sectionStarters[i]);
            if (idx !== -1) {
                if (bestStart === -1 || idx < bestStart) bestStart = idx;
            }
        }

        if (bestStart === -1) return text; // No section found, use full text

        // If the section header appears in the last ~15% of the text,
        // the actual skills are BEFORE the header, not after it.
        // Fall back to full text so we don't throw away all the skills.
        if (bestStart > text.length * 0.85) return text;

        // Section enders — headers that END a requirements block
        var sectionEnders = [
            'benefits', 'what we offer', 'perks', 'compensation package',
            'salary range', 'equal opportunity', 'about the company',
            'our culture', 'how to apply', 'application process',
            'deadline', 'disclaimer', 'why join us', 'what you\'ll love'
        ];
        var bestEnd = text.length;
        for (var j = 0; j < sectionEnders.length; j++) {
            var endIdx = lower.indexOf(sectionEnders[j], bestStart + 50);
            if (endIdx !== -1 && endIdx < bestEnd) bestEnd = endIdx;
        }

        return text.substring(bestStart, bestEnd);
    }

    // Extract qualification requirements (degree, masters, etc.)
    function extractQualifications(text) {
        var lower = text.toLowerCase();
        var found = [];
        var seen = {};

        // Direct qualification patterns
        var qualPatterns = [
            { name: "bachelor's degree", re: /\bbachelor'?s?\s+degree\b/i },
            { name: "master's degree", re: /\bmaster'?s?\s+degree\b/i },
            { name: 'phd', re: /\bph\.?d\b/i },
            { name: 'mba', re: /\bmba\b/i },
            { name: 'diploma', re: /\bdiploma\b/i },
            { name: 'professional certification', re: /\b(certified|certification|professional certificate)\b/i }
        ];

        for (var i = 0; i < qualPatterns.length; i++) {
            if (seen[qualPatterns[i].name]) continue;
            if (qualPatterns[i].re.test(lower)) {
                seen[qualPatterns[i].name] = true;
                found.push(qualPatterns[i].name);
            }
        }
        return found;
    }

    // Extract experience requirements (e.g., "5+ years experience")
    function extractExperienceRequirement(text) {
        var expMatch = text.match(/(?:minimum\s+)?(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|expertise|practice|work|working|professional)/i);
        if (expMatch) return expMatch[1] + '+ years experience';
        expMatch = text.match(/(?:at\s+least\s+)?(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|expertise|practice|work)/i);
        if (expMatch) return expMatch[1] + '+ years experience';
        return null;
    }

    // Override the engine's extraction with our precision version
    if (typeof PheinEngine !== 'undefined' && PheinEngine.extractSkillsFromJD) {
        var _origExtract = PheinEngine.extractSkillsFromJD;
        PheinEngine.extractSkillsFromJD = function(text) {
            // Step 1: Isolate the requirements/qualifications section
            var focused = isolateRequirementsSection(text);
            // Safety: if isolation gutted the text (less than 30% of original),
            // fall back to full text
            if (focused.length < text.length * 0.3) focused = text;
            var lowerFocused = focused.toLowerCase();

            var found = [];
            var seen = {};

            // Step 2: Match ONLY against our curated JD_TECHNICAL_SKILLS dict.
            // This is the SOLE source of extracted skills — no engine fallback.
            // This prevents 'finance', 'accounting', 'audit', 'marketing', etc.
            // from leaking through.
            for (var skill in JD_TECHNICAL_SKILLS) {
                if (seen[skill]) continue;
                var aliases = JD_TECHNICAL_SKILLS[skill];
                for (var j = 0; j < aliases.length; j++) {
                    if (aliases[j].length < 3) continue;
                    // Word-boundary matching to prevent partial false positives
                    var escaped = aliases[j].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    var regex = new RegExp('(?:^|[\\s,;.(/"\'])' + escaped + '(?:$|[\\s,;.)/"\'!])', 'i');
                    if (regex.test(lowerFocused)) {
                        seen[skill] = true;
                        found.push(skill);
                        break;
                    }
                }
            }

            // Step 3: Extract qualification requirements (degree, etc.)
            var quals = extractQualifications(focused);
            for (var q = 0; q < quals.length; q++) {
                if (!seen[quals[q]]) {
                    seen[quals[q]] = true;
                    found.push(quals[q]);
                }
            }

            // Step 4: Extract experience requirement (e.g., "5+ years experience")
            var expReq = extractExperienceRequirement(focused);
            if (expReq && !seen[expReq]) {
                seen[expReq] = true;
                found.push(expReq);
            }

            // Step 5: Hard cap at 20 results to avoid overwhelming the user
            return found.slice(0, 20);
        };
    }

    // =============================================
    // FEATURE 11: SMART AUTO-CATEGORIZATION (v1)
    // Analyzes context around each extracted skill
    // in the JD to determine Must Have vs Nice to Have.
    //
    // Approach A — Context-Based:
    // - Scans for requirement language cues
    // - Scans for section headers
    // - Checks position in JD (earlier = more critical)
    // - Falls back to Nice to Have (safe default)
    // =============================================

    function categorizeExtractedSkills(skills, originalText) {
        if (!skills || skills.length === 0) return { mustHave: [], niceToHave: [] };

        var lower = originalText.toLowerCase();
        var textLen = lower.length || 1;

        // Strong Must Have signals — words/phrases that indicate hard requirements
        var mustSignals = [
            'required', 'must have', 'must possess', 'essential', 'mandatory',
            'necessary', 'required to', 'required for', 'required skill',
            'minimum requirement', 'minimum qualification', 'you must',
            'required qualification', 'required experience', 'required skill',
            'strong requirement', 'critical', 'crucial', 'non-negotiable',
            'at minimum', 'is required', 'are required', 'demonstrated',
            'proven experience', 'hands-on experience', 'proficiency in',
            'proficiency with', 'expert knowledge', 'expertise in', 'expertise with',
            'strong knowledge', 'deep knowledge', 'advanced knowledge',
            'solid understanding', 'extensive experience', 'highly skilled',
            'solid experience', 'strong experience', 'required proficiency'
        ];

        // Nice to Have signals — words/phrases that indicate preferences
        var niceSignals = [
            'preferred', 'nice to have', 'bonus', 'advantageous', 'desirable',
            'plus', 'added advantage', 'preferred qualification', 'would be a plus',
            'nice-to-have', 'good to have', 'asset', 'beneficial', 'advantage',
            'if you have', 'familiarity with', 'awareness of', 'knowledge of',
            'understanding of', 'exposure to', 'interest in', 'appreciation of',
            'ideally', 'ideally you', 'ideally have'
        ];

        // Build a sliding window approach — for each skill, check the surrounding context
        // Window = 120 characters before and after the skill mention
        var WINDOW = 120;

        // Find positions of each skill in the text
        var skillPositions = {};
        for (var i = 0; i < skills.length; i++) {
            var skill = skills[i];
            var skillLower = skill.toLowerCase();
            // Find ALL positions of this skill in the text
            var positions = [];
            var searchFrom = 0;
            while (true) {
                var idx = lower.indexOf(skillLower, searchFrom);
                if (idx === -1) break;
                positions.push(idx);
                searchFrom = idx + skillLower.length;
            }
            // If no direct match (alias might differ), just use middle of text
            if (positions.length === 0) {
                positions.push(Math.floor(textLen / 2));
            }
            skillPositions[skill] = positions;
        }

        var mustHave = [];
        var niceToHave = [];

        for (var s = 0; s < skills.length; s++) {
            var sk = skills[s];
            var positions = skillPositions[sk];
            var score = 0; // positive = must have tendency, negative = nice to have

            for (var p = 0; p < positions.length; p++) {
                var pos = positions[p];

                // Extract context window around this mention
                var ctxStart = Math.max(0, pos - WINDOW);
                var ctxEnd = Math.min(textLen, pos + WINDOW + sk.length);
                var context = lower.substring(ctxStart, ctxEnd);

                // Check Must Have signals
                for (var m = 0; m < mustSignals.length; m++) {
                    if (context.indexOf(mustSignals[m]) !== -1) {
                        score += 2;
                        break;
                    }
                }

                // Check Nice to Have signals
                for (var n = 0; n < niceSignals.length; n++) {
                    if (context.indexOf(niceSignals[n]) !== -1) {
                        score -= 2;
                        break;
                    }
                }

                // Position bonus: skills mentioned in the first 30% of JD are more likely critical
                var relativePos = pos / textLen;
                if (relativePos < 0.3) score += 1;

                // Frequency bonus: mentioned multiple times = likely important
                if (positions.length >= 3) score += 1;
            }

            if (score > 0) {
                mustHave.push(sk);
            } else {
                niceToHave.push(sk);
            }
        }

        return { mustHave: mustHave, niceToHave: niceToHave };
    }

    // =============================================
    // FEATURE 12: DUPLICATE & ALIAS MERGING (v1)
    // Builds a reverse alias map from JD_TECHNICAL_SKILLS
    // to detect when multiple extraction results are
    // aliases of the same underlying skill.
    // Keeps only the most descriptive/standard name.
    // =============================================

    function deduplicateExtractedSkills(skills) {
        if (!skills || skills.length <= 1) return skills;

        // Build reverse map: alias -> primary skill name
        var aliasToPrimary = {};
        for (var skill in JD_TECHNICAL_SKILLS) {
            var aliases = JD_TECHNICAL_SKILLS[skill];
            for (var a = 0; a < aliases.length; a++) {
                aliasToPrimary[aliases[a].toLowerCase()] = skill;
            }
        }

        // Normalize a skill name for comparison: strip dots, slashes, trailing js/ts/etc.
        function normalizeSkill(s) {
            return s.toLowerCase()
                .replace(/[\.\-]/g, '')
                .replace(/\s+(js|ts|css|html|api|sql|db|ui|ux|ai|ml|hr|crm|erp|saas|paas|iaas|nosql)$/i, '')
                .replace(/\s+/g, '')
                .trim();
        }

        var seen = {};
        var deduped = [];
        var normalizedSeen = {};

        for (var i = 0; i < skills.length; i++) {
            var sk = skills[i];
            var skLower = sk.toLowerCase();

            if (seen[skLower]) continue;

            // Check if this skill IS an alias of another skill already in results
            var primary = aliasToPrimary[skLower];
            if (primary && primary.toLowerCase() !== skLower) {
                // This skill is an alias — skip it, the primary was already added
                seen[skLower] = true;
                continue;
            }

            // Also check if this skill's aliases match any already-seen skill
            var aliases = JD_TECHNICAL_SKILLS[sk];
            if (aliases) {
                var skip = false;
                for (var j = 0; j < aliases.length; j++) {
                    if (seen[aliases[j].toLowerCase()]) {
                        skip = true;
                        break;
                    }
                }
                if (skip) { seen[skLower] = true; continue; }
            }

            // Normalized check: catch variations like "react.js" vs "react" vs "reactjs"
            // that may not be in the alias map
            var normalized = normalizeSkill(sk);
            if (normalized && normalized.length >= 3) {
                if (normalizedSeen[normalized]) {
                    seen[skLower] = true;
                    continue;
                }
                normalizedSeen[normalized] = true;
            }

            seen[skLower] = true;
            deduped.push(sk);
        }

        return deduped;
    }

    // =============================================
    // FEATURE 13: SMART EXTRACTION UI OVERRIDE (v1)
    // Overrides window.parseJobDescription to use
    // categorization + deduplication, and renders
    // visually distinct tags for Must Have vs Nice to Have.
    // =============================================

    if (typeof window.parseJobDescription === 'function') {
        var _origParseJD = window.parseJobDescription;
        window.parseJobDescription = function() {
            var jdInput = document.getElementById('jd-input');
            if (!jdInput) return;
            var text = jdInput.value;
            var lowerText = text.toLowerCase();
            var originalText = text; // preserve original case for context analysis

            var found = [];

            // Use PheinEngine for intelligent skill extraction
            if (typeof PheinEngine !== 'undefined' && PheinEngine.extractSkillsFromJD) {
                found = PheinEngine.extractSkillsFromJD(lowerText);
            } else {
                // Fallback: simple list (should never fire since engine always loads)
                var commonSkills = ['javascript','python','java','accounting','cpa','excel','management','marketing','sales','hr','recruitment','sap','quickbooks','tax','audit','finance','communication','leadership','react','node','sql','photoshop','writing','degree','diploma','certificate','bachelor','masters','mba','phd'];
                found = commonSkills.filter(function(skill) { return lowerText.indexOf(skill) !== -1; });
            }

            // Step 1: Deduplicate aliases
            found = deduplicateExtractedSkills(found);

            // Play ting sound when skills are extracted
            if (window.pheinSoundsEnabled !== false && typeof PheinEngine !== 'undefined' && PheinEngine.playTing) {
                PheinEngine.playTing();
            }

            var container = document.getElementById('suggestion-container');
            container.innerHTML = '';

            if (found.length === 0) {
                container.innerHTML = '<span style="font-size:0.8rem;color:var(--text-muted)">None detected.</span>';
                return;
            }

            // Step 2: Categorize skills using context analysis
            var categorized = categorizeExtractedSkills(found, originalText);

            // Step 3: Render grouped by category
            var mustSkills = categorized.mustHave;
            var niceSkills = categorized.niceToHave;

            if (mustSkills.length > 0) {
                var mustLabel = document.createElement('div');
                mustLabel.className = 'suggestion-label must-label';
                mustLabel.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> Core Competency Suggestions';
                container.appendChild(mustLabel);

                for (var m = 0; m < mustSkills.length; m++) {
                    var mTag = document.createElement('span');
                    mTag.className = 'suggestion-tag must-suggest';
                    mTag.textContent = mustSkills[m];
                    (function(skill) {
                        mTag.onclick = function() {
                            if (!state.criteria.mustHave.includes(skill)) {
                                state.criteria.mustHave.push(skill);
                                renderKeywords();
                            }
                        };
                    })(mustSkills[m]);
                    container.appendChild(mTag);
                }
            }

            if (niceSkills.length > 0) {
                var niceLabel = document.createElement('div');
                niceLabel.className = 'suggestion-label nice-label';
                niceLabel.style.marginTop = mustSkills.length > 0 ? '0.6rem' : '0';
                niceLabel.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg> Additional Skill Suggestions';
                container.appendChild(niceLabel);

                for (var n = 0; n < niceSkills.length; n++) {
                    var nTag = document.createElement('span');
                    nTag.className = 'suggestion-tag nice-suggest';
                    nTag.textContent = niceSkills[n];
                    (function(skill) {
                        nTag.onclick = function() {
                            if (!state.criteria.niceToHave.includes(skill)) {
                                state.criteria.niceToHave.push(skill);
                                renderKeywords();
                            }
                        };
                    })(niceSkills[n]);
                    container.appendChild(nTag);
                }
            }

            // If everything went to one category, it still works — just shows one section
        };
    }

    // =============================================
    // FEATURE 10: NaN GUARD FOR SCORES
    // =============================================
    // Hook into renderResults to guard against NaN scores
    var _origRenderResults2 = window.renderResults;
    // Already hooked above, so just patch the original in index.html
    // The NaN guard is applied in the original renderResults via the safeScore variable

    // =============================================
    // INIT
    // =============================================
    updateScreeningToggles();
    console.log('Phein Features Module v8.3 loaded — Precision JD Extraction v3 + Smart Categorization v1 + Alias Dedup v1');

})();
