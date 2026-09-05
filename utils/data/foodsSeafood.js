// The curated Seafood database -- replaces the ~439 raw USDA SR Legacy /
// FNDDS seafood entries with a small, browsable set for the
// Category > Type > Species > toggle card picker in screens/LogFoodScreen.js
// (SeafoodCard -- same card style Poultry uses, see poultryHierarchy.js's
// PoultryCard for the pattern this was built from).
//
// Same one-representative-per-bucket curation approach used for Red Meat
// (data/foodsRedMeat.js) and Poultry (data/foodsPoultry.js): USDA lists the
// same fish/shellfish dozens of times over (every combination of source,
// cooking method, and brand got its own database row) -- this file keeps
// exactly ONE representative USDA entry per (Type, Species, raw/cooked)
// combination, picked as the least brand-specific / shortest name in that
// group as a proxy for "the plain generic version", and drops the rest.
// Along the way, ~30 non-seafood records that happened to match seafood
// keywords (Cape Cod, oyster mushrooms, scallop squash, Emu "oyster" cuts,
// black turtle beans, fish broth/stock, oyster crackers, etc.) were
// excluded, and ~170 mixed dishes (chowder, sushi, shrimp scampi, fish
// tacos, etc.) were routed away rather than allowed to win a plain-food slot.
//
// One exception to the automatic "shortest name wins" pick: Crab. USDA has
// several crab species (blue, dungeness, alaska king, queen/snow) that all
// collapsed into one generic "crab" bucket, and the shortest-name winner
// picked a different species for raw ("Snow crab, legs only, frozen") than
// for cooked ("Crustaceans, crab, blue, cooked, moist heat") -- a whole-body
// picked crab and a legs product have very different edible-meat-to-shell
// ratios, which matters once the Shell On/Off toggle (below) is doing real
// weight math. Both raw and cooked were switched by hand to the same
// species pair -- "Crustaceans, crab, queen, raw/cooked, moist heat" (queen
// crab is the commercial/scientific name for snow crab, sold as leg
// clusters) -- so the shell-yield percentage applies consistently to
// whichever prep state is picked.
//
// `subcategory` is the Type (fish, shellfish, mollusk, processed, other) and
// `cut` is the specific species/kind within that Type -- see
// data/seafoodHierarchy.js for the human-readable labels, and for the
// hasShellToggle/shellYieldPercent metadata that drives the Shell On/Off
// weight-conversion toggle on shrimp/crab/lobster/crawfish/clam/oyster/
// mussel cards. `prep` is 'raw' or 'cooked'; processed items (canned,
// smoked, breaded, etc.) are always 'cooked' since there's no meaningful raw
// state for something like canned tuna.
//
// "Processed & Canned Seafood" is its own Type (Damon's explicit choice --
// see data/seafoodHierarchy.js's header comment for the reasoning) rather
// than folding canned/breaded/smoked variants into each species as extra prep
// options. "Other Seafood" holds Turtle and Frog Legs, which aren't fish,
// shellfish, or mollusks at all.

