// Human-readable labels for the Dairy drill-down picker in
// screens/LogFoodScreen.js -- Category (Dairy) > Type (this file's
// DAIRY_TYPES) > flat list of foods.
//
// Deliberately only ONE drill-down level before the final food list --
// unlike Fruit (Form > Fruit) or Eggs (Bird Type > Form > toggle card),
// Dairy doesn't have a real second axis every Type shares (there's no
// "Fresh/Dried/Canned/Frozen" or "Whole/White/Yolk" equivalent that
// applies uniformly across Milk, Cheese, Yogurt, Cream & Creamers, and
// Butter), so this mirrors the simpler half of Fruit's shape: Category >
// Type > flat list, same as Fruit's own Form > Fruit > flat list minus
// the Form step. See data/foodsDairy.js's header for the curation
// standard (~30-50 grocery-common cheeses rather than the full ~215-item
// USDA cheese catalog, per Damon's "common grocery coverage" call).
//
// Every other Type's foods are plain weight-based rows (like Fruit, no
// toggle card), since portion size for cheese/yogurt/cream/butter doesn't
// have a meaningful "size grade" or "skin/bone" axis the way eggs or
// poultry cuts do. Milk is the one exception as of the "condense cow milk"
// round -- see MILK_FAT_LEVELS below and MilkCard in
// screens/LogFoodScreen.js.
//
// Cottage Cheese and Cream Cheese live under the "Cheese" Type (not split
// out) and Sour Cream + dairy coffee creamer live under "Cream &
// Creamers" (not a separate Type) -- both explicit "(Recommended)"
// answers Damon picked when asked. Plant milks and non-dairy creamers stay
// in Beverages only and are NOT cross-listed here, since (unlike Butter,
// which is genuinely both a dairy product and a fat/oil) a plant milk
// isn't actually dairy -- see data/foodsDairy.js's header for the one
// real cross-listing this round does add (Butter -> fat_oil, "like bell
// pepper," Damon's exact words).
// As of v0.0.37 each Type declares its own SHAPE, since Dairy's five types
// genuinely don't share one:
//   'milkList'   -- a short list (the Milk card + 4 standalone products)
//   'cheeseList' -- a third drill-down level, Dairy > Cheese > Cheddar >
//                   card, the same shape Red Meat uses for Type > Cut
//   'card'       -- straight to a toggle card, no intermediate list
//   'groupList'  -- a short list of sub-products, each with its own card
export const DAIRY_TYPES = [
  { key: 'milk', label: 'Milk', shape: 'milkList' },
  { key: 'cheese', label: 'Cheese', shape: 'cheeseList' },
  { key: 'yogurt', label: 'Yogurt', shape: 'card' },
  { key: 'cream_creamer', label: 'Cream & Creamers', shape: 'groupList' },
  { key: 'butter', label: 'Butter', shape: 'card' },
];

// The 27 cheeses, in the order they appear under Dairy > Cheese. `key`
// matches the `cheeseType` field on each row in data/foodsDairy.js; a
// cheese with more than one row gets a toggle on its card, and
// `variantAxis` on those rows says whether that toggle reads "Fat" or
// "Form". Common ones first, then the rest alphabetically.
export const CHEESE_TYPES = [
  { key: 'cheddar', label: 'Cheddar' },
  { key: 'mozzarella', label: 'Mozzarella' },
  { key: 'american', label: 'American' },
  { key: 'swiss', label: 'Swiss' },
  { key: 'parmesan', label: 'Parmesan' },
  { key: 'cream_cheese', label: 'Cream Cheese' },
  { key: 'cottage', label: 'Cottage Cheese' },
  { key: 'ricotta', label: 'Ricotta' },
  { key: 'provolone', label: 'Provolone' },
  { key: 'monterey_jack', label: 'Monterey Jack' },
  { key: 'colby_jack', label: 'Colby Jack' },
  { key: 'colby', label: 'Colby' },
  { key: 'feta', label: 'Feta' },
  { key: 'goat', label: 'Goat Cheese' },
  { key: 'blue', label: 'Blue' },
  { key: 'brie', label: 'Brie' },
  { key: 'camembert', label: 'Camembert' },
  { key: 'edam', label: 'Edam' },
  { key: 'fontina', label: 'Fontina' },
  { key: 'gouda', label: 'Gouda' },
  { key: 'gruyere', label: 'Gruyere' },
  { key: 'mexican_blend', label: 'Mexican Blend' },
  { key: 'muenster', label: 'Muenster' },
  { key: 'oaxaca', label: 'Oaxaca' },
  { key: 'queso_fresco', label: 'Queso Fresco' },
  { key: 'cotija', label: 'Cotija' },
  { key: 'romano', label: 'Romano' },
];

