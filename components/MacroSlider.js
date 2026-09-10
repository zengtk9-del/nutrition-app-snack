import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, PanResponder, StyleSheet } from 'react-native';

// A compact HORIZONTAL drag slider — label + current value + (optionally) a
// lock toggle above a draggable track, with +/- stepper buttons flanking
// the track for precise one-step adjustments. Used by MacroGoalsScreen for
// its four macro rows (Calories, Protein, Carbs, Fat) stacked in the bottom
// half of the screen, where DragSlider.js's big vertical ruler (built for
// one full-screen quiz question at a time) would be both the wrong shape
// and far too tall to fit four of them on one screen at once. Same
// PanResponder-based, no-native-dependency approach as DragSlider.js and
// the rest of this app (this project already got burned once by
// @react-native-community/slider breaking under Expo Go's bridgeless mode)
// — just horizontal instead of vertical, and tracking a plain filled-bar +
// round thumb instead of a scrolling ruler, since there's no need for tick
// labels at this size.
//
// Math: same "relative delta from where the drag started" approach as
// DragSlider (dx since the touch began, not the touch's absolute screen
// position) — that's what makes it not matter where along the thumb you
// first touch it. `liveValue` (continuous, unrounded) drives the thumb's
// on-screen position every frame for a smooth drag feel; `value` (rounded
// to `step`) is what's actually reported to onValueChange and to the rest
// of the app.
//
// `minimumValue`/`maximumValue` are read fresh on every render (via
// propsRef, refreshed below) rather than only once — MacroGoalsScreen
// passes each macro's live maxGramsForMacro() result here, which changes
// as the *other* sliders move, not just this one. PanResponder.create only
// runs once (useRef), so routing through a ref that's reassigned every
// render is what keeps a mid-drag callback from reading a stale range from
// the very first render.
//
// Guide-mode visuals (`dimmed`/`highlighted`/`emphasizeLock`): these are
// plain presentational props driven by MacroGoalsScreen's walkthrough
// state — this component doesn't know anything about "step 1 of 3", it
// just dims or highlights whatever it's told to. Dimming is applied
// directly to the label/value Text and to the track+buttons row, NOT to
// one wrapping container, because RN opacity multiplies down through
// children — if `wrap` itself were dimmed, the lock icon (which needs to
// stay at full opacity when it's the thing being pointed at, e.g. guide
// step 3) would have no way to "undim" itself out from under an ancestor's
// opacity. `wrap` and `lockBtn` each reserve a permanent 2px transparent
// border (and matching padding) at all times, only ever swapping the
// border's COLOR between transparent and accent blue — that's what keeps
// turning a highlight on/off from nudging any surrounding layout.
//
// `animateChanges`: see the long comment on the value-sync effect below —
// short version, it swaps an instant snap-to-new-value for a brief local
// slide, and only MacroGoalsScreen's Carbs/Fat sliders during its guided
// walkthrough ever turn it on.
const THUMB_SIZE = 26;
const TRACK_HEIGHT = 8;
const HIGHLIGHT_COLOR = '#4f8ef7';
const HIGHLIGHT_BG = '#eaf2ff';

