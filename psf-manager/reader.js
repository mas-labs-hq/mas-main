/**
 * reader.js — PSF.Manager Formspree Message Reader
 * =================================================
 * Parses raw Formspree email content, extracts all fields,
 * explains what happened in plain English, and generates
 * 3+ professional response templates per scenario.
 */
(function (window) {
  'use strict';

  // Known field names (sorted by length, longest first, to avoid partial matches)
  var KNOWN_FIELDS = [
    'device_device_pixel_ratio', 'device_hardware_concurrency',
    'device_connection_downlink', 'device_connection_rtt',
    'device_connection_type', 'device_screen_resolution',
    'device_device_memory', 'device_max_touch_points',
    'device_timezone_offset', 'device_current_url',
    'device_user_agent', 'device_platform',
    'device_language', 'device_timezone',
    'device_device_memory', 'device_online',
    'device_referrer', 'device_viewport_size',
    'device_battery_level', 'device_geolocation',
    'activated_by_phone', 'activated_by_email',
    'attempted_by_phone', 'attempted_by_email',
    'stored_fingerprint', 'current_fingerprint',
    'max_scroll_depth_pct', 'time_on_page_seconds',
    'alert_time_local', 'violation_count',
    'max_violations', 'action_required',
    'action_taken', 'stations_allowed',
    'duration_days', 'preferred_contact',
    'click_count', 'alert_type',
    'company', 'contact_email', 'email',
    'code', 'method', 'phone',
    'message', 'timestamp', 'url',
    'user_agent', 'session_count',
    'form_type', 'submitted_at',
    'name', 'rating', 'review',
    'role', 'location', 'duration',
    '_source', '_subject'
  ];

  // =============================================================
  // PARSE — extract fields from raw Formspree email text
  // =============================================================
  function parse(rawText) {
    var text = String(rawText || '').trim();
    if (!text) return { error: 'No text provided' };

    var fields = {};

    // Strategy: find each known field name in the text, extract the value
    // between it and the next known field name (or end marker)
    // Sort field names by their position in the text
    var positions = [];
    KNOWN_FIELDS.forEach(function (fieldName) {
      // Look for the field name as a standalone line (surrounded by newlines)
      var pattern = new RegExp('\\n' + fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\n', 'g');
      var match;
      while ((match = pattern.exec(text)) !== null) {
        positions.push({ name: fieldName, pos: match.index + 1 }); // +1 to skip the \n
      }
    });

    // Also check if the text STARTS with a field name
    KNOWN_FIELDS.forEach(function (fieldName) {
      if (text.startsWith(fieldName + '\n')) {
        positions.push({ name: fieldName, pos: 0 });
      }
    });

    // Sort by position
    positions.sort(function (a, b) { return a.pos - b.pos; });

    // Remove duplicates (keep first occurrence)
    var seen = {};
    positions = positions.filter(function (p) {
      if (seen[p.name]) return false;
      seen[p.name] = true;
      return true;
    });

    // Extract values
    for (var i = 0; i < positions.length; i++) {
      var field = positions[i];
      var valueStart = field.pos + field.name.length;
      // Skip whitespace/newlines after field name
      while (valueStart < text.length && /\s/.test(text[valueStart])) valueStart++;
      var valueEnd;
      if (i + 1 < positions.length) {
        valueEnd = positions[i + 1].pos;
      } else {
        // Last field — find the end marker
        var endMarker = text.indexOf('Submitted', valueStart);
        if (endMarker === -1) endMarker = text.indexOf('Mark as spam', valueStart);
        if (endMarker === -1) endMarker = text.length;
        valueEnd = endMarker;
      }
      // Trim trailing whitespace/newlines
      var value = text.substring(valueStart, valueEnd).trim();
      // Remove trailing "Submitted..." if present
      value = value.replace(/\nSubmitted.*$/s, '').replace(/\nMark as spam.*$/s, '').trim();
      fields[field.name] = value;
    }

    // Also try to extract _subject from the email subject line
    var subjectMatch = text.match(/_subject\s*\n\s*\n(.+)/i);
    if (subjectMatch && !fields._subject) {
      fields._subject = subjectMatch[1].trim();
    }

    return { fields: fields, raw: text };
  }

  // =============================================================
  // IDENTIFY — determine the alert type and scenario
  // =============================================================
  function identify(fields) {
    var alertType = (fields.alert_type || fields._subject || fields.form_type || '').toLowerCase();

    if (alertType.indexOf('activation') !== -1 && alertType.indexOf('enterprise') !== -1) {
      return 'enterprise_activation';
    }
    if (alertType.indexOf('activation') !== -1) {
      return 'activation';
    }
    if (alertType.indexOf('reuse blocked') !== -1) {
      return 'reuse_blocked';
    }
    if (alertType.indexOf('device mismatch') !== -1) {
      return 'device_mismatch';
    }
    if (alertType.indexOf('blacklisted') !== -1 && alertType.indexOf('attempt') !== -1) {
      return 'blacklisted_attempt';
    }
    if (alertType.indexOf('blacklisted') !== -1) {
      return 'blacklisted';
    }
    if (alertType.indexOf('strike 1') !== -1 || (alertType.indexOf('security') !== -1 && alertType.indexOf('strike') !== -1 && fields.violation_count === '1')) {
      return 'security_strike_1';
    }
    if (alertType.indexOf('strike 2') !== -1 || (alertType.indexOf('security') !== -1 && alertType.indexOf('strike') !== -1 && fields.violation_count === '2')) {
      return 'security_strike_2';
    }
    if (alertType.indexOf('strike 3') !== -1 || (alertType.indexOf('security') !== -1 && alertType.indexOf('strike') !== -1 && (fields.violation_count === '3' || fields.violation_count === 'MAX_VIOLATIONS'))) {
      return 'security_strike_3';
    }
    if (alertType.indexOf('security') !== -1) {
      return 'security_alert';
    }
    if (alertType.indexOf('ai crawler') !== -1 || alertType.indexOf('ai warning') !== -1) {
      return 'ai_alert';
    }
    if (alertType.indexOf('purchase') !== -1 || alertType.indexOf('license key purchase') !== -1) {
      return 'purchase';
    }
    if (alertType.indexOf('review') !== -1) {
      return 'review';
    }
    if (alertType.indexOf('test') !== -1) {
      return 'test';
    }
    return 'unknown';
  }

  // =============================================================
  // EXPLAIN — generate a human-readable summary
  // =============================================================
  function explain(scenario, fields) {
    var company = fields.company || 'Unknown company';
    var code = fields.code || 'N/A';
    var phone = fields.phone || fields.activated_by_phone || fields.attempted_by_phone || 'N/A';
    var email = fields.contact_email || fields.email || fields.activated_by_email || fields.attempted_by_email || 'N/A';
    var time = fields.alert_time_local || fields.timestamp || 'Unknown time';

    var explanations = {
      activation: 'This company has just activated their license key for the first time. The software is now running on their device. You should flip their status from "inactive" to "active" in auth.js to lock the code to this station and prevent others from using it.',
      enterprise_activation: 'An Enterprise Plus station has come online. This is a multi-station license, so multiple devices are allowed. No immediate action is required, but you should monitor how many stations are in use.',
      reuse_blocked: 'Someone attempted to activate a code that is already active (status: "active" in auth.js). The attempt was blocked. This could mean the original user shared their code, or someone is trying to use it without authorization. Contact the original user to verify.',
      device_mismatch: 'A user tried to access the software from a different computer than the one they originally activated on. The fingerprint did not match, so they were blocked. This could be legitimate (new computer) or suspicious (code sharing). Contact the user to verify.',
      blacklisted: 'A user has reached 3 security violations. Their code has been automatically blacklisted on their device and they have been kicked out. You should add their code to BLACKLISTED_CODES in auth.js to enforce the block globally.',
      blacklisted_attempt: 'Someone tried to activate a code that has been blacklisted. The attempt was blocked. This is a repeat offender or someone who obtained a blacklisted code. No action needed unless the attempts persist.',
      security_strike_1: 'This is the first security violation for this user (likely DevTools or tampering attempt). A warning popup was shown to the user. They still have access. No immediate action required, but monitor for further violations.',
      security_strike_2: 'This is the second security violation. One more violation will result in permanent blacklist. The user was shown a warning. Consider reaching out to the user proactively.',
      security_strike_3: 'This is the third and final security violation. The user has been blacklisted and kicked out. See the "blacklisted" scenario for next steps.',
      security_alert: 'A security violation was detected. Check the violation count and method for more details.',
      ai_alert: 'An AI crawler or bot was detected attempting to access the application. This is an automated scan, not a human user. No action needed unless the attempts are frequent.',
      purchase: 'Someone has requested a license key via the purchase form. Review their details and contact them with pricing and next steps.',
      review: 'A new review has been submitted. Review the content and add it to the reviews.js file if appropriate.',
      test: 'This is a test alert. No action needed.',
      unknown: 'An alert was received but the type could not be determined. Review the raw fields for more information.'
    };

    var explanation = explanations[scenario] || explanations.unknown;

    // Add device info summary
    var deviceInfo = '';
    if (fields.device_platform) deviceInfo += '\n\nDevice: ' + fields.device_platform;
    if (fields.device_screen_resolution) deviceInfo += ' | Screen: ' + fields.device_screen_resolution;
    if (fields.device_timezone) deviceInfo += ' | Timezone: ' + fields.device_timezone;
    if (fields.device_connection_type) deviceInfo += ' | Connection: ' + fields.device_connection_type;

    return explanation + deviceInfo;
  }

  // =============================================================
  // TEMPLATES — 3+ professional response templates per scenario
  // =============================================================
  function generateTemplates(scenario, fields) {
    var company = fields.company || '[Company Name]';
    var code = fields.code || '[Access Code]';
    var phone = fields.phone || fields.activated_by_phone || fields.attempted_by_phone || '[Phone]';
    var email = fields.contact_email || fields.email || fields.activated_by_email || fields.attempted_by_email || '[Email]';
    var duration = fields.duration_days || '[Duration]';
    var method = fields.method || '[Method]';
    var violationCount = fields.violation_count || '[Count]';
    var maxViolations = fields.max_violations || '3';
    var time = fields.alert_time_local || fields.timestamp || '[Time]';

    var templates = {
      activation: [
        {
          title: 'Welcome + Lease Details',
          subject: 'Welcome to Phein Screener — Your License is Active',
          body: 'Dear ' + company + ',\n\nWelcome to Phein Screener. We are pleased to confirm that your license key has been successfully activated and your screening engine is now live.\n\nYour lease details:\n  Company: ' + company + '\n  License duration: ' + duration + ' days\n  Activated on: ' + time + '\n\nYour access key has been locked to your current workstation for security purposes. If you need to transfer your license to a different computer, please contact us and we will assist you with the process.\n\nShould you have any questions or require assistance getting started, our team is available at labs@mortappsstudios.com.\n\nWarm regards,\nMortApps Studios'
        },
        {
          title: 'Welcome + Device Lock Notice',
          subject: 'Phein Screener Activation Confirmed — Device Locked',
          body: 'Dear ' + company + ',\n\nThank you for activating your Phein Screener license. This email confirms that your access key is now active and locked to your registered device.\n\nPlease note that your license key is tied to a single workstation. The same key cannot be used to activate the software on additional computers. If your team requires access from multiple stations, we recommend exploring our Enterprise Plus package which supports up to 3 concurrent workstations.\n\nYour lease will remain active for ' + duration + ' days from the date of activation. You will receive a notification as your lease approaches expiration.\n\nBest regards,\nMortApps Studios'
        },
        {
          title: 'Welcome + Quick Start Guide',
          subject: 'Phein Screener is Live — Quick Start Tips Inside',
          body: 'Hello ' + company + ',\n\nYour Phein Screener license is now active. Here are a few tips to help you get the most out of your screening sessions:\n\n1. Start by pasting your job description into the AI Skill Extraction field to automatically identify core competencies.\n2. Upload your candidate CVs (PDF or text format) and Phein will rank them instantly against your criteria.\n3. Use the AI Detection Lens to flag CVs that may have been written or assisted by AI tools.\n4. Export your ranked shortlist to PDF or CSV for sharing with your hiring panel.\n\nYour lease is active for ' + duration + ' days. If you need any assistance, reach us at labs@mortappsstudios.com.\n\nHappy screening,\nMortApps Studios'
        }
      ],
      enterprise_activation: [
        {
          title: 'Enterprise Plus Station Online',
          subject: 'Enterprise Plus Station Activated — ' + company,
          body: 'Dear ' + company + ',\n\nA new workstation has been activated under your Enterprise Plus license. Your plan supports up to 3 concurrent stations, giving your team the flexibility to screen candidates in parallel.\n\nIf you believe this activation was unauthorized, please contact us immediately so we can review your station count and secure your license.\n\nBest regards,\nMortApps Studios'
        },
        {
          title: 'Station Count Tracking',
          subject: 'Phein Screener — Station Activity Notice',
          body: 'Dear ' + company + ',\n\nThis is an automated notice that a new device has come online under your Enterprise Plus license. Your current plan allows up to 3 simultaneous workstations.\n\nIf you need additional stations or have questions about your license, please reach out to us at labs@mortappsstudios.com.\n\nRegards,\nMortApps Studios'
        },
        {
          title: 'Enterprise Benefits Reminder',
          subject: 'Your Enterprise Plus License is Active',
          body: 'Dear ' + company + ',\n\nYour Enterprise Plus station is now active. As an Enterprise Plus client, you enjoy:\n\n  - Perpetual access to Phein Screener\n  - Up to 3 concurrent workstations\n  - Priority support\n  - All current and future features\n\nIf you need any assistance, our team is standing by at labs@mortappsstudios.com.\n\nBest regards,\nMortApps Studios'
        }
      ],
      reuse_blocked: [
        {
          title: 'Code Sharing Detected — Verification Required',
          subject: 'Security Notice: Unauthorized Access Attempt on Your License',
          body: 'Dear ' + company + ',\n\nOur security system detected an attempt to activate your Phein Screener license key from a device that was not authorized. The attempt was blocked and no access was granted.\n\nThis could mean one of the following:\n  1. Someone outside your organization obtained your access code.\n  2. A team member attempted to activate the software on an additional computer.\n  3. Your access code was inadvertently shared.\n\nPlease note that each license key is locked to a single workstation. If you need additional stations, we offer Enterprise Plus licenses that support up to 3 concurrent devices.\n\nIf you believe this attempt was unauthorized, we recommend requesting a new access code by contacting us at labs@mortappsstudios.com. Your current code will be revoked and a new one issued.\n\nRegards,\nMortApps Studios'
        },
        {
          title: 'Security Advisory — Code Compromise Suspected',
          subject: 'Action Required: Your Phein Screener Code Was Used Elsewhere',
          body: 'Dear ' + company + ',\n\nWe are writing to inform you that your Phein Screener access code was recently used in an attempt to activate the software from an unauthorized device. The attempt was blocked by our security system.\n\nAttempt details:\n  Time: ' + time + '\n  Code used: ' + code + '\n  Result: Blocked\n\nTo protect your account, we recommend the following:\n  1. Verify that your access code has not been shared with anyone outside your organization.\n  2. Change any passwords or credentials that may have been compromised.\n  3. Contact us at labs@mortappsstudios.com to request a new access code if you suspect your current one has been leaked.\n\nWe take the security of your license seriously and are here to help.\n\nBest regards,\nMortApps Studios'
        },
        {
          title: 'Code Rotation Offer',
          subject: 'Phein Screener — New Code Available Upon Request',
          body: 'Dear ' + company + ',\n\nOur monitoring system flagged an attempt to use your Phein Screener access code from an unrecognized device. The attempt was blocked and your account remains secure.\n\nAs a precaution, we are offering to issue you a new access code at no charge. This will invalidate the old code and ensure that only authorized personnel can access your license.\n\nTo request a new code, simply reply to this email or contact us at labs@mortappsstudios.com.\n\nWarm regards,\nMortApps Studios'
        }
      ],
      device_mismatch: [
        {
          title: 'Device Change Detected — Authorization Required',
          subject: 'Phein Screener — New Device Detected on Your Account',
          body: 'Dear ' + company + ',\n\nOur system detected an attempt to access Phein Screener from a different computer than the one your license was originally activated on. For security purposes, the access was blocked.\n\nThis is a standard security measure designed to protect your license from unauthorized use. Each license key is locked to the first device it is activated on.\n\nIf you have changed computers or need to transfer your license to a new workstation, please contact us at labs@mortappsstudios.com and we will authorize the new device for you.\n\nBest regards,\nMortApps Studios'
        },
        {
          title: 'Authorization Process',
          subject: 'Device Authorization Required — Phein Screener',
          body: 'Dear ' + company + ',\n\nAn access attempt from a new device was detected on your Phein Screener account. The attempt was blocked to protect your license.\n\nTo authorize the new device, please follow these steps:\n  1. Reply to this email confirming that you intend to switch devices.\n  2. Include the name of the new computer or a brief description.\n  3. We will reset your device authorization within 24 hours.\n\nOnce authorized, you will be able to activate Phein Screener on the new device. Please note that the old device will no longer have access.\n\nRegards,\nMortApps Studios'
        },
        {
          title: 'Security Protocol Explanation',
          subject: 'Why Your Access Was Blocked — Phein Screener Security',
          body: 'Dear ' + company + ',\n\nYou may have noticed that Phein Screener did not open on your new device. This is because our security system locks each license to the first computer it is activated on.\n\nThis protocol exists to prevent unauthorized sharing of access codes and to protect your investment in the software.\n\nIf you need to switch to a new computer (for example, if your previous device was replaced or repaired), simply contact us at labs@mortappsstudios.com and we will transfer your license to the new device at no cost.\n\nWe appreciate your understanding as we work to keep your license secure.\n\nBest regards,\nMortApps Studios'
        }
      ],
      security_strike_1: [
        {
          title: 'Friendly Reminder — Terms of Use',
          subject: 'Phein Screener — A Note About Your Account',
          body: 'Dear ' + company + ',\n\nWe noticed some activity on your Phein Screener account that triggered our security system. Specifically, an attempt was made to access developer tools or inspect the application code (' + method + ').\n\nWe understand this may have been unintentional, and we want to remind you that the Phein Screener Lease Agreement prohibits reverse engineering, decompilation, and tampering with the software. These measures are in place to protect the proprietary technology that powers Phein Screener.\n\nThis is a friendly reminder. No action has been taken against your account. If you have any questions about what is permitted under your lease, please do not hesitate to reach out.\n\nWarm regards,\nMortApps Studios'
        },
        {
          title: 'Technical Support Offer',
          subject: 'Phein Screener — How Can We Help?',
          body: 'Dear ' + company + ',\n\nOur system detected an attempt to access developer tools on your Phein Screener session. We wanted to check in and see if you are experiencing any issues with the software that may have prompted this.\n\nIf you are having trouble with a feature, need help with a screening task, or have questions about how Phein Screener works, our team is here to help. Please reach out to us at labs@mortappsstudios.com and we will be happy to assist.\n\nPlease note that accessing developer tools or attempting to modify the application is prohibited under the lease agreement. If you need a feature that is not currently available, let us know and we will explore adding it.\n\nBest regards,\nMortApps Studios'
        },
        {
          title: 'Lease Agreement Reminder',
          subject: 'Phein Screener — Gentle Reminder About Your Lease Terms',
          body: 'Dear ' + company + ',\n\nThis is a courtesy notification to let you know that our security monitoring system recorded an attempt to access developer tools on your Phein Screener account (' + method + ' at ' + time + ').\n\nUnder Section 3 of the Phein Screener Lease Agreement, the following activities are prohibited:\n  - Reverse engineering, decompiling, or disassembling the software\n  - Attempting to circumvent security or access control mechanisms\n  - Using developer tools to inspect or modify the application\n\nThis notification is for your records. No action has been taken against your account at this time. However, repeated violations may result in access revocation without refund.\n\nIf you have any questions, please contact us at labs@mortappsstudios.com.\n\nRegards,\nMortApps Studios'
        }
      ],
      security_strike_2: [
        {
          title: 'Stern Warning — One Strike Remaining',
          subject: 'IMPORTANT: Second Security Violation — Phein Screener',
          body: 'Dear ' + company + ',\n\nThis is our second notification regarding security violations on your Phein Screener account. Our system has detected another attempt to access developer tools or tamper with the application (' + method + ' at ' + time + ').\n\nYou now have ' + (parseInt(maxViolations) - parseInt(violationCount)) + ' warning remaining before your access is permanently revoked. If a third violation occurs, your license key will be blacklisted and you will lose all access to Phein Screener without refund.\n\nWe urge you to review the Phein Screener Lease Agreement, specifically Section 3 (Prohibited Activities) and Section 4 (Monitoring and Enforcement). These terms were accepted at the time of activation.\n\nIf you believe these violations are occurring without your knowledge (for example, by another person using your device), please contact us immediately at labs@mortappsstudios.com to secure your account.\n\nThis is a final warning. Please take it seriously.\n\nRegards,\nMortApps Studios'
        },
        {
          title: 'Final Notice Before Revocation',
          subject: 'FINAL NOTICE: Phein Screener Account at Risk',
          body: 'Dear ' + company + ',\n\nYou are receiving this notice because your Phein Screener account has recorded a second security violation. This is your final warning before permanent revocation.\n\nViolation details:\n  Violation count: ' + violationCount + ' of ' + maxViolations + '\n  Latest method: ' + method + '\n  Time: ' + time + '\n\nOne more violation will result in:\n  - Immediate revocation of your license\n  - Blacklisting of your access code on all devices\n  - No refund of any lease fees paid\n  - Potential legal action under applicable IP and cybercrime laws\n\nIf you have any questions or concerns, or if you believe these violations are the result of unauthorized access to your device, please contact us immediately at labs@mortappsstudios.com.\n\nMortApps Studios takes the security of its software seriously. We encourage you to comply with the terms of your lease agreement.\n\nRegards,\nMortApps Studios'
        },
        {
          title: 'Direct Contact — Let Us Help',
          subject: 'We Need to Talk About Your Phein Screener Account',
          body: 'Dear ' + company + ',\n\nI am reaching out personally because your Phein Screener account has triggered a second security alert. Under our monitoring system, one more violation will result in permanent loss of access.\n\nI want to understand what is happening on your end. Are you experiencing a technical issue that is leading you to inspect the code? Is someone else using your device? Is there a feature you need that is not currently available?\n\nWhatever the reason, I would rather help you resolve the issue than revoke your access. Please reply to this email or call us so we can discuss.\n\nHowever, I must be clear: if a third violation occurs before we connect, our system will automatically blacklist your code and revoke your access. This is not a decision I make manually — it is automated.\n\nI look forward to hearing from you.\n\nBest regards,\nMortApps Studios\nlabs@mortappsstudios.com'
        }
      ],
      security_strike_3: [
        {
          title: 'Access Revoked — License Terminated',
          subject: 'NOTICE: Phein Screener License Revoked — ' + company,
          body: 'Dear ' + company + ',\n\nThis letter serves as formal notice that your Phein Screener license has been permanently revoked effective immediately.\n\nReason: Your account reached the maximum number of permitted security violations (' + maxViolations + ' of ' + maxViolations + '). The following activities were detected:\n  1. Developer tools access or tampering attempts\n  2. Repeated violations despite prior warnings\n\nConsequences:\n  - Your access code (' + code + ') has been blacklisted on all devices\n  - You will no longer be able to activate or use Phein Screener\n  - No refund of lease fees will be provided\n  - The violation has been logged and may be reported to relevant authorities\n\nThis action is taken in accordance with Section 4 (Monitoring and Enforcement) and Section 6 (Term and Termination) of the Phein Screener Lease Agreement, which you accepted at the time of activation.\n\nIf you believe this revocation was made in error, you may submit an appeal by emailing labs@mortappsstudios.com within 7 days of this notice. Appeals are reviewed on a case by case basis.\n\nMortApps Studios\nlabs@mortappsstudios.com'
        },
        {
          title: 'Legal Notice — Breach of Agreement',
          subject: 'LEGAL NOTICE: Breach of Phein Screener Lease Agreement',
          body: 'Dear ' + company + ',\n\nThis communication constitutes a formal legal notice regarding your breach of the Phein Screener Lease Agreement (the "Agreement").\n\nNature of Breach:\nYour account recorded ' + maxViolations + ' security violations, consisting of repeated attempts to access developer tools, inspect application code, or circumvent security measures. These activities are expressly prohibited under Section 3 of the Agreement.\n\nAction Taken:\nPursuant to Section 4 and Section 6 of the Agreement, MortApps Studios has terminated your license effective immediately. Your access code has been blacklisted globally.\n\nReservation of Rights:\nMortApps Studios reserves all rights and remedies available under the Agreement, including but not limited to:\n  - Retention of all lease fees paid\n  - Civil action for damages resulting from the breach\n  - Referral to law enforcement if circumvention of technological protection measures is detected (per DMCA Section 1201)\n\nThis notice is provided for your records. No further warnings will be issued.\n\nMortApps Studios\nlabs@mortappsstudios.com'
        },
        {
          title: 'Appeal Process',
          subject: 'Phein Screener Access Revoked — Appeal Information',
          body: 'Dear ' + company + ',\n\nYour Phein Screener license has been revoked due to repeated security violations. We understand that situations can be complex, and we want to ensure that our security system has not made an error.\n\nIf you believe the revocation was unwarranted, you may submit an appeal. Here is the process:\n\n  1. Email labs@mortappsstudios.com within 7 days of receiving this notice.\n  2. Include "APPEAL" in the subject line along with your company name.\n  3. Provide a brief explanation of why you believe the violations were not intentional or were the result of unauthorized access to your device.\n  4. Our team will review your case within 5 business days.\n\nPlease note:\n  - Appeals are not guaranteed to result in reinstatement.\n  - If your appeal is denied, the revocation is final.\n  - If your appeal is approved, a new access code will be issued and the violation counter will be reset.\n\nWe appreciate your cooperation.\n\nMortApps Studios'
        }
      ],
      blacklisted: [
        {
          title: 'Access Revoked — Code Blacklisted',
          subject: 'Phein Screener — Access Code Blacklisted',
          body: 'Dear ' + company + ',\n\nYour Phein Screener access code has been blacklisted due to repeated security violations. You will no longer be able to access the software using this code.\n\nIf you believe this was an error, please contact us at labs@mortappsstudios.com to submit an appeal.\n\nMortApps Studios'
        },
        {
          title: 'Blacklist Confirmation',
          subject: 'Confirmation: License Revoked — ' + company,
          body: 'Dear ' + company + ',\n\nThis email confirms that your Phein Screener license has been revoked and your access code (' + code + ') has been added to our global blacklist. Any future attempts to use this code will be blocked.\n\nFor appeal information, please contact labs@mortappsstudios.com.\n\nMortApps Studios'
        },
        {
          title: 'Final Communication',
          subject: 'Final Notice — Phein Screener License Terminated',
          body: 'Dear ' + company + ',\n\nThis is the final communication you will receive regarding your Phein Screener license. Your access has been permanently revoked due to security violations.\n\nNo further warnings or notifications will be sent. If you wish to appeal, you must do so within 7 days by contacting labs@mortappsstudios.com.\n\nMortApps Studios'
        }
      ],
      blacklisted_attempt: [
        {
          title: 'Blacklisted Code Attempt — Internal Note',
          subject: '[INTERNAL] Blacklisted Code Attempt — ' + code,
          body: 'INTERNAL NOTE (no user to contact):\n\nSomeone attempted to activate a blacklisted code (' + code + '). The attempt was blocked.\n\nIf this is a repeat offender, consider adding additional security measures. If the attempts are coming from the same IP range, you may want to block that range at the server level.\n\nNo user-facing communication is needed for this alert type.'
        },
        {
          title: 'Repeat Offender Notice (if contact info available)',
          subject: 'Phein Screener — Access Denied',
          body: 'Dear ' + company + ',\n\nAn attempt was made to activate an access code that has been blacklisted. The code you entered (' + code + ') is under review and cannot be used at this time.\n\nIf you believe this is an error, please contact us at labs@mortappsstudios.com with your company details and proof of purchase.\n\nMortApps Studios'
        },
        {
          title: 'Investigation Notice',
          subject: 'Phein Screener — Your Code is Under Review',
          body: 'Dear ' + company + ',\n\nThe access code you attempted to use (' + code + ') has been flagged for suspicious activity and is currently under review. During this review period, the code cannot be activated.\n\nOur team will investigate and contact you with an update within 5 business days. If you have any information that may help with the investigation, please email labs@mortappsstudios.com.\n\nMortApps Studios'
        }
      ],
      security_alert: [
        {
          title: 'Security Activity Notice',
          subject: 'Phein Screener — Security Activity on Your Account',
          body: 'Dear ' + company + ',\n\nOur monitoring system recorded security related activity on your Phein Screener account (' + method + ' at ' + time + ').\n\nWe are notifying you as a courtesy. If this activity was performed by you or an authorized user of your device, no further action is required. However, if you are unaware of this activity, please contact us immediately at labs@mortappsstudios.com so we can secure your account.\n\nPlease remember that attempts to access developer tools, inspect application code, or circumvent security measures are prohibited under the Phein Screener Lease Agreement. Repeated violations may result in access revocation.\n\nRegards,\nMortApps Studios'
        },
        {
          title: 'Lease Agreement Reminder',
          subject: 'Phein Screener — Security Notice and Lease Reminder',
          body: 'Dear ' + company + ',\n\nThis is a notification that our security system detected activity on your account that triggered our monitoring system. The specific activity was: ' + method + '.\n\nUnder Section 3 of the Phein Screener Lease Agreement, the following activities are prohibited:\n  - Reverse engineering, decompiling, or disassembling the software\n  - Attempting to circumvent security or access control mechanisms\n  - Using developer tools to inspect or modify the application\n\nPlease ensure that all users of your Phein Screener license are aware of these terms. If you have any questions, contact us at labs@mortappsstudios.com.\n\nRegards,\nMortApps Studios'
        },
        {
          title: 'Check In — How Can We Help?',
          subject: 'Phein Screener — Checking In',
          body: 'Dear ' + company + ',\n\nWe noticed some activity on your Phein Screener account and wanted to check in to make sure everything is working smoothly.\n\nIf you are experiencing any issues with the software — a feature not working as expected, a screening result that looks off, or a workflow that needs adjustment — please reach out to us at labs@mortappsstudios.com. We are here to help.\n\nPlease note that accessing developer tools or attempting to modify the application is not necessary for normal use and is prohibited under the lease agreement. If you need a feature that is not currently available, let us know and we will explore adding it.\n\nBest regards,\nMortApps Studios'
        }
      ],
      purchase: [
        {
          title: 'Thank You + Next Steps',
          subject: 'Thank You for Your Interest in Phein Screener',
          body: 'Dear ' + (fields.name || company) + ',\n\nThank you for requesting a Phein Screener license key. We have received your request and will get back to you shortly with pricing and payment instructions.\n\nYour request details:\n  Company: ' + (fields.company || 'N/A') + '\n  Role: ' + (fields.role || 'N/A') + '\n  Desired duration: ' + (fields.duration || 'N/A') + '\n  Location: ' + (fields.location || 'N/A') + '\n  Preferred contact: ' + (fields.preferred_contact || 'N/A') + '\n\nA member of our team will reach out to you within 24 hours to finalize your lease.\n\nWarm regards,\nMortApps Studios'
        },
        {
          title: 'Payment Instructions',
          subject: 'Phein Screener — Pricing and Payment Instructions',
          body: 'Dear ' + (fields.name || company) + ',\n\nThank you for choosing Phein Screener. Based on your request for a ' + (fields.duration || 'license') + ', here are the pricing details and payment instructions.\n\nOnce payment is confirmed, we will generate your unique access code and email it to you within 2 hours. You will then be able to activate Phein Screener on your desktop computer.\n\nIf you have any questions, please contact us at labs@mortappsstudios.com.\n\nBest regards,\nMortApps Studios'
        },
        {
          title: 'Welcome Aboard (Post Payment)',
          subject: 'Welcome to Phein Screener — Your Access Code Inside',
          body: 'Dear ' + (fields.name || company) + ',\n\nWelcome aboard. Your Phein Screener license is ready.\n\nYour access code: [GENERATED CODE]\n\nTo activate your license:\n  1. Open Phein Screener at https://www.mortappsstudios.com/Phein-Screener.Lease/\n  2. Click "Access Your Lease"\n  3. Enter your company name, the access code above, and your lease duration\n  4. Accept the Terms and Conditions\n  5. Click "Proceed to Phein Screener"\n\nYour license is active for ' + (fields.duration || 'the selected duration') + '. If you need any assistance, our team is available at labs@mortappsstudios.com.\n\nHappy screening,\nMortApps Studios'
        }
      ],
      review: [
        {
          title: 'Thank You for Your Review',
          subject: 'Thank You for Your Phein Screener Review',
          body: 'Dear ' + (fields.name || 'Valued User') + ',\n\nThank you for taking the time to share your experience with Phein Screener. Your review has been received and will be added to our website shortly.\n\nWe appreciate your feedback and are committed to continuously improving Phein Screener for all our clients.\n\nWarm regards,\nMortApps Studios'
        },
        {
          title: 'Follow Up — Suggestions Welcome',
          subject: 'Thank You — We Would Love to Hear More',
          body: 'Dear ' + (fields.name || 'Valued User') + ',\n\nThank you for your review of Phein Screener. We are glad to hear about your experience.\n\nIf you have any suggestions for how we can improve the software, or if there are features you would like to see in future updates, we would love to hear from you. Please reply to this email with any ideas.\n\nBest regards,\nMortApps Studios'
        },
        {
          title: 'Testimonial Request',
          subject: 'Would You Be Willing to Share More?',
          body: 'Dear ' + (fields.name || 'Valued User') + ',\n\nThank you for your review of Phein Screener. Your feedback means a lot to us.\n\nWe are always looking for detailed testimonials to help other hiring teams understand the value of Phein Screener. Would you be willing to share a longer testimonial (a few sentences about how Phein has impacted your hiring process)?\n\nIf so, simply reply to this email with your testimonial, and we will feature it on our website.\n\nThank you for your support.\n\nMortApps Studios'
        }
      ],
      ai_alert: [
        {
          title: 'AI Crawler Detected — Internal Note',
          subject: '[INTERNAL] AI Crawler Detection',
          body: 'INTERNAL NOTE (no user to contact):\n\nAn AI crawler or bot was detected attempting to access the application. This is an automated scan, not a human user.\n\nBot details:\n  User agent: ' + (fields.user_agent || fields.device_user_agent || 'N/A') + '\n  Time: ' + time + '\n  URL: ' + (fields.url || fields.device_current_url || 'N/A') + '\n\nNo action is required. The bot was blocked and redirected to the AI warning page. If you notice frequent bot activity, consider strengthening your server-level bot blocking rules.'
        },
        {
          title: 'AI Warning Page Accessed — Internal Note',
          subject: '[INTERNAL] AI Warning Page Accessed',
          body: 'INTERNAL NOTE:\n\nSomeone (or something) accessed the AI warning page. This could be an AI crawler that was redirected, or a human who found the page.\n\nNo action is required unless the activity is frequent or suspicious.'
        },
        {
          title: 'Suspicious Activity Log — Internal Note',
          subject: '[INTERNAL] Suspicious Activity Logged',
          body: 'INTERNAL NOTE:\n\nSuspicious activity was detected and logged. Review the details below and determine if further action is needed.\n\nTime: ' + time + '\nURL: ' + (fields.url || fields.device_current_url || 'N/A') + '\nUser agent: ' + (fields.user_agent || fields.device_user_agent || 'N/A') + '\n\nIf this is a one time event, no action is needed. If it recurs, consider blocking the IP at the server level.'
        }
      ],
      test: [
        {
          title: 'Test Alert — No Action Needed',
          subject: '[TEST] Formspree Connectivity Test',
          body: 'This is a test alert. If you received this, your Formspree shield is working correctly. No action is needed.'
        }
      ],
      unknown: [
        {
          title: 'Alert Received — Review Required',
          subject: 'Phein Screener Alert — Manual Review Required',
          body: 'An alert was received that could not be automatically categorized. Please review the raw alert data and determine the appropriate response.\n\nRaw data:\n' + JSON.stringify(fields, null, 2)
        },
        {
          title: 'Generic Acknowledgment',
          subject: 'Phein Screener — Your Inquiry Has Been Received',
          body: 'Dear ' + company + ',\n\nWe have received your communication and our team will review it shortly. If further action is required, we will contact you within 24 hours.\n\nMortApps Studios'
        }
      ]
    };

    return templates[scenario] || templates.unknown;
  }

  // =============================================================
  // FULL PROCESS — parse + identify + explain + generate templates
  // =============================================================
  function process(rawText) {
    var parsed = parse(rawText);
    if (parsed.error) return parsed;

    var scenario = identify(parsed.fields);
    var explanation = explain(scenario, parsed.fields);
    var templates = generateTemplates(scenario, parsed.fields);

    return {
      scenario: scenario,
      fields: parsed.fields,
      explanation: explanation,
      templates: templates,
      raw: parsed.raw
    };
  }

  // =============================================================
  // PUBLIC API
  // =============================================================
  window.PSFReader = {
    parse: parse,
    identify: identify,
    explain: explain,
    generateTemplates: generateTemplates,
    process: process
  };
})(window);
