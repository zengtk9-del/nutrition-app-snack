// Creating or editing a combo (v0.2.0).
//
// Damon's flow, in his words: "2 cards listed horizontally - click to
// choose food in the food saved in both favorites and my own food - a add
// button below the the two cards - press add to add one card - press card
// to select food - press add to add one empty card - .. - repeat until all
// needed are added (limit is 20) - hit done to save combo."
//
// So: a grid two across, opening on two empty cards, one Add button under
// it, and Done. The cards are the interface -- there is no list of
// checkboxes and no multi-select, because a combo is an ordered thing you
// are assembling rather than a set you are filtering.
//
// TWO ACROSS, WRAPPING. "Listed horizontally" with a limit of twenty
// cannot be one row, so it is a two-column grid: the first two cards sit
// side by side exactly as described, and the third starts a new row rather
// than scrolling sideways off the screen. A horizontal scroller would hide
// most of a full combo behind a gesture.
//
// AN EMPTY CARD IS NOT AN ERROR. You can add a card and leave it blank --
// pressing Add twice by accident should not trap you. Blanks are dropped
// on save, and validateCombo only cares how many are filled.

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, FlatList, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FoodIcon from './FoodIcon';
import { pickableFoods, validateCombo, MAX_COMBO_ITEMS, INITIAL_COMBO_CARDS } from '../utils/combos';
import { iconKeyForFoodId } from '../utils/foodIcon';
import foods from '../data/foods';
import { COLORS, TYPE, RADIUS, SPACE, SHADOW } from '../utils/theme';

// The picture for a pickable row, whichever list it came from. A custom
// food carries its own icon reference; a favourite has to be resolved
// through the food it was saved from.
const iconFor = (p) => (p.source === 'custom' ? p.icon : iconKeyForFoodId(foods, p.foodId));

