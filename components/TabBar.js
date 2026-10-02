import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPE, RADIUS } from '../utils/theme';

// The bar at the bottom, and the pill that follows your thumb (v0.7.1).
//
// WHAT WAS WRONG. v0.7.0 made the four tabs draggable, and the bar did
// not follow. It was redrawn when `activeTab` changed, and activeTab
// changed in the pager's onMomentumScrollEnd -- which fires when a swipe
// has finished settling, not while it is moving. So through the whole
// drag and the whole deceleration the pill stayed on the tab you were
// leaving, and then jumped. About a third of a second of nothing
// happening, which is exactly long enough to read as the app being slow.
// Tapping an icon felt fine, because a tap sets activeTab on the spot --
// which is why the lag only showed up on a swipe.
//
// WHAT IT DOES NOW. The pill is one layer that slides, positioned from
// the pager's live scroll offset instead of from the outcome of the
// gesture. Drag halfway to History and the pill is halfway there; let go
// and it finishes with the page; change your mind mid-drag and it comes
// back with you. The same mechanism animates a tap, because a tap makes
// the pager animate its own scroll, which moves the offset, which moves
// the pill. One path, both gestures -- rather than a spring here and a
// slide there that would have to be kept looking alike.
//
// ON THE NATIVE DRIVER, all of it. `transform` and `opacity` are the two
// things the native driver takes, and between them they do everything
// here, so a drag costs no JavaScript at all. That constraint is why the
// colours are done the way they are, below.
//
// ---------------------------------------------------------------------
// WHY EACH TAB IS DRAWN TWICE
//
// The active icon and label are a different colour from the inactive
// ones, and `color` is not a native-driver property -- animating it
// would mean re-rendering this bar on every frame of every swipe, which
// is the thing we are trying to stop doing. So each tab draws its
// content twice, once in each colour, stacked exactly on top of each
// other, and what animates is the top copy's opacity. A cross-fade
// instead of a colour change, and the native driver is happy with it.
//
// The inactive copy underneath stays fully opaque rather than fading out
// as the active one fades in. Two half-transparent copies would make the
// glyph itself go thin at the halfway point; one opaque copy with
// another fading in over it keeps it solid the whole way across.
//
// Laid out in a browser to check the stacking really is exact, and it
// is: in a 390pt window the four buttons measure 88pt each, evenly
// spaced; the overlay's box comes out identical to the inactive copy's
// to the pixel; and the ICON lands on the same pixel in both, so the
// glyph itself never ghosts.
//
// The LABEL does, a little. The active one is bolder as well as darker,
// and "Today" measures 29pt regular against 32pt bold -- 1.5pt of drift
// at each end, both copies being centred. At rest, which is where the
// eye is almost always, only one copy shows and the bar is pixel for
// pixel what it was before this change. In flight it is 1.5pt of
// softness on an 11pt label, for about a sixth of a second, while it is
// sliding anyway. The alternative was to give up the weight change, and
// the weight change is worth more than that.
//
// Measured too: the pill's box is exactly the box the old
// `tabInnerActive` background occupied, so this moved the highlight
// without resizing it.
export default function TabBar({ tabs, activeKey, onPress, scrollX, pageWidth }) {
  // The pill's four resting places, MEASURED rather than worked out from
  // the bar's padding and a division. The buttons are flex: 1 so they
  // are equal and the arithmetic would be right, but it would also be
  // one more copy of the padding numbers that has to be kept in step
  // with the stylesheet, and this is what onLayout is for. x is relative
  // to the bar, which is the frame the pill is positioned in.
  const [boxes, setBoxes] = useState([]);
  //
  // NOT rounded, deliberately. Four flex: 1 buttons in a 354pt row are
  // 88.5pt each, and rounding each frame on its own turned that into
  // steps of 89, 88, 89 — a pill that was half a point wider than the
  // button it sat on and landed half a point off on two of the four
  // tabs. Invisible, but it is invisible wrongness bought for nothing:
  // layout is sub-pixel on the device anyway. (The PAGER rounds its
  // width, and should: its scrollTo targets have to land exactly on
  // boundaries the platform computes from the same number.)
  const measure = useCallback((i, layout) => {
    setBoxes((prev) => {
      const was = prev[i];
      const now = {
        x: layout.x,
        y: layout.y,
        width: layout.width,
        height: layout.height,
      };
      if (was && was.x === now.x && was.y === now.y
        && was.width === now.width && was.height === now.height) return prev;
      const next = prev.slice();
      next[i] = now;
      return next;
    });
  }, []);

  // Until all four have reported, there is nowhere to put the pill. One
  // frame, before anything is on screen.
  const ready = scrollX && pageWidth > 0
    && boxes.length === tabs.length && boxes.every(Boolean);

  // Scroll offset in pixels -> the pill's offset in pixels. Two
  // different scales: the pager is the full screen wide, the bar is
  // inset by its margin and padding, so page 2 starting at 780 has to
  // become a pill sitting at whatever tab 2 measured at.
  const slide = ready
    ? scrollX.interpolate({
      inputRange: tabs.map((_, i) => i * pageWidth),
      outputRange: boxes.map((b) => b.x - boxes[0].x),
      // Both ends, and it matters at both: a rubber-band pull past the
      // first or last page reports an offset outside the range, and
      // without this the pill would walk out of the bar.
      extrapolate: 'clamp',
    })
    : 0;

  // How much of the active colour this tab is showing: all of it when
  // the pager is on it, none of it a page away, linear in between. For
  // the first and last tab the range runs off the end of the pager,
  // which the clamp handles.
  const activeness = (i) => (ready
    ? scrollX.interpolate({
      inputRange: [(i - 1) * pageWidth, i * pageWidth, (i + 1) * pageWidth],
      outputRange: [0, 1, 0],
      extrapolate: 'clamp',
    })
    // Before the first measurement, no animation to run: show the
    // active tab outright rather than a bar with nothing lit.
    : (tabs[i].key === activeKey ? 1 : 0));

  return (
    <View style={styles.tabBar}>
      {ready && (
        <Animated.View
          testID="tab-pill"
          // It is decoration behind the buttons; it must not eat a tap
          // aimed at the tab it is sitting on.
          pointerEvents="none"
          style={[
            styles.pill,
            {
              left: boxes[0].x,
              top: boxes[0].y,
              width: boxes[0].width,
              height: boxes[0].height,
              transform: [{ translateX: slide }],
            },
          ]}
        />
      )}
      {tabs.map((tab, i) => (
        <TouchableOpacity
          key={tab.key}
          style={styles.tabButton}
          onPress={() => onPress(tab.key)}
          onLayout={(e) => measure(i, e.nativeEvent.layout)}
          accessibilityRole="tab"
          // Deliberately the settled tab, not the one the pill is
          // nearest. Half way through a drag you have not selected
          // anything yet, and a screen reader announcing four
          // selections during one swipe would be worse than useless.
          accessibilityState={{ selected: activeKey === tab.key }}
        >
          {/* The inactive copy, which is what gives the button its size
              -- the active copy is absolutely positioned over it and so
              measures nothing. */}
          <View style={styles.tabInner}>
            <MaterialCommunityIcons name={tab.icon} size={22} color={COLORS.tabInactive} />
            <Text style={styles.tabLabel}>{tab.label}</Text>
          </View>
          {/* The active copy. Same style object, so the same padding and
              the same centring put the glyph on the same pixel; only the
              colours differ. */}
          <Animated.View
            pointerEvents="none"
            style={[styles.tabInner, styles.tabOver, { opacity: activeness(i) }]}
          >
            <MaterialCommunityIcons name={tab.icon} size={22} color={COLORS.tabActive} />
            <Text style={[styles.tabLabel, styles.tabLabelActive]}>{tab.label}</Text>
          </Animated.View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // Lifted wholesale out of App.js, unchanged, so the bar looks exactly
  // as it did -- except that the pill now moves. It floats clear of the
  // screen edge rather than sitting flush against it (v0.0.76, from the
  // History mockup), on every tab, because a bar that only detached on
  // one screen would read as a bug.
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.line,
    marginHorizontal: 12,
    marginBottom: 8,
    paddingVertical: 7,
    paddingHorizontal: 6,
    shadowColor: '#152a4a',
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  tabButton: { flex: 1, alignItems: 'center' },
  tabInner: {
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: RADIUS.tile,
    alignSelf: 'stretch',
  },
  // The pill. Was `tabInnerActive: { backgroundColor }` on whichever
  // tab was active, which is why it could only appear and disappear.
  // Now it is one view in the bar's own coordinates that slides between
  // the four boxes the buttons measured.
  pill: {
    position: 'absolute',
    borderRadius: RADIUS.tile,
    backgroundColor: COLORS.tabActiveBg,
  },
  // The active copy, laid over the inactive one. absoluteFillObject
  // against the button, so it inherits the box the inactive copy
  // established instead of having its own idea of it.
  tabOver: { ...StyleSheet.absoluteFillObject },
  tabLabel: { ...TYPE.tab, color: COLORS.tabInactive, marginTop: 3 },
  tabLabelActive: { color: COLORS.tabActive, fontWeight: '700' },
});
