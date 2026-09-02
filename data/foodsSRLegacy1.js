// USDA FoodData Central: SR Legacy dataset -- part 1 of 4.
// Split into several files purely so each one is small enough to
// comfortably paste into Snack's editor -- these all get combined
// into the single `foods` array the rest of the app uses, via
// data/foods.js. Nothing else in the app imports this file directly.
// See foodsSRLegacy1.js through foodsSRLegacy4.js for the rest.
//
// Every entry here uses servingType: 'weight' (per-100g values +
// typicalGrams as a reasonable default starting serving) -- see
// data/foods.js's header comment for the full explanation of that
// format and of why icon is blank for every entry (pending custom
// icon design).
//
// Red Meat, Poultry, and Seafood entries used to live in this file too --
// they've all been moved out to data/foodsRedMeat.js, data/foodsPoultry.js,
// and data/foodsSeafood.js, which group them into small curated
// Category > Type > Cut pickers instead of thousands of near-duplicate
// USDA trim/grade/prep/species variants. A handful of poultry items that
// were mislabeled 'red_meat' by the original USDA import (turkey/chicken
// deli meats, frankfurters, etc.) had briefly moved to category: 'poultry'
// here before being folded into data/foodsPoultry.js along with the rest.
const foodsSRLegacy1 = [
  // category: grain
  // category: sweet
  // category: grain
  // category: sweet
  // category: grain
  // category: snack
  // category: sweet
  // category: snack
  // category: sweet
  // category: snack
  // category: sweet
  // category: grain
  // category: sweet
  // category: grain
  // category: sweet
  // category: vegetable
  // category: mixed_dish
  // category: beverage
  // category: sweet
  // category: fat_oil
  // category: sweet
  // category: dairy
  // category: sweet
  // category: baby_food
  // category: fat_oil
  // category: fat_oil
  // category: dairy
  // category: fat_oil
  // category: sweet
  // category: fat_oil
  // category: dairy
  // category: fat_oil
  // category: dairy
  // category: sweet
  // category: beverage
  // category: beverage
  // category: vegetable
  // category: grain
  // category: dairy
  // category: vegetable
  // category: beverage
  // category: legume
  // category: baby_food
  // category: beverage
  // category: legume
  // category: beverage
  // category: grain
  // category: baby_food
  // category: beverage
  // category: baby_food
  // category: beverage
  // category: dairy
  // category: baby_food
  // category: snack
  // category: dairy
  // category: fat_oil
  // category: sweet
  // category: beverage
  // category: sweet
  // category: sweet
  // category: fruit
  // category: beverage
  // category: fruit
  // category: beverage
  // category: fruit
  // category: beverage
  // category: fruit
  // category: beverage
  // category: fruit
  // category: beverage
  // category: fruit
  // category: beverage
  // category: fruit
  // category: beverage
  // category: fruit
  // category: beverage
  // category: fruit
  // category: beverage
  // category: fruit
  // category: beverage
  // category: fruit
  // category: beverage
  // category: grain
  // category: sweet
  // category: grain
  // category: sweet
  // category: grain
  // category: sweet
  // category: grain
  // category: sweet
  // category: grain
  // category: sweet
  // category: snack
  // category: sweet
  // category: snack
  // category: sweet
  // category: snack
  // category: sweet
  // category: grain
  // category: sweet
  // category: grain
  // category: sweet
  // category: vegetable
  // category: mixed_dish
  // category: sweet
  // category: dairy
  // category: beverage
  // category: fat_oil
  // category: snack
  // category: fat_oil
  // category: dairy
  // category: fat_oil
  // category: sweet
  // category: legume
  // category: snack
  // category: sweet
  // category: fat_oil
  // category: beverage
  // category: dairy
  // category: fat_oil
  // category: snack
  // category: beverage
  // category: vegetable
  // category: dairy
  // category: beverage
  // category: dairy
  // category: baby_food
  // category: grain
  // category: snack
  // category: legume
  // category: sweet
  // category: baby_food
  // category: sweet
  // category: snack
  // category: grain
  // category: snack
  // category: baby_food
  // category: dairy
  // category: sweet
  // category: beverage
  // category: sweet
  // category: grain
  // category: fruit
  // category: beverage
  // category: fruit
  // category: beverage
  // category: fruit
  // category: beverage
  // category: fruit
  // category: beverage
  // category: fruit
  // category: beverage
  // category: fruit
  // category: beverage
  // category: fruit
  // category: beverage
  // category: vegetable
  { id: 'beans_kidney_mature_seeds_sprouted_cooked_boiled_drained_without_salt', name: 'Beans, kidney, mature seeds, sprouted, cooked, boiled, drained, without salt', category: 'vegetable', icon: '', servingType: 'weight', caloriesPer100g: 33, proteinPer100g: 4.8, carbsPer100g: 4.7, fatPer100g: 0.6, typicalGrams: 100 },
  { id: 'lentils_sprouted_raw', name: 'Lentils, sprouted, raw', category: 'vegetable', icon: '', servingType: 'weight', caloriesPer100g: 106, proteinPer100g: 9, carbsPer100g: 22.1, fatPer100g: 0.6, typicalGrams: 77 },
  { id: 'lentils_sprouted_cooked_stir_fried_without_salt', name: 'Lentils, sprouted, cooked, stir-fried, without salt', category: 'vegetable', icon: '', servingType: 'weight', caloriesPer100g: 101, proteinPer100g: 8.8, carbsPer100g: 21.2, fatPer100g: 0.5, typicalGrams: 100 },
  // Also tagged into the new Fruit > Fresh > Pumpkin drill-down
  // (data/fruitHierarchy.js) and cross-listed there via
  // crossListCategories -- see data/foods.js's Avocado entry comment for
  // why (Pumpkin is one of the same dual fruit/vegetable items, just
  // living in this file instead of data/foods.js).
  { id: 'pumpkin_raw', name: 'Pumpkin, raw', category: 'vegetable', subcategory: 'fresh', cut: 'pumpkin', crossListCategories: ['fruit'], icon: '', servingType: 'weight', caloriesPer100g: 26, proteinPer100g: 1, carbsPer100g: 6.5, fatPer100g: 0.1, typicalGrams: 116 },
  { id: 'soybeans_mature_seeds_sprouted_cooked_steamed', name: 'Soybeans, mature seeds, sprouted, cooked, steamed', category: 'vegetable', icon: '', servingType: 'weight', caloriesPer100g: 81, proteinPer100g: 8.5, carbsPer100g: 6.5, fatPer100g: 4.5, typicalGrams: 94 },
  { id: 'soybeans_mature_seeds_sprouted_cooked_stir_fried', name: 'Soybeans, mature seeds, sprouted, cooked, stir-fried', category: 'vegetable', icon: '', servingType: 'weight', caloriesPer100g: 125, proteinPer100g: 13.1, carbsPer100g: 9.4, fatPer100g: 7.1, typicalGrams: 100 },
  { id: 'mung_beans_mature_seeds_sprouted_cooked_boiled_drained_with_salt', name: 'Mung beans, mature seeds, sprouted, cooked, boiled, drained, with salt', category: 'vegetable', icon: '', servingType: 'weight', caloriesPer100g: 19, proteinPer100g: 2, carbsPer100g: 3.6, fatPer100g: 0.1, typicalGrams: 124 },
  { id: 'beans_navy_mature_seeds_sprouted_cooked_boiled_drained_with_salt', name: 'Beans, navy, mature seeds, sprouted, cooked, boiled, drained, with salt', category: 'vegetable', icon: '', servingType: 'weight', caloriesPer100g: 78, proteinPer100g: 7.1, carbsPer100g: 15, fatPer100g: 0.8, typicalGrams: 100 },
  { id: 'lentils_sprouted_cooked_stir_fried_with_salt', name: 'Lentils, sprouted, cooked, stir-fried, with salt', category: 'vegetable', icon: '', servingType: 'weight', caloriesPer100g: 101, proteinPer100g: 8.8, carbsPer100g: 21.2, fatPer100g: 0.5, typicalGrams: 100 },
  // category: nut_seed
  // category: beverage
  // category: sweet
  // category: snack
  // category: sweet
  // category: snack
  // category: sweet
  // category: snack
  // category: sweet
  // category: snack
  // category: sweet
  // category: grain
  // category: vegetable
  // category: mixed_dish
  // category: baby_food
  // category: mixed_dish
  // category: grain
  // category: beverage
  // category: sweet
  // category: snack
  // category: baby_food
  // category: dairy
  // category: fat_oil
  // category: baby_food
  // category: fat_oil
  // category: sweet
  // category: snack
  // category: legume
  // category: beverage
  // category: sweet
  // category: dairy
  // category: vegetable
  // category: grain
  // category: dairy
  // category: legume
  // category: vegetable
  // category: fruit
  // category: beverage
  // category: fruit
  // category: beverage
  // category: fruit
  // category: beverage
  // category: fruit
  // category: beverage
  // category: fruit
  // category: beverage
  // category: fruit
  // category: beverage
  // category: fruit
  // category: vegetable
  { id: 'mung_beans_mature_seeds_sprouted_cooked_boiled_drained_without_salt', name: 'Mung beans, mature seeds, sprouted, cooked, boiled, drained, without salt', category: 'vegetable', icon: '', servingType: 'weight', caloriesPer100g: 21, proteinPer100g: 2, carbsPer100g: 4.2, fatPer100g: 0.1, typicalGrams: 124 },
  { id: 'mung_beans_mature_seeds_sprouted_cooked_stir_fried', name: 'Mung beans, mature seeds, sprouted, cooked, stir-fried', category: 'vegetable', icon: '', servingType: 'weight', caloriesPer100g: 50, proteinPer100g: 4.3, carbsPer100g: 10.6, fatPer100g: 0.2, typicalGrams: 124 },
  { id: 'beans_navy_mature_seeds_sprouted_raw', name: 'Beans, navy, mature seeds, sprouted, raw', category: 'vegetable', icon: '', servingType: 'weight', caloriesPer100g: 67, proteinPer100g: 6.2, carbsPer100g: 13, fatPer100g: 0.7, typicalGrams: 104 },
  { id: 'beans_navy_mature_seeds_sprouted_cooked_boiled_drained_without_salt', name: 'Beans, navy, mature seeds, sprouted, cooked, boiled, drained, without salt', category: 'vegetable', icon: '', servingType: 'weight', caloriesPer100g: 78, proteinPer100g: 7.1, carbsPer100g: 15, fatPer100g: 0.8, typicalGrams: 100 },
  // category: beverage
  // category: vegetable
  { id: 'beans_kidney_mature_seeds_sprouted_raw', name: 'Beans, kidney, mature seeds, sprouted, raw', category: 'vegetable', icon: '', servingType: 'weight', caloriesPer100g: 29, proteinPer100g: 4.2, carbsPer100g: 4.1, fatPer100g: 0.5, typicalGrams: 184 },
  { id: 'soybeans_mature_seeds_sprouted_raw', name: 'Soybeans, mature seeds, sprouted, raw', category: 'vegetable', icon: '', servingType: 'weight', caloriesPer100g: 122, proteinPer100g: 13.1, carbsPer100g: 9.6, fatPer100g: 6.7, typicalGrams: 35 },
  { id: 'beans_kidney_mature_seeds_sprouted_cooked_boiled_drained_with_salt', name: 'Beans, kidney, mature seeds, sprouted, cooked, boiled, drained, with salt', category: 'vegetable', icon: '', servingType: 'weight', caloriesPer100g: 33, proteinPer100g: 4.8, carbsPer100g: 4.7, fatPer100g: 0.6, typicalGrams: 100 },
  { id: 'beans_pinto_mature_seeds_sprouted_cooked_boiled_drained_with_salt', name: 'Beans, pinto, mature seeds, sprouted, cooked, boiled, drained, with salt', category: 'vegetable', icon: '', servingType: 'weight', caloriesPer100g: 20, proteinPer100g: 1.9, carbsPer100g: 3.5, fatPer100g: 0.3, typicalGrams: 100 },
  { id: 'soybeans_mature_seeds_sprouted_cooked_steamed_with_salt', name: 'Soybeans, mature seeds, sprouted, cooked, steamed, with salt', category: 'vegetable', icon: '', servingType: 'weight', caloriesPer100g: 81, proteinPer100g: 8.5, carbsPer100g: 6.5, fatPer100g: 4.5, typicalGrams: 94 },
  { id: 'soybeans_mature_seeds_sprouted_cooked_stir_fried_with_salt', name: 'Soybeans, mature seeds, sprouted, cooked, stir-fried, with salt', category: 'vegetable', icon: '', servingType: 'weight', caloriesPer100g: 125, proteinPer100g: 13.1, carbsPer100g: 9.4, fatPer100g: 7.1, typicalGrams: 100 },
  // category: nut_seed
];

export default foodsSRLegacy1;
