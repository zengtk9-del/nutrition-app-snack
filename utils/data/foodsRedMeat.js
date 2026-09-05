// The curated Red Meat database -- replaces the ~2,093 raw USDA SR Legacy /
// FNDDS red-meat entries with a small, browsable set for the
// Category > Type > Cut > raw/cooked picker in screens/LogFoodScreen.js.
//
// USDA lists the same cut of meat dozens of times over (every combination
// of fat-trim level, USDA grade, and cooking method got its own database
// row) -- e.g. "ribeye" alone had 150 near-duplicate entries. For each
// (subcategory, cut, raw/cooked) combination this file keeps exactly ONE
// representative USDA entry (picked as the shortest / least brand-specific
// name in that group, as a proxy for "the plain generic version") and
// drops the rest. That's a deliberate one-way trade covering all of
// Red Meat -- Damon chose it explicitly (over keeping every USDA variant
// searchable) to make this category read like a normal app instead of a
// government spreadsheet. A few genuinely pure-fat-trim entries (e.g.
// "separable fat", "backfat") and a couple of very obscure organ items
// were dropped outright rather than picked as a cut's representative.
//
// `subcategory` groups by species/type (beef, pork, lamb, veal, game,
// processed & deli meats, or "other" for a small handful of entries with
// no species mentioned in the original USDA name at all). `cut` is the
// specific cut within that group (ribeye, chuck, chops, etc.) -- see
// data/meatHierarchy.js for the human-readable labels used to build the
// picker's screens. `prep` is 'raw' or 'cooked' -- not every cut has both;
// LogFoodScreen.js skips the raw/cooked step entirely when only one exists
// (e.g. bologna is only ever "cooked" -- there's no raw-bologna choice).
//
// Along the way, ~70 items the original USDA import had miscategorized as
// red_meat turned out to actually be poultry (turkey/chicken deli meats,
// frankfurters, etc.) -- those got moved to category: 'poultry' in
// data/foodsSRLegacy*.js / data/foodsFNDDS*.js instead of being dropped.

