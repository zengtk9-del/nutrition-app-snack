// USDA FoodData Central: SR Legacy dataset -- part 2 of 4.
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
const foodsSRLegacy2 = [
  // category: beverage
  // category: sweet
  // category: beverage
  // category: sweet
  // category: snack
  // category: sweet
  // category: snack
  // category: sweet
  // category: grain
  // category: vegetable
  // category: beverage
  // category: vegetable
  // category: mixed_dish
  // category: baby_food
  // category: mixed_dish
  // category: grain
  // category: fat_oil
  // category: snack
  // category: grain
  // category: snack
  // category: baby_food
  // category: fat_oil
  // category: dairy
  // category: legume
  // category: grain
  // category: baby_food
  // category: fat_oil
  // category: sweet
  // category: baby_food
  // category: legume
  // category: vegetable
  // category: legume
  // category: fat_oil
  // category: sweet
  // category: dairy
  // category: sweet
  // category: dairy
  // category: dairy
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
  { id: 'mung_beans_mature_seeds_sprouted_raw', name: 'Mung beans, mature seeds, sprouted, raw', category: 'vegetable', icon: '', servingType: 'weight', caloriesPer100g: 30, proteinPer100g: 3, carbsPer100g: 5.9, fatPer100g: 0.2, typicalGrams: 104 },
  // category: beverage
  // category: vegetable
  // category: beverage
  // category: vegetable
  { id: 'beans_mung_mature_seeds_sprouted_canned_drained_solids', name: 'Beans, mung, mature seeds, sprouted, canned, drained solids', category: 'vegetable', icon: '', servingType: 'weight', caloriesPer100g: 12, proteinPer100g: 1.4, carbsPer100g: 2.1, fatPer100g: 0.1, typicalGrams: 125 },
  { id: 'beans_pinto_mature_seeds_sprouted_raw', name: 'Beans, pinto, mature seeds, sprouted, raw', category: 'vegetable', icon: '', servingType: 'weight', caloriesPer100g: 62, proteinPer100g: 5.2, carbsPer100g: 11.6, fatPer100g: 0.9, typicalGrams: 100 },
  { id: 'beans_pinto_mature_seeds_sprouted_cooked_boiled_drained_without_salt', name: 'Beans, pinto, mature seeds, sprouted, cooked, boiled, drained, without salt', category: 'vegetable', icon: '', servingType: 'weight', caloriesPer100g: 22, proteinPer100g: 1.9, carbsPer100g: 4.1, fatPer100g: 0.3, typicalGrams: 100 },
  // category: beverage
  // category: vegetable
  // category: nut_seed
  // category: sweet
  // category: snack
  // category: beverage
  // category: snack
  // category: sweet
  // category: beverage
  // category: sweet
  // category: grain
  // category: mixed_dish
  // category: vegetable
  { id: 'peas_mature_seeds_sprouted_raw', name: 'Peas, mature seeds, sprouted, raw', category: 'vegetable', icon: '', servingType: 'weight', caloriesPer100g: 124, proteinPer100g: 8.8, carbsPer100g: 27.1, fatPer100g: 0.7, typicalGrams: 120 },
  { id: 'peas_mature_seeds_sprouted_cooked_boiled_drained_without_salt', name: 'Peas, mature seeds, sprouted, cooked, boiled, drained, without salt', category: 'vegetable', icon: '', servingType: 'weight', caloriesPer100g: 98, proteinPer100g: 7, carbsPer100g: 17.1, fatPer100g: 0.5, typicalGrams: 100 },
  // category: beverage
  // category: vegetable
  // category: beverage
  // category: vegetable
  // category: beverage
  // category: vegetable
  { id: 'peas_mature_seeds_sprouted_cooked_boiled_drained_with_salt', name: 'Peas, mature seeds, sprouted, cooked, boiled, drained, with salt', category: 'vegetable', icon: '', servingType: 'weight', caloriesPer100g: 98, proteinPer100g: 7, carbsPer100g: 17.1, fatPer100g: 0.5, typicalGrams: 100 },
  // category: beverage
  // category: vegetable
  // category: nut_seed
  // category: sweet
  // category: snack
  // category: sweet
  // category: grain
  // category: mixed_dish
  // category: dairy
  // category: condiment_sauce
  // category: baby_food
  // category: beverage
  // category: baby_food
  // category: beverage
  // category: baby_food
  // category: fat_oil
  // category: mixed_dish
  // category: condiment_sauce
  // category: mixed_dish
  // category: condiment_sauce
  // category: mixed_dish
  // category: condiment_sauce
  // category: dairy
  // category: condiment_sauce
  // category: baby_food
  // category: beverage
  // category: baby_food
  // category: beverage
  // category: baby_food
  // category: fat_oil
];

export default foodsSRLegacy2;