const foodsSeafood = [
  // --- fish ---
  { id: 'seafood_fish_salmon_raw', name: 'Salmon', category: 'seafood', subcategory: 'fish', cut: 'salmon', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 188, proteinPer100g: 20.4, carbsPer100g: 0, fatPer100g: 11.2, typicalGrams: 170 },
  { id: 'seafood_fish_salmon_cooked', name: 'Salmon', category: 'seafood', subcategory: 'fish', cut: 'salmon', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 259, proteinPer100g: 25.9, carbsPer100g: 0, fatPer100g: 16.5, typicalGrams: 140 },
  { id: 'seafood_fish_tuna_raw', name: 'Tuna', category: 'seafood', subcategory: 'fish', cut: 'tuna', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 109, proteinPer100g: 24.4, carbsPer100g: 0, fatPer100g: 0.5, typicalGrams: 170 },
  { id: 'seafood_fish_tuna_cooked', name: 'Tuna', category: 'seafood', subcategory: 'fish', cut: 'tuna', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 176, proteinPer100g: 30.3, carbsPer100g: 0, fatPer100g: 5.1, typicalGrams: 140 },
  { id: 'seafood_fish_cod_raw', name: 'Cod', category: 'seafood', subcategory: 'fish', cut: 'cod', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 82, proteinPer100g: 17.8, carbsPer100g: 0, fatPer100g: 0.7, typicalGrams: 170 },
  { id: 'seafood_fish_cod_cooked', name: 'Cod', category: 'seafood', subcategory: 'fish', cut: 'cod', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 108, proteinPer100g: 19.4, carbsPer100g: 0, fatPer100g: 2.8, typicalGrams: 140 },
  { id: 'seafood_fish_tilapia_raw', name: 'Tilapia', category: 'seafood', subcategory: 'fish', cut: 'tilapia', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 96, proteinPer100g: 20.1, carbsPer100g: 0, fatPer100g: 1.7, typicalGrams: 170 },
  { id: 'seafood_fish_tilapia_cooked', name: 'Tilapia', category: 'seafood', subcategory: 'fish', cut: 'tilapia', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 142, proteinPer100g: 25.5, carbsPer100g: 0, fatPer100g: 4.4, typicalGrams: 140 },
  { id: 'seafood_fish_halibut_raw', name: 'Halibut', category: 'seafood', subcategory: 'fish', cut: 'halibut', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 81, proteinPer100g: 19.1, carbsPer100g: -0.1, fatPer100g: 0.6, typicalGrams: 170 },
  { id: 'seafood_fish_halibut_cooked', name: 'Halibut', category: 'seafood', subcategory: 'fish', cut: 'halibut', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 239, proteinPer100g: 18.4, carbsPer100g: 0, fatPer100g: 17.7, typicalGrams: 140 },
  { id: 'seafood_fish_snapper_raw', name: 'Snapper', category: 'seafood', subcategory: 'fish', cut: 'snapper', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 90, proteinPer100g: 20.7, carbsPer100g: 0.4, fatPer100g: 0.6, typicalGrams: 170 },
  { id: 'seafood_fish_snapper_cooked', name: 'Snapper', category: 'seafood', subcategory: 'fish', cut: 'snapper', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 128, proteinPer100g: 26.3, carbsPer100g: 0, fatPer100g: 1.7, typicalGrams: 140 },
  { id: 'seafood_fish_mackerel_raw', name: 'Mackerel', category: 'seafood', subcategory: 'fish', cut: 'mackerel', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 105, proteinPer100g: 20.3, carbsPer100g: 0, fatPer100g: 2, typicalGrams: 170 },
  { id: 'seafood_fish_mackerel_cooked', name: 'Mackerel', category: 'seafood', subcategory: 'fish', cut: 'mackerel', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 221, proteinPer100g: 25.4, carbsPer100g: 0, fatPer100g: 12.3, typicalGrams: 140 },
  { id: 'seafood_fish_trout_raw', name: 'Trout', category: 'seafood', subcategory: 'fish', cut: 'trout', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 148, proteinPer100g: 20.8, carbsPer100g: 0, fatPer100g: 6.6, typicalGrams: 170 },
  { id: 'seafood_fish_trout_cooked', name: 'Trout', category: 'seafood', subcategory: 'fish', cut: 'trout', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 199, proteinPer100g: 25.3, carbsPer100g: 0, fatPer100g: 10.1, typicalGrams: 140 },
  { id: 'seafood_fish_catfish_raw', name: 'Catfish', category: 'seafood', subcategory: 'fish', cut: 'catfish', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 132, proteinPer100g: 16.5, carbsPer100g: 0, fatPer100g: 7.3, typicalGrams: 170 },
  { id: 'seafood_fish_catfish_cooked', name: 'Catfish', category: 'seafood', subcategory: 'fish', cut: 'catfish', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 171, proteinPer100g: 19.3, carbsPer100g: 0, fatPer100g: 9.8, typicalGrams: 140 },
  { id: 'seafood_fish_mahi_mahi_raw', name: 'Mahi Mahi', category: 'seafood', subcategory: 'fish', cut: 'mahi_mahi', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 85, proteinPer100g: 18.5, carbsPer100g: 0, fatPer100g: 0.7, typicalGrams: 170 },
  { id: 'seafood_fish_mahi_mahi_cooked', name: 'Mahi Mahi', category: 'seafood', subcategory: 'fish', cut: 'mahi_mahi', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 109, proteinPer100g: 23.7, carbsPer100g: 0, fatPer100g: 0.9, typicalGrams: 140 },
  { id: 'seafood_fish_swordfish_raw', name: 'Swordfish', category: 'seafood', subcategory: 'fish', cut: 'swordfish', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 144, proteinPer100g: 19.7, carbsPer100g: 0, fatPer100g: 6.7, typicalGrams: 170 },
  { id: 'seafood_fish_swordfish_cooked', name: 'Swordfish', category: 'seafood', subcategory: 'fish', cut: 'swordfish', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 172, proteinPer100g: 23.4, carbsPer100g: 0, fatPer100g: 7.9, typicalGrams: 140 },
  { id: 'seafood_fish_sea_bass_raw', name: 'Sea Bass', category: 'seafood', subcategory: 'fish', cut: 'sea_bass', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 97, proteinPer100g: 18.4, carbsPer100g: 0, fatPer100g: 2, typicalGrams: 170 },
  { id: 'seafood_fish_sea_bass_cooked', name: 'Sea Bass', category: 'seafood', subcategory: 'fish', cut: 'sea_bass', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 124, proteinPer100g: 23.6, carbsPer100g: 0, fatPer100g: 2.6, typicalGrams: 140 },
  { id: 'seafood_fish_herring_raw', name: 'Herring', category: 'seafood', subcategory: 'fish', cut: 'herring', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 195, proteinPer100g: 16.4, carbsPer100g: 0, fatPer100g: 13.9, typicalGrams: 170 },
  { id: 'seafood_fish_herring_cooked', name: 'Herring', category: 'seafood', subcategory: 'fish', cut: 'herring', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 250, proteinPer100g: 21, carbsPer100g: 0, fatPer100g: 17.8, typicalGrams: 140 },
  { id: 'seafood_fish_sardine_anchovy_raw', name: 'Sardines & Anchovies', category: 'seafood', subcategory: 'fish', cut: 'sardine_anchovy', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 131, proteinPer100g: 20.4, carbsPer100g: 0, fatPer100g: 4.8, typicalGrams: 170 },
  { id: 'seafood_fish_sardine_anchovy_cooked', name: 'Sardines & Anchovies', category: 'seafood', subcategory: 'fish', cut: 'sardine_anchovy', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 210, proteinPer100g: 28.9, carbsPer100g: 0, fatPer100g: 9.7, typicalGrams: 140 },
  { id: 'seafood_fish_perch_raw', name: 'Perch', category: 'seafood', subcategory: 'fish', cut: 'perch', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 91, proteinPer100g: 19.4, carbsPer100g: 0, fatPer100g: 0.9, typicalGrams: 170 },
  { id: 'seafood_fish_perch_cooked', name: 'Perch', category: 'seafood', subcategory: 'fish', cut: 'perch', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 121, proteinPer100g: 19.4, carbsPer100g: 0, fatPer100g: 4.2, typicalGrams: 140 },
  { id: 'seafood_fish_pike_raw', name: 'Pike', category: 'seafood', subcategory: 'fish', cut: 'pike', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 93, proteinPer100g: 19.1, carbsPer100g: 0, fatPer100g: 1.2, typicalGrams: 170 },
  { id: 'seafood_fish_pike_cooked', name: 'Pike', category: 'seafood', subcategory: 'fish', cut: 'pike', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 119, proteinPer100g: 24.5, carbsPer100g: 0, fatPer100g: 1.6, typicalGrams: 140 },
  { id: 'seafood_fish_pollock_raw', name: 'Pollock', category: 'seafood', subcategory: 'fish', cut: 'pollock', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 56, proteinPer100g: 12.3, carbsPer100g: 0, fatPer100g: 0.4, typicalGrams: 170 },
  { id: 'seafood_fish_pollock_cooked', name: 'Pollock', category: 'seafood', subcategory: 'fish', cut: 'pollock', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 87, proteinPer100g: 19.4, carbsPer100g: 0, fatPer100g: 1, typicalGrams: 140 },
  { id: 'seafood_fish_flounder_sole_raw', name: 'Flounder & Sole', category: 'seafood', subcategory: 'fish', cut: 'flounder_sole', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 70, proteinPer100g: 12.4, carbsPer100g: 0, fatPer100g: 1.9, typicalGrams: 170 },
  { id: 'seafood_fish_flounder_sole_cooked', name: 'Flounder & Sole', category: 'seafood', subcategory: 'fish', cut: 'flounder_sole', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 109, proteinPer100g: 15.7, carbsPer100g: 0, fatPer100g: 4.7, typicalGrams: 140 },
  { id: 'seafood_fish_eel_raw', name: 'Eel', category: 'seafood', subcategory: 'fish', cut: 'eel', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 184, proteinPer100g: 18.4, carbsPer100g: 0, fatPer100g: 11.7, typicalGrams: 170 },
  { id: 'seafood_fish_eel_cooked', name: 'Eel', category: 'seafood', subcategory: 'fish', cut: 'eel', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 236, proteinPer100g: 23.6, carbsPer100g: 0, fatPer100g: 15, typicalGrams: 140 },
  { id: 'seafood_fish_carp_raw', name: 'Carp', category: 'seafood', subcategory: 'fish', cut: 'carp', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 127, proteinPer100g: 17.8, carbsPer100g: 0, fatPer100g: 5.6, typicalGrams: 170 },
  { id: 'seafood_fish_carp_cooked', name: 'Carp', category: 'seafood', subcategory: 'fish', cut: 'carp', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 162, proteinPer100g: 22.9, carbsPer100g: 0, fatPer100g: 7.2, typicalGrams: 140 },
  { id: 'seafood_fish_bass_raw', name: 'Bass', category: 'seafood', subcategory: 'fish', cut: 'bass', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 97, proteinPer100g: 17.7, carbsPer100g: 0, fatPer100g: 2.3, typicalGrams: 170 },
  { id: 'seafood_fish_bass_cooked', name: 'Bass', category: 'seafood', subcategory: 'fish', cut: 'bass', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 143, proteinPer100g: 23.4, carbsPer100g: 0, fatPer100g: 4.8, typicalGrams: 140 },
  { id: 'seafood_fish_other_raw', name: 'Other Fish', category: 'seafood', subcategory: 'fish', cut: 'other', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 94, proteinPer100g: 17.2, carbsPer100g: 0, fatPer100g: 2.3, typicalGrams: 170 },
  { id: 'seafood_fish_other_cooked', name: 'Other Fish', category: 'seafood', subcategory: 'fish', cut: 'other', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 108, proteinPer100g: 20.7, carbsPer100g: 0, fatPer100g: 2.8, typicalGrams: 140 },
  // --- shellfish ---
  { id: 'seafood_shellfish_shrimp_raw', name: 'Shrimp', category: 'seafood', subcategory: 'shellfish', cut: 'shrimp', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 85, proteinPer100g: 20.1, carbsPer100g: 0, fatPer100g: 0.5, typicalGrams: 100 },
  { id: 'seafood_shellfish_shrimp_cooked', name: 'Shrimp', category: 'seafood', subcategory: 'shellfish', cut: 'shrimp', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 110, proteinPer100g: 17.3, carbsPer100g: 1.2, fatPer100g: 3.5, typicalGrams: 85 },
  { id: 'seafood_shellfish_crab_raw', name: 'Crab', category: 'seafood', subcategory: 'shellfish', cut: 'crab', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 90, proteinPer100g: 18.5, carbsPer100g: 0, fatPer100g: 1.2, typicalGrams: 100 },
  { id: 'seafood_shellfish_crab_cooked', name: 'Crab', category: 'seafood', subcategory: 'shellfish', cut: 'crab', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 115, proteinPer100g: 23.7, carbsPer100g: 0, fatPer100g: 1.5, typicalGrams: 85 },
  { id: 'seafood_shellfish_lobster_raw', name: 'Lobster', category: 'seafood', subcategory: 'shellfish', cut: 'lobster', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 77, proteinPer100g: 16.5, carbsPer100g: 0, fatPer100g: 0.8, typicalGrams: 100 },
  { id: 'seafood_shellfish_lobster_cooked', name: 'Lobster', category: 'seafood', subcategory: 'shellfish', cut: 'lobster', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 89, proteinPer100g: 19, carbsPer100g: 0, fatPer100g: 0.9, typicalGrams: 85 },
  { id: 'seafood_shellfish_crawfish_raw', name: 'Crawfish', category: 'seafood', subcategory: 'shellfish', cut: 'crawfish', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 77, proteinPer100g: 16, carbsPer100g: 0, fatPer100g: 0.9, typicalGrams: 100 },
  { id: 'seafood_shellfish_crawfish_cooked', name: 'Crawfish', category: 'seafood', subcategory: 'shellfish', cut: 'crawfish', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 97, proteinPer100g: 20.2, carbsPer100g: 0, fatPer100g: 1.2, typicalGrams: 85 },
  // --- mollusk ---
  { id: 'seafood_mollusk_clam_raw', name: 'Clams', category: 'seafood', subcategory: 'mollusk', cut: 'clam', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 86, proteinPer100g: 14.7, carbsPer100g: 3.6, fatPer100g: 1, typicalGrams: 100 },
  { id: 'seafood_mollusk_clam_cooked', name: 'Clams', category: 'seafood', subcategory: 'mollusk', cut: 'clam', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 148, proteinPer100g: 25.6, carbsPer100g: 5.1, fatPer100g: 1.9, typicalGrams: 85 },
  { id: 'seafood_mollusk_oyster_raw', name: 'Oysters', category: 'seafood', subcategory: 'mollusk', cut: 'oyster', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 81, proteinPer100g: 9.4, carbsPer100g: 5, fatPer100g: 2.3, typicalGrams: 100 },
  { id: 'seafood_mollusk_oyster_cooked', name: 'Oysters', category: 'seafood', subcategory: 'mollusk', cut: 'oyster', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 163, proteinPer100g: 18.9, carbsPer100g: 9.9, fatPer100g: 4.6, typicalGrams: 85 },
  { id: 'seafood_mollusk_mussel_raw', name: 'Mussels', category: 'seafood', subcategory: 'mollusk', cut: 'mussel', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 86, proteinPer100g: 11.9, carbsPer100g: 3.7, fatPer100g: 2.2, typicalGrams: 100 },
  { id: 'seafood_mollusk_mussel_cooked', name: 'Mussels', category: 'seafood', subcategory: 'mollusk', cut: 'mussel', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 172, proteinPer100g: 23.8, carbsPer100g: 7.4, fatPer100g: 4.5, typicalGrams: 85 },
  { id: 'seafood_mollusk_scallop_raw', name: 'Scallops', category: 'seafood', subcategory: 'mollusk', cut: 'scallop', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 69, proteinPer100g: 12.1, carbsPer100g: 3.2, fatPer100g: 0.5, typicalGrams: 100 },
  { id: 'seafood_mollusk_scallop_cooked', name: 'Scallops', category: 'seafood', subcategory: 'mollusk', cut: 'scallop', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 111, proteinPer100g: 20.5, carbsPer100g: 5.4, fatPer100g: 0.8, typicalGrams: 85 },
  { id: 'seafood_mollusk_squid_raw', name: 'Squid & Calamari', category: 'seafood', subcategory: 'mollusk', cut: 'squid', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 92, proteinPer100g: 15.6, carbsPer100g: 3.1, fatPer100g: 1.4, typicalGrams: 100 },
  { id: 'seafood_mollusk_squid_cooked', name: 'Squid & Calamari', category: 'seafood', subcategory: 'mollusk', cut: 'squid', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 155, proteinPer100g: 19.4, carbsPer100g: 3.8, fatPer100g: 6.2, typicalGrams: 85 },
  { id: 'seafood_mollusk_octopus_raw', name: 'Octopus', category: 'seafood', subcategory: 'mollusk', cut: 'octopus', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 82, proteinPer100g: 14.9, carbsPer100g: 2.2, fatPer100g: 1, typicalGrams: 100 },
  { id: 'seafood_mollusk_octopus_cooked', name: 'Octopus', category: 'seafood', subcategory: 'mollusk', cut: 'octopus', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 164, proteinPer100g: 29.8, carbsPer100g: 4.4, fatPer100g: 2.1, typicalGrams: 85 },
  { id: 'seafood_mollusk_abalone_raw', name: 'Abalone', category: 'seafood', subcategory: 'mollusk', cut: 'abalone', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 105, proteinPer100g: 17.1, carbsPer100g: 6, fatPer100g: 0.8, typicalGrams: 100 },
  { id: 'seafood_mollusk_abalone_cooked', name: 'Abalone', category: 'seafood', subcategory: 'mollusk', cut: 'abalone', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 189, proteinPer100g: 19.6, carbsPer100g: 11, fatPer100g: 6.8, typicalGrams: 85 },
  { id: 'seafood_mollusk_snail_whelk_raw', name: 'Snails & Whelk', category: 'seafood', subcategory: 'mollusk', cut: 'snail_whelk', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 90, proteinPer100g: 16.1, carbsPer100g: 2, fatPer100g: 1.4, typicalGrams: 100 },
  { id: 'seafood_mollusk_snail_whelk_cooked', name: 'Snails & Whelk', category: 'seafood', subcategory: 'mollusk', cut: 'snail_whelk', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 275, proteinPer100g: 47.7, carbsPer100g: 15.5, fatPer100g: 0.8, typicalGrams: 85 },
  // --- processed ---
  { id: 'seafood_processed_canned_tuna_cooked', name: 'Canned Tuna', category: 'seafood', subcategory: 'processed', cut: 'canned_tuna', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 85, proteinPer100g: 19, carbsPer100g: 0.1, fatPer100g: 0.9, typicalGrams: 85 },
  { id: 'seafood_processed_canned_salmon_cooked', name: 'Canned Salmon', category: 'seafood', subcategory: 'processed', cut: 'canned_salmon', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 136, proteinPer100g: 24.6, carbsPer100g: 0, fatPer100g: 4.2, typicalGrams: 85 },
  { id: 'seafood_processed_canned_other_cooked', name: 'Other Canned Fish', category: 'seafood', subcategory: 'processed', cut: 'canned_other', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 159, proteinPer100g: 21.1, carbsPer100g: 0, fatPer100g: 8.3, typicalGrams: 85 },
  { id: 'seafood_processed_breaded_fried_cooked', name: 'Breaded & Fried (Fish Sticks, Nuggets)', category: 'seafood', subcategory: 'processed', cut: 'breaded_fried', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 189, proteinPer100g: 12, carbsPer100g: 11.8, fatPer100g: 10.4, typicalGrams: 85 },
  { id: 'seafood_processed_smoked_cooked', name: 'Smoked Fish', category: 'seafood', subcategory: 'processed', cut: 'smoked', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 116, proteinPer100g: 25.2, carbsPer100g: 0, fatPer100g: 1, typicalGrams: 55 },
  { id: 'seafood_processed_cured_dried_cooked', name: 'Salted & Dried Fish', category: 'seafood', subcategory: 'processed', cut: 'cured_dried', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 262, proteinPer100g: 14.2, carbsPer100g: 9.6, fatPer100g: 18, typicalGrams: 30 },
  { id: 'seafood_processed_imitation_surimi_cooked', name: 'Imitation Seafood (Surimi)', category: 'seafood', subcategory: 'processed', cut: 'imitation_surimi', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 99, proteinPer100g: 15.2, carbsPer100g: 6.8, fatPer100g: 0.9, typicalGrams: 85 },
  { id: 'seafood_processed_caviar_roe_cooked', name: 'Caviar & Roe', category: 'seafood', subcategory: 'processed', cut: 'caviar_roe', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 204, proteinPer100g: 28.6, carbsPer100g: 1.9, fatPer100g: 8.2, typicalGrams: 16 },
  { id: 'seafood_processed_cakes_spread_cooked', name: 'Seafood Cakes & Spreads', category: 'seafood', subcategory: 'processed', cut: 'cakes_spread', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 214, proteinPer100g: 14.4, carbsPer100g: 4.5, fatPer100g: 15, typicalGrams: 85 },
  // --- other ---
  { id: 'seafood_other_turtle_raw', name: 'Turtle', category: 'seafood', subcategory: 'other', cut: 'turtle', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 89, proteinPer100g: 19.8, carbsPer100g: 0, fatPer100g: 0.5, typicalGrams: 100 },
  { id: 'seafood_other_turtle_cooked', name: 'Turtle', category: 'seafood', subcategory: 'other', cut: 'turtle', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 157, proteinPer100g: 24.6, carbsPer100g: 0, fatPer100g: 5.8, typicalGrams: 85 },
  { id: 'seafood_other_frog_legs_raw', name: 'Frog Legs', category: 'seafood', subcategory: 'other', cut: 'frog_legs', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 73, proteinPer100g: 16.4, carbsPer100g: 0, fatPer100g: 0.3, typicalGrams: 100 },
  { id: 'seafood_other_frog_legs_cooked', name: 'Frog Legs', category: 'seafood', subcategory: 'other', cut: 'frog_legs', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 220, proteinPer100g: 14.4, carbsPer100g: 11.7, fatPer100g: 12.4, typicalGrams: 85 },  // --- Traditional Indigenous foods (v0.0.43, Decision 2) ---
  // These were tagged `mixed_dish` by the original USDA import and sat
  // there unreachable, even though they are single ingredients rather than
  // dishes. Moved here because this is where someone would look for them.
  // The "(Alaska Native)" / "(Navajo)" suffix in each name is kept
  // deliberately -- it identifies the specific preparation the numbers
  // were measured from, which is a real difference, not decoration.
  { id: 'seafood_whitefish_raw', name: 'Whitefish, dried', category: 'seafood', subcategory: 'fish', cut: 'whitefish', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 371, proteinPer100g: 62.4, carbsPer100g: 0.0, fatPer100g: 13.4, typicalGrams: 100 },
  { id: 'seafood_sheefish_raw', name: 'Sheefish', category: 'seafood', subcategory: 'fish', cut: 'sheefish', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 115, proteinPer100g: 22.2, carbsPer100g: 0.0, fatPer100g: 2.8, typicalGrams: 100 },
  { id: 'seafood_smelt_trad_raw', name: 'Smelt, dried', category: 'seafood', subcategory: 'fish', cut: 'smelt_trad', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 386, proteinPer100g: 56.2, carbsPer100g: 0.0, fatPer100g: 17.9, typicalGrams: 100 },
  { id: 'seafood_steelhead_trad_raw', name: 'Steelhead Trout, dried', category: 'seafood', subcategory: 'fish', cut: 'steelhead_trad', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 382, proteinPer100g: 77.3, carbsPer100g: 0.0, fatPer100g: 8.1, typicalGrams: 100 },
  { id: 'seafood_blackfish_raw', name: 'Blackfish', category: 'seafood', subcategory: 'fish', cut: 'blackfish', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 82, proteinPer100g: 15.5, carbsPer100g: 0.0, fatPer100g: 1.8, typicalGrams: 100 },
  { id: 'seafood_char_raw', name: 'Arctic Char', category: 'seafood', subcategory: 'fish', cut: 'char', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 8, proteinPer100g: 0.0, carbsPer100g: 2.0, fatPer100g: 0.0, typicalGrams: 100 },
  { id: 'seafood_octopus_trad_raw', name: 'Octopus (Alaska Native)', category: 'seafood', subcategory: 'mollusk', cut: 'octopus_trad', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 56, proteinPer100g: 12.3, carbsPer100g: 0.0, fatPer100g: 0.8, typicalGrams: 100 },
  { id: 'seafood_cockles_raw', name: 'Cockles', category: 'seafood', subcategory: 'mollusk', cut: 'cockles', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 79, proteinPer100g: 13.5, carbsPer100g: 4.7, fatPer100g: 0.7, typicalGrams: 100 },
  { id: 'seafood_sea_cucumber_raw', name: 'Sea Cucumber', category: 'seafood', subcategory: 'other', cut: 'sea_cucumber', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 56, proteinPer100g: 13.0, carbsPer100g: 0.0, fatPer100g: 0.4, typicalGrams: 100 },
  { id: 'seafood_chiton_raw', name: 'Chiton (gumboots)', category: 'seafood', subcategory: 'other', cut: 'chiton', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 83, proteinPer100g: 17.1, carbsPer100g: 0.0, fatPer100g: 1.6, typicalGrams: 100 },

];

export default foodsSeafood;