const foodsRedMeat = [
  // --- beef ---
  //
  // Beef got a rebuild in v0.0.13 that the rest of Red Meat did NOT --
  // Ground Beef and 8 whole-muscle steak/roast cuts now carry a
  // `fatTier`/`trimTier` field and multiple rows per cut, feeding the new
  // BeefGroundCard / BeefSteakCard toggle-cards in LogFoodScreen.js.
  // Flank, Skirt, Short Ribs, Shank, Organs, and Other Cuts were left
  // exactly as they were (plain raw/cooked WeightFoodRow) -- USDA only
  // ever measured those at a single fat-trim level (or, for Shank, just 2
  // records total), so there's no real second data point to build a
  // toggle out of. Pork/Lamb/Veal/Game/Processed/Other subcategories
  // below are also untouched this round.
  //
  // --- Ground Beef: fatTier ('regular'/'medium'/'lean'/'extra_lean') ---
  // Real USDA Foundation/SR Legacy data for 4 fat percentages (75/25,
  // 80/20, 90/10, 95/5) -- Foundation preferred over SR Legacy duplicates
  // where both exist (80/20, 90/10), same "prefer the newer, lab-analyzed
  // dataset" rule used throughout this app's curation. Tier boundaries:
  // Regular 20-30% fat (75/25 is the one real USDA point in that range),
  // Medium 15-20% fat (80/20), Lean 7-10% fat (90/10 -- this line matches
  // the FDA's legal "Lean" meat-labeling cutoff, <10g fat/100g), Extra
  // Lean 3-5% fat (95/5 -- matches FDA's legal "Extra Lean" cutoff, <5g
  // fat/100g). Every number here is a direct USDA measurement, nothing
  // interpolated.
  { id: 'redmeat_beef_ground_regular_cooked', name: 'Ground Beef', category: 'red_meat', subcategory: 'beef', cut: 'ground', prep: 'cooked', fatTier: 'regular', icon: '', servingType: 'weight', caloriesPer100g: 279, proteinPer100g: 25.6, carbsPer100g: 0, fatPer100g: 18.9, typicalGrams: 100 },
  { id: 'redmeat_beef_ground_regular_raw', name: 'Ground Beef', category: 'red_meat', subcategory: 'beef', cut: 'ground', prep: 'raw', fatTier: 'regular', icon: '', servingType: 'weight', caloriesPer100g: 293, proteinPer100g: 15.8, carbsPer100g: 0, fatPer100g: 25, typicalGrams: 225 },
  { id: 'redmeat_beef_ground_medium_cooked', name: 'Ground Beef', category: 'red_meat', subcategory: 'beef', cut: 'ground', prep: 'cooked', fatTier: 'medium', icon: '', servingType: 'weight', caloriesPer100g: 270, proteinPer100g: 25.8, carbsPer100g: 0, fatPer100g: 17.8, typicalGrams: 100 },
  { id: 'redmeat_beef_ground_medium_raw', name: 'Ground Beef', category: 'red_meat', subcategory: 'beef', cut: 'ground', prep: 'raw', fatTier: 'medium', icon: '', servingType: 'weight', caloriesPer100g: 245, proteinPer100g: 17.5, carbsPer100g: 0, fatPer100g: 19.4, typicalGrams: 225 },
  { id: 'redmeat_beef_ground_lean_cooked', name: 'Ground Beef', category: 'red_meat', subcategory: 'beef', cut: 'ground', prep: 'cooked', fatTier: 'lean', icon: '', servingType: 'weight', caloriesPer100g: 217, proteinPer100g: 26.1, carbsPer100g: 0, fatPer100g: 11.8, typicalGrams: 100 },
  { id: 'redmeat_beef_ground_lean_raw', name: 'Ground Beef', category: 'red_meat', subcategory: 'beef', cut: 'ground', prep: 'raw', fatTier: 'lean', icon: '', servingType: 'weight', caloriesPer100g: 188, proteinPer100g: 18.2, carbsPer100g: 0, fatPer100g: 12.8, typicalGrams: 225 },
  { id: 'redmeat_beef_ground_extra_lean_cooked', name: 'Ground Beef', category: 'red_meat', subcategory: 'beef', cut: 'ground', prep: 'cooked', fatTier: 'extra_lean', icon: '', servingType: 'weight', caloriesPer100g: 174, proteinPer100g: 26.3, carbsPer100g: 0, fatPer100g: 6.8, typicalGrams: 100 },
  { id: 'redmeat_beef_ground_extra_lean_raw', name: 'Ground Beef', category: 'red_meat', subcategory: 'beef', cut: 'ground', prep: 'raw', fatTier: 'extra_lean', icon: '', servingType: 'weight', caloriesPer100g: 137, proteinPer100g: 21.4, carbsPer100g: 0, fatPer100g: 5, typicalGrams: 225 },
  // --- Steak/Roast cuts: trimTier ('trimmed'/'partly_trimmed'/'untrimmed') ---
  // USDA measures whole-muscle beef cuts at a "trimmed to X inches of fat"
  // level -- but for 6 of these 8 cuts (everything except Chuck and
  // Round), USDA only ever recorded TWO real trim levels: "trimmed to 0
  // inches" (fully trimmed) and "trimmed to 1/8 inch" (a thin fat cap
  // left on) -- there's no real "trimmed to 1/4 inch" data for these
  // cuts at all. So every one of these 8 cuts uses the same 2 real
  // endpoints -- Trimmed = 0" (real USDA data) and Untrimmed = 1/8" (real
  // USDA data, the fattiest level USDA measured for these cuts) -- with
  // Partly Trimmed computed as the plain average of those two, which also
  // happens to match Damon's own definition of that tier ("half of the
  // fat trimmed off"). A few individual raw-weight cells USDA never
  // recorded at all (e.g. no raw T-Bone/Porterhouse at 0" trim) were
  // filled in using the cut's own known cooking-shrinkage ratio at the
  // other trim level, rather than left blank -- see /tmp/beef_work/
  // final_compute2.py from the v0.0.13 build for the exact method.
  //
  // USDA Grade (the collapsible Choice/Select option in BeefSteakCard)
  // is NOT a separate set of rows here -- unlike trim level, grade mostly
  // just scales how much fat the SAME cut carries, so it's applied at
  // render time in LogFoodScreen.js as a per-cut fat-content ratio (see
  // BEEF_GRADE_FAT_RATIO in data/meatHierarchy.js) rather than duplicating
  // every row three more times.
  { id: 'redmeat_beef_ribeye_trimmed_raw', name: 'Beef Ribeye Steak', category: 'red_meat', subcategory: 'beef', cut: 'ribeye', prep: 'raw', trimTier: 'trimmed', icon: '', servingType: 'weight', caloriesPer100g: 228, proteinPer100g: 19.3, carbsPer100g: 0.1, fatPer100g: 16.7, typicalGrams: 227 },
  { id: 'redmeat_beef_ribeye_trimmed_cooked', name: 'Beef Ribeye Steak', category: 'red_meat', subcategory: 'beef', cut: 'ribeye', prep: 'cooked', trimTier: 'trimmed', icon: '', servingType: 'weight', caloriesPer100g: 271, proteinPer100g: 24.8, carbsPer100g: 0, fatPer100g: 19, typicalGrams: 170 },
  { id: 'redmeat_beef_ribeye_partly_trimmed_raw', name: 'Beef Ribeye Steak', category: 'red_meat', subcategory: 'beef', cut: 'ribeye', prep: 'raw', trimTier: 'partly_trimmed', icon: '', servingType: 'weight', caloriesPer100g: 236, proteinPer100g: 19.1, carbsPer100g: 0.1, fatPer100g: 17.7, typicalGrams: 227 },
  { id: 'redmeat_beef_ribeye_partly_trimmed_cooked', name: 'Beef Ribeye Steak', category: 'red_meat', subcategory: 'beef', cut: 'ribeye', prep: 'cooked', trimTier: 'partly_trimmed', icon: '', servingType: 'weight', caloriesPer100g: 281, proteinPer100g: 24.2, carbsPer100g: 0, fatPer100g: 20.4, typicalGrams: 170 },
  { id: 'redmeat_beef_ribeye_untrimmed_raw', name: 'Beef Ribeye Steak', category: 'red_meat', subcategory: 'beef', cut: 'ribeye', prep: 'raw', trimTier: 'untrimmed', icon: '', servingType: 'weight', caloriesPer100g: 244, proteinPer100g: 18.8, carbsPer100g: 0, fatPer100g: 18.7, typicalGrams: 227 },
  { id: 'redmeat_beef_ribeye_untrimmed_cooked', name: 'Beef Ribeye Steak', category: 'red_meat', subcategory: 'beef', cut: 'ribeye', prep: 'cooked', trimTier: 'untrimmed', icon: '', servingType: 'weight', caloriesPer100g: 291, proteinPer100g: 23.7, carbsPer100g: 0, fatPer100g: 21.8, typicalGrams: 170 },
  { id: 'redmeat_beef_tenderloin_filet_trimmed_raw', name: 'Beef Tenderloin / Filet Mignon', category: 'red_meat', subcategory: 'beef', cut: 'tenderloin_filet', prep: 'raw', trimTier: 'trimmed', icon: '', servingType: 'weight', caloriesPer100g: 147, proteinPer100g: 21.7, carbsPer100g: 0, fatPer100g: 6.7, typicalGrams: 227 },
  { id: 'redmeat_beef_tenderloin_filet_trimmed_cooked', name: 'Beef Tenderloin / Filet Mignon', category: 'red_meat', subcategory: 'beef', cut: 'tenderloin_filet', prep: 'cooked', trimTier: 'trimmed', icon: '', servingType: 'weight', caloriesPer100g: 211, proteinPer100g: 30.5, carbsPer100g: 0, fatPer100g: 8.9, typicalGrams: 170 },
  { id: 'redmeat_beef_tenderloin_filet_partly_trimmed_raw', name: 'Beef Tenderloin / Filet Mignon', category: 'red_meat', subcategory: 'beef', cut: 'tenderloin_filet', prep: 'raw', trimTier: 'partly_trimmed', icon: '', servingType: 'weight', caloriesPer100g: 197, proteinPer100g: 20.6, carbsPer100g: 0, fatPer100g: 12.4, typicalGrams: 227 },
  { id: 'redmeat_beef_tenderloin_filet_partly_trimmed_cooked', name: 'Beef Tenderloin / Filet Mignon', category: 'red_meat', subcategory: 'beef', cut: 'tenderloin_filet', prep: 'cooked', trimTier: 'partly_trimmed', icon: '', servingType: 'weight', caloriesPer100g: 239, proteinPer100g: 28.5, carbsPer100g: 0, fatPer100g: 13, typicalGrams: 170 },
  { id: 'redmeat_beef_tenderloin_filet_untrimmed_raw', name: 'Beef Tenderloin / Filet Mignon', category: 'red_meat', subcategory: 'beef', cut: 'tenderloin_filet', prep: 'raw', trimTier: 'untrimmed', icon: '', servingType: 'weight', caloriesPer100g: 247, proteinPer100g: 19.6, carbsPer100g: 0, fatPer100g: 18.2, typicalGrams: 227 },
  { id: 'redmeat_beef_tenderloin_filet_untrimmed_cooked', name: 'Beef Tenderloin / Filet Mignon', category: 'red_meat', subcategory: 'beef', cut: 'tenderloin_filet', prep: 'cooked', trimTier: 'untrimmed', icon: '', servingType: 'weight', caloriesPer100g: 267, proteinPer100g: 26.5, carbsPer100g: 0, fatPer100g: 17.1, typicalGrams: 170 },
  { id: 'redmeat_beef_porterhouse_tbone_trimmed_raw', name: 'Beef T-Bone / Porterhouse', category: 'red_meat', subcategory: 'beef', cut: 'porterhouse_tbone', prep: 'raw', trimTier: 'trimmed', icon: '', servingType: 'weight', caloriesPer100g: 214, proteinPer100g: 19.4, carbsPer100g: 0, fatPer100g: 14.6, typicalGrams: 227 },
  { id: 'redmeat_beef_porterhouse_tbone_trimmed_cooked', name: 'Beef T-Bone / Porterhouse', category: 'red_meat', subcategory: 'beef', cut: 'porterhouse_tbone', prep: 'cooked', trimTier: 'trimmed', icon: '', servingType: 'weight', caloriesPer100g: 276, proteinPer100g: 24, carbsPer100g: 0, fatPer100g: 19.3, typicalGrams: 170 },
  { id: 'redmeat_beef_porterhouse_tbone_partly_trimmed_raw', name: 'Beef T-Bone / Porterhouse', category: 'red_meat', subcategory: 'beef', cut: 'porterhouse_tbone', prep: 'raw', trimTier: 'partly_trimmed', icon: '', servingType: 'weight', caloriesPer100g: 214, proteinPer100g: 19.9, carbsPer100g: 0, fatPer100g: 14.4, typicalGrams: 227 },
  { id: 'redmeat_beef_porterhouse_tbone_partly_trimmed_cooked', name: 'Beef T-Bone / Porterhouse', category: 'red_meat', subcategory: 'beef', cut: 'porterhouse_tbone', prep: 'cooked', trimTier: 'partly_trimmed', icon: '', servingType: 'weight', caloriesPer100g: 276, proteinPer100g: 24.7, carbsPer100g: 0, fatPer100g: 19, typicalGrams: 170 },
  { id: 'redmeat_beef_porterhouse_tbone_untrimmed_raw', name: 'Beef T-Bone / Porterhouse', category: 'red_meat', subcategory: 'beef', cut: 'porterhouse_tbone', prep: 'raw', trimTier: 'untrimmed', icon: '', servingType: 'weight', caloriesPer100g: 214, proteinPer100g: 20.5, carbsPer100g: 0, fatPer100g: 14.1, typicalGrams: 227 },
  { id: 'redmeat_beef_porterhouse_tbone_untrimmed_cooked', name: 'Beef T-Bone / Porterhouse', category: 'red_meat', subcategory: 'beef', cut: 'porterhouse_tbone', prep: 'cooked', trimTier: 'untrimmed', icon: '', servingType: 'weight', caloriesPer100g: 276, proteinPer100g: 25.4, carbsPer100g: 0, fatPer100g: 18.6, typicalGrams: 170 },
  { id: 'redmeat_beef_ny_strip_trimmed_raw', name: 'Beef NY Strip Steak', category: 'red_meat', subcategory: 'beef', cut: 'ny_strip', prep: 'raw', trimTier: 'trimmed', icon: '', servingType: 'weight', caloriesPer100g: 163, proteinPer100g: 22.4, carbsPer100g: 0, fatPer100g: 8.2, typicalGrams: 227 },
  { id: 'redmeat_beef_ny_strip_trimmed_cooked', name: 'Beef NY Strip Steak', category: 'red_meat', subcategory: 'beef', cut: 'ny_strip', prep: 'cooked', trimTier: 'trimmed', icon: '', servingType: 'weight', caloriesPer100g: 223, proteinPer100g: 28.6, carbsPer100g: 0, fatPer100g: 11.2, typicalGrams: 170 },
  { id: 'redmeat_beef_ny_strip_partly_trimmed_raw', name: 'Beef NY Strip Steak', category: 'red_meat', subcategory: 'beef', cut: 'ny_strip', prep: 'raw', trimTier: 'partly_trimmed', icon: '', servingType: 'weight', caloriesPer100g: 181, proteinPer100g: 21.9, carbsPer100g: 0, fatPer100g: 10.4, typicalGrams: 227 },
  { id: 'redmeat_beef_ny_strip_partly_trimmed_cooked', name: 'Beef NY Strip Steak', category: 'red_meat', subcategory: 'beef', cut: 'ny_strip', prep: 'cooked', trimTier: 'partly_trimmed', icon: '', servingType: 'weight', caloriesPer100g: 244, proteinPer100g: 27.4, carbsPer100g: 0, fatPer100g: 14.4, typicalGrams: 170 },
  { id: 'redmeat_beef_ny_strip_untrimmed_raw', name: 'Beef NY Strip Steak', category: 'red_meat', subcategory: 'beef', cut: 'ny_strip', prep: 'raw', trimTier: 'untrimmed', icon: '', servingType: 'weight', caloriesPer100g: 199, proteinPer100g: 21.3, carbsPer100g: 0, fatPer100g: 12.7, typicalGrams: 227 },
  { id: 'redmeat_beef_ny_strip_untrimmed_cooked', name: 'Beef NY Strip Steak', category: 'red_meat', subcategory: 'beef', cut: 'ny_strip', prep: 'cooked', trimTier: 'untrimmed', icon: '', servingType: 'weight', caloriesPer100g: 264, proteinPer100g: 26.2, carbsPer100g: 0, fatPer100g: 17.7, typicalGrams: 170 },
  { id: 'redmeat_beef_sirloin_trimmed_raw', name: 'Beef Sirloin Steak', category: 'red_meat', subcategory: 'beef', cut: 'sirloin', prep: 'raw', trimTier: 'trimmed', icon: '', servingType: 'weight', caloriesPer100g: 175, proteinPer100g: 22, carbsPer100g: 0, fatPer100g: 8.6, typicalGrams: 227 },
  { id: 'redmeat_beef_sirloin_trimmed_cooked', name: 'Beef Sirloin Steak', category: 'red_meat', subcategory: 'beef', cut: 'sirloin', prep: 'cooked', trimTier: 'trimmed', icon: '', servingType: 'weight', caloriesPer100g: 212, proteinPer100g: 29.3, carbsPer100g: 0, fatPer100g: 9.7, typicalGrams: 170 },
  { id: 'redmeat_beef_sirloin_partly_trimmed_raw', name: 'Beef Sirloin Steak', category: 'red_meat', subcategory: 'beef', cut: 'sirloin', prep: 'raw', trimTier: 'partly_trimmed', icon: '', servingType: 'weight', caloriesPer100g: 188, proteinPer100g: 21.2, carbsPer100g: 0, fatPer100g: 10.7, typicalGrams: 227 },
  { id: 'redmeat_beef_sirloin_partly_trimmed_cooked', name: 'Beef Sirloin Steak', category: 'red_meat', subcategory: 'beef', cut: 'sirloin', prep: 'cooked', trimTier: 'partly_trimmed', icon: '', servingType: 'weight', caloriesPer100g: 228, proteinPer100g: 28.1, carbsPer100g: 0, fatPer100g: 11.9, typicalGrams: 170 },
  { id: 'redmeat_beef_sirloin_untrimmed_raw', name: 'Beef Sirloin Steak', category: 'red_meat', subcategory: 'beef', cut: 'sirloin', prep: 'raw', trimTier: 'untrimmed', icon: '', servingType: 'weight', caloriesPer100g: 201, proteinPer100g: 20.3, carbsPer100g: 0, fatPer100g: 12.7, typicalGrams: 227 },
  { id: 'redmeat_beef_sirloin_untrimmed_cooked', name: 'Beef Sirloin Steak', category: 'red_meat', subcategory: 'beef', cut: 'sirloin', prep: 'cooked', trimTier: 'untrimmed', icon: '', servingType: 'weight', caloriesPer100g: 243, proteinPer100g: 27, carbsPer100g: 0, fatPer100g: 14.2, typicalGrams: 170 },
  { id: 'redmeat_beef_chuck_trimmed_raw', name: 'Beef Chuck Roast', category: 'red_meat', subcategory: 'beef', cut: 'chuck', prep: 'raw', trimTier: 'trimmed', icon: '', servingType: 'weight', caloriesPer100g: 240, proteinPer100g: 18.4, carbsPer100g: 0, fatPer100g: 18, typicalGrams: 227 },
  { id: 'redmeat_beef_chuck_trimmed_cooked', name: 'Beef Chuck Roast', category: 'red_meat', subcategory: 'beef', cut: 'chuck', prep: 'cooked', trimTier: 'trimmed', icon: '', servingType: 'weight', caloriesPer100g: 297, proteinPer100g: 28.9, carbsPer100g: 0, fatPer100g: 19.2, typicalGrams: 170 },
  { id: 'redmeat_beef_chuck_partly_trimmed_raw', name: 'Beef Chuck Roast', category: 'red_meat', subcategory: 'beef', cut: 'chuck', prep: 'raw', trimTier: 'partly_trimmed', icon: '', servingType: 'weight', caloriesPer100g: 242, proteinPer100g: 18.8, carbsPer100g: 0, fatPer100g: 18, typicalGrams: 227 },
  { id: 'redmeat_beef_chuck_partly_trimmed_cooked', name: 'Beef Chuck Roast', category: 'red_meat', subcategory: 'beef', cut: 'chuck', prep: 'cooked', trimTier: 'partly_trimmed', icon: '', servingType: 'weight', caloriesPer100g: 300, proteinPer100g: 29.5, carbsPer100g: 0, fatPer100g: 19.2, typicalGrams: 170 },
  { id: 'redmeat_beef_chuck_untrimmed_raw', name: 'Beef Chuck Roast', category: 'red_meat', subcategory: 'beef', cut: 'chuck', prep: 'raw', trimTier: 'untrimmed', icon: '', servingType: 'weight', caloriesPer100g: 244, proteinPer100g: 19.2, carbsPer100g: 0, fatPer100g: 18, typicalGrams: 227 },
  { id: 'redmeat_beef_chuck_untrimmed_cooked', name: 'Beef Chuck Roast', category: 'red_meat', subcategory: 'beef', cut: 'chuck', prep: 'cooked', trimTier: 'untrimmed', icon: '', servingType: 'weight', caloriesPer100g: 302, proteinPer100g: 30.1, carbsPer100g: 0, fatPer100g: 19.2, typicalGrams: 170 },
  { id: 'redmeat_beef_round_trimmed_raw', name: 'Beef Round Steak', category: 'red_meat', subcategory: 'beef', cut: 'round', prep: 'raw', trimTier: 'trimmed', icon: '', servingType: 'weight', caloriesPer100g: 124, proteinPer100g: 23.5, carbsPer100g: 0, fatPer100g: 3.3, typicalGrams: 227 },
  { id: 'redmeat_beef_round_trimmed_cooked', name: 'Beef Round Steak', category: 'red_meat', subcategory: 'beef', cut: 'round', prep: 'cooked', trimTier: 'trimmed', icon: '', servingType: 'weight', caloriesPer100g: 167, proteinPer100g: 30, carbsPer100g: 0, fatPer100g: 4.3, typicalGrams: 170 },
  { id: 'redmeat_beef_round_partly_trimmed_raw', name: 'Beef Round Steak', category: 'red_meat', subcategory: 'beef', cut: 'round', prep: 'raw', trimTier: 'partly_trimmed', icon: '', servingType: 'weight', caloriesPer100g: 145, proteinPer100g: 22.8, carbsPer100g: 0, fatPer100g: 5.6, typicalGrams: 227 },
  { id: 'redmeat_beef_round_partly_trimmed_cooked', name: 'Beef Round Steak', category: 'red_meat', subcategory: 'beef', cut: 'round', prep: 'cooked', trimTier: 'partly_trimmed', icon: '', servingType: 'weight', caloriesPer100g: 186, proteinPer100g: 30.4, carbsPer100g: 0, fatPer100g: 6.6, typicalGrams: 170 },
  { id: 'redmeat_beef_round_untrimmed_raw', name: 'Beef Round Steak', category: 'red_meat', subcategory: 'beef', cut: 'round', prep: 'raw', trimTier: 'untrimmed', icon: '', servingType: 'weight', caloriesPer100g: 166, proteinPer100g: 22.1, carbsPer100g: 0, fatPer100g: 7.9, typicalGrams: 227 },
  { id: 'redmeat_beef_round_untrimmed_cooked', name: 'Beef Round Steak', category: 'red_meat', subcategory: 'beef', cut: 'round', prep: 'cooked', trimTier: 'untrimmed', icon: '', servingType: 'weight', caloriesPer100g: 204, proteinPer100g: 30.7, carbsPer100g: 0, fatPer100g: 9, typicalGrams: 170 },
  { id: 'redmeat_beef_brisket_trimmed_raw', name: 'Beef Brisket', category: 'red_meat', subcategory: 'beef', cut: 'brisket', prep: 'raw', trimTier: 'trimmed', icon: '', servingType: 'weight', caloriesPer100g: 165, proteinPer100g: 20.3, carbsPer100g: 0, fatPer100g: 9.3, typicalGrams: 227 },
  { id: 'redmeat_beef_brisket_trimmed_cooked', name: 'Beef Brisket', category: 'red_meat', subcategory: 'beef', cut: 'brisket', prep: 'cooked', trimTier: 'trimmed', icon: '', servingType: 'weight', caloriesPer100g: 213, proteinPer100g: 32.9, carbsPer100g: 0, fatPer100g: 8, typicalGrams: 170 },
  { id: 'redmeat_beef_brisket_partly_trimmed_raw', name: 'Beef Brisket', category: 'red_meat', subcategory: 'beef', cut: 'brisket', prep: 'raw', trimTier: 'partly_trimmed', icon: '', servingType: 'weight', caloriesPer100g: 221, proteinPer100g: 19.1, carbsPer100g: 0, fatPer100g: 15.7, typicalGrams: 227 },
  { id: 'redmeat_beef_brisket_partly_trimmed_cooked', name: 'Beef Brisket', category: 'red_meat', subcategory: 'beef', cut: 'brisket', prep: 'cooked', trimTier: 'partly_trimmed', icon: '', servingType: 'weight', caloriesPer100g: 251, proteinPer100g: 30.9, carbsPer100g: 0, fatPer100g: 13.2, typicalGrams: 170 },
  { id: 'redmeat_beef_brisket_untrimmed_raw', name: 'Beef Brisket', category: 'red_meat', subcategory: 'beef', cut: 'brisket', prep: 'raw', trimTier: 'untrimmed', icon: '', servingType: 'weight', caloriesPer100g: 277, proteinPer100g: 17.9, carbsPer100g: 0, fatPer100g: 22.2, typicalGrams: 227 },
  { id: 'redmeat_beef_brisket_untrimmed_cooked', name: 'Beef Brisket', category: 'red_meat', subcategory: 'beef', cut: 'brisket', prep: 'cooked', trimTier: 'untrimmed', icon: '', servingType: 'weight', caloriesPer100g: 289, proteinPer100g: 28.8, carbsPer100g: 0, fatPer100g: 18.4, typicalGrams: 170 },
  // --- Beef cuts that keep the plain flat raw/cooked card (no toggle) ---
  // USDA only ever measured Flank, Skirt, and Short Ribs at one fat-trim
  // level (fully trimmed) -- no fattier version exists to build a toggle
  // out of. Shank has just 2 total USDA records (raw + cooked, Choice
  // grade only) -- too sparse for any toggle. Organs and Other Cuts never
  // had a trim-level concept to begin with. Unchanged from before v0.0.13.
  { id: 'redmeat_beef_flank_cooked', name: 'Beef Flank Steak', category: 'red_meat', subcategory: 'beef', cut: 'flank', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 243, proteinPer100g: 29.1, carbsPer100g: 0, fatPer100g: 14.1, typicalGrams: 160 },
  { id: 'redmeat_beef_flank_raw', name: 'Beef Flank Steak', category: 'red_meat', subcategory: 'beef', cut: 'flank', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 171, proteinPer100g: 20.1, carbsPer100g: 0, fatPer100g: 9.4, typicalGrams: 114 },
  { id: 'redmeat_beef_organs_cooked', name: 'Beef Liver & Organs', category: 'red_meat', subcategory: 'beef', cut: 'organs', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 174, proteinPer100g: 26.3, carbsPer100g: 5.1, fatPer100g: 4.6, typicalGrams: 85 },
  { id: 'redmeat_beef_organs_raw', name: 'Beef Liver & Organs', category: 'red_meat', subcategory: 'beef', cut: 'organs', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 303, proteinPer100g: 11.5, carbsPer100g: 0, fatPer100g: 28.6, typicalGrams: 113 },
  { id: 'redmeat_beef_other_cooked', name: 'Beef Other Cuts', category: 'red_meat', subcategory: 'beef', cut: 'other', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 206, proteinPer100g: 29.1, carbsPer100g: 0, fatPer100g: 9.7, typicalGrams: 60 },
  { id: 'redmeat_beef_other_raw', name: 'Beef Other Cuts', category: 'red_meat', subcategory: 'beef', cut: 'other', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 128, proteinPer100g: 22.2, carbsPer100g: 0.1, fatPer100g: 4.4, typicalGrams: 113 },
  { id: 'redmeat_beef_shank_cooked', name: 'Beef Shank', category: 'red_meat', subcategory: 'beef', cut: 'shank', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 201, proteinPer100g: 33.7, carbsPer100g: 0, fatPer100g: 6.4, typicalGrams: 85 },
  { id: 'redmeat_beef_shank_raw', name: 'Beef Shank', category: 'red_meat', subcategory: 'beef', cut: 'shank', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 128, proteinPer100g: 21.8, carbsPer100g: 0, fatPer100g: 3.9, typicalGrams: 454 },
  { id: 'redmeat_beef_short_ribs_cooked', name: 'Beef Short Ribs', category: 'red_meat', subcategory: 'beef', cut: 'short_ribs', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 253, proteinPer100g: 18.2, carbsPer100g: 12.1, fatPer100g: 14.1, typicalGrams: 140 },
  { id: 'redmeat_beef_short_ribs_raw', name: 'Beef Short Ribs', category: 'red_meat', subcategory: 'beef', cut: 'short_ribs', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 175, proteinPer100g: 19, carbsPer100g: 0.4, fatPer100g: 10.2, typicalGrams: 454 },
  { id: 'redmeat_beef_skirt_cooked', name: 'Beef Skirt Steak', category: 'red_meat', subcategory: 'beef', cut: 'skirt', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 205, proteinPer100g: 26.7, carbsPer100g: 0, fatPer100g: 10.1, typicalGrams: 85 },
  { id: 'redmeat_beef_skirt_raw', name: 'Beef Skirt Steak', category: 'red_meat', subcategory: 'beef', cut: 'skirt', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 171, proteinPer100g: 20.9, carbsPer100g: 0, fatPer100g: 9.8, typicalGrams: 388 },
  // --- pork ---
  // Trim tiers below follow Beef's method exactly: Trimmed and Untrimmed
  // are both real USDA measurements, Partly Trimmed is their average. The
  // one difference worth knowing is WHICH measurements -- Beef's tiers are
  // external trim depth (trimmed to 0" vs 1/8"), which USDA simply does not
  // record for pork; pork's are 'separable lean only' vs 'separable lean and
  // fat'. Same idea (how much fat is still attached), different measurement,
  // so don't expect a beef and a pork tier to mean the identical thing.
  // pork / tenderloin
  { id: 'redmeat_pork_tenderloin_trimmed_raw', name: 'Pork Tenderloin', category: 'red_meat', subcategory: 'pork', cut: 'tenderloin', trimTier: 'trimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 109, proteinPer100g: 21.0, carbsPer100g: 0.0, fatPer100g: 2.2, typicalGrams: 227 },
  { id: 'redmeat_pork_tenderloin_partly_trimmed_raw', name: 'Pork Tenderloin', category: 'red_meat', subcategory: 'pork', cut: 'tenderloin', trimTier: 'partly_trimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 114, proteinPer100g: 20.8, carbsPer100g: 0.0, fatPer100g: 2.9, typicalGrams: 227 },
  { id: 'redmeat_pork_tenderloin_untrimmed_raw', name: 'Pork Tenderloin', category: 'red_meat', subcategory: 'pork', cut: 'tenderloin', trimTier: 'untrimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 120, proteinPer100g: 20.6, carbsPer100g: 0.0, fatPer100g: 3.5, typicalGrams: 227 },
  { id: 'redmeat_pork_tenderloin_trimmed_cooked', name: 'Pork Tenderloin', category: 'red_meat', subcategory: 'pork', cut: 'tenderloin', trimTier: 'trimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 187, proteinPer100g: 30.4, carbsPer100g: 0.0, fatPer100g: 6.3, typicalGrams: 170 },
  { id: 'redmeat_pork_tenderloin_partly_trimmed_cooked', name: 'Pork Tenderloin', category: 'red_meat', subcategory: 'pork', cut: 'tenderloin', trimTier: 'partly_trimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 194, proteinPer100g: 30.2, carbsPer100g: 0.0, fatPer100g: 7.2, typicalGrams: 170 },
  { id: 'redmeat_pork_tenderloin_untrimmed_cooked', name: 'Pork Tenderloin', category: 'red_meat', subcategory: 'pork', cut: 'tenderloin', trimTier: 'untrimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 201, proteinPer100g: 29.9, carbsPer100g: 0.0, fatPer100g: 8.1, typicalGrams: 170 },
  // pork / chops
  { id: 'redmeat_pork_chops_trimmed_raw', name: 'Pork Chops', category: 'red_meat', subcategory: 'pork', cut: 'chops', trimTier: 'trimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 127, proteinPer100g: 22.0, carbsPer100g: 0.0, fatPer100g: 3.7, typicalGrams: 227 },
  { id: 'redmeat_pork_chops_partly_trimmed_raw', name: 'Pork Chops', category: 'red_meat', subcategory: 'pork', cut: 'chops', trimTier: 'partly_trimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 148, proteinPer100g: 21.4, carbsPer100g: 0.0, fatPer100g: 6.4, typicalGrams: 227 },
  { id: 'redmeat_pork_chops_untrimmed_raw', name: 'Pork Chops', category: 'red_meat', subcategory: 'pork', cut: 'chops', trimTier: 'untrimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 170, proteinPer100g: 20.7, carbsPer100g: 0.0, fatPer100g: 9.0, typicalGrams: 227 },
  { id: 'redmeat_pork_chops_trimmed_cooked', name: 'Pork Chops', category: 'red_meat', subcategory: 'pork', cut: 'chops', trimTier: 'trimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 200, proteinPer100g: 30.2, carbsPer100g: 0.0, fatPer100g: 7.9, typicalGrams: 170 },
  { id: 'redmeat_pork_chops_partly_trimmed_cooked', name: 'Pork Chops', category: 'red_meat', subcategory: 'pork', cut: 'chops', trimTier: 'partly_trimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 221, proteinPer100g: 29.2, carbsPer100g: 0.0, fatPer100g: 10.7, typicalGrams: 170 },
  { id: 'redmeat_pork_chops_untrimmed_cooked', name: 'Pork Chops', category: 'red_meat', subcategory: 'pork', cut: 'chops', trimTier: 'untrimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 242, proteinPer100g: 28.2, carbsPer100g: 0.0, fatPer100g: 13.5, typicalGrams: 170 },
  // pork / loin
  { id: 'redmeat_pork_loin_trimmed_raw', name: 'Pork Loin', category: 'red_meat', subcategory: 'pork', cut: 'loin', trimTier: 'trimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 143, proteinPer100g: 21.4, carbsPer100g: 0.0, fatPer100g: 5.7, typicalGrams: 227 },
  { id: 'redmeat_pork_loin_partly_trimmed_raw', name: 'Pork Loin', category: 'red_meat', subcategory: 'pork', cut: 'loin', trimTier: 'partly_trimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 170, proteinPer100g: 20.6, carbsPer100g: 0.0, fatPer100g: 9.1, typicalGrams: 227 },
  { id: 'redmeat_pork_loin_untrimmed_raw', name: 'Pork Loin', category: 'red_meat', subcategory: 'pork', cut: 'loin', trimTier: 'untrimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 198, proteinPer100g: 19.7, carbsPer100g: 0.0, fatPer100g: 12.6, typicalGrams: 227 },
  { id: 'redmeat_pork_loin_trimmed_cooked', name: 'Pork Loin', category: 'red_meat', subcategory: 'pork', cut: 'loin', trimTier: 'trimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 204, proteinPer100g: 28.6, carbsPer100g: 0.0, fatPer100g: 9.1, typicalGrams: 170 },
  { id: 'redmeat_pork_loin_partly_trimmed_cooked', name: 'Pork Loin', category: 'red_meat', subcategory: 'pork', cut: 'loin', trimTier: 'partly_trimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 222, proteinPer100g: 27.9, carbsPer100g: 0.0, fatPer100g: 11.4, typicalGrams: 170 },
  { id: 'redmeat_pork_loin_untrimmed_cooked', name: 'Pork Loin', category: 'red_meat', subcategory: 'pork', cut: 'loin', trimTier: 'untrimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 239, proteinPer100g: 27.2, carbsPer100g: 0.0, fatPer100g: 13.6, typicalGrams: 170 },
  // pork / shoulder_butt
  { id: 'redmeat_pork_shoulder_butt_trimmed_raw', name: 'Shoulder / Pork Butt', category: 'red_meat', subcategory: 'pork', cut: 'shoulder_butt', trimTier: 'trimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 132, proteinPer100g: 18.7, carbsPer100g: 0.0, fatPer100g: 5.7, typicalGrams: 227 },
  { id: 'redmeat_pork_shoulder_butt_partly_trimmed_raw', name: 'Shoulder / Pork Butt', category: 'red_meat', subcategory: 'pork', cut: 'shoulder_butt', trimTier: 'partly_trimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 159, proteinPer100g: 18.1, carbsPer100g: 0.0, fatPer100g: 9.1, typicalGrams: 227 },
  { id: 'redmeat_pork_shoulder_butt_untrimmed_raw', name: 'Shoulder / Pork Butt', category: 'red_meat', subcategory: 'pork', cut: 'shoulder_butt', trimTier: 'untrimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 186, proteinPer100g: 17.4, carbsPer100g: 0.0, fatPer100g: 12.4, typicalGrams: 227 },
  { id: 'redmeat_pork_shoulder_butt_trimmed_cooked', name: 'Shoulder / Pork Butt', category: 'red_meat', subcategory: 'pork', cut: 'shoulder_butt', trimTier: 'trimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 233, proteinPer100g: 26.6, carbsPer100g: 0.0, fatPer100g: 13.2, typicalGrams: 170 },
  { id: 'redmeat_pork_shoulder_butt_partly_trimmed_cooked', name: 'Shoulder / Pork Butt', category: 'red_meat', subcategory: 'pork', cut: 'shoulder_butt', trimTier: 'partly_trimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 250, proteinPer100g: 25.9, carbsPer100g: 0.0, fatPer100g: 15.5, typicalGrams: 170 },
  { id: 'redmeat_pork_shoulder_butt_untrimmed_cooked', name: 'Shoulder / Pork Butt', category: 'red_meat', subcategory: 'pork', cut: 'shoulder_butt', trimTier: 'untrimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 267, proteinPer100g: 25.1, carbsPer100g: 0.0, fatPer100g: 17.7, typicalGrams: 170 },
  // pork / ham_fresh
  { id: 'redmeat_pork_ham_fresh_trimmed_raw', name: 'Fresh Ham (Leg)', category: 'red_meat', subcategory: 'pork', cut: 'ham_fresh', trimTier: 'trimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 136, proteinPer100g: 20.5, carbsPer100g: 0.0, fatPer100g: 5.4, typicalGrams: 227 },
  { id: 'redmeat_pork_ham_fresh_partly_trimmed_raw', name: 'Fresh Ham (Leg)', category: 'red_meat', subcategory: 'pork', cut: 'ham_fresh', trimTier: 'partly_trimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 190, proteinPer100g: 19.0, carbsPer100g: 0.0, fatPer100g: 12.2, typicalGrams: 227 },
  { id: 'redmeat_pork_ham_fresh_untrimmed_raw', name: 'Fresh Ham (Leg)', category: 'red_meat', subcategory: 'pork', cut: 'ham_fresh', trimTier: 'untrimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 245, proteinPer100g: 17.4, carbsPer100g: 0.0, fatPer100g: 18.9, typicalGrams: 227 },
  { id: 'redmeat_pork_ham_fresh_trimmed_cooked', name: 'Fresh Ham (Leg)', category: 'red_meat', subcategory: 'pork', cut: 'ham_fresh', trimTier: 'trimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 211, proteinPer100g: 29.4, carbsPer100g: 0.0, fatPer100g: 9.4, typicalGrams: 170 },
  { id: 'redmeat_pork_ham_fresh_partly_trimmed_cooked', name: 'Fresh Ham (Leg)', category: 'red_meat', subcategory: 'pork', cut: 'ham_fresh', trimTier: 'partly_trimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 242, proteinPer100g: 28.1, carbsPer100g: 0.0, fatPer100g: 13.5, typicalGrams: 170 },
  { id: 'redmeat_pork_ham_fresh_untrimmed_cooked', name: 'Fresh Ham (Leg)', category: 'red_meat', subcategory: 'pork', cut: 'ham_fresh', trimTier: 'untrimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 273, proteinPer100g: 26.8, carbsPer100g: 0.0, fatPer100g: 17.6, typicalGrams: 170 },
  // pork / backribs
  { id: 'redmeat_pork_backribs_trimmed_raw', name: 'Baby Back Ribs', category: 'red_meat', subcategory: 'pork', cut: 'backribs', trimTier: 'trimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 172, proteinPer100g: 20.8, carbsPer100g: 0.0, fatPer100g: 9.8, typicalGrams: 340 },
  { id: 'redmeat_pork_backribs_partly_trimmed_raw', name: 'Baby Back Ribs', category: 'red_meat', subcategory: 'pork', cut: 'backribs', trimTier: 'partly_trimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 198, proteinPer100g: 20.0, carbsPer100g: 0.0, fatPer100g: 13.1, typicalGrams: 340 },
  { id: 'redmeat_pork_backribs_untrimmed_raw', name: 'Baby Back Ribs', category: 'red_meat', subcategory: 'pork', cut: 'backribs', trimTier: 'untrimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 224, proteinPer100g: 19.1, carbsPer100g: 0.0, fatPer100g: 16.3, typicalGrams: 340 },
  { id: 'redmeat_pork_backribs_trimmed_cooked', name: 'Baby Back Ribs', category: 'red_meat', subcategory: 'pork', cut: 'backribs', trimTier: 'trimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 255, proteinPer100g: 24.2, carbsPer100g: 0.0, fatPer100g: 17.6, typicalGrams: 225 },
  { id: 'redmeat_pork_backribs_partly_trimmed_cooked', name: 'Baby Back Ribs', category: 'red_meat', subcategory: 'pork', cut: 'backribs', trimTier: 'partly_trimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 274, proteinPer100g: 23.6, carbsPer100g: 0.0, fatPer100g: 19.6, typicalGrams: 225 },
  { id: 'redmeat_pork_backribs_untrimmed_cooked', name: 'Baby Back Ribs', category: 'red_meat', subcategory: 'pork', cut: 'backribs', trimTier: 'untrimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 292, proteinPer100g: 23.0, carbsPer100g: 0.0, fatPer100g: 21.5, typicalGrams: 225 },
  // pork / country_ribs
  { id: 'redmeat_pork_country_ribs_trimmed_raw', name: 'Country-Style Ribs', category: 'red_meat', subcategory: 'pork', cut: 'country_ribs', trimTier: 'trimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 140, proteinPer100g: 20.8, carbsPer100g: 0.0, fatPer100g: 5.6, typicalGrams: 227 },
  { id: 'redmeat_pork_country_ribs_partly_trimmed_raw', name: 'Country-Style Ribs', category: 'red_meat', subcategory: 'pork', cut: 'country_ribs', trimTier: 'partly_trimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 164, proteinPer100g: 20.1, carbsPer100g: 0.0, fatPer100g: 8.7, typicalGrams: 227 },
  { id: 'redmeat_pork_country_ribs_untrimmed_raw', name: 'Country-Style Ribs', category: 'red_meat', subcategory: 'pork', cut: 'country_ribs', trimTier: 'untrimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 189, proteinPer100g: 19.3, carbsPer100g: 0.0, fatPer100g: 11.8, typicalGrams: 227 },
  { id: 'redmeat_pork_country_ribs_trimmed_cooked', name: 'Country-Style Ribs', category: 'red_meat', subcategory: 'pork', cut: 'country_ribs', trimTier: 'trimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 247, proteinPer100g: 27.7, carbsPer100g: 0.0, fatPer100g: 14.3, typicalGrams: 170 },
  { id: 'redmeat_pork_country_ribs_partly_trimmed_cooked', name: 'Country-Style Ribs', category: 'red_meat', subcategory: 'pork', cut: 'country_ribs', trimTier: 'partly_trimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 260, proteinPer100g: 27.1, carbsPer100g: 0.0, fatPer100g: 16.0, typicalGrams: 170 },
  { id: 'redmeat_pork_country_ribs_untrimmed_cooked', name: 'Country-Style Ribs', category: 'red_meat', subcategory: 'pork', cut: 'country_ribs', trimTier: 'untrimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 273, proteinPer100g: 26.5, carbsPer100g: 0.0, fatPer100g: 17.7, typicalGrams: 170 },
  // pork / ground -- USDA carries 72%/84%/96% lean ground pork, so this
  // gets a Fat % toggle like Ground Beef (3 tiers rather than beef's 4).
  // Regular's RAW row is the one substitution in this file: USDA has no raw
  // 72/28 entry, so plain 'Pork, fresh, ground, raw' (21.2g fat, squarely in
  // 72/28 territory) stands in for it -- Damon's call, made explicitly rather
  // than silently.
  { id: 'redmeat_pork_ground_regular_raw', name: 'Ground Pork', category: 'red_meat', subcategory: 'pork', cut: 'ground', fatTier: 'regular', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 263, proteinPer100g: 16.9, carbsPer100g: 0.0, fatPer100g: 21.2, typicalGrams: 225 },
  { id: 'redmeat_pork_ground_regular_cooked', name: 'Ground Pork', category: 'red_meat', subcategory: 'pork', cut: 'ground', fatTier: 'regular', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 393, proteinPer100g: 22.8, carbsPer100g: 1.4, fatPer100g: 32.9, typicalGrams: 100 },
  { id: 'redmeat_pork_ground_medium_raw', name: 'Ground Pork', category: 'red_meat', subcategory: 'pork', cut: 'ground', fatTier: 'medium', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 218, proteinPer100g: 18.0, carbsPer100g: 0.4, fatPer100g: 16.0, typicalGrams: 225 },
  { id: 'redmeat_pork_ground_medium_cooked', name: 'Ground Pork', category: 'red_meat', subcategory: 'pork', cut: 'ground', fatTier: 'medium', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 289, proteinPer100g: 26.7, carbsPer100g: 0.6, fatPer100g: 20.0, typicalGrams: 100 },
  { id: 'redmeat_pork_ground_lean_raw', name: 'Ground Pork', category: 'red_meat', subcategory: 'pork', cut: 'ground', fatTier: 'lean', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 121, proteinPer100g: 21.1, carbsPer100g: 0.2, fatPer100g: 4.0, typicalGrams: 225 },
  { id: 'redmeat_pork_ground_lean_cooked', name: 'Ground Pork', category: 'red_meat', subcategory: 'pork', cut: 'ground', fatTier: 'lean', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 187, proteinPer100g: 30.6, carbsPer100g: 0.0, fatPer100g: 7.2, typicalGrams: 100 },
  // pork / spareribs
  { id: 'redmeat_pork_spareribs_raw', name: 'Pork Spareribs', category: 'red_meat', subcategory: 'pork', cut: 'spareribs', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 277, proteinPer100g: 15.5, carbsPer100g: 0.0, fatPer100g: 23.4, typicalGrams: 340 },
  { id: 'redmeat_pork_spareribs_cooked', name: 'Pork Spareribs', category: 'red_meat', subcategory: 'pork', cut: 'spareribs', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 397, proteinPer100g: 29.1, carbsPer100g: 0.0, fatPer100g: 30.3, typicalGrams: 225 },
  // pork / belly
  { id: 'redmeat_pork_belly_raw', name: 'Pork Belly', category: 'red_meat', subcategory: 'pork', cut: 'belly', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 518, proteinPer100g: 9.3, carbsPer100g: 0.0, fatPer100g: 53.0, typicalGrams: 113 },
  { id: 'redmeat_pork_belly_cooked', name: 'Pork Belly', category: 'red_meat', subcategory: 'pork', cut: 'belly', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 404, proteinPer100g: 26.6, carbsPer100g: 0.0, fatPer100g: 32.2, typicalGrams: 85 },
  // pork / organs
  { id: 'redmeat_pork_organs_raw', name: 'Pork Liver & Organs', category: 'red_meat', subcategory: 'pork', cut: 'organs', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 134, proteinPer100g: 21.4, carbsPer100g: 2.5, fatPer100g: 3.7, typicalGrams: 113 },
  { id: 'redmeat_pork_organs_cooked', name: 'Pork Liver & Organs', category: 'red_meat', subcategory: 'pork', cut: 'organs', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 165, proteinPer100g: 26.0, carbsPer100g: 3.8, fatPer100g: 4.4, typicalGrams: 85 },
  // pork / other
  { id: 'redmeat_pork_other_raw', name: 'Pork Other Cuts', category: 'red_meat', subcategory: 'pork', cut: 'other', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 134, proteinPer100g: 21.2, carbsPer100g: 0.0, fatPer100g: 4.9, typicalGrams: 113 },
  { id: 'redmeat_pork_other_cooked', name: 'Pork Other Cuts', category: 'red_meat', subcategory: 'pork', cut: 'other', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 201, proteinPer100g: 27.5, carbsPer100g: 0.0, fatPer100g: 9.2, typicalGrams: 85 },
  // --- lamb ---
  // DOMESTIC lamb only. USDA also carries Australian and New Zealand
  // lamb, which run meaningfully leaner (14.7g and 17.3g mean fat vs
  // domestic's 20.1g); folding them in would quietly skew every number
  // here, and splitting them out would need an Origin toggle and 2-3x
  // the icons. Damon's call was domestic-only for now.
  //
  // Trim tiers use the same 2-real-measurements-plus-midpoint method as
  // Beef and Pork. Lamb is the one species carrying BOTH of USDA's fat
  // descriptors (external depth AND separable lean), so which to use
  // needed deciding: the 1/8" depth rows have no separable-lean-only
  // counterpart at all, so only 'trimmed to 1/4" fat' supports a
  // complete three-tier ladder. Trimmed = lean only at 1/4",
  // Untrimmed = lean and fat at 1/4".
  // lamb / leg
  { id: 'redmeat_lamb_leg_trimmed_raw', name: 'Leg of Lamb', category: 'red_meat', subcategory: 'lamb', cut: 'leg', trimTier: 'trimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 128, proteinPer100g: 20.6, carbsPer100g: 0.0, fatPer100g: 4.5, typicalGrams: 227 },
  { id: 'redmeat_lamb_leg_partly_trimmed_raw', name: 'Leg of Lamb', category: 'red_meat', subcategory: 'lamb', cut: 'leg', trimTier: 'partly_trimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 179, proteinPer100g: 19.3, carbsPer100g: 0.0, fatPer100g: 10.8, typicalGrams: 227 },
  { id: 'redmeat_lamb_leg_untrimmed_raw', name: 'Leg of Lamb', category: 'red_meat', subcategory: 'lamb', cut: 'leg', trimTier: 'untrimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 230, proteinPer100g: 17.9, carbsPer100g: 0.0, fatPer100g: 17.1, typicalGrams: 227 },
  { id: 'redmeat_lamb_leg_trimmed_cooked', name: 'Leg of Lamb', category: 'red_meat', subcategory: 'lamb', cut: 'leg', trimTier: 'trimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 191, proteinPer100g: 28.3, carbsPer100g: 0.0, fatPer100g: 7.7, typicalGrams: 170 },
  { id: 'redmeat_lamb_leg_partly_trimmed_cooked', name: 'Leg of Lamb', category: 'red_meat', subcategory: 'lamb', cut: 'leg', trimTier: 'partly_trimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 224, proteinPer100g: 27.0, carbsPer100g: 0.0, fatPer100g: 12.1, typicalGrams: 170 },
  { id: 'redmeat_lamb_leg_untrimmed_cooked', name: 'Leg of Lamb', category: 'red_meat', subcategory: 'lamb', cut: 'leg', trimTier: 'untrimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 258, proteinPer100g: 25.6, carbsPer100g: 0.0, fatPer100g: 16.5, typicalGrams: 170 },
  // lamb / loin
  { id: 'redmeat_lamb_loin_trimmed_raw', name: 'Lamb Loin', category: 'red_meat', subcategory: 'lamb', cut: 'loin', trimTier: 'trimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 143, proteinPer100g: 20.9, carbsPer100g: 0.0, fatPer100g: 5.9, typicalGrams: 227 },
  { id: 'redmeat_lamb_loin_partly_trimmed_raw', name: 'Lamb Loin', category: 'red_meat', subcategory: 'lamb', cut: 'loin', trimTier: 'partly_trimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 226, proteinPer100g: 18.6, carbsPer100g: 0.0, fatPer100g: 16.3, typicalGrams: 227 },
  { id: 'redmeat_lamb_loin_untrimmed_raw', name: 'Lamb Loin', category: 'red_meat', subcategory: 'lamb', cut: 'loin', trimTier: 'untrimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 310, proteinPer100g: 16.3, carbsPer100g: 0.0, fatPer100g: 26.6, typicalGrams: 227 },
  { id: 'redmeat_lamb_loin_trimmed_cooked', name: 'Lamb Loin', category: 'red_meat', subcategory: 'lamb', cut: 'loin', trimTier: 'trimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 216, proteinPer100g: 30.0, carbsPer100g: 0.0, fatPer100g: 9.7, typicalGrams: 170 },
  { id: 'redmeat_lamb_loin_partly_trimmed_cooked', name: 'Lamb Loin', category: 'red_meat', subcategory: 'lamb', cut: 'loin', trimTier: 'partly_trimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 266, proteinPer100g: 27.6, carbsPer100g: 0.0, fatPer100g: 16.4, typicalGrams: 170 },
  { id: 'redmeat_lamb_loin_untrimmed_cooked', name: 'Lamb Loin', category: 'red_meat', subcategory: 'lamb', cut: 'loin', trimTier: 'untrimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 316, proteinPer100g: 25.2, carbsPer100g: 0.0, fatPer100g: 23.1, typicalGrams: 170 },
  // lamb / rib_rack
  { id: 'redmeat_lamb_rib_rack_trimmed_raw', name: 'Lamb Rib / Rack', category: 'red_meat', subcategory: 'lamb', cut: 'rib_rack', trimTier: 'trimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 169, proteinPer100g: 20.0, carbsPer100g: 0.0, fatPer100g: 9.2, typicalGrams: 227 },
  { id: 'redmeat_lamb_rib_rack_partly_trimmed_raw', name: 'Lamb Rib / Rack', category: 'red_meat', subcategory: 'lamb', cut: 'rib_rack', trimTier: 'partly_trimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 270, proteinPer100g: 17.3, carbsPer100g: 0.0, fatPer100g: 21.8, typicalGrams: 227 },
  { id: 'redmeat_lamb_rib_rack_untrimmed_raw', name: 'Lamb Rib / Rack', category: 'red_meat', subcategory: 'lamb', cut: 'rib_rack', trimTier: 'untrimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 372, proteinPer100g: 14.5, carbsPer100g: 0.0, fatPer100g: 34.4, typicalGrams: 227 },
  { id: 'redmeat_lamb_rib_rack_trimmed_cooked', name: 'Lamb Rib / Rack', category: 'red_meat', subcategory: 'lamb', cut: 'rib_rack', trimTier: 'trimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 235, proteinPer100g: 27.7, carbsPer100g: 0.0, fatPer100g: 13.0, typicalGrams: 170 },
  { id: 'redmeat_lamb_rib_rack_partly_trimmed_cooked', name: 'Lamb Rib / Rack', category: 'red_meat', subcategory: 'lamb', cut: 'rib_rack', trimTier: 'partly_trimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 298, proteinPer100g: 24.9, carbsPer100g: 0.0, fatPer100g: 21.3, typicalGrams: 170 },
  { id: 'redmeat_lamb_rib_rack_untrimmed_cooked', name: 'Lamb Rib / Rack', category: 'red_meat', subcategory: 'lamb', cut: 'rib_rack', trimTier: 'untrimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 361, proteinPer100g: 22.1, carbsPer100g: 0.0, fatPer100g: 29.6, typicalGrams: 170 },
  // lamb / shoulder
  { id: 'redmeat_lamb_shoulder_trimmed_raw', name: 'Lamb Shoulder', category: 'red_meat', subcategory: 'lamb', cut: 'shoulder', trimTier: 'trimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 144, proteinPer100g: 19.6, carbsPer100g: 0.0, fatPer100g: 6.8, typicalGrams: 227 },
  { id: 'redmeat_lamb_shoulder_partly_trimmed_raw', name: 'Lamb Shoulder', category: 'red_meat', subcategory: 'lamb', cut: 'shoulder', trimTier: 'partly_trimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 204, proteinPer100g: 18.1, carbsPer100g: 0.0, fatPer100g: 14.1, typicalGrams: 227 },
  { id: 'redmeat_lamb_shoulder_untrimmed_raw', name: 'Lamb Shoulder', category: 'red_meat', subcategory: 'lamb', cut: 'shoulder', trimTier: 'untrimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 264, proteinPer100g: 16.6, carbsPer100g: 0.0, fatPer100g: 21.4, typicalGrams: 227 },
  { id: 'redmeat_lamb_shoulder_trimmed_cooked', name: 'Lamb Shoulder', category: 'red_meat', subcategory: 'lamb', cut: 'shoulder', trimTier: 'trimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 283, proteinPer100g: 32.8, carbsPer100g: 0.0, fatPer100g: 15.9, typicalGrams: 170 },
  { id: 'redmeat_lamb_shoulder_partly_trimmed_cooked', name: 'Lamb Shoulder', category: 'red_meat', subcategory: 'lamb', cut: 'shoulder', trimTier: 'partly_trimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 314, proteinPer100g: 30.8, carbsPer100g: 0.0, fatPer100g: 20.3, typicalGrams: 170 },
  { id: 'redmeat_lamb_shoulder_untrimmed_cooked', name: 'Lamb Shoulder', category: 'red_meat', subcategory: 'lamb', cut: 'shoulder', trimTier: 'untrimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 344, proteinPer100g: 28.7, carbsPer100g: 0.0, fatPer100g: 24.6, typicalGrams: 170 },
  // lamb / shank
  { id: 'redmeat_lamb_shank_trimmed_raw', name: 'Lamb Shank', category: 'red_meat', subcategory: 'lamb', cut: 'shank', trimTier: 'trimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 120, proteinPer100g: 21.1, carbsPer100g: 0.0, fatPer100g: 3.3, typicalGrams: 227 },
  { id: 'redmeat_lamb_shank_partly_trimmed_raw', name: 'Lamb Shank', category: 'red_meat', subcategory: 'lamb', cut: 'shank', trimTier: 'partly_trimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 160, proteinPer100g: 20.0, carbsPer100g: 0.0, fatPer100g: 8.3, typicalGrams: 227 },
  { id: 'redmeat_lamb_shank_untrimmed_raw', name: 'Lamb Shank', category: 'red_meat', subcategory: 'lamb', cut: 'shank', trimTier: 'untrimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 201, proteinPer100g: 18.9, carbsPer100g: 0.0, fatPer100g: 13.4, typicalGrams: 227 },
  { id: 'redmeat_lamb_shank_trimmed_cooked', name: 'Lamb Shank', category: 'red_meat', subcategory: 'lamb', cut: 'shank', trimTier: 'trimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 187, proteinPer100g: 31.0, carbsPer100g: 0.0, fatPer100g: 6.0, typicalGrams: 170 },
  { id: 'redmeat_lamb_shank_partly_trimmed_cooked', name: 'Lamb Shank', category: 'red_meat', subcategory: 'lamb', cut: 'shank', trimTier: 'partly_trimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 215, proteinPer100g: 29.7, carbsPer100g: 0.0, fatPer100g: 9.8, typicalGrams: 170 },
  { id: 'redmeat_lamb_shank_untrimmed_cooked', name: 'Lamb Shank', category: 'red_meat', subcategory: 'lamb', cut: 'shank', trimTier: 'untrimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 243, proteinPer100g: 28.4, carbsPer100g: 0.0, fatPer100g: 13.5, typicalGrams: 170 },
  // lamb / other
  { id: 'redmeat_lamb_other_trimmed_raw', name: 'Lamb Other Cuts', category: 'red_meat', subcategory: 'lamb', cut: 'other', trimTier: 'trimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 134, proteinPer100g: 20.3, carbsPer100g: 0.0, fatPer100g: 5.3, typicalGrams: 227 },
  { id: 'redmeat_lamb_other_partly_trimmed_raw', name: 'Lamb Other Cuts', category: 'red_meat', subcategory: 'lamb', cut: 'other', trimTier: 'partly_trimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 200, proteinPer100g: 18.6, carbsPer100g: 0.0, fatPer100g: 13.4, typicalGrams: 227 },
  { id: 'redmeat_lamb_other_untrimmed_raw', name: 'Lamb Other Cuts', category: 'red_meat', subcategory: 'lamb', cut: 'other', trimTier: 'untrimmed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 267, proteinPer100g: 16.9, carbsPer100g: 0.0, fatPer100g: 21.6, typicalGrams: 227 },
  { id: 'redmeat_lamb_other_trimmed_cooked', name: 'Lamb Other Cuts', category: 'red_meat', subcategory: 'lamb', cut: 'other', trimTier: 'trimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 206, proteinPer100g: 28.2, carbsPer100g: 0.0, fatPer100g: 9.5, typicalGrams: 170 },
  { id: 'redmeat_lamb_other_partly_trimmed_cooked', name: 'Lamb Other Cuts', category: 'red_meat', subcategory: 'lamb', cut: 'other', trimTier: 'partly_trimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 250, proteinPer100g: 26.4, carbsPer100g: 0.0, fatPer100g: 15.2, typicalGrams: 170 },
  { id: 'redmeat_lamb_other_untrimmed_cooked', name: 'Lamb Other Cuts', category: 'red_meat', subcategory: 'lamb', cut: 'other', trimTier: 'untrimmed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 294, proteinPer100g: 24.5, carbsPer100g: 0.0, fatPer100g: 20.9, typicalGrams: 170 },
  // lamb / ground
  { id: 'redmeat_lamb_ground_raw', name: 'Ground Lamb', category: 'red_meat', subcategory: 'lamb', cut: 'ground', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 282, proteinPer100g: 16.6, carbsPer100g: 0.0, fatPer100g: 23.4, typicalGrams: 225 },
  { id: 'redmeat_lamb_ground_cooked', name: 'Ground Lamb', category: 'red_meat', subcategory: 'lamb', cut: 'ground', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 283, proteinPer100g: 24.8, carbsPer100g: 0.0, fatPer100g: 19.6, typicalGrams: 100 },
  // lamb / chops
  // Cooked only, and deliberately so. USDA's only DOMESTIC lamb-chop
  // row is the generic FNDDS 'Lamb, chop' (cooked). The raw row this
  // app used to carry was traced back to 'Lamb, New Zealand, imported,
  // neck chops, separable lean only, raw' -- imported (which the rest
  // of this block excludes), neck (not what anyone means by a lamb
  // chop), and lean-only (so not even comparable to the cooked row it
  // sat beside). Dropping it leaves Chops with no Prep toggle and a
  // single icon, which is honest; inventing a raw number would not be.
  { id: 'redmeat_lamb_chops_cooked', name: 'Lamb Chops', category: 'red_meat', subcategory: 'lamb', cut: 'chops', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 264, proteinPer100g: 27.4, carbsPer100g: 0.0, fatPer100g: 16.3, typicalGrams: 170 },
  // lamb / cubed
  { id: 'redmeat_lamb_cubed_raw', name: 'Cubed for Stew / Kabob', category: 'red_meat', subcategory: 'lamb', cut: 'cubed', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 134, proteinPer100g: 20.2, carbsPer100g: 0.0, fatPer100g: 5.3, typicalGrams: 227 },
  { id: 'redmeat_lamb_cubed_cooked', name: 'Cubed for Stew / Kabob', category: 'red_meat', subcategory: 'lamb', cut: 'cubed', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 223, proteinPer100g: 33.7, carbsPer100g: 0.0, fatPer100g: 8.8, typicalGrams: 170 },
  // lamb / organs
  { id: 'redmeat_lamb_organs_raw', name: 'Lamb Liver & Organs', category: 'red_meat', subcategory: 'lamb', cut: 'organs', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 139, proteinPer100g: 20.4, carbsPer100g: 1.8, fatPer100g: 5.0, typicalGrams: 113 },
  { id: 'redmeat_lamb_organs_cooked', name: 'Lamb Liver & Organs', category: 'red_meat', subcategory: 'lamb', cut: 'organs', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 220, proteinPer100g: 30.6, carbsPer100g: 2.5, fatPer100g: 8.8, typicalGrams: 85 },
  // --- veal ---
  { id: 'redmeat_veal_chops_cooked', name: 'Veal Chops', category: 'red_meat', subcategory: 'veal', cut: 'chops', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 158, proteinPer100g: 29.5, carbsPer100g: 0.1, fatPer100g: 4.4, typicalGrams: 135 },
  { id: 'redmeat_veal_ground_cooked', name: 'Ground Veal', category: 'red_meat', subcategory: 'veal', cut: 'ground', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 213, proteinPer100g: 25.6, carbsPer100g: 1.5, fatPer100g: 11.7, typicalGrams: 17 },
  { id: 'redmeat_veal_ground_raw', name: 'Ground Veal', category: 'red_meat', subcategory: 'veal', cut: 'ground', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 197, proteinPer100g: 18.6, carbsPer100g: 0, fatPer100g: 13.1, typicalGrams: 113 },
  { id: 'redmeat_veal_leg_cooked', name: 'Veal Leg', category: 'red_meat', subcategory: 'veal', cut: 'leg', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 150, proteinPer100g: 28.1, carbsPer100g: 0, fatPer100g: 3.4, typicalGrams: 85 },
  { id: 'redmeat_veal_leg_raw', name: 'Veal Leg', category: 'red_meat', subcategory: 'veal', cut: 'leg', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 107, proteinPer100g: 21.3, carbsPer100g: 0, fatPer100g: 1.8, typicalGrams: 113 },
  { id: 'redmeat_veal_loin_cooked', name: 'Veal Loin', category: 'red_meat', subcategory: 'veal', cut: 'loin', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 226, proteinPer100g: 33.6, carbsPer100g: 0, fatPer100g: 9.2, typicalGrams: 85 },
  { id: 'redmeat_veal_loin_raw', name: 'Veal Loin', category: 'red_meat', subcategory: 'veal', cut: 'loin', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 114, proteinPer100g: 21.8, carbsPer100g: 0, fatPer100g: 2.9, typicalGrams: 28 },
  { id: 'redmeat_veal_organs_cooked', name: 'Veal Liver & Organs', category: 'red_meat', subcategory: 'veal', cut: 'organs', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 186, proteinPer100g: 29.1, carbsPer100g: 0.1, fatPer100g: 6.8, typicalGrams: 198 },
  { id: 'redmeat_veal_organs_raw', name: 'Veal Liver & Organs', category: 'red_meat', subcategory: 'veal', cut: 'organs', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 110, proteinPer100g: 17.2, carbsPer100g: 0.1, fatPer100g: 4, typicalGrams: 113 },
  { id: 'redmeat_veal_other_cooked', name: 'Veal Other Cuts', category: 'red_meat', subcategory: 'veal', cut: 'other', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 218, proteinPer100g: 30.3, carbsPer100g: 0, fatPer100g: 9.8, typicalGrams: 85 },
  { id: 'redmeat_veal_other_raw', name: 'Veal Other Cuts', category: 'red_meat', subcategory: 'veal', cut: 'other', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 208, proteinPer100g: 17.5, carbsPer100g: 0, fatPer100g: 14.8, typicalGrams: 454 },
  { id: 'redmeat_veal_rib_rack_cooked', name: 'Veal Rib / Rack', category: 'red_meat', subcategory: 'veal', cut: 'rib_rack', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 218, proteinPer100g: 34.4, carbsPer100g: 0, fatPer100g: 7.8, typicalGrams: 85 },
  { id: 'redmeat_veal_rib_rack_raw', name: 'Veal Rib / Rack', category: 'red_meat', subcategory: 'veal', cut: 'rib_rack', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 120, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 3.9, typicalGrams: 28 },
  { id: 'redmeat_veal_shank_cooked', name: 'Veal Shank (Osso Buco)', category: 'red_meat', subcategory: 'veal', cut: 'shank', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 157, proteinPer100g: 29.1, carbsPer100g: 0, fatPer100g: 4.5, typicalGrams: 85 },
  { id: 'redmeat_veal_shank_raw', name: 'Veal Shank (Osso Buco)', category: 'red_meat', subcategory: 'veal', cut: 'shank', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 94, proteinPer100g: 19.8, carbsPer100g: 0, fatPer100g: 1.6, typicalGrams: 113 },
  { id: 'redmeat_veal_shoulder_cooked', name: 'Veal Shoulder', category: 'red_meat', subcategory: 'veal', cut: 'shoulder', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 201, proteinPer100g: 35.7, carbsPer100g: 0, fatPer100g: 5.3, typicalGrams: 85 },
  { id: 'redmeat_veal_shoulder_raw', name: 'Veal Shoulder', category: 'red_meat', subcategory: 'veal', cut: 'shoulder', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 105, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 2.2, typicalGrams: 289 },
  { id: 'redmeat_veal_sirloin_cooked', name: 'Veal Sirloin', category: 'red_meat', subcategory: 'veal', cut: 'sirloin', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 204, proteinPer100g: 34, carbsPer100g: 0, fatPer100g: 6.5, typicalGrams: 85 },
  { id: 'redmeat_veal_sirloin_raw', name: 'Veal Sirloin', category: 'red_meat', subcategory: 'veal', cut: 'sirloin', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 110, proteinPer100g: 20.2, carbsPer100g: 0, fatPer100g: 2.6, typicalGrams: 454 },
  // --- game ---
  { id: 'redmeat_game_bison_cooked', name: 'Bison', category: 'red_meat', subcategory: 'game', cut: 'bison', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 178, proteinPer100g: 25.2, carbsPer100g: 0, fatPer100g: 8.6, typicalGrams: 85 },
  { id: 'redmeat_game_bison_raw', name: 'Bison', category: 'red_meat', subcategory: 'game', cut: 'bison', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 165, proteinPer100g: 19.9, carbsPer100g: 0, fatPer100g: 8.9, typicalGrams: 114 },
  { id: 'redmeat_game_boar_cooked', name: 'Wild Boar', category: 'red_meat', subcategory: 'game', cut: 'boar', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 159, proteinPer100g: 28.1, carbsPer100g: 0, fatPer100g: 4.3, typicalGrams: 135 },
  { id: 'redmeat_game_boar_raw', name: 'Wild Boar', category: 'red_meat', subcategory: 'game', cut: 'boar', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 122, proteinPer100g: 21.5, carbsPer100g: 0, fatPer100g: 3.3, typicalGrams: 454 },
  { id: 'redmeat_game_elk_cooked', name: 'Elk', category: 'red_meat', subcategory: 'game', cut: 'elk', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 146, proteinPer100g: 30.2, carbsPer100g: 0, fatPer100g: 1.9, typicalGrams: 340 },
  { id: 'redmeat_game_elk_raw', name: 'Elk', category: 'red_meat', subcategory: 'game', cut: 'elk', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 111, proteinPer100g: 23, carbsPer100g: 0, fatPer100g: 1.4, typicalGrams: 28 },
  { id: 'redmeat_game_goat_cooked', name: 'Goat', category: 'red_meat', subcategory: 'game', cut: 'goat', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 142, proteinPer100g: 26.9, carbsPer100g: 0, fatPer100g: 3, typicalGrams: 135 },
  { id: 'redmeat_game_goat_raw', name: 'Goat', category: 'red_meat', subcategory: 'game', cut: 'goat', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 109, proteinPer100g: 20.6, carbsPer100g: 0, fatPer100g: 2.3, typicalGrams: 454 },
  { id: 'redmeat_game_other_game_cooked', name: 'Other Game Meat', category: 'red_meat', subcategory: 'game', cut: 'other_game', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 257, proteinPer100g: 32.2, carbsPer100g: 0, fatPer100g: 13.3, typicalGrams: 85 },
  { id: 'redmeat_game_other_game_raw', name: 'Other Game Meat', category: 'red_meat', subcategory: 'game', cut: 'other_game', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 161, proteinPer100g: 20.1, carbsPer100g: 0, fatPer100g: 8.3, typicalGrams: 28 },
  { id: 'redmeat_game_rabbit_cooked', name: 'Rabbit', category: 'red_meat', subcategory: 'game', cut: 'rabbit', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 204, proteinPer100g: 30.1, carbsPer100g: 0, fatPer100g: 8.3, typicalGrams: 135 },
  { id: 'redmeat_game_rabbit_raw', name: 'Rabbit', category: 'red_meat', subcategory: 'game', cut: 'rabbit', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 114, proteinPer100g: 21.8, carbsPer100g: 0, fatPer100g: 2.3, typicalGrams: 28 },
  { id: 'redmeat_game_venison_cooked', name: 'Venison (Deer)', category: 'red_meat', subcategory: 'game', cut: 'venison', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 149, proteinPer100g: 30, carbsPer100g: 0, fatPer100g: 2.4, typicalGrams: 85 },
  { id: 'redmeat_game_venison_raw', name: 'Venison (Deer)', category: 'red_meat', subcategory: 'game', cut: 'venison', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 120, proteinPer100g: 23, carbsPer100g: 0, fatPer100g: 2.4, typicalGrams: 454 },
  // --- processed ---
  //
  // Four rows here were corrected in v0.0.42, found by auditing every row
  // before these cuts were given cards. They had never been displayed --
  // Processed & Deli fell through to the flat food list until now -- so the
  // numbers were never visible enough to question.
  //
  //   Bacon, raw       was 110 kcal / 2.6g fat. That is USDA's "Canadian
  //                    bacon, unprepared" -- a different product. Now
  //                    "Pork, cured, bacon, unprepared", 393 / 37.1.
  //   Bacon, cooked    carried 28.6g of CARBS. Bacon has none. Now
  //                    "Pork, cured, bacon, pre-sliced, cooked, pan-fried".
  //   Ham & Deli, raw  DELETED. It was 315 kcal / 28.2g fat -- seven times
  //                    fattier than the cooked row, because it came from
  //                    "ham, patties, unheated". Deli ham has no raw state.
  //   Hot Dogs, raw    DELETED. It was USDA's "Frankfurter, beef, UNHEATED"
  //                    at 314 vs 310 cooked -- a 1% difference on a product
  //                    sold ready to eat. "Raw hot dog" is not a thing.
  //
  // Both deletions remove the cut's Prep toggle automatically, since
  // MeatCutCard data-gates it on raw AND cooked both existing.
  //
  // Still worth a second look, flagged rather than changed: "Other
  // Processed Meat, raw" (198 / 14.9) is actually USDA's corned beef
  // brisket. Corned Beef, Pastrami, Canadian Bacon, Salami and Pepperoni
  // all have clean USDA rows and no cut here -- proposed separately.
  { id: 'redmeat_processed_bacon_cooked', name: 'Bacon', category: 'red_meat', subcategory: 'processed', cut: 'bacon', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 468, proteinPer100g: 33.9, carbsPer100g: 1.7, fatPer100g: 35.1, typicalGrams: 8 },
  { id: 'redmeat_processed_bacon_raw', name: 'Bacon', category: 'red_meat', subcategory: 'processed', cut: 'bacon', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 393, proteinPer100g: 13.7, carbsPer100g: 0, fatPer100g: 37.1, typicalGrams: 20 },
  { id: 'redmeat_processed_bologna_cooked', name: 'Bologna', category: 'red_meat', subcategory: 'processed', cut: 'bologna', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 281, proteinPer100g: 10.3, carbsPer100g: 6.3, fatPer100g: 23.8, typicalGrams: 56 },
  { id: 'redmeat_processed_canned_potted_cooked', name: 'Canned / Potted Meat', category: 'red_meat', subcategory: 'processed', cut: 'canned_potted', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 315, proteinPer100g: 13.4, carbsPer100g: 4.6, fatPer100g: 26.6, typicalGrams: 140 },
  { id: 'redmeat_processed_ham_deli_cooked', name: 'Ham & Deli Meat', category: 'red_meat', subcategory: 'processed', cut: 'ham_deli', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 117, proteinPer100g: 19, carbsPer100g: 1.6, fatPer100g: 3.9, typicalGrams: 135 },
  { id: 'redmeat_processed_hot_dogs_franks_cooked', name: 'Hot Dogs & Franks', category: 'red_meat', subcategory: 'processed', cut: 'hot_dogs_franks', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 310, proteinPer100g: 11.7, carbsPer100g: 2.9, fatPer100g: 28, typicalGrams: 57 },
  { id: 'redmeat_processed_jerky_cooked', name: 'Jerky', category: 'red_meat', subcategory: 'processed', cut: 'jerky', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 410, proteinPer100g: 33.2, carbsPer100g: 11, fatPer100g: 25.6, typicalGrams: 18 },
  { id: 'redmeat_processed_other_cooked', name: 'Other Processed Meat', category: 'red_meat', subcategory: 'processed', cut: 'other', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 327, proteinPer100g: 14.5, carbsPer100g: 3.1, fatPer100g: 28.5, typicalGrams: 56 },
  { id: 'redmeat_processed_other_raw', name: 'Other Processed Meat', category: 'red_meat', subcategory: 'processed', cut: 'other', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 198, proteinPer100g: 14.7, carbsPer100g: 0.1, fatPer100g: 14.9, typicalGrams: 28 },
  { id: 'redmeat_processed_pate_spread_loaf_cooked', name: 'Pate, Spreads & Loaf Meats', category: 'red_meat', subcategory: 'processed', cut: 'pate_spread_loaf', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 235, proteinPer100g: 11.8, carbsPer100g: 9.2, fatPer100g: 16.5, typicalGrams: 57 },
  { id: 'redmeat_processed_salami_pepperoni_cooked', name: 'Salami & Pepperoni', category: 'red_meat', subcategory: 'processed', cut: 'salami_pepperoni', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 261, proteinPer100g: 12.6, carbsPer100g: 1.9, fatPer100g: 22.2, typicalGrams: 28 },
  { id: 'redmeat_processed_sausage_cooked', name: 'Sausage', category: 'red_meat', subcategory: 'processed', cut: 'sausage', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 341, proteinPer100g: 19.3, carbsPer100g: 2.6, fatPer100g: 28.1, typicalGrams: 75 },
  { id: 'redmeat_processed_sausage_raw', name: 'Sausage', category: 'red_meat', subcategory: 'processed', cut: 'sausage', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 301, proteinPer100g: 14, carbsPer100g: 3, fatPer100g: 25.9, typicalGrams: 91 },
  // --- other ---
  { id: 'redmeat_other_other_cooked', name: 'Organ Meats (Unspecified)', category: 'red_meat', subcategory: 'other', cut: 'other', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 164, proteinPer100g: 28.2, carbsPer100g: 0.1, fatPer100g: 4.7, typicalGrams: 20 },  // --- Traditional Indigenous foods (v0.0.43, Decision 2) ---
  // These were tagged `mixed_dish` by the original USDA import and sat
  // there unreachable, even though they are single ingredients rather than
  // dishes. Moved here because this is where someone would look for them.
  // The "(Alaska Native)" / "(Navajo)" suffix in each name is kept
  // deliberately -- it identifies the specific preparation the numbers
  // were measured from, which is a real difference, not decoration.
  { id: 'redmeat_game_moose_raw', name: 'Moose', category: 'red_meat', subcategory: 'game', cut: 'moose', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 103, proteinPer100g: 22.3, carbsPer100g: 0.0, fatPer100g: 1.5, typicalGrams: 85 },
  { id: 'redmeat_game_moose_cooked', name: 'Moose', category: 'red_meat', subcategory: 'game', cut: 'moose', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 155, proteinPer100g: 24.4, carbsPer100g: 3.4, fatPer100g: 4.9, typicalGrams: 85 },
  { id: 'redmeat_game_caribou_raw', name: 'Caribou', category: 'red_meat', subcategory: 'game', cut: 'caribou', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 786, proteinPer100g: 6.7, carbsPer100g: 0.0, fatPer100g: 84.4, typicalGrams: 85 },
  { id: 'redmeat_game_seal_raw', name: 'Seal', category: 'red_meat', subcategory: 'game', cut: 'seal', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 110, proteinPer100g: 26.7, carbsPer100g: 0.0, fatPer100g: 0.4, typicalGrams: 85 },
  { id: 'redmeat_game_seal_cooked', name: 'Seal', category: 'red_meat', subcategory: 'game', cut: 'seal', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 351, proteinPer100g: 82.6, carbsPer100g: 0.0, fatPer100g: 2.3, typicalGrams: 85 },
  { id: 'redmeat_game_walrus_raw', name: 'Walrus', category: 'red_meat', subcategory: 'game', cut: 'walrus', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 199, proteinPer100g: 19.2, carbsPer100g: 0.0, fatPer100g: 13.6, typicalGrams: 85 },
  { id: 'redmeat_game_walrus_cooked', name: 'Walrus', category: 'red_meat', subcategory: 'game', cut: 'walrus', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 251, proteinPer100g: 57.0, carbsPer100g: 0.0, fatPer100g: 2.6, typicalGrams: 85 },
  { id: 'redmeat_game_whale_raw', name: 'Whale', category: 'red_meat', subcategory: 'game', cut: 'whale', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 111, proteinPer100g: 26.5, carbsPer100g: 0.0, fatPer100g: 0.5, typicalGrams: 85 },
  { id: 'redmeat_game_whale_cooked', name: 'Whale', category: 'red_meat', subcategory: 'game', cut: 'whale', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 327, proteinPer100g: 69.9, carbsPer100g: 0.0, fatPer100g: 5.3, typicalGrams: 85 },
  { id: 'redmeat_game_mutton_cooked', name: 'Mutton', category: 'red_meat', subcategory: 'game', cut: 'mutton', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 234, proteinPer100g: 33.4, carbsPer100g: 0.1, fatPer100g: 11.1, typicalGrams: 85 },
  { id: 'redmeat_game_buffalo_raw', name: 'Buffalo (free range)', category: 'red_meat', subcategory: 'game', cut: 'buffalo', prep: 'raw', icon: '', servingType: 'weight', caloriesPer100g: 97, proteinPer100g: 21.4, carbsPer100g: 0.0, fatPer100g: 1.3, typicalGrams: 85 },
  { id: 'redmeat_game_buffalo_cooked', name: 'Buffalo (free range)', category: 'red_meat', subcategory: 'game', cut: 'buffalo', prep: 'cooked', icon: '', servingType: 'weight', caloriesPer100g: 146, proteinPer100g: 32.5, carbsPer100g: 0.0, fatPer100g: 1.8, typicalGrams: 85 },

];

export default foodsRedMeat;
