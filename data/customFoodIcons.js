// Picking a picture for a food you made up (v0.0.95).
//
// Two sources, one picker.
//
// TWELVE VECTOR GLYPHS, below. Flat single-colour category marks --
// takeaway box, coffee cup, shaker -- for the things people invent a food
// for: a restaurant meal, last night's leftovers, the back of a packet.
// They come from @expo/vector-icons, which is already a dependency, so
// this set costs no new artwork, no push to the icon repo, no jsDelivr
// purge and no ART_READY flag. Looking unlike the drawn food art is the
// point: these are category marks, not portraits.
//
// AND ALL 1,737 DRAWN FOOD ICONS, searchable. Damon's model is iOS emoji
// search: type "vegetable" and get every vegetable, type "zucchini" and
// get zucchini. That works here because an icon can be labelled from the
// food rows that use it -- 1,517 of the 1,737 -- and the rest get a label
// built from their own key.
//
// TWO THINGS THAT MAKE THE SEARCH WORK, both found by prototyping it
// against the real data rather than assuming:
//
//   1. Match on word STARTS, not substrings. Otherwise "apple" returns
//      pineapple, and "dried apple" returns dried pineapple.
//   2. Synonyms, because these are USDA's words and not a person's. The
//      word "drink" appears nowhere in the data; the category is
//      Beverages. Neither does veggie, candy, soda or takeaway. This is
//      the same job CLDR's keyword lists do for emoji.
//
// And one trap: a synonym must point at a CATEGORY OR SUBCATEGORY KEY,
// never at a word. Mapping candy to the word "sweet" pulled in sweet
// potato, sweetened cereal and sweet cherries -- 153 hits, mostly wrong.
// Pointed at the sweet category it gives the right 120.

import { FOOD_ICON_IMAGES } from './foodIconImages';
import foods, { CATEGORIES } from './foods';
import { rowIconKeyOf, exactIconKeyOf } from '../utils/foodIcon';

// --- The twelve ----------------------------------------------------------
// `flagged` is what keeps the score honest for food invented here: see
// utils/score.js. It is a hint, not the answer -- the create form has its
// own switch, because someone logging a Nando's may well pick the chicken
// artwork instead of any of these.
export const CUSTOM_GLYPHS = [
  { key: 'silverware-fork-knife', label: 'Meal' },
  { key: 'food-takeout-box', label: 'Takeaway', flagged: true },
  { key: 'hamburger', label: 'Fast food', flagged: true },
  { key: 'pizza', label: 'Pizza', flagged: true },
  { key: 'pot-steam', label: 'Home-cooked' },
  { key: 'bowl-mix', label: 'Bowl' },
  { key: 'bread-slice', label: 'Bread' },
  { key: 'coffee', label: 'Hot drink' },
  { key: 'cup', label: 'Cold drink' },
  { key: 'glass-cocktail', label: 'Alcohol' },
  { key: 'shaker-outline', label: 'Shake' },
  { key: 'candy', label: 'Sweets', flagged: true },
];

// How an icon is referenced. Defined in utils/customFoods.js and
// re-exported here so the picker has one import -- see the note there for
// why they cannot live in this file.
export {
  GLYPH_PREFIX, ART_PREFIX, glyphRef, artRef, isGlyphRef, isArtRef, refValue,
} from '../utils/customFoods';

// --- Synonyms ------------------------------------------------------------
// Typed word -> category and subcategory KEYS in the food data. Deliberately
// small; this is the only hand-authored content in the feature.
const SYNONYMS = {
  drink: ['beverage'], drinks: ['beverage'], beverage: ['beverage'],
  soda: ['soft_drinks'], pop: ['soft_drinks'], cola: ['soft_drinks'], fizzy: ['soft_drinks'],
  booze: ['alcohol'], liquor: ['alcohol'], wine: ['alcohol'], spirits: ['alcohol'],
  veg: ['vegetable'], veggie: ['vegetable'], veggies: ['vegetable'], greens: ['vegetable'],
  candy: ['sweet'], sweets: ['sweet'], dessert: ['sweet'], pudding: ['sweet'],
  crisps: ['snack'], chips: ['snack'],
  takeaway: ['restaurant'], takeout: ['restaurant'], fastfood: ['restaurant'], burger: ['restaurant'],
  nuts: ['nut_seed'], seeds: ['nut_seed'],
  grains: ['grain'], cereal: ['grain'], carbs: ['grain'],
  meat: ['red_meat'], poultry: ['poultry'], bird: ['poultry'],
  fish: ['seafood'], shellfish: ['seafood'],
  milk: ['dairy'], cheese: ['dairy'], yoghurt: ['dairy'], yogurt: ['dairy'],
  supplement: ['meat_substitute'], protein: ['meat_substitute'],
  baby: ['baby_food'], sauce: ['condiment_sauce'], condiment: ['condiment_sauce'],
  meal: ['mixed_dish'], dish: ['mixed_dish'], leftovers: ['mixed_dish'],
  oil: ['fat_oil'], butter: ['fat_oil'],
  beans: ['legume'], pulses: ['legume'],
  egg: ['egg'], eggs: ['egg'],
};

