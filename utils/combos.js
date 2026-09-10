// Combos (v0.2.0): a named group of things you have already saved, logged
// in one tap.
//
// WHAT A COMBO CONTAINS. References, not food. Each item says only which
// list to look in and which row: { source: 'favorite' | 'custom', refId }.
// Nothing about macros is copied in, so a combo is genuinely a shortcut --
// change a favourite's saved portion and every combo holding it follows.
//
// That is the right behaviour for a shortcut and the wrong one for
// history, which is why the two are separated: logging a combo copies each
// food's name and numbers onto its own entry row, the same way logging one
// food does. Edit the combo tomorrow and yesterday's breakfast is
// unchanged.
//
// WHY IT RESOLVES RATHER THAN STORES. A favourite already carries a saved
// portion and its macros; a custom food already carries its definition.
// Copying either into the combo would create a second source of truth that
// could disagree with the first, and this file has watched that happen
// once already (see utils/customFoods.js on per-100g being derived rather
// than saved).

import { customFoodToFood, customFoodId, isCustomFoodId, CUSTOM_ID_PREFIX } from './customFoods';

// Damon's number. Enforced here, in the UI, and in the table's own check
// constraint -- the publishable key is in a public repo, so the UI is not
// the only way a row gets written.
export const MAX_COMBO_ITEMS = 20;

// What the create page opens with: two empty cards, side by side.
export const INITIAL_COMBO_CARDS = 2;

export const COMBO_ID_PREFIX = 'combo:';
export const comboEntryId = (combo) => COMBO_ID_PREFIX + combo.id;
export const isComboId = (id) => typeof id === 'string' && id.startsWith(COMBO_ID_PREFIX);

// --- The one list you pick from -----------------------------------------
//
// Favourites and your own foods are two different shapes from two
// different tables, and the picker should not care. This flattens both
// into one row shape: an id to store, something to draw, something to
// read, and the food + amount needed to log it.
//
// A favourite's `foodId` is what the score resolves for flagging, so it
// has to survive onto the entry -- which is why `food.id` below is the
// favourite's foodId and not the favourite's own id.
export function pickableFoods(favorites = [], customFoods = []) {
  const fromFavorites = favorites.map((f) => {
    const isWeight = f.servingType === 'weight';
    return {
      key: `favorite:${f.id}`,
      source: 'favorite',
      refId: f.id,
      name: f.name,
      foodId: f.foodId,
      amount: isWeight ? f.grams : 1,
      subtitle: isWeight ? `${f.grams}g · ${Math.round(f.caloriesPer100g * (f.grams / 100))} kcal` : `${f.servingLabel} · ${Math.round(f.calories)} kcal`,
      calories: isWeight ? Math.round(f.caloriesPer100g * (f.grams / 100)) : Math.round(f.calories),
      food: isWeight
        ? {
            id: f.foodId,
            name: f.name,
            servingType: 'weight',
            caloriesPer100g: f.caloriesPer100g,
            proteinPer100g: f.proteinPer100g,
            carbsPer100g: f.carbsPer100g,
            fatPer100g: f.fatPer100g,
          }
        : {
            id: f.foodId,
            name: f.name,
            servingType: 'count',
            calories: f.calories,
            protein: f.protein,
            carbs: f.carbs,
            fat: f.fat,
            servingLabel: f.servingLabel,
          },
    };
  });

  const fromCustom = customFoods.map((row) => {
    const food = customFoodToFood(row);
    const isWeight = food.servingType === 'weight';
    const amount = isWeight ? food.typicalGrams : 1;
    const kcal = isWeight ? Math.round((food.caloriesPer100g * amount) / 100) : Math.round(food.calories);
    return {
      key: `custom:${row.id}`,
      source: 'custom',
      refId: row.id,
      name: row.name,
      foodId: customFoodId(row),
      icon: row.icon,
      amount,
      subtitle: isWeight ? `${Math.round(amount)}g · ${kcal} kcal` : `1 serving · ${kcal} kcal`,
      calories: kcal,
      food,
    };
  });

  return [...fromFavorites, ...fromCustom];
}

// Turn a saved combo's references back into the things they point at.
//
// An item whose food has since been deleted resolves to null and is
// DROPPED rather than guessed at -- the same choice flaggedShare makes for
// an entry it cannot resolve. A combo that loses a member keeps working
// with the members it still has.
export function resolveCombo(combo, favorites = [], customFoods = []) {
  if (!combo) return [];
  const pickable = pickableFoods(favorites, customFoods);
  const byKey = new Map(pickable.map((p) => [p.key, p]));
  return (combo.items || [])
    .map((item) => byKey.get(`${item.source}:${item.refId}`) || null)
    .filter(Boolean);
}

// What a combo's row says under its name.
export function comboSummary(combo, favorites = [], customFoods = []) {
  const parts = resolveCombo(combo, favorites, customFoods);
  const saved = (combo?.items || []).length;
  const kcal = parts.reduce((sum, p) => sum + (p.calories || 0), 0);
  const missing = saved - parts.length;
  const count = `${parts.length} item${parts.length === 1 ? '' : 's'}`;
  // Say so when a member has gone, rather than quietly showing a smaller
  // number than the combo was built with.
  const gone = missing > 0 ? ` · ${missing} no longer saved` : '';
  return `${count} · ${kcal} kcal${gone}`;
}

// Everything the create page has to get right before Done can do anything.
export function validateCombo({ name, items }) {
  if (!String(name || '').trim()) return 'Give this combo a name.';
  const filled = (items || []).filter(Boolean);
  if (filled.length < 2) return 'Pick at least two foods.';
  if (filled.length > MAX_COMBO_ITEMS) return `A combo holds up to ${MAX_COMBO_ITEMS} foods.`;
  return null;
}

export { CUSTOM_ID_PREFIX, isCustomFoodId };
