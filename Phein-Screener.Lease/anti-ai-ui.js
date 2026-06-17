/**
 * ============================================
 * AI DETECTION LENS — UI Layer
 * ============================================
 * Handles all UI components:
 *   - Toggle at Screening Option #2
 *   - Agreement popup (same pattern as age toggle)
 *   - AI Detection tag on candidate rankings
 *   - Detailed analysis popup with:
 *     - Animated probability gauge
 *     - 7-axis radar chart (SVG)
 *     - Section heatmap bars
 *     - Signal trigger cards
 *     - Evidence highlights
 *     - Interview suggestion box
 *     - Cancel + Close buttons
 *   - Disclaimer footer
 * ============================================
 * MortApps Studios | Phein Screener v8.0
 * ============================================
 */

(function() {
    'use strict';

    var state = window.state || {};

    // =============================================
    // CONFIGURATION
    // =============================================
    var BAND_CONFIG = {
        'low': {
            label: 'Low AI Probability',
            color: '#10b981',
            bg: '#ecfdf5',
            border: '#a7f3d0',
            darkBg: 'rgba(16,185,129,0.12)',
            darkBorder: 'rgba(52,211,153,0.3)',
            darkColor: '#34d399'
        },
        'moderate': {
            label: 'Moderate AI Probability',
            color: '#f59e0b',
            bg: '#fffbeb',
            border: '#fde68a',
            darkBg: 'rgba(245,158,11,0.12)',
            darkBorder: 'rgba(251,191,36,0.3)',
            darkColor: '#fbbf24'
        },
        'elevated': {
            label: 'Elevated AI Probability',
            color: '#ea580c',
            bg: '#fff7ed',
            border: '#fed7aa',
            darkBg: 'rgba(234,88,12,0.12)',
            darkBorder: 'rgba(251,146,60,0.3)',
            darkColor: '#fb923c'
        },
        'high': {
            label: 'High AI Probability',
            color: '#dc2626',
            bg: '#fef2f2',
            border: '#fecaca',
            darkBg: 'rgba(220,38,38,0.12)',
            darkBorder: 'rgba(248,113,113,0.3)',
            darkColor: '#f87171'
        }
    };

    var SIGNAL_LABELS = {
        vba: { name: 'Vocabulary Bias', shortName: 'VBA', desc: 'Measures overuse of known AI-favored words and phrases' },
        sba: { name: 'Sentence Burstiness', shortName: 'SBA', desc: 'Analyzes variation in sentence length patterns' },
        scs: { name: 'Specificity Score', shortName: 'SCS', desc: 'Evaluates concreteness of achievements and details' },
        sud: { name: 'Structural Uniformity', shortName: 'SUD', desc: 'Detects cookie-cutter paragraph and bullet structures' },
        tcd: { name: 'Transition Density', shortName: 'TCD', desc: 'Measures density of formal connector words' },
        rpd: { name: 'Pattern Repetition', shortName: 'RPD', desc: 'Identifies repetitive grammatical patterns' },
        hla: { name: 'Hedging Absence', shortName: 'HLA', desc: 'Detects lack of natural uncertainty language' }
    };

    var SECTION_LABELS = {
        experience: { name: 'Experience', weight: '40%' },
        summary: { name: 'Summary', weight: '20%' },
        cover_letter: { name: 'Cover Letter', weight: '20%' },
        education: { name: 'Education', weight: '15%' },
        skills: { name: 'Skills', weight: '5%' }
    };

    // =============================================
    // TOGGLE HANDLER (same pattern as age toggle)
    // =============================================
    window.handleAIDetectionToggleClick = function(checkbox) {
        if (checkbox.checked) {
            checkbox.checked = false;
            document.getElementById('ai-detection-consent-popup').classList.add('show');
        } else {
            if (typeof toggleScreeningOption === 'function') toggleScreeningOption('ai_detection');
        }
    };

    window.agreeAIDetectionToggle = function() {
        var cb = document.getElementById('ai-detection-toggle');
        cb.checked = true;
        if (typeof toggleScreeningOption === 'function') toggleScreeningOption('ai_detection');
        document.getElementById('ai-detection-consent-popup').classList.remove('show');
    };

    window.cancelAIDetectionToggle = function() {
        document.getElementById('ai-detection-consent-popup').classList.remove('show');
    };

    // =============================================
    // HOOK INTO RENDER RESULTS
    // Adds AI Detection tags to candidate cards
    // =============================================
    function getAIDetectionKey(c) {
        return (c.candidateKey || c.name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15)) + '_aidet';
    }

    var CLASSIFICATION = {
        'low':      { label: 'Not AI Generated',     color: '#10b981', bg: '#dcfce7', border: '#bbf7d0', darkBg: 'rgba(16,185,129,0.12)', darkBorder: 'rgba(52,211,153,0.3)', darkColor: '#34d399' },
        'moderate': { label: 'Possibly AI Assisted',  color: '#b45309', bg: '#fef3c7', border: '#fde68a', darkBg: 'rgba(245,158,11,0.12)',  darkBorder: 'rgba(251,191,36,0.3)', darkColor: '#fbbf24' },
        'elevated': { label: 'Likely AI Generated', color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', darkBg: 'rgba(234,88,12,0.12)',  darkBorder: 'rgba(251,146,60,0.3)', darkColor: '#fb923c' },
        'high':     { label: 'AI Generated',          color: '#dc2626', bg: '#fee2e2', border: '#fecaca', darkBg: 'rgba(220,38,38,0.12)', darkBorder: 'rgba(248,113,113,0.3)', darkColor: '#f87171' }
    };

    function renderAIDetectionTag(candidateKey, candidateName, cvText) {
        if (!state.screeningOptions.ai_detection) return '';
        if (!cvText || cvText.length < 50) return '';

        var result = AIDetectionEngine.analyzeForAI(cvText);
        var bandCfg = BAND_CONFIG[result.band];
        var classCfg = CLASSIFICATION[result.band];
        var isDark = document.documentElement.classList.contains('dark');
        var bgColor = isDark ? bandCfg.darkBg : bandCfg.bg;
        var borderColor = isDark ? bandCfg.darkBorder : bandCfg.border;
        var textColor = isDark ? bandCfg.darkColor : bandCfg.color;
        var classBg = isDark ? classCfg.darkBg : classCfg.bg;
        var classBorder = isDark ? classCfg.darkBorder : classCfg.border;
        var classColor = isDark ? classCfg.darkColor : classCfg.color;

        // Store result for popup
        var storageKey = getAIDetectionKey({ name: candidateName, candidateKey: candidateKey });
        state['_aiResult_' + storageKey] = result;
        state['_aiText_' + storageKey] = cvText;

        return '<div style="margin-top:0.35rem;display:flex;align-items:center;gap:0.4rem;">' +
            '<span onclick="openAIDetectionPopup(\'' + storageKey + '\', \'' + escapeHtmlAttr(candidateName) + '\')" ' +
            'style="cursor:pointer;display:inline-flex;align-items:center;gap:0.3rem;padding:3px 10px;border-radius:6px;font-size:0.72rem;font-weight:700;' +
            'background:' + bgColor + ';color:' + textColor + ';border:1px solid ' + borderColor + ';transition:all 0.2s;" ' +
            'onmouseover="this.style.transform=\'translateY(-1px)\';this.style.boxShadow=\'0 2px 8px rgba(0,0,0,0.1)\'" ' +
            'onmouseout="this.style.transform=\'none\';this.style.boxShadow=\'none\'" ' +
            'title="Click for detailed AI Detection analysis">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="' + textColor + '" stroke-width="2" style="width:12px;height:12px;flex-shrink:0;">' +
            '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>' +
            '<line x1="8" y1="11" x2="14" y2="11"/></svg>' +
            'AI Detection: ' + result.overallScore + '%' +
            '</span>' +
            '<span style="display:inline-flex;align-items:center;padding:1px 7px;border-radius:10px;font-size:0.6rem;font-weight:600;' +
            'background:' + classBg + ';color:' + classColor + ';border:1px solid ' + classBorder + ';white-space:nowrap;">' +
            classCfg.label +
            '</span></div>';
    }

    function escapeHtmlAttr(text) {
        return text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    }

    // =============================================
    // AI DETECTION DETAIL POPUP
    // =============================================
    window.openAIDetectionPopup = function(storageKey, candidateName) {
        var result = state['_aiResult_' + storageKey];
        if (!result) return;

        var isDark = document.documentElement.classList.contains('dark');
        var bandCfg = BAND_CONFIG[result.band];
        var cardBg = isDark ? '#1e293b' : '#ffffff';
        var textMain = isDark ? '#f1f5f9' : '#0f172a';
        var textMuted = isDark ? '#94a3b8' : '#64748b';
        var dividerColor = isDark ? '#334155' : '#e2e8f0';

        var popupId = 'ai-detection-detail-popup';
        var existing = document.getElementById(popupId);
        if (existing) existing.remove();

        var overlay = document.createElement('div');
        overlay.id = popupId;
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);z-index:8000;display:flex;justify-content:center;align-items:center;padding:1.5rem;overflow-y:auto;';

        var innerHtml = '<div style="background:' + cardBg + ';border-radius:18px;width:100%;max-width:640px;max-height:calc(100vh - 3rem);box-shadow:0 25px 60px rgba(0,0,0,0.35);border:1px solid ' + dividerColor + ';animation:modalSlideIn 0.3s ease-out;overflow:hidden;display:flex;flex-direction:column;">';

        // === HEADER ===
        innerHtml += '<div style="padding:1.25rem 1.5rem;border-bottom:2px solid ' + dividerColor + ';flex-shrink:0;display:flex;justify-content:space-between;align-items:center;">' +
            '<div style="display:flex;align-items:center;gap:0.75rem;">' +
            '<div style="width:42px;height:42px;border-radius:12px;background:' + (isDark ? bandCfg.darkBg : bandCfg.bg) + ';border:2px solid ' + (isDark ? bandCfg.darkBorder : bandCfg.border) + ';display:flex;align-items:center;justify-content:center;">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="' + (isDark ? bandCfg.darkColor : bandCfg.color) + '" stroke-width="2" style="width:22px;height:22px;">' +
            '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
            '</div>' +
            '<div><div style="font-size:1.1rem;font-weight:700;color:' + textMain + ';">AI Detection Lens</div>' +
            '<div style="font-size:0.78rem;color:' + textMuted + ';">Analysis for: <strong style="color:' + textMain + ';">' + escapeHtml(candidateName) + '</strong></div></div>' +
            '</div>' +
            '<div style="display:flex;gap:0.5rem;">' +
            '<button onclick="document.getElementById(\'' + popupId + '\').remove()" style="width:32px;height:32px;border-radius:8px;border:1px solid ' + dividerColor + ';background:' + (isDark ? '#334155' : '#f1f5f9') + ';cursor:pointer;color:' + textMuted + ';display:flex;align-items:center;justify-content:center;transition:all 0.2s;" onmouseover="this.style.background=\'' + (isDark ? '#475569' : '#e2e8f0') + '\'" onmouseout="this.style.background=\'' + (isDark ? '#334155' : '#f1f5f9') + '\'">X</button>' +
            '</div></div>';

        // === SCROLLABLE BODY ===
        innerHtml += '<div style="padding:1.25rem 1.5rem;overflow-y:auto;flex:1;">';

        // --- 1. PROBABILITY GAUGE (SVG) ---
        innerHtml += buildGaugeSVG(result.overallScore, bandCfg, isDark);

        // --- 2. SECTION HEATMAP ---
        if (result.sectionScores && Object.keys(result.sectionScores).length > 1) {
            innerHtml += buildSectionHeatmap(result.sectionScores, isDark, textMuted, dividerColor);
        }

        // --- 3. RADAR CHART (SVG) ---
        innerHtml += buildRadarChart(result.signals, isDark);

        // --- 4. SIGNAL TRIGGER CARDS ---
        innerHtml += buildSignalCards(result.signals, result.triggeredFlags, isDark, textMain, textMuted, dividerColor);

        // --- 5. EVIDENCE HIGHLIGHTS ---
        if (result.evidence && result.evidence.length > 0) {
            innerHtml += buildEvidenceHighlights(result.evidence, isDark, textMuted);
        }

        // --- 6. INTERVIEW SUGGESTIONS ---
        if (result.interviewSuggestions && result.interviewSuggestions.length > 0) {
            innerHtml += buildInterviewSuggestions(result.interviewSuggestions, isDark, textMuted, dividerColor);
        }

        // --- 7. DISCLAIMER ---
        innerHtml += '<div style="margin-top:1rem;padding:0.75rem;border-radius:8px;background:' + (isDark ? 'rgba(100,116,139,0.08)' : '#f8fafc') + ';border:1px solid ' + dividerColor + ';font-size:0.72rem;color:' + textMuted + ';line-height:1.5;text-align:center;">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="' + textMuted + '" stroke-width="1.5" style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-right:0.3rem;">' +
            '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
            'AI Detection analyzes statistical patterns in document structure and vocabulary. Results indicate probability, not certainty. Always verify through direct assessment during the interview process.' +
            '</div>';

        innerHtml += '</div>'; // end body

        // === FOOTER BUTTONS ===
        innerHtml += '<div style="padding:1rem 1.5rem;border-top:1px solid ' + dividerColor + ';background:' + (isDark ? 'rgba(15,23,42,0.5)' : '#f8fafc') + ';display:flex;gap:0.75rem;justify-content:flex-end;flex-shrink:0;">' +
            '<button onclick="document.getElementById(\'' + popupId + '\').remove()" style="padding:0.6rem 1.5rem;border-radius:8px;border:none;background:var(--primary);color:white;font-weight:600;cursor:pointer;font-size:0.88rem;transition:all 0.2s;box-shadow:0 4px 12px rgba(37,99,235,0.3);" onmouseover="this.style.background=\'var(--primary-dark)\'" onmouseout="this.style.background=\'var(--primary)\'">Close</button>' +
            '</div>';

        innerHtml += '</div>'; // end card
        overlay.innerHTML = innerHtml;

        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
        document.body.appendChild(overlay);
    };

    // =============================================
    // BUILD: PROBABILITY GAUGE SVG
    // =============================================
    function buildGaugeSVG(score, bandCfg, isDark) {
        var textMuted = isDark ? '#94a3b8' : '#64748b';
        var textMain = isDark ? '#f1f5f9' : '#0f172a';
        var trackColor = isDark ? '#334155' : '#e2e8f0';
        var bgColor = isDark ? '#1e293b' : '#ffffff';

        // Gauge arc from -135deg to +135deg (270deg sweep)
        var radius = 70;
        var cx = 100, cy = 85;
        var circumference = 2 * Math.PI * radius;
        var arcLength = circumference * (270 / 360);
        var dashOffset = arcLength - (arcLength * (score / 100));

        // Gradient color stops based on score
        var fillColor;
        if (score <= 24) fillColor = '#10b981';
        else if (score <= 49) fillColor = '#f59e0b';
        else if (score <= 74) fillColor = '#ea580c';
        else fillColor = '#dc2626';

        var html = '<div style="text-align:center;margin-bottom:1.25rem;padding:0.75rem;border-radius:12px;background:' + (isDark ? 'rgba(0,0,0,0.15)' : '#f8fafc') + ';">';

        html += '<svg viewBox="0 0 200 115" style="width:200px;height:115px;display:block;margin:0 auto;">';

        // Background arc
        html += '<circle cx="' + cx + '" cy="' + cy + '" r="' + radius + '" fill="none" stroke="' + trackColor + '" stroke-width="14" stroke-linecap="round" ' +
            'stroke-dasharray="' + arcLength + '" stroke-dashoffset="0" ' +
            'transform="rotate(135 ' + cx + ' ' + cy + ')"/>';

        // Score arc (animated)
        html += '<circle cx="' + cx + '" cy="' + cy + '" r="' + radius + '" fill="none" stroke="' + fillColor + '" stroke-width="14" stroke-linecap="round" ' +
            'stroke-dasharray="' + arcLength + '" stroke-dashoffset="' + dashOffset + '" ' +
            'transform="rotate(135 ' + cx + ' ' + cy + ')" style="transition:stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1);">';

        html += '</circle>';

        // Center text
        html += '<text x="' + cx + '" y="' + (cy - 8) + '" text-anchor="middle" fill="' + textMain + '" font-size="32" font-weight="800">' + score + '%</text>';
        html += '<text x="' + cx + '" y="' + (cy + 14) + '" text-anchor="middle" fill="' + fillColor + '" stroke="rgba(0,0,0,0.5)" stroke-width="0.5" stroke-linejoin="round" paint-order="stroke fill" font-size="11" font-weight="700">' + bandCfg.label.toUpperCase() + '</text>';

        // Scale labels
        html += '<text x="22" y="105" text-anchor="middle" fill="' + textMuted + '" font-size="8">0</text>';
        html += '<text x="178" y="105" text-anchor="middle" fill="' + textMuted + '" font-size="8">100</text>';

        html += '</svg>';
        html += '</div>';

        return html;
    }

    // =============================================
    // BUILD: SECTION HEATMAP
    // =============================================
    function buildSectionHeatmap(sectionScores, isDark, textMuted, dividerColor) {
        var html = '<div style="margin-bottom:1.25rem;">';
        html += '<div style="font-size:0.85rem;font-weight:700;color:var(--text-main);margin-bottom:0.6rem;display:flex;align-items:center;gap:0.4rem;">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" style="width:16px;height:16px;"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>' +
            'Section Breakdown</div>';

        for (var sec in sectionScores) {
            var secCfg = SECTION_LABELS[sec];
            if (!secCfg) continue;
            var secScore = sectionScores[sec];
            var barColor = secScore <= 24 ? '#10b981' : secScore <= 49 ? '#f59e0b' : secScore <= 74 ? '#ea580c' : '#dc2626';
            var barBg = isDark ? '#334155' : '#e2e8f0';

            html += '<div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.4rem;">' +
                '<span style="font-size:0.75rem;color:' + textMuted + ';width:90px;flex-shrink:0;">' + secCfg.name + ' <span style="opacity:0.6;font-size:0.65rem;">(' + secCfg.weight + ')</span></span>' +
                '<div style="flex:1;height:10px;background:' + barBg + ';border-radius:5px;overflow:hidden;">' +
                '<div style="width:' + secScore + '%;height:100%;background:' + barColor + ';border-radius:5px;transition:width 0.6s;"></div>' +
                '</div>' +
                '<span style="font-size:0.72rem;font-weight:700;color:' + barColor + ';width:32px;text-align:right;">' + secScore + '%</span>' +
                '</div>';
        }

        html += '</div>';
        return html;
    }

    // =============================================
    // BUILD: RADAR CHART SVG
    // =============================================
    function buildRadarChart(signals, isDark) {
        var signalKeys = ['vba', 'sba', 'scs', 'sud', 'tcd', 'rpd', 'hla'];
        var n = signalKeys.length;
        var cx = 140, cy = 120, maxR = 90;

        var textMuted = isDark ? '#94a3b8' : '#64748b';
        var gridColor = isDark ? 'rgba(100,116,139,0.15)' : '#e2e8f0';
        var axisColor = isDark ? 'rgba(100,116,139,0.25)' : '#cbd5e1';

        var html = '<div style="margin-bottom:1.25rem;text-align:center;">';
        html += '<div style="font-size:0.85rem;font-weight:700;color:var(--text-main);margin-bottom:0.6rem;display:flex;align-items:center;justify-content:center;gap:0.4rem;">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" style="width:16px;height:16px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' +
            'Signal Analysis</div>';

        html += '<svg viewBox="0 0 280 260" style="width:280px;height:260px;display:block;margin:0 auto;">';

        // Grid circles (20%, 40%, 60%, 80%, 100%)
        for (var ring = 1; ring <= 5; ring++) {
            var r = maxR * (ring / 5);
            html += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + gridColor + '" stroke-width="1"/>';
        }

        // Axes + labels
        for (var ai = 0; ai < n; ai++) {
            var angle = (2 * Math.PI * ai / n) - (Math.PI / 2);
            var x = cx + maxR * Math.cos(angle);
            var y = cy + maxR * Math.sin(angle);

            html += '<line x1="' + cx + '" y1="' + cy + '" x2="' + x + '" y2="' + y + '" stroke="' + axisColor + '" stroke-width="1"/>';

            // Label
            var labelR = maxR + 22;
            var lx = cx + labelR * Math.cos(angle);
            var ly = cy + labelR * Math.sin(angle);
            var sigLabel = SIGNAL_LABELS[signalKeys[ai]];
            html += '<text x="' + lx + '" y="' + (ly + 4) + '" text-anchor="middle" fill="' + textMuted + '" font-size="9" font-weight="600">' + (sigLabel ? sigLabel.shortName : signalKeys[ai]) + '</text>';
        }

        // Data polygon
        var points = [];
        for (var di = 0; di < n; di++) {
            var da = (2 * Math.PI * di / n) - (Math.PI / 2);
            var val = (signals[signalKeys[di]] || 0) / 100;
            var dr = maxR * Math.max(0.05, val);
            points.push((cx + dr * Math.cos(da)).toFixed(1) + ',' + (cy + dr * Math.sin(da)).toFixed(1));
        }
        html += '<polygon points="' + points.join(' ') + '" fill="rgba(37,99,235,0.15)" stroke="#3b82f6" stroke-width="2"/>';

        // Data points
        for (var pi = 0; pi < n; pi++) {
            var pa = (2 * Math.PI * pi / n) - (Math.PI / 2);
            var pv = (signals[signalKeys[pi]] || 0) / 100;
            var pr = maxR * Math.max(0.05, pv);
            var px = cx + pr * Math.cos(pa);
            var py = cy + pr * Math.sin(pa);
            var dotColor = pv >= 0.6 ? '#dc2626' : pv >= 0.4 ? '#f59e0b' : '#10b981';
            html += '<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="4" fill="' + dotColor + '" stroke="white" stroke-width="1.5"/>';
        }

        html += '</svg></div>';
        return html;
    }

    // =============================================
    // BUILD: SIGNAL TRIGGER CARDS
    // =============================================
    function buildSignalCards(signals, triggeredFlags, isDark, textMain, textMuted, dividerColor) {
        var html = '<div style="margin-bottom:1.25rem;">';
        html += '<div style="font-size:0.85rem;font-weight:700;color:' + textMain + ';margin-bottom:0.6rem;display:flex;align-items:center;gap:0.4rem;">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" style="width:16px;height:16px;"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>' +
            'Detection Signals</div>';

        var signalKeys = ['vba', 'sba', 'scs', 'sud', 'tcd', 'rpd', 'hla'];
        var gridStyle = 'display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;';

        html += '<div style="' + gridStyle + '">';
        for (var si = 0; si < signalKeys.length; si++) {
            var key = signalKeys[si];
            var val = signals[key] || 0;
            var label = SIGNAL_LABELS[key];
            var barColor = val >= 60 ? '#dc2626' : val >= 40 ? '#f59e0b' : '#10b981';
            var barBg = isDark ? '#334155' : '#e2e8f0';
            var cardBg = isDark ? 'rgba(0,0,0,0.12)' : '#f8fafc';

            html += '<div style="padding:0.6rem;border-radius:8px;background:' + cardBg + ';border:1px solid ' + dividerColor + ';">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.3rem;">' +
                '<span style="font-size:0.75rem;font-weight:700;color:' + textMain + ';">' + label.name + '</span>' +
                '<span style="font-size:0.72rem;font-weight:800;color:' + barColor + ';">' + val + '%</span>' +
                '</div>' +
                '<div style="height:4px;background:' + barBg + ';border-radius:2px;overflow:hidden;">' +
                '<div style="width:' + val + '%;height:100%;background:' + barColor + ';border-radius:2px;"></div>' +
                '</div>' +
                '<div style="font-size:0.65rem;color:' + textMuted + ';margin-top:0.25rem;line-height:1.3;">' + label.desc + '</div>' +
                '</div>';
        }
        html += '</div>';

        // Triggered flags summary
        if (triggeredFlags && triggeredFlags.length > 0) {
            html += '<div style="margin-top:0.75rem;padding:0.6rem 0.75rem;border-radius:8px;background:' + (isDark ? 'rgba(239,68,68,0.06)' : '#fef2f2') + ';border:1px solid ' + (isDark ? 'rgba(239,68,68,0.15)' : '#fecaca') + ';">';
            html += '<div style="font-size:0.72rem;font-weight:700;color:#dc2626;margin-bottom:0.35rem;">Triggered Indicators</div>';
            for (var fi = 0; fi < triggeredFlags.length; fi++) {
                html += '<div style="font-size:0.73rem;color:' + (isDark ? '#fca5a5' : '#991b1b') + ';padding:0.15rem 0;display:flex;align-items:center;gap:0.3rem;">' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" style="width:11px;height:11px;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' +
                    escapeHtml(triggeredFlags[fi]) + '</div>';
            }
            html += '</div>';
        }

        html += '</div>';
        return html;
    }

    // =============================================
    // BUILD: EVIDENCE HIGHLIGHTS
    // =============================================
    function buildEvidenceHighlights(evidence, isDark, textMuted) {
        var html = '<div style="margin-bottom:1.25rem;">';
        html += '<div style="font-size:0.85rem;font-weight:700;color:var(--text-main);margin-bottom:0.6rem;display:flex;align-items:center;gap:0.4rem;">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" style="width:16px;height:16px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
            'Evidence</div>';

        // Group by tier
        var tier1Evidence = evidence.filter(function(e) { return e.tier === 1; });
        var tier2Evidence = evidence.filter(function(e) { return e.tier === 2; });

        if (tier1Evidence.length > 0) {
            html += '<div style="margin-bottom:0.5rem;">';
            html += '<div style="font-size:0.7rem;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.25rem;">AI Signature Vocabulary</div>';
            for (var t1 = 0; t1 < tier1Evidence.slice(0, 5).length; t1++) {
                var e1 = tier1Evidence[t1];
                var highlightedCtx = e1.context.replace(new RegExp('\\b' + e1.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi'),
                    '<strong style="color:#dc2626;text-decoration:underline;">$&</strong>');
                html += '<div style="font-size:0.73rem;color:' + textMuted + ';padding:0.25rem 0.5rem;margin-bottom:0.2rem;border-radius:4px;background:' + (isDark ? 'rgba(220,38,38,0.06)' : '#fef2f2') + ';border-left:3px solid #dc2626;line-height:1.4;">...' + highlightedCtx + '...</div>';
            }
            html += '</div>';
        }

        if (tier2Evidence.length > 0) {
            html += '<div>';
            html += '<div style="font-size:0.7rem;font-weight:700;color:#f59e0b;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.25rem;">Corporate Buzzword Overuse</div>';
            for (var t2 = 0; t2 < tier2Evidence.slice(0, 4).length; t2++) {
                var e2 = tier2Evidence[t2];
                var hlCtx2 = e2.context.replace(new RegExp('\\b' + e2.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi'),
                    '<strong style="color:#f59e0b;text-decoration:underline;">$&</strong>');
                html += '<div style="font-size:0.73rem;color:' + textMuted + ';padding:0.25rem 0.5rem;margin-bottom:0.2rem;border-radius:4px;background:' + (isDark ? 'rgba(245,158,11,0.06)' : '#fffbeb') + ';border-left:3px solid #f59e0b;line-height:1.4;">...' + hlCtx2 + '...</div>';
            }
            html += '</div>';
        }

        html += '</div>';
        return html;
    }

    // =============================================
    // BUILD: INTERVIEW SUGGESTIONS
    // =============================================
    function buildInterviewSuggestions(suggestions, isDark, textMuted, dividerColor) {
        var html = '<div style="margin-bottom:0.5rem;">';
        html += '<div style="font-size:0.85rem;font-weight:700;color:var(--text-main);margin-bottom:0.6rem;display:flex;align-items:center;gap:0.4rem;">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2" style="width:16px;height:16px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
            'Recommended Interview Approach</div>';

        html += '<div style="padding:0.75rem;border-radius:10px;background:' + (isDark ? 'rgba(124,58,237,0.06)' : '#faf5ff') + ';border:1px solid ' + (isDark ? 'rgba(124,58,237,0.15)' : '#e9d5ff') + ';">';

        for (var i = 0; i < suggestions.length; i++) {
            html += '<div style="font-size:0.78rem;color:' + (isDark ? '#c4b5fd' : '#6b21a8') + ';padding:0.3rem 0;display:flex;gap:0.4rem;line-height:1.5;">' +
                '<span style="flex-shrink:0;font-weight:700;color:#7c3aed;">Q' + (i + 1) + ':</span>' +
                '<span>' + escapeHtml(suggestions[i]) + '</span>' +
                '</div>';
        }

        html += '</div></div>';
        return html;
    }

    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // =============================================
    // HOOK INTO RENDER RESULTS
    // =============================================
    var _origRenderResults = window.renderResults;

    window.renderResults = function(candidates) {
        _origRenderResults(candidates);

        var cards = document.querySelectorAll('.candidate-card');
        cards.forEach(function(card, i) {
            var c = candidates[i];
            if (!c || !c.content) return;
            if (!state.screeningOptions.ai_detection) return;

            var key = (c.candidateKey || c.name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15));
            var tagHtml = renderAIDetectionTag(key, c.name, c.content);
            if (tagHtml) {
                card.insertAdjacentHTML('beforeend', tagHtml);
            }
        });
    };

    // =============================================
    // HOOK INTO CLEAR SESSION
    // =============================================
    var _origConfirmedClearSession = window.confirmedClearSession;
    if (_origConfirmedClearSession) {
        window.confirmedClearSession = function() {
            // Clear AI detection results from state
            for (var key in state) {
                if (key.indexOf('_aiResult_') === 0 || key.indexOf('_aiText_') === 0) {
                    delete state[key];
                }
            }
            state.screeningOptions.ai_detection = false;
            _origConfirmedClearSession();
        };
    }

    // Hook into confirmedClearCandidates to also clear AI detection state
    var _origConfirmedClearCandidates = window.confirmedClearCandidates;
    if (_origConfirmedClearCandidates) {
        window.confirmedClearCandidates = function() {
            // Clear AI detection results from state
            for (var key in state) {
                if (key.indexOf('_aiResult_') === 0 || key.indexOf('_aiText_') === 0) {
                    delete state[key];
                }
            }
            state.screeningOptions.ai_detection = false;
            _origConfirmedClearCandidates();
        };
    }

})();
