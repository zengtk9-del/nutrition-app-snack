// Human-readable labels for the Red Meat drill-down picker in
// screens/LogFoodScreen.js -- Category (Red Meat) > Type (this file's
// SUBCATEGORIES) > Cut (this file's CUTS, per type) > raw/cooked.
//
// The actual food entries (data/foodsRedMeat.js) each carry a
// `subcategory` and `cut` key that map into these two lookup tables --
// this file is just their display labels and the order they're shown
// in, kept separate so relabeling/reordering never touches the food data.

export const RED_MEAT_SUBCATEGORIES = [
  { key: 'beef', label: 'Beef' },
  { key: 'pork', label: 'Pork' },
  { key: 'lamb', label: 'Lamb' },
  { key: 'veal', label: 'Veal' },
  { key: 'game', label: 'Game Meats' },
  { key: 'processed', label: 'Processed & Deli Meats' },
  { key: 'other', label: 'Other Meats' },
];

// One ordered cut list per subcategory -- only cuts that subcategory
// actually has curated entries for need to appear here, but keeping the
// full set from the import makes future additions a label lookup only.
//
// Beef's cut entries carry extra flags as of v0.0.13:
//   hasFatTierToggle  -- Ground Beef only. BeefGroundCard (LogFoodScreen.js)
//                        shows the Regular/Medium/Lean/Extra Lean toggle.
//   hasTrimTierToggle -- the 8 whole-muscle steak/roast cuts. BeefSteakCard
//                        shows the Trimmed/Partly Trimmed/Untrimmed toggle
//                        plus the collapsible USDA Grade section.
// Flank, Skirt, Short Ribs, Shank, Organs, and Other Cuts have neither flag
// -- USDA never measured a second fat-trim level for those (see
// data/foodsRedMeat.js's header comment), so they keep the plain flat
// raw/cooked card every other Red Meat cut already uses.
export const RED_MEAT_CUTS = {
  beef: [
    { key: 'ground', label: 'Ground Beef', hasFatTierToggle: true },
    { key: 'ribeye', label: 'Ribeye Steak', hasTrimTierToggle: true },
    { key: 'tenderloin_filet', label: 'Tenderloin / Filet Mignon', hasTrimTierToggle: true },
    { key: 'porterhouse_tbone', label: 'T-Bone / Porterhouse', hasTrimTierToggle: true },
    { key: 'ny_strip', label: 'NY Strip Steak', hasTrimTierToggle: true },
    { key: 'sirloin', label: 'Sirloin Steak', hasTrimTierToggle: true },
    { key: 'chuck', label: 'Chuck Roast', hasTrimTierToggle: true },
    { key: 'round', label: 'Round Steak', hasTrimTierToggle: true },
    { key: 'brisket', label: 'Brisket', hasTrimTierToggle: true },
    { key: 'flank', label: 'Flank Steak' },
    { key: 'skirt', label: 'Skirt Steak' },
    { key: 'short_ribs', label: 'Short Ribs' },
    { key: 'shank', label: 'Shank' },
    { key: 'organs', label: 'Liver & Organs' },
    { key: 'other', label: 'Other Cuts' },
  ],
  // Pork, as of v0.0.33 -- brought up to the same standard as Beef: every
  // cut gets a real card and icon, with a toggle only where USDA actually
  // measured a second fat level.
  //
  // hasFatTierToggle (Ground Pork) reads PORK_FAT_TIERS below -- 3 tiers,
  // not Beef's 4, because USDA carries exactly three lean percentages for
  // ground pork (72/84/96).
  //
  // hasTrimTierToggle behaves like Beef's, but is backed by a DIFFERENT
  // USDA measurement -- see TRIM_TIERS' comment below for why, and
  // data/foodsRedMeat.js's pork block for which entry each tier came from.
  //
  // Spareribs, Pork Belly, Liver & Organs and Other Cuts have neither
  // flag: USDA has no "separable lean only" row for spareribs or belly
  // (and for belly that's arguably correct -- belly IS the fat), and the
  // last two are grab-bags with no coherent trim level. They use
  // MeatCutCard, so they still get a card and an icon, just no fat toggle.
  //
  // Cured products -- bacon, cured ham, deli ham -- deliberately stay under
  // 'processed' rather than appearing here. `ham_fresh` below is the FRESH
  // leg roast, a genuinely different food from the cured ham most people
  // buy sliced.
  pork: [
    { key: 'ground', label: 'Ground Pork', hasFatTierToggle: true },
    { key: 'tenderloin', label: 'Tenderloin', hasTrimTierToggle: true },
    { key: 'chops', label: 'Pork Chops', hasTrimTierToggle: true },
    { key: 'loin', label: 'Pork Loin', hasTrimTierToggle: true },
    { key: 'shoulder_butt', label: 'Shoulder / Pork Butt', hasTrimTierToggle: true },
    { key: 'ham_fresh', label: 'Fresh Ham (Leg)', hasTrimTierToggle: true },
    { key: 'backribs', label: 'Baby Back Ribs', hasTrimTierToggle: true },
    { key: 'country_ribs', label: 'Country-Style Ribs', hasTrimTierToggle: true },
    { key: 'spareribs', label: 'Spareribs' },
    { key: 'belly', label: 'Pork Belly' },
    { key: 'organs', label: 'Liver & Organs' },
    { key: 'other', label: 'Other Cuts' },
  ],
  // Lamb, as of v0.0.34 -- same treatment as Beef and Pork.
  //
  // hasTrimTierToggle here is backed by "separable lean only" vs "separable
  // lean and fat", both taken at trimmed to 1/4" fat. Lamb is the only
  // species in this file that carries BOTH of USDA's fat descriptors, so
  // that needed a decision: its 1/8" rows have no separable-lean-only
  // counterpart at all, which makes a Beef-style external-depth ladder
  // impossible to build cleanly, whereas 1/4" has complete data at every
  // tier for every cut. See TRIM_TIERS below and foodsRedMeat.js's lamb
  // block.
  //
  // The four toggle-less cuts each have a real reason -- USDA has no lean
  // percentages for domestic ground lamb (unlike Beef's 4 tiers and Pork's
  // 3), no lean-and-fat counterpart for cubed stew meat, and no trim
  // breakdown at all behind the single generic chop row. Organs is a
  // grab-bag, same as every other species.
  //
  // Chops is the one cut in this file with NO Prep toggle -- only a cooked
  // row exists domestically. See foodsRedMeat.js for why the raw row that
  // used to sit here was removed rather than kept.
  //
  // 'sirloin' was dropped in v0.0.34: it had been listed since the original
  // import but never had a single food row behind it, so it never rendered.
  // USDA treats sirloin as a half of the leg, not a standalone cut.
  lamb: [
    { key: 'ground', label: 'Ground Lamb' },
    { key: 'leg', label: 'Leg of Lamb', hasTrimTierToggle: true },
    { key: 'loin', label: 'Loin', hasTrimTierToggle: true },
    { key: 'rib_rack', label: 'Rib / Rack', hasTrimTierToggle: true },
    { key: 'shoulder', label: 'Shoulder', hasTrimTierToggle: true },
    { key: 'shank', label: 'Shank', hasTrimTierToggle: true },
    { key: 'chops', label: 'Chops' },
    { key: 'cubed', label: 'Cubed for Stew / Kabob' },
    { key: 'organs', label: 'Liver & Organs' },
    { key: 'other', label: 'Other Cuts', hasTrimTierToggle: true },
  ],
  veal: [
    { key: 'ground', label: 'Ground Veal' },
    { key: 'leg', label: 'Leg' },
    { key: 'sirloin', label: 'Sirloin' },
    { key: 'loin', label: 'Loin' },
    { key: 'rib_rack', label: 'Rib / Rack' },
    { key: 'shoulder', label: 'Shoulder' },
    { key: 'shank', label: 'Shank (Osso Buco)' },
    { key: 'chops', label: 'Chops' },
    { key: 'organs', label: 'Liver & Organs' },
    { key: 'other', label: 'Other Cuts' },
  ],
  game: [
    { key: 'bison', label: 'Bison' },
    { key: 'venison', label: 'Venison (Deer)' },
    { key: 'elk', label: 'Elk' },
    { key: 'boar', label: 'Wild Boar' },
    { key: 'rabbit', label: 'Rabbit' },
    { key: 'goat', label: 'Goat' },
    // Added v0.0.43 with the Indigenous-foods redistribution (Decision 2).
    { key: 'moose', label: 'Moose' },
    { key: 'caribou', label: 'Caribou' },
    { key: 'buffalo', label: 'Buffalo (free range)' },
    { key: 'mutton', label: 'Mutton' },
    { key: 'seal', label: 'Seal' },
    { key: 'walrus', label: 'Walrus' },
    { key: 'whale', label: 'Whale' },
    { key: 'other_game', label: 'Other Game Meat' },
  ],
  processed: [
    { key: 'bacon', label: 'Bacon' },
    { key: 'sausage', label: 'Sausage' },
    { key: 'hot_dogs_franks', label: 'Hot Dogs & Franks' },
    { key: 'bologna', label: 'Bologna' },
    { key: 'salami_pepperoni', label: 'Salami & Pepperoni' },
    { key: 'ham_deli', label: 'Ham & Deli Meat' },
    { key: 'canned_potted', label: 'Canned / Potted Meat' },
    { key: 'pate_spread_loaf', label: 'Pate, Spreads & Loaf Meats' },
    { key: 'jerky', label: 'Jerky' },
    { key: 'other', label: 'Other Processed Meat' },
  ],
  other: [
    { key: 'other', label: 'Organ Meats (Unspecified)' },
  ],
};