// Cream & Creamers' three sub-products. Each has its own fat ladder, which
// is why the old single mixed list read as a jumble -- `creamGroup` on each
// row in data/foodsDairy.js maps to one of these.
export const CREAM_GROUPS = [
  { key: 'cream', label: 'Cream', toggleLabel: 'Type' },
  { key: 'sour_cream', label: 'Sour Cream', toggleLabel: 'Fat' },
  { key: 'whipped_topping', label: 'Whipped Cream & Topping', toggleLabel: 'Type' },
];

// Yogurt's three axes. The grid is COMPLETE -- all 18 combinations exist as
// real USDA rows -- so unlike every meat card in this app, YogurtCard needs
// no data-gating on any toggle.
//
// Flavor is worth a caveat the card surfaces: USDA measures "fruit" and
// "flavors other than fruit" as averages across every flavour, not as a
// specific strawberry or vanilla.
export const YOGURT_STYLES = [
  { key: 'regular', label: 'Regular' },
  { key: 'greek', label: 'Greek' },
];
export const YOGURT_FATS = [
  { key: 'whole', label: 'Whole Milk' },
  { key: 'low_fat', label: 'Low Fat' },
  { key: 'nonfat', label: 'Nonfat' },
];
export const YOGURT_FLAVORS = [
  { key: 'plain', label: 'Plain' },
  { key: 'fruit', label: 'Fruit' },
  { key: 'other', label: 'Other Flavors' },
];

// Butter's two axes. Data-gated, unlike Yogurt's: USDA has no unsalted
// whipped butter and no salt variants for ghee, so ButterCard offers Salt
// only for the forms that actually have both.
export const BUTTER_FORMS = [
  { key: 'stick', label: 'Stick' },
  { key: 'whipped', label: 'Whipped' },
  { key: 'light', label: 'Light' },
  { key: 'ghee', label: 'Ghee' },
];
export const BUTTER_SALTS = [
  { key: 'salted', label: 'Salted' },
  { key: 'unsalted', label: 'Unsalted' },
];

// Cow milk's Fat % toggle, for MilkCard (screens/LogFoodScreen.js) --
// condenses what used to be 4 separate rows in the Milk list (Whole, 2%,
// 1%, Fat Free/Skim, each also duplicated for Lactose Free) into one
// "Milk" row with a Fat % toggle plus a Lactose Free on/off switch, 8 real
// USDA rows total (data/foodsDairy.js's `milkFatLevel`/`lactoseFree`
// tagged entries) behind 2 toggles instead of 8 (or, before Lactose Free
// existed as a switch, 5) separate list entries. Buttermilk, Kefir, Goat
// Milk, and Condensed Milk stay their own separate rows in the Milk list
// -- they aren't "regular cow milk at some fat %," they're each their own
// distinct product, same reasoning Poultry/Eggs use for keeping genuinely
// different birds/cuts as separate picker steps rather than folding them
// into one card.
//
// Label note: Damon's spec text called the top tier "Whole (3.5%)". The
// real USDA milkfat content for whole milk is ~3.2g/100g (commonly
// labeled 3.25% in the US) -- 3.5% isn't the number that specific curated
// row actually carries, it's closer to a European/other-market whole-milk
// standard. The label below uses Damon's exact requested text as
// instructed; the real macros used for calorie/protein/carb/fat math are
// still the actual sourced USDA values (fatPer100g: 3.2) regardless of
// what the toggle button says -- only the button's own text differs from
// the underlying data, not the math.
export const MILK_FAT_LEVELS = [
  { key: 'whole', label: 'Whole (3.5%)' },
  { key: 'reduced_fat', label: 'Reduced Fat (2%)' },
  { key: 'low_fat', label: 'Low Fat (1%)' },
  { key: 'fat_free', label: '0 Fat' },
];
