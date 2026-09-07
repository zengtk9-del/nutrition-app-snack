// The illustrated art that isn't food: the broccoli mascot on the Today
// header, and the four macro icons in the daily summary card.
//
// A third axis alongside data/foodIconImages.js (1,737 foods) and
// data/categoryIcons.js (19 category tiles). Small enough to keep here, and
// different enough in kind to not belong in either.
//
// ---------------------------------------------------------------------
// THE ONE SWITCH THAT MATTERS
//
// These five images are PNGs WITH TRANSPARENCY, unlike every other asset in
// this app -- the food and category art are opaque JPEGs that can only ever
// sit on a white tile. These sit on tinted tiles and on the patterned page
// background, so they have to be cut out properly.
//
// Until they're pushed to the icon repo, ART_READY stays false and the app
// draws vector icons from @expo/vector-icons instead. That is not a broken
// state -- it looks deliberate and complete, just flatter than the mockup.
// Flip this one boolean when the files are live and all five swap at once.
//
// Turned on in v0.0.73. If the artwork ever disappears from the Today tab,
// this is the first thing to check: `true` here with the files missing from
// the repo shows nothing at all, since a failed remote image has no
// placeholder to fall back to.
// ---------------------------------------------------------------------

import { assetUri } from '../utils/assetHost';

export const ART_READY = true;

// Lowercase throughout. jsDelivr's paths are case-sensitive, and `All.png`
// already caught us out once by arriving capitalised.
export const MASCOT = assetUri('mascot_broccoli.png');

export const MACRO_ART = {
  calories: assetUri('macro_calories.png'),
  protein: assetUri('macro_protein.png'),
  carbs: assetUri('macro_carbs.png'),
  fat: assetUri('macro_fat.png'),
};

// What gets drawn while ART_READY is false. Names verified against
// @expo/vector-icons: `flame` and `water` are Ionicons, `arm-flex` and
// `barley` are MaterialCommunityIcons.
export const MACRO_FALLBACK_ICONS = {
  calories: { set: 'ion', name: 'flame' },
  protein: { set: 'mci', name: 'arm-flex' },
  carbs: { set: 'mci', name: 'barley' },
  fat: { set: 'ion', name: 'water' },
};

export default MACRO_ART;
