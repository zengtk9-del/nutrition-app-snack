// Labels and ordering for the Condiments & Sauces picker in
// screens/LogFoodScreen.js. Food entries live in data/foodsCondiments.js
// and carry `subcategory` (Type), `condimentItem`, and `condimentVariety`.
//
// CONDIMENT_VARIETIES is the Regular / Light / Fat-free ladder, used by
// the dressings and mayonnaise only, and data-gated per item -- a few
// dressings have no fat-free row and show two rungs instead of three.

export const CONDIMENT_TYPES = [
  { key: 'dressings', label: 'Salad Dressings & Mayo' },
  { key: 'sauces', label: 'Sauces' },
  { key: 'condiments', label: 'Condiments' },
  { key: 'dips', label: 'Dips & Spreads' },
  { key: 'gravy', label: 'Gravy' },
];

export const CONDIMENT_VARIETIES = [
  { key: 'regular', label: 'Regular' },
  { key: 'light', label: 'Light' },
  { key: 'fat_free', label: 'Fat free' },
];

export const CONDIMENT_ITEMS = {
  dressings: [
    { key: 'ranch', label: 'Ranch Dressing' },
    { key: 'caesar', label: 'Caesar Dressing' },
    { key: 'italian', label: 'Italian Dressing' },
    { key: 'creamy_italian', label: 'Creamy Italian Dressing' },
    { key: 'french', label: 'French / Catalina Dressing' },
    { key: 'thousand_island', label: 'Thousand Island Dressing' },
    { key: 'blue_cheese', label: 'Blue Cheese Dressing' },
    { key: 'honey_mustard', label: 'Honey Mustard Dressing' },
    { key: 'balsamic', label: 'Balsamic Vinaigrette' },
    { key: 'coleslaw', label: 'Coleslaw Dressing' },
    { key: 'russian', label: 'Russian Dressing' },
    { key: 'green_goddess', label: 'Green Goddess Dressing' },
    { key: 'poppy_seed', label: 'Poppy Seed Dressing' },
    { key: 'sesame', label: 'Sesame Dressing' },
    { key: 'avocado', label: 'Avocado Dressing' },
    { key: 'bacon_tomato', label: 'Bacon & Tomato Dressing' },
    { key: 'mayonnaise', label: 'Mayonnaise' },
  ],
  sauces: [
    { key: 'bbq_sauce', label: 'Barbecue Sauce' },
    { key: 'sriracha', label: 'Sriracha / Chili Sauce' },
    { key: 'tomato_pasta_sauce', label: 'Tomato / Pasta Sauce' },
    { key: 'alfredo', label: 'Alfredo Sauce' },
    { key: 'cheese_sauce', label: 'Cheese Sauce' },
    { key: 'teriyaki', label: 'Teriyaki Sauce' },
    { key: 'hoisin', label: 'Hoisin Sauce' },
    { key: 'fish_sauce', label: 'Fish Sauce' },
    { key: 'oyster_sauce', label: 'Oyster Sauce' },
    { key: 'worcestershire', label: 'Worcestershire Sauce' },
    { key: 'tartar_sauce', label: 'Tartar Sauce' },
    { key: 'cocktail_sauce', label: 'Cocktail Sauce' },
    { key: 'hollandaise', label: 'Hollandaise Sauce' },
    { key: 'curry_sauce', label: 'Curry Sauce' },
    { key: 'enchilada_sauce', label: 'Enchilada Sauce' },
    { key: 'sweet_sour_sauce', label: 'Sweet & Sour Sauce' },
  ],
  condiments: [
    { key: 'ketchup', label: 'Ketchup' },
    { key: 'mustard', label: 'Mustard' },
    { key: 'horseradish', label: 'Horseradish' },
    { key: 'vinegar', label: 'Vinegar' },
    { key: 'vinegar_balsamic', label: 'Balsamic Vinegar' },
    { key: 'chutney', label: 'Chutney' },
    { key: 'capers', label: 'Capers' },
    { key: 'duck_sauce', label: 'Duck / Plum Sauce' },
    { key: 'fry_sauce', label: 'Fry Sauce' },
  ],
  dips: [
    // Arrives by crossListCategories from Legumes and keeps its
    // `legumeItem` key -- one food, one card, two places to find it.
    { key: 'hummus', label: 'Hummus' },
    { key: 'guacamole', label: 'Guacamole' },
    { key: 'salsa', label: 'Salsa' },
    { key: 'bean_dip', label: 'Bean Dip' },
    { key: 'cheese_dip', label: 'Cheese Dip / Queso' },
    { key: 'ranch_dip', label: 'Ranch Dip' },
    { key: 'onion_dip', label: 'French Onion Dip' },
    { key: 'spinach_dip', label: 'Spinach Dip' },
    { key: 'artichoke_dip', label: 'Artichoke Dip' },
    { key: 'honey_mustard_dip', label: 'Honey Mustard Dip' },
  ],
  gravy: [
    { key: 'gravy_brown', label: 'Brown / Beef Gravy' },
    { key: 'gravy_chicken', label: 'Chicken Gravy' },
    { key: 'gravy_turkey', label: 'Turkey Gravy' },
    { key: 'gravy_country', label: 'Country / Sausage Gravy' },
    { key: 'gravy_mushroom', label: 'Mushroom Gravy' },
    { key: 'gravy_au_jus', label: 'Au Jus' },
  ],
};
