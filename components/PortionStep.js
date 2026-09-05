// Counting a portion instead of weighing it.
//
// "138.9 g of apple" is not how anyone thinks about an apple. As of v0.0.58
// a food that comes in units opens on a count -- 1 apple, 2 slices, 3 cloves
// -- with the exact-weight box moved behind a toggle for the times a scale
// is actually involved.
//
// Whether a food can be counted at all is data, not code: data/unitPortions.js
// lists the ~100 foods USDA publishes a per-item weight for. A food missing
// from that table gets no toggle and the weight box as before, so adding
// counting to another food later is one row there and nothing here.

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { unitPortionFor } from '../data/unitPortions';

// Everything the count step needs, or `unit: null` when this food is weighed.
//
// Returns grams too, because that is what the rest of every card is built
// on -- counting changes how a portion is CHOSEN, not how it is priced.
export function useUnitPortion(food, initialSettings) {
  const unit = unitPortionFor(food);
  const sizes = unit?.sizes || [];
  // Open on Medium where USDA publishes one. Not the arithmetic middle of
  // the list: apples run extra small / small / medium / large, and the
  // middle of four is Small, which would quietly under-count every apple.
  const midIdx = sizes.findIndex(([n]) => n === 'Medium');
  const defaultIdx = midIdx >= 0 ? midIdx : Math.floor(sizes.length / 2);

  const [mode, setMode] = useState(
    initialSettings?.portionMode || (unit ? 'count' : 'weight')
  );
  const [count, setCount] = useState(initialSettings?.count ?? 1);
  const [sizeIdx, setSizeIdx] = useState(
    initialSettings?.sizeIdx != null && initialSettings.sizeIdx < sizes.length
      ? initialSettings.sizeIdx
      : defaultIdx
  );

  const perUnit = sizes[sizeIdx]?.[1] ?? 0;
  const grams = Math.round(count * perUnit * 10) / 10;
  // What the logged entry gets called: "2 medium apples", "1 slice".
  const label = unit
    ? `${count} ${sizes.length > 1 ? `${sizes[sizeIdx][0].toLowerCase()} ` : ''}` +
      `${unit.noun}${count === 1 ? '' : 's'}`
    : null;

  return {
    unit, sizes, mode, setMode, count, setCount, sizeIdx, setSizeIdx,
    perUnit, grams, label,
    // Folded into a favourite so it reopens the way it was saved.
    settings: { portionMode: mode, count, sizeIdx },
  };
}

export default function CountPortion({ state, kcal, disabled }) {
  const { sizes, count, setCount, sizeIdx, setSizeIdx, unit, grams } = state;
  const step = (by) => setCount(Math.max(1, Math.min(99, count + by)));

  return (
    <View>
      <View style={s.row}>
        <TouchableOpacity
          style={[s.step, (disabled || count <= 1) && s.stepOff]}
          activeOpacity={0.6}
          disabled={disabled || count <= 1}
          onPress={() => step(-1)}
        >
          <Text style={s.stepText}>−</Text>
        </TouchableOpacity>

        <View style={s.readout}>
          <Text style={s.count}>{count}</Text>
          <Text style={s.noun}>
            {unit.noun}
            {count === 1 ? '' : 's'}
          </Text>
        </View>

        <TouchableOpacity
          style={[s.step, disabled && s.stepOff]}
          activeOpacity={0.6}
          disabled={disabled}
          onPress={() => step(1)}
        >
          <Text style={s.stepText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Only where USDA actually publishes a range. One clove of garlic is
          3g and there is nothing to choose between. */}
      {sizes.length > 1 ? (
        <View style={s.sizes}>
          {sizes.map(([name], i) => (
            <TouchableOpacity
              key={name}
              style={[s.size, i === sizeIdx && s.sizeOn, disabled && s.sizeDim]}
              activeOpacity={0.6}
              disabled={disabled}
              onPress={() => setSizeIdx(i)}
            >
              <Text style={[s.sizeText, i === sizeIdx && s.sizeTextOn]}>{name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      <Text style={s.total}>
        {grams} g{kcal != null ? ` · ${kcal} kcal` : ''}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  step: {
    width: 46, height: 46, borderRadius: 23,
    borderWidth: 1, borderColor: '#4f8ef7',
    alignItems: 'center', justifyContent: 'center',
  },
  stepOff: { borderColor: '#ddd' },
  stepText: { fontSize: 24, fontWeight: '600', color: '#4f8ef7', lineHeight: 26 },
  readout: { flex: 1, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 6 },
  count: { fontSize: 30, fontWeight: '700', color: '#1a1a1a' },
  noun: { fontSize: 17, color: '#555' },
  sizes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  size: {
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8,
    borderWidth: 1, borderColor: '#4f8ef7',
  },
  sizeOn: { backgroundColor: '#4f8ef7' },
  sizeDim: { opacity: 0.5 },
  sizeText: { color: '#4f8ef7', fontWeight: '600', fontSize: 14 },
  sizeTextOn: { color: '#fff' },
  total: { marginTop: 12, fontSize: 15, color: '#666' },
});
