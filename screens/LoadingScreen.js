import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity } from 'react-native';

import Mascot, { warmArt } from '../components/Mascot';
import { commit } from '../utils/haptics';
import { MASCOT_SCENES } from '../data/brandArt';
import { COLORS, RADIUS } from '../utils/theme';

// Shown for a few seconds between finishing the quiz and seeing the report.
// There's no real computation happening here — the numbers are already
// calculated by the time App.js switches to this screen — it exists purely
// so the report doesn't just appear instantly, which would undercut the
// "we built this specifically for you" feeling the report is going for.
//
// Which is exactly why he is on it in a lab coat, writing (v0.5.4): the
// screen's whole job is to say someone is working on your numbers, and
// five seconds of a bar alone says a spinner.
//
// The bar fills in randomly-sized, randomly-timed jumps instead of one
// smooth constant crawl, so it reads as real work happening rather than an
// obviously fake, perfectly even animation. It lands on 100% after roughly
// five seconds on average, though the exact time (and the pace along the
// way) varies a bit each time it runs, for that same reason.
//
// IT WAITS FOR YOU AT THE END (v0.5.5). It used to hand off by itself a
// beat after 100%, which meant the one moment the screen has something
// to say -- your plan is ready -- went by in 400ms. Now the bar lands,
// the line above changes, a button appears under it, and nothing happens
// until it is pressed. The button's space is held from the first frame,
// invisible, so its arrival does not shove the page upwards.
//
// The JUMPS ARE EASED rather than applied instantly: each one glides over
// a fraction of the gap before the next, which keeps the randomness
// (the point) without the bar snapping. That animation drives `width`, so
// it cannot use the native driver — the one place in the app that breaks
// that rule, and it is safe here because this screen has nothing else to
// do for five seconds. Animating a transform instead would squash the
// fill's rounded cap flat while it is short.
//
// onDone is read through a ref (refreshed every render) rather than closed
// over directly, so the one-time setup effect below doesn't restart the
// whole loading sequence from 0% if App.js ever re-renders and passes a
// new inline callback while this screen is still showing — see
// components/DragSlider.js for the same pattern, used there for the same
// reason.

// The fill is a row of flat slices rather than a gradient, because React
// Native cannot draw one without another package. Six is enough that the
// steps are invisible at this size, and they are flex:1 so the ramp
// always spans the fill however far along it is.
const FILL_RAMP = ['#00bcf7', '#00aefa', '#02a2fd', '#0498fd', '#0691fb', '#0b8bf5'];
const BAR_H = 22;
const FIGURE_H = 300;
const LAB_ASPECT = 549 / 720; // the file's own ratio, so he is never stretched
const JUMP_MS = 300;
const BTN_H = 56;
const BTN_GAP = 22;
const REVEAL_MS = 260;

