import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, PanResponder, StyleSheet } from 'react-native';
import { COLORS } from '../utils/theme';

// A HORIZONTAL ruler control (v0.1.1): a tape of tick marks slides left and
// right under a pointer that never moves, and whatever number is under the
// pointer is the value. Damon's description exactly -- "the type we use for
// age, but horizontal. User drag value across the mark instead of drag of
// mark on a axis of value."
//
// WHY NOT JUST ROTATE DragSlider. Two reasons, one of them load-bearing:
//
//   1. DragSlider renders EVERY tick as a View. That is fine at the sizes
//      the quiz asks of it -- ages 13-100 is 88 of them -- and impossible
//      here. Calories for a 100g food run 0-900, and a serving runs to
//      3,000; at one View per tick that is hundreds to thousands of them
//      mounted at once for a control you can only ever see twenty of. This
//      one renders only the ticks inside the viewport (plus a margin), so
//      the range can grow without the cost following it.
//   2. DragSlider's own header comment asks, in as many words, not to flip
//      its axis without checking first. It is wired into three quiz
//      questions. A new file cannot regress those.
//
// What IS shared is the interaction, deliberately, so both rulers feel the
// same under the thumb: a PanResponder (no native slider -- this project
// got burned once by @react-native-community/slider under Expo Go's
// bridgeless mode), positions computed from the distance the finger has
// travelled SINCE the drag began rather than from where it is on screen,
// and a separate un-rounded `liveValue` driving the tape every frame while
// the rounded value is what gets reported outward.
//
// DIRECTION. The tape moves with your finger, exactly. Drag left and the
// tape goes left, which brings the numbers that were off the right edge in
// under the pointer -- so dragging left counts up. That is what a tape
// measure does when you pull it, and it is the same lockstep rule
// DragSlider follows vertically.
//
// TICKS VS LABELS. At the ranges this is used for, a label on every tick
// would be unreadable and a tick for every labelled value would make the
// tape kilometres long. So minor ticks are drawn but bare, and every
// `majorEvery`-th one gets a number under it -- an actual ruler.

const PX_PER_TICK = 9;
const TAPE_HEIGHT = 62;
const MINOR_H = 12;
const MAJOR_H = 22;
// How many ticks past each edge of the viewport to keep mounted, so a fast
// drag never shows a bare gap before the next render catches up.
const OVERSCAN = 8;

// A step small enough to feel precise and large enough that crossing the
// whole range stays a few swipes. Exported because the caller needs the
// same numbers the ruler is using, and two places guessing separately is
// how they drift apart.
//
// Derived rather than tabulated, because the range here is not a fixed
// menu -- it is nine times whatever weight the user typed, so it runs from
// 100 to 45,000. A hand-written ladder of thresholds looked fine at the
// sizes I had in mind and gave a 5 kg food a tape 16,000pt long, about
// fifty swipes end to end. Picking the smallest tidy step that keeps the
// tick count under MAX_TICKS holds the drag distance roughly constant
// whatever the range, which is the property that actually matters.
const NICE_STEPS = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000];
const MAX_TICKS = 300;

export function rulerStepFor(range) {
  const step = NICE_STEPS.find((s) => range / s <= MAX_TICKS) || NICE_STEPS[NICE_STEPS.length - 1];
  // Every tenth tick carries a number. At PX_PER_TICK that puts a label
  // every 90pt -- about three visible at once on a phone, whatever the
  // step underneath them happens to be.
  return { step, majorEvery: 10 };
}

