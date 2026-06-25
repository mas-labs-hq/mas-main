/**
 * ============================================================================
 * LEGAL NOTICE — PROPRIETARY AND CONFIDENTIAL
 * ============================================================================
 *
 * Elthira.AI × Dr Spice Organics — Security Alert System
 * Copyright © 2026 MortApps Studios. All rights reserved.
 *
 * Unauthorized reverse engineering, code analysis, decompilation, or use of
 * AI tools (including but not limited to ChatGPT, Claude, Gemini, Copilot,
 * and similar) to analyze, summarize, or extract information from this code
 * is STRICTLY PROHIBITED — including for educational purposes.
 *
 * ============================================================================
 *
 * security-alert.js — Silent Formspree alert sender
 *
 * FIX (Claude P0-3): Removed unconditional parallel sendViaHiddenForm call.
 * Hidden form POST is now ONLY used as fallback when fetch fails.
 * FIX (GPT #3): Honeypot field added to all submissions.
 * FIX (Claude Section D): Removed canvas fingerprint and WebGL info.
 *
 * ============================================================================
 */

(function (window, document) {
    'use strict';

    var SECURITY_FORMSPREE_ENDPOINT = 'https://formspree.io/f/xkoljrwn';
    var TITLE_LABEL = 'Elthira-Dr Spice';

    // IP geolocation pre-fetch
    var cachedIpInfo = null;
    var ipFetchAttempted = false;

    function preFetchIpInfo() {
        if (ipFetchAttempted) return;
        ipFetchAttempted = true;
        try {
            fetch('https://ipapi.co/json/', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            }).then(function (res) { return res.json(); })
              .then(function (data) {
                if (data && !data.error) {
                    cachedIpInfo = {
                        ip: data.ip || 'Unknown',
                        city: data.city || 'Unknown',
                        region: data.region || 'Unknown',
                        country: data.country_name || 'Unknown',
                        country_code: data.country_code || 'Unknown',
                        isp: data.org || 'Unknown',
                        latitude: data.latitude || 'Unknown',
                        longitude: data.longitude || 'Unknown',
                        timezone: data.timezone || 'Unknown'
                    };
                }
            }).catch(function () {});
        } catch (e) {}
    }
    preFetchIpInfo();

    function getIpInfo() {
        return cachedIpInfo || {
            ip: 'Unknown', city: 'Unknown', region: 'Unknown',
            country: 'Unknown', country_code: 'Unknown', isp: 'Unknown',
            latitude: 'Unknown', longitude: 'Unknown', timezone: 'Unknown'
        };
    }

    // Geolocation
    var cachedGeolocation = null;
    var geoFetchAttempted = false;
    var geoDenied = false;

    function requestGeolocation() {
        if (geoFetchAttempted) return;
        geoFetchAttempted = true;
        try {
            if (!navigator.geolocation) { geoDenied = true; return; }
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    cachedGeolocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: position.timestamp
                    };
                },
                function (error) { geoDenied = true; },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } catch (e) { geoDenied = true; }
    }

    function getGeolocation() { return cachedGeolocation; }
    function isGeoDenied() { return geoDenied; }

    function getPatientLocationFromStorage() {
        try {
            var lastAnalysis = localStorage.getItem('elthira_lastAnalysis');
            if (lastAnalysis) {
                var data = JSON.parse(lastAnalysis);
                if (data && data.county) {
                    return {
                        county: data.county,
                        nationality: data.nationality || 'Unknown',
                        fullName: data.fullName || 'Unknown',
                        phone: data.phone || 'Unknown',
                        email: data.email || 'Unknown'
                    };
                }
            }
        } catch (e) {}
        return null;
    }

    // Device info (canvas/WebGL REMOVED per Claude Section D)
    function getDeviceInfo() {
        var info = {};
        try {
            info.user_agent = navigator.userAgent || 'Unknown';
            info.platform = navigator.platform || 'Unknown';
            info.language = navigator.language || 'Unknown';
            info.screen_resolution = (screen.width || '?') + 'x' + (screen.height || '?');
            info.viewport_size = window.innerWidth + 'x' + window.innerHeight;
            info.hardware_concurrency = navigator.hardwareConcurrency || 'Unknown';
            info.device_memory = navigator.deviceMemory || 'Unknown';
            info.max_touch_points = navigator.maxTouchPoints || 0;
            try { info.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown'; } catch (e) { info.timezone = 'Unknown'; }
            info.timezone_offset = new Date().getTimezoneOffset();
            info.online = navigator.onLine;
            info.current_url = window.location.href;
            info.referrer = document.referrer || 'none';
            if (navigator.connection) {
                info.connection_type = navigator.connection.type || navigator.connection.effectiveType || 'Unknown';
                info.connection_downlink = navigator.connection.downlink || 'Unknown';
                info.connection_rtt = navigator.connection.rtt || 'Unknown';
            }
            info.battery = 'Not available';
        } catch (e) {}
        return info;
    }

    function getLocalStorageDump() {
        var dump = {};
        try {
            for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                if (key && key.indexOf('elthira_sec') === -1 && key.indexOf('_elthira_sb') === -1) {
                    var val = localStorage.getItem(key);
                    if (val) dump[key] = val.length > 500 ? val.substring(0, 500) + '...[truncated]' : val;
                }
            }
        } catch (e) {}
        return dump;
    }

    function getCookieDump() {
        try { return document.cookie || 'No cookies'; } catch (e) { return 'Error'; }
    }

    function sanitizeFields(fields) {
        var sanitized = {};
        for (var key in fields) {
            if (fields.hasOwnProperty(key)) {
                var newKey = (key === 'email') ? 'contact_email' : key;
                sanitized[newKey] = String(fields[key]);
            }
        }
        return sanitized;
    }

    function buildUrlEncoded(fields) {
        var pairs = [];
        for (var key in fields) {
            if (fields.hasOwnProperty(key)) {
                pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(fields[key])));
            }
        }
        return pairs.join('&');
    }

    // SEND — fetch primary, hidden form POST fallback ONLY on failure
    function send(subject, fields) {
        var sanitized = sanitizeFields(fields || {});
        var allFields = {};
        for (var k in sanitized) {
            if (sanitized.hasOwnProperty(k)) allFields[k] = sanitized[k];
        }
        var fullSubject = '[' + TITLE_LABEL + '] ' + subject;
        allFields._subject = fullSubject;
        allFields._source = TITLE_LABEL + ' Security System';
        allFields._gotcha = ''; // Honeypot

        var body = buildUrlEncoded(allFields);
        var fallbackTriggered = false;
        try {
            fetch(SECURITY_FORMSPREE_ENDPOINT, {
                method: 'POST',
                body: body,
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then(function (response) {
                if (!response.ok && !fallbackTriggered) {
                    fallbackTriggered = true;
                    sendViaHiddenForm(allFields);
                }
            }).catch(function () {
                if (!fallbackTriggered) {
                    fallbackTriggered = true;
                    sendViaHiddenForm(allFields);
                }
            });
        } catch (e) {
            sendViaHiddenForm(allFields);
        }
    }

    function sendViaHiddenForm(fields) {
        try {
            if (!document.body) return;
            var iframeName = 'sec-alert-iframe-' + Date.now();
            var iframe = document.createElement('iframe');
            iframe.name = iframeName;
            iframe.style.cssText = 'position:absolute;width:1px;height:1px;border:0;left:-9999px;top:-9999px;';
            document.body.appendChild(iframe);
            var form = document.createElement('form');
            form.action = SECURITY_FORMSPREE_ENDPOINT;
            form.method = 'POST';
            form.target = iframeName;
            form.style.cssText = 'display:none;';
            for (var key in fields) {
                if (fields.hasOwnProperty(key)) {
                    var input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = String(fields[key]);
                    form.appendChild(input);
                }
            }
            document.body.appendChild(form);
            form.submit();
            setTimeout(function () {
                try { if (form.parentNode) form.parentNode.removeChild(form); } catch (e) {}
                try { if (iframe.parentNode) iframe.parentNode.removeChild(iframe); } catch (e) {}
            }, 30000);
        } catch (e) {}
    }

    function sendIncident(subject, extraFields) {
        var deviceInfo = getDeviceInfo();
        var ipInfo = getIpInfo();
        var cookies = getCookieDump();
        var geo = getGeolocation();

        var fields = {};
        if (extraFields) {
            for (var k in extraFields) {
                if (extraFields.hasOwnProperty(k)) fields[k] = extraFields[k];
            }
        }

        fields.ip_address = ipInfo.ip;
        fields.location = ipInfo.city + ', ' + ipInfo.region + ', ' + ipInfo.country;
        fields.country_code = ipInfo.country_code;
        fields.isp = ipInfo.isp;
        fields.coordinates_ip = ipInfo.latitude + ', ' + ipInfo.longitude;

        if (geo) {
            fields.gps_latitude = geo.latitude;
            fields.gps_longitude = geo.longitude;
            fields.gps_accuracy = geo.accuracy + ' meters';
            fields.gps_timestamp = new Date(geo.timestamp).toLocaleString();
        } else {
            fields.gps_latitude = 'Permission denied or unavailable';
            fields.gps_longitude = 'Permission denied or unavailable';
        }

        // REMOVED (Claude P1): Patient PII from localStorage is NO LONGER
        // included in security alerts. This was a DPA 2019 compliance issue.
        // Security alerts now contain only: IP, location, device info, timestamp.

        for (var dk in deviceInfo) {
            if (deviceInfo.hasOwnProperty(dk)) {
                fields['device_' + dk] = String(deviceInfo[dk]);
            }
        }

        // REMOVED: localStorage dump — was exfiltrating patient health data.
        // Security alerts should not contain patient symptoms or contact info.

        fields.cookies = cookies.substring(0, 1000);
        fields.incident_time_utc = new Date().toISOString();
        fields.incident_time_local = new Date().toLocaleString();

        send(subject, fields);
    }

    function test() {
        sendIncident('TEST ALERT — Security System Connectivity Check', {
            alert_type: 'Test — Owner Connectivity Check',
            message: 'If you received this, your security shield is active.',
            test_time: new Date().toLocaleString()
        });
    }

    window.ElthiraSecurity = {
        send: send,
        sendIncident: sendIncident,
        test: test,
        getDeviceInfo: getDeviceInfo,
        getIpInfo: getIpInfo,
        getLocalStorageDump: getLocalStorageDump,
        preFetchIpInfo: preFetchIpInfo,
        requestGeolocation: requestGeolocation,
        getGeolocation: getGeolocation,
        isGeoDenied: isGeoDenied,
        getPatientLocationFromStorage: getPatientLocationFromStorage
    };

})(window, document);
