// USDA FoodData Central: FNDDS (Survey) dataset -- part 3 of 3.
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
const foodsFNDDS3 = [
  // category: legume
  // category: mixed_dish
  // category: legume
  // category: mixed_dish
  // category: grain
  // category: sweet
  // category: mixed_dish
  // category: legume
  // category: fruit
  // category: sweet
  // category: fruit
  // category: beverage
  // category: fruit
  // category: beverage
  // category: fruit
  // category: vegetable
  // category: fruit
  // category: sweet
  // category: fruit
  // category: beverage
  // category: fruit
  // category: beverage
  // category: fruit
  // category: beverage
  // category: fruit
  // category: sweet
  // category: fruit
  // category: beverage
  // category: fruit
  // category: sweet
  // category: condiment_sauce
  // category: fruit
  // category: mixed_dish
  // category: beverage
  // category: sweet
  // category: beverage
  // category: condiment_sauce
  // category: baby_food
  // category: beverage
  // category: baby_food
  // category: vegetable
  // category: snack
  // category: vegetable
  // category: mixed_dish
  // category: vegetable
  // category: snack
  // category: vegetable
  // category: grain
  // category: vegetable
  // category: snack
  // category: vegetable
  // category: mixed_dish
  // category: vegetable
  // category: mixed_dish
  // category: vegetable
  // category: mixed_dish
  // category: vegetable
  // category: beverage
  // category: vegetable
  // category: mixed_dish
  // category: vegetable
  // category: snack
  // category: vegetable
  // category: mixed_dish
  // category: vegetable
  // category: mixed_dish
  // category: vegetable
  // category: beverage
  // category: condiment_sauce
  // category: vegetable
  // category: mixed_dish
  // category: vegetable
  // category: mixed_dish
  // category: vegetable
  // category: mixed_dish
  // category: vegetable
  // category: condiment_sauce
  // category: vegetable
  // category: beverage
  // category: vegetable
  // category: mixed_dish
  // category: beverage
  // category: vegetable
  // category: condiment_sauce
  // category: grain
  // category: vegetable
  // category: condiment_sauce
  // category: vegetable
  // category: mixed_dish
  // category: vegetable
  // category: mixed_dish
  // category: vegetable
  // category: mixed_dish
  // category: vegetable
  // category: mixed_dish
  // category: condiment_sauce
  // category: vegetable
  // category: mixed_dish
  // category: sweet
  // category: mixed_dish
  // category: grain
  // category: vegetable
  // category: condiment_sauce
  // category: mixed_dish
  // category: vegetable
  // category: mixed_dish
  // category: condiment_sauce
  // category: vegetable
  // category: mixed_dish
  // category: vegetable
  // category: condiment_sauce
  // category: vegetable
  // category: condiment_sauce
  // category: vegetable
  { id: 'olives_nfs', name: 'Olives, NFS', category: 'vegetable', icon: '', servingType: 'weight', caloriesPer100g: 116, proteinPer100g: 0.8, carbsPer100g: 6, fatPer100g: 10.9, typicalGrams: 15 },
  { id: 'olives_green', name: 'Olives, green', category: 'vegetable', icon: '', servingType: 'weight', caloriesPer100g: 145, proteinPer100g: 1, carbsPer100g: 3.8, fatPer100g: 15.3, typicalGrams: 15 },
  { id: 'olives_black', name: 'Olives, black', category: 'vegetable', icon: '', servingType: 'weight', caloriesPer100g: 116, proteinPer100g: 0.8, carbsPer100g: 6, fatPer100g: 10.9, typicalGrams: 5 },
  { id: 'olives_stuffed', name: 'Olives, stuffed', category: 'vegetable', icon: '', servingType: 'weight', caloriesPer100g: 141, proteinPer100g: 1.1, carbsPer100g: 5, fatPer100g: 12.9, typicalGrams: 5 },
  { id: 'olive_tapenade', name: 'Olive tapenade', category: 'vegetable', icon: '', servingType: 'weight', caloriesPer100g: 282, proteinPer100g: 0.7, carbsPer100g: 4.2, fatPer100g: 30, typicalGrams: 16 },
  // category: condiment_sauce
  // category: vegetable
  // category: condiment_sauce
  // category: vegetable
  // category: mixed_dish
  // category: baby_food
  // category: vegetable
  // category: mixed_dish
  // category: beverage
  // category: fat_oil
  // category: condiment_sauce
  // category: fat_oil
  // category: condiment_sauce
  // category: fat_oil
  // category: condiment_sauce
  // category: fat_oil
  // category: condiment_sauce
  // category: fat_oil
  // category: condiment_sauce
  // category: fat_oil
  // category: condiment_sauce
  // category: fat_oil
  // category: mixed_dish
  // category: vegetable
  // category: mixed_dish
  // category: sweet
  // category: condiment_sauce
  // category: sweet
  // category: condiment_sauce
  // category: sweet
  // category: beverage
  // category: sweet
  // category: beverage
  // category: mixed_dish
  // category: beverage
  // category: mixed_dish
  // category: beverage
  // category: mixed_dish
  // category: beverage
  // category: mixed_dish
];

export default foodsFNDDS3;
