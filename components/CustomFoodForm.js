// Creating or editing a food the user made up (v0.0.95).
//
// Its own file rather than another 400 lines of LogFoodScreen, which is
// already the largest screen in the app by a wide margin.
//
// The form is deliberately short: name, picture, one amount, four macros.
// Everything else the app knows about a food -- how it re-portions, what
// its serving is called, whether the score counts it against you -- is
// derived from those (utils/customFoods.js) rather than asked for.
//
// HOW MUCH IS THIS is two choices, not fifteen (v0.0.97). Either the
// macros are for one serving -- whatever the label calls a serving -- or
// they are for a weight you type. v0.0.95 let a number sit in front of
// any of fifteen units and asked "What is in 100 servings?", which is not
// a question anyone has. A cup, a scoop, a bowl and a bar are all just
// "one of these".
//
// Either way the macros are for what is described above them, never per
// 100g. The heading over the macro block restates it, because a packet
// label can mean either and getting it backwards is a silent 3x error.

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FoodIcon from './FoodIcon';
import IconPicker from './IconPicker';
import { WEIGHT_UNITS, unitMeta, isWeightUnit, validateCustomFood, glyphRef } from '../utils/customFoods';
import { COLORS, TYPE, RADIUS, SPACE, SHADOW } from '../utils/theme';

const DEFAULT_ICON = glyphRef('silverware-fork-knife');

// The four macro fields, in the order they appear on every label.
const MACRO_FIELDS = [
  { key: 'calories', label: 'Calories', suffix: 'kcal' },
  { key: 'protein', label: 'Protein', suffix: 'g' },
  { key: 'carbs', label: 'Carbs', suffix: 'g' },
  { key: 'fat', label: 'Fat', suffix: 'g' },
];

