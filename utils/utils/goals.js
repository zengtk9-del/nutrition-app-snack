// The personalized-goals calculation engine. Turns a user's quiz answers
// into BMR, TDEE, a daily calorie target, macro targets, and a timeline
// estimate — no UI code here at all, same rule as utils/nutrition.js.
//
// Full reasoning for every formula and constant lives in
// docs/goals-engine-design.md — this file is the implementation of that
// design, kept as close to the pseudocode there as possible so the two stay
// easy to compare.
//
// NOTE: this file assumes it's given an already-built `profile` object (see
// the Profile shape in the design doc, section 2.2) — converting raw quiz
// answers (slider values, picker taps) into that shape happens in the quiz
// screens themselves, once those exist, since that conversion is tied to
// exactly how each screen collects its answer.

import { GOALS_CONSTANTS, DIET_PROFILES, BODY_FAT_MIDPOINTS } from '../data/goalsConstants.js';

const C = GOALS_CONSTANTS;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function average(range) {
  return (range[0] + range[1]) / 2;
}

// --- Unit conversion (design doc 2.1) — the only place these run. ---

export function feetInchesToCm(feet, inches) {
  return (feet * 12 + inches) * C.CM_PER_INCH;
}

export function lbToKg(lb) {
  return lb * C.KG_PER_LB;
}

export function kgToLb(kg) {
  return kg / C.KG_PER_LB;
}

// Rounds a kg value and formats it in whichever unit the quiz is currently
// using, e.g. formatWeightForUnit(81.6, 'lb') -> "180 lbs".
export function formatWeightForUnit(kg, unit) {
  if (unit === 'lb') {
    return `${Math.round(kgToLb(kg))} lbs`;
  }
  return `${Math.round(kg)} kg`;
}

// Same idea as formatWeightForUnit, but for a low–high span with the unit
// suffix shown once at the end (e.g. "56–76 kg") instead of once per number
// — used by the weight-history scale's "always been between" option
// (data/quizQuestions.js, QuizScreen.js).
export function formatWeightRangeForUnit(lowKg, highKg, unit) {
  if (unit === 'lb') {
    return `${Math.round(kgToLb(lowKg))}–${Math.round(kgToLb(highKg))} lbs`;
  }
  return `${Math.round(lowKg)}–${Math.round(highKg)} kg`;
}

// Standard clinical BMI cutoffs (underweight < 18.5, overweight >= 25),
// converted into an actual weight for this person's height so the "Have
// you ever been underweight/overweight?" question can be phrased in terms
// of a number the user recognizes as their own weight, rather than an
// abstract BMI figure. Same cutoffs for both sexes — that's how BMI itself
// is defined; the app isn't inventing a sex-adjusted version of it.
export function weightHistoryThresholds(heightCm) {
  const heightM = heightCm / 100;
  return {
    underweightKg: 18.5 * heightM * heightM,
    overweightKg: 25 * heightM * heightM,
  };
}

// The quiz's "weight" step starts its slider here instead of at a flat,
// one-size-fits-all number — the midpoint of this same height's own
// healthy BMI range (weightHistoryThresholds, right above), rounded to a
// whole kg. Deliberately reuses that exact range rather than a separate
// formula (e.g. a sex-differentiated ideal-weight formula), so the
// slider's starting point and the weight-history step's "healthy range"
// always describe the same span — and, per that same function's own
// comment, is intentionally sex-neutral for the same reason BMI itself is:
// this is a starting point for a slider the user immediately adjusts
// anyway, not a diagnosis.
export function defaultWeightForHeight(heightCm) {
  const { underweightKg, overweightKg } = weightHistoryThresholds(heightCm);
  return Math.round((underweightKg + overweightKg) / 2);
}

// --- Body fat picker -> a number (design doc 2.3) ---

// `rangeKey` is one of the literal range labels shown on the picker, e.g.
// '16-22' for men or '24-30' for women — see BODY_FAT_MIDPOINTS.
export function bodyFatMidpoint(sex, rangeKey) {
  const table = sex === 'male' ? BODY_FAT_MIDPOINTS.male : BODY_FAT_MIDPOINTS.female;
  const value = table[rangeKey];
  if (value == null) {
    // Missing/unrecognized answer — fall back to a population-average
    // default rather than letting the rest of the pipeline choke on it.
    return sex === 'male' ? C.DEFAULT_BF_MALE : C.DEFAULT_BF_FEMALE;
  }
  return value;
}

