// The app's visual language, in one file.
//
// Introduced in v0.0.72 with the Today-screen redesign. Every colour, size,
// radius and shadow the new design uses is named here rather than typed into
// a StyleSheet, for two reasons:
//
//   1. The palette was read off a mockup by eye. Some of these are going to
//      be slightly wrong, and tuning them should be a one-line edit in one
//      file rather than a hunt through five screens.
//   2. The redesign lands screen by screen. Today first, then Log Food,
//      History and Goals. Those later screens should inherit the same system
//      instead of each re-deriving it.
//
// Screens not yet redesigned still carry their own hard-coded styles. That
// is expected mid-migration, not an oversight -- as each is reworked its
// values move here and its literals go away.

// --- Colour ---------------------------------------------------------------
export const COLORS = {
  // Surfaces
  bg: '#f4f7fc',
  // The soft shapes behind the page title. Barely-there on purpose: they are
  // texture, not decoration you should notice.
  blob: '#e6eefb',
  card: '#ffffff',

  // Text, in descending emphasis
  text: '#16213f',
  textSoft: '#66718a',
  textMuted: '#98a2b6',
  textFaint: '#c2c9d6',

  // The small uppercase label above a card's contents ("DAILY FUEL")
  eyebrow: '#5b86d6',

  // One per macro. These carry meaning -- four quantities that must be told
  // apart at a glance -- so they are the least arbitrary colours here.
  //
  // Taken from the macro icon artwork (v0.0.80), so the flame, bicep, wheat
  // and droplet on the Today screen and the bars, wedges, dots and tiles
  // around them are all one colour per macro rather than three near-misses.
  //
  // FILLS ONLY. Three of the four are far too light to read as text on
  // white -- protein is 1.7:1 and carbs 1.9:1, where 4.5 is the readable
  // line. Anything that needs a coloured WORD uses `good`/`warn`/`over`
  // below, which were chosen for exactly that. Putting one of these on text
  // is the easy mistake here.
  // Protein, carbs and fat are the DARK end of each gradient below. Using
  // the dark end rather than the midpoint is what makes the small chip dots
  // visible on their own tints -- protein and carbs went from about 1.5:1 to
  // 3.9 and 3.3.
  calories: '#3699f3',
  protein: '#c84686',
  carbs: '#2392a6',
  fat: '#f3bf11',

  // The same four, faded, for progress-bar tracks, icon tiles and chips.
  // Written out rather than derived: React Native has no colour-mix, and
  // layering a low-opacity View over white costs an extra node per bar.
  caloriesSoft: '#ddeafd',
  proteinSoft: '#faecf3',
  carbsSoft: '#e9f4f6',
  fatSoft: '#fef9e7',

  // Interface blue, kept separate from the calorie blue above. They are
  // nearly the same colour and were briefly the same token, but a button
  // and a chart wedge answer to different rules: white on the calorie blue
  // is 3.0:1, which fails for 13pt bold button text. This one is darker for
  // that reason and should be used for buttons, active states and borders.
  accent: '#2f80f0',

  // --- Status, in three steps ---
  //
  // Going past a target is not one state, it is three, and treating it as
  // one was the bug this replaced: a bar that turned red the instant you
  // crossed your goal called 5 grams and 300 grams the same thing, and made
  // hitting a target look like failing one.
  //
  // `good` is the same green as protein by eye but a separate token on
  // purpose -- one is a macro's identity, the other is a verdict, and they
  // will not always want to move together.
  good: '#2fae52',
  goodSoft: '#dcf0e2',
  warn: '#e08b0f',
  warnSoft: '#fdeed2',
  // Darker twins of the three status colours, for when the status is a WORD
  // rather than a bar. The bright ones read fine as a fill but only manage
  // 2.4:1 as text on their own pale pill, where 4.5 is the line -- the score
  // badge is a number people actually have to read, so it gets these
  // instead. Same hues, enough darker to be legible: 4.5, 4.6 and 4.5 to 1.
  goodInk: '#1c7a3a',
  warnInk: '#946102',
  overInk: '#cc3229',
  // The far end. Deliberately not the same red as Remove -- one is a status,
  // the other is a button, and they appear on screen together.
  over: '#e8463f',
  overSoft: '#fdeceb',

  // Remove
  destructive: '#f2542d',

  // Tab bar
  tabActiveBg: '#e8f4b8',
  tabActive: '#16213f',
  tabInactive: '#98a2b6',

  // Hairlines and empty containers
  line: '#e8ecf3',
  emptyBg: '#eff4fc',
};