export default function RulerSlider({
  label,
  value,
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  // What the -/+ buttons move by, as opposed to `step`, which is the
  // spacing of the ticks and therefore the granularity of a DRAG (v0.1.3).
  //
  // They are different jobs. A tick every kcal would make the tape six
  // times longer than a thumb can comfortably cross, so dragging works in
  // fives; but "812" is a real number off a label and has to be typeable
  // somehow. The buttons are that somehow.
  fineStep = 1,
  majorEvery = 10,
  onValueChange,
  onSlidingStart,
  onSlidingComplete,
  // Both default to minimumValue/maximumValue: the range you can REACH,
  // where that is narrower than the range the tape DRAWS. Same split
  // DragSlider has carried since the target-weight ruler needed it.
  //
  // v0.1.2, and it exists because of a bug worth remembering. Locking a
  // macro puts a floor under the calories, and the first version did that
  // by moving minimumValue -- which moved the tape's origin and, because
  // the step is derived from the span, its tick density too. Locking
  // protein at 112g redrew a 0-900 tape labelled 750/800/850/900 as a
  // 448-900 one labelled 788/808/828. Nothing had changed but the lock,
  // and the whole ruler jumped. The scale has to be a property of the
  // food, not of what happens to be pinned.
  valueMin,
  valueMax,
  color = COLORS.accent,
  unit = '',
  formatLabel = (v) => `${v}`,
  style,
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const [liveValue, setLiveValue] = useState(value);
  const isDraggingRef = useRef(false);
  const dragStartValueRef = useRef(value);
  const lastRawValueRef = useRef(value);

  // PanResponder.create runs once (useRef only evaluates its argument on
  // mount), so anything its callbacks close over directly would be frozen
  // at first-render values forever. The maximum here MOVES -- it is 9 kcal
  // per gram of whatever amount the user typed above this control -- so a
  // frozen copy would clamp to the wrong ceiling for the rest of the
  // session. Same fix DragSlider and MacroSlider both use.
  const propsRef = useRef();
  propsRef.current = {
    value,
    minimumValue,
    maximumValue,
    valueMin: valueMin ?? minimumValue,
    valueMax: valueMax ?? maximumValue,
    step,
    onValueChange,
    onSlidingStart,
    onSlidingComplete,
  };

  // Clamping is the REACHABLE range's job. Drawing is minimum/maximum's.
  const clamp = (raw) => {
    const { valueMin: min, valueMax: max } = propsRef.current;
    return Math.max(min, Math.min(max, raw));
  };
  // Snapping, with a direction (v0.1.3).
  //
  // Plain nearest-tick rounding is right whenever the drag STARTED on a
  // tick, and wrong the moment the -/+ buttons have left the value between
  // two. From 302, nearest is 300 -- so a drag upward would report a
  // number LOWER than where it began, which is the one thing a ruler must
  // never do.
  //
  // So an off-grid start is resolved the way you are already travelling:
  // the first movement lands on the next tick in that direction, and from
  // there it is on the grid and ordinary rounding takes over. Damon's
  // case, from 303: drag up and it reads 303, 305, 310; drag down and it
  // reads 303, 300, 295.
  const snapForDrag = (raw) => {
    const { step: s } = propsRef.current;
    const from = dragStartValueRef.current;
    const nearest = Math.round(raw / s) * s;
    if (Math.abs(from / s - Math.round(from / s)) < 1e-9) return clamp(nearest);
    if (raw > from) return clamp(Math.max(Math.ceil(from / s) * s, nearest));
    if (raw < from) return clamp(Math.min(Math.floor(from / s) * s, nearest));
    return clamp(from);
  };

  // Follow `value` when something other than this drag changed it -- the
  // amount above was edited and the ceiling moved, or the form loaded an
  // existing food.
  useEffect(() => {
    if (!isDraggingRef.current) setLiveValue(value);
  }, [value]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      // Only claim gestures that are actually sideways. This control sits
      // inside the form's vertical ScrollView, and a finger that starts on
      // the tape but travels UP is someone scrolling the page, not setting
      // calories -- claiming that would make the form feel stuck.
      onMoveShouldSetPanResponder: (evt, g) => Math.abs(g.dx) > Math.abs(g.dy),
      // Once a sideways drag IS ours, keep it for the whole gesture rather
      // than letting the ScrollView take it back part-way through.
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: () => {
        const { value: v, onSlidingStart: onStart } = propsRef.current;
        isDraggingRef.current = true;
        dragStartValueRef.current = v;
        lastRawValueRef.current = v;
        setLiveValue(v);
        if (onStart) onStart();
      },
      onPanResponderMove: (evt, g) => {
        // A tap wobbles a couple of pixels; ignoring that stops a plain
        // touch from nudging the number.
        if (Math.abs(g.dx) < 3) return;
        const { step: s, onValueChange: onChange } = propsRef.current;
        // Minus, not plus: see DIRECTION above. Dragging left (negative dx)
        // pulls higher numbers in from the right.
        const rawValue = dragStartValueRef.current - (g.dx / PX_PER_TICK) * s;
        lastRawValueRef.current = rawValue;
        setLiveValue(clamp(rawValue));
        if (onChange) onChange(snapForDrag(rawValue));
      },
      onPanResponderRelease: () => {
        isDraggingRef.current = false;
        setLiveValue(snapForDrag(lastRawValueRef.current));
        if (propsRef.current.onSlidingComplete) propsRef.current.onSlidingComplete();
      },
      onPanResponderTerminate: () => {
        isDraggingRef.current = false;
        setLiveValue(snapForDrag(lastRawValueRef.current));
        if (propsRef.current.onSlidingComplete) propsRef.current.onSlidingComplete();
      },
    })
  ).current;

  // One kcal at a time, for the number a label actually says. Same
  // onSlidingStart -> onValueChange -> onSlidingComplete lifecycle a real
  // drag fires, so the form's drag-baseline snapshot needs no special
  // case: from its side a tap is just a very short drag.
  const nudge = (direction) => {
    const { value: v, valueMin: lo, valueMax: hi, onValueChange: onChange, onSlidingStart: onStart, onSlidingComplete: onDone } =
      propsRef.current;
    const next = Math.max(lo, Math.min(hi, v + direction * (fineStep > 0 ? fineStep : 1)));
    if (next === v) return;
    if (onStart) onStart();
    setLiveValue(next);
    if (onChange) onChange(next);
    if (onDone) onDone();
  };

  const safeStep = step > 0 ? step : 1;
  const tickCount = Math.max(1, Math.round((maximumValue - minimumValue) / safeStep) + 1);
  // Position is measured against the DRAWN range, so a narrower reachable
  // range slides the tape less far rather than rescaling it.
  const clampedLive = Math.max(minimumValue, Math.min(maximumValue, liveValue));
  const reachMin = valueMin ?? minimumValue;
  const reachMax = valueMax ?? maximumValue;
  const currentTickX = ((clampedLive - minimumValue) / safeStep) * PX_PER_TICK;
  const translateX = trackWidth / 2 - currentTickX;

  // Only what can be seen. The window is derived from where the tape
  // currently sits, so it follows the drag.
  const firstVisible = Math.max(0, Math.floor(-translateX / PX_PER_TICK) - OVERSCAN);
  const lastVisible = Math.min(tickCount - 1, Math.ceil((-translateX + trackWidth) / PX_PER_TICK) + OVERSCAN);

  const ticks = [];
  if (trackWidth > 0) {
    for (let i = firstVisible; i <= lastVisible; i++) {
      const tickValue = minimumValue + i * safeStep;
      const isMajor = i % majorEvery === 0;
      // Out of reach (a lock is holding the total above or below this):
      // still drawn, so the scale never moves, but faded so the wall is
      // visible rather than the tape just refusing to go further.
      const outOfReach = tickValue < reachMin || tickValue > reachMax;
      ticks.push(
        <View key={i} style={[styles.tick, { left: i * PX_PER_TICK }, outOfReach && styles.tickOut]}>
          <View style={[styles.tickMark, isMajor && styles.tickMarkMajor]} />
          {isMajor ? <Text style={styles.tickLabel}>{formatLabel(tickValue)}</Text> : null}
        </View>
      );
    }
  }

  return (
    <View style={style}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.readout, { color }]}>
          {Math.round(value).toLocaleString()}
          <Text style={styles.readoutUnit}> {unit}</Text>
        </Text>
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => nudge(-1)}
          disabled={value <= reachMin}
          style={[styles.stepBtn, value <= reachMin && styles.stepBtnOff]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 6 }}
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label} by ${fineStep} ${unit}`}
        >
          <Text style={[styles.stepBtnText, value <= reachMin && styles.stepBtnTextOff]}>{'\u2212'}</Text>
        </TouchableOpacity>

        <View
          style={styles.viewport}
          onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
          {...panResponder.panHandlers}
          accessibilityRole="adjustable"
          accessibilityLabel={label}
          accessibilityValue={{ min: reachMin, max: reachMax, now: Math.round(value) }}
        >
          <View style={[styles.tape, { transform: [{ translateX }] }]}>{ticks}</View>
          {/* The pointer. Fixed dead centre -- it is the one thing on this
              control that never moves. */}
          <View style={[styles.pointer, { backgroundColor: color }]} pointerEvents="none" />
        </View>

        <TouchableOpacity
          onPress={() => nudge(1)}
          disabled={value >= reachMax}
          style={[styles.stepBtn, value >= reachMax && styles.stepBtnOff]}
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label} by ${fineStep} ${unit}`}
        >
          <Text style={[styles.stepBtnText, value >= reachMax && styles.stepBtnTextOff]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  readout: { fontSize: 26, fontWeight: '800' },
  readoutUnit: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  // Deliberately the same 30pt circle MacroSlider puts either side of its
  // track, so the calories control and the three macro rows under it read
  // as one family of things rather than two.
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f1f5',
    borderWidth: 1,
    borderColor: '#e3e3e8',
  },
  stepBtnOff: { backgroundColor: '#f7f7fa', borderColor: '#eceef2' },
  stepBtnText: { fontSize: 18, fontWeight: '700', color: '#444', marginTop: -1 },
  stepBtnTextOff: { color: '#ccc' },
  viewport: {
    flex: 1,
    height: TAPE_HEIGHT,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  tape: { position: 'absolute', top: 0, bottom: 0, left: 0 },
  // Each tick is a zero-width column positioned at its own x, with the mark
  // and its label centred on that x by a half-width negative offset. That
  // way a long label ("1,000") stays centred on its tick instead of
  // pushing the tape's geometry around.
  tick: { position: 'absolute', top: 0, alignItems: 'center', width: 0 },
  tickOut: { opacity: 0.28 },
  tickMark: { width: 1.5, height: MINOR_H, marginTop: 10, backgroundColor: '#d3dae6', borderRadius: 1 },
  tickMarkMajor: { height: MAJOR_H, width: 2, backgroundColor: '#9fb0c9' },
  tickLabel: {
    position: 'absolute',
    top: MAJOR_H + 14,
    width: 70,
    textAlign: 'center',
    marginLeft: -35,
    left: 0,
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  pointer: {
    position: 'absolute',
    left: '50%',
    marginLeft: -1.5,
    top: 6,
    width: 3,
    height: MAJOR_H + 12,
    borderRadius: 2,
  },
});
