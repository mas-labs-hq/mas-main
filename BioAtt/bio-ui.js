
// =====================================================
// LICENSE SYSTEM v4.0 (UNCHANGED - DO NOT MODIFY)
// =====================================================
const licenseSystem = {
    fetchWithTimeout: async function(url, options, timeout) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        try {
            const response = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timeoutId);
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server returned non-JSON response');
            }
            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    },

    calculateDaysRemaining: function(expirationDate) {
        if (!expirationDate) return null;
        const now = new Date();
        const expiration = new Date(expirationDate);
        const diffMs = expiration - now;
        return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    },

    isLicenseExpired: function(expirationDate) {
        if (!expirationDate) return false;
        return new Date() >= new Date(expirationDate);
    },

    getCachedLicense: function() {
        try {
            const cached = localStorage.getItem(STORAGE_KEYS.cachedLicense);
            if (cached) return JSON.parse(cached);
        } catch (e) { console.log('Cache read error:', e); }
        return null;
    },

    setCachedLicense: function(license) {
        try {
            localStorage.setItem(STORAGE_KEYS.cachedLicense, JSON.stringify(license));
            localStorage.setItem(STORAGE_KEYS.lastOnlineCheck, Date.now().toString());
            if (license.expires_at) {
                localStorage.setItem(STORAGE_KEYS.expirationDate, license.expires_at);
            }
            if (license.tier_name) {
                localStorage.setItem('bioattex_cached_tier', license.tier_name);
            }
            if (license.is_perpetual) {
                localStorage.setItem('bioattex_is_perpetual', 'true');
            }
            if (!localStorage.getItem(STORAGE_KEYS.firstActivationDate)) {
                localStorage.setItem(STORAGE_KEYS.firstActivationDate, Date.now().toString());
            }
        } catch (e) { console.log('Cache write error:', e); }
    },

    getLastOnlineCheck: function() {
        const lastCheck = localStorage.getItem(STORAGE_KEYS.lastOnlineCheck);
        return lastCheck ? parseInt(lastCheck) : 0;
    },

    hasBeenOfflineTooLong: function() {
        const lastCheck = this.getLastOnlineCheck();
        if (lastCheck === 0) return true;
        const daysSinceLastCheck = (Date.now() - lastCheck) / (1000 * 60 * 60 * 24);
        return daysSinceLastCheck > MAX_OFFLINE_DAYS;
    },

    getDaysSinceLastOnlineCheck: function() {
        const lastCheck = this.getLastOnlineCheck();
        if (lastCheck === 0) return 999;
        return Math.floor((Date.now() - lastCheck) / (1000 * 60 * 60 * 24));
    },

    clearLicenseData: function() {
        localStorage.removeItem(STORAGE_KEYS.key);
        localStorage.removeItem(STORAGE_KEYS.company);
        localStorage.removeItem(STORAGE_KEYS.lastOnlineCheck);
        localStorage.removeItem(STORAGE_KEYS.cachedLicense);
        localStorage.removeItem(STORAGE_KEYS.expirationDate);
        localStorage.removeItem(STORAGE_KEYS.firstActivationDate);
        localStorage.removeItem('bioattex_cached_tier');
        localStorage.removeItem('bioattex_is_perpetual');
    },

    generateDeviceFingerprint: function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('fingerprint', 2, 2);
        const components = [navigator.userAgent, navigator.language, navigator.hardwareConcurrency || '', screen.width + 'x' + screen.height, screen.colorDepth || '', new Date().getTimezoneOffset(), canvas.toDataURL()];
        let fingerprint = components.join('|');
        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'DEV-' + Math.abs(hash).toString(36).toUpperCase();
    },

    getDeviceFingerprint: function() {
        let fingerprint = localStorage.getItem(STORAGE_KEYS.fingerprint);
        if (!fingerprint) {
            fingerprint = this.generateDeviceFingerprint();
            localStorage.setItem(STORAGE_KEYS.fingerprint, fingerprint);
        }
        return fingerprint;
    },

    async validateLicense(licenseKey, companyName) {
        const fingerprint = this.getDeviceFingerprint();
        try {
            return await this.fetchWithTimeout(API_BASE_URL + '/api/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ licenseKey: licenseKey, deviceFingerprint: fingerprint, companyName: companyName })
            }, API_TIMEOUT);
        } catch (error) {
            console.error('License validation error:', error);
            return { success: false, error: 'NETWORK_ERROR', message: 'Unable to connect to license server.' };
        }
    },

    async checkLicenseStatus(licenseKey) {
        const fingerprint = this.getDeviceFingerprint();
        try {
            const response = await this.fetchWithTimeout(API_BASE_URL + '/api/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ licenseKey: licenseKey, deviceFingerprint: fingerprint })
            }, API_TIMEOUT);
            if (response.error === 'DATABASE_ERROR' || response.error === 'CONNECTION_ERROR' || (response.message && (response.message.includes('database') || response.message.includes('connection')))) {
                return { success: false, error: 'DATABASE_ERROR', message: 'License server temporarily unavailable.' };
            }
            return response;
        } catch (error) {
            console.error('License check error:', error);
            return { success: false, error: 'NETWORK_ERROR', message: 'Unable to verify license status.' };
        }
    },

    init: async function() {
        const licenseScreen = document.getElementById('license-screen');
        const savedKey = localStorage.getItem(STORAGE_KEYS.key);
        
        if (!savedKey) {
            licenseScreen.style.display = 'flex';
            return;
        }

        const storedExpirationDate = localStorage.getItem(STORAGE_KEYS.expirationDate);
        
        if (storedExpirationDate && this.isLicenseExpired(storedExpirationDate)) {
            this.clearLicenseData();
            licenseScreen.style.display = 'flex';
            document.getElementById('license-error').textContent = 'Your license has expired. Please renew to continue.';
            return;
        }

        if (this.hasBeenOfflineTooLong()) {
            try {
                const status = await this.checkLicenseStatus(savedKey);
                if (status.success) {
                    this.setCachedLicense(status);
                    const licenseInfo = { tier: { name: status.tier_name }, daysRemaining: status.days_remaining, isPerpetual: status.is_perpetual, company: status.company };
                    this.bootSystem(licenseInfo, false);
                    return;
                } else if (status.error === 'REVOKED') {
                    this.clearLicenseData();
                    licenseScreen.style.display = 'flex';
                    document.getElementById('license-error').textContent = 'Your license has been revoked.';
                    return;
                } else if (status.error === 'EXPIRED') {
                    this.clearLicenseData();
                    licenseScreen.style.display = 'flex';
                    document.getElementById('license-error').textContent = 'Your license has expired.';
                    return;
                } else {
                    licenseScreen.style.display = 'flex';
                    document.getElementById('license-error').textContent = 'Please connect to verify your license. (Offline limit: ' + MAX_OFFLINE_DAYS + ' days exceeded)';
                    return;
                }
            } catch (error) {
                licenseScreen.style.display = 'flex';
                document.getElementById('license-error').textContent = 'Please connect to verify your license. (Offline limit exceeded)';
                return;
            }
        }

        try {
            const status = await this.checkLicenseStatus(savedKey);
            if (status.success) {
                this.setCachedLicense(status);
                const licenseInfo = { tier: { name: status.tier_name }, daysRemaining: status.days_remaining, isPerpetual: status.is_perpetual, company: status.company };
                this.bootSystem(licenseInfo, false);
                return;
            } else {
                if (status.error === 'REVOKED') {
                    this.clearLicenseData();
                    licenseScreen.style.display = 'flex';
                    document.getElementById('license-error').textContent = 'Your license has been revoked.';
                    return;
                } else if (status.error === 'EXPIRED') {
                    this.clearLicenseData();
                    licenseScreen.style.display = 'flex';
                    document.getElementById('license-error').textContent = 'Your license has expired.';
                    return;
                } else if (status.error === 'NOT_ACTIVATED') {
                    localStorage.removeItem(STORAGE_KEYS.key);
                    localStorage.removeItem(STORAGE_KEYS.company);
                    licenseScreen.style.display = 'flex';
                    return;
                } else if (status.error === 'INVALID_KEY') {
                    this.clearLicenseData();
                    licenseScreen.style.display = 'flex';
                    document.getElementById('license-error').textContent = 'Invalid license key.';
                    return;
                } else if (status.error === 'MAX_DEVICES' || status.error === 'DEVICE_MISMATCH') {
                    this.clearLicenseData();
                    licenseScreen.style.display = 'flex';
                    document.getElementById('license-error').textContent = 'This license is not valid for this device.';
                    return;
                }
            }
        } catch (error) {
            console.log('Server check failed, using offline mode:', error);
        }

        const cachedLicense = this.getCachedLicense();
        const expirationDate = localStorage.getItem(STORAGE_KEYS.expirationDate);
        const tierName = localStorage.getItem('bioattex_cached_tier');
        const isPerpetual = localStorage.getItem('bioattex_is_perpetual') === 'true';
        
        if (cachedLicense && (expirationDate || isPerpetual)) {
            if (expirationDate && this.isLicenseExpired(expirationDate)) {
                this.clearLicenseData();
                licenseScreen.style.display = 'flex';
                document.getElementById('license-error').textContent = 'Your license has expired.';
                return;
            }
            
            const offlineLicense = {
                tier: { name: (tierName || cachedLicense.tier_name || 'Licensed') + ' (Offline)' },
                daysRemaining: expirationDate ? this.calculateDaysRemaining(expirationDate) : null,
                isPerpetual: isPerpetual,
                company: cachedLicense.company
            };
            
            this.bootSystem(offlineLicense, false);
            return;
        }

        licenseScreen.style.display = 'flex';
        document.getElementById('license-error').textContent = 'Please connect to the internet to activate your license.';
    },

    storeLicense: function(key, company) {
        localStorage.setItem(STORAGE_KEYS.key, key);
        if (company) localStorage.setItem(STORAGE_KEYS.company, company);
    },

    verify: function() {
        const keyInput = document.getElementById('license-key');
        const companyInput = document.getElementById('company-name');
        const errorDiv = document.getElementById('license-error');
        const infoBox = document.getElementById('license-info-box');
        const tierInfo = document.getElementById('license-tier-info');
        const durationInfo = document.getElementById('license-duration-info');
        const warningBox = document.getElementById('license-warning-box');
        const verifyBtn = document.getElementById('btn-verify-license');
        
        const keyValue = keyInput.value.trim();
        const companyValue = companyInput.value.trim();
        
        if (!keyValue) {
            errorDiv.textContent = 'Please enter a license key';
            keyInput.classList.add('error');
            setTimeout(() => keyInput.classList.remove('error'), 500);
            return;
        }
        
        if (!companyValue) {
            errorDiv.textContent = 'Please enter your company name';
            companyInput.classList.add('error');
            setTimeout(() => companyInput.classList.remove('error'), 500);
            return;
        }
        
        verifyBtn.disabled = true;
        verifyBtn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px;margin:0 auto;"></div>';
        
        this.validateLicense(keyValue, companyValue).then(result => {
            if (result.success) {
                errorDiv.textContent = '';
                keyInput.style.borderColor = 'var(--success)';
                tierInfo.textContent = 'Tier: ' + result.tier_name;
                durationInfo.textContent = result.is_perpetual ? 'Duration: Perpetual (never expires)' : 'Duration: ' + result.days_remaining + ' days remaining';
                warningBox.textContent = 'Licensed to "' + result.company + '". This key is bound to this device.';
                infoBox.style.display = 'block';
                verifyBtn.innerHTML = 'Activating...';
                
                setTimeout(() => {
                    this.storeLicense(keyValue.toUpperCase(), companyValue);
                    this.setCachedLicense(result);
                    this.bootSystem({ tier: { name: result.tier_name }, daysRemaining: result.days_remaining, isPerpetual: result.is_perpetual, company: result.company }, true);
                }, 1000);
            } else {
                errorDiv.textContent = result.message || 'License validation failed';
                keyInput.classList.add('error');
                keyInput.style.borderColor = 'var(--danger)';
                setTimeout(() => keyInput.classList.remove('error'), 500);
                keyInput.value = '';
                verifyBtn.disabled = false;
                verifyBtn.innerHTML = '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Activate License';
            }
        });
    },

    bootSystem: function(licenseInfo, showInstallPrompt) {
        const licenseScreen = document.getElementById('license-screen');
        const loadingScreen = document.getElementById('loading-screen');
        const loadingStatus = document.getElementById('loading-status');
        
        if (licenseScreen.style.display !== 'none') {
            licenseScreen.style.opacity = '0';
            licenseScreen.style.transition = 'opacity 0.3s ease';
            setTimeout(() => licenseScreen.style.display = 'none', 300);
        }
        
        loadingScreen.style.display = 'flex';
        loadingScreen.style.opacity = '1';

        loadingStatus.textContent = 'Loading database...';
        db.init();
        
        loadingStatus.textContent = 'Initializing systems...';
        soundManager.init();
        darkModeManager.init();
        clockManager.init();
        
        loadingStatus.textContent = 'Loading neural models...';
        neuralEngine.loadModels().then(() => {
            loadingStatus.textContent = 'Preparing interface...';
            admin.renderEmpList();
            admin.updateStats();
            admin.renderGallery();
            admin.updateLatecomers();
            chartsManager.init();
            calendarManager.init();
            this.updateHeaderBadge(licenseInfo);
            
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    document.getElementById('main-header').style.display = 'flex';
                    document.getElementById('main-content').style.display = 'flex';
                    document.getElementById('main-footer').style.display = 'block';
                    document.getElementById('nav-dark-mode').classList.remove('hidden');
                    document.getElementById('nav-calendar').classList.remove('hidden');
                    if (showInstallPrompt) setTimeout(() => installManager.showPopup(), 500);
                }, 500);
            }, 800);
        }).catch(err => {
            console.error('Model loading error:', err);
            loadingStatus.textContent = 'Warning: Some features may not work';
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    document.getElementById('main-header').style.display = 'flex';
                    document.getElementById('main-content').style.display = 'flex';
                    document.getElementById('main-footer').style.display = 'block';
                    this.updateHeaderBadge(licenseInfo);
                    if (showInstallPrompt) setTimeout(() => installManager.showPopup(), 500);
                }, 500);
            }, 1000);
        });
    },
    
    updateHeaderBadge: function(licenseInfo) {
        const badge = document.getElementById('header-license-badge');
        if (!badge || !licenseInfo) return;
        
        let daysRemaining = licenseInfo.daysRemaining;
        const expirationDate = localStorage.getItem(STORAGE_KEYS.expirationDate);
        
        if (expirationDate && !licenseInfo.isPerpetual) {
            daysRemaining = this.calculateDaysRemaining(expirationDate);
        }
        
        if (licenseInfo.isPerpetual) {
            badge.textContent = (licenseInfo.tier.name || '').replace(' (Offline)', '');
            badge.classList.remove('expiring', 'expired');
        } else if (daysRemaining !== null && daysRemaining !== undefined) {
            const tierName = (licenseInfo.tier.name || '').replace(' (Offline)', '');
            if (daysRemaining <= 0) {
                badge.textContent = 'Expired';
                badge.classList.add('expired');
                badge.classList.remove('expiring');
            } else if (daysRemaining <= 14) {
                badge.textContent = tierName + ' - ' + daysRemaining + ' days';
                badge.classList.add('expiring');
                badge.classList.remove('expired');
            } else {
                badge.textContent = tierName + ' - ' + daysRemaining + ' days';
                badge.classList.remove('expiring', 'expired');
            }
        } else {
            badge.textContent = (licenseInfo.tier.name || 'Licensed').replace(' (Offline)', '');
            badge.classList.remove('expiring', 'expired');
        }
    }
};


