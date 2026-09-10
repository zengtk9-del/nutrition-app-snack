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

// The unit list, and the thing that decides which of the two shapes a
// custom food takes. `grams` is how many grams one unit is, for the three
// that have an answer; the countable ones do not have one and do not need
// one, because their macros are already per-serving.
//
// ml is treated as 1g. That is wrong for oil and for spirits and right for
// almost everything else people drink, and the alternative is asking for a
// density, which nobody has.
export const CUSTOM_UNITS = [
  { key: 'g', label: 'g', kind: 'weight', grams: 1 },
  { key: 'ml', label: 'ml', kind: 'weight', grams: 1 },
  { key: 'oz', label: 'oz', kind: 'weight', grams: null }, // via ozToGrams
  { key: 'piece', label: 'piece', kind: 'count' },
  { key: 'slice', label: 'slice', kind: 'count' },
  { key: 'cup', label: 'cup', kind: 'count' },
  { key: 'bowl', label: 'bowl', kind: 'count' },
  { key: 'plate', label: 'plate', kind: 'count' },
  { key: 'glass', label: 'glass', kind: 'count' },
  { key: 'bottle', label: 'bottle', kind: 'count' },
  { key: 'can', label: 'can', kind: 'count' },
  { key: 'scoop', label: 'scoop', kind: 'count' },
  { key: 'bar', label: 'bar', kind: 'count' },
  { key: 'packet', label: 'packet', kind: 'count' },
  { key: 'serving', label: 'serving', kind: 'count' },
];

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
  const base = {
    id: customFoodId(row),
    name: row.name,
    icon: row.icon,
    isCustom: true,
    category: row.fast_food ? 'mixed_dish' : null,
    subcategory: row.fast_food ? 'restaurant' : null,
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
  const amount = Number(row.amount) || 0;
  const unitText = u.kind === 'weight' ? u.label : ` ${u.label}${amount === 1 ? '' : 's'}`;
  return `${amount}${unitText} · ${Math.round(Number(row.calories) || 0)} kcal`;
}

// Everything the create form has to get right before Save can do anything.
// Returns a message, or null when it is fine.
export function validateCustomFood({ name, amount, calories, protein, carbs, fat }) {
  if (!String(name || '').trim()) return 'Give this food a name.';
  if (!(Number(amount) > 0)) return 'Enter how much this is.';
  const macros = { calories, protein, carbs, fat };
  for (const [k, v] of Object.entries(macros)) {
    if (String(v ?? '').trim() === '') return `Enter the ${k === 'calories' ? 'calories' : k}.`;
    if (!(Number(v) >= 0)) return `${k === 'calories' ? 'Calories' : k} cannot be negative.`;
  }
  return null;
}

export default customFoodToFood;
