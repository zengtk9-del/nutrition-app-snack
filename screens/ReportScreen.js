import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SummaryRow, optionLabel, GOAL_NOTE, DEFAULT_GOAL_NAME } from '../components/ReportPieces';
import MacroDonutChart from '../components/MacroDonutChart';
import SaveGoalModal from '../components/SaveGoalModal';
import { ReportChrome } from '../components/ReportBoard';
import { COLORS, RADIUS, SHADOW } from '../utils/theme';

// This is the one-page summary — a compact recap of everything the report
// covers, with the "Save These Goals" button. It's reached either by
// finishing the multi-page walkthrough (screens/ReportPagesScreen.js) or
// by tapping "Skip to Summary" partway through it; SummaryRow/
// optionLabel/GOAL_NOTE live in components/ReportPieces.js so both screens
// share the exact same building blocks.
//
// `onDone` and `onSaveGoal` are two different exits, for two different
// cases: the "needs professional guidance" case below has no calorie
// number at all, so there's nothing to name/save — its "Done" button just
// calls `onDone` directly, same as always. The normal case's "Save These
// Goals" button now opens SaveGoalModal first instead of calling onDone
// straight away; `onSaveGoal(name)` (called once that modal's own Save is
// confirmed) is what actually persists this as one of up to 5 named saved
// goals and finishes the quiz flow — see handleSaveQuizGoal in App.js.
//
// ---------------------------------------------------------------------
// WHY THIS SCREEN HAS NO WHITEBOARD (v0.5.8)
//
// The report's six pages were redesigned onto one: a board with the
// broccoli teaching from it. Damon's design pack covers those six and
// stops — this seventh screen, the one you actually land on and save
// from, has no mockup.
//
// So it takes the pack's page (background, discs, title, the one
// full-width button) and keeps plain cards inside it. Six boards stacked
// down a scroll would be six teachers pointing at six things, and the
// board's whole premise is that it is the thing you are looking at.
// The summary's premise is the opposite: everything at once, briefly.
// If a mockup for it ever turns up, the chrome is already shared and
// only what is inside these cards has to change.
function Section({ title, children }) {
  return (
    <View style={styles.card}>
      {title ? <Text style={styles.cardTitle}>{title}</Text> : null}
      {children}
    </View>
  );
}

