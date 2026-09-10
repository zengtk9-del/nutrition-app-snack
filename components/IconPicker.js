// Choosing a picture for a food you invented (v0.0.95).
//
// Two sources in one screen: twelve vector category marks, always shown,
// and all 1,737 drawn food icons behind a search box.
//
// SEARCH-FIRST FOR THE ARTWORK, and that is a performance decision rather
// than a taste one. The drawn icons are not bundled -- they are URLs on
// jsDelivr (utils/assetHost.js) -- so a grid showing all of them would
// pull 1,737 images over the network. The list stays empty until you
// type, which also happens to be how emoji pickers behave.
//
// The search itself lives in data/customFoodIcons.js; see the notes there
// on why it matches word starts rather than substrings, and why the
// synonyms point at category keys rather than words.

import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FoodIcon from './FoodIcon';
import { CUSTOM_GLYPHS, searchFoodIcons } from '../data/customFoodIcons';
import { glyphRef, artRef, refValue, isGlyphRef } from '../utils/customFoods';
import { COLORS, TYPE, RADIUS, SHADOW } from '../utils/theme';

const COLUMNS = 4;

export default function IconPicker({ value, onPick, onCancel }) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchFoodIcons(query, 200), [query]);
  const searching = query.trim().length > 0;

  return (
    <View style={s.wrap}>
      <TouchableOpacity style={s.back} activeOpacity={0.6} onPress={onCancel} accessibilityRole="button" accessibilityLabel="Back to the food form">
        <MaterialCommunityIcons name="chevron-left" size={20} color={COLORS.accent} />
        <Text style={s.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={s.heading}>Choose a picture</Text>

      <View style={s.searchWrap}>
        <MaterialCommunityIcons name="magnify" size={20} color={COLORS.textSoft} />
        <TextInput
          style={s.search}
          value={query}
          onChangeText={setQuery}
          placeholder="Search 1,737 foods (try fruit, or zucchini)"
          placeholderTextColor={COLORS.textMuted}
          autoCorrect={false}
          returnKeyType="search"
        />
        {query ? (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Clear search">
            <MaterialCommunityIcons name="close-circle" size={19} color={COLORS.textFaint} />
          </TouchableOpacity>
        ) : null}
      </View>

      {searching ? (
        <FlatList
          data={results}
          key="art"
          numColumns={COLUMNS}
          keyExtractor={(item) => item.key}
          contentContainerStyle={s.grid}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<Text style={s.empty}>Nothing matches “{query}”. Try a broader word.</Text>}
          renderItem={({ item }) => {
            const ref = artRef(item.key);
            const on = value === ref;
            return (
              <TouchableOpacity
                style={[s.cell, on && s.cellOn]}
                activeOpacity={0.7}
                onPress={() => onPick(ref)}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={item.label}
              >
                <FoodIcon iconKey={item.key} size={54} />
                <Text style={s.cellText} numberOfLines={2}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      ) : (
        <FlatList
          data={CUSTOM_GLYPHS}
          key="glyphs"
          numColumns={COLUMNS}
          keyExtractor={(item) => item.key}
          contentContainerStyle={s.grid}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <Text style={s.sectionNote}>
              Twelve general marks, or search above for one of the drawn foods.
            </Text>
          }
          renderItem={({ item }) => {
            const ref = glyphRef(item.key);
            const on = value === ref || (isGlyphRef(value) && refValue(value) === item.key);
            return (
              <TouchableOpacity
                style={[s.cell, on && s.cellOn]}
                activeOpacity={0.7}
                onPress={() => onPick(ref)}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={item.label}
              >
                <View style={s.glyphTile}>
                  <MaterialCommunityIcons name={item.key} size={28} color={COLORS.accent} />
                </View>
                <Text style={s.cellText} numberOfLines={2}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1 },
  back: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 2, paddingVertical: 8, paddingRight: 14 },
  backText: { fontSize: 16, fontWeight: '700', color: COLORS.accent },
  heading: { ...TYPE.sectionTitle, color: COLORS.text, marginBottom: 12 },
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
  sectionNote: { fontSize: 13, color: COLORS.textMuted, marginBottom: 10, lineHeight: 18 },
  grid: { paddingBottom: 30 },
  cell: {
    flex: 1 / COLUMNS,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginBottom: 6,
    borderRadius: RADIUS.tile,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cellOn: { borderColor: COLORS.accent, backgroundColor: COLORS.caloriesSoft },
  glyphTile: {
    width: 54,
    height: 54,
    borderRadius: RADIUS.tile,
    backgroundColor: '#eef5fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: { fontSize: 10.5, fontWeight: '700', color: COLORS.textSoft, textAlign: 'center', marginTop: 5, lineHeight: 13 },
  empty: { fontSize: 14.5, color: COLORS.textMuted, textAlign: 'center', marginTop: 24, lineHeight: 20 },
});
