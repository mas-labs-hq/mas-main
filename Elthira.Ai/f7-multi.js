/**
 * Elthira.AI - Multi-Brand Product Database (Universal Edition)
 * Powered By MortApps Studios
 *
 * Contains products from multiple Kenyan herbal wellness brands:
 * - Dr Spice Organics (133 products)
 * - Harriet Botanicals (26 products)
 * - Neem Nutraceuticals (10 products)
 * - Hemani Naturals (17 products)
 * - General herbal products (fallback)
 *
 * Each brand's products are grouped in their own block in the results.
 */

var HERBAL_PRODUCTS = {
    brands: [
        {
            name: "Harriet Botanicals",
            description: "Traditional Kenyan organic formulations crafted from indigenous herbs. Based in Nairobi with branches in Mombasa.",
            website: "harrietsbotanicals.co.ke",
            phone: "See website",
            email: "See website",
            products: [
                {name: "Arorwet", category: "Herbal Remedy", keyIngredients: ["Traditional herbal blend"], treats: ["Digestive issues", "General wellness"], treatsKeywords: ["stomach", "digestion", "wellness", "energy"], conditions: ["Stomach Upset and Nausea", "Fatigue and Low Energy"], dosage: "As directed", priceRange: "See website", availability: "harrietsbotanicals.co.ke", description: "Traditional digestive remedy"},
                {name: "Tendwet", category: "Herbal Remedy", keyIngredients: ["Traditional herbal blend"], treats: ["Women's health", "Reproductive health"], treatsKeywords: ["women", "reproductive", "hormonal", "menstrual"], conditions: ["Menstrual Cramps"], dosage: "As directed", priceRange: "KES 350", availability: "harrietsbotanicals.co.ke", description: "Women's wellness formula"},
                {name: "Mosipchot", category: "Herbal Remedy", keyIngredients: ["Traditional herbal blend"], treats: ["General wellness", "Immunity"], treatsKeywords: ["wellness", "immunity", "energy", "strength"], conditions: ["Low Immunity and Frequent Infections", "Fatigue and Low Energy"], dosage: "As directed", priceRange: "See website", availability: "harrietsbotanicals.co.ke", description: "Immunity and vitality booster"},
                {name: "Sagawaita", category: "Herbal Remedy", keyIngredients: ["Traditional herbal blend"], treats: ["Blood health", "Detox"], treatsKeywords: ["blood", "detox", "cleansing", "purifier"], conditions: ["Detoxification and Body Cleansing", "Anemia and Iron Deficiency"], dosage: "As directed", priceRange: "See website", availability: "harrietsbotanicals.co.ke", description: "Blood purifier and cleanser"},
                {name: "Rongorig", category: "Herbal Remedy", keyIngredients: ["Traditional herbal blend"], treats: ["Joint pain", "Arthritis"], treatsKeywords: ["joint", "arthritis", "pain", "inflammation"], conditions: ["Joint Pain and Arthritis", "Muscle Pain and Body Aches"], dosage: "As directed", priceRange: "See website", availability: "harrietsbotanicals.co.ke", description: "Joint and muscle support"},
                {name: "Rongorig with Mukombero", category: "Herbal Remedy", keyIngredients: ["Mukombero", "Traditional herbs"], treats: ["Low libido", "Fatigue"], treatsKeywords: ["libido", "energy", "vitality", "stamina"], conditions: ["Low Libido and Sexual Health", "Fatigue and Low Energy"], dosage: "As directed", priceRange: "See website", availability: "harrietsbotanicals.co.ke", description: "Vitality and libido enhancer"},
                {name: "Chepnyalilet (Eczema Cleanser)", category: "Skincare", keyIngredients: ["Traditional herbal blend"], treats: ["Eczema", "Skin inflammation"], treatsKeywords: ["eczema", "skin", "inflammation", "rash"], conditions: ["Eczema and Skin Inflammation"], dosage: "External use", priceRange: "See website", availability: "harrietsbotanicals.co.ke", description: "Eczema soothing cleanser"},
                {name: "Labotwet (Acne Cleanser)", category: "Skincare", keyIngredients: ["Traditional herbal blend"], treats: ["Acne", "Skin issues"], treatsKeywords: ["acne", "pimples", "skin", "cleanser"], conditions: ["Acne and Pimples"], dosage: "External use", priceRange: "See website", availability: "harrietsbotanicals.co.ke", description: "Acne relief cleanser"},
                {name: "Nukiat (Acne Relief Serum)", category: "Skincare", keyIngredients: ["Traditional herbal blend"], treats: ["Acne", "Skin blemishes"], treatsKeywords: ["acne", "skin", "serum", "blemish"], conditions: ["Acne and Pimples"], dosage: "External use", priceRange: "See website", availability: "harrietsbotanicals.co.ke", description: "Acne relief serum"},
                {name: "Cherungut (Anti Ageing Serum)", category: "Skincare", keyIngredients: ["Traditional herbal blend"], treats: ["Skin aging", "Wrinkles"], treatsKeywords: ["ageing", "wrinkles", "skin", "serum"], conditions: ["Eczema and Skin Inflammation"], dosage: "External use", priceRange: "See website", availability: "harrietsbotanicals.co.ke", description: "Anti-ageing serum"},
                {name: "Emityot (Dry Skin Cleanser)", category: "Skincare", keyIngredients: ["Traditional herbal blend"], treats: ["Dry skin"], treatsKeywords: ["dry skin", "skin", "cleanser", "moisture"], conditions: ["Eczema and Skin Inflammation"], dosage: "External use", priceRange: "See website", availability: "harrietsbotanicals.co.ke", description: "Dry skin cleanser"},
                {name: "Busarek Ab Lakok", category: "Herbal Remedy", keyIngredients: ["Traditional herbal blend"], treats: ["General wellness"], treatsKeywords: ["wellness", "health", "traditional"], conditions: ["Fatigue and Low Energy"], dosage: "As directed", priceRange: "See website", availability: "harrietsbotanicals.co.ke", description: "Traditional wellness formula"},
                {name: "Busarek Ab Lelaitich", category: "Herbal Remedy", keyIngredients: ["Traditional herbal blend"], treats: ["General wellness"], treatsKeywords: ["wellness", "health", "traditional"], conditions: ["Fatigue and Low Energy"], dosage: "As directed", priceRange: "See website", availability: "harrietsbotanicals.co.ke", description: "Traditional wellness formula"}
            ]
        },
        {
            name: "Neem Nutraceuticals",
            description: "Leading manufacturer of neem and herbal products in Kenya for over 28 years. Capsules, powders, ointments, and teabags.",
            website: "kenyaneem.com",
            phone: "See website",
            email: "info@kenyaneem.com",
            products: [
                {name: "Neem Capsules", category: "Capsules", keyIngredients: ["Neem extract", "Azadirachtin"], treats: ["Skin conditions", "Immunity", "Blood purification"], treatsKeywords: ["skin", "acne", "immunity", "blood", "detox", "infection"], conditions: ["Acne and Pimples", "Low Immunity and Frequent Infections", "Detoxification and Body Cleansing"], dosage: "60 capsules", priceRange: "See website", availability: "kenyaneem.com", description: "Neem leaf extract capsules"},
                {name: "Asthmax (Asthma Cure)", category: "Capsules", keyIngredients: ["Natural herbal blend"], treats: ["Asthma", "Breathing difficulties"], treatsKeywords: ["asthma", "breathing", "respiratory", "wheezing"], conditions: ["Asthma and Breathing Difficulties"], dosage: "60 herbal capsules", priceRange: "See website", availability: "kenyaneem.com", description: "Asthma support supplement"},
                {name: "High Blood Pressure Treatment", category: "Capsules", keyIngredients: ["Natural herbal blend"], treats: ["Hypertension"], treatsKeywords: ["blood pressure", "hypertension", "heart", "cardiovascular"], conditions: ["High Blood Pressure (Hypertension)"], dosage: "120 capsules", priceRange: "See website", availability: "kenyaneem.com", description: "Blood pressure management formula"},
                {name: "UTI & PID Cure", category: "Capsules", keyIngredients: ["Natural herbal blend"], treats: ["UTI", "Urinary infections"], treatsKeywords: ["uti", "urinary", "infection", "bladder", "pid"], conditions: ["Urinary Tract Infections (UTIs)"], dosage: "28 herbal capsules", priceRange: "See website", availability: "kenyaneem.com", description: "Urinary tract infection treatment"},
                {name: "Carissa Edulis Capsules", category: "Capsules", keyIngredients: ["Carissa edulis extract"], treats: ["Cognitive health"], treatsKeywords: ["dementia", "memory", "brain", "cognitive"], conditions: ["Depression and Low Mood", "Fatigue and Low Energy"], dosage: "As directed", priceRange: "See website", availability: "kenyaneem.com", description: "Cognitive support capsules"},
                {name: "Epilepsy Cure Supplement", category: "Capsules", keyIngredients: ["Natural herbal blend"], treats: ["Neurological support"], treatsKeywords: ["epilepsy", "neurological", "seizure", "brain"], conditions: ["Stress and Anxiety"], dosage: "As directed", priceRange: "See website", availability: "kenyaneem.com", description: "Neurological support supplement"},
                {name: "Sugar Control Capsules", category: "Capsules", keyIngredients: ["Natural herbal blend"], treats: ["Diabetes", "Blood sugar"], treatsKeywords: ["diabetes", "blood sugar", "sugar", "glucose"], conditions: ["Diabetes and Blood Sugar Management"], dosage: "As directed", priceRange: "See website", availability: "kenyaneem.com", description: "Blood sugar control formula"},
                {name: "Herbal Tea Bags", category: "Tea", keyIngredients: ["Natural herbal blend"], treats: ["General wellness", "Detox"], treatsKeywords: ["wellness", "detox", "tea", "health", "cleansing"], conditions: ["Detoxification and Body Cleansing", "Fatigue and Low Energy"], dosage: "60 tea bags", priceRange: "See website", availability: "kenyaneem.com", description: "Wellness herbal tea"}
            ]
        },
        {
            name: "Hemani Naturals",
            description: "Ayurvedic and herbal medicine distributor in Nairobi. Featuring Himalaya products and 360 Degree Organic supplements.",
            website: "hemaninaturals.co.ke",
            phone: "See website",
            email: "See website",
            products: [
                {name: "360 Organic Ashwagandha Tablets", category: "Tablets", keyIngredients: ["Withanolides", "Ashwagandha extract"], treats: ["Stress", "Fatigue", "Low libido"], treatsKeywords: ["stress", "anxiety", "fatigue", "libido", "energy"], conditions: ["Stress and Anxiety", "Fatigue and Low Energy", "Low Libido and Sexual Health", "Insomnia and Sleep Difficulties"], dosage: "500mg, 60 tablets", priceRange: "See website", availability: "hemaninaturals.co.ke", description: "Ashwagandha stress relief tablets"},
                {name: "360 Organic Turmeric Tablets", category: "Tablets", keyIngredients: ["Curcumin", "Turmeric extract"], treats: ["Joint pain", "Inflammation"], treatsKeywords: ["joint pain", "arthritis", "inflammation", "turmeric"], conditions: ["Joint Pain and Arthritis", "Muscle Pain and Body Aches"], dosage: "500mg, 60 tablets", priceRange: "See website", availability: "hemaninaturals.co.ke", description: "Turmeric anti-inflammatory tablets"},
                {name: "360 Organic Triphala Tablets", category: "Tablets", keyIngredients: ["Triphala blend", "Amla", "Bibhitaki", "Haritaki"], treats: ["Digestive issues", "Constipation", "Detox"], treatsKeywords: ["digestion", "constipation", "detox", "cleansing", "stomach"], conditions: ["Constipation", "Detoxification and Body Cleansing", "Stomach Upset and Nausea"], dosage: "500mg, 60 tablets", priceRange: "See website", availability: "hemaninaturals.co.ke", description: "Ayurvedic digestive formula"},
                {name: "360 Organic Shatavari Tablets", category: "Tablets", keyIngredients: ["Shatavari extract", "Saponins"], treats: ["Women's health", "Reproductive health"], treatsKeywords: ["women", "reproductive", "hormonal", "fertility", "libido"], conditions: ["Menstrual Cramps", "Low Libido and Sexual Health"], dosage: "500mg, 60 tablets", priceRange: "See website", availability: "hemaninaturals.co.ke", description: "Women's wellness Ayurvedic herb"},
                {name: "360 Organic Brahmi Tablets", category: "Tablets", keyIngredients: ["Brahmi extract", "Bacosides"], treats: ["Memory", "Concentration", "Stress"], treatsKeywords: ["memory", "concentration", "brain", "stress", "cognitive"], conditions: ["Depression and Low Mood", "Stress and Anxiety"], dosage: "500mg, 60 tablets", priceRange: "See website", availability: "hemaninaturals.co.ke", description: "Brain and memory support"},
                {name: "360 Organic Karela Tablets", category: "Tablets", keyIngredients: ["Bitter melon extract"], treats: ["Diabetes", "Blood sugar"], treatsKeywords: ["diabetes", "blood sugar", "sugar", "glucose"], conditions: ["Diabetes and Blood Sugar Management"], dosage: "500mg, 60 tablets", priceRange: "See website", availability: "hemaninaturals.co.ke", description: "Bitter melon blood sugar control"},
                {name: "360 Organic Giloy Tablets", category: "Tablets", keyIngredients: ["Giloy extract", "Tinospora cordifolia"], treats: ["Immunity", "Fever"], treatsKeywords: ["immunity", "fever", "infection", "immune"], conditions: ["Low Immunity and Frequent Infections", "Fever"], dosage: "500mg, 60 tablets", priceRange: "See website", availability: "hemaninaturals.co.ke", description: "Immunity booster herb"},
                {name: "360 Organic Arjuna Tablets", category: "Tablets", keyIngredients: ["Arjuna bark extract"], treats: ["Heart health", "Blood pressure"], treatsKeywords: ["heart", "blood pressure", "cardiovascular", "hypertension"], conditions: ["High Blood Pressure (Hypertension)"], dosage: "500mg, 60 tablets", priceRange: "See website", availability: "hemaninaturals.co.ke", description: "Heart health Ayurvedic herb"},
                {name: "360 Organic Shallaki Tablets", category: "Tablets", keyIngredients: ["Boswellia extract"], treats: ["Joint pain", "Arthritis", "Inflammation"], treatsKeywords: ["joint pain", "arthritis", "inflammation", "boswellia"], conditions: ["Joint Pain and Arthritis", "Muscle Pain and Body Aches"], dosage: "500mg, 60 tablets", priceRange: "See website", availability: "hemaninaturals.co.ke", description: "Boswellia joint support"},
                {name: "360 Organic Amla Tablets", category: "Tablets", keyIngredients: ["Amla extract", "Vitamin C"], treats: ["Immunity", "Hair", "Digestion"], treatsKeywords: ["immunity", "vitamin c", "hair", "digestion"], conditions: ["Low Immunity and Frequent Infections", "Anemia and Iron Deficiency"], dosage: "500mg, 60 tablets", priceRange: "See website", availability: "hemaninaturals.co.ke", description: "Indian gooseberry vitamin C source"},
                {name: "360 Organic Papaya Leaf Extract", category: "Tablets", keyIngredients: ["Papaya leaf extract"], treats: ["Dengue fever", "Low platelets", "Immunity"], treatsKeywords: ["fever", "platelets", "immunity", "dengue"], conditions: ["Fever", "Low Immunity and Frequent Infections"], dosage: "500mg, 30 tablets", priceRange: "See website", availability: "hemaninaturals.co.ke", description: "Papaya leaf immune support"},
                {name: "360 Organic Vrikshamla Tablets", category: "Tablets", keyIngredients: ["Garcinia cambogia extract"], treats: ["Weight management"], treatsKeywords: ["weight", "fat", "metabolism", "appetite"], conditions: ["Poor Appetite and Weight Loss"], dosage: "500mg, 60 tablets", priceRange: "See website", availability: "hemaninaturals.co.ke", description: "Weight management herb"},
                {name: "360 Organic Jethimadh Tablets", category: "Tablets", keyIngredients: ["Licorice root extract"], treats: ["Sore throat", "Cough", "Digestive issues"], treatsKeywords: ["sore throat", "cough", "throat", "digestion", "stomach"], conditions: ["Sore Throat", "Cough (Dry and Productive)", "Stomach Ulcers"], dosage: "500mg, 60 tablets", priceRange: "See website", availability: "hemaninaturals.co.ke", description: "Licorice throat and stomach herb"},
                {name: "Himalaya Shilajit Gold Capsules", category: "Capsules", keyIngredients: ["Shilajit", "Gold", "Ashwagandha"], treats: ["Fatigue", "Low libido", "Vitality"], treatsKeywords: ["fatigue", "libido", "vitality", "energy", "stamina"], conditions: ["Fatigue and Low Energy", "Low Libido and Sexual Health"], dosage: "20 capsules", priceRange: "KES 1,750", availability: "hemaninaturals.co.ke", description: "Premium vitality formula"},
                {name: "Activated Charcoal Powder", category: "Powder", keyIngredients: ["Activated carbon"], treats: ["Bloating", "Detox", "Stomach issues"], treatsKeywords: ["bloating", "gas", "detox", "stomach", "cleansing"], conditions: ["Bloating and Gas", "Stomach Upset and Nausea", "Detoxification and Body Cleansing"], dosage: "150gm, 500gm & 1kg", priceRange: "KES 350-750", availability: "hemaninaturals.co.ke", description: "Natural detox powder"},
                {name: "Kalam Xtra (Calcium + D3) Tablets", category: "Tablets", keyIngredients: ["Calcium", "Vitamin D3"], treats: ["Bone health", "Joint pain"], treatsKeywords: ["calcium", "bones", "joint", "vitamin d"], conditions: ["Joint Pain and Arthritis"], dosage: "30 tablets", priceRange: "KES 800", availability: "hemaninaturals.co.ke", description: "Bone and joint support"}
            ]
        },
        {
            name: "General Herbal Products",
            description: "Common herbal remedies widely available in Kenyan markets, supermarkets, and pharmacies.",
            website: "Various",
            phone: "Available at most pharmacies",
            email: "N/A",
            products: [
                {name: "Raw Honey (Asali)", category: "Food", keyIngredients: ["Raw honey", "Enzymes", "Antioxidants"], treats: ["Cough", "Sore throat", "Wounds"], treatsKeywords: ["cough", "sore throat", "wound", "honey", "healing"], conditions: ["Cough (Dry and Productive)", "Sore Throat", "Wounds, Cuts, and Minor Injuries"], dosage: "1 tablespoon 2-3 times daily", priceRange: "KES 300-800", availability: "Kenyan markets, supermarkets", description: "Pure Kenyan honey from Kitui, Baringo, West Pokot"},
                {name: "Fresh Ginger (Tangawizi)", category: "Herb", keyIngredients: ["Gingerol", "Zingiberene"], treats: ["Nausea", "Cold", "Joint pain"], treatsKeywords: ["nausea", "vomiting", "cold", "flu", "joint pain", "inflammation"], conditions: ["Stomach Upset and Nausea", "Common Cold and Flu", "Joint Pain and Arthritis"], dosage: "Thumb-sized piece, boiled as tea", priceRange: "KES 50-100", availability: "All Kenyan markets", description: "Fresh ginger root"},
                {name: "Garlic (Kitunguu saumu)", category: "Food", keyIngredients: ["Allicin", "Selenium"], treats: ["Immunity", "Blood pressure", "Infection"], treatsKeywords: ["immunity", "blood pressure", "infection", "cold", "flu"], conditions: ["Low Immunity and Frequent Infections", "High Blood Pressure (Hypertension)", "Common Cold and Flu"], dosage: "1-2 cloves daily", priceRange: "KES 100-200", availability: "All Kenyan markets", description: "Natural antibiotic"},
                {name: "Lemon (Ndimu)", category: "Food", keyIngredients: ["Vitamin C", "Citric acid"], treats: ["Cold", "Sore throat", "Detox"], treatsKeywords: ["cold", "sore throat", "vitamin c", "detox", "flu"], conditions: ["Common Cold and Flu", "Sore Throat", "Detoxification and Body Cleansing"], dosage: "Juice of half lemon in warm water", priceRange: "KES 10-20 each", availability: "All Kenyan markets", description: "Vitamin C rich citrus"},
                {name: "Aloe Vera", category: "Herb", keyIngredients: ["Aloin", "Acemannan", "Vitamins"], treats: ["Constipation", "Skin issues", "Acid reflux"], treatsKeywords: ["constipation", "skin", "acid reflux", "ulcer", "digestion"], conditions: ["Constipation", "Acid Reflux and Heartburn", "Acne and Pimples", "Eczema and Skin Inflammation"], dosage: "30ml juice twice daily", priceRange: "KES 100-300", availability: "Widely available", description: "Soothing digestive and skin herb"}
            ]
        },
        {
            name: "Healthy U",
            description: "Kenya's trusted online health product store. Natural health products, supplements, and wellness essentials with nationwide delivery.",
            website: "healthyu.co.ke",
            phone: "See website",
            email: "See website",
            products: [
                {name: "Naturalli Psyllium Husk 100G", category: "Supplement", keyIngredients: ["Psyllium husk", "Fiber"], treats: ["Constipation", "Detox", "Digestive health"], treatsKeywords: ["constipation", "fiber", "digestion", "detox", "bowel"], conditions: ["Constipation", "Detoxification and Body Cleansing", "Bloating and Gas"], dosage: "As directed on package", priceRange: "KES 699", availability: "healthyu.co.ke", description: "Natural fiber supplement for digestive health"},
                {name: "Naturalli Org Red Maca Powder 100Gm", category: "Powder", keyIngredients: ["Red Maca", "Glucosinolates"], treats: ["Fatigue", "Low libido", "Hormonal balance"], treatsKeywords: ["fatigue", "energy", "libido", "hormonal", "stamina"], conditions: ["Fatigue and Low Energy", "Low Libido and Sexual Health"], dosage: "As directed", priceRange: "KES 1,199", availability: "healthyu.co.ke", description: "Organic red maca for energy and vitality"},
                {name: "Bio3 Weight Control Capsules", category: "Capsules", keyIngredients: ["Natural herbal blend"], treats: ["Weight management"], treatsKeywords: ["weight", "metabolism", "fat", "slim"], conditions: ["Poor Appetite and Weight Loss"], dosage: "25 capsules", priceRange: "KES 1,399", availability: "healthyu.co.ke", description: "Weight management supplement"},
                {name: "Bio3 Slim Body Capsules", category: "Capsules", keyIngredients: ["Natural herbal blend"], treats: ["Weight management"], treatsKeywords: ["weight", "slim", "metabolism", "fat"], conditions: ["Poor Appetite and Weight Loss"], dosage: "80 capsules", priceRange: "KES 1,999", availability: "healthyu.co.ke", description: "Body slimming supplement"},
                {name: "Organic India Flexibility Capsules", category: "Capsules", keyIngredients: ["Turmeric", "Ginger", "Boswellia"], treats: ["Joint pain", "Arthritis", "Inflammation"], treatsKeywords: ["joint pain", "arthritis", "inflammation", "flexibility", "stiffness"], conditions: ["Joint Pain and Arthritis", "Muscle Pain and Body Aches"], dosage: "60 capsules", priceRange: "KES 1,899", availability: "healthyu.co.ke", description: "Joint flexibility and inflammation support"},
                {name: "Country Life Chelated Magnesium Glycinate", category: "Supplement", keyIngredients: ["Magnesium glycinate"], treats: ["Muscle pain", "Stress", "Sleep"], treatsKeywords: ["muscle", "stress", "sleep", "magnesium", "cramp"], conditions: ["Muscle Pain and Body Aches", "Stress and Anxiety", "Insomnia and Sleep Difficulties"], dosage: "90 tablets", priceRange: "KES 3,699", availability: "healthyu.co.ke", description: "High-absorption magnesium for muscles and relaxation"}
            ]
        },
        {
            name: "Ayurherbs and Spices",
            description: "Ayurvedic and herbal medicine store in Nairobi. Featuring Himalaya products and traditional remedies.",
            website: "ayurherbsandspices.co.ke",
            phone: "See website",
            email: "See website",
            products: [
                {name: "Himalaya Ashvagandha Tablets", category: "Tablets", keyIngredients: ["Ashwagandha extract", "Withanolides"], treats: ["Stress", "Fatigue", "Low energy"], treatsKeywords: ["stress", "anxiety", "fatigue", "energy", "ashwagandha"], conditions: ["Stress and Anxiety", "Fatigue and Low Energy", "Insomnia and Sleep Difficulties"], dosage: "60 tablets", priceRange: "KES 749", availability: "ayurherbsandspices.co.ke", description: "Stress relief and energy booster"},
                {name: "Himalaya Speman", category: "Tablets", keyIngredients: ["Ayurvedic herbal blend"], treats: ["Low libido", "Men's health"], treatsKeywords: ["libido", "men", "sexual", "fertility", "sperm"], conditions: ["Low Libido and Sexual Health"], dosage: "60 tablets", priceRange: "KES 635", availability: "ayurherbsandspices.co.ke", description: "Men's reproductive health support"},
                {name: "Mufasil Plus Tablets", category: "Tablets", keyIngredients: ["Ayurvedic herbal blend"], treats: ["Joint pain", "Arthritis", "Inflammation"], treatsKeywords: ["joint pain", "arthritis", "inflammation", "stiffness"], conditions: ["Joint Pain and Arthritis", "Muscle Pain and Body Aches"], dosage: "20 tablets", priceRange: "KES 250", availability: "ayurherbsandspices.co.ke", description: "Joint and muscle pain relief"},
                {name: "Pain Relief Capsule and Oil", category: "Combo", keyIngredients: ["Ayurvedic herbal blend"], treats: ["Muscle pain", "Joint pain", "Body aches"], treatsKeywords: ["pain", "muscle", "joint", "body aches", "inflammation"], conditions: ["Muscle Pain and Body Aches", "Joint Pain and Arthritis"], dosage: "Capsules + oil combo", priceRange: "KES 1,249", availability: "ayurherbsandspices.co.ke", description: "Internal and external pain relief combo"}
            ]
        },
        {
            name: "Dr Spice Organics",
            description: "Kenya's premier organic herbal wellness brand with branches in Nairobi, Ruiru, Thika, Nakuru, and Eldoret.",
            website: "drspiceorganicskenya.com",
            phone: "+254 727 175 708",
            email: "info@drspiceorganicskenya.com",
            products: [
                // Key products from Dr Spice (subset of the 133 for multi-brand)
                {name: "Slippery Elm", category: "Herb", keyIngredients: ["Mucilage", "Tannins", "Calcium"], treats: ["Stomach Ulcers", "Acid Reflux and Heartburn", "Diarrhea"], treatsKeywords: ["stomach ulcer", "acid reflux", "heartburn", "diarrhea", "stomach pain"], conditions: ["Stomach Ulcers", "Acid Reflux and Heartburn", "Diarrhea", "Stomach Upset and Nausea"], dosage: "As directed by Dr Spice consultant", priceRange: "KES 600", availability: "All Dr Spice branches", description: "Gentle shield for your gut"},
                {name: "Activated Charcoal", category: "Supplement", keyIngredients: ["Activated carbon"], treats: ["Bloating and Gas", "Stomach Upset"], treatsKeywords: ["bloating", "gas", "stomach upset", "diarrhea"], conditions: ["Bloating and Gas", "Stomach Upset and Nausea", "Diarrhea"], dosage: "As directed", priceRange: "KES 300", availability: "All Dr Spice branches", description: "Natural toxin binder"},
                {name: "Peppermint", category: "Herb", keyIngredients: ["Menthol", "Menthone"], treats: ["Stomach Upset", "Headache"], treatsKeywords: ["stomach", "nausea", "indigestion", "headache", "cough"], conditions: ["Stomach Upset and Nausea", "Headache and Migraine", "Cough (Dry and Productive)"], dosage: "As directed", priceRange: "KES 200", availability: "All Dr Spice branches", description: "Refreshing digestive herb"},
                {name: "Turmeric Powder", category: "Spice", keyIngredients: ["Curcumin", "Piperine"], treats: ["Joint Pain and Arthritis", "Muscle Pain"], treatsKeywords: ["joint pain", "arthritis", "inflammation", "muscle pain"], conditions: ["Joint Pain and Arthritis", "Muscle Pain and Body Aches", "Acne and Pimples"], dosage: "As directed", priceRange: "KES 200", availability: "All Dr Spice branches", description: "Powerful anti-inflammatory"},
                {name: "Cayenne Pepper", category: "Spice", keyIngredients: ["Capsaicin", "Vitamin A, C"], treats: ["Joint Pain", "Poor Appetite"], treatsKeywords: ["joint pain", "arthritis", "muscle pain", "poor appetite", "circulation"], conditions: ["Joint Pain and Arthritis", "Muscle Pain and Body Aches", "Poor Appetite and Weight Loss"], dosage: "As directed", priceRange: "KES 200", availability: "All Dr Spice branches", description: "Fiery circulation booster"},
                {name: "Castor Oil", category: "Oil", keyIngredients: ["Ricinoleic acid", "Vitamin E"], treats: ["Constipation", "Joint Pain"], treatsKeywords: ["constipation", "joint", "arthritis", "skin", "hair"], conditions: ["Constipation", "Joint Pain and Arthritis"], dosage: "As directed", priceRange: "KES 800", availability: "All Dr Spice branches", description: "Versatile healing oil"},
                {name: "Moringa", category: "Herb", keyIngredients: ["Vitamin A, C, E", "Calcium", "Iron"], treats: ["Fatigue", "Anemia", "Low Immunity"], treatsKeywords: ["fatigue", "low energy", "anemia", "immunity"], conditions: ["Fatigue and Low Energy", "Anemia and Iron Deficiency", "Low Immunity and Frequent Infections"], dosage: "As directed", priceRange: "KES 300", availability: "All Dr Spice branches", description: "Nutrient-dense miracle tree"},
                {name: "Ashwagandha", category: "Herb", keyIngredients: ["Withanolides", "Alkaloids"], treats: ["Stress", "Insomnia", "Fatigue"], treatsKeywords: ["stress", "anxiety", "insomnia", "sleep", "fatigue", "libido"], conditions: ["Stress and Anxiety", "Insomnia and Sleep Difficulties", "Fatigue and Low Energy", "Low Libido and Sexual Health"], dosage: "As directed", priceRange: "KES 300", availability: "All Dr Spice branches", description: "Adaptogenic stress reliever"},
                {name: "Black Seed Oil", category: "Oil", keyIngredients: ["Nigellin", "Thymoquinone"], treats: ["Low Immunity", "Common Cold"], treatsKeywords: ["immunity", "cold", "flu", "stomach", "allergies"], conditions: ["Low Immunity and Frequent Infections", "Common Cold and Flu", "Stomach Upset and Nausea"], dosage: "As directed", priceRange: "KES 1,100", availability: "All Dr Spice branches", description: "Seed of blessing"},
                {name: "Ginger Tea", category: "Tea", keyIngredients: ["Gingerol", "Zingiberene"], treats: ["Nausea", "Cold and Flu"], treatsKeywords: ["nausea", "vomiting", "cold", "flu", "cough"], conditions: ["Stomach Upset and Nausea", "Common Cold and Flu", "Cough (Dry and Productive)"], dosage: "As directed", priceRange: "KES 150-300", availability: "All Dr Spice branches", description: "Soothing digestive tea"},
                {name: "Hibiscus Flowers", category: "Herb", keyIngredients: ["Anthocyanins", "Vitamin C"], treats: ["High Blood Pressure"], treatsKeywords: ["blood pressure", "hypertension", "detox"], conditions: ["High Blood Pressure (Hypertension)", "Detoxification and Body Cleansing"], dosage: "As directed", priceRange: "KES 300", availability: "All Dr Spice branches", description: "Heart-healthy floral tea"},
                {name: "Chamomile", category: "Herb", keyIngredients: ["Apigenin", "Bisabolol"], treats: ["Stress", "Insomnia"], treatsKeywords: ["stress", "anxiety", "sleep", "insomnia", "calm"], conditions: ["Stress and Anxiety", "Insomnia and Sleep Difficulties", "Stomach Upset and Nausea"], dosage: "As directed", priceRange: "KES 500", availability: "All Dr Spice branches", description: "Calming sleep aid"},
                {name: "Mullein", category: "Herb", keyIngredients: ["Saponins", "Mucilage"], treats: ["Cough", "Asthma", "Bronchitis"], treatsKeywords: ["cough", "asthma", "breathing", "bronchitis", "lung"], conditions: ["Cough (Dry and Productive)", "Asthma and Breathing Difficulties", "Bronchitis"], dosage: "As directed", priceRange: "KES 400", availability: "All Dr Spice branches", description: "Respiratory support herb"},
                {name: "Echinacea", category: "Herb", keyIngredients: ["Alkylamides", "Polysaccharides"], treats: ["Low Immunity", "Common Cold"], treatsKeywords: ["immunity", "cold", "flu", "infection"], conditions: ["Low Immunity and Frequent Infections", "Common Cold and Flu"], dosage: "As directed", priceRange: "KES 500", availability: "All Dr Spice branches", description: "Immune system booster"},
                {name: "Milk Thistle", category: "Herb", keyIngredients: ["Silymarin", "Silybin"], treats: ["Liver Support", "Detox"], treatsKeywords: ["liver", "detox", "cleansing"], conditions: ["Liver Support and Detoxification", "Detoxification and Body Cleansing"], dosage: "As directed", priceRange: "KES 500", availability: "All Dr Spice branches", description: "Liver protection herb"},
                {name: "Spirulina", category: "Supplement", keyIngredients: ["Phycocyanin", "Protein", "B-vitamins"], treats: ["Anemia", "Fatigue"], treatsKeywords: ["anemia", "iron", "fatigue", "immunity", "energy"], conditions: ["Anemia and Iron Deficiency", "Fatigue and Low Energy", "Low Immunity and Frequent Infections"], dosage: "As directed", priceRange: "KES 1,000", availability: "All Dr Spice branches", description: "Nutrient-dense superfood"},
                {name: "Elderberry Extract", category: "Extract", keyIngredients: ["Anthocyanins", "Vitamin C"], treats: ["Common Cold", "Low Immunity"], treatsKeywords: ["cold", "flu", "immunity", "cough", "fever"], conditions: ["Common Cold and Flu", "Low Immunity and Frequent Infections", "Cough (Dry and Productive)"], dosage: "As directed", priceRange: "KES 1,000", availability: "All Dr Spice branches", description: "Immune-supporting berry extract"},
                {name: "Fenugreek Seeds", category: "Seeds", keyIngredients: ["Trigonelline", "Diosgenin"], treats: ["Diabetes", "Poor Appetite"], treatsKeywords: ["blood sugar", "diabetes", "appetite", "libido"], conditions: ["Diabetes and Blood Sugar Management", "Poor Appetite and Weight Loss", "Low Libido and Sexual Health"], dosage: "As directed", priceRange: "KES 300", availability: "All Dr Spice branches", description: "Blood sugar balancing seeds"},
                {name: "Thyme", category: "Herb", keyIngredients: ["Thymol", "Carvacrol"], treats: ["Cough", "Sore Throat"], treatsKeywords: ["cough", "sore throat", "bronchitis", "respiratory"], conditions: ["Cough (Dry and Productive)", "Sore Throat", "Bronchitis"], dosage: "As directed", priceRange: "KES 500", availability: "All Dr Spice branches", description: "Antimicrobial respiratory herb"},
                {name: "Tea Tree Oil", category: "Oil", keyIngredients: ["Terpinen-4-ol", "Cineole"], treats: ["Acne", "Fungal Infections", "Dandruff"], treatsKeywords: ["acne", "fungal", "dandruff", "scalp", "skin"], conditions: ["Acne and Pimples", "Fungal Skin Infections", "Dandruff and Scalp Conditions"], dosage: "External use only", priceRange: "KES 400", availability: "All Dr Spice branches", description: "Powerful antiseptic oil"}
            ]
        }
    ],

    getProductsForCondition: function(conditionName, keywords, category) {
        var brandMatches = [];

        this.brands.forEach(function(brand) {
            var matches = [];
            var seen = {};

            brand.products.forEach(function(prod) {
                var directMatch = (prod.conditions || []).some(function(c) {
                    return c.toLowerCase() === conditionName.toLowerCase();
                });

                var kwMatch = false;
                if (prod.treatsKeywords && keywords) {
                    var prodKw = (prod.treatsKeywords || []).join(' ').toLowerCase();
                    keywords.forEach(function(k) {
                        if (prodKw.includes(k.toLowerCase())) kwMatch = true;
                    });
                }

                if (directMatch || kwMatch) {
                    var key = prod.name.toLowerCase();
                    if (!seen[key]) {
                        seen[key] = true;
                        matches.push({
                            productName: prod.name,
                            brand: brand.name,
                            brandPhone: brand.phone,
                            brandEmail: brand.email,
                            brandWebsite: brand.website,
                            keyIngredients: prod.keyIngredients || [],
                            dosage: prod.dosage || '',
                            priceRange: prod.priceRange || 'See website',
                            availability: prod.availability || '',
                            description: prod.description || '',
                            conditionsCovered: [{ conditionName: conditionName }],
                            matchType: directMatch ? 'direct' : 'keyword'
                        });
                    }
                }
            });

            matches.sort(function(a, b) {
                if (a.matchType !== b.matchType) {
                    return a.matchType === 'direct' ? -1 : 1;
                }
                return a.productName.localeCompare(b.productName);
            });

            if (matches.length > 0) {
                brandMatches.push({
                    brandName: brand.name,
                    brandDescription: brand.description,
                    brandWebsite: brand.website,
                    products: matches
                });
            }
        });

        return brandMatches;
    }
};
