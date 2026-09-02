// The curated Fruit database -- replaces the old flat USDA SR Legacy /
// FNDDS fruit-category entries with a small, browsable set for the
// Category > Form > Fruit picker in screens/LogFoodScreen.js.
//
// `subcategory` is the FORM (fresh, dried, canned, or frozen) -- Damon's
// spec was Fruit > Form > specific fruit > variations, with Form as the
// first drill-down step (not an in-card toggle, unlike Poultry/Seafood's
// skin/bone toggles) and NO umbrella grouping categories like "Berries"
// or "Melons" -- every fruit is a flat sibling of every other fruit within
// its Form. `cut` is the specific fruit (apple, banana, cherries, ...) --
// see data/fruitHierarchy.js for the human-readable labels used to build
// the picker's screens. `variety` is optional and only set when real USDA
// cultivar/variety data exists for that fruit+form (e.g. Fuji/Gala/Granny
// Smith apples) -- it's informational only right now (not its own picker
// step; each variety just shows as its own row in the final flat list,
// the same way Red Meat's raw/cooked pairs of a single cut already do).
//
// Cherries: sweet Cherries and sour/Tart Cherries are kept as two entirely
// separate fruits (not a toggle, not a variety of one entry) -- Damon's
// call, since the two are nutritionally meaningfully different (63 kcal/
// 16g carbs per 100g for sweet vs. 50 kcal/12.2g carbs for tart, roughly a
// 20-25% difference) -- see BEEF_GRADE_FAT_RATIO-style precedent in
// data/meatHierarchy.js's header for this app's general "is the numeric
// difference big enough to matter" bar.
//
// Raisins, Prunes, and Currants are listed as their OWN fruits rather than
// nested as a "Dried" variation of Grapes/Plums -- that's how they're
// actually sold and searched for at a grocery store, even though
// botanically raisins are dried grapes and prunes are dried plums.
//
// Olives, though botanically a fruit, are never eaten raw -- every real
// row here is Canned (which covers the canned/jarred/pickled forms olives
// actually come in). Olives are NOT cross-listed onto the Vegetables tab
// (unlike the other dual-nature items below) because the Vegetables tab's
// existing flat list already independently carries its own Olive entries
// (foodsFNDDS3.js: olives_nfs/green/black/stuffed) -- cross-listing these
// too would just duplicate rows on that tab. That pre-existing duplication
// between the two datasets' Olive numbers is a pre-existing inconsistency
// this round didn't introduce and doesn't attempt to clean up (Vegetables'
// own overhaul is a later round, per Damon).
//
// Scope: this covers the ~40 most common grocery fruits with real USDA
// numbers for whichever Fresh/Dried/Canned/Frozen forms actually exist for
// each -- not the full USDA fruit catalog. Less common/exotic items USDA
// has data for (breadfruit, jackfruit, durian, jujube, longan, rambutan,
// sapodilla, soursop, and similar) and mixed/composite fruit products
// (fruit cocktail, fruit salad, candied fruit, and similar) were
// deliberately left out of this pass -- same 'curated common set now,
// obscure items later if wanted' trade this app already made for Red
// Meat/Poultry/Seafood, at Damon's explicit call ("do the most reasonable
// coverage of the most common grocery fruits").
//
// Avocado, Tomato, Bell/Sweet Peppers, Cucumber, Zucchini, Pumpkin, and
// Eggplant are NOT in this file -- they're real fruits botanically and get
// the same Form/Fruit treatment, but their underlying data rows already
// exist elsewhere (data/foods.js, data/foodsSRLegacy1.js) with a primary
// category of 'fruit' (Avocado) or 'vegetable' (the rest). Rather than
// duplicating those rows here, this app tags them in place with the same
// subcategory/cut fields plus a new crossListCategories field so they
// surface under BOTH the Fruit and Vegetables tabs from one underlying
// row -- see utils/nutrition.js's filterByCategory and each row's own
// comment for details.