// `viewOnly` (v0.6.0): this report was reopened from the Home tab's "See
// my personal report" rather than produced by the quiz just now. The
// numbers are identical; what changes is the way out. Saving again would
// add a second copy of a plan already saved, against a cap of five, and
// would switch what you are following back to it — which is wrong for
// someone who came to re-read their plan and may well be following a
// different goal on purpose. So the button closes instead.
export default function ReportScreen({ profile, answers, report, onDone, onSaveGoal, atCap, viewOnly = false }) {
  const { bmr, tdee, calorieTarget, macros, timeline } = report;
  const [showSaveModal, setShowSaveModal] = useState(false);

  // --- Cases where there's no normal deficit/surplus report to show ---
  if (calorieTarget.capped === 'needs_professional_guidance') {
    return (
      <ReportChrome
        title="Let's hold off on a number here"
        nextLabel="Done"
        nextIcon={null}
        onNext={onDone}
        testID="report-summary"
      >
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollBody}>
          <View style={styles.cautionCard}>
            <MaterialCommunityIcons
              name="shield-alert-outline"
              size={26}
              color={COLORS.warnInk}
              style={styles.cautionIcon}
            />
            <Text style={styles.cautionText}>
              You told us you've been underweight before and that your goal is to lose more
              weight. That's not something we're comfortable turning into an automatic
              calorie target — please talk to a doctor or registered dietitian before pursuing
              further weight loss. They can look at your full history in a way this app can't.
            </Text>
          </View>
        </ScrollView>
      </ReportChrome>
    );
  }

  const isMinor = calorieTarget.capped === 'minor';

  return (
    <ReportChrome
      title="Your Plan"
      nextLabel={viewOnly ? 'Done' : 'Save These Goals'}
      nextIcon={viewOnly ? null : 'content-save-outline'}
      onNext={viewOnly ? onDone : () => setShowSaveModal(true)}
      testID="report-summary"
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollBody}
        showsVerticalScrollIndicator={false}
      >
        {isMinor && (
          <View style={styles.cautionCard}>
            <MaterialCommunityIcons
              name="information-outline"
              size={24}
              color={COLORS.warnInk}
              style={styles.cautionIcon}
            />
            <Text style={styles.cautionText}>
              Since you're under 18, we're only showing a maintenance target for now, not a
              weight-loss or weight-gain plan — that's something to work out with a parent or
              doctor rather than an app.
            </Text>
          </View>
        )}

        {/* --- 1. Daily Target --- */}
        <Section title="Daily Target">
          {macros ? (
            <MacroDonutChart
              calories={calorieTarget.calories}
              proteinG={macros.proteinG}
              carbsG={macros.carbsG}
              fatG={macros.fatG}
            />
          ) : (
            <Text style={styles.calorieNumber}>{calorieTarget.calories.toLocaleString()} kcal/day</Text>
          )}
          <Text style={styles.smallNote}>
            {isMinor ? 'A maintenance-level target for now.' : GOAL_NOTE[profile.goal]}
          </Text>
          {calorieTarget.capped === 'safety_floor' && (
            <Text style={styles.smallNote}>
              We capped this a bit higher than a straight-line calculation would suggest, to
              keep it at a safe minimum — it'll just take a little longer to reach your goal.
            </Text>
          )}
        </Section>

        {/* --- 2. Calorie Breakdown --- */}
        <Section title="Calorie Breakdown">
          <SummaryRow
            label="Calories your body burns at complete rest (BMR)"
            value={`${bmr.toLocaleString()} kcal/day`}
          />
          <Text style={styles.breakdownExplain}>
            This is how many calories your body burns just to keep you alive—even if you stayed
            in bed all day.
          </Text>
          <SummaryRow
            label="Calories you burn in a typical day (TDEE)"
            value={`${tdee.toLocaleString()} kcal/day`}
          />
          <Text style={styles.breakdownExplain}>
            This includes your BMR plus your daily movement, work, walking, and exercise.
          </Text>
          <SummaryRow label="Your target calories" value={`${calorieTarget.calories.toLocaleString()} kcal/day`} />
          <Text style={styles.breakdownExplain}>
            {profile.goal === 'lose' &&
              `Since your goal is to lose weight, we recommend eating ${calorieTarget.delta.toLocaleString()} fewer calories than you burn each day.`}
            {profile.goal === 'gain' &&
              `We recommend eating ${calorieTarget.delta.toLocaleString()} more calories than you burn each day.`}
            {(profile.goal === 'maintain' || isMinor) && 'This matches the calories you burn each day.'}
          </Text>
        </Section>

        {/* --- 3. Estimated Timeline --- */}
        {timeline && (
          <Section title="Estimated Timeline">
            <Text style={styles.timelineText}>
              {profile.goal === 'lose' ? 'Lose' : 'Gain'} about {timeline.weeklyRateKg} kg/week
            </Text>
            <Text style={styles.timelineText}>
              Reach {Math.round(profile.goalWeightKg)} kg in about {timeline.weeksToGoal} weeks
            </Text>
            <Text style={styles.smallNote}>
              This is a starting estimate, not a promise — it automatically recalculates every
              time you log a new weight, since your numbers change as your weight does.
            </Text>
          </Section>
        )}

        {/* --- 4. Your Profile --- */}
        <Section title="Your Profile">
          <SummaryRow label="Age" value={`${profile.age}`} />
          <SummaryRow label="Sex" value={optionLabel('sex', profile.sex)} />
          <SummaryRow
            label="Height"
            value={
              answers.heightUnit === 'cm'
                ? `${Math.round(profile.heightCm)} cm`
                : `${answers.heightFeet}' ${answers.heightInches}"`
            }
          />
          <SummaryRow
            label="Weight"
            value={
              answers.weightUnit === 'lb'
                ? `${answers.weightLb ?? Math.round(profile.weightKg / 0.453592)} lbs`
                : `${Math.round(profile.weightKg)} kg`
            }
          />
          <SummaryRow label="Estimated body fat" value={`${profile.bodyFatPercent}%`} />
          <SummaryRow label="Activity" value={optionLabel('activityLevel', profile.activityLevel)} />
          <SummaryRow
            label="Training"
            value={
              profile.training.length === 0
                ? 'None'
                : profile.training.map((t) => optionLabel('training', t)).join(', ')
            }
          />
          <SummaryRow label="Diet" value={optionLabel('diet', profile.diet)} />
        </Section>

        {/* --- 5. How We Built Your Plan --- */}
        <Section title="How We Built Your Plan">
          <Text style={styles.explainText}>
            We estimated your metabolism using your age, sex, height, weight, body fat, activity
            level and training. As you log meals and your weight, we'll automatically adjust your
            calorie target.
          </Text>
        </Section>

        {/* --- 6. Next Steps --- */}
        {macros && (
          <Section title="Next Steps">
            {[
              `Eat ${calorieTarget.calories.toLocaleString()} kcal/day`,
              `Reach ${macros.proteinG}g protein`,
              'Log meals',
              'Weigh yourself 3–7 times/week',
            ].map((item) => (
              <View key={item} style={styles.checkRow}>
                <MaterialCommunityIcons name="check-circle" size={18} color={COLORS.good} />
                <Text style={styles.checkText}>{item}</Text>
              </View>
            ))}
          </Section>
        )}
      </ScrollView>

      <SaveGoalModal
        visible={showSaveModal}
        defaultName={DEFAULT_GOAL_NAME[profile.goal] || 'My nutrition plan'}
        atCap={atCap}
        onCancel={() => setShowSaveModal(false)}
        onConfirm={onSaveGoal}
      />
    </ReportChrome>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, marginTop: 12, marginBottom: 12 },
  scrollBody: { paddingBottom: 16 },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,
    padding: 16,
    marginBottom: 12,
    ...SHADOW.card,
  },
  cardTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 10 },

  cautionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    backgroundColor: COLORS.warnSoft,
    borderRadius: RADIUS.card,
    padding: 15,
    marginBottom: 12,
  },
  cautionIcon: { marginTop: 1 },
  cautionText: { flex: 1, minWidth: 0, fontSize: 14.5, color: COLORS.text, lineHeight: 21 },

  calorieNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.accent,
    textAlign: 'center',
    marginBottom: 12,
  },
  smallNote: { fontSize: 13, color: COLORS.textMuted, fontStyle: 'italic', marginTop: 8, textAlign: 'center' },
  breakdownExplain: { fontSize: 13, color: COLORS.textSoft, marginBottom: 12, lineHeight: 18 },
  timelineText: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  explainText: { fontSize: 15, color: COLORS.textSoft, lineHeight: 21 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 9 },
  checkText: { flex: 1, minWidth: 0, fontSize: 15, fontWeight: '600', color: COLORS.text },
});
