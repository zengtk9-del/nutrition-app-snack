// Labels and ordering for the Baby Foods picker in
// screens/LogFoodScreen.js. Food entries live in data/foodsBabyFoods.js
// and carry `subcategory` (Type), `babyItem`, and `babyStage`.
//
// BABY_VARIETIES is the Strained / Junior axis -- USDA's own stage
// labels, kept verbatim because that is what is printed on the jar.

export const BABY_TYPES = [
  { key: 'fruit_puree', label: 'Fruit Purees' },
  { key: 'veg_puree', label: 'Vegetable Purees' },
  { key: 'meat_dinner', label: 'Meats & Dinners' },
  { key: 'cereal', label: 'Cereals' },
  { key: 'toddler', label: 'Toddler Snacks & Meals' },
];

export const BABY_VARIETIES = [
  { key: 'strained', label: 'Strained' },
  { key: 'junior', label: 'Junior' },
];

export const BABY_ITEMS = {
  fruit_puree: [
    { key: 'apple', label: 'Apples' },
    { key: 'banana', label: 'Bananas' },
    { key: 'pear', label: 'Pears' },
    { key: 'peach', label: 'Peaches' },
    { key: 'prune', label: 'Prunes' },
    { key: 'plum', label: 'Plums' },
  ],
  veg_puree: [
    { key: 'carrot', label: 'Carrots' },
    { key: 'peas', label: 'Peas' },
    { key: 'green_beans', label: 'Green Beans' },
    { key: 'sweet_potato', label: 'Sweet Potatoes' },
    { key: 'squash', label: 'Squash' },
    { key: 'spinach', label: 'Creamed Spinach' },
    { key: 'corn', label: 'Creamed Corn' },
    { key: 'beets', label: 'Beets' },
    { key: 'green_peas_veg', label: 'Garden Vegetables' },
  ],
  meat_dinner: [
    { key: 'chicken', label: 'Chicken' },
    { key: 'beef', label: 'Beef' },
    { key: 'turkey', label: 'Turkey' },
    { key: 'ham', label: 'Ham' },
    { key: 'lamb', label: 'Lamb' },
    { key: 'veal', label: 'Veal' },
    { key: 'dinner_veg_chicken', label: 'Dinner, vegetables & chicken' },
    { key: 'dinner_veg_beef', label: 'Dinner, vegetables & beef' },
    { key: 'dinner_macaroni', label: 'Dinner, macaroni & cheese' },
    { key: 'dinner_chicken_noodle', label: 'Dinner, chicken noodle' },
    { key: 'dinner_turkey_rice', label: 'Dinner, turkey & rice' },
  ],
  cereal: [
    { key: 'cereal_rice', label: 'Rice Cereal' },
    { key: 'cereal_oatmeal', label: 'Oatmeal Cereal' },
    { key: 'cereal_barley', label: 'Barley Cereal' },
    { key: 'cereal_mixed', label: 'Mixed Grain Cereal' },
    { key: 'cereal_whole_wheat', label: 'Whole Wheat Cereal' },
    { key: 'cereal_toddler', label: 'Toddler Cereal' },
  ],
  toddler: [
    { key: 'puffs', label: 'Baby Puffs' },
    { key: 'yogurt_baby', label: 'Baby / Toddler Yogurt' },
    { key: 'toddler_meal', label: 'Toddler Meal' },
    { key: 'juice_baby', label: 'Baby Juice' },
    { key: 'pretzel_baby', label: 'Baby Snacks / Pretzels' },
    { key: 'dessert_pudding', label: 'Baby Dessert / Pudding' },
    { key: 'dessert_fruit', label: 'Baby Fruit Dessert' },
  ],
};
