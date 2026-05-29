
// =====================================================
// LICENSE SYSTEM v5.0 (HARDENED - GATE VISIBLE BY DEFAULT)
// No app access without a valid license. Period.
// =====================================================
const licenseSystem = {
    _recheckInterval: null,
    _isLicensed: false,

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
        
        // GATE IS VISIBLE BY DEFAULT. Only hide it when we have CONFIRMED a valid license.
        // No saved key = no access, period.
        if (!savedKey) {
            licenseScreen.style.display = 'flex';
            return;
        }

        const storedExpirationDate = localStorage.getItem(STORAGE_KEYS.expirationDate);
        
        // Expired license = clear and block
        if (storedExpirationDate && this.isLicenseExpired(storedExpirationDate)) {
            this.clearLicenseData();
            licenseScreen.style.display = 'flex';
            document.getElementById('license-error').textContent = 'Your license has expired. Please renew to continue.';
            return;
        }

        // If offline too long, MUST verify online. No offline fallback when limit exceeded.
        if (this.hasBeenOfflineTooLong()) {
            try {
                const status = await this.checkLicenseStatus(savedKey);
                if (status.success) {
                    this._isLicensed = true;
                    this.setCachedLicense(status);
                    const licenseInfo = { tier: { name: status.tier_name }, daysRemaining: status.days_remaining, isPerpetual: status.is_perpetual, company: status.company };
                    this.bootSystem(licenseInfo, false);
                    this.startPeriodicRecheck();
                    return;
                } else {
                    // ANY failure when offline too long = BLOCK. No exceptions.
                    this.clearLicenseData();
                    licenseScreen.style.display = 'flex';
                    if (status.error === 'REVOKED') {
                        document.getElementById('license-error').textContent = 'Your license has been revoked.';
                    } else if (status.error === 'EXPIRED') {
                        document.getElementById('license-error').textContent = 'Your license has expired.';
                    } else {
                        document.getElementById('license-error').textContent = 'Please connect to verify your license. (Offline limit: ' + MAX_OFFLINE_DAYS + ' days exceeded)';
                    }
                    return;
                }
            } catch (error) {
                // Network error + offline too long = BLOCK. No fallback.
                licenseScreen.style.display = 'flex';
                document.getElementById('license-error').textContent = 'Please connect to verify your license. (Offline limit exceeded)';
                return;
            }
        }

        // Try online verification first
        try {
            const status = await this.checkLicenseStatus(savedKey);
            if (status.success) {
                this._isLicensed = true;
                this.setCachedLicense(status);
                const licenseInfo = { tier: { name: status.tier_name }, daysRemaining: status.days_remaining, isPerpetual: status.is_perpetual, company: status.company };
                this.bootSystem(licenseInfo, false);
                this.startPeriodicRecheck();
                return;
            } else {
                // Online check returned a definitive failure - BLOCK
                if (status.error === 'REVOKED' || status.error === 'EXPIRED' || status.error === 'INVALID_KEY') {
                    this.clearLicenseData();
                    licenseScreen.style.display = 'flex';
                    document.getElementById('license-error').textContent = status.message || 'License invalid.';
                    return;
                }
                if (status.error === 'NOT_ACTIVATED') {
                    localStorage.removeItem(STORAGE_KEYS.key);
                    localStorage.removeItem(STORAGE_KEYS.company);
                    licenseScreen.style.display = 'flex';
                    return;
                }
                if (status.error === 'MAX_DEVICES' || status.error === 'DEVICE_MISMATCH') {
                    this.clearLicenseData();
                    licenseScreen.style.display = 'flex';
                    document.getElementById('license-error').textContent = 'This license is not valid for this device.';
                    return;
                }
                // For other server errors (DATABASE_ERROR etc), fall through to offline cache check
            }
        } catch (error) {
            // Network error - fall through to offline cache check
            console.log('Server check failed, checking offline cache:', error);
        }

        // Offline fallback - only allowed if within offline limit AND have cached license
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
            
            this._isLicensed = true;
            const offlineLicense = {
                tier: { name: (tierName || cachedLicense.tier_name || 'Licensed') + ' (Offline)' },
                daysRemaining: expirationDate ? this.calculateDaysRemaining(expirationDate) : null,
                isPerpetual: isPerpetual,
                company: cachedLicense.company
            };
            
            this.bootSystem(offlineLicense, false);
            this.startPeriodicRecheck();
            return;
        }

        // No cached license and no server access = BLOCK
        licenseScreen.style.display = 'flex';
        document.getElementById('license-error').textContent = 'Please connect to the internet to activate your license.';
    },

    /**
     * Periodically re-check license status with server (every 4 hours)
     * If license is revoked or expired, immediately lock the app
     */
    startPeriodicRecheck: function() {
        if (this._recheckInterval) clearInterval(this._recheckInterval);
        this._recheckInterval = setInterval(async () => {
            const savedKey = localStorage.getItem(STORAGE_KEYS.key);
            if (!savedKey) {
                this.forceLockout('No license key found.');
                return;
            }
            try {
                const status = await this.checkLicenseStatus(savedKey);
                if (!status.success) {
                    if (status.error === 'REVOKED') {
                        this.forceLockout('Your license has been revoked.');
                    } else if (status.error === 'EXPIRED') {
                        this.forceLockout('Your license has expired.');
                    } else if (status.error === 'INVALID_KEY') {
                        this.forceLockout('Invalid license key.');
                    } else if (status.error === 'MAX_DEVICES' || status.error === 'DEVICE_MISMATCH') {
                        this.forceLockout('This license is no longer valid for this device.');
                    }
                    // Other errors (network, database) - ignore, keep running
                } else {
                    this._isLicensed = true;
                    this.setCachedLicense(status);
                    this.updateHeaderBadge({ tier: { name: status.tier_name }, daysRemaining: status.days_remaining, isPerpetual: status.is_perpetual, company: status.company });
                }
            } catch (error) {
                // Network error during recheck - ignore, keep running
            }
        }, 4 * 60 * 60 * 1000); // Check every 4 hours
    },

    /**
     * Force lockout - immediately block all app access and show license screen
     */
    forceLockout: function(message) {
        this._isLicensed = false;
        this.clearLicenseData();
        if (this._recheckInterval) clearInterval(this._recheckInterval);

        // Hide all app UI
        const mainHeader = document.getElementById('main-header');
        const mainContent = document.getElementById('main-content');
        const mainFooter = document.getElementById('main-footer');
        const loadingScreen = document.getElementById('loading-screen');
        const licenseScreen = document.getElementById('license-screen');

        if (mainHeader) mainHeader.style.display = 'none';
        if (mainContent) mainContent.style.display = 'none';
        if (mainFooter) mainFooter.style.display = 'none';
        if (loadingScreen) loadingScreen.style.display = 'none';

        // Show license screen with error
        if (licenseScreen) {
            licenseScreen.style.display = 'flex';
            licenseScreen.style.opacity = '1';
            const errorEl = document.getElementById('license-error');
            if (errorEl) errorEl.textContent = message || 'License validation failed.';
        }
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
                    this._isLicensed = true;
                    this.bootSystem({ tier: { name: result.tier_name }, daysRemaining: result.days_remaining, isPerpetual: result.is_perpetual, company: result.company }, true);
                    this.startPeriodicRecheck();
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
        archive.init();
        
        loadingStatus.textContent = 'Initializing systems...';
        soundManager.init();
        pinLockout.init();
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
            monthlyReport.init();
            admin.checkBackupReminder();
            admin.checkNewReportNotification();
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
    init: function() { this.bindEvents(); this.initMobileFixes(); },

    bindEvents: function() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const screen = btn.getAttribute('data-screen');
                if (screen) this.nav(screen);
            });
        });
        
        document.getElementById('btn-cam-toggle').addEventListener('click', () => camera.toggle());
        document.getElementById('btn-cam-flip').addEventListener('click', () => camera.flipCamera());
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
        document.getElementById('btn-confirm-clear-data').addEventListener('click', () => { db.clearAll(); document.getElementById('modal-clear-data').style.display = 'none'; admin.renderEmpList(); admin.updateStats(); admin.renderGallery(); admin.updateLatecomers(); chartsManager.update(); calendarManager.render(); utils.showToast('Attendance logs cleared — employees & archive preserved', null, 'success'); });
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
        
        // Search with debounce for mobile performance
        let searchTimeout;
        document.getElementById('search-records').addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => records.search(e.target.value), 150);
        });
        
        // Calendar
        document.getElementById('btn-prev-month').addEventListener('click', () => calendarManager.prevMonth());
        document.getElementById('btn-next-month').addEventListener('click', () => calendarManager.nextMonth());
        document.getElementById('btn-today').addEventListener('click', () => calendarManager.goToToday());
        var calBackBtn = document.getElementById('btn-calendar-back');
        if (calBackBtn) calBackBtn.addEventListener('click', () => app.nav('dashboard'));
        var closeDayBtn = document.getElementById('btn-close-day-detail');
        if (closeDayBtn) closeDayBtn.addEventListener('click', () => { document.getElementById('modal-day-detail').style.display = 'none'; });
        
        // Dark Mode
        document.getElementById('nav-dark-mode').addEventListener('click', () => darkModeManager.toggle());
        
        // Install
        document.getElementById('btn-install-now').addEventListener('click', () => installManager.handleInstallClick());
        document.getElementById('btn-install-later').addEventListener('click', () => installManager.handleLaterClick());
        
        // Nuke button & modal
        document.getElementById('btn-nuke').addEventListener('click', () => { document.getElementById('modal-nuke').style.display = 'flex'; });
        document.getElementById('btn-cancel-nuke').addEventListener('click', () => { document.getElementById('modal-nuke').style.display = 'none'; });
        document.getElementById('btn-confirm-nuke').addEventListener('click', () => {
            var nukePin = document.getElementById('nuke-pin-input').value;
            if (nukePin !== db.data.pin) {
                utils.showToast('Incorrect password. Nuke aborted.', null, 'error');
                return;
            }
            db.nuke();
            document.getElementById('modal-nuke').style.display = 'none';
            document.getElementById('nuke-pin-input').value = '';
            admin.renderEmpList();
            admin.updateStats();
            admin.renderGallery();
            admin.updateLatecomers();
            chartsManager.update();
            calendarManager.render();
            monthlyReport.init();
            utils.showToast('All data destroyed. Fresh start.', null, 'success');
        });
        
        // Backup reminder buttons
        document.getElementById('btn-backup-now').addEventListener('click', () => { admin.downloadBackup(); localStorage.setItem(BACKUP_DATE_KEY, Date.now().toString()); admin.checkBackupReminder(); });
        document.getElementById('btn-dismiss-backup').addEventListener('click', () => admin.dismissBackupReminder());
        
        // New report notification buttons
        document.getElementById('btn-view-report').addEventListener('click', () => {
            admin.dismissReportNotification();
            app.nav('dashboard');
            document.getElementById('monthly-report-panel').style.display = 'block';
            monthlyReport.populateMonthSelect();
            setTimeout(function() {
                var panel = document.getElementById('monthly-report-panel');
                if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        });
        document.getElementById('btn-dismiss-report').addEventListener('click', () => admin.dismissReportNotification());
        
        // Monthly report buttons
        document.getElementById('btn-get-report').addEventListener('click', () => monthlyReport.generate());
        document.getElementById('btn-download-report-pdf').addEventListener('click', () => monthlyReport.downloadPDF());
        document.getElementById('btn-clear-report').addEventListener('click', () => monthlyReport.clearMonth());
    },

    // Phase 3: Mobile keyboard handling & touch optimizations
    initMobileFixes: function() {
        // Scroll active screen to top on visual viewport resize (keyboard dismiss)
        if (window.visualViewport) {
            let viewportHeight = window.visualViewport.height;
            window.visualViewport.addEventListener('resize', () => {
                const newHeight = window.visualViewport.height;
                // Keyboard closed
                if (newHeight > viewportHeight) {
                    const activeScreen = document.querySelector('.screen.active');
                    if (activeScreen) {
                        activeScreen.scrollTop = activeScreen.scrollHeight;
                    }
                }
                viewportHeight = newHeight;
            });
            
            // Set --vh CSS variable for dynamic viewport height
            const setVH = () => {
                document.documentElement.style.setProperty('--app-vh', window.visualViewport.height + 'px');
            };
            setVH();
            window.visualViewport.addEventListener('resize', setVH);
        }

        // Prevent double-tap zoom on interactive elements
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });

        // Prevent pinch zoom
        document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });
    },

    nav: function(screenId) {
        if ((screenId === 'dashboard' || screenId === 'records' || screenId === 'calendar') && !admin.isLoggedIn) {
            utils.showToast('Admin access required');
            screenId = 'admin-login';
        }
        if (screenId !== 'home' && screenId !== 'dashboard') { camera.stop(); admin.cancelRegistration(); }
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            // Phase 3: Smooth scroll to top on mobile
            targetScreen.scrollTop = 0;
        }
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        const activeBtn = document.querySelector('.nav-btn[data-screen="' + screenId + '"]');
        if (activeBtn) {
            activeBtn.classList.add('active');
            // Phase 3: Scroll active nav button into view
            activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
        if (screenId === 'records') records.load();
        if (screenId === 'dashboard') { admin.renderEmpList(); admin.updateStats(); admin.renderGallery(); admin.updateLatecomers(); admin.checkNewReportNotification(); }
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

// Service Worker Registration (Phase 3: Improved PWA detection)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js', { scope: './' }).then(reg => {
            console.log('Service Worker registered:', reg.scope);
            // Check for updates periodically
            setInterval(() => {
                reg.update().then(() => {
                    console.log('Service Worker update checked');
                });
            }, 60 * 60 * 1000); // Check every hour
        }).catch(err => {
            console.log('Service Worker registration failed:', err);
        });
    });
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
