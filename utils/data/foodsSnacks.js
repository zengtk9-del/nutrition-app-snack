// The curated Snacks list -- Category > Type > item > card, with labels and
// ordering in data/snackHierarchy.js. Replaces 458 raw USDA rows.
//
// Bars carry crossListCategories: ['sweet'] (Decision 9) -- a granola bar
// is reached for as a snack and as a sweet, so it appears under both,
// same arrangement as bell peppers.
//
// Two data-backed toggles:
//
//   Chips    Plain / Flavored / Baked / Reduced fat. NOT part of the icon
//            key: a BBQ crisp and a plain crisp are the same picture. This
//            follows the rule set for margarine's fat level in v0.0.41 --
//            an axis reaches the icon key only if it changes the drawing.
//
//   Popcorn  Air-popped / With butter / Microwave / Caramel coated. This
//            one matters: air-popped is 385 kcal/100g against microwave
//            butter at 518.

export const foodsSnacks = [
  // --- Chips ---
  { id: 'snack_potato_chips_plain', name: 'Potato Chips', category: 'snack', subcategory: 'chips', snackItem: 'potato_chips', snackVariety: 'plain', icon: '', servingType: 'weight', caloriesPer100g: 532, proteinPer100g: 6.4, carbsPer100g: 53.8, fatPer100g: 34.0, typicalGrams: 28 },
  { id: 'snack_potato_chips_flavored', name: 'Potato Chips, flavored', category: 'snack', subcategory: 'chips', snackItem: 'potato_chips', snackVariety: 'flavored', icon: '', servingType: 'weight', caloriesPer100g: 487, proteinPer100g: 6.5, carbsPer100g: 55.9, fatPer100g: 31.1, typicalGrams: 28 },
  { id: 'snack_potato_chips_baked', name: 'Potato Chips, baked', category: 'snack', subcategory: 'chips', snackItem: 'potato_chips', snackVariety: 'baked', icon: '', servingType: 'weight', caloriesPer100g: 469, proteinPer100g: 5.0, carbsPer100g: 71.4, fatPer100g: 18.2, typicalGrams: 28 },
  { id: 'snack_potato_chips_reduced_fat', name: 'Potato Chips, reduced fat', category: 'snack', subcategory: 'chips', snackItem: 'potato_chips', snackVariety: 'reduced_fat', icon: '', servingType: 'weight', caloriesPer100g: 482, proteinPer100g: 7.0, carbsPer100g: 67.1, fatPer100g: 20.6, typicalGrams: 28 },
  { id: 'snack_tortilla_chips_plain', name: 'Tortilla Chips', category: 'snack', subcategory: 'chips', snackItem: 'tortilla_chips', snackVariety: 'plain', icon: '', servingType: 'weight', caloriesPer100g: 472, proteinPer100g: 7.1, carbsPer100g: 67.8, fatPer100g: 20.7, typicalGrams: 28 },
  { id: 'snack_tortilla_chips_flavored', name: 'Tortilla Chips, flavored', category: 'snack', subcategory: 'chips', snackItem: 'tortilla_chips', snackVariety: 'flavored', icon: '', servingType: 'weight', caloriesPer100g: 519, proteinPer100g: 7.4, carbsPer100g: 60.8, fatPer100g: 27.4, typicalGrams: 28 },
  { id: 'snack_tortilla_chips_baked', name: 'Tortilla Chips, baked', category: 'snack', subcategory: 'chips', snackItem: 'tortilla_chips', snackVariety: 'baked', icon: '', servingType: 'weight', caloriesPer100g: 448, proteinPer100g: 11.0, carbsPer100g: 80.2, fatPer100g: 5.7, typicalGrams: 28 },
  { id: 'snack_tortilla_chips_reduced_fat', name: 'Tortilla Chips, reduced fat', category: 'snack', subcategory: 'chips', snackItem: 'tortilla_chips', snackVariety: 'reduced_fat', icon: '', servingType: 'weight', caloriesPer100g: 411, proteinPer100g: 10.9, carbsPer100g: 79.1, fatPer100g: 5.6, typicalGrams: 28 },
  { id: 'snack_corn_chips_plain', name: 'Corn Chips', category: 'snack', subcategory: 'chips', snackItem: 'corn_chips', snackVariety: 'plain', icon: '', servingType: 'weight', caloriesPer100g: 535, proteinPer100g: 6.1, carbsPer100g: 56.8, fatPer100g: 33.1, typicalGrams: 28 },
  { id: 'snack_corn_chips_flavored', name: 'Corn Chips, flavored', category: 'snack', subcategory: 'chips', snackItem: 'corn_chips', snackVariety: 'flavored', icon: '', servingType: 'weight', caloriesPer100g: 543, proteinPer100g: 6.1, carbsPer100g: 56.7, fatPer100g: 34.0, typicalGrams: 28 },
  { id: 'snack_cheese_puffs_plain', name: 'Cheese Puffs & Twists', category: 'snack', subcategory: 'chips', snackItem: 'cheese_puffs', snackVariety: 'plain', icon: '', servingType: 'weight', caloriesPer100g: 567, proteinPer100g: 5.5, carbsPer100g: 54.5, fatPer100g: 36.5, typicalGrams: 28 },
  { id: 'snack_cheese_puffs_reduced_fat', name: 'Cheese Puffs & Twists, reduced fat', category: 'snack', subcategory: 'chips', snackItem: 'cheese_puffs', snackVariety: 'reduced_fat', icon: '', servingType: 'weight', caloriesPer100g: 432, proteinPer100g: 8.5, carbsPer100g: 72.4, fatPer100g: 12.1, typicalGrams: 28 },
  { id: 'snack_multigrain_chips_plain', name: 'Multigrain Chips', category: 'snack', subcategory: 'chips', snackItem: 'multigrain_chips', snackVariety: 'plain', icon: '', servingType: 'weight', caloriesPer100g: 491, proteinPer100g: 8.0, carbsPer100g: 67.3, fatPer100g: 21.1, typicalGrams: 28 },
  { id: 'snack_pita_chips_plain', name: 'Pita Chips', category: 'snack', subcategory: 'chips', snackItem: 'pita_chips', snackVariety: 'plain', icon: '', servingType: 'weight', caloriesPer100g: 457, proteinPer100g: 11.8, carbsPer100g: 68.3, fatPer100g: 15.2, typicalGrams: 28 },
  { id: 'snack_plantain_chips_plain', name: 'Plantain Chips', category: 'snack', subcategory: 'chips', snackItem: 'plantain_chips', snackVariety: 'plain', icon: '', servingType: 'weight', caloriesPer100g: 531, proteinPer100g: 2.3, carbsPer100g: 63.8, fatPer100g: 29.6, typicalGrams: 28 },
  { id: 'snack_sweet_potato_chips_plain', name: 'Sweet Potato Chips', category: 'snack', subcategory: 'chips', snackItem: 'sweet_potato_chips', snackVariety: 'plain', icon: '', servingType: 'weight', caloriesPer100g: 529, proteinPer100g: 2.9, carbsPer100g: 56.5, fatPer100g: 32.2, typicalGrams: 28 },
  { id: 'snack_veggie_bean_chips_plain', name: 'Veggie & Bean Chips', category: 'snack', subcategory: 'chips', snackItem: 'veggie_bean_chips', snackVariety: 'plain', icon: '', servingType: 'weight', caloriesPer100g: 448, proteinPer100g: 14.6, carbsPer100g: 53.1, fatPer100g: 21.6, typicalGrams: 28 },
  { id: 'snack_rice_chips_plain', name: 'Rice Chips & Cakes', category: 'snack', subcategory: 'chips', snackItem: 'rice_chips', snackVariety: 'plain', icon: '', servingType: 'weight', caloriesPer100g: 384, proteinPer100g: 8.2, carbsPer100g: 81.5, fatPer100g: 2.8, typicalGrams: 28 },
  { id: 'snack_bagel_chips_plain', name: 'Bagel Chips', category: 'snack', subcategory: 'chips', snackItem: 'bagel_chips', snackVariety: 'plain', icon: '', servingType: 'weight', caloriesPer100g: 451, proteinPer100g: 12.3, carbsPer100g: 66.4, fatPer100g: 15.1, typicalGrams: 28 },
  { id: 'snack_onion_rings_snack_plain', name: 'Onion Flavored Rings', category: 'snack', subcategory: 'chips', snackItem: 'onion_rings_snack', snackVariety: 'plain', icon: '', servingType: 'weight', caloriesPer100g: 499, proteinPer100g: 7.7, carbsPer100g: 65.1, fatPer100g: 22.6, typicalGrams: 28 },
  { id: 'snack_corn_nuts_plain', name: 'Corn Nuts', category: 'snack', subcategory: 'chips', snackItem: 'corn_nuts', snackVariety: 'plain', icon: '', servingType: 'weight', caloriesPer100g: 446, proteinPer100g: 8.5, carbsPer100g: 71.9, fatPer100g: 15.6, typicalGrams: 28 },

  // --- Crackers ---
  { id: 'snack_saltine', name: 'Saltine Crackers', category: 'snack', subcategory: 'crackers', snackItem: 'saltine', icon: '', servingType: 'weight', caloriesPer100g: 393, proteinPer100g: 10.5, carbsPer100g: 82.3, fatPer100g: 1.6, typicalGrams: 16 },
  { id: 'snack_cheese_cracker', name: 'Cheese Crackers', category: 'snack', subcategory: 'crackers', snackItem: 'cheese_cracker', icon: '', servingType: 'weight', caloriesPer100g: 489, proteinPer100g: 10.9, carbsPer100g: 59.4, fatPer100g: 22.7, typicalGrams: 16 },
  { id: 'snack_butter_cracker', name: 'Butter / Round Crackers', category: 'snack', subcategory: 'crackers', snackItem: 'butter_cracker', icon: '', servingType: 'weight', caloriesPer100g: 510, proteinPer100g: 6.6, carbsPer100g: 61.3, fatPer100g: 26.4, typicalGrams: 16 },
  { id: 'snack_whole_wheat_cracker', name: 'Whole Wheat Crackers', category: 'snack', subcategory: 'crackers', snackItem: 'whole_wheat_cracker', icon: '', servingType: 'weight', caloriesPer100g: 427, proteinPer100g: 10.6, carbsPer100g: 69.6, fatPer100g: 14.1, typicalGrams: 16 },
  { id: 'snack_sandwich_cracker_cheese', name: 'Cracker Sandwich, cheese filled', category: 'snack', subcategory: 'crackers', snackItem: 'sandwich_cracker_cheese', icon: '', servingType: 'weight', caloriesPer100g: 477, proteinPer100g: 9.3, carbsPer100g: 61.7, fatPer100g: 21.1, typicalGrams: 28 },
  { id: 'snack_sandwich_cracker_pb', name: 'Cracker Sandwich, peanut butter filled', category: 'snack', subcategory: 'crackers', snackItem: 'sandwich_cracker_pb', icon: '', servingType: 'weight', caloriesPer100g: 494, proteinPer100g: 11.5, carbsPer100g: 58.4, fatPer100g: 24.5, typicalGrams: 28 },
  { id: 'snack_rye_cracker', name: 'Rye / Crispbread Crackers', category: 'snack', subcategory: 'crackers', snackItem: 'rye_cracker', icon: '', servingType: 'weight', caloriesPer100g: 334, proteinPer100g: 9.6, carbsPer100g: 80.4, fatPer100g: 0.9, typicalGrams: 16 },
  { id: 'snack_matzo', name: 'Matzo', category: 'snack', subcategory: 'crackers', snackItem: 'matzo', icon: '', servingType: 'weight', caloriesPer100g: 395, proteinPer100g: 10.0, carbsPer100g: 83.7, fatPer100g: 1.4, typicalGrams: 28 },
  { id: 'snack_melba_toast', name: 'Melba Toast', category: 'snack', subcategory: 'crackers', snackItem: 'melba_toast', icon: '', servingType: 'weight', caloriesPer100g: 390, proteinPer100g: 12.1, carbsPer100g: 76.6, fatPer100g: 3.2, typicalGrams: 16 },
  { id: 'snack_breadsticks', name: 'Breadsticks, hard', category: 'snack', subcategory: 'crackers', snackItem: 'breadsticks', icon: '', servingType: 'weight', caloriesPer100g: 412, proteinPer100g: 12.0, carbsPer100g: 68.4, fatPer100g: 9.5, typicalGrams: 16 },
  { id: 'snack_croutons', name: 'Croutons', category: 'snack', subcategory: 'crackers', snackItem: 'croutons', icon: '', servingType: 'weight', caloriesPer100g: 465, proteinPer100g: 10.8, carbsPer100g: 63.5, fatPer100g: 18.3, typicalGrams: 8 },

  // --- Pretzels ---
  { id: 'snack_pretzel_hard', name: 'Pretzels, hard', category: 'snack', subcategory: 'pretzels', snackItem: 'pretzel_hard', icon: '', servingType: 'weight', caloriesPer100g: 384, proteinPer100g: 10.0, carbsPer100g: 80.4, fatPer100g: 2.9, typicalGrams: 28 },
  { id: 'snack_pretzel_soft', name: 'Pretzels, soft', category: 'snack', subcategory: 'pretzels', snackItem: 'pretzel_soft', icon: '', servingType: 'weight', caloriesPer100g: 345, proteinPer100g: 8.0, carbsPer100g: 69.4, fatPer100g: 4.0, typicalGrams: 115 },
  { id: 'snack_pretzel_chips', name: 'Pretzel Chips', category: 'snack', subcategory: 'pretzels', snackItem: 'pretzel_chips', icon: '', servingType: 'weight', caloriesPer100g: 375, proteinPer100g: 9.8, carbsPer100g: 78.4, fatPer100g: 2.9, typicalGrams: 28 },
  { id: 'snack_pretzel_filled', name: 'Pretzels, filled', category: 'snack', subcategory: 'pretzels', snackItem: 'pretzel_filled', icon: '', servingType: 'weight', caloriesPer100g: 463, proteinPer100g: 9.8, carbsPer100g: 66.5, fatPer100g: 16.9, typicalGrams: 28 },
  { id: 'snack_pretzel_coated', name: 'Pretzels, coated', category: 'snack', subcategory: 'pretzels', snackItem: 'pretzel_coated', icon: '', servingType: 'weight', caloriesPer100g: 467, proteinPer100g: 7.0, carbsPer100g: 70.1, fatPer100g: 17.6, typicalGrams: 28 },

  // --- Popcorn ---
  { id: 'snack_popcorn_air_popped', name: 'Popcorn, air popped', category: 'snack', subcategory: 'popcorn', snackItem: 'popcorn', snackVariety: 'air_popped', icon: '', servingType: 'weight', caloriesPer100g: 385, proteinPer100g: 12.9, carbsPer100g: 77.5, fatPer100g: 4.5, typicalGrams: 28 },
  { id: 'snack_popcorn_oil_popped', name: 'Popcorn, oil popped', category: 'snack', subcategory: 'popcorn', snackItem: 'popcorn', snackVariety: 'oil_popped', icon: '', servingType: 'weight', caloriesPer100g: 430, proteinPer100g: 11.0, carbsPer100g: 65.8, fatPer100g: 15.3, typicalGrams: 28 },
  { id: 'snack_popcorn_microwave', name: 'Popcorn, microwave', category: 'snack', subcategory: 'popcorn', snackItem: 'popcorn', snackVariety: 'microwave', icon: '', servingType: 'weight', caloriesPer100g: 518, proteinPer100g: 9.1, carbsPer100g: 55.0, fatPer100g: 30.6, typicalGrams: 28 },
  { id: 'snack_popcorn_coated', name: 'Popcorn, coated', category: 'snack', subcategory: 'popcorn', snackItem: 'popcorn', snackVariety: 'coated', icon: '', servingType: 'weight', caloriesPer100g: 428, proteinPer100g: 3.8, carbsPer100g: 78.5, fatPer100g: 12.7, typicalGrams: 28 },

  // --- Bars ---
  { id: 'snack_granola_bar', name: 'Granola Bar', category: 'snack', subcategory: 'bars', crossListCategories: ['sweet'], snackItem: 'granola_bar', icon: '', servingType: 'weight', caloriesPer100g: 471, proteinPer100g: 10.1, carbsPer100g: 64.4, fatPer100g: 19.8, typicalGrams: 40 },
  { id: 'snack_granola_bar_chocolate', name: 'Granola Bar, chocolate coated', category: 'snack', subcategory: 'bars', crossListCategories: ['sweet'], snackItem: 'granola_bar_chocolate', icon: '', servingType: 'weight', caloriesPer100g: 480, proteinPer100g: 7.5, carbsPer100g: 65.0, fatPer100g: 20.4, typicalGrams: 40 },
  { id: 'snack_granola_bar_lowfat', name: 'Granola Bar, lowfat', category: 'snack', subcategory: 'bars', crossListCategories: ['sweet'], snackItem: 'granola_bar_lowfat', icon: '', servingType: 'weight', caloriesPer100g: 408, proteinPer100g: 4.2, carbsPer100g: 79.2, fatPer100g: 8.3, typicalGrams: 40 },
  { id: 'snack_fruit_nut_bar', name: 'Fruit & Nut Bar', category: 'snack', subcategory: 'bars', crossListCategories: ['sweet'], snackItem: 'fruit_nut_bar', icon: '', servingType: 'weight', caloriesPer100g: 502, proteinPer100g: 13.9, carbsPer100g: 43.7, fatPer100g: 32.3, typicalGrams: 40 },
  { id: 'snack_cereal_bar', name: 'Cereal Bar, fruit filled', category: 'snack', subcategory: 'bars', crossListCategories: ['sweet'], snackItem: 'cereal_bar', icon: '', servingType: 'weight', caloriesPer100g: 365, proteinPer100g: 4.2, carbsPer100g: 67.6, fatPer100g: 8.7, typicalGrams: 37 },
  { id: 'snack_breakfast_bar', name: 'Breakfast Bar', category: 'snack', subcategory: 'bars', crossListCategories: ['sweet'], snackItem: 'breakfast_bar', icon: '', servingType: 'weight', caloriesPer100g: 376, proteinPer100g: 4.4, carbsPer100g: 72.8, fatPer100g: 7.5, typicalGrams: 37 },
  { id: 'snack_protein_bar', name: 'Protein / Nutrition Bar', category: 'snack', subcategory: 'bars', crossListCategories: ['sweet'], snackItem: 'protein_bar', icon: '', servingType: 'weight', caloriesPer100g: 386, proteinPer100g: 22.4, carbsPer100g: 55.2, fatPer100g: 9.9, typicalGrams: 60 },
  { id: 'snack_milk_cereal_bar', name: 'Milk & Cereal Bar', category: 'snack', subcategory: 'bars', crossListCategories: ['sweet'], snackItem: 'milk_cereal_bar', icon: '', servingType: 'weight', caloriesPer100g: 413, proteinPer100g: 6.5, carbsPer100g: 72.0, fatPer100g: 11.0, typicalGrams: 40 },
  { id: 'snack_rice_krispie_treat', name: 'Crisped Rice Treat', category: 'snack', subcategory: 'bars', crossListCategories: ['sweet'], snackItem: 'rice_krispie_treat', icon: '', servingType: 'weight', caloriesPer100g: 417, proteinPer100g: 3.4, carbsPer100g: 80.5, fatPer100g: 9.0, typicalGrams: 22 },
  { id: 'snack_fruit_snack', name: 'Fruit Snacks / Roll-Ups', category: 'snack', subcategory: 'bars', crossListCategories: ['sweet'], snackItem: 'fruit_snack', icon: '', servingType: 'weight', caloriesPer100g: 373, proteinPer100g: 0.1, carbsPer100g: 85.2, fatPer100g: 3.5, typicalGrams: 23 },

  // --- Puffs, Mixes & Other ---
  { id: 'snack_trail_mix', name: 'Trail Mix', category: 'snack', subcategory: 'other', snackItem: 'trail_mix', icon: '', servingType: 'weight', caloriesPer100g: 462, proteinPer100g: 13.8, carbsPer100g: 44.9, fatPer100g: 29.4, typicalGrams: 40 },
  { id: 'snack_snack_mix', name: 'Snack Mix', category: 'snack', subcategory: 'other', snackItem: 'snack_mix', icon: '', servingType: 'weight', caloriesPer100g: 504, proteinPer100g: 6.9, carbsPer100g: 63.1, fatPer100g: 25.8, typicalGrams: 30 },
  { id: 'snack_chow_mein_noodles', name: 'Chow Mein Noodles', category: 'snack', subcategory: 'other', snackItem: 'chow_mein_noodles', icon: '', servingType: 'weight', caloriesPer100g: 521, proteinPer100g: 10.3, carbsPer100g: 51.9, fatPer100g: 31.7, typicalGrams: 28 },
  { id: 'snack_popcorn_cake', name: 'Popcorn / Rice Cake', category: 'snack', subcategory: 'other', snackItem: 'popcorn_cake', icon: '', servingType: 'weight', caloriesPer100g: 384, proteinPer100g: 9.7, carbsPer100g: 80.1, fatPer100g: 3.1, typicalGrams: 10 },
  { id: 'snack_pork_rinds', name: 'Pork Rinds', category: 'snack', subcategory: 'other', snackItem: 'pork_rinds', icon: '', servingType: 'weight', caloriesPer100g: 544, proteinPer100g: 61.3, carbsPer100g: 0.0, fatPer100g: 31.3, typicalGrams: 28 },
  { id: 'snack_beef_jerky_snack', name: 'Meat Snack Sticks', category: 'snack', subcategory: 'other', snackItem: 'beef_jerky_snack', icon: '', servingType: 'weight', caloriesPer100g: 410, proteinPer100g: 33.2, carbsPer100g: 11.0, fatPer100g: 25.6, typicalGrams: 20 },
];

export default foodsSnacks;
