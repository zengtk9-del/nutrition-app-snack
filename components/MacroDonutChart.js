import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

// A donut chart showing the protein/carbs/fat calorie split, drawn entirely
// from plain Views — no react-native-svg or any other native dependency.
// This project already got burned once by a third-party native module
// (@react-native-community/slider) breaking under Expo Snack/Expo Go's
// bridgeless mode, which is why DragSlider.js was hand-built instead of
// using that library. Charting libraries carry the same risk, so this draws
// every pie slice using only `transform: rotate`, `overflow: hidden`, and
// `borderRadius` — properties plain Views already support everywhere, with
// every rotation using each View's own default center pivot (no custom
// transformOrigin, which isn't reliably supported across RN versions/Expo
// Go — this was deliberately designed around, not an oversight).
//
// THE TRICK — a colored circular sector from angle `a` to `a + sweep`
// (0deg = top of the circle, clockwise) is the overlap of two half-discs:
//   - Rotate a full circle-sized box by `b = a + sweep - 180` around its own
//     center, then keep only its right half (a fixed, non-rotating clip
//     nested inside it) — that visible half-disc spans [b, b+180].
//   - Inside that surviving half, do the same thing again with a second,
//     independent rotation `d = 180 - sweep`, which (once the outer box's
//     own rotation is layered underneath it) ends up spanning [b+d, b+d+180]
//     = [a, a+180] in absolute terms.
//   - Only what BOTH clips keep is drawn — and that intersection works out
//     to exactly [a, a+sweep], the sector we wanted.
// This only produces sectors up to 180deg, so any slice bigger than half the
// circle (e.g. a macro making up more than half of daily calories) is split
// into two equal halves and each rendered as its own sector — Wedge calls
// itself recursively for that case. This trick also holds up correctly at
// ANY intermediate sweep angle, not just the "before" and "after" values —
// b and d are continuous, well-defined functions of start/sweep across
// their whole valid range — which is what makes it safe to animate a
// wedge smoothly through a whole range of in-between angles (see the
// ring-shape tween in MacroDonutChart below) rather than just jumping
// between two fixed end states.
//
// This geometry was prototyped and screenshot-verified outside the app
// first (identical properties in plain HTML/CSS, since RN's transform/
// overflow/borderRadius map 1:1 to CSS) before being written here, across
// even splits, a slice bigger than 180deg, a near-100% dominant slice, and
// near-zero slivers — all rendered correctly with no gaps or overlaps.

