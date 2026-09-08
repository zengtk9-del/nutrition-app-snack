// A semicircular gauge, drawn as ticks around an arc.
//
// WHY TICKS AND NOT A SMOOTH ARC: this app has no react-native-svg and
// deliberately doesn't want one -- a native module already broke it once
// under Expo Go, which is why components/MacroDonutChart.js draws its pie
// out of rotated and clipped plain Views instead.
//
// That donut trick works, but it is genuinely hard to follow and it exists
// because a pie has to be a solid wedge. A gauge doesn't. Twenty-odd small
// Views placed around a semicircle with a bit of trigonometry reads clearly
// as a gauge, takes about fifteen lines, and any future reader can see at a
// glance what it does. A smooth arc would be the harder thing built for no
// gain in what it communicates.
//
// Each tick is positioned by angle and rotated to point outward, so the
// ring keeps its shape at any size.

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../utils/theme';

const TICKS = 22;
const TICK_W = 4;
const TICK_H = 11;

export default function ScoreArc({ value, max = 100, color, size = 92, style }) {
  // A null score (a day with nothing logged) draws an empty gauge rather
  // than a full one or none at all.
  const pct = value == null || max <= 0 ? 0 : Math.max(0, Math.min(1, value / max));
  const lit = Math.round(pct * TICKS);
  const radius = size / 2 - TICK_H / 2;
  const cx = size / 2;
  // Half the height, because only the top semicircle is drawn.
  const boxH = size / 2 + TICK_H / 2;

  return (
    <View style={[{ width: size, height: boxH }, style]}>
      {Array.from({ length: TICKS }).map((_, i) => {
        // 180deg swept left to right, with half a step of inset at each end
        // so the first and last ticks sit just inside the horizontal.
        const t = (i + 0.5) / TICKS;
        const angle = Math.PI * (1 - t);
        const x = cx + radius * Math.cos(angle) - TICK_W / 2;
        const y = boxH - TICK_H / 2 - radius * Math.sin(angle) - TICK_H / 2;
        return (
          <View
            key={i}
            style={[
              s.tick,
              {
                left: x,
                top: y,
                backgroundColor: i < lit ? color : COLORS.line,
                // Point each tick along the radius. Degrees, and measured
                // from vertical, hence the 90 offset.
                transform: [{ rotate: `${90 - (angle * 180) / Math.PI}deg` }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  tick: {
    position: 'absolute',
    width: TICK_W,
    height: TICK_H,
    borderRadius: RADIUS.pill,
  },
});
