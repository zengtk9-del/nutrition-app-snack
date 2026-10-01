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

// --- The eleven poses (v0.3.0; four more in v0.5.6) ---------------------
//
// One animation per thing the mascot can be doing. utils/mascotState.js
// decides which; this only says where each file lives.
//
// ALL ELEVEN SHARE ONE CANVAS, 236x262, which is the union of the
// original seven's alpha bounding boxes. That is not tidiness -- it is
// the only way the broccoli stays the same size and sits in the same
// spot when the pose changes. Cropping each file to its own art would
// make him jump and resize on every switch, which is the v0.2.3 bug all
// over again. The canvas is as tight as it can be while still holding
// the jump (which reaches the top edge) and the sleep (which lies down
// and is wide).
//
// THE FOUR FROM THE QUIZ (v0.5.6) had to be MADE to fit it. They were
// drawn for cards and a full page, cropped to their own art at three
// times the size, so they were re-cut rather than resized: each one is
// scaled until the deep green of his crown is 168px wide -- the width
// it is in the original seven -- then stood with its feet on y=254 and
// its middle on x=118, which is where the others' are. That is what
// makes eleven drawings from three different sessions read as one
// character standing in one place.
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
  // Four scenes the quiz introduced, re-cut for the corner (v0.5.6):
  // walking with his pack (10 frames, 1.0s), at a desk with a laptop
  // (12, 1.2s), on the couch with a controller (16, 1.6s) and
  // dribbling a ball (18, 1.8s). 107-189 KB each.
  hike: 'mascot_hike.webp',
  desk: 'mascot_desk.webp',
  game: 'mascot_game.webp',
  hoops: 'mascot_hoops.webp',
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
  // In a lab coat and glasses, writing on a notepad, for the few seconds
  // between the last question and the report (v0.5.4). That screen's job
  // is to say someone is working on your numbers, so he is the one doing
  // it. ANIMATED: 549x720, 12 frames at 100ms -- 1.2s, 461 KB. The
  // biggest of these after the intro wave, because it is drawn 300pt
  // tall with nothing else on the screen.
  lab: assetUri('mascot_lab.webp'),
  // The same lab coat, now teaching: a pointer raised at the whiteboard,
  // for all six report pages (v0.5.8). A STILL, cut from the report
  // pack's own mascot-pointer-positioned layer -- 369x452 of it, scaled
  // 1.4x to 517x633 so it survives a 3x screen, 80 KB.
  //
  // STILL, ON PURPOSE, and the one place in this app where that is a
  // decision rather than a limitation. Everything else the mascot does
  // moves; this pose exists to aim a pointer at a specific spot on the
  // board behind him, and REPORT_BOARD.pointer below is that spot to the
  // pixel. An animated loop would move the tip, and the whole point of
  // the composition is that it does not. If a loop of this pose ever
  // arrives, it is this one line plus a new tip position.
  teacher: assetUri('mascot_teacher.webp'),
};

// --- The whiteboard the report is taught on (v0.5.8) -------------------
//
// The report pack is six flattened 853x1844 mockups plus the board and
// the teacher as transparent layers. The board here is NOT one of those
// layers -- it is drawn from plain Views, the way the donut and the
// scale and the dial are -- and this block is the bridge: every number
// Damon's layers fix, measured off them once, in one unit.
//
// THE UNIT IS THE BOARD'S OWN WIDTH. Every value below is a multiple of
// it, so one number at the call site (`w`) sets the entire composition
// and the phone's width is the only thing that decides scale. Measuring
// against the 853px canvas instead would have made the page depend on a
// canvas that no longer exists once the design leaves the mockup.
//
// WHY NOT JUST SHIP THE PNG. Three reasons, in order of how much they
// cost: the board has to hold real text at real sizes and a picture of
// a board cannot; a real profile's answers run longer than the sample's
// ("Cardio, Lifting, Sports & Other Activities" is already two lines in
// the mockup), so the board has to be able to GROW, and a picture would
// stretch its frame doing it; and the pack's own README asks for "one
// shared reusable template in the finished app for pixel-perfect
// consistency", which is this file plus components/ReportBoard.js.
//
// Measured off empty-whiteboard-positioned.png and
// mascot-pointer-positioned.png, both 853x1844, with the board's frame
// spanning x=128..835 (708px, the unit) and y=377..1307.
export const REPORT_BOARD = {
  // The frame: outer box, corner, and the pale band between it and the
  // white surface. Top and bottom differ by 3px in the artwork; kept
  // apart rather than averaged because the marker tray hangs off the
  // bottom one and a 3px error there shows.
  //
  // 985, WHERE THE PACK'S BOARD IS 930. The one number here that is not
  // Damon's, and the reason is arithmetic rather than taste: his canvas
  // is 426pt wide and a phone is 393, so the same board is 8% narrower
  // here and every sentence on it takes more lines. Measured off the
  // mockups, the Calorie Breakdown page's own content needs 234pt of
  // board above the teacher; at 930 there are 210. The alternative was
  // to shrink the type below what the mockups set it at, which costs
  // legibility on the page with the most to read.
  //
  // 6% taller, then, and every page pays it equally so they still match
  // each other -- which is the constraint that actually matters. The
  // board still ends well above the button, with about as much air
  // under it as the mockups leave.
  frameH: 985 / 708,
  radius: 44 / 708,
  padX: 36 / 708,
  padTop: 38 / 708,
  padBottom: 35 / 708,
  surfaceRadius: 26 / 708,
  // Where the writing starts inside the white surface. Measured the
  // same way as the rest (the pack's text runs x=195..770 on a surface
  // that spans 164..799), and a share of the board rather than a fixed
  // number so the margin holds on a narrow phone.
  textPad: 31 / 708,

  // The ledge under it, and the two things resting on the ledge. In the
  // artwork both stand in the frame's own bottom band with their feet
  // exactly on the shelf line where the tray begins, so they are placed
  // from the frame's bottom edge and carry no y of their own.
  trayH: 37 / 708,
  marker: { x: 420 / 708, w: 88 / 708, h: 26 / 708 },
  eraser: { x: 520 / 708, w: 87 / 708, h: 25 / 708 },

  // The teacher, as a box hung off the board: he starts a sixth of a
  // board-width PAST its left edge and his feet land just below the
  // tray, which is what makes him read as standing in front of it
  // rather than pasted onto it.
  //
  // `below` is how far past the tray's bottom edge his feet go, and it
  // is what anchors him -- NOT a distance measured down from the top of
  // the board. The two were the same number while the board was the
  // pack's exact 930 tall; they stopped being the same the moment
  // frameH went to 985, and anchoring from the top would have left him
  // hovering 25 units above the floor.
  mascot: { x: -112 / 708, w: 369 / 708, h: 452 / 708, below: 35 / 708 },

  // Where his pointer ends up on the board, for anything that wants to
  // aim at it. Nothing does yet -- it is here because it is the number
  // the whole pose is built around and it would be guessed otherwise.
  pointer: { x: 247 / 708, y: 551 / 708 },

  // THE ONE RULE EVERY PAGE OBEYS: a box in the board's bottom-left
  // corner that nothing may be written in, because his crown, his coat,
  // his feet and the whole raised pointer are in it.
  //
  // The pack states the rule as "full-width content only above y=48% of
  // the canvas; anything lower must sit right of x=46%". The width is
  // exactly that: x=46% of the canvas is 392, which is his own bounding
  // box's right edge (384) plus 8px of daylight.
  //
  // The HEIGHT is not. y=48% is 885, and the highest thing he has is
  // his pointer's tip at 928 -- the pack's own page 2 writes down to
  // 945 and reads fine, because 885 was a safe round number rather than
  // a measurement. This is the measurement: the tip, plus the same 8px.
  // Worth the 43px it gives back, on a board that has to hold real
  // sentences at a real phone's width.
  //
  // Bottom-anchored, not top-anchored, so the rule still holds if a
  // long answer ever pushes the board taller -- he is anchored to the
  // bottom too, and the two move together.
  keepW: 264 / 708,
  keepH: 387 / 708,

  // The board inside the page: the stage runs from the teacher's left
  // edge to the board's right edge, and the board takes the right
  // 86% of it. The strip to its left is his.
  stageBoardX: 112 / 820,
  stageBoardW: 708 / 820,
};

