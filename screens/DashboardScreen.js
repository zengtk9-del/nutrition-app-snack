// The Today tab -- how the day is going so far.
//
// Rebuilt in v0.0.72 against Damon's mockup. The information is unchanged
// from the version before it; what changed is how it reads. Worth knowing
// what's load-bearing in here, because most of it looks decorative and
// isn't:
//
//   - The finish flag marks the TARGET, not the end of the bar. That is the
//     whole reason the over-goal state works without the bar having to grow
//     past its container: the bar fills to the flag, and the overshoot is
//     stated in words beside it.
//   - Every colour, size and radius comes from utils/theme.js. Don't add
//     literals here; the palette was eyeballed off a mockup and will need
//     tuning, and tuning it should stay a one-file job.
//   - The food tiles are white and must stay white. The illustrations are
//     opaque JPEGs with no alpha, so a tinted tile behind one draws a
//     visible square frame around the picture. This is the single most
//     likely thing to get "improved" into a bug later.

import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import foods from '../data/foods';
import { sumEntries, progressPercent } from '../utils/nutrition';
import { iconKeyForFoodId } from '../utils/foodIcon';
import FoodIcon from '../components/FoodIcon';
import { APP_VERSION } from '../utils/appVersion';
import { COLORS, TYPE, RADIUS, SPACE, SHADOW } from '../utils/theme';
import { ART_READY, MASCOT, MACRO_ART, MACRO_FALLBACK_ICONS } from '../data/brandArt';

const FOOD_ICON_SIZE = 72;

// The four rows of the summary card, in order. Colour and tint are looked up
// rather than passed in so a macro's identity lives in exactly one place.
const MACROS = [
  { key: 'calories', label: 'Calories', unit: ' kcal', color: COLORS.calories, tint: COLORS.caloriesSoft },
  { key: 'protein', label: 'Protein', unit: 'g', color: COLORS.protein, tint: COLORS.proteinSoft },
  { key: 'carbs', label: 'Carbs', unit: 'g', color: COLORS.carbs, tint: COLORS.carbsSoft },
  { key: 'fat', label: 'Fat', unit: 'g', color: COLORS.fat, tint: COLORS.fatSoft },
];

// Illustration when we have one, vector glyph when we don't -- see
// data/brandArt.js's ART_READY switch.
function MacroIcon({ macroKey, color }) {
  if (ART_READY) {
    return <Image source={MACRO_ART[macroKey]} style={s.macroArt} resizeMode="contain" />;
  }
  const { set, name } = MACRO_FALLBACK_ICONS[macroKey];
  const Set = set === 'ion' ? Ionicons : MaterialCommunityIcons;
  return <Set name={name} size={26} color={color} />;
}

