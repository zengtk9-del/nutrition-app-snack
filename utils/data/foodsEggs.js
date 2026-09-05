// The curated Eggs database -- replaces the old flat "Eggs & Dairy" entries
// for plain eggs (the old category's ~175 egg_dairy rows whose name started
// with "Egg, ...") with a small, browsable set for the Category > Bird Type
// > Form > (Prep/Size toggle card) > Add picker in screens/LogFoodScreen.js.
// Same collapsing idea as data/foodsRedMeat.js/foodsPoultry.js/etc -- see
// those files' headers for why this is worth doing at all.
//
// Every row here is on a per-100g basis, same as the other curated meat/
// poultry/seafood files -- `typicalGrams` is the "Large" size's real edible
// weight (Chicken) or the one typical weight that bird's egg is (Duck/
// Goose/Quail/Turkey), used as the default before the Size toggle (Chicken
// only -- see data/eggHierarchy.js's EGG_SIZE_GRAMS) picks a different real
// per-grade weight.
//
// `subcategory` is the Bird Type (chicken/duck/goose/quail/turkey), `form`
// is Whole/White/Yolk (chicken only -- other birds are whole-egg only in
// the bundled USDA data), `prep` is raw or a cooking method. Chicken Whole
// Egg gets 5 real preps (Raw, Hard-Boiled, Fried, Scrambled, Poached);
// Chicken White/Yolk get 2 (Raw, Cooked) since separating white from yolk
// is almost always a raw-ingredient move (baking, a recipe, egg-white
// omelets) rather than something someone hard-boils on its own. Turkey
// still only has a real 'raw' entry in the bundled USDA data -- no cooked
// variant exists for it, so that's all that's offered (same "not every
// combination has data" situation Poultry's rarer birds have). Duck and
// Goose now also get a real Cooked prep, and Quail a Canned prep -- see
// the "Duck/Goose/Quail Cooked/Canned" note below; this fills a gap
// explicitly disclosed back when Eggs first shipped.
//
// A few TYPICALGRAMS FIXES, same pattern as Fruit's bad-typicalGrams
// cleanup: several of the source USDA rows had a typicalGrams left over
// from a "1 cup" or multi-egg survey reference amount (243g/245g/220g/8g --
// nowhere close to one egg), not a single-egg weight. Rather than keep
// those or hunt for a cleaner alternate row (none existed for some of
// these), they're overridden here to the real, sourced single-Large-egg
// weight from eggHierarchy.js's EGG_SIZE_GRAMS (50g whole / 33g white /
// 17g yolk) -- a correction using real sourced numbers, not a fabrication,
// same as how the Bone/Shell yield percentages are externally sourced
// rather than pulled from the (nonexistent, for this) USDA nutrient table.
// Each fix is called out on its row below. Scrambled's calories/macros are
// real USDA data (egg_whole_cooked_scrambled), but its own reference
// portion (220g) was clearly a multi-egg batch, and unlike Fried/Poached/
// Hard-Boiled there's no clean single-egg analog for "scrambled" to borrow
// from -- its typicalGrams (58g) is a disclosed estimate in the same spirit
// as Fried's real 55g (a little water loss beyond raw's 50g from stovetop
// cooking), not a directly-measured figure.
//
// Scope: dried/powdered egg, egg substitutes (e.g. Egg Beaters), pickled
// eggs, and baked eggs were left out -- real USDA data exists for all of
// these, but they're specialty/rare items next to a shopper's actual
// everyday choices (raw, boiled, fried, scrambled, poached), matching the
// same "most common grocery items, not the full USDA catalog" scope call
// Fruit used. Egg DISHES (deviled eggs, egg salad, eggs Benedict, omelets
// with fillings, egg sandwiches, egg drop soup, egg rolls, etc.) were never
// part of the old egg_dairy category to begin with (or, for the 3 that
// were -- Egg Benedict/Creamed/Deviled -- have been recategorized to
// 'mixed_dish', since they're composite recipes with other ingredients,
// not "an egg" the way everything in this file is) -- they stay in
// whichever category they were already correctly filed under.
//
// Duck/Goose/Quail Cooked/Canned: these 3 rows (egg_duck_whole_cooked,
// egg_goose_whole_cooked, egg_quail_whole_canned) were discovered during
// the Dairy round sitting under the old flat `dairy` category (a leftover
// gap from when Eggs first shipped -- they'd never been migrated into
// this file even though they're plainly eggs, not dairy). Moved here with
// real subcategory/form/prep fields rather than left to rot in the wrong
// category. All 3 keep their original ids and already-sane typicalGrams
// (no fix needed) -- only their `category`/`subcategory`/`form`/`prep`
// fields are new. Quail's is "canned" rather than "cooked" because that's
// genuinely what the source USDA row is (a shelf-stable canned product,
// not a home-cooked prep) -- see screens/LogFoodScreen.js's
// EGG_PREP_LABELS for the "Canned" label this adds.

