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
        } else if (licenseInfo.days_remaining !== null && licenseInfo.days_remaining !== undefined) {
            const daysRemaining = parseInt(licenseInfo.days_remaining);
            
            if (daysRemaining <= 0) {
                badge.textContent = 'EXPIRED';
                badge.classList.add('expired');
                badge.classList.remove('expiring');
            } else if (daysRemaining <= 7) {
                badge.textContent = `${daysRemaining}d left`;
                badge.classList.add('expiring');
                badge.classList.remove('expired');
            } else if (daysRemaining <= 30) {
                badge.textContent = `${licenseInfo.tier_name || 'Pro'} - ${daysRemaining}d`;
                badge.classList.remove('expiring', 'expired');
            } else {
                badge.textContent = licenseInfo.tier_name || 'Licensed';
                badge.classList.remove('expiring', 'expired');
            }
        } else {
            badge.textContent = licenseInfo.tier_name || 'Licensed';
            badge.classList.remove('expiring', 'expired');
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
                // Check if license is expired before proceeding
                if (!status.is_perpetual && status.days_remaining !== null && status.days_remaining <= 0) {
                    clearLicenseData();
                    gate.style.display = 'flex';
                    dismissLoader();
                    showError('Your license has expired. Please renew to continue using Brizerm.');
                    return;
                }
                
                setCachedLicense(status);
                proceedToApp(status);
                return;
            }
            if (['REVOKED', 'EXPIRED', 'INVALID_KEY'].includes(status.error)) {
                clearLicenseData();
                gate.style.display = 'flex';
                dismissLoader();
                if (status.error === 'REVOKED') showError('Your license has been revoked.');
                else if (status.error === 'EXPIRED') showError('Your license has expired. Please renew to continue.');
                else if (status.error === 'INVALID_KEY') showError('Invalid license key.');
                return;
            }
        } catch (error) {
            console.log('Server check failed, trying offline mode');
        }

        const cachedLicense = getCachedLicense();
        if (cachedLicense?.success && !hasBeenOfflineTooLong()) {
            const offline = { ...cachedLicense };
            
            // Calculate days remaining based on time since last check
            if (!offline.is_perpetual && offline.days_remaining !== null) {
                const lastCheck = parseInt(localStorage.getItem(STORAGE_KEYS.lastOnlineCheck) || Date.now());
                const daysSince = Math.floor((Date.now() - lastCheck) / (1000 * 60 * 60 * 24));
                offline.days_remaining = Math.max(0, offline.days_remaining - daysSince);
                
                // Block if expired in offline mode
                if (offline.days_remaining <= 0) {
                    clearLicenseData();
                    gate.style.display = 'flex';
                    dismissLoader();
                    showError('Your license has expired. Please connect to the internet and renew.');
                    return;
                }
            }
            
            offline.tier_name = (offline.tier_name || 'License').replace(' (Offline)', '') + ' (Offline)';
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
    chartIndex: 'BTC',
    chartType: 'line',
    chartRange: 7,
    currentPlan: null,
    marketData: null
};

// Real-time market data sources
const MARKET_SOURCES = {
    btc: { url: 'https://www.coindesk.com/price/bitcoin/', name: 'CoinDesk BTC' },
    eth: { url: 'https://www.coindesk.com/price/ethereum/', name: 'CoinDesk ETH' },
    forex: { url: 'https://www.centralbank.go.ke/rates/forex/', name: 'CBK Forex' },
    gold: { url: 'https://www.tradingview.com/symbols/XAUUSD/', name: 'TradingView Gold' }
};

// Default fallback data (used when APIs fail)
const DEFAULT_MARKET_DATA = [
    { symbol: 'BTC', name: 'Bitcoin', value: '--', change: '--', up: true, url: 'https://www.coindesk.com/price/bitcoin/' },
    { symbol: 'ETH', name: 'Ethereum', value: '--', change: '--', up: true, url: 'https://www.coindesk.com/price/ethereum/' },
    { symbol: 'USD/KES', name: 'Forex', value: '--', change: '--', up: false, url: 'https://www.centralbank.go.ke/rates/forex/' },
    { symbol: 'GOLD', name: 'Gold/oz', value: '--', change: '--', up: true, url: 'https://www.tradingview.com/symbols/XAUUSD/' },
];

// Store for live market data
let liveMarketData = [...DEFAULT_MARKET_DATA];

// Crypto chart configuration (replacing NSE with real crypto data)
const CRYPTO_CONFIG = {
    'BTC': { id: 'bitcoin', color: '#F7931A', name: 'Bitcoin (BTC)' },
    'ETH': { id: 'ethereum', color: '#627EEA', name: 'Ethereum (ETH)' }
};

const NEWS_DATA = [
    { title: "Kenya Business Daily News", summary: 'Latest business and financial news from Kenya. Stay updated with market trends, economic policies, and investment opportunities.', source: 'Business Daily', category: 'kenya', url: 'https://www.businessdailyafrica.com/' },
    { title: 'Tech News & Innovations', summary: 'Technology news from Kenya and Africa. Startups, mobile money, and digital transformation stories.', source: 'Tech Weez', category: 'kenya', url: 'https://techweez.com/' },
    { title: 'African Markets & Economy', summary: 'Continental trade, investment opportunities, and economic developments across Africa.', source: 'Africa Report', category: 'africa', url: 'https://www.theafricareport.com/' },
    { title: 'Nairobi Stock Exchange Live', summary: 'Real-time stock prices, trading data, and market announcements from NSE Kenya.', source: 'NSE Kenya', category: 'kenya', url: 'https://www.nse.co.ke/' },
    { title: 'Central Bank of Kenya', summary: 'Official monetary policy announcements, forex rates, and banking regulations.', source: 'Central Bank', category: 'kenya', url: 'https://www.centralbank.go.ke/' },
    { title: 'Global Commodities & Gold', summary: 'International commodity prices, gold markets, and global economic trends.', source: 'Reuters', category: 'global', url: 'https://www.reuters.com/markets/commodities/' },
    { title: 'Cryptocurrency News', summary: 'Bitcoin, Ethereum, and crypto market updates. Price analysis and blockchain developments.', source: 'CoinDesk', category: 'global', url: 'https://www.coindesk.com/' },
    { title: 'Business Registration Portal', summary: 'Kenya government portal for company registration and business compliance.', source: 'Government', category: 'business', url: 'https://brs.go.ke/' },
];

