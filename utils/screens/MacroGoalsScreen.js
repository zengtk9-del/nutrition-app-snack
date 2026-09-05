import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import MacroDonutChart, { MACRO_COLORS } from '../components/MacroDonutChart';
import MacroSlider from '../components/MacroSlider';
import SaveGoalModal from '../components/SaveGoalModal';
import FollowGoalScreen from './FollowGoalScreen';
import {
  redistributeCaloriesForTarget,
  redistributeMacroForChange,
  maxGramsForMacro,
} from '../utils/goals';

// "Set My Own Macro Goals" — reached from GoalsScreen's new button, right
// below "Retake the Goals Quiz". Same full-screen-takeover pattern App.js
// already uses for the quiz (no tab bar while this is open): the donut
// chart on top is a pure, non-interactive readout, and the four sliders
// below are the only thing that actually changes state.
//
// The core rule this screen enforces: total calories only ever change by
// dragging the Calories slider itself. Dragging Protein, Carbs, or Fat
// always keeps the calorie total exactly where it was — whatever calories
// that macro gained or gave up come from the OTHER two macros, split
// proportionally to their own current share (or, if one of them is
// locked, entirely from whichever one isn't). See
// redistributeCaloriesForTarget/redistributeMacroForChange/
// maxGramsForMacro in utils/goals.js for the actual math — this screen
// just wires slider drags to those pure functions and holds the result in
// state.
//
// Locking: at most one of Protein/Carbs/Fat can be locked at a time —
// tapping a lock icon while a different one is already locked moves the
// lock rather than adding a second one, and tapping the currently-locked
// one's icon again clears it. A locked macro's own slider is disabled
// (can't be dragged) rather than just visually marked, since dragging a
// macro that's supposed to "stay the same" wouldn't make sense. Calories
// itself never shows a lock icon at all — it's the one control that's
// always allowed to move the total, which is a different thing from being
// "lockable" the way Protein/Carbs/Fat are.
const CALORIES_MIN = 1000;
const CALORIES_MAX = 5000;
const CALORIES_STEP = 10;

// "Set My Own Macro Goals" always OPENS at this fresh starting point —
// 2,000 kcal, split into a balanced 30% protein / 40% carbs / 30% fat —
// regardless of whatever's already saved. Damon's own explicit call:
// this screen used to pick up wherever the existing goal left off, and he
// wants it to always start from the same known, balanced place instead.
// `redistributeCaloriesForTarget` already has a well-tested balanced-split
// fallback for exactly this "no existing distribution" case (see its own
// `totalOld <= 0` branch in utils/goals.js) — feeding it all-zero grams is
// what triggers that fallback, so this reuses that logic instead of
// duplicating a second copy of "what counts as balanced" here. Computed
// once at module load (not per-render) since it never varies.
const DEFAULT_CALORIES = 2000;
const DEFAULT_MACROS = redistributeCaloriesForTarget({
  proteinG: 0,
  carbsG: 0,
  fatG: 0,
  lockedMacro: null,
  newCalories: DEFAULT_CALORIES,
});
// Generous hard ceilings so a slider's displayed range never gets
// enormous (e.g. from proportionally scaling everything up while chasing
// a very high calorie target) — maxGramsForMacro's own dynamic limit is
// almost always the tighter of the two and is what actually stops a drag
// early; these are just a sane outer bound on top of it.
const GRAMS_ABS_MAX = { protein: 500, carbs: 500, fat: 300 };
const GRAMS_STEP = 1;

const HIGHLIGHT_COLOR = '#4f8ef7';
const HIGHLIGHT_BG = '#eaf2ff';

// How much breathing room the measured overlay boundary leaves before the
// highlighted content it must not cover (see the wheelBottomY/topBoundaryY
// state and remeasureOverlay below), and a hard floor on the top overlay's
// height so a bad/late measurement can never collapse it down to something
// unreadably short before the next remeasure lands. OVERLAY_GAP is sized
// to fit the little connector line + arrowhead (see CONNECTOR_LINE_LEN/
// CONNECTOR_ARROW_SIZE below) that now sits in this gap, pointing from the
// caption toward whatever it's talking about — it used to just be empty
// breathing room.
const OVERLAY_GAP = 26;
const MIN_TOP_OVERLAY_HEIGHT = 160;
const CONNECTOR_LINE_LEN = 12;
const CONNECTOR_ARROW_SIZE = 7;

