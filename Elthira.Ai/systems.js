/**
 * ============================================================================
 * Elthira.AI - System Control File
 * Powered By MortApps Studios
 *
 * This file controls system-wide settings. Edit values below to change
 * how Elthira behaves without touching the main code.
 *
 * ============================================================================
 * SECTION 1: BRAND RECOMMENDATIONS
 * ============================================================================
 * To mark a brand as "Recommended", type 'Rec' next to its name in the
 * RECOMMENDED_BRANDS array below. That brand will show a green
 * "Recommended" tag in the results page. You can mark multiple brands.
 *
 * To remove the tag, delete the brand name from the array.
 *
 * Brand names must EXACTLY match the names in f7-multi.js.
 * ============================================================================
 */

window.SYSTEMS_CONFIG = {

    // === BRAND RECOMMENDATIONS ===
    // Type 'Rec' next to a brand name to show a green "Recommended" tag.
    // Remove the name to hide the tag.
    // Names must match f7-multi.js exactly.
    RECOMMENDED_BRANDS: [
        // "Harriet Botanicalics",  // <-- Remove // to activate
        // "Neem Nutraceuticals",
        // "Hemani Naturals",
        // "Healthy U",
        // "Ayurherbs and Spices",
        // "General Herbal Products",
        // "Dr Spice Organics",
    ],

    // === COMPARE TOGGLE ===
    // Set to true to show the "Compare Brands" toggle on the results page.
    // When enabled, patients can compare products across brands side by side.
    COMPARE_TOGGLE: true,

    // === PRICING TRANSPARENCY ===
    // Set to true to show prices for all products in the results.
    // Set to false to hide prices (shows "Contact brand for pricing" instead).
    SHOW_PRICES: true,

    // === FUTURE FEATURES ===
    // Add more system settings here as features are built.
    // This file is the single control point for Elthira.AI Universal.

    // Helper function: check if a brand is recommended
    isRecommended: function(brandName) {
        if (!this.RECOMMENDED_BRANDS || this.RECOMMENDED_BRANDS.length === 0) return false;
        return this.RECOMMENDED_BRANDS.indexOf(brandName) !== -1;
    }
};
