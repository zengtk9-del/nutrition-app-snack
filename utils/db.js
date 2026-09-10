// Functions for reading and writing THIS user's data to Supabase.
// Everything here is scoped to a specific user_id, so one person never
// sees or changes another person's rows (the database's Row Level
// Security rules enforce that too, as a second layer of protection).

import { supabase } from './supabaseClient';

const DEFAULT_GOALS = { calories: 2000, protein: 150, carbs: 200, fat: 65 };

// Gets this user's saved goals. If they don't have a row yet (e.g. they
// just created their account), creates one with sensible defaults first.
export async function fetchGoals(userId) {
  const { data, error } = await supabase
    .from('goals')
    .select('calories, protein, carbs, fat, tdee')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (data) return data;

  const { data: created, error: insertError } = await supabase
    .from('goals')
    .insert({ user_id: userId, ...DEFAULT_GOALS })
    .select('calories, protein, carbs, fat, tdee')
    .single();

  if (insertError) throw insertError;
  return created;
}

// Saves (creates or overwrites) this user's goals row. This is the single
// "what the app is tracking against right now" row — Dashboard/History's
// progress bars always read from here. Kept exactly as it was before
// saved goals existed; saveNewGoal/activateSavedGoal below both call this
// too, since switching your active goal (however it got picked) still
// has to land here to actually take effect.
//
// `goals` only ever needs to carry the fields that are actually changing
// — upsert only touches the columns present in the object you pass it, so
// e.g. App.js's handleQuizComplete calls this with just `{ tdee }` right
// after the quiz finishes, and that leaves calories/protein/carbs/fat
// (and vice versa, every other caller here that passes calories/protein/
// carbs/fat but no tdee) exactly as they already were in the database.
export async function saveGoals(userId, goals) {
  const { error } = await supabase
    .from('goals')
    .upsert({ user_id: userId, ...goals, updated_at: new Date().toISOString() });

  if (error) throw error;
}

// --- Diet ---
//
// Which diet the user picked in the intake quiz. Lives on the same `goals`
// row as the numbers, since it is one value per user and the row already
// exists by the time anything needs it.
//
// Read with its own query rather than being added to fetchGoals' select
// list, and deliberately so: the `diet` column arrived in v0.0.69, and if
// this app ever runs against a database where that migration hasn't been
// applied, naming a missing column inside fetchGoals would fail the whole
// call and leave the user with no goals at all. Isolated here, the same
// situation degrades to "no diet stored", which the app already handles by
// falling back to balanced — the Log Food ordering it shipped with.
export async function fetchDiet(userId) {
  const { data, error } = await supabase
    .from('goals')
    .select('diet')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.warn('Could not read diet (has the `diet` column been added?)', error);
    return null;
  }
  return data?.diet || null;
}

// Saves the chosen diet. Unlike the read above this does NOT swallow its
// error: a save that silently did nothing would leave the user looking at
// a diet the app has already forgotten.
export async function saveDiet(userId, diet) {
  await saveGoals(userId, { diet });
}

// Turns a failed diet save into a sentence that says what to actually do
// about it.
//
// Worth the specificity because the overwhelmingly likely cause is
// operational rather than a bug: the `diet` column is new in v0.0.69 and
// the migration has to be run by hand. Two different things produce that
// same symptom and they need different fixes, so they're separated here:
//
//   PGRST204 — PostgREST looked for the column in its cached copy of the
//     schema and didn't find it. Either the migration hasn't been run, OR
//     it has and the cache hasn't caught up yet, which is why the SQL
//     script ends with `notify pgrst, 'reload schema'`.
//   42703 — Postgres itself says the column doesn't exist. The migration
//     definitely hasn't run against this database.
//
// Anything else is reported verbatim rather than guessed at: a wrong
// message that sounds confident is worse than the raw one.
export function describeDietSaveError(err) {
  const code = err?.code;
  if (code === 'PGRST204' || code === '42703') {
    return "Your database doesn't have anywhere to put this yet. Run add-diet-column.sql in the Supabase SQL Editor, then try again.";
  }
  if (code === '42501' || err?.status === 401 || err?.status === 403) {
    return 'The database refused the write. Check that row-level security on the goals table allows this user to update their own row.';
  }
  return err?.message ? `The database said: ${err.message}` : 'Something went wrong reaching the database.';
}

