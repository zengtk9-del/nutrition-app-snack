import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import MacroDonutChart from '../components/MacroDonutChart';

const MAX_SAVED_GOALS = 5;

// One row in the "My Saved Goals" list — a name, a compact recap of its
// numbers, and either a "Following" badge (this is the one currently
// filling the Today progress bars) or a "Follow this goal" button, plus a
// small delete link. Tapping "Follow this goal" does NOT switch
// immediately — it just tells the parent which goal to preview (see
// onRequestFollow), and App.js opens screens/FollowGoalScreen.js as a
// separate confirmation step showing that goal's wheel/macros with a
// Yes/No before it actually takes effect. Kept as its own component
// mainly so the delete confirmation (Alert.alert) has one clear place to
// live rather than being inlined into the list's .map().
function SavedGoalRow({ goal, onRequestFollow, onDelete }) {
  const handleDelete = () => {
    Alert.alert(
      'Delete this goal?',
      `"${goal.name}" will be removed from your saved goals. This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(goal.id) },
      ]
    );
  };

  return (
    <View style={[styles.savedGoalRow, goal.is_active && styles.savedGoalRowActive]}>
      <View style={styles.savedGoalInfo}>
        <Text style={styles.savedGoalName}>{goal.name}</Text>
        <Text style={styles.savedGoalStats}>
          {goal.calories.toLocaleString()} kcal · {goal.protein}g protein · {goal.carbs}g carbs ·{' '}
          {goal.fat}g fat
        </Text>
      </View>
      <View style={styles.savedGoalActions}>
        {goal.is_active ? (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>Following</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.useBtn}
            onPress={() => onRequestFollow(goal)}
            accessibilityRole="button"
            accessibilityLabel={`Follow ${goal.name}`}
          >
            <Text style={styles.useBtnText}>Follow this goal</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${goal.name}`}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function GoalsScreen({
  goals,
  onLogout,
  userEmail,
  onRetakeQuiz,
  onSetMacroGoals,
  savedGoals = [],
  onRequestFollow,
  onDeleteSavedGoal,
}) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Daily Goals</Text>
      <Text style={styles.hint}>These are used to fill the progress bars on the Today screen.</Text>

      {/* A read-only readout of whatever goal is currently active — the
          exact same wheel + Protein/Carbs/Fat legend component used on
          "Set My Own Macro Goals" (screens/MacroGoalsScreen.js) and the
          follow/save confirmation (screens/FollowGoalScreen.js), so this
          number always looks and reads the same everywhere it shows up in
          the app. This replaces the old direct-edit calorie/protein/
          carbs/fat text boxes — changing what you're tracking now always
          goes through one of the three buttons below (retake the quiz,
          set your own goals, or follow a saved one), each of which ends
          in a deliberate confirmation, rather than a raw number you could
          type over without any of that. */}
      <View style={styles.chartWrap}>
        <MacroDonutChart
          calories={goals.calories}
          proteinG={goals.protein}
          carbsG={goals.carbs}
          fatG={goals.fat}
          size={200}
        />
      </View>

      {/* "My Saved Goals" — the up-to-5 named snapshots created from
          finishing the quiz or from "Set My Own Macro Goals" (see
          components/SaveGoalModal.js). Only shows up once there's at
          least one — a first-time user with nothing saved yet gets the
          plain Retake Quiz/Set My Own buttons below with no empty list
          taking up space above them. */}
      {savedGoals.length > 0 && (
        <View style={styles.savedGoalsSection}>
          <View style={styles.savedGoalsHeaderRow}>
            <Text style={styles.savedGoalsTitle}>My Saved Goals</Text>
            <Text style={styles.savedGoalsCount}>
              {savedGoals.length} of {MAX_SAVED_GOALS}
            </Text>
          </View>
          {savedGoals.map((goal) => (
            <SavedGoalRow
              key={goal.id}
              goal={goal}
              onRequestFollow={onRequestFollow}
              onDelete={onDeleteSavedGoal}
            />
          ))}
        </View>
      )}

      {onRetakeQuiz && (
        <TouchableOpacity style={styles.quizButton} onPress={onRetakeQuiz}>
          <Text style={styles.quizButtonText}>Retake the Goals Quiz</Text>
          <Text style={styles.quizButtonSub}>
            Answer a few questions and we'll calculate these numbers for you.
          </Text>
        </TouchableOpacity>
      )}

      {onSetMacroGoals && (
        <TouchableOpacity style={styles.quizButton} onPress={onSetMacroGoals}>
          <Text style={styles.quizButtonText}>Set My Own Macro Goals</Text>
          <Text style={styles.quizButtonSub}>
            Drag calories, protein, carbs, and fat yourself instead of using the quiz.
          </Text>
        </TouchableOpacity>
      )}

      {userEmail ? <Text style={styles.accountText}>Logged in as {userEmail}</Text> : null}

      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7fa', padding: 16 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 4, color: '#1a1a1a' },
  hint: { fontSize: 15, color: '#777', marginBottom: 16 },
  chartWrap: { alignItems: 'center', marginBottom: 8 },
  savedGoalsSection: { marginTop: 20 },
  savedGoalsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  savedGoalsTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  savedGoalsCount: { fontSize: 14, color: '#999' },
  savedGoalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  savedGoalRowActive: { borderColor: '#4f8ef7', backgroundColor: '#eaf2ff' },
  savedGoalInfo: { flex: 1, marginRight: 10 },
  savedGoalName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  savedGoalStats: { fontSize: 13, color: '#777' },
  savedGoalActions: { alignItems: 'flex-end', gap: 8 },
  activeBadge: { backgroundColor: '#4f8ef7', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  activeBadgeText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  useBtn: {
    borderWidth: 1,
    borderColor: '#4f8ef7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  useBtnText: { color: '#4f8ef7', fontSize: 13, fontWeight: '700' },
  deleteText: { color: '#e0533d', fontSize: 13, fontWeight: '600' },
  quizButton: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4f8ef7',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  quizButtonText: { color: '#4f8ef7', fontWeight: '700', fontSize: 17 },
  quizButtonSub: { color: '#777', fontSize: 14, marginTop: 4, textAlign: 'center' },
  accountText: { textAlign: 'center', color: '#999', fontSize: 15, marginTop: 24 },
  logoutButton: {
    marginTop: 12,
    marginBottom: 32,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0533d',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutButtonText: { color: '#e0533d', fontWeight: '700', fontSize: 16 },
});
