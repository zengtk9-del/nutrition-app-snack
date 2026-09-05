// What "one food card" means, expressed once.
//
// The All tab (screens/LogFoodScreen.js) has to list every food in the app
// in one flat list. Listing every ROW would be wrong: "Chicken Breast, Skin
// On" exists twice (raw and cooked), White Rice twice (dry and cooked),
// Ranch Dressing three times (regular/light/fat-free). Those are not
// separate foods -- they are the toggle positions of ONE card.
//
// So the All tab lists CARDS. `cardKeyOf` collapses a food row down to the
// card it belongs to, and every row sharing a key collapses into a single
// entry that opens that card with its toggles intact.
//
// The keys mirror each category's drill-down path exactly, because that IS
// the definition of a card in this app: Category > Type > item.

export function cardKeyOf(food) {
  const c = food.category;
  switch (c) {
    // Category > Type > Cut > card. Fat tier, trim tier and prep are all
    // toggles ON the card, so none of them belong in the key.
    case 'red_meat':
    case 'seafood':
      return `${c}:${food.subcategory}:${food.cut}`;
    // Poultry's skin/bone/prep are likewise toggles on one card per cut.
    case 'poultry':
      return `poultry:${food.subcategory}:${food.cut}`;
    // Eggs: one card per bird per form (whole / white / yolk); size, grade
    // and prep are toggles inside it.
    case 'egg':
      return `egg:${food.subcategory}:${food.form}`;
    // Fruit and Vegetables have no Type layer -- `cut` IS the food, and
    // fresh/dried/canned/frozen are the toggle.
    case 'fruit':
    case 'vegetable':
      return `${c}:${food.cut}`;
    // Dairy is the irregular one: five subcategories with four different
    // card shapes behind them. Milk, Yogurt and Butter are each a single
    // card for the whole subcategory; cheeses group by cheeseType, creams
    // by creamGroup, and anything left is its own standalone item.
    case 'dairy':
      if (food.subcategory === 'milk') return 'dairy:milk';
      if (food.subcategory === 'yogurt') return 'dairy:yogurt';
      if (food.subcategory === 'butter') return 'dairy:butter';
      if (food.cheeseType) return `dairy:cheese:${food.cheeseType}`;
      if (food.creamGroup) return `dairy:cream:${food.creamGroup}`;
      return `dairy:item:${food.id}`;
    default: {
      // Everything else is "one item, one optional toggle" -- the shape
      // LegumeCard drives. Whichever item column the row carries is its
      // card. Cross-listed rows keep their SOURCE column (a granola bar
      // shown under Sweets is still snackItem), which is exactly right:
      // one food, one card, wherever you found it.
      const key =
        food.fatItem || food.nutItem || food.grainItem || food.legumeItem ||
        food.sweetItem || food.beverageItem || food.condimentItem ||
        food.dishItem || food.snackItem || food.substituteItem || food.babyItem;
      return key ? `${c}:${key}` : `${c}:row:${food.id}`;
    }
  }
}

// The row a card should display and price itself from when it appears in a
// flat list. Rules, in order:
//
//   1. Prefer a raw/dry/plain/regular row over a cooked or flavoured one --
//      it is the version people recognise as "the food", and it is what
//      each card already defaults its toggle to.
//   2. Otherwise take the shortest name, which in USDA data is reliably
//      the least-qualified row.
//
// Without rule 1 the All list would show "Oats" priced at 71 kcal (cooked
// porridge, mostly water) rather than 379, which reads like a bug.
const PREFERRED = ['raw', 'dry', 'plain', 'regular', 'fresh', 'strained', 'brewed', 'air_popped'];

export function representativeRow(rows, key) {
  if (rows.length === 1) return rows[0];
  // Milk's card opens on whole milk, so price the list entry from it too.
  if (key === 'dairy:milk') return rows.find((r) => r.id === 'milk_whole') || rows[0];
  const score = (f) => {
    const vals = [f.prep, f.legumeForm, f.grainForm, f.nutPrep, f.fatLevel, f.sweetVariety,
      f.beverageVariety, f.condimentVariety, f.snackVariety, f.babyStage, f.subcategory];
    const hit = PREFERRED.findIndex((p) => vals.includes(p));
    return hit === -1 ? PREFERRED.length : hit;
  };
  return [...rows].sort((a, b) => score(a) - score(b) || a.name.length - b.name.length)[0];
}

// The label for a card in the All list. Toggle-position suffixes are
// stripped, because the card the row opens carries them as a toggle --
// "White Rice, Dry" in a list whose entry opens a Dry/Cooked card is just
// noise, and it makes two cards look like they have different names
// depending on which row happened to be picked.
const SUFFIX = new RegExp(
  ',\\s*(raw|cooked|dry|light|fat free|fat-free|no sugar added|diet|instant|' +
  'decaffeinated|strained|junior|plain|flavored|baked|reduced fat|air-popped|' +
  'with butter|microwave|caramel coated|skin on|skinless)$',
  'i'
);

// Dairy's three fixed cards cover a whole subcategory rather than one
// named food, so the representative row's name is the wrong label for
// them -- Milk's rows include Kefir and Buttermilk, and picking the
// shortest would title the card "Kefir".
const FIXED_TITLES = { 'dairy:milk': 'Milk', 'dairy:yogurt': 'Yogurt', 'dairy:butter': 'Butter & Ghee' };

export function cardTitleOf(row, key) {
  if (key && FIXED_TITLES[key]) return FIXED_TITLES[key];
  return row.name.replace(SUFFIX, '');
}