export default function CustomFoodForm({ existing, onCancel, onSave, onDelete }) {
  const editing = !!existing;
  const [name, setName] = useState(existing?.name || '');
  const [icon, setIcon] = useState(existing?.icon || DEFAULT_ICON);
  const [unit, setUnit] = useState(existing?.unit || 'g');
  const [amount, setAmount] = useState(existing ? String(existing.amount) : '100');
  const [macros, setMacros] = useState({
    calories: existing ? String(existing.calories) : '',
    protein: existing ? String(existing.protein) : '',
    carbs: existing ? String(existing.carbs) : '',
    fat: existing ? String(existing.fat) : '',
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const setMacro = (key, value) => setMacros((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    const problem = validateCustomFood({ name, unit, amount, ...macros });
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setBusy(true);
    const saved = await onSave({
      name,
      icon,
      // The unit is what decides which shape this food takes: g/ml/oz can
      // be divided down and re-portioned later, a bowl cannot.
      servingType: isWeightUnit(unit) ? 'weight' : 'count',
      unit,
      // A serving is always one of itself; only a weight carries a number.
      amount: isWeightUnit(unit) ? Number(amount) : 1,
      calories: Number(macros.calories),
      protein: Number(macros.protein),
      carbs: Number(macros.carbs),
      fat: Number(macros.fat),
    });
    setBusy(false);
    if (!saved) setError('Could not save. Please try again.');
  };

  if (pickerOpen) {
    return <IconPicker value={icon} onPick={(ref) => { setIcon(ref); setPickerOpen(false); }} onCancel={() => setPickerOpen(false)} />;
  }

  const u = unitMeta(unit);
  const weightMode = isWeightUnit(unit);

  return (
    <View style={s.wrap}>
      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        <Text style={s.heading}>{editing ? 'Edit food' : 'Create new food'}</Text>

        <Text style={s.label}>Name</Text>
        <TextInput
          style={s.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Mum's chilli, protein bar"
          placeholderTextColor={COLORS.textMuted}
          autoCorrect={false}
        />

        <Text style={s.label}>Picture</Text>
        <TouchableOpacity style={s.iconRow} activeOpacity={0.7} onPress={() => setPickerOpen(true)}>
          <FoodIcon iconKey={icon} size={56} />
          <Text style={s.iconRowText}>Choose a picture</Text>
          <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.textMuted} />
        </TouchableOpacity>

        <Text style={s.label}>How much is this?</Text>
        {/* Two columns, one of them chosen. Not a unit list: "1 serving"
            and "a weight" are different kinds of statement, and mixing
            them is what produced "What is in 100 servings?". */}
        <View style={s.modeRow}>
          <TouchableOpacity
            style={[s.modeCard, !weightMode && s.modeCardOn]}
            activeOpacity={0.75}
            onPress={() => setUnit('serving')}
            accessibilityRole="button"
            accessibilityState={{ selected: !weightMode }}
          >
            <Text style={[s.modeTitle, !weightMode && s.modeTitleOn]}>1 Serving</Text>
            <Text style={[s.modeSub, !weightMode && s.modeSubOn]}>However it comes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.modeCard, weightMode && s.modeCardOn]}
            activeOpacity={0.75}
            onPress={() => setUnit(isWeightUnit(unit) ? unit : 'g')}
            accessibilityRole="button"
            accessibilityState={{ selected: weightMode }}
          >
            <Text style={[s.modeTitle, weightMode && s.modeTitleOn]}>A weight</Text>
            <Text style={[s.modeSub, weightMode && s.modeSubOn]}>g, ml or oz</Text>
          </TouchableOpacity>
        </View>

        {weightMode ? (
          <View style={s.amountRow}>
            <TextInput
              style={[s.input, s.amountInput]}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="100"
              placeholderTextColor={COLORS.textMuted}
            />
            {WEIGHT_UNITS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[s.unitChip, unit === opt.key && s.unitChipOn]}
                activeOpacity={0.7}
                onPress={() => setUnit(opt.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: unit === opt.key }}
              >
                <Text style={[s.unitChipText, unit === opt.key && s.unitChipTextOn]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
        <Text style={s.hint}>
          {weightMode
            ? 'Measured by weight, so you can log any amount of it later.'
            : 'Logged one serving at a time, the way an egg is.'}
        </Text>

        <Text style={s.label}>{weightMode ? `What is in ${amount || '…'} ${u.label}?` : 'What is in one serving?'}</Text>
        <View style={s.macroGrid}>
          {MACRO_FIELDS.map((f) => (
            <View key={f.key} style={s.macroCell}>
              <Text style={s.macroLabel}>{f.label}</Text>
              <View style={s.macroInputRow}>
                <TextInput
                  style={[s.input, s.macroInput]}
                  value={macros[f.key]}
                  onChangeText={(v) => setMacro(f.key, v)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={COLORS.textMuted}
                />
                <Text style={s.macroSuffix}>{f.suffix}</Text>
              </View>
            </View>
          ))}
        </View>

        {error ? <Text style={s.error}>{error}</Text> : null}

        {editing ? (
          <TouchableOpacity style={s.deleteBtn} activeOpacity={0.7} onPress={() => onDelete(existing.id)}>
            <MaterialCommunityIcons name="trash-can-outline" size={17} color={COLORS.destructive} />
            <Text style={s.deleteText}>Delete this food</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      <View style={s.actions}>
        <TouchableOpacity style={s.cancelBtn} activeOpacity={0.7} onPress={onCancel} disabled={busy}>
          <Text style={s.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.saveBtn, busy && s.saveBtnBusy]} activeOpacity={0.8} onPress={handleSave} disabled={busy}>
          <Text style={s.saveText}>{busy ? 'Saving…' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1 },
  body: { paddingBottom: 24 },
  heading: { ...TYPE.sectionTitle, color: COLORS.text, marginBottom: 14 },
  label: { fontSize: 12.5, fontWeight: '800', color: COLORS.textSoft, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.row,
    padding: 12,
    ...SHADOW.row,
  },
  iconRowText: { flex: 1, fontSize: 16, fontWeight: '700', color: COLORS.text },

  modeRow: { flexDirection: 'row', gap: 10 },
  modeCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.tile,
    borderWidth: 2,
    borderColor: COLORS.line,
    paddingVertical: 13,
    paddingHorizontal: 12,
  },
  modeCardOn: { borderColor: COLORS.accent, backgroundColor: COLORS.caloriesSoft },
  modeTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  modeTitleOn: { color: COLORS.accent },
  modeSub: { fontSize: 12.5, color: COLORS.textMuted, marginTop: 3 },
  modeSubOn: { color: COLORS.accent },

  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  amountInput: { flex: 1 },
  unitChip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    marginRight: 7,
  },
  unitChipOn: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  unitChipText: { fontSize: 14, fontWeight: '700', color: COLORS.textSoft },
  unitChipTextOn: { color: '#fff' },
  hint: { fontSize: 12.5, color: COLORS.textMuted, marginTop: 7, lineHeight: 17 },

  macroGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  macroCell: { flexBasis: '47%', flexGrow: 1 },
  macroLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textSoft, marginBottom: 5 },
  macroInputRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  macroInput: { flex: 1 },
  macroSuffix: { fontSize: 13.5, fontWeight: '700', color: COLORS.textMuted, width: 30 },

  error: { color: COLORS.overInk, fontSize: 14, fontWeight: '600', marginTop: 14 },

  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 24, paddingVertical: 12 },
  deleteText: { color: COLORS.destructive, fontWeight: '700', fontSize: 15 },

  actions: { flexDirection: 'row', gap: 9, paddingTop: 10 },
  cancelBtn: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.line,
  },
  cancelText: { fontSize: 16, fontWeight: '700', color: COLORS.textSoft },
  saveBtn: { flex: 1.4, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: COLORS.accent },
  saveBtnBusy: { opacity: 0.6 },
  saveText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
