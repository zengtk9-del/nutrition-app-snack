// Portrait only (v0.7.3).
//
// Every screen in this app is laid out for a portrait phone, and several
// are laid out for it quite specifically:
//
//   - the report's board is sized in units of its own width, with a
//     keep-out corner for the teacher measured against a 393pt screen;
//   - the quiz's dials, the weight scale and the body-fat grid all
//     assume a tall column;
//   - the tab pager cuts its pages to the window width and the tab bar
//     measures its pill from four flex: 1 buttons across that width.
//
// None of that is broken by a rotation so much as made pointless by it:
// turned sideways the board has no room above the tray, the dials lose
// most of their travel, and a 740pt-wide tab bar puts four icons in the
// middle of a very long white pill. Supporting landscape is not a
// tweak, it is a second design. So the app does not turn.
//
// ---------------------------------------------------------------------
// TWO MECHANISMS, BECAUSE THEY COVER DIFFERENT THINGS
//
// 1. app.json's `"orientation": "portrait"` is the real answer. It is
//    build-time native configuration: it writes the supported
//    orientations into the iOS Info.plist and the Android manifest, so
//    the OS never offers the app a landscape frame in the first place
//    and there is nothing to snap back from. But it only takes effect
//    in a build, and this app currently runs in Expo Go through Snack,
//    where the container was built to allow every orientation.
//
// 2. So this file also locks at runtime, which is what makes it work
//    today. expo-screen-orientation is bundled inside Expo Go, so it
//    needs no custom build to run in Snack.
//
// Keeping both is not belt and braces for its own sake: the native
// config is the one that stops the rotation happening, and the runtime
// lock is the one that works right now.
//
// ---------------------------------------------------------------------
// IT CANNOT TAKE THE APP DOWN
//
// Same discipline as utils/haptics.js and components/Mascot.js, for the
// same reason: v0.2.5 put `import { Image } from 'expo-image'` at the
// top of a file and one package that would not evaluate took App.js
// with it. A screen that stays upright is worth that even less. So:
// require rather than import, one try/catch at module load, and the
// call's promise rejection swallowed.
//
// The worst case is a phone that still turns.
//
// PINNED to "~9.0.9" in package.json, the SDK 54 line. expo-* packages
// are on Expo's unified versioning, so npm's newest is a much higher
// major and a floating range would drop a mismatched native module into
// a 54 runtime — exactly how v0.2.5 happened.
import { Platform } from 'react-native';

let ScreenOrientation = null;
let note = '';

if (Platform.OS === 'web') {
  // A browser window has no orientation to lock, and the web build is
  // not a product anyone uses — it is where this app gets previewed.
  note = 'web: a browser window is resized, not rotated';
} else {
  try {
    // eslint-disable-next-line global-require
    ScreenOrientation = require('expo-screen-orientation');
  } catch (err) {
    note = 'expo-screen-orientation did not load: ' + ((err && err.message) || err);
  }
}

export const ORIENTATION_AVAILABLE = !!ScreenOrientation;
export const ORIENTATION_NOTE = note;

// What actually happened, for a console during the next "it still
// rotates" conversation. The haptics round cost three turns because
// every failure path was silent; this one writes its outcome down.
let outcome = 'not attempted yet';
export function orientationReport() {
  return {
    platform: Platform.OS,
    available: !!ScreenOrientation,
    note,
    outcome,
  };
}

// Lock upright, once, at startup.
//
// PORTRAIT_UP rather than PORTRAIT: the plain PORTRAIT lock still
// permits upside-down on Android, which is a rotation, which is the
// thing being switched off.
//
// THE ENUM IS READ OFF THE MODULE AND NEVER GUESSED. expo-screen-
// orientation's OrientationLock values are numbers, not strings, and a
// wrong number here would not fail — it would lock the app to whatever
// that number happens to mean, which could be landscape. expo-haptics'
// enums were lowercase strings and writing a literal fallback was safe;
// here it is not, so if the enum is missing this does nothing and says
// so. app.json still covers the build.
export function lockPortrait() {
  if (!ScreenOrientation) {
    outcome = 'skipped: ' + (note || 'no expo-screen-orientation');
    return Promise.resolve();
  }
  const locks = ScreenOrientation.OrientationLock;
  const target = locks && (locks.PORTRAIT_UP != null ? locks.PORTRAIT_UP : locks.PORTRAIT);
  if (target == null) {
    outcome = 'skipped: OrientationLock has no PORTRAIT_UP or PORTRAIT — not guessing a number';
    console.warn('[orientation] ' + outcome);
    return Promise.resolve();
  }
  if (typeof ScreenOrientation.lockAsync !== 'function') {
    outcome = 'skipped: the module loaded but has no lockAsync (no native side in this runtime)';
    console.warn('[orientation] ' + outcome);
    return Promise.resolve();
  }
  try {
    const p = ScreenOrientation.lockAsync(target);
    if (p && typeof p.then === 'function') {
      return p.then(
        () => { outcome = 'locked'; },
        (err) => {
          outcome = 'rejected: ' + ((err && err.message) || err);
          // The one failure worth a line in the console: on iPad the
          // lock is refused outright unless the app opts out of split
          // view, which app.json does with ios.requireFullScreen.
          console.warn('[orientation] could not lock to portrait — ' + outcome
            + '. On iPad this usually means requireFullScreen is not set.');
        }
      );
    }
    outcome = 'locked (returned nothing to wait on)';
    return Promise.resolve();
  } catch (err) {
    outcome = 'threw: ' + ((err && err.message) || err);
    return Promise.resolve();
  }
}

export default { lockPortrait, orientationReport };
