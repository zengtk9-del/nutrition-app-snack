import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { groupEntriesByDate } from '../utils/nutrition';

export default function HistoryScreen({ entries, goals }) {
  const days = groupEntriesByDate(entries, 7);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Last 7 Days</Text>

      {days.length === 0 ? (
        <Text style={styles.emptyText}>No history yet — log some meals to see them here.</Text>
      ) : (
        days.map((day) => {
          const overGoal = goals.calories > 0 && day.totals.calories > goals.calories;
          return (
            <View key={day.dateKey} style={styles.card}>
              <View style={styles.headerRow}>
                <Text style={styles.dayLabel}>{day.label}</Text>
                <Text style={[styles.calories, overGoal && styles.overText]}>
                  {day.totals.calories} kcal
                </Text>
              </View>
              <Text style={styles.macros}>
                Protein {day.totals.protein}g · Carbs {day.totals.carbs}g · Fat {day.totals.fat}g
              </Text>
              <Text style={styles.count}>{day.entries.length} item{day.entries.length === 1 ? '' : 's'} logged</Text>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7fa', padding: 16 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 12, color: '#1a1a1a' },
  emptyText: { color: '#888', fontStyle: 'italic' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  dayLabel: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  calories: { fontSize: 15, fontWeight: '700', color: '#4f8ef7' },
  overText: { color: '#e0533d' },
  macros: { fontSize: 13, color: '#555', marginBottom: 4 },
  count: { fontSize: 12, color: '#999' },
});