// --- Lean body mass (design doc 3.2) ---

export function computeLBM(profile) {
  const bf = clamp(profile.bodyFatPercent, C.BF_MIN, C.BF_MAX);
  return profile.weightKg * (1 - bf / 100);
}

// --- BMR: Mifflin-St Jeor for everyone (design doc 3.1) ---

export function computeBMR(profile) {
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age;
  return profile.sex === 'male' ? base + 5 : base - 161;
}

// --- TDEE: BMR x NEAT multiplier, plus a flat per-modality training bonus
// added on top (design doc 3.3 — kept separate because the quiz asks daily
// activity and training as two independent questions). ---

export function computeTDEE(profile, bmr) {
  const neatMultiplier = C.NEAT_MULTIPLIER[profile.activityLevel] ?? C.NEAT_MULTIPLIER.little;
  const trainingBonus = (profile.training || []).reduce(
    (sum, modality) => sum + (C.TRAINING_BONUS_KCAL[modality] || 0),
    0
  );
  return bmr * neatMultiplier + trainingBonus;
}

// --- Calorie target: deficit/surplus sized off body fat, with hard safety
// floors (design doc 3.4). Returns { calories, delta, capped } where
// `capped` explains itself when a safety rule kicked in, and is null
// otherwise. `delta` is always a positive number of kcal/day away from TDEE
// — the caller already knows the direction from profile.goal. ---

export function computeCalorieTarget(profile, bmr, tdee) {
  if (profile.age < 18) {
    // Never compute a deficit for a minor — see design doc, Edge Cases.
    return { calories: Math.round(tdee), delta: 0, capped: 'minor' };
  }

  if (profile.weightHistory === 'underweight' && profile.goal === 'lose') {
    // Don't guess at a deficit here — this needs a professional, not a formula.
    return { calories: null, delta: null, capped: 'needs_professional_guidance' };
  }

  if (profile.goal === 'maintain') {
    return { calories: Math.round(tdee), delta: 0, capped: null };
  }

  const referenceBF = profile.sex === 'male' ? C.REFERENCE_BF_MALE : C.REFERENCE_BF_FEMALE;
  const ratePercent = clamp(
    C.RATE_BASE_PERCENT - C.RATE_BF_SLOPE * (referenceBF - profile.bodyFatPercent),
    C.RATE_MIN_PERCENT,
    C.RATE_MAX_PERCENT
  );
  const weeklyDeltaKg = (ratePercent / 100) * profile.weightKg;
  let dailyDelta = (weeklyDeltaKg * C.KCAL_PER_KG_FAT) / 7;

  let calories = profile.goal === 'lose' ? tdee - dailyDelta : tdee + dailyDelta;
  let capped = null;

  if (profile.goal === 'lose') {
    const floor = Math.max(bmr, C.MIN_CALORIES_FLOOR[profile.sex]);
    if (calories < floor) {
      calories = floor;
      dailyDelta = tdee - calories;
      capped = 'safety_floor';
    }
  }

  return { calories: Math.round(calories), delta: Math.round(dailyDelta), capped };
}

// --- Macros: protein from LBM, then carbs/fat split per diet (design doc
// 4.1-4.3). ---

function pickProteinSituation(goal, training) {
  const isTraining = (training || []).length > 0;
  const isLifting = (training || []).includes('lifting');

  if (goal === 'lose') return 'losing';
  if (goal === 'gain') return isLifting ? 'gaining_with_lifting' : 'gaining_no_lifting';
  return isTraining ? 'maintain_trained' : 'maintain_untrained';
}

