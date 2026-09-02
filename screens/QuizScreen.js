import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Slider from '../components/DragSlider';
import DietDetailModal from '../components/DietDetailModal';
import {
  QUIZ_STEPS,
  BODY_FAT_OPTIONS,
  BODY_FAT_IMAGES,
  GOAL_IMAGES,
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
export default function QuizScreen({ onComplete, onCancel, initialAnswers, initialStepIndex }) {
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
    () => QUIZ_STEPS.filter((s) => !s.condition || s.condition(answers)),
    [answers.goal]
  );
  const step = visibleSteps[stepIndex];

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
      return (
        <View>
          <Text style={styles.bigValue}>
            {value} {step.unitLabel}
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={step.min}
            maximumValue={step.max}
            step={step.step}
            value={value}
            minimumTrackTintColor="#4f8ef7"
            onValueChange={(v) => update({ [step.key]: Math.round(v) })}
            onSlidingStart={lockScroll}
            onSlidingComplete={unlockScroll}
          />
        </View>
      );
    }

    if (step.type === 'single') {
      const options = step.getOptions ? step.getOptions(answers, QUESTION_HELPERS) : step.options;

      // A couple of steps (currently just "sex") ask for this to be shown
      // as a row of big square boxes instead of the usual stacked list —
      // see the `layout` flag in data/quizQuestions.js.
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

      // The goal step shows three square icon tiles stacked vertically
      // instead of plain text — see the `layout` flag and GOAL_IMAGES in
      // data/quizQuestions.js. Each tile is small enough (unlike the
      // original full-width portrait "card" images) that all three still
      // fit on one screen with no scrolling. These icon images don't have
      // any text baked in, so the label is rendered separately below each
      // tile here. Selection can't be shown by recoloring the image itself
      // (each icon already has its own fixed theme color), so it's shown
      // externally instead: a blue ring around the tile plus a checkmark
      // badge in the corner, same scheme as before.
      if (step.layout === 'imageCards') {
        return (
          <View style={styles.imageCardStack}>
            {options.map((opt) => {
              const selected = answers[step.key] === opt.value;
              const source = GOAL_IMAGES[opt.value];
              if (!source) {
                throw new Error(
                  `No image for goal option "${opt.value}" — add it to GOAL_IMAGES in data/quizQuestions.js`
                );
              }
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={styles.imageCardTile}
                  onPress={() => update({ [step.key]: opt.value })}
                  activeOpacity={0.8}
                >
                  <View style={[styles.imageCardSquare, selected && styles.imageCardSquareSelected]}>
                    <Image source={source} style={styles.imageCardPicture} resizeMode="contain" />
                    {selected ? (
                      <View style={styles.imageCardCheck}>
                        <Text style={styles.imageCardCheckText}>✓</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={[styles.imageCardLabel, selected && styles.imageCardLabelSelected]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
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
        <View style={styles.bodyFatGrid}>
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
              <TouchableOpacity
                key={rangeKey}
                style={[styles.bodyFatCard, answers.bodyFatRange === rangeKey && styles.optionSelected]}
                onPress={() => update({ bodyFatRange: rangeKey })}
                activeOpacity={0.7}
              >
                <Image source={images[rangeKey]} style={styles.bodyFatImage} resizeMode="contain" />
                <Text
                  style={[
                    styles.bodyFatLabel,
                    answers.bodyFatRange === rangeKey && styles.optionLabelSelected,
                  ]}
                >
                  {rangeKey}%
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    if (step.type === 'height') {
      const isCm = answers.heightUnit === 'cm';
      return (
        <View>
          <View style={styles.unitToggle}>
            <TouchableOpacity
              style={[styles.unitBtn, !isCm && styles.unitBtnActive]}
              onPress={() => update({ heightUnit: 'ftin' })}
            >
              <Text style={[styles.unitBtnText, !isCm && styles.unitBtnTextActive]}>ft + in</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitBtn, isCm && styles.unitBtnActive]}
              onPress={() => update({ heightUnit: 'cm' })}
            >
              <Text style={[styles.unitBtnText, isCm && styles.unitBtnTextActive]}>cm</Text>
            </TouchableOpacity>
          </View>

          {isCm ? (
            <View>
              <Text style={styles.bigValue}>{Math.round(answers.heightCm)} cm</Text>
              <Slider
                style={styles.slider}
                minimumValue={HEIGHT_CM_RANGE.min}
                maximumValue={HEIGHT_CM_RANGE.max}
                step={1}
                value={answers.heightCm}
                minimumTrackTintColor="#4f8ef7"
                onValueChange={(v) => update({ heightCm: Math.round(v) })}
                onSlidingStart={lockScroll}
                onSlidingComplete={unlockScroll}
              />
            </View>
          ) : (
            <View>
              <Text style={styles.bigValue}>
                {answers.heightFeet}' {answers.heightInches}"
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={HEIGHT_IN_RANGE.min}
                maximumValue={HEIGHT_IN_RANGE.max}
                step={1}
                value={answers.heightFeet * 12 + answers.heightInches}
                minimumTrackTintColor="#4f8ef7"
                onValueChange={(v) => {
                  const { feet, inches } = inchesToFeetAndInches(v);
                  update({ heightFeet: feet, heightInches: inches, heightCm: feetInchesToCm(feet, inches) });
                }}
                formatLabel={(totalInches) => {
                  const { feet, inches } = inchesToFeetAndInches(totalInches);
                  return `${feet}'${inches}"`;
                }}
                onSlidingStart={lockScroll}
                onSlidingComplete={unlockScroll}
              />
            </View>
          )}

          <View style={styles.infoPanel}>
            <Text style={[styles.infoPanelText, styles.infoPanelTextLast]}>
              Height:{' '}
              {isCm
                ? `${Math.round(answers.heightCm)} cm`
                : `${answers.heightFeet}' ${answers.heightInches}"`}
            </Text>
          </View>
        </View>
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

  return (
    <View style={styles.container}>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.round(((stepIndex + 1) / visibleSteps.length) * 100)}%` },
          ]}
        />
      </View>
      <Text style={styles.progressLabel}>
        Step {stepIndex + 1} of {visibleSteps.length}
      </Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 24 }}
        scrollEnabled={!scrollLocked}
      >
        <Text style={styles.title}>{step.title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {renderStepBody()}
      </ScrollView>

      <View style={styles.navRow}>
        <TouchableOpacity style={styles.backBtn} onPress={goBack}>
          <Text style={styles.backBtnText}>{stepIndex === 0 ? 'Cancel' : 'Back'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextBtn, !isAnswered() && styles.nextBtnDisabled]}
          onPress={goNext}
          disabled={!isAnswered()}
        >
          <Text style={styles.nextBtnText}>
            {stepIndex === visibleSteps.length - 1 ? 'See My Plan' : 'Next'}
          </Text>
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
  container: { flex: 1, backgroundColor: '#f7f7fa', padding: 16 },
  progressTrack: { height: 6, backgroundColor: '#e3e3e8', borderRadius: 3, overflow: 'hidden', marginTop: 8 },
  progressFill: { height: 6, backgroundColor: '#4f8ef7' },
  progressLabel: { fontSize: 14, color: '#999', marginTop: 6, marginBottom: 8 },
  scroll: { flex: 1 },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', marginBottom: 6, marginTop: 8 },
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
  // Three tiles stacked vertically and centered — each one is small enough
  // (unlike the old full-width portrait cards) that all three plus their
  // labels still fit on one screen with plenty of room to spare.
  imageCardStack: { alignItems: 'center' },
  imageCardTile: { width: '46%', alignItems: 'center', marginBottom: 18 },
  imageCardSquare: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: 'transparent',
    backgroundColor: '#fff',
    position: 'relative',
  },
  imageCardSquareSelected: { borderColor: '#4f8ef7' },
  imageCardPicture: { width: '100%', height: '100%', borderRadius: 15 },
  imageCardCheck: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#4f8ef7',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCardCheckText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  imageCardLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginTop: 8,
  },
  imageCardLabelSelected: { color: '#4f8ef7' },
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
  bodyFatGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  bodyFatCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3e3e8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  // height fixed, width auto via resizeMode: 'contain' — the reference
  // images aren't all exactly the same aspect ratio (male ones are
  // slightly shorter/wider than female ones), so a fixed height keeps every
  // card the same size without stretching or cropping any of them.
  bodyFatImage: { width: '100%', height: 150, marginBottom: 8 },
  bodyFatLabel: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  navRow: { flexDirection: 'row', paddingTop: 12, gap: 10 },
  backBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e3e3e8' },
  backBtnText: { fontSize: 17, fontWeight: '600', color: '#555' },
  nextBtn: { flex: 2, paddingVertical: 14, borderRadius: 10, alignItems: 'center', backgroundColor: '#4f8ef7' },
  nextBtnDisabled: { backgroundColor: '#b9d0f7' },
  nextBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});
