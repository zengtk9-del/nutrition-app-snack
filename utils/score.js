// The daily score, out of 100.
//
// Pure functions over totals and goals -- nothing here reads state, touches
// the database or knows what a screen is, so every number below can be
// checked against real logged days without rendering anything.
//
// All the tunable numbers live in data/scoreConfig.js. This file is the
// arithmetic that applies them.
//
// TWO THINGS THAT LOOK LIKE BUGS AND AREN'T:
//
//   1. A day with no entries returns `null`, not 0. Nothing logged is not a
//      bad day, it is an absent one, and a system where eating nothing
//      scores 100 -- or where it scores 0 and drags a weekly average down --
//      is broken in a direction a food app cannot afford. Callers render
//      null as an em dash.
//   2. Under-eating scores as badly as over-eating. That is deliberate; see
//      the note on symmetry in data/scoreConfig.js.

import { TARGETS, QUALITY_POINTS, QUALITY_ZERO_AT_SHARE, FLAGGED, XP, LEVEL_BASE, LEVEL_EXPONENT, RANKS } from '../data/scoreConfig';

// One target's contribution. Full marks inside the flat band, linear to zero
// at the outer edge, and clamped either side of that.
export function bandScore(actual, goal, t) {
  if (!goal || goal <= 0) return 0;
  const r = actual / goal;

  if (r >= 1) {
    const flatTo = t.overFlat != null ? t.overFlat : 1 + t.flat;
    const zeroAt = t.overZero != null ? t.overZero : 1 + t.zero;
    if (r <= flatTo) return t.points;
    if (r >= zeroAt) return 0;
    return t.points * ((zeroAt - r) / (zeroAt - flatTo));
  }

  const flatTo = t.underFlat != null ? t.underFlat : 1 - t.flat;
  const zeroAt = t.underZero != null ? t.underZero : 1 - t.zero;
  if (r >= flatTo) return t.points;
  if (r <= zeroAt) return 0;
  return t.points * ((r - zeroAt) / (flatTo - zeroAt));
}

// Which of four states a target is in, for display only -- the score itself
// uses the continuous bands above, not these buckets.
//
//   'under'    still below the goal
//   'met'      at or past it, by an amount worth no comment
//   'over'     past it by enough to mention
//   'wayOver'  past it by enough to say plainly
//
// The point of having three states above the goal instead of one: crossing
// a target is an achievement, and the previous single "over" state coloured
// that the same red as a 300-gram overshoot.
export function targetState(actual, goal, t) {
  if (!goal || goal <= 0) return 'under';
  const r = actual / goal;
  if (r < 1) return 'under';
  const ok = t.okOver != null ? t.okOver : 1 + t.flat;
  const warn = t.warnOver != null ? t.warnOver : 1 + t.zero;
  if (r <= ok) return 'met';
  if (r <= warn) return 'over';
  return 'wayOver';
}

// Is this food one the quality component counts against the day?
export function isFlaggedFood(food) {
  if (!food) return false;
  if (FLAGGED.categories.includes(food.category)) return true;
  const subs = FLAGGED.subcategories[food.category];
  return !!subs && subs.includes(food.subcategory);
}

// Entries carry a food_id but not a category, so flagging means resolving
// each entry back to its food. Built lazily and cached, because History
// scores seven days at a time and scanning ~10,000 foods per entry per
// render would be miserable -- same trick as iconKeyForFoodId.
let foodIndex = null;
let indexedFrom = null;
function indexOf(foods) {
  if (foodIndex && indexedFrom === foods) return foodIndex;
  foodIndex = new Map();
  for (const f of foods) foodIndex.set(f.id, f);
  indexedFrom = foods;
  return foodIndex;
}

