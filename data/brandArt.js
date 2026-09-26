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
  // On a bathroom scale, for the weight question (v0.4.6). 841x1123,
  // 80 KB, keyed the same way.
  weight: assetUri('mascot_weight.webp'),
  // Leaning in from the right-hand edge of the screen, for the body-fat
  // page (v0.4.8). 766x1048, 64 KB. See CORNER_GEOMETRY below -- this one
  // has a rule about where it can be put.
  peekRight: assetUri('mascot_peek_right.webp'),
  // Walking towards the flag with a backpack on, for the target-weight
  // page (v0.5.0). ANIMATED: 440x568, 16 frames at 63ms -- one walk
  // cycle, 1.008s, 534 KB. Cut from Damon's 30fps HEVC-with-alpha export
  // at every other frame, on the seam where the cycle closes cleanest.
  target: assetUri('mascot_backpack.webp'),
};

// --- The corner pose's one rule (v0.4.8) -------------------------------
//
// mascot_peek_right.webp is drawn as a figure CUT OFF flush with the
// right-hand side of its own canvas: the two paws he grips the edge with
// are half there, and 732 of its 1048 rows run right up to that side.
// That edge is not a mistake, it is the point -- but it means the art can
// only ever be placed with that side PAST THE EDGE OF THE SCREEN. Put it
// anywhere else and the flat cut shows.
//
// (Damon's file leans the other way, since that is how his generator drew
// it; the copy in the assets repo is mirrored, so the file matches what
// is on screen rather than needing a flip at runtime.)
export const CORNER_GEOMETRY = { aspect: 766 / 1048 };

// --- The measuring pages' artwork, as numbers (v0.4.5, v0.4.6) ---------
//
// Height and weight are the same page with different art: a dial on the
// left, him on the right, and a dashed line from the dial to the thing
// doing the measuring. Where that line lands, and where the marks around
// him go, depends on where things are in THESE drawings -- so the
// positions live here as fractions of each canvas (x of its width, y of
// its height), next to the file they describe. New art means new numbers
// here, not a change to the layout.
//
// Shared by both:
//   aspect   canvas width / height
//   pillY    the height of the dial's pill, as a fraction of the canvas.
//            This is what places him in the card: the pill's own height
//            is fixed by the dial, so the art hangs from it.
//   halo     the pale disc behind his crown: centre and diameter
//   sparks   the marks off his crown: centre and angle, each just clear
//            of the outline at that height
//   dots     two loose dots in the empty corners
//   ground   the shadow under him: centre x, centre y, width
export const HEIGHT_GEOMETRY = {
  aspect: 837 / 1142,
  // The outer edge of the stick's right-hand outline. The line runs
  // level from the pill and ends here, where his hair meets the stick.
  stickRight: 190 / 837,
  // His hair touches the stick from 0.11 to 0.58, below the head bar and
  // above both hands (from 0.60), and 0.48 is inside that.
  pillY: 0.48,
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

export const TARGET_GEOMETRY = {
  aspect: 440 / 568,
  // Placement only, same as the weight page: 0.25 is up in his crown,
  // which leaves him walking across the lower half of the card with the
  // flag ahead of him.
  pillY: 0.25,
  // The flag stands in the empty part of his own box, ahead of his feet:
  // below his crown nothing he draws reaches past 0.80 of his width in
  // any frame of the walk, so the flag at 0.90 is clear of him without
  // the layout having to keep a strip free beside him (flagZone 0), which
  // is what lets him be as big here as he is on the other two pages.
  flagZone: 0,
  flag: { x: 0.9, y: 0.8 },
  // How far the dotted path sags below a straight line from the dial to
  // the flag, as a fraction of his height. It is the path he is walking,
  // so it passes behind him rather than over him.
  pathSag: 0.24,
  halo: { x: 0.55, y: 0.25, size: 0.8 },
  // Three marks off the top right of his crown, fanning out: measured off
  // the drawing (their centres and angles, as fractions of his box), so
  // they sit clear of the crown rather than on it. The first one is a
  // hair above his box, which is why its y is negative.
  sparks: [
    { x: 0.82, y: -0.01, angle: -72 },
    { x: 0.91, y: 0.05, angle: -51 },
    { x: 0.95, y: 0.13, angle: -20 },
  ],
  dots: [
    { x: 0.12, y: -0.1, size: 0.12 },
    { x: 1.02, y: 0.28, size: 0.08 },
  ],
  ground: { x: 0.52, y: 0.99, w: 0.86 },
};

export const WEIGHT_GEOMETRY = {
  aspect: 841 / 1123,
  // Nothing on the scale is level with the pill, so this is placement
  // only: 0.4 is in his crown, which leaves him the same share of space
  // above and below as the mockup and still gives the line a clear run
  // down to the scale.
  pillY: 0.4,
  // The ring at the end of the line, just left of the display.
  anchor: { x: 0.345, y: 0.916 },
  // The scale's own display, outer edge of its dark outline included.
  // The live weight is drawn over this, which is also what hides the
  // three placeholder dashes the artwork has there.
  readout: { x: 330 / 841, y: 997 / 1123, w: 205 / 841, h: 63 / 1123 },
  halo: { x: 0.64, y: 0.2, size: 0.66 },
  sparks: [
    { x: 0.72, y: 0.03, angle: -70 },
    { x: 0.8, y: 0.09, angle: -42 },
    { x: 0.86, y: 0.145, angle: -18 },
  ],
  dots: [
    { x: 0.31, y: -0.12, size: 0.128 },
    { x: 0.94, y: 0.81, size: 0.086 },
  ],
  ground: { x: 0.5, y: 0.995, w: 0.86 },
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
