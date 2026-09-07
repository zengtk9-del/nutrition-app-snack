// How the All tab orders its ~1,057 food cards: most commonly eaten first.
//
// There is no popularity data in USDA and none in this app yet (nobody has
// logged anything), so "most common" here is a judgement, not a
// measurement. It is written down in one place rather than buried in the
// screen so it can be argued with and edited without touching any code.
//
// Two tiers:
//
//   1. COMMON_FIRST below -- an explicit ranked list of the staples, in
//      order. Anything named here sorts above everything not named here.
//   2. Everything else, ordered by CATEGORY_WEIGHT and then alphabetically,
//      so the tail is at least predictable and stable.
//
// Entries are CARD keys (see utils/foodCards.js), not food ids, because
// the All tab lists cards -- one entry per card, its toggles intact.
//
// To promote a food, put its card key higher in this list. To find a card
// key: it mirrors the drill-down path, e.g. `poultry:chicken:breast`,
// `grain:white_rice`, `fruit:apple`, `dairy:milk`.

export const COMMON_FIRST = [
  // --- The everyday protein/carb/dairy core --------------------------
  'poultry:chicken:breast',
  'egg:chicken:whole',
  'dairy:milk',
  'grain:white_rice',
  'grain:whole_wheat_bread',
  'red_meat:beef:ground',
  'fruit:banana',
  'fruit:apple',
  'grain:oats',
  'poultry:chicken:thigh',
  'dairy:yogurt',
  'grain:white_bread',
  'grain:brown_rice',
  'grain:pasta',
  'vegetable:potato',
  'vegetable:broccoli',
  'seafood:fish:salmon',
  'vegetable:onion',
  'vegetable:carrot',
  'vegetable:tomato',
  'dairy:cheese:cheddar',
  'legume:peanut_butter_smooth',
  'fat_oil:olive_extra_virgin',
  'dairy:butter',
  'vegetable:spinach',
  'vegetable:romaine_lettuce',
  'vegetable:iceberg_lettuce',
  'seafood:processed:canned_tuna',
  'red_meat:beef:sirloin',
  'red_meat:pork:chops',

  // --- Common fruit & veg ---------------------------------------------
  'fruit:orange',
  'fruit:strawberry',
  'fruit:grapes',
  'fruit:blueberry',
  'fruit:avocado',
  'vegetable:sweet_potato',
  'vegetable:bell_pepper',
  'vegetable:cucumber',
  'vegetable:green_bean',
  'vegetable:corn',
  'vegetable:button_mushroom',
  'vegetable:zucchini',
  'vegetable:cauliflower',
  'vegetable:green_pea',
  'vegetable:green_cabbage',
  'vegetable:celery',
  'vegetable:asparagus',
  'fruit:watermelon',
  'fruit:pineapple',
  'fruit:mango',
  'fruit:peach',
  'fruit:pear',
  'fruit:lemon',

  // --- Everyday pantry, snacks and drinks -----------------------------
  'nut_seed:almond',
  'legume:black',
  'legume:chickpeas',
  'legume:lentils',
  'grain:flour_tortilla',
  'grain:bagel',
  'grain:cereal_oat_os_plain',
  'dairy:cheese:mozzarella',
  'dairy:cream:sour_cream',
  'beverage:coffee_black',
  'beverage:orange_juice',
  'beverage:tea_black',
  'condiment_sauce:ketchup',
  'condiment_sauce:mayonnaise',
  'condiment_sauce:ranch',
  'fat_oil:canola',
  'fat_oil:vegetable_soybean',
  'snack:potato_chips',
  'snack:granola_bar',
  'sweet:milk_chocolate',
  'sweet:ice_cream_vanilla',
  'sweet:chocolate_chip',

  // --- Meals people actually log --------------------------------------
  'mixed_dish:pizza_cheese',
  'mixed_dish:pizza_pepperoni',
  'mixed_dish:hamburger',
  'mixed_dish:cheeseburger',
  'mixed_dish:chicken_noodle_soup',
  'mixed_dish:spaghetti_meat_sauce',
  'mixed_dish:mac_and_cheese',
  'mixed_dish:fried_rice',
  'mixed_dish:beef_taco',
  'mixed_dish:bean_burrito',
  'mixed_dish:grilled_cheese',
  'mixed_dish:pbj',
  'mixed_dish:chicken_sandwich',
  'mixed_dish:omelet_cheese',
  'mixed_dish:garden_salad',
  'condiment_sauce:caesar',

  // --- Remaining common proteins --------------------------------------
  'poultry:chicken:whole',
  'poultry:chicken:drumstick',
  'poultry:chicken:wing',
  'poultry:turkey:breast',
  'red_meat:beef:ribeye',
  'red_meat:beef:chuck',
  'red_meat:processed:bacon',
  'red_meat:processed:ham_deli',
  'red_meat:processed:sausage',
  'red_meat:processed:hot_dogs_franks',
  'seafood:fish:tuna',
  'seafood:fish:cod',
  'seafood:fish:tilapia',
  'seafood:shellfish:shrimp',
];

// Ordering for everything not named above. Staples ahead of occasional
// foods, and the long tails (mixed dishes, baby food) last -- not because
// they matter less, but because a flat list of 1,057 entries is only
// usable if the things people eat daily are near the top.
export const CATEGORY_WEIGHT = {
  poultry: 0,
  egg: 1,
  dairy: 2,
  red_meat: 3,
  seafood: 4,
  grain: 5,
  fruit: 6,
  vegetable: 7,
  legume: 8,
  nut_seed: 9,
  fat_oil: 10,
  condiment_sauce: 11,
  snack: 12,
  sweet: 13,
  beverage: 14,
  meat_substitute: 15,
  mixed_dish: 16,
  baby_food: 17,
};

const RANK = new Map(COMMON_FIRST.map((k, i) => [k, i]));

// Keeps every unranked card below every ranked one, however long
// COMMON_FIRST grows. Exported so data/dietOrder.js can size its tier
// offsets to stay clear of it.
export const UNRANKED_BASE = 1000;

// Sort key for one card. Lower sorts first.
//
// `categoryWeight` overrides CATEGORY_WEIGHT for the unranked tail only.
// Log Food passes the position of this category in the user's diet order
// (see data/dietOrder.js) so the tail sorts the same way as the category
// strip above it. Omit it and this behaves exactly as it did before diets
// existed.
export function commonnessRank(cardKey, category, categoryWeight) {
  const explicit = RANK.get(cardKey);
  if (explicit !== undefined) return explicit;
  const weight = categoryWeight ?? CATEGORY_WEIGHT[category] ?? 99;
  return UNRANKED_BASE + weight * 10;
}

// True when this card is one of the ~105 hand-ranked staples above.
//
// Log Food adds the diet tier offset only to these. The unranked tail is
// already in diet order via `categoryWeight`, so offsetting it a second
// time would spread it out without changing anything.
export function isRankedStaple(cardKey) {
  return RANK.has(cardKey);
}