export function computeMacros(profile, calorieTarget, lbm) {
  const situation = pickProteinSituation(profile.goal, profile.training);
  let proteinPerKg = average(C.PROTEIN_PER_KG_LBM[situation]);
  if (profile.diet === 'vegan' || profile.diet === 'vegetarian') {
    proteinPerKg *= C.PLANT_PROTEIN_ADJUSTMENT;
  }
  const proteinG = Math.round(proteinPerKg * lbm);

  const dietProfile = DIET_PROFILES[profile.diet] || DIET_PROFILES.balanced;
  const calories = calorieTarget.calories;

  let carbsG;
  let fatG;

  if (dietProfile.fixedCarbs) {
    carbsG = average(dietProfile.carbRangeG);
    fatG = (calories - proteinG * 4 - carbsG * 4) / 9;
  } else {
    const fatFloorG = (calories * C.FAT_MIN_PERCENT) / 9;
    const remainingKcal = calories - proteinG * 4 - fatFloorG * 9;
    carbsG = Math.max(remainingKcal / 4, 0);
    if (dietProfile.carbCeilingG && carbsG > dietProfile.carbCeilingG) {
      carbsG = dietProfile.carbCeilingG;
    }
    fatG = (calories - proteinG * 4 - carbsG * 4) / 9;
  }

  return {
    proteinG,
    carbsG: Math.round(carbsG),
    fatG: Math.round(fatG),
  };
}

// --- Timeline: a straight-line estimate from today's numbers, meant to be
// recomputed every time the user logs a new weight rather than trusted as a
// long-range prediction (design doc 3.5). Returns null for "maintain" or
// when computeCalorieTarget declined to set a delta (minor / needs
// professional guidance). ---

export function computeTimeline(profile, calorieTarget) {
  if (profile.goal === 'maintain' || !calorieTarget.delta || profile.goalWeightKg == null) {
    return null;
  }
  const weeklyRateKg = (calorieTarget.delta * 7) / C.KCAL_PER_KG_FAT;
  const weeksToGoal = Math.abs(profile.goalWeightKg - profile.weightKg) / weeklyRateKg;
  return {
    weeklyRateKg: Math.round(weeklyRateKg * 100) / 100,
    weeksToGoal: Math.ceil(weeksToGoal),
  };
}

// --- Manual macro-goals editor math (GoalsScreen's "Set My Own Macro
// Goals" flow) — pure functions, independent of the quiz/report engine
// above, so the editor screen can call these on every slider drag without
// any of this depending on a full quiz `profile`. Calories are the only
// thing every macro can be measured in consistently (protein/carbs/fat
// each have a different kcal-per-gram), so all the redistribution math
// below works in kcal internally and only converts to grams at the very
// end. ---

export const MACRO_KCAL_PER_G = { protein: 4, carbs: 4, fat: 9 };

function macroKcal({ proteinG, carbsG, fatG }) {
  return { protein: proteinG * 4, carbs: carbsG * 4, fat: fatG * 9 };
}

// kcal-per-macro -> whole, non-negative grams — the one place every
// function below converts back out of kcal, so they all round/clamp the
// same way.
function kcalToGrams(kcal) {
  return {
    proteinG: Math.max(0, Math.round(kcal.protein / MACRO_KCAL_PER_G.protein)),
    carbsG: Math.max(0, Math.round(kcal.carbs / MACRO_KCAL_PER_G.carbs)),
    fatG: Math.max(0, Math.round(kcal.fat / MACRO_KCAL_PER_G.fat)),
  };
}

// After rounding kcal amounts to whole grams, the total can drift a couple
// of kcal away from the intended target — protein/carbs round to the
// nearest 4kcal and fat to the nearest 9kcal, each independently, so three
// separate roundings can combine into a small miss. This nudges ONE macro
// (never one of `protectedKeys` — e.g. never the macro whose slider was
// just dragged, and never a locked macro, since those two must land on
// exactly the value they were set to) by the smallest whole-gram amount
// that cancels the drift, so the total lands on the target exactly, or —
// when the residual isn't a clean multiple of that macro's own
// kcal-per-gram — as close as an integer number of grams can get (at most
// 2kcal off for protein/carbs, ~4.5kcal for fat). Without this, repeatedly
// redistributing from an already-rounded state (which is exactly what
// happens many times over during one continuous slider drag — see
// MacroGoalsScreen's drag-baseline handling) could let rounding error
// compound into a visibly wrong "Calories" number even though nothing
// ever touched the Calories slider itself.
function nudgeForExactTotal(grams, targetCalories, protectedKeys) {
  const totalKcal =
    grams.proteinG * MACRO_KCAL_PER_G.protein +
    grams.carbsG * MACRO_KCAL_PER_G.carbs +
    grams.fatG * MACRO_KCAL_PER_G.fat;
  const residual = Math.round(targetCalories) - totalKcal;
  if (residual === 0) return grams;
  // carbs/protein share the same 4kcal/g granularity (the finest of the
  // three), so preferring them over fat (9kcal/g) gets closer to an exact
  // match whenever there's a choice of which macro to nudge.
  const order = ['carbs', 'protein', 'fat'];
  const key = order.find((k) => !protectedKeys.includes(k));
  if (!key) return grams;
  const gramsKey = `${key}G`;
  const deltaGrams = Math.round(residual / MACRO_KCAL_PER_G[key]);
  if (deltaGrams === 0) return grams;
  return { ...grams, [gramsKey]: Math.max(0, grams[gramsKey] + deltaGrams) };
}