// --- Type -----------------------------------------------------------------
// Sizes and weights only. Colour stays at the call site, because the same
// size is often used at two different emphases.
// Light-to-dark ends for the donut's wedges, which shade across their arc.
// Everything flat -- bars, dots, chips -- uses the dark end above, so a bar
// and its wedge's deep edge are the same colour.
//
// TWO THINGS THE CONTRAST MATHS SAID, both accepted rather than designed
// around, because the label beside each colour already names it:
//
//   - Fat's dot sits at about 1.5:1 on its own tint and no tint fixes that.
//     Yellow on pale yellow has nowhere to go; darkening the tint moves both
//     ends together. The only real fix is a fat that isn't yellow.
//   - Calories (209deg) and carbs (189deg) are 19 degrees apart in hue, the
//     closest pair by far. They only ever appear together in the chip row
//     and Today's four bars, both of which are labelled.
export const MACRO_GRADIENT = {
  protein: ['#ef6a97', '#c84686'],
  carbs: ['#2cbcbd', '#2392a6'],
  fat: ['#ffd43a', '#f3bf11'],
};

// --- Log Food's macro chips -------------------------------------------
//
// A SECOND macro palette, and a deliberate one. Every other surface in this
// app -- the Today bars, the Goals wheel, the saved-goal chips -- uses the
// four COLORS.calories/protein/carbs/fat above. The Log Food mockup came
// back with a different set, and Damon picked it over matching (v0.0.84),
// so this is the one screen where a macro's colour differs from everywhere
// else.
//
// Kept as its own named block rather than typed into LogFoodScreen's
// StyleSheet so that decision stays reversible: pointing these eight values
// at the COLORS versions above is a single edit, and nothing else changes.
//
// Sampled off the mockup PNG rather than eyeballed -- modal colour inside
// each dot, so anti-aliasing at the circle's edge doesn't drag the value.
//
// CONTRAST, measured, and accepted rather than corrected: as non-text marks
// these want 3:1 against the tint they sit on. Carbs (3.3) and protein
// (3.1) clear it; calories' green is 2.1 and fat's amber is 1.65. Yellow on
// pale yellow has nowhere to go -- the same finding as COLORS.fat above --
// and darkening the tints would move both ends together. What makes this
// survivable is that the dot is never the only channel: the word KCAL,
// PROTEIN, CARBS or FAT sits directly beside every one of them.
export const LOG_CHIP = {
  calories: { dot: '#62c305', tint: '#f2fced' },
  protein: { dot: '#fd485c', tint: '#fff2f2' },
  carbs: { dot: '#0584fd', tint: '#eaf5fd' },
  fat: { dot: '#fdb705', tint: '#fdf8e8' },
};

export const TYPE = {
  screenTitle: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 1.3 },
  sectionTitle: { fontSize: 21, fontWeight: '800', letterSpacing: -0.2 },
  macroName: { fontSize: 19, fontWeight: '700' },
  macroValue: { fontSize: 17, fontWeight: '700' },
  entryName: { fontSize: 17, fontWeight: '700' },
  entrySub: { fontSize: 14, fontWeight: '500' },
  action: { fontSize: 16, fontWeight: '600' },
  pill: { fontSize: 12, fontWeight: '700' },
  tab: { fontSize: 12, fontWeight: '600' },
  version: { fontSize: 12, fontWeight: '500' },
  empty: { fontSize: 15, fontWeight: '500' },
};

// --- Shape ----------------------------------------------------------------
export const RADIUS = {
  card: 22,
  row: 18,
  tile: 15,
  // Anything fully rounded. A number this large behaves as "pill" at every
  // height RN will ever give these, and avoids computing height/2.
  pill: 999,
};

export const SPACE = {
  screen: 16,
  card: 18,
  rowGap: 10,
};

// --- Depth ----------------------------------------------------------------
// iOS reads the shadow* properties; Android only reads elevation and ignores
// the colour and offset entirely, so the two will never match exactly. Kept
// soft enough that the difference doesn't matter.
export const SHADOW = {
  card: {
    shadowColor: '#152a4a',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  row: {
    shadowColor: '#152a4a',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
};

export default { COLORS, LOG_CHIP, MACRO_GRADIENT, TYPE, RADIUS, SPACE, SHADOW };