const foodsEggs = [
  // --- chicken / whole ---
  { id: 'egg_chicken_whole_raw', name: 'Chicken Egg, Whole, Raw', category: 'egg', subcategory: 'chicken', form: 'whole', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 143, proteinPer100g: 12.4, carbsPer100g: 1, fatPer100g: 10, typicalGrams: 50 },
  // typicalGrams fixed 8 -> 50 (source row's own reference amount was a
  // leftover fraction, not one egg -- see header comment)
  { id: 'egg_chicken_whole_hard_boiled', name: 'Chicken Egg, Whole, Hard-Boiled', category: 'egg', subcategory: 'chicken', form: 'whole', prep: 'hard_boiled', icon: '', servingType: 'weight', caloriesPer100g: 155, proteinPer100g: 12.6, carbsPer100g: 1.1, fatPer100g: 10.6, typicalGrams: 50 },
  { id: 'egg_chicken_whole_fried', name: 'Chicken Egg, Whole, Fried', category: 'egg', subcategory: 'chicken', form: 'whole', prep: 'fried', icon: '', servingType: 'weight', caloriesPer100g: 185, proteinPer100g: 11.6, carbsPer100g: 0.9, fatPer100g: 15, typicalGrams: 55 },
  // typicalGrams estimated 58 (source row's own reference amount, 220g,
  // was a multi-egg batch) -- see header comment
  { id: 'egg_chicken_whole_scrambled', name: 'Chicken Egg, Whole, Scrambled', category: 'egg', subcategory: 'chicken', form: 'whole', prep: 'scrambled', icon: '', servingType: 'weight', caloriesPer100g: 149, proteinPer100g: 10, carbsPer100g: 1.6, fatPer100g: 11, typicalGrams: 58 },
  { id: 'egg_chicken_whole_poached', name: 'Chicken Egg, Whole, Poached', category: 'egg', subcategory: 'chicken', form: 'whole', prep: 'poached', icon: '', servingType: 'weight', caloriesPer100g: 143, proteinPer100g: 12.5, carbsPer100g: 0.7, fatPer100g: 9.5, typicalGrams: 50 },

  // --- chicken / white only ---
  // typicalGrams fixed 245 -> 33 (source row's own reference amount was a
  // "1 cup of egg whites" measure, not one egg's worth -- see header comment)
  { id: 'egg_chicken_white_raw', name: 'Chicken Egg White Only, Raw', category: 'egg', subcategory: 'chicken', form: 'white', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 52, proteinPer100g: 10.7, carbsPer100g: 2.4, fatPer100g: 0, typicalGrams: 33 },
  // typicalGrams fixed 135 -> 33, same reasoning
  { id: 'egg_chicken_white_cooked', name: 'Chicken Egg White Only, Cooked', category: 'egg', subcategory: 'chicken', form: 'white', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 52, proteinPer100g: 10.7, carbsPer100g: 2.4, fatPer100g: 0, typicalGrams: 33 },

  // --- chicken / yolk only ---
  { id: 'egg_chicken_yolk_raw', name: 'Chicken Egg Yolk Only, Raw', category: 'egg', subcategory: 'chicken', form: 'yolk', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 328, proteinPer100g: 16.2, carbsPer100g: 1, fatPer100g: 28.8, typicalGrams: 17 },
  // typicalGrams fixed 135 -> 17, same reasoning
  { id: 'egg_chicken_yolk_cooked', name: 'Chicken Egg Yolk Only, Cooked', category: 'egg', subcategory: 'chicken', form: 'yolk', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 327, proteinPer100g: 16.2, carbsPer100g: 1, fatPer100g: 28.7, typicalGrams: 17 },

  // --- other birds -- raw whole egg, plus Cooked/Canned where the Dairy
  // round's cleanup surfaced real USDA data for it (see header comment) ---
  // All of these already had sane, real single-egg typicalGrams in the
  // source data -- no fix needed, unlike most of the Chicken rows above.
  { id: 'egg_duck_whole_raw', name: 'Duck Egg, Whole, Raw', category: 'egg', subcategory: 'duck', form: 'whole', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 185, proteinPer100g: 12.8, carbsPer100g: 1.4, fatPer100g: 13.8, typicalGrams: 70 },
  { id: 'egg_duck_whole_cooked', name: 'Duck Egg, Whole, Cooked', category: 'egg', subcategory: 'duck', form: 'whole', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 224, proteinPer100g: 12, carbsPer100g: 1.4, fatPer100g: 18.6, typicalGrams: 70 },
  { id: 'egg_goose_whole_raw', name: 'Goose Egg, Whole, Raw', category: 'egg', subcategory: 'goose', form: 'whole', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 185, proteinPer100g: 13.9, carbsPer100g: 1.4, fatPer100g: 13.3, typicalGrams: 144 },
  { id: 'egg_goose_whole_cooked', name: 'Goose Egg, Whole, Cooked', category: 'egg', subcategory: 'goose', form: 'whole', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 224, proteinPer100g: 12.9, carbsPer100g: 1.3, fatPer100g: 18.1, typicalGrams: 144 },
  { id: 'egg_quail_whole_raw', name: 'Quail Egg, Whole, Raw', category: 'egg', subcategory: 'quail', form: 'whole', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 158, proteinPer100g: 13, carbsPer100g: 0.4, fatPer100g: 11.1, typicalGrams: 9 },
  { id: 'egg_quail_whole_canned', name: 'Quail Egg, Whole, Canned', category: 'egg', subcategory: 'quail', form: 'whole', prep: 'canned', icon: '', servingType: 'weight', caloriesPer100g: 158, proteinPer100g: 13, carbsPer100g: 0.4, fatPer100g: 11.1, typicalGrams: 18 },
  { id: 'egg_turkey_whole_raw', name: 'Turkey Egg, Whole, Raw', category: 'egg', subcategory: 'turkey', form: 'whole', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 171, proteinPer100g: 13.7, carbsPer100g: 1.1, fatPer100g: 11.9, typicalGrams: 79 },
];

export default foodsEggs;