// A generic 30% protein / 40% carbs / 30% fat split of a calorie total —
// only used as a fallback when there's no existing distribution to scale
// (all three macros at 0g), so a divide-by-zero can't silently produce
// NaN grams. Deliberately a fixed, self-consistent split (unlike this
// app's legacy DEFAULT_GOALS seed values in App.js, whose macros don't
// quite add back up to its own calories field) rather than reusing those.
function balancedSplit(calories) {
  return kcalToGrams({
    protein: calories * 0.3,
    carbs: calories * 0.4,
    fat: calories * 0.3,
  });
}

// Dragging the Calories slider to `newCalories`: every unlocked macro
// keeps its current *share* of calories (so a balanced split stays
// balanced as the total moves) — unless one macro is locked, in which case
// it's held fixed in grams and only the other two are reproportioned to
// fill whatever calories are left. This is "Calories is always locked and
// doesn't change when you adjust protein/carbs/fat" from the other
// direction: dragging Calories itself is the one gesture that's always
// allowed to change the total, regardless of any P/C/F lock.
export function redistributeCaloriesForTarget({ proteinG, carbsG, fatG, lockedMacro, newCalories }) {
  const kcal = macroKcal({ proteinG, carbsG, fatG });
  const totalOld = kcal.protein + kcal.carbs + kcal.fat;
  const protectedKeys = lockedMacro ? [lockedMacro] : [];

  if (totalOld <= 0) {
    return nudgeForExactTotal(balancedSplit(newCalories), newCalories, protectedKeys);
  }

  if (lockedMacro) {
    const lockedKcal = kcal[lockedMacro];
    const remaining = Math.max(0, newCalories - lockedKcal);
    const otherKeys = ['protein', 'carbs', 'fat'].filter((k) => k !== lockedMacro);
    const sumOther = otherKeys.reduce((sum, k) => sum + kcal[k], 0);
    const nextKcal = { ...kcal, [lockedMacro]: lockedKcal };
    if (sumOther <= 0) {
      otherKeys.forEach((k) => {
        nextKcal[k] = remaining / otherKeys.length;
      });
    } else {
      otherKeys.forEach((k) => {
        nextKcal[k] = kcal[k] * (remaining / sumOther);
      });
    }
    return nudgeForExactTotal(kcalToGrams(nextKcal), newCalories, protectedKeys);
  }

  const factor = newCalories / totalOld;
  const grams = kcalToGrams({ protein: kcal.protein * factor, carbs: kcal.carbs * factor, fat: kcal.fat * factor });
  return nudgeForExactTotal(grams, newCalories, protectedKeys);
}

