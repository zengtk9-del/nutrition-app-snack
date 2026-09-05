// Human-readable labels for the Fruit drill-down picker in
// screens/LogFoodScreen.js -- Category (Fruit) > Form (this file's
// FRUIT_FORMS) > Fruit (this file's FRUIT_TYPES) > flat list of foods.
//
// Deliberately only TWO drill-down levels before the final food list --
// no umbrella grouping categories like "Berries" or "Melons" sit between
// Form and Fruit (Damon's explicit call: "it doesn't need broad
// categories like berries or melon"). Variety/cultivar (Fuji vs. Gala
// apples, sweet vs. tart cherries as fully separate fruits, etc.) isn't a
// third picker step either -- it's expressed as multiple rows within the
// final flat list for a given Form + Fruit, the same way Red Meat already
// shows a cut's raw and cooked rows side by side (see data/foodsFruit.js's
// header comment).
//
// The actual food entries (data/foodsFruit.js, plus a handful of dual
// fruit/vegetable rows tagged in place in data/foods.js and
// data/foodsSRLegacy1.js -- see foodsFruit.js's header) each carry a
// `subcategory` (Form) and `cut` (Fruit) key that map into these two
// lookup tables -- this file is just their display labels and the order
// they're shown in, kept separate so relabeling/reordering never touches
// the food data.

export const FRUIT_FORMS = [
  { key: 'fresh', label: 'Fresh' },
  { key: 'dried', label: 'Dried' },
  { key: 'canned', label: 'Canned' },
  { key: 'frozen', label: 'Frozen' },
];

// One flat list of every fruit this app has curated data for, shown under
// whichever Form(s) that fruit actually has entries for (LogFoodScreen.js
// filters this list per-Form the same way it already does for Red Meat's
// RED_MEAT_CUTS, only showing a fruit under a Form if at least one food
// exists there -- e.g. Lemon only ever shows under Fresh, never Dried/
// Canned/Frozen, since this app has no real data for those).
export const FRUIT_TYPES = [
  // Added v0.0.43 with the Indigenous-foods redistribution (Decision 2).
  { key: 'chokecherry', label: 'Chokecherries' },
  { key: 'salmonberry', label: 'Salmonberries' },
  { key: 'cloudberry', label: 'Cloudberries' },
  { key: 'cranberry_lowbush', label: 'Cranberry, low bush / lingonberry' },
  { key: 'cranberry_wild_bush', label: 'Cranberries, wild bush' },
  { key: 'blueberry_alaska', label: 'Blueberries, wild' },
  { key: 'rose_hips', label: 'Rose Hips' },
  { key: 'apple', label: 'Apple' },
  { key: 'pear', label: 'Pear' },
  { key: 'banana', label: 'Banana' },
  { key: 'grapes', label: 'Grapes' },
  { key: 'raisins', label: 'Raisins' },
  { key: 'peach', label: 'Peach' },
  { key: 'nectarine', label: 'Nectarine' },
  { key: 'apricot', label: 'Apricot' },
  { key: 'plum', label: 'Plum' },
  { key: 'prunes', label: 'Prunes' },
  { key: 'cherries', label: 'Cherries' },
  { key: 'tart_cherries', label: 'Tart Cherries' },
  { key: 'orange', label: 'Orange' },
  { key: 'tangerine', label: 'Tangerine' },
  { key: 'grapefruit', label: 'Grapefruit' },
  { key: 'lemon', label: 'Lemon' },
  { key: 'lime', label: 'Lime' },
  { key: 'strawberry', label: 'Strawberries' },
  { key: 'blueberry', label: 'Blueberries' },
  { key: 'raspberry', label: 'Raspberries' },
  { key: 'blackberry', label: 'Blackberries' },
  { key: 'cranberry', label: 'Cranberries' },
  { key: 'currants', label: 'Currants' },
  { key: 'watermelon', label: 'Watermelon' },
  { key: 'cantaloupe', label: 'Cantaloupe' },
  { key: 'honeydew', label: 'Honeydew Melon' },
  { key: 'pineapple', label: 'Pineapple' },
  { key: 'mango', label: 'Mango' },
  { key: 'papaya', label: 'Papaya' },
  { key: 'kiwi', label: 'Kiwi' },
  { key: 'pomegranate', label: 'Pomegranate' },
  { key: 'guava', label: 'Guava' },
  { key: 'fig', label: 'Figs' },
  { key: 'dates', label: 'Dates' },
  { key: 'plantain', label: 'Plantain' },
  { key: 'passion_fruit', label: 'Passion Fruit' },
  { key: 'dragon_fruit', label: 'Dragon Fruit' },
  { key: 'lychee', label: 'Lychee' },
  { key: 'persimmon', label: 'Persimmon' },
  { key: 'starfruit', label: 'Starfruit' },
  { key: 'olive', label: 'Olives' },
  // Moved here from Nuts & Seeds in v0.0.39 (Damon's call). Coconut is a
  // drupe rather than a nut, and Fruit's Fresh/Dried/Canned Form axis maps
  // onto its real forms exactly -- fresh meat, desiccated/shredded, and
  // canned milk or cream. Coconut WATER stays in Beverages (a drink, not a
  // form of the fruit); coconut FLOUR would have gone to Nuts & Seeds'
  // Flours group, but USDA carries no coconut-flour row at all.
  { key: 'coconut', label: 'Coconut' },

  // --- Also botanically fruit, but eaten/shopped-for as vegetables ---
  // These 7 don't have entries in data/foodsFruit.js -- their real data
  // rows already exist elsewhere (data/foods.js, data/foodsSRLegacy1.js)
  // with a primary category of 'fruit' (Avocado) or 'vegetable' (the rest),
  // tagged in place with subcategory/cut fields plus crossListCategories so
  // they surface under both the Fruit and Vegetables tabs from one row --
  // see foodsFruit.js's header comment and each row's own comment.
  { key: 'avocado', label: 'Avocado' },
  { key: 'tomato', label: 'Tomato' },
  { key: 'bell_pepper', label: 'Bell / Sweet Peppers' },
  { key: 'cucumber', label: 'Cucumber' },
  { key: 'zucchini', label: 'Zucchini / Summer Squash' },
  { key: 'pumpkin', label: 'Pumpkin' },
  { key: 'eggplant', label: 'Eggplant' },
];
