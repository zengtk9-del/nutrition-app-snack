// The broccoli in the corner of every tab (v0.2.3).
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
// WHERE THE ANIMATION GOES. When the animated file exists, it is swapped
// in HERE -- one source, one component, four screens. That is the reason
// this is a component rather than a shared style object: a style can only
// carry the geometry, and an animated mascot needs a different renderer
// (see `source` below), a fallback for when it fails to load, and
// somewhere to hold playback state. A tab change must not restart it or
// resize it, which it cannot now do, because every tab mounts the same
// component with the same props.

import React from 'react';
import { StyleSheet } from 'react-native';
// expo-image, not React Native's own <Image> (v0.2.5). See the note on
// the renderer below -- the short version is that RN's Image does not
// animate on Android, and this one does.
import { Image } from 'expo-image';
import { ART_READY, MASCOT, MASCOT_ANIMATED, USE_ANIMATED_MASCOT } from '../data/brandArt';

// The one number. 108 is close to the middle of the four it replaces
// (116/108/104/96) and is what History was already using, so it is the
// smallest total change across the app.
//
// The headers size themselves to their tallest child, so setting this
// also makes all four headers the same height -- which is the other half
// of "the mascot part does not change at all".
export const MASCOT_SIZE = 108;

// WHICH FILE THE FOUR TABS DRAW (v0.2.4).
//
// One decision, made here, so "is the mascot animated" is a property of
// the app rather than of whichever screen you happen to be looking at.
// Switching tabs cannot change it, because every tab asks this same
// function.
//
// ON THE RENDERER (v0.2.5). This draws through expo-image rather than
// React Native's own <Image>. v0.2.4 used RN's, deliberately, because
// expo-image's resolution in Expo Snack was unverified and the failure
// mode for an unresolvable package is the whole app refusing to bundle --
// which is how lottie-react-native behaves. Damon asked to switch, so
// the risk is now taken knowingly rather than avoided.
//
// What it buys: animation on Android (RN's Image cannot, because Fresco
// needs native configuration Snack has no way to provide) and a real
// 8-bit alpha channel instead of GIF's one bit.
//
// IF SNACK REFUSES THE PACKAGE, the symptom is the app not loading at all
// rather than a still mascot, and the fix is to go back to the v0.2.4
// build. Nothing else in the app imports expo-image, so this file and
// package.json are the whole of the change.
//
// API DIFFERENCES from RN's Image, small but not optional:
//   contentFit  replaces resizeMode ('contain' means the same thing)
//   autoplay    defaults true on both platforms, which is what an idle
//               mascot wants -- named here anyway so the intent survives
//               a future default change
//   transition  a cross-fade on load. 0 because a mascot popping in at
//               full opacity is what the static PNG always did, and a
//               fade would read as a bug on a tab switch.
const mascotSource = () => (USE_ANIMATED_MASCOT ? MASCOT_ANIMATED : MASCOT);

export default function Mascot({ source, size = MASCOT_SIZE, style }) {
  // ART_READY is the switch in data/brandArt.js that covers the whole
  // illustrated set. False means the art is not on the CDN yet, and the
  // app deliberately draws nothing here rather than a broken image --
  // see that file's header.
  if (!ART_READY) return null;

  return (
    <Image
      // An explicit `source` still wins, so one screen can be given a
      // different pose later without disturbing the other three. With
      // none, every tab draws whatever mascotSource() says.
      source={source || mascotSource()}
      style={[styles.mascot, size !== MASCOT_SIZE && { width: size, height: size }, style]}
      contentFit="contain"
      autoplay
      transition={0}
      accessibilityRole="image"
      accessibilityLabel="Broccoli mascot"
    />
  );
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
