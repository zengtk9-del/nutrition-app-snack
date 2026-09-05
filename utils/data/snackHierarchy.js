// Labels and ordering for the Snacks picker in screens/LogFoodScreen.js.
// Food entries live in data/foodsSnacks.js and carry `subcategory` (Type),
// `snackItem`, and `snackVariety`.
//
// SNACK_VARIETIES holds both ladders -- the chip one (Plain/Flavored/
// Baked/Reduced fat) and the popcorn one (Air-popped/With butter/
// Microwave/Caramel) -- filtered per item at render time, so a card only
// shows rungs its own rows have. Pita chips have one row and no toggle;
// potato chips have all four.

export const SNACK_TYPES = [
  { key: 'mixed', label: 'Nuts & Trail Mix' },
  { key: 'chips', label: 'Chips' },
  { key: 'crackers', label: 'Crackers' },
  { key: 'pretzels', label: 'Pretzels' },
  { key: 'popcorn', label: 'Popcorn' },
  { key: 'bars', label: 'Bars' },
  { key: 'other', label: 'Puffs, Mixes & Other' },
];

export const SNACK_VARIETIES = [
  { key: 'plain', label: 'Plain' },
  { key: 'flavored', label: 'Flavored' },
  { key: 'baked', label: 'Baked' },
  { key: 'reduced_fat', label: 'Reduced fat' },
  { key: 'air_popped', label: 'Air-popped' },
  { key: 'oil_popped', label: 'With butter' },
  { key: 'microwave', label: 'Microwave' },
  { key: 'coated', label: 'Caramel/coated' },
];

export const SNACK_ITEMS = {
  // Arrives by crossListCategories from nut_seed (subcategory 'mixed'). Listed
  // here so the rows are BROWSABLE and not merely filter-visible -- the
  // gap found in the Nuts & Seeds round. They keep their `nutItem` key and
  // their source icon prefix, because it is one food and one picture.
  mixed: [
    { key: 'mixed_nuts_dry_roasted', label: 'Mixed nuts, dry roasted' },
    { key: 'mixed_nuts_oil_roasted', label: 'Mixed nuts, oil roasted' },
    { key: 'trail_mix_regular', label: 'Trail mix, regular' },
    { key: 'trail_mix_tropical', label: 'Trail mix, tropical' },
    { key: 'trail_mix_chocolate', label: 'Trail mix with chocolate chips' },
  ],
  chips: [
    { key: 'potato_chips', label: 'Potato Chips' },
    { key: 'tortilla_chips', label: 'Tortilla Chips' },
    { key: 'corn_chips', label: 'Corn Chips' },
    { key: 'cheese_puffs', label: 'Cheese Puffs & Twists' },
    { key: 'multigrain_chips', label: 'Multigrain Chips' },
    { key: 'pita_chips', label: 'Pita Chips' },
    { key: 'plantain_chips', label: 'Plantain Chips' },
    { key: 'sweet_potato_chips', label: 'Sweet Potato Chips' },
    { key: 'veggie_bean_chips', label: 'Veggie & Bean Chips' },
    { key: 'rice_chips', label: 'Rice Chips & Cakes' },
    { key: 'bagel_chips', label: 'Bagel Chips' },
    { key: 'onion_rings_snack', label: 'Onion Flavored Rings' },
    { key: 'corn_nuts', label: 'Corn Nuts' },
  ],
  crackers: [
    { key: 'saltine', label: 'Saltine Crackers' },
    { key: 'cheese_cracker', label: 'Cheese Crackers' },
    { key: 'butter_cracker', label: 'Butter / Round Crackers' },
    { key: 'whole_wheat_cracker', label: 'Whole Wheat Crackers' },
    { key: 'sandwich_cracker_cheese', label: 'Cracker Sandwich, cheese filled' },
    { key: 'sandwich_cracker_pb', label: 'Cracker Sandwich, peanut butter filled' },
    { key: 'rye_cracker', label: 'Rye / Crispbread Crackers' },
    { key: 'matzo', label: 'Matzo' },
    { key: 'melba_toast', label: 'Melba Toast' },
    { key: 'breadsticks', label: 'Breadsticks, hard' },
    { key: 'croutons', label: 'Croutons' },
  ],
  pretzels: [
    { key: 'pretzel_hard', label: 'Pretzels, hard' },
    { key: 'pretzel_soft', label: 'Pretzels, soft' },
    { key: 'pretzel_chips', label: 'Pretzel Chips' },
    { key: 'pretzel_filled', label: 'Pretzels, filled' },
    { key: 'pretzel_coated', label: 'Pretzels, coated' },
  ],
  popcorn: [
    { key: 'popcorn', label: 'Popcorn, air popped' },
  ],
  bars: [
    { key: 'granola_bar', label: 'Granola Bar' },
    { key: 'granola_bar_chocolate', label: 'Granola Bar, chocolate coated' },
    { key: 'granola_bar_lowfat', label: 'Granola Bar, lowfat' },
    { key: 'fruit_nut_bar', label: 'Fruit & Nut Bar' },
    { key: 'cereal_bar', label: 'Cereal Bar, fruit filled' },
    { key: 'breakfast_bar', label: 'Breakfast Bar' },
    { key: 'protein_bar', label: 'Protein / Nutrition Bar' },
    { key: 'milk_cereal_bar', label: 'Milk & Cereal Bar' },
    { key: 'rice_krispie_treat', label: 'Crisped Rice Treat' },
    { key: 'fruit_snack', label: 'Fruit Snacks / Roll-Ups' },
  ],
  other: [
    { key: 'trail_mix', label: 'Trail Mix' },
    { key: 'snack_mix', label: 'Snack Mix' },
    { key: 'chow_mein_noodles', label: 'Chow Mein Noodles' },
    { key: 'popcorn_cake', label: 'Popcorn / Rice Cake' },
    { key: 'pork_rinds', label: 'Pork Rinds' },
    { key: 'beef_jerky_snack', label: 'Meat Snack Sticks' },
  ],
};
