// The curated Vegetables database -- replaces the old flat USDA SR Legacy /
// FNDDS vegetable-category entries (~1,400 raw rows -- an earlier estimate
// of "2,803" quoted to Damon during planning turned out to be double-
// counted, since data/foods.js's own combined export got scanned alongside
// the individual source files it already concatenates; the real number is
// roughly half that) with a curated, browsable set for the Category >
// Vegetable picker in screens/LogFoodScreen.js. See
// data/vegetableHierarchy.js's header comment for why there's no grouping
// layer above the vegetable list, and docs/vegetables-category-plan.md for
// the full reasoning behind every split/fold/ordering decision made while
// curating this file.
//
// `cut` is the specific vegetable (potato, tomato, carrot, ...) -- see
// data/vegetableHierarchy.js's VEGETABLE_TYPES for the human-readable
// labels and display order.
//
// `prep`/`prepLabel` (added in 0.0.26) are the toggle-picks-a-different-
// real-row pair for VegetableCard's Prep toggle in screens/LogFoodScreen.js
// -- same pattern as EggCard's prep toggle, just with far more distinct
// values than Egg's small raw/cooked/hard-boiled set, since a vegetable's
// "preps" here cover raw/cooked/canned/frozen AND vegetable-specific forms
// like French Fries or Sun-Dried. `prep` is the matching key (unique only
// within one `cut` group, not globally); `prepLabel` is what the toggle
// button displays. Most rows derive both mechanically from the text after
// the first comma in `name` (e.g. "Potato, Boiled" -> prepLabel "Boiled",
// prep "boiled"), except: a handful of rows with no comma at all (Tomato
// Sauce/Paste, Sauerkraut, Kimchi, Fried Green Tomatoes, Yuca Fries) which
// got a hand-picked short label instead; the Other Chili Pepper and Other
// Mushroom groups, where the default rule would collide (multiple
// different species all reducing to "Raw") so each keeps its species name
// in the label (e.g. "Serrano, Raw", "Enoki, Raw"); the merged
// Endive/Escarole entry, where the pre-comma word is the actual
// distinction being made (Endive vs. Escarole), not just a prep, so both
// keep their full name as the label; and Potato's Baked row, which
// dropped USDA's "(Skin On)" qualifier from both `name` and `prepLabel`
// (Damon's v0.0.27 call -- skin doesn't meaningfully change the weight or
// nutrition numbers, so calling it out in the label just adds clutter
// without adding real information; the underlying USDA figure itself is
// unchanged). See screens/LogFoodScreen.js's VegetableCard and
// CROSS_LISTED_VEGETABLE_PREPS for how the 7 reused cross-listed rows
// below (which have no `prep`/`prepLabel` of their own) get folded into
// the same toggle.
//
// Every number below is a real USDA value copied
// from this app's existing (much larger) raw dataset, not invented --
// picked for realistic everyday forms (Raw/Cooked/Canned/Frozen, plus a
// few vegetable-specific common preparations like French Fries or Pickles)
// rather than USDA's full exhaustive prep-variant list, the same 'curated
// common set, not the full catalog' approach this app already took for
// Fruit and Dairy.
//
// Tomato, Bell Pepper, Cucumber, Zucchini, Pumpkin, Eggplant, and Avocado
// are NOT fully duplicated here -- their raw/fresh rows already exist
// elsewhere (data/foods.js, data/foodsSRLegacy1.js) tagged back in the
// Fruit round with the same `cut` key this file uses, plus
// crossListCategories so they surface on both the Fruit and Vegetables
// tabs from one underlying row. This file only adds whatever NON-fresh
// forms (Cooked/Canned/etc.) those 7 vegetables needed -- those new rows
// simply have no `subcategory` field at all (unlike the reused fresh rows,
// which carry subcategory: 'fresh'), so Fruit's Form filter (which only
// ever matches subcategory === 'fresh') skips them automatically. See
// utils/nutrition.js's filterByCategory and each reused row's own comment
// in its source file.
//
// Snow Peas and Sugar Snap Peas are combined into one "Snap Peas" entry
// rather than two -- USDA's own data doesn't distinguish them (both are
// filed under the single "Peas, edible-podded" name), so two entries with
// identical numbers under different labels would misrepresent the data as
// more precise than it actually is.
//
// Scope: curated coverage of ~80 common grocery vegetables, matching the
// confirmed plan in docs/vegetables-category-plan.md. Sun-dried tomato,
// dill/bread-and-butter pickles, sauerkraut, and kimchi are included as
// their own entries (not folded into Tomato/Cucumber/Cabbage) since they're
// distinctly different foods in preparation and use, not just another
// fresh/cooked form of the base vegetable -- see the plan doc's
// sub-varieties section. Dried beans/lentils/chickpeas and other
// `legume`-category rows are explicitly out of scope, as are a handful of
// `vegetable`-tagged rows that are actually sprouted *dried* legume seeds
// (mistagged, not vegetable-aisle sprouts) -- both noted in the plan doc as
// candidates for a future Legumes category, not touched here.

