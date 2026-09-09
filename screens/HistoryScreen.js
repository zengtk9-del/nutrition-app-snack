// The History tab -- the last 7 days, and how each of them scored.
//
// Rebuilt in v0.0.76 against Damon's mockup, on the same theme and the same
// score bands as Today, so a 90 is the same green on both screens.
//
// TWO THINGS THAT ARE EASY TO GET WRONG HERE:
//
// 1. The week average is the average of the days that were LOGGED, not of
//    seven days. An unlogged day is absent, not a zero -- counting it as
//    zero would punish forgetting the app more harshly than eating badly,
//    and would teach people to invent entries rather than skip them. The
//    "n of 7 logged" line is what keeps that honest, so a 92 from two days
//    can't be mistaken for a 92 from seven.
//
// 2. The dot strip is the LAST SEVEN DAYS ending today, not a Monday-to-
//    Sunday calendar week. The mockup showed a calendar week with the days
//    ahead greyed out, which looks good but would have meant the strip, the
//    average and the card list below it each covering a different stretch
//    of time on one screen. Here the hollow dots are days that weren't
//    logged rather than days that haven't happened -- same picture, and it
//    agrees with both the title and the number above it.

import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import foods from '../data/foods';
import { groupEntriesByDate, formatDateKey } from '../utils/nutrition';
import { scoreDay, scoreWeek } from '../utils/score';
import { scoreTone } from '../utils/scoreTone';
import ScoreArc from '../components/ScoreArc';
import { COLORS, TYPE, RADIUS, SPACE, SHADOW } from '../utils/theme';
import { ART_READY, MASCOT } from '../data/brandArt';

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// The last seven dates, oldest first, so the strip reads left to right and
// ends on today.
function lastSevenDays() {
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({ key: formatDateKey(d), label: WEEKDAY[d.getDay()], isToday: i === 0 });
  }
  return out;
}

