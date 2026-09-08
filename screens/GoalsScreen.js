// The Goals tab -- what you're tracking against, and every way to change it.
//
// Rebuilt in v0.0.77 against Damon's mockup, onto utils/theme.js. The last
// of the four screens to move over, and the longest: with five saved goals
// it scrolls well past two viewports, which is why the ring and its legend
// now sit side by side rather than stacked.
//
// The saved-goal card is the part that earned the most thought. Two of
// Damon's own goals are called "My nutrition plan to gain muscle" and
// differ only in their carbs and fat, so a card whose numbers are a single
// run-on line ("3,165 kcal · 105g protein · 528g carbs · 70g fat") gives
// you no way to tell them apart at a glance. Breaking the four numbers into
// separate labelled chips makes the differing one findable by position
// instead of by reading the whole string.

import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MacroDonutChart, { MACRO_COLORS } from '../components/MacroDonutChart';
import { DIET_IMAGES } from '../data/quizQuestions';
import { DEFAULT_DIET } from '../data/dietOrder';
import { dietLabel } from './DietPickerScreen';
import { COLORS, TYPE, RADIUS, SPACE, SHADOW } from '../utils/theme';
import { ART_READY, MASCOT } from '../data/brandArt';

const MAX_SAVED_GOALS = 5;

// The four numbers on a saved goal, each with its own colour so the eye can
// go straight to the one it wants. Calories takes the app's "good" green
// rather than a macro colour -- it isn't one of the three the ring splits,
// and giving it a macro's colour would imply it was.
const CHIPS = [
  { key: 'calories', label: 'KCAL', dot: COLORS.good, tint: COLORS.goodSoft },
  { key: 'protein', label: 'PROTEIN', dot: MACRO_COLORS.protein, tint: COLORS.overSoft, suffix: 'g' },
  { key: 'carbs', label: 'CARBS', dot: MACRO_COLORS.carbs, tint: COLORS.caloriesSoft, suffix: 'g' },
  { key: 'fat', label: 'FAT', dot: MACRO_COLORS.fat, tint: COLORS.carbsSoft, suffix: 'g' },
];

