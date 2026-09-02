// A starter database of common foods, organized into categories.
//
// Two different ways a food's nutrition info is stored here:
//
// 1. servingType: 'count' -- foods naturally eaten as whole units (a banana,
//    an egg, a slice of bread). Nutrition numbers are for ONE serving, and
//    the app lets you log "2 servings", "3 servings", etc.
//
// 2. servingType: 'weight' -- foods where a "serving" varies a lot in real
//    life (meat, vegetables). Nutrition numbers here are per 100 grams, and
//    the app asks you to type in how many grams you're actually eating.
//
// `icon` is deliberately blank ('') on every food below -- the placeholder
// emoji set has been removed while Damon designs a real icon for each food.
// The field itself stays (rather than being deleted from each entry) so
// the UI's icon slot (screens/LogFoodScreen.js, DashboardScreen.js) keeps
// reserving its usual space with nothing drawn in it, and so wiring in the
// real icons later is just filling in this same field per food, no
// UI/layout changes required.
//
// The full USDA SR Legacy and FNDDS (Survey) datasets live in their own
// files -- data/foodsSRLegacy1.js through foodsSRLegacy4.js, and
// data/foodsFNDDS1.js through foodsFNDDS3.js -- purely because ~13,000 more
// food entries is too much text for one file to comfortably paste into
// Snack's editor. Each one is a plain array in the exact same shape as the
// entries below; they all get concatenated onto this file's list right
// before the default export at the bottom. Nothing else in the app needs
// to know they're split out -- every screen still just imports foods from
// here, same as always.
//
// Red Meat is different: instead of a flat list, it's browsed as
// Category > Type (Beef/Pork/Lamb/...) > Cut (Ribeye/Chuck/...) >
// raw/cooked, via data/foodsRedMeat.js + data/meatHierarchy.js. See those
// two files' own header comments for why -- short version: USDA's raw meat
// data repeats the same cut dozens of times over (every fat-trim/grade/
// cooking-method combo got its own row), which reads like a government
// spreadsheet, not an app.
//
// Poultry got the same treatment next: Category > Type (Chicken/Turkey/
// Duck/...) > Cut (Breast/Thigh/...) > a toggle card (skin on/off, bone
// in/boneless, raw/cooked) > portion, via data/foodsPoultry.js +
// data/poultryHierarchy.js. See those two files' header comments for the
// details -- it's a bigger picker than Red Meat's because skin genuinely
// changes the nutrition numbers (so it's kept as real data), while bone
// doesn't (so that toggle is cosmetic only, just swapping which icon
// placeholder shows).
//
// Seafood got the same treatment: Category > Type (Fish/Shellfish &
// Crustaceans/Mollusks/Processed & Canned Seafood/Other Seafood) > Species
// (Salmon/Shrimp/Clams/...) > raw/cooked, via data/foodsSeafood.js +
// data/seafoodHierarchy.js. Unlike Poultry, seafood barely has a skin/bone
// axis in the source data, so it uses the simpler Red-Meat-style shape (no
// toggle card) -- see those two files' header comments for the details,
// including why canned/breaded/smoked/imitation items got their own
// "Processed & Canned Seafood" Type instead of being folded into each
// species as extra prep options.
//
// Every other category is still the flat search + category-chip list this
// app has always had; that's the plan for them too, just one category at
// a time.

import foodsSRLegacy1 from './foodsSRLegacy1.js';
import foodsSRLegacy2 from './foodsSRLegacy2.js';
import foodsSRLegacy3 from './foodsSRLegacy3.js';
import foodsSRLegacy4 from './foodsSRLegacy4.js';
import foodsFNDDS1 from './foodsFNDDS1.js';
import foodsFNDDS2 from './foodsFNDDS2.js';
import foodsFNDDS3 from './foodsFNDDS3.js';
import foodsRedMeat from './foodsRedMeat.js';
import foodsPoultry from './foodsPoultry.js';
import foodsSeafood from './foodsSeafood.js';
import foodsFruit from './foodsFruit.js';
import foodsEggs from './foodsEggs.js';
import foodsDairy from './foodsDairy.js';
import foodsVegetables from './foodsVegetables.js';
import foodsLegumes from './foodsLegumes.js';
import foodsNutsSeeds from './foodsNutsSeeds.js';
import foodsGrains from './foodsGrains.js';
import foodsFatsOils from './foodsFatsOils.js';
import foodsSweets from './foodsSweets.js';
import foodsBeverages from './foodsBeverages.js';
import foodsCondiments from './foodsCondiments.js';
import foodsMixedDishes from './foodsMixedDishes.js';
import foodsSnacks from './foodsSnacks.js';
import foodsMeatSubstitutes from './foodsMeatSubstitutes.js';
import foodsBabyFoods from './foodsBabyFoods.js';

