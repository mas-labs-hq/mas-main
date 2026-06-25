/**
 * Elthira.AI - Product Recommendations Database
 * Powered By MortApps Studios
 * 
 * This file contains real herbal products from brands available in Kenya,
 * primarily Dr. Spice and other reputable herbal brands.
 * 
 * When a clinic purchases Elthira.AI, their products can be added here.
 */

var HERBAL_PRODUCTS = {
    brands: [
        {
            name: "Dr. Spice",
            description: "Kenya's leading herbal wellness brand, offering a wide range of natural health products",
            website: "drspice.co.ke",
            products: [
                {
                    name: "Dr. Spice Ginger Tea",
                    keyIngredients: ["ginger", "ginger extract", "lemongrass"],
                    treats: ["stomach upset", "nausea", "digestion problems", "motion sickness", "morning sickness", "cold and flu"],
                    treatsKeywords: ["stomach pain", "nausea", "vomiting", "upset stomach", "indigestion", "cough", "cold", "flu", "chills"],
                    dosage: "Steep 1 tea bag in hot water for 5 minutes. Drink 2-3 cups daily, preferably after meals.",
                    priceRange: "KES 150-300 per box",
                    availability: "Available in all major supermarkets (Naivas, Tuskys, Carrefour), pharmacies, and online at Jumia/Jiji",
                    description: "A premium ginger tea blend that soothes digestive discomfort, reduces nausea, and supports respiratory health. Made from organically sourced Kenyan ginger."
                },
                {
                    name: "Dr. Spice Moringa Capsules",
                    keyIngredients: ["moringa oleifera leaf powder", "moringa extract"],
                    treats: ["nutritional deficiency", "low energy", "poor immunity", "anemia", "poor appetite", "general weakness"],
                    treatsKeywords: ["fatigue", "low energy", "tired", "weak", "poor appetite", "weight loss", "pale skin", "low immunity", "frequent illness"],
                    dosage: "Take 2 capsules daily with water, preferably after meals.",
                    priceRange: "KES 500-800 per bottle",
                    availability: "Available in major pharmacies, health stores, and online platforms",
                    description: "Premium moringa leaf capsules packed with vitamins, minerals, and antioxidants. Moringa is known as the miracle tree and supports overall wellness, energy, and immune function."
                },
                {
                    name: "Dr. Spice Aloe Vera Juice",
                    keyIngredients: ["aloe vera inner leaf gel", "vitamin C", "vitamin E"],
                    treats: ["constipation", "acid reflux", "stomach ulcers", "skin problems", "detoxification", "digestive cleansing"],
                    treatsKeywords: ["constipation", "acid reflux", "heartburn", "ulcer", "stomach burning", "bloating", "detox", "skin rash", "dry skin"],
                    dosage: "Drink 30ml (2 tablespoons) twice daily before meals. Mix with water or juice if preferred.",
                    priceRange: "KES 600-1000 per bottle",
                    availability: "Available in pharmacies and health stores across Kenya",
                    description: "Pure inner-leaf aloe vera juice for digestive health, detoxification, and skin wellness. Supports healthy digestion and soothes stomach irritation."
                },
                {
                    name: "Dr. Spice Turmeric Capsules",
                    keyIngredients: ["turmeric extract", "curcumin", "black pepper extract", "ginger"],
                    treats: ["inflammation", "joint pain", "arthritis", "muscle pain", "skin inflammation", "digestive inflammation"],
                    treatsKeywords: ["joint pain", "arthritis", "inflammation", "muscle pain", "back pain", "body aches", "swelling", "stiff joints"],
                    dosage: "Take 1 capsule twice daily with meals for optimal absorption.",
                    priceRange: "KES 500-900 per bottle",
                    availability: "Available in pharmacies, health stores, and online",
                    description: "High-potency turmeric extract with black pepper for enhanced absorption. Powerful natural anti-inflammatory for joint and muscle health."
                },
                {
                    name: "Dr. Spice Peppermint Tea",
                    keyIngredients: ["peppermint leaf", "menthol", "chamomile"],
                    treats: ["bloating", "gas", "indigestion", "stress", "headache", "difficulty sleeping"],
                    treatsKeywords: ["bloating", "gas", "flatulence", "indigestion", "stomach discomfort", "stress", "anxiety", "headache", "insomnia", "can't sleep"],
                    dosage: "Steep 1 tea bag in hot water for 5-7 minutes. Drink 2-3 cups daily.",
                    priceRange: "KES 150-300 per box",
                    availability: "Available in supermarkets, pharmacies, and online",
                    description: "A soothing peppermint and chamomile blend that calms the digestive system, relieves gas and bloating, and promotes relaxation."
                },
                {
                    name: "Dr. Spice Neem Tea",
                    keyIngredients: ["neem leaf", "neem bark extract"],
                    treats: ["skin problems", "acne", "fungal infections", "blood purification", "immunity", "dental problems"],
                    treatsKeywords: ["acne", "rash", "skin problem", "fungal infection", "itchy skin", "dandruff", "low immunity", "mouth ulcer"],
                    dosage: "Steep 1 tea bag in hot water for 5-10 minutes. Drink 1-2 cups daily.",
                    priceRange: "KES 150-250 per box",
                    availability: "Available in pharmacies and health stores",
                    description: "Traditional neem tea for skin health, blood purification, and immune support. Neem has been used in Ayurvedic medicine for thousands of years."
                },
                {
                    name: "Dr. Spice Ashwagandha Capsules",
                    keyIngredients: ["ashwagandha root extract", "withanolides"],
                    treats: ["stress", "anxiety", "insomnia", "low energy", "low libido", "mental fatigue", "poor concentration"],
                    treatsKeywords: ["stress", "anxiety", "insomnia", "can't sleep", "fatigue", "low energy", "low libido", "poor concentration", "mental fog", "tired"],
                    dosage: "Take 1 capsule twice daily, preferably with warm milk or water.",
                    priceRange: "KES 600-1200 per bottle",
                    availability: "Available in select pharmacies, health stores, and online",
                    description: "Premium ashwagandha root extract for stress relief, better sleep, improved energy, and hormonal balance. Known as the Indian ginseng for its adaptogenic properties."
                },
                {
                    name: "Dr. Spice Fenugreek Capsules",
                    keyIngredients: ["fenugreek seed extract", "diosgenin", "fiber"],
                    treats: ["poor appetite", "bloating", "low libido", "blood sugar issues", "milk production", "digestive issues"],
                    treatsKeywords: ["poor appetite", "no appetite", "bloating", "gas", "low libido", "blood sugar", "diabetes", "constipation", "digestion"],
                    dosage: "Take 1 capsule twice daily before meals.",
                    priceRange: "KES 400-700 per bottle",
                    availability: "Available in pharmacies and online",
                    description: "Fenugreek seed capsules for appetite stimulation, digestive health, blood sugar support, and vitality. A traditional remedy used across many cultures."
                },
                {
                    name: "Dr. Spice Garlic Capsules",
                    keyIngredients: ["garlic extract", "allicin"],
                    treats: ["high blood pressure", "poor immunity", "frequent colds", "respiratory infections", "cholesterol"],
                    treatsKeywords: ["high blood pressure", "hypertension", "frequent colds", "low immunity", "cough", "flu", "respiratory", "cholesterol"],
                    dosage: "Take 1-2 capsules daily with meals.",
                    priceRange: "KES 300-600 per bottle",
                    availability: "Available in pharmacies and health stores across Kenya",
                    description: "Odorless garlic extract capsules for cardiovascular health, immune support, and respiratory wellness. Rich in allicin for maximum benefit."
                },
                {
                    name: "Dr. Spice Senna Herbal Tea",
                    keyIngredients: ["senna leaf", "senna pod", "peppermint", "fennel"],
                    treats: ["constipation", "irregular bowel", "colon cleansing", "detoxification"],
                    treatsKeywords: ["constipation", "hard stool", "can't poop", "irregular bowel", "bloating", "colon"],
                    dosage: "Steep 1 tea bag in hot water for 5-10 minutes. Drink before bedtime for overnight relief. Do not use for more than 7 consecutive days.",
                    priceRange: "KES 150-300 per box",
                    availability: "Available in pharmacies and supermarkets",
                    description: "A gentle yet effective herbal laxative tea combining senna with peppermint and fennel for comfortable relief from occasional constipation."
                },
                {
                    name: "Dr. Spice Echinacea Tea",
                    keyIngredients: ["echinacea purpurea", "vitamin C", "zinc"],
                    treats: ["common cold", "flu", "low immunity", "respiratory infections", "frequent illness"],
                    treatsKeywords: ["cold", "flu", "cough", "sore throat", "runny nose", "low immunity", "frequent illness", "fever", "chills"],
                    dosage: "Drink 2-3 cups daily at the first sign of cold or flu symptoms.",
                    priceRange: "KES 200-350 per box",
                    availability: "Available in pharmacies and health stores",
                    description: "Immune-boosting echinacea tea with added vitamin C and zinc. Helps shorten the duration and severity of colds and flu."
                },
                {
                    name: "Dr. Spice Activated Charcoal Capsules",
                    keyIngredients: ["activated charcoal", "coconut shell charcoal"],
                    treats: ["diarrhea", "food poisoning", "bloating", "gas", "detoxification", "stomach upset"],
                    treatsKeywords: ["diarrhea", "loose stool", "food poisoning", "stomach upset", "bloating", "gas", "detox", "toxin"],
                    dosage: "Take 2 capsules with water after meals or at first sign of stomach discomfort. Do not take within 2 hours of other medications.",
                    priceRange: "KES 300-600 per bottle",
                    availability: "Available in pharmacies and health stores",
                    description: "Pure activated charcoal capsules for digestive emergencies, detoxification, and relief from food poisoning symptoms. Binds toxins and gas in the digestive tract."
                }
            ]
        },
        {
            name: "Newton's Pharmacy Herbal Range",
            description: "Newton's Pharmacy offers a trusted range of herbal and natural health products in Kenya",
            website: "newtons.co.ke",
            products: [
                {
                    name: "Newton-Sliperi (Slippery Elm)",
                    keyIngredients: ["slippery elm bark powder"],
                    treats: ["stomach ulcers", "acid reflux", "sore throat", "cough", "digestive irritation", "gastritis"],
                    treatsKeywords: ["ulcer", "stomach burning", "acid reflux", "heartburn", "sore throat", "cough", "stomach pain", "gastritis"],
                    dosage: "Mix 1-2 teaspoons in warm water and drink before meals, 2-3 times daily.",
                    priceRange: "KES 400-700",
                    availability: "Available at Newton's Pharmacy branches and select pharmacies",
                    description: "Slippery elm bark powder that coats and soothes the digestive tract. Excellent for ulcers, acid reflux, and throat irritation."
                },
                {
                    name: "Newton-Nemoni (Cleansing Tonic)",
                    keyIngredients: ["neem", "aloe vera", "senna", "dandelion root"],
                    treats: ["detoxification", "skin problems", "constipation", "liver support", "blood purification"],
                    treatsKeywords: ["detox", "skin rash", "acne", "constipation", "liver problems", "jaundice", "blood impurity"],
                    dosage: "Take 15ml twice daily before meals. Shake well before use.",
                    priceRange: "KES 500-900 per bottle",
                    availability: "Available at Newton's Pharmacy branches",
                    description: "A comprehensive herbal cleansing tonic combining neem, aloe, and senna for full-body detoxification and skin health."
                },
                {
                    name: "Newton-Moringa Plus Capsules",
                    keyIngredients: ["moringa leaf", "spirulina", "wheatgrass"],
                    treats: ["nutritional deficiency", "anemia", "low energy", "poor immunity", "weight management"],
                    treatsKeywords: ["fatigue", "anemia", "low energy", "poor immunity", "weight loss", "malnutrition", "weakness"],
                    dosage: "Take 2 capsules daily with meals.",
                    priceRange: "KES 600-1000 per bottle",
                    availability: "Available at Newton's Pharmacy branches",
                    description: "Superfood combination of moringa, spirulina, and wheatgrass for comprehensive nutritional support and energy boost."
                }
            ]
        },
        {
            name: "General Herbal Products",
            description: "Common herbal products available in Kenyan markets, pharmacies, and online stores",
            website: "",
            products: [
                {
                    name: "Blackseed Oil (Nigella Sativa)",
                    keyIngredients: ["blackseed oil", "thymoquinone"],
                    treats: ["immunity", "respiratory problems", "inflammation", "skin conditions", "digestive issues", "high blood pressure"],
                    treatsKeywords: ["low immunity", "cough", "asthma", "wheezing", "inflammation", "joint pain", "skin rash", "stomach upset", "high blood pressure", "allergies"],
                    dosage: "Take 1 teaspoon daily, or 2 capsules. Can also be applied topically to skin.",
                    priceRange: "KES 300-800 (oil), KES 400-1000 (capsules)",
                    availability: "Widely available in pharmacies, health stores, supermarkets, and online",
                    description: "Known as the seed of blessing, blackseed oil has over 100 active compounds and is used for immune support, respiratory health, and overall wellness."
                },
                {
                    name: "Cayenne Pepper Capsules",
                    keyIngredients: ["cayenne pepper extract", "capsaicin"],
                    treats: ["poor circulation", "pain relief", "digestive health", "metabolism boost", "blood clotting"],
                    treatsKeywords: ["poor circulation", "cold hands", "joint pain", "muscle pain", "slow digestion", "low metabolism", "numbness"],
                    dosage: "Take 1 capsule daily with food. Start with a lower dose to assess tolerance.",
                    priceRange: "KES 300-600 per bottle",
                    availability: "Available in health stores and online",
                    description: "Cayenne pepper capsules containing capsaicin for pain relief, improved circulation, and digestive support. A powerful warming herb."
                },
                {
                    name: "St. John's Wort Capsules",
                    keyIngredients: ["hypericum perforatum extract", "hypericin"],
                    treats: ["mild to moderate depression", "anxiety", "stress", "nerve pain", "sleep disorders", "mood swings"],
                    treatsKeywords: ["depression", "anxiety", "stress", "low mood", "sadness", "mood swings", "insomnia", "nerve pain", "poor sleep"],
                    dosage: "Take 1 capsule 2-3 times daily with meals. Effects may take 2-4 weeks to become noticeable.",
                    priceRange: "KES 600-1200 per bottle",
                    availability: "Available in select pharmacies and online stores",
                    description: "A well-researched herbal antidepressant for mild to moderate depression, anxiety, and mood support. May interact with some medications. Consult a pharmacist."
                },
                {
                    name: "Horny Goat Weed (Epimedium) Capsules",
                    keyIngredients: ["epimedium extract", "icariin", "maca root"],
                    treats: ["low libido", "erectile dysfunction", "fatigue", "low stamina", "hormonal imbalance"],
                    treatsKeywords: ["low libido", "sexual weakness", "erectile dysfunction", "fatigue", "low stamina", "low energy", "hormonal imbalance"],
                    dosage: "Take 1-2 capsules daily. Best taken consistently for at least 2-4 weeks.",
                    priceRange: "KES 800-2000 per bottle",
                    availability: "Available in health stores, select pharmacies, and online",
                    description: "Traditional Chinese herbal supplement for sexual wellness, stamina, and hormonal support. Combined with maca root for enhanced effectiveness."
                },
                {
                    name: "Cleavers Herb Tea",
                    keyIngredients: ["cleavers herb", "galium aparine"],
                    treats: ["lymphatic drainage", "skin conditions", "urinary tract health", "detoxification", "fluid retention"],
                    treatsKeywords: ["swollen lymph", "skin rash", "eczema", "urinary tract infection", "fluid retention", "detox", "skin problems"],
                    dosage: "Steep 1-2 teaspoons dried herb in hot water for 10 minutes. Drink 2-3 cups daily.",
                    priceRange: "KES 200-400 per pack",
                    availability: "Available in herbal shops and online",
                    description: "A gentle lymphatic cleanser that supports skin health, urinary function, and detoxification. Excellent for clearing skin conditions from within."
                },
                {
                    name: "Clove Oil Capsules",
                    keyIngredients: ["clove oil", "eugenol"],
                    treats: ["toothache", "respiratory infections", "digestive problems", "oral health", "fungal infections"],
                    treatsKeywords: ["toothache", "tooth pain", "dental pain", "cough", "respiratory infection", "bad breath", "oral thrush", "fungal infection"],
                    dosage: "Take 1 capsule daily after meals. Clove oil can also be applied topically for toothache (diluted).",
                    priceRange: "KES 200-500 per bottle",
                    availability: "Available in pharmacies and health stores",
                    description: "Clove oil capsules containing eugenol, a powerful natural antiseptic and pain reliever. Excellent for dental pain, respiratory support, and digestive health."
                },
                {
                    name: "Holy Basil (Tulsi) Tea",
                    keyIngredients: ["holy basil leaf", "ocimum sanctum", "adaptogenic compounds"],
                    treats: ["stress", "anxiety", "low immunity", "respiratory problems", "fever", "digestive issues"],
                    treatsKeywords: ["stress", "anxiety", "cold", "cough", "fever", "low immunity", "digestion", "respiratory", "fatigue"],
                    dosage: "Steep 1 tea bag or 1 teaspoon dried leaves in hot water for 5-7 minutes. Drink 2-3 cups daily.",
                    priceRange: "KES 150-350 per box",
                    availability: "Available in supermarkets, pharmacies, and online",
                    description: "Known as the queen of herbs in Ayurveda, holy basil is a powerful adaptogen that reduces stress, boosts immunity, and supports respiratory health."
                },
                {
                    name: "Ashwagandha Root Powder",
                    keyIngredients: ["ashwagandha root", "withanolides"],
                    treats: ["stress", "anxiety", "insomnia", "low energy", "muscle weakness", "low libido", "poor concentration"],
                    treatsKeywords: ["stress", "anxiety", "can't sleep", "fatigue", "low energy", "weak", "low libido", "poor concentration", "tired"],
                    dosage: "Mix 1/2 to 1 teaspoon in warm milk or water. Take once or twice daily, preferably before bed.",
                    priceRange: "KES 300-700 per pack",
                    availability: "Available in Kenyan Indian shops, health stores, and online",
                    description: "Pure ashwagandha root powder, an adaptogenic herb used for thousands of years in Ayurvedic medicine. Reduces cortisol, improves sleep, boosts energy, and supports hormonal balance."
                }
            ]
        }
    ],

    getProductsForCondition: function(conditionName, conditionKeywords, category) {
        var matches = [];
        var conditionLower = (conditionName || '').toLowerCase();
        var keywords = (conditionKeywords || []).map(function(k) { return k.toLowerCase(); });

        this.brands.forEach(function(brand) {
            brand.products.forEach(function(product) {
                var score = 0;

                product.treats.forEach(function(treats) {
                    if (conditionLower.includes(treats.toLowerCase()) || treats.toLowerCase().includes(conditionLower)) {
                        score += 10;
                    }
                });

                if (keywords && keywords.length > 0) {
                    product.treatsKeywords.forEach(function(pKeyword) {
                        var pk = pKeyword.toLowerCase();
                        keywords.forEach(function(kw) {
                            if (kw === pk || kw.includes(pk) || pk.includes(kw)) {
                                score += 5;
                            }
                        });
                    });
                }

                if (score > 0) {
                    matches.push({
                        productName: product.name,
                        brand: brand.name,
                        keyIngredients: product.keyIngredients,
                        dosage: product.dosage,
                        priceRange: product.priceRange,
                        availability: product.availability,
                        description: product.description,
                        score: score
                    });
                }
            });
        });

        matches.sort(function(a, b) { return b.score - a.score; });
        return matches.slice(0, 3);
    }
};