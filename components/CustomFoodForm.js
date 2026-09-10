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

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FoodIcon from './FoodIcon';
import IconPicker from './IconPicker';
import MacroSlider from './MacroSlider';
import RulerSlider, { rulerStepFor } from './RulerSlider';
import { MACRO_COLORS } from './MacroDonutChart';
import {
  WEIGHT_UNITS,
  unitMeta,
  isWeightUnit,
  validateCustomFood,
  glyphRef,
  calorieCeiling,
  macroMassLimit,
  fitToMass,
  amountInGrams,
  MAX_AMOUNT,
} from '../utils/customFoods';
import {
  redistributeCaloriesForTarget,
  redistributeMacroForChange,
  maxGramsForMacro,
  MACRO_KCAL_PER_G,
} from '../utils/goals';
import { COLORS, TYPE, RADIUS, SPACE, SHADOW } from '../utils/theme';

const DEFAULT_ICON = glyphRef('silverware-fork-knife');

// The three that get a slider. Calories is not one of them: it is the
// number everything else is derived from, so it gets the ruler above.
const MACRO_ROWS = [
  { key: 'protein', gramsKey: 'proteinG', label: 'Protein' },
  { key: 'carbs', gramsKey: 'carbsG', label: 'Carbs' },
  { key: 'fat', gramsKey: 'fatG', label: 'Fat' },
];

// Where a brand new food's tape starts. Not zero: a ruler parked at the
// very end of its own travel looks broken, and 200 kcal is a plausible
// enough opening bid for a 100g food that most edits are a short drag.
const START_CALORIES = 200;

