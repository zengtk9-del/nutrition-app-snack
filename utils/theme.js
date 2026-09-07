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

  // One per macro. These carry meaning -- four bars that must be told apart
  // at a glance -- so they are the least arbitrary colours here.
  calories: '#2f80f0',
  protein: '#2fae52',
  carbs: '#f2b01f',
  fat: '#a855e8',

  // The same four, faded, for progress-bar tracks and icon tiles. Written
  // out rather than derived: React Native has no colour-mix, and layering a
  // low-opacity View over white costs a extra node per bar.
  caloriesSoft: '#dde9fd',
  proteinSoft: '#dcf0e2',
  carbsSoft: '#fdefcf',
  fatSoft: '#f1e0fc',

  // Past your target. Deliberately not the same red as Remove -- one is a
  // status, the other is a button, and they appear on screen together.
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

export default { COLORS, TYPE, RADIUS, SPACE, SHADOW };
