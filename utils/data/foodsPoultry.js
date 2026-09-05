// The curated Poultry database -- replaces the ~687 raw USDA SR Legacy /
// FNDDS poultry entries with a small, browsable set for the
// Category > Type > Cut > (skin/bone/raw-cooked toggle card) > portion
// picker in screens/LogFoodScreen.js. Same idea as data/foodsRedMeat.js --
// see that file's header for why this collapsing is worth doing at all.
//
// Unlike Red Meat, the skin axis is kept as REAL data here (skin-on vs.
// skinless is a genuinely different amount of fat/calories), so each entry
// also carries a `skin` field: 'on', 'off', or null when skin doesn't apply
// to that cut at all (ground meat, breaded tenders, giblets/organs, deli &
// processed items). `subcategory` is the bird Type (chicken/turkey/duck/
// other_bird/processed), `cut` is the specific cut, `prep` is 'raw' or
// 'cooked' -- see data/poultryHierarchy.js for the human-readable labels and
// which cuts show which toggles.
//
// The bone in/boneless toggle has NO entry in this file at all -- bone
// contributes zero calories/protein/carbs/fat, so a bone-in and boneless
// version of the exact same cut/skin/prep are nutritionally identical
// (USDA's own data agrees -- it never tracks a nutritionally-distinct
// bone-in variant of anything here). Every number in this file is, and
// always has been, on a per-100g-of-edible-meat basis regardless of the
// toggle.
//
// As of the boneYieldPercent field in data/poultryHierarchy.js, the Bone
// toggle in LogFoodScreen.js's PoultryCard is no longer purely cosmetic for
// most of Chicken and Turkey (breast/thigh/drumstick/wing/leg/whole): it
// converts the WEIGHT typed in (bone-in scale reading -> edible-only grams)
// before the calorie math runs, the same way Seafood's Shell On/Off toggle
// already did. See poultryHierarchy.js's header comment for the sourced
// bone-yield numbers and citations. It's still purely cosmetic (icon only,
// no weight conversion) for Duck, all of Other Poultry & Game Birds, and
// every bird's "Other Cuts" grab-bag -- PoultryCard shows an explicit note
// when that's the case, rather than silently doing nothing.
//
// Not every (Type, Cut, skin, prep) combination has real USDA data -- e.g.
// duck breast has no skin-on + raw entry. data/poultryHierarchy.js's
// `resolvePoultryFood` handles picking the closest real entry when that
// happens, so the picker never dead-ends on a missing combination.

