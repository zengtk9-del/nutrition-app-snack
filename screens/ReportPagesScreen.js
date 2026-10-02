import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { optionLabel, GOAL_NOTE } from '../components/ReportPieces';
import MacroDonutChart, { MACRO_COLORS, thicknessForCalories } from '../components/MacroDonutChart';
import { ReportBoard, ReportChrome, boardText as T } from '../components/ReportBoard';
import { REPORT_BOARD } from '../data/brandArt';
import { commit } from '../utils/haptics';
import { COLORS } from '../utils/theme';

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
// pages normally, just with an extra caution line on the first page.
//
// ---------------------------------------------------------------------
// THE REDESIGN (v0.5.8)
//
// Every page is now the same picture: a whiteboard with the broccoli
// standing at its lower-left corner, pointer raised. components/
// ReportBoard.js owns that picture and the rule that comes with it —
// the board's bottom-left corner belongs to him, so each page here
// supplies a TOP block (full width) and, if it has one, a LOWER block
// (indented past him). Nothing in this file positions him, sizes the
// board, or decides where the keep-clear line falls; it only decides
// what is written where.
//
// WHAT CHANGED AND WHAT DID NOT. Every word and every number on these
// pages is the same as before the redesign, computed the same way from
// the same report object. Damon's mockups carry one sample profile's
// figures (3,079 kcal, 113/503/68 g, 0.4 kg/week, 25 / Male / 5'8");
// those are samples, and the app goes on working its own out.
const PAGE_TITLES = {
  target: 'Daily Target',
  breakdown: 'Calorie Breakdown',
  timeline: 'Estimated Timeline',
  profile: 'Your Profile',
  how: 'How We Built Your Plan',
  next: 'Next Steps',
};

// The ring on page 1. Sized so the widest it can ever get — a 5,000 kcal
// target, where MacroDonutChart's calorie-driven thickness peaks — still
// fits the board's interior width on a 393pt phone, and so the ordinary
// 2,000–3,000 kcal case fills roughly the share of the board Damon's
// mockup gives it. `tightStage` is what makes that true: without it the
// ring would reserve the 5,000 kcal footprint on every page regardless
// of the number actually on it.
// The ring on page 1, sized as a share of the board rather than in
// points, because the board is a share of the phone.
//
// MacroDonutChart's ring GROWS WITH THE NUMBER IN IT -- 0.16 to 0.5 of
// `size`, which was Damon's "make the change in size more drastic, use
// the space" -- so one `size` produces a ring anywhere from 0.95x to
// 1.46x that wide. Sizing for the middle would let a 5,000 kcal plan
// push the board taller than the other five pages', which is the one
// thing this design does not allow; sizing for the largest would leave
// an ordinary target drawing a small ring in a big board, well under
// the share of it the mockup gives the wheel.
//
// So: size it for the ordinary case, and CAP the thickness so the
// biggest targets stop growing rather than overflow. The cap only bites
// above about 3,500 kcal, which leaves the whole range most people are
// in still saying what it is meant to say.
const DONUT_SHARE = 0.62;

// The pale disc behind each of the timeline page's two milestone icons.
// MacroDonutChart's hole is a fixed share of `size` (HOLE_RATIO), and
// the ring grows outward from it, so the outer edge is hole + 2x
// thickness. Repeated here rather than exported because the cap above
// is the only thing that needs it and it has not moved since v0.0.79.
const DONUT_HOLE = 0.46;
// The frame's border and the surface's, top and bottom, which sit
// between REPORT_BOARD's figures and the space text actually gets.
const BOARD_BORDERS = 3;

const MILESTONE_ICON = 38;