function Wedge({ size, start, sweep, color }) {
  if (sweep <= 0) return null;
  if (sweep > 180) {
    return (
      <React.Fragment>
        <Wedge size={size} start={start} sweep={sweep / 2} color={color} />
        <Wedge size={size} start={start + sweep / 2} sweep={sweep / 2} color={color} />
      </React.Fragment>
    );
  }

  const b = start + sweep - 180;
  const d = 180 - sweep;
  const half = size / 2;

  return (
    <View
      style={[
        styles.rotator,
        { width: size, height: size, transform: [{ rotate: `${b}deg` }] },
      ]}
    >
      <View style={[styles.halfClip, { left: half, width: half, height: size }]}>
        <View
          style={[
            styles.rotator,
            { left: -half, width: size, height: size, transform: [{ rotate: `${d}deg` }] },
          ]}
        >
          <View style={[styles.halfClip, { left: half, width: half, height: size }]}>
            <View
              style={{
                position: 'absolute',
                left: -half,
                top: 0,
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: color,
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

// Exported so other screens showing these same three macros — e.g.
// MacroGoalsScreen's sliders — can use the exact same colors as this
// chart's own wedges/legend, instead of a second hardcoded copy drifting
// out of sync with this one.
export const MACRO_COLORS = { protein: '#e0554f', carbs: '#4f8ef7', fat: '#f2b134' };

// The ring's thickness scales with `calories` — a slim ring at a low
// calorie target, gradually thickening as the target climbs. Anchored to
// the same 1,000-5,000 kcal range MacroGoalsScreen's own Calories slider
// allows (duplicated as a plain constant here rather than imported, since
// this component has no other dependency on that screen and shouldn't
// need one just for this). The MIN/MAX ratio spread was widened from the
// original 0.11-0.2 per Damon's "make the change in size more drastic,
// use the space" request — combined with the much smaller, fixed-size
// hole below, this now takes the ring from a modest band at the lowest
// calorie target to nearly double its outer size at the highest, instead
// of a subtle shift between two similar-looking rings.
//
// THICKNESS_RATIO_MAX is deliberately not pushed even higher than 0.5 —
// MacroGoalsScreen renders this chart at size=200 inside ~48px of
// combined container/wheelBox padding, so at 0.5 the ring's outer edge
// tops out around 292px, which comfortably fits even a standard-width
// (375pt) iPhone screen with room to spare. A higher ratio would grow the
// on-screen circle wider than the available space and start clipping off
// the screen edges on real devices — "use the space" without overflowing
// it.
const THICKNESS_CALORIES_MIN = 1000;
const THICKNESS_CALORIES_MAX = 5000;
const THICKNESS_RATIO_MIN = 0.16;
const THICKNESS_RATIO_MAX = 0.5;

export function thicknessForCalories(calories, size) {
  const safeCalories = Number.isFinite(calories) ? calories : THICKNESS_CALORIES_MIN;
  const clamped = Math.max(THICKNESS_CALORIES_MIN, Math.min(THICKNESS_CALORIES_MAX, safeCalories));
  const t = (clamped - THICKNESS_CALORIES_MIN) / (THICKNESS_CALORIES_MAX - THICKNESS_CALORIES_MIN);
  const ratio = THICKNESS_RATIO_MIN + t * (THICKNESS_RATIO_MAX - THICKNESS_RATIO_MIN);
  return size * ratio;
}

// The center hole (where the kcal number sits) used to be `size - 2 *
// thickness` — a FIXED outer edge with the ring eating inward into the
// hole as it thickened, which visually read as "the ring is closing in on
// the number" rather than "the ring is growing". Flipped around: the hole
// is a CONSTANT diameter and the OUTER edge grows outward from there as
// thickness increases — the number's own little circle stays put, and the
// ring visibly expands away from it instead of closing in on it.
//
// HOLE_RATIO itself was sized down from an earlier 0.78 (a hole that took
// up most of the chart) to 0.46, per Damon's "make the inner circle
// smaller, tightly wrapped around the (number) kcal/day text" request —
// 0.46 of the default 200px chart is a 92px circle, which was measured
// (via a throwaway text-measurement page, not guessed) against the actual
// "5,000"/"kcal/day" label at this component's real font sizes: that text
// block is about 55x43px, a ~70px diagonal, so 92px leaves a close but
// uncramped margin around it rather than the old hole's large empty ring
// of white space. Shrinking the hole also frees up much more of the
// chart's total footprint for the ring itself to grow into, which is what
// makes the wider THICKNESS_RATIO spread above actually read as dramatic
// on screen instead of being mostly invisible inside a big hole.
const HOLE_RATIO = 0.46;

// Exported alongside thicknessForCalories for the same reason — a pure,
// renderer-independent function this project's test harness can assert
// on directly (constant hole size, growing outer size) rather than trying
// to read pixel dimensions back out of markup the mocked View/Text
// discards anyway (see the harness's own render-test-goals.mjs comments
// on this).
export function ringGeometryForCalories(calories, size, explicitThickness) {
  const thickness = explicitThickness != null ? explicitThickness : thicknessForCalories(calories, size);
  const holeSize = size * HOLE_RATIO;
  const outerSize = holeSize + thickness * 2;
  return { thickness, holeSize, outerSize };
}

// The biggest the ring's outer edge can ever get for a given `size` — used
// to reserve a fixed-size, centered "stage" for the ring (see RingShape
// below) so its hole never visibly drifts as its outer edge grows or
// shrinks. Exported for the same testability reason as the functions
// above it.
export function maxOuterSizeFor(size) {
  return ringGeometryForCalories(THICKNESS_CALORIES_MAX, size).outerSize;
}

// The ring itself — wedges plus a plain white backdrop circle behind
// where the number sits (the number/unit TEXT is drawn separately, see
// HoleNumberText below, so it can fade independently of the ring's own
// shape). This is deliberately the ONLY renderer for the ring's shape,
// used identically whether the numbers it's given are live/final values
// (dragging outside the guide) or an in-progress interpolated snapshot
// (mid-animation inside the guide) — after testing, Damon's own
// conclusion was "outside of tutorial, the outer circle moves very
// naturally, just copy that into the tutorial display" — so rather than
// build a second, separately-animated rendering path, the guide instead
// just feeds this exact same always-instant renderer a steady stream of
// interpolated numbers over 2.2 seconds (see MacroDonutChart's own tween
// effect below), the same way a real drag outside the guide feeds it a
// steady stream of real numbers many times a second. Every ring, at
// whatever its own current outerSize happens to be, is centered inside a
// fixed-size `stageSize` box sized for the LARGEST possible ring at this
// `size` (see maxOuterSizeFor above) — since that stage box never changes
// size across the whole animation, and every ring is centered within it
// the same way, the hole ends up at the exact same pixel position on
// every single frame. Only the ring's outer edge visibly moves.
function RingShape({ calories, proteinG, carbsG, fatG, size, thickness, stageSize }) {
  const proteinKcal = proteinG * 4;
  const carbsKcal = carbsG * 4;
  const fatKcal = fatG * 9;
  const total = proteinKcal + carbsKcal + fatKcal;

  const slices = [
    { key: 'protein', kcal: proteinKcal, color: MACRO_COLORS.protein },
    { key: 'carbs', kcal: carbsKcal, color: MACRO_COLORS.carbs },
    { key: 'fat', kcal: fatKcal, color: MACRO_COLORS.fat },
  ];

  let cumulative = 0;
  const { thickness: resolvedThickness, holeSize, outerSize } = ringGeometryForCalories(calories, size, thickness);
  const wedges =
    total > 0
      ? slices.map((s) => {
          const sweep = (s.kcal / total) * 360;
          const wedge = <Wedge key={s.key} size={outerSize} start={cumulative} sweep={sweep} color={s.color} />;
          cumulative += sweep;
          return wedge;
        })
      : null;

  return (
    <View style={[styles.ringStage, { width: stageSize, height: stageSize }]}>
      <View style={[styles.container, { width: outerSize, height: outerSize, borderRadius: outerSize / 2 }]}>
        {wedges}
        <View
          style={[
            styles.hole,
            {
              left: resolvedThickness,
              top: resolvedThickness,
              width: holeSize,
              height: holeSize,
              borderRadius: holeSize / 2,
            },
          ]}
        />
      </View>
    </View>
  );
}

// Just the two lines of text that sit inside the hole — kept separate
// from RingShape so it can fade between an old and new value on its own,
// independent of (and much quicker than) the ring's own slower,
// continuous growth. Always shows a plain final number, never an
// in-between tweened one — see MacroDonutChart's own numberFade
// bookkeeping below for why.
function HoleNumberText({ calories }) {
  return (
    <React.Fragment>
      <Text style={styles.holeCalories}>{Math.round(calories).toLocaleString()}</Text>
      <Text style={styles.holeUnit}>kcal/day</Text>
    </React.Fragment>
  );
}

function Legend({ proteinG, carbsG, fatG }) {
  const proteinKcal = proteinG * 4;
  const carbsKcal = carbsG * 4;
  const fatKcal = fatG * 9;
  const total = proteinKcal + carbsKcal + fatKcal;

  const slices = [
    { key: 'protein', label: 'Protein', grams: proteinG, kcal: proteinKcal, color: MACRO_COLORS.protein },
    { key: 'carbs', label: 'Carbs', grams: carbsG, kcal: carbsKcal, color: MACRO_COLORS.carbs },
    { key: 'fat', label: 'Fat', grams: fatG, kcal: fatKcal, color: MACRO_COLORS.fat },
  ];

  return (
    <View style={styles.legend}>
      {slices.map((s) => (
        <View key={s.key} style={styles.legendRow}>
          <View style={[styles.swatch, { backgroundColor: s.color }]} />
          <Text style={styles.legendLabel}>{s.label}</Text>
          <Text style={styles.legendValue}>
            {s.grams}g ({total > 0 ? Math.round((s.kcal / total) * 100) : 0}%)
          </Text>
        </View>
      ))}
    </View>
  );
}

// How long the ring takes to steadily grow/shrink from its old shape to
// its new one — Damon asked for "2+ seconds", then for the motion itself
// to be the outer circle actually moving rather than a fade, and finally
// clarified it should move "at a steady pace for 2.2s", so this is a
// literal linear interpolation over exactly that duration, not an easing
// curve or a fade.
const RING_ANIMATION_MS = 2200;
// One tween step every 30ms (~33 updates/sec, the same cadence
// MacroSlider's own local tween already uses) — smooth to the eye without
// re-rendering far more often than a screen can actually show.
const RING_TICK_MS = 30;
// The hole number's own much quicker "just switch, with a fade" swap —
// independent of, and far shorter than, the ring's 2.2s growth.
const NUMBER_FADE_MS = 400;

// `animate`: false (the default) renders every prop change instantly —
// this is what every normal, non-guided drag anywhere in the app should
// do, exactly as before. Only MacroGoalsScreen's guided walkthrough ever
// passes `animate={true}`, and only while it's actually running.
export default function MacroDonutChart({ calories, proteinG, carbsG, fatG, size = 180, thickness, animate = false }) {
  const stageSize = maxOuterSizeFor(size);
  const holeSize = size * HOLE_RATIO;

  // ---- Ring shape: steadily tweens from the last real values to the new
  // ones over RING_ANIMATION_MS when animate is true. `propsRef` always
  // tracks the last real prop values regardless of animate, which is what
  // makes it a safe, always-accurate starting point the moment a tween
  // needs to begin — not a shapeState that might have gone stale during a
  // stretch where animate was off.
  const propsRef = useRef({ calories, proteinG, carbsG, fatG });
  const [shapeState, setShapeState] = useState({ calories, proteinG, carbsG, fatG });
  const tweenIdRef = useRef(null);

  useEffect(() => {
    const from = propsRef.current;
    const changed =
      from.calories !== calories || from.proteinG !== proteinG || from.carbsG !== carbsG || from.fatG !== fatG;
    propsRef.current = { calories, proteinG, carbsG, fatG };

    if (tweenIdRef.current) {
      clearInterval(tweenIdRef.current);
      tweenIdRef.current = null;
    }
    if (!changed || !animate) return;

    const to = { calories, proteinG, carbsG, fatG };
    const steps = Math.max(1, Math.round(RING_ANIMATION_MS / RING_TICK_MS));
    let step = 0;
    tweenIdRef.current = setInterval(() => {
      step += 1;
      const t = Math.min(1, step / steps);
      setShapeState({
        calories: from.calories + (to.calories - from.calories) * t,
        proteinG: from.proteinG + (to.proteinG - from.proteinG) * t,
        carbsG: from.carbsG + (to.carbsG - from.carbsG) * t,
        fatG: from.fatG + (to.fatG - from.fatG) * t,
      });
      if (t >= 1) {
        clearInterval(tweenIdRef.current);
        tweenIdRef.current = null;
      }
    }, RING_TICK_MS);

    return () => {
      if (tweenIdRef.current) {
        clearInterval(tweenIdRef.current);
        tweenIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calories, proteinG, carbsG, fatG, animate]);

  // Whenever `animate` switches ON, snap shapeState to the CURRENT real
  // values immediately (no tween) — otherwise a stale shapeState left
  // over from the last time animate was on (e.g. dragging with the guide
  // closed, then reopening it) would flash briefly before the next real
  // change corrects it. MacroGoalsScreen itself never wants a replay
  // animation just from reopening the guide anyway — see its own
  // handleShowGuide comment.
  useEffect(() => {
    if (animate) {
      setShapeState({ calories, proteinG, carbsG, fatG });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate]);

  // While animate is off, render straight from the live props every time
  // (bypassing shapeState entirely) — the same zero-indirection, instant
  // path this chart has always used outside the guide, so ordinary
  // dragging stays exactly as responsive as before.
  const ringNumbers = animate ? shapeState : { calories, proteinG, carbsG, fatG };

  // ---- Hole number: a quick crossfade swap between the old and new
  // figure, decoupled from the ring's own slower animation above — this
  // always shows a plain final value, never one of the ring's in-between
  // tweened numbers, per Damon's original "the number just switch from
  // original to new, maybe add a fade effect" request.
  const [fadingNumberFrom, setFadingNumberFrom] = useState(null);
  const numberRef = useRef(calories);
  const numberFadeAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const prev = numberRef.current;
    numberRef.current = calories;
    if (prev !== calories && animate) {
      setFadingNumberFrom(prev);
      numberFadeAnim.setValue(0);
      Animated.timing(numberFadeAnim, { toValue: 1, duration: NUMBER_FADE_MS, useNativeDriver: true }).start(() => {
        setFadingNumberFrom(null);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calories, animate]);

  return (
    <View style={styles.wrap}>
      <View style={[styles.stage, { width: stageSize, height: stageSize }]}>
        <RingShape
          calories={ringNumbers.calories}
          proteinG={ringNumbers.proteinG}
          carbsG={ringNumbers.carbsG}
          fatG={ringNumbers.fatG}
          size={size}
          thickness={thickness}
          stageSize={stageSize}
        />
        <View style={styles.holeNumberOverlay} pointerEvents="none">
          <View style={[styles.holeNumberBox, { width: holeSize, height: holeSize }]}>
            {fadingNumberFrom != null && (
              <View style={styles.holeNumberLayer}>
                <HoleNumberText calories={fadingNumberFrom} />
              </View>
            )}
            <Animated.View
              style={[styles.holeNumberLayer, fadingNumberFrom != null ? { opacity: numberFadeAnim } : null]}
            >
              <HoleNumberText calories={calories} />
            </Animated.View>
          </View>
        </View>
      </View>

      <Legend proteinG={proteinG} carbsG={carbsG} fatG={fatG} />
    </View>
  );
}

const styles = StyleSheet.create({
  // `width: '100%'` here is the actual fix for the legend-label clipping
  // bug: without an explicit width, a View with `alignItems: 'center'` and
  // no other sizing shrink-wraps to its widest CHILD's content width —
  // which for this component is the donut circle itself (a fixed `size`,
  // 180-200px), not however much horizontal room this chart's caller
  // actually has available. `legend` below asks for `width: '100%'`
  // expecting to resolve against the real available width (e.g. the
  // Card's or MacroGoalsScreen's content width, ~350px+), but without this
  // line that 100% was instead resolving against the ~200px circle,
  // squeezing legendLabel's `flex: 1` share down to almost nothing next to
  // legendValue's un-shrinkable text — which is what was clipping
  // "Protein"/"Carbs"/"Fat" down to a sliver. Explicitly stretching `wrap`
  // to its own parent's full width breaks that shrink-wrap chain; the
  // circle and legend still end up visually centered underneath it via
  // `alignItems: 'center'` exactly as before.
  wrap: { alignItems: 'center', marginBottom: 14, width: '100%' },
  // `position: 'relative'` is what makes holeNumberOverlay's absolute
  // positioning below resolve against THIS box (the fixed-size ring
  // stage) instead of drifting up to some more distant positioned
  // ancestor.
  stage: { position: 'relative' },
  // Reserves a fixed-size, centered footprint for the ring itself — see
  // RingShape's own big comment above for why this is what actually keeps
  // the hole from drifting as the ring's outer edge grows/shrinks.
  ringStage: { alignItems: 'center', justifyContent: 'center' },
  // Sits exactly on top of `stage`, centered the same way RingShape
  // centers its own ring inside that same box — which is what lines the
  // number up with the ring's hole on every single frame, animated or
  // not.
  holeNumberOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // A fixed holeSize x holeSize anchor, `position: 'relative'` so its two
  // absolutely-positioned children (the fading-out old number and the
  // fading-in new one) overlap exactly instead of stacking one above the
  // other.
  holeNumberBox: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  holeNumberLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: { position: 'relative', overflow: 'hidden' },
  rotator: { position: 'absolute', top: 0 },
  halfClip: { position: 'absolute', top: 0, overflow: 'hidden' },
  hole: {
    position: 'absolute',
    backgroundColor: '#fff',
  },
  holeCalories: { fontSize: 22, fontWeight: '800', color: '#1a1a1a' },
  holeUnit: { fontSize: 13, fontWeight: '600', color: '#777', marginTop: 2 },
  legend: { marginTop: 16, width: '100%', maxWidth: 280 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  // flexShrink: 0 on the swatch and value, plus flexShrink: 1 + minWidth: 0
  // on the label, is a defensive belt-and-suspenders on top of the `wrap`
  // fix above — it guarantees the label is the ONLY thing that ever gives
  // up space under real pressure (RN's flexbox otherwise defaults a flex
  // item's minimum width to its own content size, "auto", rather than 0 —
  // `minWidth: 0` is what actually lets it shrink/wrap instead of forcing
  // an overflow that a tightly-packed row like this one would clip).
  swatch: { width: 12, height: 12, borderRadius: 3, marginRight: 8, flexShrink: 0 },
  legendLabel: { fontSize: 16, fontWeight: '600', color: '#1a1a1a', flex: 1, flexShrink: 1, minWidth: 0 },
  legendValue: { fontSize: 16, fontWeight: '700', color: '#555', flexShrink: 0, marginLeft: 8 },
});
