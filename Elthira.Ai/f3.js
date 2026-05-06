/**
 * Elthira.AI - Knowledge Base: Skin & Wounds
 * Powered By MortApps Studios
 * 
 * Covers: Rashes, acne, wounds, burns, eczema,
 * fungal infections, dry skin, dandruff, insect bites
 */

var HERBAL_DATA_F3 = {
    category: "Skin and Wounds",
    regionalNote: "Skin conditions are among the top reasons Kenyans seek both traditional and modern medical care. Traditional herbal skin remedies are deeply rooted in Kenyan culture, with each community having specific plants used for wound healing, skin infections, and beauty. The tropical climate in Kenya, with its heat and humidity, creates favorable conditions for fungal and bacterial skin infections. Coastal regions have unique remedies derived from coconut and mangrove plants, while highland communities utilize herbs like aloe vera and neem extensively.",
    conditions: [
        {
            name: "Acne and Pimples",
            keywords: ["acne", "pimples", "spots", "breakouts", "blackheads", "whiteheads", "skin bumps", "facial spots", "zits", "skin inflammation"],
            relatedKeywords: ["pimple scars", "oily skin", "clogged pores", "teenage acne", "hormonal acne"],
            severity: "mild",
            description: "Acne is a common skin condition that occurs when hair follicles become clogged with oil and dead skin cells. It causes whiteheads, blackheads, and pimples, and can occur on the face, chest, shoulders, and back. Acne is most common among teenagers due to hormonal changes, but can affect adults too. In Kenya, the hot and humid climate can worsen acne by increasing sweat and oil production. Stress, diet, and certain skincare products can also contribute to breakouts.",
            lifestyleFactors: ["oily skin", "hormones", "puberty", "stress", "diet", "humidity", "sweat", "poor skincare", "cosmetics"],
            herbalRemedies: [
                {
                    name: "Aloe Vera",
                    swahiliName: "Mwango",
                    preparation: "Extract fresh aloe vera gel from a leaf. Apply a thin layer directly to clean skin. Leave on for 20-30 minutes, then rinse. For best results, use fresh gel daily. The gel can also be left on overnight for more intensive treatment.",
                    dosage: "Apply fresh aloe vera gel to affected areas twice daily (morning and evening). Consistent daily use for 4-6 weeks shows best results.",
                    cautions: "Test on a small area first for allergic reactions. Pure aloe gel is generally very safe. Avoid using the latex (yellow part) on skin as it can irritate. Commercial aloe gels with additives may clog pores - fresh is best.",
                    availability: "Aloe vera plants are common across Kenya. Many households grow aloe for skin care.",
                    brandReferences: "Dr. Spice offers aloe vera skin products"
                },
                {
                    name: "Tea Tree Oil",
                    swahiliName: "Mafuta ya mti wa chai",
                    preparation: "Dilute tea tree oil with a carrier oil (coconut or jojoba oil) in a 1:9 ratio (1 part tea tree oil to 9 parts carrier oil). Apply to pimples using a cotton swab. Do NOT apply undiluted to skin.",
                    dosage: "Apply diluted oil to individual pimples 1-2 times daily. Do not use all over face unless properly diluted.",
                    cautions: "CAUTION: Never apply undiluted tea tree oil to skin - it can cause burns and irritation. Keep away from eyes and mucous membranes. May cause dryness and peeling. Discontinue if severe irritation occurs. Not for pregnant or breastfeeding women without medical advice.",
                    availability: "Available in Kenyan pharmacies, health stores, and supermarkets. Imported but widely stocked.",
                    brandReferences: ""
                },
                {
                    name: "Neem",
                    swahiliName: "Mwarubaini",
                    preparation: "For topical use: Boil neem leaves in water, cool, and use as a face wash. For paste: Grind fresh neem leaves with a little water to make a paste, apply to pimples for 15-20 minutes, then rinse. Neem-based soaps and face washes are also commercially available.",
                    dosage: "Use neem water as face wash 2 times daily. Neem paste: Apply to affected areas 3-4 times weekly. Neem soap: Use daily for cleansing.",
                    cautions: "Neem is very drying - follow up with a light moisturizer. Some people may experience redness or irritation. Test on a small area first. Do not apply to broken skin. Long-term internal use without supervision may affect liver function.",
                    availability: "Neem trees are widespread in Kenya. Neem soaps and skin products available in Kenyan markets and supermarkets.",
                    brandReferences: "Dr. Spice and other Kenyan brands carry neem skin products"
                },
                {
                    name: "Turmeric",
                    swahiliName: "Manjano",
                    preparation: "Mix 1/2 teaspoon of turmeric powder with 1 tablespoon of honey or yogurt to form a paste. Apply to clean skin and leave for 15-20 minutes. Rinse with lukewarm water. Turmeric can also be added to face steam water.",
                    dosage: "Apply turmeric mask 2-3 times weekly. For spot treatment: Apply small amount of turmeric paste directly on pimples.",
                    cautions: "WARNING: Turmeric can temporarily stain skin with a yellow tint. It will wash off. It can also stain clothing and towels - use old ones. Test on small area first. People with very sensitive skin may experience irritation.",
                    availability: "Turmeric is very cheap and available in every Kenyan market.",
                    brandReferences: ""
                },
                {
                    name: "Moringa",
                    swahiliName: "Mlonge",
                    preparation: "Mix moringa leaf powder with a little water or rose water to make a paste. Apply to face as a mask for 15-20 minutes, then rinse. Moringa oil can also be applied as a lightweight moisturizer.",
                    dosage: "Use moringa face mask 2-3 times weekly. Moringa oil can be applied daily as moisturizer.",
                    cautions: "Generally very safe. Test on small area first. Moringa leaf powder is gentle and suitable for most skin types.",
                    availability: "Moringa is widely available across Kenya. Moringa oil and powder available in health stores and supermarkets.",
                    brandReferences: "Dr. Spice carries moringa skin and hair products"
                }
            ],
            bestPractices: [
                "Wash face twice daily with a gentle cleanser - avoid harsh soaps",
                "Do not squeeze or pick at pimples - this causes scarring and spreads infection",
                "Use non-comedogenic (non-pore-clogging) skincare products",
                "Keep hands away from your face throughout the day",
                "Change pillowcases weekly - they harbor bacteria and oil",
                "Shower after sweating to prevent pore blockage",
                "Protect skin from excessive sun exposure - use sunscreen",
                "Reduce intake of sugary foods and dairy, which may worsen acne in some people",
                "Stay hydrated by drinking plenty of water",
                "Manage stress through exercise, meditation, or hobbies",
                "Avoid sharing towels, face cloths, or makeup with others"
            ],
            whenToSeeDoctor: "Consult a dermatologist or healthcare provider if acne is severe and cystic, if over-the-counter and herbal remedies do not improve the condition after 3 months, if acne is causing significant emotional distress or scarring, or if acne suddenly develops in adulthood (may indicate hormonal imbalance)."
        },
        {
            name: "Wounds, Cuts, and Minor Injuries",
            keywords: ["wound", "cut", "scratch", "minor injury", "bleeding cut", "scrape", "open wound", "skin injury", "graze", "razor cut", "knife cut"],
            relatedKeywords: ["wound healing", "wound infection", "slow healing wound", "scar prevention"],
            severity: "mild",
            description: "Minor wounds, cuts, and scrapes are everyday injuries that require proper cleaning and care to prevent infection and promote healing. Herbal remedies have been used for wound care for centuries in Kenya. Many traditional wound-healing plants contain antimicrobial, anti-inflammatory, and tissue-regenerating properties. Proper wound care involves cleaning the wound, applying antimicrobial agents, and covering appropriately. While minor wounds can be managed at home, deeper or severely bleeding wounds require medical attention.",
            lifestyleFactors: ["accidents", "cooking injuries", "sports", "physical work", "construction", "children playing", "sharp objects"],
            herbalRemedies: [
                {
                    name: "Honey",
                    swahiliName: "Asali",
                    preparation: "Clean the wound with clean water. Apply a thin layer of raw, unprocessed honey directly to the wound. Cover with a sterile bandage. Change the dressing and reapply honey daily. Medical-grade honey (Manuka) is ideal but any raw honey works.",
                    dosage: "Apply honey to wound once daily, changing the bandage with each application. Continue until wound is fully healed.",
                    cautions: "Only use raw, unprocessed honey. Commercial honey may not have medicinal properties. Ensure wound is properly cleaned before applying honey. If wound shows signs of infection (increasing redness, swelling, pus, warmth), seek medical care immediately.",
                    availability: "Raw Kenyan honey is widely available from local beekeepers and markets.",
                    brandReferences: "Kenyan raw honey from Kitui, Baringo, and West Pokot is excellent for wound care"
                },
                {
                    name: "Aloe Vera",
                    swahiliName: "Mwango",
                    preparation: "Clean the wound. Extract fresh aloe vera gel from a leaf. Apply directly to the wound. Aloe vera promotes cell regeneration and has mild antimicrobial properties. Cover with a loose bandage.",
                    dosage: "Apply fresh aloe gel to the wound 2-3 times daily. Continue until wound is closed and healing well.",
                    cautions: "Use only the clear inner gel, not the yellow latex. Clean the aloe leaf surface before extracting gel to avoid introducing bacteria. Test on a small area first. If wound is deep or large, seek medical attention instead of relying solely on home remedies.",
                    availability: "Aloe vera plants are common in Kenyan households.",
                    brandReferences: ""
                },
                {
                    name: "Turmeric",
                    swahiliName: "Manjano",
                    preparation: "For external wound care: Mix turmeric powder with a little water or coconut oil to make a paste. Apply around (not directly inside) the wound to prevent infection and reduce inflammation. For bleeding: Apply turmeric powder directly to minor cuts to help stop bleeding.",
                    dosage: "Apply turmeric paste around wound edges 1-2 times daily. For bleeding control: Apply turmeric powder directly, press with clean cloth for 5-10 minutes.",
                    cautions: "Turmeric will temporarily stain skin and clothing yellow. Turmeric powder can sting when applied directly to open wounds. For deep wounds, clean and cover first, then apply around the edges. Not a substitute for proper wound cleaning and medical care for serious wounds.",
                    availability: "Very cheap and available everywhere in Kenya.",
                    brandReferences: ""
                },
                {
                    name: "Neem Leaf Wash",
                    swahiliName: "Maji ya majani ya mwarubaini",
                    preparation: "Boil a handful of fresh neem leaves in 3 cups of water for 15 minutes. Cool and strain. Use this neem water to clean wounds. Neem has powerful antimicrobial properties that help prevent infection.",
                    dosage: "Use neem water to clean wounds 2-3 times daily. Can also be used as an antiseptic wash for minor skin infections.",
                    cautions: "Use only externally on wounds. Neem water should be freshly prepared or refrigerated and used within 24 hours. Ensure the wound is cleaned with fresh solution. If signs of infection develop, seek medical care.",
                    availability: "Neem trees are common across Kenya. Fresh leaves are freely available.",
                    brandReferences: ""
                },
                {
                    name: "Coconut Oil",
                    swahiliName: "Mafuta ya nazi",
                    preparation: "Apply virgin coconut oil to the healing wound after the initial wound has closed. Coconut oil helps keep the wound moist, reduces scarring, and has mild antimicrobial properties. It is especially beneficial during the later stages of wound healing.",
                    dosage: "Apply a thin layer of virgin coconut oil to the wound area 2-3 times daily once initial healing has begun. Massage gently in circular motions.",
                    cautions: "Do not apply to fresh, open, or bleeding wounds - use only after initial closure. Pure virgin coconut oil is preferred over refined versions. May stain clothing. Generally very safe.",
                    availability: "Coconut oil is produced abundantly in Kenya's coastal region. Available in markets and supermarkets nationwide.",
                    brandReferences: "Kenyan coconut oil from Coast region is highly recommended"
                }
            ],
            bestPractices: [
                "FIRST: Stop bleeding by applying firm, direct pressure with a clean cloth",
                "Clean wounds immediately with clean water (or saline solution) to prevent infection",
                "Apply gentle soap around the wound (not inside) during cleaning",
                "Apply an antiseptic (herbal or commercial) after cleaning",
                "Cover the wound with a sterile bandage to keep it clean",
                "Change bandages daily or when they get wet or dirty",
                "Monitor for signs of infection: increasing pain, redness, swelling, warmth, pus, red streaks",
                "Keep the wound slightly moist - this promotes faster healing and reduces scarring",
                "Do not pick at scabs as they form - they protect the healing tissue underneath",
                "Eat protein-rich foods and vitamin C fruits to support wound healing",
                "Stay hydrated to promote skin health",
                "For tetanus-prone wounds (rusty objects, deep punctures), seek medical attention for a tetanus booster"
            ],
            whenToSeeDoctor: "Seek IMMEDIATE medical attention for wounds that: will not stop bleeding after 10 minutes of firm pressure, are deep or gaping, have embedded objects, are caused by animal or human bites, show signs of infection (spreading redness, pus, fever, red streaks), are on the face or near joints, or if the person has not had a tetanus shot in the past 10 years. Seek medical care for any wound that does not improve within 3-5 days."
        },
        {
            name: "Burns",
            keywords: ["burns", "burn", "heat burn", "hot water burn", "cooking burn", "sunburn", "minor burn", "burned skin", "scald"],
            relatedKeywords: ["thermal burn", "first degree burn", "second degree burn", "sunburn"],
            severity: "moderate",
            description: "Burns are tissue damage caused by heat, sun exposure, chemicals, or electricity. First-degree burns affect only the outer layer of skin (redness, pain, minor swelling). Second-degree burns affect deeper layers (blistering, severe pain, redness). Burns from cooking fires, hot water, and the hot Kenyan sun are common. Immediate proper treatment is crucial to minimize damage, prevent infection, and reduce scarring. Herbal remedies are most effective for first-degree and minor second-degree burns.",
            lifestyleFactors: ["cooking accidents", "hot liquids", "sun exposure", "open fires", "hot utensils", "electrical appliances", "chemicals"],
            herbalRemedies: [
                {
                    name: "Aloe Vera",
                    swahiliName: "Mwango",
                    preparation: "For burns, extract fresh aloe vera gel directly from the leaf. Apply a generous layer to the cooled burn. Reapply 2-3 times daily. The gel should be kept refrigerated for an extra cooling effect. IMPORTANT: Cool the burn with cool (not cold) running water for 10-20 minutes FIRST before applying aloe.",
                    dosage: "Apply fresh, cool aloe gel 3-4 times daily. Continue for several days as the burn heals.",
                    cautions: "ALWAYS cool the burn with running water for 10-20 minutes before applying anything. Do NOT apply ice directly to burns. Do NOT apply butter or oil to fresh burns. Do NOT break blisters. Use only pure aloe gel - not products with alcohol or fragrance. For severe burns (large area, deep, or blistering), seek immediate medical attention.",
                    availability: "Aloe vera plants are common in Kenyan households.",
                    brandReferences: ""
                },
                {
                    name: "Honey",
                    swahiliName: "Asali",
                    preparation: "After cooling the burn, apply a thin layer of raw honey to the affected area. Cover loosely with a sterile, non-stick bandage. Change dressing and reapply honey daily. Honey promotes healing and prevents infection.",
                    dosage: "Apply honey once daily, changing the bandage each time. Continue until burn is healed.",
                    cautions: "Cool the burn FIRST with running water for 10-20 minutes. Only apply honey AFTER the burn has been cooled. Do not use on severe or extensive burns. If infection signs appear (increasing pain, pus, red streaks), seek medical care immediately.",
                    availability: "Raw honey is widely available across Kenya.",
                    brandReferences: ""
                },
                {
                    name: "Coconut Oil",
                    swahiliName: "Mafuta ya nazi",
                    preparation: "Apply virgin coconut oil to the burn during the healing phase (after the initial 24-48 hours). Coconut oil has anti-inflammatory and antimicrobial properties and helps keep the healing skin moisturized. Can be mixed with a few drops of lavender oil for enhanced healing.",
                    dosage: "Apply a thin layer 2-3 times daily during the healing phase. Gently massage into the skin.",
                    cautions: "Do NOT apply coconut oil to fresh, uncooled burns or broken blisters. Wait until initial healing has begun (after 48 hours). Some people may be allergic to coconut - test on unaffected skin first.",
                    availability: "Coconut oil is widely available across Kenya, especially from coastal regions.",
                    brandReferences: ""
                },
                {
                    name: "Lavender Oil",
                    swahiliName: "Mafuta ya lavender",
                    preparation: "Dilute 2-3 drops of lavender essential oil in 1 teaspoon of carrier oil (coconut oil). Apply gently to the cooled burn. Lavender oil has pain-relieving, anti-inflammatory, and wound-healing properties.",
                    dosage: "Apply diluted lavender oil 2-3 times daily after the initial cooling period.",
                    cautions: "MUST be diluted before application. Do not apply to fresh burns - cool first. Do not apply to broken blisters. Keep away from eyes. Not for use on severe burns. Some people may have skin sensitivity to lavender. Discontinue if rash or irritation occurs.",
                    availability: "Available in Kenyan pharmacies, health stores, and supermarkets. Imported.",
                    brandReferences: ""
                }
            ],
            bestPractices: [
                "IMMEDIATELY cool the burn under cool running water for 10-20 minutes - this is the most important step",
                "Remove jewelry or tight clothing near the burn area before swelling begins",
                "Do NOT apply ice, butter, oil, or toothpaste to fresh burns",
                "Do NOT break blisters - they protect the underlying skin",
                "Cover the cooled burn with a clean, non-stick bandage",
                "Take over-the-counter pain relief if needed (paracetamol)",
                "Keep the burn area elevated above heart level to reduce swelling",
                "Stay out of direct sunlight while healing",
                "Drink plenty of water to stay hydrated and support healing",
                "Once healed, massage the area gently with coconut oil to minimize scarring"
            ],
            whenToSeeDoctor: "Seek IMMEDIATE medical attention for: burns covering more than 10% of the body, burns on the face, hands, feet, genitals, or over major joints, third-degree burns (white or charred skin, numb), electrical or chemical burns, burns in infants, elderly, or people with weakened immune systems, burns that show signs of infection, or if the person has difficulty breathing (may indicate smoke inhalation)."
        },
        {
            name: "Eczema and Skin Inflammation",
            keywords: ["eczema", "skin rash", "itchy skin", "dry patchy skin", "skin inflammation", "dermatitis", "red patches on skin", "scaly skin", "cracked skin"],
            relatedKeywords: ["atopic dermatitis", "contact dermatitis", "skin allergy", "sensitive skin"],
            severity: "moderate",
            description: "Eczema (atopic dermatitis) is a chronic skin condition characterized by itchy, inflamed, red, dry, and cracked skin. It can appear anywhere on the body and tends to flare up periodically. Common triggers include stress, certain foods, environmental allergens, harsh soaps, and dry weather. Eczema affects people of all ages in Kenya, with children being particularly susceptible. Management focuses on moisturizing, reducing inflammation, and avoiding triggers.",
            lifestyleFactors: ["dry weather", "stress", "harsh soaps", "allergens", "certain foods", "synthetic fabrics", "hot water", "dust", "pet dander"],
            herbalRemedies: [
                {
                    name: "Coconut Oil",
                    swahiliName: "Mafuta ya nazi",
                    preparation: "Apply virgin coconut oil generously to clean, slightly damp skin after bathing. This locks in moisture. For flare-ups, apply 3-4 times daily. Virgin coconut oil has antimicrobial and anti-inflammatory properties that help reduce eczema symptoms.",
                    dosage: "Apply to affected areas 3-4 times daily, especially after bathing. Use consistently for best results.",
                    cautions: "Some people with coconut allergies should avoid. Perform a patch test first. Use only virgin/unrefined coconut oil for best results. If irritation occurs, discontinue use.",
                    availability: "Widely available across Kenya, particularly from coastal regions.",
                    brandReferences: "Kenyan virgin coconut oil from Coast province is excellent"
                },
                {
                    name: "Aloe Vera",
                    swahiliName: "Mwango",
                    preparation: "Apply fresh aloe vera gel directly to eczema patches. Aloe vera moisturizes the skin, reduces inflammation, and has antimicrobial properties that help prevent secondary infections from scratching.",
                    dosage: "Apply fresh aloe gel to affected areas 2-3 times daily. Can be refrigerated for extra soothing coolness.",
                    cautions: "Some people with aloe allergies may experience irritation - test on a small area first. Use only pure, fresh gel without additives. Avoid the yellow latex portion. If stinging occurs, discontinue use.",
                    availability: "Aloe vera plants are common across Kenya.",
                    brandReferences: ""
                },
                {
                    name: "Turmeric",
                    swahiliName: "Manjano",
                    preparation: "Mix 1/2 teaspoon of turmeric powder with 1 tablespoon of coconut oil or yogurt. Apply as a paste to eczema patches for 20-30 minutes, then rinse gently. Turmeric's curcumin has powerful anti-inflammatory properties.",
                    dosage: "Apply turmeric paste 2-3 times weekly. Leave on for 20-30 minutes per application.",
                    cautions: "Turmeric can stain skin and clothing yellow temporarily. Some people may experience irritation - test first. Do not apply to broken or bleeding skin from scratching. If irritation occurs, wash off immediately.",
                    availability: "Very cheap and available everywhere in Kenya.",
                    brandReferences: ""
                },
                {
                    name: "Oatmeal Bath",
                    swahiliName: "Oatmeal ya kuoga",
                    preparation: "Grind 1 cup of plain, unflavored oats into a fine powder. Add to a bathtub of warm (not hot) water. Soak for 15-20 minutes. For localized treatment, make a paste with ground oats and water, apply to affected areas.",
                    dosage: "Oatmeal bath: 2-3 times weekly. Oatmeal paste: Apply as needed to itchy areas.",
                    cautions: "Use warm, not hot water (hot water worsens eczema). Use plain oats only - no flavored instant varieties. Pat skin dry gently after bathing - do not rub. Apply moisturizer immediately after patting dry while skin is still slightly damp.",
                    availability: "Plain oats available in Kenyan supermarkets.",
                    brandReferences: ""
                }
            ],
            bestPractices: [
                "Moisturize frequently - at least 3-4 times daily with a gentle, fragrance-free moisturizer",
                "Use lukewarm (not hot) water for bathing - limit baths to 10-15 minutes",
                "Use gentle, fragrance-free soaps and body washes",
                "Pat skin dry gently after bathing - never rub",
                "Avoid known triggers: certain foods, stress, harsh chemicals, scratchy fabrics",
                "Wear soft, breathable fabrics like cotton",
                "Keep nails short to minimize damage from scratching",
                "Use a humidifier in dry weather to add moisture to the air",
                "Manage stress through relaxation techniques",
                "Identify and avoid personal trigger foods (common: dairy, eggs, nuts, wheat, soy)",
                "Avoid sudden temperature changes"
            ],
            whenToSeeDoctor: "Consult a dermatologist or healthcare provider if eczema is severe and widespread, if it does not respond to home treatments, if skin becomes broken and shows signs of infection (oozing, crusting, increased redness, warmth), if it significantly affects sleep or daily activities, or if it occurs in a baby/infant. Prescription treatments may be needed for moderate to severe cases."
        },
        {
            name: "Fungal Skin Infections",
            keywords: ["ringworm", "fungus", "fungal infection", "athlete's foot", "jock itch", "skin fungus", "white patches", "ring-like rash", "tinea", "nail fungus", "candida"],
            relatedKeywords: ["tinea corporis", "tinea versicolor", "tinea cruris", "yeast infection skin", "mashamba ya ngozi"],
            severity: "moderate",
            description: "Fungal skin infections are common in Kenya due to the warm, humid climate that favors fungal growth. Types include ringworm (tinea corporis), athlete's foot (tinea pedis), jock itch (tinea cruris), and tinea versicolor. These infections present as itchy, scaly, ring-shaped patches or discolored areas on the skin. They are contagious and spread through direct contact or sharing personal items. Traditional herbal remedies are widely used across Kenyan communities for treating fungal infections.",
            lifestyleFactors: ["warm humid climate", "poor hygiene", "sharing personal items", "sweating", "tight clothing", "weak immunity", "diabetes", "damp environments"],
            herbalRemedies: [
                {
                    name: "Neem",
                    swahiliName: "Mwarubaini",
                    preparation: "Boil a generous handful of neem leaves in water for 20 minutes. Cool and use the neem water to wash affected areas 2-3 times daily. For paste: Grind fresh neem leaves with a little water, apply paste to fungal patches for 30 minutes, then wash off.",
                    dosage: "Neem wash: 2-3 times daily. Neem paste: Apply for 30 minutes, 2 times daily. Continue for 2-3 weeks after symptoms disappear to prevent recurrence.",
                    cautions: "Neem can be drying - moisturize surrounding skin. Test on a small area first. Some people may develop allergic reactions. Do not apply neem paste to broken skin. Very effective but must be used consistently for the full recommended duration to prevent recurrence.",
                    availability: "Neem trees are widespread in Kenya. Fresh leaves are freely available.",
                    brandReferences: "Dr. Spice carries neem-based antifungal products"
                },
                {
                    name: "Tea Tree Oil",
                    swahiliName: "Mafuta ya mti wa chai",
                    preparation: "Dilute tea tree oil with a carrier oil (coconut oil) in a 1:1 ratio for fungal infections (stronger dilution than for acne). Apply to affected area using a cotton ball. Cover with a clean cloth.",
                    dosage: "Apply diluted tea tree oil 2-3 times daily. Continue for at least 2 weeks after symptoms clear.",
                    cautions: "MUST be diluted - never apply undiluted to skin. May cause stinging, redness, or dryness. Discontinue if severe irritation occurs. Keep away from eyes and mucous membranes. Not for children under 12 without medical advice.",
                    availability: "Available in Kenyan pharmacies and health stores. Imported but widely stocked.",
                    brandReferences: ""
                },
                {
                    name: "Apple Cider Vinegar",
                    swahiliName: "Siki ya tikitiki maji",
                    preparation: "Mix equal parts raw apple cider vinegar and warm water. Apply to affected area using a cotton ball. Leave on for 30 minutes, then rinse. For athlete's foot: Soak feet in a mixture of 1 part ACV to 3 parts warm water for 15-20 minutes daily.",
                    dosage: "Apply 2-3 times daily. Foot soak: 15-20 minutes daily. Continue for 2-3 weeks after symptoms clear.",
                    cautions: "Apple cider vinegar is acidic and may sting, especially on raw or broken skin. Always dilute. Stop if severe burning occurs. May cause skin dryness. Rinse after application. Not for use on sensitive areas or open wounds.",
                    availability: "Available in Kenyan supermarkets and health stores.",
                    brandReferences: ""
                },
                {
                    name: "Garlic",
                    swahiliName: "Kitunguu saumu",
                    preparation: "Crush 3-4 garlic cloves and mix with 1 tablespoon of olive oil. Apply the mixture to the fungal patch for 20-30 minutes, then wash off. Garlic has potent antifungal properties due to allicin.",
                    dosage: "Apply garlic paste 1-2 times daily. Continue for 2-3 weeks. Be patient - fungal infections take time to clear.",
                    cautions: "Garlic can burn the skin, especially sensitive skin. Always dilute with oil. Test on a small area first. If burning is severe, wash off immediately. Do not apply to broken skin. The smell is strong but effective.",
                    availability: "Widely available and cheap in every Kenyan market.",
                    brandReferences: ""
                },
                {
                    name: "Turmeric",
                    swahiliName: "Manjano",
                    preparation: "Mix turmeric powder with a little water or coconut oil to make a paste. Apply to the fungal infection and cover with a clean bandage. Leave for 30 minutes to 1 hour, then rinse.",
                    dosage: "Apply turmeric paste 2 times daily. Continue for 2-3 weeks after symptoms disappear.",
                    cautions: "Turmeric will stain skin and clothing yellow. The stain is temporary. May cause mild irritation on sensitive skin. Test first. Not as potent as neem or tea tree oil for fungal infections but a good complementary remedy.",
                    availability: "Very cheap and available everywhere in Kenya.",
                    brandReferences: ""
                }
            ],
            bestPractices: [
                "Keep the affected area clean and dry - fungi thrive in warm, moist conditions",
                "Change socks and underwear daily - more often if sweating heavily",
                "Do not share towels, clothing, shoes, or personal items",
                "Wear loose-fitting, breathable cotton clothing",
                "Dry yourself thoroughly after bathing, especially between toes and skin folds",
                "Wear flip-flops in public showers and swimming pools",
                "Wash bedding and towels in hot water regularly",
                "Treat all affected areas simultaneously to prevent reinfection",
                "Continue treatment for at least 2 weeks after symptoms disappear",
                "Keep nails trimmed and clean to prevent spreading to nails",
                "Boost immunity through good nutrition, exercise, and adequate sleep"
            ],
            whenToSeeDoctor: "Consult a healthcare provider if the fungal infection: covers a large area of the body, affects the scalp or nails, does not respond to home treatment after 2-3 weeks, keeps recurring, affects the face or genitals, shows signs of bacterial infection (increasing pain, pus, swelling), or if the person has diabetes or a weakened immune system. Prescription antifungal medications may be necessary."
        },
        {
            name: "Dandruff and Scalp Conditions",
            keywords: ["dandruff", "flaky scalp", "itchy scalp", "dry scalp", "white flakes in hair", "scalp irritation", "cradle cap", "seborrheic dermatitis"],
            relatedKeywords: ["dry scalp vs dandruff", "scalp psoriasis", "oily scalp flakes"],
            severity: "mild",
            description: "Dandruff is a common scalp condition characterized by white flakes of dead skin in the hair, often accompanied by an itchy scalp. It is usually caused by a yeast-like fungus (Malassezia) that feeds on oils on the scalp. Seborrheic dermatitis is a more severe form that causes redness, greasy scales, and itching. In Kenya, dandruff is common due to the climate, and traditional herbal remedies using local plants have been used for generations to treat scalp conditions.",
            lifestyleFactors: ["stress", "oily scalp", "dry weather", "harsh shampoos", "diet", "hormones", "sensitivity to hair products"],
            herbalRemedies: [
                {
                    name: "Neem",
                    swahiliName: "Mwarubaini",
                    preparation: "Boil a handful of neem leaves in 3 cups of water for 20 minutes. Cool, strain, and use as a hair rinse after shampooing. For concentrated treatment: Grind neem leaves into a paste and apply directly to the scalp, leave for 30 minutes, then wash out with shampoo.",
                    dosage: "Neem rinse: 2-3 times per week after shampooing. Neem paste: 1-2 times per week.",
                    cautions: "Neem can be very drying - follow up with a light conditioner on the hair lengths (not scalp). Some people may experience scalp irritation. Test first. The smell is strong but effective. May temporarily darken light-colored hair.",
                    availability: "Neem trees are widespread across Kenya.",
                    brandReferences: "Dr. Spice carries neem-based hair products"
                },
                {
                    name: "Coconut Oil",
                    swahiliName: "Mafuta ya nazi",
                    preparation: "Warm 2-3 tablespoons of virgin coconut oil. Massage gently into the scalp for 5-10 minutes. Leave on for at least 30 minutes (or overnight for intensive treatment), then wash with shampoo. For enhanced effect, add a few drops of tea tree oil.",
                    dosage: "Apply coconut oil to scalp 2-3 times per week. Overnight treatment: 1-2 times per week.",
                    cautions: "Some people may find coconut oil clogs hair follicles - if dandruff worsens, discontinue. Use in moderation. Some people are allergic to coconut oil. Shampoo thoroughly after treatment.",
                    availability: "Widely available across Kenya, especially from coastal regions.",
                    brandReferences: ""
                },
                {
                    name: "Aloe Vera",
                    swahiliName: "Mwango",
                    preparation: "Extract fresh aloe vera gel and apply directly to the scalp. Massage gently. Leave for 30-60 minutes before washing with shampoo. Aloe vera has antifungal and moisturizing properties.",
                    dosage: "Apply to scalp 2-3 times per week before shampooing.",
                    cautions: "Use only pure, fresh gel. Commercial gels with additives may worsen dandruff. Test on a small area first. Generally very safe and gentle on the scalp.",
                    availability: "Aloe vera plants are common in Kenyan households.",
                    brandReferences: ""
                },
                {
                    name: "Apple Cider Vinegar",
                    swahiliName: "Siki ya tikitiki maji",
                    preparation: "Mix equal parts apple cider vinegar and water. After shampooing, pour the mixture over the scalp and hair. Massage gently. Leave for 2-3 minutes, then rinse with cool water.",
                    dosage: "Use as a final hair rinse 1-2 times per week after shampooing.",
                    cautions: "Always dilute ACV - never apply undiluted to scalp. May cause stinging if scalp has open scratches. Rinse thoroughly after use. The vinegar smell will dissipate as hair dries. Avoid contact with eyes.",
                    availability: "Available in Kenyan supermarkets and health stores.",
                    brandReferences: ""
                }
            ],
            bestPractices: [
                "Wash hair regularly (2-3 times per week) to prevent oil buildup",
                "Choose a gentle, sulfate-free shampoo",
                "Avoid excessive use of styling products and hair sprays",
                "Manage stress through exercise and relaxation",
                "Eat a balanced diet rich in zinc, B vitamins, and omega-3 fatty acids",
                "Get adequate sunlight exposure (vitamin D helps scalp health)",
                "Brush hair regularly to distribute natural oils evenly",
                "Avoid very hot water when washing hair - use lukewarm water",
                "Drink plenty of water to stay hydrated",
                "Avoid sharing combs, brushes, and hats"
            ],
            whenToSeeDoctor: "Consult a healthcare provider or dermatologist if dandruff is severe and persistent, does not respond to home treatments after several weeks, if the scalp is very red, itchy, or bleeds, if you notice hair loss along with dandruff, or if the flakes are yellow and greasy (may indicate seborrheic dermatitis requiring prescription treatment)."
        }
    ]
};
