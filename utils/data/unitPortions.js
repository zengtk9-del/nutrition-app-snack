// How many grams one of something weighs, so a portion can be counted
// instead of weighed.
//
// Every number here comes from USDA FoodData Central's `food_portion`
// table -- the same source as the app's macros -- via the household
// measures it publishes alongside each food ("1 medium (3\" dia)",
// "1 slice", "1 clove"). Each entry records which USDA food it was taken
// from and that food's fdcId, so any figure can be checked.
//
// Why this file had to exist: `typicalGrams` on each food row is a typical
// SERVING, not one item. For a banana that happens to be one banana (225g);
// for blueberries it is a cup (148g) and for a lemon a wedge (8g). Counting
// with those would produce "2 blueberries = 296g", so unit weights had to
// be sourced separately.
//
// Coverage is deliberately partial. A food appears here only when "one of
// them" is a thing people say -- an apple, a slice of bread, a clove of
// garlic. Berries, grains, leafy greens and anything eaten by the handful
// are absent, and their cards stay weight-only. Adding a food later is a
// row here and nothing else: the cards read this table to decide whether
// to offer counting at all.
//
// Sizes are ordered smallest to largest. Where USDA publishes only one
// weight for a food there is a single entry and the card shows no size
// toggle -- one clove of garlic is 3g and that is the end of it.

