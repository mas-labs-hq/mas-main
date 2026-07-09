/**
 * Elthira.AI - Knowledge Base: Digestive System
 * Powered By MortApps Studios
 * 
 * Covers: Stomach issues, bloating, constipation, ulcers,
 * appetite disorders, acid reflux, intestinal worms, diarrhea,
 * liver & gallbladder support
 */

var HERBAL_DATA_F1 = {
    category: "Digestive System",
    regionalNote: "In Kenya, digestive herbal remedies are among the most commonly used traditional medicines. Communities across all regions have relied on locally available plants for stomach ailments for centuries. Many of these herbs are now commercially available through brands like Dr. Spice, providing easy access to standardized herbal preparations.",
    conditions: [
        {
            name: "Stomach Upset and Nausea",
            keywords: ["stomach pain", "upset stomach", "nausea", "vomiting", "stomachache", "feeling sick", "want to vomit", "stomach cramps", "tummy ache", "belly pain", "churning stomach", "queasy"],
            relatedKeywords: ["indigestion", "food poisoning", "travel sickness", "morning sickness"],
            severity: "mild",
            description: "Stomach upset and nausea are common digestive complaints characterized by discomfort in the upper abdomen, often accompanied by a sensation of wanting to vomit. These symptoms can be triggered by contaminated food, motion, pregnancy, stress, or underlying digestive conditions. In Kenya, foodborne stomach upsets are particularly common during hot seasons when food preservation is challenging.",
            lifestyleFactors: ["eating spicy foods", "eating late at night", "stress", "food poisoning", "travel", "pregnancy", "medication side effects"],
            herbalRemedies: [
                {
                    name: "Ginger",
                    swahiliName: "Tangawizi",
                    preparation: "Peel and grate a thumb-sized piece of fresh ginger root. Boil in 2 cups of water for 10 minutes. Strain and add honey to taste. Alternatively, chew a small piece of fresh ginger or take ginger tea bags available commercially.",
                    dosage: "Drink 1 cup of ginger tea 2-3 times daily, or chew a small piece of fresh ginger before meals. For nausea, sip slowly.",
                    cautions: "Excessive ginger may cause heartburn. Not recommended in high doses for people with gallstones or bleeding disorders. Pregnant women should limit to 1 gram daily.",
                    availability: "Widely available in all Kenyan markets, supermarkets, and from herbal vendors. Grows easily in most Kenyan regions.",
                    brandReferences: "Available from Dr. Spice as ginger tea and capsules"
                },
                {
                    name: "Peppermint",
                    swahiliName: "Minti",
                    preparation: "Steep 1-2 teaspoons of dried peppermint leaves in hot water for 10 minutes. Strain and drink. Fresh peppermint leaves can also be chewed or used to make tea.",
                    dosage: "Drink 1 cup 2-3 times daily, especially after meals. Peppermint oil capsules (0.2mL) can be taken 1-2 times daily between meals.",
                    cautions: "Avoid peppermint if you have GERD or acid reflux as it may relax the esophageal sphincter. Not recommended for infants or young children.",
                    availability: "Available in Kenyan supermarkets, pharmacies, and online. Fresh mint grows well in Kenyan highland areas.",
                    brandReferences: "Dr. Spice carries peppermint-based digestive products"
                },
                {
                    name: "Lemon",
                    swahiliName: "Ndimu",
                    preparation: "Squeeze the juice of half a lemon into a glass of warm water. Add honey to taste. Can also add a pinch of grated ginger for enhanced effect.",
                    dosage: "Drink 1 glass first thing in the morning on an empty stomach, and as needed when feeling nauseous.",
                    cautions: "Excessive lemon juice may erode tooth enamel over time. Rinse mouth with plain water after drinking. People with citrus allergies should avoid.",
                    availability: "Abundantly available throughout Kenya. Cheap and accessible in every market and supermarket.",
                    brandReferences: ""
                },
                {
                    name: "Fennel Seeds",
                    swahiliName: "Methi ya kikabu",
                    preparation: "Lightly crush 1 teaspoon of fennel seeds and steep in hot water for 10 minutes. Strain and drink. Can also chew a small pinch of raw fennel seeds after meals.",
                    dosage: "Drink fennel tea 2-3 times daily, or chew 1/2 teaspoon of seeds after meals to aid digestion.",
                    cautions: "Generally safe for most people. Avoid in large quantities during pregnancy. May interact with certain medications like ciprofloxacin.",
                    availability: "Available in Kenyan Indian shops, major supermarkets (Naivas, Tuskys), and herbal medicine stores.",
                    brandReferences: ""
                }
            ],
            bestPractices: [
                "Eat smaller, more frequent meals rather than large portions",
                "Avoid lying down immediately after eating - wait at least 2 hours",
                "Stay hydrated by drinking clean water throughout the day",
                "Avoid spicy, fatty, and heavily processed foods during recovery",
                "Eat slowly and chew food thoroughly to aid digestion",
                "Keep a food diary to identify trigger foods",
                "Wash hands thoroughly before eating and after using the toilet",
                "Ensure food is freshly prepared and properly stored, especially in hot weather"
            ],
            whenToSeeDoctor: "Seek medical attention if vomiting persists for more than 24 hours, if there is blood in vomit, severe abdominal pain, high fever, or signs of dehydration (dark urine, dizziness, excessive thirst)."
        },
        {
            name: "Constipation",
            keywords: ["constipation", "difficulty passing stool", "hard stool", "not passing stool", "blocked", "straining", "infrequent bowel", "can't poop", "bloated belly", "no bowel movement"],
            relatedKeywords: ["irregular bowel", "slow digestion", "bowel problems", "stomach bloating"],
            severity: "mild",
            description: "Constipation is a common digestive issue defined as having fewer than three bowel movements per week, or difficulty passing dry, hard stools. It can be caused by a low-fiber diet, inadequate water intake, sedentary lifestyle, certain medications, or ignoring the urge to have a bowel movement. Chronic constipation affects a significant portion of the Kenyan population, particularly in urban areas where processed foods are more common.",
            lifestyleFactors: ["low fiber diet", "not drinking enough water", "sedentary lifestyle", "ignoring urge", "stress", "travel", "medications", "pregnancy", "aging"],
            herbalRemedies: [
                {
                    name: "Aloe Vera",
                    swahiliName: "Mwango / Mwango wa kikuyu",
                    preparation: "Extract the clear gel from a fresh aloe vera leaf. Mix 2 tablespoons of the gel with 1 cup of warm water or fruit juice. Ensure you use only the clear inner gel, not the yellow latex (aloe latex). Commercial aloe vera juice is also available.",
                    dosage: "Take 2 tablespoons of aloe gel mixed in water once daily, preferably in the morning. Do not use for more than 1-2 weeks continuously.",
                    cautions: "Aloe vera latex (the yellow part near the skin) is a strong laxative and can cause cramping. Pregnant women must avoid aloe latex entirely. Do not use for extended periods without medical supervision.",
                    availability: "Fresh aloe vera plants are common in Kenyan homes and gardens. Commercial aloe vera juice available in pharmacies and supermarkets.",
                    brandReferences: "Dr. Spice offers aloe vera-based digestive products"
                },
                {
                    name: "Moringa",
                    swahiliName: "Mlonge",
                    preparation: "Add 1 teaspoon of dried moringa leaf powder to a glass of warm water, juice, or tea. Alternatively, steep fresh or dried moringa leaves in hot water for 5-10 minutes to make tea.",
                    dosage: "Take moringa tea or powder once daily. Can be taken in the morning on an empty stomach for best results.",
                    cautions: "Moringa is generally safe. However, the root and bark should not be consumed as they contain toxic compounds. Pregnant women should avoid moringa root. Start with small amounts and increase gradually.",
                    availability: "Widely available across Kenya. Moringa trees grow in most regions. Dried moringa powder available in health stores, supermarkets, and from local vendors.",
                    brandReferences: "Dr. Spice carries moringa leaf powder and capsules"
                },
                {
                    name: "Senna",
                    swahiliName: "Sena / Msenefu",
                    preparation: "Steep 1-2 teaspoons of dried senna leaves in hot water for 10 minutes. Strain and drink. Can add honey or ginger to improve taste.",
                    dosage: "Drink 1 cup before bedtime. Results typically occur within 6-12 hours. Do not use for more than 1 week without medical advice.",
                    cautions: "Senna is a stimulant laxative - do not overuse. Prolonged use can lead to dependency and electrolyte imbalance. Not recommended for pregnant women, children under 12, or people with intestinal obstruction.",
                    availability: "Available in Kenyan pharmacies and herbal medicine shops. Senna is regulated as a medicinal herb.",
                    brandReferences: ""
                },
                {
                    name: "Slippery Elm",
                    swahiliName: "Not locally known - imported supplement",
                    preparation: "Mix 1-2 teaspoons of slippery elm bark powder with warm water to form a smooth paste. Let it stand for a few minutes to thicken, then drink. Can also be added to oatmeal or smoothies.",
                    dosage: "Take 1-2 teaspoons of powder mixed in water 2-3 times daily, preferably before meals.",
                    cautions: "Slippery elm is generally very safe with few side effects. However, it may slow the absorption of other medications - take it at least 2 hours apart from other medicines.",
                    availability: "Available as an imported supplement in Kenyan health stores and online platforms like Jumia. Less commonly found in local markets.",
                    brandReferences: "Available from international supplement brands"
                },
                {
                    name: "Flaxseed",
                    swahiliName: "Alsi / Mbegu za alsi",
                    preparation: "Grind whole flaxseeds and add 1-2 tablespoons to water, yogurt, porridge, or smoothies. Whole flaxseeds can also be soaked in water overnight and consumed the next morning.",
                    dosage: "2 tablespoons of ground flaxseed daily, with at least 1 glass of water. Ensure adequate water intake throughout the day.",
                    cautions: "Always consume ground flaxseeds, not whole, as whole seeds may pass through undigested. Increase intake gradually to avoid bloating. People with bowel obstruction should avoid.",
                    availability: "Available in Kenyan supermarkets, health food stores, and online. Grows in some Kenyan highland regions.",
                    brandReferences: ""
                }
            ],
            bestPractices: [
                "Increase fiber intake with whole grains, fruits, vegetables, and legumes (ugali, beans, sukuma wiki, oranges, pawpaw)",
                "Drink at least 8 glasses (2 liters) of clean water daily",
                "Exercise regularly - even a 20-minute daily walk stimulates bowel movement",
                "Establish a regular toilet routine - try to go at the same time each day",
                "Never ignore the urge to have a bowel movement",
                "Include probiotic-rich foods in your diet (mala/sour milk, yogurt)",
                "Reduce intake of processed foods, white bread, and refined sugars",
                "Try abdominal massage in a clockwise direction to stimulate digestion"
            ],
            whenToSeeDoctor: "Consult a healthcare provider if constipation persists for more than 3 weeks, if there is blood in stool, severe abdominal pain, unexplained weight loss, or if constipation alternates with diarrhea."
        },
        {
            name: "Diarrhea",
            keywords: ["diarrhea", "loose stool", "running stomach", "watery stool", "frequent bowel", "stomach running", "kuharisha", "loose motions", "frequent toilet"],
            relatedKeywords: ["food poisoning", "stomach bug", "gastroenteritis", "traveler's diarrhea"],
            severity: "moderate",
            description: "Diarrhea is characterized by frequent, loose, or watery bowel movements. It can be acute (lasting 1-2 days) or chronic (persisting for weeks). Common causes include infections from contaminated food or water, food intolerances, reactions to medications, and digestive disorders. In Kenya, diarrheal diseases are among the leading causes of morbidity, particularly in areas with limited access to clean water and proper sanitation.",
            lifestyleFactors: ["contaminated water", "spoiled food", "poor hygiene", "food intolerance", "stress", "bacterial/viral infection", "travel"],
            herbalRemedies: [
                {
                    name: "Guava Leaves",
                    swahiliName: "Majani ya mapera",
                    preparation: "Wash a handful of fresh guava leaves thoroughly. Boil in 2 cups of water for 15-20 minutes. Strain and allow to cool. Add a pinch of salt and sugar to create a rehydration solution.",
                    dosage: "Drink half a cup 2-3 times daily until symptoms subside. The decoction can also be used for children in smaller doses.",
                    cautions: "Ensure leaves are thoroughly washed to avoid contamination. Pregnant women should use in moderation. Not a substitute for oral rehydration therapy in severe dehydration.",
                    availability: "Guava trees are extremely common across Kenya. Fresh leaves are free and accessible. Guava fruit is available in most markets.",
                    brandReferences: ""
                },
                {
                    name: "Activated Charcoal",
                    swahiliName: "Mkaa ulioamilishwa",
                    preparation: "Activated charcoal tablets or powder can be taken with water. For powder, mix 1/2 teaspoon in a glass of water, stir well, and drink quickly before it settles.",
                    dosage: "250-500mg (1-2 tablets) after each loose stool, up to 4 times daily. Do not exceed 4g per day without medical supervision.",
                    cautions: "Activated charcoal can interfere with absorption of other medications - take at least 2 hours apart from other drugs. Not recommended for children under 12 without medical advice. Do not use if poisoning is suspected - seek emergency care instead.",
                    availability: "Available in Kenyan pharmacies and health stores. Dr. Spice and other herbal brands carry activated charcoal products.",
                    brandReferences: "Available from Dr. Spice and various pharmacy chains in Kenya"
                },
                {
                    name: "Turmeric",
                    swahiliName: "Manjano",
                    preparation: "Mix 1/2 teaspoon of turmeric powder in a glass of warm water or milk. Add a pinch of black pepper to enhance absorption. Can also add honey for taste.",
                    dosage: "Drink 1-2 glasses daily. Turmeric milk (golden milk) before bedtime is particularly effective.",
                    cautions: "Turmeric is generally safe but may cause stomach discomfort in very high doses. People with gallbladder disease should use with caution. May interact with blood-thinning medications.",
                    availability: "Widely available in every Kenyan market, kibanda, and supermarket. Very affordable.",
                    brandReferences: ""
                },
                {
                    name: "Pomegranate Rind",
                    swahiliName: "Ganda ya mapombe",
                    preparation: "Dry the inner white rind of pomegranate fruit, then grind to a powder. Boil 1 teaspoon of powder in 1 cup of water for 10 minutes. Strain and drink.",
                    dosage: "Drink 1 cup 2-3 times daily until symptoms improve.",
                    cautions: "Not recommended for people with constipation tendencies. Use sparingly for children. Some people may be allergic to pomegranate.",
                    availability: "Pomegranates are seasonal but available in Kenyan markets. The rind is often discarded but has significant medicinal value.",
                    brandReferences: ""
                }
            ],
            bestPractices: [
                "Most critical: Rehydrate with ORS (Oral Rehydration Salts) or a homemade solution of 1 liter clean water + 6 teaspoons sugar + 1/2 teaspoon salt",
                "Continue eating if possible - bland foods like rice, bananas, toast, and boiled potatoes (BRAT diet)",
                "Avoid dairy products, spicy foods, fatty foods, and caffeine during episodes",
                "Wash hands thoroughly and frequently with soap and clean water",
                "Ensure drinking water is boiled or properly treated",
                "Rest and allow the body to recover",
                "For infants and young children, seek medical attention promptly as dehydration can be dangerous",
                "Avoid anti-diarrheal medications for the first 24 hours - diarrhea helps clear the infection"
            ],
            whenToSeeDoctor: "Seek immediate medical attention if diarrhea lasts more than 2 days, if there is blood or mucus in stool, high fever (above 39 degrees Celsius), signs of severe dehydration (extreme thirst, dry mouth, little or no urination, sunken eyes, dizziness), or if the person is an infant, elderly, or immunocompromised."
        },
        {
            name: "Bloating and Gas",
            keywords: ["bloating", "gas", "flatulence", "swollen belly", "stomach swelling", "burping", "belching", "feeling full", "distended stomach", "wind", "stomach tight"],
            relatedKeywords: ["indigestion", "slow digestion", "stomach discomfort", "abdominal distension"],
            severity: "mild",
            description: "Bloating is a feeling of fullness, tightness, or swelling in the abdomen, often accompanied by excessive gas (flatulence) and burping. It occurs when the gastrointestinal tract fills with air or gas. Common causes include overeating, eating too fast, consuming gas-producing foods (beans, cabbage, carbonated drinks), food intolerances, constipation, and gut bacteria imbalance. Many Kenyans experience bloating due to the high consumption of beans and legumes in the local diet.",
            lifestyleFactors: ["eating beans", "carbonated drinks", "eating too fast", "overeating", "constipation", "stress", "food intolerances", "high fiber diet suddenly"],
            herbalRemedies: [
                {
                    name: "Fenugreek",
                    swahiliName: "Uwatu / Methi",
                    preparation: "Soak 1 teaspoon of fenugreek seeds in water overnight. In the morning, drink the water along with the softened seeds on an empty stomach. Alternatively, dry-roast the seeds and grind to a powder - mix 1/2 teaspoon in warm water.",
                    dosage: "Take soaked fenugreek seeds (1 teaspoon) once daily in the morning, or take fenugreek powder 1/2 teaspoon twice daily before meals.",
                    cautions: "Fenugreek can lower blood sugar levels - diabetics should monitor closely. May cause mild diarrhea in high doses. Pregnant women should avoid large quantities as it may stimulate contractions. Can cause body odor (maple syrup smell) in some people.",
                    availability: "Available in Kenyan Indian shops, major supermarkets, and herbal stores. Fenugreek grows in some drier regions of Kenya.",
                    brandReferences: "Dr. Spice carries fenugreek products"
                },
                {
                    name: "Cumin Seeds",
                    swahiliName: "Jira",
                    preparation: "Dry-roast 1 teaspoon of cumin seeds, then boil in 2 cups of water for 5 minutes. Strain and drink warm. Can also chew a small pinch of roasted cumin seeds after meals.",
                    dosage: "Drink cumin water 2-3 times daily, or chew 1/4 teaspoon of roasted seeds after meals.",
                    cautions: "Generally safe. People with low blood sugar should use with caution as cumin may lower blood sugar. Excessive consumption may cause heartburn.",
                    availability: "Available in every Kenyan market and kibanda. Very cheap and accessible.",
                    brandReferences: ""
                },
                {
                    name: "Cardamom",
                    swahiliName: "Helikadi / Iliki",
                    preparation: "Crush 2-3 cardamom pods and steep in hot water for 10 minutes. Strain and drink. Can also chew on cardamom pods directly after meals.",
                    dosage: "Drink cardamom tea 2-3 times daily, especially after heavy meals. Chew 1-2 pods after meals for quick relief.",
                    cautions: "Generally safe in food amounts. Large doses may cause gastrointestinal issues. People with gallstones should consult a doctor before regular use.",
                    availability: "Available in Kenyan markets, spice shops, and supermarkets. A staple in Kenyan-Indian cuisine.",
                    brandReferences: ""
                },
                {
                    name: "Ajwain (Carom Seeds)",
                    swahiliName: "Mwango mdogo / Ajwain",
                    preparation: "Boil 1 teaspoon of ajwain seeds in 2 cups of water for 5-10 minutes. Strain and drink warm. Can add a pinch of rock salt for enhanced effect.",
                    dosage: "Drink 1 cup 2-3 times daily, or as needed after meals that cause bloating.",
                    cautions: "Ajwain is potent - use in moderation. Excessive consumption may cause nausea and heartburn. Not recommended for pregnant women in large doses. May interact with blood-thinning medications.",
                    availability: "Available in Kenyan Indian shops and selected supermarkets. Less common in local markets.",
                    brandReferences: ""
                }
            ],
            bestPractices: [
                "Soak beans and legumes overnight before cooking to reduce gas-producing compounds",
                "Eat slowly and chew food thoroughly to reduce air swallowing",
                "Avoid carbonated drinks and using straws which introduce excess air",
                "Take a short walk after meals to aid digestion",
                "Sip fennel or ginger tea after meals to prevent bloating",
                "Keep a food diary to identify and avoid personal trigger foods",
                "Include fermented foods (mala, yogurt, kimchi) to support gut health",
                "Avoid drinking large amounts of water during meals - drink between meals instead"
            ],
            whenToSeeDoctor: "Consult a healthcare provider if bloating is persistent and severe, accompanied by unexplained weight loss, blood in stool, severe abdominal pain, difficulty swallowing, or if it interferes with daily activities."
        },
        {
            name: "Stomach Ulcers",
            keywords: ["ulcer", "stomach ulcer", "peptic ulcer", "gastric ulcer", "stomach burning", "burning stomach", "stomach wound", "pain when eating", "stomach pain after eating", "gastritis"],
            relatedKeywords: ["helicobacter pylori", "stomach acidity", "stomach lining inflammation", "acid stomach"],
            severity: "severe",
            description: "Stomach ulcers (peptic ulcers) are painful sores that develop on the lining of the stomach or the first part of the small intestine. They are often caused by Helicobacter pylori (H. pylori) bacterial infection or long-term use of nonsteroidal anti-inflammatory drugs (NSAIDs). Symptoms include burning stomach pain, bloating, heartburn, nausea, and in severe cases, vomiting blood or dark stools. Stomach ulcers are very common in Kenya, with many people self-medicating with both traditional and commercial remedies.",
            lifestyleFactors: ["spicy foods", "stress", "alcohol consumption", "smoking", "caffeine", "NSAID overuse", "irregular meals", "h. pylori infection"],
            herbalRemedies: [
                {
                    name: "Cabbage Juice",
                    swahiliName: "Juisi ya kabichi",
                    preparation: "Wash fresh cabbage leaves thoroughly and blend or juice them. Strain to get pure juice. Drink immediately for maximum potency. Can be mixed with carrot juice for better taste.",
                    dosage: "Drink 1/2 to 1 cup of fresh cabbage juice 2-3 times daily, ideally on an empty stomach. Continue for 2-3 weeks.",
                    cautions: "Cabbage may cause gas and bloating initially as the body adjusts. People with hypothyroidism should use with caution as cabbage contains goitrogens. Start with small amounts and increase gradually.",
                    availability: "Cabbage is cheap and widely available in all Kenyan markets and supermarkets year-round.",
                    brandReferences: ""
                },
                {
                    name: "Honey",
                    swahiliName: "Asali",
                    preparation: "Take 1-2 tablespoons of raw, unprocessed honey on an empty stomach in the morning. Can also mix honey in warm water or herbal tea. Manuka honey is particularly effective.",
                    dosage: "1 tablespoon of raw honey 2-3 times daily - on an empty stomach in the morning, and before meals.",
                    cautions: "People with diabetes should use honey sparingly. Not suitable for infants under 1 year due to botulism risk. Always use raw, unprocessed honey for medicinal purposes.",
                    availability: "Kenyan honey is widely available from local beekeepers, markets, and supermarkets. Raw honey from Kitui, Baringo, and West Pokot regions is renowned.",
                    brandReferences: ""
                },
                {
                    name: "Licorice Root",
                    swahiliName: "Mti wa asali / Licorice",
                    preparation: "Boil 1 teaspoon of dried licorice root in 2 cups of water for 10-15 minutes. Strain and drink. Deglycyrrhizinated licorice (DGL) tablets are also effective and safer for long-term use.",
                    dosage: "Drink licorice root tea 2-3 times daily, 30 minutes before meals. For DGL tablets: chew 2 tablets (380mg each) 20 minutes before meals, 3 times daily.",
                    cautions: "Regular licorice root contains glycyrrhizin which can raise blood pressure and lower potassium with prolonged use. People with high blood pressure, heart disease, or kidney disease should use DGL form instead. Not recommended for pregnant women.",
                    availability: "Dried licorice root available in Kenyan health stores and selected pharmacies. DGL tablets available online and in health shops.",
                    brandReferences: ""
                },
                {
                    name: "Aloe Vera Juice",
                    swahiliName: "Juisi ya mwango",
                    preparation: "Use commercial aloe vera juice (decolorized, inner leaf gel only - without aloe latex). Start with small amounts (1-2 tablespoons) mixed in water or juice.",
                    dosage: "2 tablespoons of pure aloe vera juice twice daily, 15-20 minutes before meals. Start with 1 tablespoon to test tolerance.",
                    cautions: "CRITICAL: Ensure you use ONLY decolorized inner leaf aloe vera juice. Aloe latex (the bitter yellow part) can WORSEN ulcers. People with diabetes should monitor blood sugar. Not recommended during pregnancy.",
                    availability: "Available in Kenyan pharmacies, health stores, and supermarkets. Several brands including Dr. Spice carry aloe vera juice.",
                    brandReferences: "Dr. Spice offers aloe vera juice products"
                },
                {
                    name: "Slippery Elm",
                    swahiliName: "Imported supplement",
                    preparation: "Mix 1-2 teaspoons of slippery elm bark powder in warm water to form a thin paste. Let it thicken for 2-3 minutes, then drink. Can also be added to warm porridge.",
                    dosage: "1-2 teaspoons of powder in water, 2-3 times daily, approximately 20-30 minutes before meals.",
                    cautions: "Slippery elm coats the stomach lining providing soothing relief. It may slow absorption of other medications. Take at least 2 hours apart from other drugs. Generally very safe.",
                    availability: "Available in Kenyan health stores and online. Imported supplement.",
                    brandReferences: ""
                }
            ],
            bestPractices: [
                "Eat small, frequent meals (5-6 small meals instead of 3 large ones)",
                "Avoid spicy, acidic, fried, and fatty foods completely during healing",
                "Stop or reduce smoking and alcohol consumption as both worsen ulcers",
                "Avoid painkillers like aspirin and ibuprofen - use paracetamol instead",
                "Manage stress through relaxation techniques, exercise, or meditation",
                "Eat bananas - they are natural antacids that help soothe the stomach lining",
                "Drink cold milk for temporary relief from burning sensations",
                "Get tested for H. pylori at a health facility for targeted treatment",
                "Never skip breakfast and avoid long gaps between meals",
                "Sleep with your head slightly elevated to prevent acid reflux at night"
            ],
            whenToSeeDoctor: "Stomach ulcers are a serious medical condition. Consult a healthcare provider immediately if you notice: vomiting blood (red or coffee-ground appearance), dark/tarry stools, sudden severe abdominal pain, unexplained weight loss, difficulty breathing, or if symptoms persist despite home remedies. H. pylori testing and medical treatment may be necessary."
        },
        {
            name: "Acid Reflux and Heartburn",
            keywords: ["acid reflux", "heartburn", "chest burning", "acid coming up", "sour taste", "regurgitation", "burning chest", "GERD", "acid indigestion", "food coming back up"],
            relatedKeywords: ["gastric reflux", "esophageal burn", "stomach acid", "burping acid"],
            severity: "moderate",
            description: "Acid reflux occurs when stomach acid flows back into the esophagus, causing a burning sensation in the chest (heartburn). This happens when the lower esophageal sphincter weakens or relaxes inappropriately. Chronic acid reflux is known as GERD (Gastroesophageal Reflux Disease). Common triggers include spicy and fatty foods, caffeine, alcohol, large meals, and lying down after eating. This condition is increasingly common in urban Kenya due to dietary changes and sedentary lifestyles.",
            lifestyleFactors: ["overeating", "spicy foods", "caffeine", "alcohol", "lying down after eating", "obesity", "tight clothing", "smoking", "fatty foods"],
            herbalRemedies: [
                {
                    name: "Baking Soda (Sodium Bicarbonate)",
                    swahiliName: "Soda ya kuoka",
                    preparation: "Dissolve 1/2 teaspoon of baking soda in a glass of warm water. Stir well and drink immediately while it is still fizzy.",
                    dosage: "Drink 1 glass when experiencing heartburn. Do not use more than 3 times per week as it is high in sodium.",
                    cautions: "High in sodium - not suitable for people with high blood pressure, heart failure, or on sodium-restricted diets. Frequent use can cause metabolic alkalosis. Not a long-term solution.",
                    availability: "Available in every Kenyan shop, supermarket, and kibanda for about 50 KES.",
                    brandReferences: ""
                },
                {
                    name: "Banana",
                    swahiliName: "Ndizi",
                    preparation: "Eat a ripe banana as is. Bananas act as a natural antacid, coating the stomach lining and neutralizing excess acid. Overripe bananas are particularly effective.",
                    dosage: "Eat 1 banana when experiencing heartburn, or include a banana in your daily diet as prevention.",
                    cautions: "Generally very safe. Diabetics should consider the sugar content. Unripe bananas may actually worsen acid reflux in some people.",
                    availability: "Bananas are among the cheapest and most widely available fruits in Kenya. Available everywhere, all year round.",
                    brandReferences: ""
                },
                {
                    name: "Ginger Tea",
                    swahiliName: "Chai ya tangawizi",
                    preparation: "Boil sliced fresh ginger (thumb-sized piece) in 2 cups of water for 10 minutes. Strain and drink warm. Add honey to taste if desired.",
                    dosage: "Drink 1 cup 20-30 minutes before meals to prevent acid reflux, or when experiencing symptoms.",
                    cautions: "Ginger is generally safe. Very high doses may cause heartburn in some people. If ginger worsens your symptoms, discontinue use.",
                    availability: "Ginger is extremely cheap and available in every Kenyan market.",
                    brandReferences: ""
                },
                {
                    name: "Aloe Vera Juice",
                    swahiliName: "Juisi ya mwango",
                    preparation: "Use commercial, decolorized aloe vera juice (inner leaf gel only). Drink a small amount before meals.",
                    dosage: "2-4 ounces (60-120ml) of aloe vera juice 20-30 minutes before meals.",
                    cautions: "Must use decolorized, inner-leaf aloe vera juice only. Aloe latex can worsen reflux. Start with small amounts to test tolerance. May interact with diabetes and blood-thinning medications.",
                    availability: "Available in Kenyan pharmacies and health stores.",
                    brandReferences: "Dr. Spice carries aloe vera juice products"
                }
            ],
            bestPractices: [
                "Eat smaller meals more frequently - avoid large meals",
                "Do not lie down for at least 3 hours after eating",
                "Elevate the head of your bed by 6-8 inches using blocks or a wedge pillow",
                "Avoid trigger foods: spicy foods, citrus fruits, tomatoes, onions, garlic, chocolate, mint, fatty/fried foods",
                "Reduce or eliminate caffeine, alcohol, and carbonated drinks",
                "Wear loose-fitting clothing to reduce pressure on the stomach",
                "Maintain a healthy weight - excess weight puts pressure on the stomach",
                "Chew food slowly and thoroughly",
                "Sleep on your left side which helps keep stomach acid down"
            ],
            whenToSeeDoctor: "Seek medical attention if heartburn occurs more than twice a week, symptoms persist despite lifestyle changes and remedies, there is difficulty swallowing, persistent vomiting, unexplained weight loss, chest pain (especially with jaw or arm pain - may indicate heart issues), or if you experience black/tarry stools."
        },
        {
            name: "Poor Appetite and Weight Loss",
            keywords: ["poor appetite", "no appetite", "loss of appetite", "not eating", "don't feel hungry", "weight loss", "can't eat", "no desire for food", "loss of taste", "not feeling hungry"],
            relatedKeywords: ["anorexia", "underweight", "malnutrition", "weakness from not eating"],
            severity: "moderate",
            description: "Poor appetite (anorexia) is a reduced desire to eat, which can lead to weight loss, nutritional deficiencies, and weakness if persistent. Causes range from infections (malaria, typhoid, HIV), stress and depression, medication side effects, digestive disorders, to chronic illnesses. In Kenya, poor appetite is commonly associated with malaria episodes, post-illness recovery, stress, and in some cases, food insecurity. Building appetite naturally with herbs and nutrition is crucial for recovery.",
            lifestyleFactors: ["illness", "stress", "depression", "medication", "digestive issues", "anxiety", "chronic disease", "grief", "hot weather", "sedentary lifestyle"],
            herbalRemedies: [
                {
                    name: "Fenugreek",
                    swahiliName: "Uwatu / Methi",
                    preparation: "Soak 1 teaspoon of fenugreek seeds in warm water overnight. In the morning, drink the water and chew the softened seeds. Alternatively, sprinkle ground fenugreek powder on food.",
                    dosage: "Take soaked seeds once daily in the morning. Can also take 1/2 teaspoon of ground fenugreek powder mixed in warm water before meals.",
                    cautions: "Fenugreek can lower blood sugar - diabetics should monitor. Pregnant women should avoid large quantities. May cause a maple syrup-like body odor.",
                    availability: "Available in Kenyan Indian shops and selected supermarkets.",
                    brandReferences: "Dr. Spice carries fenugreek products"
                },
                {
                    name: "Ginger",
                    swahiliName: "Tangawizi",
                    preparation: "Make ginger tea by boiling fresh sliced ginger in water for 10 minutes. Add honey and lemon for enhanced taste and appetite stimulation. Can also use ginger powder.",
                    dosage: "Drink 1 cup of ginger tea 30 minutes before meals, 2-3 times daily.",
                    cautions: "Excessive ginger may cause heartburn. Not for people with gallstones. Limit during pregnancy to 1 gram daily.",
                    availability: "Everywhere in Kenya. Very cheap.",
                    brandReferences: ""
                },
                {
                    name: "Moringa",
                    swahiliName: "Mlonge",
                    preparation: "Add moringa leaf powder to food, porridge, juice, or warm water. For appetite stimulation, moringa can be added to traditional dishes like ugali, githeri, or mukimo.",
                    dosage: "1-2 teaspoons of moringa powder daily. Can be divided between meals. Moringa tea (steep leaves in hot water) can also be taken.",
                    cautions: "Start with small amounts and increase gradually. Moringa root and bark are toxic - only use leaves. Pregnant women should consult a healthcare provider before regular use.",
                    availability: "Moringa trees are common across Kenya. Dried powder available in supermarkets, health stores, and local markets.",
                    brandReferences: "Dr. Spice carries moringa products"
                },
                {
                    name: "Ashwagandha",
                    swahiliName: "Ashwagandha / Ginseni ya Kihindi",
                    preparation: "Mix 1/2 to 1 teaspoon of ashwagandha root powder in warm milk or water. Add honey for taste. Can also take in capsule form (300-500mg).",
                    dosage: "Take ashwagandha powder once or twice daily, preferably with warm milk before bedtime. For capsules: 300-500mg, 1-2 times daily.",
                    cautions: "Ashwagandha may stimulate the immune system - people with autoimmune conditions should use with caution. May interact with thyroid, blood sugar, and blood pressure medications. Not recommended during pregnancy. Avoid with sedatives.",
                    availability: "Available in Kenyan health stores, pharmacies, and online platforms. Imported supplement but increasingly available locally.",
                    brandReferences: "Available from international supplement brands in Kenyan health shops"
                },
                {
                    name: "Blackseed Oil",
                    swahiliName: "Mafuta ya mbegu nyeusi / Nigella sativa",
                    preparation: "Take 1 teaspoon of cold-pressed blackseed oil directly, or mix with honey and warm water. Can also be drizzled on food or salads.",
                    dosage: "1 teaspoon of blackseed oil daily. Can be taken in the morning with breakfast. For enhanced appetite, mix with 1 teaspoon honey.",
                    cautions: "Generally safe for most people. May slow blood clotting - stop use 2 weeks before surgery. Pregnant women should avoid as it may affect uterine contractions. People with low blood pressure should monitor.",
                    availability: "Available in Kenyan pharmacies, health stores, supermarkets, and from herbal vendors. Several brands available including Dr. Spice.",
                    brandReferences: "Dr. Spice and other Kenyan herbal brands carry blackseed oil"
                }
            ],
            bestPractices: [
                "Eat small, frequent meals (every 2-3 hours) rather than 3 large meals",
                "Start the day with a nutritious breakfast even if you don't feel hungry",
                "Include protein-rich foods: eggs, beans, fish, lean meat, dairy",
                "Make food visually appealing - colors and presentation stimulate appetite",
                "Exercise lightly before meals - a 15-minute walk can boost hunger",
                "Drink water 30 minutes before meals, not during meals",
                "Include zinc-rich foods (pumpkin seeds, beans, nuts) which support taste and appetite",
                "Keep a regular meal schedule to train your body to expect food",
                "Avoid heavy, greasy foods that make you feel full quickly",
                "Manage stress and mental health as psychological factors strongly affect appetite"
            ],
            whenToSeeDoctor: "Consult a healthcare provider if loss of appetite persists for more than 2 weeks, is accompanied by unintentional weight loss of more than 5% of body weight, fever, persistent pain, difficulty swallowing, or if it is affecting your daily functioning and quality of life."
        },
        {
            name: "Intestinal Worms",
            keywords: ["worms", "intestinal worms", "stomach worms", "threadworms", "tapeworms", "roundworms", "kamba ya tumbo", "stomach parasites", "itchy bottom", "worm infection"],
            relatedKeywords: ["parasites", "helminths", "deworming", "bilharzia", "worm infestation"],
            severity: "moderate",
            description: "Intestinal worm infections are common in Kenya, especially in areas with poor sanitation and limited access to clean water. Types include roundworms, tapeworms, hookworms, and threadworms. Symptoms can include abdominal pain, bloating, diarrhea, unexplained weight loss, fatigue, and anal itching. Children are particularly susceptible. While herbal remedies have been traditionally used for deworming, medical treatment is often the most effective approach, especially for severe infections.",
            lifestyleFactors: ["poor sanitation", "walking barefoot", "contaminated food/water", "poor hygiene", "undercooked meat", "unwashed vegetables"],
            herbalRemedies: [
                {
                    name: "Papaya Seeds",
                    swahiliName: "Mbegu za papai",
                    preparation: "Scoop out seeds from a ripe papaya. Wash, dry, and grind to a powder. Mix 1-2 tablespoons of the powder in warm water or milk. Can also eat fresh seeds directly, but they are bitter.",
                    dosage: "1-2 tablespoons of powdered papaya seeds daily on an empty stomach for 5-7 days. For children: half the dose.",
                    cautions: "Papaya seeds are potent and should not be consumed in large quantities by pregnant women. May cause stomach upset in sensitive individuals. Not a substitute for medical deworming for severe infections.",
                    availability: "Papayas are abundantly available throughout Kenya. Seeds are free and often discarded.",
                    brandReferences: ""
                },
                {
                    name: "Neem",
                    swahiliName: "Mwarubaini",
                    preparation: "Boil a handful of neem leaves in 2 cups of water for 15 minutes. Strain and drink. Neem leaf powder can also be mixed with warm water or honey.",
                    dosage: "Drink 1 cup of neem tea twice daily for 5-7 days. Neem leaf powder: 1/2 teaspoon twice daily with warm water.",
                    cautions: "Neem is generally safe but very bitter. Long-term use in high doses may affect liver and kidney function. Not recommended for pregnant women, breastfeeding mothers, or children under 12 without medical supervision. May interact with diabetes medications.",
                    availability: "Neem trees are very common in Kenya, especially in rural and semi-urban areas. Available in most communities.",
                    brandReferences: "Dr. Spice carries neem-based products"
                },
                {
                    name: "Garlic",
                    swahiliName: "Kitunguu saumu",
                    preparation: "Eat 2-3 raw garlic cloves daily. Crush and let them sit for 10 minutes before consuming (this activates allicin, the active compound). Can also add minced garlic to food.",
                    dosage: "2-3 raw garlic cloves daily on an empty stomach for 5-7 days. If raw garlic is too strong, roasted garlic is milder but slightly less effective.",
                    cautions: "Raw garlic may cause stomach burning, bad breath, and body odor. People with bleeding disorders or on blood thinners should use with caution. May interact with certain medications. Excessive garlic may lower blood pressure.",
                    availability: "Widely available and cheap in every Kenyan market.",
                    brandReferences: ""
                },
                {
                    name: "Cloves",
                    swahiliName: "Karafuu",
                    preparation: "Boil 1 teaspoon of whole cloves in 2 cups of water for 10 minutes. Strain and drink. Alternatively, chew 2-3 cloves directly.",
                    dosage: "Drink clove tea 1-2 times daily for 5-7 days, or chew 3-4 cloves daily.",
                    cautions: "Cloves are very strong - do not exceed recommended amounts. In large quantities, cloves may cause liver damage. Not recommended for children under 6. People with bleeding disorders should be cautious.",
                    availability: "Available in Kenyan markets and supermarkets. Used in Kenyan cooking (pilau, tea).",
                    brandReferences: ""
                }
            ],
            bestPractices: [
                "Practice proper hand washing with soap, especially before eating and after using the toilet",
                "Ensure all fruits and vegetables are thoroughly washed before consumption",
                "Cook meat, especially pork and fish, thoroughly before eating",
                "Drink only treated or boiled water",
                "Wear shoes when walking outside, especially in rural areas",
                "Keep fingernails short and clean - especially important for children",
                "Regular deworming every 3-6 months is recommended by the Kenyan Ministry of Health",
                "Maintain clean toilet and sanitation facilities",
                "Wash bed linens and underwear in hot water regularly if threadworms are suspected",
                "After herbal treatment, follow up with a healthcare provider for confirmation that the infection is cleared"
            ],
            whenToSeeDoctor: "Always seek medical confirmation for worm infections. Consult a healthcare provider if symptoms are severe, if there is blood in stool, significant weight loss, anemia symptoms (fatigue, pale skin), or if herbal remedies do not resolve the issue within 1-2 weeks. Pharmaceutical deworming medications (albendazole, mebendazole) are available and very effective."
        },
        {
            name: "Liver Support and Detoxification",
            keywords: ["liver problems", "fatty liver", "liver detox", "liver cleanse", "jaundice", "yellow eyes", "liver pain", "liver health", "detox", "body cleanse"],
            relatedKeywords: ["hepatitis", "liver inflammation", "bile problems", "gallbladder"],
            severity: "severe",
            description: "The liver is one of the most important organs in the body, responsible for detoxification, metabolism, and nutrient storage. Liver problems can range from fatty liver disease (common with alcohol and poor diet) to hepatitis infections (hepatitis B and C are significant health concerns in Kenya). Symptoms of liver problems include fatigue, jaundice (yellowing of eyes and skin), abdominal swelling, dark urine, and loss of appetite. Herbal support for the liver focuses on protecting liver cells, promoting detoxification, and supporting regeneration.",
            lifestyleFactors: ["alcohol consumption", "fatty foods", "obesity", "medications", "hepatitis infection", "exposure to toxins", "processed foods", "sugar"],
            herbalRemedies: [
                {
                    name: "Milk Thistle (Silymarin)",
                    swahiliName: "Mti wa maziwa / Milk thistle - imported",
                    preparation: "Milk thistle is most commonly taken as a standardized extract capsule (70-80% silymarin). Can also be made as a tea from dried seeds.",
                    dosage: "For liver support: 140mg of silymarin 2-3 times daily (standardized extract). As tea: 1 teaspoon of crushed seeds steeped in hot water for 15 minutes, 2-3 times daily.",
                    cautions: "Generally very safe with few side effects. May cause mild diarrhea in some people. People with ragweed allergies may react to milk thistle. May interact with diabetes and liver-processed medications. Pregnant and breastfeeding women should consult their doctor.",
                    availability: "Available as an imported supplement in Kenyan pharmacies and health stores. Available online through platforms like Jumia.",
                    brandReferences: ""
                },
                {
                    name: "Turmeric",
                    swahiliName: "Manjano",
                    preparation: "Mix 1/2 teaspoon of turmeric powder in a glass of warm water or milk. Add a pinch of black pepper to significantly enhance absorption of curcumin (the active compound).",
                    dosage: "Drink turmeric milk or turmeric water 1-2 times daily. For concentrated liver support, take 500mg of curcumin capsules 2 times daily.",
                    cautions: "Turmeric is safe in food amounts. High doses may cause stomach upset. People with gallbladder disease, kidney stones, or bleeding disorders should use caution. May interact with blood-thinning and diabetes medications.",
                    availability: "Widely available in every Kenyan market at very low cost.",
                    brandReferences: ""
                },
                {
                    name: "Dandelion Root",
                    swahiliName: "Mizizi ya mchunga",
                    preparation: "Boil 1-2 teaspoons of dried dandelion root in 2 cups of water for 15 minutes. Strain and drink as tea. Fresh dandelion roots can also be used after thorough washing.",
                    dosage: "Drink 1 cup of dandelion root tea 2-3 times daily. Can be taken for 2-3 weeks followed by a break.",
                    cautions: "People with gallbladder disease or gallstones should not use dandelion root without medical supervision. May interact with diuretics and diabetes medications. Some people may experience allergic skin reactions.",
                    availability: "Dandelion grows wild in many Kenyan highland areas. Dried root available in health stores as an imported product.",
                    brandReferences: ""
                },
                {
                    name: "Neem",
                    swahiliName: "Mwarubaini",
                    preparation: "Boil a handful of fresh neem leaves in 3 cups of water for 15-20 minutes. Strain and drink. Alternatively, take neem leaf powder capsules.",
                    dosage: "Drink 1 cup of neem tea daily. Neem leaf powder: 1/2 teaspoon twice daily with warm water. Use for 2-3 weeks, then take a 1-week break.",
                    cautions: "Neem should not be used long-term without medical supervision due to potential effects on liver and kidneys when overused. Pregnant women, breastfeeding mothers, and children should not consume neem internally. May interact with diabetes and blood pressure medications.",
                    availability: "Neem trees are widespread in Kenya. Fresh leaves available in most communities.",
                    brandReferences: "Dr. Spice carries neem products"
                }
            ],
            bestPractices: [
                "Reduce or eliminate alcohol consumption - the single most important step for liver health",
                "Eat a diet rich in fruits, vegetables, and whole grains",
                "Include liver-friendly foods: garlic, grapefruit, beets, carrots, green tea, cruciferous vegetables (sukuma wiki, broccoli, cabbage)",
                "Stay well hydrated - drink at least 2 liters of clean water daily",
                "Exercise regularly to reduce fatty liver risk",
                "Avoid unnecessary medications and supplements that burden the liver",
                "Get vaccinated against Hepatitis A and B",
                "Maintain a healthy weight - obesity is a major risk factor for fatty liver disease",
                "Practice safe sex and avoid sharing needles to prevent Hepatitis B and C",
                "Get regular liver function tests if at risk"
            ],
            whenToSeeDoctor: "Liver conditions are serious. Seek medical attention if you notice yellowing of eyes or skin (jaundice), persistent fatigue, dark urine, pale stools, abdominal swelling, severe pain in the upper right abdomen, unexplained weight loss, or if you have been exposed to hepatitis. Always get a proper medical diagnosis before starting herbal liver treatments."
        }
    ]
};
