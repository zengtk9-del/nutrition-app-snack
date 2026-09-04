// Which icon a given food row should show.
//
// This lived inside LogFoodScreen.js until v0.0.57, when the Today tab and
// the My Favorites rows started showing icons too. It is not screen logic
// -- it is a pure mapping from a food row to an icon key -- so it moved
// here where three callers can share it rather than drift apart.
//
// Two category tables came with it, because rowIconKeyOf reads them and
// they are configuration rather than rendering. LogFoodScreen imports them
// straight back; nothing about how they are used changed.

import { FOOD_ICON_IMAGES } from '../data/foodIconImages';
import { RED_MEAT_CUTS } from '../data/meatHierarchy';
import { POULTRY_CUTS } from '../data/poultryHierarchy';
import { SEAFOOD_CUTS } from '../data/seafoodHierarchy';
import { LEGUME_FORMS } from '../data/legumeHierarchy';
import { NUT_PREPS } from '../data/nutSeedHierarchy';
import { GRAIN_FORMS } from '../data/grainHierarchy';
import { FAT_LEVELS } from '../data/fatOilHierarchy';
import { SWEET_TYPES, SWEET_VARIETIES, SWEET_ITEMS } from '../data/sweetHierarchy';
import { BEVERAGE_TYPES, BEVERAGE_VARIETIES, BEVERAGE_ITEMS } from '../data/beverageHierarchy';
import { CONDIMENT_TYPES, CONDIMENT_VARIETIES, CONDIMENT_ITEMS } from '../data/condimentHierarchy';
import { DISH_TYPES, DISH_ITEMS } from '../data/mixedDishHierarchy';
import { SNACK_TYPES, SNACK_VARIETIES, SNACK_ITEMS } from '../data/snackHierarchy';
import { SUBSTITUTE_TYPES, SUBSTITUTE_ITEMS } from '../data/meatSubstituteHierarchy';
import { BABY_TYPES, BABY_VARIETIES, BABY_ITEMS } from '../data/babyFoodHierarchy';

// The four categories that predate SIMPLE_CATEGORIES but share its shape --
// one item, one optional toggle, driven by LegumeCard.
export const ITEM_CARD_CATEGORIES = {
  legume: { itemField: 'legumeItem', variantField: 'legumeForm', varieties: LEGUME_FORMS, iconPrefix: 'legume', toggleLabel: 'Form', variantInIconKey: true },
  nut_seed: { itemField: 'nutItem', variantField: 'nutPrep', varieties: NUT_PREPS, iconPrefix: 'nutseed', toggleLabel: 'Preparation', variantInIconKey: true },
  grain: { itemField: 'grainItem', variantField: 'grainForm', varieties: GRAIN_FORMS, iconPrefix: 'grain', toggleLabel: 'Form', variantInIconKey: true },
  fat_oil: { itemField: 'fatItem', variantField: 'fatLevel', varieties: FAT_LEVELS, iconPrefix: 'fatoil', toggleLabel: 'Fat Level', variantInIconKey: false },
};

// The seven categories organized in v0.0.43 -- Sweets, Beverages,
// Condiments & Sauces, Mixed Dishes, Snacks, Meat Substitutes and Baby
// Foods -- all have the SAME shape: Category > Type > item > card, with at
// most one optional toggle on the card.
//
// So rather than seven near-identical copies of the state/derivation/
// routing blocks that Grains and Fats & Oils each got, they share one
// generic path driven by this table. Adding an eighth would be a row here,
// not a new branch anywhere.
//
// `variantInIconKey` is false throughout: every toggle in these seven is a
// data axis that does NOT change the drawing (light vs regular dressing,
// diet vs regular cola, BBQ vs plain crisps, strained vs junior puree),
// which is the same call margarine's fat level got in v0.0.41.
// `crossFields` lists (field, iconPrefix) pairs for rows that arrive by
// crossListCategories from another category -- snack bars into Sweets, nut
// milks into Beverages, trail mix into Snacks, hummus and falafel into
// Mixed Dishes. Such a row keeps its ORIGINAL item key and icon prefix, so
// it is one food with one picture shown under two tabs, rather than a
// second drawing of the same granola bar.
export const SIMPLE_CATEGORIES = {
  sweet: { label: 'Sweets', types: SWEET_TYPES, items: SWEET_ITEMS, varieties: SWEET_VARIETIES,
    itemField: 'sweetItem', variantField: 'sweetVariety', iconPrefix: 'sweet', toggleLabel: 'Variety',
    crossFields: [['snackItem', 'snack']],
  },
  beverage: { label: 'Beverages', types: BEVERAGE_TYPES, items: BEVERAGE_ITEMS, varieties: BEVERAGE_VARIETIES,
    itemField: 'beverageItem', variantField: 'beverageVariety', iconPrefix: 'bev', toggleLabel: 'Type',
    crossFields: [['nutItem', 'nutseed']],
  },
  condiment_sauce: { label: 'Condiments & Sauces', types: CONDIMENT_TYPES, items: CONDIMENT_ITEMS,
    varieties: CONDIMENT_VARIETIES, itemField: 'condimentItem', variantField: 'condimentVariety',
    iconPrefix: 'cond', toggleLabel: 'Variety',
    crossFields: [['legumeItem', 'legume']],
  },
  mixed_dish: { label: 'Mixed Dishes', types: DISH_TYPES, items: DISH_ITEMS, varieties: [],
    itemField: 'dishItem', variantField: null, iconPrefix: 'dish', toggleLabel: null,
    crossFields: [['legumeItem', 'legume']],
  },
  snack: { label: 'Snacks', types: SNACK_TYPES, items: SNACK_ITEMS, varieties: SNACK_VARIETIES,
    itemField: 'snackItem', variantField: 'snackVariety', iconPrefix: 'snack', toggleLabel: 'Variety',
    crossFields: [['nutItem', 'nutseed']],
  },
  meat_substitute: { label: 'Meat Substitutes', types: SUBSTITUTE_TYPES, items: SUBSTITUTE_ITEMS,
    varieties: [], itemField: 'substituteItem', variantField: null, iconPrefix: 'meatsub', toggleLabel: null },
  baby_food: { label: 'Baby Foods', types: BABY_TYPES, items: BABY_ITEMS, varieties: BABY_VARIETIES,
    itemField: 'babyItem', variantField: 'babyStage', iconPrefix: 'baby', toggleLabel: 'Stage' },
};