export const UNIT_PORTIONS = {

// ===== Fruit (39) =====
//   Apples, raw, with skin  [171688]
  apple: { noun: 'apple', sizes: [['Extra small', 101], ['Small', 149], ['Medium', 182], ['Large', 223]] },
//   Apricots, raw  [171697]
  apricot: { noun: 'apricot', sizes: [['Apricot', 35]] },
//   Avocados, raw, California  [171706]
  avocado: { noun: 'avocado', sizes: [['Avocado', 136]] },
//   Bananas, raw  [173944]
  banana: { noun: 'banana', sizes: [['Extra small', 81], ['Small', 101], ['Medium', 118], ['Large', 136], ['Extra large', 152]] },
//   Peppers, sweet, green, raw  [170427]
  bell_pepper: { noun: 'pepper', sizes: [['Small', 74], ['Medium', 119], ['Large', 164]] },
//   Melons, cantaloupe, raw  [169092]
  cantaloupe: { noun: 'wedge', sizes: [['Small', 55], ['Medium', 69], ['Large', 102]] },
//   Cherries, sweet, raw  [171719]
  cherries: { noun: 'cherry', sizes: [['Cherry', 8.2]] },
//   Nuts, coconut meat, raw  [170169]
  coconut: { noun: 'piece', sizes: [['Piece', 45]] },
//   Cucumber, with peel, raw  [168409]
  cucumber: { noun: 'cucumber', sizes: [['Cucumber', 301]] },
//   Dates, medjool  [168191]
  dates: { noun: 'date', sizes: [['Date', 24]] },
//   Eggplant, raw  [169228]
  eggplant: { noun: 'eggplant', sizes: [['Eggplant', 503.0]] },
//   Figs, raw  [173021]
  fig: { noun: 'fig', sizes: [['Small', 40], ['Medium', 50], ['Large', 64]] },
//   Grapefruit, raw, pink and red and white, all areas  [173033]
  grapefruit: { noun: 'grapefruit', sizes: [['Small', 100], ['Medium', 128], ['Large', 166]] },
//   Guavas, common, raw  [173044]
  guava: { noun: 'guava', sizes: [['Guava', 55]] },
//   Melons, honeydew, raw  [169911]
  honeydew: { noun: 'wedge', sizes: [['Wedge', 142.5]] },
//   Kiwifruit, green, raw  [168153]
  kiwi: { noun: 'kiwi', sizes: [['Kiwi', 69]] },
//   Lemons, raw, without peel  [167746]
  lemon: { noun: 'lemon', sizes: [['Lemon', 71.0]] },
//   Limes, raw  [168155]
  lime: { noun: 'lime', sizes: [['Lime', 67]] },
//   Litchis, raw  [169086]
  lychee: { noun: 'lychee', sizes: [['Lychee', 9.6]] },
//   Mangos, raw  [169910]
  mango: { noun: 'mango', sizes: [['Mango', 336]] },
//   Nectarines, raw  [169914]
  nectarine: { noun: 'nectarine', sizes: [['Small', 129], ['Medium', 142], ['Large', 156]] },
//   Olives, ripe, canned (small-extra large)  [169094]
  olive: { noun: 'olive', sizes: [['Small', 3.2], ['Large', 4.4]] },
//   Oranges, raw, all commercial varieties  [169097]
  orange: { noun: 'orange', sizes: [['Small', 96], ['Large', 184]] },
//   Papayas, raw  [169926]
  papaya: { noun: 'papaya', sizes: [['Small', 157], ['Large', 781]] },
//   Passion-fruit, (granadilla), purple, raw  [169108]
  passion_fruit: { noun: 'passion fruit', sizes: [['Passion fruit', 18]] },
//   Peaches, yellow, raw  [325430]
  peach: { noun: 'peach', sizes: [['Small', 147], ['Medium', 161], ['Large', 173], ['Extra large', 225]] },
//   Pears, raw  [169118]
  pear: { noun: 'pear', sizes: [['Small', 148], ['Medium', 178], ['Large', 230]] },
//   Persimmons, japanese, raw  [169941]
  persimmon: { noun: 'persimmon', sizes: [['Persimmon', 168]] },
//   Pineapple, raw, all varieties  [169124]
  pineapple: { noun: 'slice', sizes: [['Slice', 84]] },
//   Plantains, green, raw  [168215]
  plantain: { noun: 'plantain', sizes: [['Plantain', 267]] },
//   Plums, raw  [169949]
  plum: { noun: 'plum', sizes: [['Plum', 66]] },
//   Pomegranates, raw  [169134]
  pomegranate: { noun: 'pomegranate', sizes: [['Pomegranate', 282]] },
//   Plums, dried (prunes), uncooked  [168162]
  prunes: { noun: 'prune', sizes: [['Prune', 9.5]] },
//   Carambola, (starfruit), raw  [171715]
  starfruit: { noun: 'starfruit', sizes: [['Small', 70], ['Medium', 91], ['Large', 124]] },
//   Strawberries, raw  [167762]
  strawberry: { noun: 'strawberry', sizes: [['Small', 7], ['Medium', 12], ['Large', 18], ['Extra large', 27]] },
//   Tangerines, (mandarin oranges), raw  [169105]
  tangerine: { noun: 'tangerine', sizes: [['Small', 76], ['Medium', 88], ['Large', 120]] },
//   Tomatoes, red, ripe, raw, year round average  [170457]
  tomato: { noun: 'tomato', sizes: [['Small', 91], ['Medium', 123], ['Large', 182]] },
//   Watermelon, raw  [167765]
  watermelon: { noun: 'wedge', sizes: [['Wedge', 286]] },
//   Squash, summer, zucchini, includes skin, raw  [169291]
  zucchini: { noun: 'zucchini', sizes: [['Small', 118], ['Medium', 196], ['Large', 323]] },

// ===== Vegetables (43) =====
//   Squash, winter, acorn, raw  [168472]
  acorn_squash: { noun: 'squash', sizes: [['Squash', 431]] },
//   Artichokes, (globe or french), raw  [169205]
  artichoke: { noun: 'artichoke', sizes: [['Medium', 128], ['Large', 162]] },
//   Asparagus, raw  [168389]
  asparagus: { noun: 'spear', sizes: [['Small', 12], ['Medium', 16], ['Large', 20], ['Extra large', 24]] },
//   Carrots, baby, raw  [168568]
  baby_carrot: { noun: 'baby carrot', sizes: [['Medium', 10], ['Large', 15]] },
//   Beets, raw  [169145]
  beet: { noun: 'beet', sizes: [['Beet', 82]] },
//   Broccoli, raw  [170379]
  broccoli: { noun: 'spear', sizes: [['Spear', 31]] },
//   Brussels sprouts, raw  [170383]
  brussels_sprouts: { noun: 'sprout', sizes: [['Sprout', 19]] },
//   Lettuce, butterhead (includes boston and bibb types), raw  [168429]
  butter_lettuce: { noun: 'leaf', sizes: [['Medium', 7.5], ['Large', 15]] },
//   Mushrooms, white, raw  [169251]
  button_mushroom: { noun: 'mushroom', sizes: [['Small', 10], ['Medium', 18], ['Large', 23]] },
//   Carrots, raw  [170393]
  carrot: { noun: 'carrot', sizes: [['Small', 50], ['Medium', 61], ['Large', 72]] },
//   Cauliflower, raw  [169986]
  cauliflower: { noun: 'head', sizes: [['Small', 265], ['Medium', 588], ['Large', 840]] },
//   Celery, raw  [169988]
  celery: { noun: 'stalk', sizes: [['Small', 17], ['Medium', 40], ['Large', 64]] },
//   Corn, sweet, yellow, raw  [169998]
  corn: { noun: 'ear', sizes: [['Small', 73], ['Medium', 102], ['Large', 143]] },
//   Mushrooms, brown, italian, or crimini, raw  [168434]
  cremini_mushroom: { noun: 'mushroom', sizes: [['Mushroom', 20]] },
//   Radishes, oriental, raw  [168451]
  daikon_radish: { noun: 'radish', sizes: [['Radish', 338]] },
//   Fennel, bulb, raw  [169385]
  fennel: { noun: 'bulb', sizes: [['Bulb', 234]] },
//   Garlic, raw  [169230]
  garlic: { noun: 'clove', sizes: [['Clove', 3]] },
//   Cabbage, raw  [169975]
  green_cabbage: { noun: 'head', sizes: [['Small', 714], ['Medium', 908], ['Large', 1248]] },
//   Tomatoes, green, raw  [170456]
  green_tomato: { noun: 'tomato', sizes: [['Small', 91], ['Medium', 123], ['Large', 182]] },
//   Lettuce, iceberg (includes crisphead types), raw  [169248]
  iceberg_lettuce: { noun: 'head', sizes: [['Small', 324], ['Medium', 539], ['Large', 755]] },
//   Peppers, jalapeno, raw  [168576]
  jalapeno: { noun: 'pepper', sizes: [['Pepper', 14]] },
//   Yambean (jicama), raw  [170073]
  jicama: { noun: 'jicama', sizes: [['Small', 365], ['Medium', 659], ['Large', 1200]] },
//   Leeks, (bulb and lower leaf-portion), raw  [169246]
  leek: { noun: 'leek', sizes: [['Leek', 89]] },
//   Okra, raw  [169260]
  okra: { noun: 'pod', sizes: [['Pod', 95]] },
//   Onions, raw  [170000]
  onion: { noun: 'onion', sizes: [['Small', 70], ['Medium', 110], ['Large', 150]] },
//   Peppers, hot chili, green, raw  [170497]
  other_chili_pepper: { noun: 'pepper', sizes: [['Pepper', 45]] },
//   Mushrooms, oyster, raw  [168580]
  oyster_mushroom: { noun: 'mushroom', sizes: [['Small', 15], ['Large', 148]] },
//   Parsnips, cooked, boiled, drained, without salt  [170009]
  parsnip: { noun: 'parsnip', sizes: [['Parsnip', 160]] },
//   Pickles, cucumber, dill or kosher dill  [168558]
  pickle: { noun: 'pickle', sizes: [['Large', 135]] },
//   Mushrooms, portabella, raw  [169255]
  portobello_mushroom: { noun: 'mushroom', sizes: [['Mushroom', 84]] },
//   Potatoes, russet, flesh and skin, raw  [170027]
  potato: { noun: 'potato', sizes: [['Small', 170], ['Medium', 213], ['Large', 369]] },
//   Radishes, raw  [169276]
  radish: { noun: 'radish', sizes: [['Small', 2], ['Medium', 4.5], ['Large', 9]] },
//   Cabbage, red, raw  [169977]
  red_cabbage: { noun: 'head', sizes: [['Small', 567], ['Medium', 839], ['Large', 1134]] },
//   Rutabagas, raw  [168454]
  rutabaga: { noun: 'rutabaga', sizes: [['Small', 192], ['Medium', 386], ['Large', 772]] },
//   Onions, spring or scallions (includes tops and bulb), raw  [170005]
  scallion: { noun: 'scallion', sizes: [['Small', 5], ['Medium', 15], ['Large', 25]] },
//   Mushrooms, shiitake, raw  [169242]
  shiitake_mushroom: { noun: 'mushroom', sizes: [['Mushroom', 19]] },
//   Sweet potato, raw, unprepared  [168482]
  sweet_potato: { noun: 'sweet potato', sizes: [['Sweet potato', 130]] },
//   Turnips, raw  [170465]
  turnip: { noun: 'turnip', sizes: [['Small', 61], ['Medium', 122], ['Large', 183]] },

// ===== Grains & Breads (19) =====
//   Bagels, plain, enriched, with calcium propionate (includes onion, poppy, sesame)  [174899]
  bagel: { noun: 'bagel', sizes: [['Small', 69], ['Medium', 105], ['Large', 131]] },
//   Biscuits, plain or buttermilk, frozen, baked  [172667]
  biscuit: { noun: 'biscuit', sizes: [['Biscuit', 35]] },
//   Tortillas, ready-to-bake or -fry, corn, without added salt  [173241]
  corn_tortilla: { noun: 'tortilla', sizes: [['Medium', 26]] },
//   Bread, cornbread, prepared from recipe, made with low fat (2%) milk  [174910]
  cornbread: { noun: 'piece', sizes: [['Piece', 65]] },
//   Rolls, dinner, plain, commercially prepared (includes brown-and-serve)  [172793]
  dinner_roll: { noun: 'roll', sizes: [['Roll', 43]] },
//   Muffins, English, plain, enriched, with ca prop (includes sourdough)  [174994]
  english_muffin: { noun: 'muffin', sizes: [['Muffin', 57]] },
//   Tortillas, ready-to-bake or -fry, flour, refrigerated  [175037]
  flour_tortilla: { noun: 'tortilla', sizes: [['Tortilla', 60.5]] },
//   French toast, frozen, ready-to-heat  [172763]
  french_toast: { noun: 'piece', sizes: [['Piece', 59]] },
//   Bread, Italian  [174913]
  italian_bread: { noun: 'slice', sizes: [['Slice', 29]] },
//   Muffins, blueberry, commercially prepared  [174892]
  muffin_blueberry: { noun: 'muffin', sizes: [['Small', 66], ['Medium', 113], ['Large', 139], ['Extra large', 168]] },
//   Muffins, plain, prepared from recipe, made with low fat (2%) milk  [172764]
  muffin_plain: { noun: 'muffin', sizes: [['Muffin', 57]] },
//   Bread, multi-grain (includes whole-grain)  [168013]
  multigrain_bread: { noun: 'slice', sizes: [['Slice', 26]] },
//   Pancakes, plain, prepared from recipe  [175009]
  pancakes: { noun: 'pancake', sizes: [['Pancake', 57.5]] },
//   Bread, pita, white, enriched  [174915]
  pita: { noun: 'pita', sizes: [['Small', 28], ['Large', 60]] },
//   Bread, pumpernickel  [174918]
  pumpernickel: { noun: 'slice', sizes: [['Slice', 23.0]] },
//   Bread, rye, toasted  [172685]
  rye_bread: { noun: 'slice', sizes: [['Slice', 21.0]] },
//   Waffles, plain, frozen, ready-to-heat  [175038]
  waffles: { noun: 'waffle', sizes: [['Waffle', 35]] },
//   Bread, white, commercially prepared (includes soft bread crumbs)  [174924]
  white_bread: { noun: 'slice', sizes: [['Slice', 22.5]] },
//   Bread, whole-wheat, commercially prepared  [172688]
  whole_wheat_bread: { noun: 'slice', sizes: [['Slice', 32]] },
};

// The unit table for one food row, or null if this food is not counted.
// Keyed on the same item field each card already uses to pick its icon.
export function unitPortionFor(food) {
  if (!food) return null;
  const key = food.cut || food.grainItem || null;
  return key ? UNIT_PORTIONS[key] || null : null;
}
