// The "no variety chosen" row for every food that has varieties.
//
// Before v0.0.59 a fruit with cultivars opened on whichever variety happened
// to be first in the data -- an Apple card opened on Fuji, and Avocado on
// California, as if the user had picked them. Nobody picks Fuji by accident.
// Varieties are now optional: nothing is selected until you tap one, and
// until then the card shows the food itself. These are those rows.
//
// Where USDA publishes a genuine all-varieties figure, that is what is used
// and the row says which. Where it does not, the row is the unweighted mean
// of the varieties the app carries -- unweighted because there is no
// consumption data to weight by, and inventing one would be worse than
// saying plainly that it is a flat average.
//
// Three groups deliberately have NO row here, because their "varieties" are
// not varieties at all and an average of them would describe no real food:
//
//   Coconut (canned)     Coconut milk 197 kcal  vs  Coconut cream 357
//   Coconut (dried)      Unsweetened  660       vs  Sweetened     501
//   Strawberry (frozen)  Unsweetened   35       vs  Sweetened      96
//
// Those keep a required choice. Averaging coconut milk with coconut cream
// gives 277 kcal, a number you cannot buy.

export const GENERIC_FOODS = [
  // USDA Apples, raw, with skin [171688]  (6 varieties)
  { id: 'generic_apple_fresh', name: 'Apple', category: 'fruit', subcategory: 'fresh', cut: 'apple', icon: '', servingType: 'weight', caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 13.8, fatPer100g: 0.2, typicalGrams: 182 },
  // USDA Avocados, raw, all commercial varieties [171705]  (2 varieties)
  { id: 'generic_avocado_fresh', name: 'Avocado', category: 'fruit', subcategory: 'fresh', cut: 'avocado', crossListCategories: ['vegetable'], icon: '', servingType: 'weight', caloriesPer100g: 160, proteinPer100g: 2.0, carbsPer100g: 8.5, fatPer100g: 14.7, typicalGrams: 136 },
  // mean of Black, Red & White  (2 varieties)
  { id: 'generic_currants_fresh', name: 'Currants', category: 'fruit', subcategory: 'fresh', cut: 'currants', icon: '', servingType: 'weight', caloriesPer100g: 60, proteinPer100g: 1.4, carbsPer100g: 14.6, fatPer100g: 0.3, typicalGrams: 112 },
  // mean of Deglet Noor, Medjool  (2 varieties)
  { id: 'generic_dates_dried', name: 'Dates', category: 'fruit', subcategory: 'dried', cut: 'dates', icon: '', servingType: 'weight', caloriesPer100g: 280, proteinPer100g: 2.1, carbsPer100g: 75.0, fatPer100g: 0.2, typicalGrams: 24 },
  // USDA Grapefruit, raw, pink and red and white, all areas [173033]  (2 varieties)
  { id: 'generic_grapefruit_fresh', name: 'Grapefruit', category: 'fruit', subcategory: 'fresh', cut: 'grapefruit', icon: '', servingType: 'weight', caloriesPer100g: 32, proteinPer100g: 0.6, carbsPer100g: 8.1, fatPer100g: 0.1, typicalGrams: 128 },
  // USDA Grapes, red or green (European type) [174683]  (3 varieties)
  { id: 'generic_grapes_fresh', name: 'Grapes', category: 'fruit', subcategory: 'fresh', cut: 'grapes', icon: '', servingType: 'weight', caloriesPer100g: 69, proteinPer100g: 0.7, carbsPer100g: 18.1, fatPer100g: 0.2, typicalGrams: 124 },
  // mean of Common, Strawberry Guava  (2 varieties)
  { id: 'generic_guava_fresh', name: 'Guava', category: 'fruit', subcategory: 'fresh', cut: 'guava', icon: '', servingType: 'weight', caloriesPer100g: 68, proteinPer100g: 1.6, carbsPer100g: 15.8, fatPer100g: 0.8, typicalGrams: 55 },
  // mean of Green, Gold (SunGold)  (2 varieties)
  { id: 'generic_kiwi_fresh', name: 'Kiwi', category: 'fruit', subcategory: 'fresh', cut: 'kiwi', icon: '', servingType: 'weight', caloriesPer100g: 60, proteinPer100g: 1.1, carbsPer100g: 14.9, fatPer100g: 0.3, typicalGrams: 69 },
  // mean of Green, Black (Ripe), Manzanilla, Stuffed  (3 varieties)
  { id: 'generic_olive_canned', name: 'Olives', category: 'fruit', subcategory: 'canned', cut: 'olive', icon: '', servingType: 'weight', caloriesPer100g: 130, proteinPer100g: 1.0, carbsPer100g: 4.9, fatPer100g: 13.0, typicalGrams: 4 },
  // mean of Green, Yellow (Ripe)  (2 varieties)
  { id: 'generic_plantain_fresh', name: 'Plantain', category: 'fruit', subcategory: 'fresh', cut: 'plantain', icon: '', servingType: 'weight', caloriesPer100g: 137, proteinPer100g: 1.2, carbsPer100g: 34.3, fatPer100g: 0.2, typicalGrams: 267 },
  // mean of Green, Yellow, Red, Orange  (4 varieties)
  { id: 'generic_bell_pepper_fresh', name: 'Bell Pepper', category: 'vegetable', subcategory: 'fresh', cut: 'bell_pepper', crossListCategories: ['fruit'], icon: '', servingType: 'weight', caloriesPer100g: 25, proteinPer100g: 0.8, carbsPer100g: 6.2, fatPer100g: 0.1, typicalGrams: 119 },
];

export default GENERIC_FOODS;