// Curated Legumes -- Category (Legumes) > Type (data/legumeHierarchy.js's
// LEGUME_TYPES) > (sub-list where the Type has one) > food card.
//
// Replaces the ~443 raw USDA legume rows that used to sit spread across
// data/foods.js, foodsFNDDS2-3.js and foodsSRLegacy1-4.js with ~70 curated
// ones -- a 6.3:1 collapse, in line with Red Meat (9.7:1), Vegetables
// (7.1:1) and Poultry (6.7:1). Those old rows are DELETED as part of this
// same round so this file is the single source, the same supersession
// pattern data/foodsFruit.js, foodsEggs.js, foodsDairy.js and
// foodsVegetables.js already use.
//
// The core axis is Type x Form, the same shape Fruit uses:
//   Dried  -- the uncooked seed
//   Cooked -- boiled from dried, WITHOUT salt, so the number describes the
//             legume rather than someone's seasoning
//   Canned -- drained solids
// Form is data-gated: Adzuki, Mung, Pink and Yellow beans have no canned
// row in USDA, so their cards show only Dried and Cooked. (USDA does have
// a canned adzuki row, but it's the SWEETENED kind -- closer to red bean
// paste than to a can of beans -- so it's deliberately excluded rather
// than passed off as plain canned adzuki.)
//
// Three groups here are deliberately not plain legumes, all Damon's calls
// this round:
//   * Peanuts are botanically legumes but shopped as nuts, so they carry
//     crossListCategories: ['nut_seed'] and appear in BOTH places from one
//     row -- the same mechanism Bell Peppers use for Fruit/Vegetables.
//     When Nuts & Seeds gets its own organizing round they're already
//     curated and will simply show up there.
//   * Prepared dishes (hummus, falafel, refried/baked beans, chili, dal)
//     carry crossListCategories: ['mixed_dish'] for the same reason --
//     people look for hummus under Legumes but it is genuinely a prepared
//     food.
//   * Meat substitutes (meatless bacon, veggie hot dogs, vegetarian
//     stroganoff, ~25 rows) are NOT in this file. They were only filed as
//     'legume' because they're soy-based, and they now have their own
//     category chip -- re-tagged in place rather than curated here, since
//     they'll get their own organizing round later.
//
// Also dropped outright: 17 "(0% moisture)" rows. Those are lab reference
// values at zero moisture, not food anyone eats.
const foodsLegumes = [
  // --- Beans ---
  // Type x Form (Dried / Cooked / Canned), the same shape Fruit uses.
  // Cooked is boiled-from-dried WITHOUT salt, so the number reflects the
  // bean rather than someone's seasoning; Canned is drained solids.
  { id: 'legume_bean_black_dried', name: 'Black Beans, Dried', category: 'legume', subcategory: 'beans', legumeItem: 'black', legumeForm: 'dried', icon: '', servingType: 'weight', caloriesPer100g: 341, proteinPer100g: 21.6, carbsPer100g: 62.4, fatPer100g: 1.4, typicalGrams: 45 },
  { id: 'legume_bean_black_cooked', name: 'Black Beans, Cooked', category: 'legume', subcategory: 'beans', legumeItem: 'black', legumeForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 132, proteinPer100g: 8.9, carbsPer100g: 23.7, fatPer100g: 0.5, typicalGrams: 175 },
  { id: 'legume_bean_black_canned', name: 'Black Beans, Canned', category: 'legume', subcategory: 'beans', legumeItem: 'black', legumeForm: 'canned', icon: '', servingType: 'weight', caloriesPer100g: 91, proteinPer100g: 6.0, carbsPer100g: 16.6, fatPer100g: 0.3, typicalGrams: 175 },
  { id: 'legume_bean_pinto_dried', name: 'Pinto Beans, Dried', category: 'legume', subcategory: 'beans', legumeItem: 'pinto', legumeForm: 'dried', icon: '', servingType: 'weight', caloriesPer100g: 347, proteinPer100g: 21.4, carbsPer100g: 62.6, fatPer100g: 1.2, typicalGrams: 45 },
  { id: 'legume_bean_pinto_cooked', name: 'Pinto Beans, Cooked', category: 'legume', subcategory: 'beans', legumeItem: 'pinto', legumeForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 143, proteinPer100g: 9.0, carbsPer100g: 26.2, fatPer100g: 0.7, typicalGrams: 175 },
  { id: 'legume_bean_pinto_canned', name: 'Pinto Beans, Canned', category: 'legume', subcategory: 'beans', legumeItem: 'pinto', legumeForm: 'canned', icon: '', servingType: 'weight', caloriesPer100g: 82, proteinPer100g: 4.6, carbsPer100g: 15.2, fatPer100g: 0.6, typicalGrams: 175 },
  { id: 'legume_bean_kidney_dried', name: 'Kidney Beans, Dried', category: 'legume', subcategory: 'beans', legumeItem: 'kidney', legumeForm: 'dried', icon: '', servingType: 'weight', caloriesPer100g: 337, proteinPer100g: 22.5, carbsPer100g: 61.3, fatPer100g: 1.1, typicalGrams: 45 },
  { id: 'legume_bean_kidney_cooked', name: 'Kidney Beans, Cooked', category: 'legume', subcategory: 'beans', legumeItem: 'kidney', legumeForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 127, proteinPer100g: 8.7, carbsPer100g: 22.8, fatPer100g: 0.5, typicalGrams: 175 },
  { id: 'legume_bean_kidney_canned', name: 'Kidney Beans, Canned', category: 'legume', subcategory: 'beans', legumeItem: 'kidney', legumeForm: 'canned', icon: '', servingType: 'weight', caloriesPer100g: 124, proteinPer100g: 8.0, carbsPer100g: 21.5, fatPer100g: 1.1, typicalGrams: 175 },
  { id: 'legume_bean_navy_dried', name: 'Navy Beans, Dried', category: 'legume', subcategory: 'beans', legumeItem: 'navy', legumeForm: 'dried', icon: '', servingType: 'weight', caloriesPer100g: 337, proteinPer100g: 22.3, carbsPer100g: 60.8, fatPer100g: 1.5, typicalGrams: 45 },
  { id: 'legume_bean_navy_cooked', name: 'Navy Beans, Cooked', category: 'legume', subcategory: 'beans', legumeItem: 'navy', legumeForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 140, proteinPer100g: 8.2, carbsPer100g: 26.0, fatPer100g: 0.6, typicalGrams: 175 },
  { id: 'legume_bean_navy_canned', name: 'Navy Beans, Canned', category: 'legume', subcategory: 'beans', legumeItem: 'navy', legumeForm: 'canned', icon: '', servingType: 'weight', caloriesPer100g: 113, proteinPer100g: 7.5, carbsPer100g: 20.4, fatPer100g: 0.4, typicalGrams: 175 },
  { id: 'legume_bean_great_northern_dried', name: 'Great Northern Beans, Dried', category: 'legume', subcategory: 'beans', legumeItem: 'great_northern', legumeForm: 'dried', icon: '', servingType: 'weight', caloriesPer100g: 339, proteinPer100g: 21.9, carbsPer100g: 62.4, fatPer100g: 1.1, typicalGrams: 45 },
  { id: 'legume_bean_great_northern_cooked', name: 'Great Northern Beans, Cooked', category: 'legume', subcategory: 'beans', legumeItem: 'great_northern', legumeForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 118, proteinPer100g: 8.3, carbsPer100g: 21.1, fatPer100g: 0.5, typicalGrams: 175 },
  { id: 'legume_bean_great_northern_canned', name: 'Great Northern Beans, Canned', category: 'legume', subcategory: 'beans', legumeItem: 'great_northern', legumeForm: 'canned', icon: '', servingType: 'weight', caloriesPer100g: 114, proteinPer100g: 7.4, carbsPer100g: 21.0, fatPer100g: 0.4, typicalGrams: 175 },
  { id: 'legume_bean_white_dried', name: 'White / Cannellini Beans, Dried', category: 'legume', subcategory: 'beans', legumeItem: 'white', legumeForm: 'dried', icon: '', servingType: 'weight', caloriesPer100g: 333, proteinPer100g: 23.4, carbsPer100g: 60.3, fatPer100g: 0.9, typicalGrams: 45 },
  { id: 'legume_bean_white_cooked', name: 'White / Cannellini Beans, Cooked', category: 'legume', subcategory: 'beans', legumeItem: 'white', legumeForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 139, proteinPer100g: 9.7, carbsPer100g: 25.1, fatPer100g: 0.4, typicalGrams: 175 },
  { id: 'legume_bean_white_canned', name: 'White / Cannellini Beans, Canned', category: 'legume', subcategory: 'beans', legumeItem: 'white', legumeForm: 'canned', icon: '', servingType: 'weight', caloriesPer100g: 114, proteinPer100g: 7.3, carbsPer100g: 21.2, fatPer100g: 0.3, typicalGrams: 175 },
  { id: 'legume_bean_lima_dried', name: 'Lima Beans, Dried', category: 'legume', subcategory: 'beans', legumeItem: 'lima', legumeForm: 'dried', icon: '', servingType: 'weight', caloriesPer100g: 338, proteinPer100g: 21.5, carbsPer100g: 63.4, fatPer100g: 0.7, typicalGrams: 45 },
  { id: 'legume_bean_lima_cooked', name: 'Lima Beans, Cooked', category: 'legume', subcategory: 'beans', legumeItem: 'lima', legumeForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 115, proteinPer100g: 7.8, carbsPer100g: 20.9, fatPer100g: 0.4, typicalGrams: 175 },
  { id: 'legume_bean_lima_canned', name: 'Lima Beans, Canned', category: 'legume', subcategory: 'beans', legumeItem: 'lima', legumeForm: 'canned', icon: '', servingType: 'weight', caloriesPer100g: 79, proteinPer100g: 4.9, carbsPer100g: 14.9, fatPer100g: 0.2, typicalGrams: 175 },
  { id: 'legume_bean_cranberry_dried', name: 'Cranberry Beans, Dried', category: 'legume', subcategory: 'beans', legumeItem: 'cranberry', legumeForm: 'dried', icon: '', servingType: 'weight', caloriesPer100g: 335, proteinPer100g: 23.0, carbsPer100g: 60.0, fatPer100g: 1.2, typicalGrams: 45 },
  { id: 'legume_bean_cranberry_cooked', name: 'Cranberry Beans, Cooked', category: 'legume', subcategory: 'beans', legumeItem: 'cranberry', legumeForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 136, proteinPer100g: 9.3, carbsPer100g: 24.5, fatPer100g: 0.5, typicalGrams: 175 },
  { id: 'legume_bean_cranberry_canned', name: 'Cranberry Beans, Canned', category: 'legume', subcategory: 'beans', legumeItem: 'cranberry', legumeForm: 'canned', icon: '', servingType: 'weight', caloriesPer100g: 83, proteinPer100g: 5.5, carbsPer100g: 15.1, fatPer100g: 0.3, typicalGrams: 175 },
  { id: 'legume_bean_fava_dried', name: 'Fava Beans, Dried', category: 'legume', subcategory: 'beans', legumeItem: 'fava', legumeForm: 'dried', icon: '', servingType: 'weight', caloriesPer100g: 341, proteinPer100g: 26.1, carbsPer100g: 58.3, fatPer100g: 1.5, typicalGrams: 45 },
  { id: 'legume_bean_fava_cooked', name: 'Fava Beans, Cooked', category: 'legume', subcategory: 'beans', legumeItem: 'fava', legumeForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 110, proteinPer100g: 7.6, carbsPer100g: 19.6, fatPer100g: 0.4, typicalGrams: 175 },
  { id: 'legume_bean_fava_canned', name: 'Fava Beans, Canned', category: 'legume', subcategory: 'beans', legumeItem: 'fava', legumeForm: 'canned', icon: '', servingType: 'weight', caloriesPer100g: 71, proteinPer100g: 5.5, carbsPer100g: 12.4, fatPer100g: 0.2, typicalGrams: 175 },
  { id: 'legume_bean_adzuki_dried', name: 'Adzuki Beans, Dried', category: 'legume', subcategory: 'beans', legumeItem: 'adzuki', legumeForm: 'dried', icon: '', servingType: 'weight', caloriesPer100g: 329, proteinPer100g: 19.9, carbsPer100g: 62.9, fatPer100g: 0.5, typicalGrams: 45 },
  { id: 'legume_bean_adzuki_cooked', name: 'Adzuki Beans, Cooked', category: 'legume', subcategory: 'beans', legumeItem: 'adzuki', legumeForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 128, proteinPer100g: 7.5, carbsPer100g: 24.8, fatPer100g: 0.1, typicalGrams: 175 },
  { id: 'legume_bean_mung_dried', name: 'Mung Beans, Dried', category: 'legume', subcategory: 'beans', legumeItem: 'mung', legumeForm: 'dried', icon: '', servingType: 'weight', caloriesPer100g: 347, proteinPer100g: 23.9, carbsPer100g: 62.6, fatPer100g: 1.2, typicalGrams: 45 },
  { id: 'legume_bean_mung_cooked', name: 'Mung Beans, Cooked', category: 'legume', subcategory: 'beans', legumeItem: 'mung', legumeForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 105, proteinPer100g: 7.0, carbsPer100g: 19.2, fatPer100g: 0.4, typicalGrams: 175 },
  { id: 'legume_bean_pink_dried', name: 'Pink Beans, Dried', category: 'legume', subcategory: 'beans', legumeItem: 'pink', legumeForm: 'dried', icon: '', servingType: 'weight', caloriesPer100g: 343, proteinPer100g: 21.0, carbsPer100g: 64.2, fatPer100g: 1.1, typicalGrams: 45 },
  { id: 'legume_bean_pink_cooked', name: 'Pink Beans, Cooked', category: 'legume', subcategory: 'beans', legumeItem: 'pink', legumeForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 149, proteinPer100g: 9.1, carbsPer100g: 27.9, fatPer100g: 0.5, typicalGrams: 175 },
  { id: 'legume_bean_black_turtle_dried', name: 'Black Turtle Beans, Dried', category: 'legume', subcategory: 'beans', legumeItem: 'black_turtle', legumeForm: 'dried', icon: '', servingType: 'weight', caloriesPer100g: 339, proteinPer100g: 21.2, carbsPer100g: 63.2, fatPer100g: 0.9, typicalGrams: 45 },
  { id: 'legume_bean_black_turtle_cooked', name: 'Black Turtle Beans, Cooked', category: 'legume', subcategory: 'beans', legumeItem: 'black_turtle', legumeForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 130, proteinPer100g: 8.2, carbsPer100g: 24.4, fatPer100g: 0.4, typicalGrams: 175 },
  { id: 'legume_bean_black_turtle_canned', name: 'Black Turtle Beans, Canned', category: 'legume', subcategory: 'beans', legumeItem: 'black_turtle', legumeForm: 'canned', icon: '', servingType: 'weight', caloriesPer100g: 91, proteinPer100g: 6.0, carbsPer100g: 16.6, fatPer100g: 0.3, typicalGrams: 175 },
  { id: 'legume_bean_yellow_dried', name: 'Yellow Beans, Dried', category: 'legume', subcategory: 'beans', legumeItem: 'yellow', legumeForm: 'dried', icon: '', servingType: 'weight', caloriesPer100g: 345, proteinPer100g: 22.0, carbsPer100g: 60.7, fatPer100g: 2.6, typicalGrams: 45 },
  { id: 'legume_bean_yellow_cooked', name: 'Yellow Beans, Cooked', category: 'legume', subcategory: 'beans', legumeItem: 'yellow', legumeForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 144, proteinPer100g: 9.2, carbsPer100g: 25.3, fatPer100g: 1.1, typicalGrams: 175 },

  // --- Lentils, Chickpeas ---
  // Same Form axis, but no sub-list -- each is one food, so its Type goes
  // straight to a card.
  { id: 'legume_lentils_dried', name: 'Lentils, Dried', category: 'legume', subcategory: 'lentils', legumeItem: 'lentils', legumeForm: 'dried', icon: '', servingType: 'weight', caloriesPer100g: 352, proteinPer100g: 24.6, carbsPer100g: 63.4, fatPer100g: 1.1, typicalGrams: 45 },
  { id: 'legume_lentils_cooked', name: 'Lentils, Cooked', category: 'legume', subcategory: 'lentils', legumeItem: 'lentils', legumeForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 116, proteinPer100g: 9.0, carbsPer100g: 20.1, fatPer100g: 0.4, typicalGrams: 175 },
  { id: 'legume_lentils_canned', name: 'Lentils, Canned', category: 'legume', subcategory: 'lentils', legumeItem: 'lentils', legumeForm: 'canned', icon: '', servingType: 'weight', caloriesPer100g: 166, proteinPer100g: 8.4, carbsPer100g: 18.7, fatPer100g: 6.8, typicalGrams: 175 },
  { id: 'legume_chickpeas_dried', name: 'Chickpeas, Dried', category: 'legume', subcategory: 'chickpeas', legumeItem: 'chickpeas', legumeForm: 'dried', icon: '', servingType: 'weight', caloriesPer100g: 378, proteinPer100g: 20.5, carbsPer100g: 63.0, fatPer100g: 6.0, typicalGrams: 45 },
  { id: 'legume_chickpeas_cooked', name: 'Chickpeas, Cooked', category: 'legume', subcategory: 'chickpeas', legumeItem: 'chickpeas', legumeForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 164, proteinPer100g: 8.9, carbsPer100g: 27.4, fatPer100g: 2.6, typicalGrams: 175 },
  { id: 'legume_chickpeas_canned', name: 'Chickpeas, Canned', category: 'legume', subcategory: 'chickpeas', legumeItem: 'chickpeas', legumeForm: 'canned', icon: '', servingType: 'weight', caloriesPer100g: 139, proteinPer100g: 7.1, carbsPer100g: 22.5, fatPer100g: 2.8, typicalGrams: 175 },

  // --- Dried Peas ---
  { id: 'legume_pea_split_dried', name: 'Split Peas, Dried', category: 'legume', subcategory: 'peas', legumeItem: 'split', legumeForm: 'dried', icon: '', servingType: 'weight', caloriesPer100g: 364, proteinPer100g: 23.1, carbsPer100g: 61.6, fatPer100g: 3.9, typicalGrams: 45 },
  { id: 'legume_pea_blackeye_dried', name: 'Black-Eyed Peas, Dried', category: 'legume', subcategory: 'peas', legumeItem: 'blackeye', legumeForm: 'dried', icon: '', servingType: 'weight', caloriesPer100g: 336, proteinPer100g: 23.5, carbsPer100g: 60.0, fatPer100g: 1.3, typicalGrams: 45 },
  { id: 'legume_pea_blackeye_cooked', name: 'Black-Eyed Peas, Cooked', category: 'legume', subcategory: 'peas', legumeItem: 'blackeye', legumeForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 116, proteinPer100g: 7.7, carbsPer100g: 20.8, fatPer100g: 0.5, typicalGrams: 175 },
  { id: 'legume_pea_blackeye_canned', name: 'Black-Eyed Peas, Canned', category: 'legume', subcategory: 'peas', legumeItem: 'blackeye', legumeForm: 'canned', icon: '', servingType: 'weight', caloriesPer100g: 77, proteinPer100g: 4.7, carbsPer100g: 13.6, fatPer100g: 0.6, typicalGrams: 175 },
  { id: 'legume_pea_pigeon_dried', name: 'Pigeon Peas, Dried', category: 'legume', subcategory: 'peas', legumeItem: 'pigeon', legumeForm: 'dried', icon: '', servingType: 'weight', caloriesPer100g: 343, proteinPer100g: 21.7, carbsPer100g: 62.8, fatPer100g: 1.5, typicalGrams: 45 },
  { id: 'legume_pea_pigeon_cooked', name: 'Pigeon Peas, Cooked', category: 'legume', subcategory: 'peas', legumeItem: 'pigeon', legumeForm: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 121, proteinPer100g: 6.8, carbsPer100g: 23.2, fatPer100g: 0.4, typicalGrams: 175 },

  // --- Soy Products ---
  // Each is its own distinct product rather than a form of one food, so
  // these are a sub-list of single-row cards, not a Form toggle.
  { id: 'legume_soy_tofu_firm', name: 'Tofu, firm', category: 'legume', subcategory: 'soy', legumeItem: 'tofu_firm', icon: '', servingType: 'weight', caloriesPer100g: 144, proteinPer100g: 17.3, carbsPer100g: 2.8, fatPer100g: 8.7, typicalGrams: 126 },
  { id: 'legume_soy_tofu_soft', name: 'Tofu, soft', category: 'legume', subcategory: 'soy', legumeItem: 'tofu_soft', icon: '', servingType: 'weight', caloriesPer100g: 61, proteinPer100g: 7.2, carbsPer100g: 1.2, fatPer100g: 3.7, typicalGrams: 120 },
  { id: 'legume_soy_tempeh', name: 'Tempeh', category: 'legume', subcategory: 'soy', legumeItem: 'tempeh', icon: '', servingType: 'weight', caloriesPer100g: 192, proteinPer100g: 20.3, carbsPer100g: 7.6, fatPer100g: 10.8, typicalGrams: 84 },
  { id: 'legume_soy_edamame', name: 'Edamame', category: 'legume', subcategory: 'soy', legumeItem: 'edamame', icon: '', servingType: 'weight', caloriesPer100g: 121, proteinPer100g: 11.9, carbsPer100g: 8.9, fatPer100g: 5.2, typicalGrams: 155 },
  { id: 'legume_soy_soybeans_cooked', name: 'Soybeans, cooked', category: 'legume', subcategory: 'soy', legumeItem: 'soybeans_cooked', icon: '', servingType: 'weight', caloriesPer100g: 172, proteinPer100g: 18.2, carbsPer100g: 8.4, fatPer100g: 9.0, typicalGrams: 172 },
  { id: 'legume_soy_soy_nuts', name: 'Soy nuts (roasted)', category: 'legume', subcategory: 'soy', legumeItem: 'soy_nuts', icon: '', servingType: 'weight', caloriesPer100g: 449, proteinPer100g: 43.3, carbsPer100g: 29.0, fatPer100g: 21.6, typicalGrams: 86 },
  { id: 'legume_soy_natto', name: 'Natto', category: 'legume', subcategory: 'soy', legumeItem: 'natto', icon: '', servingType: 'weight', caloriesPer100g: 211, proteinPer100g: 19.4, carbsPer100g: 12.7, fatPer100g: 11.0, typicalGrams: 175 },
  { id: 'legume_soy_miso', name: 'Miso', category: 'legume', subcategory: 'soy', legumeItem: 'miso', icon: '', servingType: 'weight', caloriesPer100g: 198, proteinPer100g: 12.8, carbsPer100g: 25.4, fatPer100g: 6.0, typicalGrams: 17 },

  // --- Peanuts ---
  // Botanically legumes, shopped as nuts -- so they live here AND under
  // Nuts & Seeds via crossListCategories, the same one-row-two-places
  // mechanism Bell Peppers use for Fruit/Vegetables. Damon's call.
  // When Nuts & Seeds gets its own organizing round these are already
  // curated and will simply appear there too.
  { id: 'legume_peanuts_raw', name: 'Peanuts, raw', category: 'legume', subcategory: 'peanuts', legumeItem: 'peanuts_raw', crossListCategories: ['nut_seed'], icon: '', servingType: 'weight', caloriesPer100g: 567, proteinPer100g: 25.8, carbsPer100g: 16.1, fatPer100g: 49.2, typicalGrams: 28 },
  { id: 'legume_peanuts_dry_roasted', name: 'Peanuts, dry-roasted', category: 'legume', subcategory: 'peanuts', legumeItem: 'peanuts_dry_roasted', crossListCategories: ['nut_seed'], icon: '', servingType: 'weight', caloriesPer100g: 587, proteinPer100g: 24.4, carbsPer100g: 21.3, fatPer100g: 49.7, typicalGrams: 28 },
  { id: 'legume_peanuts_oil_roasted', name: 'Peanuts, oil-roasted', category: 'legume', subcategory: 'peanuts', legumeItem: 'peanuts_oil_roasted', crossListCategories: ['nut_seed'], icon: '', servingType: 'weight', caloriesPer100g: 599, proteinPer100g: 28.0, carbsPer100g: 15.3, fatPer100g: 52.5, typicalGrams: 28 },
  { id: 'legume_peanut_butter_smooth', name: 'Peanut butter, smooth', category: 'legume', subcategory: 'peanuts', legumeItem: 'peanut_butter_smooth', crossListCategories: ['nut_seed'], icon: '', servingType: 'weight', caloriesPer100g: 598, proteinPer100g: 22.2, carbsPer100g: 22.3, fatPer100g: 51.4, typicalGrams: 32 },
  { id: 'legume_peanut_butter_chunky', name: 'Peanut butter, chunky', category: 'legume', subcategory: 'peanuts', legumeItem: 'peanut_butter_chunky', crossListCategories: ['nut_seed'], icon: '', servingType: 'weight', caloriesPer100g: 589, proteinPer100g: 24.1, carbsPer100g: 21.6, fatPer100g: 49.9, typicalGrams: 32 },
  { id: 'legume_peanut_butter_reduced_fat', name: 'Peanut butter, reduced fat', category: 'legume', subcategory: 'peanuts', legumeItem: 'peanut_butter_reduced_fat', crossListCategories: ['nut_seed'], icon: '', servingType: 'weight', caloriesPer100g: 520, proteinPer100g: 25.9, carbsPer100g: 35.6, fatPer100g: 34.0, typicalGrams: 32 },

  // --- Prepared ---
  // Prepared legume dishes, cross-listed into Mixed Dishes as well as
  // living here (Damon's call). People log hummus and refried beans
  // constantly and look for them under Legumes, but they are genuinely
  // prepared foods -- so they appear in both rather than either.
  { id: 'legume_prep_hummus', name: 'Hummus', category: 'legume', subcategory: 'prepared', legumeItem: 'hummus', crossListCategories: ['mixed_dish', 'condiment_sauce'], icon: '', servingType: 'weight', caloriesPer100g: 229, proteinPer100g: 7.4, carbsPer100g: 14.9, fatPer100g: 17.1, typicalGrams: 60 },
  { id: 'legume_prep_falafel', name: 'Falafel', category: 'legume', subcategory: 'prepared', legumeItem: 'falafel', crossListCategories: ['mixed_dish'], icon: '', servingType: 'weight', caloriesPer100g: 514, proteinPer100g: 8.3, carbsPer100g: 29.0, fatPer100g: 41.2, typicalGrams: 51 },
  { id: 'legume_prep_refried_beans', name: 'Refried beans', category: 'legume', subcategory: 'prepared', legumeItem: 'refried_beans', crossListCategories: ['mixed_dish'], icon: '', servingType: 'weight', caloriesPer100g: 90, proteinPer100g: 5.0, carbsPer100g: 13.6, fatPer100g: 2.0, typicalGrams: 120 },
  { id: 'legume_prep_baked_beans', name: 'Baked beans', category: 'legume', subcategory: 'prepared', legumeItem: 'baked_beans', crossListCategories: ['mixed_dish'], icon: '', servingType: 'weight', caloriesPer100g: 94, proteinPer100g: 4.8, carbsPer100g: 21.1, fatPer100g: 0.4, typicalGrams: 127 },
  { id: 'legume_prep_chili_vegetarian', name: 'Chili, vegetarian', category: 'legume', subcategory: 'prepared', legumeItem: 'chili_vegetarian', crossListCategories: ['mixed_dish'], icon: '', servingType: 'weight', caloriesPer100g: 103, proteinPer100g: 6.1, carbsPer100g: 13.2, fatPer100g: 3.8, typicalGrams: 222 },
  { id: 'legume_prep_dal', name: 'Dal (lentil curry)', category: 'legume', subcategory: 'prepared', legumeItem: 'dal', crossListCategories: ['mixed_dish'], icon: '', servingType: 'weight', caloriesPer100g: 111, proteinPer100g: 3.7, carbsPer100g: 12.3, fatPer100g: 5.7, typicalGrams: 200 },
];

export default foodsLegumes;
