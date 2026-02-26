/**
 * Brizerm Markets - Static JavaScript
 * AI Business Intelligence Platform
 * MortApps Studios 2026
 */

// ============================================================================
// LICENSE SYSTEM - v3.0 (Matching Phein Implementation)
// ============================================================================

const API_BASE_URL = 'https://phein-license-server.vercel.app';
const API_TIMEOUT = 10000;
const MAX_OFFLINE_DAYS = 7;

const STORAGE_KEYS = {
    key: 'brizerm_license_key',
    fingerprint: 'brizerm_device_fingerprint',
    company: 'brizerm_company_name',
    lastOnlineCheck: 'brizerm_last_online_check',
    cachedLicense: 'brizerm_cached_license',
    savedPlans: 'brizerm_saved_plans'
};

// ============================================================================
// LICENSE SYSTEM CORE
// ============================================================================

(function() {
    'use strict';

    function generateDeviceFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('fingerprint', 2, 2);
        
        const components = [
            navigator.userAgent,
            navigator.language,
            navigator.hardwareConcurrency || '',
            screen.width + 'x' + screen.height,
            screen.colorDepth || '',
            new Date().getTimezoneOffset(),
            canvas.toDataURL()
        ];
        
        let fingerprint = components.join('|');
        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        return 'DEV-' + Math.abs(hash).toString(36).toUpperCase();
    }

    function getDeviceFingerprint() {
        let fingerprint = localStorage.getItem(STORAGE_KEYS.fingerprint);
        if (!fingerprint) {
            fingerprint = generateDeviceFingerprint();
            localStorage.setItem(STORAGE_KEYS.fingerprint, fingerprint);
        }
        return fingerprint;
    }

    // DOM Elements
    const gate = document.getElementById('install-gate');
    const loadingScreen = document.getElementById('loading-screen');
    const keyInput = document.getElementById('license-key-input');
    const companyInput = document.getElementById('company-name-input');
    const launchBtn = document.getElementById('launch-btn');
    const btnText = document.getElementById('btn-text');
    const errorMsg = document.getElementById('error-msg');
    const infoBox = document.getElementById('license-info-box');
    const tierInfo = document.getElementById('license-tier-info');
    const durationInfo = document.getElementById('license-duration-info');
    const warningBox = document.getElementById('license-warning');
    const termsCheckbox = document.getElementById('terms-checkbox');
    const termsLink = document.getElementById('terms-link');
    const termsModal = document.getElementById('terms-modal');
    const closeTermsBtn = document.getElementById('close-terms-btn');
    const acceptTermsBtn = document.getElementById('accept-terms-btn');

    function dismissLoader() {
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => loadingScreen.style.display = 'none', 400);
        }
    }

    function updateHeaderBadge(licenseInfo) {
        const badge = document.getElementById('header-license-badge');
        if (!badge || !licenseInfo) return;
        
        if (licenseInfo.is_perpetual) {
            badge.textContent = licenseInfo.tier_name;
            badge.classList.remove('expiring', 'expired');
        } else if (licenseInfo.days_remaining !== null) {
            if (licenseInfo.days_remaining <= 0) {
                badge.textContent = 'Expired';
                badge.classList.add('expired');
            } else if (licenseInfo.days_remaining <= 14) {
                badge.textContent = `${licenseInfo.tier_name} - ${licenseInfo.days_remaining}d`;
                badge.classList.add('expiring');
            } else {
                badge.textContent = `${licenseInfo.tier_name} - ${licenseInfo.days_remaining}d`;
                badge.classList.remove('expiring', 'expired');
            }
        } else {
            badge.textContent = licenseInfo.tier_name || 'Licensed';
        }
    }

    function showError(message) {
        errorMsg.textContent = message;
        errorMsg.style.display = 'block';
        keyInput.style.borderColor = '#EF4444';
        keyInput.classList.add('shake');
        setTimeout(() => keyInput.classList.remove('shake'), 500);
    }

    function showSuccess(data) {
        errorMsg.style.display = 'none';
        keyInput.style.borderColor = '#10B981';
        tierInfo.textContent = `Tier: ${data.tier_name}`;
        durationInfo.textContent = data.is_perpetual ? 'Duration: Perpetual' : `Duration: ${data.days_remaining} days remaining`;
        warningBox.textContent = `Licensed to "${data.company}". This key is bound to this device.`;
        infoBox.style.display = 'block';
    }

    function clearLicenseData() {
        localStorage.removeItem(STORAGE_KEYS.key);
        localStorage.removeItem(STORAGE_KEYS.company);
        localStorage.removeItem(STORAGE_KEYS.lastOnlineCheck);
        localStorage.removeItem(STORAGE_KEYS.cachedLicense);
    }

    function getCachedLicense() {
        try {
            const cached = localStorage.getItem(STORAGE_KEYS.cachedLicense);
            return cached ? JSON.parse(cached) : null;
        } catch (e) { return null; }
    }

    function setCachedLicense(license) {
        localStorage.setItem(STORAGE_KEYS.cachedLicense, JSON.stringify(license));
        localStorage.setItem(STORAGE_KEYS.lastOnlineCheck, Date.now().toString());
    }

    function hasBeenOfflineTooLong() {
        const lastCheck = parseInt(localStorage.getItem(STORAGE_KEYS.lastOnlineCheck) || '0');
        return (Date.now() - lastCheck) / (1000 * 60 * 60 * 24) > MAX_OFFLINE_DAYS;
    }

    async function fetchWithTimeout(url, options, timeout) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        try {
            const response = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timeoutId);
            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    async function validateLicense(licenseKey, companyName) {
        try {
            return await fetchWithTimeout(`${API_BASE_URL}/api/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    licenseKey,
                    deviceFingerprint: getDeviceFingerprint(),
                    companyName
                })
            }, API_TIMEOUT);
        } catch (error) {
            return { success: false, error: 'NETWORK_ERROR', message: 'Connection error. Please check your internet.' };
        }
    }

    async function checkLicenseStatus(licenseKey) {
        try {
            return await fetchWithTimeout(`${API_BASE_URL}/api/check`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    licenseKey,
                    deviceFingerprint: getDeviceFingerprint()
                })
            }, API_TIMEOUT);
        } catch (error) {
            return { success: false, error: 'NETWORK_ERROR' };
        }
    }

    async function initializeLicense() {
        const savedKey = localStorage.getItem(STORAGE_KEYS.key);
        
        if (!savedKey) {
            gate.style.display = 'flex';
            dismissLoader();
            return;
        }

        try {
            const status = await checkLicenseStatus(savedKey);
            if (status.success) {
                setCachedLicense(status);
                proceedToApp(status);
                return;
            }
            if (['REVOKED', 'EXPIRED', 'INVALID_KEY'].includes(status.error)) {
                clearLicenseData();
                gate.style.display = 'flex';
                dismissLoader();
                if (status.error === 'REVOKED') showError('Your license has been revoked.');
                else if (status.error === 'EXPIRED') showError('Your license has expired.');
                return;
            }
        } catch (error) {
            console.log('Server check failed, trying offline mode');
        }

        const cachedLicense = getCachedLicense();
        if (cachedLicense?.success && !hasBeenOfflineTooLong()) {
            const offline = { ...cachedLicense };
            if (!offline.is_perpetual && offline.days_remaining !== null) {
                const daysSince = Math.floor((Date.now() - parseInt(localStorage.getItem(STORAGE_KEYS.lastOnlineCheck))) / (1000 * 60 * 60 * 24));
                offline.days_remaining = Math.max(0, offline.days_remaining - daysSince);
            }
            offline.tier_name += ' (Offline)';
            proceedToApp(offline);
            return;
        }

        gate.style.display = 'flex';
        dismissLoader();
        showError('Please connect to the internet to verify your license.');
    }

    function proceedToApp(licenseInfo) {
        gate.style.display = 'none';
        dismissLoader();
        updateHeaderBadge(licenseInfo);
        initApp();
    }

    initializeLicense();

    // Terms Modal
    termsLink.addEventListener('click', (e) => {
        e.preventDefault();
        termsModal.style.display = 'flex';
    });

    closeTermsBtn.addEventListener('click', () => termsModal.style.display = 'none');
    acceptTermsBtn.addEventListener('click', () => {
        termsModal.style.display = 'none';
        termsCheckbox.checked = true;
    });

    termsModal.addEventListener('click', (e) => {
        if (e.target === termsModal) termsModal.style.display = 'none';
    });

    // Activation
    launchBtn.addEventListener('click', async () => {
        const keyVal = keyInput.value.trim();
        const companyVal = companyInput.value.trim();
        
        if (!keyVal) { showError('Please enter a license key'); return; }
        if (!companyVal) { showError('Please enter your company name'); return; }
        if (!termsCheckbox.checked) { showError('Please accept the Terms & Conditions'); return; }
        
        btnText.textContent = 'Validating...';
        launchBtn.disabled = true;
        
        const result = await validateLicense(keyVal, companyVal);
        
        if (result.success) {
            showSuccess(result);
            btnText.textContent = 'Activating...';
            localStorage.setItem(STORAGE_KEYS.key, keyVal.toUpperCase());
            localStorage.setItem(STORAGE_KEYS.company, companyVal);
            setCachedLicense(result);
            
            setTimeout(() => {
                gate.style.opacity = '0';
                setTimeout(() => { gate.style.opacity = '1'; proceedToApp(result); }, 500);
            }, 1000);
        } else {
            btnText.textContent = 'Activate License';
            launchBtn.disabled = false;
            
            const messages = {
                MAX_ACTIVATIONS: 'This license has been used on another device.',
                EXPIRED: 'This license has expired.',
                REVOKED: 'This license has been revoked.',
                INVALID_KEY: 'Invalid license key.',
                NETWORK_ERROR: 'Connection error. Please try again.'
            };
            showError(messages[result.error] || result.message || 'Validation failed.');
        }
    });

    keyInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') launchBtn.click(); });
    companyInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') launchBtn.click(); });
})();

// ============================================================================
// APPLICATION CORE
// ============================================================================

const state = {
    activeTab: 'home',
    activeCalc: 'loan',
    chartIndex: 'NSE20',
    chartType: 'line',
    chartRange: 7,
    currentPlan: null
};

const MARKET_TICKERS = [
    { symbol: 'NSE 20', name: 'Nairobi SE', value: '1,847.32', change: '+1.24%', up: true },
    { symbol: 'USD/KES', name: 'Forex', value: '153.45', change: '-0.12%', up: false },
    { symbol: 'GOLD', name: 'Gold/oz', value: '$2,341.50', change: '+0.45%', up: true },
    { symbol: 'BTC', name: 'Bitcoin', value: '$67,234', change: '+2.31%', up: true },
];

const INDEX_CONFIG = {
    'NSE20': { basePrice: 1847, color: '#F59E0B', name: 'NSE 20 Share Index' },
    'NSE25': { basePrice: 3256, color: '#10B981', name: 'NSE 25 Share Index' },
};

const NEWS_DATA = [
    { title: "Kenya's GDP growth projected at 5.5% for 2024", summary: 'Central Bank projects strong growth driven by agriculture and services.', source: 'Business Daily', category: 'kenya', url: 'https://www.businessdailyafrica.com/' },
    { title: 'Safaricom launches new M-Pesa features for SMEs', summary: 'New payment solutions help businesses manage cash flow.', source: 'Tech Weez', category: 'kenya', url: 'https://techweez.com/' },
    { title: 'African Continental Free Trade Area shows progress', summary: 'Intra-African trade increases 20% since AfCFTA implementation.', source: 'Africa Report', category: 'africa', url: 'https://www.theafricareport.com/' },
    { title: 'Nairobi Stock Exchange records highest volume', summary: 'NSE sees unprecedented investor interest.', source: 'NSE Kenya', category: 'kenya', url: 'https://www.nse.co.ke/' },
    { title: 'CBK maintains benchmark rate at 11.25%', summary: 'Central Bank holds rates amid inflation concerns.', source: 'Central Bank', category: 'kenya', url: 'https://www.centralbank.go.ke/' },
    { title: 'Gold prices surge amid global uncertainty', summary: 'Investors flock to safe-haven assets.', source: 'Reuters', category: 'global', url: 'https://www.reuters.com/markets/commodities/' },
    { title: 'Bitcoin breaks $70,000 barrier', summary: 'Cryptocurrency market rallies globally.', source: 'CoinDesk', category: 'global', url: 'https://www.coindesk.com/' },
    { title: 'Kenya launches digital ID for businesses', summary: 'Business incorporation reduced from 21 to 3 days.', source: 'Government', category: 'business', url: 'https://brs.go.ke/' },
];

const INDUSTRY_BENCHMARKS = {
    retail: { avgMargin: 25, avgGrowth: 8, risk: 'Medium', competition: 'High', marketSize: 'Large' },
    food: { avgMargin: 35, avgGrowth: 12, risk: 'Medium', competition: 'High', marketSize: 'Large' },
    tech: { avgMargin: 45, avgGrowth: 25, risk: 'High', competition: 'Medium', marketSize: 'Growing' },
    agriculture: { avgMargin: 30, avgGrowth: 6, risk: 'High', competition: 'Low', marketSize: 'Large' },
    manufacturing: { avgMargin: 20, avgGrowth: 5, risk: 'Medium', competition: 'Medium', marketSize: 'Medium' },
    services: { avgMargin: 40, avgGrowth: 10, risk: 'Low', competition: 'Medium', marketSize: 'Growing' },
    healthcare: { avgMargin: 35, avgGrowth: 15, risk: 'Low', competition: 'Low', marketSize: 'Growing' },
    education: { avgMargin: 30, avgGrowth: 12, risk: 'Low', competition: 'Medium', marketSize: 'Large' },
    transport: { avgMargin: 25, avgGrowth: 8, risk: 'Medium', competition: 'High', marketSize: 'Large' },
    realestate: { avgMargin: 40, avgGrowth: 7, risk: 'High', competition: 'Medium', marketSize: 'Medium' },
    hospitality: { avgMargin: 28, avgGrowth: 15, risk: 'High', competition: 'High', marketSize: 'Growing' },
    fashion: { avgMargin: 45, avgGrowth: 10, risk: 'Medium', competition: 'High', marketSize: 'Growing' },
    other: { avgMargin: 30, avgGrowth: 10, risk: 'Medium', competition: 'Medium', marketSize: 'Medium' }
};

function formatCurrency(value) {
    return 'KES ' + Math.round(value).toLocaleString('en-KE');
}

function formatNumber(value) {
    return Math.round(value).toLocaleString('en-KE');
}

function formatTime(date) {
    return date.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDate(date) {
    return date.toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function initApp() {
    updateTime();
    setInterval(updateTime, 1000);
    renderTicker();
    renderStats();
    renderNews();
    initTabs();
    initCalculators();
    initChartControls();
    initModals();
    initBusinessPlanner();
    renderChart();
}

function updateTime() {
    const timeDisplay = document.getElementById('time-display');
    const dateDisplay = document.getElementById('date-display');
    const now = new Date();
    if (timeDisplay) timeDisplay.querySelector('.time-value').textContent = formatTime(now);
    if (dateDisplay) dateDisplay.textContent = formatDate(now);
}

function renderTicker() {
    const container = document.getElementById('ticker-content');
    if (!container) return;
    const items = [...MARKET_TICKERS, ...MARKET_TICKERS];
    container.innerHTML = items.map(t => `
        <div class="ticker-item">
            <span class="ticker-symbol">${t.symbol}</span>
            <span class="ticker-name">${t.name}</span>
            <span class="ticker-value">${t.value}</span>
            <span class="ticker-change ${t.up ? 'up' : 'down'}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="${t.up ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'}"/>
                </svg>
                ${t.change}
            </span>
        </div>
    `).join('');
}

function renderStats() {
    const container = document.getElementById('stats-grid');
    if (!container) return;
    container.innerHTML = MARKET_TICKERS.slice(0, 4).map(s => `
        <div class="stat-card">
            <p class="stat-label">${s.symbol}</p>
            <p class="stat-value">${s.value}</p>
            <p class="stat-change ${s.up ? 'up' : 'down'}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="${s.up ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'}"/>
                </svg>
                ${s.change}
            </p>
        </div>
    `).join('');
}

function renderNews() {
    const container = document.getElementById('news-list');
    if (!container) return;
    container.innerHTML = NEWS_DATA.map(item => `
        <div class="news-item" onclick="window.open('${item.url}', '_blank')">
            <div class="news-meta">
                <span class="news-badge ${item.category}">${item.category === 'kenya' ? 'Kenya' : item.category === 'africa' ? 'Africa' : item.category === 'global' ? 'Global' : 'Business'}</span>
                <span class="news-source">${item.source}</span>
            </div>
            <h4 class="news-title">${item.title}</h4>
            <p class="news-summary">${item.summary}</p>
            <div class="news-link-hint">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                Tap to read
            </div>
        </div>
    `).join('');
}

function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    document.querySelectorAll('.tool-card[data-tab]').forEach(card => {
        card.addEventListener('click', () => switchTab(card.dataset.tab));
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const activeTab = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    const activeContent = document.getElementById(`tab-${tabName}`);
    if (activeTab) activeTab.classList.add('active');
    if (activeContent) activeContent.classList.add('active');
    state.activeTab = tabName;
    if (tabName === 'markets') renderChart();
}

// ============================================================================
// MODALS
// ============================================================================

function initModals() {
    // How It Works
    const howModal = document.getElementById('how-it-works-modal');
    const howBtn = document.getElementById('how-btn');
    const howCard = document.getElementById('how-card');
    const closeHowBtn = document.getElementById('close-how-btn');
    const gotItBtn = document.getElementById('got-it-btn');

    const openHow = () => howModal.style.display = 'flex';
    const closeHow = () => howModal.style.display = 'none';

    if (howBtn) howBtn.addEventListener('click', openHow);
    if (howCard) howCard.addEventListener('click', openHow);
    if (closeHowBtn) closeHowBtn.addEventListener('click', closeHow);
    if (gotItBtn) gotItBtn.addEventListener('click', closeHow);

    howModal.addEventListener('click', (e) => {
        if (e.target === howModal) closeHow();
    });
}

// ============================================================================
// BUSINESS PLANNER
// ============================================================================

function initBusinessPlanner() {
    const plannerModal = document.getElementById('planner-modal');
    const resultModal = document.getElementById('plan-result-modal');
    const savedModal = document.getElementById('saved-plans-modal');
    
    const newPlanCard = document.getElementById('new-plan-card');
    const savedPlansCard = document.getElementById('saved-plans-card');
    const closePlannerBtn = document.getElementById('close-planner-btn');
    const cancelPlannerBtn = document.getElementById('cancel-planner-btn');
    const generatePlanBtn = document.getElementById('generate-plan-btn');
    const closeResultBtn = document.getElementById('close-result-btn');
    const newPlanBtn = document.getElementById('new-plan-btn');
    const savePlanBtn = document.getElementById('save-plan-btn');
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    const closeSavedBtn = document.getElementById('close-saved-btn');

    newPlanCard.addEventListener('click', () => plannerModal.style.display = 'flex');
    closePlannerBtn.addEventListener('click', () => plannerModal.style.display = 'none');
    cancelPlannerBtn.addEventListener('click', () => plannerModal.style.display = 'none');

    generatePlanBtn.addEventListener('click', () => {
        const name = document.getElementById('business-name').value.trim();
        const type = document.getElementById('business-type').value;
        const location = document.getElementById('business-location').value.trim();
        const capital = parseFloat(document.getElementById('startup-capital').value) || 0;
        const targetMarket = document.getElementById('target-market').value.trim();
        const description = document.getElementById('business-description').value.trim();

        if (!name || !type || !location || !capital || !description) {
            showToast('Please fill in all required fields');
            return;
        }

        generatePlanBtn.innerHTML = '<svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Generating...';

        setTimeout(() => {
            const plan = generateBusinessPlan(name, type, location, capital, targetMarket, description);
            state.currentPlan = plan;
            displayPlan(plan);
            plannerModal.style.display = 'none';
            resultModal.style.display = 'flex';
            generatePlanBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Generate Business Plan';
        }, 2000);
    });

    closeResultBtn.addEventListener('click', () => resultModal.style.display = 'none');

    newPlanBtn.addEventListener('click', () => {
        resultModal.style.display = 'none';
        document.getElementById('business-name').value = '';
        document.getElementById('business-type').value = '';
        document.getElementById('business-location').value = '';
        document.getElementById('startup-capital').value = '';
        document.getElementById('target-market').value = '';
        document.getElementById('business-description').value = '';
        plannerModal.style.display = 'flex';
    });

    savePlanBtn.addEventListener('click', () => {
        if (state.currentPlan) {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.savedPlans) || '[]');
            state.currentPlan.savedAt = new Date().toISOString();
            saved.push(state.currentPlan);
            localStorage.setItem(STORAGE_KEYS.savedPlans, JSON.stringify(saved));
            showToast('Business plan saved!');
            resultModal.style.display = 'none';
        }
    });

    exportPdfBtn.addEventListener('click', () => {
        if (state.currentPlan) {
            exportPlanAsPDF(state.currentPlan);
        }
    });

    savedPlansCard.addEventListener('click', () => {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.savedPlans) || '[]');
        if (saved.length === 0) {
            showToast('No saved plans yet. Create your first plan!');
            return;
        }
        displaySavedPlans(saved);
        savedModal.style.display = 'flex';
    });

    closeSavedBtn.addEventListener('click', () => savedModal.style.display = 'none');

    // Close modals on outside click
    [plannerModal, resultModal, savedModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    });
}

function generateBusinessPlan(name, type, location, capital, targetMarket, description) {
    const benchmark = INDUSTRY_BENCHMARKS[type] || INDUSTRY_BENCHMARKS.other;
    
    // Calculate projections
    const monthlyRevenue = capital * (benchmark.avgMargin / 100) * 2.5;
    const monthlyExpenses = monthlyRevenue * 0.65;
    const monthlyProfit = monthlyRevenue - monthlyExpenses;
    const breakEvenMonths = Math.ceil(capital / monthlyProfit);
    const year1Revenue = monthlyRevenue * 12;
    const year1Profit = monthlyProfit * 12;
    const roi = ((year1Profit / capital) * 100).toFixed(1);

    // Calculate health score components
    const marketFitScore = Math.min(100, 50 + benchmark.avgGrowth * 2 + (benchmark.marketSize === 'Growing' ? 20 : benchmark.marketSize === 'Large' ? 15 : 10));
    const financialScore = Math.min(100, 40 + benchmark.avgMargin + (capital >= 100000 ? 20 : 10));
    const riskScore = 100 - (benchmark.risk === 'High' ? 40 : benchmark.risk === 'Medium' ? 25 : 15);
    const operationalScore = Math.min(100, 55 + (description.length > 200 ? 25 : 15) + (targetMarket ? 15 : 5));
    
    const overallScore = Math.round((marketFitScore + financialScore + riskScore + operationalScore) / 4);

    return {
        id: Date.now(),
        name,
        type,
        location,
        capital,
        targetMarket,
        description,
        benchmark,
        projections: { monthlyRevenue, monthlyExpenses, monthlyProfit, breakEvenMonths, year1Revenue, year1Profit, roi },
        scores: { overall: overallScore, marketFit: marketFitScore, financial: financialScore, risk: riskScore, operational: operationalScore },
        generatedAt: new Date().toISOString()
    };
}

function displayPlan(plan) {
    document.getElementById('plan-result-title').textContent = plan.name + ' - Business Plan';

    const categoryLabels = {
        retail: 'Retail & E-commerce', food: 'Food & Beverage', tech: 'Technology & Software',
        agriculture: 'Agriculture & Farming', manufacturing: 'Manufacturing', services: 'Professional Services',
        healthcare: 'Healthcare & Wellness', education: 'Education & Training', transport: 'Transport & Logistics',
        realestate: 'Real Estate', hospitality: 'Hospitality & Tourism', fashion: 'Fashion & Apparel', other: 'Other'
    };

    const scoreClass = plan.scores.overall >= 80 ? 'excellent' : plan.scores.overall >= 65 ? 'good' : plan.scores.overall >= 50 ? 'moderate' : 'poor';
    const ratingText = plan.scores.overall >= 80 ? 'Excellent' : plan.scores.overall >= 65 ? 'Good' : plan.scores.overall >= 50 ? 'Moderate' : 'Needs Work';
    const circumference = 2 * Math.PI * 60;
    const offset = circumference - (plan.scores.overall / 100) * circumference;

    const suggestions = generateSuggestions(plan);

    document.getElementById('plan-result-content').innerHTML = `
        <!-- Health Score -->
        <div class="health-score-container">
            <p class="health-score-title">Business Health Score</p>
            <p class="health-score-subtitle">Review your business plan's strength and areas for improvement</p>
            <div class="health-score-circle">
                <svg viewBox="0 0 140 140">
                    <circle class="circle-bg" cx="70" cy="70" r="60"/>
                    <circle class="circle-progress ${scoreClass}" cx="70" cy="70" r="60" style="stroke-dashoffset: ${offset}"/>
                </svg>
                <div class="health-score-value">
                    <span class="score">${plan.scores.overall}</span>
                    <span class="max">out of 100</span>
                </div>
            </div>
            <p class="health-score-rating ${scoreClass}">${ratingText}</p>
            <p class="health-score-message">Your business plan is ${ratingText.toLowerCase()}</p>
        </div>

        <!-- Category Breakdown -->
        <div class="plan-section">
            <h3>Category Breakdown</h3>
            <div class="category-breakdown">
                ${renderCategoryItem('Market Fit', plan.scores.marketFit)}
                ${renderCategoryItem('Financial Viability', plan.scores.financial)}
                ${renderCategoryItem('Risk Assessment', plan.scores.risk)}
                ${renderCategoryItem('Operational Readiness', plan.scores.operational)}
            </div>
        </div>

        <!-- Executive Summary -->
        <div class="plan-section">
            <h3>Executive Summary</h3>
            <p><strong>${plan.name}</strong> is a ${categoryLabels[plan.type] || plan.type} business located in ${plan.location}. With an initial investment of ${formatCurrency(plan.capital)}, the business aims to ${plan.description.substring(0, 150)}${plan.description.length > 150 ? '...' : ''}</p>
        </div>

        <!-- Market Analysis -->
        <div class="plan-section">
            <h3>Market Analysis</h3>
            <div class="plan-metrics">
                <div class="plan-metric">
                    <span class="metric-label">Industry Growth</span>
                    <span class="metric-value">${plan.benchmark.avgGrowth}%/yr</span>
                </div>
                <div class="plan-metric">
                    <span class="metric-label">Avg. Profit Margin</span>
                    <span class="metric-value">${plan.benchmark.avgMargin}%</span>
                </div>
                <div class="plan-metric">
                    <span class="metric-label">Competition</span>
                    <span class="metric-value">${plan.benchmark.competition}</span>
                </div>
                <div class="plan-metric">
                    <span class="metric-label">Risk Level</span>
                    <span class="metric-value">${plan.benchmark.risk}</span>
                </div>
            </div>
        </div>

        <!-- Financial Projections -->
        <div class="plan-section">
            <h3>Financial Projections (Year 1)</h3>
            <div class="plan-metrics">
                <div class="plan-metric highlight">
                    <span class="metric-label">Startup Capital</span>
                    <span class="metric-value">${formatCurrency(plan.capital)}</span>
                </div>
                <div class="plan-metric highlight">
                    <span class="metric-label">Monthly Revenue (Est.)</span>
                    <span class="metric-value">${formatCurrency(plan.projections.monthlyRevenue)}</span>
                </div>
                <div class="plan-metric">
                    <span class="metric-label">Monthly Profit (Est.)</span>
                    <span class="metric-value">${formatCurrency(plan.projections.monthlyProfit)}</span>
                </div>
                <div class="plan-metric">
                    <span class="metric-label">Break-Even</span>
                    <span class="metric-value">${plan.projections.breakEvenMonths} months</span>
                </div>
            </div>
            
            <div class="roi-display ${parseFloat(plan.projections.roi) >= 20 ? 'positive' : 'warning'}" style="margin-top: 1rem;">
                <span class="roi-value">${plan.projections.roi}%</span>
                <span class="roi-label">Expected ROI (Year 1)</span>
            </div>
        </div>

        <!-- Improvement Suggestions -->
        <div class="plan-section">
            <h3>Improvement Suggestions</h3>
            <ol class="improvement-list">
                ${suggestions.map(s => `<li>${s}</li>`).join('')}
            </ol>
        </div>

        <div class="plan-footer">
            <p>Generated by Brizerm Markets AI • ${new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p class="disclaimer">This plan is for planning purposes only. Consult professionals for guidance.</p>
        </div>
    `;
}

function renderCategoryItem(name, score) {
    const cls = score >= 80 ? 'excellent' : score >= 65 ? 'good' : score >= 50 ? 'moderate' : 'poor';
    return `
        <div class="category-item">
            <div class="category-header">
                <span class="category-name">${name}</span>
                <span class="category-score">${score}/100</span>
            </div>
            <div class="category-bar">
                <div class="category-fill ${cls}" style="width: ${score}%"></div>
            </div>
        </div>
    `;
}

function generateSuggestions(plan) {
    const suggestions = [];
    const location = plan.location.toLowerCase();
    const type = plan.type;

    // Market analysis suggestion
    if (plan.scores.marketFit < 75) {
        suggestions.push(`Develop a detailed market analysis to identify specific target clients in ${plan.location}'s growing market, including potential customer segments and their specific needs.`);
    }

    // Financial projections
    if (plan.scores.financial < 70) {
        suggestions.push(`Create comprehensive financial projections including realistic startup costs, monthly expenses, and a clear path to revenue generation. Consider consulting a financial advisor for accuracy.`);
    }

    // Operational suggestions
    if (type === 'tech' || type === 'services') {
        suggestions.push(`Outline your development methodology, client acquisition strategy, and timeline for scaling operations. Include specific milestones for the first 12 months.`);
    } else if (type === 'retail' || type === 'food') {
        suggestions.push(`Research optimal location within ${plan.location}, analyze foot traffic patterns, and develop a marketing strategy to attract your target demographic.`);
    } else if (type === 'agriculture') {
        suggestions.push(`Consider seasonal variations, supply chain logistics, and market access routes. Explore partnerships with local cooperatives or exporters.`);
    }

    // Risk management
    if (plan.scores.risk < 65) {
        suggestions.push(`Conduct a thorough SWOT analysis and develop contingency plans for potential risks. Consider insurance options and emergency fund allocation.`);
    }

    // Compliance
    if (location.includes('kenya') || location.includes('nairobi')) {
        suggestions.push(`Research specific compliance requirements including KRA tax obligations, county permits, NHIF/NSSF registration, and relevant industry regulations.`);
    }

    // Target market
    if (!plan.targetMarket) {
        suggestions.push(`Define your target market clearly - identify specific customer demographics, their pain points, and how your solution addresses their needs.`);
    }

    // Capital efficiency
    if (plan.capital < 100000) {
        suggestions.push(`With limited startup capital, prioritize essential expenses and consider phased growth. Bootstrap where possible and explore microfinance options.`);
    }

    return suggestions.slice(0, 5);
}

function displaySavedPlans(plans) {
    const container = document.getElementById('saved-plans-list');
    container.innerHTML = plans.map((plan, i) => `
        <div class="saved-plan-item" onclick="loadSavedPlan(${i})">
            <h4>${plan.name}</h4>
            <div class="plan-meta">
                <span>${new Date(plan.savedAt).toLocaleDateString()}</span>
                <span class="plan-score">${plan.scores.overall}/100</span>
            </div>
        </div>
    `).join('');
}

window.loadSavedPlan = function(index) {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.savedPlans) || '[]');
    if (saved[index]) {
        state.currentPlan = saved[index];
        displayPlan(saved[index]);
        document.getElementById('saved-plans-modal').style.display = 'none';
        document.getElementById('plan-result-modal').style.display = 'flex';
    }
};

function exportPlanAsPDF(plan) {
    // Create printable HTML
    const printWindow = window.open('', '_blank');
    const categoryLabels = {
        retail: 'Retail & E-commerce', food: 'Food & Beverage', tech: 'Technology & Software',
        agriculture: 'Agriculture & Farming', manufacturing: 'Manufacturing', services: 'Professional Services',
        healthcare: 'Healthcare & Wellness', education: 'Education & Training', transport: 'Transport & Logistics',
        realestate: 'Real Estate', hospitality: 'Hospitality & Tourism', fashion: 'Fashion & Apparel', other: 'Other'
    };

    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>${plan.name} - Business Plan | Brizerm Markets</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; padding: 40px; max-width: 800px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 3px solid #F59E0B; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #0F172A; }
        .logo span { color: #F59E0B; }
        .subtitle { color: #666; font-size: 14px; margin-top: 5px; }
        h1 { font-size: 24px; color: #0F172A; margin-bottom: 10px; }
        h2 { font-size: 18px; color: #0F172A; border-bottom: 2px solid #F59E0B; padding-bottom: 8px; margin: 25px 0 15px; }
        h3 { font-size: 14px; color: #333; margin: 20px 0 10px; }
        p { margin-bottom: 12px; text-align: justify; }
        .score-box { text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px; margin: 20px 0; }
        .score { font-size: 48px; font-weight: bold; color: #F59E0B; }
        .metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 15px 0; }
        .metric { background: #f8f9fa; padding: 12px; border-radius: 8px; }
        .metric-label { font-size: 12px; color: #666; }
        .metric-value { font-size: 16px; font-weight: bold; color: #0F172A; }
        .suggestions { counter-reset: item; list-style: none; }
        .suggestions li { counter-increment: item; margin-bottom: 12px; padding-left: 30px; position: relative; }
        .suggestions li::before { content: counter(item); position: absolute; left: 0; width: 20px; height: 20px; background: #F59E0B; color: white; border-radius: 50%; font-size: 12px; text-align: center; line-height: 20px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 12px; color: #666; }
        @media print { body { padding: 20px; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">Brizerm <span>Markets</span></div>
        <div class="subtitle">AI Business Intelligence Platform</div>
    </div>
    
    <h1>${plan.name}</h1>
    <p style="text-align: center; color: #666;">${categoryLabels[plan.type]} • ${plan.location}</p>
    
    <div class="score-box">
        <div class="score">${plan.scores.overall}/100</div>
        <p style="margin: 0; font-weight: bold;">Business Health Score</p>
    </div>

    <h2>Executive Summary</h2>
    <p><strong>${plan.name}</strong> is a ${categoryLabels[plan.type] || plan.type} venture in ${plan.location} with an initial investment of ${formatCurrency(plan.capital)}. ${plan.description}</p>

    <h2>Market Analysis</h2>
    <div class="metrics">
        <div class="metric"><span class="metric-label">Industry Growth</span><br><span class="metric-value">${plan.benchmark.avgGrowth}%/yr</span></div>
        <div class="metric"><span class="metric-label">Avg. Profit Margin</span><br><span class="metric-value">${plan.benchmark.avgMargin}%</span></div>
        <div class="metric"><span class="metric-label">Competition Level</span><br><span class="metric-value">${plan.benchmark.competition}</span></div>
        <div class="metric"><span class="metric-label">Risk Assessment</span><br><span class="metric-value">${plan.benchmark.risk}</span></div>
    </div>

    <h2>Financial Projections (Year 1)</h2>
    <div class="metrics">
        <div class="metric"><span class="metric-label">Startup Capital</span><br><span class="metric-value">${formatCurrency(plan.capital)}</span></div>
        <div class="metric"><span class="metric-label">Monthly Revenue</span><br><span class="metric-value">${formatCurrency(plan.projections.monthlyRevenue)}</span></div>
        <div class="metric"><span class="metric-label">Monthly Profit</span><br><span class="metric-value">${formatCurrency(plan.projections.monthlyProfit)}</span></div>
        <div class="metric"><span class="metric-label">Break-Even</span><br><span class="metric-value">${plan.projections.breakEvenMonths} months</span></div>
    </div>
    <p style="text-align: center; font-size: 24px; font-weight: bold; color: #F59E0B; margin: 20px 0;">ROI: ${plan.projections.roi}%</p>

    <h2>Improvement Suggestions</h2>
    <ol class="suggestions">
        ${generateSuggestions(plan).map(s => `<li>${s}</li>`).join('')}
    </ol>

    <div class="footer">
        <p>Generated by Brizerm Markets AI</p>
        <p>${new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p style="font-style: italic; margin-top: 10px;">This document is for planning purposes only. Consult professionals for guidance.</p>
    </div>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    
    setTimeout(() => {
        printWindow.print();
    }, 500);
    
    showToast('PDF export ready for printing/saving');
}

// ============================================================================
// CHART FUNCTIONS
// ============================================================================

function generateChartData(days, basePrice) {
    const data = [];
    let currentPrice = basePrice;
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const volatility = 0.015;
        const change = (Math.random() - 0.48) * volatility * currentPrice;
        const open = currentPrice;
        const close = currentPrice + change;
        const high = Math.max(open, close) + Math.random() * 5;
        const low = Math.min(open, close) - Math.random() * 5;
        const volume = Math.floor(Math.random() * 500000) + 100000;
        
        data.push({ date: date.toISOString().split('T')[0], open, high, low, close, volume });
        currentPrice = close;
    }
    return data;
}

function initChartControls() {
    document.querySelectorAll('.index-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.index-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.chartIndex = btn.dataset.index;
            renderChart();
        });
    });
    
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.chartType = btn.dataset.type;
            renderChart();
        });
    });
    
    document.querySelectorAll('.range-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.chartRange = parseInt(btn.dataset.range);
            renderChart();
        });
    });
}

function renderChart() {
    const canvas = document.getElementById('nse-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 60, bottom: 30, left: 20 };
    
    const config = INDEX_CONFIG[state.chartIndex];
    const data = generateChartData(state.chartRange, config.basePrice);
    
    document.getElementById('chart-index-name').textContent = config.name;
    const latest = data[data.length - 1];
    const previous = data[data.length - 2];
    const change = latest.close - previous.close;
    const pct = ((change / previous.close) * 100).toFixed(2);
    const isUp = change >= 0;
    
    document.getElementById('chart-price').textContent = latest.close.toFixed(2);
    document.getElementById('chart-change').innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="${isUp ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'}"/>
        </svg>
        ${isUp ? '+' : ''}${change.toFixed(2)} (${pct}%)
    `;
    document.getElementById('chart-change').className = `price-change ${isUp ? 'up' : 'down'}`;
    document.getElementById('chart-volume').textContent = (latest.volume / 1000).toFixed(0) + 'K';
    
    ctx.clearRect(0, 0, width, height);
    
    const prices = data.map(d => [d.high, d.low]).flat();
    const minPrice = Math.min(...prices) * 0.998;
    const maxPrice = Math.max(...prices) * 1.002;
    const priceRange = maxPrice - minPrice;
    
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const getX = i => padding.left + (i / (data.length - 1)) * chartWidth;
    const getY = p => padding.top + (1 - (p - minPrice) / priceRange) * chartHeight;
    
    // Grid
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    
    for (let i = 0; i <= 5; i++) {
        const price = minPrice + (priceRange / 5) * i;
        const y = getY(price);
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
        
        ctx.fillStyle = '#94A3B8';
        ctx.font = '10px Inter, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(price.toFixed(2), width - padding.right + 8, y + 4);
    }
    ctx.setLineDash([]);
    
    if (state.chartType === 'line') {
        const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
        gradient.addColorStop(0, config.color + '4D');
        gradient.addColorStop(1, config.color + '00');
        
        ctx.beginPath();
        data.forEach((p, i) => {
            const x = getX(i), y = getY(p.close);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.lineTo(getX(data.length - 1), height - padding.bottom);
        ctx.lineTo(getX(0), height - padding.bottom);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.beginPath();
        data.forEach((p, i) => {
            const x = getX(i), y = getY(p.close);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.strokeStyle = config.color;
        ctx.lineWidth = 2;
        ctx.stroke();
    } else {
        data.forEach((p, idx) => {
            const x = getX(idx);
            const isGreen = p.close >= p.open;
            const color = isGreen ? '#10B981' : '#EF4444';
            
            ctx.beginPath();
            ctx.moveTo(x, getY(p.high));
            ctx.lineTo(x, getY(p.low));
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.stroke();
            
            const bodyTop = getY(Math.max(p.open, p.close));
            const bodyHeight = Math.max(1, getY(Math.min(p.open, p.close)) - bodyTop);
            ctx.fillStyle = color;
            ctx.fillRect(x - 3, bodyTop, 6, bodyHeight);
        });
    }
    
    // Volume bars
    const maxVol = Math.max(...data.map(d => d.volume));
    const volH = 30;
    const volY = height - padding.bottom - volH;
    
    data.forEach((p, idx) => {
        const x = getX(idx);
        const barW = chartWidth / data.length;
        const barH = (p.volume / maxVol) * volH;
        ctx.fillStyle = p.close >= p.open ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)';
        ctx.fillRect(x - barW / 2, volY + (volH - barH), barW - 1, barH);
    });
}

// ============================================================================
// CALCULATORS
// ============================================================================

function initCalculators() {
    document.querySelectorAll('.calc-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.calc-tab').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.calculator').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`calc-${btn.dataset.calc}`).classList.add('active');
            state.activeCalc = btn.dataset.calc;
        });
    });
    
    ['loan-amount', 'loan-rate', 'loan-term'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', updateLoanCalc);
    });
    ['be-fixed', 'be-variable', 'be-price'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', updateBreakEvenCalc);
    });
    ['roi-investment', 'roi-final', 'roi-period'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', updateROICalc);
    });
    
    updateLoanCalc();
    updateBreakEvenCalc();
    updateROICalc();
}

function updateLoanCalc() {
    const principal = parseFloat(document.getElementById('loan-amount')?.value) || 500000;
    const rate = parseFloat(document.getElementById('loan-rate')?.value) || 14;
    const term = parseInt(document.getElementById('loan-term')?.value) || 24;
    
    document.getElementById('loan-amount-display').textContent = formatCurrency(principal);
    document.getElementById('loan-rate-display').textContent = rate + '%';
    document.getElementById('loan-term-display').textContent = term + ' mo';
    
    const mr = rate / 100 / 12;
    const mp = mr === 0 ? principal / term : (principal * mr * Math.pow(1 + mr, term)) / (Math.pow(1 + mr, term) - 1);
    const total = mp * term;
    const interest = total - principal;
    
    document.getElementById('monthly-payment').textContent = formatCurrency(mp);
    document.getElementById('total-payment').textContent = formatCurrency(total);
    document.getElementById('total-interest').textContent = formatCurrency(interest);
}

function updateBreakEvenCalc() {
    const fixed = parseFloat(document.getElementById('be-fixed')?.value) || 50000;
    const variable = parseFloat(document.getElementById('be-variable')?.value) || 150;
    const price = parseFloat(document.getElementById('be-price')?.value) || 300;
    
    document.getElementById('be-fixed-display').textContent = formatCurrency(fixed);
    document.getElementById('be-variable-display').textContent = formatCurrency(variable);
    document.getElementById('be-price-display').textContent = formatCurrency(price);
    
    const margin = price - variable;
    const units = margin > 0 ? Math.ceil(fixed / margin) : 0;
    const revenue = units * price;
    
    document.getElementById('be-units').textContent = formatNumber(units);
    document.getElementById('be-revenue').textContent = formatCurrency(revenue);
    document.getElementById('be-margin').textContent = formatCurrency(margin);
}

function updateROICalc() {
    const inv = parseFloat(document.getElementById('roi-investment')?.value) || 500000;
    const final = parseFloat(document.getElementById('roi-final')?.value) || 750000;
    const period = parseInt(document.getElementById('roi-period')?.value) || 12;
    
    document.getElementById('roi-investment-display').textContent = formatCurrency(inv);
    document.getElementById('roi-final-display').textContent = formatCurrency(final);
    document.getElementById('roi-period-display').textContent = period + ' mo';
    
    const profit = final - inv;
    const roi = (profit / inv) * 100;
    const annual = period > 0 ? (Math.pow(final / inv, 12 / period) - 1) * 100 : 0;
    
    const roiEl = document.getElementById('roi-percent');
    roiEl.textContent = (roi >= 0 ? '+' : '') + roi.toFixed(2) + '%';
    roiEl.className = 'result-value large ' + (roi >= 0 ? 'green' : 'red');
    
    const profitEl = document.getElementById('roi-profit');
    profitEl.textContent = formatCurrency(profit);
    profitEl.className = 'result-value ' + (profit >= 0 ? 'green' : 'red');
    
    const annualEl = document.getElementById('roi-annual');
    annualEl.textContent = (annual >= 0 ? '+' : '') + annual.toFixed(2) + '%';
    annualEl.className = 'result-value ' + (annual >= 0 ? 'green' : 'red');
    
    let rating, color;
    if (roi < 0) { rating = 'Loss'; color = '#EF4444'; }
    else if (roi < 10) { rating = 'Low'; color = '#FBBF24'; }
    else if (roi < 25) { rating = 'Moderate'; color = '#10B981'; }
    else if (roi < 50) { rating = 'Good'; color = '#3B82F6'; }
    else { rating = 'Excellent'; color = '#8B5CF6'; }
    
    document.getElementById('rating-value').textContent = rating;
    document.getElementById('rating-value').style.color = color;
    document.getElementById('rating-fill').style.width = Math.min(Math.abs(roi), 100) + '%';
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

window.addEventListener('resize', () => {
    if (state.activeTab === 'markets') renderChart();
});

document.onkeydown = function(e) {
    if (e.keyCode === 123) return false;
    if (e.ctrlKey && e.shiftKey && e.keyCode === 'I'.charCodeAt(0)) return false;
    if (e.ctrlKey && e.shiftKey && e.keyCode === 'J'.charCodeAt(0)) return false;
    if (e.ctrlKey && e.keyCode === 'U'.charCodeAt(0)) return false;
};

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    });
}
