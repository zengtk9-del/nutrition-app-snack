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
import { CUSTOM_ID_PREFIX, isCustomFoodId, isArtRef, refValue } from './customFoods';
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
  return nearestDrawnKey(rawRowIconKeyOf(food, false));
}

// The picture for one SPECIFIC saved row, variant and all -- what the
// Today tab and My Favorites want. See rawRowIconKeyOf's comment for the
// difference and for the two axes this cannot recover.
export function exactIconKeyOf(food) {
  return nearestDrawnKey(rawRowIconKeyOf(food, true));
}

// `exact` is the difference between "what does this KIND of food look
// like" and "what does THIS ONE look like" (v0.0.89).
//
// Every list on the browse side wants the first: a Cuts list showing
// Ribeye / Sirloin / Brisket should draw them all the same way, not one
// cooked and one raw because of whichever row happened to sort first. So
// the default pins every variant axis to its opening position -- skin on,
// raw, untrimmed -- and that is what `exact: false` still does.
//
// The Today tab and My Favorites want the second, and were getting the
// first: log cooked skinless chicken, come back to a raw skin-on picture.
// Both store the RESOLVED row's id (`entry.foodId`, `favorite.foodId`),
// and in this app every variant is its own row carrying its own fields --
// poultry_chicken_breast_off_cooked has skin: 'off', prep: 'cooked'. The
// information was already there; this branch just stops throwing it away.
//
// TWO AXES IT CANNOT RECOVER, and the reason is the same for both: bone-in
// on Poultry and shell-on on Seafood are not different rows. They are
// weight conversions applied to one row (213g bone-in = 170g of meat), so
// nothing in the stored entry says which was picked, and both stay at
// their default. Recovering those would mean storing the icon key itself
// at log time, which needs a new column on the entries table.
function rawRowIconKeyOf(food, exact) {
  if (!food) return null;
  switch (food.category) {
    case 'poultry': {
      const meta = (POULTRY_CUTS[food.subcategory] || []).find((c) => c.key === food.cut);
      const parts = [food.subcategory, food.cut];
      if (meta?.hasSkinToggle) parts.push(exact && food.skin === 'off' ? 'skinless' : 'skinOn');
      if (meta?.hasBoneToggle) parts.push('boneIn');
      parts.push(exact ? food.prep || 'raw' : 'raw');
      return parts.join('_');
    }
    case 'seafood': {
      const meta = (SEAFOOD_CUTS[food.subcategory] || []).find((c) => c.key === food.cut);
      const parts = [food.subcategory, food.cut];
      if (meta?.hasShellToggle) parts.push('shellOn');
      parts.push(exact ? food.prep || 'raw' : 'raw');
      return parts.join('_');
    }
    case 'egg':
      return [food.subcategory, food.form, exact ? food.prep || 'raw' : 'raw'].join('_');
    case 'red_meat': {
      const meta = (RED_MEAT_CUTS[food.subcategory] || []).find((c) => c.key === food.cut);
      const prep = exact ? food.prep || 'raw' : 'raw';
      if (meta?.hasFatTierToggle) {
        return [food.subcategory, 'ground', (exact && food.fatTier) || 'regular', prep].join('_');
      }
      if (meta?.hasTrimTierToggle) {
        return [food.subcategory, food.cut, (exact && food.trimTier) || 'untrimmed', prep].join('_');
      }
      return [food.subcategory, food.cut, prep].join('_');
    }
    // 30 sprouted-legume rows sit in Vegetables with no `cut` at all --
    // USDA SR Legacy entries like "Beans, kidney, mature seeds, sprouted,
    // cooked". They are reachable by search but not by browsing, and there
    // is no honest picture for them, so they get none rather than a
    // manufactured `vegetable_undefined_raw` that resolves to nothing
    // anyway. Fixing the underlying rows would be the real fix.
    // Fruit's form (fresh / dried / canned / frozen) is its `subcategory`,
    // which is also exactly what FruitCard puts in the key.
    case 'fruit':
      return food.cut ? `fruit_${food.cut}_${(exact && food.subcategory) || 'fresh'}` : null;
    case 'vegetable':
      return food.cut ? `vegetable_${food.cut}_${(exact && food.prep) || 'raw'}` : null;
    case 'dairy':
      if (food.subcategory === 'milk') return `milk_${(exact && food.milkFatLevel) || 'whole'}`;
      if (food.subcategory === 'yogurt') return `dairy_yogurt_${(exact && food.yogurtFlavor) || 'plain'}`;
      if (food.subcategory === 'butter') return `dairy_butter_${(exact && food.butterForm) || 'stick'}`;
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

// `customFoods` is optional and is the raw rows from the custom_foods
// table (v0.0.95). A food the user invented is not in the bundled list, so
// without this every entry logged from one shows the dashed empty box on
// Today and in History. Its stored `icon` is already a reference of the
// right shape -- "glyph:hamburger" or "art:fruit_apple_dried" -- and
// FoodIcon understands both.
export function iconKeyForFoodId(foods, foodId, customFoods) {
  if (!foodId) return null;
  if (isCustomFoodId(foodId)) {
    const row = (customFoods || []).find((c) => CUSTOM_ID_PREFIX + c.id === foodId);
    if (!row) return null;
    // An artwork reference has to lose its prefix to become a key the
    // image map knows; a glyph reference is passed through as-is.
    return isArtRef(row.icon) ? refValue(row.icon) : row.icon;
  }
  if (!idIndex) idIndex = new Map(foods.map((f) => [f.id, f]));
  // Exact, not default: this is the Today tab and My Favorites asking
  // what one already-logged thing looked like, and the row behind that id
  // knows.
  return exactIconKeyOf(idIndex.get(foodId));
}
