import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import Mascot, { MASCOT_SIZE } from './Mascot';
import { SPACE } from '../utils/theme';

// The broccoli in the corner of the four tabs — owned by the app rather
// than by each screen (v0.6.5).
//
// WHAT WAS WRONG. App.js renders a tab as `{activeTab === 'log' &&
// <LogFoodScreen/>}`, so changing tab UNMOUNTS one screen and mounts
// another. Each screen drew its own <Mascot/> inside its header, which
// meant the <Image> was destroyed and rebuilt every time — and an
// animated WebP that gets rebuilt starts again at frame 0. He visibly
// restarted on every tap of the tab bar.
//
// utils/mascotState.js was already doing its half correctly: a
// module-level machine with no React in it, precisely so that switching
// tab cannot change WHICH pose he is in. What it could not reach was
// the playback, which belonged to a component that no longer existed.
// One machine, four renderers, was always going to lose this.
//
// So there is now one renderer, and it lives above the tab content —
// which does not unmount while you are in the tabs, so neither does he.
//
// ---------------------------------------------------------------------
// AND HE STILL SCROLLS AWAY, WHICH IS THE WHOLE DIFFICULTY
//
// He used to be the last child of each screen's header, inside its
// ScrollView, so he slid up and off as you scrolled. Lifting him out
// would ordinarily pin him to the glass — and a broccoli hovering over
// your food list is not what anyone asked for.
//
// So he is lifted out AND told where the page is. `scrollY` is the
// offset of whichever screen is showing; he translates by minus that,
// which is exactly what being inside the content did for him. The
// difference is that the layer is now permanent and the motion is
// borrowed, rather than the layer being temporary and the motion free.
//
// Clamped at HIDE_AT, which is comfortably past his own height: once he
// is off the top there is nothing to be gained from translating him
// into orbit, and a clamped range is one the native driver can own.
//
// NOT EVERY TAB SCROLLS HIM. Log Food's header sits outside its list
// and never moved, so that screen simply reports no scroll and he stays
// where he is — which is what it already did. App.js resets the offset
// to zero on every tab change, so he starts each screen at the top.
//
// POSITION. His own style (components/Mascot.js) carries marginTop: -10
// and marginRight: -6, which is how he has always bled slightly past
// the screen's padding. Anchoring this wrapper at exactly SPACE.screen
// on both sides lets those margins do what they have always done and
// puts him on the pixel he was already on — rather than restating -10
// and -6 here, where the two copies would drift apart.
const HIDE_AT = 150;

export default function CornerMascot({ scrollY }) {
  const slide = scrollY
    ? {
        transform: [
          {
            translateY: scrollY.interpolate({
              inputRange: [0, HIDE_AT],
              outputRange: [0, -HIDE_AT],
              extrapolate: 'clamp',
            }),
          },
        ],
      }
    : null;

  return (
    // Not touchable, and must not take a touch from what is under him.
    <Animated.View pointerEvents="none" style={[styles.corner, slide]}>
      <Mascot />
    </Animated.View>
  );
}

// The hole he used to fill, for the four headers to keep.
//
// Deleting him from a header without this would let each title stretch
// into his space and re-wrap, and would shorten three of the four
// headers — moving everything below them up the screen. An empty box of
// exactly his dimensions means taking him out of the screens changes no
// layout at all.
//
// His margins are what make these differ from MASCOT_SIZE: marginRight
// -6 means he only ever claimed 102pt of a header's width, and
// marginTop -10 means 98pt of its height.
export function CornerMascotSlot() {
  return <View pointerEvents="none" style={styles.slot} />;
}

const styles = StyleSheet.create({
  corner: {
    position: 'absolute',
    top: SPACE.screen,
    right: SPACE.screen,
    // Android stacks by elevation before tree order, and the cards he
    // passes on his way up carry elevation 2 (SHADOW.card). Without
    // this he would slide behind them on Android and in front on iOS.
    elevation: 20,
    zIndex: 20,
  },
  slot: { width: MASCOT_SIZE - 6, height: MASCOT_SIZE - 10 },
});
