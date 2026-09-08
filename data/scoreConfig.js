// Every tunable number in the daily score, in one place.
//
// Same reasoning as utils/theme.js: these were chosen by judgement, not
// measurement, and the first thing anyone will want to do after seeing real
// scores against real days is move them. Moving them should be an edit to
// one file, not a hunt through the scoring code.
//
// The full spec, including why each band is shaped the way it is, is the
// "Daily Score & XP" document. What follows is only the numbers.

// --- Part one: targets, 70 of the 100 points ------------------------------
//
// Each component scores full marks inside `flat` and slides linearly to zero
// at `zero`, both expressed as a fraction off the goal. So calories at
// flat 0.05 / zero 0.40 means: anything within 5% of the goal is worth all
// 30 points, 40% out is worth nothing, and 20% out is worth about half.
//
// Bands are SYMMETRIC unless overFlat/overZero say otherwise. That symmetry
// is a safeguard, not an oversight: eating far too little has to cost what
// eating far too much costs, or the shortest path to a perfect score is to
// stop eating.
export const TARGETS = [
  { key: 'calories', label: 'Calories', points: 30, flat: 0.05, zero: 0.4 },
  // Protein is the one asymmetric band. Going over is not treated as a miss
  // until it gets extreme, because protein is what the goals engine is built
  // around (utils/goals.js sets it from lean body mass and lets carbs and fat
  // take what's left). Under-shooting still costs, from 90% down to 40%.
  {
    key: 'protein',
    label: 'Protein',
    points: 20,
    flat: 0.1,
    zero: 0.6,
    overFlat: 1.5,
    overZero: 2.5,
    underFlat: 0.9,
    underZero: 0.4,
  },
  { key: 'carbs', label: 'Carbs', points: 10, flat: 0.2, zero: 0.6 },
  { key: 'fat', label: 'Fat', points: 10, flat: 0.2, zero: 0.6 },
];

// --- Part two: food quality, the remaining 30 -----------------------------
export const QUALITY_POINTS = 30;

// The share of a day's calories from flagged foods at which all 30 points
// are gone. At 0.75, a typical fast-food meal (about a third of a day) costs
// roughly 13 points -- enough to feel, not enough to write the day off.
//
// The cap matters more than the number. A system where one meal zeroes the
// day teaches people to stop logging after the meal, which loses the data
// and the habit at the same time.
export const QUALITY_ZERO_AT_SHARE = 0.75;

// What counts as flagged. Matched on the food's own category/subcategory, so
// this is a structural judgement about where food came from, not a
// nutritional one -- food records carry calories and three macros and
// nothing else, so there is no sodium or added sugar to judge on.
//
// A whole category flags every food in it. `subcategories` narrows to part
// of one, which is how Beverages works: soft drinks and alcohol are flagged,
// coffee, tea, milk drinks and juice are not. Juice is the arguable one --
// it is sugar by any measure, but flagging it also flags orange juice at
// breakfast, which isn't the behaviour this is meant to discourage.
export const FLAGGED = {
  categories: ['sweet', 'snack'],
  subcategories: {
    mixed_dish: ['restaurant'],
    beverage: ['soft_drinks', 'alcohol'],
  },
};

// --- XP -------------------------------------------------------------------
export const XP = {
  // A day earns XP equal to its score, plus these.
  GREAT_DAY_SCORE: 90,
  GREAT_DAY_BONUS: 25,
  STREAK_XP_PER_DAY: 5,
  STREAK_BONUS_CAP: 50,
  // Finishing the mandatory intake quiz. Sized to clear level 2 exactly, so
  // the mascot arrives before the first meal is ever logged.
  QUIZ_GRANT: 150,
  // 1 Seed per 10 XP.
  XP_PER_SEED: 10,
};

// --- Levels ---------------------------------------------------------------
// threshold(n) = LEVEL_BASE * (n-1)^LEVEL_EXPONENT
//
// Cheap at the bottom on purpose: the quiz grant alone clears level 2, and
// level 3 lands about a week in. The first days are when people decide
// whether an app is for them.
export const LEVEL_BASE = 150;
export const LEVEL_EXPONENT = 2.2;

// `form` marks the levels where the mascot changes. Four forms across eight
// ranks, and the flag-holding broccoli already in the app is level 4's.
export const RANKS = [
  { level: 1, name: 'Sprout', form: 'sprout' },
  { level: 2, name: 'Seedling', form: 'baby_broccoli' },
  { level: 3, name: 'Rooted' },
  { level: 4, name: 'Grown', form: 'broccoli' },
  { level: 5, name: 'Hardy' },
  { level: 6, name: 'Flourishing' },
  { level: 7, name: 'Bountiful' },
  { level: 8, name: 'Evergreen', form: 'evergreen' },
];

export default { TARGETS, QUALITY_POINTS, FLAGGED, XP, RANKS };