// The ordered list of categories shown as filter chips on the Log Food
// screen. "key" must match the `category` value used on foods below.
export const CATEGORIES = [
  { key: 'fruit', label: 'Fruit' },
  { key: 'vegetable', label: 'Vegetables' },
  { key: 'red_meat', label: 'Red Meat' },
  { key: 'poultry', label: 'Poultry' },
  { key: 'seafood', label: 'Seafood' },
  // Split from the old combined 'egg_dairy' into two chips -- eggs are
  // count/grade-based (real S/M/L/XL/Jumbo USDA size data) and dairy is a
  // weight-based Milk/Cheese/Yogurt/Cream & Creamers/Butter hierarchy,
  // different enough to deserve separate top-level chips, same reasoning
  // as Red Meat vs. Poultry being separate. See data/eggHierarchy.js +
  // data/foodsEggs.js for Eggs, and data/dairyHierarchy.js +
  // data/foodsDairy.js for Dairy's own later curation pass.
  { key: 'egg', label: 'Eggs' },
  { key: 'dairy', label: 'Dairy' },
  { key: 'legume', label: 'Legumes' },
  { key: 'nut_seed', label: 'Nuts & Seeds' },
  { key: 'grain', label: 'Grains' },
  { key: 'fat_oil', label: 'Fats & Oils' },
  { key: 'sweet', label: 'Sweets' },
  { key: 'beverage', label: 'Beverages' },
  // Added for the USDA Foundation Foods import.
  { key: 'condiment_sauce', label: 'Condiments & Sauces' },
  { key: 'mixed_dish', label: 'Mixed Dishes' },
  // Added for the USDA SR Legacy / FNDDS import below.
  { key: 'snack', label: 'Snacks' },
  // Added in the Legumes round: ~25 soy-based imitation-meat items (meatless
  // bacon, veggie hot dogs, vegetarian stroganoff) were filed under 'legume'
  // purely because they're soy-based, which put them next to dried lentils in
  // the same list. They're a real aisle and a real way people eat, and they
  // don't fit inside any existing category, so they get their own chip. Still
  // a flat list for now -- their own organizing round comes later.
  { key: 'meat_substitute', label: 'Meat Substitutes' },
  { key: 'baby_food', label: 'Baby Foods' },
];

