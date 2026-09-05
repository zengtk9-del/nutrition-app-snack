// The curated Meat Substitutes list. Replaces 25 raw USDA rows, which were
// really about 17 foods -- USDA carries both "Chicken, meatless" and
// "Chicken, meatless, NFS" (identical numbers), "Meatballs, meatless" and
// "Meatball, meatless", "Bacon, meatless" and "Bacon strip, meatless",
// "Frankfurter, meatless" and "Hot dog, vegetarian". Deduping was most of
// the work.
//
// Too small to justify Types, so it is one item list straight to cards --
// the same shape as Vegetables. The single Type below exists only so the
// picker has something to key on.

export const foodsMeatSubstitutes = [
  // --- All Meat Substitutes ---
  { id: 'meatsub_veggie_burger', name: 'Veggie Burger Patty', category: 'meat_substitute', subcategory: 'substitutes', substituteItem: 'veggie_burger', icon: '', servingType: 'weight', caloriesPer100g: 177, proteinPer100g: 15.7, carbsPer100g: 14.3, fatPer100g: 6.3, typicalGrams: 85 },
  { id: 'meatsub_meatless_chicken', name: 'Meatless Chicken', category: 'meat_substitute', subcategory: 'substitutes', substituteItem: 'meatless_chicken', icon: '', servingType: 'weight', caloriesPer100g: 224, proteinPer100g: 23.6, carbsPer100g: 3.6, fatPer100g: 12.7, typicalGrams: 85 },
  { id: 'meatsub_meatless_chicken_breaded', name: 'Meatless Chicken, breaded', category: 'meat_substitute', subcategory: 'substitutes', substituteItem: 'meatless_chicken_breaded', icon: '', servingType: 'weight', caloriesPer100g: 234, proteinPer100g: 21.3, carbsPer100g: 8.5, fatPer100g: 12.8, typicalGrams: 85 },
  { id: 'meatsub_meatless_bacon', name: 'Meatless Bacon', category: 'meat_substitute', subcategory: 'substitutes', substituteItem: 'meatless_bacon', icon: '', servingType: 'weight', caloriesPer100g: 309, proteinPer100g: 11.7, carbsPer100g: 5.3, fatPer100g: 29.5, typicalGrams: 16 },
  { id: 'meatsub_bacon_bits', name: 'Meatless Bacon Bits', category: 'meat_substitute', subcategory: 'substitutes', substituteItem: 'bacon_bits', icon: '', servingType: 'weight', caloriesPer100g: 476, proteinPer100g: 32.0, carbsPer100g: 28.6, fatPer100g: 25.9, typicalGrams: 7 },
  { id: 'meatsub_meatless_sausage', name: 'Meatless Sausage', category: 'meat_substitute', subcategory: 'substitutes', substituteItem: 'meatless_sausage', icon: '', servingType: 'weight', caloriesPer100g: 255, proteinPer100g: 20.3, carbsPer100g: 8.1, fatPer100g: 18.2, typicalGrams: 56 },
  { id: 'meatsub_breakfast_link', name: 'Meatless Breakfast Link / Patty', category: 'meat_substitute', subcategory: 'substitutes', substituteItem: 'breakfast_link', icon: '', servingType: 'weight', caloriesPer100g: 255, proteinPer100g: 20.3, carbsPer100g: 8.1, fatPer100g: 18.2, typicalGrams: 45 },
  { id: 'meatsub_meatless_hot_dog', name: 'Meatless Hot Dog', category: 'meat_substitute', subcategory: 'substitutes', substituteItem: 'meatless_hot_dog', icon: '', servingType: 'weight', caloriesPer100g: 233, proteinPer100g: 19.6, carbsPer100g: 7.7, fatPer100g: 13.7, typicalGrams: 70 },
  { id: 'meatsub_deli_slices', name: 'Meatless Deli Slices', category: 'meat_substitute', subcategory: 'substitutes', substituteItem: 'deli_slices', icon: '', servingType: 'weight', caloriesPer100g: 189, proteinPer100g: 17.8, carbsPer100g: 4.4, fatPer100g: 11.1, typicalGrams: 56 },
  { id: 'meatsub_meatballs', name: 'Meatless Meatballs', category: 'meat_substitute', subcategory: 'substitutes', substituteItem: 'meatballs', icon: '', servingType: 'weight', caloriesPer100g: 197, proteinPer100g: 21.0, carbsPer100g: 8.0, fatPer100g: 9.0, typicalGrams: 85 },
  { id: 'meatsub_meatloaf_patties', name: 'Vegetarian Meatloaf / Patties', category: 'meat_substitute', subcategory: 'substitutes', substituteItem: 'meatloaf_patties', icon: '', servingType: 'weight', caloriesPer100g: 197, proteinPer100g: 21.0, carbsPer100g: 8.0, fatPer100g: 9.0, typicalGrams: 85 },
  { id: 'meatsub_fillets', name: 'Vegetarian Fillets', category: 'meat_substitute', subcategory: 'substitutes', substituteItem: 'fillets', icon: '', servingType: 'weight', caloriesPer100g: 290, proteinPer100g: 23.0, carbsPer100g: 9.0, fatPer100g: 18.0, typicalGrams: 85 },
  { id: 'meatsub_tvp', name: 'Textured Vegetable Protein, dry', category: 'meat_substitute', subcategory: 'substitutes', substituteItem: 'tvp', icon: '', servingType: 'weight', caloriesPer100g: 366, proteinPer100g: 51.1, carbsPer100g: 32.9, fatPer100g: 3.3, typicalGrams: 30 },
  { id: 'meatsub_meat_extender', name: 'Meat Extender', category: 'meat_substitute', subcategory: 'substitutes', substituteItem: 'meat_extender', icon: '', servingType: 'weight', caloriesPer100g: 311, proteinPer100g: 41.7, carbsPer100g: 34.7, fatPer100g: 3.0, typicalGrams: 30 },
  { id: 'meatsub_stroganoff', name: 'Vegetarian Stroganoff', category: 'meat_substitute', subcategory: 'substitutes', substituteItem: 'stroganoff', icon: '', servingType: 'weight', caloriesPer100g: 167, proteinPer100g: 7.7, carbsPer100g: 11.8, fatPer100g: 10.0, typicalGrams: 250 },
  { id: 'meatsub_pot_pie', name: 'Meatless Pot Pie', category: 'meat_substitute', subcategory: 'substitutes', substituteItem: 'pot_pie', icon: '', servingType: 'weight', caloriesPer100g: 242, proteinPer100g: 5.4, carbsPer100g: 28.0, fatPer100g: 12.2, typicalGrams: 220 },
  { id: 'meatsub_swiss_steak', name: 'Meatless Swiss Steak with Gravy', category: 'meat_substitute', subcategory: 'substitutes', substituteItem: 'swiss_steak', icon: '', servingType: 'weight', caloriesPer100g: 180, proteinPer100g: 12.7, carbsPer100g: 14.1, fatPer100g: 8.1, typicalGrams: 200 },
];

export default foodsMeatSubstitutes;
