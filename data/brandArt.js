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

// --- The animated mascot (v0.2.4) ---------------------------------------
//
// THE SECOND SWITCH. Flip USE_ANIMATED_MASCOT once the GIF is live on the
// icon repo and all four tabs start moving at the same instant, because
// they all mount the same components/Mascot.js.
//
// It is a separate switch from ART_READY on purpose: ART_READY says "the
// illustrated set exists at all", this says "the moving version of one of
// them exists too". Turning this off is the one-line way back to the
// static PNG if the GIF misbehaves on a device, without touching four
// screens or losing the artwork entirely.
//
// THE FILENAME IS A CONTRACT. jsDelivr 404s are silent in React Native --
// a failed remote image draws nothing, with no error and no placeholder.
// So this exact name, lowercase, has to be what lands in the assets/
// folder of the icon repo:
//
//     mascot_broccoli_anim.webp
//
// WEBP, NOT GIF (v0.2.5). The GIF worked and was wired up in v0.2.4; this
// is better on the two axes that matter here:
//
//   size   265 KB -> 190 KB for the identical 21 frames.
//   edges  GIF alpha is one bit -- a pixel is fully there or fully gone,
//          so the mascot's outline stair-steps against the pale blue
//          header. WebP carries a real 8-bit alpha channel, so the edge
//          is anti-aliased the way the static PNG's always was.
//
// IT NEEDS A RENDERER THAT CAN DECODE IT, which is the catch and the
// reason components/Mascot.js is as careful as it is. Animated WebP
// plays through expo-image (both platforms) and through a browser's own
// <img> on web. It does NOT play through React Native's Image on a
// device. Mascot.js knows this and hands out the static PNG rather than
// an animated file nothing present can animate -- so if expo-image is
// ever unavailable, the mascot goes still, not blank.
//
// The GIF is still on the icon repo and still works; switching back is
// this one line.
export const USE_ANIMATED_MASCOT = true;
export const MASCOT_ANIMATED = assetUri('mascot_broccoli_anim.webp');

// --- The seven poses (v0.3.0) -------------------------------------------
//
// One animation per thing the mascot can be doing. utils/mascotState.js
// decides which; this only says where each file lives.
//
// ALL SEVEN SHARE ONE CANVAS, 236x262, which is the union of all seven
// alpha bounding boxes. That is not tidiness -- it is the only way the
// broccoli stays the same size and sits in the same spot when the pose
// changes. Cropping each file to its own art would make him jump and
// resize on every switch, which is the v0.2.3 bug all over again. The
// canvas is as tight as it can be while still holding the jump (which
// reaches the top edge) and the sleep (which lies down and is wide).
//
// THE FILENAMES ARE A CONTRACT, same as the static art: lowercase, in
// the icon repo's assets/ folder, because jsDelivr is case-sensitive and
// a 404 draws nothing with no error. components/Mascot.js falls back to
// the static PNG for any pose whose file fails to load, so a typo here
// costs one pose rather than the mascot.
export const MASCOT_POSE_FILES = {
  wave: 'mascot_wave.webp',
  run: 'mascot_run.webp',
  idle: 'mascot_idle.webp',
  jump: 'mascot_jump.webp',
  curl: 'mascot_curl.webp',
  meditate: 'mascot_meditate.webp',
  sleep: 'mascot_sleep.webp',
};

export const MASCOT_POSES = Object.keys(MASCOT_POSE_FILES).reduce((acc, pose) => {
  acc[pose] = assetUri(MASCOT_POSE_FILES[pose]);
  return acc;
}, {});