// Ground Beef's 4 fat tiers -- BeefGroundCard reads this for the toggle's
// labels and the "20-30% fat" range text shown under it. `fatTier` matches
// the field of the same name on each Ground Beef row in foodsRedMeat.js.
// Every range here is centered on one real USDA fat percentage (see that
// file's header comment) -- Lean and Extra Lean's ranges were chosen to
// line up with the FDA's legal meat-labeling cutoffs for those words
// (<10g and <5g fat per 100g/RACC, respectively), not picked arbitrarily.
export const BEEF_FAT_TIERS = [
  { key: 'regular', label: 'Regular', rangeLabel: '20-30% fat' },
  { key: 'medium', label: 'Medium', rangeLabel: '15-20% fat' },
  { key: 'lean', label: 'Lean', rangeLabel: '7-10% fat' },
  { key: 'extra_lean', label: 'Extra Lean', rangeLabel: '3-5% fat' },
];

// Ground Pork's 3 fat tiers -- the pork counterpart to BEEF_FAT_TIERS
// above, read by the same GroundMeatCard. Three rather than beef's four
// because USDA carries exactly three lean percentages for ground pork.
// `fatTier` matches the field of the same name on each Ground Pork row in
// foodsRedMeat.js.
//
// One honest caveat, carried through from that file: USDA has no RAW 72/28
// entry, so Regular's raw row is plain "Pork, fresh, ground, raw" (21.2g
// fat -- squarely in 72/28 territory) standing in for it. Damon approved
// that substitution explicitly rather than it being made silently.
export const PORK_FAT_TIERS = [
  { key: 'regular', label: 'Regular', rangeLabel: '~28% fat' },
  { key: 'medium', label: 'Medium', rangeLabel: '~16% fat' },
  { key: 'lean', label: 'Lean', rangeLabel: '~4% fat' },
];