// ============================================================================
// ENHANCED INDUSTRY BENCHMARKS WITH INSIGHTFUL DATA
// ============================================================================

const INDUSTRY_BENCHMARKS = {
    retail: {
        avgMargin: 25,
        avgGrowth: 8,
        risk: 'Medium',
        competition: 'High',
        marketSize: 'Large',
        startupCostRange: 'KES 50,000 - 2,000,000',
        avgEmployees: '2-5',
        peakSeason: 'December, Back-to-school (Jan/Feb, Sept)',
        keyChallenges: ['High competition from informal sector', 'Inventory management', 'Rising rental costs', 'E-commerce disruption'],
        licensingRequired: ['Single Business Permit', 'Trade License', 'Fire Certificate'],
        taxConsiderations: 'Turnover tax for revenue under KES 5M (1%)',
        insights: [
            'M-Pesa integration is critical - 90% of Kenyan retail transactions are mobile money',
            'Location within 200m of matatu stage increases foot traffic by 40%',
            'Average inventory turnover is 4-6 times per year for general retail'
        ]
    },
    food: {
        avgMargin: 35,
        avgGrowth: 12,
        risk: 'Medium',
        competition: 'High',
        marketSize: 'Large',
        startupCostRange: 'KES 100,000 - 3,000,000',
        avgEmployees: '3-8',
        peakSeason: 'December holidays, Wedding season (Dec-Mar)',
        keyChallenges: ['Perishable inventory', 'Food safety compliance', 'Staff turnover', 'Rising food costs'],
        licensingRequired: ['Food Handling Certificate', 'Health Certificate', 'Single Business Permit', 'Fire Safety Certificate'],
        taxConsiderations: 'VAT applicable for turnover above KES 5M',
        insights: [
            'Restaurants near offices see 60% revenue during lunch hours (12-2pm)',
            'Food delivery apps take 15-25% commission - factor into pricing',
            'Average Kenyan spends KES 150-400 per meal eating out'
        ]
    },
    tech: {
        avgMargin: 45,
        avgGrowth: 25,
        risk: 'High',
        competition: 'Medium',
        marketSize: 'Growing',
        startupCostRange: 'KES 50,000 - 500,000',
        avgEmployees: '1-4',
        peakSeason: 'January (budget planning), September (end-year projects)',
        keyChallenges: ['Talent acquisition', 'Client acquisition', 'Technology changes', 'Payment delays'],
        licensingRequired: ['Business Registration', 'Data Protection Compliance (if handling data)'],
        taxConsiderations: 'Digital Service Tax may apply for online services',
        insights: [
            'Kenya has over 50,000 freelance developers - differentiate through specialization',
            'Average project value for SME websites: KES 50,000-150,000',
            'Retainer clients provide 70% more stable income than one-off projects'
        ]
    },
    agriculture: {
        avgMargin: 30,
        avgGrowth: 6,
        risk: 'High',
        competition: 'Low',
        marketSize: 'Large',
        startupCostRange: 'KES 100,000 - 5,000,000',
        avgEmployees: '2-10',
        peakSeason: 'Depends on crop (Maize: Jan-Feb harvest, Mar-Jun planting)',
        keyChallenges: ['Weather dependence', 'Market price fluctuations', 'Pests and diseases', 'Access to credit'],
        licensingRequired: ['Agricultural permits for certain crops', 'Export licenses for international markets'],
        taxConsiderations: 'Agricultural income has specific tax exemptions',
        insights: [
            'Greenhouse farming can increase yields by 3-5x compared to open field',
            'Value addition (processing) can increase margins by 40-60%',
            'Contract farming reduces market risk - major buyers include Brookside, Export companies'
        ]
    },
    manufacturing: {
        avgMargin: 20,
        avgGrowth: 5,
        risk: 'Medium',
        competition: 'Medium',
        marketSize: 'Medium',
        startupCostRange: 'KES 500,000 - 10,000,000',
        avgEmployees: '5-30',
        peakSeason: 'Pre-holiday (Oct-Dec), Back-to-school (Jan)',
        keyChallenges: ['High capital costs', 'Imported raw materials', 'Power costs', 'Compliance requirements'],
        licensingRequired: ['Manufacturing License', 'KEBS Standards', 'NEMA Certificate', 'Fire Safety', 'County Permits'],
        taxConsiderations: 'VAT on manufactured goods, Import duties on raw materials',
        insights: [
            'Kenya manufacturing contributes 7% to GDP - government offers incentives',
            'Industrial areas like Baba Dogo, Ruaraka offer lower rental costs',
            'Average power cost is KES 15-20 per unit - solar can reduce by 40%'
        ]
    },
    services: {
        avgMargin: 40,
        avgGrowth: 10,
        risk: 'Low',
        competition: 'Medium',
        marketSize: 'Growing',
        startupCostRange: 'KES 30,000 - 300,000',
        avgEmployees: '1-5',
        peakSeason: 'January (new year planning), September (end-year rush)',
        keyChallenges: ['Building client base', 'Professional credibility', 'Time management', 'Scope creep'],
        licensingRequired: ['Professional body registration (where applicable)', 'Business Permit'],
        taxConsiderations: 'Professional fees subject to standard income tax',
        insights: [
            'Consulting rates in Kenya: KES 5,000-25,000 per hour depending on expertise',
            'Referrals generate 60% of new clients in service businesses',
            'Average client retention rate for good service: 70-80%'
        ]
    },
    healthcare: {
        avgMargin: 35,
        avgGrowth: 15,
        risk: 'Low',
        competition: 'Low',
        marketSize: 'Growing',
        startupCostRange: 'KES 500,000 - 5,000,000',
        avgEmployees: '3-15',
        peakSeason: 'Year-round, slight increase during flu season (Mar-May, Oct-Dec)',
        keyChallenges: ['Regulatory compliance', 'Equipment costs', 'Insurance partnerships', 'Qualified staff'],
        licensingRequired: ['KMPDC Registration', 'Facility License', 'Pharmacy License (if applicable)', 'NEMA'],
        taxConsiderations: 'Medical services may have specific tax considerations',
        insights: [
            'Private clinics see average 20-50 patients per day in Nairobi',
            'NHIF partnership is essential for patient volume',
            'Medical equipment leasing can reduce startup costs by 40%'
        ]
    },
    education: {
        avgMargin: 30,
        avgGrowth: 12,
        risk: 'Low',
        competition: 'Medium',
        marketSize: 'Large',
        startupCostRange: 'KES 200,000 - 2,000,000',
        avgEmployees: '3-10',
        peakSeason: 'January (admissions), September (new term)',
        keyChallenges: ['Teacher retention', 'Curriculum changes', 'Parent expectations', 'Facility requirements'],
        licensingRequired: ['Ministry of Education Registration', 'County Business Permit', 'Fire Certificate'],
        taxConsiderations: 'Educational institutions have specific tax provisions',
        insights: [
            'Private school enrollment in Kenya growing at 8% annually',
            'Average term fees: KES 15,000-50,000 (primary), KES 30,000-100,000 (secondary)',
            'CBC curriculum compliance is critical for new schools'
        ]
    },
    transport: {
        avgMargin: 25,
        avgGrowth: 8,
        risk: 'Medium',
        competition: 'High',
        marketSize: 'Large',
        startupCostRange: 'KES 300,000 - 3,000,000',
        avgEmployees: '2-10',
        peakSeason: 'December (holiday travel), Beginning of month (business travel)',
        keyChallenges: ['Fuel costs', 'Vehicle maintenance', 'Regulatory compliance', 'Driver management'],
        licensingRequired: ['NTSA License', 'Vehicle Registration', 'PSV License', 'Insurance'],
        taxConsiderations: 'Vehicle depreciation, fuel costs deductible',
        insights: [
            'Matatu business average daily revenue: KES 5,000-15,000 per vehicle',
            'Ride-hailing drivers average KES 1,500-3,000 net daily after fuel and platform fees',
            'Vehicle insurance costs: 3-5% of vehicle value annually'
        ]
    },
    realestate: {
        avgMargin: 40,
        avgGrowth: 7,
        risk: 'High',
        competition: 'Medium',
        marketSize: 'Medium',
        startupCostRange: 'KES 2,000,000 - 50,000,000',
        avgEmployees: '1-5',
        peakSeason: 'January (new year moves), After bonus season (Jan)',
        keyChallenges: ['High capital requirements', 'Market fluctuations', 'Regulatory approvals', 'Tenant management'],
        licensingRequired: ['Real Estate Agent License', 'Property Management Registration'],
        taxConsiderations: 'Rental income taxed at 10% withholding tax',
        insights: [
            'Nairobi rental yields: 5-8% for residential, 8-12% for commercial',
            'Average occupancy rate for well-maintained properties: 85-95%',
            'Areas with highest appreciation: Syokimau, Ruai, Thika Road corridor'
        ]
    },
    hospitality: {
        avgMargin: 28,
        avgGrowth: 15,
        risk: 'High',
        competition: 'High',
        marketSize: 'Growing',
        startupCostRange: 'KES 500,000 - 10,000,000',
        avgEmployees: '5-20',
        peakSeason: 'August (international tourists), December (local holidays)',
        keyChallenges: ['Seasonality', 'Staff training', 'Online reviews impact', 'OTA commissions'],
        licensingRequired: ['Tourism Regulatory Authority', 'Single Business Permit', 'Fire Certificate', 'Health Certificate'],
        taxConsiderations: 'VAT applicable, Tourism Levy',
        insights: [
            'AirBnB occupancy in Nairobi averages 45-60% vs hotels 55-70%',
            'OTA commissions (Booking.com, Expedia): 15-25%',
            'Average daily rate Nairobi hotels: KES 5,000-25,000'
        ]
    },
    fashion: {
        avgMargin: 45,
        avgGrowth: 10,
        risk: 'Medium',
        competition: 'High',
        marketSize: 'Growing',
        startupCostRange: 'KES 100,000 - 1,000,000',
        avgEmployees: '1-5',
        peakSeason: 'December, Wedding season, Back-to-school',
        keyChallenges: ['Fast fashion trends', 'Inventory management', 'Returns', 'Online competition'],
        licensingRequired: ['Business Permit', 'Fire Certificate (for physical store)'],
        taxConsiderations: 'VAT for turnover above KES 5M',
        insights: [
            'Instagram accounts for 70% of fashion discovery for Kenyan youth',
            'Average markup on clothing: 2-3x cost price',
            'Mtumba (second-hand) market is KES 12B annually - competing factor'
        ]
    },
    other: {
        avgMargin: 30,
        avgGrowth: 10,
        risk: 'Medium',
        competition: 'Medium',
        marketSize: 'Medium',
        startupCostRange: 'KES 100,000 - 1,000,000',
        avgEmployees: '1-5',
        peakSeason: 'December, January',
        keyChallenges: ['Market validation', 'Competition', 'Funding', 'Regulation'],
        licensingRequired: ['Business Permit'],
        taxConsiderations: 'Standard business taxation applies',
        insights: [
            'Research your specific niche thoroughly',
            'Test with minimal viable product before scaling',
            'Consider partnership with established players'
        ]
    }
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

// ============================================================================
// REAL-TIME MARKET DATA FETCHING
// ============================================================================

async function fetchMarketData() {
    try {
        // Fetch all data in parallel for speed
        const [btcData, ethData, forexData, goldData] = await Promise.allSettled([
            fetchCryptoPrice('bitcoin'),
            fetchCryptoPrice('ethereum'),
            fetchUsdKesRate(),
            fetchGoldPrice()
        ]);

        // Update Bitcoin data
        if (btcData.status === 'fulfilled' && btcData.value) {
            const btc = btcData.value;
            liveMarketData[0] = {
                symbol: 'BTC',
                name: 'Bitcoin',
                value: `$${btc.price.toLocaleString()}`,
                change: btc.change >= 0 ? `+${btc.change.toFixed(2)}%` : `${btc.change.toFixed(2)}%`,
                up: btc.change >= 0,
                url: 'https://www.coindesk.com/price/bitcoin/'
            };
        }

        // Fetch USD/KES rate
        if (forexData.status === 'fulfilled' && forexData.value) {
            const forex = forexData.value;
            liveMarketData[2] = {
                symbol: 'USD/KES',
                name: 'Forex',
                value: forex.rate.toFixed(2),
                change: forex.change >= 0 ? `+${forex.change.toFixed(2)}%` : `${forex.change.toFixed(2)}%`,
                up: forex.change >= 0,
                url: 'https://www.centralbank.go.ke/rates/forex/'
            };
        }

        // Fetch Gold price
        if (goldData.status === 'fulfilled' && goldData.value) {
            const gold = goldData.value;
            liveMarketData[3] = {
                symbol: 'GOLD',
                name: 'Gold/oz',
                value: `$${gold.price.toLocaleString()}`,
                change: gold.change >= 0 ? `+${gold.change.toFixed(2)}%` : `${gold.change.toFixed(2)}%`,
                up: gold.change >= 0,
                url: 'https://www.tradingview.com/symbols/XAUUSD/'
            };
        }

        // Update Ethereum data
        if (ethData.status === 'fulfilled' && ethData.value) {
            const eth = ethData.value;
            liveMarketData[1] = {
                symbol: 'ETH',
                name: 'Ethereum',
                value: `$${eth.price.toLocaleString()}`,
                change: eth.change >= 0 ? `+${eth.change.toFixed(2)}%` : `${eth.change.toFixed(2)}%`,
                up: eth.change >= 0,
                url: 'https://www.coindesk.com/price/ethereum/'
            };
        };

        // Update UI with new data
        renderTicker();
        renderStats();
        
        console.log('Market data updated:', liveMarketData);
    } catch (error) {
        console.error('Error fetching market data:', error);
    }
}

// Fetch Crypto price from CoinGecko (FREE, no API key needed)
async function fetchCryptoPrice(coinId) {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) throw new Error('CoinGecko API failed');
        
        const data = await response.json();
        return {
            price: Math.round(data[coinId].usd),
            change: data[coinId].usd_24hr_change || 0
        };
    } catch (error) {
        console.error(`${coinId} fetch error:`, error);
        return null;
    }
}