export default function CustomFoodForm({ existing, onCancel, onSave, onDelete }) {
  const editing = !!existing;
  const [name, setName] = useState(existing?.name || '');
  const [icon, setIcon] = useState(existing?.icon || DEFAULT_ICON);
  const [unit, setUnit] = useState(existing?.unit || 'g');
  const [amount, setAmount] = useState(existing ? String(existing.amount) : '100');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  // --- The macros (v0.1.1) -----------------------------------------------
  //
  // Four free-text boxes became one ruler and three linked sliders, and
  // the change is not only about typos. Typed separately, the four numbers
  // could contradict each other -- 200 kcal alongside 50/50/50 of protein,
  // carbs and fat, which is 850 kcal of food -- and nothing noticed. Here
  // the grams are DERIVED from the calories, so
  //
  //     calories === 4*protein + 4*carbs + 9*fat
  //
  // holds by construction, always. That equation is not a house rule; it is
  // the Atwater system, the arithmetic every nutrition label in the world
  // is computed with. A form that cannot express a violation of it cannot
  // record one.
  //
  // The engine underneath is the one "Set My Own Goals" has used since
  // v0.0.63 (utils/goals.js), unchanged and reused rather than copied:
  // dragging the total reproportions the macros, dragging one macro takes
  // its calories from the others, and locking one pins it while the rest
  // absorb the difference.
  //
  // WHAT THE LOCK IS FOR HERE, specifically. Reading a label, you usually
  // know one number exactly and care less about the rest. Lock protein at
  // what the packet says, set carbs, and fat takes the remainder -- so two
  // of the three land on the label and the third absorbs whatever the
  // label's own rounding (or its fibre, or its alcohol) failed to account
  // for. Without the lock the third macro would be forced anyway; with it,
  // you choose which one gives.
  const startCalories = existing ? Math.max(0, Math.round(Number(existing.calories) || 0)) : START_CALORIES;
  const [calories, setCalories] = useState(startCalories);
  const [proteinG, setProteinG] = useState(
    existing ? Math.max(0, Math.round(Number(existing.protein) || 0)) : null
  );
  const [carbsG, setCarbsG] = useState(existing ? Math.max(0, Math.round(Number(existing.carbs) || 0)) : null);
  const [fatG, setFatG] = useState(existing ? Math.max(0, Math.round(Number(existing.fat) || 0)) : null);
  const [lockedMacro, setLockedMacro] = useState(null);

  // How much food there is to fit the macros into. Zero for a serving,
  // which has no declared weight and therefore no mass limit.
  const grams = isWeightUnit(unit) ? amountInGrams(amount, unit) : 0;

  // A new food has no split yet, so seed one from the opening calories the
  // first time round. Done here rather than in useState so both branches
  // go through the same engine and can never disagree.
  const seeded = proteinG == null;
  const macros = seeded
    ? fitToMass(
        redistributeCaloriesForTarget({ proteinG: 0, carbsG: 0, fatG: 0, lockedMacro: null, newCalories: startCalories }),
        grams,
        startCalories
      )
    : { proteinG, carbsG, fatG };

  // One finger drag fires onValueChange many times. Freezing the split for
  // the duration of the gesture means every one of those calls
  // redistributes from the SAME starting point rather than compounding its
  // own rounding -- the reason MacroGoalsScreen keeps this ref too.
  const dragBaselineRef = useRef(null);
  const baseline = () => dragBaselineRef.current || macros;
  const handleSlidingStart = () => {
    dragBaselineRef.current = macros;
  };
  const handleSlidingComplete = () => {
    dragBaselineRef.current = null;
  };

  const applyMacros = (next) => {
    setProteinG(next.proteinG);
    setCarbsG(next.carbsG);
    setFatG(next.fatG);
  };

  // Re-proportioning is done by calories alone, so the result can weigh
  // more than the food does; fitToMass puts the overflow into fat, which
  // is the only place it can physically go.
  const handleCaloriesChange = (newCalories) => {
    applyMacros(fitToMass(redistributeCaloriesForTarget({ ...baseline(), lockedMacro, newCalories }), grams, newCalories));
    setCalories(newCalories);
  };

  const handleMacroChange = (key, newGrams) => {
    applyMacros(
      redistributeMacroForChange({ ...baseline(), lockedMacro, changedKey: key, newGrams, totalCalories: calories })
    );
  };

  // At most one macro locked at a time: with two pinned there is nothing
  // left to absorb a change, and the third's slider would refuse to move
  // for reasons no one could see. Tapping a second lock moves it.
  const handleToggleLock = (key) => setLockedMacro((prev) => (prev === key ? null : key));

  // The end of the calories tape, recomputed as the amount above changes.
  // Dropping the amount can put the current value past the new ceiling, so
  // it is pulled back down rather than left stranded off the end.
  const ceiling = calorieCeiling({ unit, amount });
  useEffect(() => {
    if (calories > ceiling) handleCaloriesChange(ceiling);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ceiling]);

  // --- What is reachable, versus what is drawn (v0.1.2) ------------------
  //
  // These two used to be the same number and that was the bug Damon hit:
  // locking protein redrew the calories tape at a different scale and slid
  // the carbs and fat thumbs from 23% to 50% of their tracks without
  // either value changing. A control's scale has to belong to the FOOD.
  // Only the wall belongs to the lock.
  //
  // So everything below comes in pairs: a scale that ignores lockedMacro
  // entirely, and a limit that does not.

  // A locked macro is a floor under the total: lock fat at 50g and the
  // food costs at least 450 kcal. Asking for less is asking for something
  // that cannot be built, and the engine answers it by keeping the lock
  // and quietly missing the target -- 120 kcal of drift on a number the
  // screen calls exact, which a probe caught. Locking can never breach
  // this the moment you do it, only afterwards.
  const lockedFloor = lockedMacro
    ? Math.round(macros[`${lockedMacro}G`] * MACRO_KCAL_PER_G[lockedMacro])
    : 0;

  // And locking FAT is a ceiling as well as a floor, because fat is what
  // absorbs density. With F pinned, P + C_g = (C - 9F)/4 and all of it has
  // to fit in the food: C <= 4G + 5F.
  const lockedCeiling =
    grams > 0 && lockedMacro === 'fat' ? Math.min(ceiling, Math.round(4 * grams + 5 * macros.fatG)) : ceiling;

  // The scale of each macro's track: the most of it this food could hold,
  // whichever of energy and weight runs out first. No lockedMacro term --
  // that is the whole point.
  const scaleFor = (key) =>
    Math.max(1, Math.floor(Math.min(calories / MACRO_KCAL_PER_G[key], macroMassLimit(key, grams, calories))));

  // How far it can actually be dragged. Energy is a closed form
  // (maxGramsForMacro); mass is not, because raising one macro lowers the
  // others by a split that depends on where they already are, so the
  // weight at any given gram value is easier to ASK than to solve. Fourteen
  // bisections of a pure function, three times a render, is nothing.
  const reachFor = (key) => {
    const energyMax = maxGramsForMacro({ ...macros, lockedMacro, key });
    if (!(grams > 0)) return energyMax;
    const fits = (g) => {
      const m = redistributeMacroForChange({
        ...macros,
        lockedMacro,
        changedKey: key,
        newGrams: g,
        totalCalories: calories,
      });
      return m.proteinG + m.carbsG + m.fatG <= grams;
    };
    if (fits(energyMax)) return energyMax;
    let lo = Math.min(macros[`${key}G`], energyMax);
    // Already over its weight (an older food, or an amount edited down):
    // the only way left is back.
    if (!fits(lo)) return lo;
    let hi = energyMax;
    while (hi - lo > 1) {
      const mid = Math.floor((lo + hi) / 2);
      if (fits(mid)) lo = mid;
      else hi = mid;
    }
    return lo;
  };

  const handleAmountChange = (text) => {
    const cleaned = text.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    if (cleaned === '' || cleaned === '.') return setAmount(cleaned);
    if (Number(cleaned) > MAX_AMOUNT) return setAmount(String(MAX_AMOUNT));
    setAmount(cleaned);
  };

  const handleSave = async () => {
    const problem = validateCustomFood({
      name,
      unit,
      amount,
      calories,
      protein: macros.proteinG,
      carbs: macros.carbsG,
      fat: macros.fatG,
    });
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
      calories: Number(calories),
      protein: Number(macros.proteinG),
      carbs: Number(macros.carbsG),
      fat: Number(macros.fatG),
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
              onChangeText={handleAmountChange}
              maxLength={6}
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

        {/* Calories first, and alone, because the three below are shares
            of it. Drag the tape rather than type: the number cannot leave
            the range, and the range ends where food does. */}
        <RulerSlider
          style={s.ruler}
          label="Calories"
          unit="kcal"
          value={calories}
          minimumValue={0}
          maximumValue={ceiling}
          valueMin={lockedFloor}
          valueMax={lockedCeiling}
          {...rulerStepFor(ceiling)}
          onValueChange={handleCaloriesChange}
          onSlidingStart={handleSlidingStart}
          onSlidingComplete={handleSlidingComplete}
          formatLabel={(v) => v.toLocaleString()}
        />
        <Text style={s.hint}>
          {weightMode
            ? `Up to ${ceiling.toLocaleString()} kcal — what ${amount || '…'}${u.label} of pure oil would be.`
            : 'Drag to set the calories, then split them below.'}
        </Text>

        {MACRO_ROWS.map((m) => (
          <MacroSlider
            key={m.key}
            label={m.label}
            value={macros[m.gramsKey]}
            minimumValue={0}
            maximumValue={scaleFor(m.key)}
            valueMax={reachFor(m.key)}
            step={1}
            unit="g"
            color={MACRO_COLORS[m.key]}
            lockable
            locked={lockedMacro === m.key}
            disabled={lockedMacro === m.key}
            onToggleLock={() => handleToggleLock(m.key)}
            onValueChange={(g) => handleMacroChange(m.key, g)}
            onSlidingStart={handleSlidingStart}
            onSlidingComplete={handleSlidingComplete}
          />
        ))}
        <Text style={s.hint}>
          Moving one macro takes its calories from the others, so the total
          above never changes. Tap a lock to pin one where it is.
        </Text>

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
  ruler: { marginBottom: 4 },
  hint: { fontSize: 12.5, color: COLORS.textMuted, marginTop: 7, lineHeight: 17 },


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