// The three macro rows. MacroDonutChart draws its own legend under its
// ring and every other screen wants that one; this page does not,
// because the board's room for them is the lower-right corner beside
// the teacher, at the board's own type size rather than the chart's.
// Same colours, same percentages, from the same source.
function Legend({ macros }) {
  const kcal = { protein: macros.proteinG * 4, carbs: macros.carbsG * 4, fat: macros.fatG * 9 };
  const total = kcal.protein + kcal.carbs + kcal.fat;
  const rows = [
    ['protein', 'Protein', macros.proteinG],
    ['carbs', 'Carbs', macros.carbsG],
    ['fat', 'Fat', macros.fatG],
  ];
  return (
    <View>
      {rows.map(([key, label, grams]) => (
        <View key={key} style={styles.legendRow}>
          <View style={[styles.swatch, { backgroundColor: MACRO_COLORS[key] }]} />
          <Text style={styles.legendLabel} numberOfLines={1}>
            {label}
          </Text>
          <Text style={styles.legendValue} numberOfLines={1}>
            {grams}g ({total > 0 ? Math.round((kcal[key] / total) * 100) : 0}%)
          </Text>
        </View>
      ))}
    </View>
  );
}

function ProfileRow({ label, value, last }) {
  return (
    <View>
      <View style={styles.profileRow}>
        <Text style={T.rowLabel}>{label}</Text>
        <Text style={[T.rowValue, styles.profileValue]}>{value}</Text>
      </View>
      {last ? null : <View style={T.divider} />}
    </View>
  );
}

function Milestone({ icon, lead, children }) {
  return (
    <View style={styles.milestone}>
      <View style={styles.milestoneIcon}>
        <MaterialCommunityIcons name={icon} size={22} color={COLORS.accent} />
      </View>
      <View style={styles.milestoneText}>
        <Text style={T.heading}>{lead}</Text>
        <Text style={styles.milestoneFigure}>{children}</Text>
      </View>
    </View>
  );
}