export default function LoadingScreen({
  onDone,
  message = 'Creating your personal nutrition plan',
  doneMessage = 'Your personal nutrition plan is ready!',
}) {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const grow = useRef(new Animated.Value(0)).current;
  const reveal = useRef(new Animated.Value(0)).current;

  // The screen after this one is the report, and the report's board has
  // the teacher standing at it (v0.5.8). He is a separate 80 KB file on
  // the CDN, so without this the first page of the report draws its
  // board and then, a beat later, the broccoli in front of it. This
  // screen sits here for several seconds doing nothing else with the
  // network — exactly the right moment to fetch him.
  useEffect(() => {
    warmArt(MASCOT_SCENES.teacher);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let current = 0;
    let timer = null;

    const tick = () => {
      if (cancelled) return;
      const step = 4 + Math.random() * 7; // 4-11% per jump
      current = Math.min(100, current + step);
      setProgress(current);
      Animated.timing(grow, {
        toValue: current,
        duration: JUMP_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false, // a width, not a transform — see above
      }).start();
      if (current < 100) {
        const delay = 250 + Math.random() * 200; // 250-450ms between jumps
        timer = setTimeout(tick, delay);
      } else {
        // Hold on a full bar for a beat before saying so: the fill is
        // still gliding to the end for JUMP_MS after the number lands,
        // and a button that appears while it is moving looks early.
        timer = setTimeout(() => {
          if (cancelled) return;
          setReady(true);
          // The one moment in the app worth announcing. Eleven questions
          // and five seconds of a bar filling, and this is the end of
          // both — so it lands with the words, not with the button that
          // follows them.
          commit();
          Animated.timing(reveal, {
            toValue: 1,
            duration: REVEAL_MS,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true, // opacity and a transform, so it can
          }).start();
        }, 400);
      }
    };

    timer = setTimeout(tick, 250 + Math.random() * 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [grow, reveal]);

  return (
    <View style={styles.container} testID="loading-screen">
      {/* The same pale shapes the quiz pages use, at the size a page with
          nothing else on it can carry. */}
      <View pointerEvents="none" style={styles.decor}>
        <View style={[styles.blob, { width: 230, height: 230, top: -70, left: -80 }]} />
        <View style={[styles.blob, { width: 330, height: 330, top: 300, right: -150 }]} />
        <View style={[styles.blob, { width: 120, height: 120, top: 470, right: 26 }]} />
        <View style={[styles.blobSoft, { width: 460, height: 460, top: 250, left: -200 }]} />
      </View>

      <Text style={styles.title} testID="loading-title">
        {ready ? doneMessage : `${message}…`}
      </Text>

      <Mascot
        source={MASCOT_SCENES.lab}
        style={[styles.art, { height: FIGURE_H, width: FIGURE_H * LAB_ASPECT }]}
      />

      <View style={styles.track} testID="loading-track">
        <Animated.View
          testID="loading-fill"
          style={[
            styles.fill,
            { width: grow.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) },
          ]}
        >
          {FILL_RAMP.map((c) => (
            <View key={c} style={[styles.fillSlice, { backgroundColor: c }]} />
          ))}
        </Animated.View>
      </View>
      <Text style={styles.percent} testID="loading-percent">{`${Math.round(progress)}%`}</Text>

      {/* The slot is here from the first frame and only its contents
          fade in, so the page does not jump when they do. */}
      <View style={styles.buttonSlot} pointerEvents={ready ? 'auto' : 'none'}>
        <Animated.View
          style={{
            opacity: reveal,
            transform: [{ translateY: reveal.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
          }}
        >
          <TouchableOpacity
            testID="loading-button"
            style={styles.button}
            onPress={() => {
              if (ready && onDoneRef.current) onDoneRef.current();
            }}
            activeOpacity={0.85}
            disabled={!ready}
            accessibilityRole="button"
            accessibilityLabel="View it now"
            accessibilityElementsHidden={!ready}
            importantForAccessibility={ready ? 'yes' : 'no-hide-descendants'}
          >
            <Text style={styles.buttonText}>View it now</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    // The page's own margin, so the question fits on one line the way
    // Damon drew it; the bar takes the wider inset below.
    paddingHorizontal: 16,
  },
  decor: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  blob: { position: 'absolute', borderRadius: RADIUS.pill, backgroundColor: '#e6eefb' },
  blobSoft: { position: 'absolute', borderRadius: RADIUS.pill, backgroundColor: '#edf3fc' },
  title: {
    fontSize: 22,
    lineHeight: 29,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 46,
  },
  // Overrides every number components/Mascot.js sets for the corner.
  art: { alignSelf: 'center', marginTop: 0, marginRight: 0, marginBottom: 30 },
  track: {
    alignSelf: 'stretch',
    marginHorizontal: 11, // 16 + 11 = the bar's inset in the drawing
    height: BAR_H,
    borderRadius: BAR_H / 2,
    backgroundColor: '#cee6fb',
    overflow: 'hidden',
  },
  fill: { height: BAR_H, borderRadius: BAR_H / 2, flexDirection: 'row', overflow: 'hidden' },
  fillSlice: { flex: 1 },
  percent: { fontSize: 28, fontWeight: '800', color: COLORS.accent, marginTop: 14 },
  buttonSlot: { alignSelf: 'stretch', marginHorizontal: 11, height: BTN_H, marginTop: BTN_GAP },
  button: {
    height: BTN_H,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  buttonText: { fontSize: 18, fontWeight: '800', color: '#fff' },
});
