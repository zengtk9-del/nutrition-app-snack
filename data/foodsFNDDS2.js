// USDA FoodData Central: FNDDS (Survey) dataset -- part 2 of 3.
// Split into several files purely so each one is small enough to
// comfortably paste into Snack's editor -- these all get combined
// into the single `foods` array the rest of the app uses, via
// data/foods.js. Nothing else in the app imports this file directly.
// See foodsFNDDS1.js through foodsFNDDS3.js for the rest.
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
const foodsFNDDS2 = [
  // category: dairy
  // category: condiment_sauce
  // category: dairy
  // category: mixed_dish
  // category: dairy
  // category: sweet
  // category: dairy
  // category: mixed_dish
  // category: legume
  // category: condiment_sauce
  // category: legume
  // category: snack
  // category: legume
  // category: mixed_dish
  // category: legume
  // category: snack
  // category: legume
  // category: condiment_sauce
  // category: dairy
  // category: condiment_sauce
  // category: legume
  // category: mixed_dish
  // category: legume
  // category: condiment_sauce
  // category: legume
  // category: mixed_dish
  // category: legume
  // category: mixed_dish
  // category: nut_seed
  // category: legume
  // category: condiment_sauce
  // category: mixed_dish
  // category: condiment_sauce
  // category: mixed_dish
  // category: beverage
  // category: dairy
  // category: beverage
  // category: nut_seed
  // category: grain
  // category: mixed_dish
  // category: grain
  // category: sweet
  // category: grain
  // category: sweet
  // category: grain
  // category: snack
  // category: grain
  // category: snack
  // category: grain
  // category: snack
  // category: sweet
  // category: snack
  // category: grain
  // category: snack
  // category: grain
  // category: snack
  // category: grain
  // category: sweet
  // category: grain
  // category: sweet
  // category: grain
  // category: sweet
  // category: snack
  // category: baby_food
  // category: snack
  // category: sweet
  // category: snack
  // category: sweet
  // category: snack
  // category: baby_food
  // category: snack
  // category: grain
  // category: mixed_dish
  // category: grain
  // category: mixed_dish
  // category: sweet
  // category: grain
  // category: snack
  // category: grain
  // category: mixed_dish
  // category: grain
  // category: mixed_dish
  // category: baby_food
  // category: mixed_dish
  // category: sweet
  // category: grain
  // category: mixed_dish
  // category: sweet
  // category: mixed_dish
  // category: sweet
  // category: mixed_dish
  // category: sweet
  // category: mixed_dish
  // category: sweet
  // category: mixed_dish
  // category: legume
];

export default foodsFNDDS2;