export default function HistoryScreen({ entries, goals }) {
  const days = groupEntriesByDate(entries, 7).map((day) => ({
    ...day,
    score: scoreDay({ entries: day.entries, totals: day.totals, goals, foods }),
  }));

  const scoreByKey = {};
  for (const d of days) scoreByKey[d.dateKey] = d.score ? d.score.total : null;

  const strip = lastSevenDays().map((d) => ({ ...d, score: scoreByKey[d.key] ?? null }));
  const week = scoreWeek(strip.map((d) => ({ score: d.score })));
  const weekTone = scoreTone(week.average);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View pointerEvents="none" style={s.blobs}>
        <View style={[s.blob, s.blobA]} />
        <View style={[s.blob, s.blobB]} />
        <View style={[s.blob, s.blobC]} />
      </View>

      <View style={s.header}>
        <View style={s.headerText}>
          <Text style={s.title}>Last 7 Days</Text>

          {/* One dot per day. Filled in its score's colour when the day was
              logged, hollow when it wasn't, ringed when it's today. */}
          <View style={s.strip}>
            <View style={s.stripLine} />
            {strip.map((d) => {
              const tone = scoreTone(d.score);
              const logged = d.score != null;
              return (
                <View key={d.key} style={s.stripDay}>
                  <Text style={[s.stripLabel, d.isToday && s.stripLabelToday]}>{d.label}</Text>
                  <View
                    style={[
                      s.dot,
                      logged
                        ? { backgroundColor: tone.ink, borderColor: tone.ink }
                        : { backgroundColor: COLORS.card, borderColor: COLORS.line },
                      d.isToday && s.dotToday,
                    ]}
                  />
                </View>
              );
            })}
          </View>
        </View>

        {ART_READY ? (
          <Image source={MASCOT} style={s.mascot} resizeMode="contain" />
        ) : null}
      </View>

      {days.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyText}>No history yet — log some meals to see them here.</Text>
        </View>
      ) : (
        <>
          <View style={[s.weekCard, { borderLeftColor: weekTone.ink }]}>
            <View style={s.weekLeft}>
              <Text style={s.eyebrow}>WEEK AVERAGE</Text>
              <View style={s.weekNumRow}>
                <Text style={[s.weekNum, { color: weekTone.ink }]}>
                  {week.average == null ? '—' : week.average}
                </Text>
                <Text style={s.weekDen}>/100</Text>
              </View>
            </View>

            <ScoreArc value={week.average} color={weekTone.ink} size={86} style={s.arc} />

            <View style={s.weekRight}>
              <View style={[s.pill, { backgroundColor: weekTone.soft }]}>
                <Text style={[s.pillText, { color: weekTone.ink }]}>{weekTone.label}</Text>
              </View>
              <Text style={s.weekMeta}>
                {week.daysLogged} of {week.daysPossible} days logged
              </Text>
            </View>
          </View>

          {days.map((day) => {
            const tone = scoreTone(day.score ? day.score.total : null);
            const overGoal = goals.calories > 0 && day.totals.calories > goals.calories;
            return (
              <View key={day.dateKey} style={[s.card, { borderLeftColor: tone.ink }]}>
                <View style={s.headerRow}>
                  <Text style={s.dayLabel}>{day.label}</Text>
                  <View style={[s.scoreBadge, { backgroundColor: tone.soft }]}>
                    <Text style={[s.scoreBadgeNum, { color: tone.ink }]}>
                      {day.score ? day.score.total : '—'}
                    </Text>
                  </View>
                </View>

                <Text style={[s.calories, overGoal && s.over]}>{day.totals.calories} kcal</Text>
                <Text style={s.macros}>
                  Protein {day.totals.protein}g · Carbs {day.totals.carbs}g · Fat {day.totals.fat}g
                </Text>
                <Text style={s.count}>
                  {day.entries.length} item{day.entries.length === 1 ? '' : 's'} logged
                </Text>
              </View>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACE.screen, paddingBottom: 40 },

  blobs: { position: 'absolute', top: 0, left: 0, right: 0, height: 260 },
  blob: { position: 'absolute', backgroundColor: COLORS.blob, borderRadius: RADIUS.pill },
  blobA: { width: 260, height: 200, top: -60, right: -70 },
  blobB: { width: 120, height: 120, top: 40, right: 140 },
  blobC: { width: 46, height: 46, top: 8, right: 220 },

  header: { flexDirection: 'row', alignItems: 'flex-start' },
  headerText: { flex: 1 },
  title: { ...TYPE.screenTitle, color: COLORS.text, marginTop: 8 },
  mascot: { width: 108, height: 108, marginTop: -8, marginRight: -6 },

  // The connecting line sits behind the dots, inset by half a column so it
  // starts and ends at the first and last dot rather than the card edge.
  strip: { flexDirection: 'row', marginTop: 14, marginBottom: 8 },
  stripLine: {
    position: 'absolute',
    left: '7%',
    right: '7%',
    top: 30,
    height: 2,
    backgroundColor: COLORS.line,
    borderRadius: RADIUS.pill,
  },
  stripDay: { flex: 1, alignItems: 'center' },
  stripLabel: { fontSize: 11.5, fontWeight: '600', color: COLORS.textMuted, marginBottom: 6 },
  stripLabelToday: { color: COLORS.text, fontWeight: '700' },
  dot: { width: 15, height: 15, borderRadius: RADIUS.pill, borderWidth: 2 },
  dotToday: { width: 19, height: 19, borderWidth: 3, borderColor: COLORS.accent },

  eyebrow: { ...TYPE.eyebrow, color: COLORS.eyebrow },

  weekCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,
    borderLeftWidth: 5,
    padding: SPACE.card,
    marginTop: 10,
    marginBottom: 20,
    ...SHADOW.card,
  },
  weekLeft: { flex: 1 },
  weekNumRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  weekNum: { fontSize: 40, fontWeight: '800', letterSpacing: -1 },
  weekDen: { fontSize: 16, color: COLORS.textMuted, marginLeft: 2, fontWeight: '600' },
  arc: { marginHorizontal: 6 },
  weekRight: { alignItems: 'flex-end', flexShrink: 0 },
  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.pill },
  pillText: { ...TYPE.pill },
  weekMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 7, fontWeight: '500' },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.row,
    borderLeftWidth: 5,
    padding: 15,
    marginBottom: SPACE.rowGap,
    ...SHADOW.row,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dayLabel: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  scoreBadge: {
    minWidth: 44,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  scoreBadgeNum: { fontSize: 16, fontWeight: '800' },

  calories: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  over: { color: COLORS.over },
  macros: { fontSize: 13.5, color: COLORS.textSoft, marginTop: 3 },
  count: { fontSize: 12.5, color: COLORS.textMuted, marginTop: 4 },

  empty: { backgroundColor: COLORS.emptyBg, borderRadius: RADIUS.row, padding: 18, marginTop: 10 },
  emptyText: { ...TYPE.empty, color: COLORS.textSoft, lineHeight: 21 },
});