// --- Saved Goals ---
//
// A separate, parallel table from the single `goals` row above: a named
// history of up to 5 goals the user has explicitly chosen to keep (one
// from finishing the quiz, one from "Set My Own Macro Goals", etc.), so
// they can switch back to an old one later without redoing the quiz or
// re-dragging every slider. Saving a new one, or switching back to an
// old one, both ALSO write through to the single `goals` row via
// saveGoals — that's what actually makes it the one the rest of the app
// tracks against; `saved_goals` itself is just the named list.
//
// Requires the `saved_goals` table to exist in Supabase — see the SQL
// script delivered alongside this file. `is_active` marks which ONE
// saved goal (if any) corresponds to what's currently in the `goals`
// row; it's purely informational for the "My Saved Goals" list (e.g. to
// show a badge on the one you're using) and is never read by anything
// that actually affects your tracked numbers — hand-editing the numbers
// directly on the Goals tab, for instance, doesn't update it, so it can
// go a little stale. That's an accepted simplification, not a bug.
const MAX_SAVED_GOALS = 5;

// Gets this user's saved goals, oldest first.
export async function fetchSavedGoals(userId) {
  const { data, error } = await supabase
    .from('saved_goals')
    .select('id, name, calories, protein, carbs, fat, is_active, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Clears whichever saved goal is currently flagged active for this user.
// Shared by saveNewGoal and activateSavedGoal below — both need "at most
// one active at a time," and Supabase doesn't give us a single call that
// atomically swaps "the old one" for "the new one," so this always runs
// as its own step first.
async function clearActiveSavedGoal(userId) {
  const { error } = await supabase
    .from('saved_goals')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('is_active', true);
  if (error) throw error;
}

// Saves a brand new named goal — from finishing the quiz, or from "Set My
// Own Macro Goals" — and, by default, makes it the active one, both here
// and in the single `goals` row. Throws a plain Error with a friendly
// message (rather than a raw Supabase error) once the user's already at
// the 5-goal limit, since the UI shows that message to them directly.
//
// Pass `{ follow: false }` to save it into the list WITHOUT switching what
// the app is currently tracking — used by "Set My Own Macro Goals"'s new
// "Save the goal" button (screens/FollowGoalScreen.js's save-mode
// confirmation, via App.js's handleSaveGoalOnly), as opposed to its "Save
// and follow" button, which leaves `follow` at its default of true. Either
// way it still counts toward the 5-goal cap — the cap is about how many
// you're keeping, not how many you're actively using.
export async function saveNewGoal(userId, { name, calories, protein, carbs, fat }, { follow = true } = {}) {
  const { count, error: countError } = await supabase
    .from('saved_goals')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (countError) throw countError;
  if ((count || 0) >= MAX_SAVED_GOALS) {
    throw new Error(`You already have ${MAX_SAVED_GOALS} saved goals. Delete one before saving a new one.`);
  }

  if (follow) {
    await clearActiveSavedGoal(userId);
  }

  const { data, error } = await supabase
    .from('saved_goals')
    .insert({ user_id: userId, name, calories, protein, carbs, fat, is_active: follow })
    .select('id, name, calories, protein, carbs, fat, is_active, created_at')
    .single();
  if (error) throw error;

  if (follow) {
    await saveGoals(userId, { calories, protein, carbs, fat });
  }

  return data;
}

// Makes an already-saved goal the active one again — flips its is_active
// flag on (and every other saved goal's off) and copies its numbers into
// the single `goals` row, the same way saveNewGoal does for a fresh one.
export async function activateSavedGoal(userId, goal) {
  await clearActiveSavedGoal(userId);

  const { error } = await supabase
    .from('saved_goals')
    .update({ is_active: true })
    .eq('id', goal.id)
    .eq('user_id', userId);
  if (error) throw error;

  await saveGoals(userId, {
    calories: goal.calories,
    protein: goal.protein,
    carbs: goal.carbs,
    fat: goal.fat,
  });
}

// Deletes a saved goal. This never touches the single `goals` row — even
// deleting the one that's currently flagged active leaves today's
// tracked goal exactly as it was; it just won't be found in the saved
// list anymore.
export async function deleteSavedGoal(userId, goalId) {
  const { error } = await supabase.from('saved_goals').delete().eq('id', goalId).eq('user_id', userId);
  if (error) throw error;
}

// --- Favorite Foods ---
//
// As of the My Favorites overhaul, this is no longer a bare list of food
// IDs — it's a list of full SAVED SNAPSHOTS (screens/LogFoodScreen.js).
// Each row is one specific variant someone chose to save: the exact
// resolved nutrition numbers (grade-adjusted, fat-tier-adjusted, whatever
// applies), the exact portion in grams, and a `settings` blob with every
// toggle needed to re-open the same food card later pre-filled the same
// way. This is what fixes the bug where favoriting a customized Beef
// Ribeye Steak (say, Untrimmed/Cooked/Choice Grade/300g) silently saved
// the food's plain defaults instead — and it's what makes multiple saved
// variants of the same food possible (a user can now have several
// favorite_foods rows that all point at the same underlying food, each
// with its own settings/portion; screens/LogFoodScreen.js numbers them
// "Food Name 1", "Food Name 2", ... by save order).
//
// Requires the `favorite_foods` table to exist in Supabase in this new
// shape — see favorite_foods_migration.sql delivered alongside this file.
// That migration DROPS the old bare-id table, so any favorites saved under
// the old system are gone once it's run (the old rows had no snapshot data
// worth preserving anyway — that missing data is exactly the bug this
// fixes).

// Converts a database row into the shape screens/LogFoodScreen.js works
// with — same idea as rowToEntry below, for the same reason (snake_case
// column names in Postgres, camelCase everywhere in the app's JS).
function rowToFavorite(row) {
  return {
    id: row.id,
    foodId: row.food_id,
    name: row.name,
    servingType: row.serving_type,
    caloriesPer100g: row.calories_per_100g,
    proteinPer100g: row.protein_per_100g,
    carbsPer100g: row.carbs_per_100g,
    fatPer100g: row.fat_per_100g,
    grams: row.grams,
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat,
    servingLabel: row.serving_label,
    settings: row.settings || {},
    createdAt: row.created_at,
  };
}

// Gets every favorite this user has saved, oldest-saved-first — the order
// screens/LogFoodScreen.js relies on to number multiple saved variants of
// the same food "1", "2", ... consistently (first one saved is always #1).
export async function fetchFavoriteFoods(userId) {
  const { data, error } = await supabase
    .from('favorite_foods')
    .select(
      'id, food_id, name, serving_type, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, grams, calories, protein, carbs, fat, serving_label, settings, created_at'
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(rowToFavorite);
}

// Saves a BRAND NEW favorite snapshot — never overwrites an existing one,
// which is what lets the same food be saved multiple times with different
// settings (see the header comment above). `favorite` is the plain object
// each card's buildFavoriteData()/WeightFoodRow's/CountFoodCard's
// handleAddToFavorites builds (screens/LogFoodScreen.js) — foodId, name,
// servingType, either the weight fields (caloriesPer100g/.../grams) or the
// count fields (calories/protein/carbs/fat/servingLabel), and settings.
export async function addFavoriteFood(userId, favorite) {
  const { data, error } = await supabase
    .from('favorite_foods')
    .insert({
      user_id: userId,
      food_id: favorite.foodId,
      name: favorite.name,
      serving_type: favorite.servingType,
      calories_per_100g: favorite.caloriesPer100g ?? null,
      protein_per_100g: favorite.proteinPer100g ?? null,
      carbs_per_100g: favorite.carbsPer100g ?? null,
      fat_per_100g: favorite.fatPer100g ?? null,
      grams: favorite.grams ?? null,
      calories: favorite.calories ?? null,
      protein: favorite.protein ?? null,
      carbs: favorite.carbs ?? null,
      fat: favorite.fat ?? null,
      serving_label: favorite.servingLabel ?? null,
      settings: favorite.settings || {},
    })
    .select(
      'id, food_id, name, serving_type, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, grams, calories, protein, carbs, fat, serving_label, settings, created_at'
    )
    .single();
  if (error) throw error;
  return rowToFavorite(data);
}

// Overwrites ONE existing favorite in place — the Edit -> "Save Changes"
// flow inside My Favorites (screens/LogFoodScreen.js's handleSaveFavoriteEdit).
// Unlike addFavoriteFood, this never creates a new numbered variant; it
// updates the exact row being edited, keeping its original save order (and
// therefore its display number) intact.
export async function updateFavoriteFood(favoriteId, favorite) {
  const { data, error } = await supabase
    .from('favorite_foods')
    .update({
      food_id: favorite.foodId,
      name: favorite.name,
      serving_type: favorite.servingType,
      calories_per_100g: favorite.caloriesPer100g ?? null,
      protein_per_100g: favorite.proteinPer100g ?? null,
      carbs_per_100g: favorite.carbsPer100g ?? null,
      fat_per_100g: favorite.fatPer100g ?? null,
      grams: favorite.grams ?? null,
      calories: favorite.calories ?? null,
      protein: favorite.protein ?? null,
      carbs: favorite.carbs ?? null,
      fat: favorite.fat ?? null,
      serving_label: favorite.servingLabel ?? null,
      settings: favorite.settings || {},
    })
    .eq('id', favoriteId)
    .select(
      'id, food_id, name, serving_type, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, grams, calories, protein, carbs, fat, serving_label, settings, created_at'
    )
    .single();
  if (error) throw error;
  return rowToFavorite(data);
}

// Deletes one specific saved favorite by its own row id — not by food id,
// since (unlike the old system) a food can now have several favorite_foods
// rows at once and only one of them should be removed.
export async function removeFavoriteFood(favoriteId) {
  const { error } = await supabase.from('favorite_foods').delete().eq('id', favoriteId);
  if (error) throw error;
}

// Converts a database row into the shape the rest of the app already
// expects (the same shape makeEntryFromFood produces).
function rowToEntry(row) {
  return {
    id: row.id,
    foodId: row.food_id,
    name: row.food_name,
    servings: row.servings,
    servingLabel: row.serving_label,
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat,
    loggedAt: row.logged_at,
    // v0.2.0. Null for anything logged on its own, which is almost
    // everything; set for the entries that came from one tap on a combo.
    comboGroup: row.combo_group ?? null,
    comboName: row.combo_name ?? null,
  };
}

// Gets every food entry this user has ever logged, most recent first.
export async function fetchEntries(userId) {
  const { data, error } = await supabase
    .from('entries')
    .select('id, food_id, food_name, servings, serving_label, calories, protein, carbs, fat, logged_at, combo_group, combo_name')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(rowToEntry);
}

// Adds one logged entry to the database and returns it back (with the
// real database-assigned id filled in) so the app can show it right away.
export async function insertEntry(userId, entry) {
  const { data, error } = await supabase
    .from('entries')
    .insert({
      user_id: userId,
      food_id: entry.foodId ?? null,
      food_name: entry.name,
      servings: entry.servings,
      serving_label: entry.servingLabel ?? null,
      calories: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fat: entry.fat,
      logged_at: entry.loggedAt,
    })
    .select('id, food_id, food_name, servings, serving_label, calories, protein, carbs, fat, logged_at, combo_group, combo_name')
    .single();

  if (error) throw error;
  return rowToEntry(data);
}

// Deletes one logged entry by its id.
export async function deleteEntry(entryId) {
  const { error } = await supabase.from('entries').delete().eq('id', entryId);
  if (error) throw error;
}

// --- My Own Food (v0.0.95) ------------------------------------------------
//
// Foods the user defined themselves, in their own table (see
// add-custom-foods-table.sql). A row keeps what they typed -- one amount
// and the four macros FOR that amount -- and utils/customFoods.js turns it
// into the weight-or-count shape the rest of the app runs on.
//
// Column names are snake_case here and camelCase everywhere else, same
// split as every other table in this file.

const CUSTOM_FOOD_COLUMNS =
  'id, name, icon, serving_type, unit, amount, calories, protein, carbs, fat, fast_food, created_at';

// Undeleted only. Deleting is soft (see removeCustomFood) so that entries
// logged from a food the user later threw away can still find its picture.
// NEWEST FIRST (v0.1.0), unlike favorites and saved goals just above,
// which are deliberately oldest-first because their display numbers
// ("Beef Ribeye Steak 1", "2") have to stay put as more are added.
//
// Nothing numbers these, and the one you just made is the one you want:
// Damon's rule is that saving a new food puts it at the top of My Own
// Food. That order is set here rather than sorted at the point of
// display, so there is one answer to "what order are these in" -- and
// App.js's optimistic insert prepends to match.
export async function fetchCustomFoods(userId) {
  const { data, error } = await supabase
    .from('custom_foods')
    .select(CUSTOM_FOOD_COLUMNS)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

const customFoodPayload = (food) => ({
  name: String(food.name).trim(),
  icon: food.icon,
  serving_type: food.servingType,
  unit: food.unit,
  amount: Number(food.amount),
  calories: Number(food.calories),
  protein: Number(food.protein),
  carbs: Number(food.carbs),
  fat: Number(food.fat),
  // Always false since v0.0.97 -- nothing in the app sets it, and writing
  // it explicitly clears any row created by v0.0.95 with it true.
  fast_food: false,
});

export async function addCustomFood(userId, food) {
  const { data, error } = await supabase
    .from('custom_foods')
    .insert({ user_id: userId, ...customFoodPayload(food) })
    .select(CUSTOM_FOOD_COLUMNS)
    .single();
  if (error) throw error;
  return data;
}

// Edits the definition in place. Deliberately does NOT touch anything
// already logged: insertEntry copies the name and macros onto each entry,
// so history stays a record of what was eaten rather than a view over
// whatever the food happens to say today.
export async function updateCustomFood(id, food) {
  const { data, error } = await supabase
    .from('custom_foods')
    .update({ ...customFoodPayload(food), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(CUSTOM_FOOD_COLUMNS)
    .single();
  if (error) throw error;
  return data;
}

// Soft. A hard delete would orphan every entry ever logged from this food
// -- their name and macros live on the entry, but the picture is looked up
// through here.
export async function removeCustomFood(id) {
  const { error } = await supabase
    .from('custom_foods')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

// --- Combos (v0.2.0) -----------------------------------------------------
//
// A named group of up to twenty saved foods, logged in one tap. The row
// stores REFERENCES only -- which favourite, which custom food -- so a
// combo follows its members when they change. See utils/combos.js and
// add-combos-table.sql for why that is right for a shortcut and wrong for
// history, and how the two are kept apart.

const COMBO_COLUMNS = 'id, name, items, created_at';

export async function fetchCombos(userId) {
  const { data, error } = await supabase
    .from('combos')
    .select(COMBO_COLUMNS)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({ ...row, items: row.items || [] }));
}

const comboPayload = (combo) => ({
  name: String(combo.name).trim(),
  items: (combo.items || []).slice(0, 20),
});

export async function addCombo(userId, combo) {
  const { data, error } = await supabase
    .from('combos')
    .insert({ user_id: userId, ...comboPayload(combo) })
    .select(COMBO_COLUMNS)
    .single();
  if (error) throw error;
  return { ...data, items: data.items || [] };
}

export async function updateCombo(id, combo) {
  const { data, error } = await supabase
    .from('combos')
    .update({ ...comboPayload(combo), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(COMBO_COLUMNS)
    .single();
  if (error) throw error;
  return { ...data, items: data.items || [] };
}

// Soft, same as custom_foods: entries logged from this combo carry their
// own copies of everything, but a grouped Today row reads its name from
// the entry rather than from here, so nothing breaks either way.
export async function removeCombo(id) {
  const { error } = await supabase
    .from('combos')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

// Logging a combo: one insert, many rows.
//
// Each food becomes a real entry with its own name, macros and food_id --
// the score resolves food_id back to a category to decide what is junk
// (utils/score.js), and a single merged row would have no food behind it
// and would therefore score as clean eating whatever was inside it.
//
// What makes Damon's single line on Today possible is `combo_group`: the
// entries from ONE tap share one, and the Today list collapses a shared
// group into one row. Per log, not per combo, so the same combo logged
// twice in a day is two rows rather than one doubled one.
export async function insertComboEntries(userId, entries, { comboGroup, comboName }) {
  const { data, error } = await supabase
    .from('entries')
    .insert(
      entries.map((entry) => ({
        user_id: userId,
        food_id: entry.foodId ?? null,
        food_name: entry.name,
        servings: entry.servings,
        serving_label: entry.servingLabel ?? null,
        calories: entry.calories,
        protein: entry.protein,
        carbs: entry.carbs,
        fat: entry.fat,
        logged_at: entry.loggedAt,
        combo_group: comboGroup,
        combo_name: comboName,
      }))
    )
    .select('id, food_id, food_name, servings, serving_label, calories, protein, carbs, fat, logged_at, combo_group, combo_name');
  if (error) throw error;
  return (data || []).map(rowToEntry);
}

// Removing a combo's row on Today removes every entry that came from that
// one tap, which is what a single row implies.
export async function deleteEntriesByComboGroup(comboGroup) {
  const { error } = await supabase.from('entries').delete().eq('combo_group', comboGroup);
  if (error) throw error;
}
