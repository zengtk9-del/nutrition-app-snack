// What the app feels like under a thumb (v0.6.1).
//
// Four verbs, named for what happened rather than for how hard to buzz:
//
//   choose()   a choice registered -- an option card, a unit toggle, a
//              dial crossing a mark. The one that repeats.
//   commit()   something was saved, applied, or arrived. A logged meal,
//              a followed goal, a plan that finished building.
//   nudge()    something small happened and you should feel that it
//              did. Removing a row you can put back in two taps.
//   warn()     something was destroyed that you will not get back
//              without work -- one of your five named plans.
//   fail()     something went wrong.
//
// THE NAMES ARE THE POINT. expo-haptics speaks in strengths (Light,
// Medium, Heavy, Rigid, Soft) and a call site that says "Medium" has
// baked a guess about feel into a screen. A call site that says
// "commit" has said what it means, and the feel is one line in this
// file -- which is where it belongs, because haptics are tuned by
// holding a phone and changing a number, not by reasoning.
//
// ---------------------------------------------------------------------
// WHAT DOES NOT BUZZ, AND WHY THAT IS MOST OF THE APP
//
// The failure mode of haptics is not too few. Opening a screen, pressing
// Next, switching tabs, scrolling a list, tapping a row to see what is
// inside it -- none of these buzz. Navigation is not an event; it is the
// user moving around, and a phone that twitches every time they do is a
// phone they turn the feature off on.
//
// What is left is the short list above: a choice, a commit, a
// destruction, a failure. iOS does not buzz when you push a navigation
// controller either.
//
// ---------------------------------------------------------------------
// NATIVE ONLY, DELIBERATELY
//
// expo-haptics does run on web, through the Vibration API. That API is a
// crude on/off motor pulse with a duration -- it is not a taptic engine,
// and it cannot do the thing `choose()` is for. Forty of those a second
// down a dial drag on a phone browser would be unpleasant in a way the
// native version is not, and on a laptop it does nothing at all. So web
// gets silence, which is what it had yesterday.
//
// ---------------------------------------------------------------------
// IT CANNOT TAKE THE APP DOWN
//
// Same discipline as components/Mascot.js, for the same reason: v0.2.5
// put `import { Image } from 'expo-image'` at the top of a file and one
// package that would not evaluate took App.js with it. A buzz deserves
// that power even less than a broccoli does. So:
//
//   - require, not import, so it can be skipped on a platform that does
//     not want it and wrapped where it is;
//   - one try/catch at module load, and the app simply has no haptics if
//     the module is not there;
//   - every call wrapped AND its promise's rejection swallowed, since
//     these are async and an unhandled rejection is a yellow box over
//     the UI rather than a crash, which is worse in its own way -- the
//     app looks broken because a vibration failed.
//
// The worst case is a phone that does not buzz.
// PINNED TO THE SDK 54 LINE in package.json, "~15.0.8", and that is not
// housekeeping. expo-haptics is on Expo's unified versioning now, so
// npm's newest is the 57.x line and a floating range would drop a 57
// module into a 54 runtime -- which is precisely how v0.2.5 took the
// whole app down with expo-image. The dependency gate refuses a
// wildcard on any expo-* package for that reason.
import { Platform } from 'react-native';

let Haptics = null;
let note = '';

if (Platform.OS === 'web') {
  note = 'web: the Vibration API is a motor pulse, not a taptic engine — see above';
} else {
  try {
    // eslint-disable-next-line global-require
    Haptics = require('expo-haptics');
  } catch (err) {
    note = 'expo-haptics did not load: ' + ((err && err.message) || err);
  }
}

// Exported so a probe — or a console during a support conversation —
// can answer "is anything actually firing?" without guessing.
export const HAPTICS_AVAILABLE = !!Haptics;
export const HAPTICS_NOTE = note;

if (!Haptics && note && Platform.OS !== 'web') {
  console.warn('[haptics] silent — ' + note);
}

// --- The values the native side actually receives ---------------------
//
// expo-haptics' enums are plain lowercase strings: Success is 'success',
// Light is 'light'. Read off the module when the import brought them,
// and otherwise written out -- because `Haptics.NotificationFeedbackType
// .Success` on a module whose enums did not come through is a
// TypeError inside a try/catch, which is to say another silent nothing.
// The enum stays the source of truth where it exists; the literal is
// what it equals.
function level(enumName, key, literal) {
  const table = Haptics && Haptics[enumName];
  return (table && table[key]) || literal;
}
const SUCCESS = level('NotificationFeedbackType', 'Success', 'success');
const WARNING = level('NotificationFeedbackType', 'Warning', 'warning');
const ERROR = level('NotificationFeedbackType', 'Error', 'error');
const LIGHT = level('ImpactFeedbackStyle', 'Light', 'light');

// The one switch. Nothing reads it yet; it is here so "turn these off"
// is a line rather than a refactor, and so a probe can prove silence.
let enabled = true;
export function setHapticsEnabled(on) {
  enabled = !!on;
}
export function hapticsEnabled() {
  return enabled;
}

// How close together two `choose()` buzzes may land.
//
// A dial drag reports a new value every frame it crosses a mark, which
// on a fast flick is every 16ms. iOS coalesces selection feedback at
// that rate; Android's vibrator does not, and sixty pulses a second is
// a motorboat. 40ms caps it at twenty-five, which still reads as one
// tick per mark at any speed a thumb can actually move.
//
// Global rather than per-control on purpose: there is one phone in the
// hand, and four macro sliders on one screen should not be able to buzz
// four times at once.
const CHOOSE_GAP_MS = 40;
let lastChooseAt = 0;