// --- The index -----------------------------------------------------------
// Built once, on first search. 1,737 records is cheap, but not on the
// first frame of a screen that has not been opened yet.
let index = null;

// A tile has room for about two words, and the stored names are USDA's:
// "Squash, summer, green, zucchini, includes skin, raw". The FULL name is
// what gets searched -- you need "zucchini" to find that one -- but the
// first comma-segment is what gets shown.
const shortLabel = (name) => {
  const head = String(name).split(',')[0].trim();
  return head.length > 24 ? head.slice(0, 23).trimEnd() + '…' : head;
};

// For the 220 icons no food row names -- the boneless and shell-off
// variants, which have artwork but no row of their own because those are
// weight conversions rather than separate foods (see utils/units.js).
const labelFromKey = (key) =>
  key
    .split('_')
    .map((w) => w.replace(/([a-z])([A-Z])/g, '$1 $2'))
    .join(' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

function buildIndex() {
  const catLabel = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.label]));
  const byKey = new Map();

  const add = (key, food) => {
    if (!key || !FOOD_ICON_IMAGES[key] || byKey.has(key)) return;
    const name = food ? food.name : labelFromKey(key);
    byKey.set(key, {
      key,
      label: shortLabel(name),
      // Kept as their own fields, not folded into `words`. A synonym is
      // matched against THESE exactly -- see the note at the top about
      // candy pulling in sweet potato. Prefix-matching "sweet" against a
      // word list hits sweetened peaches and sweet potatoes; comparing it
      // to a category key cannot.
      cat: food ? food.category : null,
      sub: food ? food.subcategory : null,
      // Everything a person might reasonably type, lower-cased and split
      // into words: the food's own name, its category's display label,
      // its category/subcategory/cut/prep/variety KEYS (which is what the
      // synonyms above resolve to), and the words in the icon key.
      words: [
        name,
        food ? catLabel[food.category] || '' : '',
        food ? [food.category, food.subcategory, food.cut, food.prep, food.variety].filter(Boolean).join(' ') : '',
        key.replace(/_/g, ' '),
      ]
        .join(' ')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .split(' ')
        .filter(Boolean),
    });
  };

  // Exact keys first so a variant is named by its own row rather than by
  // whichever row happens to share its default key.
  for (const f of foods) add(exactIconKeyOf(f), f);
  for (const f of foods) add(rowIconKeyOf(f), f);
  // Anything still unnamed gets a label from its key.
  for (const key of Object.keys(FOOD_ICON_IMAGES)) add(key, null);

  return [...byKey.values()];
}

export function allFoodIcons() {
  if (!index) index = buildIndex();
  return index;
}

// Every term must match, so more words narrows. A term matches if it, or
// any of its synonyms, starts a word in the record.
export function searchFoodIcons(query, limit = 120) {
  const terms = String(query || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean);
  if (!terms.length) return [];
  const list = allFoodIcons();
  const out = [];
  for (const rec of list) {
    let all = true;
    for (const term of terms) {
      // Two ways a term can match, and they are deliberately different
      // kinds of match. The word the user typed matches loosely, by word
      // start, so "choc" finds chocolate. A synonym matches EXACTLY, and
      // only against the category and subcategory -- loose synonyms are
      // what turned candy into 153 hits of sweetened fruit.
      const typed = rec.words.some((w) => w.startsWith(term));
      const viaSynonym =
        !typed &&
        (SYNONYMS[term] || []).some((a) => rec.cat === a || rec.sub === a);
      if (!typed && !viaSynonym) {
        all = false;
        break;
      }
    }
    if (all) {
      out.push(rec);
      if (out.length >= limit) break;
    }
  }
  return out;
}

export default CUSTOM_GLYPHS;
