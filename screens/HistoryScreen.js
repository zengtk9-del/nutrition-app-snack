// The History tab -- the last 7 days, and how each of them scored.
//
// Rebuilt in v0.0.74 onto utils/theme.js, and given the day scores the
// scoring engine now produces (utils/score.js).
//
// The one thing worth understanding here is what the week number is NOT.
// It is the average of the days that were LOGGED, not of seven days. An
// unlogged day is absent, not a zero -- counting it as zero would punish
// forgetting the app more harshly than eating badly, and would teach people
// to invent entries rather than skip them. The "n of 7 logged" line beside
// the average is what keeps that honest, so a 92 from two days can't be
// mistaken for a 92 from seven.

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import foods from '../data/foods';
import { groupEntriesByDate } from '../utils/nutrition';
import { scoreDay, scoreWeek } from '../utils/score';
import { scoreTone } from '../utils/scoreTone';
import { COLORS, TYPE, RADIUS, SPACE, SHADOW } from '../utils/theme';

export default function HistoryScreen({ entries, goals }) {
  const days = groupEntriesByDate(entries, 7).map((day) => ({
    ...day,
    score: scoreDay({ entries: day.entries, totals: day.totals, goals, foods }),
  }));

  const week = scoreWeek(days.map((d) => ({ score: d.score ? d.score.total : null })));
  const weekTone = scoreTone(week.average);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <Text style={s.title}>Last 7 Days</Text>

      {days.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyText}>No history yet — log some meals to see them here.</Text>
        </View>
      ) : (
        <>
          <View style={s.weekCard}>
            <View style={s.weekLeft}>
              <Text style={s.eyebrow}>WEEK AVERAGE</Text>
              <View style={s.weekNumRow}>
                <Text style={[s.weekNum, { color: weekTone.ink }]}>
                  {week.average == null ? '—' : week.average}
                </Text>
                <Text style={s.weekDen}>/100</Text>
              </View>
            </View>
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
              <View key={day.dateKey} style={s.card}>
                <View style={s.headerRow}>
                  <Text style={s.dayLabel}>{day.label}</Text>
                  <View style={[s.scoreBadge, { backgroundColor: tone.soft }]}>
                    <Text style={[s.scoreBadgeNum, { color: tone.ink }]}>
                      {day.score ? day.score.total : '—'}
                    </Text>
                  </View>
                </View>

                <Text style={[s.calories, overGoal && s.over]}>
                  {day.totals.calories} kcal
                </Text>
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
  title: { ...TYPE.screenTitle, color: COLORS.text, marginBottom: 16, marginTop: 8 },

  eyebrow: { ...TYPE.eyebrow, color: COLORS.eyebrow },

  weekCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,
    padding: SPACE.card,
    marginBottom: 20,
    ...SHADOW.card,
  },
  weekLeft: { flex: 1 },
  weekNumRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  weekNum: { fontSize: 40, fontWeight: '800', letterSpacing: -1 },
  weekDen: { fontSize: 16, color: COLORS.textMuted, marginLeft: 2, fontWeight: '600' },
  weekRight: { alignItems: 'flex-end' },
  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.pill },
  pillText: { ...TYPE.pill },
  weekMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 7, fontWeight: '500' },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.row,
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

  empty: {
    backgroundColor: COLORS.emptyBg,
    borderRadius: RADIUS.row,
    padding: 18,
  },
  emptyText: { ...TYPE.empty, color: COLORS.textSoft, lineHeight: 21 },
});
