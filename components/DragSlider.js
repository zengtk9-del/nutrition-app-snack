import React, { useRef, useState, useEffect } from 'react';
import { View, Text, PanResponder, StyleSheet } from 'react-native';

// A vertical ruler control: numbers scroll up/down past a fixed pointer as
// you drag, and whichever number lines up with the pointer is the selected
// value — the pointer itself never moves, only the ruler does. Keeps the
// exact same props QuizScreen.js already passes in (value, minimumValue,
// maximumValue, step, onValueChange, minimumTrackTintColor), plus two new
// optional ones — onSlidingStart / onSlidingComplete — that QuizScreen.js
// uses to briefly disable the surrounding page's scrolling while a drag is
// in progress (see below).
//
// The math: the ruler is one long column of tick marks, PX_PER_TICK pixels
// apart. To keep the tick for the current value centered on the fixed
// pointer, the whole column is shifted up/down by a `translateY`. While
// dragging, the new position is worked out from how far the finger has
// moved since the drag started (`gestureState.dy`, which React Native
// already tracks relative to that starting point), not from the finger's
// absolute position — a relative delta doesn't care exactly where on the
// control a drag began, so it can't jump depending on where you first
// touch it.
//
// Smoothness: `value` (the prop) only ever holds whole numbers — years,
// cm, kg — since that's what the rest of the quiz wants. But following the
// finger with something that only moves in whole-unit jumps is exactly
// what made dragging feel like it was skipping frames: the ruler would
// sit still until the drag crossed an entire tick's worth of distance,
// then snap. `liveValue` below is a separate, un-rounded number that
// tracks the finger continuously (fractional values and all) purely for
// positioning the ruler on screen; `value` (rounded from it) is still what
// gets reported to onValueChange. The two only ever differ mid-drag.
//
// Layout: bigger numbers sit toward the top of the ruler and smaller ones
// toward the bottom, so dragging DOWN is what pulls higher numbers down
// into the pointer — that's what keeps the ruler moving in exact lockstep
// with your finger (drag down by 10px, the ruler visually moves down by
// exactly 10px), the same direct, tactile feel as before. If bigger-on-top
// ever needs to pair with "drag up = more" instead, that's not just a
// sign flip — it would make the ruler visually move opposite to the
// finger, so ask before changing it.
const PX_PER_TICK = 44;
const RULER_LENGTH = 360;
const LABEL_WIDTH = 78; // wide enough for labels like 6'11", not just plain numbers
// How far the compact dial's pill stands in from each side of the dial.
// Exported because the height page draws a line starting at the pill's
// right end, and has to know where that is without measuring it.
export const DIAL_COMPACT_INSET = 2;

