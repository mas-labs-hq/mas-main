// =====================================================
// BIOATTEX - PROFESSIONAL BIOMETRIC ATTENDANCE SYSTEM
// Enhanced Version v2.0 - All Features
// License System v4.0 (UNCHANGED - DO NOT MODIFY)
// =====================================================

'use strict';

const API_BASE_URL = 'https://phein-license-server.vercel.app';
const API_TIMEOUT = 10000;
const MAX_OFFLINE_DAYS = 7;

const STORAGE_KEYS = {
    key: 'bioattex_license_key',
    fingerprint: 'bioattex_device_fingerprint',
    company: 'bioattex_company_name',
    lastOnlineCheck: 'bioattex_last_online_check',
    cachedLicense: 'bioattex_cached_license',
    expirationDate: 'bioattex_expiration_date',
    firstActivationDate: 'bioattex_first_activation_date'
};

const DB_KEY = 'bioattex_db_v3';
const INSTALL_DISMISSED_KEY = 'bioattex_install_dismissed';
const DARK_MODE_KEY = 'bioattex_dark_mode';
const ARCHIVE_KEY = 'bioattex_archive_v1';
const BACKUP_DATE_KEY = 'bioattex_last_backup_date';
const LAST_REPORT_VIEW_KEY = 'bioattex_last_report_view_month';

// ================== UTILITY FUNCTIONS ==================
const utils = {
    showToast: function(message, duration, type) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.className = 'show';
        if (type === 'success') toast.classList.add('success');
        else if (type === 'error') toast.classList.add('error');
        else if (type === 'warning') toast.classList.add('warning');
        setTimeout(() => toast.className = '', duration || 3000);
    },
    
    formatDate: function(date) {
        return date.toISOString().split('T')[0];
    },
    
    formatTime: function(date) {
        // ALWAYS use 24-hour HH:MM format so calculateDuration works correctly
        var h = String(date.getHours()).padStart(2, '0');
        var m = String(date.getMinutes()).padStart(2, '0');
        return h + ':' + m;
    },
    
    formatDuration: function(minutes) {
        if (!minutes || minutes <= 0) return '--';
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hrs + 'h ' + mins + 'm';
    },
    
    isStandalone: function() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true ||
               document.referrer.includes('android-app://');
    },
    
    isIOS: function() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    },
    
    isMobile: function() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    getInitials: function(name) {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    },

    // Haptic feedback — silent on devices that don't support it
    haptic: function(type) {
        if (!navigator.vibrate) return;
        if (type === 'success') {
            navigator.vibrate(100);
        } else if (type === 'error') {
            navigator.vibrate([50, 30, 50]);
        } else if (type === 'light') {
            navigator.vibrate(30);
        }
    }
};

// ================== PIN LOCKOUT ==================
const pinLockout = {
    MAX_ATTEMPTS: 5,
    LOCKOUT_MS: 30000, // 30 seconds
    _attempts: 0,
    _lockedUntil: 0,

    init: function() {
        this._attempts = parseInt(sessionStorage.getItem('bioattex_pin_attempts') || '0', 10);
        this._lockedUntil = parseInt(sessionStorage.getItem('bioattex_pin_locked_until') || '0', 10);
    },

    check: function() {
        // If currently locked out, check if cooldown has passed
        if (this._lockedUntil > 0) {
            var remaining = this._lockedUntil - Date.now();
            if (remaining > 0) {
                return { locked: true, remaining: Math.ceil(remaining / 1000) };
            } else {
                // Cooldown expired — reset
                this._attempts = 0;
                this._lockedUntil = 0;
                sessionStorage.removeItem('bioattex_pin_attempts');
                sessionStorage.removeItem('bioattex_pin_locked_until');
            }
        }
        return { locked: false, attemptsLeft: this.MAX_ATTEMPTS - this._attempts };
    },

    recordFail: function() {
        this._attempts++;
        sessionStorage.setItem('bioattex_pin_attempts', String(this._attempts));

        if (this._attempts >= this.MAX_ATTEMPTS) {
            this._lockedUntil = Date.now() + this.LOCKOUT_MS;
            sessionStorage.setItem('bioattex_pin_locked_until', String(this._lockedUntil));
            return true; // locked
        }
        return false;
    },

    reset: function() {
        this._attempts = 0;
        this._lockedUntil = 0;
        sessionStorage.removeItem('bioattex_pin_attempts');
        sessionStorage.removeItem('bioattex_pin_locked_until');
    }
};

// ================== SOUND MANAGER ==================
const soundManager = {
    enabled: true,
    
    init: function() {
        const saved = localStorage.getItem('bioattex_sound');
        if (saved !== null) {
            this.enabled = saved === 'true';
        }
        const toggle = document.getElementById('sound-toggle');
        if (toggle) toggle.checked = this.enabled;
    },
    
    toggle: function(enabled) {
        this.enabled = enabled;
        localStorage.setItem('bioattex_sound', enabled.toString());
    },
    
    play: function(type) {
        if (!this.enabled) return;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (type === 'success') {
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.4);
        } else if (type === 'error') {
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.15);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } else if (type === 'click') {
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.05);
        }
    }
};

// ================== CONFETTI EFFECT ==================
const confettiManager = {
    trigger: function() {
        const container = document.getElementById('confetti-container');
        if (!container) return;
        
        const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            
            if (Math.random() > 0.5) {
                confetti.style.borderRadius = '50%';
            }
            
            container.appendChild(confetti);
            
            setTimeout(() => confetti.classList.add('active'), 10);
            setTimeout(() => confetti.remove(), 3500);
        }
    }
};

// ================== DARK MODE ==================
const darkModeManager = {
    enabled: false,
    
    init: function() {
        const saved = localStorage.getItem(DARK_MODE_KEY);
        if (saved === 'true') {
            this.enabled = true;
            document.body.classList.add('dark-mode');
        }
        this.updateButton();
    },
    
    toggle: function() {
        this.enabled = !this.enabled;
        document.body.classList.toggle('dark-mode');
        localStorage.setItem(DARK_MODE_KEY, this.enabled.toString());
        this.updateButton();
        utils.showToast(this.enabled ? 'Dark mode enabled' : 'Light mode enabled');
    },
    
    updateButton: function() {
        const btn = document.getElementById('nav-dark-mode');
        if (btn) {
            btn.innerHTML = this.enabled 
                ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
                : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
        }
    }
};

// ================== LIVE CLOCK ==================
const clockManager = {
    init: function() {
        this.update();
        setInterval(() => this.update(), 1000);
    },
    
    update: function() {
        const timeEl = document.querySelector('.clock-time');
        const dateEl = document.querySelector('.clock-date');
        if (!timeEl) return;
        
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: false 
        });
        
        if (dateEl) {
            dateEl.textContent = now.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
        }
    }
};
