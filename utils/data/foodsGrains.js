// Curated Grains -- Category (Grains) > Type (data/grainHierarchy.js's
// GRAIN_TYPES) > item list > food card.
//
// Replaces ~1,054 raw USDA grain rows with 97 curated ones -- roughly 11:1,
// the steepest collapse of any category, because breads and breakfast
// cereals are where USDA's branded and restaurant duplication is worst
// (169 branded rows, 66 restaurant/frozen/NFS variants of foods already
// covered). Those old rows are DELETED as part of this same round, the
// usual supersession pattern.
//
// Rice/Grains and Pasta carry a Dry / Cooked axis, same as Legumes and for
// the same reason -- grains absorb water, so 100g dry and 100g cooked are
// the same food in very different amounts.
//
// One ratio looks wrong and isn't: OATS is 5.3x (379 dry vs 71 cooked)
// where rice is ~2.8x. That's real -- porridge is cooked with far more
// water than rice absorbs, so cooked oatmeal is genuinely that dilute.
//
// Bread, Cereals, Flours and Breakfast Baked have no form axis.
//
// Two groups left this category in this round, both re-tagged in place
// rather than curated here (their own categories aren't organized yet):
//   * Baked desserts -- fritters, cream puffs, toaster pastries, sweet
//     rolls, croissants, strudel -> 'sweet'
//   * Crackers, pretzels, popcorn, chips -> 'snack'
// Pancakes, waffles, French toast and muffins deliberately STAYED (Damon's
// call) -- breakfast foods that happen to be cake-adjacent.
const foodsGrains = [
  // --- Rice & Grains ---
  // Dry / Cooked, the same axis Legumes uses and for the same reason: grains
  // absorb water, so 100g of dry rice (~365 kcal) and 100g of cooked rice
  // (~130 kcal) are the same food in very different amounts. People weigh it
  // both ways, so both are here and the card says which is which.
  // Data-gated -- a few grains have only one of the two in USDA.
  { id: 'grain_white_rice_dry', name: 'White Rice, Dry', category: 'grain', subcategory: 'grains', grainItem: 'white_rice', grainForm: 'dry', icon: '', servingType: 'weight', caloriesPer100g: 365, proteinPer100g: 7.1, carbsPer100g: 80.0, fatPer100g: 0.7, typicalGrams: 45 },
  { id: 'grain_white_rice_cooked', name: 'White Rice, Cooked', category: 'grain', subcategory: 'grains', grainItem: 'white_rice', grainForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28.2, fatPer100g: 0.3, typicalGrams: 158 },
  { id: 'grain_brown_rice_dry', name: 'Brown Rice, Dry', category: 'grain', subcategory: 'grains', grainItem: 'brown_rice', grainForm: 'dry', icon: '', servingType: 'weight', caloriesPer100g: 367, proteinPer100g: 7.5, carbsPer100g: 76.2, fatPer100g: 3.2, typicalGrams: 45 },
  { id: 'grain_brown_rice_cooked', name: 'Brown Rice, Cooked', category: 'grain', subcategory: 'grains', grainItem: 'brown_rice', grainForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 123, proteinPer100g: 2.7, carbsPer100g: 25.6, fatPer100g: 1.0, typicalGrams: 158 },
  { id: 'grain_wild_rice_dry', name: 'Wild Rice, Dry', category: 'grain', subcategory: 'grains', grainItem: 'wild_rice', grainForm: 'dry', icon: '', servingType: 'weight', caloriesPer100g: 357, proteinPer100g: 14.7, carbsPer100g: 74.9, fatPer100g: 1.1, typicalGrams: 45 },
  { id: 'grain_wild_rice_cooked', name: 'Wild Rice, Cooked', category: 'grain', subcategory: 'grains', grainItem: 'wild_rice', grainForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 101, proteinPer100g: 4.0, carbsPer100g: 21.3, fatPer100g: 0.3, typicalGrams: 158 },
  { id: 'grain_basmati_rice_dry', name: 'Basmati Rice, Dry', category: 'grain', subcategory: 'grains', grainItem: 'basmati_rice', grainForm: 'dry', icon: '', servingType: 'weight', caloriesPer100g: 380, proteinPer100g: 7.8, carbsPer100g: 82.3, fatPer100g: 0.9, typicalGrams: 45 },
  { id: 'grain_oats_dry', name: 'Oats, Dry', category: 'grain', subcategory: 'grains', grainItem: 'oats', grainForm: 'dry', icon: '', servingType: 'weight', caloriesPer100g: 379, proteinPer100g: 13.2, carbsPer100g: 67.7, fatPer100g: 6.5, typicalGrams: 45 },
  { id: 'grain_oats_cooked', name: 'Oats, Cooked', category: 'grain', subcategory: 'grains', grainItem: 'oats', grainForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 71, proteinPer100g: 2.5, carbsPer100g: 12.0, fatPer100g: 1.5, typicalGrams: 158 },
  { id: 'grain_quinoa_dry', name: 'Quinoa, Dry', category: 'grain', subcategory: 'grains', grainItem: 'quinoa', grainForm: 'dry', icon: '', servingType: 'weight', caloriesPer100g: 368, proteinPer100g: 14.1, carbsPer100g: 64.2, fatPer100g: 6.1, typicalGrams: 45 },
  { id: 'grain_quinoa_cooked', name: 'Quinoa, Cooked', category: 'grain', subcategory: 'grains', grainItem: 'quinoa', grainForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 120, proteinPer100g: 4.4, carbsPer100g: 21.3, fatPer100g: 1.9, typicalGrams: 158 },
  { id: 'grain_barley_dry', name: 'Barley, Dry', category: 'grain', subcategory: 'grains', grainItem: 'barley', grainForm: 'dry', icon: '', servingType: 'weight', caloriesPer100g: 352, proteinPer100g: 9.9, carbsPer100g: 77.7, fatPer100g: 1.2, typicalGrams: 45 },
  { id: 'grain_barley_cooked', name: 'Barley, Cooked', category: 'grain', subcategory: 'grains', grainItem: 'barley', grainForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 123, proteinPer100g: 2.3, carbsPer100g: 28.2, fatPer100g: 0.4, typicalGrams: 158 },
  { id: 'grain_bulgur_dry', name: 'Bulgur, Dry', category: 'grain', subcategory: 'grains', grainItem: 'bulgur', grainForm: 'dry', icon: '', servingType: 'weight', caloriesPer100g: 342, proteinPer100g: 12.3, carbsPer100g: 75.9, fatPer100g: 1.3, typicalGrams: 45 },
  { id: 'grain_bulgur_cooked', name: 'Bulgur, Cooked', category: 'grain', subcategory: 'grains', grainItem: 'bulgur', grainForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 83, proteinPer100g: 3.1, carbsPer100g: 18.6, fatPer100g: 0.2, typicalGrams: 158 },
  { id: 'grain_buckwheat_dry', name: 'Buckwheat, Dry', category: 'grain', subcategory: 'grains', grainItem: 'buckwheat', grainForm: 'dry', icon: '', servingType: 'weight', caloriesPer100g: 346, proteinPer100g: 11.7, carbsPer100g: 75.0, fatPer100g: 2.7, typicalGrams: 45 },
  { id: 'grain_buckwheat_cooked', name: 'Buckwheat, Cooked', category: 'grain', subcategory: 'grains', grainItem: 'buckwheat', grainForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 92, proteinPer100g: 3.4, carbsPer100g: 19.9, fatPer100g: 0.6, typicalGrams: 158 },
  { id: 'grain_millet_dry', name: 'Millet, Dry', category: 'grain', subcategory: 'grains', grainItem: 'millet', grainForm: 'dry', icon: '', servingType: 'weight', caloriesPer100g: 378, proteinPer100g: 11.0, carbsPer100g: 72.8, fatPer100g: 4.2, typicalGrams: 45 },
  { id: 'grain_millet_cooked', name: 'Millet, Cooked', category: 'grain', subcategory: 'grains', grainItem: 'millet', grainForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 119, proteinPer100g: 3.5, carbsPer100g: 23.7, fatPer100g: 1.0, typicalGrams: 158 },
  { id: 'grain_couscous_dry', name: 'Couscous, Dry', category: 'grain', subcategory: 'grains', grainItem: 'couscous', grainForm: 'dry', icon: '', servingType: 'weight', caloriesPer100g: 376, proteinPer100g: 12.8, carbsPer100g: 77.4, fatPer100g: 0.6, typicalGrams: 45 },
  { id: 'grain_couscous_cooked', name: 'Couscous, Cooked', category: 'grain', subcategory: 'grains', grainItem: 'couscous', grainForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 112, proteinPer100g: 3.8, carbsPer100g: 23.2, fatPer100g: 0.2, typicalGrams: 158 },
  { id: 'grain_farro_dry', name: 'Farro / Spelt, Dry', category: 'grain', subcategory: 'grains', grainItem: 'farro', grainForm: 'dry', icon: '', servingType: 'weight', caloriesPer100g: 338, proteinPer100g: 14.6, carbsPer100g: 70.2, fatPer100g: 2.4, typicalGrams: 45 },
  { id: 'grain_farro_cooked', name: 'Farro / Spelt, Cooked', category: 'grain', subcategory: 'grains', grainItem: 'farro', grainForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 127, proteinPer100g: 5.5, carbsPer100g: 26.4, fatPer100g: 0.9, typicalGrams: 158 },
  { id: 'grain_amaranth_dry', name: 'Amaranth, Dry', category: 'grain', subcategory: 'grains', grainItem: 'amaranth', grainForm: 'dry', icon: '', servingType: 'weight', caloriesPer100g: 371, proteinPer100g: 13.6, carbsPer100g: 65.2, fatPer100g: 7.0, typicalGrams: 45 },
  { id: 'grain_amaranth_cooked', name: 'Amaranth, Cooked', category: 'grain', subcategory: 'grains', grainItem: 'amaranth', grainForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 102, proteinPer100g: 3.8, carbsPer100g: 18.7, fatPer100g: 1.6, typicalGrams: 158 },
  { id: 'grain_sorghum_dry', name: 'Sorghum, Dry', category: 'grain', subcategory: 'grains', grainItem: 'sorghum', grainForm: 'dry', icon: '', servingType: 'weight', caloriesPer100g: 329, proteinPer100g: 10.6, carbsPer100g: 72.1, fatPer100g: 3.5, typicalGrams: 45 },
  { id: 'grain_teff_dry', name: 'Teff, Dry', category: 'grain', subcategory: 'grains', grainItem: 'teff', grainForm: 'dry', icon: '', servingType: 'weight', caloriesPer100g: 367, proteinPer100g: 13.3, carbsPer100g: 73.1, fatPer100g: 2.4, typicalGrams: 45 },
  { id: 'grain_teff_cooked', name: 'Teff, Cooked', category: 'grain', subcategory: 'grains', grainItem: 'teff', grainForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 101, proteinPer100g: 3.9, carbsPer100g: 19.9, fatPer100g: 0.7, typicalGrams: 158 },
  { id: 'grain_cornmeal_dry', name: 'Cornmeal / Polenta, Dry', category: 'grain', subcategory: 'grains', grainItem: 'cornmeal', grainForm: 'dry', icon: '', servingType: 'weight', caloriesPer100g: 362, proteinPer100g: 8.1, carbsPer100g: 76.9, fatPer100g: 3.6, typicalGrams: 45 },

  // --- Pasta & Noodles ---
  // Same Dry / Cooked axis, same reason.
  { id: 'grain_pasta_dry', name: 'Pasta (semolina), Dry', category: 'grain', subcategory: 'pasta', grainItem: 'pasta', grainForm: 'dry', icon: '', servingType: 'weight', caloriesPer100g: 371, proteinPer100g: 13.0, carbsPer100g: 74.7, fatPer100g: 1.5, typicalGrams: 56 },
  { id: 'grain_pasta_cooked', name: 'Pasta (semolina), Cooked', category: 'grain', subcategory: 'pasta', grainItem: 'pasta', grainForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 158, proteinPer100g: 5.8, carbsPer100g: 30.9, fatPer100g: 0.9, typicalGrams: 140 },
  { id: 'grain_pasta_whole_wheat_dry', name: 'Pasta, whole wheat, Dry', category: 'grain', subcategory: 'pasta', grainItem: 'pasta_whole_wheat', grainForm: 'dry', icon: '', servingType: 'weight', caloriesPer100g: 352, proteinPer100g: 13.9, carbsPer100g: 73.4, fatPer100g: 2.9, typicalGrams: 56 },
  { id: 'grain_pasta_whole_wheat_cooked', name: 'Pasta, whole wheat, Cooked', category: 'grain', subcategory: 'pasta', grainItem: 'pasta_whole_wheat', grainForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 149, proteinPer100g: 6.0, carbsPer100g: 30.1, fatPer100g: 1.7, typicalGrams: 140 },
  { id: 'grain_egg_noodles_dry', name: 'Egg Noodles, Dry', category: 'grain', subcategory: 'pasta', grainItem: 'egg_noodles', grainForm: 'dry', icon: '', servingType: 'weight', caloriesPer100g: 384, proteinPer100g: 14.2, carbsPer100g: 71.3, fatPer100g: 4.4, typicalGrams: 56 },
  { id: 'grain_egg_noodles_cooked', name: 'Egg Noodles, Cooked', category: 'grain', subcategory: 'pasta', grainItem: 'egg_noodles', grainForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 138, proteinPer100g: 4.5, carbsPer100g: 25.2, fatPer100g: 2.1, typicalGrams: 140 },
  { id: 'grain_rice_noodles_dry', name: 'Rice Noodles, Dry', category: 'grain', subcategory: 'pasta', grainItem: 'rice_noodles', grainForm: 'dry', icon: '', servingType: 'weight', caloriesPer100g: 351, proteinPer100g: 0.2, carbsPer100g: 86.1, fatPer100g: 0.1, typicalGrams: 56 },
  { id: 'grain_rice_noodles_cooked', name: 'Rice Noodles, Cooked', category: 'grain', subcategory: 'pasta', grainItem: 'rice_noodles', grainForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 108, proteinPer100g: 1.8, carbsPer100g: 24.0, fatPer100g: 0.2, typicalGrams: 140 },
  { id: 'grain_soba_dry', name: 'Soba (buckwheat) Noodles, Dry', category: 'grain', subcategory: 'pasta', grainItem: 'soba', grainForm: 'dry', icon: '', servingType: 'weight', caloriesPer100g: 336, proteinPer100g: 14.4, carbsPer100g: 74.6, fatPer100g: 0.7, typicalGrams: 56 },
  { id: 'grain_soba_cooked', name: 'Soba (buckwheat) Noodles, Cooked', category: 'grain', subcategory: 'pasta', grainItem: 'soba', grainForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 99, proteinPer100g: 5.1, carbsPer100g: 21.4, fatPer100g: 0.1, typicalGrams: 140 },
  { id: 'grain_macaroni_dry', name: 'Macaroni, Dry', category: 'grain', subcategory: 'pasta', grainItem: 'macaroni', grainForm: 'dry', icon: '', servingType: 'weight', caloriesPer100g: 367, proteinPer100g: 13.1, carbsPer100g: 74.9, fatPer100g: 1.0, typicalGrams: 56 },
  { id: 'grain_macaroni_cooked', name: 'Macaroni, Cooked', category: 'grain', subcategory: 'pasta', grainItem: 'macaroni', grainForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 128, proteinPer100g: 4.5, carbsPer100g: 26.6, fatPer100g: 0.1, typicalGrams: 140 },

  // --- Bread ---
  // No form axis -- a slice of bread is a slice of bread. Each is one row
  // and one card.
  { id: 'grain_white_bread', name: 'White Bread', category: 'grain', subcategory: 'bread', grainItem: 'white_bread', icon: '', servingType: 'weight', caloriesPer100g: 290, proteinPer100g: 9.0, carbsPer100g: 54.5, fatPer100g: 4.0, typicalGrams: 28 },
  { id: 'grain_whole_wheat_bread', name: 'Whole Wheat Bread', category: 'grain', subcategory: 'bread', grainItem: 'whole_wheat_bread', icon: '', servingType: 'weight', caloriesPer100g: 252, proteinPer100g: 12.4, carbsPer100g: 42.7, fatPer100g: 3.5, typicalGrams: 28 },
  { id: 'grain_multigrain_bread', name: 'Multigrain Bread', category: 'grain', subcategory: 'bread', grainItem: 'multigrain_bread', icon: '', servingType: 'weight', caloriesPer100g: 265, proteinPer100g: 13.4, carbsPer100g: 43.3, fatPer100g: 4.2, typicalGrams: 28 },
  { id: 'grain_sourdough', name: 'Sourdough Bread', category: 'grain', subcategory: 'bread', grainItem: 'sourdough', icon: '', servingType: 'weight', caloriesPer100g: 272, proteinPer100g: 10.8, carbsPer100g: 51.9, fatPer100g: 2.4, typicalGrams: 28 },
  { id: 'grain_rye_bread', name: 'Rye Bread', category: 'grain', subcategory: 'bread', grainItem: 'rye_bread', icon: '', servingType: 'weight', caloriesPer100g: 259, proteinPer100g: 8.5, carbsPer100g: 48.3, fatPer100g: 3.3, typicalGrams: 32 },
  { id: 'grain_pumpernickel', name: 'Pumpernickel', category: 'grain', subcategory: 'bread', grainItem: 'pumpernickel', icon: '', servingType: 'weight', caloriesPer100g: 250, proteinPer100g: 8.7, carbsPer100g: 47.5, fatPer100g: 3.1, typicalGrams: 32 },
  { id: 'grain_italian_bread', name: 'Italian Bread', category: 'grain', subcategory: 'bread', grainItem: 'italian_bread', icon: '', servingType: 'weight', caloriesPer100g: 259, proteinPer100g: 9.5, carbsPer100g: 48.1, fatPer100g: 2.7, typicalGrams: 30 },
  { id: 'grain_pita', name: 'Pita Bread', category: 'grain', subcategory: 'bread', grainItem: 'pita', icon: '', servingType: 'weight', caloriesPer100g: 275, proteinPer100g: 9.1, carbsPer100g: 55.7, fatPer100g: 1.2, typicalGrams: 60 },
  { id: 'grain_pita_whole_wheat', name: 'Pita, whole wheat', category: 'grain', subcategory: 'bread', grainItem: 'pita_whole_wheat', icon: '', servingType: 'weight', caloriesPer100g: 262, proteinPer100g: 9.8, carbsPer100g: 55.9, fatPer100g: 1.7, typicalGrams: 64 },
  { id: 'grain_flour_tortilla', name: 'Flour Tortilla', category: 'grain', subcategory: 'bread', grainItem: 'flour_tortilla', icon: '', servingType: 'weight', caloriesPer100g: 306, proteinPer100g: 8.2, carbsPer100g: 49.4, fatPer100g: 8.0, typicalGrams: 45 },
  { id: 'grain_corn_tortilla', name: 'Corn Tortilla', category: 'grain', subcategory: 'bread', grainItem: 'corn_tortilla', icon: '', servingType: 'weight', caloriesPer100g: 218, proteinPer100g: 5.7, carbsPer100g: 44.6, fatPer100g: 2.9, typicalGrams: 26 },
  { id: 'grain_bagel', name: 'Bagel', category: 'grain', subcategory: 'bread', grainItem: 'bagel', icon: '', servingType: 'weight', caloriesPer100g: 264, proteinPer100g: 10.6, carbsPer100g: 52.4, fatPer100g: 1.3, typicalGrams: 98 },
  { id: 'grain_english_muffin', name: 'English Muffin', category: 'grain', subcategory: 'bread', grainItem: 'english_muffin', icon: '', servingType: 'weight', caloriesPer100g: 235, proteinPer100g: 7.7, carbsPer100g: 46.0, fatPer100g: 1.8, typicalGrams: 57 },
  { id: 'grain_hamburger_bun', name: 'Hamburger / Hot Dog Bun', category: 'grain', subcategory: 'bread', grainItem: 'hamburger_bun', icon: '', servingType: 'weight', caloriesPer100g: 279, proteinPer100g: 9.8, carbsPer100g: 50.1, fatPer100g: 3.9, typicalGrams: 43 },
  { id: 'grain_dinner_roll', name: 'Dinner Roll', category: 'grain', subcategory: 'bread', grainItem: 'dinner_roll', icon: '', servingType: 'weight', caloriesPer100g: 310, proteinPer100g: 10.9, carbsPer100g: 52.0, fatPer100g: 6.5, typicalGrams: 28 },
  { id: 'grain_naan', name: 'Naan', category: 'grain', subcategory: 'bread', grainItem: 'naan', icon: '', servingType: 'weight', caloriesPer100g: 311, proteinPer100g: 11.1, carbsPer100g: 50.2, fatPer100g: 7.3, typicalGrams: 90 },
  { id: 'grain_cornbread', name: 'Cornbread', category: 'grain', subcategory: 'bread', grainItem: 'cornbread', icon: '', servingType: 'weight', caloriesPer100g: 330, proteinPer100g: 6.6, carbsPer100g: 54.5, fatPer100g: 9.6, typicalGrams: 60 },
  { id: 'grain_biscuit', name: 'Biscuit', category: 'grain', subcategory: 'bread', grainItem: 'biscuit', icon: '', servingType: 'weight', caloriesPer100g: 353, proteinPer100g: 7.0, carbsPer100g: 44.6, fatPer100g: 16.3, typicalGrams: 60 },

  // --- Breakfast Cereals ---
  // Generic types plus the brands USDA actually carries (Damon asked for
  // generic + big brands). The catch: of the household names, only Cheerios and Grape-Nuts
  // is in this database -- no Frosted Flakes, Special K, Rice Krispies, Froot
  // Loops, Lucky Charms or Chex. The generics are named recognisably instead
  // ('Fruit Rings', 'Frosted Oats with Marshmallows', 'Corn Squares') so they
  // are findable without claiming to be a brand they aren't.
  { id: 'grain_cereal_oat_os_plain', name: 'Toasted Oat O\'s', category: 'grain', subcategory: 'cereals', grainItem: 'cereal_oat_os_plain', icon: '', servingType: 'weight', caloriesPer100g: 374, proteinPer100g: 12.4, carbsPer100g: 67.9, fatPer100g: 6.2, typicalGrams: 28 },
  { id: 'grain_cereal_oat_os_honey_nut', name: 'Honey Nut Oat O\'s', category: 'grain', subcategory: 'cereals', grainItem: 'cereal_oat_os_honey_nut', icon: '', servingType: 'weight', caloriesPer100g: 385, proteinPer100g: 8.6, carbsPer100g: 76.0, fatPer100g: 5.4, typicalGrams: 28 },
  { id: 'grain_cereal_oat_os_multigrain', name: 'Multigrain O\'s', category: 'grain', subcategory: 'cereals', grainItem: 'cereal_oat_os_multigrain', icon: '', servingType: 'weight', caloriesPer100g: 373, proteinPer100g: 8.5, carbsPer100g: 76.2, fatPer100g: 3.8, typicalGrams: 28 },
  { id: 'grain_cereal_corn_flakes', name: 'Corn Flakes', category: 'grain', subcategory: 'cereals', grainItem: 'cereal_corn_flakes', icon: '', servingType: 'weight', caloriesPer100g: 365, proteinPer100g: 6.4, carbsPer100g: 79.5, fatPer100g: 1.6, typicalGrams: 28 },
  { id: 'grain_cereal_bran_flakes', name: 'Bran Flakes', category: 'grain', subcategory: 'cereals', grainItem: 'cereal_bran_flakes', icon: '', servingType: 'weight', caloriesPer100g: 361, proteinPer100g: 9.7, carbsPer100g: 75.0, fatPer100g: 2.4, typicalGrams: 30 },
  { id: 'grain_cereal_corn_squares', name: 'Corn Squares', category: 'grain', subcategory: 'cereals', grainItem: 'cereal_corn_squares', icon: '', servingType: 'weight', caloriesPer100g: 369, proteinPer100g: 7.9, carbsPer100g: 77.1, fatPer100g: 2.6, typicalGrams: 31 },
  { id: 'grain_cereal_oat_squares', name: 'Oat Squares', category: 'grain', subcategory: 'cereals', grainItem: 'cereal_oat_squares', icon: '', servingType: 'weight', caloriesPer100g: 379, proteinPer100g: 10.4, carbsPer100g: 73.3, fatPer100g: 5.2, typicalGrams: 48 },
  { id: 'grain_cereal_fruit_rings', name: 'Fruit Rings', category: 'grain', subcategory: 'cereals', grainItem: 'cereal_fruit_rings', icon: '', servingType: 'weight', caloriesPer100g: 383, proteinPer100g: 5.1, carbsPer100g: 82.2, fatPer100g: 3.2, typicalGrams: 29 },
  { id: 'grain_cereal_frosted_marshmallow', name: 'Frosted Oats with Marshmallows', category: 'grain', subcategory: 'cereals', grainItem: 'cereal_frosted_marshmallow', icon: '', servingType: 'weight', caloriesPer100g: 372, proteinPer100g: 8.2, carbsPer100g: 76.6, fatPer100g: 4.1, typicalGrams: 27 },
  { id: 'grain_cereal_cinnamon_toast', name: 'Cinnamon Toast Squares', category: 'grain', subcategory: 'cereals', grainItem: 'cereal_cinnamon_toast', icon: '', servingType: 'weight', caloriesPer100g: 414, proteinPer100g: 5.9, carbsPer100g: 75.2, fatPer100g: 9.9, typicalGrams: 31 },
  { id: 'grain_cereal_crisped_rice', name: 'Crisped Rice', category: 'grain', subcategory: 'cereals', grainItem: 'cereal_crisped_rice', icon: '', servingType: 'weight', caloriesPer100g: 383, proteinPer100g: 6.7, carbsPer100g: 86.2, fatPer100g: 1.3, typicalGrams: 28 },
  { id: 'grain_cereal_shredded_wheat', name: 'Shredded Wheat', category: 'grain', subcategory: 'cereals', grainItem: 'cereal_shredded_wheat', icon: '', servingType: 'weight', caloriesPer100g: 358, proteinPer100g: 11.9, carbsPer100g: 73.8, fatPer100g: 1.7, typicalGrams: 45 },
  { id: 'grain_cereal_granola', name: 'Granola', category: 'grain', subcategory: 'cereals', grainItem: 'cereal_granola', icon: '', servingType: 'weight', caloriesPer100g: 420, proteinPer100g: 9.8, carbsPer100g: 67.4, fatPer100g: 13.0, typicalGrams: 45 },
  { id: 'grain_cereal_raisin_bran', name: 'Raisin Bran', category: 'grain', subcategory: 'cereals', grainItem: 'cereal_raisin_bran', icon: '', servingType: 'weight', caloriesPer100g: 324, proteinPer100g: 7.6, carbsPer100g: 78.9, fatPer100g: 1.6, typicalGrams: 59 },
  { id: 'grain_cereal_oatmeal_cooked', name: 'Oatmeal, cooked', category: 'grain', subcategory: 'cereals', grainItem: 'cereal_oatmeal_cooked', icon: '', servingType: 'weight', caloriesPer100g: 71, proteinPer100g: 2.5, carbsPer100g: 12.0, fatPer100g: 1.5, typicalGrams: 234 },
  { id: 'grain_cereal_grits', name: 'Grits', category: 'grain', subcategory: 'cereals', grainItem: 'cereal_grits', icon: '', servingType: 'weight', caloriesPer100g: 71, proteinPer100g: 1.7, carbsPer100g: 14.8, fatPer100g: 0.5, typicalGrams: 233 },
  { id: 'grain_cereal_cream_of_wheat', name: 'Cream of Wheat', category: 'grain', subcategory: 'cereals', grainItem: 'cereal_cream_of_wheat', icon: '', servingType: 'weight', caloriesPer100g: 56, proteinPer100g: 1.7, carbsPer100g: 11.2, fatPer100g: 0.4, typicalGrams: 241 },
  { id: 'grain_cereal_cream_of_rice', name: 'Cream of Rice', category: 'grain', subcategory: 'cereals', grainItem: 'cereal_cream_of_rice', icon: '', servingType: 'weight', caloriesPer100g: 52, proteinPer100g: 0.9, carbsPer100g: 11.5, fatPer100g: 0.1, typicalGrams: 244 },
  { id: 'grain_cereal_cheerios', name: 'Cheerios', category: 'grain', subcategory: 'cereals', grainItem: 'cereal_cheerios', icon: '', servingType: 'weight', caloriesPer100g: 372, proteinPer100g: 12.4, carbsPer100g: 73.2, fatPer100g: 6.6, typicalGrams: 28 },
  { id: 'grain_cereal_grape_nuts', name: 'Grape-Nuts', category: 'grain', subcategory: 'cereals', grainItem: 'cereal_grape_nuts', icon: '', servingType: 'weight', caloriesPer100g: 361, proteinPer100g: 11.2, carbsPer100g: 80.5, fatPer100g: 1.8, typicalGrams: 58 },

  // --- Flours & Starches ---
  // One row per flour. USDA lists all-purpose flour four times
  // (enriched/unenriched x bleached/unbleached); those collapse to the
  // enriched+bleached row, which is what sits on almost every US shelf --
  // Damon's call, since the difference is small and few people know which
  // bag they own.
  { id: 'grain_all_purpose_flour', name: 'All-Purpose Flour', category: 'grain', subcategory: 'flours', grainItem: 'all_purpose_flour', icon: '', servingType: 'weight', caloriesPer100g: 364, proteinPer100g: 10.3, carbsPer100g: 76.3, fatPer100g: 1.0, typicalGrams: 30 },
  { id: 'grain_bread_flour', name: 'Bread Flour', category: 'grain', subcategory: 'flours', grainItem: 'bread_flour', icon: '', servingType: 'weight', caloriesPer100g: 361, proteinPer100g: 12.0, carbsPer100g: 72.5, fatPer100g: 1.7, typicalGrams: 30 },
  { id: 'grain_cake_flour', name: 'Cake Flour', category: 'grain', subcategory: 'flours', grainItem: 'cake_flour', icon: '', servingType: 'weight', caloriesPer100g: 362, proteinPer100g: 8.2, carbsPer100g: 78.0, fatPer100g: 0.9, typicalGrams: 30 },
  { id: 'grain_whole_wheat_flour', name: 'Whole Wheat Flour', category: 'grain', subcategory: 'flours', grainItem: 'whole_wheat_flour', icon: '', servingType: 'weight', caloriesPer100g: 332, proteinPer100g: 9.6, carbsPer100g: 74.5, fatPer100g: 2.0, typicalGrams: 30 },
  { id: 'grain_rice_flour_white', name: 'Rice Flour, white', category: 'grain', subcategory: 'flours', grainItem: 'rice_flour_white', icon: '', servingType: 'weight', caloriesPer100g: 366, proteinPer100g: 6.0, carbsPer100g: 80.1, fatPer100g: 1.4, typicalGrams: 30 },
  { id: 'grain_rice_flour_brown', name: 'Rice Flour, brown', category: 'grain', subcategory: 'flours', grainItem: 'rice_flour_brown', icon: '', servingType: 'weight', caloriesPer100g: 363, proteinPer100g: 7.2, carbsPer100g: 76.5, fatPer100g: 2.8, typicalGrams: 30 },
  { id: 'grain_corn_flour', name: 'Corn Flour', category: 'grain', subcategory: 'flours', grainItem: 'corn_flour', icon: '', servingType: 'weight', caloriesPer100g: 375, proteinPer100g: 5.6, carbsPer100g: 82.8, fatPer100g: 1.4, typicalGrams: 30 },
  { id: 'grain_semolina', name: 'Semolina', category: 'grain', subcategory: 'flours', grainItem: 'semolina', icon: '', servingType: 'weight', caloriesPer100g: 360, proteinPer100g: 12.7, carbsPer100g: 72.8, fatPer100g: 1.1, typicalGrams: 30 },
  { id: 'grain_rye_flour', name: 'Rye Flour', category: 'grain', subcategory: 'flours', grainItem: 'rye_flour', icon: '', servingType: 'weight', caloriesPer100g: 349, proteinPer100g: 10.9, carbsPer100g: 75.4, fatPer100g: 1.5, typicalGrams: 30 },
  { id: 'grain_oat_flour', name: 'Oat Flour', category: 'grain', subcategory: 'flours', grainItem: 'oat_flour', icon: '', servingType: 'weight', caloriesPer100g: 404, proteinPer100g: 14.7, carbsPer100g: 65.7, fatPer100g: 9.1, typicalGrams: 30 },
  { id: 'grain_cornstarch', name: 'Cornstarch', category: 'grain', subcategory: 'flours', grainItem: 'cornstarch', icon: '', servingType: 'weight', caloriesPer100g: 381, proteinPer100g: 0.3, carbsPer100g: 91.3, fatPer100g: 0.1, typicalGrams: 8 },
  { id: 'grain_wheat_bran', name: 'Wheat Bran', category: 'grain', subcategory: 'flours', grainItem: 'wheat_bran', icon: '', servingType: 'weight', caloriesPer100g: 216, proteinPer100g: 15.6, carbsPer100g: 64.5, fatPer100g: 4.3, typicalGrams: 15 },
  { id: 'grain_wheat_germ', name: 'Wheat Germ', category: 'grain', subcategory: 'flours', grainItem: 'wheat_germ', icon: '', servingType: 'weight', caloriesPer100g: 360, proteinPer100g: 23.2, carbsPer100g: 51.8, fatPer100g: 9.7, typicalGrams: 15 },

  // --- Breakfast Baked ---
  // Pancakes, waffles, French toast and muffins stay in Grains rather than
  // moving to Sweets with the cakes and pastries -- Damon's call. They're
  // breakfast foods that happen to be cake-adjacent.
  { id: 'grain_pancakes', name: 'Pancakes', category: 'grain', subcategory: 'breakfast', grainItem: 'pancakes', icon: '', servingType: 'weight', caloriesPer100g: 227, proteinPer100g: 6.4, carbsPer100g: 28.3, fatPer100g: 9.7, typicalGrams: 77 },
  { id: 'grain_waffles', name: 'Waffles', category: 'grain', subcategory: 'breakfast', grainItem: 'waffles', icon: '', servingType: 'weight', caloriesPer100g: 291, proteinPer100g: 7.9, carbsPer100g: 32.9, fatPer100g: 14.1, typicalGrams: 35 },
  { id: 'grain_french_toast', name: 'French Toast', category: 'grain', subcategory: 'breakfast', grainItem: 'french_toast', icon: '', servingType: 'weight', caloriesPer100g: 229, proteinPer100g: 7.7, carbsPer100g: 25.0, fatPer100g: 10.8, typicalGrams: 65 },
  { id: 'grain_muffin_blueberry', name: 'Muffin, blueberry', category: 'grain', subcategory: 'breakfast', grainItem: 'muffin_blueberry', icon: '', servingType: 'weight', caloriesPer100g: 375, proteinPer100g: 4.5, carbsPer100g: 53.0, fatPer100g: 16.1, typicalGrams: 113 },
  { id: 'grain_muffin_plain', name: 'Muffin, plain', category: 'grain', subcategory: 'breakfast', grainItem: 'muffin_plain', icon: '', servingType: 'weight', caloriesPer100g: 296, proteinPer100g: 6.9, carbsPer100g: 41.4, fatPer100g: 11.4, typicalGrams: 113 },  // --- Traditional Indigenous foods (v0.0.43, Decision 2) ---
  // These were tagged `mixed_dish` by the original USDA import and sat
  // there unreachable, even though they are single ingredients rather than
  // dishes. Moved here because this is where someone would look for them.
  // The "(Alaska Native)" / "(Navajo)" suffix in each name is kept
  // deliberately -- it identifies the specific preparation the numbers
  // were measured from, which is a real difference, not decoration.
  { id: 'grain_blue_cornmeal', name: 'Cornmeal, blue', category: 'grain', subcategory: 'flours', grainItem: 'blue_cornmeal', icon: '', servingType: 'weight', caloriesPer100g: 398, proteinPer100g: 10.4, carbsPer100g: 76.9, fatPer100g: 5.4, typicalGrams: 100 },
  { id: 'grain_corn_dried', name: 'Corn, dried', category: 'grain', subcategory: 'grains', grainItem: 'corn_dried', icon: '', servingType: 'weight', caloriesPer100g: 386, proteinPer100g: 9.9, carbsPer100g: 74.9, fatPer100g: 5.2, typicalGrams: 100 },
  { id: 'grain_frybread', name: 'Frybread', category: 'grain', subcategory: 'bread', grainItem: 'frybread', icon: '', servingType: 'weight', caloriesPer100g: 330, proteinPer100g: 6.7, carbsPer100g: 48.3, fatPer100g: 12.2, typicalGrams: 100 },
  { id: 'grain_kneel_down_bread', name: 'Kneel Down Bread', category: 'grain', subcategory: 'bread', grainItem: 'kneel_down_bread', icon: '', servingType: 'weight', caloriesPer100g: 195, proteinPer100g: 4.3, carbsPer100g: 39.5, fatPer100g: 2.2, typicalGrams: 100 },
  { id: 'grain_blue_corn_mush', name: 'Blue Corn Mush', category: 'grain', subcategory: 'grains', grainItem: 'blue_corn_mush', icon: '', servingType: 'weight', caloriesPer100g: 54, proteinPer100g: 0.7, carbsPer100g: 11.7, fatPer100g: 0.5, typicalGrams: 100 },

];

export default foodsGrains;
