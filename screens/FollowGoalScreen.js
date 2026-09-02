import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import MacroDonutChart from '../components/MacroDonutChart';
import { buildFollowSummary } from '../utils/goals';

// The confirmation page shown before a goal actually becomes the one this
// app is tracking against — reused in two places, switched with `mode`:
//
//   mode="follow" (default) — from the Goals tab's "My Saved Goals" list
//   (see GoalsScreen.js's onRequestFollow / App.js's followPreviewGoal):
//   previewing an ALREADY-SAVED goal, with No/Yes at the bottom.
//
//   mode="save" — from "Set My Own Macro Goals" (see MacroGoalsScreen.js's
//   own saveConfirm state, rendered as an early return from within that
//   same component so cancelling never loses the sliders underneath):
//   previewing a brand new NOT-YET-SAVED goal (just typed a name for, via
//   SaveGoalModal), with Cancel / Save the goal / Save and follow at the
//   bottom — "Save the goal" adds it to the saved list without switching
//   what's currently tracked, "Save and follow" does both at once.
//
// Both modes share the exact same wheel + explanatory text above the
// buttons — see buildFollowSummary (utils/goals.js) for the actual
// calorie-math this screen is just displaying: this user's current TDEE
// (persisted the moment they last completed the quiz — App.js's
// handleQuizComplete) compared against this particular goal's calories,
// turned into a plain-language surplus/deficit and a per-day/two-week
// weight-change estimate.
//
// Every button here calls its own async prop and awaits it, showing a
// brief "…ing" state and disabling every button while in flight, and
// shows whatever error it rejects with inline rather than losing the
// screen — same pattern as components/SaveGoalModal.js — so the user can
// just try again without losing anything.
export default function FollowGoalScreen({
  goal,
  currentTdee,
  mode = 'follow',
  onCancel,
  onConfirm,
  onSaveOnly,
  onSaveAndFollow,
}) {
  const [busyAction, setBusyAction] = useState(null); // null | 'confirm' | 'saveOnly' | 'saveAndFollow'
  const [error, setError] = useState(null);
  const busy = busyAction !== null;

  const runAction = async (key, fn) => {
    setBusyAction(key);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError((err && err.message) || 'Something went wrong. Please try again.');
      setBusyAction(null);
    }
  };

  const handleYes = () => runAction('confirm', onConfirm);
  const handleSaveOnly = () => runAction('saveOnly', onSaveOnly);
  const handleSaveAndFollow = () => runAction('saveAndFollow', onSaveAndFollow);

  const summary = buildFollowSummary(currentTdee, goal.calories);
  const title = mode === 'save' ? 'Save this goal?' : 'Follow this goal?';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.goalName}>{goal.name}</Text>

        <View style={styles.chartWrap}>
          <MacroDonutChart calories={goal.calories} proteinG={goal.protein} carbsG={goal.carbs} fatG={goal.fat} size={200} />
        </View>

        <Text style={styles.hint}>
          Do you want to make this your macro goal and replace your current one?
          {summary.tdeeKnown && (
            <>
              {'\n\n'}
              You burn {summary.tdee.toLocaleString()} calories a day.{' '}
              {summary.maintain
                ? 'By following this goal, you will maintain your current weight.'
                : `By following this goal, you will have a ${summary.direction} of ${summary.diffKcal.toLocaleString()} calories a day.`}
            </>
          )}
          {summary.tdeeKnown && !summary.maintain && (
            <>
              {'\n\n'}This means you will {summary.verb}
              {'\n'}
              <Text style={styles.bold}>
                {summary.dailyKg} kg or {summary.dailyLb} lbs
              </Text>{' '}
              a day{'\n'}
              Or{'\n'}
              <Text style={styles.bold}>
                {summary.twoWeekKg} kg or {summary.twoWeekLb} lbs
              </Text>{' '}
              in 2 weeks
            </>
          )}
        </Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>

      {mode === 'save' ? (
        <View style={styles.saveModeButtons}>
          <View style={styles.saveModeRow}>
            <TouchableOpacity
              style={[styles.noBtn, busy && styles.navBtnDisabled]}
              onPress={onCancel}
              disabled={busy}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text style={[styles.noBtnText, busy && styles.navBtnTextDisabled]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveOnlyBtn, busy && styles.navBtnDisabled]}
              onPress={handleSaveOnly}
              disabled={busy}
              accessibilityRole="button"
              accessibilityLabel="Save the goal without following it"
            >
              <Text style={styles.saveOnlyBtnText}>{busyAction === 'saveOnly' ? 'Saving…' : 'Save the goal'}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.saveAndFollowBtn, busy && styles.navBtnDisabled]}
            onPress={handleSaveAndFollow}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Save and follow this goal"
          >
            <Text style={styles.yesBtnText}>{busyAction === 'saveAndFollow' ? 'Saving…' : 'Save and follow'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.noBtn, busy && styles.navBtnDisabled]}
            onPress={onCancel}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="No, don't follow this goal"
          >
            <Text style={[styles.noBtnText, busy && styles.navBtnTextDisabled]}>No</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.yesBtn, busy && styles.navBtnDisabled]}
            onPress={handleYes}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Yes, follow this goal"
          >
            <Text style={styles.yesBtnText}>{busyAction === 'confirm' ? 'Following…' : 'Yes'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7fa', padding: 16 },
  scrollContent: { paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#1a1a1a', marginTop: 8, marginBottom: 4, textAlign: 'center' },
  goalName: { fontSize: 17, fontWeight: '600', color: '#4f8ef7', marginBottom: 16, textAlign: 'center' },
  chartWrap: { alignItems: 'center', marginTop: 8, marginBottom: 16 },
  hint: { fontSize: 15, color: '#777', textAlign: 'center', lineHeight: 21, paddingHorizontal: 8 },
  bold: { fontWeight: '700', color: '#1a1a1a' },
  errorText: { color: '#e0533d', fontSize: 14, textAlign: 'center', marginTop: 12 },
  navRow: { flexDirection: 'row', paddingTop: 12, gap: 10 },
  saveModeButtons: { paddingTop: 12 },
  saveModeRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  noBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3e3e8',
  },
  noBtnText: { fontSize: 17, fontWeight: '600', color: '#555' },
  yesBtn: { flex: 2, paddingVertical: 14, borderRadius: 10, alignItems: 'center', backgroundColor: '#4f8ef7' },
  yesBtnText: { color: '#fff', fontWeight: '700', fontSize: 17 },
  saveOnlyBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4f8ef7',
  },
  saveOnlyBtnText: { color: '#4f8ef7', fontSize: 16, fontWeight: '700' },
  saveAndFollowBtn: { paddingVertical: 14, borderRadius: 10, alignItems: 'center', backgroundColor: '#4f8ef7' },
  navBtnDisabled: { opacity: 0.4 },
  navBtnTextDisabled: { color: '#aaa' },
});
