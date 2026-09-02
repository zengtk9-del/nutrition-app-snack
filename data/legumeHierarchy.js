// Human-readable labels for the Legumes drill-down picker in
// screens/LogFoodScreen.js -- Category (Legumes) > Type (LEGUME_TYPES
// below) > (a sub-list, for the Types that have one) > food card.
//
// The actual food entries live in data/foodsLegumes.js and carry
// `subcategory` (Type), `legumeItem` (which bean/pea/product), and
// `legumeForm` (Dried/Cooked/Canned, on the Types that have a Form axis).
// This file is just their display labels and ordering, kept separate so
// relabeling never touches the food data -- same split every other
// category uses.
//
// Each Type declares its SHAPE, the same mechanism Dairy uses:
//   'itemList' -- a sub-list of items, each opening a card (Beans, Peas,
//                 Soy Products, Peanuts, Prepared)
//   'card'     -- straight to a card, no intermediate step (Lentils,
//                 Chickpeas -- each is one food with a Form toggle)
export const LEGUME_TYPES = [
  { key: 'beans', label: 'Beans', shape: 'itemList', hasFormToggle: true },
  { key: 'lentils', label: 'Lentils', shape: 'card', hasFormToggle: true },
  { key: 'chickpeas', label: 'Chickpeas', shape: 'card', hasFormToggle: true },
  { key: 'peas', label: 'Dried Peas', shape: 'itemList', hasFormToggle: true },
  { key: 'soy', label: 'Soy Products', shape: 'itemList', hasFormToggle: false },
  { key: 'peanuts', label: 'Peanuts', shape: 'itemList', hasFormToggle: false },
  { key: 'prepared', label: 'Prepared', shape: 'itemList', hasFormToggle: false },
];

// The Form axis, shared by Beans, Lentils, Chickpeas and Dried Peas.
//
// Worth knowing when the numbers look surprising: Dried runs roughly 2.3x
// to 3.0x the calories of Cooked per 100g, because dried beans absorb two
// to three times their weight in water. 100g of dried black beans is 341
// kcal; 100g of the same beans cooked is 132. Both are correct -- they're
// just not the same amount of bean. LegumeCard shows the form on the card
// so it's clear which one is being logged.
export const LEGUME_FORMS = [
  { key: 'dried', label: 'Dried' },
  { key: 'cooked', label: 'Cooked' },
  { key: 'canned', label: 'Canned' },
];

// The items under each 'itemList' Type. `key` matches `legumeItem` on the
// rows in data/foodsLegumes.js. Only items that actually have rows are
// shown, the same "don't render an empty step" rule the other categories
// use, so this list can stay ahead of the data without breaking anything.
export const LEGUME_ITEMS = {
  beans: [
    { key: 'black', label: 'Black Beans' },
    { key: 'pinto', label: 'Pinto Beans' },
    { key: 'kidney', label: 'Kidney Beans' },
    { key: 'navy', label: 'Navy Beans' },
    { key: 'white', label: 'White / Cannellini Beans' },
    { key: 'great_northern', label: 'Great Northern Beans' },
    { key: 'lima', label: 'Lima Beans' },
    { key: 'black_turtle', label: 'Black Turtle Beans' },
    { key: 'cranberry', label: 'Cranberry Beans' },
    { key: 'fava', label: 'Fava Beans' },
    { key: 'adzuki', label: 'Adzuki Beans' },
    { key: 'mung', label: 'Mung Beans' },
    { key: 'pink', label: 'Pink Beans' },
    { key: 'yellow', label: 'Yellow Beans' },
  ],
  peas: [
    { key: 'split', label: 'Split Peas' },
    { key: 'blackeye', label: 'Black-Eyed Peas' },
    { key: 'pigeon', label: 'Pigeon Peas' },
  ],
  soy: [
    { key: 'tofu_firm', label: 'Tofu, firm' },
    { key: 'tofu_soft', label: 'Tofu, soft' },
    { key: 'tempeh', label: 'Tempeh' },
    { key: 'edamame', label: 'Edamame' },
    { key: 'soybeans_cooked', label: 'Soybeans, cooked' },
    { key: 'soy_nuts', label: 'Soy Nuts' },
    { key: 'natto', label: 'Natto' },
    { key: 'miso', label: 'Miso' },
  ],
  peanuts: [
    { key: 'peanuts_raw', label: 'Peanuts, raw' },
    { key: 'peanuts_dry_roasted', label: 'Peanuts, dry-roasted' },
    { key: 'peanuts_oil_roasted', label: 'Peanuts, oil-roasted' },
    { key: 'peanut_butter_smooth', label: 'Peanut Butter, smooth' },
    { key: 'peanut_butter_chunky', label: 'Peanut Butter, chunky' },
    { key: 'peanut_butter_reduced_fat', label: 'Peanut Butter, reduced fat' },
  ],
  prepared: [
    { key: 'hummus', label: 'Hummus' },
    { key: 'falafel', label: 'Falafel' },
    { key: 'refried_beans', label: 'Refried Beans' },
    { key: 'baked_beans', label: 'Baked Beans' },
    { key: 'chili_vegetarian', label: 'Chili, vegetarian' },
    { key: 'dal', label: 'Dal (lentil curry)' },
  ],
};
