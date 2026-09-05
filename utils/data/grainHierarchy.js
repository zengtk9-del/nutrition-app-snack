// Human-readable labels for the Grains drill-down picker in
// screens/LogFoodScreen.js -- Category (Grains) > Type (GRAIN_TYPES below)
// > item list > food card.
//
// Food entries live in data/foodsGrains.js and carry `subcategory` (Type),
// `grainItem`, and `grainForm` (Dry/Cooked, on the two Types that have it).
// This file is labels and ordering only, same split as every other
// category.
export const GRAIN_TYPES = [
  { key: 'grains', label: 'Rice & Grains', hasFormToggle: true },
  { key: 'pasta', label: 'Pasta & Noodles', hasFormToggle: true },
  { key: 'bread', label: 'Bread', hasFormToggle: false },
  { key: 'cereals', label: 'Breakfast Cereals', hasFormToggle: false },
  { key: 'flours', label: 'Flours & Starches', hasFormToggle: false },
  { key: 'breakfast', label: 'Breakfast Baked', hasFormToggle: false },
];

// The Dry / Cooked axis, shared by Rice & Grains and Pasta & Noodles.
//
// Ratios run about 2.3x to 4x -- dry pasta 371 kcal vs cooked 158, dry rice
// 365 vs cooked 130. Oats is the outlier at 5.3x (379 vs 71) and that is
// CORRECT rather than a bad row: porridge is cooked with far more water
// than rice or pasta absorbs, so cooked oatmeal really is that dilute.
//
// Data-gated: Basmati Rice, Sorghum and Cornmeal have only one of the two
// in USDA, so their cards show no toggle.
export const GRAIN_FORMS = [
  { key: 'dry', label: 'Dry' },
  { key: 'cooked', label: 'Cooked' },
];