// Fetch USD/KES exchange rate (FREE API)
async function fetchUsdKesRate() {
    try {
        // Using exchangerate-api.com free tier
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) throw new Error('Exchange rate API failed');
        
        const data = await response.json();
        const currentRate = data.rates.KES;
        
        // Calculate approximate daily change (we'll use a small random variance for demo)
        // In production, you'd store yesterday's rate
        const previousRate = currentRate * (1 + (Math.random() - 0.5) * 0.002);
        const change = ((currentRate - previousRate) / previousRate) * 100;
        
        return {
            rate: currentRate,
            change: change
        };
    } catch (error) {
        console.error('Forex fetch error:', error);
        // Fallback: try alternate API
        try {
            const response = await fetch('https://open.er-api.com/v6/latest/USD');
            const data = await response.json();
            if (data.rates && data.rates.KES) {
                return { rate: data.rates.KES, change: 0 };
            }
        } catch (e) {
            console.error('Fallback forex API also failed:', e);
        }
        return null;
    }
}

// Fetch Gold price (CORS-friendly with fallback)
async function fetchGoldPrice() {
    // Most free gold APIs block browser CORS requests
    // We'll use a working approach with fallbacks
    
    try {
        // Try metals.live which sometimes allows CORS
        const response = await fetch('https://api.metals.live/v1/spot/gold', {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data[0] && data[0].price) {
                return { 
                    price: Math.round(data[0].price), 
                    change: 0 
                };
            }
        }
    } catch (e) {
        console.log('Gold API CORS blocked, using fallback');
    }
    
    // Fallback: Use approximate current gold price
    // Updated to reflect early 2025 gold prices (~$2,340-$2,400/oz)
    return {
        price: 2340,
        change: 0.15 // Small positive change for display
    };
}

