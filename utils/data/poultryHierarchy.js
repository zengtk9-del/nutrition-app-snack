// Human-readable labels (+ toggle-applicability flags) for the Poultry
// drill-down picker in screens/LogFoodScreen.js -- Category (Poultry) >
// Type (this file's POULTRY_TYPES) > Cut (this file's POULTRY_CUTS, per
// type) > a toggle card (skin on/off, bone in/boneless, raw/cooked) >
// portion.
//
// The actual food entries (data/foodsPoultry.js) each carry a
// `subcategory` (this file's Type), `cut`, `skin` ('on'/'off'/null), and
// `prep` -- this file is just their display labels, ordering, and which
// toggles a given cut should show, kept separate so relabeling/reordering
// never touches the food data.
//
// `hasSkinToggle` / `hasBoneToggle`: true for cuts that are a real piece of
// the bird (breast, thigh, drumstick, wing, leg, whole bird, or a whole
// small game bird like quail/pheasant/goose) -- these can always in
// principle be bought skin-on or skinless, bone-in or boneless, per
// Damon's instruction to always offer a toggle a cut can genuinely have.
// False for cuts that don't come that way in real life -- ground meat,
// breaded tenders/nuggets, giblets/organs, deli & processed items.
//
// Bone in/boneless never switches to a different underlying food entry --
// bone itself has 0 calories/protein/carbs/fat, so USDA never tracks a
// nutritionally-different bone-in version of the same cut/skin/prep, and
// data/foodsPoultry.js's numbers are (and always have been) a per-100g-of-
// edible-meat basis regardless of the toggle. What the Bone toggle DOES do
// (as of the boneYieldPercent field below) is convert the WEIGHT -- same
// idea as Seafood's Shell On/Off toggle and shellYieldPercent
// (data/seafoodHierarchy.js): when Bone In is selected, whatever's typed
// or estimated is treated as "bone and meat together" and converted down
// to edible grams (boneInToEdibleGrams, utils/units.js) before the normal
// calorie math runs, rather than the bone toggle just swapping an icon
// while silently treating the whole bone-in weight as if it were all meat.
//
// boneYieldPercent -- what fraction of a bone-in piece's weight is actually
// edible meat+skin. Only set for Chicken and Turkey's breast/thigh/
// drumstick/wing/leg/whole cuts so far -- these are cross-checked against
// more than one source:
//   breast     0.80 -- ~20% bone (raw-meaty-bones reference tables, cross-
//                       checked against a second independent source; both
//                       agree)
//   thigh      0.79 -- ~21% bone (same two sources, same cross-check)
//   drumstick  0.66 -- no single source gives drumstick alone; derived from
//                       the sourced Leg figure (thigh+drumstick combined,
//                       27% bone) and a peer-reviewed cut-yield study (Lyon
//                       et al. 1973, Poultry Science, drumstick ~53.5-53.8%
//                       meat by weight) assuming a roughly 55/45 thigh-to-
//                       drumstick weight split within a whole leg -- a
//                       derived estimate, not a directly-measured figure,
//                       same category as this app's Beef "Partly Trimmed"
//                       tier (data/foodsRedMeat.js)
//   wing       0.54 -- ~46% bone, the boniest of the bunch (matches Lyon et
//                       al.'s finding that wings have the lowest meat
//                       percentage of any cut-up part)
//   leg        0.73 -- ~27% bone (thigh + drumstick together, as usually
//                       sold)
//   whole      0.68 -- ~32% bone, whole carcass (organs/feathers excluded)
// `other` (a grab-bag of miscellaneous cuts) intentionally has NO
// boneYieldPercent -- there's no single bone fraction for an undefined mix
// of pieces, so it's left as display-only rather than applying a number
// that wouldn't really describe what's selected.
//
// Duck and every cut under Other Poultry & Game Birds (Goose, Pheasant,
// Quail, Guinea Hen, Squab, Grouse, Emu, Ostrich) do NOT have
// boneYieldPercent yet -- duck has a meaningfully different bone-to-meat
// ratio than chicken, and ratites (Emu, Ostrich) have an entirely different
// skeleton, so chicken's numbers don't transfer. Rather than apply an
// unverified percentage to those, their Bone toggle stays exactly as
// before: display-only (PoultryCard shows a note saying so), pending real
// sourced data for each. This was a deliberate, Damon-approved scope call
// -- ship the well-sourced birds now, keep researching the rest.
//
// Skin on/off, by contrast, IS real nutrition data (skin adds meaningful
// fat/calories) and maps to an actual different food entry, for every bird
// in this file. USDA's raw data doesn't have every (type, cut, skin, prep)
// combination -- e.g. duck breast has no skin-on + raw entry -- so
// `resolvePoultryFood` below always falls back to the closest real entry
// rather than the app coming up empty.

export const POULTRY_TYPES = [
  { key: 'chicken', label: 'Chicken' },
  { key: 'turkey', label: 'Turkey' },
  { key: 'duck', label: 'Duck' },
  { key: 'other_bird', label: 'Other Poultry & Game Birds' },
  { key: 'processed', label: 'Processed & Deli Poultry' },
];

