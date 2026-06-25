/**
 * Elthira.AI - Dr Spice Organics Edition Config
 * Powered By MortApps Studios
 *
 * This file controls all branding for the Dr Spice deployment.
 * When Jonnah pays the white-label fee, change `appName` and `clinicName`
 * to the name he chooses.
 *
 * To deploy for a NEW clinic: copy this file, edit values, deploy.
 */

window.CLINIC_CONFIG = {
    // App identity
    appName: "Elthira.AI",
    tagline: "Your Herbal Wellness Consultant",  // shown in PDF header - NO "Powered by Dr Spice"
    poweredBy: "MortApps Studios",  // shown in PDF as "Powered by MortApps Studios"
    version: "1.1.0-DrSpice",

    // Clinic Branding (Dr Spice Organics)
    clinicName: "Dr Spice Organics",
    clinicLogo: "elth-images/spice-logo.png",  // Official Dr Spice logo
    clinicEmail: "info@drspiceorganicskenya.com",
    clinicPhone: "+254727175708",  // Main Nairobi CBD number
    clinicWhatsApp: "254727175708",  // Default WhatsApp (Nairobi CBD)
    clinicAddress: "Nacico Coop Chambers, 3rd Floor, Moi Avenue, Nairobi",
    clinicWebsite: "drspiceorganicskenya.com",

    // Branches - 6 locations with separate WhatsApp numbers
    // Patient selects preferred branch in Step 1. WhatsApp sharing routes to selected branch.
    // If patient picks "No preference", defaults to Nairobi CBD (0727 175 708).
    branches: [
        {
            name: "Nairobi CBD",
            address: "Nacico Chambers, 3rd Floor, Moi Ave",
            phone: "0727 175 708",
            whatsapp: "254727175708"
        },
        {
            name: "Hurlingham",
            address: "Behind APA Arcade, Off Argwings Kodhek Rd",
            phone: "0113 006 671",
            whatsapp: "254113006671"
        },
        {
            name: "Ruiru",
            address: "Morovian Mall, 2nd Floor, Thika Rd",
            phone: "0113 853 878",
            whatsapp: "254113853878"
        },
        {
            name: "Thika",
            address: "Stage View Plaza, Shop G20",
            phone: "0119 33 4422",
            whatsapp: "254119334422"
        },
        {
            name: "Nakuru",
            address: "Ereto Plaza, 6th Floor",
            phone: "0726 760 517",
            whatsapp: "254726760517"
        },
        {
            name: "Eldoret",
            address: "Behind Naivas Supermarket",
            phone: "0113 006 671",  // Shared with Hurlingham (confirmed intentional)
            whatsapp: "254113006671"
        }
    ],

    // Formspree endpoint - BOOKINGS ONLY (silent submission removed)
    formspreeEndpoint: "https://formspree.io/f/xpqykznw",

    // Colours - Dr Spice brand green palette (kept consistent with Elthira)
    primaryColor: [45, 106, 79],
    accentColor: [212, 163, 115],
    lightGreen: [216, 243, 220],
    darkGreen: [27, 67, 50],

    // Analysis Settings
    maxResults: 3,
    showAllRemedies: true,
    includeBestPractices: true,
    includeCautions: true,
    includeWhenToSeeDoctor: true,

    // Consolidated recommendation settings
    maxHerbRecommendations: 3,
    maxProductRecommendations: 3,

    // Dr Spice exclusive mode - only Dr Spice products shown
    drSpiceExclusive: true,

    // Feature flags for Dr Spice edition
    features: {
        bookingSection: true,         // Book appointment UI (Formspree)
        silentSubmission: false,      // REMOVED - no more silent background submission
        consentCheckbox: true,        // Opt-in consent for data sharing
        pdfDrSpiceLogo: true,         // PDF shows Dr Spice logo header
        pdfSendButtons: true,         // PDF has Email + WhatsApp send buttons
        guidePopup: true,             // 6-second guide pop-up after results
        branchSelection: true,        // Patient picks preferred branch
        swahiliSynonyms: true,        // Smart engine: Swahili symptom names
        severityTiering: true         // Smart engine: severity-aware scoring
    }
};