// The share of a day's calories that came from flagged foods, 0 to 1.
//
// Share of CALORIES, not a count of items: one chip and a whole burger meal
// are not the same thing, and counting items would say they were. An entry
// whose food can no longer be resolved counts as unflagged rather than
// guessed at.
export function flaggedShare(entries, foods) {
  const index = indexOf(foods);
  let total = 0;
  let flagged = 0;
  for (const e of entries) {
    const kcal = e.calories || 0;
    total += kcal;
    if (isFlaggedFood(index.get(e.foodId))) flagged += kcal;
  }
  return total > 0 ? flagged / total : 0;
}

// The whole score for one day.
//
// Returns null when nothing was logged -- see this file's header. Otherwise
// gives the total plus the per-component breakdown, because the breakdown is
// what makes a score explainable rather than a verdict handed down.
export function scoreDay({ entries, totals, goals, foods }) {
  if (!entries || entries.length === 0) return null;

  const parts = TARGETS.map((t) => ({
    key: t.key,
    label: t.label,
    max: t.points,
    points: bandScore(totals[t.key] || 0, goals[t.key], t),
  }));

  const share = flaggedShare(entries, foods);
  const quality = QUALITY_POINTS * (1 - Math.min(1, share / QUALITY_ZERO_AT_SHARE));
  parts.push({ key: 'quality', label: 'Food quality', max: QUALITY_POINTS, points: quality });

  const total = parts.reduce((sum, p) => sum + p.points, 0);
  return {
    total: Math.round(total),
    parts,
    flaggedShare: share,
  };
}

// The week's number: the average of the days that were actually logged, and
// how many that was.
//
// Unlogged days are NOT counted as zeros. Scoring a forgotten day as zero
// punishes forgetting the app more harshly than eating badly, which teaches
// people to invent entries rather than skip them. Reporting `daysLogged`
// alongside says the honest thing instead -- a 92 from two days should not
// read like a 92 from seven.
export function scoreWeek(days) {
  const scored = days.filter((d) => d.score != null);
  if (scored.length === 0) return { average: null, daysLogged: 0, daysPossible: days.length };
  const sum = scored.reduce((s, d) => s + d.score, 0);
  return {
    average: Math.round(sum / scored.length),
    daysLogged: scored.length,
    daysPossible: days.length,
  };
}

// --- XP -------------------------------------------------------------------

// What one finished day is worth. `streak` is how many days in a row have
// been logged up to and including this one.
export function xpForDay(score, streak = 0) {
  if (score == null) return 0;
  let xp = score;
  if (score >= XP.GREAT_DAY_SCORE) xp += XP.GREAT_DAY_BONUS;
  xp += Math.min(XP.STREAK_BONUS_CAP, streak * XP.STREAK_XP_PER_DAY);
  return Math.round(xp);
}

// Total XP needed to have reached level n.
export function xpForLevel(n) {
  if (n <= 1) return 0;
  return Math.round(LEVEL_BASE * Math.pow(n - 1, LEVEL_EXPONENT));
}

// Level, rank name, and progress toward the next one.
//
// Levels keep counting past the last named rank -- someone at 30,000 XP is
// level 11 and still called Evergreen, rather than being told they've run
// out of app.
export function levelFor(totalXp) {
  const xp = Math.max(0, totalXp || 0);
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level += 1;

  const rank = RANKS[Math.min(level, RANKS.length) - 1];
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  return {
    level,
    name: rank.name,
    form: formForLevel(level),
    xpIntoLevel: xp - floor,
    xpForNext: ceil - floor,
    progress: ceil > floor ? (xp - floor) / (ceil - floor) : 1,
  };
}

// Which mascot form to draw. Only some ranks change him, so this walks back
// to the most recent one that did -- a level 6 user keeps level 4's broccoli.
export function formForLevel(level) {
  let form = RANKS[0].form;
  for (const r of RANKS) {
    if (r.level > level) break;
    if (r.form) form = r.form;
  }
  return form;
}

// Spendable balance. Derived from lifetime XP and what's been spent rather
// than stored on its own, so the two can never drift apart.
export function seedsAvailable(totalXp, seedsSpent = 0) {
  return Math.max(0, Math.floor((totalXp || 0) / XP.XP_PER_SEED) - (seedsSpent || 0));
}