// Dragging one macro's own slider (`changedKey`, always one of the two
// currently-unlocked macros — the editor screen disables dragging whichever
// one is locked) to `newGrams`: total calories stay exactly what they were,
// so whatever calories `changedKey` gained or gave up come out of the
// *other* unlocked macro(s), split proportionally to their own current
// calories — e.g. with nothing locked, increasing protein takes calories
// from both carbs and fat in proportion to their current split; with fat
// locked, increasing protein only ever takes from carbs, since fat isn't
// allowed to move. The locked macro (if any) is always returned unchanged.
//
// `totalCalories` (optional) is the exact number this redistribution
// should aim to hit — pass in whatever's currently DISPLAYED as Calories
// (see MacroGoalsScreen's own `calories` state) rather than leaving this
// to fall back to summing proteinG/carbsG/fatG's kcal itself. That
// fallback is still here for direct/standalone callers (and is what the
// pure-math tests below exercise), but it re-derives the target from
// numbers that may already carry a gram's worth of prior rounding —
// letting THAT number drift, call after call, is exactly what used to let
// the displayed Calories number creep away from its true value even
// though this function was always conserving calories "well enough" on
// its own. Passing the real displayed total in explicitly instead pins
// every redistribution to the one authoritative number the user actually
// set, so Calories can only ever change by dragging Calories itself — not
// even by a rounding kcal here or there.
export function redistributeMacroForChange({
  proteinG,
  carbsG,
  fatG,
  lockedMacro,
  changedKey,
  newGrams,
  totalCalories,
}) {
  const kcal = macroKcal({ proteinG, carbsG, fatG });
  const newChangedKcal = newGrams * MACRO_KCAL_PER_G[changedKey];
  const deltaKcal = newChangedKcal - kcal[changedKey];

  const otherKeys = ['protein', 'carbs', 'fat'].filter((k) => k !== changedKey);
  const receivingKeys = otherKeys.filter((k) => k !== lockedMacro);
  const nextKcal = { ...kcal, [changedKey]: newChangedKcal };

  if (receivingKeys.length === 0) {
    // Nothing left to absorb the change (shouldn't happen via the UI —
    // the locked macro's own slider is disabled, so changedKey is never
    // the locked one, which always leaves at least one receiving key) —
    // bail out to the unchanged grams rather than silently dropping
    // calories.
    return kcalToGrams(kcal);
  }

  const sumReceivingOld = receivingKeys.reduce((sum, k) => sum + kcal[k], 0);
  if (sumReceivingOld <= 0) {
    receivingKeys.forEach((k) => {
      nextKcal[k] = Math.max(0, kcal[k] - deltaKcal / receivingKeys.length);
    });
  } else {
    receivingKeys.forEach((k) => {
      const weight = kcal[k] / sumReceivingOld;
      nextKcal[k] = Math.max(0, kcal[k] - deltaKcal * weight);
    });
  }

  // The number this redistribution must land on: whatever the caller says
  // is currently displayed as Calories (`totalCalories`) if it passed one
  // in, otherwise the sum of the macros it was given — see this
  // function's own comment above for why the explicit version is what
  // actually keeps Calories from drifting in the real screen. Either way,
  // this is never `newGrams`/`newChangedKcal` — dragging a macro's own
  // slider must never move the total. changedKey and lockedMacro are both
  // protected from the nudge below: changedKey has to land on exactly the
  // grams the user dragged to (nudging it would make the slider silently
  // disagree with the finger), and a locked macro has to stay exactly
  // where it was pinned.
  const targetCalories = totalCalories != null ? totalCalories : kcal.protein + kcal.carbs + kcal.fat;
  const protectedKeys = [changedKey, lockedMacro].filter(Boolean);
  return nudgeForExactTotal(kcalToGrams(nextKcal), targetCalories, protectedKeys);
}

// The most grams `key`'s own slider can be dragged up to before whichever
// macro(s) would absorb the difference (see redistributeMacroForChange
// above) get pushed down to exactly 0g — used as that slider's live
// `maximumValue` so the drag itself can never ask for more calories than
// are actually available to take from the unlocked macros, rather than
// silently clamping to a wrong-looking value after the fact.
export function maxGramsForMacro({ proteinG, carbsG, fatG, lockedMacro, key }) {
  const kcal = macroKcal({ proteinG, carbsG, fatG });
  const otherKeys = ['protein', 'carbs', 'fat'].filter((k) => k !== key);
  const receivingKeys = otherKeys.filter((k) => k !== lockedMacro);
  const sumReceiving = receivingKeys.reduce((sum, k) => sum + kcal[k], 0);
  const maxKcal = kcal[key] + sumReceiving;
  return Math.floor(maxKcal / MACRO_KCAL_PER_G[key]);
}