// --- The big one, for the quiz intro (v0.4.0) ---------------------------
//
// Same wave, same 3.3 seconds, but 854x1068 instead of 236x262 -- the
// intro pages draw him around 300pt tall, and the corner file has only
// 237px of broccoli in it, which would be a 3.8x upscale.
//
// NOT in MASCOT_POSES on purpose. Everything in that map shares one
// canvas so the corner mascot cannot jump when the pose changes; this
// one is cropped to its own art precisely because nothing sits beside
// it. Keeping it out of the map is what stops someone wiring it into
// the rotation by accident.
//
// Cut from CapCut's own alpha channel rather than keyed off a black
// background, so the outline is anti-aliased rather than stair-stepped
// at this size. 1.4 MB, 10fps to match the other seven.
// Keyed by name so data/quizQuestions.js can ask for a pose with a
// string ("mascot: 'notes'") instead of importing artwork into a file
// that is otherwise pure question text.
export const MASCOT_SCENES = {
  wave: assetUri('mascot_wave_big.webp'),
  // He takes notes while you answer (v0.4.1). Interim file cut from the
  // 240p GIF; a 1080 HEVC(Alpha) export replaces it under the same name
  // with no code change.
  notes: assetUri('mascot_notes.webp'),
  // Standing at a stadiometer, for the height question (v0.4.5). A still,
  // keyed off Damon's magenta background: 837x1142, 80 KB.
  height: assetUri('mascot_height.webp'),
};

// --- The height page's artwork, as numbers (v0.4.5) ---------------------
//
// The page draws a dashed line from the dial's pill to the stick, and a
// few marks around his head. Where those land depends on where things
// are in THIS drawing, so the positions live here as fractions of the
// canvas (x of its width, y of its height), next to the file they
// describe. New art means new numbers here, not a change to the layout.
export const HEIGHT_GEOMETRY = {
  aspect: 837 / 1142, // canvas width / height
  // The outer edge of the stick's right-hand outline. The line ends here,
  // where his hair meets the stick.
  stickRight: 190 / 837,
  // How far down the canvas the line meets the stick. His hair touches
  // the stick from 0.11 to 0.58, below the head bar and above both hands
  // (from 0.60), and 0.48 is inside that. It also decides how high he
  // stands in the card, since the line's height is fixed by the dial.
  reachY: 0.48,
  // The pale disc behind his crown: centre and diameter (of the width).
  halo: { x: 0.64, y: 0.2, size: 0.66 },
  // The three excitement marks off the top-right of his crown: centre and
  // angle. Each sits just outside the outline at that height.
  sparks: [
    { x: 0.78, y: 0.08, angle: -70 },
    { x: 0.875, y: 0.13, angle: -42 },
    { x: 0.93, y: 0.19, angle: -18 },
  ],
  // Two loose dots in the empty corners: centre and diameter (of the
  // width). The first is above the canvas, so y is negative.
  dots: [
    { x: 0.31, y: -0.12, size: 0.128 },
    { x: 0.94, y: 0.81, size: 0.086 },
  ],
  // The shadow he and the stand cast: centre x, centre y, width.
  ground: { x: 0.45, y: 0.985, w: 0.92 },
};

// --- Peeking over the answer cards (v0.4.4) -----------------------------
//
// Damon's reference art, split into THREE LAYERS instead of drawn as one
// image, because the pose asks for something no single image can do: his
// stem goes BEHIND the cards (the card top cuts across it) while his
// fingers hang IN FRONT of them. So:
//
//   body   behind the cards, never moves
//   hands  one per card, drawn over it, riding that card's own animation
//
// When a card is chosen it lifts, and the hand resting on it lifts on the
// same curve in the same frames -- the thing a swap between three whole
// poses could not do, since a swap is instant and the card takes 140ms.
//
// The body keeps its own painted paws. That is on purpose: a raised hand
// only ever uncovers the bottom curve of the paw beneath it, and that
// curve is below the card edge, i.e. behind the card. No hole, no patch.
//
// All three share one 1010x969 canvas, cut from the 1254px original.
// PEEK_GEOMETRY says where each piece sits on it, as fractions, so the
// layout can draw him at any width and the hands still land on their
// painted positions to the pixel.
export const MASCOT_PEEK = {
  body: assetUri('mascot_peek_body.webp'),
  handLeft: assetUri('mascot_peek_hand_l.webp'),
  handRight: assetUri('mascot_peek_hand_r.webp'),
};

export const PEEK_GEOMETRY = {
  aspect: 969 / 1010, // canvas height / width
  // Where the card's top edge crosses him: through the paws, just above
  // the finger lines, so the fingers hang over the card face.
  cardEdge: 0.9484,
  handLeft: { x: 0.2267, y: 0.8658, w: 0.1614, h: 0.1249 },
  handRight: { x: 0.603, y: 0.8658, w: 0.1614, h: 0.1249 },
};

export const MASCOT_WAVE_BIG = MASCOT_SCENES.wave;

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
