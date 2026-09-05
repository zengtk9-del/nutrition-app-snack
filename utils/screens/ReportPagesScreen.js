import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Card, SummaryRow, optionLabel, GOAL_NOTE } from '../components/ReportPieces';
import MacroDonutChart from '../components/MacroDonutChart';

// The default landing spot right after finishing the quiz: the same
// report content as the one-page summary (screens/ReportScreen.js), but
// walked through one section at a time. "Skip to Summary" is available on
// every page for anyone who just wants the compact recap; finishing the
// last page lands on that same summary too — this screen is purely an
// optional, slower-paced tour before it, never a replacement for it.
//
// This never runs for the "needs professional guidance" caution state —
// App.js sends that one straight to the one-page summary instead, since
// there isn't a real page-by-page numeric story to walk through when there's
// no calorie number at all. The "minor" caution state is different: it does
// still have a real (maintenance-level) number, so it walks through these
// pages normally, just with an extra caution card on the first page.
const PAGE_TITLES = {
  target: 'Daily Target',
  breakdown: 'Calorie Breakdown',
  timeline: 'Estimated Timeline',
  profile: 'Your Profile',
  how: 'How We Built Your Plan',
  next: 'Next Steps',
};

export default function ReportPagesScreen({
  profile,
  answers,
  report,
  onSkipToSummary,
  onFinishPages,
  // Test-only, like QuizScreen's initialStepIndex — lets the local render
  // harness land directly on a specific page instead of always starting at
  // page 0. App.js never passes this, so normal app behavior is unchanged.
  initialPageIndex = 0,
}) {
  const { bmr, tdee, calorieTarget, macros, timeline } = report;
  const isMinor = calorieTarget.capped === 'minor';

  const pages = useMemo(() => {
    const list = ['target', 'breakdown'];
    if (timeline) list.push('timeline');
    list.push('profile', 'how', 'next');
    return list;
  }, [timeline]);

  const [pageIndex, setPageIndex] = useState(initialPageIndex);
  const page = pages[pageIndex];

  const goNext = () => {
    if (pageIndex < pages.length - 1) {
      setPageIndex(pageIndex + 1);
    } else {
      onFinishPages();
    }
  };

  const goBack = () => {
    if (pageIndex > 0) setPageIndex(pageIndex - 1);
  };

  const renderPageBody = () => {
    if (page === 'target') {
      return (
        <Card>
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
      );
    }

    if (page === 'breakdown') {
      return (
        <Card>
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
      );
    }

    if (page === 'timeline') {
      return (
        <Card>
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
      );
    }

    if (page === 'profile') {
      return (
        <Card>
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
      );
    }

    if (page === 'how') {
      return (
        <Card>
          <Text style={styles.explainText}>
            We estimated your metabolism using your age, sex, height, weight, body fat, activity
            level and training. As you log meals and your weight, we'll automatically adjust your
            calorie target.
          </Text>
        </Card>
      );
    }

    if (page === 'next') {
      return (
        <Card>
          {macros && (
            <>
              <Text style={styles.checklistItem}>
                ✅ Eat {calorieTarget.calories.toLocaleString()} kcal/day
              </Text>
              <Text style={styles.checklistItem}>✅ Reach {macros.proteinG}g protein</Text>
            </>
          )}
          <Text style={styles.checklistItem}>✅ Log meals</Text>
          <Text style={styles.checklistItem}>✅ Weigh yourself 3–7 times/week</Text>
        </Card>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.round(((pageIndex + 1) / pages.length) * 100)}%` },
            ]}
          />
        </View>
        <TouchableOpacity onPress={onSkipToSummary}>
          <Text style={styles.skipText}>Skip to Summary</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.progressLabel}>
        Page {pageIndex + 1} of {pages.length}
      </Text>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={styles.title}>{PAGE_TITLES[page]}</Text>

        {isMinor && page === 'target' && (
          <Card>
            <Text style={styles.cautionText}>
              Since you're under 18, we're only showing a maintenance target for now, not a
              weight-loss or weight-gain plan — that's something to work out with a parent or
              doctor rather than an app.
            </Text>
          </Card>
        )}

        {renderPageBody()}
      </ScrollView>

      <View style={styles.navRow}>
        {pageIndex > 0 && (
          <TouchableOpacity style={styles.backBtn} onPress={goBack}>
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
          <Text style={styles.nextBtnText}>
            {pageIndex === pages.length - 1 ? 'See Summary' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7fa', padding: 16 },
  topRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#e3e3e8',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: { height: 6, backgroundColor: '#4f8ef7' },
  skipText: { fontSize: 15, color: '#4f8ef7', fontWeight: '600' },
  progressLabel: { fontSize: 14, color: '#999', marginTop: 6, marginBottom: 8 },
  scroll: { flex: 1 },
  title: { fontSize: 26, fontWeight: '700', color: '#1a1a1a', marginBottom: 12, marginTop: 8 },
  cautionText: { fontSize: 16, color: '#333', lineHeight: 22 },
  calorieNumber: { fontSize: 34, fontWeight: '800', color: '#4f8ef7', textAlign: 'center', marginBottom: 14 },
  smallNote: { fontSize: 14, color: '#777', fontStyle: 'italic', marginTop: 8, textAlign: 'center' },
  breakdownExplain: { fontSize: 14, color: '#888', marginBottom: 12 },
  timelineText: { fontSize: 17, fontWeight: '600', color: '#1a1a1a', marginBottom: 4 },
  explainText: { fontSize: 16, color: '#333', lineHeight: 22 },
  checklistItem: { fontSize: 16, color: '#1a1a1a', marginBottom: 8 },
  navRow: { flexDirection: 'row', paddingTop: 12, gap: 10 },
  backBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3e3e8',
  },
  backBtnText: { fontSize: 17, fontWeight: '600', color: '#555' },
  nextBtn: { flex: 2, paddingVertical: 14, borderRadius: 10, alignItems: 'center', backgroundColor: '#4f8ef7' },
  nextBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});