const foods = [
  // category: fruit
  // Also tagged into the new Fruit > Fresh > Avocado drill-down
  // (data/fruitHierarchy.js) via subcategory/cut, and cross-listed onto the
  // Vegetables tab via crossListCategories -- Avocado is real fruit
  // botanically but shops/cooks like a vegetable, and Damon wants it
  // (and the similar items tagged elsewhere in this file and in
  // data/foodsSRLegacy1.js) findable under both tabs. See
  // data/foodsFruit.js's header comment and utils/nutrition.js's
  // filterByCategory for how crossListCategories is used.
  { id: 'avocado', name: 'Avocado', category: 'fruit', subcategory: 'fresh', cut: 'avocado', crossListCategories: ['vegetable'], icon: '', servingType: 'count', servingLabel: '1/2 fruit', calories: 206, protein: 1.8, carbs: 8.3, fat: 20.3 },
  // category: vegetable
  // Also tagged into the new Fruit > Fresh > Tomato drill-down and
  // cross-listed there via crossListCategories -- see the Avocado entry's
  // comment above for why.
  { id: 'tomato', name: 'Tomato (raw)', category: 'vegetable', subcategory: 'fresh', cut: 'tomato', crossListCategories: ['fruit'], icon: '', servingType: 'weight', caloriesPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2, typicalGrams: 120 },
  // category: legume
  // category: nut_seed
  // category: grain
  // category: fat_oil
  // Old flat 'butter' entry deleted (Dairy round) -- superseded by the 3
  // curated Butter rows in data/foodsDairy.js (butter_salted/
  // butter_without_salt/butter_whipped_with_salt), which carry a primary
  // category: 'dairy' plus crossListCategories: ['fat_oil'] so they
  // surface here under Fats & Oils too, "like bell pepper" -- Damon's
  // exact words. See data/foodsDairy.js's header comment.
  // category: sweet
  // category: beverage
  // category: legume
  // category: fruit
  // category: vegetable
  // These 4 are also tagged into the new Fruit > Fresh > Bell / Sweet
  // Peppers drill-down and cross-listed there via crossListCategories --
  // see the Avocado entry's comment above for why.
  { id: 'peppers_bell_green_raw', name: 'Peppers, bell, green, raw', category: 'vegetable', subcategory: 'fresh', cut: 'bell_pepper', variety: 'Green', crossListCategories: ['fruit'], icon: '', servingType: 'weight', caloriesPer100g: 20, proteinPer100g: 0.7, carbsPer100g: 4.8, fatPer100g: 0.1, typicalGrams: 85 },
  { id: 'peppers_bell_yellow_raw', name: 'Peppers, bell, yellow, raw', category: 'vegetable', subcategory: 'fresh', cut: 'bell_pepper', variety: 'Yellow', crossListCategories: ['fruit'], icon: '', servingType: 'weight', caloriesPer100g: 27, proteinPer100g: 0.8, carbsPer100g: 6.6, fatPer100g: 0.1, typicalGrams: 85 },
  { id: 'peppers_bell_red_raw', name: 'Peppers, bell, red, raw', category: 'vegetable', subcategory: 'fresh', cut: 'bell_pepper', variety: 'Red', crossListCategories: ['fruit'], icon: '', servingType: 'weight', caloriesPer100g: 27, proteinPer100g: 0.9, carbsPer100g: 6.7, fatPer100g: 0.1, typicalGrams: 85 },
  { id: 'peppers_bell_orange_raw', name: 'Peppers, bell, orange, raw', category: 'vegetable', subcategory: 'fresh', cut: 'bell_pepper', variety: 'Orange', crossListCategories: ['fruit'], icon: '', servingType: 'weight', caloriesPer100g: 27, proteinPer100g: 0.9, carbsPer100g: 6.7, fatPer100g: 0.2, typicalGrams: 85 },
  // Also tagged into the new Fruit > Fresh > Cucumber drill-down and
  // cross-listed there via crossListCategories -- see the Avocado entry's
  // comment above for why.
  { id: 'cucumber_with_peel_raw', name: 'Cucumber, with peel, raw', category: 'vegetable', subcategory: 'fresh', cut: 'cucumber', crossListCategories: ['fruit'], icon: '', servingType: 'weight', caloriesPer100g: 14, proteinPer100g: 0.6, carbsPer100g: 3, fatPer100g: 0.2, typicalGrams: 85 },
  // Also tagged into the new Fruit > Fresh > Zucchini / Summer Squash
  // drill-down and cross-listed there via crossListCategories -- see the
  // Avocado entry's comment above for why.
  { id: 'squash_summer_green_zucchini_includes_skin_raw', name: 'Squash, summer, green, zucchini, includes skin, raw', category: 'vegetable', subcategory: 'fresh', cut: 'zucchini', crossListCategories: ['fruit'], icon: '', servingType: 'weight', caloriesPer100g: 16, proteinPer100g: 1, carbsPer100g: 3.3, fatPer100g: 0.2, typicalGrams: 85 },
  // Also tagged into the new Fruit > Fresh > Eggplant drill-down and
  // cross-listed there via crossListCategories -- see the Avocado entry's
  // comment above for why.
  { id: 'eggplant_raw', name: 'Eggplant, raw', category: 'vegetable', subcategory: 'fresh', cut: 'eggplant', crossListCategories: ['fruit'], icon: '', servingType: 'weight', caloriesPer100g: 22, proteinPer100g: 0.9, carbsPer100g: 5.4, fatPer100g: 0.1, typicalGrams: 85 },
  // category: dairy
  // category: legume
  // category: nut_seed
  // category: grain
  // category: fat_oil
  // category: sweet
  // category: beverage
  // category: condiment_sauce
  // category: mixed_dish

  // --- USDA FoodData Central: SR Legacy + FNDDS (Survey) datasets ---
  // ~13,000 more entries, pulled in from their own files (see the note at
  // the top of this file) so this file itself doesn't balloon further.
  ...foodsSRLegacy1,
  ...foodsSRLegacy2,
  ...foodsSRLegacy3,
  ...foodsSRLegacy4,
  ...foodsFNDDS1,
  ...foodsFNDDS2,
  ...foodsFNDDS3,
  // --- Red Meat: curated Category > Type > Cut > raw/cooked picker ---
  // (see data/foodsRedMeat.js -- replaces the old flat, mostly-USDA
  // red_meat entries above and within the USDA files spread in above)
  ...foodsRedMeat,
  // --- Poultry: curated Category > Type > Cut > toggle card > portion ---
  // (see data/foodsPoultry.js -- replaces the old flat, mostly-USDA
  // poultry entries that used to live above and within the USDA files
  // spread in above)
  ...foodsPoultry,
  // --- Seafood: curated Category > Type > Species > raw/cooked picker ---
  // (see data/foodsSeafood.js -- replaces the old flat, mostly-USDA
  // seafood entries that used to live above and within the USDA files
  // spread in above)
  ...foodsSeafood,
  // --- Fruit: curated Category > Form > Fruit picker ---
  // (see data/foodsFruit.js -- replaces the old flat, mostly-USDA fruit
  // entries that used to live above and within the USDA files spread in
  // above, except for the handful of dual fruit/vegetable rows -- Avocado
  // here, Pumpkin in foodsSRLegacy1.js -- which were left in place and
  // tagged with subcategory/cut/crossListCategories fields instead, see
  // foodsFruit.js's own header comment)
  ...foodsFruit,
  // --- Eggs: curated Category > Bird Type > Form > (Prep/Size toggle)
  // picker (see data/foodsEggs.js -- replaces the old flat "Egg, ..." rows
  // that used to live in the egg_dairy category, above and within the USDA
  // files spread in above; also picks up 3 rows -- Duck/Goose Egg Cooked,
  // Quail Egg Canned -- that were discovered still sitting under the old
  // flat 'dairy' category during the Dairy round below and got moved in
  // here with proper subcategory/form/prep fields)
  ...foodsEggs,
  // --- Dairy: curated Category > Type > flat food list (see
  // data/foodsDairy.js -- replaces the old flat, mostly-USDA dairy entries
  // that used to live above and within the USDA files spread in above,
  // same supersession pattern as Fruit/Eggs. Ice Cream/frozen dessert
  // items moved to 'sweet', hot cocoa/protein-shake items moved to
  // 'beverage', and composite dishes -- egg omelets with fillings, egg
  // salad, cheese sauce/souffle, cottage cheese with gelatin/fruit/veg,
  // breaded mozzarella sticks, huevos rancheros -- moved to 'mixed_dish',
  // all in place in whichever USDA file they already lived in, same
  // recategorization pattern as Egg Benedict/Creamed/Deviled during the
  // Eggs round)
  ...foodsDairy,
  // --- Vegetables: curated Category > Vegetable > flat food list (see
  // data/foodsVegetables.js -- replaces the old flat, mostly-USDA
  // vegetable entries that used to live above and within the USDA files
  // spread in above, same supersession pattern as Fruit/Eggs/Dairy. Tomato,
  // Bell Pepper, Cucumber, Zucchini, Eggplant, and Pumpkin's fresh/raw rows
  // stayed in place above (they're cross-listed with Fruit already, tagged
  // back in the Fruit round) rather than being duplicated here. Dried
  // beans/lentils/chickpeas-turned-`legume` rows and a handful of
  // `vegetable`-tagged sprouted-*dried*-legume-seed rows were deliberately
  // left in place, untouched, not part of this pass -- see
  // docs/vegetables-category-plan.md and foodsVegetables.js's own header
  // comment for the full reasoning. Olive rows (olives_nfs/green/black/
  // stuffed, olive_tapenade) were also left in place untouched -- they
  // predate this round and aren't yet part of the new curated Vegetables
  // picker; that's a known gap for a future pass, not an oversight this
  // round tries to fix.
  ...foodsVegetables,
  // --- Legumes: curated Category > Type > (sub-list) > card (see
  // data/foodsLegumes.js). Replaces ~443 raw USDA legume rows that used to
  // live above and in the USDA files spread in above -- those are deleted
  // as part of the same round, the usual supersession pattern. Peanuts and
  // prepared legume dishes live in that file too but carry
  // crossListCategories so they also surface under Nuts & Seeds and Mixed
  // Dishes respectively. The ~25 soy-based MEAT SUBSTITUTES that used to be
  // tagged 'legume' were re-tagged in place to the new 'meat_substitute'
  // category rather than curated here -- they get their own round later.
  ...foodsLegumes,
  // --- Nuts & Seeds: curated Category > Type > item > card (see
  // data/foodsNutsSeeds.js). Replaces ~230 raw USDA nut/seed rows deleted
  // from the files above, same supersession pattern as the categories
  // before it. Mixed nuts/trail mix, nut milks and flours cross-list into
  // Snacks, Beverages and Grains respectively; peanuts are NOT here (they
  // live in foodsLegumes.js and cross-list in), and coconut moved to Fruit.
  ...foodsNutsSeeds,
  // --- Grains: curated Category > Type > item > card (see
  // data/foodsGrains.js). Replaces ~1,054 raw USDA grain rows deleted from
  // the files above. Baked desserts were re-tagged to 'sweet' and
  // crackers/pretzels/popcorn to 'snack' in place rather than curated here,
  // since those categories get their own rounds later; pancakes, waffles,
  // French toast and muffins deliberately stayed in Grains.
  ...foodsGrains,
  // --- Fats & Oils: curated Category > Type > item > card (see
  // data/foodsFatsOils.js). Replaces 290 raw USDA fat/oil rows -- 188 of
  // them deleted from the files above, and 102 salad dressing/mayonnaise
  // rows RE-TAGGED in place to 'condiment_sauce' rather than deleted
  // (Damon's call: those are things you put on food, not fats you cook
  // with, and that category gets its own round later).
  //
  // Butter and Ghee are NOT in that file -- they stay in foodsDairy.js and
  // reach the Fats & Oils tab by crossListCategories, "like bell pepper".
  // That tag was accidentally dropped when foodsDairy.js was rebuilt in
  // v0.0.37, which quietly took butter out of Fats & Oils; restored here.
  ...foodsFatsOils,
  // --- The last seven categories, all curated in one round (v0.0.43).
  // 6,002 raw USDA rows deleted from the files above and replaced by 595
  // curated foods, roughly 10:1 -- in line with every category before.
  //
  // These seven were done together rather than one at a time because they
  // are the ones that fight over the same foods: ice cream is a Sweet and
  // a Dairy, a granola bar is a Snack and a Sweet, juice is a Beverage and
  // a Fruit. Settling those boundaries once, across all seven, is why the
  // cross-lists below are consistent instead of each round re-opening the
  // last one's calls. See docs/remaining-categories-plan-proposal.md.
  //
  // Cross-lists: Sweets' ice cream -> dairy, Snacks' bars -> sweet.
  //
  // Also fixed here, all found by scanning every row's name against its
  // category tag: 22 ham rows that were tagged `beverage` because their
  // USDA names contain "with natural juices", 30 baby-food juices and 8
  // popsicles likewise mis-tagged, ~60 Chinese dishes filed as condiments,
  // and 163 traditional Indigenous foods dumped in Mixed Dishes -- those
  // last redistributed to Red Meat, Seafood, Fruit, Vegetables and Grains,
  // which is where someone would actually look for a moose steak.
  ...foodsSweets,
  ...foodsBeverages,
  ...foodsCondiments,
  ...foodsMixedDishes,
  ...foodsSnacks,
  ...foodsMeatSubstitutes,
  ...foodsBabyFoods,
];

export default foods;
