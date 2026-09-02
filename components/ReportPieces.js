import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { QUIZ_STEPS } from '../data/quizQuestions';

// Small building blocks shared between the report's one-page summary
// (screens/ReportScreen.js) and the multi-page walkthrough
// (screens/ReportPagesScreen.js) — kept in one place so a visual tweak to
// what a "Card" or a stat row looks like only ever needs to happen here,
// not in two files that could quietly drift apart from each other.

// Looks a chosen option's display label back up from the same QUIZ_STEPS
// data the quiz itself used to ask the question — so any report screen's
// profile summary can never drift out of sync with whatever the quiz is
// currently worded as (reword a question once, every screen updates).
export function optionLabel(stepKey, value) {
  const step = QUIZ_STEPS.find((s) => s.key === stepKey);
  if (!step || !step.options) return value;
  const opt = step.options.find((o) => o.value === value);
  return opt ? opt.label : value;
}

export function SummaryRow({ label, value }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

export function Card({ title, children }) {
  return (
    <View style={styles.card}>
      {title ? <Text style={styles.cardTitle}>{title}</Text> : null}
      {children}
    </View>
  );
}

export const GOAL_NOTE = {
  lose: 'Based on your goal of losing weight while maintaining muscle.',
  gain: 'Based on your goal of gaining weight while minimizing added fat.',
  maintain: 'Based on your goal of maintaining your current weight.',
};

// The name that's already typed into the "Save this goal" bar (see
// components/SaveGoalModal.js) when a quiz result gets saved — 'gain'
// intentionally reads "gain muscle" rather than just "gain weight" here,
// per Damon's exact wording, even though GOAL_NOTE above talks about
// "gaining weight while minimizing added fat" — different piece of copy,
// same underlying goal key.
export const DEFAULT_GOAL_NAME = {
  lose: 'My nutrition plan to lose weight',
  gain: 'My nutrition plan to gain muscle',
  maintain: 'My nutrition plan to maintain weight',
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 14 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 10 },
  // alignItems: 'flex-start' (rather than the default 'stretch'/'center') plus
  // flex: 1 on the label below lets a long label (e.g. "Calories your body
  // burns at complete rest (BMR)") wrap onto multiple lines without pushing
  // the value off the right edge of the row — short labels are unaffected.
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  summaryLabel: { fontSize: 16, color: '#555', fontWeight: '600', flex: 1, marginRight: 10 },
  summaryValue: { fontSize: 16, color: '#1a1a1a', fontWeight: '700' },
});
