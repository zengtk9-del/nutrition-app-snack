// Turning a food the user invented into one the rest of the app already
// understands (v0.0.95).
//
// Nothing downstream of this file knows custom foods exist. makeEntryFromFood,
// the cards, the score and the Today list all take a food row of one of two
// shapes, and this hands them one of those shapes.
//
//   weight — carries per-100g figures, so it re-portions. Anything measured
//            in g, ml or oz, because there is something to divide.
//   count  — carries the absolute macros of one serving, logged in whole
//            units. A bowl, a slice, a can. Same shape an egg already has.
//
// WHAT IS STORED VS WHAT IS COMPUTED. The row keeps what the user typed:
// "1 bowl, 520 kcal" or "330 ml, 139 kcal". Per-100 is derived here rather
// than saved, so the edit form can show their own numbers back to them and
// there is only ever one source of truth.

import { ozToGrams } from './units';

// TWO WAYS TO SAY HOW MUCH, and only two (v0.0.97).
//
// v0.0.95 offered fifteen units and let you put a number in front of any
// of them, which produced "What is in 100 servings?" -- a question nobody
// has ever needed to answer. The mistake was treating a serving as a unit
// of measurement. It is not: a cup, a scoop, a bowl, a plate, a bar and a
// packet are all the same statement, "one of these", and the only number
// that ever goes with it is one.
//
// So:
//
//   serving -- no amount. The macros are for one of the thing. What you
//              type is what a label calls a serving.
//   g/ml/oz -- an amount, because a weight can be divided and therefore
//              re-portioned later.
//
// ml is treated as 1g. Wrong for oil and spirits, right for almost
// everything else people drink, and the alternative is asking for a
// density, which nobody has.
export const CUSTOM_UNITS = [
  { key: 'serving', label: 'serving', kind: 'count' },
  { key: 'g', label: 'g', kind: 'weight', grams: 1 },
  { key: 'ml', label: 'ml', kind: 'weight', grams: 1 },
  { key: 'oz', label: 'oz', kind: 'weight', grams: null }, // via ozToGrams
];

// The three that take a number. `serving` never does.
export const WEIGHT_UNITS = CUSTOM_UNITS.filter((u) => u.kind === 'weight');

export const unitMeta = (key) => CUSTOM_UNITS.find((u) => u.key === key) || CUSTOM_UNITS[0];
export const isWeightUnit = (key) => unitMeta(key).kind === 'weight';

// How many grams the typed amount is, for the weight units.
export function amountInGrams(amount, unit) {
  const n = Number(amount) || 0;
  return unit === 'oz' ? ozToGrams(n) : n;
}

// --- How much of anything is possible ------------------------------------
//
// v0.1.1. Until now the four macro boxes were free text with no ceiling, so
// a slipped thumb could define a food at 46,454,848 kcal per 100g and there
// was nothing to stop it. That number then went into the day's total, the
// score and history, and nothing downstream ever questioned it.
//
// The input is a ruler now, so the ceiling is not a rejection message --
// it is the end of the tape. These are the numbers that decide where it
// ends, and they are not arbitrary:
//
//   9 kcal per gram is fat, the most energy-dense thing anyone eats. It is
//   the Atwater factor food labels are legally computed with, and it means
//   NOTHING edible exceeds 900 kcal per 100g. Pure cooking oil, the actual
//   record holder, comes in around 884. So the ceiling for a food defined
//   by weight is its own weight times nine: 900 for 100g, 2,250 for 250g.
//
// The ceiling also guarantees the macro sliders always have a reachable
// answer: at exactly 9 kcal/g the only split that fits in the food's own
// mass is pure fat, and below it there is always room.
export const KCAL_PER_G_FAT = 9;

// A serving carries no weight, so there is no physics to appeal to -- this
// one is judgement. 3,000 kcal is a very large restaurant plate or most of
// a family pizza in one go; past that it is a typo, not a meal.
export const MAX_SERVING_CALORIES = 3000;

// And a bound on the amount itself, because the weight ceiling is derived
// from it: without this, "999999 g" would quietly buy back a nine-million
// calorie tape. 5 kg is a stockpot of chilli.
export const MAX_AMOUNT = 5000;

// The end of the calories tape for the food currently being described.
export function calorieCeiling({ unit, amount }) {
  if (!isWeightUnit(unit)) return MAX_SERVING_CALORIES;
  const grams = Math.min(MAX_AMOUNT, amountInGrams(amount, unit));
  // A floor so the control still renders while the amount box is empty or
  // mid-edit. Saving with no amount is caught by validateCustomFood.
  return Math.max(100, Math.round(grams * KCAL_PER_G_FAT));
}

// --- How an icon is referenced -------------------------------------------
// One string with a prefix, so a vector glyph name and a drawn-artwork key
// can never be mistaken for each other.
//
// These live HERE, not next to the icon set in data/customFoodIcons.js,
// purely to keep the imports acyclic: utils/foodIcon.js needs them, and
// customFoodIcons.js needs foodIcon.js to label the artwork. Putting them
// in the file with no dependencies of its own breaks the loop.
export const GLYPH_PREFIX = 'glyph:';
export const ART_PREFIX = 'art:';
export const glyphRef = (name) => GLYPH_PREFIX + name;
export const artRef = (key) => ART_PREFIX + key;
export const isGlyphRef = (ref) => typeof ref === 'string' && ref.startsWith(GLYPH_PREFIX);
export const isArtRef = (ref) => typeof ref === 'string' && ref.startsWith(ART_PREFIX);
export const refValue = (ref) =>
  isGlyphRef(ref) ? ref.slice(GLYPH_PREFIX.length) : isArtRef(ref) ? ref.slice(ART_PREFIX.length) : null;

