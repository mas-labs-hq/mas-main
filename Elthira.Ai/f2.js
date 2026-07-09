/**
 * Elthira.AI - Knowledge Base: Respiratory System
 * Powered By MortApps Studios
 * 
 * Covers: Common cold, cough, flu, sore throat, asthma,
 * chest congestion, sinusitis, allergies, bronchitis
 */

var HERBAL_DATA_F2 = {
    category: "Respiratory System",
    regionalNote: "Respiratory conditions are among the most frequent health complaints in Kenya, with colds, flu, and coughs peaking during the rainy and cold seasons (March-May, October-December). Traditional herbal remedies for respiratory ailments are deeply embedded in Kenyan culture, with mothers across all communities having their own recipes for treating coughs and colds. Many Kenyan urban households use a combination of herbal teas and commercial herbal products to manage respiratory wellness.",
    conditions: [
        {
            name: "Common Cold and Flu",
            keywords: ["cold", "flu", "runny nose", "blocked nose", "sneezing", "fever", "body aches", "chills", "congestion", "feeling cold", "malaria-like symptoms", "headache with cold", "tired from cold"],
            relatedKeywords: ["influenza", "nasal congestion", "viral infection", "seasonal flu"],
            severity: "mild",
            description: "The common cold and influenza (flu) are viral infections of the upper respiratory tract. Symptoms include runny or blocked nose, sneezing, sore throat, cough, mild fever, body aches, and fatigue. In Kenya, colds and flu are common during the cool and rainy seasons. While they usually resolve on their own within 7-10 days, herbal remedies can significantly reduce symptom severity and duration, and help prevent complications.",
            lifestyleFactors: ["cold weather", "rainy season", "crowded places", "weak immunity", "poor ventilation", "stress", "lack of sleep", "poor nutrition"],
            herbalRemedies: [
                {
                    name: "Eucalyptus",
                    swahiliName: "Mti wa mafuta / Mwarubaini wa maji",
                    preparation: "Steam inhalation: Add 5-10 drops of eucalyptus oil to a bowl of hot water. Cover your head with a towel and inhale the steam for 10-15 minutes. For tea: Steep a few eucalyptus leaves in hot water. For chest rub: Mix eucalyptus oil with coconut oil and rub on chest.",
                    dosage: "Steam inhalation: 2-3 times daily. Tea: 1-2 cups daily. Chest rub: Apply as needed, especially before bedtime.",
                    cautions: "Do not apply eucalyptus oil directly on skin without dilution. Keep away from children under 6 - eucalyptus oil can be toxic if ingested. People with asthma should use steam inhalation with caution as it can trigger attacks in some individuals. Not recommended for pregnant women or breastfeeding mothers in medicinal amounts.",
                    availability: "Eucalyptus trees are common in Kenyan highlands. Eucalyptus oil available in pharmacies and supermarkets across Kenya.",
                    brandReferences: "Available in most Kenyan pharmacies"
                },
                {
                    name: "Ginger",
                    swahiliName: "Tangawizi",
                    preparation: "Boil thumb-sized piece of fresh ginger (sliced) in 2 cups of water for 10 minutes. Add honey, lemon juice, and a pinch of cayenne pepper for a powerful cold-fighting tea.",
                    dosage: "Drink 2-3 cups of ginger tea daily. Can also chew a small piece of fresh ginger throughout the day.",
                    cautions: "Excessive ginger may cause heartburn. Not for people with gallstones or bleeding disorders. Limit during pregnancy to 1 gram daily.",
                    availability: "Everywhere in Kenya. Very cheap and accessible.",
                    brandReferences: ""
                },
                {
                    name: "Honey and Lemon",
                    swahiliName: "Asali na ndimu",
                    preparation: "Mix 2 tablespoons of raw honey with the juice of half a lemon in a cup of warm (not hot) water. Stir well and sip slowly.",
                    dosage: "Drink 2-3 cups daily. Especially soothing for sore throats. Best taken first thing in the morning and before bed.",
                    cautions: "Honey should not be given to children under 1 year (botulism risk). Diabetics should monitor sugar intake. Water should be warm, not hot, to preserve honey's beneficial properties.",
                    availability: "Both honey and lemons are widely and cheaply available across Kenya.",
                    brandReferences: "Kenyan raw honey from Kitui, Baringo, and West Pokot is excellent"
                },
                {
                    name: "Garlic",
                    swahiliName: "Kitunguu saumu",
                    preparation: "Crush 2-3 garlic cloves and let stand for 10 minutes (activates allicin). Add to soup, tea, or mix with honey. For a potent remedy, eat 1-2 raw cloves daily during the cold.",
                    dosage: "2-3 raw garlic cloves daily. Can be added to food or taken with honey. Garlic soup is also very effective.",
                    cautions: "Raw garlic may cause stomach burning and bad breath. People on blood thinners should use cautiously. May interact with certain medications. Reduce if experiencing stomach discomfort.",
                    availability: "Widely available and cheap in every Kenyan market.",
                    brandReferences: ""
                },
                {
                    name: "Blackseed Oil",
                    swahiliName: "Mafuta ya mbegu nyeusi / Nigella sativa",
                    preparation: "Take 1 teaspoon of blackseed oil directly, or mix with honey and warm water. For nasal congestion, apply a small amount inside each nostril (diluted with olive oil).",
                    dosage: "1 teaspoon of blackseed oil daily during cold/flu episode. For prevention: 1/2 teaspoon daily during cold season.",
                    cautions: "May slow blood clotting - stop 2 weeks before surgery. Pregnant women should avoid. People with low blood pressure should monitor. Topical application inside nose should be done carefully to avoid irritation.",
                    availability: "Available in Kenyan pharmacies, health stores, and from herbal vendors. Dr. Spice carries blackseed oil.",
                    brandReferences: "Dr. Spice and other Kenyan herbal brands carry blackseed oil"
                }
            ],
            bestPractices: [
                "Get plenty of rest - sleep is essential for immune function",
                "Drink warm fluids throughout the day: water, herbal teas, soups",
                "Use a humidifier or steam inhalation to relieve nasal congestion",
                "Gargle with warm salt water (1/2 teaspoon salt in a glass of warm water) to soothe sore throat",
                "Keep warm, especially the chest and feet",
                "Eat vitamin C rich fruits: oranges, lemons, pawpaw, guavas",
                "Avoid dairy products which can increase mucus production",
                "Wash hands frequently to prevent spreading the infection",
                "Stay home from work/school to prevent spreading to others",
                "Blow nose gently to avoid ear and sinus complications"
            ],
            whenToSeeDoctor: "Seek medical attention if symptoms persist beyond 10 days, fever exceeds 39 degrees Celsius for more than 3 days, difficulty breathing, chest pain, severe headache, ear pain, or if symptoms suddenly worsen after initial improvement (may indicate secondary bacterial infection). Distinguish flu from malaria - if fever comes with chills, sweating, and body aches, consider malaria testing."
        },
        {
            name: "Cough (Dry and Productive)",
            keywords: ["cough", "dry cough", "wet cough", "chesty cough", "persistent cough", "coughing", "cough with phlegm", "barking cough", "night cough", "throat irritation cough"],
            relatedKeywords: ["bronchitis", "whooping cough", "tickly throat", "mucus in chest"],
            severity: "mild",
            description: "Coughing is a protective reflex that clears the airways of irritants, mucus, and foreign particles. A dry cough produces no mucus and is often caused by allergies, viral infections, or throat irritation. A productive (wet) cough brings up mucus and typically indicates a respiratory infection. Persistent coughs lasting more than 3 weeks require medical investigation. In Kenya, coughs are one of the most common reasons people seek both traditional and modern medical treatment.",
            lifestyleFactors: ["cold weather", "dust", "smoking", "dry air", "allergens", "viral infection", "pollution", "postnasal drip"],
            herbalRemedies: [
                {
                    name: "Honey",
                    swahiliName: "Asali",
                    preparation: "For dry cough: Take 1 tablespoon of raw honey directly. For enhanced effect, mix with equal parts ginger juice. For wet cough: Mix honey with a pinch of black pepper. Can also add honey to warm herbal tea.",
                    dosage: "1 tablespoon of honey 2-3 times daily. For children over 1 year: 1/2 teaspoon before bed. Studies show honey is as effective as some cough medicines for reducing nighttime cough in children.",
                    cautions: "CRITICAL: Never give honey to children under 1 year (infant botulism risk). Diabetics should monitor sugar intake. Use raw, unprocessed honey for best medicinal effect.",
                    availability: "Kenyan honey is widely available and of excellent quality. Look for raw honey from Kitui, Baringo, West Pokot, or Turkana.",
                    brandReferences: ""
                },
                {
                    name: "Thyme",
                    swahiliName: "Thyme / Mtili",
                    preparation: "Steep 2 teaspoons of dried thyme or a small handful of fresh thyme in 1 cup of hot water for 10 minutes. Strain and add honey to taste.",
                    dosage: "Drink thyme tea 2-3 times daily. For concentrated effect, thyme extract can be used as a cough syrup.",
                    cautions: "Thyme is generally safe in tea amounts. Large doses of thyme oil can be toxic. People with bleeding disorders should use thyme with caution. Not recommended for pregnant women in medicinal amounts.",
                    availability: "Fresh and dried thyme available in Kenyan supermarkets. Thyme grows well in Kenyan highland gardens.",
                    brandReferences: ""
                },
                {
                    name: "Lemon and Honey Tea",
                    swahiliName: "Chai ya ndimu na asali",
                    preparation: "Squeeze juice of 1 lemon into a mug. Add 2 tablespoons of raw honey. Pour hot (not boiling) water over and stir. Add a slice of fresh ginger if available.",
                    dosage: "Drink 2-3 cups daily. Especially effective before bedtime for nighttime cough relief.",
                    cautions: "Not for children under 1 year (honey). Excessive lemon may erode tooth enamel - rinse mouth after drinking.",
                    availability: "Both ingredients cheaply available everywhere in Kenya.",
                    brandReferences: ""
                },
                {
                    name: "Onion",
                    swahiliName: "Kitunguu",
                    preparation: "For chesty cough: Finely chop 1 onion and mix with 2 tablespoons of honey. Let stand for 4-6 hours (the mixture will become syrupy). Strain and take the syrup. Alternatively, place sliced onion near the bedside - the vapors help relieve nighttime cough.",
                    dosage: "1 tablespoon of onion-honey syrup 2-3 times daily. The bedside onion method works through the night.",
                    cautions: "Some people may experience stomach discomfort. Onion breath is a harmless side effect. Diabetics should account for the honey content.",
                    availability: "Onions are among the cheapest vegetables in Kenya. Available everywhere.",
                    brandReferences: ""
                },
                {
                    name: "Clove Tea",
                    swahiliName: "Chai ya karafuu",
                    preparation: "Boil 4-5 whole cloves in 2 cups of water for 10 minutes. Strain and add honey. Clove has natural numbing properties that soothe the throat.",
                    dosage: "Drink 1 cup 2-3 times daily. Can also suck on a whole clove for throat numbing effect.",
                    cautions: "Cloves are potent - do not consume in excessive amounts. Not for children under 6. Prolonged high-dose use may affect the liver.",
                    availability: "Cloves available in every Kenyan market and supermarket. Used in Kenyan cooking (pilau, tea).",
                    brandReferences: ""
                }
            ],
            bestPractices: [
                "Stay hydrated - warm fluids help thin mucus and soothe the throat",
                "Use a humidifier or bowl of hot water in the room to add moisture to the air",
                "Sleep with your head elevated to reduce coughing at night",
                "Avoid irritants: smoke, dust, strong odors, cold air",
                "Gargle with warm salt water to reduce throat inflammation",
                "For dry cough: suck on sugar-free lozenges or a piece of ginger to stimulate saliva",
                "For wet cough: encourage mucus clearance - do not suppress productive coughs",
                "Avoid dairy products which can thicken mucus",
                "Warm compress on the chest can help relieve chest congestion",
                "Avoid cold beverages and ice cream during the episode"
            ],
            whenToSeeDoctor: "Consult a healthcare provider if cough persists for more than 3 weeks, if coughing up blood, if accompanied by high fever, difficulty breathing, chest pain, night sweats, unexplained weight loss, or if the cough worsens despite home treatment. A persistent cough in Kenya should also be evaluated for tuberculosis (TB), which is prevalent."
        },
        {
            name: "Sore Throat",
            keywords: ["sore throat", "throat pain", "painful swallowing", "scratchy throat", "swollen throat", "tonsillitis", "throat infection", "strep throat", "throat irritation"],
            relatedKeywords: ["pharyngitis", "tonsil inflammation", "swollen tonsils", "throat burning"],
            severity: "mild",
            description: "A sore throat is pain, scratchiness, or irritation of the throat that often worsens when you swallow. The most common cause is a viral infection (cold or flu), but it can also be caused by bacterial infections (strep throat), allergies, dry air, or muscle strain from shouting. In Kenya, sore throats are common during the cold season and dusty periods. Most sore throats resolve within 5-10 days, but bacterial strep throat requires antibiotic treatment.",
            lifestyleFactors: ["cold drinks", "dust", "dry air", "viral infection", "bacterial infection", "shouting", "smoking", "pollution", "allergies"],
            herbalRemedies: [
                {
                    name: "Salt Water Gargle",
                    swahiliName: "Kunawa maji ya chumvi",
                    preparation: "Dissolve 1/2 teaspoon of salt in a glass of warm water. Gargle for 30 seconds, then spit out. Repeat every 2-3 hours.",
                    dosage: "Gargle 3-4 times daily, especially after meals and before bed.",
                    cautions: "Use warm, not hot, water. Do not swallow the salt water. Safe for children over 6 who can gargle properly. Very safe remedy.",
                    availability: "Salt and water - available everywhere. Cost: nearly zero.",
                    brandReferences: ""
                },
                {
                    name: "Slippery Elm",
                    swahiliName: "Imported supplement",
                    preparation: "Mix 1 tablespoon of slippery elm bark powder in a cup of warm water. Stir well and let it thicken. Drink slowly. The mucilage in slippery elm coats and soothes the throat. Can also be used as a lozenge.",
                    dosage: "1 tablespoon of powder in warm water, 2-3 times daily. Lozenges can be used every 2-3 hours as needed.",
                    cautions: "Slippery elm may slow absorption of other medications. Take 2 hours apart from other drugs. Very safe with minimal side effects. May cause minor bloating.",
                    availability: "Available as an imported supplement in Kenyan health stores and online. Lozenges available in some pharmacies.",
                    brandReferences: ""
                },
                {
                    name: "Licorice Root",
                    swahiliName: "Mti wa asali / Licorice",
                    preparation: "Boil 1 teaspoon of dried licorice root in 2 cups of water for 10 minutes. Strain and drink as tea. Can add honey for enhanced soothing effect. Licorice lozenges are also effective.",
                    dosage: "Drink 1 cup of licorice tea 2-3 times daily. Gargle before swallowing for dual benefit.",
                    cautions: "Prolonged use of regular licorice can raise blood pressure due to glycyrrhizin. People with hypertension should use DGL (deglycyrrhizinated licorice) instead. Not for pregnant women. Not for long-term use without medical supervision.",
                    availability: "Available in Kenyan health stores as dried root or capsules. Online ordering available.",
                    brandReferences: ""
                },
                {
                    name: "Clove",
                    swahiliName: "Karafuu",
                    preparation: "For quick relief: Slowly suck on a whole clove. The eugenol in cloves acts as a natural anesthetic. For tea: Boil 3-4 cloves in water for 10 minutes, strain and drink with honey.",
                    dosage: "Suck on 1-2 cloves as needed for pain relief. Clove tea: 2-3 cups daily.",
                    cautions: "Do not bite into cloves - suck slowly. Clove oil should never be swallowed undiluted. Not for children under 6. Excessive use may cause liver issues.",
                    availability: "Available in every Kenyan market and supermarket. Very cheap.",
                    brandReferences: ""
                }
            ],
            bestPractices: [
                "Rest your voice - avoid talking unnecessarily",
                "Drink plenty of warm fluids: water, herbal teas, warm soups",
                "Avoid very hot or very cold beverages",
                "Use a humidifier or inhale steam to moisten the throat",
                "Suck on ice chips or hard candies to stimulate saliva production",
                "Avoid smoking, secondhand smoke, and dusty environments",
                "Eat soft, easy-to-swallow foods: soups, mashed potatoes, porridge",
                "Gargle with warm salt water every few hours",
                "Get adequate rest and sleep to support immune function",
                "Replace your toothbrush after a sore throat to prevent reinfection"
            ],
            whenToSeeDoctor: "Seek medical attention if sore throat is severe and persists beyond 5 days, if difficulty breathing or swallowing, if drooling (especially in children), if joints are painful, if there is a rash, if blood in saliva, if you have been exposed to someone with strep throat, or if you have recurrent sore throats (may indicate tonsillitis requiring medical evaluation)."
        },
        {
            name: "Asthma and Breathing Difficulties",
            keywords: ["asthma", "breathing difficulty", "shortness of breath", "wheezing", "tight chest", "can't breathe", "breathless", "chest tightness", "gasping", "breathing problem"],
            relatedKeywords: ["bronchial asthma", "allergic asthma", "exercise-induced asthma", "chronic bronchitis"],
            severity: "severe",
            description: "Asthma is a chronic condition where the airways become inflamed and narrowed, causing breathing difficulties, wheezing, chest tightness, and coughing. Triggers include allergens (dust, pollen, mold), cold air, exercise, smoke, and stress. Asthma is increasingly common in Kenya, particularly in urban areas like Nairobi due to air pollution and dust. IMPORTANT: Herbal remedies should COMPLEMENT, not replace, prescribed asthma medications. Asthma attacks can be life-threatening and require immediate medical attention.",
            lifestyleFactors: ["dust", "pollen", "cold air", "smoke", "pollution", "exercise", "stress", "allergens", "animal dander", "mold"],
            herbalRemedies: [
                {
                    name: "Ginger",
                    swahiliName: "Tangawizi",
                    preparation: "Make ginger tea by boiling fresh sliced ginger in water for 10 minutes. Strain and add honey. Ginger has bronchodilator properties that may help open airways.",
                    dosage: "Drink 1-2 cups of ginger tea daily as a complementary measure. Not a replacement for asthma medication.",
                    cautions: "Ginger may interact with blood-thinning and diabetes medications. While it may help with mild symptoms, it CANNOT stop an asthma attack. Always carry your prescribed inhaler.",
                    availability: "Widely available across Kenya.",
                    brandReferences: ""
                },
                {
                    name: "Turmeric",
                    swahiliName: "Manjano",
                    preparation: "Mix 1/2 teaspoon of turmeric powder in a glass of warm milk (golden milk). Add a pinch of black pepper and honey to taste. Curcumin in turmeric has anti-inflammatory properties that may help reduce airway inflammation.",
                    dosage: "Drink 1 glass daily. Turmeric can also be added to food regularly.",
                    cautions: "Turmeric is a supplement, not a replacement for asthma medication. May interact with blood-thinning drugs. People with gallbladder disease should use cautiously.",
                    availability: "Very cheap and available everywhere in Kenya.",
                    brandReferences: ""
                },
                {
                    name: "Eucalyptus Oil",
                    swahiliName: "Mafuta ya mti wa mafuta",
                    preparation: "Steam inhalation: Add 3-5 drops of eucalyptus oil to a bowl of hot water. Inhale the steam with a towel over your head for 5-10 minutes. Can also add a few drops to a handkerchief and inhale periodically.",
                    dosage: "Steam inhalation once or twice daily. Use during mild symptoms - NOT during an active asthma attack.",
                    cautions: "CAUTION: Steam inhalation can TRIGGER asthma in some individuals. Test with very mild steam first. Do NOT use during an active asthma attack. Strong essential oils may irritate sensitive airways. Always have your rescue inhaler nearby.",
                    availability: "Available in Kenyan pharmacies and supermarkets.",
                    brandReferences: ""
                },
                {
                    name: "Honey",
                    swahiliName: "Asali",
                    preparation: "Take 1 tablespoon of raw honey, or mix in warm water. Some studies suggest honey may help reduce airway inflammation. Can be combined with ginger or turmeric.",
                    dosage: "1 tablespoon of raw honey daily. Can be taken in warm water or with herbal tea.",
                    cautions: "Do NOT give honey to anyone experiencing breathing difficulty - it could be a choking hazard. Not for children under 1 year. Honey is NOT a treatment for acute asthma attacks.",
                    availability: "Kenyan raw honey is widely available.",
                    brandReferences: ""
                }
            ],
            bestPractices: [
                "ALWAYS carry your prescribed inhaler/medication - herbal remedies are complementary ONLY",
                "Identify and avoid your personal asthma triggers",
                "Keep your living environment clean and dust-free",
                "Use dust-proof mattress and pillow covers",
                "Avoid smoking and secondhand smoke completely",
                "During cold/dusty weather, cover your nose and mouth with a scarf or mask",
                "Practice breathing exercises: pursed-lip breathing, diaphragmatic breathing",
                "Stay physically active but avoid exercise in cold, dusty environments",
                "Maintain a healthy weight - obesity worsens asthma",
                "Keep emergency contacts and hospital numbers readily accessible",
                "Have an asthma action plan from your healthcare provider"
            ],
            whenToSeeDoctor: "Asthma requires ongoing medical management. Seek IMMEDIATE emergency care for severe breathing difficulty, inability to speak in full sentences, blue lips or fingernails, severe chest tightness, rescue inhaler not helping, or rapid worsening of symptoms. Regular check-ups with a healthcare provider are essential for asthma management. Do not rely solely on herbal remedies for asthma."
        },
        {
            name: "Sinusitis and Nasal Congestion",
            keywords: ["sinusitis", "sinus infection", "blocked nose", "stuffy nose", "sinus pressure", "facial pain", "sinus headache", "postnasal drip", "nasal congestion", "runny nose"],
            relatedKeywords: ["sinus inflammation", "rhinosinusitis", "blocked sinuses", "sinus blockage"],
            severity: "moderate",
            description: "Sinusitis is inflammation or infection of the sinuses (hollow spaces behind the cheekbones and forehead). It causes nasal congestion, facial pressure or pain, thick nasal discharge, reduced sense of smell, and sometimes headache. It can be acute (viral, lasting 2-4 weeks) or chronic (lasting more than 12 weeks). In Kenya, sinusitis is common during dusty periods and cold seasons, and in urban areas with high pollution levels. Herbal decongestants and anti-inflammatories can provide significant relief.",
            lifestyleFactors: ["dust", "pollution", "cold air", "allergies", "smoke", "swimming", "structural issues", "weak immunity"],
            herbalRemedies: [
                {
                    name: "Neti Pot (Nasal Irrigation)",
                    swahiliName: "Kunawa puo",
                    preparation: "Dissolve 1/4 teaspoon of non-iodized salt and a pinch of baking soda in 1 cup of warm distilled or boiled (and cooled) water. Using a neti pot, tilt your head to one side and pour the solution into one nostril, allowing it to flow out the other.",
                    dosage: "Use 1-2 times daily during congestion. Use only clean, distilled, or properly boiled water to prevent infections.",
                    cautions: "CRITICAL: Use ONLY distilled, sterile, or previously boiled and cooled water. Using untreated tap water can cause serious infections. Clean the neti pot thoroughly after each use. Do not use if nostrils are completely blocked. Not for young children.",
                    availability: "Neti pots available in Kenyan pharmacies and online. Salt and baking soda available everywhere.",
                    brandReferences: ""
                },
                {
                    name: "Eucalyptus Steam Inhalation",
                    swahiliName: "Kuvuta moshi wa mwarubaini",
                    preparation: "Add 5-8 drops of eucalyptus oil to a bowl of hot water. Cover head with a towel and breathe deeply for 10-15 minutes. Alternatively, add eucalyptus oil to hot shower water.",
                    dosage: "2-3 times daily for significant congestion relief.",
                    cautions: "Use carefully to avoid steam burns. Children should be supervised. Asthmatics should use cautiously. Not a substitute for prescribed sinus medications.",
                    availability: "Eucalyptus oil available in Kenyan pharmacies and supermarkets.",
                    brandReferences: ""
                },
                {
                    name: "Peppermint Tea",
                    swahiliName: "Chai ya minti",
                    preparation: "Steep 1-2 teaspoons of dried peppermint leaves or 1 peppermint tea bag in hot water for 5-10 minutes. Cover while steeping to retain menthol vapors. Breathe in the steam before drinking.",
                    dosage: "Drink 2-3 cups daily. The menthol in peppermint acts as a natural decongestant.",
                    cautions: "Peppermint can worsen acid reflux. Not for infants. People with GERD should use cautiously.",
                    availability: "Available in Kenyan supermarkets. Dr. Spice carries peppermint products.",
                    brandReferences: "Dr. Spice carries peppermint-based products"
                },
                {
                    name: "Apple Cider Vinegar",
                    swahiliName: "Siki ya tikitiki maji",
                    preparation: "Mix 1-2 tablespoons of raw, unfiltered apple cider vinegar with 'the mother' in a glass of warm water. Add honey to taste.",
                    dosage: "Drink 1 glass 2-3 times daily. Can also be used for steam inhalation by adding to hot water.",
                    cautions: "Apple cider vinegar is acidic - always dilute before consuming. Rinse mouth after drinking to protect tooth enamel. People with ulcers or acid reflux should use with caution.",
                    availability: "Available in Kenyan supermarkets, health stores, and online. Bragg's brand is widely available.",
                    brandReferences: ""
                }
            ],
            bestPractices: [
                "Drink plenty of water and warm fluids to thin mucus",
                "Apply warm compresses to the face (forehead, nose, cheeks) to relieve pressure",
                "Sleep with your head elevated to promote sinus drainage",
                "Use a humidifier in your room, especially at night",
                "Avoid known allergens and irritants",
                "Try to identify triggers and minimize exposure",
                "Avoid sudden temperature changes",
                "Regular steam inhalation even without essential oils can help",
                "Blow nose gently - one nostril at a time",
                "Reduce dairy and sugar intake which can increase mucus production"
            ],
            whenToSeeDoctor: "Consult a healthcare provider if symptoms persist beyond 10 days, if there is high fever, severe facial pain, changes in vision, swelling around the eyes, thick yellow/green discharge for more than a week, or if you experience recurrent sinus infections. Chronic sinusitis may require medical intervention including antibiotics or surgery."
        },
        {
            name: "Allergies and Hay Fever",
            keywords: ["allergies", "hay fever", "sneezing", "itchy eyes", "watery eyes", "runny nose", "allergic reaction", "dust allergy", "pollen allergy", "itchy throat", "skin rash from allergy"],
            relatedKeywords: ["allergic rhinitis", "seasonal allergies", "dust allergy", "pet allergy"],
            severity: "mild",
            description: "Allergic rhinitis (hay fever) is an immune response to allergens such as dust, pollen, mold, pet dander, or cockroach droppings. Symptoms include sneezing, runny or itchy nose, itchy/watery eyes, itchy throat, and postnasal drip. In Kenya, dust allergies are particularly problematic, especially during the dry season (January-March) when dusty Harmattan-like winds affect much of the country. Urban areas with construction dust and traffic pollution also trigger significant allergic responses.",
            lifestyleFactors: ["dust", "pollen", "mold", "pet dander", "pollution", "construction dust", "strong odors", "seasonal changes", "damp environments"],
            herbalRemedies: [
                {
                    name: "Stinging Nettle",
                    swahiliName: "Mchicha mwitu / Thabari",
                    preparation: "Steep 1-2 teaspoons of dried stinging nettle leaves in hot water for 10 minutes. Strain and drink. Nettle acts as a natural antihistamine. Freeze-dried nettle capsules are also available.",
                    dosage: "Drink nettle tea 2-3 times daily during allergy season. For capsules: 300mg, 2-3 times daily.",
                    cautions: "Nettle may interact with blood thinners, diabetes, and blood pressure medications. Pregnant women should avoid. Handle fresh nettle carefully as the leaves sting. Dried or cooked nettle is safe.",
                    availability: "Nettle grows wild in many parts of Kenya, especially in fertile highland areas. Dried nettle tea available in health stores. Some supermarkets stock nettle tea bags.",
                    brandReferences: ""
                },
                {
                    name: "Turmeric",
                    swahiliName: "Manjano",
                    preparation: "Mix 1/2 teaspoon of turmeric powder in warm milk or water. Add a pinch of black pepper for enhanced absorption. Turmeric's curcumin has natural antihistamine and anti-inflammatory properties.",
                    dosage: "Drink turmeric milk or water 1-2 times daily during allergy season. For best results, take consistently.",
                    cautions: "May interact with blood-thinning and diabetes medications. People with gallbladder disease should use cautiously. Start with small amounts to test for any adverse reactions.",
                    availability: "Very cheap and available everywhere in Kenya.",
                    brandReferences: ""
                },
                {
                    name: "Local Honey",
                    swahiliName: "Asali ya asili",
                    preparation: "Take 1 tablespoon of raw, local honey daily. The theory is that local honey contains small amounts of local pollen, which may help desensitize the immune system over time. Mix in warm water or tea.",
                    dosage: "1 tablespoon of raw local honey daily, starting 1-2 months before allergy season for prevention. During active allergies, take 2-3 times daily.",
                    cautions: "Not for children under 1 year. Diabetics should monitor sugar intake. People with severe pollen allergies should start with very small amounts to test for reactions. Evidence is mixed but many people report benefit.",
                    availability: "Kenyan raw honey is abundant and affordable. Buy from local beekeepers for the most local pollen exposure.",
                    brandReferences: ""
                },
                {
                    name: "Basil",
                    swahiliName: "Mchicha / Basil",
                    preparation: "Chew 4-5 fresh basil leaves daily. Alternatively, steep fresh or dried basil leaves in hot water for 5-7 minutes to make tea. Basil has natural antihistamine and anti-inflammatory properties.",
                    dosage: "Chew 4-5 fresh leaves daily, or drink 1-2 cups of basil tea daily during allergy season.",
                    cautions: "Basil is generally very safe. In very large medicinal quantities, it may interact with blood-thinning medications. Avoid during pregnancy in large amounts.",
                    availability: "Fresh basil available in Kenyan supermarkets and vegetable markets. Can be grown easily at home in pots.",
                    brandReferences: ""
                }
            ],
            bestPractices: [
                "Keep windows closed during high-pollen or dusty days",
                "Use air purifiers if available in your home",
                "Dust your home regularly with a damp cloth (dry dusting spreads allergens)",
                "Wash bedding weekly in hot water to kill dust mites",
                "Shower and change clothes after being outdoors on dusty days",
                "Use dust-proof pillow and mattress covers",
                "Keep humidity low (30-50%) to prevent mold growth",
                "Avoid hanging laundry outside to dry on dusty/pollen-heavy days",
                "Wear a mask when outdoors on very dusty days or in polluted areas",
                "Keep pets out of bedrooms and off furniture"
            ],
            whenToSeeDoctor: "Consult a healthcare provider if allergies significantly impact your daily life, if over-the-counter and herbal remedies are not providing relief, if you develop wheezing or breathing difficulty (allergy-induced asthma), if sinus infections develop frequently, or if symptoms are getting progressively worse each year. An allergist can perform tests to identify specific triggers and recommend targeted treatment."
        },
        {
            name: "Bronchitis",
            keywords: ["bronchitis", "chest infection", "chest cold", "mucus in chest", "productive cough with chest pain", "bronchial inflammation", "hacking cough"],
            relatedKeywords: ["acute bronchitis", "chronic bronchitis", "chest congestion persistent"],
            severity: "moderate",
            description: "Bronchitis is inflammation of the bronchial tubes that carry air to the lungs. Acute bronchitis is usually caused by a viral infection and often follows a cold or flu. Chronic bronchitis is a more serious condition often caused by smoking. Symptoms include persistent cough (often with mucus), chest discomfort, fatigue, and sometimes mild fever. In Kenya, acute bronchitis is common during the cold season, while chronic bronchitis is seen more in smokers and people exposed to indoor air pollution from biomass fuels.",
            lifestyleFactors: ["smoking", "viral infection", "dust", "pollution", "indoor smoke", "weak immunity", "cold weather", "damp environments"],
            herbalRemedies: [
                {
                    name: "Oregano Oil",
                    swahiliName: "Mafuta ya oregano",
                    preparation: "Mix 3-5 drops of oregano oil with a teaspoon of carrier oil (coconut or olive oil). Take orally. For chest congestion: dilute oregano oil and apply to chest as a rub.",
                    dosage: "Take diluted oregano oil 2-3 times daily during acute bronchitis. Chest rub: apply once or twice daily. Do not exceed 7-10 days of use.",
                    cautions: "Oregano oil is very potent and MUST be diluted before ingestion. Can cause stomach upset. Not for pregnant or breastfeeding women. Not for children. May interact with blood-thinning and diabetes medications. People with allergies to mint family plants should avoid.",
                    availability: "Available in Kenyan health stores and online. Imported supplement.",
                    brandReferences: ""
                },
                {
                    name: "Garlic",
                    swahiliName: "Kitunguu saumu",
                    preparation: "Crush 3-4 garlic cloves and let stand 10 minutes. Add to hot water or soup. Raw garlic has strong antimicrobial properties that help fight bronchial infections.",
                    dosage: "3-4 raw garlic cloves daily. Can be added to food, soup, or taken with honey.",
                    cautions: "Raw garlic may cause stomach discomfort and heartburn. People on blood thinners should use cautiously. May interact with HIV medications.",
                    availability: "Everywhere in Kenya. Very cheap.",
                    brandReferences: ""
                },
                {
                    name: "Eucalyptus",
                    swahiliName: "Mti wa mafuta",
                    preparation: "Steam inhalation: Add 5-8 drops of eucalyptus oil to a bowl of hot water. Inhale steam for 10-15 minutes. For chest rub: Mix eucalyptus oil with coconut oil and rub on chest and throat.",
                    dosage: "Steam inhalation 2-3 times daily. Chest rub: Apply as needed, especially before bedtime.",
                    cautions: "Keep away from children under 6. People with asthma should use cautiously. Do not ingest eucalyptus oil. Dilute before applying to skin.",
                    availability: "Eucalyptus trees common in Kenya. Oil available in pharmacies.",
                    brandReferences: ""
                },
                {
                    name: "Honey and Cinnamon",
                    swahiliName: "Asali na mdalasini",
                    preparation: "Mix 1 tablespoon of raw honey with 1/2 teaspoon of cinnamon powder in warm water. Stir well and drink. This combination has antimicrobial and anti-inflammatory properties.",
                    dosage: "Drink 2-3 times daily during the bronchitis episode.",
                    cautions: "Use Ceylon cinnamon (true cinnamon) if possible - Cassia cinnamon contains coumarin which can be harmful in large doses. Not for children under 1 year (honey). Diabetics should monitor blood sugar.",
                    availability: "Both ingredients widely available in Kenyan markets.",
                    brandReferences: ""
                }
            ],
            bestPractices: [
                "Get plenty of rest - bronchitis often follows a cold and your body needs energy to heal",
                "Drink 8-10 glasses of warm fluids daily to thin mucus",
                "Use a humidifier or steam to keep airways moist",
                "Avoid smoking and all secondhand smoke completely",
                "Avoid irritants: dust, chemical fumes, cold air",
                "Sleep with head elevated to ease nighttime coughing",
                "Eat anti-inflammatory foods: fruits, vegetables, turmeric, ginger",
                "Warm compress on chest can help relieve discomfort",
                "Do not suppress productive coughs - the body needs to clear mucus",
                "Gradually return to normal activities as symptoms improve"
            ],
            whenToSeeDoctor: "Consult a healthcare provider if cough persists more than 3 weeks, if you cough up blood, if fever exceeds 38.3 degrees Celsius for more than 3 days, if there is severe chest pain, difficulty breathing, wheezing, if symptoms repeatedly come back, or if you have chronic bronchitis symptoms (daily cough for 3+ months, 2+ years in a row). In Kenya, persistent cough should also be evaluated for tuberculosis."
        }
    ]
};
