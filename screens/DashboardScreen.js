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

import React, { useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import foods from '../data/foods';
import { sumEntries, progressPercent } from '../utils/nutrition';
import { iconKeyForFoodId } from '../utils/foodIcon';
import FoodIcon from '../components/FoodIcon';
import { APP_VERSION } from '../utils/appVersion';
import { COLORS, TYPE, RADIUS, SPACE, SHADOW } from '../utils/theme';
import { scoreDay, targetState } from '../utils/score';
import { customFoodToFood } from '../utils/customFoods';
import { TARGETS } from '../data/scoreConfig';
import { scoreTone } from '../utils/scoreTone';
import { ART_READY, MASCOT, MACRO_ART, MACRO_FALLBACK_ICONS } from '../data/brandArt';

const FOOD_ICON_SIZE = 72;

// The four rows of the summary card, in order. Colour and tint are looked up
// rather than passed in so a macro's identity lives in exactly one place.
// `target` is the row's entry from data/scoreConfig.js — the same object the
// score uses, so the bar's colours and the score's arithmetic can never
// drift apart into disagreeing about the same day.
const MACROS = [
  { key: 'calories', label: 'Calories', unit: ' kcal', color: COLORS.calories, tint: COLORS.caloriesSoft },
  { key: 'protein', label: 'Protein', unit: 'g', color: COLORS.protein, tint: COLORS.proteinSoft },
  { key: 'carbs', label: 'Carbs', unit: 'g', color: COLORS.carbs, tint: COLORS.carbsSoft },
  { key: 'fat', label: 'Fat', unit: 'g', color: COLORS.fat, tint: COLORS.fatSoft },
].map((m) => ({ ...m, target: TARGETS.find((t) => t.key === m.key) }));

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
//
// Four states, not two (v0.0.75). Crossing a target is an achievement and
// now looks like one: the flag goes green and the bar keeps its own colour.
// Amber and red are held back for overshoots big enough to be worth saying
// out loud -- see targetState in utils/score.js for where the lines are.
function MacroRow({ label, unit, color, tint, macroKey, value, goal, target }) {
  const pct = progressPercent(value, goal);
  const state = targetState(value, goal, target);
  const past = state !== 'under';
  // Rounded the same way the numbers above it are, so "158.6 / 144" never
  // disagrees with a stated overshoot of 14.6.
  const overBy = past ? Math.round((value - goal) * 10) / 10 : 0;

  // The bar keeps the macro's own colour right through 'met': hitting a goal
  // is not a warning, and recolouring it would throw away the one cue that
  // tells the four bars apart.
  const barColor =
    state === 'wayOver' ? COLORS.over : state === 'over' ? COLORS.warn : color;
  // The darker twins: this colours the number and the pill's words, and the
  // bright fills only manage about 2.4:1 as text on their own pale pill.
  const statusInk =
    state === 'wayOver' ? COLORS.overInk : state === 'over' ? COLORS.warnInk : COLORS.goodInk;
  const statusSoft =
    state === 'wayOver' ? COLORS.overSoft : state === 'over' ? COLORS.warnSoft : COLORS.goodSoft;

  return (
    <View style={s.macroRow}>
      <View style={[s.macroTile, { backgroundColor: tint }]}>
        <MacroIcon macroKey={macroKey} color={color} />
      </View>

      <View style={s.macroBody}>
        <View style={s.macroTop}>
          <Text style={s.macroName}>{label}</Text>
          <Text style={s.macroValue}>
            <Text style={[s.macroNow, past && { color: statusInk }]}>{value}</Text>
            <Text style={s.macroGoal}>
              {unit} / {goal}
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
            <View style={[s.fill, { width: `${pct}%`, backgroundColor: barColor }]} />
          </View>

          {/* The target. Sits at the end of the track because the track IS
              the target -- see this file's header. Goes green the moment the
              goal is reached, which is the cheapest way to make hitting one
              feel like hitting one. */}
          <MaterialCommunityIcons
            name="flag-checkered"
            size={17}
            color={past ? statusInk : COLORS.textMuted}
            style={s.flag}
          />

          {/* Only once the goal is passed. Rendered inline rather than
              floated over the bar so the track shrinks to make room, and a
              long number can never overflow the card. */}
          {past ? (
            <View style={[s.overPill, { backgroundColor: statusSoft }]}>
              <Text style={[s.overPillText, { color: statusInk }]}>
                {state === 'met' ? 'Goal met' : `${overBy}${unit.trim()} over`}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

// Newest first, with the entries from one tap on a combo collapsed into
// a single row (v0.2.0).
//
// Damon's call: a combo should read as one line, not six. It is done here
// rather than in the database because the score decides what is junk by
// resolving each entry's food_id back to a category -- a genuinely merged
// row would have no food behind it, so every combo would score as clean
// eating and a combo would become the place to hide a takeaway. Keeping
// real entries underneath costs nothing visible and keeps that honest.
//
// A group keeps the position of its newest member, so a combo sits where
// it was logged rather than jumping to wherever its first item landed.
export function groupEntries(entries) {
  const rows = [];
  const seen = new Map();
  for (const e of entries.slice().reverse()) {
    if (!e.comboGroup) {
      rows.push({ key: e.id, entry: e, combo: false });
      continue;
    }
    const already = seen.get(e.comboGroup);
    if (already) {
      already.entries.push(e);
      already.calories += e.calories || 0;
      continue;
    }
    const row = {
      key: e.comboGroup,
      combo: true,
      name: e.comboName || 'Combo',
      entries: [e],
      calories: e.calories || 0,
    };
    seen.set(e.comboGroup, row);
    rows.push(row);
  }
  return rows;
}

export default function DashboardScreen({ entries, goals, onDeleteEntry, onDeleteComboGroup, customFoods = [] }) {
  const totals = sumEntries(entries);
  // Grouped once, not once per read: the heading counts rows and the list
  // renders them, and calling it twice would rebuild the whole thing for
  // a number.
  const rows = useMemo(() => groupEntries(entries), [entries]);
  // null on a day with nothing logged -- see utils/score.js. The chip simply
  // doesn't render then, rather than showing a zero nobody earned.
  // The scorer decides what is junk by resolving each entry back to a
  // food's category, so a custom food has to be in the list it searches or
  // a logged takeaway would score as clean eating. customFoodToFood gives
  // a fast-food one mixed_dish/restaurant, which the existing FLAGGED rule
  // already counts -- no change to the scorer itself.
  const scorableFoods = useMemo(
    () => [...foods, ...(customFoods || []).map(customFoodToFood)],
    [customFoods]
  );
  const score = scoreDay({ entries, totals, goals, foods: scorableFoods });

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
        <View style={s.cardHead}>
          <Text style={s.eyebrow}>DAILY FUEL</Text>
          {/* Today's score is provisional and says so. At 10am nobody has
              eaten their calories yet, so a number presented as final would
              read as failure all morning. It locks at midnight. */}
          {score ? (
            <View style={[s.scoreChip, { backgroundColor: scoreTone(score.total).soft }]}>
              <Text style={[s.scoreChipNum, { color: scoreTone(score.total).ink }]}>
                {score.total}
              </Text>
              <Text style={s.scoreChipLabel}>so far</Text>
            </View>
          ) : null}
        </View>
        {MACROS.map((m) => (
          <MacroRow
            key={m.key}
            macroKey={m.key}
            label={m.label}
            unit={m.unit}
            color={m.color}
            tint={m.tint}
            target={m.target}
            value={totals[m.key]}
            goal={goals[m.key]}
          />
        ))}
      </View>

      <View style={s.sectionRow}>
        <Text style={s.sectionTitle}>Logged today ({rows.length})</Text>
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
        rows.map((row) =>
          row.combo ? (
            /* A combo, as one line (v0.2.0). Underneath it is still one
               real entry per food -- see utils/db.js's insertComboEntries
               for why they are not merged into a single row in the
               database. This is the merge, and it is a display one. */
            <View key={row.key} style={s.entryRow}>
              <View style={s.comboStack}>
                {row.entries.slice(0, 3).map((e, i) => (
                  <FoodIcon
                    key={e.id}
                    iconKey={iconKeyForFoodId(foods, e.foodId, customFoods)}
                    size={FOOD_ICON_SIZE - i * 8}
                    style={[s.comboStackIcon, { left: i * 9, top: i * 4, zIndex: 3 - i }]}
                  />
                ))}
              </View>
              <View style={s.entryBody}>
                <Text style={s.entryName} numberOfLines={1}>
                  {row.name}
                </Text>
                <Text style={s.entrySub}>
                  {row.entries.length} items · {row.calories} kcal
                </Text>
              </View>
              <TouchableOpacity onPress={() => onDeleteComboGroup(row.key)} style={s.removeBtn}>
                <Text style={s.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View key={row.key} style={s.entryRow}>
              <FoodIcon
                iconKey={iconKeyForFoodId(foods, row.entry.foodId, customFoods)}
                size={FOOD_ICON_SIZE}
                style={s.entryIcon}
              />
              <View style={s.entryBody}>
                <Text style={s.entryName} numberOfLines={1}>
                  {row.entry.name}
                </Text>
                <Text style={s.entrySub}>
                  {row.entry.servingLabel} · {row.entry.calories} kcal
                </Text>
              </View>
              <TouchableOpacity onPress={() => onDeleteEntry(row.entry.id)} style={s.removeBtn}>
                <Text style={s.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )
        )
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
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  eyebrow: { ...TYPE.eyebrow, color: COLORS.eyebrow },
  scoreChip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  scoreChipNum: { fontSize: 17, fontWeight: '800' },
  scoreChipLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted },

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
  macroGoal: { color: COLORS.textMuted, fontWeight: '600' },

  barRow: { flexDirection: 'row', alignItems: 'center' },
  track: { flex: 1, height: 12, borderRadius: RADIUS.pill, overflow: 'hidden' },
  fill: { height: 12, borderRadius: RADIUS.pill },
  tick: { position: 'absolute', top: 5, width: 3, height: 3, borderRadius: RADIUS.pill },
  flag: { marginLeft: 6 },

  // Background and text colour are both set at the call site from the row's
  // state, so nothing is hard-coded to the red case here.
  overPill: {
    marginLeft: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  overPillText: { ...TYPE.pill },

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
  // Three pictures fanned out, so a combo row is recognisable as a combo
  // before you read a word of it.
  comboStack: { width: FOOD_ICON_SIZE + 18, height: FOOD_ICON_SIZE, marginRight: 12 },
  comboStackIcon: { position: 'absolute', borderRadius: 12 },
  entryIcon: { marginRight: 14 },
  entryBody: { flex: 1 },
  entryName: { ...TYPE.entryName, color: COLORS.text },
  entrySub: { ...TYPE.entrySub, color: COLORS.textMuted, marginTop: 3 },
  removeBtn: { paddingHorizontal: 10, paddingVertical: 8 },
  removeText: { ...TYPE.action, color: COLORS.destructive },

  version: { ...TYPE.version, color: COLORS.textFaint, textAlign: 'center', marginTop: 22 },
});