const foodsPoultry = [
  // --- chicken / breast ---
  { id: 'poultry_chicken_breast_on_raw', name: 'Chicken Breast, Skin On', category: 'poultry', subcategory: 'chicken', cut: 'breast', skin: 'on', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 129, proteinPer100g: 21.4, carbsPer100g: 0, fatPer100g: 4.8, typicalGrams: 170 },
  { id: 'poultry_chicken_breast_on_cooked', name: 'Chicken Breast, Skin On', category: 'poultry', subcategory: 'chicken', cut: 'breast', skin: 'on', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 181, proteinPer100g: 24.7, carbsPer100g: 0, fatPer100g: 8.3, typicalGrams: 130 },
  { id: 'poultry_chicken_breast_off_raw', name: 'Chicken Breast, Skinless', category: 'poultry', subcategory: 'chicken', cut: 'breast', skin: 'off', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 107, proteinPer100g: 22.5, carbsPer100g: 0, fatPer100g: 1.9, typicalGrams: 170 },
  { id: 'poultry_chicken_breast_off_cooked', name: 'Chicken Breast, Skinless', category: 'poultry', subcategory: 'chicken', cut: 'breast', skin: 'off', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 149, proteinPer100g: 28, carbsPer100g: 0, fatPer100g: 3.3, typicalGrams: 130 },
  // --- chicken / thigh ---
  { id: 'poultry_chicken_thigh_on_raw', name: 'Chicken Thigh, Skin On', category: 'poultry', subcategory: 'chicken', cut: 'thigh', skin: 'on', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 189, proteinPer100g: 17.1, carbsPer100g: 0, fatPer100g: 13.4, typicalGrams: 120 },
  { id: 'poultry_chicken_thigh_on_cooked', name: 'Chicken Thigh, Skin On', category: 'poultry', subcategory: 'chicken', cut: 'thigh', skin: 'on', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 227, proteinPer100g: 22.4, carbsPer100g: 0, fatPer100g: 15.3, typicalGrams: 90 },
  { id: 'poultry_chicken_thigh_off_raw', name: 'Chicken Thigh, Skinless', category: 'poultry', subcategory: 'chicken', cut: 'thigh', skin: 'off', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 146, proteinPer100g: 18.6, carbsPer100g: 0, fatPer100g: 7.9, typicalGrams: 120 },
  { id: 'poultry_chicken_thigh_off_cooked', name: 'Chicken Thigh, Skinless', category: 'poultry', subcategory: 'chicken', cut: 'thigh', skin: 'off', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 175, proteinPer100g: 24.4, carbsPer100g: 0, fatPer100g: 8.6, typicalGrams: 90 },
  // --- chicken / drumstick ---
  { id: 'poultry_chicken_drumstick_on_raw', name: 'Chicken Drumstick, Skin On', category: 'poultry', subcategory: 'chicken', cut: 'drumstick', skin: 'on', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 127, proteinPer100g: 18.4, carbsPer100g: 0, fatPer100g: 5.9, typicalGrams: 90 },
  { id: 'poultry_chicken_drumstick_on_cooked', name: 'Chicken Drumstick, Skin On', category: 'poultry', subcategory: 'chicken', cut: 'drumstick', skin: 'on', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 186, proteinPer100g: 22.5, carbsPer100g: 0, fatPer100g: 10.6, typicalGrams: 70 },
  { id: 'poultry_chicken_drumstick_off_raw', name: 'Chicken Drumstick, Skinless', category: 'poultry', subcategory: 'chicken', cut: 'drumstick', skin: 'off', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 169, proteinPer100g: 23.6, carbsPer100g: 0, fatPer100g: 7.5, typicalGrams: 90 },
  { id: 'poultry_chicken_drumstick_off_cooked', name: 'Chicken Drumstick, Skinless', category: 'poultry', subcategory: 'chicken', cut: 'drumstick', skin: 'off', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 148, proteinPer100g: 23.7, carbsPer100g: 0, fatPer100g: 5.9, typicalGrams: 70 },
  // --- chicken / wing ---
  { id: 'poultry_chicken_wing_on_raw', name: 'Chicken Wing, Skin On', category: 'poultry', subcategory: 'chicken', cut: 'wing', skin: 'on', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 169, proteinPer100g: 18.4, carbsPer100g: 0, fatPer100g: 10.6, typicalGrams: 70 },
  { id: 'poultry_chicken_wing_on_cooked', name: 'Chicken Wing, Skin On', category: 'poultry', subcategory: 'chicken', cut: 'wing', skin: 'on', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 249, proteinPer100g: 22.8, carbsPer100g: 0, fatPer100g: 16.8, typicalGrams: 55 },
  { id: 'poultry_chicken_wing_off_raw', name: 'Chicken Wing, Skinless', category: 'poultry', subcategory: 'chicken', cut: 'wing', skin: 'off', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 126, proteinPer100g: 22, carbsPer100g: 0, fatPer100g: 3.5, typicalGrams: 70 },
  { id: 'poultry_chicken_wing_off_cooked', name: 'Chicken Wing, Skinless', category: 'poultry', subcategory: 'chicken', cut: 'wing', skin: 'off', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 211, proteinPer100g: 30.2, carbsPer100g: 0, fatPer100g: 9.2, typicalGrams: 55 },
  // --- chicken / leg ---
  { id: 'poultry_chicken_leg_on_raw', name: 'Chicken Leg, Skin On', category: 'poultry', subcategory: 'chicken', cut: 'leg', skin: 'on', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 214, proteinPer100g: 16.4, carbsPer100g: 0.2, fatPer100g: 16, typicalGrams: 250 },
  { id: 'poultry_chicken_leg_on_cooked', name: 'Chicken Leg, Skin On', category: 'poultry', subcategory: 'chicken', cut: 'leg', skin: 'on', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 220, proteinPer100g: 24.2, carbsPer100g: 0, fatPer100g: 12.9, typicalGrams: 200 },
  { id: 'poultry_chicken_leg_off_raw', name: 'Chicken Leg, Skinless', category: 'poultry', subcategory: 'chicken', cut: 'leg', skin: 'off', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 120, proteinPer100g: 19.2, carbsPer100g: 0, fatPer100g: 4.2, typicalGrams: 250 },
  { id: 'poultry_chicken_leg_off_cooked', name: 'Chicken Leg, Skinless', category: 'poultry', subcategory: 'chicken', cut: 'leg', skin: 'off', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 208, proteinPer100g: 28.4, carbsPer100g: 0.7, fatPer100g: 9.3, typicalGrams: 200 },
  // --- chicken / whole ---
  { id: 'poultry_chicken_whole_on_raw', name: 'Whole Chicken, Skin On', category: 'poultry', subcategory: 'chicken', cut: 'whole', skin: 'on', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 234, proteinPer100g: 18.8, carbsPer100g: 0, fatPer100g: 17.1, typicalGrams: 140 },
  { id: 'poultry_chicken_whole_on_cooked', name: 'Whole Chicken, Skin On', category: 'poultry', subcategory: 'chicken', cut: 'whole', skin: 'on', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 196, proteinPer100g: 25.1, carbsPer100g: 0.1, fatPer100g: 10.6, typicalGrams: 140 },
  { id: 'poultry_chicken_whole_off_raw', name: 'Whole Chicken, Skinless', category: 'poultry', subcategory: 'chicken', cut: 'whole', skin: 'off', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 111, proteinPer100g: 20.3, carbsPer100g: 0, fatPer100g: 2.7, typicalGrams: 140 },
  { id: 'poultry_chicken_whole_off_cooked', name: 'Whole Chicken, Skinless', category: 'poultry', subcategory: 'chicken', cut: 'whole', skin: 'off', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 185, proteinPer100g: 25.3, carbsPer100g: 0.9, fatPer100g: 8.1, typicalGrams: 140 },
  // --- chicken / ground ---
  { id: 'poultry_chicken_ground_raw', name: 'Ground Chicken', category: 'poultry', subcategory: 'chicken', cut: 'ground', skin: null, prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 143, proteinPer100g: 17.4, carbsPer100g: 0, fatPer100g: 8.1, typicalGrams: 113 },
  { id: 'poultry_chicken_ground_cooked', name: 'Ground Chicken', category: 'poultry', subcategory: 'chicken', cut: 'ground', skin: null, prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 201, proteinPer100g: 27.1, carbsPer100g: 0, fatPer100g: 10.3, typicalGrams: 85 },
  // --- chicken / tenders_breaded ---
  { id: 'poultry_chicken_tenders_breaded_cooked', name: 'Chicken Tenders / Nuggets (Breaded)', category: 'poultry', subcategory: 'chicken', cut: 'tenders_breaded', skin: null, prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 287, proteinPer100g: 14.8, carbsPer100g: 12.8, fatPer100g: 19.6, typicalGrams: 100 },
  // --- chicken / organs ---
  { id: 'poultry_chicken_organs_raw', name: 'Chicken Giblets & Organs', category: 'poultry', subcategory: 'chicken', cut: 'organs', skin: null, prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 130, proteinPer100g: 18.3, carbsPer100g: 1.4, fatPer100g: 5.2, typicalGrams: 85 },
  { id: 'poultry_chicken_organs_cooked', name: 'Chicken Giblets & Organs', category: 'poultry', subcategory: 'chicken', cut: 'organs', skin: null, prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 215, proteinPer100g: 19.4, carbsPer100g: 0.2, fatPer100g: 14.6, typicalGrams: 85 },
  // --- chicken / other ---
  { id: 'poultry_chicken_other_on_raw', name: 'Chicken Other Cuts, Skin On', category: 'poultry', subcategory: 'chicken', cut: 'other', skin: 'on', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 258, proteinPer100g: 17.6, carbsPer100g: 0, fatPer100g: 20.3, typicalGrams: 120 },
  { id: 'poultry_chicken_other_on_cooked', name: 'Chicken Other Cuts, Skin On', category: 'poultry', subcategory: 'chicken', cut: 'other', skin: 'on', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 196, proteinPer100g: 23.6, carbsPer100g: 0, fatPer100g: 10.9, typicalGrams: 120 },
  { id: 'poultry_chicken_other_off_raw', name: 'Chicken Other Cuts, Skinless', category: 'poultry', subcategory: 'chicken', cut: 'other', skin: 'off', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 148, proteinPer100g: 21.3, carbsPer100g: 0, fatPer100g: 6.3, typicalGrams: 120 },
  { id: 'poultry_chicken_other_off_cooked', name: 'Chicken Other Cuts, Skinless', category: 'poultry', subcategory: 'chicken', cut: 'other', skin: 'off', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 237, proteinPer100g: 30.4, carbsPer100g: 0, fatPer100g: 11.9, typicalGrams: 120 },
  // --- turkey / breast ---
  { id: 'poultry_turkey_breast_on_raw', name: 'Turkey Breast, Skin On', category: 'poultry', subcategory: 'turkey', cut: 'breast', skin: 'on', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 161, proteinPer100g: 22, carbsPer100g: 0.1, fatPer100g: 7.4, typicalGrams: 200 },
  { id: 'poultry_turkey_breast_on_cooked', name: 'Turkey Breast, Skin On', category: 'poultry', subcategory: 'turkey', cut: 'breast', skin: 'on', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 169, proteinPer100g: 28.3, carbsPer100g: 0, fatPer100g: 5.5, typicalGrams: 140 },
  { id: 'poultry_turkey_breast_off_raw', name: 'Turkey Breast, Skinless', category: 'poultry', subcategory: 'turkey', cut: 'breast', skin: 'off', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 114, proteinPer100g: 23.7, carbsPer100g: 0.1, fatPer100g: 1.5, typicalGrams: 200 },
  { id: 'poultry_turkey_breast_off_cooked', name: 'Turkey Breast, Skinless', category: 'poultry', subcategory: 'turkey', cut: 'breast', skin: 'off', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 139, proteinPer100g: 28.8, carbsPer100g: 0, fatPer100g: 2.1, typicalGrams: 140 },
  // --- turkey / thigh ---
  { id: 'poultry_turkey_thigh_on_raw', name: 'Turkey Thigh, Skin On', category: 'poultry', subcategory: 'turkey', cut: 'thigh', skin: 'on', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 166, proteinPer100g: 19.8, carbsPer100g: 0.1, fatPer100g: 9, typicalGrams: 150 },
  { id: 'poultry_turkey_thigh_on_cooked', name: 'Turkey Thigh, Skin On', category: 'poultry', subcategory: 'turkey', cut: 'thigh', skin: 'on', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 182, proteinPer100g: 24.4, carbsPer100g: 0.3, fatPer100g: 9.3, typicalGrams: 110 },
  { id: 'poultry_turkey_thigh_off_raw', name: 'Turkey Thigh, Skinless', category: 'poultry', subcategory: 'turkey', cut: 'thigh', skin: 'off', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 108, proteinPer100g: 21.3, carbsPer100g: 0.1, fatPer100g: 2.5, typicalGrams: 150 },
  { id: 'poultry_turkey_thigh_off_cooked', name: 'Turkey Thigh, Skinless', category: 'poultry', subcategory: 'turkey', cut: 'thigh', skin: 'off', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 161, proteinPer100g: 26.9, carbsPer100g: 0, fatPer100g: 6, typicalGrams: 110 },
  // --- turkey / drumstick ---
  { id: 'poultry_turkey_drumstick_on_raw', name: 'Turkey Drumstick, Skin On', category: 'poultry', subcategory: 'turkey', cut: 'drumstick', skin: 'on', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 141, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 6.8, typicalGrams: 150 },
  { id: 'poultry_turkey_drumstick_on_cooked', name: 'Turkey Drumstick, Skin On', category: 'poultry', subcategory: 'turkey', cut: 'drumstick', skin: 'on', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 206, proteinPer100g: 27.6, carbsPer100g: 0, fatPer100g: 9.7, typicalGrams: 120 },
  { id: 'poultry_turkey_drumstick_off_raw', name: 'Turkey Drumstick, Skinless', category: 'poultry', subcategory: 'turkey', cut: 'drumstick', skin: 'off', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 118, proteinPer100g: 20.5, carbsPer100g: 0, fatPer100g: 4, typicalGrams: 150 },
  { id: 'poultry_turkey_drumstick_off_cooked', name: 'Turkey Drumstick, Skinless', category: 'poultry', subcategory: 'turkey', cut: 'drumstick', skin: 'off', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 144, proteinPer100g: 28.5, carbsPer100g: 0, fatPer100g: 3.4, typicalGrams: 120 },
  // --- turkey / wing ---
  { id: 'poultry_turkey_wing_on_raw', name: 'Turkey Wing, Skin On', category: 'poultry', subcategory: 'turkey', cut: 'wing', skin: 'on', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 197, proteinPer100g: 20.2, carbsPer100g: 0, fatPer100g: 12.3, typicalGrams: 120 },
  { id: 'poultry_turkey_wing_on_cooked', name: 'Turkey Wing, Skin On', category: 'poultry', subcategory: 'turkey', cut: 'wing', skin: 'on', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 202, proteinPer100g: 26.9, carbsPer100g: 0, fatPer100g: 10, typicalGrams: 90 },
  { id: 'poultry_turkey_wing_off_raw', name: 'Turkey Wing, Skinless', category: 'poultry', subcategory: 'turkey', cut: 'wing', skin: 'off', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 115, proteinPer100g: 23.7, carbsPer100g: 0.1, fatPer100g: 1.5, typicalGrams: 120 },
  { id: 'poultry_turkey_wing_off_cooked', name: 'Turkey Wing, Skinless', category: 'poultry', subcategory: 'turkey', cut: 'wing', skin: 'off', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 139, proteinPer100g: 28.8, carbsPer100g: 0, fatPer100g: 2.1, typicalGrams: 90 },
  // --- turkey / leg ---
  { id: 'poultry_turkey_leg_on_raw', name: 'Turkey Leg, Skin On', category: 'poultry', subcategory: 'turkey', cut: 'leg', skin: 'on', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 144, proteinPer100g: 19.5, carbsPer100g: 0, fatPer100g: 6.7, typicalGrams: 300 },
  { id: 'poultry_turkey_leg_on_cooked', name: 'Turkey Leg, Skin On', category: 'poultry', subcategory: 'turkey', cut: 'leg', skin: 'on', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 208, proteinPer100g: 27.9, carbsPer100g: 0, fatPer100g: 9.8, typicalGrams: 220 },
  // --- turkey / whole ---
  { id: 'poultry_turkey_whole_on_raw', name: 'Whole Turkey, Skin On', category: 'poultry', subcategory: 'turkey', cut: 'whole', skin: 'on', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 144, proteinPer100g: 21.6, carbsPer100g: 0.1, fatPer100g: 5.6, typicalGrams: 140 },
  { id: 'poultry_turkey_whole_on_cooked', name: 'Whole Turkey, Skin On', category: 'poultry', subcategory: 'turkey', cut: 'whole', skin: 'on', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 189, proteinPer100g: 28.6, carbsPer100g: 0.1, fatPer100g: 7.4, typicalGrams: 140 },
  { id: 'poultry_turkey_whole_off_raw', name: 'Whole Turkey, Skinless', category: 'poultry', subcategory: 'turkey', cut: 'whole', skin: 'off', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 115, proteinPer100g: 22.6, carbsPer100g: 0.1, fatPer100g: 1.9, typicalGrams: 140 },
  { id: 'poultry_turkey_whole_off_cooked', name: 'Whole Turkey, Skinless', category: 'poultry', subcategory: 'turkey', cut: 'whole', skin: 'off', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 169, proteinPer100g: 23.7, carbsPer100g: 1.5, fatPer100g: 6.9, typicalGrams: 140 },
  // --- turkey / ground ---
  { id: 'poultry_turkey_ground_raw', name: 'Ground Turkey', category: 'poultry', subcategory: 'turkey', cut: 'ground', skin: null, prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 148, proteinPer100g: 19.7, carbsPer100g: 0, fatPer100g: 7.7, typicalGrams: 113 },
  { id: 'poultry_turkey_ground_cooked', name: 'Ground Turkey', category: 'poultry', subcategory: 'turkey', cut: 'ground', skin: null, prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 211, proteinPer100g: 26.9, carbsPer100g: 0, fatPer100g: 11.5, typicalGrams: 85 },
  // --- turkey / tenders_breaded ---
  { id: 'poultry_turkey_tenders_breaded_cooked', name: 'Turkey Tenders / Nuggets (Breaded)', category: 'poultry', subcategory: 'turkey', cut: 'tenders_breaded', skin: null, prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 236, proteinPer100g: 22.2, carbsPer100g: 17.1, fatPer100g: 8.7, typicalGrams: 100 },
  // --- turkey / organs ---
  { id: 'poultry_turkey_organs_raw', name: 'Turkey Giblets & Organs', category: 'poultry', subcategory: 'turkey', cut: 'organs', skin: null, prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 124, proteinPer100g: 18.2, carbsPer100g: 0.1, fatPer100g: 5.1, typicalGrams: 100 },
  { id: 'poultry_turkey_organs_cooked', name: 'Turkey Giblets & Organs', category: 'poultry', subcategory: 'turkey', cut: 'organs', skin: null, prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 161, proteinPer100g: 22.3, carbsPer100g: 0, fatPer100g: 7.3, typicalGrams: 100 },
  // --- turkey / other ---
  { id: 'poultry_turkey_other_on_cooked', name: 'Turkey Other Cuts, Skin On', category: 'poultry', subcategory: 'turkey', cut: 'other', skin: 'on', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 244, proteinPer100g: 26.6, carbsPer100g: 0.2, fatPer100g: 14.4, typicalGrams: 120 },
  // --- duck / breast ---
  { id: 'poultry_duck_breast_on_cooked', name: 'Duck Breast, Skin On', category: 'poultry', subcategory: 'duck', cut: 'breast', skin: 'on', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 202, proteinPer100g: 24.5, carbsPer100g: 0, fatPer100g: 10.8, typicalGrams: 130 },
  { id: 'poultry_duck_breast_off_raw', name: 'Duck Breast, Skinless', category: 'poultry', subcategory: 'duck', cut: 'breast', skin: 'off', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 123, proteinPer100g: 19.8, carbsPer100g: 0, fatPer100g: 4.2, typicalGrams: 180 },
  { id: 'poultry_duck_breast_off_cooked', name: 'Duck Breast, Skinless', category: 'poultry', subcategory: 'duck', cut: 'breast', skin: 'off', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 140, proteinPer100g: 27.6, carbsPer100g: 0, fatPer100g: 2.5, typicalGrams: 130 },
  // --- duck / leg ---
  { id: 'poultry_duck_leg_on_cooked', name: 'Duck Leg, Skin On', category: 'poultry', subcategory: 'duck', cut: 'leg', skin: 'on', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 217, proteinPer100g: 26.8, carbsPer100g: 0, fatPer100g: 11.4, typicalGrams: 150 },
  { id: 'poultry_duck_leg_off_cooked', name: 'Duck Leg, Skinless', category: 'poultry', subcategory: 'duck', cut: 'leg', skin: 'off', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 178, proteinPer100g: 29.1, carbsPer100g: 0, fatPer100g: 6, typicalGrams: 150 },
  // --- duck / whole ---
  { id: 'poultry_duck_whole_on_raw', name: 'Whole Duck, Skin On', category: 'poultry', subcategory: 'duck', cut: 'whole', skin: 'on', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 211, proteinPer100g: 17.4, carbsPer100g: 0, fatPer100g: 15.2, typicalGrams: 140 },
  { id: 'poultry_duck_whole_cooked', name: 'Whole Duck', category: 'poultry', subcategory: 'duck', cut: 'whole', skin: null, prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 154, proteinPer100g: 5.3, carbsPer100g: 6.5, fatPer100g: 11.8, typicalGrams: 140 },
  // --- duck / organs ---
  { id: 'poultry_duck_organs_raw', name: 'Duck Giblets & Organs', category: 'poultry', subcategory: 'duck', cut: 'organs', skin: null, prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 136, proteinPer100g: 18.7, carbsPer100g: 3.5, fatPer100g: 4.6, typicalGrams: 50 },
  // --- duck / other ---
  { id: 'poultry_duck_other_on_raw', name: 'Duck Other Cuts, Skin On', category: 'poultry', subcategory: 'duck', cut: 'other', skin: 'on', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 404, proteinPer100g: 11.5, carbsPer100g: 0, fatPer100g: 39.3, typicalGrams: 120 },
  { id: 'poultry_duck_other_on_cooked', name: 'Duck Other Cuts, Skin On', category: 'poultry', subcategory: 'duck', cut: 'other', skin: 'on', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 336, proteinPer100g: 18.9, carbsPer100g: 0, fatPer100g: 28.2, typicalGrams: 120 },
  { id: 'poultry_duck_other_off_raw', name: 'Duck Other Cuts, Skinless', category: 'poultry', subcategory: 'duck', cut: 'other', skin: 'off', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 135, proteinPer100g: 18.3, carbsPer100g: 0.9, fatPer100g: 6, typicalGrams: 120 },
  { id: 'poultry_duck_other_off_cooked', name: 'Duck Other Cuts, Skinless', category: 'poultry', subcategory: 'duck', cut: 'other', skin: 'off', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 200, proteinPer100g: 23.4, carbsPer100g: 0, fatPer100g: 11.2, typicalGrams: 120 },
  // --- other_bird / goose ---
  { id: 'poultry_other_bird_goose_on_raw', name: 'Goose, Skin On', category: 'poultry', subcategory: 'other_bird', cut: 'goose', skin: 'on', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 371, proteinPer100g: 15.9, carbsPer100g: 0, fatPer100g: 33.6, typicalGrams: 120 },
  { id: 'poultry_other_bird_goose_on_cooked', name: 'Goose, Skin On', category: 'poultry', subcategory: 'other_bird', cut: 'goose', skin: 'on', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 305, proteinPer100g: 25.2, carbsPer100g: 0, fatPer100g: 21.9, typicalGrams: 100 },
  { id: 'poultry_other_bird_goose_off_raw', name: 'Goose, Skinless', category: 'poultry', subcategory: 'other_bird', cut: 'goose', skin: 'off', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 161, proteinPer100g: 22.8, carbsPer100g: 0, fatPer100g: 7.1, typicalGrams: 120 },
  { id: 'poultry_other_bird_goose_off_cooked', name: 'Goose, Skinless', category: 'poultry', subcategory: 'other_bird', cut: 'goose', skin: 'off', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 238, proteinPer100g: 29, carbsPer100g: 0, fatPer100g: 12.7, typicalGrams: 100 },
  // --- other_bird / pheasant ---
  { id: 'poultry_other_bird_pheasant_on_raw', name: 'Pheasant, Skin On', category: 'poultry', subcategory: 'other_bird', cut: 'pheasant', skin: 'on', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 181, proteinPer100g: 22.7, carbsPer100g: 0, fatPer100g: 9.3, typicalGrams: 120 },
  { id: 'poultry_other_bird_pheasant_off_raw', name: 'Pheasant, Skinless', category: 'poultry', subcategory: 'other_bird', cut: 'pheasant', skin: 'off', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 133, proteinPer100g: 23.6, carbsPer100g: 0, fatPer100g: 3.6, typicalGrams: 120 },
  { id: 'poultry_other_bird_pheasant_cooked', name: 'Pheasant', category: 'poultry', subcategory: 'other_bird', cut: 'pheasant', skin: null, prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 238, proteinPer100g: 32.3, carbsPer100g: 0, fatPer100g: 12, typicalGrams: 100 },
  // --- other_bird / quail ---
  { id: 'poultry_other_bird_quail_on_raw', name: 'Quail, Skin On', category: 'poultry', subcategory: 'other_bird', cut: 'quail', skin: 'on', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 192, proteinPer100g: 19.6, carbsPer100g: 0, fatPer100g: 12, typicalGrams: 90 },
  { id: 'poultry_other_bird_quail_off_raw', name: 'Quail, Skinless', category: 'poultry', subcategory: 'other_bird', cut: 'quail', skin: 'off', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 134, proteinPer100g: 21.8, carbsPer100g: 0, fatPer100g: 4.5, typicalGrams: 90 },
  { id: 'poultry_other_bird_quail_cooked', name: 'Quail', category: 'poultry', subcategory: 'other_bird', cut: 'quail', skin: null, prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 226, proteinPer100g: 25, carbsPer100g: 0, fatPer100g: 14, typicalGrams: 100 },
  // --- other_bird / guinea_hen ---
  { id: 'poultry_other_bird_guinea_hen_on_raw', name: 'Guinea Hen, Skin On', category: 'poultry', subcategory: 'other_bird', cut: 'guinea_hen', skin: 'on', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 158, proteinPer100g: 23.4, carbsPer100g: 0, fatPer100g: 6.5, typicalGrams: 120 },
  { id: 'poultry_other_bird_guinea_hen_off_raw', name: 'Guinea Hen, Skinless', category: 'poultry', subcategory: 'other_bird', cut: 'guinea_hen', skin: 'off', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 110, proteinPer100g: 20.6, carbsPer100g: 0, fatPer100g: 2.5, typicalGrams: 120 },
  // --- other_bird / squab ---
  { id: 'poultry_other_bird_squab_on_raw', name: 'Squab (Pigeon), Skin On', category: 'poultry', subcategory: 'other_bird', cut: 'squab', skin: 'on', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 294, proteinPer100g: 18.5, carbsPer100g: 0, fatPer100g: 23.8, typicalGrams: 100 },
  { id: 'poultry_other_bird_squab_off_raw', name: 'Squab (Pigeon), Skinless', category: 'poultry', subcategory: 'other_bird', cut: 'squab', skin: 'off', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 142, proteinPer100g: 17.5, carbsPer100g: 0, fatPer100g: 7.5, typicalGrams: 100 },
  { id: 'poultry_other_bird_squab_cooked', name: 'Squab (Pigeon)', category: 'poultry', subcategory: 'other_bird', cut: 'squab', skin: null, prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 223, proteinPer100g: 23.1, carbsPer100g: 1.5, fatPer100g: 13.8, typicalGrams: 120 },
  // --- other_bird / grouse ---
  { id: 'poultry_other_bird_grouse_off_raw', name: 'Grouse, Skinless', category: 'poultry', subcategory: 'other_bird', cut: 'grouse', skin: 'off', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 112, proteinPer100g: 25.9, carbsPer100g: 0, fatPer100g: 0.9, typicalGrams: 90 },
  // --- other_bird / emu ---
  { id: 'poultry_other_bird_emu_raw', name: 'Emu', category: 'poultry', subcategory: 'other_bird', cut: 'emu', skin: null, prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 134, proteinPer100g: 22.8, carbsPer100g: 0, fatPer100g: 4, typicalGrams: 120 },
  { id: 'poultry_other_bird_emu_cooked', name: 'Emu', category: 'poultry', subcategory: 'other_bird', cut: 'emu', skin: null, prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 152, proteinPer100g: 29.1, carbsPer100g: 0, fatPer100g: 3.1, typicalGrams: 100 },
  // --- other_bird / ostrich ---
  { id: 'poultry_other_bird_ostrich_raw', name: 'Ostrich', category: 'poultry', subcategory: 'other_bird', cut: 'ostrich', skin: null, prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 117, proteinPer100g: 21.8, carbsPer100g: 0, fatPer100g: 2.6, typicalGrams: 120 },
  { id: 'poultry_other_bird_ostrich_cooked', name: 'Ostrich', category: 'poultry', subcategory: 'other_bird', cut: 'ostrich', skin: null, prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 174, proteinPer100g: 25.9, carbsPer100g: 0, fatPer100g: 7, typicalGrams: 100 },
  // --- processed / other ---
  { id: 'poultry_processed_other_cooked', name: 'Other Cuts', category: 'poultry', subcategory: 'processed', cut: 'other', skin: null, prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 139, proteinPer100g: 16.3, carbsPer100g: 3.3, fatPer100g: 6.2, typicalGrams: 56 },
  // --- processed / bacon ---
  { id: 'poultry_processed_bacon_raw', name: 'Bacon', category: 'poultry', subcategory: 'processed', cut: 'bacon', skin: null, prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 226, proteinPer100g: 15.9, carbsPer100g: 1.9, fatPer100g: 16.9, typicalGrams: 20 },
  { id: 'poultry_processed_bacon_cooked', name: 'Bacon', category: 'poultry', subcategory: 'processed', cut: 'bacon', skin: null, prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 368, proteinPer100g: 29.5, carbsPer100g: 4.2, fatPer100g: 25.9, typicalGrams: 20 },
  // --- processed / sausage ---
  { id: 'poultry_processed_sausage_raw', name: 'Sausage', category: 'poultry', subcategory: 'processed', cut: 'sausage', skin: null, prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 155, proteinPer100g: 18.8, carbsPer100g: 0.5, fatPer100g: 8.1, typicalGrams: 75 },
  { id: 'poultry_processed_sausage_cooked', name: 'Sausage', category: 'poultry', subcategory: 'processed', cut: 'sausage', skin: null, prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 193, proteinPer100g: 19.6, carbsPer100g: 1.1, fatPer100g: 12.2, typicalGrams: 75 },
  // --- processed / hot_dogs_franks ---
  { id: 'poultry_processed_hot_dogs_franks_raw', name: 'Hot Dogs & Franks', category: 'poultry', subcategory: 'processed', cut: 'hot_dogs_franks', skin: null, prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 277, proteinPer100g: 9.7, carbsPer100g: 5, fatPer100g: 24.2, typicalGrams: 57 },
  { id: 'poultry_processed_hot_dogs_franks_cooked', name: 'Hot Dogs & Franks', category: 'poultry', subcategory: 'processed', cut: 'hot_dogs_franks', skin: null, prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 223, proteinPer100g: 12.2, carbsPer100g: 3.8, fatPer100g: 17.3, typicalGrams: 57 },
  // --- processed / bologna ---
  { id: 'poultry_processed_bologna_cooked', name: 'Bologna', category: 'poultry', subcategory: 'processed', cut: 'bologna', skin: null, prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 209, proteinPer100g: 11.4, carbsPer100g: 4.7, fatPer100g: 16, typicalGrams: 28 },
  // --- processed / ham_deli ---
  { id: 'poultry_processed_ham_deli_cooked', name: 'Deli / Luncheon Meat & Rolls', category: 'poultry', subcategory: 'processed', cut: 'ham_deli', skin: null, prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 164, proteinPer100g: 26.7, carbsPer100g: 0, fatPer100g: 6.3, typicalGrams: 56 },
  // --- processed / pate_spread_loaf ---
  { id: 'poultry_processed_pate_spread_loaf_cooked', name: 'Pate, Spread & Loaf', category: 'poultry', subcategory: 'processed', cut: 'pate_spread_loaf', skin: null, prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 158, proteinPer100g: 18, carbsPer100g: 4, fatPer100g: 17.6, typicalGrams: 30 },
];

export default foodsPoultry;