// --- The guided walkthrough ---
//
// Damon's spec draws a distinction between "actions" (every beat the guide
// moves through — each one always needs the user to advance it somehow,
// whether that's a button tap, a real drag, or a real lock-tap) and
// "steps" (only the three beats that actually say "Step X of 3" — setting
// calories, adjusting protein, and locking a macro). GUIDE_ACTIONS is the
// full ordered list of actions; `stepLabel` is null on the four actions
// that are NOT one of the three numbered steps (the wheel intro, and the
// three "here's what just changed" reveals).
//
// Each action's `variant` says whether it's fundamentally about the wheel
// ('wheel') or about the slider rows ('card') — see overlaySideForAction
// just below, which is what actually decides whether the guide's caption
// panel covers the TOP half of the screen (over the wheel, when a slider
// is the thing being pointed at) or the BOTTOM half (over the sliders,
// when the wheel itself is being pointed at). Covering the dimmed half
// with a large panel — rather than a small inline card, which is how
// this started — is deliberate: the half that's covered is also the half
// that's dimmed, so there's never a moment where the guide is competing
// for attention with content it's actively told the user to ignore.
//
// `advanceMode` says how the user is allowed to move on:
//   'next'               — a plain "Next" button, nothing else required.
//   'confirm-after-drag' — a "Confirm" button for `dragTarget`'s slider.
//                           Dragging (or stepping) it is entirely
//                           optional, not a requirement to move on — this
//                           button is always tappable, so someone happy
//                           with the default value can just go straight
//                           through Step 1/Step 2 without touching
//                           anything. guideDragDone still gets tracked
//                           (see makeOnSlidingComplete) in case a future
//                           step wants to visually distinguish "you
//                           changed this" from "you kept the default", but
//                           nothing today gates on it.
//   'next-with-reveal'   — the scripted catch-up animation named by
//                           `reveal` starts the INSTANT this action
//                           becomes active (see the guideActionIndex
//                           effect below) — no click needed to kick it
//                           off. Its "Next" button stays disabled only
//                           until that animation finishes, then works
//                           like a plain 'next'.
//   'lock-tap'           — no guide button at all; advancing happens when
//                           the user actually taps Protein's real lock
//                           icon, handled from handleToggleLock.
//
// `target` drives which slider(s)/lock/wheel get highlighted vs. dimmed
// (see the wheelHighlighted/caloriesHighlighted/etc. booleans below) and
// which slider is allowed to be dragged at all while the guide is active
// (see isDragEnabledForGuide) — everything not named as the target is
// both dimmed AND locked out of interaction for the duration of that
// action, so the tour can't be derailed by dragging the "wrong" thing.
export const GUIDE_ACTIONS = [
  {
    key: 'intro-wheel',
    variant: 'wheel',
    stepLabel: null,
    title: null,
    body: 'This is your total calories and macro distribution.',
    advanceMode: 'next',
    dragTarget: null,
    reveal: null,
    target: 'wheel',
    scrollTo: 'top',
  },
  {
    key: 'set-calories',
    variant: 'card',
    stepLabel: 1,
    title: 'Set your calories goal',
    body: 'How many calories do you aim to eat per day?',
    advanceMode: 'confirm-after-drag',
    dragTarget: 'calories',
    reveal: null,
    target: 'calories',
    scrollTo: null,
  },
  {
    key: 'reveal-calories',
    variant: 'wheel',
    stepLabel: null,
    title: null,
    body: 'Your total calories has been changed.',
    advanceMode: 'next-with-reveal',
    dragTarget: null,
    reveal: 'calories',
    target: 'wheel',
    scrollTo: null,
  },
  {
    key: 'adjust-protein',
    variant: 'card',
    stepLabel: 2,
    title: 'Adjust your protein',
    body: null,
    advanceMode: 'confirm-after-drag',
    dragTarget: 'protein',
    reveal: null,
    target: 'protein',
    scrollTo: 'bottom',
  },
  {
    key: 'reveal-carbs-fat',
    variant: 'card',
    stepLabel: null,
    title: null,
    body: 'Other macros will auto-adjust to maintain the same calories.',
    advanceMode: 'next-with-reveal',
    dragTarget: null,
    reveal: 'carbsFat',
    target: 'carbsFatCalories',
    scrollTo: null,
  },
  {
    key: 'reveal-ratio',
    variant: 'wheel',
    stepLabel: null,
    title: null,
    body: 'The protein/carbs/fat ratio has been adjusted.',
    advanceMode: 'next-with-reveal',
    dragTarget: null,
    reveal: 'ratio',
    target: 'wheel',
    scrollTo: 'top',
  },
  {
    key: 'lock-protein',
    variant: 'card',
    stepLabel: 3,
    title: 'You can lock one macro while adjusting another.',
    body: null,
    advanceMode: 'lock-tap',
    dragTarget: null,
    reveal: null,
    target: 'proteinLock',
    scrollTo: 'bottom',
  },
  {
    key: 'carbs-fat-freedom',
    variant: 'card',
    stepLabel: null,
    title: null,
    body: 'Now you can adjust your carbs/fat ratio without changing your protein.',
    advanceMode: 'next',
    dragTarget: null,
    reveal: null,
    // Deliberately its own target — 'carbsFat', not 'carbsFatCalories' —
    // since this closing beat is only about Carbs/Fat now that Protein is
    // locked; Calories isn't part of this message the way it was during
    // the earlier reveal-carbs-fat action, so it shouldn't light up too.
    target: 'carbsFat',
    scrollTo: 'bottom',
  },
];

export const TOTAL_GUIDE_STEPS = GUIDE_ACTIONS.filter((a) => a.stepLabel != null).length;

// How long a reveal action keeps the guide's "Next" button disabled while
// MacroDonutChart/MacroSlider run their own local animation — see the big
// comment on the reveal effect further down for why this isn't a tween
// driven from up here anymore. Two different durations because the two
// children animate at two different speeds: the wheel's ring now steadily
// grows/shrinks over 2.2s (RING_ANIMATION_MS in MacroDonutChart.js —
// Damon asked for the wheel specifically to take 2+ seconds and to be a
// real outward-moving shape change, not a fade), but the Carbs/Fat
// sliders' thumb-slide is still a much quicker ~420ms (MacroSlider.js) —
// nobody asked for THAT to slow down, and there's no reason to make the
// 'carbsFat' reveal make Next wait 2.2s for an animation that's long
// since finished. Each constant adds a small buffer on top of its child's
// actual duration so Next never unlocks a beat before the animation
// visually settles.
const WHEEL_REVEAL_MS = 2400;
const SLIDER_REVEAL_MS = 550;
function revealDurationFor(reveal) {
  return reveal === 'carbsFat' ? SLIDER_REVEAL_MS : WHEEL_REVEAL_MS;
}

// 'wheel'-variant actions are about the donut, so the guide panel covers
// the OPPOSITE half (the sliders) and leaves the highlighted wheel in
// view; 'card'-variant actions are about one or more sliders, so the
// panel covers the wheel instead. Exported as its own pure function
// (rather than inlined) so the guide's coverage behavior — the actual
// point of Damon's "cover as much of the dimmed area as possible" request
// — has a direct, renderer-independent test.
export function overlaySideForAction(action) {
  return action.variant === 'wheel' ? 'bottom' : 'top';
}