export default function DragSlider({
  value,
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  onValueChange,
  onSlidingStart,
  onSlidingComplete,
  minimumTrackTintColor = '#4f8ef7',
  style,
  // Optional (rawTickValue) => string. Lets a tick's displayed text differ
  // from the plain number it's stored as — e.g. the height ruler stores
  // total inches internally, but formatLabel turns 69 into 5'9" for
  // display. Defaults to just showing the number as-is.
  formatLabel = (v) => `${v}`,
  // 'ruler' (default) is the original: right-aligned numbers with a tick
  // mark beside each and a thin line across the selected one. 'dial'
  // (v0.4.1) is the redesign: numbers centred, no tick marks, the
  // selected row inside a tinted pill with its unit beside it, and the
  // rows fading out toward the top and bottom.
  //
  // A variant rather than a restyle because weight still uses the ruler,
  // and changing it here would silently change it too.
  variant = 'ruler',
  // Dial only: the words beside the number in the pill ("years old").
  unitLabel,
  // --- v0.4.5, for the height page's dial. Every default below is what
  // the age dial and the rulers already had, so they are unchanged. ---
  //
  // Distance between two rows, in points. The drag uses it too (a finger
  // moving one row's distance moves the value one step), which is why it
  // is read through propsRef below like every other prop the drag needs.
  rowHeight = PX_PER_TICK,
  // How tall the visible window is.
  trackLength = RULER_LENGTH,
  // 'large' is the age dial. 'compact' is the height dial: smaller rows,
  // a slimmer fully-rounded pill with a white rim and a soft blue glow,
  // sized to sit in a narrow panel rather than across the whole screen.
  dialSize = 'large',
  // The thin lines either side of the number in the pill.
  dialRules = true,
  // A small up/down pair of arrowheads at the right end of the pill.
  dialChevrons = false,
  // A short dash between every two rows.
  dialTicks = false,
  // Optional: highlights one specific tick with a small label badge next
  // to it (e.g. "Current weight" pointing at 70) — independent of
  // whichever tick is currently selected/dragged. Lives on the ruler
  // itself, not fixed on screen, so it scrolls out of view along with
  // that number as you drag away from it, same as every other tick.
  markValue,
  markLabel,
  // Optional: same idea as markValue/markLabel, but for whichever tick is
  // currently selected/dragged instead of a fixed reference point (e.g.
  // "Target weight" following the ruler as you drag it) — styled in the
  // accent color instead of the neutral one, to read as "your choice"
  // rather than "for reference."
  valueLabel,
  // Optional, both default to minimumValue/maximumValue: lets the
  // draggable/selectable range be narrower than the displayed tick range.
  // E.g. the target-weight ruler shows your current weight as the bottom
  // tick for reference (minimumValue), but you can't actually drag down
  // to it — a "gain" target has to be at least one unit above it — so
  // valueMin is set one tick higher than minimumValue. The extra tick(s)
  // between minimumValue/maximumValue and valueMin/valueMax still render
  // and still scroll normally; the drag position (and therefore the
  // reported value) just can't ever rest on them.
  valueMin,
  valueMax,
}) {
  // Starts at the window's own fixed height rather than 0. The wrapper's
  // height is set right here and nothing can stretch it, so the measured
  // value can only ever equal this -- starting from 0 just meant the very
  // first frame put the selected row at the top edge instead of centred,
  // until onLayout caught up.
  const [trackHeight, setTrackHeight] = useState(trackLength);
  const [liveValue, setLiveValue] = useState(value);
  const isDraggingRef = useRef(false);
  // The value the drag started from — every move is measured as an offset
  // from this, not recomputed from scratch each event.
  const dragStartValueRef = useRef(value);
  // The most recent raw (un-rounded) position reached during the current
  // drag, so releasing can snap the ruler to exactly where it left off
  // rather than jumping back to wherever the drag started.
  const lastRawValueRef = useRef(value);

  // QuizScreen reuses this same component instance when you flip a unit
  // toggle (ft+in <-> cm, kg <-> lb) rather than swapping in a fresh one —
  // both branches render the same shape of element tree, so React just
  // updates it in place. That's normally invisible, but PanResponder.create
  // below only runs ONCE (useRef only evaluates its argument on first
  // mount), so any prop it closes over directly would stay frozen at
  // whatever it was the very first time this ruler appeared — e.g. it
  // would keep clamping to the ft+in range forever, even after switching
  // to cm, pushing the ruler's position calculation far off-screen the
  // next time you dragged. Routing through this ref (refreshed on every
  // render) instead of closing over the props directly means the frozen
  // PanResponder callbacks below always read the current values.
  const propsRef = useRef();
  propsRef.current = {
    value,
    minimumValue,
    maximumValue,
    // Falling back to minimumValue/maximumValue here (rather than in the
    // function signature above) means callers that never pass valueMin/
    // valueMax at all get exactly the old behavior — the full displayed
    // range is also the full selectable range.
    valueMin: valueMin ?? minimumValue,
    valueMax: valueMax ?? maximumValue,
    step,
    rowHeight,
    onValueChange,
    onSlidingStart,
    onSlidingComplete,
  };

  const clamp = (raw) => {
    const { valueMin: min, valueMax: max } = propsRef.current;
    return Math.max(min, Math.min(max, raw));
  };
  const clampToStep = (raw) => {
    const { step: s } = propsRef.current;
    return clamp(Math.round(raw / s) * s);
  };

  // If `value` changes for any reason other than us dragging it (e.g. the
  // quiz question was just mounted, or something external reset it), keep
  // the ruler's on-screen position in sync with it.
  useEffect(() => {
    if (!isDraggingRef.current) {
      setLiveValue(value);
    }
  }, [value]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      // QuizScreen wraps every question in a ScrollView, and this ruler
      // drags on the same (vertical) axis the ScrollView scrolls on. By
      // default, once a real drag starts moving, the ScrollView asks to
      // take the gesture away from us mid-drag to scroll the page instead
      // — which is what made the ruler "freeze" partway through a drag.
      // These two lines say no to that hand-off, so once a touch on the
      // ruler has started, the ruler keeps it for the whole gesture.
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
      onPanResponderMove: (evt, gestureState) => {
        // A quick tap still wobbles the finger by a few pixels even when
        // no drag is intended — ignoring movement under this threshold
        // stops those wobbles from nudging the value on a plain tap.
        if (Math.abs(gestureState.dy) < 4) {
          return;
        }
        const { step: s, rowHeight: px, onValueChange: onChange } = propsRef.current;
        const rawValue = dragStartValueRef.current + (gestureState.dy / px) * s;
        lastRawValueRef.current = rawValue;
        setLiveValue(clamp(rawValue));
        if (onChange) onChange(clampToStep(rawValue));
      },
      onPanResponderRelease: () => {
        isDraggingRef.current = false;
        // Settle the ruler exactly onto the nearest tick — the raw drag
        // position is almost never precisely on one, so this is what gives
        // it a clean "snap into place" feel instead of stopping wherever
        // the finger happened to lift.
        setLiveValue(clampToStep(lastRawValueRef.current));
        if (propsRef.current.onSlidingComplete) propsRef.current.onSlidingComplete();
      },
      onPanResponderTerminate: () => {
        isDraggingRef.current = false;
        setLiveValue(clampToStep(lastRawValueRef.current));
        if (propsRef.current.onSlidingComplete) propsRef.current.onSlidingComplete();
      },
    })
  ).current;

  const tickCount = Math.round((maximumValue - minimumValue) / step) + 1;
  const columnHeight = (tickCount - 1) * rowHeight;
  // Index 0 is the maximum value (top of the column) and index increases
  // going down — the mirror image of a plain ascending list — so bigger
  // numbers land near the top of the ruler.
  const currentTickY = ((maximumValue - liveValue) / step) * rowHeight;
  const translateY = trackHeight / 2 - currentTickY;
  const nearestValue = clampToStep(liveValue);
  // Which tick markValue lands on/nearest to — same "round to the nearest
  // real tick, then clamp into range" logic as clampToStep, but computed
  // straight from the props rather than propsRef, since a mark isn't part
  // of the drag interaction at all.
  const nearestMarkTick =
    markValue == null
      ? null
      : Math.max(minimumValue, Math.min(maximumValue, Math.round(markValue / step) * step));

  const isDial = variant === 'dial';
  const compact = isDial && dialSize === 'compact';
  // Dial: rows dim with distance from the selection, so the column reads
  // as a wheel with depth rather than a flat list.
  const fade = (distance) => (distance === 0 ? 0 : distance <= 3 ? 1 : distance === 4 ? 0.5 : 0.22);

  const ticks = [];
  for (let i = 0; i < tickCount; i++) {
    const tickValue = maximumValue - i * step;
    const isMajor = tickValue % 5 === 0;
    const isCurrent = tickValue === nearestValue;
    const isMark = nearestMarkTick != null && tickValue === nearestMarkTick;
    const showMark = isMark && markLabel;
    const showValueLabel = isCurrent && valueLabel;

    // markValue and the live selected tick can land on the same tick (e.g.
    // dragging the target back to exactly your current weight) — rather
    // than stacking two badges that would crowd or clip off the edge of
    // the ruler, that case gets one combined badge instead.
    let badgeText = null;
    let accented = false;
    if (showMark && showValueLabel) {
      badgeText = `${markLabel} / ${valueLabel}`;
      accented = true;
    } else if (showValueLabel) {
      badgeText = valueLabel;
      accented = true;
    } else if (showMark) {
      badgeText = markLabel;
    }

    // The selected row's own label is hidden entirely -- the pill below
    // draws it, and two copies of "25" stacked would fringe against each
    // other.
    const distance = Math.abs(tickValue - nearestValue) / step;
    const dialOpacity = fade(distance);
    // The dash under this row sits halfway to the next one down, and
    // fades as far as the fainter of the two rows it separates.
    const showDash = isDial && dialTicks && i < tickCount - 1;
    const dashOpacity = showDash ? fade(Math.max(distance, Math.abs(tickValue - step - nearestValue) / step)) : 0;

    ticks.push(
      <View key={tickValue} style={[styles.tick, { top: i * rowHeight - rowHeight / 2, height: rowHeight }]}>
        <Text
          style={[
            styles.tickLabel,
            isDial && styles.tickLabelDial,
            compact && styles.tickLabelCompact,
            isDial && { opacity: dialOpacity },
            !isDial && isCurrent && { color: minimumTrackTintColor, fontWeight: '700' },
          ]}
        >
          {formatLabel(tickValue)}
        </Text>
        {/* Not rendered at all on the dial rather than hidden: at 111
            ticks an invisible view per row is a hundred nodes doing
            nothing, and a zero-width view still reports its background
            colour to anything inspecting the tree. */}
        {isDial ? null : (
          <View
            style={[
              styles.tickMark,
              isMajor && styles.tickMarkMajor,
              isCurrent && { backgroundColor: minimumTrackTintColor, height: 4 },
            ]}
          />
        )}
        {showDash ? <View style={[styles.dialDash, { opacity: dashOpacity }]} /> : null}
        {badgeText && (
          <View
            style={[
              styles.markBadge,
              accented && { backgroundColor: '#eaf1ff', borderColor: minimumTrackTintColor },
            ]}
          >
            <Text style={[styles.markBadgeText, accented && { color: minimumTrackTintColor }]}>
              {badgeText}
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    // Outer view just carries whatever spacing/width the caller passed in
    // (e.g. QuizScreen.js's marginBottom) — the ruler's own size below is
    // fixed on purpose, so a caller's style can't accidentally squash it
    // back down to something too short to drag comfortably.
    <View style={style}>
      <View
        style={[styles.wrapper, isDial && styles.wrapperDial, { height: trackLength }]}
        onLayout={(e) => setTrackHeight(e.nativeEvent.layout.height)}
        {...panResponder.panHandlers}
      >
        <View style={styles.viewport}>
          <View
            style={[styles.column, { height: columnHeight + rowHeight, transform: [{ translateY }] }]}
          >
            {ticks}
          </View>
        </View>
        {/* The compact pill's soft blue halo. A separate layer rather than
            a shadow: Android draws elevation shadows grey whatever colour
            is asked for, and this is meant to read as light, not depth. */}
        {compact ? <View style={styles.dialGlow} pointerEvents="none" /> : null}
        {isDial ? (
          // The pill IS the pointer: fixed at the centre while the column
          // slides behind it. pointerEvents none so it never eats a drag
          // that starts on top of the number.
          <View style={[styles.dialPointer, compact && styles.dialPointerCompact]} pointerEvents="none">
            {dialRules ? <View style={styles.dialRule} /> : null}
            <Text
              style={[styles.dialValue, compact && styles.dialValueCompact]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {formatLabel(nearestValue)}
            </Text>
            {unitLabel ? <Text style={[styles.dialUnit, compact && styles.dialUnitCompact]}>{unitLabel}</Text> : null}
            {dialRules ? <View style={styles.dialRule} /> : null}
            {/* Two arrowheads drawn from borders, the same way the rest of
                the app draws its small triangles -- no icon font to load
                and no glyph metrics to fight when centring them. */}
            {dialChevrons ? (
              <View style={styles.dialChevrons}>
                <View style={styles.dialChevronUp} />
                <View style={styles.dialChevronDown} />
              </View>
            ) : null}
          </View>
        ) : (
          <View style={[styles.pointer, { backgroundColor: minimumTrackTintColor }]} pointerEvents="none" />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { height: RULER_LENGTH, width: 240, alignSelf: 'center' },
  viewport: { flex: 1, overflow: 'hidden' },
  column: { width: '100%', position: 'relative' },
  tick: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: PX_PER_TICK,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tickLabel: { width: LABEL_WIDTH, fontSize: 24, color: '#999', textAlign: 'right', marginRight: 14 },
  tickMark: { flex: 1, height: 2, backgroundColor: '#ccc' },
  tickMarkMajor: { height: 3, backgroundColor: '#999' },
  markBadge: {
    maxWidth: 165,
    backgroundColor: '#eef0f4',
    borderWidth: 1,
    borderColor: '#d5d9e0',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 6,
  },
  markBadgeText: { fontSize: 13, fontWeight: '700', color: '#555' },
  pointer: {
    position: 'absolute',
    top: '50%',
    marginTop: -1.5,
    left: 0,
    right: 0,
    height: 3,
  },

  // --- the 'dial' variant (v0.4.1) -------------------------------------
  wrapperDial: { width: '100%' },
  // Centred, and wide enough that a three-digit age or a 6'11" label has
  // room without the column shifting sideways as the value changes.
  tickLabelDial: {
    width: '100%',
    marginRight: 0,
    textAlign: 'center',
    fontSize: 27,
    fontWeight: '600',
    color: '#8a97ae',
  },
  dialPointer: {
    position: 'absolute',
    top: '50%',
    marginTop: -31,
    left: 0,
    right: 0,
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#d8e8fb',
  },
  // The thin lines either side of the number. They take the leftover
  // width, so the number and its unit stay centred whatever their length.
  dialRule: { flex: 1, height: 2, borderRadius: 1, backgroundColor: '#2f80f0', opacity: 0.45 },
  dialValue: { fontSize: 38, fontWeight: '900', color: '#16213f', letterSpacing: -0.5 },
  dialUnit: { fontSize: 17, fontWeight: '800', color: '#2f80f0' },

  // --- dialSize 'compact' and its extras (v0.4.5) ----------------------
  tickLabelCompact: { fontSize: 20, fontWeight: '500', color: '#7a87a3' },
  // Nearly the full width of the column, fully rounded, with a white rim.
  // The symmetric padding keeps the number centred on the rows above and
  // below it while leaving the right end free for the arrowheads.
  dialPointerCompact: {
    marginTop: -21,
    height: 42,
    left: DIAL_COMPACT_INSET,
    right: DIAL_COMPACT_INSET,
    gap: 6,
    paddingHorizontal: 30,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    backgroundColor: '#d9e9fc',
    shadowColor: '#2f80f0',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  dialGlow: {
    position: 'absolute',
    top: '50%',
    marginTop: -26,
    left: -3,
    right: -3,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(47,128,240,0.09)',
  },
  // flexShrink lets a narrow phone squeeze "213 cm" into the pill, where
  // adjustsFontSizeToFit then scales it down instead of letting it run
  // under the arrowheads.
  dialValueCompact: { fontSize: 30, letterSpacing: -0.3, flexShrink: 1 },
  dialUnitCompact: { fontSize: 15 },
  dialChevrons: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  dialChevronUp: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderLeftWidth: 5.5,
    borderRightWidth: 5.5,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#2f80f0',
  },
  dialChevronDown: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderLeftWidth: 5.5,
    borderRightWidth: 5.5,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#2f80f0',
  },
  // Sits on the bottom edge of its row's box -- exactly halfway to the
  // next row -- and is centred under the number.
  dialDash: {
    position: 'absolute',
    bottom: -1,
    left: '50%',
    marginLeft: -5.5,
    width: 11,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#a9c4ec',
  },
});
