// The icon square that appears on a food row, wherever a food row appears.
//
// Three screens draw one now: the Log Food browse rows and All-tab cards
// (LogFoodScreen), the Logged-today entries (DashboardScreen), and the My
// Favorites summary rows (LogFoodScreen). They were never going to stay in
// sync as three copies of the same 96pt box, so there is one copy here.
//
// The size is deliberate and shared: 96pt outer, 92pt image. A food should
// be the same size everywhere it is listed, because the picture is what
// people scan for -- a smaller one on the Today tab would read as a
// different, lesser kind of row.

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { getFoodIconImage } from '../data/foodIconImages';

export default function FoodIcon({ iconKey, style }) {
  const image = iconKey ? getFoodIconImage(iconKey) : null;
  if (image) {
    return (
      <View style={[styles.wrap, style]}>
        <Image source={image} style={styles.image} resizeMode="contain" />
      </View>
    );
  }
  // A dashed empty box rather than nothing. All 1,737 icon keys have
  // artwork as of v0.0.56, so this should now only appear for a food whose
  // id no longer resolves -- a favourite saved against a row that was later
  // removed, say. Keeping it means the layout never shifts.
  return <View style={[styles.placeholder, style]} />;
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
  placeholder: {
    width: 96, height: 96, borderRadius: 14, backgroundColor: '#f0f0f4',
    borderWidth: 1, borderColor: '#e4e4ea', borderStyle: 'dashed',
  },
});
