// Artwork for the category tiles in Log Food -- the 18 real categories plus
// the `all` filter, 19 in all.
//
// A different axis from data/foodIconImages.js, which is keyed on a FOOD's
// iconKey. These are keyed on the category keys in data/foods.js CATEGORIES,
// and there is exactly one per category -- so they live in their own small
// file rather than being lost among 1,737 food icons.
//
// `all` is the odd one out: it isn't in CATEGORIES at all, it's the tile that
// clears the filter. It had no artwork until v0.0.68 and drew a ▦ glyph
// instead; now it draws like everything else.
//
// The filenames are the ones the artwork arrived with (plural, and worded
// slightly differently from the app's internal keys: `vegetables.jpg` for
// `vegetable`, `eggs.jpg` for `egg`). Mapping them here rather than renaming
// 18 files is the same trade data/foodIconImages.js already makes for the
// 26 `_large` egg and milk files.
//
// Note the capital A in `All.png`. Every other asset in the repo is lower
// case; this one arrived capitalised, and jsDelivr's paths are CASE-SENSITIVE,
// so `all.png` is a 404. Don't "tidy" it without renaming the file too.
//
// These are .png where every other asset is .jpg -- they arrived that way
// and pointing at them is cheaper than renaming. Worth knowing that PNG
// handles these soft-gradient illustrations badly: 206 KB each against
// ~30 KB for a comparable JPEG, and all 18 load on the Log Food tab the
// moment it opens. Converting them would cut roughly 3.7 MB to 0.5 MB on
// that first screen; the only code change would be this extension.
//
// Served from the icon repo over jsDelivr like everything else -- see
// utils/assetHost.js.

import { assetUri } from '../utils/assetHost';

export const CATEGORY_ICONS = {
  all: assetUri('All.png'),
  fruit: assetUri('fruit.png'),
  vegetable: assetUri('vegetables.png'),
  red_meat: assetUri('red_meat.png'),
  poultry: assetUri('poultry.png'),
  seafood: assetUri('seafood.png'),
  egg: assetUri('eggs.png'),
  dairy: assetUri('dairy.png'),
  legume: assetUri('legumes.png'),
  nut_seed: assetUri('nuts_seeds.png'),
  grain: assetUri('grains.png'),
  fat_oil: assetUri('fats_oils.png'),
  sweet: assetUri('sweets.png'),
  beverage: assetUri('beverages.png'),
  condiment_sauce: assetUri('condiments_sauces.png'),
  mixed_dish: assetUri('mixed_dishes.png'),
  snack: assetUri('snacks.png'),
  meat_substitute: assetUri('meat_substitutes.png'),
  baby_food: assetUri('baby_foods.png'),
};

export function getCategoryIcon(key) {
  return CATEGORY_ICONS[key];
}

export default CATEGORY_ICONS;
