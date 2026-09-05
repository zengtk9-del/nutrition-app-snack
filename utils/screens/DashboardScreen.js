import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import foods from '../data/foods';
import { sumEntries, progressPercent } from '../utils/nutrition';
import { iconKeyForFoodId } from '../utils/foodIcon';
import FoodIcon from '../components/FoodIcon';
import { APP_VERSION } from '../utils/appVersion';

// A little horizontal bar that fills up as you approach (or exceed) a goal.
function GoalBar({ label, value, goal, unit, color }) {
  const pct = progressPercent(value, goal);
  const over = goal > 0 && value > goal;
  return (
    <View style={styles.goalRow}>
      <View style={styles.goalLabelRow}>
        <Text style={styles.goalLabel}>{label}</Text>
        <Text style={[styles.goalValue, over && styles.overText]}>
          {value}
          {unit} / {goal}
          {unit}
        </Text>
      </View>
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            { width: `${pct}%`, backgroundColor: over ? '#e0533d' : color },
          ]}
        />
      </View>
    </View>
  );
}

export default function DashboardScreen({ entries, goals, onDeleteEntry }) {
  const totals = sumEntries(entries);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Today</Text>

      <View style={styles.card}>
        <GoalBar label="Calories" value={totals.calories} goal={goals.calories} unit=" kcal" color="#4f8ef7" />
        <GoalBar label="Protein" value={totals.protein} goal={goals.protein} unit="g" color="#3fb27f" />
        <GoalBar label="Carbs" value={totals.carbs} goal={goals.carbs} unit="g" color="#f2b134" />
        <GoalBar label="Fat" value={totals.fat} goal={goals.fat} unit="g" color="#b06fe0" />
      </View>

      <Text style={styles.sectionTitle}>Logged today ({entries.length})</Text>

      {entries.length === 0 ? (
        <Text style={styles.emptyText}>Nothing logged yet — head to the Log Food tab to add something.</Text>
      ) : (
        entries
          .slice()
          .reverse()
          .map((e) => (
            <View key={e.id} style={styles.entryRow}>
              <FoodIcon iconKey={iconKeyForFoodId(foods, e.foodId)} style={styles.entryIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.entryName}>{e.name}</Text>
                <Text style={styles.entrySub}>
                  {e.servingLabel} · {e.calories} kcal
                </Text>
              </View>
              <TouchableOpacity onPress={() => onDeleteEntry(e.id)} style={styles.deleteBtn}>
                <Text style={styles.deleteBtnText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))
      )}

      {/* A little version number so Damon can tell at a glance whether the
          code he just pasted in actually took effect — see
          utils/appVersion.js's own comment for the "bump it on every
          delivered change" rule this follows. */}
      <Text style={styles.versionText}>v{APP_VERSION}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7fa', padding: 16 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 12, color: '#1a1a1a' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 20, shadowOpacity: 0.05 },
  goalRow: { marginBottom: 14 },
  goalLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  goalLabel: { fontSize: 16, fontWeight: '600', color: '#333' },
  goalValue: { fontSize: 15, color: '#666' },
  overText: { color: '#e0533d', fontWeight: '600' },
  barTrack: { height: 8, backgroundColor: '#eee', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: '#1a1a1a' },
  emptyText: { color: '#888', fontStyle: 'italic' },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    // 8, not 12: the 96pt icon added in v0.0.57 sets this row's height now,
    // so the padding is breathing room around the picture rather than the
    // thing making the row tall. Same trade the Log Food rows made.
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  // Spacing only — the icon's own 96x96 box lives in components/FoodIcon.js,
  // shared with the Log Food and Favorites rows so a food is the same size
  // everywhere it is listed.
  entryIcon: { marginRight: 12 },
  entryName: { fontSize: 17, fontWeight: '600', color: '#1a1a1a' },
  entrySub: { fontSize: 14, color: '#777', marginTop: 2 },
  deleteBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  deleteBtnText: { color: '#e0533d', fontSize: 15, fontWeight: '600' },
  versionText: { textAlign: 'center', color: '#bbb', fontSize: 12, marginTop: 20 },
});