// Nearest drawn key to the one a row asked for.
//
// rowIconKeyOf builds each card's key at its DEFAULT toggle position, but
// that default does not always exist. Bologna, jerky, canned tuna, ham and
// the other processed meats get `_raw` from a rule written for steaks, and
// there is no raw bologna. Raisins and dates get `_fresh` when only the
// dried drawing exists. Goat cheese asks for `dairy_cheese_goat` when the
// real keys are `_soft` and `_hard`.
//
// That was survivable while icons only appeared on browse rows. Once the
// Today tab shows them (v0.0.57) it stopped being: log a ham sandwich and
// the thing you just ate is a dashed grey box. 86 of 1,698 rows were in
// this state.
//
// So rather than hand-patch each rule, the last segment is treated as a
// guess. Try the key; then try swapping that segment for the toggle
// positions foods actually get drawn in; then accept any drawn key that
// extends it. PREP_FALLBACKS is ordered by how plainly each reads as "the
// food itself" -- a cooked or dried or plain version before a flavoured
// one -- and the search is deterministic, so a food always gets the same
// picture.
const PREP_FALLBACKS = ['cooked', 'dried', 'plain', 'regular', 'hard', 'raw', 'fresh', 'canned', 'frozen'];
const DRAWN = Object.keys(FOOD_ICON_IMAGES).sort();

function nearestDrawnKey(key) {
  if (!key || FOOD_ICON_IMAGES[key]) return key;
  const cut = key.lastIndexOf('_');
  if (cut > 0) {
    const stem = key.slice(0, cut);
    for (const alt of PREP_FALLBACKS) {
      if (FOOD_ICON_IMAGES[`${stem}_${alt}`]) return `${stem}_${alt}`;
    }
  }
  // `dairy_cheese_goat` -> `dairy_cheese_goat_hard`: the key is a whole
  // food, just drawn in a variation the rule did not name.
  for (const alt of PREP_FALLBACKS) {
    if (FOOD_ICON_IMAGES[`${key}_${alt}`]) return `${key}_${alt}`;
  }
  const ext = DRAWN.find((k) => k.startsWith(`${key}_`));
  if (ext) return ext;
  // Last resort: the drawn key carries a VARIETY segment in the middle that
  // the cut key never had. `vegetable_pickle_raw` has no artwork because
  // pickles were drawn as `vegetable_pickle_dill` and `..._sweet_bread_and
  // _butter`; same for endive, chilis and the specialty mushrooms. Matching
  // on the stem finds them. DRAWN is sorted, so which variety stands in for
  // the group is stable rather than whichever row happened to load first.
  if (cut > 0) {
    const sib = DRAWN.find((k) => k.startsWith(`${key.slice(0, cut)}_`));
    if (sib) return sib;
  }
  // Nothing matched -- hand back the original so FoodIcon draws its
  // placeholder rather than silently borrowing an unrelated picture.
  return key;
}