function PickerScreen({ options, onPick, onCancel }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const shown = q ? options.filter((o) => o.name.toLowerCase().includes(q)) : options;

  return (
    <View style={s.wrap}>
      <TouchableOpacity style={s.back} activeOpacity={0.6} onPress={onCancel} accessibilityRole="button" accessibilityLabel="Back to the combo">
        <MaterialCommunityIcons name="chevron-left" size={20} color={COLORS.accent} />
        <Text style={s.backText}>Back</Text>
      </TouchableOpacity>
      <Text style={s.heading}>Pick a food</Text>

      {options.length > 8 ? (
        <View style={s.searchWrap}>
          <MaterialCommunityIcons name="magnify" size={20} color={COLORS.textSoft} />
          <TextInput
            style={s.search}
            value={query}
            onChangeText={setQuery}
            placeholder="Search your saved foods"
            placeholderTextColor={COLORS.textMuted}
            autoCorrect={false}
          />
        </View>
      ) : null}

      <FlatList
        data={shown}
        keyExtractor={(item) => item.key}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 30 }}
        ListEmptyComponent={
          <Text style={s.empty}>
            {options.length === 0
              ? 'Save a favourite or create your own food first — a combo is built from those.'
              : `Nothing saved matches “${query}”.`}
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.pickRow}
            activeOpacity={0.7}
            onPress={() => onPick(item)}
            accessibilityRole="button"
            accessibilityLabel={`Add ${item.name} to this combo`}
          >
            <FoodIcon iconKey={iconFor(item)} size={54} />
            <View style={s.pickBody}>
              <Text style={s.pickName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={s.pickSub}>{item.subtitle}</Text>
            </View>
            <View style={s.pickBadge}>
              <Text style={s.pickBadgeText}>{item.source === 'custom' ? 'My food' : 'Favourite'}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

export default function ComboForm({ existing, favorites, customFoods, onCancel, onSave, onDelete }) {
  const editing = !!existing;
  const options = pickableFoods(favorites, customFoods);
  const byKey = new Map(options.map((o) => [o.key, o]));

  const [name, setName] = useState(existing?.name || '');
  // One slot per card, in order. `null` is an empty card.
  const [slots, setSlots] = useState(() => {
    if (existing) {
      const filled = (existing.items || []).map((i) => byKey.get(`${i.source}:${i.refId}`) || null).filter(Boolean);
      return filled.length ? filled : new Array(INITIAL_COMBO_CARDS).fill(null);
    }
    return new Array(INITIAL_COMBO_CARDS).fill(null);
  });
  const [pickingFor, setPickingFor] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const filled = slots.filter(Boolean);
  const totalKcal = filled.reduce((sum, p) => sum + (p.calories || 0), 0);
  const atLimit = slots.length >= MAX_COMBO_ITEMS;

  if (pickingFor != null) {
    return (
      <PickerScreen
        options={options}
        onCancel={() => setPickingFor(null)}
        onPick={(choice) => {
          setSlots((prev) => prev.map((sl, i) => (i === pickingFor ? choice : sl)));
          setPickingFor(null);
        }}
      />
    );
  }

  const handleSave = async () => {
    const problem = validateCombo({ name, items: slots });
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setBusy(true);
    const saved = await onSave({
      name: name.trim(),
      // Blank cards are dropped here rather than being an error above.
      items: filled.map((p) => ({ source: p.source, refId: p.refId })),
    });
    setBusy(false);
    if (!saved) setError('Could not save. Please try again.');
  };

  return (
    <View style={s.wrap}>
      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        <Text style={s.heading}>{editing ? 'Edit combo' : 'Create combo'}</Text>

        <Text style={s.label}>Name</Text>
        <TextInput
          style={s.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Breakfast, Post-gym"
          placeholderTextColor={COLORS.textMuted}
          autoCorrect={false}
          maxLength={40}
        />

        <View style={s.foodsHead}>
          <Text style={s.label}>Foods</Text>
          <Text style={s.count}>
            {filled.length} of {MAX_COMBO_ITEMS}
            {totalKcal > 0 ? ` · ${totalKcal} kcal` : ''}
          </Text>
        </View>

        <View style={s.grid}>
          {slots.map((slot, i) => (
            <TouchableOpacity
              key={i}
              style={[s.card, !slot && s.cardEmpty]}
              activeOpacity={0.75}
              onPress={() => setPickingFor(i)}
              accessibilityRole="button"
              accessibilityLabel={slot ? `Change ${slot.name}` : `Choose a food for card ${i + 1}`}
            >
              {slot ? (
                <>
                  {/* Clearing a card is its own target, small and in the
                      corner: tapping the card itself already means
                      "change this", and one gesture cannot mean both. */}
                  <TouchableOpacity
                    style={s.clearBtn}
                    onPress={() => setSlots((prev) => prev.map((sl, j) => (j === i ? null : sl)))}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${slot.name} from this combo`}
                  >
                    <MaterialCommunityIcons name="close" size={14} color={COLORS.textMuted} />
                  </TouchableOpacity>
                  <FoodIcon iconKey={iconFor(slot)} size={56} />
                  <Text style={s.cardName} numberOfLines={2}>
                    {slot.name}
                  </Text>
                  <Text style={s.cardSub} numberOfLines={1}>
                    {slot.subtitle}
                  </Text>
                </>
              ) : (
                <>
                  <View style={s.emptyMark}>
                    <MaterialCommunityIcons name="plus" size={24} color={COLORS.accent} />
                  </View>
                  <Text style={s.cardEmptyText}>Choose a food</Text>
                </>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[s.addBtn, atLimit && s.addBtnOff]}
          activeOpacity={0.8}
          disabled={atLimit}
          onPress={() => setSlots((prev) => [...prev, null])}
          accessibilityRole="button"
          accessibilityLabel="Add another card"
        >
          <MaterialCommunityIcons name="plus" size={18} color={atLimit ? COLORS.textMuted : COLORS.accent} />
          <Text style={[s.addBtnText, atLimit && s.addBtnTextOff]}>
            {atLimit ? `That's all ${MAX_COMBO_ITEMS}` : 'Add'}
          </Text>
        </TouchableOpacity>

        {error ? <Text style={s.error}>{error}</Text> : null}

        {editing ? (
          <TouchableOpacity style={s.deleteBtn} activeOpacity={0.7} onPress={() => onDelete(existing.id)}>
            <MaterialCommunityIcons name="trash-can-outline" size={17} color={COLORS.destructive} />
            <Text style={s.deleteText}>Delete this combo</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      <View style={s.actions}>
        <TouchableOpacity style={s.cancelBtn} activeOpacity={0.7} onPress={onCancel} disabled={busy}>
          <Text style={s.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.doneBtn, busy && s.doneBtnBusy]} activeOpacity={0.8} onPress={handleSave} disabled={busy}>
          <Text style={s.doneText}>{busy ? 'Saving…' : 'Done'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1 },
  body: { paddingBottom: 24 },
  back: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 2, paddingVertical: 8, paddingRight: 14 },
  backText: { fontSize: 16, fontWeight: '700', color: COLORS.accent },
  heading: { ...TYPE.sectionTitle, color: COLORS.text, marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '800', color: COLORS.textSoft, marginBottom: 7, marginTop: 14 },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    ...SHADOW.row,
  },

  foodsHead: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  count: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted, marginBottom: 7 },

  // Two across, wrapping. `flexBasis: 47%` plus a gap rather than a fixed
  // width, so the pair fills the row at any phone size.
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 132,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: RADIUS.row,
    backgroundColor: COLORS.card,
    ...SHADOW.row,
  },
  // A dashed outline says "there is meant to be something here" in a way a
  // plain empty card does not -- the same language FoodIcon's placeholder
  // already uses.
  cardEmpty: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#c9d6ea',
    backgroundColor: COLORS.emptyBg,
    shadowOpacity: 0,
    elevation: 0,
  },
  emptyMark: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e2ecfb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmptyText: { fontSize: 13, fontWeight: '700', color: COLORS.accent, marginTop: 9 },
  cardName: { fontSize: 14, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginTop: 8, lineHeight: 18 },
  cardSub: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginTop: 3 },
  clearBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#eef1f6',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    backgroundColor: COLORS.caloriesSoft,
  },
  addBtnOff: { borderColor: COLORS.line, backgroundColor: COLORS.emptyBg },
  addBtnText: { fontSize: 15, fontWeight: '800', color: COLORS.accent },
  addBtnTextOff: { color: COLORS.textMuted },

  error: { color: COLORS.destructive, fontSize: 14, fontWeight: '700', marginTop: 14 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 24, paddingVertical: 12 },
  deleteText: { color: COLORS.destructive, fontWeight: '700', fontSize: 15 },

  actions: { flexDirection: 'row', gap: 9, paddingTop: 10 },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    borderRadius: 13,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  cancelText: { fontSize: 15.5, fontWeight: '700', color: COLORS.textSoft },
  doneBtn: {
    flex: 1.4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    borderRadius: 13,
    backgroundColor: COLORS.accent,
  },
  doneBtnBusy: { opacity: 0.6 },
  doneText: { fontSize: 16, fontWeight: '800', color: '#fff' },

  // The picker
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    height: 46,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    ...SHADOW.row,
  },
  search: { flex: 1, fontSize: 15.5, color: COLORS.text, padding: 0 },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.row,
    padding: 12,
    marginBottom: SPACE.rowGap,
    ...SHADOW.row,
  },
  pickBody: { flex: 1, minWidth: 0 },
  pickName: { fontSize: 16, fontWeight: '800', color: COLORS.text, lineHeight: 20 },
  pickSub: { fontSize: 12.5, fontWeight: '600', color: COLORS.textMuted, marginTop: 3 },
  pickBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: COLORS.emptyBg },
  pickBadgeText: { fontSize: 11, fontWeight: '800', color: COLORS.textSoft },
  empty: { fontSize: 14.5, color: COLORS.textMuted, textAlign: 'center', marginTop: 24, lineHeight: 20 },
});