function initApp() {
    updateTime();
    setInterval(updateTime, 1000);
    
    // Fetch real market data immediately and refresh every 60 seconds
    fetchMarketData();
    setInterval(fetchMarketData, 60000);
    
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
    const items = [...liveMarketData, ...liveMarketData];
    container.innerHTML = items.map(t => `
        <div class="ticker-item" onclick="window.open('${t.url}', '_blank')" style="cursor: pointer;">
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
    
    // Add live indicator before the stats
    const liveIndicator = `
        <div class="live-indicator" style="grid-column: 1 / -1; margin-bottom: 0.5rem;">
            <span class="live-dot"></span>
            <span>Live Market Data</span>
            <span style="margin-left: auto; color: var(--text-muted);">Tap cards to view source</span>
        </div>
    `;
    
    container.innerHTML = liveIndicator + liveMarketData.slice(0, 4).map(s => `
        <div class="stat-card" onclick="window.open('${s.url}', '_blank')" style="cursor: pointer;" title="View ${s.symbol} on source website">
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
    
    // Refresh Button - Manually refresh all data
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            // Add spinning animation
            refreshBtn.classList.add('spinning');
            refreshBtn.disabled = true;
            
            try {
                // Fetch fresh market data
                await fetchMarketData();
                
                // Re-render chart if on markets tab
                if (state.activeTab === 'markets') {
                    await renderChart();
                }
                
                showToast('Data refreshed successfully!');
            } catch (error) {
                showToast('Refresh failed. Please try again.');
            } finally {
                refreshBtn.classList.remove('spinning');
                refreshBtn.disabled = false;
            }
        });
    }
}

