// USDA FoodData Central: SR Legacy dataset -- part 3 of 4.
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
const foodsSRLegacy3 = [
  // category: fat_oil
  // category: mixed_dish
  // category: condiment_sauce
  // category: mixed_dish
  // category: condiment_sauce
  // category: mixed_dish
  // category: condiment_sauce
  // category: mixed_dish
  // category: condiment_sauce
  // category: mixed_dish
  // category: condiment_sauce
  // category: mixed_dish
  // category: condiment_sauce
  // category: mixed_dish
  // category: condiment_sauce
  // category: mixed_dish
  // category: condiment_sauce
  // category: mixed_dish
  // category: condiment_sauce
  // category: mixed_dish
  // category: grain
  // category: fruit
  // category: beverage
  // category: fruit
  // Both also tagged into the new Fruit > Fresh > Avocado drill-down (as
  // California/Florida varieties) and cross-listed onto the Vegetables tab
  // via crossListCategories -- see data/foods.js's 'avocado' entry comment
  // for why.
  { id: 'avocados_raw_california', name: 'Avocados, raw, California', category: 'fruit', subcategory: 'fresh', cut: 'avocado', variety: 'California', crossListCategories: ['vegetable'], icon: '', servingType: 'weight', caloriesPer100g: 167, proteinPer100g: 2, carbsPer100g: 8.6, fatPer100g: 15.4, typicalGrams: 136 },
  { id: 'avocados_raw_florida', name: 'Avocados, raw, Florida', category: 'fruit', subcategory: 'fresh', cut: 'avocado', variety: 'Florida', crossListCategories: ['vegetable'], icon: '', servingType: 'weight', caloriesPer100g: 120, proteinPer100g: 2.2, carbsPer100g: 7.8, fatPer100g: 10.1, typicalGrams: 304 },
  // category: mixed_dish
  // category: condiment_sauce
  // category: sweet
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
  // category: beverage
  // category: grain
  // category: mixed_dish
  // category: dairy
  // category: condiment_sauce
  // category: baby_food
  // category: fat_oil
  // category: legume
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
  // category: grain
  // category: sweet
  // category: grain
  // category: sweet
  // category: beverage
  // category: grain
  // category: sweet
  // category: grain
  // category: sweet
  // category: grain
  // category: condiment_sauce
  // category: mixed_dish
  // category: condiment_sauce
  // category: mixed_dish
  // category: condiment_sauce
  // category: mixed_dish
  // category: beverage
  // category: grain
  // category: snack
  // category: grain
  // category: fruit
  // category: beverage
  // category: fruit
  // category: beverage
  // category: fruit
  // category: beverage
  // category: fruit
  // category: snack
  // category: beverage
  // category: grain
  // category: sweet
  // category: grain
  // category: sweet
  // category: grain
  // category: sweet
  // category: grain
  // category: mixed_dish
];

export default foodsSRLegacy3;
