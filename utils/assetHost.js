// Where the app's artwork actually lives.
//
// ---------------------------------------------------------------------
// Why the images are not in this project
//
// The drawn set is 1,749 files. Snack refuses them: its git import clones
// the repo, tries to upload every asset it finds to its own CDN, and fails
// partway with `Failed to upload file asset ... "$": Required`. Its other
// two routes are worse -- the file importer drops everything at the project
// root, and the folder importer stops at 100 files.
//
// So the artwork is not shipped inside the app at all. It sits in a public
// GitHub repo, and jsDelivr serves that repo over its CDN for free. The app
// carries URLs instead of files, which makes this project 74 source files
// and about 350 KB -- small enough that Snack imports it in seconds.
//
// React Native's <Image> takes `{ uri }` wherever it takes a require(), so
// nothing else in the app changed when this went in.
//
// ---------------------------------------------------------------------
// THE TRADE, AND HOW v0.9.2 SETTLED IT
//
// The note that used to sit here said bundling was "a fine trade for a
// Snack prototype and a bad one for a shipped app", and that when this
// reached a real build the files should come back into assets/. That is
// what v0.9.2 did. The art is now 1,826 files and about 49 MB inside the
// binary, and nothing a user sees waits on a network request.
//
// Two reasons it was worth 49 MB. The first run used to show every image
// arriving a beat late -- which is every new user's first impression,
// since their cache is empty. And a shipped app whose entire visual layer
// is served from a personal GitHub repo breaks everywhere at once if that
// repo is ever renamed, deleted or made private, with no fallback: a
// failed remote image in React Native draws nothing, silently.
//
// THE CDN PATH IS STILL HERE, AND STILL WORKS. assetUri() checks the
// bundled table first and falls back to this URL for any filename not in
// it. So a food whose art is added to the icon repo between App Store
// releases still draws, without an app update -- the flexibility that
// made the remote approach attractive, kept, without depending on it for
// the 1,826 files that ship.
//
// ---------------------------------------------------------------------
// Moving or renaming the icon repo
//
// Change ONE line -- ASSET_BASE. Both data/foodIconImages.js (1,713 icons)
// and data/quizQuestions.js (35 quiz images) build every URL from it.
//
// The `@main` is a branch pin. jsDelivr also takes a tag or a commit SHA,
// e.g. `@v1.0.0`, which is worth doing if the icons ever need to stay
// frozen while the repo keeps moving.

import { BUNDLED_ART } from '../data/bundledArt';

export const ASSET_BASE =
  'https://cdn.jsdelivr.net/gh/zengtk9-del/nnutrition-app-v53@main/assets/';

// One image, ready to hand to <Image source={...} />.
//
// Takes the FILENAME, not the icon key -- the two differ for 26 egg and
// milk images that kept a `_large` suffix their key no longer carries (see
// data/foodIconImages.js).
//
// RETURNS ONE OF TWO SHAPES, and callers must not care which:
//
//   bundled  a number, which is what require() of an image evaluates to
//   remote   { uri: 'https://...' }, as before
//
// <Image source={...} /> takes either, which is the whole reason this
// could change without touching a single call site -- including the one
// in data/brandArt.js that builds the mascot poses in a loop and so has
// no literal for Metro to resolve.
//
// The one thing that DOES care is prefetching: a bundled asset has no
// `.uri` and nothing to fetch. components/Mascot.js guards for that.
export function assetUri(filename) {
  const bundled = BUNDLED_ART[filename];
  if (bundled !== undefined) return bundled;
  return { uri: ASSET_BASE + filename };
}
