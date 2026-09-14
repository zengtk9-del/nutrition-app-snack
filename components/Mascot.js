// The broccoli in the corner of every tab (v0.2.3; renderer hardened in
// v0.2.6 after it took the whole app down).
//
// ONE COMPONENT, FOUR SCREENS, and that is the whole point. Today, Log
// Food, History and Goals each drew their own copy with their own numbers
// -- 116, 96, 108 and 104 points, at four different vertical offsets --
// so the mascot jumped and resized every time you changed tab. Damon
// spotted it across four screenshots. There is now exactly one place that
// decides how big it is and where it sits.
//
// IT IGNORES ITS CONTAINER, deliberately. The four headers do not agree
// on much: two centre their children and two align them to the top, and
// their content ranges from a single line of title (Today) to a title
// plus a seven-day strip (History). Under `alignItems` that means the
// same mascot lands in a different place on each one.
//
// So `alignSelf: 'flex-start'` is load-bearing rather than decoration --
// it overrides whatever the parent asked for, which makes this component
// the only thing that can move the mascot. Its top is the header's
// content top plus a fixed offset on every screen, whatever else the
// header is doing. Since all four screens put their header first inside
// the same SPACE.screen padding, that resolves to the same point on the
// glass.
//
// ---------------------------------------------------------------------
// WHY THIS FILE IS DEFENSIVE (v0.2.6)
//
// v0.2.5 imported expo-image at the top of this file. expo-image failed
// to evaluate in Snack's web player and took the entire app with it:
//
//     TypeError: Cannot read properties of undefined
//                (reading 'registerAsset')
//       Evaluating expo-image.js
//       Evaluating components/Mascot.js
//       Evaluating screens/DashboardScreen.js
//       Evaluating App.js
//
// Note the shape of that stack. A decorative image in a header reached
// up and killed App.js, because a static `import` at module scope makes
// every screen that draws a mascot depend on that package evaluating
// cleanly. Nothing about a broccoli in a corner deserves that power.
//
// Three things stop it happening again, in order of how early they fire:
//
//   1. WEB NEVER LOADS IT. react-native-web has no
//      `react-native/Libraries/Image/AssetRegistry`, which is the module
//      expo-asset reaches for and the literal source of `registerAsset`
//      of undefined. A browser decodes animated WebP by itself, so
//      there was nothing to gain there in the first place.
//   2. NATIVE LOADS IT IN A try/catch. If the require throws -- wrong
//      version for the SDK, module missing from the runtime -- the catch
//      keeps it local and the app carries on without it.
//   3. A RENDER ERROR IS CAUGHT TOO. `Cannot find native module
//      'ExpoImage'` throws when the element renders, not when the module
//      loads, so a try/catch around the require cannot see it. The
//      default export below is an error boundary for exactly that case.
//
// The worst outcome is now a still broccoli. It is no longer a blank app.
// ---------------------------------------------------------------------

import React from 'react';
import { Image as RNImage, Platform, StyleSheet } from 'react-native';
import { ART_READY, MASCOT, MASCOT_ANIMATED, USE_ANIMATED_MASCOT } from '../data/brandArt';

// The one number. 108 is close to the middle of the four it replaces
// (116/108/104/96) and is what History was already using, so it is the
// smallest total change across the app.
//
// The headers size themselves to their tallest child, so setting this
// also makes all four headers the same height -- which is the other half
// of "the mascot part does not change at all".
export const MASCOT_SIZE = 108;

// --- Picking a renderer, once, at module load ---------------------------
//
// `require` rather than `import` on purpose: an import is hoisted and
// unconditional, which is precisely how v0.2.5 turned one bad package
// into a blank app. A require can be skipped on a platform that does not
// want it and wrapped in a try/catch on one that does.
//
// It still runs exactly once, at module load, so there is no per-render
// cost and no chance of two screens disagreeing about the renderer.
let ExpoImage = null;
let rendererNote = '';

if (Platform.OS === 'web') {
  // Not a failure -- a choice. See point 1 in the header note.
  rendererNote = 'web: the browser decodes animated WebP by itself';
} else {
  try {
    // eslint-disable-next-line global-require
    const mod = require('expo-image');
    if (mod && mod.Image) ExpoImage = mod.Image;
    else rendererNote = 'expo-image loaded but exports no Image';
  } catch (err) {
    rendererNote = 'expo-image did not load: ' + ((err && err.message) || err);
  }
}

