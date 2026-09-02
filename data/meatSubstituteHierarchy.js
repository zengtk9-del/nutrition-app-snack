// Labels and ordering for the Meat Substitutes picker. Food entries live
// in data/foodsMeatSubstitutes.js and carry `substituteItem`.
//
// One Type covering everything: with 17 items there is nothing to gain
// from a grouping layer, and Vegetables already set the precedent for a
// category that skips straight to its item list.

export const SUBSTITUTE_TYPES = [
  { key: 'substitutes', label: 'All Meat Substitutes' },
];

export const SUBSTITUTE_ITEMS = {
  substitutes: [
    { key: 'veggie_burger', label: 'Veggie Burger Patty' },
    { key: 'meatless_chicken', label: 'Meatless Chicken' },
    { key: 'meatless_chicken_breaded', label: 'Meatless Chicken, breaded' },
    { key: 'meatless_bacon', label: 'Meatless Bacon' },
    { key: 'bacon_bits', label: 'Meatless Bacon Bits' },
    { key: 'meatless_sausage', label: 'Meatless Sausage' },
    { key: 'breakfast_link', label: 'Meatless Breakfast Link / Patty' },
    { key: 'meatless_hot_dog', label: 'Meatless Hot Dog' },
    { key: 'deli_slices', label: 'Meatless Deli Slices' },
    { key: 'meatballs', label: 'Meatless Meatballs' },
    { key: 'meatloaf_patties', label: 'Vegetarian Meatloaf / Patties' },
    { key: 'fillets', label: 'Vegetarian Fillets' },
    { key: 'tvp', label: 'Textured Vegetable Protein, dry' },
    { key: 'meat_extender', label: 'Meat Extender' },
    { key: 'stroganoff', label: 'Vegetarian Stroganoff' },
    { key: 'pot_pie', label: 'Meatless Pot Pie' },
    { key: 'swiss_steak', label: 'Meatless Swiss Steak with Gravy' },
  ],
};