const foodsFruit = [
  // --- Apple ---
  { id: 'fruit_apple_fresh_fuji', name: 'Apple, Fuji', category: 'fruit', subcategory: 'fresh', cut: 'apple', variety: 'Fuji', icon: '', servingType: 'weight', caloriesPer100g: 58, proteinPer100g: 0.1, carbsPer100g: 15.7, fatPer100g: 0.2, typicalGrams: 140 },
  { id: 'fruit_apple_fresh_gala', name: 'Apple, Gala', category: 'fruit', subcategory: 'fresh', cut: 'apple', variety: 'Gala', icon: '', servingType: 'weight', caloriesPer100g: 55, proteinPer100g: 0.1, carbsPer100g: 14.8, fatPer100g: 0.1, typicalGrams: 140 },
  { id: 'fruit_apple_fresh_granny_smith', name: 'Apple, Granny Smith', category: 'fruit', subcategory: 'fresh', cut: 'apple', variety: 'Granny Smith', icon: '', servingType: 'weight', caloriesPer100g: 53, proteinPer100g: 0.3, carbsPer100g: 14.1, fatPer100g: 0.1, typicalGrams: 140 },
  { id: 'fruit_apple_fresh_honeycrisp', name: 'Apple, Honeycrisp', category: 'fruit', subcategory: 'fresh', cut: 'apple', variety: 'Honeycrisp', icon: '', servingType: 'weight', caloriesPer100g: 54, proteinPer100g: 0.1, carbsPer100g: 14.7, fatPer100g: 0.1, typicalGrams: 140 },
  { id: 'fruit_apple_fresh_golden_delicious', name: 'Apple, Golden Delicious', category: 'fruit', subcategory: 'fresh', cut: 'apple', variety: 'Golden Delicious', icon: '', servingType: 'weight', caloriesPer100g: 57, proteinPer100g: 0.3, carbsPer100g: 13.6, fatPer100g: 0.1, typicalGrams: 215 },
  { id: 'fruit_apple_fresh_red_delicious', name: 'Apple, Red Delicious', category: 'fruit', subcategory: 'fresh', cut: 'apple', variety: 'Red Delicious', icon: '', servingType: 'weight', caloriesPer100g: 56, proteinPer100g: 0.2, carbsPer100g: 14.8, fatPer100g: 0.2, typicalGrams: 140 },
  { id: 'fruit_apple_fresh', name: 'Apple, Peeled (Without Skin)', category: 'fruit', subcategory: 'fresh', cut: 'apple', icon: '', servingType: 'weight', caloriesPer100g: 48, proteinPer100g: 0.3, carbsPer100g: 12.8, fatPer100g: 0.1, typicalGrams: 216 },
  { id: 'fruit_apple_dried', name: 'Apple (Dried)', category: 'fruit', subcategory: 'dried', cut: 'apple', icon: '', servingType: 'weight', caloriesPer100g: 243, proteinPer100g: 0.9, carbsPer100g: 65.9, fatPer100g: 0.3, typicalGrams: 86 },
  { id: 'fruit_apple_canned', name: 'Apple, Canned (Sweetened)', category: 'fruit', subcategory: 'canned', cut: 'apple', icon: '', servingType: 'weight', caloriesPer100g: 67, proteinPer100g: 0.2, carbsPer100g: 16.8, fatPer100g: 0.4, typicalGrams: 204 },
  { id: 'fruit_apple_frozen', name: 'Apple (Frozen, Unsweetened)', category: 'fruit', subcategory: 'frozen', cut: 'apple', icon: '', servingType: 'weight', caloriesPer100g: 48, proteinPer100g: 0.3, carbsPer100g: 12.3, fatPer100g: 0.3, typicalGrams: 173 },
  // --- Pear ---
  { id: 'fruit_pear_fresh_bartlett', name: 'Pear, Bartlett', category: 'fruit', subcategory: 'fresh', cut: 'pear', variety: 'Bartlett', icon: '', servingType: 'weight', caloriesPer100g: 57, proteinPer100g: 0.4, carbsPer100g: 15.1, fatPer100g: 0.2, typicalGrams: 140 },
  { id: 'fruit_pear_fresh_bosc', name: 'Pear, Bosc', category: 'fruit', subcategory: 'fresh', cut: 'pear', variety: 'Bosc', icon: '', servingType: 'weight', caloriesPer100g: 67, proteinPer100g: 0.4, carbsPer100g: 16.1, fatPer100g: 0.1, typicalGrams: 219 },
  { id: 'fruit_pear_fresh_red_anjou', name: 'Pear, Red Anjou', category: 'fruit', subcategory: 'fresh', cut: 'pear', variety: 'Red Anjou', icon: '', servingType: 'weight', caloriesPer100g: 62, proteinPer100g: 0.3, carbsPer100g: 14.9, fatPer100g: 0.1, typicalGrams: 126 },
  { id: 'fruit_pear_fresh_green_anjou', name: 'Pear, Green Anjou', category: 'fruit', subcategory: 'fresh', cut: 'pear', variety: 'Green Anjou', icon: '', servingType: 'weight', caloriesPer100g: 66, proteinPer100g: 0.4, carbsPer100g: 15.8, fatPer100g: 0.1, typicalGrams: 140 },
  { id: 'fruit_pear_fresh_asian', name: 'Pear, Asian', category: 'fruit', subcategory: 'fresh', cut: 'pear', variety: 'Asian', icon: '', servingType: 'weight', caloriesPer100g: 42, proteinPer100g: 0.5, carbsPer100g: 10.6, fatPer100g: 0.2, typicalGrams: 275 },
  { id: 'fruit_pear_fresh', name: 'Pear', category: 'fruit', subcategory: 'fresh', cut: 'pear', icon: '', servingType: 'weight', caloriesPer100g: 57, proteinPer100g: 0.4, carbsPer100g: 15.2, fatPer100g: 0.1, typicalGrams: 178 },
  { id: 'fruit_pear_dried', name: 'Pear (Dried)', category: 'fruit', subcategory: 'dried', cut: 'pear', icon: '', servingType: 'weight', caloriesPer100g: 262, proteinPer100g: 1.9, carbsPer100g: 69.7, fatPer100g: 0.6, typicalGrams: 175 },
  { id: 'fruit_pear_canned', name: 'Pear, Canned (Light Syrup)', category: 'fruit', subcategory: 'canned', cut: 'pear', icon: '', servingType: 'weight', caloriesPer100g: 57, proteinPer100g: 0.2, carbsPer100g: 15.2, fatPer100g: 0, typicalGrams: 76 },
  // --- Banana ---
  { id: 'fruit_banana_fresh', name: 'Banana', category: 'fruit', subcategory: 'fresh', cut: 'banana', icon: '', servingType: 'weight', caloriesPer100g: 97, proteinPer100g: 0.7, carbsPer100g: 22.7, fatPer100g: 0.3, typicalGrams: 225 },
  { id: 'fruit_banana_dried', name: 'Banana (Dried / Powder)', category: 'fruit', subcategory: 'dried', cut: 'banana', icon: '', servingType: 'weight', caloriesPer100g: 346, proteinPer100g: 3.9, carbsPer100g: 88.3, fatPer100g: 1.8, typicalGrams: 6 },
  // --- Grapes ---
  { id: 'fruit_grapes_fresh_red_seedless', name: 'Grapes, Red Seedless', category: 'fruit', subcategory: 'fresh', cut: 'grapes', variety: 'Red Seedless', icon: '', servingType: 'weight', caloriesPer100g: 77, proteinPer100g: 0.9, carbsPer100g: 20.2, fatPer100g: 0.2, typicalGrams: 140 },
  { id: 'fruit_grapes_fresh_green_seedless', name: 'Grapes, Green Seedless', category: 'fruit', subcategory: 'fresh', cut: 'grapes', variety: 'Green Seedless', icon: '', servingType: 'weight', caloriesPer100g: 72, proteinPer100g: 0.9, carbsPer100g: 18.6, fatPer100g: 0.2, typicalGrams: 140 },
  { id: 'fruit_grapes_fresh_concord_american_type', name: 'Grapes, Concord (American Type)', category: 'fruit', subcategory: 'fresh', cut: 'grapes', variety: 'Concord / American Type', icon: '', servingType: 'weight', caloriesPer100g: 67, proteinPer100g: 0.6, carbsPer100g: 17.2, fatPer100g: 0.3, typicalGrams: 92 },
  { id: 'fruit_grapes_canned', name: 'Grapes, Canned (Thompson Seedless)', category: 'fruit', subcategory: 'canned', cut: 'grapes', icon: '', servingType: 'weight', caloriesPer100g: 40, proteinPer100g: 0.5, carbsPer100g: 10.3, fatPer100g: 0.1, typicalGrams: 245 },
  // --- Raisins ---
  { id: 'fruit_raisins_dried', name: 'Raisins', category: 'fruit', subcategory: 'dried', cut: 'raisins', icon: '', servingType: 'weight', caloriesPer100g: 299, proteinPer100g: 3.3, carbsPer100g: 79.3, fatPer100g: 0.2, typicalGrams: 160 },
  { id: 'fruit_raisins_dried_golden_seedless', name: 'Raisins, Golden Seedless', category: 'fruit', subcategory: 'dried', cut: 'raisins', variety: 'Golden Seedless', icon: '', servingType: 'weight', caloriesPer100g: 301, proteinPer100g: 3.3, carbsPer100g: 80, fatPer100g: 0.2, typicalGrams: 145 },
  // --- Peach ---
  { id: 'fruit_peach_fresh', name: 'Peach', category: 'fruit', subcategory: 'fresh', cut: 'peach', icon: '', servingType: 'weight', caloriesPer100g: 42, proteinPer100g: 0.9, carbsPer100g: 10.1, fatPer100g: 0.3, typicalGrams: 140 },
  { id: 'fruit_peach_dried', name: 'Peach (Dried)', category: 'fruit', subcategory: 'dried', cut: 'peach', icon: '', servingType: 'weight', caloriesPer100g: 239, proteinPer100g: 3.6, carbsPer100g: 61.3, fatPer100g: 0.8, typicalGrams: 160 },
  { id: 'fruit_peach_canned', name: 'Peach, Canned (Heavy Syrup)', category: 'fruit', subcategory: 'canned', cut: 'peach', icon: '', servingType: 'weight', caloriesPer100g: 74, proteinPer100g: 0.5, carbsPer100g: 19.9, fatPer100g: 0.1, typicalGrams: 98 },
  { id: 'fruit_peach_frozen', name: 'Peach (Frozen, Sliced, Sweetened)', category: 'fruit', subcategory: 'frozen', cut: 'peach', icon: '', servingType: 'weight', caloriesPer100g: 94, proteinPer100g: 0.6, carbsPer100g: 24, fatPer100g: 0.1, typicalGrams: 250 },
  // --- Nectarine ---
  { id: 'fruit_nectarine_fresh', name: 'Nectarine', category: 'fruit', subcategory: 'fresh', cut: 'nectarine', icon: '', servingType: 'weight', caloriesPer100g: 39, proteinPer100g: 1.1, carbsPer100g: 9.2, fatPer100g: 0.3, typicalGrams: 140 },
  // --- Apricot ---
  { id: 'fruit_apricot_fresh', name: 'Apricot', category: 'fruit', subcategory: 'fresh', cut: 'apricot', icon: '', servingType: 'weight', caloriesPer100g: 48, proteinPer100g: 1.4, carbsPer100g: 11.1, fatPer100g: 0.4, typicalGrams: 35 },
  { id: 'fruit_apricot_dried', name: 'Apricot (Dried)', category: 'fruit', subcategory: 'dried', cut: 'apricot', icon: '', servingType: 'weight', caloriesPer100g: 241, proteinPer100g: 3.4, carbsPer100g: 62.6, fatPer100g: 0.5, typicalGrams: 130 },
  { id: 'fruit_apricot_canned', name: 'Apricot, Canned (Heavy Syrup)', category: 'fruit', subcategory: 'canned', cut: 'apricot', icon: '', servingType: 'weight', caloriesPer100g: 83, proteinPer100g: 0.5, carbsPer100g: 21.5, fatPer100g: 0.1, typicalGrams: 40 },
  // --- Plum ---
  { id: 'fruit_plum_fresh', name: 'Plum', category: 'fruit', subcategory: 'fresh', cut: 'plum', icon: '', servingType: 'weight', caloriesPer100g: 46, proteinPer100g: 0.7, carbsPer100g: 11.4, fatPer100g: 0.3, typicalGrams: 155 },
  { id: 'fruit_plum_canned', name: 'Plum, Canned (Heavy Syrup)', category: 'fruit', subcategory: 'canned', cut: 'plum', icon: '', servingType: 'weight', caloriesPer100g: 89, proteinPer100g: 0.4, carbsPer100g: 23.2, fatPer100g: 0.1, typicalGrams: 258 },
  // --- Prunes ---
  { id: 'fruit_prunes_dried', name: 'Prunes', category: 'fruit', subcategory: 'dried', cut: 'prunes', icon: '', servingType: 'weight', caloriesPer100g: 240, proteinPer100g: 2.2, carbsPer100g: 63.9, fatPer100g: 0.4, typicalGrams: 8 },
  // --- Cherries ---
  { id: 'fruit_cherries_fresh', name: 'Cherries', category: 'fruit', subcategory: 'fresh', cut: 'cherries', icon: '', servingType: 'weight', caloriesPer100g: 63, proteinPer100g: 1.1, carbsPer100g: 16, fatPer100g: 0.2, typicalGrams: 154 },
  { id: 'fruit_cherries_dried', name: 'Cherries (Dried)', category: 'fruit', subcategory: 'dried', cut: 'cherries', icon: '', servingType: 'weight', caloriesPer100g: 333, proteinPer100g: 1.2, carbsPer100g: 80.4, fatPer100g: 0.7, typicalGrams: 160 },
  { id: 'fruit_cherries_canned', name: 'Cherries, Canned (Pitted, Heavy Syrup)', category: 'fruit', subcategory: 'canned', cut: 'cherries', icon: '', servingType: 'weight', caloriesPer100g: 83, proteinPer100g: 0.6, carbsPer100g: 21.3, fatPer100g: 0.1, typicalGrams: 253 },
  { id: 'fruit_cherries_frozen', name: 'Cherries (Frozen)', category: 'fruit', subcategory: 'frozen', cut: 'cherries', icon: '', servingType: 'weight', caloriesPer100g: 71, proteinPer100g: 1, carbsPer100g: 16.2, fatPer100g: 0.2, typicalGrams: 75 },
  // --- Tart Cherries ---
  { id: 'fruit_tart_cherries_fresh', name: 'Tart Cherries', category: 'fruit', subcategory: 'fresh', cut: 'tart_cherries', icon: '', servingType: 'weight', caloriesPer100g: 50, proteinPer100g: 1, carbsPer100g: 12.2, fatPer100g: 0.3, typicalGrams: 155 },
  { id: 'fruit_tart_cherries_dried', name: 'Tart Cherries (Dried, Sweetened)', category: 'fruit', subcategory: 'dried', cut: 'tart_cherries', icon: '', servingType: 'weight', caloriesPer100g: 333, proteinPer100g: 1.2, carbsPer100g: 80.4, fatPer100g: 0.7, typicalGrams: 40 },
  { id: 'fruit_tart_cherries_canned', name: 'Tart Cherries, Canned (Heavy Syrup)', category: 'fruit', subcategory: 'canned', cut: 'tart_cherries', icon: '', servingType: 'weight', caloriesPer100g: 91, proteinPer100g: 0.7, carbsPer100g: 23.3, fatPer100g: 0.1, typicalGrams: 256 },
  { id: 'fruit_tart_cherries_frozen', name: 'Tart Cherries (Frozen, Unsweetened)', category: 'fruit', subcategory: 'frozen', cut: 'tart_cherries', icon: '', servingType: 'weight', caloriesPer100g: 46, proteinPer100g: 0.9, carbsPer100g: 11, fatPer100g: 0.4, typicalGrams: 510 },
  // --- Orange ---
  { id: 'fruit_orange_fresh', name: 'Orange', category: 'fruit', subcategory: 'fresh', cut: 'orange', icon: '', servingType: 'weight', caloriesPer100g: 47, proteinPer100g: 0.9, carbsPer100g: 11.8, fatPer100g: 0.1, typicalGrams: 96 },
  { id: 'fruit_orange_fresh_valencia', name: 'Orange, Valencia', category: 'fruit', subcategory: 'fresh', cut: 'orange', variety: 'Valencia', icon: '', servingType: 'weight', caloriesPer100g: 49, proteinPer100g: 1, carbsPer100g: 11.9, fatPer100g: 0.3, typicalGrams: 180 },
  { id: 'fruit_orange_fresh_navel', name: 'Orange, Navel', category: 'fruit', subcategory: 'fresh', cut: 'orange', variety: 'Navel', icon: '', servingType: 'weight', caloriesPer100g: 49, proteinPer100g: 0.9, carbsPer100g: 12.5, fatPer100g: 0.1, typicalGrams: 165 },
  { id: 'fruit_orange_canned', name: 'Orange, Canned', category: 'fruit', subcategory: 'canned', cut: 'orange', icon: '', servingType: 'weight', caloriesPer100g: 46, proteinPer100g: 0.6, carbsPer100g: 11.8, fatPer100g: 0, typicalGrams: 113 },
  // --- Tangerine ---
  { id: 'fruit_tangerine_fresh', name: 'Tangerine', category: 'fruit', subcategory: 'fresh', cut: 'tangerine', icon: '', servingType: 'weight', caloriesPer100g: 53, proteinPer100g: 0.8, carbsPer100g: 13.3, fatPer100g: 0.3, typicalGrams: 109 },
  { id: 'fruit_tangerine_fresh_clementine', name: 'Clementine', category: 'fruit', subcategory: 'fresh', cut: 'tangerine', variety: 'Clementine', icon: '', servingType: 'weight', caloriesPer100g: 53, proteinPer100g: 0.8, carbsPer100g: 13.3, fatPer100g: 0.3, typicalGrams: 85 },
  { id: 'fruit_tangerine_canned', name: 'Tangerine, Canned (Mandarin, Light Syrup)', category: 'fruit', subcategory: 'canned', cut: 'tangerine', icon: '', servingType: 'weight', caloriesPer100g: 61, proteinPer100g: 0.5, carbsPer100g: 16.2, fatPer100g: 0.1, typicalGrams: 252 },
  // --- Grapefruit ---
  { id: 'fruit_grapefruit_fresh_pink_red', name: 'Grapefruit, Pink / Red', category: 'fruit', subcategory: 'fresh', cut: 'grapefruit', variety: 'Pink / Red', icon: '', servingType: 'weight', caloriesPer100g: 42, proteinPer100g: 0.8, carbsPer100g: 10.7, fatPer100g: 0.1, typicalGrams: 230 },
  { id: 'fruit_grapefruit_fresh_white', name: 'Grapefruit, White', category: 'fruit', subcategory: 'fresh', cut: 'grapefruit', variety: 'White', icon: '', servingType: 'weight', caloriesPer100g: 33, proteinPer100g: 0.7, carbsPer100g: 8.4, fatPer100g: 0.1, typicalGrams: 118 },
  { id: 'fruit_grapefruit_canned', name: 'Grapefruit, Canned (Sections, Light Syrup)', category: 'fruit', subcategory: 'canned', cut: 'grapefruit', icon: '', servingType: 'weight', caloriesPer100g: 60, proteinPer100g: 0.6, carbsPer100g: 15.4, fatPer100g: 0.1, typicalGrams: 254 },
  // --- Lemon ---
  // typicalGrams here is the real USDA value for this entry, but it reads as
  // a small reference portion (closer to a wedge/tsp of juice) rather than
  // "one whole lemon" (~58-70g) -- no better real per-lemon figure exists
  // anywhere in this app's USDA data, so rather than invent one, this is
  // left as the sourced number. Just means the grams field is worth
  // adjusting up before tapping Add for a whole fresh lemon.
  { id: 'fruit_lemon_fresh', name: 'Lemon', category: 'fruit', subcategory: 'fresh', cut: 'lemon', icon: '', servingType: 'weight', caloriesPer100g: 29, proteinPer100g: 1.1, carbsPer100g: 9.3, fatPer100g: 0.3, typicalGrams: 8 },
  // --- Lime ---
  { id: 'fruit_lime_fresh', name: 'Lime', category: 'fruit', subcategory: 'fresh', cut: 'lime', icon: '', servingType: 'weight', caloriesPer100g: 30, proteinPer100g: 0.7, carbsPer100g: 10.5, fatPer100g: 0.2, typicalGrams: 67 },
  // --- Strawberries ---
  { id: 'fruit_strawberry_fresh', name: 'Strawberries', category: 'fruit', subcategory: 'fresh', cut: 'strawberry', icon: '', servingType: 'weight', caloriesPer100g: 32, proteinPer100g: 0.7, carbsPer100g: 7.7, fatPer100g: 0.3, typicalGrams: 232 },
  { id: 'fruit_strawberry_frozen_unsweetened', name: 'Strawberries (Frozen, Unsweetened)', category: 'fruit', subcategory: 'frozen', cut: 'strawberry', variety: 'Unsweetened', icon: '', servingType: 'weight', caloriesPer100g: 35, proteinPer100g: 0.4, carbsPer100g: 9.1, fatPer100g: 0.1, typicalGrams: 149 },
  { id: 'fruit_strawberry_frozen_sweetened_sliced', name: 'Strawberries (Frozen, Sweetened, Sliced)', category: 'fruit', subcategory: 'frozen', cut: 'strawberry', variety: 'Sweetened, Sliced', icon: '', servingType: 'weight', caloriesPer100g: 96, proteinPer100g: 0.5, carbsPer100g: 25.9, fatPer100g: 0.1, typicalGrams: 255 },
  { id: 'fruit_strawberry_canned', name: 'Strawberries, Canned (Heavy Syrup)', category: 'fruit', subcategory: 'canned', cut: 'strawberry', icon: '', servingType: 'weight', caloriesPer100g: 92, proteinPer100g: 0.6, carbsPer100g: 23.5, fatPer100g: 0.3, typicalGrams: 254 },
  // --- Blueberries ---
  { id: 'fruit_blueberry_fresh', name: 'Blueberries', category: 'fruit', subcategory: 'fresh', cut: 'blueberry', icon: '', servingType: 'weight', caloriesPer100g: 57, proteinPer100g: 0.7, carbsPer100g: 14.5, fatPer100g: 0.3, typicalGrams: 148 },
  { id: 'fruit_blueberry_dried', name: 'Blueberries (Dried, Sweetened)', category: 'fruit', subcategory: 'dried', cut: 'blueberry', icon: '', servingType: 'weight', caloriesPer100g: 317, proteinPer100g: 2.5, carbsPer100g: 80, fatPer100g: 2.5, typicalGrams: 40 },
  { id: 'fruit_blueberry_frozen', name: 'Blueberries (Frozen)', category: 'fruit', subcategory: 'frozen', cut: 'blueberry', icon: '', servingType: 'weight', caloriesPer100g: 51, proteinPer100g: 0.4, carbsPer100g: 12.2, fatPer100g: 0.6, typicalGrams: 150 },
  { id: 'fruit_blueberry_canned', name: 'Blueberries, Canned (Heavy Syrup)', category: 'fruit', subcategory: 'canned', cut: 'blueberry', icon: '', servingType: 'weight', caloriesPer100g: 88, proteinPer100g: 0.7, carbsPer100g: 22.1, fatPer100g: 0.3, typicalGrams: 256 },
  // --- Raspberries ---
  { id: 'fruit_raspberry_fresh', name: 'Raspberries', category: 'fruit', subcategory: 'fresh', cut: 'raspberry', icon: '', servingType: 'weight', caloriesPer100g: 51, proteinPer100g: 1, carbsPer100g: 12.9, fatPer100g: 0.2, typicalGrams: 140 },
  { id: 'fruit_raspberry_frozen', name: 'Raspberries (Frozen, Unsweetened)', category: 'fruit', subcategory: 'frozen', cut: 'raspberry', icon: '', servingType: 'weight', caloriesPer100g: 56, proteinPer100g: 1.1, carbsPer100g: 12.6, fatPer100g: 0.8, typicalGrams: 140 },
  { id: 'fruit_raspberry_canned', name: 'Raspberries, Canned (Heavy Syrup)', category: 'fruit', subcategory: 'canned', cut: 'raspberry', icon: '', servingType: 'weight', caloriesPer100g: 91, proteinPer100g: 0.8, carbsPer100g: 23.4, fatPer100g: 0.1, typicalGrams: 256 },
  // --- Blackberries ---
  { id: 'fruit_blackberry_fresh', name: 'Blackberries', category: 'fruit', subcategory: 'fresh', cut: 'blackberry', icon: '', servingType: 'weight', caloriesPer100g: 43, proteinPer100g: 1.4, carbsPer100g: 9.6, fatPer100g: 0.5, typicalGrams: 144 },
  { id: 'fruit_blackberry_frozen', name: 'Blackberries (Frozen)', category: 'fruit', subcategory: 'frozen', cut: 'blackberry', icon: '', servingType: 'weight', caloriesPer100g: 64, proteinPer100g: 1.2, carbsPer100g: 15.7, fatPer100g: 0.4, typicalGrams: 75 },
  { id: 'fruit_blackberry_canned', name: 'Blackberries, Canned (Heavy Syrup)', category: 'fruit', subcategory: 'canned', cut: 'blackberry', icon: '', servingType: 'weight', caloriesPer100g: 92, proteinPer100g: 1.3, carbsPer100g: 23.1, fatPer100g: 0.1, typicalGrams: 256 },
  // --- Cranberries ---
  { id: 'fruit_cranberry_fresh', name: 'Cranberries', category: 'fruit', subcategory: 'fresh', cut: 'cranberry', icon: '', servingType: 'weight', caloriesPer100g: 46, proteinPer100g: 0.5, carbsPer100g: 12, fatPer100g: 0.1, typicalGrams: 110 },
  { id: 'fruit_cranberry_dried', name: 'Cranberries (Dried, Sweetened)', category: 'fruit', subcategory: 'dried', cut: 'cranberry', icon: '', servingType: 'weight', caloriesPer100g: 308, proteinPer100g: 0.2, carbsPer100g: 82.8, fatPer100g: 1.1, typicalGrams: 40 },
  { id: 'fruit_cranberry_canned', name: 'Cranberry Sauce, Canned (Sweetened)', category: 'fruit', subcategory: 'canned', cut: 'cranberry', icon: '', servingType: 'weight', caloriesPer100g: 159, proteinPer100g: 0.9, carbsPer100g: 40.4, fatPer100g: 0.1, typicalGrams: 57 },
  // --- Currants ---
  { id: 'fruit_currants_fresh_black', name: 'Currants, Black', category: 'fruit', subcategory: 'fresh', cut: 'currants', variety: 'Black', icon: '', servingType: 'weight', caloriesPer100g: 63, proteinPer100g: 1.4, carbsPer100g: 15.4, fatPer100g: 0.4, typicalGrams: 112 },
  { id: 'fruit_currants_fresh_red_white', name: 'Currants, Red & White', category: 'fruit', subcategory: 'fresh', cut: 'currants', variety: 'Red & White', icon: '', servingType: 'weight', caloriesPer100g: 56, proteinPer100g: 1.4, carbsPer100g: 13.8, fatPer100g: 0.2, typicalGrams: 112 },
  { id: 'fruit_currants_dried_zante', name: 'Currants, Dried (Zante)', category: 'fruit', subcategory: 'dried', cut: 'currants', variety: 'Zante', icon: '', servingType: 'weight', caloriesPer100g: 290, proteinPer100g: 3.4, carbsPer100g: 77, fatPer100g: 0.2, typicalGrams: 144 },
  // --- Watermelon ---
  { id: 'fruit_watermelon_fresh', name: 'Watermelon', category: 'fruit', subcategory: 'fresh', cut: 'watermelon', icon: '', servingType: 'weight', caloriesPer100g: 30, proteinPer100g: 0.6, carbsPer100g: 7.5, fatPer100g: 0.1, typicalGrams: 280 },
  // --- Cantaloupe ---
  { id: 'fruit_cantaloupe_fresh', name: 'Cantaloupe', category: 'fruit', subcategory: 'fresh', cut: 'cantaloupe', icon: '', servingType: 'weight', caloriesPer100g: 34, proteinPer100g: 0.8, carbsPer100g: 8.2, fatPer100g: 0.2, typicalGrams: 140 },
  // --- Honeydew Melon ---
  { id: 'fruit_honeydew_fresh', name: 'Honeydew Melon', category: 'fruit', subcategory: 'fresh', cut: 'honeydew', icon: '', servingType: 'weight', caloriesPer100g: 36, proteinPer100g: 0.5, carbsPer100g: 9.1, fatPer100g: 0.1, typicalGrams: 155 },
  // --- Pineapple ---
  { id: 'fruit_pineapple_fresh', name: 'Pineapple', category: 'fruit', subcategory: 'fresh', cut: 'pineapple', icon: '', servingType: 'weight', caloriesPer100g: 50, proteinPer100g: 0.5, carbsPer100g: 13.1, fatPer100g: 0.1, typicalGrams: 56 },
  { id: 'fruit_pineapple_dried', name: 'Pineapple (Dried)', category: 'fruit', subcategory: 'dried', cut: 'pineapple', icon: '', servingType: 'weight', caloriesPer100g: 347, proteinPer100g: 1.2, carbsPer100g: 84.1, fatPer100g: 0.7, typicalGrams: 160 },
  { id: 'fruit_pineapple_canned', name: 'Pineapple, Canned (Heavy Syrup)', category: 'fruit', subcategory: 'canned', cut: 'pineapple', icon: '', servingType: 'weight', caloriesPer100g: 78, proteinPer100g: 0.3, carbsPer100g: 20.2, fatPer100g: 0.1, typicalGrams: 254 },
  { id: 'fruit_pineapple_frozen', name: 'Pineapple (Frozen, Sweetened Chunks)', category: 'fruit', subcategory: 'frozen', cut: 'pineapple', icon: '', servingType: 'weight', caloriesPer100g: 86, proteinPer100g: 0.4, carbsPer100g: 22.2, fatPer100g: 0.1, typicalGrams: 245 },
  // --- Mango ---
  { id: 'fruit_mango_fresh', name: 'Mango', category: 'fruit', subcategory: 'fresh', cut: 'mango', icon: '', servingType: 'weight', caloriesPer100g: 60, proteinPer100g: 0.8, carbsPer100g: 15, fatPer100g: 0.4, typicalGrams: 210 },
  { id: 'fruit_mango_fresh_ataulfo', name: 'Mango, Ataulfo', category: 'fruit', subcategory: 'fresh', cut: 'mango', variety: 'Ataulfo', icon: '', servingType: 'weight', caloriesPer100g: 71, proteinPer100g: 0.7, carbsPer100g: 17.4, fatPer100g: 0.7, typicalGrams: 140 },
  { id: 'fruit_mango_fresh_tommy_atkins', name: 'Mango, Tommy Atkins', category: 'fruit', subcategory: 'fresh', cut: 'mango', variety: 'Tommy Atkins', icon: '', servingType: 'weight', caloriesPer100g: 62, proteinPer100g: 0.6, carbsPer100g: 15.3, fatPer100g: 0.6, typicalGrams: 140 },
  { id: 'fruit_mango_dried', name: 'Mango (Dried, Sweetened)', category: 'fruit', subcategory: 'dried', cut: 'mango', icon: '', servingType: 'weight', caloriesPer100g: 319, proteinPer100g: 2.5, carbsPer100g: 78.6, fatPer100g: 1.2, typicalGrams: 100 },
  { id: 'fruit_mango_canned', name: 'Mango, Canned', category: 'fruit', subcategory: 'canned', cut: 'mango', icon: '', servingType: 'weight', caloriesPer100g: 65, proteinPer100g: 0.6, carbsPer100g: 16.2, fatPer100g: 0.3, typicalGrams: 250 },
  { id: 'fruit_mango_frozen', name: 'Mango (Frozen)', category: 'fruit', subcategory: 'frozen', cut: 'mango', icon: '', servingType: 'weight', caloriesPer100g: 60, proteinPer100g: 0.8, carbsPer100g: 15, fatPer100g: 0.4, typicalGrams: 25 },
  // --- Papaya ---
  { id: 'fruit_papaya_fresh', name: 'Papaya', category: 'fruit', subcategory: 'fresh', cut: 'papaya', icon: '', servingType: 'weight', caloriesPer100g: 43, proteinPer100g: 0.5, carbsPer100g: 10.8, fatPer100g: 0.3, typicalGrams: 230 },
  { id: 'fruit_papaya_dried', name: 'Papaya (Dried)', category: 'fruit', subcategory: 'dried', cut: 'papaya', icon: '', servingType: 'weight', caloriesPer100g: 302, proteinPer100g: 1.2, carbsPer100g: 75.4, fatPer100g: 0.8, typicalGrams: 40 },
  { id: 'fruit_papaya_canned', name: 'Papaya, Canned (Heavy Syrup, Drained)', category: 'fruit', subcategory: 'canned', cut: 'papaya', icon: '', servingType: 'weight', caloriesPer100g: 206, proteinPer100g: 0.1, carbsPer100g: 55.8, fatPer100g: 0.6, typicalGrams: 39 },
  // --- Kiwi ---
  { id: 'fruit_kiwi_fresh_green', name: 'Kiwi, Green', category: 'fruit', subcategory: 'fresh', cut: 'kiwi', variety: 'Green', icon: '', servingType: 'weight', caloriesPer100g: 58, proteinPer100g: 1.1, carbsPer100g: 14, fatPer100g: 0.4, typicalGrams: 140 },
  { id: 'fruit_kiwi_fresh_gold_sungold', name: 'Kiwi, Gold (SunGold)', category: 'fruit', subcategory: 'fresh', cut: 'kiwi', variety: 'Gold (SunGold)', icon: '', servingType: 'weight', caloriesPer100g: 63, proteinPer100g: 1, carbsPer100g: 15.8, fatPer100g: 0.3, typicalGrams: 81 },
  // --- Pomegranate ---
  { id: 'fruit_pomegranate_fresh', name: 'Pomegranate', category: 'fruit', subcategory: 'fresh', cut: 'pomegranate', icon: '', servingType: 'weight', caloriesPer100g: 83, proteinPer100g: 1.7, carbsPer100g: 18.7, fatPer100g: 1.2, typicalGrams: 250 },
  // --- Guava ---
  { id: 'fruit_guava_fresh_common', name: 'Guava, Common', category: 'fruit', subcategory: 'fresh', cut: 'guava', variety: 'Common', icon: '', servingType: 'weight', caloriesPer100g: 68, proteinPer100g: 2.5, carbsPer100g: 14.3, fatPer100g: 0.9, typicalGrams: 55 },
  { id: 'fruit_guava_fresh_strawberry_guava', name: 'Guava, Strawberry Guava', category: 'fruit', subcategory: 'fresh', cut: 'guava', variety: 'Strawberry Guava', icon: '', servingType: 'weight', caloriesPer100g: 69, proteinPer100g: 0.6, carbsPer100g: 17.4, fatPer100g: 0.6, typicalGrams: 244 },
  // --- Figs ---
  { id: 'fruit_fig_fresh', name: 'Figs', category: 'fruit', subcategory: 'fresh', cut: 'fig', icon: '', servingType: 'weight', caloriesPer100g: 74, proteinPer100g: 0.8, carbsPer100g: 19.2, fatPer100g: 0.3, typicalGrams: 50 },
  { id: 'fruit_fig_dried', name: 'Figs (Dried)', category: 'fruit', subcategory: 'dried', cut: 'fig', icon: '', servingType: 'weight', caloriesPer100g: 249, proteinPer100g: 3.3, carbsPer100g: 63.9, fatPer100g: 0.9, typicalGrams: 140 },
  { id: 'fruit_fig_canned', name: 'Figs, Canned (Heavy Syrup)', category: 'fruit', subcategory: 'canned', cut: 'fig', icon: '', servingType: 'weight', caloriesPer100g: 88, proteinPer100g: 0.4, carbsPer100g: 22.9, fatPer100g: 0.1, typicalGrams: 259 },
  // --- Dates ---
  { id: 'fruit_dates_dried_deglet_noor', name: 'Dates, Deglet Noor', category: 'fruit', subcategory: 'dried', cut: 'dates', variety: 'Deglet Noor', icon: '', servingType: 'weight', caloriesPer100g: 282, proteinPer100g: 2.5, carbsPer100g: 75, fatPer100g: 0.4, typicalGrams: 147 },
  { id: 'fruit_dates_dried_medjool', name: 'Dates, Medjool', category: 'fruit', subcategory: 'dried', cut: 'dates', variety: 'Medjool', icon: '', servingType: 'weight', caloriesPer100g: 277, proteinPer100g: 1.8, carbsPer100g: 75, fatPer100g: 0.1, typicalGrams: 24 },
  // --- Plantain ---
  { id: 'fruit_plantain_fresh_green', name: 'Plantain, Green', category: 'fruit', subcategory: 'fresh', cut: 'plantain', variety: 'Green', icon: '', servingType: 'weight', caloriesPer100g: 152, proteinPer100g: 1.2, carbsPer100g: 36.7, fatPer100g: 0.1, typicalGrams: 267 },
  { id: 'fruit_plantain_fresh_yellow_ripe', name: 'Plantain, Yellow (Ripe)', category: 'fruit', subcategory: 'fresh', cut: 'plantain', variety: 'Yellow (Ripe)', icon: '', servingType: 'weight', caloriesPer100g: 122, proteinPer100g: 1.3, carbsPer100g: 31.9, fatPer100g: 0.3, typicalGrams: 270 },
  // --- Passion Fruit ---
  { id: 'fruit_passion_fruit_fresh', name: 'Passion Fruit', category: 'fruit', subcategory: 'fresh', cut: 'passion_fruit', icon: '', servingType: 'weight', caloriesPer100g: 97, proteinPer100g: 2.2, carbsPer100g: 23.4, fatPer100g: 0.7, typicalGrams: 118 },
  // --- Dragon Fruit ---
  { id: 'fruit_dragon_fruit_fresh', name: 'Dragon Fruit', category: 'fruit', subcategory: 'fresh', cut: 'dragon_fruit', icon: '', servingType: 'weight', caloriesPer100g: 68, proteinPer100g: 0.7, carbsPer100g: 16.2, fatPer100g: 0.2, typicalGrams: 75 },
  // --- Lychee ---
  { id: 'fruit_lychee_fresh', name: 'Lychee', category: 'fruit', subcategory: 'fresh', cut: 'lychee', icon: '', servingType: 'weight', caloriesPer100g: 66, proteinPer100g: 0.8, carbsPer100g: 16.5, fatPer100g: 0.4, typicalGrams: 190 },
  { id: 'fruit_lychee_dried', name: 'Lychee (Dried)', category: 'fruit', subcategory: 'dried', cut: 'lychee', icon: '', servingType: 'weight', caloriesPer100g: 277, proteinPer100g: 3.8, carbsPer100g: 70.7, fatPer100g: 1.2, typicalGrams: 100 },
  // --- Persimmon ---
  { id: 'fruit_persimmon_fresh', name: 'Persimmon', category: 'fruit', subcategory: 'fresh', cut: 'persimmon', icon: '', servingType: 'weight', caloriesPer100g: 70, proteinPer100g: 0.6, carbsPer100g: 18.6, fatPer100g: 0.2, typicalGrams: 168 },
  { id: 'fruit_persimmon_dried', name: 'Persimmon (Dried)', category: 'fruit', subcategory: 'dried', cut: 'persimmon', icon: '', servingType: 'weight', caloriesPer100g: 274, proteinPer100g: 1.4, carbsPer100g: 73.4, fatPer100g: 0.6, typicalGrams: 34 },
  // --- Starfruit ---
  { id: 'fruit_starfruit_fresh', name: 'Starfruit', category: 'fruit', subcategory: 'fresh', cut: 'starfruit', icon: '', servingType: 'weight', caloriesPer100g: 31, proteinPer100g: 1, carbsPer100g: 6.7, fatPer100g: 0.3, typicalGrams: 50 },
  // --- Olives ---
  { id: 'fruit_olive_canned_green', name: 'Olives, Green', category: 'fruit', subcategory: 'canned', cut: 'olive', variety: 'Green', icon: '', servingType: 'weight', caloriesPer100g: 145, proteinPer100g: 1, carbsPer100g: 3.8, fatPer100g: 15.3, typicalGrams: 100 },
  { id: 'fruit_olive_canned_black_ripe', name: 'Olives, Black (Ripe)', category: 'fruit', subcategory: 'canned', cut: 'olive', variety: 'Black (Ripe)', icon: '', servingType: 'weight', caloriesPer100g: 116, proteinPer100g: 0.8, carbsPer100g: 6, fatPer100g: 10.9, typicalGrams: 8 },
  { id: 'fruit_olive_canned_manzanilla_stuffed', name: 'Olives, Manzanilla (Stuffed with Pimiento)', category: 'fruit', subcategory: 'canned', cut: 'olive', variety: 'Manzanilla, Stuffed', icon: '', servingType: 'weight', caloriesPer100g: 130, proteinPer100g: 1.1, carbsPer100g: 5, fatPer100g: 12.9, typicalGrams: 40 },
  // --- Coconut ---
  // Moved here from Nuts & Seeds in v0.0.39 (Damon's call): coconut is a
  // drupe, not a nut, and Fruit's Fresh/Dried/Canned Form axis fits its
  // real forms exactly -- fresh meat, desiccated/shredded, and canned
  // milk or cream. Coconut WATER stays in Beverages (it's a drink, not a
  // form of the fruit) and coconut FLOUR stays with the other flours in
  // Nuts & Seeds, cross-listed back here.
  { id: 'fruit_coconut_fresh', name: 'Coconut, fresh', category: 'fruit', subcategory: 'fresh', cut: 'coconut', icon: '', servingType: 'weight', caloriesPer100g: 354, proteinPer100g: 3.3, carbsPer100g: 15.2, fatPer100g: 33.5, typicalGrams: 80 },
  { id: 'fruit_coconut_dried_unsweetened', name: 'Coconut, dried, unsweetened', category: 'fruit', subcategory: 'dried', cut: 'coconut', variety: 'Unsweetened', icon: '', servingType: 'weight', caloriesPer100g: 660, proteinPer100g: 6.9, carbsPer100g: 23.6, fatPer100g: 64.5, typicalGrams: 28 },
  { id: 'fruit_coconut_dried_sweetened', name: 'Coconut, dried, sweetened shredded', category: 'fruit', subcategory: 'dried', cut: 'coconut', variety: 'Sweetened, shredded', icon: '', servingType: 'weight', caloriesPer100g: 501, proteinPer100g: 2.9, carbsPer100g: 47.7, fatPer100g: 35.5, typicalGrams: 28 },
  { id: 'fruit_coconut_canned_milk', name: 'Coconut milk, canned', category: 'fruit', subcategory: 'canned', cut: 'coconut', variety: 'Coconut milk', icon: '', servingType: 'weight', caloriesPer100g: 197, proteinPer100g: 2.0, carbsPer100g: 2.8, fatPer100g: 21.3, typicalGrams: 60 },
  { id: 'fruit_coconut_canned_cream', name: 'Coconut cream, canned', category: 'fruit', subcategory: 'canned', cut: 'coconut', variety: 'Coconut cream', icon: '', servingType: 'weight', caloriesPer100g: 357, proteinPer100g: 1.2, carbsPer100g: 53.2, fatPer100g: 16.3, typicalGrams: 60 },  // --- Traditional Indigenous foods (v0.0.43, Decision 2) ---
  // These were tagged `mixed_dish` by the original USDA import and sat
  // there unreachable, even though they are single ingredients rather than
  // dishes. Moved here because this is where someone would look for them.
  // The "(Alaska Native)" / "(Navajo)" suffix in each name is kept
  // deliberately -- it identifies the specific preparation the numbers
  // were measured from, which is a real difference, not decoration.
  { id: 'fruit_chokecherry', name: 'Chokecherries', category: 'fruit', subcategory: 'fresh', cut: 'chokecherry', icon: '', servingType: 'weight', caloriesPer100g: 156, proteinPer100g: 2.9, carbsPer100g: 33.9, fatPer100g: 1.0, typicalGrams: 100 },
  { id: 'fruit_salmonberry', name: 'Salmonberries', category: 'fruit', subcategory: 'fresh', cut: 'salmonberry', icon: '', servingType: 'weight', caloriesPer100g: 47, proteinPer100g: 0.8, carbsPer100g: 10.0, fatPer100g: 0.3, typicalGrams: 100 },
  { id: 'fruit_cranberry_lowbush', name: 'Cranberry, low bush / lingonberry', category: 'fruit', subcategory: 'fresh', cut: 'cranberry_lowbush', icon: '', servingType: 'weight', caloriesPer100g: 55, proteinPer100g: 0.4, carbsPer100g: 12.2, fatPer100g: 0.5, typicalGrams: 100 },
  { id: 'fruit_cloudberry', name: 'Cloudberries', category: 'fruit', subcategory: 'fresh', cut: 'cloudberry', icon: '', servingType: 'weight', caloriesPer100g: 51, proteinPer100g: 2.4, carbsPer100g: 8.6, fatPer100g: 0.8, typicalGrams: 100 },
  { id: 'fruit_cranberry_wild_bush', name: 'Cranberries, wild bush', category: 'fruit', subcategory: 'fresh', cut: 'cranberry_wild_bush', icon: '', servingType: 'weight', caloriesPer100g: 55, proteinPer100g: 1.1, carbsPer100g: 12.3, fatPer100g: 0.2, typicalGrams: 100 },
  { id: 'fruit_rose_hips', name: 'Rose Hips', category: 'fruit', subcategory: 'fresh', cut: 'rose_hips', icon: '', servingType: 'weight', caloriesPer100g: 162, proteinPer100g: 1.6, carbsPer100g: 38.2, fatPer100g: 0.3, typicalGrams: 100 },
  { id: 'fruit_blueberry_alaska', name: 'Blueberries, wild', category: 'fruit', subcategory: 'fresh', cut: 'blueberry_alaska', icon: '', servingType: 'weight', caloriesPer100g: 61, proteinPer100g: 1.2, carbsPer100g: 12.3, fatPer100g: 0.8, typicalGrams: 100 },

];

export default foodsFruit;
