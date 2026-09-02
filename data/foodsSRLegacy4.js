// USDA FoodData Central: SR Legacy dataset -- part 4 of 4.
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
const foodsSRLegacy4 = [
  // category: dairy
  // category: condiment_sauce
  // category: baby_food
  // category: beverage
  // category: baby_food
  // category: fat_oil
  // category: beverage
  // category: legume
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
  // category: mixed_dish
  // category: condiment_sauce
  // category: mixed_dish
  // category: condiment_sauce
  // category: mixed_dish
  // category: condiment_sauce
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
  // category: beverage
  // category: legume
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
  // category: mixed_dish
  // category: beverage
  // category: grain
  // category: sweet
  // category: beverage
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
  // category: grain
  // category: sweet
  // category: grain
  // category: sweet
  // category: grain
  // category: sweet
  // category: grain
  // category: sweet
  // category: beverage
  // category: legume
];

export default foodsSRLegacy4;
