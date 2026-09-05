// Labels and ordering for the Beverages picker in
// screens/LogFoodScreen.js -- Category (Beverages) > Type > item list >
// card. Food entries live in data/foodsBeverages.js and carry
// `subcategory` (Type), `beverageItem`, and `beverageVariety`.
//
// BEVERAGE_VARIETIES holds every rung any item uses -- Brewed/Instant/
// Decaf for coffee and tea, Regular/Diet for sodas, and the five proof
// levels for spirits. It is filtered per item at render time, so a card
// only ever shows the rungs its own rows actually have.

export const BEVERAGE_TYPES = [
  { key: 'milks', label: 'Nut & Plant Milks' },
  { key: 'coffee', label: 'Coffee' },
  { key: 'tea', label: 'Tea' },
  { key: 'juice', label: 'Juice & Smoothies' },
  { key: 'soft_drinks', label: 'Soft Drinks & Energy' },
  { key: 'milk_drinks', label: 'Milk-Based Drinks' },
  { key: 'alcohol', label: 'Alcoholic' },
  { key: 'nutritional', label: 'Shakes & Powders' },
];

export const BEVERAGE_VARIETIES = [
  { key: 'brewed', label: 'Brewed' },
  { key: 'instant', label: 'Instant' },
  { key: 'decaf', label: 'Decaf' },
  { key: 'regular', label: 'Regular' },
  { key: 'diet', label: 'Diet' },
  { key: 'p80', label: '80 proof' },
  { key: 'p86', label: '86 proof' },
  { key: 'p90', label: '90 proof' },
  { key: 'p94', label: '94 proof' },
  { key: 'p100', label: '100 proof' },
];

export const BEVERAGE_ITEMS = {
  // Arrives by crossListCategories from nut_seed (subcategory 'milks'). Listed
  // here so the rows are BROWSABLE and not merely filter-visible -- the
  // gap found in the Nuts & Seeds round. They keep their `nutItem` key and
  // their source icon prefix, because it is one food and one picture.
  milks: [
    { key: 'almond_milk', label: 'Almond milk, unsweetened' },
    { key: 'almond_milk_sweetened', label: 'Almond milk, sweetened' },
  ],
  coffee: [
    { key: 'coffee_black', label: 'Coffee, black' },
    { key: 'espresso', label: 'Espresso' },
    { key: 'cappuccino', label: 'Cappuccino' },
    { key: 'mocha', label: 'Mocha' },
    { key: 'frozen_coffee', label: 'Frozen Coffee Drink' },
    { key: 'frozen_mocha', label: 'Frozen Mocha Drink' },
    { key: 'iced_coffee', label: 'Iced Coffee' },
    { key: 'coffee_substitute', label: 'Coffee Substitute (grain)' },
  ],
  tea: [
    { key: 'tea_black', label: 'Tea, black' },
    { key: 'green_tea', label: 'Green Tea' },
    { key: 'herbal_tea', label: 'Herbal Tea' },
    { key: 'iced_tea_sweet', label: 'Iced Tea, sweetened' },
    { key: 'iced_tea_unsweet', label: 'Iced Tea, unsweetened' },
  ],
  juice: [
    { key: 'orange_juice', label: 'Orange Juice' },
    { key: 'apple_juice', label: 'Apple Juice' },
    { key: 'grape_juice', label: 'Grape Juice' },
    { key: 'cranberry_juice', label: 'Cranberry Juice Cocktail' },
    { key: 'grapefruit_juice', label: 'Grapefruit Juice' },
    { key: 'pineapple_juice', label: 'Pineapple Juice' },
    { key: 'tomato_juice', label: 'Tomato Juice' },
    { key: 'vegetable_juice', label: 'Vegetable Juice' },
    { key: 'lemonade', label: 'Lemonade' },
    { key: 'lemon_juice', label: 'Lemon Juice' },
    { key: 'lime_juice', label: 'Lime Juice' },
    { key: 'prune_juice', label: 'Prune Juice' },
    { key: 'carrot_juice', label: 'Carrot Juice' },
    { key: 'pomegranate_juice', label: 'Pomegranate Juice' },
    { key: 'apple_cider', label: 'Apple Cider' },
    { key: 'fruit_punch', label: 'Fruit Punch' },
    { key: 'fruit_juice_drink', label: 'Fruit Juice Drink' },
    { key: 'smoothie_fruit', label: 'Fruit Smoothie' },
    { key: 'smoothie_veg', label: 'Fruit & Vegetable Smoothie' },
    { key: 'coconut_water', label: 'Coconut Water' },
  ],
  soft_drinks: [
    { key: 'cola', label: 'Cola' },
    { key: 'root_beer', label: 'Root Beer' },
    { key: 'ginger_ale', label: 'Ginger Ale' },
    { key: 'cream_soda', label: 'Cream Soda' },
    { key: 'energy_drink', label: 'Energy Drink' },
    { key: 'energy_drink_sf', label: 'Energy Drink, sugar free' },
    { key: 'sports_drink', label: 'Sports Drink' },
    { key: 'tonic_water', label: 'Tonic Water' },
    { key: 'hard_seltzer', label: 'Hard Seltzer' },
  ],
  milk_drinks: [
    { key: 'hot_chocolate', label: 'Hot Chocolate / Cocoa' },
    { key: 'chocolate_milk_drink', label: 'Chocolate Milk' },
    { key: 'milkshake_choc', label: 'Milkshake, chocolate' },
    { key: 'milkshake_vanilla', label: 'Milkshake, vanilla' },
    { key: 'malted_milk', label: 'Malted Milk Drink' },
    { key: 'eggnog', label: 'Eggnog' },
    { key: 'horchata', label: 'Horchata' },
    { key: 'almond_milk_bev', label: 'Almond Milk' },
    { key: 'soy_milk_bev', label: 'Soy Milk' },
    { key: 'oat_milk', label: 'Oat Milk' },
    { key: 'rice_milk', label: 'Rice Milk' },
    { key: 'coconut_milk_bev', label: 'Coconut Milk Beverage' },
  ],
  alcohol: [
    { key: 'beer_regular', label: 'Beer, regular' },
    { key: 'beer_light', label: 'Beer' },
    { key: 'beer_higher_alc', label: 'Beer, higher alcohol / craft' },
    { key: 'wine_red', label: 'Wine, red' },
    { key: 'wine_white', label: 'Wine, white' },
    { key: 'champagne', label: 'Champagne / Sparkling Wine' },
    { key: 'wine_dessert', label: 'Dessert / Fortified Wine' },
    { key: 'liqueur', label: 'Liqueur / Cordial' },
    { key: 'margarita', label: 'Margarita' },
    { key: 'daiquiri', label: 'Daiquiri' },
    { key: 'pina_colada', label: 'Pina Colada' },
    { key: 'bloody_mary', label: 'Bloody Mary' },
    { key: 'hard_cider', label: 'Hard Cider' },
    { key: 'spirits', label: 'Spirits (gin, rum, vodka, whiskey)' },
  ],
  nutritional: [
    { key: 'protein_shake_rtd', label: 'Protein Shake, ready-to-drink' },
    { key: 'protein_powder', label: 'Protein Powder' },
    { key: 'meal_replacement', label: 'Meal Replacement Shake' },
    { key: 'nutritional_powder', label: 'Nutritional Powder Mix' },
    { key: 'breakfast_drink', label: 'Instant Breakfast Drink' },
  ],
};
