// The curated Beverages list -- Category > Type > item > card, with labels
// and ordering in data/beverageHierarchy.js.
//
// Replaces 1,020 raw USDA rows, plus 22 rows of HAM that were tagged
// `beverage` by the original import because their USDA names contain the
// words "with natural juices". Those are superseded by Red Meat's curated
// Ham & Deli Meat card, and 30 baby-food juice rows moved to Baby Foods.
//
// Juice stays here and is NOT cross-listed into Fruit (Decision 5). Fruit
// is about eating fruit; 298 juice rows cross-listed would have swamped a
// category that is 123 curated foods.
//
// Three toggles, all data-backed:
//   Coffee   Brewed / Instant / Decaf
//   Tea      Brewed / Decaf / Instant
//   Soda     Regular / Diet -- the cleanest pair in the app, and a
//            140-vs-0 calorie difference that actually matters
//
// Spirits are ONE item with a Proof toggle rather than five cards. USDA
// carries a single "distilled, all (gin, rum, vodka, whiskey)" row per
// proof, because at the same proof they are nutritionally identical --
// ethanol and water, no protein, no carbs, no fat.
//
// There is no Water Type: USDA has no plain-water row, and water
// contributes nothing to a macro tracker.

export const foodsBeverages = [
  // --- Coffee ---
  { id: 'bev_coffee_black_instant', name: 'Coffee, black, instant', category: 'beverage', subcategory: 'coffee', beverageItem: 'coffee_black', beverageVariety: 'instant', icon: '', servingType: 'weight', caloriesPer100g: 2, proteinPer100g: 0.1, carbsPer100g: 0.3, fatPer100g: 0.0, typicalGrams: 355 },
  { id: 'bev_coffee_black_decaf', name: 'Coffee, black, decaffeinated', category: 'beverage', subcategory: 'coffee', beverageItem: 'coffee_black', beverageVariety: 'decaf', icon: '', servingType: 'weight', caloriesPer100g: 0, proteinPer100g: 0.1, carbsPer100g: 0.0, fatPer100g: 0.0, typicalGrams: 355 },
  { id: 'bev_espresso', name: 'Espresso', category: 'beverage', subcategory: 'coffee', beverageItem: 'espresso', icon: '', servingType: 'weight', caloriesPer100g: 9, proteinPer100g: 0.1, carbsPer100g: 1.7, fatPer100g: 0.2, typicalGrams: 30 },
  { id: 'bev_cappuccino', name: 'Cappuccino', category: 'beverage', subcategory: 'coffee', beverageItem: 'cappuccino', icon: '', servingType: 'weight', caloriesPer100g: 27, proteinPer100g: 1.7, carbsPer100g: 2.8, fatPer100g: 1.0, typicalGrams: 355 },
  { id: 'bev_mocha', name: 'Mocha', category: 'beverage', subcategory: 'coffee', beverageItem: 'mocha', icon: '', servingType: 'weight', caloriesPer100g: 64, proteinPer100g: 2.6, carbsPer100g: 10.2, fatPer100g: 1.5, typicalGrams: 355 },
  { id: 'bev_frozen_coffee', name: 'Frozen Coffee Drink', category: 'beverage', subcategory: 'coffee', beverageItem: 'frozen_coffee', icon: '', servingType: 'weight', caloriesPer100g: 68, proteinPer100g: 1.6, carbsPer100g: 13.4, fatPer100g: 0.9, typicalGrams: 355 },
  { id: 'bev_frozen_mocha', name: 'Frozen Mocha Drink', category: 'beverage', subcategory: 'coffee', beverageItem: 'frozen_mocha', icon: '', servingType: 'weight', caloriesPer100g: 66, proteinPer100g: 1.5, carbsPer100g: 13.1, fatPer100g: 0.9, typicalGrams: 355 },
  { id: 'bev_iced_coffee', name: 'Iced Coffee', category: 'beverage', subcategory: 'coffee', beverageItem: 'iced_coffee', icon: '', servingType: 'weight', caloriesPer100g: 27, proteinPer100g: 1.8, carbsPer100g: 2.8, fatPer100g: 1.0, typicalGrams: 355 },
  { id: 'bev_coffee_substitute', name: 'Coffee Substitute (grain)', category: 'beverage', subcategory: 'coffee', beverageItem: 'coffee_substitute', icon: '', servingType: 'weight', caloriesPer100g: 360, proteinPer100g: 6.0, carbsPer100g: 78.4, fatPer100g: 2.5, typicalGrams: 355 },

  // --- Tea ---
  { id: 'bev_tea_black_instant', name: 'Tea, black, instant', category: 'beverage', subcategory: 'tea', beverageItem: 'tea_black', beverageVariety: 'instant', icon: '', servingType: 'weight', caloriesPer100g: 315, proteinPer100g: 20.2, carbsPer100g: 58.7, fatPer100g: 0.0, typicalGrams: 355 },
  { id: 'bev_green_tea', name: 'Green Tea', category: 'beverage', subcategory: 'tea', beverageItem: 'green_tea', icon: '', servingType: 'weight', caloriesPer100g: 1, proteinPer100g: 0.2, carbsPer100g: 0.0, fatPer100g: 0.0, typicalGrams: 355 },
  { id: 'bev_herbal_tea', name: 'Herbal Tea', category: 'beverage', subcategory: 'tea', beverageItem: 'herbal_tea', icon: '', servingType: 'weight', caloriesPer100g: 1, proteinPer100g: 0.0, carbsPer100g: 0.2, fatPer100g: 0.0, typicalGrams: 355 },
  { id: 'bev_iced_tea_sweet', name: 'Iced Tea, sweetened', category: 'beverage', subcategory: 'tea', beverageItem: 'iced_tea_sweet', icon: '', servingType: 'weight', caloriesPer100g: 32, proteinPer100g: 0.0, carbsPer100g: 7.9, fatPer100g: 0.0, typicalGrams: 355 },
  { id: 'bev_iced_tea_unsweet', name: 'Iced Tea, unsweetened', category: 'beverage', subcategory: 'tea', beverageItem: 'iced_tea_unsweet', icon: '', servingType: 'weight', caloriesPer100g: 1, proteinPer100g: 0.0, carbsPer100g: 0.3, fatPer100g: 0.0, typicalGrams: 355 },

  // --- Juice & Smoothies ---
  { id: 'bev_orange_juice', name: 'Orange Juice', category: 'beverage', subcategory: 'juice', beverageItem: 'orange_juice', icon: '', servingType: 'weight', caloriesPer100g: 45, proteinPer100g: 0.7, carbsPer100g: 10.4, fatPer100g: 0.2, typicalGrams: 248 },
  { id: 'bev_apple_juice', name: 'Apple Juice', category: 'beverage', subcategory: 'juice', beverageItem: 'apple_juice', icon: '', servingType: 'weight', caloriesPer100g: 46, proteinPer100g: 0.1, carbsPer100g: 11.3, fatPer100g: 0.1, typicalGrams: 248 },
  { id: 'bev_grape_juice', name: 'Grape Juice', category: 'beverage', subcategory: 'juice', beverageItem: 'grape_juice', icon: '', servingType: 'weight', caloriesPer100g: 60, proteinPer100g: 0.4, carbsPer100g: 14.8, fatPer100g: 0.1, typicalGrams: 253 },
  { id: 'bev_cranberry_juice', name: 'Cranberry Juice Cocktail', category: 'beverage', subcategory: 'juice', beverageItem: 'cranberry_juice', icon: '', servingType: 'weight', caloriesPer100g: 54, proteinPer100g: 0.0, carbsPer100g: 13.5, fatPer100g: 0.1, typicalGrams: 253 },
  { id: 'bev_grapefruit_juice', name: 'Grapefruit Juice', category: 'beverage', subcategory: 'juice', beverageItem: 'grapefruit_juice', icon: '', servingType: 'weight', caloriesPer100g: 39, proteinPer100g: 0.5, carbsPer100g: 9.2, fatPer100g: 0.1, typicalGrams: 247 },
  { id: 'bev_pineapple_juice', name: 'Pineapple Juice', category: 'beverage', subcategory: 'juice', beverageItem: 'pineapple_juice', icon: '', servingType: 'weight', caloriesPer100g: 53, proteinPer100g: 0.4, carbsPer100g: 12.9, fatPer100g: 0.1, typicalGrams: 250 },
  { id: 'bev_tomato_juice', name: 'Tomato Juice', category: 'beverage', subcategory: 'juice', beverageItem: 'tomato_juice', icon: '', servingType: 'weight', caloriesPer100g: 17, proteinPer100g: 0.8, carbsPer100g: 3.5, fatPer100g: 0.3, typicalGrams: 243 },
  { id: 'bev_vegetable_juice', name: 'Vegetable Juice', category: 'beverage', subcategory: 'juice', beverageItem: 'vegetable_juice', icon: '', servingType: 'weight', caloriesPer100g: 22, proteinPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.3, typicalGrams: 242 },
  { id: 'bev_lemonade', name: 'Lemonade', category: 'beverage', subcategory: 'juice', beverageItem: 'lemonade', icon: '', servingType: 'weight', caloriesPer100g: 14, proteinPer100g: 0.0, carbsPer100g: 3.6, fatPer100g: 0.0, typicalGrams: 248 },
  { id: 'bev_lemon_juice', name: 'Lemon Juice', category: 'beverage', subcategory: 'juice', beverageItem: 'lemon_juice', icon: '', servingType: 'weight', caloriesPer100g: 22, proteinPer100g: 0.3, carbsPer100g: 6.9, fatPer100g: 0.2, typicalGrams: 15 },
  { id: 'bev_lime_juice', name: 'Lime Juice', category: 'beverage', subcategory: 'juice', beverageItem: 'lime_juice', icon: '', servingType: 'weight', caloriesPer100g: 25, proteinPer100g: 0.4, carbsPer100g: 8.4, fatPer100g: 0.1, typicalGrams: 15 },
  { id: 'bev_prune_juice', name: 'Prune Juice', category: 'beverage', subcategory: 'juice', beverageItem: 'prune_juice', icon: '', servingType: 'weight', caloriesPer100g: 71, proteinPer100g: 0.6, carbsPer100g: 17.4, fatPer100g: 0.0, typicalGrams: 256 },
  { id: 'bev_carrot_juice', name: 'Carrot Juice', category: 'beverage', subcategory: 'juice', beverageItem: 'carrot_juice', icon: '', servingType: 'weight', caloriesPer100g: 40, proteinPer100g: 0.9, carbsPer100g: 9.3, fatPer100g: 0.1, typicalGrams: 236 },
  { id: 'bev_pomegranate_juice', name: 'Pomegranate Juice', category: 'beverage', subcategory: 'juice', beverageItem: 'pomegranate_juice', icon: '', servingType: 'weight', caloriesPer100g: 54, proteinPer100g: 0.1, carbsPer100g: 13.1, fatPer100g: 0.3, typicalGrams: 249 },
  { id: 'bev_apple_cider', name: 'Apple Cider', category: 'beverage', subcategory: 'juice', beverageItem: 'apple_cider', icon: '', servingType: 'weight', caloriesPer100g: 46, proteinPer100g: 0.1, carbsPer100g: 11.3, fatPer100g: 0.1, typicalGrams: 248 },
  { id: 'bev_fruit_punch', name: 'Fruit Punch', category: 'beverage', subcategory: 'juice', beverageItem: 'fruit_punch', icon: '', servingType: 'weight', caloriesPer100g: 162, proteinPer100g: 0.2, carbsPer100g: 41.4, fatPer100g: 0.0, typicalGrams: 248 },
  { id: 'bev_fruit_juice_drink', name: 'Fruit Juice Drink', category: 'beverage', subcategory: 'juice', beverageItem: 'fruit_juice_drink', icon: '', servingType: 'weight', caloriesPer100g: 10, proteinPer100g: 0.0, carbsPer100g: 2.5, fatPer100g: 0.0, typicalGrams: 248 },
  { id: 'bev_smoothie_fruit', name: 'Fruit Smoothie', category: 'beverage', subcategory: 'juice', beverageItem: 'smoothie_fruit', icon: '', servingType: 'weight', caloriesPer100g: 66, proteinPer100g: 2.3, carbsPer100g: 12.0, fatPer100g: 1.1, typicalGrams: 250 },
  { id: 'bev_smoothie_veg', name: 'Fruit & Vegetable Smoothie', category: 'beverage', subcategory: 'juice', beverageItem: 'smoothie_veg', icon: '', servingType: 'weight', caloriesPer100g: 53, proteinPer100g: 0.6, carbsPer100g: 12.5, fatPer100g: 0.3, typicalGrams: 250 },
  { id: 'bev_coconut_water', name: 'Coconut Water', category: 'beverage', subcategory: 'juice', beverageItem: 'coconut_water', icon: '', servingType: 'weight', caloriesPer100g: 37, proteinPer100g: 0.2, carbsPer100g: 9.1, fatPer100g: 0.0, typicalGrams: 240 },

  // --- Soft Drinks & Energy ---
  { id: 'bev_soda_cola_regular', name: 'Cola', category: 'beverage', subcategory: 'soft_drinks', beverageItem: 'cola', beverageVariety: 'regular', icon: '', servingType: 'weight', caloriesPer100g: 42, proteinPer100g: 0.0, carbsPer100g: 10.7, fatPer100g: 0.0, typicalGrams: 355 },
  { id: 'bev_soda_cola_diet', name: 'Cola, diet', category: 'beverage', subcategory: 'soft_drinks', beverageItem: 'cola', beverageVariety: 'diet', icon: '', servingType: 'weight', caloriesPer100g: 0, proteinPer100g: 0.0, carbsPer100g: 0.1, fatPer100g: 0.0, typicalGrams: 355 },
  { id: 'bev_soda_root_beer_regular', name: 'Root Beer', category: 'beverage', subcategory: 'soft_drinks', beverageItem: 'root_beer', beverageVariety: 'regular', icon: '', servingType: 'weight', caloriesPer100g: 41, proteinPer100g: 0.0, carbsPer100g: 10.6, fatPer100g: 0.0, typicalGrams: 355 },
  { id: 'bev_soda_root_beer_diet', name: 'Root Beer, diet', category: 'beverage', subcategory: 'soft_drinks', beverageItem: 'root_beer', beverageVariety: 'diet', icon: '', servingType: 'weight', caloriesPer100g: 41, proteinPer100g: 0.0, carbsPer100g: 10.6, fatPer100g: 0.0, typicalGrams: 355 },
  { id: 'bev_soda_ginger_ale_regular', name: 'Ginger Ale', category: 'beverage', subcategory: 'soft_drinks', beverageItem: 'ginger_ale', beverageVariety: 'regular', icon: '', servingType: 'weight', caloriesPer100g: 34, proteinPer100g: 0.0, carbsPer100g: 8.8, fatPer100g: 0.0, typicalGrams: 355 },
  { id: 'bev_soda_ginger_ale_diet', name: 'Ginger Ale, diet', category: 'beverage', subcategory: 'soft_drinks', beverageItem: 'ginger_ale', beverageVariety: 'diet', icon: '', servingType: 'weight', caloriesPer100g: 34, proteinPer100g: 0.0, carbsPer100g: 8.8, fatPer100g: 0.0, typicalGrams: 355 },
  { id: 'bev_soda_cream_soda_regular', name: 'Cream Soda', category: 'beverage', subcategory: 'soft_drinks', beverageItem: 'cream_soda', beverageVariety: 'regular', icon: '', servingType: 'weight', caloriesPer100g: 51, proteinPer100g: 0.0, carbsPer100g: 13.3, fatPer100g: 0.0, typicalGrams: 355 },
  { id: 'bev_soda_cream_soda_diet', name: 'Cream Soda, diet', category: 'beverage', subcategory: 'soft_drinks', beverageItem: 'cream_soda', beverageVariety: 'diet', icon: '', servingType: 'weight', caloriesPer100g: 51, proteinPer100g: 0.0, carbsPer100g: 13.3, fatPer100g: 0.0, typicalGrams: 355 },
  { id: 'bev_energy_drink', name: 'Energy Drink', category: 'beverage', subcategory: 'soft_drinks', beverageItem: 'energy_drink', icon: '', servingType: 'weight', caloriesPer100g: 43, proteinPer100g: 0.5, carbsPer100g: 10.2, fatPer100g: 0.0, typicalGrams: 250 },
  { id: 'bev_energy_drink_sf', name: 'Energy Drink, sugar free', category: 'beverage', subcategory: 'soft_drinks', beverageItem: 'energy_drink_sf', icon: '', servingType: 'weight', caloriesPer100g: 4, proteinPer100g: 0.2, carbsPer100g: 0.7, fatPer100g: 0.1, typicalGrams: 250 },
  { id: 'bev_sports_drink', name: 'Sports Drink', category: 'beverage', subcategory: 'soft_drinks', beverageItem: 'sports_drink', icon: '', servingType: 'weight', caloriesPer100g: 26, proteinPer100g: 0.0, carbsPer100g: 6.4, fatPer100g: 0.0, typicalGrams: 355 },
  { id: 'bev_tonic_water', name: 'Tonic Water', category: 'beverage', subcategory: 'soft_drinks', beverageItem: 'tonic_water', icon: '', servingType: 'weight', caloriesPer100g: 34, proteinPer100g: 0.0, carbsPer100g: 8.8, fatPer100g: 0.0, typicalGrams: 355 },
  { id: 'bev_hard_seltzer', name: 'Hard Seltzer', category: 'beverage', subcategory: 'soft_drinks', beverageItem: 'hard_seltzer', icon: '', servingType: 'weight', caloriesPer100g: 24, proteinPer100g: 0.1, carbsPer100g: 0.6, fatPer100g: 0.0, typicalGrams: 355 },

  // --- Milk-Based Drinks ---
  { id: 'bev_hot_chocolate', name: 'Hot Chocolate / Cocoa', category: 'beverage', subcategory: 'milk_drinks', beverageItem: 'hot_chocolate', icon: '', servingType: 'weight', caloriesPer100g: 72, proteinPer100g: 1.8, carbsPer100g: 13.9, fatPer100g: 1.0, typicalGrams: 250 },
  { id: 'bev_chocolate_milk_drink', name: 'Chocolate Milk', category: 'beverage', subcategory: 'milk_drinks', beverageItem: 'chocolate_milk_drink', icon: '', servingType: 'weight', caloriesPer100g: 49, proteinPer100g: 0.6, carbsPer100g: 10.7, fatPer100g: 0.4, typicalGrams: 250 },
  { id: 'bev_milkshake_choc', name: 'Milkshake, chocolate', category: 'beverage', subcategory: 'milk_drinks', beverageItem: 'milkshake_choc', icon: '', servingType: 'weight', caloriesPer100g: 119, proteinPer100g: 3.0, carbsPer100g: 21.2, fatPer100g: 2.7, typicalGrams: 250 },
  { id: 'bev_milkshake_vanilla', name: 'Milkshake, vanilla', category: 'beverage', subcategory: 'milk_drinks', beverageItem: 'milkshake_vanilla', icon: '', servingType: 'weight', caloriesPer100g: 112, proteinPer100g: 3.9, carbsPer100g: 17.8, fatPer100g: 3.0, typicalGrams: 250 },
  { id: 'bev_malted_milk', name: 'Malted Milk Drink', category: 'beverage', subcategory: 'milk_drinks', beverageItem: 'malted_milk', icon: '', servingType: 'weight', caloriesPer100g: 86, proteinPer100g: 3.7, carbsPer100g: 10.7, fatPer100g: 3.2, typicalGrams: 250 },
  { id: 'bev_eggnog', name: 'Eggnog', category: 'beverage', subcategory: 'milk_drinks', beverageItem: 'eggnog', icon: '', servingType: 'weight', caloriesPer100g: 113, proteinPer100g: 3.7, carbsPer100g: 6.6, fatPer100g: 3.5, typicalGrams: 250 },
  { id: 'bev_horchata', name: 'Horchata', category: 'beverage', subcategory: 'milk_drinks', beverageItem: 'horchata', icon: '', servingType: 'weight', caloriesPer100g: 91, proteinPer100g: 1.4, carbsPer100g: 19.6, fatPer100g: 0.6, typicalGrams: 250 },
  { id: 'bev_almond_milk_bev', name: 'Almond Milk', category: 'beverage', subcategory: 'milk_drinks', beverageItem: 'almond_milk_bev', icon: '', servingType: 'weight', caloriesPer100g: 15, proteinPer100g: 0.6, carbsPer100g: 0.3, fatPer100g: 1.2, typicalGrams: 240 },
  { id: 'bev_soy_milk_bev', name: 'Soy Milk', category: 'beverage', subcategory: 'milk_drinks', beverageItem: 'soy_milk_bev', icon: '', servingType: 'weight', caloriesPer100g: 38, proteinPer100g: 3.5, carbsPer100g: 1.3, fatPer100g: 2.1, typicalGrams: 243 },
  { id: 'bev_oat_milk', name: 'Oat Milk', category: 'beverage', subcategory: 'milk_drinks', beverageItem: 'oat_milk', icon: '', servingType: 'weight', caloriesPer100g: 45, proteinPer100g: 0.7, carbsPer100g: 5.4, fatPer100g: 2.3, typicalGrams: 240 },
  { id: 'bev_rice_milk', name: 'Rice Milk', category: 'beverage', subcategory: 'milk_drinks', beverageItem: 'rice_milk', icon: '', servingType: 'weight', caloriesPer100g: 47, proteinPer100g: 0.3, carbsPer100g: 9.2, fatPer100g: 1.0, typicalGrams: 240 },
  { id: 'bev_coconut_milk_bev', name: 'Coconut Milk Beverage', category: 'beverage', subcategory: 'milk_drinks', beverageItem: 'coconut_milk_bev', icon: '', servingType: 'weight', caloriesPer100g: 31, proteinPer100g: 0.2, carbsPer100g: 2.9, fatPer100g: 2.1, typicalGrams: 240 },

  // --- Alcoholic ---
  { id: 'bev_beer_regular', name: 'Beer, regular', category: 'beverage', subcategory: 'alcohol', beverageItem: 'beer_regular', icon: '', servingType: 'weight', caloriesPer100g: 43, proteinPer100g: 0.5, carbsPer100g: 3.5, fatPer100g: 0.0, typicalGrams: 356 },
  { id: 'bev_beer_light', name: 'Beer, light', category: 'beverage', subcategory: 'alcohol', beverageItem: 'beer_light', icon: '', servingType: 'weight', caloriesPer100g: 29, proteinPer100g: 0.2, carbsPer100g: 1.6, fatPer100g: 0.0, typicalGrams: 356 },
  { id: 'bev_beer_higher_alc', name: 'Beer, higher alcohol / craft', category: 'beverage', subcategory: 'alcohol', beverageItem: 'beer_higher_alc', icon: '', servingType: 'weight', caloriesPer100g: 58, proteinPer100g: 0.9, carbsPer100g: 0.3, fatPer100g: 0.0, typicalGrams: 356 },
  { id: 'bev_wine_red', name: 'Wine, red', category: 'beverage', subcategory: 'alcohol', beverageItem: 'wine_red', icon: '', servingType: 'weight', caloriesPer100g: 85, proteinPer100g: 0.1, carbsPer100g: 2.6, fatPer100g: 0.0, typicalGrams: 147 },
  { id: 'bev_wine_white', name: 'Wine, white', category: 'beverage', subcategory: 'alcohol', beverageItem: 'wine_white', icon: '', servingType: 'weight', caloriesPer100g: 82, proteinPer100g: 0.1, carbsPer100g: 2.6, fatPer100g: 0.0, typicalGrams: 147 },
  { id: 'bev_champagne', name: 'Champagne / Sparkling Wine', category: 'beverage', subcategory: 'alcohol', beverageItem: 'champagne', icon: '', servingType: 'weight', caloriesPer100g: 120, proteinPer100g: 0.2, carbsPer100g: 11.5, fatPer100g: 0.1, typicalGrams: 147 },
  { id: 'bev_wine_dessert', name: 'Dessert / Fortified Wine', category: 'beverage', subcategory: 'alcohol', beverageItem: 'wine_dessert', icon: '', servingType: 'weight', caloriesPer100g: 160, proteinPer100g: 0.2, carbsPer100g: 13.7, fatPer100g: 0.0, typicalGrams: 103 },
  { id: 'bev_liqueur', name: 'Liqueur / Cordial', category: 'beverage', subcategory: 'alcohol', beverageItem: 'liqueur', icon: '', servingType: 'weight', caloriesPer100g: 336, proteinPer100g: 0.1, carbsPer100g: 46.8, fatPer100g: 0.3, typicalGrams: 52 },
  { id: 'bev_margarita', name: 'Margarita', category: 'beverage', subcategory: 'alcohol', beverageItem: 'margarita', icon: '', servingType: 'weight', caloriesPer100g: 122, proteinPer100g: 0.1, carbsPer100g: 16.1, fatPer100g: 0.1, typicalGrams: 120 },
  { id: 'bev_daiquiri', name: 'Daiquiri', category: 'beverage', subcategory: 'alcohol', beverageItem: 'daiquiri', icon: '', servingType: 'weight', caloriesPer100g: 119, proteinPer100g: 0.1, carbsPer100g: 15.6, fatPer100g: 0.1, typicalGrams: 120 },
  { id: 'bev_pina_colada', name: 'Pina Colada', category: 'beverage', subcategory: 'alcohol', beverageItem: 'pina_colada', icon: '', servingType: 'weight', caloriesPer100g: 151, proteinPer100g: 0.4, carbsPer100g: 19.5, fatPer100g: 2.1, typicalGrams: 120 },
  { id: 'bev_bloody_mary', name: 'Bloody Mary', category: 'beverage', subcategory: 'alcohol', beverageItem: 'bloody_mary', icon: '', servingType: 'weight', caloriesPer100g: 73, proteinPer100g: 0.7, carbsPer100g: 3.8, fatPer100g: 0.2, typicalGrams: 120 },
  { id: 'bev_hard_cider', name: 'Hard Cider', category: 'beverage', subcategory: 'alcohol', beverageItem: 'hard_cider', icon: '', servingType: 'weight', caloriesPer100g: 56, proteinPer100g: 0.0, carbsPer100g: 5.9, fatPer100g: 0.0, typicalGrams: 356 },
  { id: 'bev_spirits_80', name: 'Spirits (gin, rum, vodka, whiskey)', category: 'beverage', subcategory: 'alcohol', beverageItem: 'spirits', beverageVariety: 'p80', icon: '', servingType: 'weight', caloriesPer100g: 231, proteinPer100g: 0.0, carbsPer100g: 0.0, fatPer100g: 0.0, typicalGrams: 42 },
  { id: 'bev_spirits_86', name: 'Spirits (gin, rum, vodka, whiskey)', category: 'beverage', subcategory: 'alcohol', beverageItem: 'spirits', beverageVariety: 'p86', icon: '', servingType: 'weight', caloriesPer100g: 250, proteinPer100g: 0.0, carbsPer100g: 0.1, fatPer100g: 0.0, typicalGrams: 42 },
  { id: 'bev_spirits_90', name: 'Spirits (gin, rum, vodka, whiskey)', category: 'beverage', subcategory: 'alcohol', beverageItem: 'spirits', beverageVariety: 'p90', icon: '', servingType: 'weight', caloriesPer100g: 263, proteinPer100g: 0.0, carbsPer100g: 0.0, fatPer100g: 0.0, typicalGrams: 42 },
  { id: 'bev_spirits_94', name: 'Spirits (gin, rum, vodka, whiskey)', category: 'beverage', subcategory: 'alcohol', beverageItem: 'spirits', beverageVariety: 'p94', icon: '', servingType: 'weight', caloriesPer100g: 275, proteinPer100g: 0.0, carbsPer100g: 0.0, fatPer100g: 0.0, typicalGrams: 42 },
  { id: 'bev_spirits_100', name: 'Spirits (gin, rum, vodka, whiskey)', category: 'beverage', subcategory: 'alcohol', beverageItem: 'spirits', beverageVariety: 'p100', icon: '', servingType: 'weight', caloriesPer100g: 295, proteinPer100g: 0.0, carbsPer100g: 0.0, fatPer100g: 0.0, typicalGrams: 42 },

  // --- Shakes & Powders ---
  { id: 'bev_protein_shake_rtd', name: 'Protein Shake, ready-to-drink', category: 'beverage', subcategory: 'nutritional', beverageItem: 'protein_shake_rtd', icon: '', servingType: 'weight', caloriesPer100g: 61, proteinPer100g: 6.6, carbsPer100g: 0.8, fatPer100g: 3.4, typicalGrams: 330 },
  { id: 'bev_protein_powder', name: 'Protein Powder', category: 'beverage', subcategory: 'nutritional', beverageItem: 'protein_powder', icon: '', servingType: 'weight', caloriesPer100g: 352, proteinPer100g: 78.1, carbsPer100g: 6.2, fatPer100g: 1.6, typicalGrams: 31 },
  { id: 'bev_meal_replacement', name: 'Meal Replacement Shake', category: 'beverage', subcategory: 'nutritional', beverageItem: 'meal_replacement', icon: '', servingType: 'weight', caloriesPer100g: 105, proteinPer100g: 3.8, carbsPer100g: 16.9, fatPer100g: 2.5, typicalGrams: 330 },
  { id: 'bev_nutritional_powder', name: 'Nutritional Powder Mix', category: 'beverage', subcategory: 'nutritional', beverageItem: 'nutritional_powder', icon: '', servingType: 'weight', caloriesPer100g: 353, proteinPer100g: 19.9, carbsPer100g: 66.2, fatPer100g: 1.4, typicalGrams: 31 },
  { id: 'bev_breakfast_drink', name: 'Instant Breakfast Drink', category: 'beverage', subcategory: 'nutritional', beverageItem: 'breakfast_drink', icon: '', servingType: 'weight', caloriesPer100g: 353, proteinPer100g: 19.9, carbsPer100g: 66.2, fatPer100g: 1.4, typicalGrams: 250 },
];

export default foodsBeverages;
