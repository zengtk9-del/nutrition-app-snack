// Human-readable labels for the Seafood drill-down picker in
// screens/LogFoodScreen.js -- Category (Seafood) > Type (this file's
// SEAFOOD_SUBCATEGORIES) > Species (this file's SEAFOOD_CUTS, per type) >
// SeafoodCard, the same toggle-card style Poultry uses (see PoultryCard in
// screens/LogFoodScreen.js) -- an icon placeholder, whichever toggles apply
// to that species, a portion step, then Add/Favorite.
//
// The actual food entries (data/foodsSeafood.js) each carry a `subcategory`
// and `cut` key that map into these two lookup tables -- this file is just
// their display labels and the order they're shown in, kept separate so
// relabeling/reordering never touches the food data.
//
// "Processed & Canned Seafood" is its own Type (mirroring Poultry's
// "Processed & Deli Poultry") rather than folding canned/breaded/smoked
// variants into each species as extra prep options -- Damon chose this over
// the alternative (e.g. Tuna > Raw/Cooked/Canned) so every species keeps a
// simple two-option raw/cooked step, and pantry/freezer items are grouped
// together the way a grocery store actually organizes them.
//
// "Other Seafood" holds two items (Turtle, Frog Legs) that aren't fish,
// shellfish, or mollusks at all -- not worth inventing a whole new top-level
// category for two items, so they get a small Type of their own instead.
//
// hasShellToggle / shellYieldPercent -- SeafoodCard's Shell On/Off toggle.
// Unlike Poultry's skin toggle, this ISN'T a second set of nutrition
// numbers -- USDA only ever measures the edible meat (shell has 0 calories,
// same reason a nutrition label never counts bone), so there's no "with
// shell" macro data to switch to. Instead, shellYieldPercent is what
// fraction of a shell-on weight is actually edible meat; when Shell On is
// selected, SeafoodCard converts whatever weight you type in (shell and
// meat together) down to edible grams before running the normal calorie
// math, rather than pretending the shell itself has calories.
//
// Only given to species where shell is a genuinely large fraction of what
// you'd put on a scale -- shrimp, crab, lobster, crawfish, and the
// shell-bearing mollusks (clams, oysters, mussels). Scallops, squid,
// octopus, and abalone are left out since they're essentially always sold
// or prepared already shelled/cleaned. Fish don't get this at all (Damon's
// call -- skin is a small enough fraction of a fillet's weight not to
// bother with a conversion toggle for it).
//
// Percentages are sourced, not guessed -- FAO seafood composition data and
// seafood-industry/extension references, cross-checked against more than
// one source where possible:
//   shrimp   0.75  -- headless shell-on shrimp is ~75% meat once peeled
//                      (FAO: head ~40% of whole shrimp, shell ~15%, so of
//                      the 60% that's left once headless, 45/60 = 75% is
//                      meat)
//   crab     0.35  -- crab LEGS (not whole-body picked crab -- see
//                      foodsSeafood.js's header comment on why both raw and
//                      cooked Crab were standardized on the queen/snow crab
//                      leg entries); leg yields run roughly 30-50% across
//                      snow/king crab sources, 35% is a middle-of-the-range
//                      figure
//   lobster  0.25  -- whole hard-shell lobster, ~20-25% meat across sources
//   crawfish 0.15  -- whole boiled crawfish, ~15% tail meat (a Louisiana
//                      crawfish supplier's own published ratio: 3 lb whole
//                      cooked crawfish ~= 0.5 lb tail meat)
//   clam     0.15  -- FAO lists 11-18% across clam species; 15% is a
//                      reasonable middle figure since this app doesn't
//                      split clams out by species
//   oyster   0.10  -- FAO's figure, consistent across every oyster species
//                      it tracks
//   mussel   0.24  -- FAO's figure for blue/green mussel
// This is the weakest-sourced part of the whole Seafood feature -- every
// number above is a representative average for "this kind of shellfish",
// not a measurement of the specific thing on any one person's plate (a
// jumbo shrimp and a small one don't peel out at exactly the same
// percentage). Good enough to correct for the shell being a big chunk of
// the weight, not precise enough to trust down to the gram.

