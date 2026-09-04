// Pure helper functions — no UI code here at all.
// Keeping the "math" separate from the "screens" makes both easier to
// understand and to test on their own.

// Turns a food from the database + an amount into a logged entry.
//
// "amount" means different things depending on the food:
//   - For servingType 'count' foods (a banana, an egg): amount = number of
//     servings, e.g. 2 means "2 bananas".
//   - For servingType 'weight' foods (chicken, broccoli): amount = grams,
//     e.g. 150 means "150 grams".
export function makeEntryFromFood(food, amount = 1) {
  const round1 = (n) => Math.round(n * 10) / 10;
  const id = `${food.id}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  const loggedAt = new Date().toISOString();

  if (food.servingType === 'weight') {
    const grams = amount;
    const factor = grams / 100;
    return {
      id,
      foodId: food.id,
      name: food.name,
      servingType: 'weight',
      servings: grams,
      servingLabel: `${grams} g`,
      calories: Math.round(food.caloriesPer100g * factor),
      protein: round1(food.proteinPer100g * factor),
      carbs: round1(food.carbsPer100g * factor),
      fat: round1(food.fatPer100g * factor),
      loggedAt,
    };
  }

  const servings = amount;
  return {
    id,
    foodId: food.id,
    name: food.name,
    servingType: 'count',
    servings,
    servingLabel: `${servings} × ${food.servingLabel}`,
    calories: Math.round(food.calories * servings),
    protein: round1(food.protein * servings),
    carbs: round1(food.carbs * servings),
    fat: round1(food.fat * servings),
    loggedAt,
  };
}

// Adds up calories/protein/carbs/fat across a list of entries.
export function sumEntries(entries) {
  const round1 = (n) => Math.round(n * 10) / 10;
  const totals = entries.reduce(
    (acc, e) => {
      acc.calories += e.calories || 0;
      acc.protein += e.protein || 0;
      acc.carbs += e.carbs || 0;
      acc.fat += e.fat || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  return {
    calories: Math.round(totals.calories),
    protein: round1(totals.protein),
    carbs: round1(totals.carbs),
    fat: round1(totals.fat),
  };
}

// Case-insensitive search over the food database.
export function filterFoods(foods, query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return foods;
  return foods.filter((f) => f.name.toLowerCase().includes(q));
}

// Narrows a food list down to one category. Pass 'all' (or nothing) to
// skip filtering and return the list unchanged.
//
// A handful of foods are genuinely both a fruit and a vegetable (Avocado,
// Tomato, Bell/Sweet Peppers, Cucumber, Zucchini, Pumpkin, Eggplant) --
// each keeps ONE primary `category` (whichever tab its underlying data row
// already lived under) but can also carry a `crossListCategories` array
// naming any other category tab it should additionally show up on, so it
// surfaces in both places from a single data row instead of being
// duplicated. See data/foods.js's 'avocado' entry (and its neighbors) for
// where this gets set, and data/foodsFruit.js's header comment for the
// full list.
export function filterByCategory(foods, category) {
  if (!category || category === 'all') return foods;
  return foods.filter(
    (f) => f.category === category || (f.crossListCategories && f.crossListCategories.includes(category))
  );
}


// "2026-07-01" style key for a Date (uses LOCAL time, not UTC).
export function formatDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// A friendlier label for the history screen, e.g. "Today", "Yesterday", or "Jun 28".
export function formatDateLabel(dateKey) {
  const todayKey = formatDateKey(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = formatDateKey(yesterday);

  if (dateKey === todayKey) return 'Today';
  if (dateKey === yesterdayKey) return 'Yesterday';

  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Only keep entries logged "today" (local time).
export function entriesForToday(entries) {
  const todayKey = formatDateKey(new Date());
  return entries.filter((e) => formatDateKey(new Date(e.loggedAt)) === todayKey);
}

// Groups entries by day and returns an array sorted newest-first, each with
// its own totals already computed — ready for the History screen to render.
export function groupEntriesByDate(entries, daysBack = 7) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysBack);

  const groups = {};
  for (const e of entries) {
    const loggedDate = new Date(e.loggedAt);
    if (loggedDate < cutoff) continue;
    const key = formatDateKey(loggedDate);
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  }

  return Object.keys(groups)
    .sort((a, b) => (a < b ? 1 : -1)) // newest first
    .map((key) => ({
      dateKey: key,
      label: formatDateLabel(key),
      entries: groups[key],
      totals: sumEntries(groups[key]),
    }));
}

// Simple 0-100 clamp used to size progress bars against a goal.
export function progressPercent(value, goal) {
  if (!goal || goal <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((value / goal) * 100)));
}
