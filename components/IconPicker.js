// Choosing a picture for a food you invented (v0.0.95, restructured in
// v0.0.97).
//
// TWO LEVELS, because they are two different kinds of choosing.
//
//   Level one: twelve vector category marks -- takeaway box, coffee cup,
//   shaker -- and one card, "Use our food icons", carrying the same All
//   artwork the category strip uses. Twelve is a glance; you either see
//   what you want or you go looking.
//
//   Level two: all 1,737 drawn food icons with a search bar on top, the
//   way an emoji picker works. Type "vegetable" and get 183; type
//   "zucchini" and get 2.
//
// v0.0.95 folded both into one screen, with the artwork hidden behind an
// empty search box. That made the second source invisible unless you
// guessed it was there. A card you can see and press is the fix.
//
// The search itself is in data/customFoodIcons.js -- see the notes there
// on matching word starts rather than substrings, and on why the synonyms
// point at category keys rather than words.
//
// ON LOADING: the drawn icons are jsDelivr URLs, not bundled files
// (utils/assetHost.js), so the level-two grid streams in as you scroll
// rather than appearing at once. FlatList only mounts the rows on screen,
// which is what keeps 1,737 remote images survivable.

import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FoodIcon from './FoodIcon';
import { CUSTOM_GLYPHS, searchFoodIcons, allFoodIcons } from '../data/customFoodIcons';
import { getCategoryIcon } from '../data/categoryIcons';
import { glyphRef, artRef, refValue, isGlyphRef } from '../utils/customFoods';
import { COLORS, TYPE, RADIUS, SHADOW } from '../utils/theme';

const COLUMNS = 4;

function BackBar({ label, onPress }) {
  return (
    <TouchableOpacity style={s.back} activeOpacity={0.6} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <MaterialCommunityIcons name="chevron-left" size={20} color={COLORS.accent} />
      <Text style={s.backText}>Back</Text>
    </TouchableOpacity>
  );
}

function Tile({ on, label, onPress, children }) {
  return (
    <TouchableOpacity
      style={[s.cell, on && s.cellOn]}
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!on }}
      accessibilityLabel={label}
    >
      {children}
      <Text style={s.cellText} numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function IconPicker({ value, onPick, onCancel }) {
  const [browsing, setBrowsing] = useState(false);
  const [query, setQuery] = useState('');

  // No query means the whole set, in index order. Only what is on screen
  // is ever mounted, so this costs a screenful of requests, not 1,737.
  const results = useMemo(
    () => (query.trim() ? searchFoodIcons(query, 400) : allFoodIcons()),
    [query]
  );

  if (browsing) {
    return (
      <View style={s.wrap}>
        <BackBar label="Back to the icon list" onPress={() => setBrowsing(false)} />
        <Text style={s.heading}>Our food icons</Text>

        <View style={s.searchWrap}>
          <MaterialCommunityIcons name="magnify" size={20} color={COLORS.textSoft} />
          <TextInput
            style={s.search}
            value={query}
            onChangeText={setQuery}
            placeholder="Search — try fruit, or zucchini"
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

        <FlatList
          data={results}
          numColumns={COLUMNS}
          keyExtractor={(item) => item.key}
          contentContainerStyle={s.grid}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={20}
          windowSize={5}
          removeClippedSubviews
          ListEmptyComponent={<Text style={s.empty}>Nothing matches “{query}”. Try a broader word.</Text>}
          renderItem={({ item }) => {
            const ref = artRef(item.key);
            return (
              <Tile on={value === ref} label={item.label} onPress={() => onPick(ref)}>
                <FoodIcon iconKey={item.key} size={54} />
              </Tile>
            );
          }}
        />
      </View>
    );
  }

  return (
    <View style={s.wrap}>
      <BackBar label="Back to the food form" onPress={onCancel} />
      <Text style={s.heading}>Choose a picture</Text>

      <FlatList
        data={CUSTOM_GLYPHS}
        numColumns={COLUMNS}
        keyExtractor={(item) => item.key}
        contentContainerStyle={s.grid}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const ref = glyphRef(item.key);
          const on = value === ref || (isGlyphRef(value) && refValue(value) === item.key);
          return (
            <Tile on={on} label={item.label} onPress={() => onPick(ref)}>
              <View style={s.glyphTile}>
                <MaterialCommunityIcons name={item.key} size={28} color={COLORS.accent} />
              </View>
            </Tile>
          );
        }}
        ListFooterComponent={
          <TouchableOpacity
            style={s.browseCard}
            activeOpacity={0.8}
            onPress={() => setBrowsing(true)}
            accessibilityRole="button"
            accessibilityLabel="Use our food icons"
          >
            <Image source={getCategoryIcon('all')} style={s.browseArt} resizeMode="contain" />
            <View style={s.browseText}>
              <Text style={s.browseTitle}>Use our food icons</Text>
              <Text style={s.browseSub}>Search every food picture in the app</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.textMuted} />
          </TouchableOpacity>
        }
      />
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

  // The way through to the 1,737. Carries the same All artwork the
  // category strip uses, so it reads as "the app's own food pictures"
  // rather than as a thirteenth glyph.
  browseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.row,
    padding: 12,
    marginTop: 10,
    ...SHADOW.row,
  },
  browseArt: { width: 52, height: 52, borderRadius: RADIUS.tile, backgroundColor: COLORS.card },
  browseText: { flex: 1 },
  browseTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  browseSub: { fontSize: 12.5, color: COLORS.textMuted, marginTop: 3 },

  empty: { fontSize: 14.5, color: COLORS.textMuted, textAlign: 'center', marginTop: 24, lineHeight: 20 },
});