// ================== DB HELPERS ==================
const dbHelpers = {
    removeEmployee: function(id) {
        db.data.employees = db.data.employees.filter(e => e.id !== id);
        db.save();
    }
};

// ================== APP ==================
const app = {
    init: function() { this.bindEvents(); },

    bindEvents: function() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const screen = btn.getAttribute('data-screen');
                if (screen) this.nav(screen);
            });
        });
        
        document.getElementById('btn-cam-toggle').addEventListener('click', () => camera.toggle());
        document.getElementById('btn-checkin').addEventListener('click', () => scanner.initiateScan('check-in'));
        document.getElementById('btn-checkout').addEventListener('click', () => scanner.initiateScan('check-out'));
        document.getElementById('btn-refresh').addEventListener('click', () => this.refreshSystem());
        document.getElementById('btn-admin-login').addEventListener('click', () => admin.login());
        document.getElementById('pin-input').addEventListener('keypress', (e) => { if (e.key === 'Enter') admin.login(); });
        document.getElementById('back-to-home').addEventListener('click', () => this.nav('home'));
        document.getElementById('btn-station-mode').addEventListener('click', () => admin.toggleStationMode());
        document.getElementById('btn-admin-logout').addEventListener('click', () => admin.logout());
        document.getElementById('btn-save-settings').addEventListener('click', () => admin.saveSettings());
        document.getElementById('btn-export').addEventListener('click', () => admin.downloadBackup());
        document.getElementById('btn-import-trigger').addEventListener('click', () => { document.getElementById('import-file').click(); });
        document.getElementById('import-file').addEventListener('change', function() { admin.importBackup(this); });
        document.getElementById('btn-clear-all-data').addEventListener('click', () => { document.getElementById('modal-clear-data').style.display = 'flex'; });
        document.getElementById('btn-cancel-clear-data').addEventListener('click', () => { document.getElementById('modal-clear-data').style.display = 'none'; });
        document.getElementById('btn-confirm-clear-data').addEventListener('click', () => { db.data = { pin: '1234', employees: [], logs: {}, lateThreshold: '09:00', workEndTime: '17:00', overtimeThreshold: 8 }; db.save(); document.getElementById('modal-clear-data').style.display = 'none'; admin.renderEmpList(); admin.updateStats(); admin.renderGallery(); admin.updateLatecomers(); chartsManager.update(); calendarManager.render(); utils.showToast('All data cleared', null, 'success'); });
        document.getElementById('btn-reg-face').addEventListener('click', () => admin.startFaceRegistration());
        document.getElementById('btn-reg-save').addEventListener('click', () => admin.completeRegistration());
        
        document.querySelector('#emp-table tbody').addEventListener('click', (e) => { 
            if (e.target.tagName === 'BUTTON') { 
                const empId = e.target.getAttribute('data-emp-id'); 
                if (empId) admin.deleteEmployee(empId); 
            } 
        });
        
        document.getElementById('btn-clear-records').addEventListener('click', () => records.confirmDelete());
        document.getElementById('btn-cancel-delete').addEventListener('click', () => records.closeDeleteModal());
        document.getElementById('btn-confirm-delete').addEventListener('click', () => records.executeDelete());
        document.getElementById('btn-download-pdf').addEventListener('click', () => records.downloadPDF());
        document.getElementById('btn-cancel-verify').addEventListener('click', () => scanner.cancelVerify());
        document.getElementById('btn-confirm-identity').addEventListener('click', () => scanner.confirmIdentity());
        
        // Search
        document.getElementById('search-records').addEventListener('input', (e) => records.search(e.target.value));
        
        // Calendar
        document.getElementById('btn-prev-month').addEventListener('click', () => calendarManager.prevMonth());
        document.getElementById('btn-next-month').addEventListener('click', () => calendarManager.nextMonth());
        document.getElementById('btn-today').addEventListener('click', () => calendarManager.goToToday());
        
        // Dark Mode
        document.getElementById('nav-dark-mode').addEventListener('click', () => darkModeManager.toggle());
        
        // Install
        document.getElementById('btn-install-desktop').addEventListener('click', () => installManager.showDesktopInstructions());
        document.getElementById('btn-install-mobile').addEventListener('click', () => installManager.showMobileInstructions());
        document.getElementById('btn-install-done').addEventListener('click', () => { const neverRemind = document.getElementById('chk-never-remind').checked; installManager.hidePopup(neverRemind); });
    },

    nav: function(screenId) {
        if ((screenId === 'dashboard' || screenId === 'records' || screenId === 'calendar') && !admin.isLoggedIn) {
            utils.showToast('Admin access required');
            screenId = 'admin-login';
        }
        if (screenId !== 'home' && screenId !== 'dashboard') { camera.stop(); admin.cancelRegistration(); }
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) targetScreen.classList.add('active');
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        const activeBtn = document.querySelector('.nav-btn[data-screen="' + screenId + '"]');
        if (activeBtn) activeBtn.classList.add('active');
        if (screenId === 'records') records.load();
        if (screenId === 'dashboard') { admin.renderEmpList(); admin.updateStats(); admin.renderGallery(); admin.updateLatecomers(); }
        if (screenId === 'calendar') calendarManager.render();
    },

    refreshSystem: function() {
        admin.isLoggedIn = false;
        admin.cancelRegistration();
        document.getElementById('nav-records').classList.add('hidden');
        camera.stop();
        document.getElementById('status-msg').textContent = '';
        this.nav('home');
        utils.showToast('System refreshed');
    }
};

// Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(reg => console.log('Service Worker registered:', reg.scope)).catch(err => console.log('Service Worker failed:', err));
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-verify-license').addEventListener('click', () => licenseSystem.verify());
    document.getElementById('license-key').addEventListener('keypress', (e) => { if (e.key === 'Enter') licenseSystem.verify(); });
    document.getElementById('company-name').addEventListener('keypress', (e) => { if (e.key === 'Enter') licenseSystem.verify(); });
    installManager.init();
    app.init();
    licenseSystem.init();
});