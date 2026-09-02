// Curated Nuts & Seeds -- Category (Nuts & Seeds) > Type
// (data/nutSeedHierarchy.js's NUT_SEED_TYPES) > item list > food card.
//
// Replaces the ~230 raw USDA nut/seed rows that used to sit spread across
// the USDA files with 50 curated ones. Those old rows are DELETED as part
// of this same round, the same supersession pattern Fruit, Eggs, Dairy,
// Vegetables and Legumes already use.
//
// The axis is a single PREPARATION toggle per item, data-gated hard --
// harder than any other category, because USDA's coverage here is
// genuinely lopsided:
//   Cashews, sunflower seeds  -- all 5 preps
//   Almonds, pecans           -- 4
//   Walnuts, brazil nuts,     -- ONE row each, and their USDA names carry
//   pine nuts, flax, hemp,       no raw/roasted wording at all, so their
//   chia, sesame, pumpkin        cards show no toggle whatsoever
// A one-row food still gets a card, an icon and a portion. That's the
// point of the rule, not an exception to it.
//
// Deliberately a single Preparation toggle rather than Prep x Salt: a
// two-axis grid would be empty in most cells, so the options are the real
// combinations ("Dry Roasted, Salted") rather than two toggles that
// contradict each other.
//
// Cross-listings, all Damon's calls this round -- one row surfacing in two
// or three places, the mechanism Bell Peppers use for Fruit/Vegetables:
//   Mixed nuts & trail mix -> also Snacks
//   Nut milks              -> also Beverages
//   Flours & meals         -> also Grains (and Legumes, for the soy and
//                             peanut flours)
//
// The Flours group also RESTORES the soy and peanut flours deleted in
// error during the Legumes round -- "move them out" was applied as a
// deletion, which silently removed 8 loggable foods.
//
// Peanuts and peanut butter are NOT in this file. They were curated in
// data/foodsLegumes.js and cross-list into this category from there, so
// duplicating them here would give two entries for one food.
//
// Coconut is not here either -- it moved to Fruit (see data/foodsFruit.js's
// coconut block). It's a drupe, and Fruit's Fresh/Dried/Canned axis fits
// its real forms exactly. Coconut flour would have lived in the Flours
// group below, but USDA carries no coconut-flour row at all.
//
// Known gaps, all because USDA simply has no row: almond flour, coconut
// flour, cashew milk, oat milk. Common on real shelves, absent from the
// database -- the same situation as havarti and mascarpone in Dairy.
const foodsNutsSeeds = [
  // --- Nuts ---
  // One Preparation toggle per nut, data-gated to what USDA actually has.
  // Coverage is more uneven here than in any other category: almonds carry
  // raw, dry-roasted and oil-roasted in both salt states, while brazil nuts,
  // pine nuts, chia, flax and hemp have exactly ONE row each. Those single-row
  // items show no toggle at all -- just a card, an icon and a portion.
  { id: 'nutseed_almond_dry_roasted_unsalted', name: 'Almonds, Dry Roasted, Unsalted', category: 'nut_seed', subcategory: 'nuts', nutItem: 'almond', nutPrep: 'dry_roasted_unsalted', icon: '', servingType: 'weight', caloriesPer100g: 598, proteinPer100g: 21.0, carbsPer100g: 21.0, fatPer100g: 52.5, typicalGrams: 28 },
  { id: 'nutseed_almond_dry_roasted_salted', name: 'Almonds, Dry Roasted, Salted', category: 'nut_seed', subcategory: 'nuts', nutItem: 'almond', nutPrep: 'dry_roasted_salted', icon: '', servingType: 'weight', caloriesPer100g: 620, proteinPer100g: 20.4, carbsPer100g: 16.2, fatPer100g: 57.8, typicalGrams: 28 },
  { id: 'nutseed_almond_oil_roasted_unsalted', name: 'Almonds, Oil Roasted, Unsalted', category: 'nut_seed', subcategory: 'nuts', nutItem: 'almond', nutPrep: 'oil_roasted_unsalted', icon: '', servingType: 'weight', caloriesPer100g: 607, proteinPer100g: 21.2, carbsPer100g: 17.7, fatPer100g: 55.2, typicalGrams: 28 },
  { id: 'nutseed_almond_oil_roasted_salted', name: 'Almonds, Oil Roasted, Salted', category: 'nut_seed', subcategory: 'nuts', nutItem: 'almond', nutPrep: 'oil_roasted_salted', icon: '', servingType: 'weight', caloriesPer100g: 607, proteinPer100g: 21.2, carbsPer100g: 17.7, fatPer100g: 55.2, typicalGrams: 28 },
  { id: 'nutseed_walnut', name: 'Walnuts', category: 'nut_seed', subcategory: 'nuts', nutItem: 'walnut', icon: '', servingType: 'weight', caloriesPer100g: 654, proteinPer100g: 15.2, carbsPer100g: 13.7, fatPer100g: 65.2, typicalGrams: 28 },
  { id: 'nutseed_cashew_raw', name: 'Cashews, Raw', category: 'nut_seed', subcategory: 'nuts', nutItem: 'cashew', nutPrep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 553, proteinPer100g: 18.2, carbsPer100g: 30.2, fatPer100g: 43.8, typicalGrams: 28 },
  { id: 'nutseed_cashew_dry_roasted_unsalted', name: 'Cashews, Dry Roasted, Unsalted', category: 'nut_seed', subcategory: 'nuts', nutItem: 'cashew', nutPrep: 'dry_roasted_unsalted', icon: '', servingType: 'weight', caloriesPer100g: 574, proteinPer100g: 15.3, carbsPer100g: 32.7, fatPer100g: 46.4, typicalGrams: 28 },
  { id: 'nutseed_cashew_dry_roasted_salted', name: 'Cashews, Dry Roasted, Salted', category: 'nut_seed', subcategory: 'nuts', nutItem: 'cashew', nutPrep: 'dry_roasted_salted', icon: '', servingType: 'weight', caloriesPer100g: 574, proteinPer100g: 15.3, carbsPer100g: 32.7, fatPer100g: 46.4, typicalGrams: 28 },
  { id: 'nutseed_cashew_oil_roasted_unsalted', name: 'Cashews, Oil Roasted, Unsalted', category: 'nut_seed', subcategory: 'nuts', nutItem: 'cashew', nutPrep: 'oil_roasted_unsalted', icon: '', servingType: 'weight', caloriesPer100g: 580, proteinPer100g: 16.8, carbsPer100g: 29.9, fatPer100g: 47.8, typicalGrams: 28 },
  { id: 'nutseed_cashew_oil_roasted_salted', name: 'Cashews, Oil Roasted, Salted', category: 'nut_seed', subcategory: 'nuts', nutItem: 'cashew', nutPrep: 'oil_roasted_salted', icon: '', servingType: 'weight', caloriesPer100g: 581, proteinPer100g: 16.8, carbsPer100g: 30.2, fatPer100g: 47.8, typicalGrams: 28 },
  { id: 'nutseed_pistachio_raw', name: 'Pistachios, Raw', category: 'nut_seed', subcategory: 'nuts', nutItem: 'pistachio', nutPrep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 560, proteinPer100g: 20.2, carbsPer100g: 27.2, fatPer100g: 45.3, typicalGrams: 28 },
  { id: 'nutseed_pistachio_dry_roasted_unsalted', name: 'Pistachios, Dry Roasted, Unsalted', category: 'nut_seed', subcategory: 'nuts', nutItem: 'pistachio', nutPrep: 'dry_roasted_unsalted', icon: '', servingType: 'weight', caloriesPer100g: 572, proteinPer100g: 21.0, carbsPer100g: 28.3, fatPer100g: 45.8, typicalGrams: 28 },
  { id: 'nutseed_pistachio_dry_roasted_salted', name: 'Pistachios, Dry Roasted, Salted', category: 'nut_seed', subcategory: 'nuts', nutItem: 'pistachio', nutPrep: 'dry_roasted_salted', icon: '', servingType: 'weight', caloriesPer100g: 569, proteinPer100g: 21.0, carbsPer100g: 27.6, fatPer100g: 45.8, typicalGrams: 28 },
  { id: 'nutseed_pecan_dry_roasted_unsalted', name: 'Pecans, Dry Roasted, Unsalted', category: 'nut_seed', subcategory: 'nuts', nutItem: 'pecan', nutPrep: 'dry_roasted_unsalted', icon: '', servingType: 'weight', caloriesPer100g: 710, proteinPer100g: 9.5, carbsPer100g: 13.6, fatPer100g: 74.3, typicalGrams: 28 },
  { id: 'nutseed_pecan_dry_roasted_salted', name: 'Pecans, Dry Roasted, Salted', category: 'nut_seed', subcategory: 'nuts', nutItem: 'pecan', nutPrep: 'dry_roasted_salted', icon: '', servingType: 'weight', caloriesPer100g: 710, proteinPer100g: 9.5, carbsPer100g: 13.6, fatPer100g: 74.3, typicalGrams: 28 },
  { id: 'nutseed_pecan_oil_roasted_unsalted', name: 'Pecans, Oil Roasted, Unsalted', category: 'nut_seed', subcategory: 'nuts', nutItem: 'pecan', nutPrep: 'oil_roasted_unsalted', icon: '', servingType: 'weight', caloriesPer100g: 715, proteinPer100g: 9.2, carbsPer100g: 13.0, fatPer100g: 75.2, typicalGrams: 28 },
  { id: 'nutseed_pecan_oil_roasted_salted', name: 'Pecans, Oil Roasted, Salted', category: 'nut_seed', subcategory: 'nuts', nutItem: 'pecan', nutPrep: 'oil_roasted_salted', icon: '', servingType: 'weight', caloriesPer100g: 715, proteinPer100g: 9.2, carbsPer100g: 13.0, fatPer100g: 75.2, typicalGrams: 28 },
  { id: 'nutseed_macadamia_raw', name: 'Macadamia Nuts, Raw', category: 'nut_seed', subcategory: 'nuts', nutItem: 'macadamia', nutPrep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 718, proteinPer100g: 7.9, carbsPer100g: 13.8, fatPer100g: 75.8, typicalGrams: 28 },
  { id: 'nutseed_macadamia_dry_roasted_unsalted', name: 'Macadamia Nuts, Dry Roasted, Unsalted', category: 'nut_seed', subcategory: 'nuts', nutItem: 'macadamia', nutPrep: 'dry_roasted_unsalted', icon: '', servingType: 'weight', caloriesPer100g: 718, proteinPer100g: 7.8, carbsPer100g: 13.4, fatPer100g: 76.1, typicalGrams: 28 },
  { id: 'nutseed_macadamia_dry_roasted_salted', name: 'Macadamia Nuts, Dry Roasted, Salted', category: 'nut_seed', subcategory: 'nuts', nutItem: 'macadamia', nutPrep: 'dry_roasted_salted', icon: '', servingType: 'weight', caloriesPer100g: 716, proteinPer100g: 7.8, carbsPer100g: 12.8, fatPer100g: 76.1, typicalGrams: 28 },
  { id: 'nutseed_hazelnut_dry_roasted_unsalted', name: 'Hazelnuts, Dry Roasted, Unsalted', category: 'nut_seed', subcategory: 'nuts', nutItem: 'hazelnut', nutPrep: 'dry_roasted_unsalted', icon: '', servingType: 'weight', caloriesPer100g: 646, proteinPer100g: 15.0, carbsPer100g: 17.6, fatPer100g: 62.4, typicalGrams: 28 },
  { id: 'nutseed_brazil_raw', name: 'Brazil Nuts, Raw', category: 'nut_seed', subcategory: 'nuts', nutItem: 'brazil', nutPrep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 659, proteinPer100g: 14.3, carbsPer100g: 11.7, fatPer100g: 67.1, typicalGrams: 28 },
  { id: 'nutseed_pine_nut_raw', name: 'Pine Nuts, Raw', category: 'nut_seed', subcategory: 'nuts', nutItem: 'pine_nut', nutPrep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 673, proteinPer100g: 13.7, carbsPer100g: 13.1, fatPer100g: 68.4, typicalGrams: 28 },
  { id: 'nutseed_chestnut_raw', name: 'Chestnuts, Raw', category: 'nut_seed', subcategory: 'nuts', nutItem: 'chestnut', nutPrep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 196, proteinPer100g: 1.6, carbsPer100g: 44.2, fatPer100g: 1.3, typicalGrams: 84 },

  // --- Seeds ---
  { id: 'nutseed_sunflower_raw', name: 'Sunflower Seeds, Raw', category: 'nut_seed', subcategory: 'seeds', nutItem: 'sunflower', nutPrep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 584, proteinPer100g: 20.8, carbsPer100g: 20.0, fatPer100g: 51.5, typicalGrams: 28 },
  { id: 'nutseed_sunflower_dry_roasted_unsalted', name: 'Sunflower Seeds, Dry Roasted, Unsalted', category: 'nut_seed', subcategory: 'seeds', nutItem: 'sunflower', nutPrep: 'dry_roasted_unsalted', icon: '', servingType: 'weight', caloriesPer100g: 582, proteinPer100g: 19.3, carbsPer100g: 24.1, fatPer100g: 49.8, typicalGrams: 28 },
  { id: 'nutseed_sunflower_dry_roasted_salted', name: 'Sunflower Seeds, Dry Roasted, Salted', category: 'nut_seed', subcategory: 'seeds', nutItem: 'sunflower', nutPrep: 'dry_roasted_salted', icon: '', servingType: 'weight', caloriesPer100g: 612, proteinPer100g: 21.0, carbsPer100g: 17.1, fatPer100g: 56.1, typicalGrams: 28 },
  { id: 'nutseed_sunflower_oil_roasted_unsalted', name: 'Sunflower Seeds, Oil Roasted, Unsalted', category: 'nut_seed', subcategory: 'seeds', nutItem: 'sunflower', nutPrep: 'oil_roasted_unsalted', icon: '', servingType: 'weight', caloriesPer100g: 592, proteinPer100g: 20.1, carbsPer100g: 22.9, fatPer100g: 51.3, typicalGrams: 28 },
  { id: 'nutseed_sunflower_oil_roasted_salted', name: 'Sunflower Seeds, Oil Roasted, Salted', category: 'nut_seed', subcategory: 'seeds', nutItem: 'sunflower', nutPrep: 'oil_roasted_salted', icon: '', servingType: 'weight', caloriesPer100g: 592, proteinPer100g: 20.1, carbsPer100g: 22.9, fatPer100g: 51.3, typicalGrams: 28 },
  { id: 'nutseed_pumpkin_raw', name: 'Pumpkin Seeds, Raw', category: 'nut_seed', subcategory: 'seeds', nutItem: 'pumpkin', nutPrep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 559, proteinPer100g: 30.2, carbsPer100g: 10.7, fatPer100g: 49.0, typicalGrams: 28 },
  { id: 'nutseed_sesame_raw', name: 'Sesame Seeds, Raw', category: 'nut_seed', subcategory: 'seeds', nutItem: 'sesame', nutPrep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 573, proteinPer100g: 17.7, carbsPer100g: 23.4, fatPer100g: 49.7, typicalGrams: 28 },
  { id: 'nutseed_chia_raw', name: 'Chia Seeds, Raw', category: 'nut_seed', subcategory: 'seeds', nutItem: 'chia', nutPrep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 486, proteinPer100g: 16.5, carbsPer100g: 42.1, fatPer100g: 30.7, typicalGrams: 28 },
  { id: 'nutseed_flax', name: 'Flaxseed', category: 'nut_seed', subcategory: 'seeds', nutItem: 'flax', icon: '', servingType: 'weight', caloriesPer100g: 534, proteinPer100g: 18.3, carbsPer100g: 28.9, fatPer100g: 42.2, typicalGrams: 28 },
  { id: 'nutseed_hemp', name: 'Hemp Seeds', category: 'nut_seed', subcategory: 'seeds', nutItem: 'hemp', icon: '', servingType: 'weight', caloriesPer100g: 553, proteinPer100g: 31.6, carbsPer100g: 8.7, fatPer100g: 48.8, typicalGrams: 28 },

  // --- Nut & Seed Butters ---
  // Peanut butter is NOT here -- it was curated in the Legumes round and
  // already cross-lists into this category, so duplicating it would give two
  // entries for one food.
  { id: 'nutseed_almond_butter', name: 'Almond Butter', category: 'nut_seed', subcategory: 'butters', nutItem: 'almond_butter', icon: '', servingType: 'weight', caloriesPer100g: 614, proteinPer100g: 21.0, carbsPer100g: 18.8, fatPer100g: 55.5, typicalGrams: 32 },
  { id: 'nutseed_cashew_butter', name: 'Cashew Butter', category: 'nut_seed', subcategory: 'butters', nutItem: 'cashew_butter', icon: '', servingType: 'weight', caloriesPer100g: 587, proteinPer100g: 17.6, carbsPer100g: 27.6, fatPer100g: 49.4, typicalGrams: 32 },
  { id: 'nutseed_tahini', name: 'Tahini (sesame paste)', category: 'nut_seed', subcategory: 'butters', nutItem: 'tahini', icon: '', servingType: 'weight', caloriesPer100g: 592, proteinPer100g: 17.4, carbsPer100g: 21.5, fatPer100g: 53.0, typicalGrams: 30 },
  { id: 'nutseed_sunflower_butter', name: 'Sunflower Seed Butter', category: 'nut_seed', subcategory: 'butters', nutItem: 'sunflower_butter', icon: '', servingType: 'weight', caloriesPer100g: 617, proteinPer100g: 17.3, carbsPer100g: 23.3, fatPer100g: 55.2, typicalGrams: 32 },

  // --- Mixed & Trail Mix ---
  // Cross-listed into Snacks as well (Damon's call) -- these are snack
  // products rather than a nut, but people look for them next to nuts.
  { id: 'nutseed_mixed_nuts_dry_roasted', name: 'Mixed nuts, dry roasted', category: 'nut_seed', subcategory: 'mixed', nutItem: 'mixed_nuts_dry_roasted', crossListCategories: ['snack'], icon: '', servingType: 'weight', caloriesPer100g: 594, proteinPer100g: 17.3, carbsPer100g: 25.4, fatPer100g: 51.4, typicalGrams: 28 },
  { id: 'nutseed_mixed_nuts_oil_roasted', name: 'Mixed nuts, oil roasted', category: 'nut_seed', subcategory: 'mixed', nutItem: 'mixed_nuts_oil_roasted', crossListCategories: ['snack'], icon: '', servingType: 'weight', caloriesPer100g: 607, proteinPer100g: 20.0, carbsPer100g: 21.0, fatPer100g: 54.0, typicalGrams: 28 },
  { id: 'nutseed_trail_mix_regular', name: 'Trail mix, regular', category: 'nut_seed', subcategory: 'mixed', nutItem: 'trail_mix_regular', crossListCategories: ['snack'], icon: '', servingType: 'weight', caloriesPer100g: 462, proteinPer100g: 13.8, carbsPer100g: 44.9, fatPer100g: 29.4, typicalGrams: 40 },
  { id: 'nutseed_trail_mix_tropical', name: 'Trail mix, tropical', category: 'nut_seed', subcategory: 'mixed', nutItem: 'trail_mix_tropical', crossListCategories: ['snack'], icon: '', servingType: 'weight', caloriesPer100g: 442, proteinPer100g: 6.3, carbsPer100g: 65.6, fatPer100g: 17.1, typicalGrams: 40 },
  { id: 'nutseed_trail_mix_chocolate', name: 'Trail mix with chocolate chips', category: 'nut_seed', subcategory: 'mixed', nutItem: 'trail_mix_chocolate', crossListCategories: ['snack'], icon: '', servingType: 'weight', caloriesPer100g: 484, proteinPer100g: 14.2, carbsPer100g: 44.9, fatPer100g: 31.9, typicalGrams: 40 },

  // --- Nut Milks ---
  // Cross-listed into Beverages as well. Coconut milk as a DRINK lives here;
  // canned coconut milk for cooking moved to Fruit with the rest of coconut.
  { id: 'nutseed_almond_milk', name: 'Almond milk, unsweetened', category: 'nut_seed', subcategory: 'milks', nutItem: 'almond_milk', crossListCategories: ['beverage'], icon: '', servingType: 'weight', caloriesPer100g: 15, proteinPer100g: 0.4, carbsPer100g: 1.3, fatPer100g: 1.0, typicalGrams: 240 },
  { id: 'nutseed_almond_milk_sweetened', name: 'Almond milk, sweetened', category: 'nut_seed', subcategory: 'milks', nutItem: 'almond_milk_sweetened', crossListCategories: ['beverage'], icon: '', servingType: 'weight', caloriesPer100g: 30, proteinPer100g: 0.5, carbsPer100g: 4.3, fatPer100g: 1.2, typicalGrams: 240 },

  // --- Flours & Meals ---
  // Cross-listed into Grains as well. This group also RESTORES the soy and
  // peanut flours that were deleted in error during the Legumes round --
  // 'move them out' was applied as a deletion, which removed 8 loggable
  // foods. Peanut flour additionally cross-lists to Legumes (peanuts are
  // curated there), and coconut flour to Fruit (coconut moved there).
  { id: 'nutseed_sesame_flour', name: 'Sesame flour', category: 'nut_seed', subcategory: 'flours', nutItem: 'sesame_flour', crossListCategories: ['grain'], icon: '', servingType: 'weight', caloriesPer100g: 333, proteinPer100g: 50.1, carbsPer100g: 35.5, fatPer100g: 1.8, typicalGrams: 28 },
  { id: 'nutseed_soy_flour_full_fat', name: 'Soy flour, full-fat', category: 'nut_seed', subcategory: 'flours', nutItem: 'soy_flour_full_fat', crossListCategories: ['grain', 'legume'], icon: '', servingType: 'weight', caloriesPer100g: 434, proteinPer100g: 37.8, carbsPer100g: 31.9, fatPer100g: 20.6, typicalGrams: 28 },
  { id: 'nutseed_soy_flour_defatted', name: 'Soy flour, defatted', category: 'nut_seed', subcategory: 'flours', nutItem: 'soy_flour_defatted', crossListCategories: ['grain', 'legume'], icon: '', servingType: 'weight', caloriesPer100g: 327, proteinPer100g: 51.5, carbsPer100g: 33.9, fatPer100g: 1.2, typicalGrams: 28 },
  { id: 'nutseed_peanut_flour_defatted', name: 'Peanut flour, defatted', category: 'nut_seed', subcategory: 'flours', nutItem: 'peanut_flour_defatted', crossListCategories: ['grain', 'legume'], icon: '', servingType: 'weight', caloriesPer100g: 327, proteinPer100g: 52.2, carbsPer100g: 34.7, fatPer100g: 0.6, typicalGrams: 28 },
  { id: 'nutseed_peanut_flour_low_fat', name: 'Peanut flour, low fat', category: 'nut_seed', subcategory: 'flours', nutItem: 'peanut_flour_low_fat', crossListCategories: ['grain', 'legume'], icon: '', servingType: 'weight', caloriesPer100g: 428, proteinPer100g: 33.8, carbsPer100g: 31.3, fatPer100g: 21.9, typicalGrams: 28 },
];

export default foodsNutsSeeds;
