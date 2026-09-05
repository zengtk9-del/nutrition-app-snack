// Curated Dairy foods -- Category (Dairy) > Type (data/dairyHierarchy.js's
// DAIRY_TYPES) > flat list, the same two-level shape as data/foodsFruit.js.
//
// Scope: "common grocery coverage" for Cheese (~30 items, not the full
// ~215-entry USDA cheese catalog) and similarly mainstream-focused
// coverage for the other four Types -- Damon's explicit "(Recommended)"
// call when asked about Cheese curation depth. Every entry below
// *supersedes* an old flat `category: 'dairy'` row of the same id
// elsewhere in this app's data files (data/foods.js, foodsFNDDS1.js,
// foodsSRLegacy1-4.js) -- those old rows are deleted as part of this same
// round so this file becomes the single source for these 61 ids, same
// supersession pattern as data/foodsFruit.js and data/foodsEggs.js. Ids
// are kept IDENTICAL to the old rows they supersede (not renamed) so any
// existing favorites/log entries referencing these ids keep resolving
// correctly.
//
// Four scope decisions Damon made explicitly (all "(Recommended)"):
//   1. Cottage Cheese and Cream Cheese -> both grouped under Cheese, not
//      split into their own Types.
//   2. Sour Cream and dairy-based coffee creamer -> both grouped under
//      Cream & Creamers, not given a separate Type.
//   3. Cheese curation depth -> common grocery coverage (~30 items), not
//      the full USDA catalog.
//   4. Plant milks / non-dairy creamers (already under category:
//      'beverage') -> left in Beverages only, NOT cross-listed here --
//      explicitly different from Butter's cross-listing below, since
//      plant milk isn't actually dairy the way Butter genuinely is both
//      a dairy product and a fat/oil.
//
// Butter cross-listing: the 3 Butter entries below carry a primary
// `category: 'dairy'` plus `crossListCategories: ['fat_oil']`, so they
// surface under both the Dairy and Fats & Oils tabs from one row -- same
// mechanism as Fruit's Bell Pepper/Avocado/etc. cross-listing (see
// data/foodsFruit.js and utils/nutrition.js's filterByCategory). This
// supersedes the old flat `butter` entry in data/foods.js (category:
// 'fat_oil', count-type, "1 tbsp"), which is deleted as redundant.
//
// typicalGrams data-quality fixes (same pattern as the Fruit/Eggs
// rounds -- several old USDA rows carried a leftover multi-serving/batch
// reference weight instead of a sane single-serving weight):
//   - goat_milk: 61g -> 244g (was a stray ~1/4-cup value; a "glass of
//     milk" serving is ~1 cup/244g, matching every other Milk-type row
//     here)
//   - cheese_colby: 113g -> 28g (was a 4-serving/quarter-block value; a
//     real cheese serving is ~1 oz/28g, matching every other cheese here)
//   - cheese_colby_jack: 132g -> 28g (same reasoning as cheese_colby)
//   - cheese_blue: 17g -> 28g (was under a normal 1 oz serving; bumped up
//     to match the same ~1 oz/28g standard every other cheese here uses)
//   - cheese_cottage_lowfat_2_milkfat: 55g -> 113g (was a half-normal
//     value; a real cottage cheese serving is ~1/2 cup/113g, matching
//     cottage_cheese_full_fat_large_or_small_curd's 110g below)
//   - butter_salted / butter_without_salt: 5g -> 14g (was a pat-sized
//     sliver; a real butter serving is ~1 tbsp/14g)
//   - butter_whipped_with_salt: 151g -> 9g (was a near-whole-tub batch
//     value; whipped butter is less dense per tbsp than stick butter, so
//     its real ~1 tbsp serving is ~9g rather than stick butter's ~14g)