// The 3 trim tiers, shared by Beef's 8 whole-muscle steak/roast cuts and
// Pork's 7 trim-toggle cuts -- read by TrimTierCard for the toggle's
// labels. `trimTier` matches the field of the same name on each row in
// foodsRedMeat.js. In both species Trimmed and Untrimmed are real USDA
// measurements and Partly Trimmed is the average of the two.
//
// What Trimmed/Untrimmed MEAN differs by species, though, and that's worth
// knowing before comparing a beef number to a pork one:
//   Beef -- external trim depth: "trimmed to 0 inch" vs "trimmed to 1/8
//           inch" of fat left on.
//   Pork -- "separable lean only" vs "separable lean and fat". USDA
//           records no 0"/1/8" levels for pork at all, so the beef scheme
//           simply doesn't exist there.
// Same underlying idea (how much fat is still attached), different rulers.
export const TRIM_TIERS = [
  { key: 'trimmed', label: 'Trimmed' },
  { key: 'partly_trimmed', label: 'Partly Trimmed' },
  { key: 'untrimmed', label: 'Untrimmed' },
];

// Back-compat alias -- TRIM_TIERS is the name to use going forward now that
// pork shares it, but this keeps any older import working rather than
// turning a rename into a runtime error.
export const BEEF_TRIM_TIERS = TRIM_TIERS;

// USDA Grade, for BeefSteakCard's collapsible section (collapsed by
// default -- Damon's spec: "optional, expandable when clicked on but
// otherwise collapsed"). Rather than a 4th data dimension in
// foodsRedMeat.js (which would mean sourcing and storing 3x as many rows
// for a feature nobody has to open), grade is applied at render time as a
// fat-content multiplier: how much more or less fat real USDA Choice/
// Select data shows for THIS cut vs. this app's default ("all grades")
// data for the same cut, trim level, and prep. That ratio is computed once
// per cut from real USDA numbers (Choice/Select fat at the Untrimmed trim
// level, averaged across raw and cooked) and applied to whichever
// trim/prep combination is currently selected -- protein and carbs are
// left unchanged (grade differences are almost entirely a fat/marbling
// effect) and calories are recalculated from the adjusted fat. A ratio of
// 1.0 would mean "no measurable difference"; none of these are exactly
// 1.0, confirming grade is a real nutritional difference here, not a
// cosmetic label -- though Brisket's is close enough (1.03/0.97) that the
// practical difference is small.
export const BEEF_GRADE_FAT_RATIO = {
  ribeye: { choice: 1.074, select: 0.892 },
  tenderloin_filet: { choice: 1.012, select: 0.991 },
  porterhouse_tbone: { choice: 1.05, select: 0.923 },
  ny_strip: { choice: 1.07, select: 0.892 },
  sirloin: { choice: 1.119, select: 0.884 },
  chuck: { choice: 1.035, select: 0.965 },
  round: { choice: 1.037, select: 0.972 },
  brisket: { choice: 1.03, select: 0.973 },
};
