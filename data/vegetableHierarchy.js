// Human-readable labels + display order for the Vegetables picker in
// screens/LogFoodScreen.js -- Category (Vegetables) > Vegetable > flat list
// of food rows, ONE drill-down step, no grouping layer above it (no
// "Leafy Greens" / "Cruciferous" / etc. umbrella categories) -- Damon's
// explicit call for v0.0.25: "cancel all categories all together. Each
// vegetable is its own entry." Same flat-list shape as Fruit's FRUIT_TYPES,
// just without Fruit's separate Form (fresh/dried/canned/frozen) step above
// it, since Vegetables doesn't need one -- raw/cooked/canned/frozen just
// show as multiple rows within a vegetable's own flat food list instead,
// the same way Red Meat's raw/cooked pairs of a single cut already do.
//
// Order is most-common-to-least-common by everyday US eating/grocery
// frequency (Damon's call, with "I'll leave the commonsensing to you" on
// the exact ranking) -- NOT alphabetical, NOT botanical. Genuinely-similar
// variants of the same vegetable (Carrot/Baby Carrots, Tomato/Cherry Tomato/
// Sun-Dried Tomato/Green Tomato, the 5 named mushroom species, the 3 cabbage
// colors/types, etc.) are kept adjacent to each other rather than scattered
// strictly by rank -- see docs/vegetables-category-plan.md for the full
// reasoning behind every split/fold decision and the ordering itself.
//
// `key` matches the `cut` field on this vegetable's rows in
// data/foodsVegetables.js (or, for the 7 items that are botanically fruit
// too -- Tomato, Bell Pepper, Cucumber, Zucchini, Pumpkin, Eggplant,
// Avocado -- the `cut` field on their existing cross-listed row(s) in
// data/foods.js / data/foodsSRLegacy1.js, tagged back in the Fruit round).
export const VEGETABLE_TYPES = [
  { key: 'potato', label: 'Potato' },
  { key: 'tomato', label: 'Tomato' },
  { key: 'cherry_tomato', label: 'Cherry/Grape Tomatoes' },
  { key: 'sundried_tomato', label: 'Sun-Dried Tomatoes' },
  { key: 'green_tomato', label: 'Green Tomatoes' },
  { key: 'onion', label: 'Onion' },
  { key: 'garlic', label: 'Garlic' },
  { key: 'iceberg_lettuce', label: 'Iceberg Lettuce' },
  { key: 'romaine_lettuce', label: 'Romaine Lettuce' },
  { key: 'butter_lettuce', label: 'Butter/Bibb Lettuce' },
  { key: 'carrot', label: 'Carrot' },
  { key: 'baby_carrot', label: 'Baby Carrots' },
  { key: 'corn', label: 'Corn' },
  { key: 'bell_pepper', label: 'Bell Pepper' },
  { key: 'jalapeno', label: 'Jalapeño' },
  { key: 'other_chili_pepper', label: 'Other Chili/Hot Peppers' },
  { key: 'cucumber', label: 'Cucumber' },
  { key: 'pickle', label: 'Pickled Cucumbers (Pickles)' },
  { key: 'broccoli', label: 'Broccoli' },
  { key: 'green_cabbage', label: 'Green Cabbage' },
  { key: 'red_cabbage', label: 'Red Cabbage' },
  { key: 'napa_bok_choy', label: 'Napa/Bok Choy' },
  { key: 'sauerkraut', label: 'Sauerkraut' },
  { key: 'kimchi', label: 'Kimchi' },
  { key: 'green_bean', label: 'Green/Snap Beans' },
  { key: 'edamame', label: 'Edamame' },
  { key: 'celery', label: 'Celery' },
  { key: 'sweet_potato', label: 'Sweet Potato' },
  { key: 'sweet_potato_leaves', label: 'Sweet Potato Leaves' },
  { key: 'cauliflower', label: 'Cauliflower' },
  { key: 'spinach', label: 'Spinach' },
  { key: 'baby_spinach', label: 'Baby Spinach' },
  { key: 'button_mushroom', label: 'Mushroom (Button/White)' },
  { key: 'cremini_mushroom', label: 'Cremini Mushrooms' },
  { key: 'portobello_mushroom', label: 'Portobello Mushrooms' },
  { key: 'shiitake_mushroom', label: 'Shiitake Mushrooms' },
  { key: 'oyster_mushroom', label: 'Oyster Mushrooms' },
  { key: 'other_mushroom', label: 'Other Mushrooms' },
  { key: 'zucchini', label: 'Zucchini/Summer Squash' },
  { key: 'avocado', label: 'Avocado' },
  { key: 'asparagus', label: 'Asparagus' },
  { key: 'brussels_sprouts', label: 'Brussels Sprouts' },
  { key: 'green_pea', label: 'Green Peas' },
  { key: 'snap_pea', label: 'Snap Peas (Snow & Sugar Snap)' },
  { key: 'eggplant', label: 'Eggplant' },
  { key: 'radish', label: 'Radish' },
  { key: 'daikon_radish', label: 'Daikon Radish' },
  { key: 'beet', label: 'Beet' },
  { key: 'beet_greens', label: 'Beet Greens' },
  { key: 'scallion', label: 'Scallion/Green Onion' },
  { key: 'leek', label: 'Leek' },
  { key: 'shallot', label: 'Shallot' },
  { key: 'kale', label: 'Kale' },
  { key: 'swiss_chard', label: 'Swiss Chard' },
  { key: 'collard_greens', label: 'Collard Greens' },
  { key: 'arugula', label: 'Arugula' },
  { key: 'butternut_squash', label: 'Butternut Squash' },
  { key: 'acorn_squash', label: 'Acorn Squash' },
  { key: 'spaghetti_squash', label: 'Spaghetti Squash' },
  { key: 'other_winter_squash', label: 'Other Winter Squash' },
  { key: 'turnip', label: 'Turnip' },
  { key: 'turnip_greens', label: 'Turnip Greens' },
  { key: 'watercress', label: 'Watercress' },
  { key: 'mustard_greens', label: 'Mustard Greens' },
  { key: 'endive_escarole', label: 'Endive/Escarole' },
  { key: 'artichoke', label: 'Artichoke' },
  { key: 'okra', label: 'Okra' },
  { key: 'pumpkin', label: 'Pumpkin' },
  { key: 'alfalfa_sprouts', label: 'Alfalfa Sprouts' },
  { key: 'bean_sprouts', label: 'Bean Sprouts' },
  { key: 'rutabaga', label: 'Rutabaga' },
  { key: 'parsnip', label: 'Parsnip' },
  { key: 'kohlrabi', label: 'Kohlrabi' },
  { key: 'celeriac', label: 'Celeriac' },
  { key: 'jicama', label: 'Jicama' },
  { key: 'taro', label: 'Taro' },
  { key: 'yam', label: 'Yam' },
  { key: 'yuca', label: 'Yuca/Cassava' },
  { key: 'fennel', label: 'Fennel' },
  { key: 'seaweed', label: 'Seaweed/Kelp' },
  // Added v0.0.43 with the Indigenous-foods redistribution (Decision 2).
  { key: 'cattail', label: 'Cattail Shoots' },
  { key: 'prairie_turnip', label: 'Prairie Turnips' },
  { key: 'fireweed', label: 'Fireweed Greens' },
  { key: 'sourdock', label: 'Sourdock / Wild Greens' },
  { key: 'willow_leaves', label: 'Willow Leaves' },
  { key: 'seaweed_trad', label: 'Seaweed / Kelp' },
  { key: 'squash_indian', label: 'Squash, Indian' },
  { key: 'mashu_root', label: 'Mashu Roots' },
];
