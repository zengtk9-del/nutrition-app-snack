import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider, { DIAL_COMPACT_HEIGHT, DIAL_COMPACT_INSET } from '../components/DragSlider';
import DietDetailModal from '../components/DietDetailModal';
import Mascot from '../components/Mascot';
import {
  CORNER_GEOMETRY,
  HEIGHT_GEOMETRY,
  MASCOT_PEEK,
  MASCOT_POSES,
  MASCOT_SCENES,
  MASCOT_WAVE_BIG,
  PEEK_GEOMETRY,
  WEIGHT_GEOMETRY,
} from '../data/brandArt';
import { COLORS, RADIUS, SPACE } from '../utils/theme';
import {
  QUIZ_STEPS,
  BODY_FAT_OPTIONS,
  BODY_FAT_IMAGES,
  ACTIVITY_IMAGES,
  TRAINING_IMAGES,
  DIET_IMAGES,
  DIET_DETAILS,
} from '../data/quizQuestions';
import {
  weightHistoryThresholds,
  formatWeightForUnit,
  formatWeightRangeForUnit,
  defaultWeightForHeight,
  feetInchesToCm,
  lbToKg,
  kgToLb,
} from '../utils/goals';

// Passed into any step's getOptions/getSubtitle function (see
// data/quizQuestions.js) so question text can be computed from earlier
// answers without QuizScreen needing to know the details of that math.
const QUESTION_HELPERS = { weightHistoryThresholds, formatWeightForUnit, formatWeightRangeForUnit };

// How wide the corner mascot is drawn on the body-fat page, of which the
// page shows all but the 6pt that hang past the screen (see soloMascot).
const CORNER_MASCOT_W = 110;

const HEIGHT_CM_RANGE = { min: 119, max: 213 };
const HEIGHT_IN_RANGE = { min: 47, max: 84 }; // ~3'11" to 7'0"
const WEIGHT_KG_RANGE = { min: 30, max: 250 };
const WEIGHT_LB_RANGE = { min: 66, max: 550 };

// The weightHistory step's vertical scale (see renderStepBody's
// 'weightScale' branch and its styles further down) uses fixed pixel zone
// heights rather than measuring anything at runtime — simplest way to
// guarantee the three colored segments, their two tick marks, and the
// "both" bracket (see SCALE_TOP_ZONE_CENTER/SCALE_BOTTOM_ZONE_CENTER
// below) all line up exactly, regardless of phone width.
// SCALE_ZONE_TOP/MID/BOTTOM must add up to SCALE_HEIGHT. Sized generously
// (rather than just enough to fit the content) so the step fills most of
// the screen instead of leaving a large empty gap above the Back/Next
// buttons, per Damon's feedback.
const SCALE_HEIGHT = 480;
const SCALE_ZONE_TOP = 136;
const SCALE_ZONE_MID = 208;
const SCALE_ZONE_BOTTOM = SCALE_HEIGHT - SCALE_ZONE_TOP - SCALE_ZONE_MID;
// The vertical midpoints of the top and bottom (red, "outside the healthy
// range") zones — both the short stubs on the Over/Under bubbles and the
// "both" bracket's two ends aim at these same points, so everything that
// points at "the red part of the scale" agrees on exactly where that is.
const SCALE_TOP_ZONE_CENTER = SCALE_ZONE_TOP / 2;
const SCALE_BOTTOM_ZONE_CENTER = SCALE_HEIGHT - SCALE_ZONE_BOTTOM / 2;

function inchesToFeetAndInches(totalInches) {
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

// Every-N minor tick marks along the weightHistory scale (see the
// 'weightScale' branch in renderStepBody and SCALE_HEIGHT/SCALE_ZONE_* at
// the top of this file), spaced using the same px-per-unit implied by the
// real gap between this person's own two thresholds (`upperValue` -
// `lowerValue`) — so the whole line reads as one continuously-scaled
// ruler, with the same distance-per-kg (or per-lb) through the red zones
// as through the green one, rather than three zones with unrelated tick
// density. Stops once a tick would land inside the small margin reserved
// for the arrowhead at either end (see `arrowMargin`). Pulled out as a
// plain function (no JSX) so it's easy to unit-test on its own.
function buildMinorTicks({ upperValue, lowerValue, step, zoneTop, zoneMid, scaleHeight }) {
  const pxPerUnit = zoneMid / (upperValue - lowerValue);
  const stepPx = step * pxPerUnit;
  const ticks = [];
  // Guards against a degenerate/zero (or inverted) threshold gap — should
  // never happen with real height-derived thresholds, but a broken input
  // here should just mean "no minor ticks," not a runaway or infinite loop.
  if (!Number.isFinite(stepPx) || stepPx <= 0) {
    return ticks;
  }

  const yUpper = zoneTop;
  const yLower = zoneTop + zoneMid;
  const arrowMargin = 14;

  // Above the upper threshold, into the top (over-range) zone.
  for (let y = yUpper - stepPx, value = upperValue + step; y > arrowMargin; y -= stepPx, value += step) {
    ticks.push({ top: y, value });
  }
  // Below the lower threshold, into the bottom (under-range) zone.
  for (let y = yLower + stepPx, value = lowerValue - step; y < scaleHeight - arrowMargin; y += stepPx, value -= step) {
    ticks.push({ top: y, value });
  }
  // Between the two thresholds, in the healthy-range zone. y increases
  // going down the screen, and this zone runs from yUpper down to yLower,
  // so — unlike the two loops above — this one walks y with +=.
  for (let y = yUpper + stepPx, value = upperValue - step; y < yLower - 1; y += stepPx, value -= step) {
    ticks.push({ top: y, value });
  }

  return ticks;
}

// The target-weight ("goalWeight") ruler only makes sense in the direction
// of the chosen goal — if you're trying to gain weight, a target below what
// you weigh right now isn't a real option, and vice versa for losing. So
// instead of showing the full weight range like the regular "weight" step
// does, this shows only your current weight and the correct direction past
// it (`displayMin`/`displayMax`, fed to DragSlider's minimumValue/
// maximumValue) — but the current-weight tick itself is shown only for
// reference, via the "Current weight" marker (see markValue/markLabel
// below); it can't actually be dragged to, since "gain to the same weight"
// isn't a real target. `selectMin`/`selectMax` (fed to DragSlider's new
// valueMin/valueMax) are one unit narrower on that side to enforce that.
// (goalWeight is never shown at all when the goal is "maintain" — see its
// `condition` in data/quizQuestions.js — so that case is left as the full
// range here just as a harmless fallback, not because it's ever actually
// used.)
function goalWeightRange(answers) {
  const isLb = answers.weightUnit === 'lb';
  const fullRange = isLb ? WEIGHT_LB_RANGE : WEIGHT_KG_RANGE;
  const currentWeightDisplay = isLb
    ? answers.weightLb ?? Math.round(kgToLb(answers.weightKg))
    : Math.round(answers.weightKg);

  if (answers.goal === 'gain') {
    return {
      displayMin: currentWeightDisplay,
      displayMax: fullRange.max,
      selectMin: Math.min(fullRange.max, currentWeightDisplay + 1),
      selectMax: fullRange.max,
      currentWeightDisplay,
    };
  }
  if (answers.goal === 'lose') {
    return {
      displayMin: fullRange.min,
      displayMax: currentWeightDisplay,
      selectMin: fullRange.min,
      selectMax: Math.max(fullRange.min, currentWeightDisplay - 1),
      currentWeightDisplay,
    };
  }
  return {
    displayMin: fullRange.min,
    displayMax: fullRange.max,
    selectMin: fullRange.min,
    selectMax: fullRange.max,
    currentWeightDisplay,
  };
}

// --- The tall answer card on the sex question (v0.4.3) -----------------
//
// Damon's brief for the selection: the card "enlarges, gets highlighted,
// and is slightly raised", as a typical UI animation that "pretty much
// finishes in the same moment the user clicks it".
//
// SELECT_MS is that moment. 140ms sits inside the 100-150ms range the
// platform guidelines give for a small component changing state -- long
// enough to read as motion rather than a jump cut, short enough that the
// card has settled before a thumb has finished lifting.
//
// EVERYTHING ANIMATES THROUGH transform AND opacity, which is what lets
// the whole thing run on the native driver. That matters more than the
// curve: a native-driven animation keeps running at frame rate even if
// the JS thread is busy (say, the next step's images decoding), where a
// JS-driven one would stutter exactly when the user is watching it. So:
//   raise    translateY   0 -> -LIFT
//   enlarge  scale        1 -> GROW
//   border   a pre-drawn blue outline, fading in   (not an animated
//   glow     a pre-drawn blue halo, fading in       borderColor -- colour
//   tint     a pre-drawn wash on the inner card     cannot be native-driven)
//   check    the filled tick fading and popping in over the empty ring
//
// GROW is 3.5%: on a ~175pt card that is 3pt a side, which fits in the
// gap between the two cards instead of overlapping its neighbour.
const SELECT_MS = 140;
const LIFT = 6;
const GROW = 1.035;

function PeekCard({ option, progress, selected, onPress }) {
  // `progress` is owned by PeekCardsLayout, not by the card (v0.4.4):
  // the hand resting on this card has to move on the very same value, and
  // it lives outside the card in a layer drawn above both cards.
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, -LIFT] });
  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, GROW] });
  const checkScale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  return (
    <Pressable
      onPress={onPress}
      style={styles.peekCardHit}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={option.label}
    >
      <Animated.View style={[styles.peekCard, { transform: [{ translateY }, { scale }] }]}>
        <Animated.View pointerEvents="none" style={[styles.peekGlow, { opacity: progress }]} />
        <View style={styles.peekInner}>
          <Animated.View pointerEvents="none" style={[styles.peekInnerTint, { opacity: progress }]} />
          <View style={styles.peekRadio} />
          <Animated.View
            pointerEvents="none"
            style={[styles.peekCheck, { opacity: progress, transform: [{ scale: checkScale }] }]}
          >
            <MaterialCommunityIcons name="check" size={17} color="#fff" />
          </Animated.View>
          <View style={styles.peekIconDisc}>
            {option.symbol ? <Text style={styles.peekSymbol}>{option.symbol}</Text> : null}
          </View>
          <Text style={styles.peekLabel}>{option.label}</Text>
        </View>
        <Animated.View pointerEvents="none" style={[styles.peekBorder, { opacity: progress }]} />
      </Animated.View>
    </Pressable>
  );
}

// --- The whole peeking composition (v0.4.4) ----------------------------
//
// Bubble, mascot and cards, laid out together because they are one
// picture. DRAW ORDER, bottom to top:
//
//   1. blob, dots and the little excitement marks by his face
//   2. his BODY                  behind the cards
//   3. the cards                 which cut across his stem
//   4. his HANDS                 over the cards, one riding each
//   5. the bubble
//
// That order is the whole trick. It is what lets the stem disappear
// behind a card while the fingers hang over its face -- something no
// single image can do, since an image is either in front or behind.
//
// Two things keep the hand layer honest, same as before:
//   - it is pointerEvents="none", so a tap on a finger lands on the card;
//   - it carries elevation above the cards'. Android sorts by elevation
//     before tree order, so without it the cards would draw over the
//     hands there and look right only on iOS.
//
// SIZES come from the measured content width, so the mascot, the hands
// and the cards all scale together on any phone and the hands land on
// their painted spots. The first render assumes a 393pt phone; onLayout
// corrects it before anything is visible.
const PEEK_BODY_SHARE = 0.61; // body width / content width -- crown ~210pt on a 393pt phone
const PEEK_TOP = 40; // stage top -> top of his canvas; leaves room for the bubble above
const PEEK_GAP = 8; // between the two cards
const PEEK_CARD_H = 236;
// How far a card's TOP EDGE travels when chosen: the lift, plus half the
// growth of a card this tall (it scales about its centre). The hand on it
// travels exactly this far, so the fingers never slide off the edge.
const PEEK_EDGE_LIFT = LIFT + ((GROW - 1) * PEEK_CARD_H) / 2;