// One nutrient: icon tile, name, current-over-target, and a progress bar
// that runs to a finish flag sitting at the target.
function MacroRow({ label, unit, color, tint, macroKey, value, goal }) {
  const pct = progressPercent(value, goal);
  const over = goal > 0 && value > goal;
  // Rounded the same way the numbers above it are, so "158.6 / 144" never
  // disagrees with a stated overshoot of 14.6.
  const overBy = over ? Math.round((value - goal) * 10) / 10 : 0;

  return (
    <View style={s.macroRow}>
      <View style={[s.macroTile, { backgroundColor: tint }]}>
        <MacroIcon macroKey={macroKey} color={color} />
      </View>

      <View style={s.macroBody}>
        <View style={s.macroTop}>
          <Text style={s.macroName}>{label}</Text>
          <Text style={s.macroValue}>
            <Text style={over ? s.macroNowOver : s.macroNow}>
              {value}
              {over ? unit : ''}
            </Text>
            <Text style={s.macroGoal}>
              {over ? ' / ' : `${unit} / `}
              {goal}
              {unit}
            </Text>
          </Text>
        </View>

        <View style={s.barRow}>
          <View style={[s.track, { backgroundColor: tint }]}>
            {/* Quarter marks. Purely orientation -- they make a half-full
                bar readable as half without reading the numbers. */}
            {[25, 50, 75].map((at) => (
              <View key={at} style={[s.tick, { left: `${at}%`, backgroundColor: color, opacity: pct > at ? 0 : 0.35 }]} />
            ))}
            <View
              style={[s.fill, { width: `${pct}%`, backgroundColor: over ? COLORS.over : color }]}
            />
          </View>

          {/* The target. Sits at the end of the track because the track IS
              the target -- see this file's header. */}
          <MaterialCommunityIcons
            name="flag-checkered"
            size={17}
            color={over ? COLORS.over : COLORS.textMuted}
            style={s.flag}
          />

          {/* Only when past the target. Rendering it inline (rather than
              floating it over the bar) lets the track shrink to make room,
              so a long number can never overflow the card. */}
          {over ? (
            <View style={s.overPill}>
              <Text style={s.overPillText}>
                {overBy}
                {unit.trim()} over
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export default function DashboardScreen({ entries, goals, onDeleteEntry }) {
  const totals = sumEntries(entries);

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Texture behind the title. Inside the scroll content rather than
          fixed behind it, so it scrolls away with the header instead of
          sitting under the food list. */}
      <View pointerEvents="none" style={s.blobs}>
        <View style={[s.blob, s.blobA]} />
        <View style={[s.blob, s.blobB]} />
        <View style={[s.blob, s.blobC]} />
      </View>

      <View style={s.header}>
        <Text style={s.title}>Today</Text>
        {ART_READY ? (
          <Image source={MASCOT} style={s.mascot} resizeMode="contain" />
        ) : null}
      </View>

      <View style={s.card}>
        <Text style={s.eyebrow}>DAILY FUEL</Text>
        {MACROS.map((m) => (
          <MacroRow
            key={m.key}
            macroKey={m.key}
            label={m.label}
            unit={m.unit}
            color={m.color}
            tint={m.tint}
            value={totals[m.key]}
            goal={goals[m.key]}
          />
        ))}
      </View>

      <View style={s.sectionRow}>
        <Text style={s.sectionTitle}>Logged today ({entries.length})</Text>
        {/* Reserved for the XP badge from the mockup. There is no points
            system in this app yet, and inventing a number to fill a badge
            would be worse than an empty corner -- so the slot exists, the
            layout accounts for it, and it renders nothing until XP is a
            real feature with real rules. */}
      </View>

      {entries.length === 0 ? (
        <View style={s.empty}>
          <View style={s.emptyMark}>
            <Ionicons name="document-text-outline" size={22} color={COLORS.textMuted} />
          </View>
          <Text style={s.emptyText}>
            Nothing logged yet — head to the Log Food tab to add something.
          </Text>
        </View>
      ) : (
        entries
          .slice()
          .reverse()
          .map((e) => (
            <View key={e.id} style={s.entryRow}>
              <FoodIcon
                iconKey={iconKeyForFoodId(foods, e.foodId)}
                size={FOOD_ICON_SIZE}
                style={s.entryIcon}
              />
              <View style={s.entryBody}>
                <Text style={s.entryName} numberOfLines={1}>
                  {e.name}
                </Text>
                <Text style={s.entrySub}>
                  {e.servingLabel} · {e.calories} kcal
                </Text>
              </View>
              <TouchableOpacity onPress={() => onDeleteEntry(e.id)} style={s.removeBtn}>
                <Text style={s.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))
      )}

      {/* A build marker so Damon can tell at a glance whether the code he
          just pasted in took effect -- see utils/appVersion.js. */}
      <Text style={s.version}>v{APP_VERSION}</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACE.screen, paddingBottom: 40 },

  blobs: { position: 'absolute', top: 0, left: 0, right: 0, height: 260 },
  blob: { position: 'absolute', backgroundColor: COLORS.blob, borderRadius: RADIUS.pill },
  blobA: { width: 260, height: 200, top: -60, right: -70 },
  blobB: { width: 120, height: 120, top: 40, right: 130 },
  blobC: { width: 46, height: 46, top: 8, right: 210 },

  header: { flexDirection: 'row', alignItems: 'center', minHeight: 96 },
  title: { ...TYPE.screenTitle, color: COLORS.text, flex: 1 },
  mascot: { width: 116, height: 116, marginTop: -12, marginRight: -6 },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,
    padding: SPACE.card,
    marginTop: 4,
    marginBottom: 22,
    ...SHADOW.card,
  },
  eyebrow: { ...TYPE.eyebrow, color: COLORS.eyebrow, marginBottom: 14 },

  macroRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  macroTile: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.tile,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  macroArt: { width: 34, height: 34 },
  macroBody: { flex: 1 },
  macroTop: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 9,
  },
  macroName: { ...TYPE.macroName, color: COLORS.text },
  macroValue: { ...TYPE.macroValue },
  macroNow: { color: COLORS.text },
  macroNowOver: { color: COLORS.over },
  macroGoal: { color: COLORS.textMuted, fontWeight: '600' },

  barRow: { flexDirection: 'row', alignItems: 'center' },
  track: { flex: 1, height: 12, borderRadius: RADIUS.pill, overflow: 'hidden' },
  fill: { height: 12, borderRadius: RADIUS.pill },
  tick: { position: 'absolute', top: 5, width: 3, height: 3, borderRadius: RADIUS.pill },
  flag: { marginLeft: 6 },

  overPill: {
    marginLeft: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.overSoft,
  },
  overPillText: { ...TYPE.pill, color: COLORS.over },

  sectionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { ...TYPE.sectionTitle, color: COLORS.text },

  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.emptyBg,
    borderRadius: RADIUS.row,
    padding: 18,
  },
  emptyMark: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.textFaint,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  emptyText: { ...TYPE.empty, color: COLORS.textSoft, flex: 1, lineHeight: 21 },

  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.row,
    padding: 10,
    marginBottom: SPACE.rowGap,
    ...SHADOW.row,
  },
  // White, always. See this file's header -- the illustrations are opaque
  // JPEGs and a tint here draws a frame around every picture.
  entryIcon: { marginRight: 14 },
  entryBody: { flex: 1 },
  entryName: { ...TYPE.entryName, color: COLORS.text },
  entrySub: { ...TYPE.entrySub, color: COLORS.textMuted, marginTop: 3 },
  removeBtn: { paddingHorizontal: 10, paddingVertical: 8 },
  removeText: { ...TYPE.action, color: COLORS.destructive },

  version: { ...TYPE.version, color: COLORS.textFaint, textAlign: 'center', marginTop: 22 },
});