// Reveal actions used to interpolate through a series of intermediate
// numbers (a "tween") on every render tick, driven from up here in the
// parent. That turned out to be the actual cause of the "series of
// flashes" Damon reported, not just the frame rate: every intermediate
// step was a fresh setState on THIS component, which re-renders the
// entire screen — donut, all four sliders, the guide panel — on every
// single tick. The fix is architectural, not just a slower interval: the
// numbers themselves now SNAP straight to their target in one setState
// (see the reveal effect below), and the actual smooth-looking motion
// (the donut's ring steadily growing/shrinking, a slider's thumb sliding
// to its new spot) is now owned locally by MacroDonutChart/MacroSlider
// themselves via the `animate`/`animateChanges` props — each of those
// only re-renders that one small component, never this whole screen, and
// each runs its OWN local tween toward the target this screen just
// snapped to. See those two files' own comments for how they animate
// themselves.
// `goals` is intentionally NOT read for the initial state below —
// see DEFAULT_CALORIES/DEFAULT_MACROS above for why this screen always
// opens at the same fresh 2,000 kcal balanced split instead of picking up
// wherever the existing saved goal left off. The prop is still accepted
// (App.js still passes the current goals down) in case a future feature
// wants it again — e.g. a "start from my current goals instead" option —
// but nothing in this file reads it today.
//
// "Save These Goals" opens SaveGoalModal first (see handleSave below) to
// collect a name, then hands off to FollowGoalScreen's own "save" mode
// (see the saveConfirm early return further down) to show the same
// wheel/macros + calorie-math confirmation the "follow a saved goal" flow
// uses, before either of ITS two Save buttons actually writes anything —
// `onSaveOnly(name, newGoals)` saves it into the up-to-5 list without
// switching what's currently tracked, `onSaveAndFollow(name, newGoals)`
// does both. `atCap` (from App.js's savedGoals list) is what tells
// SaveGoalModal whether there's room to save another one at all, and
// `tdee` (also from App.js) is this user's current TDEE, passed straight
// through to FollowGoalScreen for its own calorie-math — see
// utils/goals.js's buildFollowSummary.
export default function MacroGoalsScreen({ goals, onSaveOnly, onSaveAndFollow, onCancel, atCap, tdee }) {
  const [proteinG, setProteinG] = useState(DEFAULT_MACROS.proteinG);
  const [carbsG, setCarbsG] = useState(DEFAULT_MACROS.carbsG);
  const [fatG, setFatG] = useState(DEFAULT_MACROS.fatG);
  // null | 'protein' | 'carbs' | 'fat' — never more than one at a time.
  const [lockedMacro, setLockedMacro] = useState(null);

  // Calories is its own real piece of state — set once up front, and
  // after that touched ONLY by handleCaloriesChange (i.e. by actually
  // dragging/stepping the Calories slider) — never re-derived by summing
  // the macros' kcal, which used to make the displayed number visibly
  // wobble as Protein/Carbs/Fat rounded to whole grams. See
  // utils/goals.js's totalCalories parameter for the other half of this
  // fix.
  const [calories, setCalories] = useState(DEFAULT_CALORIES);

  // A single finger drag fires MANY onValueChange calls in a row — this
  // snapshot, frozen for the duration of one drag gesture (onSlidingStart
  // to onSlidingComplete) and reused by every onValueChange call in
  // between, is what keeps each of those calls redistributing from the
  // SAME starting point instead of compounding rounding error against
  // whatever the previous call already rounded to.
  const dragBaselineRef = useRef(null);
  const macrosBaseline = () => dragBaselineRef.current || { proteinG, carbsG, fatG };
  const handleSlidingStart = () => {
    dragBaselineRef.current = { proteinG, carbsG, fatG };
  };
  const handleSlidingComplete = () => {
    dragBaselineRef.current = null;
  };

  const applyMacros = (next) => {
    setProteinG(next.proteinG);
    setCarbsG(next.carbsG);
    setFatG(next.fatG);
  };

  const handleCaloriesChange = (newCalories) => {
    applyMacros(redistributeCaloriesForTarget({ ...macrosBaseline(), lockedMacro, newCalories }));
    setCalories(newCalories);
  };

  const handleMacroChange = (key, newGrams) => {
    applyMacros(
      redistributeMacroForChange({
        ...macrosBaseline(),
        lockedMacro,
        changedKey: key,
        newGrams,
        totalCalories: calories,
      })
    );
  };

  // ---- Guided walkthrough state ----
  //
  // guideActionIndex is the index into GUIDE_ACTIONS while the guide is
  // running, or null once it's been skipped or finished. It starts at 0
  // (the very first action) so a first-time visitor sees it without
  // asking.
  const [guideActionIndex, setGuideActionIndex] = useState(0);
  const [guideDragDone, setGuideDragDone] = useState(false);
  const [guideAnimating, setGuideAnimating] = useState(false);
  const [showGuideFinalMessage, setShowGuideFinalMessage] = useState(false);
  const scrollViewRef = useRef(null);
  // Holds the id of the setTimeout a reveal action starts (see the effect
  // below) so a skip/replay mid-reveal can cancel it instead of letting a
  // stray timeout flip guideAnimating/unfreeze a ref after the guide has
  // already moved on.
  const revealTimeoutRef = useRef(null);

  // ---- Overlay sizing: measured, not guessed ----
  //
  // The guide's half-screen overlay panel used to just be a flat 52% of
  // the screen, pinned to whichever edge overlaySideForAction says. That
  // was fine as long as 52% happened to line up with where the real
  // content broke — but it doesn't always: the wheel's own Protein/Carbs/
  // Fat legend runs right up against the 52% line (so the bottom overlay
  // clipped it), and the Protein row/lock icon sit close enough to the top
  // of the sliders card that the top overlay clipped THEM too. Rather than
  // pick a new fixed percentage that only happens to work for today's font
  // sizes, this measures the actual on-screen edge of whatever must stay
  // fully visible — the wheel box's bottom edge for the bottom overlay, or
  // the topmost highlighted row's top edge for the top overlay — with
  // React Native's own built-in `measureInWindow` (a real page-coordinate
  // measurement, no extra dependency) and sizes the panel from that,
  // leaving a small OVERLAY_GAP of breathing room. If a measurement hasn't
  // landed yet (e.g. the very first frame, or the render-test harness's
  // mocked View which doesn't implement measureInWindow at all) this falls
  // straight back to the old fixed 52% via the *FallbackHeight styles
  // below — never crashes, just less precise until the next remeasure.
  const containerRef = useRef(null);
  const wheelBoxRef = useRef(null);
  const caloriesRowRef = useRef(null);
  const proteinRowRef = useRef(null);
  const carbsRowRef = useRef(null);
  const [wheelBottomY, setWheelBottomY] = useState(null);
  const [topBoundaryY, setTopBoundaryY] = useState(null);

  // wheelDisplay/carbsFatDisplay are what the donut and the Carbs/Fat
  // slider bars actually render WHILE THE GUIDE IS RUNNING — normally
  // identical to the real proteinG/carbsG/fatG/calories, except during
  // two windows the guide deliberately holds them back so it can "reveal"
  // the change later as a scripted animation instead of it happening live
  // mid-drag (per Damon's spec: real drags/taps still update the real
  // numbers immediately underneath, same as ever, but the WHEEL and the
  // Carbs/Fat BARS don't visibly catch up until their own dedicated
  // reveal action runs). The two *FrozenRef flags gate a pair of
  // always-on "mirror real state" effects just below — true means "don't
  // copy real state into the display state this render", false means
  // "keep them in sync". Both start false (nothing frozen) and flip true
  // the moment the guide leaves its very first action (see
  // handleGuideAdvance) since that's the earliest any drag can happen;
  // each flips back to false once its own reveal finishes. None of this
  // matters once the guide is inactive — guideActionIndex === null makes
  // every render read straight from the real proteinG/carbsG/fatG/
  // calories instead (see donutCalories etc. below), so a stale display
  // snapshot left over from a skipped guide is simply never looked at
  // again.
  const [wheelDisplay, setWheelDisplay] = useState({ calories, proteinG, carbsG, fatG });
  const [carbsFatDisplay, setCarbsFatDisplay] = useState({ carbsG, fatG });
  const wheelFrozenRef = useRef(false);
  const carbsFatFrozenRef = useRef(false);

  useEffect(() => {
    if (!wheelFrozenRef.current) {
      setWheelDisplay({ calories, proteinG, carbsG, fatG });
    }
  }, [calories, proteinG, carbsG, fatG]);

  useEffect(() => {
    if (!carbsFatFrozenRef.current) {
      setCarbsFatDisplay({ carbsG, fatG });
    }
  }, [carbsG, fatG]);

  // A fresh action never starts with the previous action's drag already
  // counted as "done".
  useEffect(() => {
    setGuideDragDone(false);
  }, [guideActionIndex]);

  // Auto-scroll to keep whichever region the current action targets in
  // view — 'top' for anything about the wheel/Calories, 'bottom' once the
  // walkthrough moves down into the Protein/Carbs/Fat rows. scrollToEnd
  // is RN ScrollView's own built-in "scroll to the bottom of the content"
  // — no manual pixel offset/measurement needed.
  useEffect(() => {
    const action = guideActionIndex !== null ? GUIDE_ACTIONS[guideActionIndex] : null;
    if (!action || !action.scrollTo || !scrollViewRef.current) return;
    if (action.scrollTo === 'top') {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    } else if (action.scrollTo === 'bottom') {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [guideActionIndex]);

  // The scripted "reveal" actions kick off AUTOMATICALLY the instant they
  // become active — not on a button tap. Per Damon's latest request, the
  // NUMBERS no longer interpolate through a series of intermediate values
  // up here — they snap straight to the real target in one setState — and
  // the actual smooth-looking motion is left entirely to MacroDonutChart's
  // own crossfade and MacroSlider's own thumb-slide (both driven by the
  // `animate`/`animateChanges` props passed below), which only re-render
  // themselves, not this whole screen. This effect just needs to (a) snap
  // the display state, and (b) keep the guide "waiting" (guideAnimating
  // true, Next disabled) for as long as that child animation takes, then
  // unfreeze whichever ref this reveal owns. REVEAL_ANIMATION_MS is kept
  // in sync with CROSSFADE_MS in MacroDonutChart.js and the slider tween
  // duration in MacroSlider.js (both ~420-450ms) — a little headroom is
  // fine since it only controls how long Next stays disabled, not the
  // animation itself.
  useEffect(() => {
    const action = guideActionIndex !== null ? GUIDE_ACTIONS[guideActionIndex] : null;
    if (!action || action.advanceMode !== 'next-with-reveal') return;

    setGuideAnimating(true);
    if (action.reveal === 'calories') {
      setWheelDisplay({ calories, proteinG, carbsG, fatG });
    } else if (action.reveal === 'carbsFat') {
      setCarbsFatDisplay({ carbsG, fatG });
    } else if (action.reveal === 'ratio') {
      setWheelDisplay((prev) => ({ ...prev, proteinG, carbsG, fatG }));
    }

    revealTimeoutRef.current = setTimeout(() => {
      revealTimeoutRef.current = null;
      if (action.reveal === 'carbsFat') {
        carbsFatFrozenRef.current = false;
      } else if (action.reveal === 'ratio') {
        wheelFrozenRef.current = false;
      }
      setGuideAnimating(false);
    }, revealDurationFor(action.reveal));

    return () => {
      if (revealTimeoutRef.current) {
        clearTimeout(revealTimeoutRef.current);
        revealTimeoutRef.current = null;
      }
    };
    // Deliberately only re-runs when the action itself changes — this
    // should fire exactly once per entry into a reveal action, not every
    // time e.g. wheelDisplay updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guideActionIndex]);

  const guideActive = guideActionIndex !== null;
  const currentAction = guideActive ? GUIDE_ACTIONS[guideActionIndex] : null;
  const guideTarget = currentAction ? currentAction.target : null;

  // Picks which row's top edge the top overlay must stop above. This is
  // NOT simply "the topmost highlighted row" — for 'carbsFat' (the closing
  // carbs-fat-freedom action) Protein itself is still dimmed/locked, not
  // highlighted, but Damon still wants it visible for context (you're
  // looking at Carbs/Fat relative to a Protein that isn't moving), so it
  // shares Protein's boundary rather than Carbs'. Falls through to the
  // Calories row (the first row in the card, so this also covers the
  // plain 'calories' target) for anything else.
  const topBoundaryRefForTarget = (target) => {
    if (target === 'protein' || target === 'proteinLock' || target === 'carbsFat') return proteinRowRef;
    return caloriesRowRef;
  };

  // Re-measures the real on-screen edges the overlay must respect. Called
  // right when the guide's target changes and again a couple of times
  // shortly after, since the ScrollView's own scrollTo animation (see the
  // scrollTo effect above) takes a moment to settle and a measurement
  // taken before it finishes would capture the pre-scroll position. Safe
  // to call at any time — every step is guarded against a ref that isn't
  // attached yet or (as in the local render-test harness's mocked View)
  // doesn't implement measureInWindow at all, in which case it silently
  // does nothing and the overlay just keeps using its fixed-percentage
  // fallback.
  const remeasureOverlay = () => {
    const container = containerRef.current;
    if (!container || typeof container.measureInWindow !== 'function') return;
    container.measureInWindow((cx, cy) => {
      const wheelBox = wheelBoxRef.current;
      if (wheelBox && typeof wheelBox.measureInWindow === 'function') {
        wheelBox.measureInWindow((x, y, w, h) => {
          setWheelBottomY(y + h - cy);
        });
      }
      const topRef = topBoundaryRefForTarget(guideTarget);
      const topNode = topRef.current;
      if (topNode && typeof topNode.measureInWindow === 'function') {
        topNode.measureInWindow((x, y) => {
          setTopBoundaryY(y - cy);
        });
      }
    });
  };

  useEffect(() => {
    remeasureOverlay();
    // The ScrollView's own scrollTo animation runs ~300ms, so one quick
    // remeasure and one after it's had time to finish — duplicate calls
    // are harmless, each just overwrites the state with a fresher number.
    const soon = setTimeout(remeasureOverlay, 60);
    const later = setTimeout(remeasureOverlay, 400);
    return () => {
      clearTimeout(soon);
      clearTimeout(later);
    };
    // Deliberately keyed on the action/target/final-message, not on every
    // render — re-measuring on every render would fight the drag-driven
    // re-renders that already happen many times a second mid-gesture.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guideActionIndex, guideTarget, showGuideFinalMessage]);

  // Wraps the shared handleSlidingComplete so the guide can tell whether
  // THIS particular slider is the one the current action actually wanted
  // dragged — handleSlidingStart/handleSlidingComplete themselves stay
  // generic (just the baseline-snapshot bookkeeping) since every slider
  // already shares them for the redistribution math.
  const makeOnSlidingComplete = (key) => () => {
    handleSlidingComplete();
    if (currentAction && currentAction.advanceMode === 'confirm-after-drag' && currentAction.dragTarget === key) {
      setGuideDragDone(true);
    }
  };

  const handleSkipGuide = () => {
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }
    setGuideAnimating(false);
    setGuideActionIndex(null);
    setShowGuideFinalMessage(false);
  };

  // "Show me how" always restarts from action 0 using whatever the goals
  // actually are RIGHT NOW, not wherever a previous run of the guide left
  // its frozen snapshots — otherwise a replay after manually tweaking a
  // slider post-tutorial could open on a stale wheel.
  const handleShowGuide = () => {
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }
    wheelFrozenRef.current = false;
    carbsFatFrozenRef.current = false;
    setWheelDisplay({ calories, proteinG, carbsG, fatG });
    setCarbsFatDisplay({ carbsG, fatG });
    setGuideDragDone(false);
    setGuideAnimating(false);
    setShowGuideFinalMessage(false);
    setGuideActionIndex(0);
  };

  const handleGuideAdvance = () => {
    if (!currentAction) return;

    if (currentAction.advanceMode === 'next' || currentAction.advanceMode === 'next-with-reveal') {
      if (guideAnimating) return;
      // Leaving the intro action is also the moment the guide starts
      // holding the wheel/Carbs/Fat display back from following live
      // state — see the long comment above wheelDisplay/carbsFatDisplay.
      if (guideActionIndex === 0) {
        wheelFrozenRef.current = true;
        carbsFatFrozenRef.current = true;
      }
      // The LAST action's own "Next" is what hands off to the closing
      // "Now you can set your own goals!" message — rather than hard-
      // coding that hand-off to whichever action key happens to be last
      // (it used to be lock-protein specifically, tied to the real lock
      // tap instead of a button), this just asks "is there another action
      // after this one" so adding/reordering GUIDE_ACTIONS entries never
      // requires remembering to update a second place.
      if (guideActionIndex === GUIDE_ACTIONS.length - 1) {
        setShowGuideFinalMessage(true);
        return;
      }
      setGuideActionIndex(guideActionIndex + 1);
      return;
    }

    if (currentAction.advanceMode === 'confirm-after-drag') {
      // No longer gated on guideDragDone — Confirm is always tappable, so
      // someone happy with the default calories/protein value can go
      // straight through Step 1/Step 2 instead of being forced to drag
      // first. See the advanceMode comment above GUIDE_ACTIONS.
      setGuideActionIndex(guideActionIndex + 1);
    }
  };

  const handleToggleLock = (key) => {
    const isLockingProteinDuringGuide =
      key === 'protein' &&
      lockedMacro !== 'protein' &&
      !!currentAction &&
      currentAction.advanceMode === 'lock-tap' &&
      currentAction.target === 'proteinLock';
    setLockedMacro((prev) => (prev === key ? null : key));
    if (isLockingProteinDuringGuide) {
      // Tapping the Protein lock used to end the guide right here. Now it
      // just advances into the next action like any other step — the new
      // "carbs-fat-freedom" action that follows lock-protein in
      // GUIDE_ACTIONS — and THAT action's own "Next" button is what
      // eventually reaches the closing message, via the generic
      // last-action check in handleGuideAdvance above.
      setGuideActionIndex((idx) => (idx == null ? idx : idx + 1));
    }
  };

  const handleGuideFinalContinue = () => {
    setShowGuideFinalMessage(false);
    setGuideActionIndex(null);
  };

  // "Save These Goals" no longer saves immediately — it opens the naming
  // modal (see the render below). showSaveModal is its own bit of state
  // rather than reusing guideActive/showGuideFinalMessage, since it's a
  // completely separate concern from the guided walkthrough.
  const [showSaveModal, setShowSaveModal] = useState(false);
  // Once a name's been typed and confirmed in that modal, THIS holds the
  // {name, calories, protein, carbs, fat} snapshot being confirmed —
  // non-null triggers the early return below that swaps this screen's own
  // render over to FollowGoalScreen's "save" mode instead of unmounting
  // this component (see that early return's own comment for why: losing
  // this component would lose every slider/lock the user just set up).
  const [saveConfirm, setSaveConfirm] = useState(null);
  const handleSave = () => {
    if (guideActive) return;
    setShowSaveModal(true);
  };

  const handleCancel = () => {
    if (guideActive) return;
    onCancel();
  };

  const maxFor = (key) =>
    lockedMacro === key
      ? GRAMS_ABS_MAX[key]
      : Math.min(GRAMS_ABS_MAX[key], maxGramsForMacro({ proteinG, carbsG, fatG, lockedMacro, key }));

  // While the guide is running, only the ONE slider the current action is
  // actually asking the user to drag stays interactive — everything else
  // (dimmed anyway, see below) is also locked out of dragging/stepping so
  // a stray touch on the "wrong" slider can't leave the walkthrough in an
  // inconsistent state (e.g. a Confirm button armed for a drag that
  // wasn't the one the guide is currently pointing at).
  const isDragEnabledForGuide = (key) => {
    if (!guideActive) return true;
    if (currentAction && currentAction.advanceMode === 'confirm-after-drag') {
      return currentAction.dragTarget === key;
    }
    // The closing carbs-fat-freedom action isn't gated on a drag the way
    // Step 1/Step 2 are (there's no single required gesture before you
    // can move on — its advanceMode is a plain 'next') but Damon still
    // wants Carbs/Fat to actually be draggable here, as a hands-on preview
    // of "you can adjust these now" rather than just a highlighted, inert
    // picture of them. Protein stays locked (lockedMacro is still
    // 'protein' from Step 3) so a real drag here already keeps behaving
    // exactly like the message promises — only Carbs/Fat trade calories
    // with each other.
    if (currentAction && currentAction.target === 'carbsFat') {
      return key === 'carbs' || key === 'fat';
    }
    return false;
  };

  const wheelHighlighted = guideTarget === 'wheel';
  const wheelDimmed = guideActive && guideTarget !== 'wheel';
  const caloriesHighlighted = guideTarget === 'calories' || guideTarget === 'carbsFatCalories';
  const caloriesDimmed = guideActive && !caloriesHighlighted;
  const proteinHighlighted = guideTarget === 'protein';
  const proteinEmphasizeLock = guideTarget === 'proteinLock';
  const proteinDimmed = guideActive && !proteinHighlighted;
  // 'carbsFatCalories' is the mid-tutorial reveal (Carbs/Fat auto-adjusting
  // alongside Calories); 'carbsFat' is the closing "now adjust these
  // freely" beat after Protein gets locked, which deliberately leaves
  // Calories out of it — see the target on the carbs-fat-freedom action.
  // Both mean Carbs/Fat themselves should show full color, not dimmed.
  const carbsHighlighted = guideTarget === 'carbsFatCalories' || guideTarget === 'carbsFat';
  const carbsDimmed = guideActive && !carbsHighlighted;
  const fatHighlighted = guideTarget === 'carbsFatCalories' || guideTarget === 'carbsFat';
  const fatDimmed = guideActive && !fatHighlighted;

  // Carbs/Fat's own `animateChanges` (passed to MacroSlider below) is
  // deliberately scoped to ONLY the 'carbsFatCalories' reveal moment, not
  // guideActive as a whole. That reveal is the one place a value change is
  // a single scripted jump (Protein just got dragged, Carbs/Fat need to
  // visibly "catch up") where a brief animated slide reads as intentional.
  // The later carbs-fat-freedom step (target 'carbsFat') is real hands-on
  // dragging — the user drags Carbs and expects Fat to update the instant
  // they move their finger, same as any drag outside the guide. Leaving
  // animateChanges on for that step was what made cross-adjustment feel
  // laggy there specifically (each drag tick would kick off its own ~420ms
  // catch-up tween on the OTHER slider instead of snapping immediately).
  const donutCalories = guideActive ? wheelDisplay.calories : calories;
  const donutProteinG = guideActive ? wheelDisplay.proteinG : proteinG;
  const donutCarbsG = guideActive ? wheelDisplay.carbsG : carbsG;
  const donutFatG = guideActive ? wheelDisplay.fatG : fatG;
  const carbsSliderValue = guideActive ? carbsFatDisplay.carbsG : carbsG;
  const fatSliderValue = guideActive ? carbsFatDisplay.fatG : fatG;

  const guideButtonLabel = !currentAction
    ? null
    : currentAction.advanceMode === 'confirm-after-drag'
    ? 'Confirm'
    : currentAction.advanceMode === 'next-with-reveal' || currentAction.advanceMode === 'next'
    ? 'Next'
    : null; // 'lock-tap' has no guide button — advancing happens via the real lock icon.

  // 'confirm-after-drag' used to also disable here until guideDragDone —
  // removed so Confirm is always tappable and dragging first is optional,
  // not required. The only thing that still disables this button is a
  // reveal animation still being mid-flight.
  const guideButtonDisabled =
    !!currentAction && currentAction.advanceMode === 'next-with-reveal' && guideAnimating;

  const renderGuideActionsRow = () => (
    <View style={styles.guideActions}>
      <TouchableOpacity onPress={handleSkipGuide} accessibilityRole="button" accessibilityLabel="Skip guide">
        <Text style={styles.guideSkipText}>Skip guide</Text>
      </TouchableOpacity>
      {guideButtonLabel && (
        <TouchableOpacity
          onPress={handleGuideAdvance}
          disabled={guideButtonDisabled}
          style={[styles.guideNextBtn, guideButtonDisabled && styles.guideNextBtnDisabled]}
          accessibilityRole="button"
          accessibilityLabel={guideButtonLabel}
        >
          <Text style={styles.guideNextBtnText}>{guideButtonLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // A full-bleed panel over roughly half the screen — the OPPOSITE half
  // from whatever the current action is highlighting, per
  // overlaySideForAction — instead of a small inline card. Covering the
  // dimmed half completely (rather than dimming-in-place) is what makes
  // "occupy as much of the dimmed area as possible" true, and also means
  // the guide's own text/buttons never have to compete visually with
  // whatever's sitting dimmed underneath them.
  const renderOverlayContent = () => {
    if (showGuideFinalMessage) {
      return (
        <View style={styles.overlayInner}>
          <Text style={styles.guideFinalText}>Now you can set your own goals!</Text>
          <TouchableOpacity
            onPress={handleGuideFinalContinue}
            style={[styles.guideNextBtn, styles.guideFinalBtn]}
            accessibilityRole="button"
            accessibilityLabel="Continue"
          >
            <Text style={styles.guideNextBtnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (!currentAction) return null;
    if (currentAction.variant === 'wheel') {
      return (
        <View style={styles.overlayInner}>
          <Text style={styles.wheelCaptionText}>{currentAction.body}</Text>
          {renderGuideActionsRow()}
        </View>
      );
    }
    return (
      <View style={styles.overlayInner}>
        {currentAction.stepLabel != null && (
          <Text style={styles.guideStepLabel}>
            Step {currentAction.stepLabel} of {TOTAL_GUIDE_STEPS}
          </Text>
        )}
        {!!currentAction.title && <Text style={styles.guideTitle}>{currentAction.title}</Text>}
        {!!currentAction.body && <Text style={styles.guideDescription}>{currentAction.body}</Text>}
        {renderGuideActionsRow()}
      </View>
    );
  };

  const overlaySide = showGuideFinalMessage ? 'top' : currentAction ? overlaySideForAction(currentAction) : null;

  // The measured boundary, turned into an actual style override — see the
  // long comment on remeasureOverlay above for why these fall back to the
  // old fixed-52% styles (overlayTopFallbackHeight/overlayBottomFallbackHeight)
  // whenever a real measurement isn't available yet.
  const overlayTopStyle =
    topBoundaryY != null ? { height: Math.max(MIN_TOP_OVERLAY_HEIGHT, topBoundaryY - OVERLAY_GAP) } : styles.overlayTopFallbackHeight;
  const overlayBottomStyle =
    wheelBottomY != null ? { top: wheelBottomY + OVERLAY_GAP } : styles.overlayBottomFallbackHeight;

  // Right after the naming modal confirms, this swaps the whole screen
  // over to FollowGoalScreen's "save" mode — an early return from THIS
  // same component (not a separate screen App.js swaps in), so every hook
  // above has already run in the same order it always does, and cancelling
  // (setSaveConfirm(null)) comes right back to these exact sliders/locks
  // as the user left them rather than remounting this screen from scratch
  // at its default 2,000 kcal starting point.
  if (saveConfirm) {
    return (
      <FollowGoalScreen
        mode="save"
        goal={saveConfirm}
        currentTdee={tdee}
        onCancel={() => setSaveConfirm(null)}
        onSaveOnly={() =>
          onSaveOnly(saveConfirm.name, {
            calories: saveConfirm.calories,
            protein: saveConfirm.protein,
            carbs: saveConfirm.carbs,
            fat: saveConfirm.fat,
          })
        }
        onSaveAndFollow={() =>
          onSaveAndFollow(saveConfirm.name, {
            calories: saveConfirm.calories,
            protein: saveConfirm.protein,
            carbs: saveConfirm.carbs,
            fat: saveConfirm.fat,
          })
        }
      />
    );
  }

  return (
    <View style={styles.container} ref={containerRef}>
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Set My Own Macro Goals</Text>

        <View style={styles.chartWrap}>
          <View
            ref={wheelBoxRef}
            style={[
              styles.wheelBox,
              wheelHighlighted && styles.wheelBoxHighlighted,
              wheelDimmed && styles.wheelBoxDimmed,
            ]}
          >
            <MacroDonutChart
              calories={donutCalories}
              proteinG={donutProteinG}
              carbsG={donutCarbsG}
              fatG={donutFatG}
              size={200}
              animate={guideActive}
            />
          </View>
        </View>

        <View style={styles.slidersWrap}>
          <View ref={caloriesRowRef}>
            <MacroSlider
              label="Calories"
              value={calories}
              minimumValue={CALORIES_MIN}
              maximumValue={CALORIES_MAX}
              step={CALORIES_STEP}
              onValueChange={handleCaloriesChange}
              onSlidingStart={handleSlidingStart}
              onSlidingComplete={makeOnSlidingComplete('calories')}
              color="#1a1a1a"
              unit="kcal"
              dimmed={caloriesDimmed}
              highlighted={caloriesHighlighted}
              disabled={!isDragEnabledForGuide('calories')}
            />
          </View>
          <View ref={proteinRowRef}>
            <MacroSlider
              label="Protein"
              value={proteinG}
              minimumValue={0}
              maximumValue={maxFor('protein')}
              step={GRAMS_STEP}
              onValueChange={(v) => handleMacroChange('protein', v)}
              onSlidingStart={handleSlidingStart}
              onSlidingComplete={makeOnSlidingComplete('protein')}
              color={MACRO_COLORS.protein}
              unit="g"
              lockable
              locked={lockedMacro === 'protein'}
              disabled={lockedMacro === 'protein' || !isDragEnabledForGuide('protein')}
              onToggleLock={() => handleToggleLock('protein')}
              dimmed={proteinDimmed}
              highlighted={proteinHighlighted}
              emphasizeLock={proteinEmphasizeLock}
            />
          </View>
          <View ref={carbsRowRef}>
            <MacroSlider
              label="Carbs"
              value={carbsSliderValue}
              minimumValue={0}
              maximumValue={maxFor('carbs')}
              step={GRAMS_STEP}
              onValueChange={(v) => handleMacroChange('carbs', v)}
              onSlidingStart={handleSlidingStart}
              onSlidingComplete={makeOnSlidingComplete('carbs')}
              color={MACRO_COLORS.carbs}
              unit="g"
              lockable
              locked={lockedMacro === 'carbs'}
              disabled={lockedMacro === 'carbs' || !isDragEnabledForGuide('carbs')}
              onToggleLock={() => handleToggleLock('carbs')}
              dimmed={carbsDimmed}
              highlighted={carbsHighlighted}
              animateChanges={guideTarget === 'carbsFatCalories'}
            />
          </View>
          <MacroSlider
            label="Fat"
            value={fatSliderValue}
            minimumValue={0}
            maximumValue={maxFor('fat')}
            step={GRAMS_STEP}
            onValueChange={(v) => handleMacroChange('fat', v)}
            onSlidingStart={handleSlidingStart}
            onSlidingComplete={makeOnSlidingComplete('fat')}
            color={MACRO_COLORS.fat}
            unit="g"
            lockable
            locked={lockedMacro === 'fat'}
            disabled={lockedMacro === 'fat' || !isDragEnabledForGuide('fat')}
            onToggleLock={() => handleToggleLock('fat')}
            dimmed={fatDimmed}
            highlighted={fatHighlighted}
            animateChanges={guideTarget === 'carbsFatCalories'}
          />
        </View>

        {!guideActive && (
          <TouchableOpacity
            style={styles.showGuideBtn}
            onPress={handleShowGuide}
            accessibilityRole="button"
            accessibilityLabel="Show me how — restart the guide"
          >
            <Text style={styles.showGuideText}>Show me how</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {overlaySide && (
        <View
          style={[
            styles.overlayPanel,
            overlaySide === 'top' ? styles.overlayTopBase : styles.overlayBottomBase,
            overlaySide === 'top' ? overlayTopStyle : overlayBottomStyle,
          ]}
        >
          {renderOverlayContent()}
        </View>
      )}

      {/* A small connector — a short line + arrowhead, in the gap the
          overlay's own measured boundary leaves — pointing from the
          caption toward whichever real content it's talking about. Only
          rendered once a real measurement has landed (see
          remeasureOverlay above): before that there's no boundary to
          anchor it to, and a guessed position would likely point at
          nothing. Built from plain Views (a thin rectangle for the line,
          the classic "colored border on one side, transparent on the
          other two" trick for the triangular arrowhead) rather than an
          icon or SVG, consistent with the rest of this app avoiding any
          native drawing dependency. */}
      {overlaySide === 'bottom' && wheelBottomY != null && (
        <View pointerEvents="none" style={[styles.connectorWrap, { top: wheelBottomY }]}>
          <View style={styles.connectorArrowUp} />
          <View style={styles.connectorLine} />
        </View>
      )}
      {overlaySide === 'top' && topBoundaryY != null && (
        <View
          pointerEvents="none"
          style={[styles.connectorWrap, { top: topBoundaryY - CONNECTOR_LINE_LEN - CONNECTOR_ARROW_SIZE }]}
        >
          <View style={styles.connectorLine} />
          <View style={styles.connectorArrowDown} />
        </View>
      )}

      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.cancelBtn, guideActive && styles.navBtnDisabled]}
          onPress={handleCancel}
          disabled={guideActive}
        >
          <Text style={[styles.cancelBtnText, guideActive && styles.navBtnTextDisabled]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveBtn, guideActive && styles.navBtnDisabled]}
          onPress={handleSave}
          disabled={guideActive}
        >
          <Text style={styles.saveBtnText}>Save These Goals</Text>
        </TouchableOpacity>
      </View>

      <SaveGoalModal
        visible={showSaveModal}
        defaultName=""
        atCap={atCap}
        onCancel={() => setShowSaveModal(false)}
        onConfirm={(name) => {
          setShowSaveModal(false);
          setSaveConfirm({ name, calories, protein: proteinG, carbs: carbsG, fat: fatG });
          return Promise.resolve();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7fa', padding: 16 },
  scrollContent: { paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#1a1a1a', marginBottom: 6, marginTop: 8 },
  chartWrap: { alignItems: 'center', marginTop: 8, marginBottom: 8 },
  // Same "always-reserve-the-border" trick MacroSlider.js uses — a
  // permanent 2px transparent border/padding around the donut so turning
  // the highlight on/off never shifts anything below it, only the color
  // (and a light background tint) changes. `width: '100%'` matters just
  // as much here as it did on MacroDonutChart's own `wrap` style (see
  // that file's comment) — without it, this box has no definite width of
  // its own to hand down, `alignItems: 'center'` on chartWrap shrink-
  // wraps it to the donut's content size, and MacroDonutChart's internal
  // `width: '100%'` legend fix has nothing real left to resolve against —
  // reintroducing the exact same "Protein"/"Carbs"/"Fat" label-clipping
  // bug this box's ancestor already fixed once this session, just one
  // level higher in the tree.
  wheelBox: { width: '100%', borderWidth: 2, borderColor: 'transparent', borderRadius: 16, padding: 6 },
  wheelBoxHighlighted: { borderColor: HIGHLIGHT_COLOR, backgroundColor: HIGHLIGHT_BG },
  wheelBoxDimmed: { opacity: 0.35 },
  slidersWrap: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginTop: 8,
  },
  showGuideBtn: { alignItems: 'center', paddingVertical: 14 },
  showGuideText: { fontSize: 15, fontWeight: '600', color: HIGHLIGHT_COLOR },

  // The guide's half-screen cover panel. `overlayPanel` holds the shared
  // positioning/look (absolute, full width); overlayTopBase/overlayBottomBase
  // each pin it to the matching edge and round only the corner that faces
  // the still-visible half, so it reads as a sheet sliding in from that
  // edge rather than a floating card. Neither sets a size on its own
  // anymore — that's applied separately (see overlayTopStyle/
  // overlayBottomStyle above, computed from the measured content edges),
  // with overlayTopFallbackHeight/overlayBottomFallbackHeight as the old
  // fixed ~52% used only until a real measurement lands.
  overlayPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: HIGHLIGHT_BG,
    paddingHorizontal: 24,
    justifyContent: 'center',
    zIndex: 20,
    elevation: 20,
  },
  overlayTopBase: { top: 0, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  overlayBottomBase: { bottom: 0, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  overlayTopFallbackHeight: { height: '52%' },
  overlayBottomFallbackHeight: { height: '52%' },
  overlayInner: { alignItems: 'stretch' },
  // The little "points at the highlighted thing" connector — see the JSX
  // comment above where these get used. `connectorWrap` is a thin
  // full-width absolutely-positioned strip, centered horizontally, that
  // just stacks its two children (line + arrowhead, in whichever order
  // makes the arrow point the right way) — it doesn't need its own
  // height, the children's own sizes are all it takes up.
  connectorWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 21 },
  connectorLine: { width: 3, height: CONNECTOR_LINE_LEN, backgroundColor: HIGHLIGHT_COLOR },
  // Classic CSS/RN border-triangle trick: two transparent side borders plus
  // one colored border on the side OPPOSITE the direction it should point
  // (a colored bottom border makes the base sit at the bottom, so the
  // triangle's free apex points up, and vice versa).
  connectorArrowUp: {
    width: 0,
    height: 0,
    borderLeftWidth: CONNECTOR_ARROW_SIZE,
    borderRightWidth: CONNECTOR_ARROW_SIZE,
    borderBottomWidth: CONNECTOR_ARROW_SIZE,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: HIGHLIGHT_COLOR,
  },
  connectorArrowDown: {
    width: 0,
    height: 0,
    borderLeftWidth: CONNECTOR_ARROW_SIZE,
    borderRightWidth: CONNECTOR_ARROW_SIZE,
    borderTopWidth: CONNECTOR_ARROW_SIZE,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: HIGHLIGHT_COLOR,
  },
  guideStepLabel: { fontSize: 14, fontWeight: '700', color: HIGHLIGHT_COLOR, letterSpacing: 0.5, marginBottom: 8 },
  guideTitle: { fontSize: 25, fontWeight: '800', color: '#1a1a1a', marginBottom: 8, lineHeight: 31 },
  guideDescription: { fontSize: 17, color: '#5a6472', lineHeight: 24, marginBottom: 18 },
  guideActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  guideSkipText: { fontSize: 15, fontWeight: '600', color: '#777' },
  guideNextBtn: { backgroundColor: HIGHLIGHT_COLOR, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24 },
  guideNextBtnDisabled: { backgroundColor: '#b9cdf0' },
  guideNextBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  guideFinalText: { fontSize: 25, fontWeight: '800', color: '#1a1a1a', textAlign: 'center', marginBottom: 20 },
  guideFinalBtn: { alignSelf: 'center', paddingHorizontal: 32 },
  wheelCaptionText: {
    fontSize: 27,
    fontWeight: '800',
    color: '#1a1a1a',
    lineHeight: 35,
    marginBottom: 18,
    textAlign: 'center',
  },

  navRow: { flexDirection: 'row', paddingTop: 12, gap: 10 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3e3e8',
  },
  cancelBtnText: { fontSize: 17, fontWeight: '600', color: '#555' },
  saveBtn: { flex: 2, paddingVertical: 14, borderRadius: 10, alignItems: 'center', backgroundColor: '#4f8ef7' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 17 },
  // Cancel/Save are only real actions once you've left the guide — while
  // it's running they're disabled and visually dimmed so it's clear
  // there's nothing to tap there yet (rather than tapping through to a
  // save that quietly ignores the mid-tutorial state).
  navBtnDisabled: { opacity: 0.4 },
  navBtnTextDisabled: { color: '#aaa' },
});