const foodsDairy = [
  // --- Milk ---
  // Unchanged from the previous round -- MilkCard's Fat % x Lactose Free
  // toggles already cover these 8. Lactose-free rows deliberately mirror
  // their regular twins: the lactase treatment splits lactose into glucose
  // + galactose without changing calories, protein, carbs or fat.
  { id: 'milk_whole', name: 'Milk, whole', category: 'dairy', subcategory: 'milk', milkFatLevel: 'whole', lactoseFree: false, icon: '', servingType: 'weight', caloriesPer100g: 61, proteinPer100g: 3.3, carbsPer100g: 4.6, fatPer100g: 3.2, typicalGrams: 244 },
  { id: 'milk_reduced_fat_2', name: 'Milk, reduced fat (2%)', category: 'dairy', subcategory: 'milk', milkFatLevel: 'reduced_fat', lactoseFree: false, icon: '', servingType: 'weight', caloriesPer100g: 50, proteinPer100g: 3.4, carbsPer100g: 4.9, fatPer100g: 1.9, typicalGrams: 244 },
  { id: 'milk_low_fat_1', name: 'Milk, low fat (1%)', category: 'dairy', subcategory: 'milk', milkFatLevel: 'low_fat', lactoseFree: false, icon: '', servingType: 'weight', caloriesPer100g: 43, proteinPer100g: 3.4, carbsPer100g: 5.2, fatPer100g: 0.9, typicalGrams: 244 },
  { id: 'milk_nonfat_fluid_with_added_vitamin_a_and_vitamin_d_fat_free_or_skim', name: 'Milk, fat free (skim)', category: 'dairy', subcategory: 'milk', milkFatLevel: 'fat_free', lactoseFree: false, icon: '', servingType: 'weight', caloriesPer100g: 34, proteinPer100g: 3.4, carbsPer100g: 4.9, fatPer100g: 0.1, typicalGrams: 246 },
  { id: 'milk_lactose_free_whole', name: 'Milk, lactose free, whole', category: 'dairy', subcategory: 'milk', milkFatLevel: 'whole', lactoseFree: true, icon: '', servingType: 'weight', caloriesPer100g: 61, proteinPer100g: 3.3, carbsPer100g: 4.6, fatPer100g: 3.2, typicalGrams: 244 },
  { id: 'milk_lactose_free_reduced_fat_2', name: 'Milk, lactose free, reduced fat (2%)', category: 'dairy', subcategory: 'milk', milkFatLevel: 'reduced_fat', lactoseFree: true, icon: '', servingType: 'weight', caloriesPer100g: 50, proteinPer100g: 3.4, carbsPer100g: 4.9, fatPer100g: 1.9, typicalGrams: 244 },
  { id: 'milk_lactose_free_low_fat_1', name: 'Milk, lactose free, low fat (1%)', category: 'dairy', subcategory: 'milk', milkFatLevel: 'low_fat', lactoseFree: true, icon: '', servingType: 'weight', caloriesPer100g: 43, proteinPer100g: 3.4, carbsPer100g: 5.2, fatPer100g: 0.9, typicalGrams: 244 },
  { id: 'milk_lactose_free_fat_free_skim', name: 'Milk, lactose free, fat free (skim)', category: 'dairy', subcategory: 'milk', milkFatLevel: 'fat_free', lactoseFree: true, icon: '', servingType: 'weight', caloriesPer100g: 34, proteinPer100g: 3.4, carbsPer100g: 4.9, fatPer100g: 0.1, typicalGrams: 246 },

  // The four Milk products that are NOT 'cow milk at some fat %'. Each is
  // its own distinct product, so each gets its own toggle-less card.
  { id: 'buttermilk', name: 'Buttermilk', category: 'dairy', subcategory: 'milk', milkStandalone: true, icon: '', servingType: 'weight', caloriesPer100g: 43, proteinPer100g: 3.5, carbsPer100g: 4.8, fatPer100g: 1.1, typicalGrams: 244 },
  { id: 'kefir', name: 'Kefir', category: 'dairy', subcategory: 'milk', milkStandalone: true, icon: '', servingType: 'weight', caloriesPer100g: 52, proteinPer100g: 3.6, carbsPer100g: 7.5, fatPer100g: 1, typicalGrams: 244 },
  { id: 'goat_milk', name: 'Goat milk', category: 'dairy', subcategory: 'milk', milkStandalone: true, icon: '', servingType: 'weight', caloriesPer100g: 69, proteinPer100g: 3.6, carbsPer100g: 4.5, fatPer100g: 4.1, typicalGrams: 244 },
  { id: 'milk_condensed_sweetened', name: 'Condensed Milk', category: 'dairy', subcategory: 'milk', milkStandalone: true, icon: '', servingType: 'weight', caloriesPer100g: 321, proteinPer100g: 7.9, carbsPer100g: 54.4, fatPer100g: 8.7, typicalGrams: 19 },

  // --- Yogurt ---
  // A complete 3-axis grid: Style (Regular/Greek) x Fat (Whole/Low Fat/
  // Nonfat) x Flavor (Plain/Fruit/Other Flavors) = 18 cells, every one a
  // real USDA row. That completeness is why YogurtCard needs no data-gating
  // on any of its three toggles -- unlike every meat card in this app.

  // The 6 plain cells keep the ids they already had so saved favorites
  // still resolve; the other 12 are new. The 3 old flavoured rows
  // (Greek strawberry / Greek vanilla / fruit low-fat) are retired: they
  // were arbitrary single points on an axis USDA actually measures as an
  // average, and the grid covers them properly now.

  // 'Fruit' and 'Other Flavors' ARE USDA averages across every flavour,
  // not a specific strawberry or vanilla -- YogurtCard says so on the card
  // rather than implying precision that isn't there.
  { id: 'yogurt_plain_whole_milk', name: 'Yogurt, Whole Milk, Plain', category: 'dairy', subcategory: 'yogurt', yogurtStyle: 'regular', yogurtFat: 'whole', yogurtFlavor: 'plain', icon: '', servingType: 'weight', caloriesPer100g: 77, proteinPer100g: 3.8, carbsPer100g: 5.6, fatPer100g: 4.5, typicalGrams: 170 },
  { id: 'yogurt_regular_whole_fruit', name: 'Yogurt, Whole Milk, Fruit', category: 'dairy', subcategory: 'yogurt', yogurtStyle: 'regular', yogurtFat: 'whole', yogurtFlavor: 'fruit', icon: '', servingType: 'weight', caloriesPer100g: 106, proteinPer100g: 3.3, carbsPer100g: 14.4, fatPer100g: 3.9, typicalGrams: 170 },
  { id: 'yogurt_regular_whole_other', name: 'Yogurt, Whole Milk, Other Flavors', category: 'dairy', subcategory: 'yogurt', yogurtStyle: 'regular', yogurtFat: 'whole', yogurtFlavor: 'other', icon: '', servingType: 'weight', caloriesPer100g: 95, proteinPer100g: 3.3, carbsPer100g: 11.8, fatPer100g: 3.9, typicalGrams: 170 },
  { id: 'yogurt_low_fat_milk_plain', name: 'Yogurt, Low Fat, Plain', category: 'dairy', subcategory: 'yogurt', yogurtStyle: 'regular', yogurtFat: 'low_fat', yogurtFlavor: 'plain', icon: '', servingType: 'weight', caloriesPer100g: 63, proteinPer100g: 5.2, carbsPer100g: 7, fatPer100g: 1.6, typicalGrams: 170 },
  { id: 'yogurt_regular_low_fat_fruit', name: 'Yogurt, Low Fat, Fruit', category: 'dairy', subcategory: 'yogurt', yogurtStyle: 'regular', yogurtFat: 'low_fat', yogurtFlavor: 'fruit', icon: '', servingType: 'weight', caloriesPer100g: 93, proteinPer100g: 4.6, carbsPer100g: 15.7, fatPer100g: 1.3, typicalGrams: 170 },
  { id: 'yogurt_regular_low_fat_other', name: 'Yogurt, Low Fat, Other Flavors', category: 'dairy', subcategory: 'yogurt', yogurtStyle: 'regular', yogurtFat: 'low_fat', yogurtFlavor: 'other', icon: '', servingType: 'weight', caloriesPer100g: 82, proteinPer100g: 4.5, carbsPer100g: 13.0, fatPer100g: 1.4, typicalGrams: 170 },
  { id: 'yogurt_plain_nonfat', name: 'Yogurt, Nonfat, Plain', category: 'dairy', subcategory: 'yogurt', yogurtStyle: 'regular', yogurtFat: 'nonfat', yogurtFlavor: 'plain', icon: '', servingType: 'weight', caloriesPer100g: 50, proteinPer100g: 4.2, carbsPer100g: 8.1, fatPer100g: 0.1, typicalGrams: 170 },
  { id: 'yogurt_regular_nonfat_fruit', name: 'Yogurt, Nonfat, Fruit', category: 'dairy', subcategory: 'yogurt', yogurtStyle: 'regular', yogurtFat: 'nonfat', yogurtFlavor: 'fruit', icon: '', servingType: 'weight', caloriesPer100g: 46, proteinPer100g: 3.6, carbsPer100g: 7.6, fatPer100g: 0.1, typicalGrams: 170 },
  { id: 'yogurt_regular_nonfat_other', name: 'Yogurt, Nonfat, Other Flavors', category: 'dairy', subcategory: 'yogurt', yogurtStyle: 'regular', yogurtFat: 'nonfat', yogurtFlavor: 'other', icon: '', servingType: 'weight', caloriesPer100g: 47, proteinPer100g: 3.6, carbsPer100g: 7.9, fatPer100g: 0.1, typicalGrams: 170 },
  { id: 'yogurt_greek_plain_whole_milk', name: 'Yogurt, Greek, Whole Milk, Plain', category: 'dairy', subcategory: 'yogurt', yogurtStyle: 'greek', yogurtFat: 'whole', yogurtFlavor: 'plain', icon: '', servingType: 'weight', caloriesPer100g: 94, proteinPer100g: 8.8, carbsPer100g: 4.8, fatPer100g: 4.4, typicalGrams: 170 },
  { id: 'yogurt_greek_whole_fruit', name: 'Yogurt, Greek, Whole Milk, Fruit', category: 'dairy', subcategory: 'yogurt', yogurtStyle: 'greek', yogurtFat: 'whole', yogurtFlavor: 'fruit', icon: '', servingType: 'weight', caloriesPer100g: 106, proteinPer100g: 7.3, carbsPer100g: 12.3, fatPer100g: 3.0, typicalGrams: 170 },
  { id: 'yogurt_greek_whole_other', name: 'Yogurt, Greek, Whole Milk, Other Flavors', category: 'dairy', subcategory: 'yogurt', yogurtStyle: 'greek', yogurtFat: 'whole', yogurtFlavor: 'other', icon: '', servingType: 'weight', caloriesPer100g: 104, proteinPer100g: 7.8, carbsPer100g: 9.2, fatPer100g: 3.9, typicalGrams: 170 },
  { id: 'yogurt_greek_low_fat_milk_plain', name: 'Yogurt, Greek, Low Fat, Plain', category: 'dairy', subcategory: 'yogurt', yogurtStyle: 'greek', yogurtFat: 'low_fat', yogurtFlavor: 'plain', icon: '', servingType: 'weight', caloriesPer100g: 67, proteinPer100g: 10.2, carbsPer100g: 3.6, fatPer100g: 1.4, typicalGrams: 170 },
  { id: 'yogurt_greek_low_fat_fruit', name: 'Yogurt, Greek, Low Fat, Fruit', category: 'dairy', subcategory: 'yogurt', yogurtStyle: 'greek', yogurtFat: 'low_fat', yogurtFlavor: 'fruit', icon: '', servingType: 'weight', caloriesPer100g: 91, proteinPer100g: 9.1, carbsPer100g: 10.8, fatPer100g: 1.3, typicalGrams: 170 },
  { id: 'yogurt_greek_low_fat_other', name: 'Yogurt, Greek, Low Fat, Other Flavors', category: 'dairy', subcategory: 'yogurt', yogurtStyle: 'greek', yogurtFat: 'low_fat', yogurtFlavor: 'other', icon: '', servingType: 'weight', caloriesPer100g: 81, proteinPer100g: 9.1, carbsPer100g: 8.2, fatPer100g: 1.3, typicalGrams: 170 },
  { id: 'yogurt_greek_plain_nonfat', name: 'Yogurt, Greek, Nonfat, Plain', category: 'dairy', subcategory: 'yogurt', yogurtStyle: 'greek', yogurtFat: 'nonfat', yogurtFlavor: 'plain', icon: '', servingType: 'weight', caloriesPer100g: 61, proteinPer100g: 10.3, carbsPer100g: 3.6, fatPer100g: 0.4, typicalGrams: 170 },
  { id: 'yogurt_greek_nonfat_fruit', name: 'Yogurt, Greek, Nonfat, Fruit', category: 'dairy', subcategory: 'yogurt', yogurtStyle: 'greek', yogurtFat: 'nonfat', yogurtFlavor: 'fruit', icon: '', servingType: 'weight', caloriesPer100g: 83, proteinPer100g: 9.2, carbsPer100g: 10.8, fatPer100g: 0.3, typicalGrams: 170 },
  { id: 'yogurt_greek_nonfat_other', name: 'Yogurt, Greek, Nonfat, Other Flavors', category: 'dairy', subcategory: 'yogurt', yogurtStyle: 'greek', yogurtFat: 'nonfat', yogurtFlavor: 'other', icon: '', servingType: 'weight', caloriesPer100g: 73, proteinPer100g: 9.2, carbsPer100g: 8.2, fatPer100g: 0.3, typicalGrams: 170 },

  // --- Butter ---
  // Form x Salt, data-gated. Salted and unsalted butter carry IDENTICAL
  // macros, which is correct rather than a copy-paste error -- salt adds no
  // calories, protein, carbs or fat. The Salt toggle is a shopping
  // distinction the app records, not a nutritional one.

  // Whipped has no unsalted row in USDA and ghee has neither, so ButterCard
  // hides the Salt toggle for those forms rather than offering a choice
  // with nothing behind it.
  { id: 'butter_salted', name: 'Butter, stick, salted', category: 'dairy', subcategory: 'butter', crossListCategories: ['fat_oil'], butterForm: 'stick', butterSalt: 'salted', icon: '', servingType: 'weight', caloriesPer100g: 717, proteinPer100g: 0.8, carbsPer100g: 0.1, fatPer100g: 81.1, typicalGrams: 14 },
  { id: 'butter_without_salt', name: 'Butter, stick, unsalted', category: 'dairy', subcategory: 'butter', crossListCategories: ['fat_oil'], butterForm: 'stick', butterSalt: 'unsalted', icon: '', servingType: 'weight', caloriesPer100g: 717, proteinPer100g: 0.8, carbsPer100g: 0.1, fatPer100g: 81.1, typicalGrams: 14 },
  { id: 'butter_whipped_with_salt', name: 'Butter, whipped, salted', category: 'dairy', subcategory: 'butter', crossListCategories: ['fat_oil'], butterForm: 'whipped', butterSalt: 'salted', icon: '', servingType: 'weight', caloriesPer100g: 731, proteinPer100g: 0.5, carbsPer100g: 0, fatPer100g: 78.3, typicalGrams: 9 },
  { id: 'butter_light_salted', name: 'Butter, light, salted', category: 'dairy', subcategory: 'butter', crossListCategories: ['fat_oil'], butterForm: 'light', butterSalt: 'salted', icon: '', servingType: 'weight', caloriesPer100g: 499, proteinPer100g: 3.3, carbsPer100g: 0.0, fatPer100g: 55.1, typicalGrams: 14 },
  { id: 'butter_light_unsalted', name: 'Butter, light, unsalted', category: 'dairy', subcategory: 'butter', crossListCategories: ['fat_oil'], butterForm: 'light', butterSalt: 'unsalted', icon: '', servingType: 'weight', caloriesPer100g: 499, proteinPer100g: 3.3, carbsPer100g: 0.0, fatPer100g: 55.1, typicalGrams: 14 },
  { id: 'butter_ghee', name: 'Ghee (clarified butter)', category: 'dairy', subcategory: 'butter', crossListCategories: ['fat_oil'], butterForm: 'ghee', butterSalt: 'none', icon: '', servingType: 'weight', caloriesPer100g: 876, proteinPer100g: 0.3, carbsPer100g: 0.0, fatPer100g: 99.5, typicalGrams: 13 },

  // --- Cream & Creamers ---
  // Split into three genuinely different products, each with its own fat
  // ladder, instead of one mixed list. `creamGroup` picks the card;
  // `creamLevel` is what its toggle switches between.
  { id: 'cream_fluid_half_and_half', name: 'Cream, half and half', category: 'dairy', subcategory: 'cream_creamer', creamGroup: 'cream', creamLevel: 'half_and_half', icon: '', servingType: 'weight', caloriesPer100g: 131, proteinPer100g: 3.1, carbsPer100g: 4.3, fatPer100g: 11.5, typicalGrams: 15 },
  { id: 'cream_half_and_half_fat_free', name: 'Cream, half and half, fat free', category: 'dairy', subcategory: 'cream_creamer', creamGroup: 'cream', creamLevel: 'half_and_half_ff', icon: '', servingType: 'weight', caloriesPer100g: 59, proteinPer100g: 2.6, carbsPer100g: 9.0, fatPer100g: 1.4, typicalGrams: 15 },
  { id: 'cream_light', name: 'Cream, light', category: 'dairy', subcategory: 'cream_creamer', creamGroup: 'cream', creamLevel: 'light', icon: '', servingType: 'weight', caloriesPer100g: 195, proteinPer100g: 3, carbsPer100g: 3.7, fatPer100g: 19.1, typicalGrams: 15 },
  { id: 'cream_whipping', name: 'Cream, light whipping', category: 'dairy', subcategory: 'cream_creamer', creamGroup: 'cream', creamLevel: 'whipping', icon: '', servingType: 'weight', caloriesPer100g: 292, proteinPer100g: 2.2, carbsPer100g: 3.0, fatPer100g: 30.9, typicalGrams: 15 },
  { id: 'cream_heavy', name: 'Cream, heavy', category: 'dairy', subcategory: 'cream_creamer', creamGroup: 'cream', creamLevel: 'heavy', icon: '', servingType: 'weight', caloriesPer100g: 336, proteinPer100g: 2, carbsPer100g: 3.8, fatPer100g: 35.6, typicalGrams: 15 },
  { id: 'sour_cream_regular', name: 'Sour cream, regular', category: 'dairy', subcategory: 'cream_creamer', creamGroup: 'sour_cream', creamLevel: 'regular', icon: '', servingType: 'weight', caloriesPer100g: 196, proteinPer100g: 3.1, carbsPer100g: 5.6, fatPer100g: 18, typicalGrams: 30 },
  { id: 'sour_cream_light', name: 'Sour cream, light', category: 'dairy', subcategory: 'cream_creamer', creamGroup: 'sour_cream', creamLevel: 'light', icon: '', servingType: 'weight', caloriesPer100g: 136, proteinPer100g: 3.5, carbsPer100g: 7.1, fatPer100g: 10.6, typicalGrams: 30 },
  { id: 'sour_cream_reduced_fat', name: 'Sour cream, reduced fat', category: 'dairy', subcategory: 'cream_creamer', creamGroup: 'sour_cream', creamLevel: 'reduced_fat', icon: '', servingType: 'weight', caloriesPer100g: 181, proteinPer100g: 7, carbsPer100g: 7, fatPer100g: 14.1, typicalGrams: 30 },
  { id: 'sour_cream_fat_free', name: 'Sour cream, fat free', category: 'dairy', subcategory: 'cream_creamer', creamGroup: 'sour_cream', creamLevel: 'fat_free', icon: '', servingType: 'weight', caloriesPer100g: 74, proteinPer100g: 3.1, carbsPer100g: 15.6, fatPer100g: 0, typicalGrams: 30 },
  { id: 'cream_whipped', name: 'Whipped cream', category: 'dairy', subcategory: 'cream_creamer', creamGroup: 'whipped_topping', creamLevel: 'real_cream', icon: '', servingType: 'weight', caloriesPer100g: 346, proteinPer100g: 1.9, carbsPer100g: 9.5, fatPer100g: 33.4, typicalGrams: 20 },
  { id: 'whipped_topping', name: 'Whipped topping', category: 'dairy', subcategory: 'cream_creamer', creamGroup: 'whipped_topping', creamLevel: 'topping', icon: '', servingType: 'weight', caloriesPer100g: 318, proteinPer100g: 1.2, carbsPer100g: 23, fatPer100g: 25.3, typicalGrams: 19 },
  { id: 'whipped_topping_fat_free', name: 'Whipped topping, fat free', category: 'dairy', subcategory: 'cream_creamer', creamGroup: 'whipped_topping', creamLevel: 'topping_ff', icon: '', servingType: 'weight', caloriesPer100g: 224, proteinPer100g: 3, carbsPer100g: 23.6, fatPer100g: 13.1, typicalGrams: 19 },

  // --- Cheese ---
  // 28 cheeses: the 21 already curated plus 7 grocery-common additions
  // (ricotta, brie, gruyere, fontina, romano, Mexican blend, oaxaca).
  // USDA has no havarti, asiago, mascarpone or halloumi at all, so those
  // stay absent rather than being invented.

  // `cheeseType` is the card; `cheeseVariant` is what its toggle switches
  // between; `variantAxis` says whether that toggle is a FAT ladder or a
  // FORM choice, so CheeseCard can label it correctly. Cheeses with one
  // row show no toggle at all.

  // Existing rows keep their macros AND their ids untouched -- several of
  // USDA's Foundation entries for these exact cheeses carry fat but no
  // calories, and the earlier curation had already substituted complete
  // rows. Only the 7 new cheeses are sourced fresh.
  { id: 'cheese_cheddar_sharp_sliced', name: 'Cheddar, sharp', category: 'dairy', subcategory: 'cheese', cheeseType: 'cheddar', cheeseVariant: 'regular', variantAxis: 'fat', icon: '', servingType: 'weight', caloriesPer100g: 410, proteinPer100g: 24.2, carbsPer100g: 2.1, fatPer100g: 33.8, typicalGrams: 28 },
  { id: 'cheese_cheddar_reduced_fat_includes_foods_for_usda_s_food_distribution_program', name: 'Cheddar, reduced fat', category: 'dairy', subcategory: 'cheese', cheeseType: 'cheddar', cheeseVariant: 'reduced_fat', variantAxis: 'fat', icon: '', servingType: 'weight', caloriesPer100g: 316, proteinPer100g: 27.4, carbsPer100g: 2.7, fatPer100g: 20.4, typicalGrams: 21 },
  { id: 'cheese_mozzarella_whole_milk', name: 'Mozzarella, whole milk', category: 'dairy', subcategory: 'cheese', cheeseType: 'mozzarella', cheeseVariant: 'regular', variantAxis: 'fat', icon: '', servingType: 'weight', caloriesPer100g: 299, proteinPer100g: 22.2, carbsPer100g: 2.4, fatPer100g: 22.1, typicalGrams: 28 },
  { id: 'cheese_mozzarella_low_moisture_part_skim', name: 'Mozzarella, part-skim', category: 'dairy', subcategory: 'cheese', cheeseType: 'mozzarella', cheeseVariant: 'reduced_fat', variantAxis: 'fat', icon: '', servingType: 'weight', caloriesPer100g: 295, proteinPer100g: 23.8, carbsPer100g: 5.6, fatPer100g: 19.8, typicalGrams: 28 },
  { id: 'cheese_provolone_sliced', name: 'Provolone', category: 'dairy', subcategory: 'cheese', cheeseType: 'provolone', cheeseVariant: 'regular', variantAxis: 'fat', icon: '', servingType: 'weight', caloriesPer100g: 357, proteinPer100g: 23.5, carbsPer100g: 2.5, fatPer100g: 28.1, typicalGrams: 28 },
  { id: 'cheese_provolone_reduced_fat', name: 'Provolone, reduced fat', category: 'dairy', subcategory: 'cheese', cheeseType: 'provolone', cheeseVariant: 'reduced_fat', variantAxis: 'fat', icon: '', servingType: 'weight', caloriesPer100g: 274, proteinPer100g: 24.7, carbsPer100g: 3.5, fatPer100g: 17.6, typicalGrams: 28 },
  { id: 'cream_cheese_regular_plain', name: 'Cream cheese', category: 'dairy', subcategory: 'cheese', cheeseType: 'cream_cheese', cheeseVariant: 'regular', variantAxis: 'fat', icon: '', servingType: 'weight', caloriesPer100g: 343, proteinPer100g: 5.8, carbsPer100g: 4.6, fatPer100g: 33.5, typicalGrams: 28 },
  { id: 'cream_cheese_light', name: 'Cream cheese, light', category: 'dairy', subcategory: 'cheese', cheeseType: 'cream_cheese', cheeseVariant: 'reduced_fat', variantAxis: 'fat', icon: '', servingType: 'weight', caloriesPer100g: 264, proteinPer100g: 9.1, carbsPer100g: 5.6, fatPer100g: 22.7, typicalGrams: 15 },
  { id: 'cheese_neufchatel', name: 'Neufchatel', category: 'dairy', subcategory: 'cheese', cheeseType: 'cream_cheese', cheeseVariant: 'neufchatel', variantAxis: 'fat', icon: '', servingType: 'weight', caloriesPer100g: 253, proteinPer100g: 9.2, carbsPer100g: 3.6, fatPer100g: 22.8, typicalGrams: 28 },
  { id: 'cottage_cheese_full_fat_large_or_small_curd', name: 'Cottage cheese, full fat', category: 'dairy', subcategory: 'cheese', cheeseType: 'cottage', cheeseVariant: 'regular', variantAxis: 'fat', icon: '', servingType: 'weight', caloriesPer100g: 104, proteinPer100g: 11.6, carbsPer100g: 4.6, fatPer100g: 4.2, typicalGrams: 110 },
  { id: 'cheese_cottage_lowfat_2_milkfat', name: 'Cottage cheese, 2%', category: 'dairy', subcategory: 'cheese', cheeseType: 'cottage', cheeseVariant: 'two_percent', variantAxis: 'fat', icon: '', servingType: 'weight', caloriesPer100g: 84, proteinPer100g: 11, carbsPer100g: 4.3, fatPer100g: 2.3, typicalGrams: 113 },
  { id: 'cheese_cottage_lowfat_1_milkfat', name: 'Cottage cheese, 1%', category: 'dairy', subcategory: 'cheese', cheeseType: 'cottage', cheeseVariant: 'one_percent', variantAxis: 'fat', icon: '', servingType: 'weight', caloriesPer100g: 72, proteinPer100g: 12.4, carbsPer100g: 2.7, fatPer100g: 1, typicalGrams: 113 },
  { id: 'cheese_parmesan_hard', name: 'Parmesan, hard', category: 'dairy', subcategory: 'cheese', cheeseType: 'parmesan', cheeseVariant: 'hard', variantAxis: 'form', icon: '', servingType: 'weight', caloriesPer100g: 392, proteinPer100g: 35.8, carbsPer100g: 3.2, fatPer100g: 25, typicalGrams: 10 },
  { id: 'cheese_parmesan_grated', name: 'Parmesan, grated', category: 'dairy', subcategory: 'cheese', cheeseType: 'parmesan', cheeseVariant: 'grated', variantAxis: 'form', icon: '', servingType: 'weight', caloriesPer100g: 421, proteinPer100g: 29.6, carbsPer100g: 12.4, fatPer100g: 28, typicalGrams: 5 },
  { id: 'cheese_goat_soft_type', name: 'Goat cheese, soft', category: 'dairy', subcategory: 'cheese', cheeseType: 'goat', cheeseVariant: 'soft', variantAxis: 'form', icon: '', servingType: 'weight', caloriesPer100g: 264, proteinPer100g: 18.5, carbsPer100g: 0, fatPer100g: 21.1, typicalGrams: 28 },
  { id: 'cheese_goat_hard_type', name: 'Goat cheese, hard', category: 'dairy', subcategory: 'cheese', cheeseType: 'goat', cheeseVariant: 'hard', variantAxis: 'form', icon: '', servingType: 'weight', caloriesPer100g: 452, proteinPer100g: 30.5, carbsPer100g: 2.2, fatPer100g: 35.6, typicalGrams: 28 },
  { id: 'cheese_swiss', name: 'Swiss', category: 'dairy', subcategory: 'cheese', cheeseType: 'swiss', icon: '', servingType: 'weight', caloriesPer100g: 393, proteinPer100g: 27, carbsPer100g: 1.4, fatPer100g: 31, typicalGrams: 30 },
  { id: 'cheese_feta_whole_milk_crumbled', name: 'Feta', category: 'dairy', subcategory: 'cheese', cheeseType: 'feta', icon: '', servingType: 'weight', caloriesPer100g: 274, proteinPer100g: 19.7, carbsPer100g: 5.6, fatPer100g: 19.1, typicalGrams: 30 },
  { id: 'cheese_monterey_jack_solid', name: 'Monterey Jack', category: 'dairy', subcategory: 'cheese', cheeseType: 'monterey_jack', icon: '', servingType: 'weight', caloriesPer100g: 390, proteinPer100g: 22.6, carbsPer100g: 1.9, fatPer100g: 32.6, typicalGrams: 30 },
  { id: 'cheese_pasteurized_process_cheese_food_or_product_american_singles', name: 'American, singles', category: 'dairy', subcategory: 'cheese', cheeseType: 'american', icon: '', servingType: 'weight', caloriesPer100g: 308, proteinPer100g: 15.6, carbsPer100g: 8.2, fatPer100g: 23.9, typicalGrams: 30 },
  { id: 'cheese_queso_fresco_solid', name: 'Queso Fresco', category: 'dairy', subcategory: 'cheese', cheeseType: 'queso_fresco', icon: '', servingType: 'weight', caloriesPer100g: 298, proteinPer100g: 18.9, carbsPer100g: 3, fatPer100g: 23.4, typicalGrams: 30 },
  { id: 'cheese_cotija_solid', name: 'Cotija', category: 'dairy', subcategory: 'cheese', cheeseType: 'cotija', icon: '', servingType: 'weight', caloriesPer100g: 351, proteinPer100g: 23.8, carbsPer100g: 2.7, fatPer100g: 27.2, typicalGrams: 30 },
  { id: 'cheese_colby_jack', name: 'Colby Jack', category: 'dairy', subcategory: 'cheese', cheeseType: 'colby_jack', icon: '', servingType: 'weight', caloriesPer100g: 393, proteinPer100g: 23.2, carbsPer100g: 2.2, fatPer100g: 32.4, typicalGrams: 28 },
  { id: 'cheese_colby', name: 'Colby', category: 'dairy', subcategory: 'cheese', cheeseType: 'colby', icon: '', servingType: 'weight', caloriesPer100g: 394, proteinPer100g: 23.8, carbsPer100g: 2.6, fatPer100g: 32.1, typicalGrams: 28 },
  { id: 'cheese_gouda', name: 'Gouda', category: 'dairy', subcategory: 'cheese', cheeseType: 'gouda', icon: '', servingType: 'weight', caloriesPer100g: 356, proteinPer100g: 24.9, carbsPer100g: 2.2, fatPer100g: 27.4, typicalGrams: 28 },
  { id: 'cheese_muenster', name: 'Muenster', category: 'dairy', subcategory: 'cheese', cheeseType: 'muenster', icon: '', servingType: 'weight', caloriesPer100g: 368, proteinPer100g: 23.4, carbsPer100g: 1.1, fatPer100g: 30, typicalGrams: 28 },
  { id: 'cheese_blue', name: 'Blue', category: 'dairy', subcategory: 'cheese', cheeseType: 'blue', icon: '', servingType: 'weight', caloriesPer100g: 353, proteinPer100g: 21.4, carbsPer100g: 2.3, fatPer100g: 28.7, typicalGrams: 28 },
  { id: 'cheese_camembert', name: 'Camembert', category: 'dairy', subcategory: 'cheese', cheeseType: 'camembert', icon: '', servingType: 'weight', caloriesPer100g: 300, proteinPer100g: 19.8, carbsPer100g: 0.5, fatPer100g: 24.3, typicalGrams: 28 },
  { id: 'cheese_edam', name: 'Edam', category: 'dairy', subcategory: 'cheese', cheeseType: 'edam', icon: '', servingType: 'weight', caloriesPer100g: 357, proteinPer100g: 25, carbsPer100g: 1.4, fatPer100g: 28.6, typicalGrams: 28 },
  { id: 'cheese_ricotta', name: 'Ricotta', category: 'dairy', subcategory: 'cheese', cheeseType: 'ricotta', icon: '', servingType: 'weight', caloriesPer100g: 148, proteinPer100g: 9.6, carbsPer100g: 6.0, fatPer100g: 9.5, typicalGrams: 124 },
  { id: 'cheese_brie', name: 'Brie', category: 'dairy', subcategory: 'cheese', cheeseType: 'brie', icon: '', servingType: 'weight', caloriesPer100g: 334, proteinPer100g: 20.8, carbsPer100g: 0.5, fatPer100g: 27.7, typicalGrams: 28 },
  { id: 'cheese_gruyere', name: 'Gruyere', category: 'dairy', subcategory: 'cheese', cheeseType: 'gruyere', icon: '', servingType: 'weight', caloriesPer100g: 413, proteinPer100g: 29.8, carbsPer100g: 0.4, fatPer100g: 32.3, typicalGrams: 28 },
  { id: 'cheese_fontina', name: 'Fontina', category: 'dairy', subcategory: 'cheese', cheeseType: 'fontina', icon: '', servingType: 'weight', caloriesPer100g: 389, proteinPer100g: 25.6, carbsPer100g: 1.6, fatPer100g: 31.1, typicalGrams: 28 },
  { id: 'cheese_romano', name: 'Romano', category: 'dairy', subcategory: 'cheese', cheeseType: 'romano', icon: '', servingType: 'weight', caloriesPer100g: 387, proteinPer100g: 31.8, carbsPer100g: 3.6, fatPer100g: 26.9, typicalGrams: 28 },
  { id: 'cheese_mexican_blend', name: 'Mexican blend', category: 'dairy', subcategory: 'cheese', cheeseType: 'mexican_blend', icon: '', servingType: 'weight', caloriesPer100g: 282, proteinPer100g: 24.7, carbsPer100g: 3.4, fatPer100g: 19.4, typicalGrams: 28 },
  { id: 'cheese_oaxaca', name: 'Oaxaca (queso asadero)', category: 'dairy', subcategory: 'cheese', cheeseType: 'oaxaca', icon: '', servingType: 'weight', caloriesPer100g: 356, proteinPer100g: 22.6, carbsPer100g: 4.1, fatPer100g: 25.0, typicalGrams: 28 },
];

export default foodsDairy;
