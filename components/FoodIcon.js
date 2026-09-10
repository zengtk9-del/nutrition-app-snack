// The icon square that appears on a food row, wherever a food row appears.
//
// Three screens draw one now: the Log Food browse rows and All-tab cards
// (LogFoodScreen), the Logged-today entries (DashboardScreen), and the My
// Favorites summary rows (LogFoodScreen). They were never going to stay in
// sync as three copies of the same 96pt box, so there is one copy here.
//
// The size is deliberate and shared: 96pt outer, 92pt image by default. A
// food should be the same size everywhere it is listed, because the picture
// is what people scan for -- a smaller one on the Today tab would read as a
// different, lesser kind of row.
//
// `size` exists for the v0.0.72 redesign, which draws a tighter 72pt row on
// Today. That deliberately breaks the rule above for as long as the redesign
// is only half-rolled-out: Today's rows are 72 and Log Food's are still 96
// until it gets the same treatment, at which point they match again at the
// new number. A temporary inconsistency during a migration, not a new
// principle.

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getFoodIconImage } from '../data/foodIconImages';
import { isGlyphRef, refValue } from '../utils/customFoods';

// `iconKey` is usually a drawn-artwork key. Since v0.0.95 it can also be
// "glyph:hamburger" -- a food the user invented, which may have picked one
// of the twelve vector marks instead of a picture. Handled here rather
// than at each call site so Today, History, Log Food and My Own Food all
// draw one the same way without knowing the difference.
export default function FoodIcon({ iconKey, style, size }) {
  const glyph = isGlyphRef(iconKey) ? refValue(iconKey) : null;
  const image = !glyph && iconKey ? getFoodIconImage(iconKey) : null;
  // The image sits 4pt inside its box at the default size; that inset is
  // kept proportional so a smaller icon doesn't lose its breathing room.
  const box = size ? { width: size, height: size } : null;
  const inner = size ? { width: size - 4, height: size - 4 } : null;

  if (glyph) {
    // On a tinted tile rather than the white one the photographs need:
    // a vector mark has no opaque background to hide.
    return (
      <View style={[styles.wrap, styles.glyphWrap, box, style]}>
        <MaterialCommunityIcons name={glyph} size={Math.round((size || 96) * 0.52)} color="#2f80f0" />
      </View>
    );
  }

  if (image) {
    return (
      <View style={[styles.wrap, box, style]}>
        <Image source={image} style={[styles.image, inner]} resizeMode="contain" />
      </View>
    );
  }
  // A dashed empty box rather than nothing. All 1,737 icon keys have
  // artwork as of v0.0.56, so this should now only appear for a food whose
  // id no longer resolves -- a favourite saved against a row that was later
  // removed, say. Keeping it means the layout never shifts.
  return <View style={[styles.placeholder, box, style]} />;
}

const styles = StyleSheet.create({
  // White, not a tint: the icons became JPEGs in v0.0.53 and JPEG has no
  // alpha, so every one is an opaque white square. A tinted wrap behind an
  // opaque white image just draws a visible frame around each picture.
  wrap: {
    width: 96, height: 96, borderRadius: 14, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  image: { width: 92, height: 92 },
  glyphWrap: { backgroundColor: '#eef5fb' },
  placeholder: {
    width: 96, height: 96, borderRadius: 14, backgroundColor: '#f0f0f4',
    borderWidth: 1, borderColor: '#e4e4ea', borderStyle: 'dashed',
  },
});