// The id every logged entry and favourite will carry for this food.
// Prefixed so it can never collide with a USDA row id, and so anything
// resolving an id can tell at a glance which table to look in.
export const CUSTOM_ID_PREFIX = 'custom:';
export const customFoodId = (row) => CUSTOM_ID_PREFIX + row.id;
export const isCustomFoodId = (id) => typeof id === 'string' && id.startsWith(CUSTOM_ID_PREFIX);

// The whole point of the file.
//
// The category/subcategory pair is not decoration: it is how the score
// decides whether something is junk (utils/score.js's FLAGGED). Marking a
// fast-food custom food as mixed_dish/restaurant makes the existing rule
// count it without the scorer needing to know custom foods exist. Anything
// else gets no category at all, which reads as unflagged.
export function customFoodToFood(row) {
  if (!row) return null;
  // No category, ever (v0.0.97). Damon's call: a food you define yourself
  // does not cost the score its quality points just for existing. The
  // scorer decides what is junk by resolving an entry to a food's
  // category, and with none it reads as unflagged -- which is now the
  // intended answer rather than the gap it was in v0.0.95.
  //
  // The fast_food column stays in the table and is simply not read, so a
  // row created by v0.0.95 with it set does not keep penalising anyone.
  const base = {
    id: customFoodId(row),
    name: row.name,
    icon: row.icon,
    isCustom: true,
    category: null,
    subcategory: null,
  };

  const amount = Number(row.amount) || 0;
  if (row.serving_type === 'weight') {
    const grams = amountInGrams(amount, row.unit) || 1;
    const per100 = (v) => Math.round(((Number(v) || 0) * 100) / grams * 10) / 10;
    return {
      ...base,
      servingType: 'weight',
      caloriesPer100g: Math.round(((Number(row.calories) || 0) * 100) / grams),
      proteinPer100g: per100(row.protein),
      carbsPer100g: per100(row.carbs),
      fatPer100g: per100(row.fat),
      // What the weight box opens on: the amount they defined it with.
      typicalGrams: Math.round(grams),
    };
  }

  // Count. The stored macros are for `amount` units, so one unit is that
  // divided down -- someone who typed "2 slices, 180 kcal" gets 90 a slice.
  const per = (v) => Math.round(((Number(v) || 0) / (amount || 1)) * 10) / 10;
  return {
    ...base,
    servingType: 'count',
    calories: Math.round((Number(row.calories) || 0) / (amount || 1)),
    protein: per(row.protein),
    carbs: per(row.carbs),
    fat: per(row.fat),
    servingLabel: `1 ${unitMeta(row.unit).label}`,
  };
}

// The line under a custom food's name in the list: what it was defined as.
export function customFoodSummary(row) {
  if (!row) return '';
  const u = unitMeta(row.unit);
  const kcal = Math.round(Number(row.calories) || 0);
  if (u.kind !== 'weight') return `1 serving · ${kcal} kcal`;
  return `${Number(row.amount) || 0}${u.label} · ${kcal} kcal`;
}

// Everything the create form has to get right before Save can do anything.
// Returns a message, or null when it is fine.
// Since v0.1.1 the macros come off a ruler and three linked sliders, which
// means most of what this used to guard against is now unreachable through
// the UI -- you cannot type a negative, a blank, or a nine-million into a
// control that has no keyboard and ends where it ends.
//
// It stays, and got stricter, because the UI is not the only way in. The
// Supabase publishable key ships in a public repo, so anything that can
// read this app can POST to custom_foods directly; row-level security
// decides WHOSE row it is, not whether the row makes sense. This function
// is the last thing between a payload and the table, and the honest place
// for the same rules the sliders enforce by shape.
export function validateCustomFood({ name, unit, amount, calories, protein, carbs, fat }) {
  if (!String(name || '').trim()) return 'Give this food a name.';
  // A serving has no amount to get wrong; only the weight modes do.
  if (isWeightUnit(unit)) {
    if (!(Number(amount) > 0)) return 'Enter how much this is.';
    if (Number(amount) > MAX_AMOUNT) return `Keep the amount under ${MAX_AMOUNT.toLocaleString()}${unitMeta(unit).label}.`;
  }
  const macros = { calories, protein, carbs, fat };
  for (const [k, v] of Object.entries(macros)) {
    if (String(v ?? '').trim() === '') return `Enter the ${k === 'calories' ? 'calories' : k}.`;
    if (!(Number(v) >= 0)) return `${k === 'calories' ? 'Calories' : k} cannot be negative.`;
  }

  const ceiling = calorieCeiling({ unit, amount });
  if (Number(calories) > ceiling) {
    return isWeightUnit(unit)
      ? `That is more than ${ceiling.toLocaleString()} kcal, which is what this much pure oil would be — nothing is denser than that.`
      : `Keep a serving under ${ceiling.toLocaleString()} kcal.`;
  }

  // No macro can outweigh the food it is in. This is the one rule the
  // sliders do not fully enforce on their own -- they hold calories
  // constant, and above 400 kcal/100g there are splits that balance the
  // energy while exceeding the mass -- so it is checked here rather than
  // assumed.
  if (isWeightUnit(unit)) {
    const grams = amountInGrams(amount, unit);
    const total = Number(protein) + Number(carbs) + Number(fat);
    if (total > grams * 1.05) {
      return `That is ${Math.round(total)}g of protein, carbs and fat in ${Math.round(grams)}g of food. Move some of it into fat, which carries more calories per gram.`;
    }
  }
  return null;
}

export default customFoodToFood;