// The icon key a LIST ROW should show.
//
// Every drill-down row, All-tab row, Today entry and Favorites row has an
// icon slot, and the picture in it must be the SAME picture the card behind
// it shows -- one drawing per food, not one for the list and another for
// the card. So this reproduces each card's icon key at its DEFAULT toggle
// position, which is what you see the moment the card opens.
//
// That default is why a favourite saved as "skinless, cooked" still lists
// with the skin-on raw drawing: the row shows the food, the card shows the
// variation. Matching a favourite's exact saved toggles would mean
// reproducing all thirteen cards' key logic here, which is a lot of
// machinery for a 96pt picture that reads the same either way.
//
// Type rows (Beef, Cookies & Biscuits) have no card behind them, so they
// get their own `type_<category>_<key>` namespace instead.
//
// The key is then passed through nearestDrawnKey, above, so a default
// that was never drawn still lands on the right picture.
export function rowIconKeyOf(food) {
  return nearestDrawnKey(rawRowIconKeyOf(food));
}

function rawRowIconKeyOf(food) {
  if (!food) return null;
  switch (food.category) {
    case 'poultry': {
      const meta = (POULTRY_CUTS[food.subcategory] || []).find((c) => c.key === food.cut);
      const parts = [food.subcategory, food.cut];
      if (meta?.hasSkinToggle) parts.push('skinOn');
      if (meta?.hasBoneToggle) parts.push('boneIn');
      parts.push('raw');
      return parts.join('_');
    }
    case 'seafood': {
      const meta = (SEAFOOD_CUTS[food.subcategory] || []).find((c) => c.key === food.cut);
      const parts = [food.subcategory, food.cut];
      if (meta?.hasShellToggle) parts.push('shellOff');
      parts.push('raw');
      return parts.join('_');
    }
    case 'egg':
      return [food.subcategory, food.form, 'raw'].join('_');
    case 'red_meat': {
      const meta = (RED_MEAT_CUTS[food.subcategory] || []).find((c) => c.key === food.cut);
      if (meta?.hasFatTierToggle) return [food.subcategory, 'ground', 'regular', 'raw'].join('_');
      if (meta?.hasTrimTierToggle) return [food.subcategory, food.cut, 'trimmed', 'raw'].join('_');
      return [food.subcategory, food.cut, 'raw'].join('_');
    }
    // 30 sprouted-legume rows sit in Vegetables with no `cut` at all --
    // USDA SR Legacy entries like "Beans, kidney, mature seeds, sprouted,
    // cooked". They are reachable by search but not by browsing, and there
    // is no honest picture for them, so they get none rather than a
    // manufactured `vegetable_undefined_raw` that resolves to nothing
    // anyway. Fixing the underlying rows would be the real fix.
    case 'fruit':
      return food.cut ? `fruit_${food.cut}_fresh` : null;
    case 'vegetable':
      return food.cut ? `vegetable_${food.cut}_raw` : null;
    case 'dairy':
      if (food.subcategory === 'milk') return 'milk_whole';
      if (food.subcategory === 'yogurt') return 'dairy_yogurt_plain';
      if (food.subcategory === 'butter') return 'dairy_butter_stick';
      if (food.cheeseType) return `dairy_cheese_${food.cheeseType}`;
      if (food.creamGroup) return `dairy_cream_${food.creamGroup}`;
      return `dairy_${food.id}`;
    default: {
      const cfg = SIMPLE_CATEGORIES[food.category] || ITEM_CARD_CATEGORIES[food.category] || null;
      if (!cfg) return null;
      const cross = (cfg.crossFields || []).find(([fl]) => food[fl] !== undefined);
      const key = food[cfg.itemField] !== undefined ? food[cfg.itemField] : cross ? food[cross[0]] : null;
      const prefix = food[cfg.itemField] !== undefined ? cfg.iconPrefix : cross ? cross[1] : cfg.iconPrefix;
      if (!key) return null;
      // The four older categories put their toggle in the key; the seven
      // from v0.0.43 deliberately do not. See LegumeCard's variantInIconKey.
      const variant = cfg.variantInIconKey ? food[cfg.variantField] : null;
      return `${prefix}_${key}${variant ? `_${variant}` : ''}`;
    }
  }
}

// The same thing, starting from a stored food id instead of a food row.
//
// Logged entries (utils/nutrition.js makeEntryFromFood) and saved
// favourites keep `foodId` and a snapshot of the macros, not the whole row
// -- so both have to look the row back up before they can ask for an icon.
//
// The id index is built once, lazily, rather than on every render: the
// Today tab redraws whenever a total changes, and scanning ~10,000 rows per
// entry per redraw is the kind of thing that is invisible with two entries
// logged and miserable with forty.
let idIndex = null;

export function iconKeyForFoodId(foods, foodId) {
  if (!foodId) return null;
  if (!idIndex) idIndex = new Map(foods.map((f) => [f.id, f]));
  return rowIconKeyOf(idIndex.get(foodId));
}
