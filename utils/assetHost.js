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
// The trade, stated honestly
//
// Bundled images are on the device; these are not. So:
//
//   - the app needs a connection to draw its icons, and each one appears a
//     beat late the first time it is shown on a device (RN caches after);
//   - if that repo is deleted, renamed, or made private, every icon in the
//     app breaks at once.
//
// That is a fine trade for a Snack prototype and a bad one for a shipped
// app. When this moves to a real build (EAS/bare React Native), bundling
// comes back: put the files in assets/ and swap `assetUri('x.jpg')` for
// `require('../assets/x.jpg')` in the two maps below. Nothing else moves.
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

export const ASSET_BASE =
  'https://cdn.jsdelivr.net/gh/zengtk9-del/nnutrition-app-v53@main/assets/';

// One image, ready to hand to <Image source={...} />.
//
// Takes the FILENAME, not the icon key -- the two differ for 26 egg and
// milk images that kept a `_large` suffix their key no longer carries (see
// data/foodIconImages.js).
export function assetUri(filename) {
  return { uri: ASSET_BASE + filename };
}