// --- Why nothing happened ---------------------------------------------
//
// v0.6.1 shipped haptics that did not fire, and finding out why cost
// three rounds. It was not the code -- the phone had all vibration
// switched off under Settings > Accessibility > Touch -- and the only
// reason that took so long is that EVERY way this can fail was built
// to fail silently. The app never breaks, which was the point; but "no
// buzz" could equally have been a missing module, a native side absent
// from the runtime, a rejected call, Low Power Mode, iOS's System
// Haptics switch, or that one, and not one of them said so anywhere.
//
// The diagnostic panel that settled it is gone (v0.6.4). This stayed,
// because it is the part that stops the next one costing three rounds:
// failures are still swallowed at the call site, and now also written
// down, and the FIRST real one is logged once. A phone that cannot
// buzz leaves a trace in the console instead of leaving a mystery.
//
// On Damon's own phone, for the record, every call returns 'ok'. iOS
// accepts the request and discards it when the user has turned
// vibration off; there is no error to catch and nothing to fix.
const outcomes = {};
let firstError = null;
let loggedFirst = false;

function record(verb, what) {
  outcomes[verb] = what;
  const bad = what && what.indexOf('ok') !== 0 && what.indexOf('skipped') !== 0;
  if (bad && !firstError) firstError = verb + ': ' + what;
  // Once, ever. These fire on every tap and a log per tap would bury
  // the thing it is trying to show.
  if (bad && !loggedFirst) {
    loggedFirst = true;
    console.warn('[haptics] ' + verb + ' did not go through — ' + what
      + '. Everything still works; the phone just will not buzz.');
  }
}

// Fire and forget, from the caller's side. expo-haptics rejects on a
// device with no haptic hardware, in a simulator, when the native
// module is not in the runtime (it throws UnavailabilityError), or when
// the OS simply refuses -- none of which a call site can do anything
// about, and all of which would otherwise surface as a warning box over
// the UI.
//
// Returns a promise anyway, so a test can await one.
function fire(verb, run) {
  if (!enabled) {
    record(verb, 'skipped: haptics switched off');
    return Promise.resolve();
  }
  if (!Haptics) {
    record(verb, 'skipped: ' + (note || 'no expo-haptics'));
    return Promise.resolve();
  }
  try {
    const p = run();
    if (p && typeof p.then === 'function') {
      return p.then(
        () => { record(verb, 'ok'); },
        (err) => { record(verb, 'rejected: ' + ((err && err.message) || err)); }
      );
    }
    record(verb, 'ok (returned nothing to wait on)');
    return Promise.resolve();
  } catch (err) {
    record(verb, 'threw: ' + ((err && err.message) || err));
    return Promise.resolve();
  }
}

// Everything known about why the phone is or is not buzzing. Nothing in
// the app reads this; it is for a console during the next "no haptics"
// conversation, which is a cheap thing to keep after the last one.
export function hapticsReport() {
  return {
    platform: Platform.OS,
    available: !!Haptics,
    note,
    // What the module actually handed back, which is the one thing that
    // separates "not installed" from "installed, no native side".
    exports: Haptics
      ? ['selectionAsync', 'impactAsync', 'notificationAsync']
          .filter((k) => typeof Haptics[k] === 'function')
          .join(', ') || 'none of the three functions'
      : '—',
    enums: Haptics ? `${SUCCESS}/${WARNING}/${ERROR}/${LIGHT}` : '—',
    firstError,
    outcomes: { ...outcomes },
  };
}

// A choice registered. Selection feedback is the lightest thing the
// taptic engine does and the only one meant to repeat -- it is what a
// picker wheel uses, which is exactly what the dials are.
export function choose() {
  const now = Date.now();
  if (now - lastChooseAt < CHOOSE_GAP_MS) {
    record('choose', 'skipped: throttled, within ' + CHOOSE_GAP_MS + 'ms of the last one');
    return Promise.resolve();
  }
  lastChooseAt = now;
  return fire('choose', () => Haptics.selectionAsync());
}

// Saved, applied, arrived.
export function commit() {
  return fire('commit', () => Haptics.notificationAsync(SUCCESS));
}

// Small, done, nothing lost. A Remove button with no confirmation
// behind it still owes the user an acknowledgement, and a warning
// notification -- two firm taps -- is far too much drama for taking a
// banana back out of today's log. This is one soft tap that says the
// button worked.
export function nudge() {
  return fire('nudge', () => Haptics.impactAsync(LIGHT));
}

// Destroyed, and not easily undone. Not an error -- the user meant it,
// and in this app they confirmed it through a dialog first -- but one
// of five named plans is worth more than a logged banana, and should
// not feel the same going.
export function warn() {
  return fire('warn', () => Haptics.notificationAsync(WARNING));
}

// Went wrong.
export function fail() {
  return fire('fail', () => Haptics.notificationAsync(ERROR));
}

// --- A dial crossing its marks ----------------------------------------
//
// All three sliders report a value on every frame of a drag, already
// snapped to the nearest mark -- so most frames report the SAME number
// as the last one and only the frames that crossed a mark report a new
// one. That difference is the tick, and this is the one line of
// bookkeeping it takes to notice it.
//
// `start` seeds the value a drag begins from, so the first frame of a
// drag is silent rather than buzzing for a mark nobody crossed. One
// ticker per slider, because four macro sliders on one screen each
// cross their own marks; the throttle inside choose() is what stops
// them from all buzzing at once.
export function createTicker() {
  let last = null;
  return {
    start(value) {
      last = value;
    },
    at(value) {
      if (value === last) return;
      last = value;
      choose();
    },
  };
}

export default {
  choose,
  commit,
  nudge,
  warn,
  fail,
  createTicker,
  hapticsReport,
  setHapticsEnabled,
  hapticsEnabled,
};