// One row in "My Saved Goals". Kept as its own component mainly so the
// delete confirmation has one clear place to live rather than being inlined
// into the list's .map().
//
// "Follow this goal" does NOT switch immediately -- it tells the parent
// which goal to preview, and App.js opens FollowGoalScreen as a separate
// confirmation showing that goal's numbers with a yes/no. Changing what you
// track against should take two deliberate taps, not one stray one.
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
    <View style={[s.goalCard, goal.is_active && s.goalCardActive]}>
      <View style={s.goalTop}>
        {/* Three lines, then ellipsis. Names are user-typed and run from a
            single character to a full sentence. */}
        <Text style={s.goalName} numberOfLines={3}>
          {goal.name}
        </Text>

        <View style={s.goalActions}>
          {goal.is_active ? (
            <View style={s.followingPill}>
              <MaterialCommunityIcons name="check-circle" size={15} color={COLORS.good} />
              <Text style={s.followingText}>Following</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={s.followBtn}
              activeOpacity={0.8}
              onPress={() => onRequestFollow(goal)}
              accessibilityRole="button"
              accessibilityLabel={`Follow ${goal.name}`}
            >
              <MaterialCommunityIcons name="flag-outline" size={15} color="#fff" />
              <Text style={s.followText}>Follow this goal</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={s.deleteBtn}
            onPress={handleDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${goal.name}`}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={15} color={COLORS.destructive} />
            <Text style={s.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.chips}>
        {CHIPS.map((c) => (
          <View key={c.key} style={[s.chip, { backgroundColor: c.tint }]}>
            <View style={s.chipHead}>
              <View style={[s.chipDot, { backgroundColor: c.dot }]} />
              <Text style={s.chipLabel}>{c.label}</Text>
            </View>
            <Text style={s.chipValue} numberOfLines={1}>
              {c.key === 'calories' ? goal.calories.toLocaleString() : goal[c.key]}
              {c.suffix || ''}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// The three navigation rows under the goal list. Same shape each time: an
// icon tile, a title with a line of explanation, and a chevron.
function ActionRow({ icon, iconBg, iconColor, image, eyebrow, title, sub, onPress }) {
  return (
    <TouchableOpacity style={s.actionRow} activeOpacity={0.7} onPress={onPress}>
      {image ? (
        <Image source={image} style={s.actionArt} resizeMode="contain" />
      ) : (
        <View style={[s.actionTile, { backgroundColor: iconBg }]}>
          <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
        </View>
      )}
      <View style={s.actionText}>
        {eyebrow ? <Text style={s.actionEyebrow}>{eyebrow}</Text> : null}
        <Text style={s.actionTitle}>{title}</Text>
        {sub ? <Text style={s.actionSub}>{sub}</Text> : null}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.textMuted} />
    </TouchableOpacity>
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
  diet = DEFAULT_DIET,
  onChangeDiet,
}) {
  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View pointerEvents="none" style={s.blobs}>
        <View style={[s.blob, s.blobA]} />
        <View style={[s.blob, s.blobB]} />
        <View style={[s.blob, s.blobC]} />
      </View>

      <View style={s.header}>
        <View style={s.headerText}>
          <Text style={s.title}>Daily Goals</Text>
          <Text style={s.subtitle}>
            These are used to fill the progress bars on the Today screen.
          </Text>
        </View>
        {ART_READY ? <Image source={MASCOT} style={s.mascot} resizeMode="contain" /> : null}
      </View>

      {/* A read-only readout of whatever goal is active. The same component
          the macro-goals screen and the follow confirmation both use, so
          this number looks the same everywhere it appears in the app. */}
      <View style={s.chartCard}>
        <MacroDonutChart
          calories={goals.calories}
          proteinG={goals.protein}
          carbsG={goals.carbs}
          fatG={goals.fat}
          size={132}
          layout="row"
        />
      </View>

      {savedGoals.length > 0 && (
        <View style={s.savedSection}>
          <View style={s.savedHead}>
            <Text style={s.sectionTitle}>My Saved Goals</Text>
            <Text style={s.savedCount}>
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

      {onChangeDiet && (
        <ActionRow
          image={DIET_IMAGES[diet] || DIET_IMAGES[DEFAULT_DIET]}
          eyebrow="CURRENT DIET"
          title={`My Diet: ${dietLabel(diet)}`}
          onPress={onChangeDiet}
        />
      )}

      {onRetakeQuiz && (
        <ActionRow
          icon="clipboard-text-outline"
          iconBg={COLORS.caloriesSoft}
          iconColor={COLORS.calories}
          title="Retake the Goals Quiz"
          sub="Answer a few questions and we'll calculate these numbers for you."
          onPress={onRetakeQuiz}
        />
      )}

      {onSetMacroGoals && (
        <ActionRow
          icon="tune-variant"
          iconBg={COLORS.fatSoft}
          iconColor={COLORS.fat}
          title="Set My Own Macro Goals"
          sub="Drag calories, protein, carbs, and fat yourself instead of using the quiz."
          onPress={onSetMacroGoals}
        />
      )}

      {userEmail ? <Text style={s.account}>Logged in as {userEmail}</Text> : null}

      <TouchableOpacity style={s.logout} activeOpacity={0.7} onPress={onLogout}>
        <MaterialCommunityIcons name="logout" size={18} color={COLORS.destructive} />
        <Text style={s.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACE.screen, paddingBottom: 40 },

  blobs: { position: 'absolute', top: 0, left: 0, right: 0, height: 240 },
  blob: { position: 'absolute', backgroundColor: COLORS.blob, borderRadius: RADIUS.pill },
  blobA: { width: 240, height: 190, top: -50, right: -70 },
  blobB: { width: 110, height: 110, top: 30, right: 150 },
  blobC: { width: 42, height: 42, top: 4, right: 226 },

  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  headerText: { flex: 1, paddingTop: 6 },
  title: { ...TYPE.screenTitle, color: COLORS.text },
  subtitle: { fontSize: 14.5, color: COLORS.textSoft, marginTop: 4, lineHeight: 20 },
  mascot: { width: 104, height: 104, marginTop: -14, marginRight: -6 },

  chartCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,
    padding: SPACE.card,
    marginBottom: 22,
    ...SHADOW.card,
  },

  savedSection: { marginBottom: 12 },
  savedHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: { ...TYPE.sectionTitle, color: COLORS.text },
  savedCount: { fontSize: 13.5, color: COLORS.textMuted, fontWeight: '600' },

  goalCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.row,
    padding: 14,
    marginBottom: SPACE.rowGap,
    borderWidth: 1,
    borderColor: 'transparent',
    ...SHADOW.row,
  },
  goalCardActive: { borderColor: COLORS.calories, backgroundColor: COLORS.goodSoft },

  goalTop: { flexDirection: 'row', alignItems: 'flex-start' },
  goalName: { flex: 1, fontSize: 16.5, fontWeight: '700', color: COLORS.text, lineHeight: 21, marginRight: 12 },
  goalActions: { alignItems: 'flex-end', flexShrink: 0 },

  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.calories,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: RADIUS.pill,
  },
  followText: { color: '#fff', fontWeight: '700', fontSize: 13.5 },
  followingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.goodSoft,
    borderWidth: 1,
    borderColor: COLORS.good,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
  },
  followingText: { color: COLORS.good, fontWeight: '700', fontSize: 13.5 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8, paddingVertical: 2 },
  deleteText: { color: COLORS.destructive, fontWeight: '600', fontSize: 13.5 },

  // Four equal chips. `flex: 1` on each plus `minWidth: 0` is what lets a
  // five-digit calorie count shrink its own chip rather than pushing the
  // row wider than the card.
  chips: { flexDirection: 'row', gap: 7, marginTop: 12 },
  chip: { flex: 1, minWidth: 0, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 7 },
  chipHead: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  chipDot: { width: 7, height: 7, borderRadius: RADIUS.pill },
  chipLabel: { fontSize: 8.5, fontWeight: '800', letterSpacing: 0.5, color: COLORS.textSoft },
  chipValue: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginTop: 2 },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.row,
    padding: 13,
    marginBottom: SPACE.rowGap,
    ...SHADOW.row,
  },
  actionTile: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.tile,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  // White behind the diet illustration for the same reason as everywhere
  // else -- these are opaque JPEGs with no alpha, so a tint would draw a
  // visible square around the picture.
  actionArt: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.tile,
    marginRight: 13,
    backgroundColor: COLORS.card,
  },
  actionText: { flex: 1, marginRight: 8 },
  actionEyebrow: { ...TYPE.eyebrow, fontSize: 10, color: COLORS.textMuted, marginBottom: 2 },
  actionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  actionSub: { fontSize: 13.5, color: COLORS.textSoft, marginTop: 3, lineHeight: 18 },

  account: { textAlign: 'center', color: COLORS.textMuted, fontSize: 13, marginTop: 14, marginBottom: 10 },

  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.overSoft,
    borderRadius: RADIUS.row,
    paddingVertical: 14,
  },
  logoutText: { color: COLORS.destructive, fontWeight: '700', fontSize: 16 },
});
