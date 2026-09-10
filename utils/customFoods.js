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
export function validateCustomFood({ name, unit, amount, calories, protein, carbs, fat }) {
  if (!String(name || '').trim()) return 'Give this food a name.';
  // A serving has no amount to get wrong; only the weight modes do.
  if (isWeightUnit(unit) && !(Number(amount) > 0)) return 'Enter how much this is.';
  const macros = { calories, protein, carbs, fat };
  for (const [k, v] of Object.entries(macros)) {
    if (String(v ?? '').trim() === '') return `Enter the ${k === 'calories' ? 'calories' : k}.`;
    if (!(Number(v) >= 0)) return `${k === 'calories' ? 'Calories' : k} cannot be negative.`;
  }
  return null;
}

export default customFoodToFood;