// Items per Type. `key` matches `grainItem` on the rows in
// data/foodsGrains.js. Only items with rows are shown.
//
// A note on the cereal names: USDA carries almost none of the household
// brands (no Frosted Flakes, Special K, Rice Krispies, Froot Loops, Lucky
// Charms or Chex -- only Cheerios and Grape-Nuts). The generic rows are
// therefore named recognisably -- "Fruit Rings", "Frosted Oats with
// Marshmallows", "Corn Squares" -- so they're findable without pretending
// to be brands the data can't back.
export const GRAIN_ITEMS = {
  grains: [
    // Added v0.0.43 (Decision 2).
    { key: 'corn_dried', label: 'Corn, dried' },
    { key: 'blue_corn_mush', label: 'Blue Corn Mush' },
    { key: 'white_rice', label: 'White Rice' },
    { key: 'brown_rice', label: 'Brown Rice' },
    { key: 'wild_rice', label: 'Wild Rice' },
    { key: 'basmati_rice', label: 'Basmati Rice' },
    { key: 'oats', label: 'Oats' },
    { key: 'quinoa', label: 'Quinoa' },
    { key: 'barley', label: 'Barley' },
    { key: 'bulgur', label: 'Bulgur' },
    { key: 'buckwheat', label: 'Buckwheat' },
    { key: 'millet', label: 'Millet' },
    { key: 'couscous', label: 'Couscous' },
    { key: 'farro', label: 'Farro / Spelt' },
    { key: 'amaranth', label: 'Amaranth' },
    { key: 'sorghum', label: 'Sorghum' },
    { key: 'teff', label: 'Teff' },
    { key: 'cornmeal', label: 'Cornmeal / Polenta' },
  ],
  pasta: [
    { key: 'pasta', label: 'Pasta (semolina)' },
    { key: 'pasta_whole_wheat', label: 'Pasta, whole wheat' },
    { key: 'egg_noodles', label: 'Egg Noodles' },
    { key: 'rice_noodles', label: 'Rice Noodles' },
    { key: 'soba', label: 'Soba (buckwheat) Noodles' },
    { key: 'macaroni', label: 'Macaroni' },
  ],
  bread: [
    // Added v0.0.43 (Decision 2).
    { key: 'frybread', label: 'Frybread' },
    { key: 'kneel_down_bread', label: 'Kneel Down Bread' },
    { key: 'white_bread', label: 'White Bread' },
    { key: 'whole_wheat_bread', label: 'Whole Wheat Bread' },
    { key: 'multigrain_bread', label: 'Multigrain Bread' },
    { key: 'sourdough', label: 'Sourdough Bread' },
    { key: 'rye_bread', label: 'Rye Bread' },
    { key: 'pumpernickel', label: 'Pumpernickel' },
    { key: 'italian_bread', label: 'Italian Bread' },
    { key: 'pita', label: 'Pita Bread' },
    { key: 'pita_whole_wheat', label: 'Pita, whole wheat' },
    { key: 'flour_tortilla', label: 'Flour Tortilla' },
    { key: 'corn_tortilla', label: 'Corn Tortilla' },
    { key: 'bagel', label: 'Bagel' },
    { key: 'english_muffin', label: 'English Muffin' },
    { key: 'hamburger_bun', label: 'Hamburger / Hot Dog Bun' },
    { key: 'dinner_roll', label: 'Dinner Roll' },
    { key: 'naan', label: 'Naan' },
    { key: 'cornbread', label: 'Cornbread' },
    { key: 'biscuit', label: 'Biscuit' },
  ],
  cereals: [
    { key: 'cereal_oat_os_plain', label: 'Toasted Oat O\'s' },
    { key: 'cereal_oat_os_honey_nut', label: 'Honey Nut Oat O\'s' },
    { key: 'cereal_oat_os_multigrain', label: 'Multigrain O\'s' },
    { key: 'cereal_corn_flakes', label: 'Corn Flakes' },
    { key: 'cereal_bran_flakes', label: 'Bran Flakes' },
    { key: 'cereal_corn_squares', label: 'Corn Squares' },
    { key: 'cereal_oat_squares', label: 'Oat Squares' },
    { key: 'cereal_fruit_rings', label: 'Fruit Rings' },
    { key: 'cereal_frosted_marshmallow', label: 'Frosted Oats with Marshmallows' },
    { key: 'cereal_cinnamon_toast', label: 'Cinnamon Toast Squares' },
    { key: 'cereal_crisped_rice', label: 'Crisped Rice' },
    { key: 'cereal_shredded_wheat', label: 'Shredded Wheat' },
    { key: 'cereal_granola', label: 'Granola' },
    { key: 'cereal_raisin_bran', label: 'Raisin Bran' },
    { key: 'cereal_oatmeal_cooked', label: 'Oatmeal, cooked' },
    { key: 'cereal_grits', label: 'Grits' },
    { key: 'cereal_cream_of_wheat', label: 'Cream of Wheat' },
    { key: 'cereal_cream_of_rice', label: 'Cream of Rice' },
    { key: 'cereal_cheerios', label: 'Cheerios' },
    { key: 'cereal_grape_nuts', label: 'Grape-Nuts' },
  ],
  flours: [
    // Added v0.0.43 (Decision 2).
    { key: 'blue_cornmeal', label: 'Cornmeal, blue' },
    { key: 'all_purpose_flour', label: 'All-Purpose Flour' },
    { key: 'bread_flour', label: 'Bread Flour' },
    { key: 'cake_flour', label: 'Cake Flour' },
    { key: 'whole_wheat_flour', label: 'Whole Wheat Flour' },
    { key: 'rice_flour_white', label: 'Rice Flour, white' },
    { key: 'rice_flour_brown', label: 'Rice Flour, brown' },
    { key: 'corn_flour', label: 'Corn Flour' },
    { key: 'semolina', label: 'Semolina' },
    { key: 'rye_flour', label: 'Rye Flour' },
    { key: 'oat_flour', label: 'Oat Flour' },
    { key: 'cornstarch', label: 'Cornstarch' },
    { key: 'wheat_bran', label: 'Wheat Bran' },
    { key: 'wheat_germ', label: 'Wheat Germ' },
  ],
  breakfast: [
    { key: 'pancakes', label: 'Pancakes' },
    { key: 'waffles', label: 'Waffles' },
    { key: 'french_toast', label: 'French Toast' },
    { key: 'muffin_blueberry', label: 'Muffin, blueberry' },
    { key: 'muffin_plain', label: 'Muffin, plain' },
  ],
};