// --- Quiz answers -> Profile (design doc 2.2). This is the one place that
// knows the exact shape the quiz screen collects answers in — everything
// downstream of this function only ever deals in metric, canonical values.

export function buildProfile(answers) {
  const heightCm =
    answers.heightUnit === 'cm'
      ? answers.heightCm
      : feetInchesToCm(answers.heightFeet, answers.heightInches);

  const weightKg = answers.weightUnit === 'kg' ? answers.weightKg : lbToKg(answers.weightLb);

  let goalWeightKg = null;
  if (answers.goal !== 'maintain' && answers.goalWeightValue != null) {
    goalWeightKg =
      answers.weightUnit === 'kg' ? answers.goalWeightValue : lbToKg(answers.goalWeightValue);
  }

  return {
    sex: answers.sex,
    age: answers.age,
    heightCm,
    weightKg,
    bodyFatPercent: bodyFatMidpoint(answers.sex, answers.bodyFatRange),
    goal: answers.goal,
    goalWeightKg,
    weightHistory: answers.weightHistory,
    activityLevel: answers.activityLevel,
    training: answers.training || [],
    diet: answers.diet,
  };
}

// --- Top-level entry point: profile in, full numeric report out. Does not
// include the example-meal visualization yet — that's a separate module
// once the diet food templates exist. ---

export function generateGoalsReport(profile) {
  const lbm = computeLBM(profile);
  const bmr = computeBMR(profile);
  const tdee = computeTDEE(profile, bmr);
  const calorieTarget = computeCalorieTarget(profile, bmr, tdee);
  const macros =
    calorieTarget.calories != null ? computeMacros(profile, calorieTarget, lbm) : null;
  const timeline = calorieTarget.calories != null ? computeTimeline(profile, calorieTarget) : null;

  return {
    lbm: Math.round(lbm * 10) / 10,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calorieTarget,
    macros,
    timeline,
  };
}

// --- "Do you want to follow/save this goal?" confirmation math
// (screens/FollowGoalScreen.js) — compares a goal's own calorie number
// against this user's current TDEE (persisted to the `goals` table the
// moment the quiz finishes — see App.js's handleQuizComplete, and
// utils/db.js's fetchGoals/saveGoals) to describe what actually happens
// if they start eating at that calorie level: today's maintenance number,
// the resulting daily surplus/deficit, and what that adds up to per day
// and over two weeks. Pure and standalone from the quiz/report pipeline
// above (a goal being previewed here didn't necessarily come from a quiz
// result at all — it could be a custom "Set My Own Macro Goals" one), so
// this only ever takes the two raw numbers it actually needs rather than
// a whole profile/report. Returns `tdeeKnown: false` when the user hasn't
// completed the mandatory intake quiz yet (no TDEE on file to compare
// against) — screens/FollowGoalScreen.js falls back to just the plain
// "replace your current one?" question in that case; in practice this
// should be rare since the quiz is mandatory up front, but it keeps this
// function (and that screen) from assuming a number that might not exist
// yet.
export function buildFollowSummary(currentTdee, goalCalories) {
  if (currentTdee == null) {
    return { tdeeKnown: false };
  }
  const tdee = Math.round(currentTdee);
  const diff = Math.round(goalCalories) - tdee; // positive = surplus (gain), negative = deficit (lose)
  if (diff === 0) {
    return { tdeeKnown: true, tdee, maintain: true };
  }
  const isSurplus = diff > 0;
  const magnitude = Math.abs(diff);
  const dailyKg = magnitude / C.KCAL_PER_KG_FAT;
  const twoWeekKg = dailyKg * 14;
  return {
    tdeeKnown: true,
    tdee,
    maintain: false,
    direction: isSurplus ? 'surplus' : 'deficit',
    verb: isSurplus ? 'gain' : 'lose',
    diffKcal: magnitude,
    dailyKg: Math.round(dailyKg * 100) / 100,
    dailyLb: Math.round(kgToLb(dailyKg) * 100) / 100,
    twoWeekKg: Math.round(twoWeekKg * 10) / 10,
    twoWeekLb: Math.round(kgToLb(twoWeekKg) * 10) / 10,
  };
}