function PeekCardsLayout({ step, options, value, onChoose }) {
  const [contentW, setContentW] = useState(361);

  // One animated value per option, kept for the life of the page.
  const progressRef = useRef(null);
  if (!progressRef.current) {
    progressRef.current = {};
    options.forEach((o) => {
      progressRef.current[o.value] = new Animated.Value(value === o.value ? 1 : 0);
    });
  }
  const progress = progressRef.current;

  // Only the values that actually change get an animation: choosing
  // Female animates Female up and Male down, not both of them to where
  // they already are.
  const shown = useRef(value);
  useEffect(() => {
    const was = shown.current;
    shown.current = value;
    if (was === value) return;
    options.forEach((o) => {
      const to = value === o.value ? 1 : 0;
      const from = was === o.value ? 1 : 0;
      if (to === from) return;
      Animated.timing(progress[o.value], {
        toValue: to,
        duration: SELECT_MS,
        // Fast out, gentle landing: most of the travel happens in the
        // first few frames, which is what makes it feel attached to the tap.
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
  }, [value, options, progress]);

  const bodyW = contentW * PEEK_BODY_SHARE;
  const bodyH = bodyW * PEEK_GEOMETRY.aspect;
  const bodyLeft = (contentW - bodyW) / 2;
  const stageH = PEEK_TOP + bodyH * PEEK_GEOMETRY.cardEdge;
  const cardW = (contentW - PEEK_GAP) / 2;

  // Each hand in content coordinates, plus how far its card's top edge
  // drifts sideways at that point as the card grows about its centre.
  const hands = [PEEK_GEOMETRY.handLeft, PEEK_GEOMETRY.handRight].map((g, i) => {
    const left = bodyLeft + g.x * bodyW;
    const width = g.w * bodyW;
    const cardCentre = i === 0 ? cardW / 2 : cardW + PEEK_GAP + cardW / 2;
    return {
      left,
      top: PEEK_TOP + g.y * bodyH,
      width,
      height: g.h * bodyH,
      drift: (left + width / 2 - cardCentre) * (GROW - 1),
    };
  });

  return (
    <View
      style={styles.peekWrap}
      onLayout={(e) => {
        const w = Math.round(e.nativeEvent.layout.width);
        if (w && w !== contentW) setContentW(w);
      }}
    >
      <View pointerEvents="none" style={[styles.peekStage, { height: stageH }]}>
        <View style={styles.peekBlob} />
        <View style={[styles.peekDot, { width: 23, height: 23, top: 30, left: '20%' }]} />
        <View style={[styles.peekDot, { width: 14, height: 14, top: 92, left: '6%' }]} />
        <View style={[styles.peekDot, { width: 20, height: 20, top: 170, left: '6%' }]} />
        <View style={[styles.peekDot, { width: 14, height: 14, top: 12, left: '57%' }]} />
        <View style={[styles.peekDot, { width: 24, height: 24, top: 150, right: '8%' }]} />
        {/* The little marks either side of his face. */}
        <View style={[styles.peekSpark, { top: PEEK_TOP + bodyH * 0.7, left: bodyLeft - 4, transform: [{ rotate: '50deg' }] }]} />
        <View style={[styles.peekSpark, { top: PEEK_TOP + bodyH * 0.79, left: bodyLeft - 14, transform: [{ rotate: '20deg' }] }]} />
        <View style={[styles.peekSpark, { top: PEEK_TOP + bodyH * 0.7, left: bodyLeft + bodyW - 12, transform: [{ rotate: '-50deg' }] }]} />
        <View style={[styles.peekSpark, { top: PEEK_TOP + bodyH * 0.79, left: bodyLeft + bodyW - 2, transform: [{ rotate: '-20deg' }] }]} />

        <Mascot
          source={MASCOT_PEEK.body}
          style={[styles.peekBody, { left: bodyLeft, top: PEEK_TOP, width: bodyW, height: bodyH }]}
        />

        <View style={styles.peekBubbleWrap}>
          <View style={styles.peekBubble}>
            {step.bubble.map((line) => (
              <Text key={line} style={styles.askText}>
                {line}
              </Text>
            ))}
          </View>
          <View style={styles.peekTail} />
        </View>
      </View>

      <View style={styles.peekRow}>
        {options.map((opt) => (
          <PeekCard
            key={opt.value}
            option={opt}
            progress={progress[opt.value]}
            selected={value === opt.value}
            onPress={() => onChoose(opt.value)}
          />
        ))}
      </View>

      <Text style={styles.peekHint}>Choose one to continue</Text>

      {/* Layer 4: the hands. Laid over everything above, sized to the
          stage plus the finger overhang, touching nothing. */}
      <View pointerEvents="none" style={[styles.peekHands, { height: stageH + 40 }]}>
        {options.slice(0, 2).map((opt, i) => {
          const h = hands[i];
          const p = progress[opt.value];
          return (
            <Animated.View
              key={opt.value}
              style={{
                position: 'absolute',
                left: h.left,
                top: h.top,
                width: h.width,
                height: h.height,
                transform: [
                  { translateX: p.interpolate({ inputRange: [0, 1], outputRange: [0, h.drift] }) },
                  { translateY: p.interpolate({ inputRange: [0, 1], outputRange: [0, -PEEK_EDGE_LIFT] }) },
                ],
              }}
            >
              <Mascot
                layer
                testID={i === 0 ? 'peek-hand-left' : 'peek-hand-right'}
                source={i === 0 ? MASCOT_PEEK.handLeft : MASCOT_PEEK.handRight}
                style={styles.peekHandImg}
              />
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

// --- The height page (v0.4.5) -------------------------------------------
//
// One card: the dial in a panel on the left, the mascot at a stadiometer
// on the right, and a dashed line from the dial's pill to the stick, as
// if the dial were reading it off.
//
// THE LINE is the one piece that has to know where two unrelated things
// are: the pill, which DragSlider centres in its window, and the stick,
// which is a spot in a drawing. So everything that decides how far down
// the card the pill sits -- the panel's top padding, the unit switch,
// the gap under it and the dial's window -- is a fixed number here, and
// the line and the artwork are both placed from those same numbers.
// Measuring the pill instead would get the right answer one frame late,
// and draw the line somewhere else for that first frame.
//
// The artwork's side of it comes from HEIGHT_GEOMETRY in data/brandArt.js,
// so new art means new numbers there, not a change here.

// The card's own border. Absolutely placed children are measured from
// inside it, so it only matters for the card's outer size and width.
const HC_BORDER = 1;
const HC_PAD = 10; // card edge -> panel
const HC_PANEL_SHARE = 0.44; // panel width / card width, as drawn
const HC_PANEL_MAX = 190; // ...but no wider than this on a tablet or a desktop browser
const HC_PANEL_TOP = 12; // panel edge -> unit switch
const HC_TOGGLE_H = 34;
const HC_TOGGLE_GAP = 8; // unit switch -> dial window
const HC_ROW_H = 36; // one row of the dial
const HC_DIAL_H = 310; // the dial's window: four rows either side of the pill
const HC_HINT_GAP = 4;
const HC_HINT_H = 24;
const HC_PANEL_BOTTOM = 12;
const HC_PANEL_H =
  HC_PANEL_TOP + HC_TOGGLE_H + HC_TOGGLE_GAP + HC_DIAL_H + HC_HINT_GAP + HC_HINT_H + HC_PANEL_BOTTOM;
const HC_CARD_H = HC_PANEL_H + 2 * HC_PAD + 2 * HC_BORDER;
// The pill's centre line, measured from the top of the card's inside.
const HC_PILL_Y = HC_PAD + HC_PANEL_TOP + HC_TOGGLE_H + HC_TOGGLE_GAP + HC_DIAL_H / 2;
const HC_ART_GAP = 3; // panel -> the foot of the stand
const HC_ART_RIGHT = 2; // his crown -> the card's right edge
const HC_ART_MAX_H = 300; // on a wide screen he stops growing and centres instead
const HC_DASH = 5;
const HC_DASH_GAP = 3;
const HC_RING = 11; // the little circle where the line meets the scale
const HC_SPARK_LEN = 18;
const HC_GROUND_H = 22; // the shadow under him, top to bottom

const clampTo = (v, range) => Math.max(range.min, Math.min(range.max, v));
const formatFeetInches = (totalInches) => {
  const { feet, inches } = inchesToFeetAndInches(totalInches);
  return `${feet}'${inches}"`;
};

// A row of dashes from (x0, y0) to (x1, y1). Straight runs are just a
// box of dashes; a diagonal is the same box turned about its middle,
// because a View cannot be drawn on a slant any other way.
function dashesBetween(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const count = Math.max(0, Math.floor((length + HC_DASH_GAP) / (HC_DASH + HC_DASH_GAP)));
  return {
    count,
    box: {
      left: from.x + dx / 2 - length / 2,
      top: from.y + dy / 2 - 1,
      width: length,
      transform: dy === 0 ? undefined : [{ rotate: `${(Math.atan2(dy, dx) * 180) / Math.PI}deg` }],
    },
  };
}

// --- The card itself ----------------------------------------------------
//
// Height and weight are the same picture with different artwork, so they
// are one component. What differs is passed in: the two units, the dial's
// numbers, which drawing, where the line lands in it (`geometry`), and,
// for the scale, the number to show on its display (`readout`).
function DialCard({
  testPrefix,
  scene,
  geometry,
  readout,
  units,
  unit,
  onUnit,
  dial,
  info,
  onSlidingStart,
  onSlidingComplete,
}) {
  // The first render assumes a 393pt phone; onLayout corrects it before
  // anything is visible, same as the peeking page.
  const [cardW, setCardW] = useState(361);
  const g = geometry;

  // --- where everything goes, inside the border ---
  const innerW = cardW - 2 * HC_BORDER;
  const panelW = Math.min(HC_PANEL_MAX, Math.round(innerW * HC_PANEL_SHARE));
  const regionLeft = HC_PAD + panelW + HC_ART_GAP;
  const regionW = innerW - regionLeft - HC_ART_RIGHT;
  const artW = Math.max(0, Math.min(regionW, HC_ART_MAX_H * g.aspect));
  const artH = artW / g.aspect;
  const artLeft = regionLeft + (regionW - artW) / 2;
  // Hung from the pill rather than stood on the card's floor: the pill's
  // height is fixed by the dial, and the art is placed against it.
  const artTop = HC_PILL_Y - g.pillY * artH;
  const at = (fx, fy) => ({ x: artLeft + fx * artW, y: artTop + fy * artH });

  // The line out of the pill. Height's runs level into the stick, so it
  // leaves the pill at its widest point; weight's slopes down to the
  // scale, so it leaves the rounded end at the angle it travels.
  const pillRight = HC_PAD + panelW - DIAL_COMPACT_INSET;
  const anchored = !!g.anchor;
  const lineFrom = anchored
    ? {
        x: pillRight - (DIAL_COMPACT_HEIGHT / 2) * (1 - Math.SQRT1_2),
        y: HC_PILL_Y + (DIAL_COMPACT_HEIGHT / 2) * Math.SQRT1_2,
      }
    : { x: pillRight, y: HC_PILL_Y };
  const lineTo = anchored
    ? at(g.anchor.x, g.anchor.y)
    : { x: artLeft + g.stickRight * artW, y: HC_PILL_Y };
  const line = dashesBetween(lineFrom, lineTo);

  // The disc behind his crown, kept inside the card's rounded edge.
  const haloD = g.halo.size * artW;
  const haloC = at(g.halo.x, g.halo.y);
  const haloLeft = Math.min(haloC.x - haloD / 2, innerW - 6 - haloD);
  const haloTop = Math.max(6, haloC.y - haloD / 2);
  const ground = at(g.ground.x, g.ground.y);
  const groundW = g.ground.w * artW;
  // The scale's display, redrawn at the same spot over the artwork's own.
  const screen = g.readout && {
    left: artLeft + g.readout.x * artW,
    top: artTop + g.readout.y * artH,
    width: g.readout.w * artW,
    height: g.readout.h * artH,
  };

  return (
    <View>
      <View
        testID={`${testPrefix}-card`}
        style={[styles.hcCard, { height: HC_CARD_H }]}
        onLayout={(e) => {
          const w = Math.round(e.nativeEvent.layout.width);
          if (w && w !== cardW) setCardW(w);
        }}
      >
        {/* Bottom layer: the disc behind his crown, two loose dots, the
            marks off his crown and the shadow under him. */}
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <View
            style={[styles.hcHalo, { left: haloLeft, top: haloTop, width: haloD, height: haloD, borderRadius: haloD / 2 }]}
          />
          {g.dots.map((d, i) => {
            const p = at(d.x, d.y);
            const size = d.size * artW;
            return (
              <View
                key={`dot${i}`}
                style={[styles.hcDot, { left: p.x - size / 2, top: p.y - size / 2, width: size, height: size }]}
              />
            );
          })}
          {/* A circle stretched sideways: the one way to get a true
              ellipse out of a View, where a wide rounded box would come
              out as a pill with flat sides. */}
          <View
            style={[
              styles.hcGround,
              { left: ground.x - HC_GROUND_H / 2, top: ground.y - HC_GROUND_H / 2, transform: [{ scaleX: groundW / HC_GROUND_H }] },
            ]}
          />
          {g.sparks.map((s, i) => {
            const p = at(s.x, s.y);
            return (
              <View
                key={`spark${i}`}
                style={[
                  styles.hcSpark,
                  { left: p.x - HC_SPARK_LEN / 2, top: p.y - 2, transform: [{ rotate: `${s.angle}deg` }] },
                ]}
              />
            );
          })}
        </View>

        <Mascot source={scene} style={[styles.hcArt, { left: artLeft, top: artTop, width: artW, height: artH }]} />

        {/* The live weight on the scale's display. Drawn rather than
            painted into the artwork, which is why the file has three
            placeholder dashes there -- this covers them. */}
        {screen && readout ? (
          <View
            testID={`${testPrefix}-readout`}
            pointerEvents="none"
            style={[
              styles.hcScreen,
              screen,
              { borderRadius: screen.height / 4, borderWidth: Math.max(1.5, screen.height * 0.16) },
            ]}
          >
            <Text
              style={[styles.hcScreenText, { fontSize: screen.height * 0.58 }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.5}
            >
              {readout}
            </Text>
          </View>
        ) : null}

        <View testID={`${testPrefix}-panel`} style={[styles.hcPanel, { width: panelW, height: HC_PANEL_H }]}>
          <View style={styles.hcToggle}>
            {units.map(([value, label]) => {
              const on = value === unit;
              return (
                <TouchableOpacity
                  key={value}
                  style={[styles.hcToggleBtn, on && styles.hcToggleBtnOn]}
                  onPress={() => onUnit(value)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                >
                  <Text style={[styles.hcToggleText, on && styles.hcToggleTextOn]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* keyed by unit: a fresh dial per unit starts exactly on its
              value, where a reused one would spend its first frame on
              the old unit's position before catching up. */}
          <Slider
            key={unit}
            style={styles.hcDial}
            variant="dial"
            dialSize="compact"
            dialRules={false}
            dialChevrons
            dialTicks
            rowHeight={HC_ROW_H}
            trackLength={HC_DIAL_H}
            minimumValue={dial.min}
            maximumValue={dial.max}
            step={1}
            value={dial.value}
            unitLabel={dial.unitLabel}
            formatLabel={dial.formatLabel}
            minimumTrackTintColor={COLORS.accent}
            onValueChange={dial.onChange}
            onSlidingStart={onSlidingStart}
            onSlidingComplete={onSlidingComplete}
          />

          <View style={styles.hcHint}>
            <MaterialCommunityIcons name="arrow-up-down" size={20} color={COLORS.accent} />
            <Text style={styles.hcHintText}>Drag to choose</Text>
          </View>
        </View>

        {/* Top layer: the dashed line, drawn over the artwork so it reads
            across the stick's face or down to the scale. elevation is
            only there to beat the panel's own in Android's draw order;
            with no background it casts nothing. */}
        <View
          testID={`${testPrefix}-connector`}
          pointerEvents="none"
          style={[styles.hcLine, line.box]}
        >
          {Array.from({ length: line.count }, (_, i) => (
            <View key={i} style={[styles.hcDash, { left: i * (HC_DASH + HC_DASH_GAP) }]} />
          ))}
        </View>
        {anchored ? (
          <View
            pointerEvents="none"
            style={[styles.hcRing, { left: lineTo.x - HC_RING / 2, top: lineTo.y - HC_RING / 2 }]}
          />
        ) : null}
      </View>

      <View style={styles.hcInfo}>
        <View style={styles.hcInfoDisc}>
          <MaterialCommunityIcons name={info.icon} size={24} color={COLORS.text} />
        </View>
        <Text style={styles.hcInfoText}>{info.text}</Text>
      </View>
    </View>
  );
}

function HeightCard({ answers, update, scene, onSlidingStart, onSlidingComplete }) {
  const isCm = answers.heightUnit === 'cm';
  // Clamped for display only: nothing the dials can do puts a value out
  // of range, but a stored answer from an older build could be.
  const totalInches = clampTo(answers.heightFeet * 12 + answers.heightInches, HEIGHT_IN_RANGE);
  const cm = clampTo(Math.round(answers.heightCm), HEIGHT_CM_RANGE);
  const { feet, inches } = inchesToFeetAndInches(totalInches);

  // heightCm is the one number both dials keep current -- the ft + in
  // dial writes it on every change as well -- so switching to ft + in
  // works feet and inches out from it. Before v0.4.5 the switch only
  // flipped the unit: choose 185 cm, switch to ft + in, and it still said
  // 5'8", which is also what would have been saved.
  //
  // heightCm itself is left alone, so flipping back and forth never
  // drifts: 184 cm shows as 6'0", but 6'0" converted back would be 183.
  const switchUnit = (next) => {
    if ((next === 'cm') === isCm) return;
    if (next === 'cm') {
      update({ heightUnit: 'cm' });
      return;
    }
    const derived = inchesToFeetAndInches(clampTo(Math.round(answers.heightCm / 2.54), HEIGHT_IN_RANGE));
    update({ heightUnit: 'ftin', heightFeet: derived.feet, heightInches: derived.inches });
  };

  const onDial = (v) => {
    if (isCm) {
      update({ heightCm: Math.round(v) });
      return;
    }
    const next = inchesToFeetAndInches(v);
    update({ heightFeet: next.feet, heightInches: next.inches, heightCm: feetInchesToCm(next.feet, next.inches) });
  };

  return (
    <DialCard
      testPrefix="height"
      scene={scene}
      geometry={HEIGHT_GEOMETRY}
      units={[
        ['ftin', 'ft + in'],
        ['cm', 'cm'],
      ]}
      unit={isCm ? 'cm' : 'ftin'}
      onUnit={switchUnit}
      dial={{
        min: isCm ? HEIGHT_CM_RANGE.min : HEIGHT_IN_RANGE.min,
        max: isCm ? HEIGHT_CM_RANGE.max : HEIGHT_IN_RANGE.max,
        value: isCm ? cm : totalInches,
        unitLabel: isCm ? 'cm' : undefined,
        formatLabel: isCm ? undefined : formatFeetInches,
        onChange: onDial,
      }}
      info={{ icon: 'ruler', text: `Height: ${isCm ? `${cm} cm` : `${feet}' ${inches}"`}` }}
      onSlidingStart={onSlidingStart}
      onSlidingComplete={onSlidingComplete}
    />
  );
}

function WeightCard({ answers, value, range, onChange, switchUnit, scene, onSlidingStart, onSlidingComplete }) {
  const isLb = answers.weightUnit === 'lb';
  return (
    <DialCard
      testPrefix="weight"
      scene={scene}
      geometry={WEIGHT_GEOMETRY}
      // A real scale reads to a tenth. The dial only offers whole units,
      // so the tenth is always .0 -- it is there to make the display look
      // like a scale rather than a repeat of the number above it.
      readout={`${value}.0`}
      units={[
        ['lb', 'lbs'],
        ['kg', 'kg'],
      ]}
      unit={isLb ? 'lb' : 'kg'}
      onUnit={switchUnit}
      dial={{ min: range.min, max: range.max, value, unitLabel: isLb ? 'lbs' : 'kg', onChange }}
      info={{ icon: 'scale-bathroom', text: `Weight: ${value} ${isLb ? 'lbs' : 'kg'}` }}
      onSlidingStart={onSlidingStart}
      onSlidingComplete={onSlidingComplete}
    />
  );
}

// --- The goal page's three cards (v0.4.9) -------------------------------
//
// Each card has the mascot ACTING OUT its goal, and acting it out for
// real: these are the same seven animations the corner mascot rotates
// through (data/brandArt.js), playing in the card. He lifts on Gain,
// meditates on Maintain, runs on Lose.
//
// The run is that file mirrored. All seven poses were drawn facing left,
// which is right for a mascot in the top-right corner and wrong for one
// running across a card -- he would be sprinting off the side of it.
//
// Each sign keeps its own colour, as drawn: blue up, green level, red
// down. The inks are the app's own three (accent / good / over) rather
// than the mockup's neon versions -- #36e844 on a pale green disc is
// 1.6:1, and these little signs are the one part of the card that has
// to be legible at a glance. The tones are a hint, not a verdict:
// nothing here is the "good" option.
const GOAL_TONES = {
  up: { oval: '#e9f2fe', badge: '#d3e6fc', icon: 'arrow-up', ink: COLORS.accent },
  level: { oval: '#ecf7ec', badge: '#d7eed6', icon: 'equal', ink: COLORS.good },
  down: { oval: '#fdeeee', badge: '#fbdcda', icon: 'arrow-down', ink: COLORS.over },
};
const GOAL_OVAL_W = 116;
const GOAL_OVAL_H = 156;
// The seven poses share a canvas with room around the art for the jump
// and the sleep, so the canvas has to be bigger than the broccoli you
// want: at 122 he comes out about 95 x 119, which fills the oval and
// still leaves the badge above his crown.
const GOAL_POSE_W = 122;
// The seven poses share one 236x262 canvas so he cannot jump when the
// pose changes -- see MASCOT_POSE_FILES. Keeping that ratio here is what
// makes the three cards agree with each other.
const GOAL_POSE_H = (GOAL_POSE_W * 262) / 236;

function GoalCard({ option, selected, onPress }) {
  const tone = GOAL_TONES[option.tone] || GOAL_TONES.level;
  const progress = useRef(null);
  if (!progress.current) progress.current = new Animated.Value(selected ? 1 : 0);
  const p = progress.current;

  useEffect(() => {
    Animated.timing(p, {
      toValue: selected ? 1 : 0,
      duration: SELECT_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [selected, p]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${option.label}. ${option.sub}`}
    >
      <View style={styles.goalCard}>
        <Animated.View pointerEvents="none" style={[styles.goalTint, { opacity: p }]} />

        <View style={styles.goalArt}>
          {/* A circle stretched downwards: a rounded box this tall would
              read as a pill with flat sides, not the oval as drawn. */}
          <View pointerEvents="none" style={[styles.goalOval, { backgroundColor: tone.oval }]} />
          {/* Behind him on purpose -- his crown crosses it, which is
              what stops the badge looking stuck on. */}
          <View style={[styles.goalBadge, { backgroundColor: tone.badge }]}>
            <MaterialCommunityIcons name={tone.icon} size={22} color={tone.ink} />
          </View>
          <Mascot
            source={MASCOT_POSES[option.pose]}
            style={[styles.goalPose, option.flip && styles.goalPoseFlipped]}
          />
        </View>

        <View style={styles.goalText}>
          <Text style={styles.goalLabel}>{option.label}</Text>
          <Text style={styles.goalSub}>{option.sub}</Text>
        </View>

        <View style={styles.goalRadio} />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.goalCheck,
            { opacity: p, transform: [{ scale: p.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] },
          ]}
        >
          <MaterialCommunityIcons name="check" size={16} color="#fff" />
        </Animated.View>
        <Animated.View pointerEvents="none" style={[styles.goalBorder, { opacity: p }]} />
      </View>
    </Pressable>
  );
}

// --- One tile in the body-fat grid (v0.4.7) -----------------------------
//
// A reference picture on a pale tile, the range under it, and a ring in
// the corner that fills in when it is the chosen one. The ring, the
// outline and the wash all fade in together over SELECT_MS -- the same
// moment-of-the-tap timing as the sex page's cards, and opacity only, so
// it runs on the native driver. No lift or grow here: eight tiles
// jumping about is busier than two.
function BodyFatCard({ rangeKey, image, selected, onPress }) {
  const progress = useRef(null);
  if (!progress.current) progress.current = new Animated.Value(selected ? 1 : 0);
  const p = progress.current;

  useEffect(() => {
    Animated.timing(p, {
      toValue: selected ? 1 : 0,
      duration: SELECT_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [selected, p]);

  return (
    <Pressable
      onPress={onPress}
      style={styles.bfHit}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${rangeKey}% body fat`}
    >
      <View style={styles.bfCard}>
        <Animated.View pointerEvents="none" style={[styles.bfTint, { opacity: p }]} />
        <View style={styles.bfTile}>
          <Image source={image} style={styles.bfImage} resizeMode="contain" />
        </View>
        {/* An en dash between the two numbers, as drawn -- the plain
            hyphen the range is stored and spoken as is too short to read
            as "to" at this weight. */}
        <Text style={styles.bfLabel}>{`${rangeKey.replace('-', '–')}%`}</Text>
        <View style={styles.bfRadio} />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.bfCheck,
            { opacity: p, transform: [{ scale: p.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] },
          ]}
        >
          <MaterialCommunityIcons name="check" size={15} color="#fff" />
        </Animated.View>
        <Animated.View pointerEvents="none" style={[styles.bfBorder, { opacity: p }]} />
      </View>
    </Pressable>
  );
}

// A single tappable option — used for single-choice, multi-choice, and the
// body-fat grid, so all three share one visual style.
function OptionCard({ label, sub, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.option, selected && styles.optionSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{label}</Text>
      {sub ? <Text style={[styles.optionSub, selected && styles.optionSubSelected]}>{sub}</Text> : null}
    </TouchableOpacity>
  );
}

// `initialAnswers`/`initialStepIndex` are only ever passed in by tests, to
// render the quiz starting mid-way through with specific answers already
// filled in (e.g. jumping straight to the body-fat step with sex already
// set) — real usage from App.js never passes them, so the quiz always
// starts fresh on step 0 exactly as before.
export default function QuizScreen({
  onComplete,
  onCancel,
  initialAnswers,
  initialStepIndex,
  // Drops the two mascot intro pages (v0.4.0). They belong to the first
  // intake, not to a retake -- nobody wants "Hi, I'm glad you made it!"
  // and a name box they already filled in. Left false for now because
  // retaking from Goals is currently the only way to reach the quiz at
  // all, so it is also the only way to see these pages.
  skipIntro = false,
}) {
  const [answers, setAnswers] = useState({
    age: 25,
    heightUnit: 'ftin',
    heightFeet: 5,
    heightInches: 8,
    heightCm: feetInchesToCm(5, 8),
    weightUnit: 'kg',
    // A reasonable first-paint value for the default height right above —
    // the useEffect below immediately keeps this in sync with whatever
    // height is actually answered by the time the user reaches the weight
    // step, so this initial call is just to avoid a flash of some
    // unrelated number before that effect's first run.
    weightKg: defaultWeightForHeight(feetInchesToCm(5, 8)),
    training: undefined,
    ...initialAnswers,
  });
  const [stepIndex, setStepIndex] = useState(initialStepIndex ?? 0);
  // Tracks whether `answers.weightKg` is still this auto-computed default
  // (see the useEffect below) or the user has actually dragged the weight
  // slider themselves — true keeps it synced to height as the user moves
  // back and forth through earlier steps; the moment they touch the
  // slider (see handleChange in the 'weight' step render below), this
  // flips to false and their own choice is never overwritten again.
  const [weightIsDefault, setWeightIsDefault] = useState(
    initialAnswers?.weightKg == null && initialAnswers?.weightLb == null
  );
  // The ruler and the ScrollView below it both respond to up/down drags,
  // so without this the page would scroll underneath you while you're
  // trying to drag a number into place. Every <Slider> (really
  // DragSlider.js) reports onSlidingStart/onSlidingComplete, which flips
  // this off for the duration of the drag.
  const [scrollLocked, setScrollLocked] = useState(false);
  const lockScroll = () => setScrollLocked(true);
  const unlockScroll = () => setScrollLocked(false);

  // Which diet's "Learn more" sheet (if any) is currently open — holds a
  // diet `value` string (e.g. 'keto'), or null when closed. Opening/closing
  // this never itself changes answers.diet; only DietDetailModal's "Choose
  // this diet" button does that (see the mount below).
  const [learnMoreDietValue, setLearnMoreDietValue] = useState(null);

  // Conditional steps (currently just goalWeight, skipped when goal is
  // "maintain") are filtered out here rather than inside the render loop,
  // so "step 4 of 9" always reflects what the user will actually see.
  const visibleSteps = useMemo(
    () =>
      QUIZ_STEPS.filter(
        (s) => (!s.condition || s.condition(answers)) && !(skipIntro && s.firstRunOnly)
      ),
    [answers.goal, skipIntro]
  );
  const step = visibleSteps[stepIndex];

  // The intro pages are not questions, so they do not get counted as
  // "Step 1 of 15". Without this the age question -- the first thing
  // anyone would call step one -- would announce itself as step three.
  const introCount = visibleSteps.filter((s) => s.type === 'mascotIntro').length;
  const questionCount = visibleSteps.length - introCount;
  const questionNumber = stepIndex + 1 - introCount;

  const update = (patch) => setAnswers((prev) => ({ ...prev, ...patch }));

  // The "weight" step type is always shown with a value on screen — even
  // before the user drags anything — via the display fallback below. But a
  // fallback used only for *display* doesn't put a real number into
  // `answers`, and since isAnswered() treats sliders as always-answered, a
  // user could tap Next straight through without one ever being recorded
  // (e.g. `goalWeightValue` staying undefined, or `weightLb` staying
  // undefined after switching the unit toggle without touching the
  // slider). This keeps both fields backed by a real stored value the
  // moment they'd otherwise only be a display fallback, without ever
  // overwriting a value the user already chose.
  useEffect(() => {
    if (!step || step.type !== 'weight') return;
    const isGoalWeight = step.key === 'goalWeight';
    const isLb = answers.weightUnit === 'lb';
    if (isGoalWeight) {
      const { selectMin, selectMax, currentWeightDisplay } = goalWeightRange(answers);
      // Whether this is filling in a first-time default (starting the
      // target at your current weight, nudged into the selectable range
      // since the current-weight tick itself isn't selectable — see
      // goalWeightRange above) or repairing a target that fell outside a
      // newly-changed range (current weight or goal changed since it was
      // picked), it's the same clamp either way.
      const clamped = Math.max(selectMin, Math.min(selectMax, answers.goalWeightValue ?? currentWeightDisplay));
      if (clamped !== answers.goalWeightValue) {
        update({ goalWeightValue: clamped });
      }
    } else {
      // This is the main "weight" step (not goalWeight). While the user
      // hasn't actually touched the slider yet (weightIsDefault — see
      // handleChange further down, in the 'weight' render branch, for
      // where that flips to false), keep weightKg synced to whatever
      // height is currently answered, so going back and changing height
      // before ever touching weight updates this default too instead of
      // leaving it stuck at whatever height was answered first.
      if (weightIsDefault) {
        const target = defaultWeightForHeight(answers.heightCm);
        if (target !== answers.weightKg) {
          update({ weightKg: target });
        }
      }
      if (isLb && answers.weightLb == null) {
        update({ weightLb: Math.round(kgToLb(answers.weightKg)) });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, answers.weightUnit, answers.weightKg, answers.weightLb, answers.goal, answers.heightCm, weightIsDefault]);

  const isAnswered = () => {
    switch (step.type) {
      case 'mascotIntro':
        // A page with no input is always passable. One with an input
        // needs something in it that is not just spaces -- the mockup
        // greys the button out until then.
        return !step.input || (answers[step.key] || '').trim().length > 0;
      case 'slider':
      case 'height':
      case 'weight':
        return true; // sliders always have a value (a default), so always answerable
      case 'single':
        return answers[step.key] != null;
      case 'bodyFat':
        return answers.bodyFatRange != null;
      case 'multi':
        return answers[step.key] !== undefined;
      default:
        return true;
    }
  };

  const goNext = () => {
    if (stepIndex < visibleSteps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      onComplete(answers);
    }
  };

  const goBack = () => {
    if (stepIndex === 0) {
      onCancel();
    } else {
      setStepIndex(stepIndex - 1);
    }
  };

  const renderStepBody = () => {
    if (step.type === 'slider') {
      const value = answers[step.key] ?? step.default;
      const dial = step.sliderVariant === 'dial';
      const slider = (
        <Slider
          style={dial ? styles.dialSlider : styles.slider}
          variant={dial ? 'dial' : 'ruler'}
          unitLabel={dial ? step.unitLabel : undefined}
          minimumValue={step.min}
          maximumValue={step.max}
          step={step.step}
          value={value}
          minimumTrackTintColor={dial ? COLORS.accent : '#4f8ef7'}
          onValueChange={(v) => update({ [step.key]: Math.round(v) })}
          onSlidingStart={lockScroll}
          onSlidingComplete={unlockScroll}
        />
      );

      // The dial carries its own value inside the pill, so the big
      // number that used to sit above the ruler would be the same figure
      // twice. The card, the two chevrons and the caption are the frame
      // the mockup draws around it.
      if (dial) {
        return (
          <View style={styles.dialCard}>
            <MaterialCommunityIcons name="chevron-up" size={30} color={COLORS.textFaint} />
            {slider}
            <MaterialCommunityIcons name="chevron-down" size={30} color={COLORS.textFaint} />
            <Text style={styles.dialHint}>Drag to choose</Text>
          </View>
        );
      }

      return (
        <View>
          <Text style={styles.bigValue}>
            {value} {step.unitLabel}
          </Text>
          {slider}
        </View>
      );
    }

    if (step.type === 'single') {
      const options = step.getOptions ? step.getOptions(answers, QUESTION_HELPERS) : step.options;

      // A couple of steps (currently just "sex") ask for this to be shown
      // as a row of big square boxes instead of the usual stacked list —
      // see the `layout` flag in data/quizQuestions.js.
      // The mascot peeking over two tall cards (v0.4.3, layered in
      // v0.4.4). One composition, drawn by PeekCardsLayout -- see the
      // note on it for why the mascot is three pieces.
      if (step.layout === 'peekCards') {
        return (
          <PeekCardsLayout
            step={step}
            options={options}
            value={answers[step.key]}
            onChoose={(v) => update({ [step.key]: v })}
          />
        );
      }

      if (step.layout === 'squareRow') {
        return (
          <View style={styles.squareRow}>
            {options.map((opt) => {
              const selected = answers[step.key] === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.squareOption, selected && styles.optionSelected]}
                  onPress={() => update({ [step.key]: opt.value })}
                  activeOpacity={0.7}
                >
                  {opt.symbol ? (
                    <Text style={[styles.squareOptionSymbol, selected && styles.optionLabelSelected]}>
                      {opt.symbol}
                    </Text>
                  ) : null}
                  <Text style={[styles.squareOptionLabel, selected && styles.optionLabelSelected]}>
                    {opt.label}
                  </Text>
                  {opt.sub ? (
                    <Text style={[styles.optionSub, selected && styles.optionSubSelected]}>{opt.sub}</Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        );
      }

      // The weightHistory step shows a vertical weight-range scale (an
      // individualized upper/lower threshold line, color-coded red/green)
      // with four bubbles arranged around it, instead of the usual stacked
      // list — see the `layout` flag in data/quizQuestions.js. The scale
      // line itself always uses red for "outside the healthy range" and
      // green for "within it" — but per Damon's explicit request, the
      // over/under BUBBLES are yellow and the "both" bubble is red (not
      // the reverse, which is what you'd expect from the scale's own
      // colors — this is intentional, not a mismatch). Colors stay visible
      // whether or not that option is currently selected — selection is
      // shown by strengthening that same color (heavier border, deeper
      // tint) plus a matching checkmark badge, deliberately not blue, so
      // each bubble's own color always means the same thing. The over/
      // under bubbles each get a short stub pointing at the scale; "both"
      // instead gets a bracket (see scaleGutter below) that visibly
      // reaches into both red zones, since it relates to both of them
      // rather than to whatever's beside it.
      if (step.layout === 'weightScale') {
        const { underweightKg, overweightKg } = weightHistoryThresholds(answers.heightCm);
        const unit = answers.weightUnit || 'kg';
        const isLb = unit === 'lb';
        const upperLabel = formatWeightForUnit(overweightKg, unit);
        const lowerLabel = formatWeightForUnit(underweightKg, unit);
        const selectedValue = answers[step.key];
        const labelFor = (value) => options.find((o) => o.value === value)?.label ?? '';

        // Minor ticks every 5kg — or every 10lb when that's the active
        // unit, since 5lb increments come out too dense to label cleanly
        // once converted (5kg is ~11lb, so 10lb is the closer round
        // equivalent, not just an arbitrary switch). upperValue/lowerValue
        // are this same unit's own rounded numbers — matching upperLabel/
        // lowerLabel above exactly — not kg values re-labeled.
        const upperValue = isLb ? Math.round(kgToLb(overweightKg)) : Math.round(overweightKg);
        const lowerValue = isLb ? Math.round(kgToLb(underweightKg)) : Math.round(underweightKg);
        const minorTicks = buildMinorTicks({
          upperValue,
          lowerValue,
          step: isLb ? 10 : 5,
          zoneTop: SCALE_ZONE_TOP,
          zoneMid: SCALE_ZONE_MID,
          scaleHeight: SCALE_HEIGHT,
        });

        const renderBubble = (value, tone) => {
          const isSelected = selectedValue === value;
          return (
            <View style={styles.scaleBubbleWrap}>
              <TouchableOpacity
                style={[
                  styles.scaleBubble,
                  styles[`scaleBubble${tone}`],
                  isSelected && styles[`scaleBubble${tone}Selected`],
                ]}
                onPress={() => update({ [step.key]: value })}
                activeOpacity={0.8}
              >
                <Text style={[styles.scaleBubbleText, styles[`scaleBubbleText${tone}`]]}>
                  {labelFor(value)}
                </Text>
              </TouchableOpacity>
              {isSelected ? (
                <View style={[styles.scaleCheck, styles[`scaleCheck${tone}`]]}>
                  <Text style={styles.scaleCheckText}>✓</Text>
                </View>
              ) : null}
            </View>
          );
        };

        return (
          <View style={styles.scaleRow}>
            <View style={styles.scaleLeftCol}>
              <View style={styles.scaleBubbleRow}>
                {renderBubble('overweight', 'Yellow')}
                <View style={styles.scaleStub}>
                  <View style={[styles.scaleStubLine, styles.scaleStubLineYellow]} />
                </View>
              </View>
              {/* No local stub here — the "both" bubble's connection to
                  the scale is the red bracket in scaleGutter below, which
                  reaches all the way to the red zones rather than just a
                  short mark next to the bubble. */}
              <View style={styles.scaleBubbleRow}>{renderBubble('both', 'Red')}</View>
              <View style={styles.scaleBubbleRow}>
                {renderBubble('underweight', 'Yellow')}
                <View style={styles.scaleStub}>
                  <View style={[styles.scaleStubLine, styles.scaleStubLineYellow]} />
                </View>
              </View>
            </View>

            {/* The "both" option relates to BOTH outer (red) zones, not
                the middle — so instead of a short stub next to the
                bubble, this is a bracket that visibly reaches from the
                "both" bubble's row up into the top red zone and down into
                the bottom red zone. SCALE_TOP_ZONE_CENTER/
                SCALE_BOTTOM_ZONE_CENTER (top of file) are the same points
                the scale's own red zones are centered on, so the bracket
                actually lands inside the red segments, not just near
                them. */}
            <View style={styles.scaleGutter}>
              <View
                style={[
                  styles.scaleGutterBar,
                  { top: SCALE_TOP_ZONE_CENTER, height: SCALE_BOTTOM_ZONE_CENTER - SCALE_TOP_ZONE_CENTER },
                ]}
              />
              <View style={[styles.scaleGutterTick, { top: SCALE_TOP_ZONE_CENTER - 1, left: 9, width: 13 }]} />
              <View style={[styles.scaleGutterTick, { top: SCALE_BOTTOM_ZONE_CENTER - 1, left: 9, width: 13 }]} />
              <View style={[styles.scaleGutterTick, { top: SCALE_HEIGHT / 2 - 1, left: 0, width: 11 }]} />
            </View>

            <View style={styles.scaleLineCol}>
              {/* Arrowheads at both ends signal the line keeps going past
                  what's drawn (same idea as a number line) — plain
                  triangles via the border trick, positioned just outside
                  scaleLineCol's own 0..SCALE_HEIGHT range rather than
                  eating into it, so they don't shift any of the zone/tick
                  math above. */}
              <View style={styles.scaleArrowUp} />
              <View style={[styles.scaleSeg, styles.scaleSegTop]} />
              <View style={[styles.scaleSeg, styles.scaleSegMid]} />
              <View style={[styles.scaleSeg, styles.scaleSegBottom]} />
              <View style={[styles.scaleArrowDown, { top: SCALE_HEIGHT }]} />
              <View style={[styles.scaleTick, { top: SCALE_ZONE_TOP - 1 }]} />
              <View style={[styles.scaleTick, { top: SCALE_ZONE_TOP + SCALE_ZONE_MID - 1 }]} />
              <Text style={[styles.scaleTickLabel, { top: SCALE_ZONE_TOP - 9 }]}>{upperLabel}</Text>
              <Text style={[styles.scaleTickLabel, { top: SCALE_ZONE_TOP + SCALE_ZONE_MID - 9 }]}>
                {lowerLabel}
              </Text>
              {/* Every-5kg/10lb minor ticks — lighter and unlabeled with a
                  unit, so the two bold thresholds above stay the visual
                  anchors and these just add texture, not competition. */}
              {minorTicks.map((t) => (
                <React.Fragment key={t.value}>
                  <View style={[styles.scaleMinorTick, { top: t.top - 0.75 }]} />
                  <Text style={[styles.scaleMinorLabel, { top: t.top - 7 }]}>{t.value}</Text>
                </React.Fragment>
              ))}
            </View>

            <View style={styles.scaleRightCol}>
              <View style={styles.scaleBubbleRowRight}>
                <View style={styles.scaleStub}>
                  <View style={[styles.scaleStubLine, styles.scaleStubLineGreen]} />
                </View>
                {renderBubble('neither', 'Green')}
              </View>
            </View>
          </View>
        );
      }

      // The goal step (v0.4.9): three wide cards with the mascot acting
      // out each goal -- see GoalCard above. It replaced three static
      // icons; the pictures are still in the assets repo, unused.
      if (step.layout === 'goalCards') {
        return (
          <View style={styles.goalStack}>
            {options.map((opt) => {
              if (!MASCOT_POSES[opt.pose]) {
                throw new Error(
                  `No animation for goal option "${opt.value}" — its \`pose\` must name one in MASCOT_POSE_FILES (data/brandArt.js)`
                );
              }
              return (
                <GoalCard
                  key={opt.value}
                  option={opt}
                  selected={answers[step.key] === opt.value}
                  onPress={() => update({ [step.key]: opt.value })}
                />
              );
            })}
          </View>
        );
      }

      // The activityLevel step shows four illustrated horizontal cards
      // (Damon's own illustrated PNG + title + short description + a
      // compact step-count badge) instead of the usual stacked text list —
      // see the `layout` flag in data/quizQuestions.js and ACTIVITY_IMAGES
      // there for the actual pictures. Deliberately no red/yellow/green
      // here (unlike the weightHistory scale above) — none of these
      // answers should read as a "good" or "bad" choice, so unselected
      // stays neutral gray/white and selected uses the same plain blue as
      // every other step. The illustration itself doesn't change color on
      // selection (unlike the old code-drawn ActivityIcon version) — these
      // are static images, so only the surrounding card/title/description/
      // badge/checkmark switch to the selected treatment.
      if (step.layout === 'activityCards') {
        return (
          <View>
            {options.map((opt) => {
              const selected = answers[step.key] === opt.value;
              const source = ACTIVITY_IMAGES[opt.value];
              if (!source) {
                throw new Error(
                  `No image for activityLevel option "${opt.value}" — add it to ACTIVITY_IMAGES in data/quizQuestions.js`
                );
              }
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.activityCard, selected && styles.activityCardSelected]}
                  onPress={() => update({ [step.key]: opt.value })}
                  activeOpacity={0.8}
                >
                  <View style={styles.activityIconBox}>
                    <Image source={source} style={styles.activityIconImage} resizeMode="contain" />
                  </View>
                  <View style={styles.activityTextCol}>
                    <Text style={[styles.activityTitle, selected && styles.activityTitleSelected]}>
                      {opt.label}
                    </Text>
                    <Text style={[styles.activityDesc, selected && styles.activityDescSelected]}>
                      {opt.description}
                    </Text>
                    <View style={[styles.activityBadge, selected && styles.activityBadgeSelected]}>
                      <Text
                        style={[styles.activityBadgeText, selected && styles.activityBadgeTextSelected]}
                      >
                        {opt.badge}
                      </Text>
                    </View>
                  </View>
                  {selected ? (
                    <View style={styles.activityCheck}>
                      <Text style={styles.activityCheckText}>✓</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        );
      }

      // The diet step shows illustrated horizontal cards (Damon's own
      // supplied illustration + bold title + the same short description
      // used elsewhere + an independent "Learn more" control) instead of
      // the plain text-only OptionCard every other 'single' step still
      // falls back to — see the `layout` flag and DIET_IMAGES/DIET_DETAILS
      // in data/quizQuestions.js. "Learn more" is a nested TouchableOpacity
      // inside the card's own TouchableOpacity — RN's touch responder
      // system only fires the innermost element that was actually pressed,
      // so tapping Learn More never also fires the card's onPress and
      // selects the diet; no stopPropagation-equivalent is needed.
      if (step.layout === 'illustratedCards') {
        return (
          <View>
            {options.map((opt) => {
              const selected = answers[step.key] === opt.value;
              const source = DIET_IMAGES[opt.value];
              if (!source) {
                throw new Error(
                  `No image for diet option "${opt.value}" — add it to DIET_IMAGES in data/quizQuestions.js`
                );
              }
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.dietCard, selected && styles.dietCardSelected]}
                  onPress={() => update({ [step.key]: opt.value })}
                  activeOpacity={0.8}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={opt.label}
                >
                  <View style={styles.dietIconWrap}>
                    <Image
                      source={source}
                      style={styles.dietIconImage}
                      resizeMode="contain"
                      accessibilityElementsHidden
                      importantForAccessibility="no"
                    />
                  </View>
                  <View style={styles.dietTextCol}>
                    <Text style={[styles.dietTitle, selected && styles.dietTitleSelected]}>
                      {opt.label}
                    </Text>
                    <Text style={[styles.dietDesc, selected && styles.dietDescSelected]}>
                      {opt.sub}
                    </Text>
                    <TouchableOpacity
                      style={styles.dietLearnMore}
                      onPress={() => setLearnMoreDietValue(opt.value)}
                      accessibilityRole="button"
                      accessibilityLabel={`Learn more about ${opt.label}`}
                    >
                      <Text
                        style={[
                          styles.dietLearnMoreText,
                          selected && styles.dietLearnMoreTextSelected,
                        ]}
                      >
                        Learn more
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {selected ? (
                    <View style={styles.dietCheck}>
                      <Text style={styles.dietCheckText}>✓</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        );
      }

      return options.map((opt) => (
        <OptionCard
          key={opt.value}
          label={opt.label}
          sub={opt.sub}
          selected={answers[step.key] === opt.value}
          onPress={() => update({ [step.key]: opt.value })}
        />
      ));
    }

    if (step.type === 'multi') {
      const selected = answers[step.key] || [];
      const isSelectedValue = (opt) => {
        const isNone = opt.value === step.noneValue;
        return isNone
          ? selected.length === 0 && answers[step.key] !== undefined
          : selected.includes(opt.value);
      };
      const toggle = (opt) => {
        const isNone = opt.value === step.noneValue;
        if (isNone) {
          // Selecting "None" is mutually exclusive with every other
          // training option — it clears whatever else was picked, rather
          // than adding 'none' into the array alongside them. "None" isn't
          // actually stored as a value in the array at all; it's
          // represented by the array being empty (see isSelectedValue
          // above), which is also what makes selecting any real option
          // implicitly clear "None" for free, with no extra code needed
          // here.
          update({ [step.key]: [] });
          return;
        }
        const next = selected.includes(opt.value)
          ? selected.filter((v) => v !== opt.value)
          : [...selected, opt.value];
        update({ [step.key]: next });
      };

      // The training step shows four illustrated horizontal cards (Damon's
      // own supplied icon — already a pale-blue circle backdrop baked into
      // the image itself — on the left, label on the right) instead of the
      // plain text-only OptionCard every other 'multi' step still uses —
      // see the `layout` flag in data/quizQuestions.js and TRAINING_IMAGES
      // there for the actual pictures.
      if (step.layout === 'iconCards') {
        return (
          <View>
            {step.options.map((opt) => {
              const isSelected = isSelectedValue(opt);
              const source = TRAINING_IMAGES[opt.value];
              if (!source) {
                throw new Error(
                  `No image for training option "${opt.value}" — add it to TRAINING_IMAGES in data/quizQuestions.js`
                );
              }
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.trainingCard, isSelected && styles.trainingCardSelected]}
                  onPress={() => toggle(opt)}
                  activeOpacity={0.8}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={opt.label}
                >
                  <View style={styles.trainingIconWrap}>
                    <Image
                      source={source}
                      style={styles.trainingIconImage}
                      resizeMode="contain"
                      accessibilityElementsHidden
                      importantForAccessibility="no"
                    />
                  </View>
                  <Text
                    style={[styles.trainingLabel, isSelected && styles.trainingLabelSelected]}
                  >
                    {opt.label}
                  </Text>
                  {isSelected ? (
                    <View style={styles.trainingCheck}>
                      <Text style={styles.trainingCheckText}>✓</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        );
      }

      return step.options.map((opt) => (
        <OptionCard
          key={opt.value}
          label={opt.label}
          selected={isSelectedValue(opt)}
          onPress={() => toggle(opt)}
        />
      ));
    }

    if (step.type === 'bodyFat') {
      const sexKey = answers.sex === 'female' ? 'female' : 'male';
      const ranges = BODY_FAT_OPTIONS[sexKey];
      const images = BODY_FAT_IMAGES[sexKey];
      return (
        <View style={styles.bfGrid}>
          {ranges.map((rangeKey) => {
            // Fails loudly rather than silently showing a blank card — if
            // BODY_FAT_OPTIONS and BODY_FAT_IMAGES (data/quizQuestions.js)
            // ever get out of sync (a range added/renamed in one but not
            // the other), this is exactly the kind of bug that's easy to
            // miss visually until someone happens to land on that range.
            if (!images[rangeKey]) {
              throw new Error(
                `No body-fat reference image for ${sexKey} range "${rangeKey}" — add it to BODY_FAT_IMAGES in data/quizQuestions.js`
              );
            }
            return (
              <BodyFatCard
                key={rangeKey}
                rangeKey={rangeKey}
                image={images[rangeKey]}
                selected={answers.bodyFatRange === rangeKey}
                onPress={() => update({ bodyFatRange: rangeKey })}
              />
            );
          })}
        </View>
      );
    }

    // v0.4.5: one card with the dial, the unit switch and the mascot at a
    // stadiometer -- see HeightCard above for how it fits together.
    if (step.type === 'height') {
      return (
        <HeightCard
          answers={answers}
          update={update}
          scene={MASCOT_SCENES[step.mascot] || MASCOT_SCENES.height}
          onSlidingStart={lockScroll}
          onSlidingComplete={unlockScroll}
        />
      );
    }

    if (step.type === 'weight') {
      // Reused for both the "weight" and "goalWeight" steps — goalWeight
      // stores into `goalWeightValue` (in whichever unit is already chosen)
      // instead of `weightKg`, since it isn't the user's current weight.
      const isGoalWeight = step.key === 'goalWeight';
      const isLb = answers.weightUnit === 'lb';
      const valueKey = isGoalWeight ? 'goalWeightValue' : isLb ? 'weightLb' : 'weightKg';
      // Rounded defensively — weightLb and goalWeightValue are always
      // already whole numbers by the time they land in `answers` (every
      // place that sets them rounds first), but weightKg can briefly hold
      // a lb->kg conversion's raw decimal (e.g. 69.399576) between when
      // you drag in lbs and when you actually switch the toggle to kg —
      // see the unit-toggle buttons below, which round it for real at that
      // point. Rounding again here just means this display can never show
      // a stray decimal even if that ever changes.
      const fallbackKg = defaultWeightForHeight(answers.heightCm);
      const currentDisplayValue = Math.round(
        answers[valueKey] ?? (isLb ? Math.round(kgToLb(fallbackKg)) : fallbackKg)
      );
      const goalRange = isGoalWeight ? goalWeightRange(answers) : null;
      const range = isGoalWeight
        ? { min: goalRange.displayMin, max: goalRange.displayMax }
        : isLb
        ? WEIGHT_LB_RANGE
        : WEIGHT_KG_RANGE;

      const handleChange = (v) => {
        const rounded = Math.round(v);
        if (isGoalWeight) {
          update({ goalWeightValue: rounded });
        } else if (isLb) {
          update({ weightLb: rounded, weightKg: lbToKg(rounded) });
          // The user just dragged the actual "weight" slider themselves —
          // this is no longer an auto-computed default, so stop syncing it
          // to height (see the useEffect above) even if they go back and
          // change their height afterward.
          setWeightIsDefault(false);
        } else {
          update({ weightKg: rounded });
          setWeightIsDefault(false);
        }
      };

      // The info panel below the ruler matches whichever unit is currently
      // toggled on (same as the big number above the ruler) — currentDisplayValue
      // and goalRange.currentWeightDisplay are both already expressed in
      // that unit, so no kg/lb conversion is needed here.
      const unitLabel = isLb ? 'lbs' : 'kg';
      const goalDelta = isGoalWeight ? Math.abs(currentDisplayValue - goalRange.currentWeightDisplay) : null;

      // Shared by both the "weight" and "goalWeight" steps' unit-toggle
      // buttons. weightKg is always the canonical source of truth for
      // current weight, so switching to lb always recomputes weightLb
      // fresh from it (rounded), and switching to kg always rounds
      // weightKg itself (it can hold a raw decimal from a prior lb-mode
      // drag — see the comment on currentDisplayValue above). On the
      // goalWeight step, goalWeightValue also gets converted+rounded into
      // the new unit, so "your target" keeps meaning the same real weight
      // across the switch instead of keeping its old number in a new
      // unit. The no-op guard means pressing the already-active button
      // can't quietly perturb anything through a pointless round trip.
      const switchWeightUnit = (unit) => {
        if (unit === answers.weightUnit) return;
        const patch = { weightUnit: unit };
        if (unit === 'lb') {
          patch.weightLb = Math.round(kgToLb(answers.weightKg));
          if (isGoalWeight && answers.goalWeightValue != null) {
            patch.goalWeightValue = Math.round(kgToLb(answers.goalWeightValue));
          }
        } else {
          patch.weightKg = Math.round(answers.weightKg);
          if (isGoalWeight && answers.goalWeightValue != null) {
            patch.goalWeightValue = Math.round(lbToKg(answers.goalWeightValue));
          }
        }
        update(patch);
      };

      // v0.4.6: the main weight question is the height page's card with
      // the scale artwork -- see DialCard. goalWeight keeps the ruler:
      // it is a different question (a target, with your current weight
      // marked on the scale beside it) and has no mockup of its own.
      if (!isGoalWeight && step.layout === 'dialCard') {
        return (
          <WeightCard
            answers={answers}
            value={clampTo(currentDisplayValue, range)}
            range={range}
            onChange={handleChange}
            switchUnit={switchWeightUnit}
            scene={MASCOT_SCENES[step.mascot] || MASCOT_SCENES.weight}
            onSlidingStart={lockScroll}
            onSlidingComplete={unlockScroll}
          />
        );
      }

      return (
        <View>
          <View style={styles.unitToggle}>
            <TouchableOpacity
              style={[styles.unitBtn, isLb && styles.unitBtnActive]}
              onPress={() => switchWeightUnit('lb')}
            >
              <Text style={[styles.unitBtnText, isLb && styles.unitBtnTextActive]}>lbs</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitBtn, !isLb && styles.unitBtnActive]}
              onPress={() => switchWeightUnit('kg')}
            >
              <Text style={[styles.unitBtnText, !isLb && styles.unitBtnTextActive]}>kg</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.bigValue}>
            {currentDisplayValue} {isLb ? 'lbs' : 'kg'}
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={range.min}
            maximumValue={range.max}
            valueMin={isGoalWeight ? goalRange.selectMin : undefined}
            valueMax={isGoalWeight ? goalRange.selectMax : undefined}
            step={1}
            value={currentDisplayValue}
            minimumTrackTintColor="#4f8ef7"
            onValueChange={handleChange}
            onSlidingStart={lockScroll}
            onSlidingComplete={unlockScroll}
            markValue={isGoalWeight ? goalRange.currentWeightDisplay : undefined}
            markLabel={isGoalWeight ? 'Current weight' : undefined}
            valueLabel={isGoalWeight ? 'Target weight' : undefined}
          />
          {isGoalWeight ? (
            <View style={styles.infoPanel}>
              <Text style={styles.infoPanelText}>
                Current Weight: {goalRange.currentWeightDisplay} {unitLabel}
              </Text>
              <Text style={styles.infoPanelText}>
                Target Weight: {currentDisplayValue} {unitLabel}
              </Text>
              <Text style={[styles.infoPanelText, styles.infoPanelTextLast]}>
                {goalDelta} {unitLabel} to {answers.goal === 'gain' ? 'gain' : 'lose'}
              </Text>
            </View>
          ) : (
            <View style={styles.infoPanel}>
              <Text style={[styles.infoPanelText, styles.infoPanelTextLast]}>
                Weight: {currentDisplayValue} {unitLabel}
              </Text>
            </View>
          )}
        </View>
      );
    }

    return null;
  };

  const subtitle = step.getSubtitle ? step.getSubtitle(answers, QUESTION_HELPERS) : step.subtitle;

  // --- The two intro pages (v0.4.0) ------------------------------------
  //
  // Its own frame, because it shares almost nothing with a question: no
  // progress bar, no title, no Back/Next pair -- a speech bubble, the
  // mascot, and one full-width button.
  //
  // WHY BOTH PAGES COME THROUGH HERE. The mascot has to keep waving
  // across the page change rather than restarting, and the only way to
  // promise that is for React to see the same <Mascot> in the same place
  // in the tree before and after. So the two pages differ by the text in
  // the bubble and whether the input slot is filled -- never by the shape
  // of the tree around the mascot. The `{step.input ? ... : null}` below
  // is load-bearing for that reason: a null child still holds its slot,
  // where an `&&` that collapsed the element away would shift the
  // mascot's index and remount it.
  if (step.type === 'mascotIntro') {
    const value = answers[step.key] || '';
    return (
      // The name field is a few points above the button that dismisses
      // it, so on iOS the keyboard would cover both. Squeezing the page
      // instead costs the mascot some height and keeps Next reachable.
      <KeyboardAvoidingView
        style={styles.introRoot}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Same texture as every other screen, just more of it -- this
            page is mostly background, so three blobs would read as three
            stray circles rather than as a pattern. */}
        <View pointerEvents="none" style={styles.introBlobs}>
          <View style={[styles.introBlob, styles.introBlobA]} />
          <View style={[styles.introBlob, styles.introBlobB]} />
          <View style={[styles.introBlob, styles.introBlobC]} />
          <View style={[styles.introBlob, styles.introBlobD]} />
          <View style={[styles.introBlob, styles.introBlobE]} />
        </View>

        <View style={styles.introTop}>
          {onCancel ? (
            <TouchableOpacity
              style={styles.introBack}
              onPress={goBack}
              accessibilityRole="button"
              accessibilityLabel={stepIndex === 0 ? 'Cancel' : 'Back'}
            >
              <MaterialCommunityIcons
                name={stepIndex === 0 ? 'close' : 'chevron-left'}
                size={22}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>
          ) : null}

          <View style={styles.bubbleWrap}>
            <View style={styles.bubble}>
              {step.bubble.map((line) => (
                <Text key={line} style={styles.bubbleText}>
                  {line}
                </Text>
              ))}
            </View>
            <View style={styles.bubbleTail} />
          </View>

          {step.input ? (
            <View style={styles.nameCard}>
              <MaterialCommunityIcons
                name={step.input.icon || 'account-outline'}
                size={26}
                color={COLORS.text}
                style={styles.nameIcon}
              />
              <View style={styles.nameFields}>
                <Text style={styles.nameLabel}>{step.input.label}</Text>
                <TextInput
                  style={styles.nameInput}
                  value={value}
                  onChangeText={(t) => update({ [step.key]: t })}
                  placeholder={step.input.placeholder}
                  placeholderTextColor={COLORS.textFaint}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="done"
                  maxLength={40}
                  onSubmitEditing={() => { if (isAnswered()) goNext(); }}
                  accessibilityLabel={step.input.label}
                />
              </View>
            </View>
          ) : null}
        </View>

        {/* The stage. Everything here is decoration except the mascot:
            a pale disc behind him and an ellipse under his feet, which
            together stop him floating on a flat field. */}
        <View style={styles.introStage}>
          <View pointerEvents="none" style={styles.introGlow} />
          <View pointerEvents="none" style={styles.introGround} />
          <Mascot key="quiz-intro-mascot" source={MASCOT_WAVE_BIG} style={styles.introMascot} />
        </View>

        <TouchableOpacity
          style={[styles.introNext, !isAnswered() && styles.introNextDisabled]}
          onPress={goNext}
          disabled={!isAnswered()}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Next"
        >
          <Text style={styles.introNextText}>Next</Text>
          <MaterialCommunityIcons name="arrow-right" size={22} color="#fff" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    );
  }

  const isLast = stepIndex === visibleSteps.length - 1;

  return (
    <View style={styles.container}>
      {/* One dash per question rather than one filling bar (v0.4.1).
          Same information; a count you can read at a glance instead of a
          proportion you have to estimate. */}
      <View style={styles.dashRow}>
        {Array.from({ length: questionCount }, (_, i) => (
          <View key={i} style={[styles.dash, i < questionNumber && styles.dashDone]} />
        ))}
      </View>
      <Text style={styles.progressLabel}>
        STEP {questionNumber} OF {questionCount}
      </Text>

      <ScrollView
        style={styles.scroll}
        // Full-bleed, with the page's side margin moved inside it
        // (v0.4.7). Everything lands exactly where it did -- the content
        // box is the same width -- but what hangs off the side of the
        // content, like the mascot leaning in on the body-fat page, is
        // now cut off by the edge of the SCREEN rather than 16pt short
        // of it.
        contentContainerStyle={{ paddingHorizontal: SPACE.screen, paddingBottom: 24 }}
        scrollEnabled={!scrollLocked}
        showsVerticalScrollIndicator={false}
      >
        {/* The question either comes out of the mascot's mouth or sits as
            a plain title, depending on whether this step has been
            redesigned yet. Both render the same words. peekCards is the
            exception: its bubble is part of its own composition, drawn
            by the layout itself, so nothing goes here. A 'solo' bubble
            (v0.4.5) stands on its own at the top, its tail pointing down
            at the card where the mascot is. */}
        {step.layout === 'peekCards' ? null : step.bubble && step.bubbleLayout === 'solo' ? (
          <View style={[styles.soloHead, step.bubbleMascot && styles.soloHeadTall]}>
            {/* Texture, same family as the other pages' blobs: a dome
                rising from behind the card, and a few dots. The two on
                the right make way when he is leaning in over there. */}
            <View pointerEvents="none" style={styles.soloDecor}>
              <View style={styles.soloDome} />
              <View style={[styles.soloDot, { width: 46, height: 46, top: -20, left: '30%' }]} />
              <View style={[styles.soloDot, { width: 12, height: 12, top: -2, left: '68%' }]} />
              {step.bubbleMascot ? null : (
                <>
                  <View style={[styles.soloDot, { width: 28, height: 28, top: -14, right: 10 }]} />
                  <View style={[styles.soloDot, styles.soloDotDeep, { width: 12, height: 12, top: 56, right: 38 }]} />
                </>
              )}
            </View>

            {/* He leans in over the top-right corner, behind the bubble
                and past the edge of the page. The artwork is drawn cut
                off on its right-hand side, which is why it hangs over
                that edge -- see soloMascot and CORNER_GEOMETRY. */}
            {step.bubbleMascot && MASCOT_SCENES[step.bubbleMascot] ? (
              <>
                {/* Both marks sit ABOVE the bubble's top edge: beside it
                    there is only a few points between the bubble and his
                    crown, and anything put there is behind the bubble. */}
                <View pointerEvents="none" style={[styles.soloSpark, { right: 74, bottom: 133, transform: [{ rotate: '-55deg' }] }]} />
                <View pointerEvents="none" style={[styles.soloSpark, { right: 92, bottom: 119, transform: [{ rotate: '-20deg' }] }]} />
                <Mascot source={MASCOT_SCENES[step.bubbleMascot]} style={styles.soloMascot} />
              </>
            ) : null}

            <View style={styles.soloBubble}>
              {step.bubble.map((line) => (
                <Text key={line} style={styles.askText}>
                  {line}
                </Text>
              ))}
              {subtitle ? <Text style={styles.soloSub}>{subtitle}</Text> : null}
            </View>
            {step.bubbleMascot ? null : <View style={styles.soloTail} />}
          </View>
        ) : step.bubble ? (
          <View style={styles.askRow}>
            <View style={styles.askBlobWrap}>
              <View pointerEvents="none" style={styles.askBlob} />
              {step.mascot && MASCOT_SCENES[step.mascot] ? (
                <Mascot source={MASCOT_SCENES[step.mascot]} style={styles.askMascot} />
              ) : null}
            </View>
            <View style={styles.askBubbleWrap}>
              <View style={styles.askTail} />
              <View style={styles.askBubble}>
                {step.bubble.map((line) => (
                  <Text key={line} style={styles.askText}>
                    {line}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        ) : (
          // A plain title. `bigTitle` (v0.4.9) is the goal page's
          // version of it: the same words, twice the size, with a few
          // pale circles behind them instead of a mascot.
          <View style={[styles.titleWrap, step.bigTitle && styles.titleWrapBig]}>
            {step.bigTitle ? (
              <View pointerEvents="none" style={styles.titleDecor}>
                <View style={[styles.titleBlob, { width: 96, height: 96, top: -18, right: 10 }]} />
                <View style={[styles.titleBlob, { width: 44, height: 44, top: 36, right: 120 }]} />
                <View style={[styles.soloDot, { width: 20, height: 20, top: 2, right: 92 }]} />
                <View style={[styles.soloDot, { width: 26, height: 26, top: 60, right: 16 }]} />
              </View>
            ) : null}
            <Text style={[styles.title, step.bigTitle && styles.titleBig]}>{step.title}</Text>
          </View>
        )}
        {/* A solo bubble carries its own subtitle inside it (v0.4.7), so
            it must not also be drawn under the header. */}
        {subtitle && step.bubbleLayout !== 'solo' ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {renderStepBody()}
      </ScrollView>

      <View style={styles.navRow}>
        <TouchableOpacity style={styles.backBtn} onPress={goBack} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>{stepIndex === 0 ? 'Cancel' : 'Back'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextBtn, !isAnswered() && styles.nextBtnDisabled]}
          onPress={goNext}
          disabled={!isAnswered()}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>{isLast ? 'See My Plan' : 'Next'}</Text>
          {isLast ? null : <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />}
        </TouchableOpacity>
      </View>

      {learnMoreDietValue ? (
        <DietDetailModal
          diet={{
            value: learnMoreDietValue,
            label: QUIZ_STEPS.find((s) => s.key === 'diet').options.find(
              (o) => o.value === learnMoreDietValue
            ).label,
            image: DIET_IMAGES[learnMoreDietValue],
            ...DIET_DETAILS[learnMoreDietValue],
          }}
          onClose={() => setLearnMoreDietValue(null)}
          onChoose={() => {
            update({ diet: learnMoreDietValue });
            setLearnMoreDietValue(null);
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // --- The mascot intro pages (v0.4.0) ---------------------------------
  //
  // The one part of this screen drawn from utils/theme rather than the
  // hard-coded blues the rest of the quiz still uses. New surface, so it
  // starts on the system the redesigned screens are already on instead
  // of inheriting colours that are on their way out.
  introRoot: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: SPACE.screen,
    paddingBottom: 24,
  },
  introBlobs: { ...StyleSheet.absoluteFillObject },
  introBlob: { position: 'absolute', backgroundColor: COLORS.blob, borderRadius: RADIUS.pill },
  // The big sweep down the right-hand side. Far larger than the frame and
  // pushed mostly off it, so what shows is one long curve rather than a
  // circle -- the same trick the Today header uses, at page scale.
  introBlobA: { width: 520, height: 900, top: -120, right: -260 },
  introBlobB: { width: 96, height: 96, top: 96, left: 8 },
  introBlobC: { width: 46, height: 46, top: 176, left: 78 },
  introBlobD: { width: 74, height: 74, top: '44%', right: 18 },
  introBlobE: { width: 34, height: 34, top: '50%', right: 96 },

  introTop: { paddingTop: 10 },
  introBack: { position: 'absolute', top: 6, left: -6, padding: 10, zIndex: 3 },

  // Bubble and tail share a width so the card on page two lines up with
  // the bubble above it rather than floating a few points off.
  bubbleWrap: { alignSelf: 'flex-end', width: '84%', alignItems: 'flex-start', marginTop: 46 },
  bubble: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.card,
    borderRadius: 26,
    paddingVertical: 16,
    paddingHorizontal: 22,
    shadowColor: '#152a4a',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  bubbleText: { fontSize: 25, lineHeight: 32, fontWeight: '800', color: COLORS.text },
  // A drawn triangle rather than a rotated square: the point stays sharp
  // and it cannot show a corner of the square poking out the side.
  bubbleTail: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderLeftWidth: 13,
    borderRightWidth: 13,
    borderTopWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.card,
    marginLeft: 54,
    marginTop: -1,
  },

  nameCard: {
    alignSelf: 'flex-end',
    width: '84%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 6,
    shadowColor: '#152a4a',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  nameIcon: { marginTop: 2 },
  nameFields: { flex: 1 },
  nameLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 0.6, color: COLORS.text },
  // paddingVertical 0 plus an explicit height: Android's TextInput adds
  // its own padding that would push the card taller than the mockup's.
  nameInput: { fontSize: 19, color: COLORS.text, paddingVertical: 0, height: 28 },

  // Everything below the bubble and above the button belongs to him.
  introStage: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', marginTop: 10 },
  introGlow: {
    position: 'absolute',
    width: '104%',
    aspectRatio: 1,
    bottom: 34,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.blob,
    opacity: 0.6,
  },
  introGround: {
    position: 'absolute',
    bottom: 24,
    width: '68%',
    height: 26,
    borderRadius: RADIUS.pill,
    backgroundColor: '#d7e3f6',
    opacity: 0.85,
  },
  // Overrides every number components/Mascot.js sets for the corner --
  // its width, height, alignSelf and both negative margins. Anything
  // left out would leak the 108pt corner geometry onto this page.
  introMascot: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    marginTop: 0,
    marginRight: 0,
  },

  introNext: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 58,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    marginTop: 16,
  },
  introNextDisabled: { opacity: 0.4 },
  introNextText: { color: '#fff', fontSize: 21, fontWeight: '800' },

  // v0.4.1 moved this screen onto utils/theme, same as the intro pages.
  // The old #f7f7fa was a near-white the rest of the app has left behind.
  container: { flex: 1, backgroundColor: COLORS.bg, padding: SPACE.screen },
  dashRow: { flexDirection: 'row', gap: 5, marginTop: 8 },
  dash: { flex: 1, height: 7, borderRadius: RADIUS.pill, backgroundColor: '#dbe3f0' },
  dashDone: { backgroundColor: COLORS.accent },
  progressLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: COLORS.textSoft,
    marginTop: 10,
    marginBottom: 8,
  },

  // --- the mascot asking the question (v0.4.1) -------------------------
  askRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 18 },
  askBlobWrap: { width: '42%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  // Lopsided corner radii instead of a circle: four different values
  // read as a hand-drawn blob, which is what the mockup has, and cost
  // nothing next to shipping an SVG for it.
  askBlob: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.blob,
    borderTopLeftRadius: 110,
    borderTopRightRadius: 84,
    borderBottomLeftRadius: 92,
    borderBottomRightRadius: 120,
    transform: [{ rotate: '-8deg' }],
  },
  // Overrides every number components/Mascot.js sets for the corner.
  askMascot: { width: '86%', height: '86%', alignSelf: 'center', marginTop: 0, marginRight: 0 },

  askBubbleWrap: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  // Points left, at the mascot -- the intro pages' tail points down at
  // the input, so the two are built the same way with different borders.
  askTail: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderTopWidth: 12,
    borderBottomWidth: 12,
    borderRightWidth: 16,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: COLORS.card,
    marginRight: -1,
    marginTop: 26,
  },
  askBubble: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: '#152a4a',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  askText: { fontSize: 24, lineHeight: 30, fontWeight: '800', color: COLORS.text },

  // --- peekCards: the mascot over two tall cards (v0.4.3/v0.4.4) -------
  // The hand layer is positioned against this box.
  peekWrap: { marginTop: 4, position: 'relative' },
  // Layers 1, 2 and 5. Height is set inline from the measured width, so
  // that its bottom edge IS the line where the cards cross his paws. No
  // zIndex or elevation: the body belongs behind the cards.
  peekStage: {},
  peekBlob: {
    position: 'absolute',
    top: 18,
    left: '14%',
    width: '66%',
    height: 196,
    backgroundColor: COLORS.blob,
    borderTopLeftRadius: 120,
    borderTopRightRadius: 100,
    borderBottomLeftRadius: 90,
    borderBottomRightRadius: 110,
  },
  peekDot: { position: 'absolute', borderRadius: RADIUS.pill, backgroundColor: '#d6e6fb' },
  // The excitement marks by his face: short, round-ended, accent blue.
  peekSpark: {
    position: 'absolute',
    width: 16,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
    opacity: 0.55,
  },
  peekBody: { position: 'absolute', marginTop: 0, marginRight: 0, alignSelf: 'auto' },
  peekBubbleWrap: { position: 'absolute', top: 0, right: 0, width: '39%', alignItems: 'flex-start' },
  peekBubble: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.card,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#152a4a',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  peekTail: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.card,
    marginLeft: 40,
    marginTop: -1,
    transform: [{ rotate: '18deg' }],
  },

  // Layer 3. Starts exactly where the stage ends -- the card edge line.
  peekRow: { flexDirection: 'row', gap: 8, zIndex: 1 },
  // Layer 4, over the cards. elevation is for Android's draw order only;
  // with no background there is no shadow to cast.
  peekHands: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 3, elevation: 10 },
  peekHandImg: { width: '100%', height: '100%' },
  peekCardHit: { flex: 1 },
  // Fixed height: the hand riding this card moves by exactly how far its
  // top edge moves, which depends on the height (see PEEK_EDGE_LIFT).
  peekCard: {
    height: PEEK_CARD_H,
    backgroundColor: '#f7f9fd',
    borderRadius: 26,
    padding: 10,
    shadowColor: '#152a4a',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  // The two layers that fade in on selection. Absolutely placed, so they
  // add no size and the card does not reflow when they appear.
  peekGlow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 32,
    backgroundColor: 'rgba(47,128,240,0.14)',
  },
  peekBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 26,
    borderWidth: 2.5,
    borderColor: COLORS.accent,
  },
  peekInner: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    overflow: 'hidden',
  },
  peekInnerTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(47,128,240,0.06)' },
  // Empty ring and filled check share a spot; the check fades in over it.
  peekRadio: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#cfd6e3',
  },
  peekCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  peekIconDisc: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e2edfc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  peekSymbol: { fontSize: 50, lineHeight: 58, fontWeight: '700', color: COLORS.text },
  peekLabel: { fontSize: 21, fontWeight: '800', color: COLORS.text },
  peekHint: { fontSize: 15, color: COLORS.textSoft, textAlign: 'center', marginTop: 22 },

  // --- the solo bubble (v0.4.5) ------------------------------------------
  // marginTop leaves room for the dot that peeks over the bubble's top.
  soloHead: { marginTop: 24, marginBottom: 4 },
  // A little more room above the bubble when he is leaning in over it,
  // so his crown clears its top edge instead of being cut off by the top
  // of the scroll area.
  soloHeadTall: { marginTop: 34 },
  soloDecor: { ...StyleSheet.absoluteFillObject },
  // Far bigger than the space it shows in: only its top rises between
  // the bubble and the card, and the card is drawn over the rest.
  soloDome: {
    position: 'absolute',
    top: 26,
    right: -44,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: COLORS.blob,
  },
  soloDot: { position: 'absolute', borderRadius: RADIUS.pill, backgroundColor: '#e2ebfa' },
  soloDotDeep: { backgroundColor: '#d3e2f8' },
  // Leaning in over the corner. Overrides every number
  // components/Mascot.js sets for the corner mascot on the Today screen.
  //
  // The 22pt overhang is the whole trick: the artwork is cut off flush
  // with its own right-hand side (see CORNER_GEOMETRY in brandArt), the
  // scroll area is full-bleed, and 16pt of that overhang is the page's
  // side margin -- so the cut lands 6pt beyond the screen and never
  // shows. His height follows the art's own ratio, and is as tall as
  // fits between the top of the scroll area and the bubble on a 393pt
  // phone. Bigger text grows the bubble downwards, which moves him down
  // with it rather than cropping him.
  soloMascot: {
    position: 'absolute',
    right: -22,
    bottom: -4,
    width: CORNER_MASCOT_W,
    height: CORNER_MASCOT_W / CORNER_GEOMETRY.aspect,
    alignSelf: 'auto',
    marginTop: 0,
    marginRight: 0,
  },
  soloSpark: {
    position: 'absolute',
    width: 16,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
    opacity: 0.55,
  },
  soloSub: { fontSize: 15, lineHeight: 19, color: COLORS.textSoft, marginTop: 6 },
  // Hugs its one line of text rather than stretching across the page.
  soloBubble: {
    alignSelf: 'flex-start',
    maxWidth: '84%',
    backgroundColor: COLORS.card,
    borderRadius: 26,
    paddingVertical: 14,
    paddingHorizontal: 22,
    shadowColor: '#152a4a',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  // Tipped 30deg so it points down and to the left, starting inside the
  // bubble so the turned base never shows as an edge below it.
  soloTail: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderTopWidth: 24,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.card,
    marginLeft: 26,
    marginTop: -8,
    transform: [{ rotate: '30deg' }],
  },

  // --- the height card (v0.4.5) -----------------------------------------
  // Height is set inline from HC_CARD_H; every child is placed absolutely
  // from the HC_ numbers, which is what keeps the line on the pill.
  hcCard: {
    backgroundColor: '#f8fafd',
    borderRadius: 24,
    borderWidth: HC_BORDER,
    borderColor: '#e9eef7',
    shadowColor: '#152a4a',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  hcHalo: { position: 'absolute', backgroundColor: COLORS.blob },
  hcDot: { position: 'absolute', borderRadius: RADIUS.pill, backgroundColor: '#dde8f9' },
  hcGround: {
    position: 'absolute',
    width: HC_GROUND_H,
    height: HC_GROUND_H,
    borderRadius: HC_GROUND_H / 2,
    backgroundColor: '#dfe9f8',
  },
  hcSpark: {
    position: 'absolute',
    width: HC_SPARK_LEN,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
    opacity: 0.6,
  },
  // Overrides every number components/Mascot.js sets for the corner.
  hcArt: { position: 'absolute', alignSelf: 'auto', marginTop: 0, marginRight: 0 },
  // No horizontal padding: the pill runs nearly edge to edge, as drawn.
  // The switch and the caption bring their own side margins instead.
  hcPanel: {
    position: 'absolute',
    left: HC_PAD,
    top: HC_PAD,
    paddingTop: HC_PANEL_TOP,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    shadowColor: '#152a4a',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  hcToggle: {
    height: HC_TOGGLE_H,
    marginHorizontal: 12,
    marginBottom: HC_TOGGLE_GAP,
    flexDirection: 'row',
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: '#d5e2f5',
    backgroundColor: COLORS.card,
    overflow: 'hidden',
  },
  hcToggleBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hcToggleBtnOn: { backgroundColor: COLORS.accent },
  hcToggleText: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  hcToggleTextOn: { color: '#fff' },
  hcDial: { width: '100%' },
  hcHint: {
    height: HC_HINT_H,
    marginTop: HC_HINT_GAP,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  hcHintText: { fontSize: 15, color: COLORS.textSoft },
  hcLine: { position: 'absolute', height: 2, zIndex: 3, elevation: 4 },
  // The end of the weight page's line: an open circle sitting beside the
  // scale's display, the way a callout on a diagram points at a part.
  hcRing: {
    position: 'absolute',
    width: HC_RING,
    height: HC_RING,
    borderRadius: HC_RING / 2,
    borderWidth: 2,
    borderColor: COLORS.accent,
    backgroundColor: COLORS.card,
    zIndex: 3,
    elevation: 4,
  },
  // The scale's display, drawn over the artwork's own. The colours are
  // the artwork's: the same blue face, the same near-black outline.
  hcScreen: {
    position: 'absolute',
    backgroundColor: '#0093fc',
    borderColor: '#0b1f44',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 2,
    elevation: 3,
  },
  hcScreenText: { color: '#eafbff', fontWeight: '800', letterSpacing: 0.4 },
  hcDash: {
    position: 'absolute',
    top: 0,
    width: HC_DASH,
    height: 2,
    borderRadius: 1,
    backgroundColor: COLORS.accent,
  },
  hcInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 20,
    minHeight: 56,
    paddingVertical: 7,
    paddingHorizontal: 16,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    shadowColor: '#152a4a',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  hcInfoDisc: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#e2edfc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hcInfoText: { fontSize: 18, fontWeight: '800', color: COLORS.text },

  // --- the dial's card -------------------------------------------------
  dialCard: {
    backgroundColor: '#fbfcfe',
    borderRadius: RADIUS.card,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#152a4a',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  dialSlider: { width: '100%' },
  dialHint: { fontSize: 15, color: COLORS.textSoft, marginTop: 8 },
  scroll: { flex: 1, marginHorizontal: -SPACE.screen },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', marginBottom: 6, marginTop: 8 },
  // The wrapper exists for the pale circles behind a big title; it adds
  // nothing of its own to the pages that still use the plain one.
  titleWrap: {},
  titleWrapBig: { marginTop: 4, marginBottom: 16 },
  titleDecor: { ...StyleSheet.absoluteFillObject },
  // Paler than the dots that go with a bubble: these sit under type,
  // where anything stronger reads as a box behind the words.
  titleBlob: { position: 'absolute', borderRadius: RADIUS.pill, backgroundColor: '#eaf1fb' },
  titleBig: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 0,
    marginBottom: 0,
  },
  subtitle: { fontSize: 15, color: '#777', marginBottom: 18 },
  bigValue: { fontSize: 33, fontWeight: '700', color: '#4f8ef7', textAlign: 'center', marginBottom: 8, marginTop: 16 },
  // No fixed height here on purpose — DragSlider now renders as a tall
  // vertical ruler with its own fixed internal height, and a height set
  // here would just clip it back down.
  slider: { width: '100%', marginBottom: 16 },
  option: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3e3e8',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  optionSelected: { backgroundColor: '#4f8ef7', borderColor: '#4f8ef7' },
  optionLabel: { fontSize: 17, fontWeight: '600', color: '#1a1a1a' },
  optionLabelSelected: { color: '#fff' },
  optionSub: { fontSize: 14, color: '#777', marginTop: 4 },
  optionSubSelected: { color: '#e6efff' },
  infoPanel: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3e3e8',
    borderRadius: 12,
    padding: 14,
  },
  infoPanelText: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 6 },
  infoPanelTextLast: { marginBottom: 0 },
  squareRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  squareOption: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3e3e8',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  squareOptionSymbol: { fontSize: 40, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  squareOptionLabel: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  // --- the goal page's cards (v0.4.9) -----------------------------------
  goalStack: {},
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 14,
    marginBottom: 12,
    borderRadius: 24,
    backgroundColor: COLORS.card,
    shadowColor: '#152a4a',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  // The art's own box: the oval is painted behind, and the badge and the
  // animation are placed inside it.
  goalArt: { width: GOAL_OVAL_W, height: GOAL_OVAL_H },
  goalOval: {
    position: 'absolute',
    left: 0,
    top: (GOAL_OVAL_H - GOAL_OVAL_W) / 2,
    width: GOAL_OVAL_W,
    height: GOAL_OVAL_W,
    borderRadius: GOAL_OVAL_W / 2,
    transform: [{ scaleY: GOAL_OVAL_H / GOAL_OVAL_W }],
  },
  goalBadge: {
    position: 'absolute',
    top: 2,
    alignSelf: 'center',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Overrides every number components/Mascot.js sets for the corner.
  goalPose: {
    position: 'absolute',
    bottom: 2,
    alignSelf: 'center',
    width: GOAL_POSE_W,
    height: GOAL_POSE_H,
    marginTop: 0,
    marginRight: 0,
  },
  goalPoseFlipped: { transform: [{ scaleX: -1 }] },
  goalText: { flex: 1, marginLeft: 14, paddingRight: 30 },
  goalLabel: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  goalSub: { fontSize: 16, color: COLORS.textMuted, marginTop: 4 },
  goalRadio: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2.5,
    borderColor: '#b9c2d6',
  },
  goalCheck: {
    position: 'absolute',
    top: 13,
    right: 13,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalTint: { ...StyleSheet.absoluteFillObject, borderRadius: 24, backgroundColor: 'rgba(47,128,240,0.06)' },
  goalBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: COLORS.accent,
  },
  // --- activityLevel step's illustrated horizontal cards — see the
  // 'activityCards' branch in renderStepBody above and ACTIVITY_IMAGES in
  // data/quizQuestions.js for the actual pictures. Sized generously (18px
  // padding, wide icon box) rather than just enough to fit the content, so
  // the four cards fill most of the screen instead of leaving a large
  // empty gap above the Back/Next buttons — same reasoning as SCALE_HEIGHT
  // above for the weightHistory step. activityIconBox is a landscape box
  // (not square, unlike imageCardSquare above) to match ACTIVITY_IMAGES'
  // own ~694x489 (~1.42:1) aspect ratio, so resizeMode="contain" doesn't
  // have to letterbox a big gap on the top/bottom of every icon. ---
  activityCard: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3e3e8',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  activityCardSelected: { backgroundColor: '#4f8ef7', borderColor: '#4f8ef7' },
  activityIconBox: { width: 108, height: 76, marginRight: 14 },
  activityIconImage: { width: '100%', height: '100%' },
  activityTextCol: { flex: 1, minWidth: 0 },
  activityTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  activityTitleSelected: { color: '#fff' },
  activityDesc: { fontSize: 14, color: '#777', lineHeight: 19, marginBottom: 10 },
  activityDescSelected: { color: '#e6efff' },
  activityBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eef4ff',
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  activityBadgeSelected: { backgroundColor: 'rgba(255,255,255,0.25)' },
  activityBadgeText: { fontSize: 12, fontWeight: '700', color: '#4f8ef7' },
  activityBadgeTextSelected: { color: '#fff' },
  activityCheck: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4f8ef7',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityCheckText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  // --- training step's illustrated horizontal cards — see the 'iconCards'
  // branch in the 'multi' step-type handling above and TRAINING_IMAGES in
  // data/quizQuestions.js for the actual pictures. Simpler than
  // activityCard above (no description/badge — just an icon and a label,
  // matching Damon's reference preview exactly) and reuses the same
  // touch-target-friendly padding and selected-state treatment. ---
  trainingCard: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3e3e8',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  trainingCardSelected: { backgroundColor: '#4f8ef7', borderColor: '#4f8ef7' },
  // The image itself already contains a pale-blue circular backdrop (see
  // TRAINING_IMAGES' own comment in data/quizQuestions.js), so this is
  // just a fixed-size square slot for it — no extra circle View needed.
  trainingIconWrap: { width: 64, height: 64, marginRight: 16 },
  trainingIconImage: { width: '100%', height: '100%' },
  trainingLabel: { flex: 1, fontSize: 17, fontWeight: '600', color: '#1a1a1a' },
  trainingLabelSelected: { color: '#fff' },
  trainingCheck: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4f8ef7',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trainingCheckText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  // --- diet step's illustrated cards — see the 'illustratedCards' layout
  // branch in renderStepBody. Icon sits at a fixed size on the left
  // (~25-30% of a typical card's width), title + short description +
  // Learn More stack in a flexible column on the right, matching the same
  // card/selected-state treatment (white -> blue, border, checkmark) used
  // by the activity and training cards above rather than inventing a new
  // visual style. ---
  dietCard: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3e3e8',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  dietCardSelected: { backgroundColor: '#4f8ef7', borderColor: '#4f8ef7' },
  dietIconWrap: { width: 84, height: 84, marginRight: 14 },
  dietIconImage: { width: '100%', height: '100%' },
  dietTextCol: { flex: 1 },
  dietTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  dietTitleSelected: { color: '#fff' },
  dietDesc: { fontSize: 14, color: '#666', lineHeight: 19 },
  dietDescSelected: { color: '#eaf1ff' },
  // A separate touchable from the card itself, so it can be tapped without
  // also selecting/deselecting the diet (see the comment above the
  // 'illustratedCards' branch in renderStepBody). Sized with its own
  // padding so it's a comfortable, unambiguous tap target next to the
  // description text rather than crowded right up against it.
  dietLearnMore: { alignSelf: 'flex-start', marginTop: 6, paddingVertical: 4, paddingRight: 4 },
  dietLearnMoreText: { fontSize: 14, fontWeight: '700', color: '#4f8ef7', textDecorationLine: 'underline' },
  dietLearnMoreTextSelected: { color: '#fff' },
  dietCheck: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4f8ef7',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dietCheckText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  // --- weightHistory step's vertical scale — see the 'weightScale' branch
  // in renderStepBody above. SCALE_HEIGHT/SCALE_ZONE_* (top of file) drive
  // both the line segments below and the tick positions, so they always
  // agree with each other regardless of screen size. ---
  scaleRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  // minHeight (not height) on the two bubble columns so a phone with
  // larger accessibility text, or an unusually long translated label,
  // simply grows the row instead of clipping — the scale line column next
  // to it stays exactly SCALE_HEIGHT regardless, since its geometry is
  // fixed pixel math, not content-driven.
  scaleLeftCol: { flex: 1, justifyContent: 'space-between', minHeight: SCALE_HEIGHT, gap: 10 },
  scaleRightCol: { flex: 1, justifyContent: 'center', alignItems: 'flex-start', minHeight: SCALE_HEIGHT },
  scaleBubbleRow: { flexDirection: 'row', alignItems: 'center' },
  scaleBubbleRowRight: { flexDirection: 'row', alignItems: 'center' },
  scaleBubbleWrap: { flex: 1, position: 'relative' },
  scaleBubble: { borderRadius: 12, borderWidth: 1, padding: 11 },
  scaleBubbleText: { fontSize: 14, fontWeight: '700', lineHeight: 18 },
  // Each tone's colors stay visible whether or not it's selected (per
  // Damon's spec — red/green/yellow carry meaning on their own); selecting
  // an option just deepens the same tint and thickens the border rather
  // than switching to the app's usual blue, so the semantic color is never
  // overridden the way optionSelected does elsewhere in this screen.
  scaleBubbleRed: { backgroundColor: '#fdeceb', borderColor: '#eeb6b1' },
  scaleBubbleTextRed: { color: '#c1483f' },
  scaleBubbleRedSelected: { backgroundColor: '#fbdad7', borderColor: '#e0554f', borderWidth: 2 },
  scaleBubbleTextRedSelected: { color: '#b6392f' },
  scaleBubbleGreen: { backgroundColor: '#eaf7f0', borderColor: '#a9dcc0' },
  scaleBubbleTextGreen: { color: '#2f8a5f' },
  scaleBubbleGreenSelected: { backgroundColor: '#d9f0e3', borderColor: '#3fa172', borderWidth: 2 },
  scaleBubbleTextGreenSelected: { color: '#256b49' },
  scaleBubbleYellow: { backgroundColor: '#fbf1de', borderColor: '#edcd8c' },
  scaleBubbleTextYellow: { color: '#a1791f' },
  scaleBubbleYellowSelected: { backgroundColor: '#f8e6b8', borderColor: '#d9a441', borderWidth: 2 },
  scaleBubbleTextYellowSelected: { color: '#8a6414' },
  scaleCheck: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scaleCheckRed: { backgroundColor: '#e0554f' },
  scaleCheckGreen: { backgroundColor: '#3fa172' },
  scaleCheckYellow: { backgroundColor: '#d9a441' },
  scaleCheckText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  scaleStub: { width: 16, height: 20, alignItems: 'center', justifyContent: 'center' },
  scaleStubLine: { width: 12, height: 2, borderRadius: 1 },
  scaleStubLineYellow: { backgroundColor: '#d9a441' },
  scaleStubLineGreen: { backgroundColor: '#3fa172' },
  // The "both" bubble's bracket — a red vertical bar spanning from the top
  // red zone's own center down to the bottom red zone's own center
  // (SCALE_TOP_ZONE_CENTER/SCALE_BOTTOM_ZONE_CENTER, top of file), with a
  // tick at each end reaching right into the scale line, plus a third tick
  // reaching left toward the "both" bubble at the gutter's own vertical
  // middle (which lines up with that bubble's row, since scaleLeftCol's
  // three rows are spaced evenly across this same SCALE_HEIGHT). All three
  // ticks and the bar share the same red as the scale's own outer zones,
  // so it's visually obvious this bracket is "reaching into the red."
  scaleGutter: { width: 22, height: SCALE_HEIGHT, position: 'relative' },
  scaleGutterBar: { position: 'absolute', left: 9, width: 2, backgroundColor: '#e0554f' },
  scaleGutterTick: { position: 'absolute', height: 2, backgroundColor: '#e0554f', borderRadius: 1 },
  scaleLineCol: { width: 88, height: SCALE_HEIGHT, position: 'relative' },
  scaleSeg: { position: 'absolute', left: '50%', marginLeft: -3, width: 6 },
  scaleSegTop: {
    top: 0,
    height: SCALE_ZONE_TOP,
    backgroundColor: '#ecb3ae',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  scaleSegMid: { top: SCALE_ZONE_TOP, height: SCALE_ZONE_MID, backgroundColor: '#8fd1ac' },
  scaleSegBottom: {
    top: SCALE_ZONE_TOP + SCALE_ZONE_MID,
    height: SCALE_ZONE_BOTTOM,
    backgroundColor: '#ecb3ae',
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  // Plain triangles via the border trick (width/height 0, three sides
  // transparent, one side colored) — no image or SVG needed. Matches
  // scaleSegTop/Bottom's own color so each arrowhead reads as a
  // continuation of the zone it caps.
  scaleArrowUp: {
    position: 'absolute',
    left: '50%',
    marginLeft: -7,
    width: 0,
    height: 0,
    top: -9,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#ecb3ae',
  },
  scaleArrowDown: {
    position: 'absolute',
    left: '50%',
    marginLeft: -7,
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#ecb3ae',
  },
  scaleTick: {
    position: 'absolute',
    left: '50%',
    marginLeft: -9,
    width: 18,
    height: 2,
    backgroundColor: '#6b6b6b',
    borderRadius: 1,
  },
  scaleTickLabel: {
    position: 'absolute',
    left: '50%',
    marginLeft: 14,
    fontSize: 13,
    fontWeight: '700',
    color: '#4a4a4a',
  },
  // Shorter and lighter than scaleTick/scaleTickLabel above, on purpose —
  // these are supporting detail, not additional anchors the eye should
  // land on first.
  scaleMinorTick: {
    position: 'absolute',
    left: '50%',
    marginLeft: -5,
    width: 10,
    height: 1.5,
    backgroundColor: '#b7b7bf',
    borderRadius: 1,
  },
  scaleMinorLabel: {
    position: 'absolute',
    left: '50%',
    marginLeft: 10,
    fontSize: 11,
    fontWeight: '600',
    color: '#9a9aa2',
  },
  unitToggle: { flexDirection: 'row', alignSelf: 'center', backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e3e3e8', marginBottom: 8, overflow: 'hidden' },
  unitBtn: { paddingHorizontal: 18, paddingVertical: 8 },
  unitBtnActive: { backgroundColor: '#4f8ef7' },
  unitBtnText: { fontSize: 15, fontWeight: '600', color: '#555' },
  unitBtnTextActive: { color: '#fff' },
  // --- the body-fat grid (v0.4.7) ---------------------------------------
  bfGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 2 },
  bfHit: { width: '48.6%', marginBottom: 10 },
  bfCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingTop: 8,
    paddingBottom: 8,
    alignItems: 'center',
    shadowColor: '#152a4a',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  // The picture sits on its own pale tile rather than on the card, which
  // is what keeps eight different photographs looking like one set.
  // aspectRatio, not a fixed height, so the tiles keep their shape on
  // every phone; the picture is contained inside, never cropped.
  bfTile: {
    width: '53%',
    aspectRatio: 0.69,
    borderRadius: 14,
    backgroundColor: '#e6f0fd',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bfImage: { width: '100%', height: '100%' },
  bfLabel: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 4 },
  // Empty ring and filled check share a spot; the check fades in over it.
  bfRadio: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#bcd6f6',
  },
  bfCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bfTint: { ...StyleSheet.absoluteFillObject, borderRadius: 20, backgroundColor: 'rgba(47,128,240,0.06)' },
  bfBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: COLORS.accent,
  },
  navRow: { flexDirection: 'row', paddingTop: 14, gap: 12 },
  backBtn: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
  },
  backBtnText: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  nextBtn: {
    flex: 1.4,
    height: 56,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accent,
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { fontSize: 18, fontWeight: '800', color: '#fff' },
});