// Exported so a probe -- or a console during a support conversation --
// can answer "which one is actually drawing?" without guessing.
export const MASCOT_RENDERER = ExpoImage ? 'expo-image' : 'react-native';
export const MASCOT_RENDERER_NOTE = rendererNote;

if (!ExpoImage && rendererNote) {
  // Once, at load. Loud enough to find, quiet enough not to spam a list
  // that mounts the mascot on every tab change.
  console.warn('[Mascot] drawing with React Native Image — ' + rendererNote);
}

// WHICH FILE THE FOUR TABS DRAW.
//
// One decision, made here, so "is the mascot animated" is a property of
// the app rather than of whichever screen you happen to be looking at.
// Switching tabs cannot change it, because every tab asks this same
// function.
//
// The animated file only goes out to something that can actually animate
// it. expo-image decodes animated WebP on both platforms; a browser does
// it natively in an <img>. React Native's own Image on a device does
// not -- Android needs Fresco's animated-webp module and iOS has no
// animated-WebP path at all -- so on that combination this deliberately
// hands back the static PNG. A still mascot beats an empty square.
function mascotSource() {
  if (!USE_ANIMATED_MASCOT) return MASCOT;
  if (ExpoImage || Platform.OS === 'web') return MASCOT_ANIMATED;
  return MASCOT;
}

// The mascot as drawn. Split out from the default export because an
// error boundary cannot catch errors thrown by its own render -- only by
// a child's.
function MascotImage({ source, size, style }) {
  const Renderer = ExpoImage || RNImage;
  // API DIFFERENCES, small but not optional:
  //   contentFit  is expo-image's name for resizeMode ('contain' means
  //               the same thing in both)
  //   autoplay    defaults true, which is what an idle mascot wants --
  //               named anyway so the intent survives a default change
  //   transition  a cross-fade on load. 0, because the static PNG always
  //               popped in at full opacity and a fade on every tab
  //               switch would read as a bug.
  const fit = ExpoImage
    ? { contentFit: 'contain', autoplay: true, transition: 0 }
    : { resizeMode: 'contain' };
  return (
    <Renderer
      // An explicit `source` still wins, so one screen can be given a
      // different pose later without disturbing the other three. With
      // none, every tab draws whatever mascotSource() says.
      source={source || mascotSource()}
      style={[styles.mascot, size !== MASCOT_SIZE && { width: size, height: size }, style]}
      {...fit}
      accessibilityRole="image"
      accessibilityLabel="Broccoli mascot"
    />
  );
}

let warnedOnRender = false;

export default class Mascot extends React.Component {
  constructor(props) {
    super(props);
    this.state = { renderFailed: false };
  }

  // Point 3 in the header note. `Cannot find native module 'ExpoImage'`
  // is thrown when the element renders, which is after every try/catch
  // around the require has already passed.
  static getDerivedStateFromError() {
    return { renderFailed: true };
  }

  componentDidCatch(err) {
    if (warnedOnRender) return;
    warnedOnRender = true;
    console.warn('[Mascot] renderer threw, falling back to the static PNG — ' + ((err && err.message) || err));
  }

  render() {
    // ART_READY is the switch in data/brandArt.js that covers the whole
    // illustrated set. False means the art is not on the CDN yet, and the
    // app deliberately draws nothing here rather than a broken image --
    // see that file's header.
    if (!ART_READY) return null;

    const { source, size = MASCOT_SIZE, style } = this.props;

    if (this.state.renderFailed) {
      // Deliberately the PNG and deliberately React Native's Image: if
      // the fancy renderer just threw, the safe thing is the one format
      // and one component that have worked since v0.0.73.
      return (
        <RNImage
          source={MASCOT}
          style={[styles.mascot, size !== MASCOT_SIZE && { width: size, height: size }, style]}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel="Broccoli mascot"
        />
      );
    }

    return <MascotImage source={source} size={size} style={style} />;
  }
}

const styles = StyleSheet.create({
  mascot: {
    width: MASCOT_SIZE,
    height: MASCOT_SIZE,
    // Overrides the parent header's alignItems -- see the note above.
    // Without this the mascot sits in a different place on each tab.
    alignSelf: 'flex-start',
    // Lets the art bleed slightly past the header's top and the screen's
    // right padding, the way all four screens already had it. Same
    // numbers everywhere now instead of four guesses.
    marginTop: -10,
    marginRight: -6,
  },
});
