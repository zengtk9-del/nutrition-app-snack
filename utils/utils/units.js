// Small weight-unit helpers, pulled out on their own since the Poultry
// picker (screens/LogFoodScreen.js) is the first place in the app that
// needs to let someone type in ounces instead of grams.

const GRAMS_PER_OZ = 28.3495;

export function gramsToOz(grams) {
  return grams / GRAMS_PER_OZ;
}

export function ozToGrams(oz) {
  return oz * GRAMS_PER_OZ;
}

// Rounds to the nearest 5g -- portion estimates read like "115g", not the
// false precision of "114.98g".
function roundTo5(n) {
  return Math.max(5, Math.round(n / 5) * 5);
}

// Turns one "typical" gram weight into a rough Small / Medium / Large
// spread for the Poultry picker's portion step. There's no USDA size-grade
// data for meat pieces (unlike eggs, which really do have S/M/L/XL grades)
// -- Medium is anchored to the food's real typicalGrams value, and Small/
// Large are a flat +/-30% estimate around it. These are always shown to
// the user as approximate ("~115g"), never as if they were precise USDA
// figures, because they aren't.
export function estimateSizes(typicalGrams) {
  const medium = roundTo5(typicalGrams);
  return {
    small: roundTo5(typicalGrams * 0.7),
    medium,
    large: roundTo5(typicalGrams * 1.3),
  };
}

// The Seafood picker's Shell On/Off toggle (screens/LogFoodScreen.js's
// SeafoodCard) isn't a second set of nutrition numbers the way Poultry's
// skin toggle is -- USDA only ever measures the edible meat (shell has 0
// calories, same reason a nutrition label never counts bone), so there's no
// "with shell" macro data to switch to. Instead these two functions convert
// the WEIGHT between "shell and meat together" and "edible meat only",
// using a species' shellYieldPercent (data/seafoodHierarchy.js -- what
// fraction of a shell-on weight is actually edible, e.g. 0.75 for shrimp).
//
// shellOnToEdibleGrams: what you'd actually type in when Shell On is
// selected (your kitchen scale reading, shell included) -> the edible-gram
// number the normal calorie math (caloriesPer100g * grams / 100) needs.
export function shellOnToEdibleGrams(grams, shellYieldPercent) {
  if (!shellYieldPercent) return grams;
  return grams * shellYieldPercent;
}

// edibleToShellOnGrams: the inverse -- given an edible-gram amount (e.g. a
// food's typicalGrams, which is always on an edible-meat basis, or a
// Small/Medium/Large estimate derived from it), what shell-on weight would
// produce that once shelled. Used so the portion step's default number and
// its Small/Medium/Large estimates still read like "what your kitchen scale
// would show" when Shell On is selected, instead of the smaller edible-only
// figure someone hasn't shelled anything down to yet.
export function edibleToShellOnGrams(edibleGrams, shellYieldPercent) {
  if (!shellYieldPercent) return edibleGrams;
  return edibleGrams / shellYieldPercent;
}

// Same math as the two functions above, under names that make sense at
// their actual call site -- Poultry's Bone In/Boneless toggle
// (screens/LogFoodScreen.js's PoultryCard). Bone, like shell, has 0
// calories, so there's no "with bone" nutrition data to switch to; instead
// a cut's boneYieldPercent (data/poultryHierarchy.js -- what fraction of a
// bone-in piece's weight is actually edible meat+skin, e.g. 0.80 for
// chicken breast) converts the WEIGHT, same idea as shellYieldPercent for
// seafood. Only real for a handful of Chicken/Turkey cuts so far -- see
// poultryHierarchy.js's header comment for which ones, and why Duck/Other
// Birds don't have this yet.
export function boneInToEdibleGrams(grams, boneYieldPercent) {
  return shellOnToEdibleGrams(grams, boneYieldPercent);
}

export function edibleToBoneInGrams(edibleGrams, boneYieldPercent) {
  return edibleToShellOnGrams(edibleGrams, boneYieldPercent);
}
