// Human-readable labels (+ toggle-applicability flags) for the Eggs
// drill-down picker in screens/LogFoodScreen.js -- Category (Eggs) >
// Bird Type (this file's EGG_TYPES) > Form (this file's EGG_FORMS, per
// bird -- Whole Egg / Egg White Only / Egg Yolk Only) > a toggle card
// (Prep, and for Chicken, Size) > "+ Add"/Favorite (no separate portion
// step -- see EggCard's header comment in LogFoodScreen.js for why).
//
// Eggs got split out of the old "Eggs & Dairy" category into their own
// top-level chip (Damon's call) -- eggs behave nothing like the rest of
// dairy: they're bought and eaten by COUNT and GRADE, not weighed on a
// kitchen scale like milk/cheese, and unlike a chicken breast or a shrimp,
// a "Large" egg is a real USDA-standardized weight, not a rough +/-30%
// estimate. Dairy itself (Milk/Cheese/Yogurt/Cream/Butter) is a separate,
// not-yet-curated pass -- data/foods.js's 'dairy' category (renamed from
// 'egg_dairy') still holds the flat USDA list for now.
//
// Bird Type: Chicken (by far the most data -- separate Whole/White/Yolk
// forms, several real preps), plus Duck/Goose/Quail/Turkey, which the
// bundled USDA data only has as a single raw whole-egg entry each (no
// skin-on-style separated forms, no cooked variants) -- same "not every
// combination has data" situation as Poultry's rarer birds, handled the
// same way (resolveEggFood below falls back gracefully, and there's simply
// no Form/Prep toggle to show when there's only one option).
//
// EGG_SIZE_GRAMS -- real USDA-standard edible (out-of-shell) weights per
// size grade, cross-checked against 2 independent sources for the Whole
// Egg numbers (calculatorjunction.com's egg weight reference table, and
// scaleforgrams.com's Large/Extra-Large gram figures, which agree closely:
// Large ~50g, Extra Large ~56g). Note this is the EDIBLE weight (cracked
// out of the shell) -- not the shell-on weight printed on a carton (a
// carton "Large" egg is ~57g with shell; USDA nutrient data, and this
// table, are on the ~50g edible basis, same basis this app's existing
// per-100g figures already use, so no shell-yield-percent conversion step
// is needed the way Seafood/Poultry needed one for their shell/bone).
// White/Yolk per-size splits come from the same single source (not
// independently cross-checked the way the Whole-egg numbers are), but they
// add up internally consistently at every grade (e.g. Large: 33g white +
// 17g yolk = 50g whole, exactly) which is a good sign they're coherent,
// even though only Whole Egg's totals have a second independent source
// behind them. "Peewee" is a real (rarely-used) USDA grade but isn't
// carried here -- it's essentially never sold at retail, and no source
// gave a reliable edible-weight figure for it; Small through Jumbo cover
// every size a shopper actually encounters.
export const EGG_SIZE_GRADES = [
  { key: 'small', label: 'Small' },
  { key: 'medium', label: 'Medium' },
  { key: 'large', label: 'Large' },
  { key: 'xlarge', label: 'Extra Large' },
  { key: 'jumbo', label: 'Jumbo' },
];

export const EGG_SIZE_GRAMS = {
  whole: { small: 38, medium: 44, large: 50, xlarge: 56, jumbo: 63 },
  white: { small: 25, medium: 29, large: 33, xlarge: 36, jumbo: 41 },
  yolk: { small: 13, medium: 15, large: 17, xlarge: 20, jumbo: 22 },
};

export const EGG_TYPES = [
  { key: 'chicken', label: 'Chicken Egg' },
  { key: 'duck', label: 'Duck Egg' },
  { key: 'goose', label: 'Goose Egg' },
  { key: 'quail', label: 'Quail Egg' },
  { key: 'turkey', label: 'Turkey Egg' },
];

// hasSizeToggle: true only for Chicken -- the only bird with real,
// standardized size-grade data. Duck/Goose/Quail/Turkey eggs vary in size
// same as any egg does, but there's no USDA (or industry) size-grading
// standard for them the way there is for chicken eggs, so rather than
// apply chicken's numbers to a completely different-sized egg (a goose egg
// is already ~3x a chicken egg on its own), those birds just get their one
// real typical weight and no Size toggle -- same "don't apply data that
// doesn't really describe what's selected" reasoning as Poultry's Bone
// toggle staying off for Duck/Other Birds.
export const EGG_FORMS = {
  chicken: [
    { key: 'whole', label: 'Whole Egg', hasSizeToggle: true },
    { key: 'white', label: 'Egg White Only', hasSizeToggle: true },
    { key: 'yolk', label: 'Egg Yolk Only', hasSizeToggle: true },
  ],
  duck: [{ key: 'whole', label: 'Whole Egg', hasSizeToggle: false }],
  goose: [{ key: 'whole', label: 'Whole Egg', hasSizeToggle: false }],
  quail: [{ key: 'whole', label: 'Whole Egg', hasSizeToggle: false }],
  turkey: [{ key: 'whole', label: 'Whole Egg', hasSizeToggle: false }],
};

// Finds the best real food entry for a (birdType, form, prep) combination,
// falling back gracefully when that exact combination has no USDA data
// (e.g. Duck Whole Egg only ever has a 'raw' prep -- asking for 'cooked'
// falls back to whatever prep that bird/form actually has). Never returns
// null for a (birdType, form) that's actually in EGG_FORMS above, since
// every form listed there has at least one entry.
export function resolveEggFood(eggFoods, birdType, form, prep) {
  const inForm = eggFoods.filter((f) => f.subcategory === birdType && f.form === form);
  if (inForm.length === 0) return null;
  const exact = inForm.find((f) => f.prep === prep);
  if (exact) return exact;
  return inForm[0];
}
