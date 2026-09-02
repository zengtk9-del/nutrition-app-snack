// Every tunable number the goals engine (utils/goals.js) uses, collected in
// one place — see docs/goals-engine-design.md section 9 for where each of
// these came from and why. If a recommendation ever feels off once we're
// testing it against real numbers, this is the file to adjust — the engine
// itself shouldn't need to change.

export const GOALS_CONSTANTS = {
  // Unit conversion — the engine only ever works in metric internally.
  CM_PER_INCH: 2.54,
  KG_PER_LB: 0.453592,

  // Body fat defaults & bounds (used if a body-fat answer is missing, or to
  // clamp an implausible value before it reaches any formula).
  DEFAULT_BF_MALE: 20,
  DEFAULT_BF_FEMALE: 28,
  BF_MIN: 3,
  BF_MAX: 60,

  // TDEE: daily-movement multiplier (gym excluded) + flat training bonus.
  NEAT_MULTIPLIER: { barely: 1.2, little: 1.35, lot: 1.5, super: 1.65 },
  TRAINING_BONUS_KCAL: { cardio: 150, lifting: 120, sports: 200 },

  // Calorie target: base weekly rate (% of bodyweight), adjusted by how far
  // someone's body fat sits from a "reference" level, then clamped to a
  // floor/ceiling.
  KCAL_PER_KG_FAT: 7700,
  RATE_BASE_PERCENT: 0.75,
  RATE_MIN_PERCENT: 0.5,
  RATE_MAX_PERCENT: 1.0,
  REFERENCE_BF_MALE: 20,
  REFERENCE_BF_FEMALE: 28,
  RATE_BF_SLOPE: 0.02,
  SURPLUS_MIN_PERCENT: 10,
  SURPLUS_MAX_PERCENT: 15,
  MIN_CALORIES_FLOOR: { male: 1500, female: 1200 },

  // Protein, in grams per kg of LEAN body mass (not total weight) — see
  // design doc section 4.1 for why LBM instead of total bodyweight.
  PROTEIN_PER_KG_LBM: {
    maintain_untrained: [1.6, 1.6],
    maintain_trained: [1.8, 2.0],
    losing: [2.3, 3.1],
    gaining_with_lifting: [1.8, 2.2],
    gaining_no_lifting: [1.6, 1.8],
  },
  PLANT_PROTEIN_ADJUSTMENT: 1.1, // vegan/vegetarian protein multiplier

  // Fat floor & diet-specific carb rules.
  FAT_MIN_PERCENT: 0.2,

  // Meal-slot split used later by the food-template visualization.
  MEAL_CALORIE_SHARE: { breakfast: 0.25, lunch: 0.35, dinner: 0.3, snack: 0.1 },
};

// One row per diet option from the quiz. `fixedCarbs: true` means carbs are
// set directly from `carbRange` instead of being whatever calories are left
// over after protein and the fat floor — see design doc section 4.3.
export const DIET_PROFILES = {
  balanced: { fixedCarbs: false },
  low_carb: { fixedCarbs: false, carbCeilingG: 130 },
  keto: { fixedCarbs: true, carbRangeG: [20, 50] },
  low_fat: { fixedCarbs: false },
  carnivore: { fixedCarbs: true, carbRangeG: [0, 5] },
  vegan: { fixedCarbs: false },
  vegetarian: { fixedCarbs: false },
  pescatarian: { fixedCarbs: false },
};

// Body-fat picture-range midpoints — see design doc section 2.3. Keys match
// the range labels shown on the picker exactly, so the quiz screen can pass
// through whichever one the user tapped without any translation step.
export const BODY_FAT_MIDPOINTS = {
  male: {
    '3-5': 4,
    '6-10': 8,
    '11-15': 13,
    '16-22': 19,
    '23-29': 26,
    '30-35': 32.5,
    '36-39': 37.5,
    '40+': 43,
  },
  female: {
    '10-13': 11.5,
    '14-18': 16,
    '19-23': 21,
    '24-30': 27,
    '31-36': 33.5,
    '37-42': 39.5,
    '43-46': 44.5,
    '47+': 50,
  },
};
