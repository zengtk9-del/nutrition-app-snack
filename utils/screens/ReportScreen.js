import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Card, SummaryRow, optionLabel, GOAL_NOTE, DEFAULT_GOAL_NAME } from '../components/ReportPieces';
import MacroDonutChart from '../components/MacroDonutChart';
import SaveGoalModal from '../components/SaveGoalModal';

// This is the one-page summary — a compact recap of everything the report
// covers, with the "Save These Goals" button. It's reached either by
// finishing the multi-page walkthrough (screens/ReportPagesScreen.js) or
// by tapping "Skip to Summary" partway through it; Card/SummaryRow/
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
export default function ReportScreen({ profile, answers, report, onDone, onSaveGoal, atCap }) {
  const { bmr, tdee, calorieTarget, macros, timeline } = report;
  const [showSaveModal, setShowSaveModal] = useState(false);

  // --- Cases where there's no normal deficit/surplus report to show ---
  if (calorieTarget.capped === 'needs_professional_guidance') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          <Text style={styles.title}>Let's hold off on a number here</Text>
          <Card>
            <Text style={styles.cautionText}>
              You told us you've been underweight before and that your goal is to lose more
              weight. That's not something we're comfortable turning into an automatic
              calorie target — please talk to a doctor or registered dietitian before pursuing
              further weight loss. They can look at your full history in a way this app can't.
            </Text>
          </Card>
        </ScrollView>
        <TouchableOpacity style={styles.doneBtn} onPress={onDone}>
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isMinor = calorieTarget.capped === 'minor';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={styles.title}>Your Plan</Text>

        {isMinor && (
          <Card>
            <Text style={styles.cautionText}>
              Since you're under 18, we're only showing a maintenance target for now, not a
              weight-loss or weight-gain plan — that's something to work out with a parent or
              doctor rather than an app.
            </Text>
          </Card>
        )}

        {/* --- 1. Daily Target --- */}
        <Card title="Daily Target">
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
        </Card>

        {/* --- 2. Calorie Breakdown --- */}
        <Card title="Calorie Breakdown">
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
        </Card>

        {/* --- 3. Estimated Timeline --- */}
        {timeline && (
          <Card title="Estimated Timeline">
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
          </Card>
        )}

        {/* --- 4. Your Profile --- */}
        <Card title="Your Profile">
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
        </Card>

        {/* --- 5. How We Built Your Plan --- */}
        <Card title="How We Built Your Plan">
          <Text style={styles.explainText}>
            We estimated your metabolism using your age, sex, height, weight, body fat, activity
            level and training. As you log meals and your weight, we'll automatically adjust your
            calorie target.
          </Text>
        </Card>

        {/* --- 6. Next Steps --- */}
        {macros && (
          <Card title="Next Steps">
            <Text style={styles.checklistItem}>✅ Eat {calorieTarget.calories.toLocaleString()} kcal/day</Text>
            <Text style={styles.checklistItem}>✅ Reach {macros.proteinG}g protein</Text>
            <Text style={styles.checklistItem}>✅ Log meals</Text>
            <Text style={styles.checklistItem}>✅ Weigh yourself 3–7 times/week</Text>
          </Card>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.doneBtn} onPress={() => setShowSaveModal(true)}>
        <Text style={styles.doneBtnText}>Save These Goals</Text>
      </TouchableOpacity>

      <SaveGoalModal
        visible={showSaveModal}
        defaultName={DEFAULT_GOAL_NAME[profile.goal] || 'My nutrition plan'}
        atCap={atCap}
        onCancel={() => setShowSaveModal(false)}
        onConfirm={onSaveGoal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7fa', padding: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#1a1a1a', marginBottom: 12, marginTop: 8 },
  cautionText: { fontSize: 16, color: '#333', lineHeight: 22 },
  calorieNumber: { fontSize: 34, fontWeight: '800', color: '#4f8ef7', textAlign: 'center', marginBottom: 14 },
  smallNote: { fontSize: 14, color: '#777', fontStyle: 'italic', marginTop: 8, textAlign: 'center' },
  breakdownExplain: { fontSize: 14, color: '#888', marginBottom: 12 },
  timelineText: { fontSize: 17, fontWeight: '600', color: '#1a1a1a', marginBottom: 4 },
  explainText: { fontSize: 16, color: '#333', lineHeight: 22 },
  checklistItem: { fontSize: 16, color: '#1a1a1a', marginBottom: 8 },
  doneBtn: { backgroundColor: '#4f8ef7', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  doneBtnText: { color: '#fff', fontWeight: '700', fontSize: 17 },
});