function CheckRow({ children }) {
  return (
    <View style={styles.checkRow}>
      <View style={styles.checkBox}>
        <MaterialCommunityIcons name="check-bold" size={13} color="#fff" />
      </View>
      <Text style={styles.checkText}>{children}</Text>
    </View>
  );
}

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

  // Clamped, because `pages` is five long rather than six for anyone
  // with no timeline (a maintain goal, or no goal weight) and the
  // harness can ask for a page number from the six-page case.
  const [rawIndex, setPageIndex] = useState(initialPageIndex);
  const pageIndex = Math.max(0, Math.min(rawIndex, pages.length - 1));
  const page = pages[pageIndex];

  // THE ONE PLACE NAVIGATION BUZZES (v0.6.6), at Damon's call.
  //
  // utils/haptics.js argues at length that moving around an app should
  // be silent, and everywhere else it is. The report is the exception
  // he asked for, and the reason it holds up is that these six pages
  // are not navigation — they are a presentation being delivered one
  // beat at a time, by a broccoli with a pointer. A press here is "and
  // now this", not "take me somewhere".
  //
  // On the last page the button says See Summary and finishes the
  // walkthrough instead of turning a page. Same button, same press, so
  // the same beat; stopping one short of the end would read as the
  // feature breaking rather than as a distinction.
  //
  // Back stays silent: going back is correcting, not arriving.
  const goNext = () => {
    commit();
    if (pageIndex < pages.length - 1) {
      setPageIndex(pageIndex + 1);
    } else {
      onFinishPages();
    }
  };

  const goBack = () => {
    if (pageIndex > 0) setPageIndex(pageIndex - 1);
  };

  // --- What each page writes on the board ---------------------------
  //
  // `top` is the full-width upper board. `lower` is the bottom-right
  // corner, clear of the teacher; a page with nothing to put there
  // leaves it empty and the board keeps its reserved white space, the
  // way pages 4 and 6 do in the mockups.
  const boardFor = () => {
    if (page === 'target') {
      return {
        top: (boardW) => {
          if (!macros) {
            return (
              <Text style={styles.plainCalories}>
                {calorieTarget.calories.toLocaleString()} kcal/day
              </Text>
            );
          }
          const size = Math.round(boardW * DONUT_SHARE);
          // The room the ring actually has: the board's upper area, which
          // is everything above the corner the teacher stands in.
          const room =
            boardW *
              (REPORT_BOARD.frameH - REPORT_BOARD.padTop - REPORT_BOARD.textPad - REPORT_BOARD.keepH) -
            2 * BOARD_BORDERS;
          const cap = (room - size * DONUT_HOLE) / 2;
          return (
            <MacroDonutChart
              calories={calorieTarget.calories}
              proteinG={macros.proteinG}
              carbsG={macros.carbsG}
              fatG={macros.fatG}
              size={size}
              thickness={Math.min(thicknessForCalories(calorieTarget.calories, size), cap)}
              legend={false}
              tightStage
            />
          );
        },
        lower: (
          <View>
            {macros ? <Legend macros={macros} /> : null}
            <Text style={[T.note, styles.goalNote]}>
              {isMinor ? 'A maintenance-level target for now.' : GOAL_NOTE[profile.goal]}
            </Text>
            {isMinor ? (
              <Text style={[T.note, styles.goalNote]}>
                Since you're under 18, we're only showing a maintenance target for now, not a
                weight-loss or weight-gain plan — that's something to work out with a parent or
                doctor rather than an app.
              </Text>
            ) : null}
            {calorieTarget.capped === 'safety_floor' ? (
              <Text style={[T.note, styles.goalNote]}>
                We capped this a bit higher than a straight-line calculation would suggest, to
                keep it at a safe minimum — it'll just take a little longer to reach your goal.
              </Text>
            ) : null}
          </View>
        ),
        lowerAlign: 'flex-start',
        topFill: true,
      };
    }

    if (page === 'breakdown') {
      return {
        top: (
          <View>
            <Text style={T.heading}>Calories your body burns at complete rest (BMR)</Text>
            <Text style={styles.figureLine}>
              <Text style={T.figure}>{bmr.toLocaleString()}</Text>
              <Text style={T.figureUnit}> kcal/day</Text>
            </Text>
            <Text style={T.body}>
              This is how many calories your body burns just to keep you alive—even if you stayed
              in bed all day.
            </Text>
            <View style={[T.divider, styles.sectionRule]} />
            <Text style={T.heading}>Calories you burn in a typical day (TDEE)</Text>
            <Text style={styles.figureLine}>
              <Text style={T.figure}>{tdee.toLocaleString()}</Text>
              <Text style={T.figureUnit}> kcal/day</Text>
            </Text>
            <Text style={T.body}>
              This includes your BMR plus your daily movement, work, walking, and exercise.
            </Text>
          </View>
        ),
        lower: (
          <View style={T.panel}>
            <Text style={T.heading}>Your target calories</Text>
            <Text style={styles.figureLine}>
              <Text style={[T.figure, T.blue]}>{calorieTarget.calories.toLocaleString()}</Text>
              <Text style={[T.figureUnit, T.blue]}> kcal/day</Text>
            </Text>
            <Text style={T.body}>
              {profile.goal === 'lose' && !isMinor
                ? `Since your goal is to lose weight, we recommend eating ${calorieTarget.delta.toLocaleString()} fewer calories than you burn each day.`
                : null}
              {profile.goal === 'gain' && !isMinor
                ? `We recommend eating ${calorieTarget.delta.toLocaleString()} more calories than you burn each day.`
                : null}
              {profile.goal === 'maintain' || isMinor
                ? 'This matches the calories you burn each day.'
                : null}
            </Text>
          </View>
        ),
        lowerAlign: 'flex-end',
      };
    }

    if (page === 'timeline') {
      return {
        top: (
          <View>
            <Milestone icon="finance" lead={profile.goal === 'lose' ? 'Lose about' : 'Gain about'}>
              <Text style={T.blue}>{timeline.weeklyRateKg} kg/week</Text>
            </Milestone>
            {/* The pace, as a line with a bead on it — the mockup's
                "simple horizontal progress/timeline line as visual
                support". It marks a start, not a position: nothing has
                happened yet on the day this report is written. */}
            <View style={styles.paceRow}>
              <View style={styles.paceBead} />
              <View style={styles.paceLine} />
              {[0, 1, 2, 3].map((i) => (
                <React.Fragment key={i}>
                  {i ? <View style={styles.paceGap} /> : null}
                  <View style={styles.paceDot} />
                </React.Fragment>
              ))}
            </View>
            <Milestone icon="flag-variant" lead="Reach">
              <Text style={T.blue}>{Math.round(profile.goalWeightKg)} kg</Text>
              <Text style={styles.milestoneJoin}> in about </Text>
              <Text style={T.blue}>{timeline.weeksToGoal} weeks</Text>
            </Milestone>
          </View>
        ),
        lower: (
          <Text style={[T.note, styles.disclaimer]}>
            This is a starting estimate, not a promise — it automatically recalculates every time
            you log a new weight, since your numbers change as your weight does.
          </Text>
        ),
        lowerAlign: 'center',
      };
    }

    if (page === 'profile') {
      const rows = [
        ['Age', `${profile.age}`],
        ['Sex', optionLabel('sex', profile.sex)],
        [
          'Height',
          answers.heightUnit === 'cm'
            ? `${Math.round(profile.heightCm)} cm`
            : `${answers.heightFeet}' ${answers.heightInches}"`,
        ],
        [
          'Weight',
          answers.weightUnit === 'lb'
            ? `${answers.weightLb ?? Math.round(profile.weightKg / 0.453592)} lbs`
            : `${Math.round(profile.weightKg)} kg`,
        ],
        ['Estimated body fat', `${profile.bodyFatPercent}%`],
        ['Activity', optionLabel('activityLevel', profile.activityLevel)],
        [
          'Training',
          profile.training.length === 0
            ? 'None'
            : profile.training.map((t) => optionLabel('training', t)).join(', '),
        ],
        ['Diet', optionLabel('diet', profile.diet)],
      ];
      return {
        top: (
          <View>
            {rows.map(([label, value], i) => (
              <ProfileRow key={label} label={label} value={value} last={i === rows.length - 1} />
            ))}
          </View>
        ),
        lower: null,
      };
    }

    if (page === 'how') {
      return {
        top: (
          <View>
            <Text style={T.big}>
              <Text style={styles.howLead}>We estimated your metabolism</Text> using your age, sex,
              height, weight, body fat, activity level and training.
            </Text>
            <MaterialCommunityIcons
              name="subdirectory-arrow-right"
              size={34}
              color={COLORS.accent}
              style={styles.howArrow}
            />
          </View>
        ),
        lower: (
          <View style={T.panel}>
            <Text style={styles.howPanelText}>
              As you log meals and your weight, we'll{' '}
              <Text style={styles.howPanelBold}>automatically adjust your calorie target.</Text>
            </Text>
          </View>
        ),
        lowerAlign: 'flex-end',
      };
    }

    if (page === 'next') {
      return {
        top: (
          <View>
            {macros ? (
              <React.Fragment>
                <CheckRow>Eat {calorieTarget.calories.toLocaleString()} kcal/day</CheckRow>
                <CheckRow>Reach {macros.proteinG}g protein</CheckRow>
              </React.Fragment>
            ) : (
              <CheckRow>Eat {calorieTarget.calories.toLocaleString()} kcal/day</CheckRow>
            )}
            <CheckRow>Log meals</CheckRow>
            <CheckRow>Weigh yourself 3–7 times/week</CheckRow>
          </View>
        ),
        lower: null,
      };
    }

    return { top: null, lower: null };
  };

  const board = boardFor();
  const isLast = pageIndex === pages.length - 1;

  return (
    <ReportChrome
      progress={(pageIndex + 1) / pages.length}
      pageLabel={`Page ${pageIndex + 1} of ${pages.length}`}
      title={PAGE_TITLES[page]}
      onSkip={onSkipToSummary}
      onBack={pageIndex > 0 ? goBack : null}
      nextLabel={isLast ? 'See Summary' : 'Next'}
      onNext={goNext}
      testID="report-pages"
    >
      {/* The board is normally taller than it needs to be and shorter
          than the screen, so nothing scrolls. The ScrollView is for the
          cases where that stops being true — a small phone, or a page
          whose real answers ran long enough to push the board past the
          glass. `flexGrow: 1` keeps the button on the bottom edge either
          way. */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollBody}
        showsVerticalScrollIndicator={false}
      >
        <ReportBoard
          top={board.top}
          lower={board.lower}
          lowerAlign={board.lowerAlign || 'center'}
          topFill={!!board.topFill}
          testID={`board-${page}`}
        />
      </ScrollView>
    </ReportChrome>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollBody: { flexGrow: 1 },

  // --- page 1, Daily Target ---
  plainCalories: {
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.accent,
    textAlign: 'center',
    marginTop: 30,
  },
  goalNote: { marginTop: 10, textAlign: 'center' },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 9 },
  swatch: { width: 11, height: 11, borderRadius: 3, marginRight: 9, flexShrink: 0 },
  legendLabel: { flex: 1, minWidth: 0, fontSize: 14, fontWeight: '700', color: COLORS.text },
  legendValue: { flexShrink: 0, marginLeft: 8, fontSize: 14, fontWeight: '700', color: COLORS.textSoft },

  // --- page 2, Calorie Breakdown ---
  // The number and its unit are one Text so they sit on one baseline;
  // this is the line's own spacing around it.
  figureLine: { marginTop: 1, marginBottom: 3 },
  sectionRule: { marginVertical: 11 },

  // --- page 3, Estimated Timeline ---
  milestone: { flexDirection: 'row', alignItems: 'center' },
  milestoneIcon: {
    width: MILESTONE_ICON,
    height: MILESTONE_ICON,
    borderRadius: MILESTONE_ICON / 2,
    backgroundColor: '#e2eefc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  milestoneText: { flex: 1, minWidth: 0 },
  // 21, where the mockup sets it at 24: the icon and its gap take 49 of
  // the board's 255pt here against 300 there, and "69 kg in about 11
  // weeks" has to stay on one line at three digits of weight and three
  // of weeks.
  milestoneFigure: { fontSize: 21, fontWeight: '900', color: COLORS.text, letterSpacing: -0.4 },
  milestoneJoin: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  // A bead, a run of line, then four beads still to come. The line and
  // the three gaps after it share the leftover width 1.55 : 1 : 1 : 1,
  // which is the proportion the mockup's own line runs to.
  paceRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, paddingLeft: 4 },
  paceBead: { width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.accent },
  paceLine: { flex: 1.55, height: 4, backgroundColor: COLORS.accent },
  paceGap: { flex: 1 },
  paceDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#dbe6f4' },
  disclaimer: { textAlign: 'right' },

  // --- page 4, Your Profile ---
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 5,
  },
  // flexShrink + minWidth: 0 is what lets a long answer ("Cardio,
  // Lifting, Sports & Other Activities") wrap onto a second line
  // instead of overflowing the row — RN defaults a flex item's minimum
  // width to its own content size, which would force the overflow.
  profileValue: { flexShrink: 1, minWidth: 0, marginLeft: 14 },

  // --- page 5, How We Built Your Plan ---
  howLead: { fontWeight: '900' },
  // The mockup's small blue arrow linking the paragraph to the panel it
  // introduces, so it leans towards the panel's corner rather than
  // sitting under the middle of the text.
  howArrow: { alignSelf: 'flex-end', marginTop: 10, marginRight: 30 },
  howPanelText: { fontSize: 14, fontWeight: '500', color: COLORS.text, lineHeight: 20 },
  howPanelBold: { fontWeight: '900' },

  // --- page 6, Next Steps ---
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 17 },
  checkBox: {
    width: 21,
    height: 21,
    borderRadius: 6,
    backgroundColor: COLORS.good,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  checkText: { flex: 1, minWidth: 0, fontSize: 15.5, fontWeight: '700', color: COLORS.text },
});
