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

import React, { useMemo, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MacroDonutChart from '../components/MacroDonutChart';
import { DIET_IMAGES } from '../data/quizQuestions';
import { DEFAULT_DIET } from '../data/dietOrder';
import { dietLabel } from './DietPickerScreen';
import { COLORS, TYPE, RADIUS, SPACE, SHADOW } from '../utils/theme';
import { ART_READY, MASCOT } from '../data/brandArt';

const MAX_SAVED_GOALS = 5;

// The four numbers on a saved goal, each in its own macro colour, matching
// the ring above them and the bars on the Today screen. Calories gets the
// blue that the ring's hole and the Today calorie bar already use -- it
// isn't one of the three the ring splits, but it is a quantity with its own
// colour everywhere else in the app, so it keeps it here.
const CHIPS = [
  { key: 'calories', label: 'KCAL', dot: COLORS.calories, tint: COLORS.caloriesSoft },
  { key: 'protein', label: 'PROTEIN', dot: COLORS.protein, tint: COLORS.proteinSoft, suffix: 'g' },
  { key: 'carbs', label: 'CARBS', dot: COLORS.carbs, tint: COLORS.carbsSoft, suffix: 'g' },
  { key: 'fat', label: 'FAT', dot: COLORS.fat, tint: COLORS.fatSoft, suffix: 'g' },
];

// One row in "My Saved Goals". Kept as its own component mainly so the
// delete confirmation has one clear place to live rather than being inlined
// into the list's .map().
//
// TAP TARGETS, reworked in v0.0.82. Until then the card wasn't tappable at
// all and "Follow this goal" opened FollowGoalScreen as a yes/no
// confirmation -- the reasoning being that switching what you track should
// take two deliberate taps. In practice that made the common case (I want
// this goal) twice as long while giving you no way at all to just LOOK at a
// goal's numbers. So the two are now separate gestures:
//
//   the Follow button  -> switches immediately, one tap
//   anywhere else      -> opens that goal's card (FollowGoalScreen mode="view")
//
// The safety the confirmation used to provide is still there, just moved:
// following is a single write that the next tap on another goal undoes, and
// the card you land on if you meant to browse has its own Follow button. A
// mis-tap costs one tap to correct, which is the right price for an action
// this reversible.
function SavedGoalRow({ goal, onFollow, onOpen, onDelete }) {
  // Following writes to Supabase, so on a slow connection there is real
  // latency between the tap and the row flipping to the "Following" pill.
  // Without this the button just sits there looking untapped and invites a
  // second tap.
  const [busy, setBusy] = useState(false);

  const handleFollow = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onFollow(goal);
    } finally {
      setBusy(false);
    }
  };

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
    // The card itself is the "open" target. The two buttons inside are
    // their own touchables and win over it -- RN gives the innermost
    // responder the touch -- so Follow and Delete keep doing only their own
    // thing, and every other pixel of the card opens it.
    <TouchableOpacity
      style={[s.goalCard, goal.is_active && s.goalCardActive]}
      activeOpacity={0.85}
      onPress={() => onOpen(goal)}
      accessibilityRole="button"
      accessibilityLabel={`Open ${goal.name}`}
      accessibilityHint="Shows this goal's numbers"
    >
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
              style={[s.followBtn, busy && s.followBtnBusy]}
              activeOpacity={0.8}
              onPress={handleFollow}
              disabled={busy}
              accessibilityRole="button"
              accessibilityLabel={`Follow ${goal.name}`}
            >
              <MaterialCommunityIcons name={busy ? 'flag' : 'flag-outline'} size={15} color="#fff" />
              <Text style={s.followText}>{busy ? 'Following…' : 'Follow this goal'}</Text>
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
    </TouchableOpacity>
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
  onFollowGoal,
  onOpenGoal,
  onDeleteSavedGoal,
  diet = DEFAULT_DIET,
  onChangeDiet,
}) {
  // Whatever you're following goes first (v0.0.82). The list arrives in
  // save order, which means the one goal you're actually tracking against
  // could be sitting fifth, below four you're not -- so the answer to
  // "what am I on right now?" needed scrolling to find. Everything else
  // keeps its existing order: Array.prototype.sort has been required to be
  // stable since ES2019 and both Hermes and JSC are, so comparing only the
  // active flag leaves every other pair untouched. Copied first because
  // `savedGoals` is App.js's state array and sort mutates in place.
  const orderedGoals = useMemo(
    () => [...savedGoals].sort((a, b) => (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0)),
    [savedGoals]
  );

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
          // Back to 200, and back to the legend underneath.
          //
          // The mockup put them side by side, and that cannot work here.
          // The hole is a fixed fraction of `size` (0.46), and it has to
          // hold a text block measuring about 55x43pt -- so `size` can't go
          // below about 165 without the number spilling over the ring. The
          // ring also reserves a stage of 1.46x `size` so its hole doesn't
          // drift as the band thickens. At the smallest legible size that
          // stage is already 238pt of a ~322pt card, leaving 72pt for a
          // legend that needs about 150. Side by side and a readable number
          // are mutually exclusive at phone width.
          size={200}
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
          {orderedGoals.map((goal) => (
            <SavedGoalRow
              key={goal.id}
              goal={goal}
              onFollow={onFollowGoal}
              onOpen={onOpenGoal}
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
  goalCardActive: { borderColor: COLORS.accent, backgroundColor: COLORS.goodSoft },

  goalTop: { flexDirection: 'row', alignItems: 'flex-start' },
  goalName: { flex: 1, fontSize: 16.5, fontWeight: '700', color: COLORS.text, lineHeight: 21, marginRight: 12 },
  goalActions: { alignItems: 'flex-end', flexShrink: 0 },

  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: RADIUS.pill,
  },
  followBtnBusy: { opacity: 0.65 },
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
