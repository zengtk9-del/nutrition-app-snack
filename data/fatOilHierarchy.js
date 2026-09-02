// Human-readable labels for the Fats & Oils drill-down picker in
// screens/LogFoodScreen.js -- Category (Fats & Oils) > Type (FAT_OIL_TYPES
// below) > item list > food card.
//
// Food entries live in data/foodsFatsOils.js and carry `subcategory`
// (Type), `fatItem`, and `fatLevel` (on the two margarine items that have
// it). This file is labels and ordering only, same split as every other
// category.
export const FAT_OIL_TYPES = [
  { key: 'oils', label: 'Cooking Oils', hasFatToggle: false },
  // Butter & Ghee is NOT a group of rows in data/foodsFatsOils.js -- the
  // six butter rows live in data/foodsDairy.js and reach this picker by
  // `crossListCategories: ['fat_oil']`, carrying `subcategory: 'butter'`.
  // That's why this Type routes straight to ButterCard (shape: 'card')
  // instead of an item list: it is Dairy's card, shown under a second
  // tab, exactly the way bell peppers appear under both Vegetables and
  // Fruit.
  //
  // Worth knowing if this ever looks broken: `crossListCategories` makes a
  // row visible to a category FILTER, but it does not put the row in any
  // browse hierarchy by itself. It works here only because the entry below
  // matches the `subcategory: 'butter'` those rows already carry -- the
  // same gap that made peanuts unreachable in the Nuts & Seeds round.
  { key: 'butter', label: 'Butter & Ghee', shape: 'card' },
  { key: 'spreads', label: 'Margarine & Spreads', hasFatToggle: true },
  { key: 'solid', label: 'Animal & Solid Fats', hasFatToggle: false },
];

// The Regular / Light axis, used by the two margarine items only.
//
// Data-gated: it only renders when both rows exist for an item, which is
// true for Margarine stick and Margarine tub and false for Butter Blend
// Spread and Fat-Free Spread.
//
// Deliberately NOT part of the icon key -- regular and light margarine are
// the same picture. See data/foodsFatsOils.js's header for the rule.
export const FAT_LEVELS = [
  { key: 'regular', label: 'Regular (80%)' },
  { key: 'light', label: 'Light (60%)' },
];

// Items per Type. `key` matches `fatItem` on the rows in
// data/foodsFatsOils.js. Only items with rows are shown.
//
// There is no `butter` entry here -- that Type goes straight to a card
// (see FAT_OIL_TYPES above), so it never reaches an item list.
export const FAT_OIL_ITEMS = {
  oils: [
    { key: 'olive_extra_virgin', label: 'Olive Oil, extra virgin' },
    { key: 'olive_light', label: 'Olive Oil, light / refined' },
    { key: 'canola', label: 'Canola Oil' },
    { key: 'vegetable_soybean', label: 'Vegetable / Soybean Oil' },
    { key: 'corn', label: 'Corn Oil' },
    { key: 'coconut', label: 'Coconut Oil' },
    { key: 'avocado', label: 'Avocado Oil' },
    { key: 'peanut', label: 'Peanut Oil' },
    { key: 'sesame', label: 'Sesame Oil' },
    { key: 'sunflower', label: 'Sunflower Oil' },
    { key: 'safflower', label: 'Safflower Oil' },
    { key: 'grapeseed', label: 'Grapeseed Oil' },
    { key: 'flaxseed', label: 'Flaxseed Oil' },
    { key: 'walnut', label: 'Walnut Oil' },
    { key: 'almond', label: 'Almond Oil' },
    { key: 'palm', label: 'Palm Oil' },
    { key: 'cooking_spray', label: 'Cooking Spray' },
  ],
  spreads: [
    { key: 'margarine_stick', label: 'Margarine, stick' },
    { key: 'margarine_tub', label: 'Margarine, tub' },
    { key: 'butter_blend', label: 'Butter Blend Spread' },
    { key: 'spread_fat_free', label: 'Fat-Free Spread' },
  ],
  solid: [
    { key: 'lard', label: 'Lard' },
    { key: 'beef_tallow', label: 'Beef Tallow' },
    { key: 'shortening', label: 'Vegetable Shortening' },
    { key: 'chicken_fat', label: 'Chicken Fat (schmaltz)' },
    { key: 'goose_fat', label: 'Goose Fat' },
    { key: 'bacon_fat', label: 'Bacon Fat / Drippings' },
    { key: 'pork_fatback', label: 'Pork Fatback' },
  ],
};