export const SEAFOOD_SUBCATEGORIES = [
  { key: 'fish', label: 'Fish' },
  { key: 'shellfish', label: 'Shellfish & Crustaceans' },
  { key: 'mollusk', label: 'Mollusks' },
  { key: 'processed', label: 'Processed & Canned Seafood' },
  { key: 'other', label: 'Other Seafood' },
];

export const SEAFOOD_CUTS = {
  fish: [
    { key: 'salmon', label: 'Salmon' },
    { key: 'tuna', label: 'Tuna' },
    { key: 'cod', label: 'Cod' },
    { key: 'tilapia', label: 'Tilapia' },
    { key: 'halibut', label: 'Halibut' },
    { key: 'snapper', label: 'Snapper' },
    { key: 'mackerel', label: 'Mackerel' },
    { key: 'trout', label: 'Trout' },
    { key: 'catfish', label: 'Catfish' },
    { key: 'mahi_mahi', label: 'Mahi Mahi' },
    { key: 'swordfish', label: 'Swordfish' },
    { key: 'sea_bass', label: 'Sea Bass' },
    { key: 'herring', label: 'Herring' },
    { key: 'sardine_anchovy', label: 'Sardines & Anchovies' },
    { key: 'perch', label: 'Perch' },
    { key: 'pike', label: 'Pike' },
    { key: 'pollock', label: 'Pollock' },
    { key: 'flounder_sole', label: 'Flounder & Sole' },
    { key: 'eel', label: 'Eel' },
    { key: 'carp', label: 'Carp' },
    { key: 'bass', label: 'Bass' },
    // Added v0.0.43 with the Indigenous-foods redistribution (Decision 2).
    { key: 'whitefish', label: 'Whitefish, dried' },
    { key: 'sheefish', label: 'Sheefish' },
    { key: 'smelt_trad', label: 'Smelt, dried' },
    { key: 'steelhead_trad', label: 'Steelhead Trout, dried' },
    { key: 'blackfish', label: 'Blackfish' },
    { key: 'char', label: 'Arctic Char' },
    { key: 'other', label: 'Other Fish' },
  ],
  shellfish: [
    { key: 'shrimp', label: 'Shrimp', hasShellToggle: true, shellYieldPercent: 0.75 },
    { key: 'crab', label: 'Crab', hasShellToggle: true, shellYieldPercent: 0.35 },
    { key: 'lobster', label: 'Lobster', hasShellToggle: true, shellYieldPercent: 0.25 },
    { key: 'crawfish', label: 'Crawfish', hasShellToggle: true, shellYieldPercent: 0.15 },
  ],
  mollusk: [
    // Added v0.0.43 with the Indigenous-foods redistribution (Decision 2).
    { key: 'octopus_trad', label: 'Octopus' },
    { key: 'cockles', label: 'Cockles' },
    { key: 'clam', label: 'Clams', hasShellToggle: true, shellYieldPercent: 0.15 },
    { key: 'oyster', label: 'Oysters', hasShellToggle: true, shellYieldPercent: 0.1 },
    { key: 'mussel', label: 'Mussels', hasShellToggle: true, shellYieldPercent: 0.24 },
    { key: 'scallop', label: 'Scallops' },
    { key: 'squid', label: 'Squid & Calamari' },
    { key: 'octopus', label: 'Octopus' },
    { key: 'abalone', label: 'Abalone' },
    { key: 'snail_whelk', label: 'Snails & Whelk' },
  ],
  processed: [
    { key: 'canned_tuna', label: 'Canned Tuna' },
    { key: 'canned_salmon', label: 'Canned Salmon' },
    { key: 'canned_other', label: 'Other Canned Fish' },
    { key: 'breaded_fried', label: 'Breaded & Fried (Fish Sticks, Nuggets)' },
    { key: 'smoked', label: 'Smoked Fish' },
    { key: 'cured_dried', label: 'Salted & Dried Fish' },
    { key: 'imitation_surimi', label: 'Imitation Seafood (Surimi)' },
    { key: 'caviar_roe', label: 'Caviar & Roe' },
    { key: 'cakes_spread', label: 'Seafood Cakes & Spreads' },
  ],
  other: [
    { key: 'turtle', label: 'Turtle' },
    { key: 'frog_legs', label: 'Frog Legs' },
    { key: 'sea_cucumber', label: 'Sea Cucumber' },
    { key: 'chiton', label: 'Chiton (gumboots)' },
  ],
};
