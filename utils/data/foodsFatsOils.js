// The curated Fats & Oils list -- browsed as Category > Type > item > card
// in screens/LogFoodScreen.js, with the labels and ordering in
// data/fatOilHierarchy.js. Same split as every other organized category:
// this file is the food rows, that file is the words.
//
// Replaces 290 raw USDA rows that used to live flat in the bulk files
// (data/foodsSRLegacy1-4.js, data/foodsFNDDS1/3.js). Those 290 broke down
// as:
//
//   102  salad dressings & mayonnaise   -> RE-TAGGED to 'condiment_sauce'
//   103  cooking oils                   -> superseded by the 17 below
//    47  margarine & spreads            -> superseded by the 6 below
//    25  animal & solid fats            -> superseded by the 7 below
//    11  butter & cream leftovers       -> deleted (Dairy curates butter)
//     2  "Table fat, NFS" / "Fat back"  -> one deleted, one kept below
//
// The dressings were Damon's call this round: ranch, Caesar, Italian, mayo
// and tartar sauce are things you put ON food, not fats you cook with, and
// a Condiments & Sauces category already exists. They were re-tagged in
// place rather than curated here -- that category gets its own round later.
//
// ---------------------------------------------------------------------
// Why every oil below has the SAME numbers
//
// Pure culinary oil is 100% lipid. There is no protein, no carbohydrate,
// and no meaningful difference in energy density between olive, canola,
// avocado and peanut oil -- they differ in flavour, smoke point and fatty
// acid profile, none of which this app tracks.
//
// USDA nonetheless reports them inconsistently, because two different
// calculations are in play across its tables:
//
//   SR Legacy "Oil, X, salad or cooking"  ->  884 kcal / 100g fat
//   FNDDS    "Olive oil" / "Canola oil"   ->  900 kcal / 100g fat
//
// 884 comes from the fat-specific factor (8.84 kcal/g); 900 from general
// Atwater (9 kcal/g). Picking whichever row matched first per oil would
// have shipped a list where olive oil reads 900 and avocado oil reads 884
// sitting next to each other -- a 2% difference that is a units artifact,
// not a fact about the oils, and exactly the sort of thing that makes
// someone stop trusting the numbers.
//
// So every oil here is pinned to USDA's SR Legacy basis: 884 kcal, 0g
// protein, 0g carbs, 100g fat.
//
// One deliberate override inside that: USDA's coconut oil row reads 833
// kcal / 99.1g fat, which is well below every other oil in the same table
// and below what a real coconut oil label says (120 kcal/tbsp, same as
// olive). Shipping it verbatim would have made coconut oil look ~6%
// "lighter" than every other oil for no real reason. It's normalized with
// the rest. Flagging it because it is the one place in this file where the
// number is not lifted straight from a USDA row.
//
// Cooking spray is NOT normalized -- it genuinely isn't pure oil (it's
// ~79% fat plus propellant and grain alcohol), so it keeps its own row.
//
// ---------------------------------------------------------------------
// Why oils have no toggle
//
// Olive oil is olive oil. The one axis USDA offers anywhere in the oil
// table is extra virgin vs light/refined, and only for olive -- so those
// are two separate items rather than a toggle that would exist on exactly
// one card. (Their macros are identical too; the difference is flavour and
// smoke point, which is real, just not nutritional.)
//
// typicalGrams is 14g on every oil -- about one tablespoon. Oil gets
// measured by spoon far more often than weighed, so that's the more useful
// default than the 91-100g figures the old flat rows carried, which were a
// near-cup pour and made a "typical serving" of canola oil read 774 kcal.
//
// ---------------------------------------------------------------------
// Butter & Ghee are NOT in this file
//
// They live in data/foodsDairy.js with `category: 'dairy'` plus
// `crossListCategories: ['fat_oil']`, so they surface under both tabs --
// "like bell pepper", Damon's exact words. That cross-list tag was
// accidentally dropped when foodsDairy.js was rebuilt in v0.0.37 and is
// restored in this same round.
//
// ---------------------------------------------------------------------
// Fat level is NOT part of the icon key
//
// Regular (80% fat) and light (60% fat) margarine look identical -- same
// tub, same stick, same colour. Per the standing icon rule (an axis
// reaches the icon key only if it changes the picture), `fatLevel` is a
// data toggle only. Stick vs tub DOES change the picture, so that's the
// item split, and each gets its own icon: fatoil_margarine_stick and
// fatoil_margarine_tub, not four icons for four cells.
//
// This is the same call as milk's fat percentage in data/foodsDairy.js.
export const foodsFatsOils = [
  // --- Cooking Oils ------------------------------------------------------
  // 17 oils, out of the ~40 USDA carries. Left out on purpose: the ones
  // nobody buys (cottonseed, wheat germ, poppyseed, teaseed, tomatoseed,
  // babassu, sheanut, ucuhuba, cupu assu), everything tagged "industrial"
  // (USDA's ~25 rows for commercial frying and confectionery fats), and
  // USDA's specific commercial blends ("Oil, corn, peanut, and olive",
  // "Oil, corn and canola") which nobody identifies as a thing in their
  // kitchen.
  { id: 'fatoil_oil_olive_extra_virgin', name: 'Olive Oil, extra virgin', category: 'fat_oil', subcategory: 'oils', fatItem: 'olive_extra_virgin', icon: '', servingType: 'weight', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, typicalGrams: 14 },
  { id: 'fatoil_oil_olive_light', name: 'Olive Oil, light / refined', category: 'fat_oil', subcategory: 'oils', fatItem: 'olive_light', icon: '', servingType: 'weight', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, typicalGrams: 14 },
  { id: 'fatoil_oil_canola', name: 'Canola Oil', category: 'fat_oil', subcategory: 'oils', fatItem: 'canola', icon: '', servingType: 'weight', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, typicalGrams: 14 },
  { id: 'fatoil_oil_vegetable_soybean', name: 'Vegetable / Soybean Oil', category: 'fat_oil', subcategory: 'oils', fatItem: 'vegetable_soybean', icon: '', servingType: 'weight', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, typicalGrams: 14 },
  { id: 'fatoil_oil_corn', name: 'Corn Oil', category: 'fat_oil', subcategory: 'oils', fatItem: 'corn', icon: '', servingType: 'weight', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, typicalGrams: 14 },
  // Normalized -- USDA's own row is 833 kcal / 99.1g fat. See the header.
  { id: 'fatoil_oil_coconut', name: 'Coconut Oil', category: 'fat_oil', subcategory: 'oils', fatItem: 'coconut', icon: '', servingType: 'weight', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, typicalGrams: 14 },
  { id: 'fatoil_oil_avocado', name: 'Avocado Oil', category: 'fat_oil', subcategory: 'oils', fatItem: 'avocado', icon: '', servingType: 'weight', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, typicalGrams: 14 },
  { id: 'fatoil_oil_peanut', name: 'Peanut Oil', category: 'fat_oil', subcategory: 'oils', fatItem: 'peanut', icon: '', servingType: 'weight', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, typicalGrams: 14 },
  { id: 'fatoil_oil_sesame', name: 'Sesame Oil', category: 'fat_oil', subcategory: 'oils', fatItem: 'sesame', icon: '', servingType: 'weight', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, typicalGrams: 14 },
  { id: 'fatoil_oil_sunflower', name: 'Sunflower Oil', category: 'fat_oil', subcategory: 'oils', fatItem: 'sunflower', icon: '', servingType: 'weight', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, typicalGrams: 14 },
  { id: 'fatoil_oil_safflower', name: 'Safflower Oil', category: 'fat_oil', subcategory: 'oils', fatItem: 'safflower', icon: '', servingType: 'weight', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, typicalGrams: 14 },
  { id: 'fatoil_oil_grapeseed', name: 'Grapeseed Oil', category: 'fat_oil', subcategory: 'oils', fatItem: 'grapeseed', icon: '', servingType: 'weight', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, typicalGrams: 14 },
  { id: 'fatoil_oil_flaxseed', name: 'Flaxseed Oil', category: 'fat_oil', subcategory: 'oils', fatItem: 'flaxseed', icon: '', servingType: 'weight', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, typicalGrams: 14 },
  { id: 'fatoil_oil_walnut', name: 'Walnut Oil', category: 'fat_oil', subcategory: 'oils', fatItem: 'walnut', icon: '', servingType: 'weight', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, typicalGrams: 14 },
  { id: 'fatoil_oil_almond', name: 'Almond Oil', category: 'fat_oil', subcategory: 'oils', fatItem: 'almond', icon: '', servingType: 'weight', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, typicalGrams: 14 },
  { id: 'fatoil_oil_palm', name: 'Palm Oil', category: 'fat_oil', subcategory: 'oils', fatItem: 'palm', icon: '', servingType: 'weight', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, typicalGrams: 14 },
  // Not in the 16 that were approved -- added because people genuinely log
  // it and there was no way to. USDA row: "Oil, PAM cooking spray,
  // original". Kept at its own numbers rather than normalized: it is ~79%
  // fat, not pure oil. The 20.7g of carbs is USDA's by-difference figure
  // catching the grain alcohol carrier, not sugar. typicalGrams is 1g,
  // roughly a 3-4 second spray -- a 14g "tablespoon of cooking spray" is
  // not a thing anyone does.
  { id: 'fatoil_oil_cooking_spray', name: 'Cooking Spray', category: 'fat_oil', subcategory: 'oils', fatItem: 'cooking_spray', icon: '', servingType: 'weight', caloriesPer100g: 792, proteinPer100g: 0.3, carbsPer100g: 20.7, fatPer100g: 78.7, typicalGrams: 1 },

  // --- Margarine & Spreads ----------------------------------------------
  // Stick vs tub is the item split (it changes the picture); Regular vs
  // Light is a toggle on each (it doesn't). Data-gated and fully populated:
  // USDA carries all four cells at both 80% and 60% fat.
  //
  //   stick regular  717 / 80.7      stick light  537 / 60.4
  //   tub   regular  713 / 80.2      tub   light  533 / 59.8
  //
  // Salt is NOT a toggle here even though USDA has salted and unsalted
  // rows for both -- unlike butter, where salted/unsalted is how the
  // product is actually sold and shelved, unsalted margarine is a baking
  // specialty. The macros are within rounding of each other either way.
  { id: 'fatoil_margarine_stick_regular', name: 'Margarine, stick', category: 'fat_oil', subcategory: 'spreads', fatItem: 'margarine_stick', fatLevel: 'regular', icon: '', servingType: 'weight', caloriesPer100g: 717, proteinPer100g: 0.2, carbsPer100g: 0.7, fatPer100g: 80.7, typicalGrams: 14 },
  { id: 'fatoil_margarine_stick_light', name: 'Margarine, stick, light', category: 'fat_oil', subcategory: 'spreads', fatItem: 'margarine_stick', fatLevel: 'light', icon: '', servingType: 'weight', caloriesPer100g: 537, proteinPer100g: 0.1, carbsPer100g: 0.7, fatPer100g: 60.4, typicalGrams: 14 },
  { id: 'fatoil_margarine_tub_regular', name: 'Margarine, tub', category: 'fat_oil', subcategory: 'spreads', fatItem: 'margarine_tub', fatLevel: 'regular', icon: '', servingType: 'weight', caloriesPer100g: 713, proteinPer100g: 0.2, carbsPer100g: 0.8, fatPer100g: 80.2, typicalGrams: 14 },
  { id: 'fatoil_margarine_tub_light', name: 'Margarine, tub, light', category: 'fat_oil', subcategory: 'spreads', fatItem: 'margarine_tub', fatLevel: 'light', icon: '', servingType: 'weight', caloriesPer100g: 533, proteinPer100g: 0.2, carbsPer100g: 0.9, fatPer100g: 59.8, typicalGrams: 14 },
  // The "butter with canola oil" tub/stick aisle. USDA row:
  // "Margarine-like, butter-margarine blend, 80% fat, stick". Only one fat
  // level exists, so no toggle.
  { id: 'fatoil_butter_blend', name: 'Butter Blend Spread', category: 'fat_oil', subcategory: 'spreads', fatItem: 'butter_blend', icon: '', servingType: 'weight', caloriesPer100g: 718, proteinPer100g: 0.9, carbsPer100g: 0.6, fatPer100g: 80.7, typicalGrams: 14 },
  // Tub only -- USDA has no fat-free stick, and neither does any shop, so
  // this is its own item rather than a third rung on the Fat Level toggle.
  { id: 'fatoil_spread_fat_free', name: 'Fat-Free Spread', category: 'fat_oil', subcategory: 'spreads', fatItem: 'spread_fat_free', icon: '', servingType: 'weight', caloriesPer100g: 44, proteinPer100g: 0.1, carbsPer100g: 4.3, fatPer100g: 3, typicalGrams: 14 },

  // --- Animal & Solid Fats ----------------------------------------------
  // No toggles -- lard is lard. typicalGrams is 13g (a tablespoon of solid
  // fat, slightly denser in the spoon than oil) except fatback, which is
  // sliced and eaten rather than spooned.
  //
  // Duck fat is missing on purpose: USDA has chicken, turkey and goose fat
  // but no duck row at all, and relabelling the goose row as duck would be
  // making the number up. Goose fat is the closest real thing and it's here.
  { id: 'fatoil_lard', name: 'Lard', category: 'fat_oil', subcategory: 'solid', fatItem: 'lard', icon: '', servingType: 'weight', caloriesPer100g: 902, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, typicalGrams: 13 },
  { id: 'fatoil_beef_tallow', name: 'Beef Tallow', category: 'fat_oil', subcategory: 'solid', fatItem: 'beef_tallow', icon: '', servingType: 'weight', caloriesPer100g: 902, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, typicalGrams: 13 },
  { id: 'fatoil_shortening', name: 'Vegetable Shortening', category: 'fat_oil', subcategory: 'solid', fatItem: 'shortening', icon: '', servingType: 'weight', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, typicalGrams: 13 },
  { id: 'fatoil_chicken_fat', name: 'Chicken Fat (schmaltz)', category: 'fat_oil', subcategory: 'solid', fatItem: 'chicken_fat', icon: '', servingType: 'weight', caloriesPer100g: 900, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 99.8, typicalGrams: 13 },
  { id: 'fatoil_goose_fat', name: 'Goose Fat', category: 'fat_oil', subcategory: 'solid', fatItem: 'goose_fat', icon: '', servingType: 'weight', caloriesPer100g: 900, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 99.8, typicalGrams: 13 },
  { id: 'fatoil_bacon_fat', name: 'Bacon Fat / Drippings', category: 'fat_oil', subcategory: 'solid', fatItem: 'bacon_fat', icon: '', servingType: 'weight', caloriesPer100g: 897, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 99.5, typicalGrams: 13 },
  // The one row in this group that is a food rather than a cooking medium
  // -- cured pork back fat, sliced and eaten (and rendered down for lard).
  // 28g = 1oz, since nobody measures fatback by the tablespoon.
  { id: 'fatoil_pork_fatback', name: 'Pork Fatback', category: 'fat_oil', subcategory: 'solid', fatItem: 'pork_fatback', icon: '', servingType: 'weight', caloriesPer100g: 750, proteinPer100g: 2.7, carbsPer100g: 0, fatPer100g: 81.9, typicalGrams: 28 },
];

export default foodsFatsOils;
