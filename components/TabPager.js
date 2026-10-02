import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';

// What one page is wide before anything has been measured. Exported so
// that App.js and the tab bar start from the SAME guess the pager does:
// two components guessing separately could disagree, and a tab bar whose
// idea of a page width differs from the pager's would put the pill in
// the wrong place by that difference.
export function pageWidthGuess() {
  return Math.round(Dimensions.get('window').width);
}

// The four tabs, side by side, draggable (v0.7.0).
//
// Until now App.js drew one tab at a time -- `{activeTab === 'log' &&
// <LogFoodScreen/>}` -- which can only ever cut from one screen to the
// next. A drag across needs two screens on the glass at once, moving
// together, which means all four have to exist at the same time. That
// is the whole change; everything else here is bookkeeping.
//
// A HORIZONTAL pagingEnabled ScrollView, rather than a PanResponder.
// This app has hand-built three draggable things already (DragSlider,
// MacroSlider, RulerSlider) and would happily build a fourth, but a
// pager is the one case where the platform's own is clearly better:
// paging physics, the rubber-band at the two ends, an interrupted
// fling, and -- the part that would have cost days -- deciding whether
// a given drag belongs to this pager or to the vertical ScrollView
// inside the page. Two scroll views at right angles sort that out
// between themselves natively. A PanResponder would have had to be
// told, in the same way DragSlider had to be told to keep a gesture
// the page's ScrollView wanted back.
//
// ---------------------------------------------------------------------
// WHAT KEEPING ALL FOUR ALIVE CHANGED, BESIDES MAKING THIS POSSIBLE
//
// Screens no longer unmount when you leave them, so they keep their
// state: leave Log Food mid-search, come back, and the search is still
// there. That is how a tab bar is normally expected to behave and it
// comes free here, but it IS a change -- before this, every tab was
// rebuilt from scratch on every visit.
//
// It also ended the bug that v0.6.5 went to some trouble to work
// around: the corner mascot used to restart his animation on every tab
// change, because the screen he lived in was being destroyed and
// rebuilt. Nothing unmounts now, so he simply plays on, and the
// overlay that was keeping him alive has gone back into the headers
// where he slides with his own page.
//
// ---------------------------------------------------------------------
// ONE PLACE A SWIPE WILL NOT WORK, and it is not fixable from here:
// the row of category tiles across the top of Log Food is itself a
// horizontal scroller. Two scrollers on the SAME axis do not hand
// gestures to each other -- the inner one keeps them -- so a drag that
// starts on that strip scrolls the categories rather than changing
// tab. Anywhere else on the screen works. Every app with a carousel
// inside a pager has this.
export default function TabPager({ index, onIndexChange, scrollX, onWidth, children, testID }) {
  // The first render assumes the window's width; onLayout corrects it
  // before anything is visible, same as the quiz's cards and the
  // report's board.
  const [width, setWidth] = useState(pageWidthGuess);
  const ref = useRef(null);
  // Where the scroll view itself believes it is. Without this, the
  // effect below would fire a scrollTo in response to the index change
  // that a swipe just caused -- telling the pager to go where it
  // already is, in the middle of settling there.
  const atRef = useRef(index);
  const widthRef = useRef(width);

  // --- Telling the tab bar where the drag is, while it is dragging ----
  //
  // v0.7.1. v0.7.0 reported a tab change in onMomentumScrollEnd and
  // nowhere else, which is the right place to CHANGE TAB -- but it fires
  // only once the swipe has fully settled, after the deceleration. So
  // the pill under the icons sat on the old tab for the whole drag and
  // then jumped, which read as lag, and was: about a third of a second
  // of it. Damon noticed it on a swipe and not on a tap, which is
  // exactly the shape of this bug -- a tap sets activeTab immediately.
  //
  // The fix is for the bar to follow the scroll rather than the
  // outcome. This writes the raw horizontal offset, every frame, into a
  // value App.js hands to the tab bar.
  //
  // ON THE NATIVE DRIVER, which is the whole reason this is safe to do
  // on every frame of every swipe: the offset goes into the value and
  // out to the pill's transform on the UI thread, without waking
  // JavaScript at all. A JS-driven version would re-render the bar sixty
  // times a second during a drag and trade one kind of lag for a worse
  // one.
  //
  // Raw pixels, not pages: the native driver cannot divide on the way
  // in. The bar is told the page width and converts, which also means
  // the two cannot disagree about where page 2 starts.
  const onScroll = useMemo(
    () => (scrollX
      ? Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })
      : undefined),
    [scrollX]
  );

  // The bar needs the measured width, not the guess, or its pill lands
  // short by the difference on any phone the guess was wrong about.
  useEffect(() => {
    if (onWidth) onWidth(width);
  }, [width, onWidth]);

  useEffect(() => {
    if (atRef.current === index && widthRef.current === width) return;
    const sameWidth = widthRef.current === width;
    atRef.current = index;
    widthRef.current = width;
    // Animated.ScrollView forwards its ref straight to the ScrollView
    // instance (Animated.createAnimatedComponent has done that since RN
    // 0.62), so scrollTo is right there. getNode() is the pre-0.62 way
    // and costs one `&&` to keep working if Snack ever serves an older
    // runtime than SDK 54's.
    const sv = ref.current && (ref.current.scrollTo ? ref.current
      : (ref.current.getNode && ref.current.getNode()));
    if (sv) {
      // Animated when the index changed (a tab was tapped — the slide
      // is the point), instant when only the width did (a rotation, or
      // the first measurement, where an animation would be a lurch).
      sv.scrollTo({ x: index * width, y: 0, animated: sameWidth });
    }
  }, [index, width]);

  return (
    <Animated.ScrollView
      ref={ref}
      testID={testID}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      // flex: 1 ONLY, and deliberately nothing else — see styles below.
      style={styles.pager}
      onLayout={(e) => {
        const next = Math.round(e.nativeEvent.layout.width);
        if (next && next !== width) setWidth(next);
      }}
      // Paging always decelerates, so this always fires — including for
      // a slow drag released without a flick.
      onMomentumScrollEnd={(e) => {
        const next = Math.round(e.nativeEvent.contentOffset.x / Math.max(1, width));
        atRef.current = next;
        if (next !== index) onIndexChange(next);
      }}
      // Where the tab bar's pill comes from (see onScroll above). With
      // the native driver this does not reach JavaScript at all; the
      // throttle is here so that it stays sane if anything ever adds a
      // plain listener.
      onScroll={onScroll}
      scrollEventThrottle={16}
    >
      {React.Children.map(children, (child, i) => (
        // Each page is exactly one screen wide. The key is the position
        // rather than anything about the child, because these four
        // never reorder and a key that changed would unmount the screen
        // it belonged to — which is the one thing this must never do.
        <View key={i} style={{ width }} collapsable={false}>
          {child}
        </View>
      ))}
    </Animated.ScrollView>
  );
}

// flex: 1 and NOTHING ELSE, and the "nothing else" is the load-bearing
// part.
//
// Each page above is given a width and no height, and it fills the
// screen vertically only because of a detail of React Native's own
// ScrollView: a horizontal one styles ITSELF `flexDirection: 'row'`
// (ScrollView.js, styles.baseHorizontal), which makes height the cross
// axis, which makes the default stretch hand the content container —
// and so each page, and so each screen's own flex: 1 — the pager's full
// height.
//
// Add `flexDirection: 'column'` here and that chain breaks: height
// becomes the main axis, the content container sizes to its content,
// and all four pages collapse to the height of whatever happens to be
// in them, with the tab bar riding up under it. Modelled in a browser
// to be sure of it — with the row direction every page measures the
// pager's full 780pt, including one holding a single line of text;
// with column, 18pt. There is no error and nothing logs; it just looks
// broken. Same for setting contentContainerStyle, which would replace
// the row direction the content container needs.
const styles = StyleSheet.create({
  pager: { flex: 1 },
});