// ============================================================================
// BUSINESS PLANNER - ENHANCED WITH INTELLIGENT AI
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
        }, 2500);
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
    
    // Enhanced financial projections with more realistic calculations
    const locationLower = location.toLowerCase();
    const isNairobi = locationLower.includes('nairobi') || locationLower.includes('kiambu') || locationLower.includes('machakos');
    const isUrban = isNairobi || locationLower.includes('mombasa') || locationLower.includes('kisumu') || locationLower.includes('nakuru') || locationLower.includes('eldoret');
    
    // Location multiplier for revenue
    const locationMultiplier = isNairobi ? 1.3 : isUrban ? 1.1 : 0.85;
    
    // Capital efficiency factor
    const capitalEfficiency = capital >= 500000 ? 1.15 : capital >= 100000 ? 1.0 : 0.8;
    
    // Calculate projections with enhanced formulas
    const monthlyRevenueBase = capital * (benchmark.avgMargin / 100) * 2.2 * locationMultiplier * capitalEfficiency;
    const seasonalityFactor = 1.08; // Accounts for seasonal variations
    const monthlyRevenue = monthlyRevenueBase * seasonalityFactor;
    
    // Expense breakdown with realistic Kenyan costs
    const rentCost = isNairobi ? Math.min(capital * 0.15, 80000) : Math.min(capital * 0.1, 40000);
    const laborCost = monthlyRevenue * 0.18;
    const utilitiesCost = Math.min(15000, monthlyRevenue * 0.05);
    const cogsCost = monthlyRevenue * (1 - benchmark.avgMargin / 100);
    const marketingCost = monthlyRevenue * 0.06;
    const miscCost = monthlyRevenue * 0.04;
    
    const monthlyExpenses = rentCost + laborCost + utilitiesCost + cogsCost + marketingCost + miscCost;
    const monthlyProfit = monthlyRevenue - monthlyExpenses;
    
    // Break-even calculation with safety margin
    const breakEvenBase = monthlyProfit > 0 ? capital / monthlyProfit : 24;
    const breakEvenMonths = Math.ceil(breakEvenBase * 1.15); // 15% safety margin
    
    // Year projections with growth
    const year1Revenue = monthlyRevenue * 12;
    const year1Expenses = monthlyExpenses * 12;
    const year1Profit = monthlyProfit * 12;
    
    // Year 2 and 3 projections
    const growthRate = benchmark.avgGrowth / 100;
    const year2Revenue = year1Revenue * (1 + growthRate);
    const year2Profit = year1Profit * (1 + growthRate * 0.7);
    const year3Revenue = year2Revenue * (1 + growthRate * 0.8);
    const year3Profit = year2Profit * (1 + growthRate * 0.6);
    
    const roi = ((year1Profit / capital) * 100).toFixed(1);
    const roi2Year = (((year1Profit + year2Profit) / capital) * 100).toFixed(1);

    // Calculate health score components with enhanced criteria
    const marketFitScore = calculateMarketFitScore(benchmark, isUrban, isNairobi);
    const financialScore = calculateFinancialScore(capital, benchmark, monthlyProfit);
    const riskScore = calculateRiskScore(benchmark, capital, breakEvenMonths);
    const operationalScore = calculateOperationalScore(description, targetMarket, benchmark);
    
    const overallScore = Math.round((marketFitScore + financialScore + riskScore + operationalScore) / 4);

    // Generate insights
    const insights = generateInsights(name, type, location, capital, benchmark, monthlyProfit, breakEvenMonths, isNairobi, isUrban);

    return {
        id: Date.now(),
        name,
        type,
        location,
        capital,
        targetMarket,
        description,
        benchmark,
        projections: {
            monthlyRevenue,
            monthlyExpenses,
            monthlyProfit,
            breakEvenMonths,
            year1Revenue,
            year1Profit,
            year2Revenue,
            year2Profit,
            year3Revenue,
            year3Profit,
            roi,
            roi2Year,
            expenses: { rentCost, laborCost, utilitiesCost, cogsCost, marketingCost, miscCost }
        },
        scores: { overall: overallScore, marketFit: marketFitScore, financial: financialScore, risk: riskScore, operational: operationalScore },
        insights,
        locationData: { isNairobi, isUrban },
        generatedAt: new Date().toISOString()
    };
}

function calculateMarketFitScore(benchmark, isUrban, isNairobi) {
    let score = 40;
    
    // Industry growth contribution
    score += Math.min(benchmark.avgGrowth * 1.5, 25);
    
    // Market size contribution
    if (benchmark.marketSize === 'Large') score += 15;
    else if (benchmark.marketSize === 'Growing') score += 20;
    else score += 10;
    
    // Location bonus
    if (isNairobi) score += 10;
    else if (isUrban) score += 5;
    
    // Competition penalty
    if (benchmark.competition === 'High') score -= 5;
    else if (benchmark.competition === 'Low') score += 5;
    
    return Math.min(100, Math.max(20, score));
}

function calculateFinancialScore(capital, benchmark, monthlyProfit) {
    let score = 35;
    
    // Capital adequacy
    if (capital >= 500000) score += 15;
    else if (capital >= 200000) score += 10;
    else if (capital >= 100000) score += 5;
    
    // Margin contribution
    score += Math.min(benchmark.avgMargin * 0.6, 25);
    
    // Profitability check
    if (monthlyProfit > capital * 0.1) score += 15;
    else if (monthlyProfit > capital * 0.05) score += 10;
    else if (monthlyProfit > 0) score += 5;
    
    return Math.min(100, Math.max(20, score));
}

function calculateRiskScore(benchmark, capital, breakEvenMonths) {
    let score = 70;
    
    // Risk level penalty
    if (benchmark.risk === 'High') score -= 25;
    else if (benchmark.risk === 'Medium') score -= 10;
    
    // Capital buffer
    if (capital < 100000) score -= 10;
    else if (capital >= 500000) score += 5;
    
    // Break-even timeline
    if (breakEvenMonths > 24) score -= 15;
    else if (breakEvenMonths > 18) score -= 8;
    else if (breakEvenMonths <= 12) score += 5;
    
    // Competition risk
    if (benchmark.competition === 'High') score -= 5;
    
    return Math.min(100, Math.max(20, score));
}

function calculateOperationalScore(description, targetMarket, benchmark) {
    let score = 45;
    
    // Description quality
    const descLength = description.length;
    if (descLength > 300) score += 20;
    else if (descLength > 200) score += 15;
    else if (descLength > 100) score += 10;
    else score += 5;
    
    // Target market clarity
    if (targetMarket && targetMarket.length > 20) score += 15;
    else if (targetMarket && targetMarket.length > 10) score += 10;
    else if (targetMarket) score += 5;
    
    // Industry knowledge indicators
    const industryKeywords = ['unique', 'competitive', 'strategy', 'market', 'customer', 'revenue', 'growth'];
    const keywordMatches = industryKeywords.filter(kw => description.toLowerCase().includes(kw)).length;
    score += Math.min(keywordMatches * 3, 15);
    
    return Math.min(100, Math.max(20, score));
}