const foodsVegetables = [
  // --- Potato ---
  { id: 'veg_potato_raw', name: 'Potato, Raw', category: 'vegetable', cut: 'potato', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 77, proteinPer100g: 2, carbsPer100g: 17.5, fatPer100g: 0.1, typicalGrams: 170 },
  { id: 'veg_potato_baked', name: 'Potato, Baked', category: 'vegetable', cut: 'potato', prep: 'baked', prepLabel: 'Baked', icon: '', servingType: 'weight', caloriesPer100g: 93, proteinPer100g: 2.5, carbsPer100g: 21.2, fatPer100g: 0.1, typicalGrams: 148 },
  { id: 'veg_potato_boiled', name: 'Potato, Boiled', category: 'vegetable', cut: 'potato', prep: 'boiled', prepLabel: 'Boiled', icon: '', servingType: 'weight', caloriesPer100g: 87, proteinPer100g: 1.9, carbsPer100g: 20.1, fatPer100g: 0.1, typicalGrams: 150 },
  { id: 'veg_potato_mashed', name: 'Potato, Mashed', category: 'vegetable', cut: 'potato', prep: 'mashed', prepLabel: 'Mashed', icon: '', servingType: 'weight', caloriesPer100g: 113, proteinPer100g: 1.9, carbsPer100g: 16.8, fatPer100g: 4.2, typicalGrams: 210 },
  { id: 'veg_potato_hash_browns', name: 'Potato, Hash Browns', category: 'vegetable', cut: 'potato', prep: 'hash_browns', prepLabel: 'Hash Browns', icon: '', servingType: 'weight', caloriesPer100g: 265, proteinPer100g: 3, carbsPer100g: 35.1, fatPer100g: 12.5, typicalGrams: 156 },
  { id: 'veg_potato_french_fries', name: 'Potato, French Fries', category: 'vegetable', cut: 'potato', prep: 'french_fries', prepLabel: 'French Fries', icon: '', servingType: 'weight', caloriesPer100g: 158, proteinPer100g: 2.8, carbsPer100g: 25.6, fatPer100g: 5.5, typicalGrams: 198 },
  // --- Tomato ---
  { id: 'veg_tomato_canned_diced', name: 'Tomato, Canned (Diced)', category: 'vegetable', cut: 'tomato', prep: 'canned_diced', prepLabel: 'Canned (Diced)', icon: '', servingType: 'weight', caloriesPer100g: 18, proteinPer100g: 0.8, carbsPer100g: 3.3, fatPer100g: 0.5, typicalGrams: 130 },
  { id: 'veg_tomato_cooked', name: 'Tomato, Cooked', category: 'vegetable', cut: 'tomato', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 4, fatPer100g: 0.1, typicalGrams: 240 },
  { id: 'veg_tomato_sauce', name: 'Tomato Sauce', category: 'vegetable', cut: 'tomato', prep: 'sauce', prepLabel: 'Sauce', icon: '', servingType: 'weight', caloriesPer100g: 24, proteinPer100g: 1.2, carbsPer100g: 5.3, fatPer100g: 0.3, typicalGrams: 245 },
  { id: 'veg_tomato_paste', name: 'Tomato Paste', category: 'vegetable', cut: 'tomato', prep: 'paste', prepLabel: 'Paste', icon: '', servingType: 'weight', caloriesPer100g: 89, proteinPer100g: 4.2, carbsPer100g: 20.2, fatPer100g: 0.7, typicalGrams: 30 },
  // --- Cherry/Grape Tomatoes ---
  { id: 'veg_cherry_tomato_raw', name: 'Cherry/Grape Tomatoes, Raw', category: 'vegetable', cut: 'cherry_tomato', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 27, proteinPer100g: 0.8, carbsPer100g: 5.5, fatPer100g: 0.6, typicalGrams: 85 },
  // --- Sun-Dried Tomatoes ---
  { id: 'veg_sundried_tomato_plain', name: 'Sun-Dried Tomatoes, Plain', category: 'vegetable', cut: 'sundried_tomato', prep: 'plain', prepLabel: 'Plain', icon: '', servingType: 'weight', caloriesPer100g: 258, proteinPer100g: 14.1, carbsPer100g: 55.8, fatPer100g: 3, typicalGrams: 54 },
  { id: 'veg_sundried_tomato_packed_in_oil', name: 'Sun-Dried Tomatoes, Packed in Oil', category: 'vegetable', cut: 'sundried_tomato', prep: 'packed_in_oil', prepLabel: 'Packed in Oil', icon: '', servingType: 'weight', caloriesPer100g: 213, proteinPer100g: 5.1, carbsPer100g: 23.3, fatPer100g: 14.1, typicalGrams: 110 },
  // --- Green Tomatoes ---
  { id: 'veg_green_tomato_green_tomato_raw', name: 'Green Tomato, Raw', category: 'vegetable', cut: 'green_tomato', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 23, proteinPer100g: 1.2, carbsPer100g: 5.1, fatPer100g: 0.2, typicalGrams: 123 },
  { id: 'veg_green_tomato_green_tomato_pickled', name: 'Green Tomato, Pickled', category: 'vegetable', cut: 'green_tomato', prep: 'pickled', prepLabel: 'Pickled', icon: '', servingType: 'weight', caloriesPer100g: 40, proteinPer100g: 1, carbsPer100g: 9.1, fatPer100g: 0.2, typicalGrams: 142 },
  { id: 'veg_green_tomato_fried', name: 'Fried Green Tomatoes', category: 'vegetable', cut: 'green_tomato', prep: 'fried', prepLabel: 'Fried', icon: '', servingType: 'weight', caloriesPer100g: 216, proteinPer100g: 3.7, carbsPer100g: 21.8, fatPer100g: 12.8, typicalGrams: 35 },
  // --- Onion ---
  { id: 'veg_onion_raw', name: 'Onion, Raw', category: 'vegetable', cut: 'onion', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 40, proteinPer100g: 1.1, carbsPer100g: 9.3, fatPer100g: 0.1, typicalGrams: 160 },
  { id: 'veg_onion_cooked', name: 'Onion, Cooked', category: 'vegetable', cut: 'onion', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 44, proteinPer100g: 1.4, carbsPer100g: 10.2, fatPer100g: 0.2, typicalGrams: 60 },
  { id: 'veg_onion_canned', name: 'Onion, Canned', category: 'vegetable', cut: 'onion', prep: 'canned', prepLabel: 'Canned', icon: '', servingType: 'weight', caloriesPer100g: 19, proteinPer100g: 0.8, carbsPer100g: 4, fatPer100g: 0.1, typicalGrams: 63 },
  // --- Garlic ---
  { id: 'veg_garlic_raw', name: 'Garlic, Raw', category: 'vegetable', cut: 'garlic', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 143, proteinPer100g: 6.6, carbsPer100g: 28.2, fatPer100g: 0.4, typicalGrams: 10 },
  { id: 'veg_garlic_cooked', name: 'Garlic, Cooked', category: 'vegetable', cut: 'garlic', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 142, proteinPer100g: 6.6, carbsPer100g: 28, fatPer100g: 0.4, typicalGrams: 10 },
  // --- Iceberg Lettuce ---
  { id: 'veg_iceberg_lettuce_raw', name: 'Iceberg Lettuce, Raw', category: 'vegetable', cut: 'iceberg_lettuce', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 14, proteinPer100g: 0.7, carbsPer100g: 3.4, fatPer100g: 0.1, typicalGrams: 85 },
  // --- Romaine Lettuce ---
  { id: 'veg_romaine_lettuce_raw', name: 'Romaine Lettuce, Raw', category: 'vegetable', cut: 'romaine_lettuce', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 17, proteinPer100g: 1.2, carbsPer100g: 3.2, fatPer100g: 0.3, typicalGrams: 85 },
  // --- Butter/Bibb Lettuce ---
  { id: 'veg_butter_lettuce_raw', name: 'Butter/Bibb Lettuce, Raw', category: 'vegetable', cut: 'butter_lettuce', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 13, proteinPer100g: 1.4, carbsPer100g: 2.2, fatPer100g: 0.2, typicalGrams: 55 },
  // --- Carrot ---
  { id: 'veg_carrot_raw', name: 'Carrot, Raw', category: 'vegetable', cut: 'carrot', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 41, proteinPer100g: 0.9, carbsPer100g: 9.6, fatPer100g: 0.2, typicalGrams: 110 },
  { id: 'veg_carrot_cooked', name: 'Carrot, Cooked', category: 'vegetable', cut: 'carrot', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 35, proteinPer100g: 0.8, carbsPer100g: 8.2, fatPer100g: 0.2, typicalGrams: 46 },
  { id: 'veg_carrot_canned', name: 'Carrot, Canned', category: 'vegetable', cut: 'carrot', prep: 'canned', prepLabel: 'Canned', icon: '', servingType: 'weight', caloriesPer100g: 25, proteinPer100g: 0.6, carbsPer100g: 5.5, fatPer100g: 0.2, typicalGrams: 146 },
  // --- Baby Carrots ---
  { id: 'veg_baby_carrot_raw', name: 'Baby Carrots, Raw', category: 'vegetable', cut: 'baby_carrot', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 38, proteinPer100g: 0.8, carbsPer100g: 9.1, fatPer100g: 0.1, typicalGrams: 85 },
  // --- Corn ---
  { id: 'veg_corn_raw', name: 'Corn, Raw', category: 'vegetable', cut: 'corn', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 86, proteinPer100g: 3.3, carbsPer100g: 18.7, fatPer100g: 1.4, typicalGrams: 102 },
  { id: 'veg_corn_cooked', name: 'Corn, Cooked', category: 'vegetable', cut: 'corn', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 96, proteinPer100g: 3.4, carbsPer100g: 21, fatPer100g: 1.5, typicalGrams: 89 },
  { id: 'veg_corn_canned', name: 'Corn, Canned', category: 'vegetable', cut: 'corn', prep: 'canned', prepLabel: 'Canned', icon: '', servingType: 'weight', caloriesPer100g: 67, proteinPer100g: 2.3, carbsPer100g: 14.3, fatPer100g: 1.2, typicalGrams: 211 },
  // --- Bell Pepper ---
  { id: 'veg_bell_pepper_cooked', name: 'Bell Pepper, Cooked', category: 'vegetable', cut: 'bell_pepper', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 26, proteinPer100g: 0.9, carbsPer100g: 6.1, fatPer100g: 0.2, typicalGrams: 92 },
  // --- Jalapeño ---
  { id: 'veg_jalapeno_raw', name: 'Jalapeño, Raw', category: 'vegetable', cut: 'jalapeno', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 29, proteinPer100g: 0.9, carbsPer100g: 6.5, fatPer100g: 0.4, typicalGrams: 14 },
  { id: 'veg_jalapeno_canned', name: 'Jalapeño, Canned', category: 'vegetable', cut: 'jalapeno', prep: 'canned', prepLabel: 'Canned', icon: '', servingType: 'weight', caloriesPer100g: 27, proteinPer100g: 0.9, carbsPer100g: 4.7, fatPer100g: 0.9, typicalGrams: 104 },
  // --- Other Chili/Hot Peppers ---
  { id: 'veg_other_chili_pepper_hot_chili_pepper_green_raw', name: 'Hot Chili Pepper, Green, Raw', category: 'vegetable', cut: 'other_chili_pepper', prep: 'green_chili_raw', prepLabel: 'Green Chili, Raw', icon: '', servingType: 'weight', caloriesPer100g: 40, proteinPer100g: 2, carbsPer100g: 9.5, fatPer100g: 0.2, typicalGrams: 45 },
  { id: 'veg_other_chili_pepper_hot_chili_pepper_red_raw', name: 'Hot Chili Pepper, Red, Raw', category: 'vegetable', cut: 'other_chili_pepper', prep: 'red_chili_raw', prepLabel: 'Red Chili, Raw', icon: '', servingType: 'weight', caloriesPer100g: 40, proteinPer100g: 1.9, carbsPer100g: 8.8, fatPer100g: 0.4, typicalGrams: 45 },
  { id: 'veg_other_chili_pepper_serrano_pepper_raw', name: 'Serrano Pepper, Raw', category: 'vegetable', cut: 'other_chili_pepper', prep: 'serrano_raw', prepLabel: 'Serrano, Raw', icon: '', servingType: 'weight', caloriesPer100g: 32, proteinPer100g: 1.7, carbsPer100g: 6.7, fatPer100g: 0.4, typicalGrams: 105 },
  { id: 'veg_other_chili_pepper_poblano_pepper_raw', name: 'Poblano Pepper, Raw', category: 'vegetable', cut: 'other_chili_pepper', prep: 'poblano_raw', prepLabel: 'Poblano, Raw', icon: '', servingType: 'weight', caloriesPer100g: 28, proteinPer100g: 1.4, carbsPer100g: 5.1, fatPer100g: 0.2, typicalGrams: 100 },
  // --- Cucumber ---
  { id: 'veg_cucumber_peeled_raw', name: 'Cucumber, Peeled, Raw', category: 'vegetable', cut: 'cucumber', prep: 'peeled_raw', prepLabel: 'Peeled, Raw', icon: '', servingType: 'weight', caloriesPer100g: 10, proteinPer100g: 0.6, carbsPer100g: 2.2, fatPer100g: 0.2, typicalGrams: 7 },
  // --- Pickled Cucumbers (Pickles) ---
  { id: 'veg_pickle_pickles_dill', name: 'Pickles, Dill', category: 'vegetable', cut: 'pickle', prep: 'dill', prepLabel: 'Dill', icon: '', servingType: 'weight', caloriesPer100g: 12, proteinPer100g: 0.5, carbsPer100g: 2, fatPer100g: 0.4, typicalGrams: 30 },
  { id: 'veg_pickle_pickles_sweet_bread_butter', name: 'Pickles, Sweet (Bread & Butter)', category: 'vegetable', cut: 'pickle', prep: 'sweet_bread_and_butter', prepLabel: 'Sweet (Bread & Butter)', icon: '', servingType: 'weight', caloriesPer100g: 91, proteinPer100g: 0.6, carbsPer100g: 21.2, fatPer100g: 0.4, typicalGrams: 8 },
  // --- Broccoli ---
  { id: 'veg_broccoli_raw', name: 'Broccoli, Raw', category: 'vegetable', cut: 'broccoli', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 6.6, fatPer100g: 0.4, typicalGrams: 44 },
  { id: 'veg_broccoli_cooked', name: 'Broccoli, Cooked', category: 'vegetable', cut: 'broccoli', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 35, proteinPer100g: 2.4, carbsPer100g: 7.2, fatPer100g: 0.4, typicalGrams: 280 },
  { id: 'veg_broccoli_frozen_cooked', name: 'Broccoli, Frozen, Cooked', category: 'vegetable', cut: 'broccoli', prep: 'frozen_cooked', prepLabel: 'Frozen, Cooked', icon: '', servingType: 'weight', caloriesPer100g: 28, proteinPer100g: 3.1, carbsPer100g: 5.3, fatPer100g: 0.1, typicalGrams: 185 },
  // --- Green Cabbage ---
  { id: 'veg_green_cabbage_raw', name: 'Green Cabbage, Raw', category: 'vegetable', cut: 'green_cabbage', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 28, proteinPer100g: 1, carbsPer100g: 6.4, fatPer100g: 0.2, typicalGrams: 85 },
  { id: 'veg_green_cabbage_cooked', name: 'Green Cabbage, Cooked', category: 'vegetable', cut: 'green_cabbage', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 32, proteinPer100g: 1, carbsPer100g: 6.6, fatPer100g: 0.2, typicalGrams: 150 },
  // --- Red Cabbage ---
  { id: 'veg_red_cabbage_raw', name: 'Red Cabbage, Raw', category: 'vegetable', cut: 'red_cabbage', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 30, proteinPer100g: 1.2, carbsPer100g: 6.8, fatPer100g: 0.2, typicalGrams: 85 },
  { id: 'veg_red_cabbage_cooked', name: 'Red Cabbage, Cooked', category: 'vegetable', cut: 'red_cabbage', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 29, proteinPer100g: 1.5, carbsPer100g: 6.9, fatPer100g: 0.1, typicalGrams: 75 },
  // --- Napa/Bok Choy ---
  { id: 'veg_napa_bok_choy_raw', name: 'Napa/Bok Choy, Raw', category: 'vegetable', cut: 'napa_bok_choy', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 17, proteinPer100g: 1, carbsPer100g: 3.5, fatPer100g: 0.2, typicalGrams: 85 },
  { id: 'veg_napa_bok_choy_cooked', name: 'Napa/Bok Choy, Cooked', category: 'vegetable', cut: 'napa_bok_choy', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 12, proteinPer100g: 1.6, carbsPer100g: 1.8, fatPer100g: 0.2, typicalGrams: 170 },
  // --- Sauerkraut ---
  { id: 'veg_sauerkraut_sauerkraut', name: 'Sauerkraut', category: 'vegetable', cut: 'sauerkraut', prep: 'plain', prepLabel: 'Sauerkraut', icon: '', servingType: 'weight', caloriesPer100g: 40, proteinPer100g: 0.9, carbsPer100g: 4.2, fatPer100g: 2.5, typicalGrams: 140 },
  // --- Kimchi ---
  { id: 'veg_kimchi_kimchi', name: 'Kimchi', category: 'vegetable', cut: 'kimchi', prep: 'plain', prepLabel: 'Kimchi', icon: '', servingType: 'weight', caloriesPer100g: 15, proteinPer100g: 1.1, carbsPer100g: 2.4, fatPer100g: 0.5, typicalGrams: 30 },
  // --- Green/Snap Beans ---
  { id: 'veg_green_bean_green_beans_raw', name: 'Green Beans, Raw', category: 'vegetable', cut: 'green_bean', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 34, proteinPer100g: 2, carbsPer100g: 7.4, fatPer100g: 0.3, typicalGrams: 85 },
  { id: 'veg_green_bean_green_beans_cooked', name: 'Green Beans, Cooked', category: 'vegetable', cut: 'green_bean', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 35, proteinPer100g: 1.9, carbsPer100g: 7.9, fatPer100g: 0.3, typicalGrams: 125 },
  { id: 'veg_green_bean_green_beans_canned', name: 'Green Beans, Canned', category: 'vegetable', cut: 'green_bean', prep: 'canned', prepLabel: 'Canned', icon: '', servingType: 'weight', caloriesPer100g: 21, proteinPer100g: 1, carbsPer100g: 4.1, fatPer100g: 0.4, typicalGrams: 130 },
  // --- Edamame ---
  { id: 'veg_edamame_cooked', name: 'Edamame, Cooked', category: 'vegetable', cut: 'edamame', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 121, proteinPer100g: 11.9, carbsPer100g: 8.9, fatPer100g: 5.2, typicalGrams: 155 },
  // --- Celery ---
  { id: 'veg_celery_raw', name: 'Celery, Raw', category: 'vegetable', cut: 'celery', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 15, proteinPer100g: 0.5, carbsPer100g: 3.3, fatPer100g: 0.2, typicalGrams: 85 },
  { id: 'veg_celery_cooked', name: 'Celery, Cooked', category: 'vegetable', cut: 'celery', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 18, proteinPer100g: 0.8, carbsPer100g: 4, fatPer100g: 0.2, typicalGrams: 150 },
  // --- Sweet Potato ---
  { id: 'veg_sweet_potato_raw', name: 'Sweet Potato, Raw', category: 'vegetable', cut: 'sweet_potato', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20.1, fatPer100g: 0.1, typicalGrams: 133 },
  { id: 'veg_sweet_potato_baked', name: 'Sweet Potato, Baked', category: 'vegetable', cut: 'sweet_potato', prep: 'baked', prepLabel: 'Baked', icon: '', servingType: 'weight', caloriesPer100g: 82, proteinPer100g: 1.6, carbsPer100g: 18, fatPer100g: 0.4, typicalGrams: 150 },
  { id: 'veg_sweet_potato_boiled', name: 'Sweet Potato, Boiled', category: 'vegetable', cut: 'sweet_potato', prep: 'boiled', prepLabel: 'Boiled', icon: '', servingType: 'weight', caloriesPer100g: 82, proteinPer100g: 1.6, carbsPer100g: 18, fatPer100g: 0.4, typicalGrams: 25 },
  { id: 'veg_sweet_potato_fries', name: 'Sweet Potato, Fries', category: 'vegetable', cut: 'sweet_potato', prep: 'fries', prepLabel: 'Fries', icon: '', servingType: 'weight', caloriesPer100g: 156, proteinPer100g: 1.5, carbsPer100g: 16.4, fatPer100g: 9.4, typicalGrams: 60 },
  { id: 'veg_sweet_potato_candied', name: 'Sweet Potato, Candied', category: 'vegetable', cut: 'sweet_potato', prep: 'candied', prepLabel: 'Candied', icon: '', servingType: 'weight', caloriesPer100g: 164, proteinPer100g: 0.9, carbsPer100g: 32.1, fatPer100g: 3.5, typicalGrams: 105 },
  // --- Sweet Potato Leaves ---
  { id: 'veg_sweet_potato_leaves_raw', name: 'Sweet Potato Leaves, Raw', category: 'vegetable', cut: 'sweet_potato_leaves', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 42, proteinPer100g: 2.5, carbsPer100g: 8.8, fatPer100g: 0.5, typicalGrams: 35 },
  { id: 'veg_sweet_potato_leaves_cooked', name: 'Sweet Potato Leaves, Cooked', category: 'vegetable', cut: 'sweet_potato_leaves', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 35, proteinPer100g: 2.2, carbsPer100g: 7.4, fatPer100g: 0.3, typicalGrams: 64 },
  // --- Cauliflower ---
  { id: 'veg_cauliflower_raw', name: 'Cauliflower, Raw', category: 'vegetable', cut: 'cauliflower', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 23, proteinPer100g: 1.6, carbsPer100g: 4.7, fatPer100g: 0.2, typicalGrams: 85 },
  { id: 'veg_cauliflower_cooked', name: 'Cauliflower, Cooked', category: 'vegetable', cut: 'cauliflower', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 23, proteinPer100g: 1.8, carbsPer100g: 4.1, fatPer100g: 0.5, typicalGrams: 62 },
  // --- Spinach ---
  { id: 'veg_spinach_raw', name: 'Spinach, Raw', category: 'vegetable', cut: 'spinach', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 22, proteinPer100g: 2.9, carbsPer100g: 2.6, fatPer100g: 0.6, typicalGrams: 85 },
  { id: 'veg_spinach_cooked', name: 'Spinach, Cooked', category: 'vegetable', cut: 'spinach', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 23, proteinPer100g: 3, carbsPer100g: 3.8, fatPer100g: 0.3, typicalGrams: 180 },
  { id: 'veg_spinach_canned', name: 'Spinach, Canned', category: 'vegetable', cut: 'spinach', prep: 'canned', prepLabel: 'Canned', icon: '', servingType: 'weight', caloriesPer100g: 19, proteinPer100g: 2.1, carbsPer100g: 2.9, fatPer100g: 0.4, typicalGrams: 234 },
  // --- Baby Spinach ---
  { id: 'veg_baby_spinach_raw', name: 'Baby Spinach, Raw', category: 'vegetable', cut: 'baby_spinach', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 21, proteinPer100g: 2.9, carbsPer100g: 2.4, fatPer100g: 0.6, typicalGrams: 85 },
  // --- Mushroom (Button/White) ---
  { id: 'veg_button_mushroom_button_white_mushroom_raw', name: 'Button/White Mushroom, Raw', category: 'vegetable', cut: 'button_mushroom', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 22, proteinPer100g: 3.1, carbsPer100g: 3.3, fatPer100g: 0.3, typicalGrams: 10 },
  { id: 'veg_button_mushroom_button_white_mushroom_cooked', name: 'Button/White Mushroom, Cooked', category: 'vegetable', cut: 'button_mushroom', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 31, proteinPer100g: 2.9, carbsPer100g: 4.1, fatPer100g: 0.3, typicalGrams: 18 },
  // --- Cremini Mushrooms ---
  { id: 'veg_cremini_mushroom_raw', name: 'Cremini Mushrooms, Raw', category: 'vegetable', cut: 'cremini_mushroom', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 22, proteinPer100g: 2.5, carbsPer100g: 4.3, fatPer100g: 0.1, typicalGrams: 72 },
  // --- Portobello Mushrooms ---
  { id: 'veg_portobello_mushroom_raw', name: 'Portobello Mushrooms, Raw', category: 'vegetable', cut: 'portobello_mushroom', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 22, proteinPer100g: 2.1, carbsPer100g: 3.9, fatPer100g: 0.3, typicalGrams: 84 },
  { id: 'veg_portobello_mushroom_grilled', name: 'Portobello Mushrooms, Grilled', category: 'vegetable', cut: 'portobello_mushroom', prep: 'grilled', prepLabel: 'Grilled', icon: '', servingType: 'weight', caloriesPer100g: 29, proteinPer100g: 3.3, carbsPer100g: 4.4, fatPer100g: 0.6, typicalGrams: 121 },
  // --- Shiitake Mushrooms ---
  { id: 'veg_shiitake_mushroom_raw', name: 'Shiitake Mushrooms, Raw', category: 'vegetable', cut: 'shiitake_mushroom', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 34, proteinPer100g: 2.2, carbsPer100g: 6.8, fatPer100g: 0.5, typicalGrams: 19 },
  { id: 'veg_shiitake_mushroom_cooked', name: 'Shiitake Mushrooms, Cooked', category: 'vegetable', cut: 'shiitake_mushroom', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 56, proteinPer100g: 1.6, carbsPer100g: 14.4, fatPer100g: 0.2, typicalGrams: 145 },
  // --- Oyster Mushrooms ---
  { id: 'veg_oyster_mushroom_raw', name: 'Oyster Mushrooms, Raw', category: 'vegetable', cut: 'oyster_mushroom', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 33, proteinPer100g: 3.3, carbsPer100g: 6.1, fatPer100g: 0.4, typicalGrams: 15 },
  // --- Other Mushrooms ---
  { id: 'veg_other_mushroom_enoki_mushrooms_raw', name: 'Enoki Mushrooms, Raw', category: 'vegetable', cut: 'other_mushroom', prep: 'enoki_raw', prepLabel: 'Enoki, Raw', icon: '', servingType: 'weight', caloriesPer100g: 37, proteinPer100g: 2.7, carbsPer100g: 7.8, fatPer100g: 0.3, typicalGrams: 5 },
  { id: 'veg_other_mushroom_maitake_mushrooms_raw', name: 'Maitake Mushrooms, Raw', category: 'vegetable', cut: 'other_mushroom', prep: 'maitake_raw', prepLabel: 'Maitake, Raw', icon: '', servingType: 'weight', caloriesPer100g: 31, proteinPer100g: 1.9, carbsPer100g: 7, fatPer100g: 0.2, typicalGrams: 70 },
  { id: 'veg_other_mushroom_king_oyster_mushrooms_raw', name: 'King Oyster Mushrooms, Raw', category: 'vegetable', cut: 'other_mushroom', prep: 'king_oyster_raw', prepLabel: 'King Oyster, Raw', icon: '', servingType: 'weight', caloriesPer100g: 38, proteinPer100g: 2.4, carbsPer100g: 8.5, fatPer100g: 0.3, typicalGrams: 85 },
  // --- Zucchini/Summer Squash ---
  { id: 'veg_zucchini_zucchini_cooked', name: 'Zucchini, Cooked', category: 'vegetable', cut: 'zucchini', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 15, proteinPer100g: 1.1, carbsPer100g: 2.7, fatPer100g: 0.4, typicalGrams: 120 },
  // --- Asparagus ---
  { id: 'veg_asparagus_raw', name: 'Asparagus, Raw', category: 'vegetable', cut: 'asparagus', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 20, proteinPer100g: 2.2, carbsPer100g: 3.9, fatPer100g: 0.1, typicalGrams: 134 },
  { id: 'veg_asparagus_cooked', name: 'Asparagus, Cooked', category: 'vegetable', cut: 'asparagus', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 18, proteinPer100g: 3, carbsPer100g: 1.9, fatPer100g: 0.4, typicalGrams: 180 },
  { id: 'veg_asparagus_canned', name: 'Asparagus, Canned', category: 'vegetable', cut: 'asparagus', prep: 'canned', prepLabel: 'Canned', icon: '', servingType: 'weight', caloriesPer100g: 19, proteinPer100g: 2.1, carbsPer100g: 2.5, fatPer100g: 0.7, typicalGrams: 242 },
  // --- Brussels Sprouts ---
  { id: 'veg_brussels_sprouts_raw', name: 'Brussels Sprouts, Raw', category: 'vegetable', cut: 'brussels_sprouts', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 49, proteinPer100g: 4, carbsPer100g: 9.6, fatPer100g: 0.6, typicalGrams: 85 },
  { id: 'veg_brussels_sprouts_cooked', name: 'Brussels Sprouts, Cooked', category: 'vegetable', cut: 'brussels_sprouts', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 36, proteinPer100g: 2.5, carbsPer100g: 7.1, fatPer100g: 0.5, typicalGrams: 78 },
  // --- Green Peas ---
  { id: 'veg_green_pea_raw', name: 'Green Peas, Raw', category: 'vegetable', cut: 'green_pea', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 81, proteinPer100g: 5.4, carbsPer100g: 14.4, fatPer100g: 0.4, typicalGrams: 145 },
  { id: 'veg_green_pea_cooked', name: 'Green Peas, Cooked', category: 'vegetable', cut: 'green_pea', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 78, proteinPer100g: 5.2, carbsPer100g: 14.3, fatPer100g: 0.3, typicalGrams: 80 },
  { id: 'veg_green_pea_canned', name: 'Green Peas, Canned', category: 'vegetable', cut: 'green_pea', prep: 'canned', prepLabel: 'Canned', icon: '', servingType: 'weight', caloriesPer100g: 69, proteinPer100g: 4.4, carbsPer100g: 12.6, fatPer100g: 0.3, typicalGrams: 85 },
  // --- Snap Peas (Snow & Sugar Snap) ---
  { id: 'veg_snap_pea_snap_peas_raw', name: 'Snap Peas, Raw', category: 'vegetable', cut: 'snap_pea', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 42, proteinPer100g: 2.8, carbsPer100g: 7.5, fatPer100g: 0.2, typicalGrams: 63 },
  { id: 'veg_snap_pea_snap_peas_cooked', name: 'Snap Peas, Cooked', category: 'vegetable', cut: 'snap_pea', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 40, proteinPer100g: 3.3, carbsPer100g: 6.5, fatPer100g: 0.2, typicalGrams: 160 },
  // --- Radish ---
  { id: 'veg_radish_raw', name: 'Radish, Raw', category: 'vegetable', cut: 'radish', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 20, proteinPer100g: 0.7, carbsPer100g: 4.1, fatPer100g: 0.1, typicalGrams: 100 },
  // --- Daikon Radish ---
  { id: 'veg_daikon_radish_raw', name: 'Daikon Radish, Raw', category: 'vegetable', cut: 'daikon_radish', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 18, proteinPer100g: 0.6, carbsPer100g: 4.1, fatPer100g: 0.1, typicalGrams: 116 },
  { id: 'veg_daikon_radish_cooked', name: 'Daikon Radish, Cooked', category: 'vegetable', cut: 'daikon_radish', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 17, proteinPer100g: 0.7, carbsPer100g: 3.4, fatPer100g: 0.2, typicalGrams: 147 },
  // --- Beet ---
  { id: 'veg_beet_raw', name: 'Beet, Raw', category: 'vegetable', cut: 'beet', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 41, proteinPer100g: 1.7, carbsPer100g: 8.8, fatPer100g: 0.3, typicalGrams: 85 },
  { id: 'veg_beet_cooked', name: 'Beet, Cooked', category: 'vegetable', cut: 'beet', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 44, proteinPer100g: 1.7, carbsPer100g: 10, fatPer100g: 0.2, typicalGrams: 100 },
  { id: 'veg_beet_canned', name: 'Beet, Canned', category: 'vegetable', cut: 'beet', prep: 'canned', prepLabel: 'Canned', icon: '', servingType: 'weight', caloriesPer100g: 31, proteinPer100g: 0.9, carbsPer100g: 7.2, fatPer100g: 0.1, typicalGrams: 145 },
  // --- Beet Greens ---
  { id: 'veg_beet_greens_raw', name: 'Beet Greens, Raw', category: 'vegetable', cut: 'beet_greens', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 26, proteinPer100g: 1.6, carbsPer100g: 4.7, fatPer100g: 0.1, typicalGrams: 100 },
  { id: 'veg_beet_greens_cooked', name: 'Beet Greens, Cooked', category: 'vegetable', cut: 'beet_greens', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 27, proteinPer100g: 2.6, carbsPer100g: 5.5, fatPer100g: 0.2, typicalGrams: 144 },
  // --- Scallion/Green Onion ---
  { id: 'veg_scallion_raw', name: 'Scallion/Green Onion, Raw', category: 'vegetable', cut: 'scallion', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 32, proteinPer100g: 1.8, carbsPer100g: 7.3, fatPer100g: 0.2, typicalGrams: 15 },
  // --- Leek ---
  { id: 'veg_leek_raw', name: 'Leek, Raw', category: 'vegetable', cut: 'leek', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 61, proteinPer100g: 1.5, carbsPer100g: 14.2, fatPer100g: 0.3, typicalGrams: 89 },
  { id: 'veg_leek_cooked', name: 'Leek, Cooked', category: 'vegetable', cut: 'leek', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 31, proteinPer100g: 0.8, carbsPer100g: 7.6, fatPer100g: 0.2, typicalGrams: 26 },
  // --- Shallot ---
  { id: 'veg_shallot_raw', name: 'Shallot, Raw', category: 'vegetable', cut: 'shallot', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 72, proteinPer100g: 2.5, carbsPer100g: 16.8, fatPer100g: 0.1, typicalGrams: 25 },
  // --- Kale ---
  { id: 'veg_kale_raw', name: 'Kale, Raw', category: 'vegetable', cut: 'kale', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 35, proteinPer100g: 2.9, carbsPer100g: 4.4, fatPer100g: 1.5, typicalGrams: 85 },
  { id: 'veg_kale_cooked', name: 'Kale, Cooked', category: 'vegetable', cut: 'kale', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 36, proteinPer100g: 2.9, carbsPer100g: 5.3, fatPer100g: 1.2, typicalGrams: 118 },
  // --- Swiss Chard ---
  { id: 'veg_swiss_chard_raw', name: 'Swiss Chard, Raw', category: 'vegetable', cut: 'swiss_chard', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 19, proteinPer100g: 1.8, carbsPer100g: 3.7, fatPer100g: 0.2, typicalGrams: 48 },
  { id: 'veg_swiss_chard_cooked', name: 'Swiss Chard, Cooked', category: 'vegetable', cut: 'swiss_chard', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 20, proteinPer100g: 1.9, carbsPer100g: 4.1, fatPer100g: 0.1, typicalGrams: 175 },
  // --- Collard Greens ---
  { id: 'veg_collard_greens_raw', name: 'Collard Greens, Raw', category: 'vegetable', cut: 'collard_greens', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 39, proteinPer100g: 3, carbsPer100g: 7, fatPer100g: 0.8, typicalGrams: 85 },
  { id: 'veg_collard_greens_cooked', name: 'Collard Greens, Cooked', category: 'vegetable', cut: 'collard_greens', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 33, proteinPer100g: 2.7, carbsPer100g: 5.7, fatPer100g: 0.7, typicalGrams: 190 },
  // --- Arugula ---
  { id: 'veg_arugula_raw', name: 'Arugula, Raw', category: 'vegetable', cut: 'arugula', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 25, proteinPer100g: 2.6, carbsPer100g: 3.6, fatPer100g: 0.7, typicalGrams: 30 },
  // --- Butternut Squash ---
  { id: 'veg_butternut_squash_raw', name: 'Butternut Squash, Raw', category: 'vegetable', cut: 'butternut_squash', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 42, proteinPer100g: 1.1, carbsPer100g: 10.5, fatPer100g: 0.2, typicalGrams: 85 },
  { id: 'veg_butternut_squash_baked', name: 'Butternut Squash, Baked', category: 'vegetable', cut: 'butternut_squash', prep: 'baked', prepLabel: 'Baked', icon: '', servingType: 'weight', caloriesPer100g: 40, proteinPer100g: 0.9, carbsPer100g: 10.5, fatPer100g: 0.1, typicalGrams: 205 },
  // --- Acorn Squash ---
  { id: 'veg_acorn_squash_raw', name: 'Acorn Squash, Raw', category: 'vegetable', cut: 'acorn_squash', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 42, proteinPer100g: 1.2, carbsPer100g: 10.5, fatPer100g: 0.2, typicalGrams: 85 },
  { id: 'veg_acorn_squash_baked', name: 'Acorn Squash, Baked', category: 'vegetable', cut: 'acorn_squash', prep: 'baked', prepLabel: 'Baked', icon: '', servingType: 'weight', caloriesPer100g: 56, proteinPer100g: 1.1, carbsPer100g: 14.6, fatPer100g: 0.1, typicalGrams: 205 },
  // --- Spaghetti Squash ---
  { id: 'veg_spaghetti_squash_cooked', name: 'Spaghetti Squash, Cooked', category: 'vegetable', cut: 'spaghetti_squash', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 49, proteinPer100g: 0.7, carbsPer100g: 6.3, fatPer100g: 2.8, typicalGrams: 78 },
  // --- Other Winter Squash ---
  { id: 'veg_other_winter_squash_winter_squash_raw', name: 'Winter Squash, Raw', category: 'vegetable', cut: 'other_winter_squash', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 34, proteinPer100g: 0.9, carbsPer100g: 8.6, fatPer100g: 0.1, typicalGrams: 116 },
  { id: 'veg_other_winter_squash_winter_squash_baked', name: 'Winter Squash, Baked', category: 'vegetable', cut: 'other_winter_squash', prep: 'baked', prepLabel: 'Baked', icon: '', servingType: 'weight', caloriesPer100g: 37, proteinPer100g: 0.9, carbsPer100g: 8.8, fatPer100g: 0.3, typicalGrams: 205 },
  // --- Turnip ---
  { id: 'veg_turnip_raw', name: 'Turnip, Raw', category: 'vegetable', cut: 'turnip', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 34, proteinPer100g: 1, carbsPer100g: 7.3, fatPer100g: 0.1, typicalGrams: 100 },
  { id: 'veg_turnip_cooked', name: 'Turnip, Cooked', category: 'vegetable', cut: 'turnip', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 22, proteinPer100g: 0.7, carbsPer100g: 5.1, fatPer100g: 0.1, typicalGrams: 230 },
  // --- Turnip Greens ---
  { id: 'veg_turnip_greens_raw', name: 'Turnip Greens, Raw', category: 'vegetable', cut: 'turnip_greens', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 32, proteinPer100g: 1.5, carbsPer100g: 7.1, fatPer100g: 0.3, typicalGrams: 55 },
  { id: 'veg_turnip_greens_cooked', name: 'Turnip Greens, Cooked', category: 'vegetable', cut: 'turnip_greens', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 20, proteinPer100g: 1.1, carbsPer100g: 4.4, fatPer100g: 0.2, typicalGrams: 144 },
  // --- Watercress ---
  { id: 'veg_watercress_raw', name: 'Watercress, Raw', category: 'vegetable', cut: 'watercress', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 11, proteinPer100g: 2.3, carbsPer100g: 1.3, fatPer100g: 0.1, typicalGrams: 30 },
  // --- Mustard Greens ---
  { id: 'veg_mustard_greens_raw', name: 'Mustard Greens, Raw', category: 'vegetable', cut: 'mustard_greens', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 27, proteinPer100g: 2.9, carbsPer100g: 4.7, fatPer100g: 0.4, typicalGrams: 56 },
  { id: 'veg_mustard_greens_cooked', name: 'Mustard Greens, Cooked', category: 'vegetable', cut: 'mustard_greens', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 26, proteinPer100g: 2.6, carbsPer100g: 4.5, fatPer100g: 0.5, typicalGrams: 140 },
  // --- Endive/Escarole ---
  { id: 'veg_endive_escarole_endive_raw', name: 'Endive, Raw', category: 'vegetable', cut: 'endive_escarole', prep: 'endive_raw', prepLabel: 'Endive, Raw', icon: '', servingType: 'weight', caloriesPer100g: 17, proteinPer100g: 1.2, carbsPer100g: 3.4, fatPer100g: 0.2, typicalGrams: 25 },
  { id: 'veg_endive_escarole_escarole_cooked', name: 'Escarole, Cooked', category: 'vegetable', cut: 'endive_escarole', prep: 'escarole_cooked', prepLabel: 'Escarole, Cooked', icon: '', servingType: 'weight', caloriesPer100g: 15, proteinPer100g: 1.1, carbsPer100g: 3.1, fatPer100g: 0.2, typicalGrams: 150 },
  // --- Artichoke ---
  { id: 'veg_artichoke_raw', name: 'Artichoke, Raw', category: 'vegetable', cut: 'artichoke', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 47, proteinPer100g: 3.3, carbsPer100g: 10.5, fatPer100g: 0.1, typicalGrams: 128 },
  // --- Okra ---
  { id: 'veg_okra_raw', name: 'Okra, Raw', category: 'vegetable', cut: 'okra', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 33, proteinPer100g: 1.9, carbsPer100g: 7.5, fatPer100g: 0.2, typicalGrams: 95 },
  { id: 'veg_okra_cooked', name: 'Okra, Cooked', category: 'vegetable', cut: 'okra', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 22, proteinPer100g: 1.9, carbsPer100g: 4.5, fatPer100g: 0.2, typicalGrams: 80 },
  { id: 'veg_okra_frozen_cooked', name: 'Okra, Frozen, Cooked', category: 'vegetable', cut: 'okra', prep: 'frozen_cooked', prepLabel: 'Frozen, Cooked', icon: '', servingType: 'weight', caloriesPer100g: 29, proteinPer100g: 1.6, carbsPer100g: 6.4, fatPer100g: 0.2, typicalGrams: 92 },
  // --- Pumpkin ---
  { id: 'veg_pumpkin_cooked', name: 'Pumpkin, Cooked', category: 'vegetable', cut: 'pumpkin', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 20, proteinPer100g: 0.7, carbsPer100g: 4.9, fatPer100g: 0.1, typicalGrams: 245 },
  { id: 'veg_pumpkin_canned_puree', name: 'Pumpkin, Canned (Puree)', category: 'vegetable', cut: 'pumpkin', prep: 'canned_puree', prepLabel: 'Canned (Puree)', icon: '', servingType: 'weight', caloriesPer100g: 34, proteinPer100g: 1.1, carbsPer100g: 8.1, fatPer100g: 0.3, typicalGrams: 245 },
  // --- Alfalfa Sprouts ---
  { id: 'veg_alfalfa_sprouts_raw', name: 'Alfalfa Sprouts, Raw', category: 'vegetable', cut: 'alfalfa_sprouts', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 23, proteinPer100g: 4, carbsPer100g: 2.1, fatPer100g: 0.7, typicalGrams: 20 },
  // --- Bean Sprouts ---
  { id: 'veg_bean_sprouts_raw', name: 'Bean Sprouts, Raw', category: 'vegetable', cut: 'bean_sprouts', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 30, proteinPer100g: 3, carbsPer100g: 5.9, fatPer100g: 0.2, typicalGrams: 45 },
  { id: 'veg_bean_sprouts_cooked', name: 'Bean Sprouts, Cooked', category: 'vegetable', cut: 'bean_sprouts', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 116, proteinPer100g: 9.8, carbsPer100g: 6.1, fatPer100g: 6.9, typicalGrams: 115 },
  // --- Rutabaga ---
  { id: 'veg_rutabaga_raw', name: 'Rutabaga, Raw', category: 'vegetable', cut: 'rutabaga', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 37, proteinPer100g: 1.1, carbsPer100g: 8.6, fatPer100g: 0.2, typicalGrams: 192 },
  { id: 'veg_rutabaga_cooked', name: 'Rutabaga, Cooked', category: 'vegetable', cut: 'rutabaga', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 30, proteinPer100g: 0.9, carbsPer100g: 6.8, fatPer100g: 0.2, typicalGrams: 240 },
  // --- Parsnip ---
  { id: 'veg_parsnip_raw', name: 'Parsnip, Raw', category: 'vegetable', cut: 'parsnip', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 87, proteinPer100g: 1.3, carbsPer100g: 19.3, fatPer100g: 0.5, typicalGrams: 100 },
  { id: 'veg_parsnip_cooked', name: 'Parsnip, Cooked', category: 'vegetable', cut: 'parsnip', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 71, proteinPer100g: 1.3, carbsPer100g: 17, fatPer100g: 0.3, typicalGrams: 160 },
  // --- Kohlrabi ---
  { id: 'veg_kohlrabi_raw', name: 'Kohlrabi, Raw', category: 'vegetable', cut: 'kohlrabi', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 27, proteinPer100g: 1.7, carbsPer100g: 6.2, fatPer100g: 0.1, typicalGrams: 90 },
  { id: 'veg_kohlrabi_cooked', name: 'Kohlrabi, Cooked', category: 'vegetable', cut: 'kohlrabi', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 29, proteinPer100g: 1.8, carbsPer100g: 6.7, fatPer100g: 0.1, typicalGrams: 165 },
  // --- Celeriac ---
  { id: 'veg_celeriac_raw', name: 'Celeriac, Raw', category: 'vegetable', cut: 'celeriac', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 42, proteinPer100g: 1.5, carbsPer100g: 9.2, fatPer100g: 0.3, typicalGrams: 156 },
  { id: 'veg_celeriac_cooked', name: 'Celeriac, Cooked', category: 'vegetable', cut: 'celeriac', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 27, proteinPer100g: 1, carbsPer100g: 5.9, fatPer100g: 0.2, typicalGrams: 155 },
  // --- Jicama ---
  { id: 'veg_jicama_raw', name: 'Jicama, Raw', category: 'vegetable', cut: 'jicama', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 38, proteinPer100g: 0.7, carbsPer100g: 8.8, fatPer100g: 0.1, typicalGrams: 130 },
  // --- Taro ---
  { id: 'veg_taro_raw', name: 'Taro, Raw', category: 'vegetable', cut: 'taro', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 112, proteinPer100g: 1.5, carbsPer100g: 26.5, fatPer100g: 0.2, typicalGrams: 104 },
  { id: 'veg_taro_cooked', name: 'Taro, Cooked', category: 'vegetable', cut: 'taro', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 142, proteinPer100g: 0.5, carbsPer100g: 34.6, fatPer100g: 0.1, typicalGrams: 132 },
  // --- Yam ---
  { id: 'veg_yam_raw', name: 'Yam, Raw', category: 'vegetable', cut: 'yam', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 118, proteinPer100g: 1.5, carbsPer100g: 27.9, fatPer100g: 0.2, typicalGrams: 150 },
  { id: 'veg_yam_cooked', name: 'Yam, Cooked', category: 'vegetable', cut: 'yam', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 116, proteinPer100g: 1.5, carbsPer100g: 27.5, fatPer100g: 0.1, typicalGrams: 68 },
  // --- Yuca/Cassava ---
  { id: 'veg_yuca_raw', name: 'Yuca/Cassava, Raw', category: 'vegetable', cut: 'yuca', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 160, proteinPer100g: 1.4, carbsPer100g: 38.1, fatPer100g: 0.3, typicalGrams: 206 },
  { id: 'veg_yuca_cooked', name: 'Yuca/Cassava, Cooked', category: 'vegetable', cut: 'yuca', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 191, proteinPer100g: 1.4, carbsPer100g: 39.6, fatPer100g: 3, typicalGrams: 80 },
  { id: 'veg_yuca_yuca_fries', name: 'Yuca Fries', category: 'vegetable', cut: 'yuca', prep: 'fries', prepLabel: 'Fries', icon: '', servingType: 'weight', caloriesPer100g: 269, proteinPer100g: 1.2, carbsPer100g: 34.7, fatPer100g: 13.9, typicalGrams: 70 },
  // --- Fennel ---
  { id: 'veg_fennel_raw', name: 'Fennel, Raw', category: 'vegetable', cut: 'fennel', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 27, proteinPer100g: 0.9, carbsPer100g: 5.5, fatPer100g: 0.1, typicalGrams: 100 },
  { id: 'veg_fennel_cooked', name: 'Fennel, Cooked', category: 'vegetable', cut: 'fennel', prep: 'cooked', prepLabel: 'Cooked', icon: '', servingType: 'weight', caloriesPer100g: 62, proteinPer100g: 1.4, carbsPer100g: 8.3, fatPer100g: 3.2, typicalGrams: 78 },
  // --- Seaweed/Kelp ---
  { id: 'veg_seaweed_raw', name: 'Seaweed/Kelp, Raw', category: 'vegetable', cut: 'seaweed', prep: 'raw', prepLabel: 'Raw', icon: '', servingType: 'weight', caloriesPer100g: 43, proteinPer100g: 1.7, carbsPer100g: 9.6, fatPer100g: 0.6, typicalGrams: 20 },
  { id: 'veg_seaweed_seaweed_nori_laver_raw', name: 'Seaweed, Nori/Laver, Raw', category: 'vegetable', cut: 'seaweed', prep: 'nori_laver_raw', prepLabel: 'Nori/Laver, Raw', icon: '', servingType: 'weight', caloriesPer100g: 35, proteinPer100g: 5.8, carbsPer100g: 5.1, fatPer100g: 0.3, typicalGrams: 10 },  // --- Traditional Indigenous foods (v0.0.43, Decision 2) ---
  // These were tagged `mixed_dish` by the original USDA import and sat
  // there unreachable, even though they are single ingredients rather than
  // dishes. Moved here because this is where someone would look for them.
  // The "(Alaska Native)" / "(Navajo)" suffix in each name is kept
  // deliberately -- it identifies the specific preparation the numbers
  // were measured from, which is a real difference, not decoration.
  { id: 'vegetable_cattail', name: 'Cattail Shoots', category: 'vegetable', subcategory: 'fresh', cut: 'cattail', icon: '', servingType: 'weight', caloriesPer100g: 25, proteinPer100g: 1.2, carbsPer100g: 5.1, fatPer100g: 0.0, typicalGrams: 100 },
  { id: 'vegetable_prairie_turnip', name: 'Prairie Turnips', category: 'vegetable', subcategory: 'fresh', cut: 'prairie_turnip', icon: '', servingType: 'weight', caloriesPer100g: 129, proteinPer100g: 1.6, carbsPer100g: 30.0, fatPer100g: 0.3, typicalGrams: 100 },
  { id: 'vegetable_fireweed', name: 'Fireweed Greens', category: 'vegetable', subcategory: 'fresh', cut: 'fireweed', icon: '', servingType: 'weight', caloriesPer100g: 44, proteinPer100g: 3.0, carbsPer100g: 6.3, fatPer100g: 0.8, typicalGrams: 100 },
  { id: 'vegetable_sourdock', name: 'Sourdock / Wild Greens', category: 'vegetable', subcategory: 'fresh', cut: 'sourdock', icon: '', servingType: 'weight', caloriesPer100g: 42, proteinPer100g: 2.3, carbsPer100g: 6.5, fatPer100g: 0.7, typicalGrams: 100 },
  { id: 'vegetable_willow_leaves', name: 'Willow Leaves', category: 'vegetable', subcategory: 'fresh', cut: 'willow_leaves', icon: '', servingType: 'weight', caloriesPer100g: 592, proteinPer100g: 2.6, carbsPer100g: 8.1, fatPer100g: 61.0, typicalGrams: 100 },
  { id: 'vegetable_seaweed_trad', name: 'Seaweed / Kelp', category: 'vegetable', subcategory: 'fresh', cut: 'seaweed_trad', icon: '', servingType: 'weight', caloriesPer100g: 298, proteinPer100g: 31.8, carbsPer100g: 52.4, fatPer100g: 4.0, typicalGrams: 100 },
  { id: 'vegetable_squash_indian', name: 'Squash, Indian', category: 'vegetable', subcategory: 'fresh', cut: 'squash_indian', icon: '', servingType: 'weight', caloriesPer100g: 16, proteinPer100g: 0.3, carbsPer100g: 3.2, fatPer100g: 0.1, typicalGrams: 100 },
  { id: 'vegetable_mashu_root', name: 'Mashu Roots', category: 'vegetable', subcategory: 'fresh', cut: 'mashu_root', icon: '', servingType: 'weight', caloriesPer100g: 135, proteinPer100g: 5.8, carbsPer100g: 22.6, fatPer100g: 2.4, typicalGrams: 100 },

];

export default foodsVegetables;