// --- The four jobs (v0.5.2) --------------------------------------------
//
// One for each answer on the activity-level page: him at a desk, on his
// feet with a clipboard, walking a delivery round with a letter, and
// carrying parcels. All four are on that one page at once, which is why
// they are cut shorter and smaller than the poses above -- the two idles
// loop in a little over a second, the two walks take their full cycle
// because half of one reads as a hop rather than a step.
//
// ANIMATED, all 330pt tall at 10fps, cut from Damon's 30fps HEVC(Alpha)
// exports at every third frame:
//   sitting   247x330, 12 frames, 1.2s, 210 KB
//   standing  243x330, 13 frames, 1.3s, 206 KB
//   mail      246x330, 20 frames, 2.0s, 340 KB
//   parcel    253x330, 20 frames, 2.0s, 317 KB
// The aspect ratios differ by a few percent (0.736 to 0.767, his arms
// and boxes reach different distances), so the card scales each one by
// its own rather than assuming a common box -- see JOB_ASPECT.
export const MASCOT_JOBS = {
  sitting: assetUri('mascot_job_sitting.webp'),
  standing: assetUri('mascot_job_standing.webp'),
  mail: assetUri('mascot_job_mail.webp'),
  parcel: assetUri('mascot_job_parcel.webp'),
};

export const JOB_ASPECT = {
  sitting: 247 / 330,
  standing: 243 / 330,
  mail: 246 / 330,
  parcel: 253 / 330,
};

// --- What training you do (v0.5.3) -------------------------------------
//
// Two of these are new -- him on the couch with a controller, and him
// dribbling a ball -- and two are poses the app has had since v0.3.0:
// the curl and the run, which is what Damon meant by "we already have
// weightlifting and running". The run was drawn facing left, so it is
// mirrored here, the same way the goal page mirrors it.
//
// WHY EACH ONE CARRIES AN `art` BOX. The two new files are cropped to
// their own drawing, so the file IS the figure. The two borrowed poses
// are not: all seven poses share one 236x262 canvas (see
// MASCOT_POSE_FILES above) and each sits somewhere inside it with a
// different amount of air around it. Drawn at the same height as the
// new ones they would come out visibly smaller and a few points low.
// `art` is where the drawing actually is, as fractions of the file, so
// a tile can size and centre the FIGURE rather than the file. Measured
// off the union of every frame's alpha, which is also why the numbers
// are not round.
const WHOLE_FILE = { x: 0, y: 0, w: 1, h: 1 };
export const TRAINING_SCENES = {
  none: { uri: assetUri('mascot_train_couch.webp'), aspect: 281 / 330, art: WHOLE_FILE },
  cardio: {
    uri: MASCOT_POSES.run,
    aspect: 236 / 262,
    art: { x: 25 / 236, y: 19 / 262, w: 184 / 236, h: 243 / 262 },
    flip: true,
  },
  lifting: {
    uri: MASCOT_POSES.curl,
    aspect: 236 / 262,
    art: { x: 25 / 236, y: 24 / 262, w: 183 / 236, h: 230 / 262 },
  },
  sports: { uri: assetUri('mascot_train_sport.webp'), aspect: 289 / 330, art: WHOLE_FILE },
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