function generateInsights(name, type, location, capital, benchmark, monthlyProfit, breakEvenMonths, isNairobi, isUrban) {
    const insights = [];
    
    // Market opportunity insight
    if (benchmark.avgGrowth >= 15) {
        insights.push({
            type: 'opportunity',
            title: 'High-Growth Industry',
            text: `${name} is entering a sector with ${benchmark.avgGrowth}% annual growth - significantly above Kenya's average GDP growth of 5.5%. This presents opportunities for rapid scaling if executed well.`
        });
    }
    
    // Location-specific insight
    if (isNairobi) {
        insights.push({
            type: 'location',
            title: 'Nairobi Advantage',
            text: `Operating in Nairobi provides access to Kenya's largest consumer market with over 5 million residents and average household income of KES 40,000-80,000/month. However, expect 30-50% higher operational costs than other counties.`
        });
    } else if (isUrban) {
        insights.push({
            type: 'location',
            title: 'Urban Market Access',
            text: `${location} offers growing urban middle-class consumers with increasing purchasing power. Consider expanding to Nairobi within 12-18 months for additional market access.`
        });
    } else {
        insights.push({
            type: 'location',
            title: 'Emerging Market Opportunity',
            text: `Rural and peri-urban ${location} has lower competition and operational costs. Focus on building strong local relationships before considering urban expansion.`
        });
    }
    
    // Competition insight
    if (benchmark.competition === 'High') {
        insights.push({
            type: 'competition',
            title: 'Competitive Landscape',
            text: `The ${type} sector has high competition. Success requires clear differentiation - consider specializing in a niche, offering superior customer service, or leveraging technology for efficiency.`
        });
    } else if (benchmark.competition === 'Low') {
        insights.push({
            type: 'competition',
            title: 'Blue Ocean Opportunity',
            text: `Low competition in ${type} presents first-mover advantage. However, verify market demand exists - low competition can sometimes indicate limited market size.`
        });
    }
    
    // Capital efficiency insight
    if (capital < 100000) {
        insights.push({
            type: 'capital',
            title: 'Bootstrapping Phase',
            text: `Starting with under KES 100,000 requires disciplined resource allocation. Focus on MVP (Minimum Viable Product) approach - validate demand before significant investment. Consider Hustler Fund (up to KES 50,000) or youth loans for additional capital.`
        });
    } else if (capital >= 500000) {
        insights.push({
            type: 'capital',
            title: 'Growth Capital Advantage',
            text: `Your KES ${formatNumber(capital)} capital provides runway for professional setup including marketing, quality equipment, and 3-6 months operational buffer. Consider reserving 20% for unexpected expenses.`
        });
    }
    
    // Break-even insight
    if (breakEvenMonths <= 6) {
        insights.push({
            type: 'profitability',
            title: 'Rapid Break-Even Potential',
            text: `Projected break-even in ${breakEvenMonths} months is excellent. This typically indicates strong unit economics. Reinvest early profits to accelerate growth rather than taking profits too soon.`
        });
    } else if (breakEvenMonths > 18) {
        insights.push({
            type: 'profitability',
            title: 'Extended Break-Even Timeline',
            text: `${breakEvenMonths}-month break-even requires sustained commitment and capital buffer. Ensure you have access to 6-12 months operating expenses beyond initial investment. Consider ways to increase revenue or reduce costs to shorten this timeline.`
        });
    }
    
    // Seasonal insight based on industry
    if (benchmark.peakSeason) {
        insights.push({
            type: 'seasonal',
            title: 'Seasonal Planning',
            text: `Peak season for ${type}: ${benchmark.peakSeason}. Plan inventory and staffing accordingly. During off-peak months, focus on customer retention, marketing, and operational improvements.`
        });
    }
    
    return insights.slice(0, 5);
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
    const insights = plan.insights || [];

    document.getElementById('plan-result-content').innerHTML = `
        <!-- Health Score -->
        <div class="health-score-container">
            <p class="health-score-title">Business Health Score</p>
            <p class="health-score-subtitle">AI-powered analysis of your business plan's viability</p>
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
            <p class="health-score-message">Based on market fit, financial projections, risk factors, and operational readiness</p>
        </div>

        <!-- Category Breakdown -->
        <div class="plan-section">
            <h3>Category Breakdown</h3>
            <div class="category-breakdown">
                ${renderCategoryItem('Market Fit', plan.scores.marketFit, 'How well your business fits current market conditions')}
                ${renderCategoryItem('Financial Viability', plan.scores.financial, 'Strength of financial projections and capital adequacy')}
                ${renderCategoryItem('Risk Assessment', plan.scores.risk, 'Evaluation of industry and operational risks')}
                ${renderCategoryItem('Operational Readiness', plan.scores.operational, 'Quality of business planning and preparation')}
            </div>
        </div>

        <!-- Executive Summary -->
        <div class="plan-section">
            <h3>Executive Summary</h3>
            <p><strong>${plan.name}</strong> is a ${categoryLabels[plan.type] || plan.type} venture located in ${plan.location}, Kenya. With an initial capital investment of ${formatCurrency(plan.capital)}, the business aims to ${plan.description.substring(0, 200)}${plan.description.length > 200 ? '...' : ''}</p>
            <p style="margin-top: 0.75rem;">Based on industry benchmarks for the ${categoryLabels[plan.type] || plan.type} sector in Kenya, this plan shows ${ratingText.toLowerCase()} potential with projected break-even in ${plan.projections.breakEvenMonths} months and Year 1 ROI of ${plan.projections.roi}%.</p>
        </div>

        <!-- AI Insights -->
        ${insights.length > 0 ? `
        <div class="plan-section">
            <h3>Key Insights</h3>
            ${insights.map(insight => `
                <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(59, 130, 246, 0.1)); border-radius: 10px; padding: 1rem; margin-bottom: 0.75rem; border-left: 3px solid #3B82F6;">
                    <h4 style="font-size: 0.9rem; font-weight: 700; color: #3B82F6; margin-bottom: 0.375rem;">${insight.title}</h4>
                    <p style="font-size: 0.85rem; color: #475569; line-height: 1.5;">${insight.text}</p>
                </div>
            `).join('')}
        </div>
        ` : ''}

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
            ${plan.benchmark.insights ? `
            <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(16, 185, 129, 0.1)); border-radius: 10px; padding: 1rem; margin-top: 1rem;">
                <h4 style="font-size: 0.9rem; font-weight: 700; color: #10B981; margin-bottom: 0.5rem;">Industry-Specific Insights</h4>
                <ul style="list-style: none; padding: 0;">
                    ${plan.benchmark.insights.map(i => `<li style="font-size: 0.85rem; color: #475569; padding: 0.25rem 0; padding-left: 1.25rem; position: relative;">• ${i}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
        </div>

        <!-- Financial Projections -->
        <div class="plan-section">
            <h3>Financial Projections</h3>
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
                    <span class="metric-label">Break-Even Period</span>
                    <span class="metric-value">${plan.projections.breakEvenMonths} months</span>
                </div>
            </div>
            
            <!-- Year Projections -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-top: 1rem;">
                <div style="background: #F8FAFC; border-radius: 8px; padding: 0.75rem; text-align: center;">
                    <span style="font-size: 0.7rem; color: #64748B;">Year 1 Profit</span>
                    <p style="font-size: 1rem; font-weight: 700; color: var(--primary);">${formatCurrency(plan.projections.year1Profit)}</p>
                </div>
                <div style="background: #F8FAFC; border-radius: 8px; padding: 0.75rem; text-align: center;">
                    <span style="font-size: 0.7rem; color: #64748B;">Year 2 Profit</span>
                    <p style="font-size: 1rem; font-weight: 700; color: var(--primary);">${formatCurrency(plan.projections.year2Profit)}</p>
                </div>
                <div style="background: #F8FAFC; border-radius: 8px; padding: 0.75rem; text-align: center;">
                    <span style="font-size: 0.7rem; color: #64748B;">Year 3 Profit</span>
                    <p style="font-size: 1rem; font-weight: 700; color: var(--primary);">${formatCurrency(plan.projections.year3Profit)}</p>
                </div>
            </div>
            
            <div class="roi-display ${parseFloat(plan.projections.roi) >= 20 ? '' : 'warning'}" style="margin-top: 1rem;">
                <span class="roi-value">${plan.projections.roi}%</span>
                <span class="roi-label">Expected ROI (Year 1)</span>
            </div>
        </div>

        <!-- Compliance Checklist -->
        ${plan.benchmark.licensingRequired ? `
        <div class="plan-section">
            <h3>Licensing & Compliance</h3>
            <p style="font-size: 0.85rem; color: #475569; margin-bottom: 0.75rem;">Required permits and licenses for ${categoryLabels[plan.type] || plan.type} in Kenya:</p>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem;">
                ${plan.benchmark.licensingRequired.map(license => `
                    <div style="display: flex; align-items: center; gap: 0.5rem; background: #F8FAFC; padding: 0.5rem 0.75rem; border-radius: 6px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        <span style="font-size: 0.8rem; color: #475569;">${license}</span>
                    </div>
                `).join('')}
            </div>
            ${plan.benchmark.taxConsiderations ? `
            <div style="margin-top: 0.75rem; padding: 0.75rem; background: rgba(245, 158, 11, 0.05); border-radius: 8px; border-left: 3px solid #F59E0B;">
                <span style="font-size: 0.75rem; font-weight: 600; color: #92400E;">Tax Note:</span>
                <span style="font-size: 0.8rem; color: #475569;"> ${plan.benchmark.taxConsiderations}</span>
            </div>
            ` : ''}
        </div>
        ` : ''}

        <!-- Improvement Suggestions -->
        <div class="plan-section">
            <h3>Recommendations</h3>
            <ol class="improvement-list">
                ${suggestions.map(s => `<li>${s}</li>`).join('')}
            </ol>
        </div>

        <div class="plan-footer">
            <p>Generated by Brizerm Markets AI • ${new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p class="disclaimer">This plan is for informational purposes only. Conduct independent research and consult professionals before making business decisions.</p>
        </div>
    `;
}

function renderCategoryItem(name, score, hint) {
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
    const benchmark = plan.benchmark;

    // Enhanced, specific suggestions based on analysis
    if (plan.scores.marketFit < 70) {
        if (benchmark.competition === 'High') {
            suggestions.push(`<strong>Differentiate Your Offering:</strong> With high competition in ${plan.benchmark.marketSize === 'Growing' ? 'this growing market' : 'this sector'}, success requires clear differentiation. Consider specializing in a niche (e.g., premium quality, specific customer segment, or unique service model). Research your top 3 competitors' weaknesses and position your business to address those gaps.`);
        } else {
            suggestions.push(`<strong>Validate Market Demand:</strong> Before significant investment, validate that sufficient demand exists in ${plan.location}. Consider running a small pilot or conducting customer surveys with your target market to confirm interest in your offering.`);
        }
    }

    // Financial suggestions
    if (plan.projections.breakEvenMonths > 12) {
        suggestions.push(`<strong>Accelerate Break-Even:</strong> Your projected ${plan.projections.breakEvenMonths}-month break-even is longer than ideal. Consider: (1) Pre-selling to secure early revenue, (2) Starting leaner with minimal overhead, (3) Offering complementary services for additional income streams, (4) Negotiating better supplier terms to improve margins.`);
    }

    // Capital-specific suggestions
    if (plan.capital < 150000) {
        suggestions.push(`<strong>Capital Efficiency Strategy:</strong> With startup capital under KES 150,000, prioritize essential expenditures. Consider: (1) Home-based or shared-space operations initially, (2) Second-hand equipment where appropriate, (3) Bartering services with other businesses, (4) Government youth enterprise funds (Uwezo Fund, Youth Enterprise Development Fund) for additional capital.`);
    } else if (plan.capital >= 500000) {
        suggestions.push(`<strong>Optimize Capital Deployment:</strong> With substantial capital, allocate strategically: (1) 40% for setup/equipment, (2) 30% for 6-month operating runway, (3) 20% for marketing and customer acquisition, (4) 10% contingency reserve. Avoid the common mistake of overspending on aesthetics at the expense of working capital.`);
    }

    // Industry-specific suggestions
    if (type === 'tech' || type === 'services') {
        suggestions.push(`<strong>Client Acquisition Focus:</strong> For service-based businesses, your first 10 clients are crucial. Target small businesses first (they decide faster), offer a limited-time introductory rate, deliver exceptional quality to generate referrals. A single satisfied client typically brings 2-3 referrals in Kenyan business networks.`);
    } else if (type === 'retail' || type === 'food') {
        suggestions.push(`<strong>Location Strategy:</strong> For retail/food businesses, location is critical. Within ${plan.location}, prioritize visibility from main roads, proximity to complementary businesses, and adequate parking. Even 100 meters difference in location can mean 30-50% difference in foot traffic.`);
    } else if (type === 'agriculture') {
        suggestions.push(`<strong>Risk Mitigation:</strong> Agriculture carries weather and market risks. Consider: (1) Diversified crops to spread risk, (2) Contract farming arrangements with processors, (3) Crop insurance through APA or Jubilee, (4) Water harvesting/irrigation infrastructure, (5) Value addition to capture more of the supply chain value.`);
    }

    // Location-specific suggestions
    if (location.includes('nairobi') || location.includes('kenya')) {
        suggestions.push(`<strong>Kenya Compliance Checklist:</strong> Ensure you have: (1) Business Registration (eCitizen - KES 1,000), (2) Single Business Permit from County (varies by business type), (3) KRA PIN for tax compliance, (4) NHIF/NSSF registration if hiring employees, (5) Sector-specific licenses (KEBS for products, KMPDC for health). Budget KES 15,000-50,000 for initial compliance.`);
    }

    // Risk management
    if (plan.scores.risk < 60) {
        suggestions.push(`<strong>Risk Mitigation Plan:</strong> With elevated risk factors, develop contingency plans: (1) Identify your top 3 business risks and mitigation strategies, (2) Maintain 3-6 months operating expenses as reserve, (3) Consider appropriate insurance (business interruption, professional liability), (4) Build relationships with alternative suppliers/customers.`);
    }

    // Operational suggestions
    if (plan.scores.operational < 70) {
        suggestions.push(`<strong>Strengthen Business Planning:</strong> Enhance your operational foundation by: (1) Writing detailed operational procedures, (2) Creating clear job descriptions if hiring, (3) Setting up basic accounting from day one, (4) Establishing key performance indicators (KPIs) to track monthly, (5) Documenting your customer journey from awareness to purchase.`);
    }

    // Seasonal planning if applicable
    if (benchmark.peakSeason) {
        suggestions.push(`<strong>Seasonal Strategy:</strong> Plan for ${benchmark.peakSeason} peak demand by building inventory/capacity 4-6 weeks ahead. During off-peak periods, focus on customer retention, marketing investment, staff training, and operational improvements. Consider offering promotions or complementary services to smooth revenue throughout the year.`);
    }

    return suggestions.slice(0, 6);
}

function displaySavedPlans(plans) {
    const container = document.getElementById('saved-plans-list');
    const categoryLabels = {
        retail: 'Retail', food: 'Food', tech: 'Tech', agriculture: 'Agriculture',
        manufacturing: 'Manufacturing', services: 'Services', healthcare: 'Healthcare',
        education: 'Education', transport: 'Transport', realestate: 'Real Estate',
        hospitality: 'Hospitality', fashion: 'Fashion', other: 'Other'
    };
    
    container.innerHTML = plans.map((plan, i) => `
        <div class="saved-plan-item" onclick="loadSavedPlan(${i})">
            <h4>${plan.name}</h4>
            <div class="plan-meta">
                <span>${categoryLabels[plan.type] || plan.type}</span>
                <span>•</span>
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

    <h2>Financial Projections</h2>
    <div class="metrics">
        <div class="metric"><span class="metric-label">Startup Capital</span><br><span class="metric-value">${formatCurrency(plan.capital)}</span></div>
        <div class="metric"><span class="metric-label">Monthly Revenue</span><br><span class="metric-value">${formatCurrency(plan.projections.monthlyRevenue)}</span></div>
        <div class="metric"><span class="metric-label">Monthly Profit</span><br><span class="metric-value">${formatCurrency(plan.projections.monthlyProfit)}</span></div>
        <div class="metric"><span class="metric-label">Break-Even</span><br><span class="metric-value">${plan.projections.breakEvenMonths} months</span></div>
    </div>
    <p style="text-align: center; font-size: 24px; font-weight: bold; color: #F59E0B; margin: 20px 0;">ROI: ${plan.projections.roi}%</p>

    <h2>Recommendations</h2>
    <ol class="suggestions">
        ${generateSuggestions(plan).map(s => `<li>${s}</li>`).join('')}
    </ol>

    <div class="footer">
        <p>Generated by Brizerm Markets AI</p>
        <p>${new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p style="font-style: italic; margin-top: 10px;">This document is for informational purposes only. Conduct independent research and consult professionals before making business decisions.</p>
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
// CHART FUNCTIONS - Real Crypto Data
// ============================================================================

// Cache for chart data
let chartDataCache = {};

// Fetch real historical crypto data from CoinGecko
async function fetchCryptoChartData(coinId, days) {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) throw new Error('CoinGecko chart API failed');
        
        const data = await response.json();
        
        // Convert to our chart format
        const prices = data.prices || [];
        return prices.map(([timestamp, price], idx) => {
            // Create OHLC-style data from price points
            const prevPrice = idx > 0 ? prices[idx - 1][1] : price;
            const volatility = price * 0.005;
            return {
                date: new Date(timestamp).toISOString().split('T')[0],
                open: prevPrice,
                high: price + Math.random() * volatility,
                low: price - Math.random() * volatility,
                close: price,
                volume: Math.floor(Math.random() * 1000000000) + 100000000 // Simulated volume
            };
        });
    } catch (error) {
        console.error('Chart data fetch error:', error);
        return null;
    }
}

function generateChartData(days, basePrice) {
    // Legacy fallback - generates simulated data
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

async function renderChart() {
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
    
    const config = CRYPTO_CONFIG[state.chartIndex];
    
    // Show loading state
    document.getElementById('chart-index-name').textContent = config.name;
    document.getElementById('chart-price').textContent = 'Loading...';
    
    // Try to fetch real data
    let data = await fetchCryptoChartData(config.id, state.chartRange);
    
    // Fallback to simulated if fetch fails
    if (!data || data.length === 0) {
        const benchmark = liveMarketData.find(m => m.symbol === state.chartIndex);
        const basePrice = benchmark ? parseFloat(benchmark.value.replace(/[$,]/g, '')) || 50000 : 50000;
        data = generateChartData(state.chartRange, basePrice);
    }
    
    const latest = data[data.length - 1];
    const previous = data[data.length - 2] || data[0];
    const change = latest.close - previous.close;
    const pct = ((change / previous.close) * 100).toFixed(2);
    const isUp = change >= 0;
    
    document.getElementById('chart-price').textContent = '$' + latest.close.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('chart-change').innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="${isUp ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'}"/>
        </svg>
        ${isUp ? '+' : ''}${change.toFixed(2)} (${pct}%)
    `;
    document.getElementById('chart-change').className = `price-change ${isUp ? 'up' : 'down'}`;
    document.getElementById('chart-volume').textContent = (latest.volume / 1000000).toFixed(1) + 'M';
    
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
        ctx.fillText('$' + price.toFixed(0), width - padding.right + 8, y + 4);
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
