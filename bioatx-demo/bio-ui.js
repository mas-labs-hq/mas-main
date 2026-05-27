
// =====================================================
// BIOATTEX DEMO — bio-ui.js
// Demo Version — No License, No PWA, Auto-Boot
// =====================================================

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
        
        // DEMO: Export/Import are premium - block clicks on premium-locked buttons
        document.getElementById('btn-export').addEventListener('click', (e) => {
            e.preventDefault();
            utils.showPremiumToast();
        });
        document.getElementById('btn-import-trigger').addEventListener('click', (e) => {
            e.preventDefault();
            utils.showPremiumToast();
        });
        document.getElementById('import-file').addEventListener('change', function() { this.value = ''; });
        
        // DEMO: Download PDF buttons are premium
        document.getElementById('btn-download-pdf').addEventListener('click', (e) => {
            e.preventDefault();
            utils.showPremiumToast();
        });
        document.getElementById('btn-download-report-pdf').addEventListener('click', (e) => {
            e.preventDefault();
            utils.showPremiumToast();
        });
        // DEMO: Backup-now banner removed in demo version, no event needed
        // btn-backup-now does not exist in demo HTML
        
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
        document.getElementById('btn-cancel-verify').addEventListener('click', () => scanner.cancelVerify());
        document.getElementById('btn-confirm-identity').addEventListener('click', () => scanner.confirmIdentity());
        
        let searchTimeout;
        document.getElementById('search-records').addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => records.search(e.target.value), 150);
        });
        
        document.getElementById('btn-prev-month').addEventListener('click', () => calendarManager.prevMonth());
        document.getElementById('btn-next-month').addEventListener('click', () => calendarManager.nextMonth());
        document.getElementById('btn-today').addEventListener('click', () => calendarManager.goToToday());
        var closeDayBtn = document.getElementById('btn-close-day-detail');
        if (closeDayBtn) closeDayBtn.addEventListener('click', () => { document.getElementById('modal-day-detail').style.display = 'none'; });
        
        document.getElementById('nav-dark-mode').addEventListener('click', () => darkModeManager.toggle());
        
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
        
        // DEMO: Backup banner removed, no dismiss-backup button exists
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
        
        document.getElementById('btn-get-report').addEventListener('click', () => monthlyReport.generate());
        document.getElementById('btn-clear-report').addEventListener('click', () => monthlyReport.clearMonth());
    },

    initMobileFixes: function() {
        if (window.visualViewport) {
            let viewportHeight = window.visualViewport.height;
            window.visualViewport.addEventListener('resize', () => {
                const newHeight = window.visualViewport.height;
                if (newHeight > viewportHeight) {
                    const activeScreen = document.querySelector('.screen.active');
                    if (activeScreen) activeScreen.scrollTop = activeScreen.scrollHeight;
                }
                viewportHeight = newHeight;
            });
            const setVH = () => {
                document.documentElement.style.setProperty('--app-vh', window.visualViewport.height + 'px');
            };
            setVH();
            window.visualViewport.addEventListener('resize', setVH);
        }
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) e.preventDefault();
            lastTouchEnd = now;
        }, { passive: false });
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
            targetScreen.scrollTop = 0;
        }
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        const activeBtn = document.querySelector('.nav-btn[data-screen="' + screenId + '"]');
        if (activeBtn) {
            activeBtn.classList.add('active');
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

// ================== DEMO AUTO-BOOT ==================
// No license screen, no PWA, no install prompt - just boot straight away
window.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingStatus = document.getElementById('loading-status');
    
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
        
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                document.getElementById('main-header').style.display = 'flex';
                document.getElementById('main-content').style.display = 'flex';
                document.getElementById('main-footer').style.display = 'block';
                document.getElementById('nav-dark-mode').classList.remove('hidden');
                document.getElementById('nav-calendar').classList.remove('hidden');
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
            }, 500);
        }, 1000);
    });
    
    app.init();
    
    // DEMO: Show scanner tip popup 2.5 seconds after homepage loads
    var scannerTipShown = sessionStorage.getItem('bioattex_demo_scanner_tip_shown');
    if (!scannerTipShown) {
        setTimeout(function() {
            var tipOverlay = document.getElementById('scanner-tip-overlay');
            if (tipOverlay) {
                tipOverlay.classList.add('visible');
            }
        }, 2500);
    }
    
    // Dismiss scanner tip popup
    var dismissTipBtn = document.getElementById('btn-dismiss-scanner-tip');
    if (dismissTipBtn) {
        dismissTipBtn.addEventListener('click', function() {
            var tipOverlay = document.getElementById('scanner-tip-overlay');
            if (tipOverlay) {
                tipOverlay.classList.remove('visible');
            }
            sessionStorage.setItem('bioattex_demo_scanner_tip_shown', 'true');
        });
    }
});
