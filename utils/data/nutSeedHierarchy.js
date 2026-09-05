// Human-readable labels for the Nuts & Seeds drill-down picker in
// screens/LogFoodScreen.js -- Category (Nuts & Seeds) > Type
// (NUT_SEED_TYPES below) > item list > food card.
//
// The food entries live in data/foodsNutsSeeds.js and carry `subcategory`
// (Type), `nutItem` (which nut/seed/product), and `nutPrep` (the
// Preparation axis, on the items that have one). This file is just labels
// and ordering, kept separate the same way every other category does it.
//
// Every Type here is an 'itemList' -- pick the nut, then the card. There's
// no 'card'-shaped Type (unlike Dairy's Yogurt or Legumes' Lentils),
// because no Type here is a single food.
export const NUT_SEED_TYPES = [
  { key: 'nuts', label: 'Nuts' },
  { key: 'seeds', label: 'Seeds' },
  { key: 'butters', label: 'Nut & Seed Butters' },
  { key: 'mixed', label: 'Mixed & Trail Mix' },
  { key: 'milks', label: 'Nut Milks' },
  { key: 'flours', label: 'Flours & Meals' },
  // Peanuts are curated in data/foodsLegumes.js (they're botanically
  // legumes) and cross-list into this category. They still need a Type and
  // item entries HERE, though -- crossListCategories only makes a row
  // visible to this category's filter, it does not put it in the browse
  // hierarchy. Without this, peanuts would turn up in Nuts & Seeds search
  // but be unreachable by browsing, which was the whole point of the
  // cross-list.
  { key: 'peanuts', label: 'Peanuts' },
];

// The Preparation axis. Deliberately ONE toggle listing real combinations
// rather than two toggles (Prep x Salt) -- USDA's coverage is so uneven
// here that a two-axis grid would be mostly empty. Cashews and sunflower
// seeds have all five; walnuts, brazil nuts, pine nuts, flax, hemp, chia,
// sesame and pumpkin have a single row with no prep wording at all, so
// their cards show no toggle whatsoever.
//
// That's the rule working as intended, not a gap: a one-row food still
// gets a card, an icon and a portion.
export const NUT_PREPS = [
  { key: 'raw', label: 'Raw' },
  { key: 'dry_roasted_unsalted', label: 'Dry Roasted, Unsalted' },
  { key: 'dry_roasted_salted', label: 'Dry Roasted, Salted' },
  { key: 'oil_roasted_unsalted', label: 'Oil Roasted, Unsalted' },
  { key: 'oil_roasted_salted', label: 'Oil Roasted, Salted' },
];

// Items per Type. `key` matches `nutItem` on the rows in
// data/foodsNutsSeeds.js. Only items that actually have rows are shown,
// the same "don't render an empty step" rule the other categories use.
//
// Peanuts appear here as their own Type even though their rows live in
// data/foodsLegumes.js -- see the note on the 'peanuts' entry above.
// Coconut is absent: it moved to Fruit this round.
export const NUT_SEED_ITEMS = {
  nuts: [
    { key: 'almond', label: 'Almonds' },
    { key: 'walnut', label: 'Walnuts' },
    { key: 'cashew', label: 'Cashews' },
    { key: 'pistachio', label: 'Pistachios' },
    { key: 'pecan', label: 'Pecans' },
    { key: 'macadamia', label: 'Macadamia Nuts' },
    { key: 'hazelnut', label: 'Hazelnuts' },
    { key: 'brazil', label: 'Brazil Nuts' },
    { key: 'pine_nut', label: 'Pine Nuts' },
    { key: 'chestnut', label: 'Chestnuts' },
  ],
  seeds: [
    { key: 'sunflower', label: 'Sunflower Seeds' },
    { key: 'pumpkin', label: 'Pumpkin Seeds' },
    { key: 'sesame', label: 'Sesame Seeds' },
    { key: 'chia', label: 'Chia Seeds' },
    { key: 'flax', label: 'Flaxseed' },
    { key: 'hemp', label: 'Hemp Seeds' },
  ],
  butters: [
    { key: 'almond_butter', label: 'Almond Butter' },
    { key: 'cashew_butter', label: 'Cashew Butter' },
    { key: 'tahini', label: 'Tahini (Sesame Paste)' },
    { key: 'sunflower_butter', label: 'Sunflower Seed Butter' },
  ],
  mixed: [
    { key: 'mixed_nuts_dry_roasted', label: 'Mixed Nuts, Dry Roasted' },
    { key: 'mixed_nuts_oil_roasted', label: 'Mixed Nuts, Oil Roasted' },
    { key: 'trail_mix_regular', label: 'Trail Mix, Regular' },
    { key: 'trail_mix_tropical', label: 'Trail Mix, Tropical' },
    { key: 'trail_mix_chocolate', label: 'Trail Mix with Chocolate Chips' },
  ],
  milks: [
    { key: 'almond_milk', label: 'Almond Milk, Unsweetened' },
    { key: 'almond_milk_sweetened', label: 'Almond Milk, Sweetened' },
  ],
  // Keys here match `legumeItem` on the cross-listed rows, not `nutItem` --
  // the picker falls back to legumeItem for exactly this case.
  peanuts: [
    { key: 'peanuts_raw', label: 'Peanuts, Raw' },
    { key: 'peanuts_dry_roasted', label: 'Peanuts, Dry-Roasted' },
    { key: 'peanuts_oil_roasted', label: 'Peanuts, Oil-Roasted' },
    { key: 'peanut_butter_smooth', label: 'Peanut Butter, Smooth' },
    { key: 'peanut_butter_chunky', label: 'Peanut Butter, Chunky' },
    { key: 'peanut_butter_reduced_fat', label: 'Peanut Butter, Reduced Fat' },
  ],
  flours: [
    { key: 'sesame_flour', label: 'Sesame Flour' },
    { key: 'soy_flour_full_fat', label: 'Soy Flour, Full-Fat' },
    { key: 'soy_flour_defatted', label: 'Soy Flour, Defatted' },
    { key: 'peanut_flour_defatted', label: 'Peanut Flour, Defatted' },
    { key: 'peanut_flour_low_fat', label: 'Peanut Flour, Low Fat' },
  ],
};