export default function MacroSlider({
  label,
  value,
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  onValueChange,
  onSlidingStart,
  onSlidingComplete,
  color = '#4f8ef7',
  unit = 'g',
  disabled = false,
  formatValue = (v) => `${Math.round(v).toLocaleString()}`,
  // The range you can REACH, when it is narrower than the range the track
  // DRAWS. Defaults to maximumValue, so MacroGoalsScreen -- which wants
  // the two to be the same thing -- is untouched by this existing.
  //
  // v0.1.2, from the custom food form. Its macro maxima are computed with
  // maxGramsForMacro, which shrinks the moment another macro is locked
  // (there is less left to take calories from). Feeding that straight into
  // maximumValue meant locking protein rescaled the other two tracks
  // underneath thumbs that had not moved: carbs at 47g slid from 23% to
  // 50% of its bar while still reading 47g. A track whose meaning changes
  // when you touch a different control is not a track. So the scale is
  // fixed by the food and only the WALL moves.
  valueMax,
  lockable = false,
  locked = false,
  onToggleLock,
  dimmed = false,
  highlighted = false,
  emphasizeLock = false,
  animateChanges = false,
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const [liveValue, setLiveValue] = useState(value);
  const isDraggingRef = useRef(false);
  const dragStartValueRef = useRef(value);
  const lastRawValueRef = useRef(value);
  const liveValueRef = useRef(value);
  useEffect(() => {
    liveValueRef.current = liveValue;
  }, [liveValue]);

  const propsRef = useRef();
  propsRef.current = {
    value,
    minimumValue,
    maximumValue,
    valueMax: valueMax ?? maximumValue,
    step,
    onValueChange,
    onSlidingStart,
    onSlidingComplete,
    trackWidth,
    disabled,
  };

  // Clamping answers "how far can this go"; positioning answers "where on
  // the bar does this sit". Two different questions since v0.1.2.
  const clamp = (raw) => {
    const { minimumValue: min, valueMax: max } = propsRef.current;
    return Math.max(min, Math.min(max, raw));
  };
  const clampToStep = (raw) => {
    const { step: s } = propsRef.current;
    return clamp(Math.round(raw / s) * s);
  };

  // Keep the thumb in sync with external changes to `value` (e.g. this
  // exact macro just got redistributed because a *different* slider was
  // dragged) as long as this slider isn't the one currently being touched.
  //
  // Two ways to catch up, chosen by `animateChanges`: normal drags — this
  // slider's own, or a sibling's, at any point outside the guided
  // walkthrough — fire onValueChange many times a second, and each one
  // reassigns `value` here, so catching up needs to be instant (the
  // default, unchanged from before) or the thumb would visibly lag behind
  // a live touch. MacroGoalsScreen only sets `animateChanges` on the
  // Carbs/Fat sliders, and only while its guide is running — the one
  // place `value` changes in a single deliberate jump (the guide's
  // "reveal" moment) rather than continuously, so a short local slide
  // over a fixed step count reads as a smooth transition instead of
  // fighting a live drag it was never meant to compete with.
  useEffect(() => {
    if (isDraggingRef.current) return;
    if (!animateChanges) {
      setLiveValue(value);
      return;
    }
    const fromValue = liveValueRef.current;
    if (fromValue === value) return;
    const steps = 14;
    let step = 0;
    const id = setInterval(() => {
      step += 1;
      const t = Math.min(1, step / steps);
      setLiveValue(fromValue + (value - fromValue) * t);
      if (t >= 1) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, animateChanges]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !propsRef.current.disabled,
      onMoveShouldSetPanResponder: () => !propsRef.current.disabled,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: () => {
        if (propsRef.current.disabled) return;
        const { value: v, onSlidingStart: onStart } = propsRef.current;
        isDraggingRef.current = true;
        dragStartValueRef.current = v;
        lastRawValueRef.current = v;
        setLiveValue(v);
        if (onStart) onStart();
      },
      onPanResponderMove: (evt, gestureState) => {
        if (propsRef.current.disabled) return;
        if (Math.abs(gestureState.dx) < 2) return;
        const { minimumValue: min, maximumValue: max, trackWidth: w, step: s, onValueChange: onChange } =
          propsRef.current;
        const usableWidth = Math.max(1, w - THUMB_SIZE);
        const pxPerUnit = usableWidth / Math.max(1, max - min);
        const rawValue = dragStartValueRef.current + gestureState.dx / pxPerUnit;
        lastRawValueRef.current = rawValue;
        setLiveValue(clamp(rawValue));
        if (onChange) onChange(clampToStep(rawValue));
      },
      onPanResponderRelease: () => {
        if (propsRef.current.disabled) {
          isDraggingRef.current = false;
          return;
        }
        isDraggingRef.current = false;
        setLiveValue(clampToStep(lastRawValueRef.current));
        if (propsRef.current.onSlidingComplete) propsRef.current.onSlidingComplete();
      },
      onPanResponderTerminate: () => {
        if (propsRef.current.disabled) {
          isDraggingRef.current = false;
          return;
        }
        isDraggingRef.current = false;
        setLiveValue(clampToStep(lastRawValueRef.current));
        if (propsRef.current.onSlidingComplete) propsRef.current.onSlidingComplete();
      },
    })
  ).current;

  // Stepper buttons reuse the exact same onSlidingStart → onValueChange →
  // onSlidingComplete lifecycle a real drag already triggers — that's the
  // whole reason MacroGoalsScreen's baseline-snapshot/redistribution logic
  // needs zero special-casing to also work correctly from a tap instead of
  // a drag: from its point of view a tap just looks like a very short, one-
  // step drag.
  const handleStep = (direction) => {
    const {
      value: v,
      step: s,
      minimumValue: min,
      maximumValue: max,
      disabled: isDisabled,
      onSlidingStart: onStart,
      onValueChange: onChange,
      onSlidingComplete: onComplete,
    } = propsRef.current;
    if (isDisabled) return;
    const next = Math.max(min, Math.min(propsRef.current.valueMax, v + direction * s));
    if (next === v) return;
    if (onStart) onStart();
    setLiveValue(next);
    if (onChange) onChange(next);
    if (onComplete) onComplete();
  };

  const min = minimumValue;
  const max = Math.max(minimumValue, maximumValue);
  const reach = Math.max(min, Math.min(max, valueMax ?? maximumValue));
  const clampedLive = Math.max(min, Math.min(max, liveValue));
  const pct = max > min ? (clampedLive - min) / (max - min) : 0;
  const usableWidth = Math.max(0, trackWidth - THUMB_SIZE);
  const thumbLeft = usableWidth * pct;
  const fillWidth = thumbLeft + THUMB_SIZE / 2;
  // Where the wall is, when there is one. Drawn as a darker stretch of
  // track from there to the end, so a slider that stops early says why
  // instead of just feeling broken.
  const reachPct = max > min ? (reach - min) / (max - min) : 1;
  const blockedLeft = usableWidth * reachPct + THUMB_SIZE / 2;
  const hasWall = reach < max - 0.5;

  // The bar's fill color used to go grey any time `disabled` was true —
  // which included every non-drag guide moment (e.g. Carbs/Fat while their
  // "reveal" animation plays, when dragging is correctly turned off but
  // the two sliders are very much the thing the guide is pointing at).
  // That made a highlighted-but-temporarily-not-draggable slider look
  // exactly like a genuinely dimmed one. `highlighted` is what actually
  // answers "is this the guide's current target" — a slider the guide has
  // deliberately highlighted should always show its real color, even in
  // the moments it's not draggable, while an ordinary locked macro
  // (disabled, not highlighted, guide inactive or pointed elsewhere) keeps
  // the old grey treatment exactly as before.
  const trackColor = disabled && !highlighted ? '#d5d9e0' : color;
  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && value < reach;

  return (
    <View style={[styles.wrap, highlighted && styles.wrapHighlighted]}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, dimmed && styles.dimmedText]}>{label}</Text>
        <View style={styles.headerRight}>
          <Text style={[styles.valueText, disabled && styles.valueTextLocked, dimmed && styles.dimmedText]}>
            {formatValue(value)} {unit}
          </Text>
          {lockable && (
            <TouchableOpacity
              onPress={onToggleLock}
              style={[
                styles.lockBtn,
                emphasizeLock && styles.lockBtnEmphasized,
                dimmed && !emphasizeLock && styles.dimmedText,
              ]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={locked ? `Unlock ${label}` : `Lock ${label} so it stays fixed`}
              accessibilityState={{ selected: locked }}
            >
              <Text style={styles.lockIcon}>{locked ? '\u{1F512}' : '\u{1F513}'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={[styles.trackRow, dimmed && styles.dimmedText]}>
        <TouchableOpacity
          onPress={() => handleStep(-1)}
          disabled={!canDecrease}
          style={[styles.stepBtn, !canDecrease && styles.stepBtnDisabled]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label} by ${step} ${unit}`}
        >
          <Text style={[styles.stepBtnText, !canDecrease && styles.stepBtnTextDisabled]}>{'−'}</Text>
        </TouchableOpacity>
        <View
          style={styles.track}
          onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
          {...(disabled ? {} : panResponder.panHandlers)}
        >
          <View style={styles.trackBg} />
          {hasWall ? <View style={[styles.trackBlocked, { left: blockedLeft }]} /> : null}
          <View style={[styles.trackFill, { width: fillWidth, backgroundColor: trackColor }]} />
          <View style={[styles.thumb, { left: thumbLeft, borderColor: trackColor }]} />
        </View>
        <TouchableOpacity
          onPress={() => handleStep(1)}
          disabled={!canIncrease}
          style={[styles.stepBtn, !canIncrease && styles.stepBtnDisabled]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label} by ${step} ${unit}`}
        >
          <Text style={[styles.stepBtnText, !canIncrease && styles.stepBtnTextDisabled]}>{'+'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // A permanent, always-present 2px transparent border + matching padding
  // is what lets `highlighted` swap the border to accent blue (plus a
  // light blue background tint) without the row's content shifting by a
  // couple of pixels the moment a guide step turns the highlight on or off
  // — only the COLOR changes, never whether the border/padding exist.
  wrap: {
    marginBottom: 22,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 12,
    padding: 8,
  },
  wrapHighlighted: {
    borderColor: HIGHLIGHT_COLOR,
    backgroundColor: HIGHLIGHT_BG,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  label: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  valueText: { fontSize: 15, fontWeight: '600', color: '#555' },
  valueTextLocked: { color: '#999' },
  // Dimming applied directly on the label/value/track-row elements
  // themselves (never on a shared ancestor) so a sibling — the lock icon —
  // can stay at full opacity in the same row when it's the guide's current
  // highlight target, which a wrapping-container opacity could never allow
  // (RN opacity compounds down through every descendant).
  dimmedText: { opacity: 0.35 },
  lockBtn: {
    marginLeft: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  lockBtnEmphasized: {
    borderColor: HIGHLIGHT_COLOR,
    backgroundColor: HIGHLIGHT_BG,
  },
  lockIcon: { fontSize: 17 },
  trackRow: { flexDirection: 'row', alignItems: 'center' },
  track: {
    flex: 1,
    height: THUMB_SIZE,
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  trackBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: '#e3e3e8',
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
  },
  // The stretch this macro cannot be dragged into, given what the others
  // have left to give.
  trackBlocked: {
    position: 'absolute',
    right: 0,
    height: TRACK_HEIGHT,
    borderTopRightRadius: TRACK_HEIGHT / 2,
    borderBottomRightRadius: TRACK_HEIGHT / 2,
    backgroundColor: '#c6ccd8',
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#fff',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
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
  stepBtnDisabled: { backgroundColor: '#f7f7fa', borderColor: '#eceef2' },
  stepBtnText: { fontSize: 18, fontWeight: '700', color: '#444', marginTop: -1 },
  stepBtnTextDisabled: { color: '#ccc' },
});