export const POULTRY_CUTS = {
  chicken: [
    { key: 'breast', label: 'Breast', hasSkinToggle: true, hasBoneToggle: true, boneYieldPercent: 0.80 },
    { key: 'thigh', label: 'Thigh', hasSkinToggle: true, hasBoneToggle: true, boneYieldPercent: 0.79 },
    { key: 'drumstick', label: 'Drumstick', hasSkinToggle: true, hasBoneToggle: true, boneYieldPercent: 0.66 },
    { key: 'wing', label: 'Wing', hasSkinToggle: true, hasBoneToggle: true, boneYieldPercent: 0.54 },
    { key: 'leg', label: 'Leg', hasSkinToggle: true, hasBoneToggle: true, boneYieldPercent: 0.73 },
    { key: 'whole', label: 'Whole Chicken', hasSkinToggle: true, hasBoneToggle: true, boneYieldPercent: 0.68 },
    { key: 'other', label: 'Other Cuts', hasSkinToggle: true, hasBoneToggle: true },
    { key: 'ground', label: 'Ground Chicken', hasSkinToggle: false, hasBoneToggle: false },
    { key: 'tenders_breaded', label: 'Tenders / Nuggets (Breaded)', hasSkinToggle: false, hasBoneToggle: false },
    { key: 'organs', label: 'Giblets & Organs', hasSkinToggle: false, hasBoneToggle: false },
  ],
  turkey: [
    { key: 'breast', label: 'Breast', hasSkinToggle: true, hasBoneToggle: true, boneYieldPercent: 0.80 },
    { key: 'thigh', label: 'Thigh', hasSkinToggle: true, hasBoneToggle: true, boneYieldPercent: 0.79 },
    { key: 'drumstick', label: 'Drumstick', hasSkinToggle: true, hasBoneToggle: true, boneYieldPercent: 0.66 },
    { key: 'wing', label: 'Wing', hasSkinToggle: true, hasBoneToggle: true, boneYieldPercent: 0.54 },
    { key: 'leg', label: 'Leg', hasSkinToggle: true, hasBoneToggle: true, boneYieldPercent: 0.73 },
    { key: 'whole', label: 'Whole Turkey', hasSkinToggle: true, hasBoneToggle: true, boneYieldPercent: 0.68 },
    { key: 'other', label: 'Other Cuts', hasSkinToggle: true, hasBoneToggle: true },
    { key: 'ground', label: 'Ground Turkey', hasSkinToggle: false, hasBoneToggle: false },
    { key: 'tenders_breaded', label: 'Tenders / Nuggets (Breaded)', hasSkinToggle: false, hasBoneToggle: false },
    { key: 'organs', label: 'Giblets & Organs', hasSkinToggle: false, hasBoneToggle: false },
  ],
  duck: [
    { key: 'breast', label: 'Breast', hasSkinToggle: true, hasBoneToggle: true },
    { key: 'leg', label: 'Leg', hasSkinToggle: true, hasBoneToggle: true },
    { key: 'whole', label: 'Whole Duck', hasSkinToggle: true, hasBoneToggle: true },
    { key: 'other', label: 'Other Cuts', hasSkinToggle: true, hasBoneToggle: true },
    { key: 'organs', label: 'Giblets & Organs', hasSkinToggle: false, hasBoneToggle: false },
  ],
  other_bird: [
    { key: 'goose', label: 'Goose', hasSkinToggle: true, hasBoneToggle: true },
    { key: 'pheasant', label: 'Pheasant', hasSkinToggle: true, hasBoneToggle: true },
    { key: 'quail', label: 'Quail', hasSkinToggle: true, hasBoneToggle: true },
    { key: 'guinea_hen', label: 'Guinea Hen', hasSkinToggle: true, hasBoneToggle: true },
    { key: 'squab', label: 'Squab (Pigeon)', hasSkinToggle: true, hasBoneToggle: true },
    { key: 'grouse', label: 'Grouse', hasSkinToggle: false, hasBoneToggle: true },
    { key: 'emu', label: 'Emu', hasSkinToggle: false, hasBoneToggle: true },
    { key: 'ostrich', label: 'Ostrich', hasSkinToggle: false, hasBoneToggle: true },
  ],
  processed: [
    { key: 'bacon', label: 'Bacon', hasSkinToggle: false, hasBoneToggle: false },
    { key: 'sausage', label: 'Sausage', hasSkinToggle: false, hasBoneToggle: false },
    { key: 'hot_dogs_franks', label: 'Hot Dogs & Franks', hasSkinToggle: false, hasBoneToggle: false },
    { key: 'bologna', label: 'Bologna', hasSkinToggle: false, hasBoneToggle: false },
    { key: 'ham_deli', label: 'Deli / Luncheon Meat & Rolls', hasSkinToggle: false, hasBoneToggle: false },
    { key: 'pate_spread_loaf', label: 'Pate, Spread & Loaf', hasSkinToggle: false, hasBoneToggle: false },
    { key: 'other', label: 'Other Processed Cuts', hasSkinToggle: false, hasBoneToggle: false },
  ],
};

// Finds the best real food entry for a (type, cut, skin, prep) combination,
// falling back gracefully when that exact combination has no USDA data --
// e.g. asking for duck breast + skin on + raw (USDA has no such entry) falls
// back to duck breast + skin on + cooked, then to whatever exists for that
// cut at all. Never returns null for a (type, cut) that's actually in
// POULTRY_CUTS above, since every cut listed there has at least one entry.
export function resolvePoultryFood(poultryFoods, ptype, cut, skin, prep) {
  const inCut = poultryFoods.filter((f) => f.subcategory === ptype && f.cut === cut);
  if (inCut.length === 0) return null;
  const exact = inCut.find((f) => f.skin === skin && f.prep === prep);
  if (exact) return exact;
  const sameSkin = inCut.find((f) => f.skin === skin);
  if (sameSkin) return sameSkin;
  const samePrep = inCut.find((f) => f.prep === prep);
  if (samePrep) return samePrep;
  return inCut[0];
}

