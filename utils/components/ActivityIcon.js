import React from 'react';
import { View, StyleSheet } from 'react-native';

// A small set of illustrated "daily activity" figures (sitting at a desk
// with a laptop, casual walking with hair, brisk walking with a cap, and
// carrying a box with a cap) for the activityLevel quiz step — drawn
// entirely from plain Views, same "no react-native-svg or any other native
// dependency" approach as components/MacroDonutChart.js, for the same
// reason (this project already got burned once by a third-party native
// module breaking under Expo Snack/Expo Go's bridgeless mode). Damon asked
// for a richer, more detailed illustration style than this file's first
// version (background circle, dashed ground line, a chair + laptop, hair,
// a cap) — still no image files, just more shapes.
//
// Every shape is one of: a filled bar (rounded rectangle), a filled dome
// (a bar with only its top corners rounded — the cap), a hollow circle
// (the head), one hollow rounded-rect outline (the carried box), a big
// soft "blob" circle behind the figure, small muted "prop" shapes (a bush,
// a building, stacked boxes) for background context, a "shadow" ellipse
// under the figure's feet, and a row of small ground-line dashes. Nothing
// here uses `transform: rotate` at all, unlike MacroDonutChart or
// QuizScreen's weightHistory scale. A walking "stride" is faked with two
// straight legs of different lengths/horizontal offset instead of an
// angled leg, specifically to sidestep this project's established
// rotation-pivot limitation (see QuizScreen.js's SCALE_* comments) rather
// than risk it.
//
// Every shape's x/y/w/h/borderRadius is a fraction of a 220x220 "design
// box" these were visually tuned against — built and screenshot-verified
// first as a plain HTML/CSS mirror (both at a large size, to get each
// figure's proportions right, and at the actual ~100px card size, to
// confirm they still read cleanly that small) before being transcribed
// here. Using fractions (rather than hardcoded pixel offsets for one fixed
// size) is what lets the same figures be drawn at any `size` prop cleanly.
const DESIGN = 220;
const HEAD_STROKE_FRAC = 8 / DESIGN;
const OUTLINE_STROKE_FRAC = 7 / DESIGN;

function frac(n) {
  return n / DESIGN;
}
function bar(x, y, w, h, rFrac = 0.4) {
  return { type: 'bar', x: frac(x), y: frac(y), w: frac(w), h: frac(h), rFrac };
}
function dome(x, y, w, h, topRFrac = 0.4, bottomRFrac = 0.08) {
  return { type: 'dome', x: frac(x), y: frac(y), w: frac(w), h: frac(h), topRFrac, bottomRFrac };
}
function circle(x, y, w, h) {
  return { type: 'circle', x: frac(x), y: frac(y), w: frac(w), h: frac(h) };
}
function outline(x, y, w, h, rFrac = 0.15) {
  return { type: 'outline', x: frac(x), y: frac(y), w: frac(w), h: frac(h), rFrac };
}
function blob(x, y, w, h) {
  return { type: 'blob', x: frac(x), y: frac(y), w: frac(w), h: frac(h) };
}
function prop(x, y, w, h, rFrac = 0.15) {
  return { type: 'prop', x: frac(x), y: frac(y), w: frac(w), h: frac(h), rFrac };
}
function shadow(x, y, w, h) {
  return { type: 'shadow', x: frac(x), y: frac(y), w: frac(w), h: frac(h) };
}
// A row of small dashes standing in for a "ground line" under the figure —
// same y for every icon, since every figure's feet land at the same design
// height (see each icon's own leg/floor math below).
function groundDashes(y) {
  return [8, 34, 60, 86, 130, 156, 182].map((x) => bar(x, y, 16, 4, 0.5));
}

// Each icon's own horizontal center, in the same 220-unit design space —
// not dead-center (110) for every icon, since e.g. "sitting" needs extra
// room on the right for the desk, and "carrying" for the box. `hip` is
// where the legs attach (same for every standing figure; sitting doesn't
// use it, its legs are built directly around the chair instead).
const ICON_DEFS = {
  sitting: {
    cx: 95,
    shapes: (cx) => [
      blob(35, 15, 150, 150),
      ...groundDashes(200),
      // chair backrest + seat, drawn before the figure so they sit behind it
      bar(cx - 32, 48, 14, 92, 0.32),
      bar(cx - 20, 124, 72, 10, 0.28),
      circle(cx - 24, 20, 48, 48),
      bar(cx - 14, 64, 28, 52, 0.42),
      // thigh (horizontal, hip -> knee) + shin (vertical, knee -> floor) —
      // a 90-degree bent knee is naturally axis-aligned, so this whole
      // figure needs zero rotation.
      bar(cx - 14, 108, 62, 22, 0.4),
      bar(cx + 34, 108, 22, 58, 0.4),
      // chair center post + casters
      bar(cx - 2, 134, 8, 26, 0.3),
      circle(cx - 16, 158, 12, 12),
      circle(cx + 10, 158, 12, 12),
      // laptop (screen) + desk top + desk leg
      bar(cx + 60, 52, 20, 20, 0.15),
      bar(cx + 56, 72, 52, 12, 0.15),
      bar(cx + 88, 84, 12, 68, 0.15),
      shadow(cx - 30, 196, 110, 12),
    ],
  },
  walking: {
    cx: 110,
    hip: 112,
    shapes: (cx, hip) => [
      blob(45, 15, 150, 150),
      ...groundDashes(200),
      prop(cx + 68, 176, 28, 22, 0.5), // background bush
      // ponytail — attached lower on the back (left) side of the head,
      // near where hair would actually gather, hanging down past the
      // head's own bottom edge toward the neck (not up near the crown).
      bar(cx - 30, 34, 11, 34, 0.4),
      circle(cx - 24, 16, 48, 48),
      bar(cx - 14, 60, 28, 52, 0.42),
      bar(cx - 28, 66, 14, 40, 0.5), // back arm
      bar(cx + 14, 62, 14, 34, 0.5), // front arm
      bar(cx - 26, hip, 20, 56, 0.4), // back leg — shorter, heel lifted
      bar(cx + 6, hip, 20, 74, 0.4), // front leg — stepped forward
      bar(cx + 2, hip + 70, 30, 10, 0.5), // front foot
      shadow(cx - 30, 196, 90, 12),
    ],
  },
  brisk: {
    cx: 105,
    hip: 112,
    shapes: (cx, hip) => [
      blob(40, 15, 150, 150),
      ...groundDashes(200),
      prop(cx + 66, 150, 18, 50, 0.1), // background buildings
      prop(cx + 86, 165, 22, 35, 0.1),
      prop(cx - 76, 180, 24, 20, 0.5), // background bush
      circle(cx - 24, 16, 48, 48),
      // cap: a shallow dome resting on just the crown of the head (barely
      // overlapping its top edge, not filling the circle's own interior)
      // plus a small brim at the front-bottom corner.
      dome(cx - 21, 5, 42, 16, 0.4, 0.08),
      bar(cx + 12, 17, 15, 6, 0.4),
      bar(cx - 14, 60, 28, 52, 0.42),
      bar(cx - 32, 64, 14, 42, 0.5),
      bar(cx + 18, 60, 14, 36, 0.5),
      bar(cx - 40, hip, 20, 44, 0.4), // wider/longer stride than "walking"
      bar(cx + 20, hip, 20, 80, 0.4),
      bar(cx + 16, hip + 76, 30, 10, 0.5),
      shadow(cx - 40, 196, 110, 12),
    ],
  },
  carrying: {
    cx: 88,
    hip: 112,
    shapes: (cx, hip) => [
      blob(20, 15, 160, 150),
      ...groundDashes(200),
      prop(cx - 66, 168, 28, 28, 0.12), // stacked boxes on the ground
      prop(cx - 62, 144, 22, 22, 0.12),
      circle(cx - 23, 18, 46, 46),
      dome(cx - 20, 7, 40, 16, 0.4, 0.08),
      bar(cx + 11, 19, 14, 6, 0.4),
      bar(cx - 13, 60, 26, 52, 0.42),
      bar(cx - 36, hip, 20, 46, 0.4),
      bar(cx + 16, hip, 20, 76, 0.4),
      bar(cx + 12, hip + 72, 30, 10, 0.5),
      bar(cx + 13, 70, 44, 13, 0.45), // arm reaching to the box
      bar(cx + 13, 98, 44, 13, 0.45),
      outline(cx + 50, 64, 54, 50, 0.15), // the box itself
      shadow(cx - 40, 196, 110, 12),
    ],
  },
};

// `type` is one of ICON_DEFS's keys above. `selected` swaps every shape's
// color — the main figure from blue to white, and the muted background
// shapes (blob/prop/shadow) from their light-blue tints to a translucent
// white — matching the weightHistory/imageCards steps' own selected-state
// color swap. This component doesn't need to know about any card styling,
// just its own color states.
export default function ActivityIcon({ type, size = 100, selected = false }) {
  const def = ICON_DEFS[type];
  if (!def) return null;
  const mainColor = selected ? '#fff' : '#4f8ef7';
  const blobColor = selected ? 'rgba(255,255,255,0.18)' : '#eaf1ff';
  const propColor = selected ? 'rgba(255,255,255,0.3)' : '#cddcf5';
  const shadowColor = selected ? 'rgba(255,255,255,0.2)' : '#dfe6f2';
  const shapes = def.shapes(def.cx, def.hip);

  return (
    <View style={[styles.box, { width: size, height: size }]}>
      {shapes.map((s, i) => {
        const left = s.x * size;
        const top = s.y * size;
        const width = s.w * size;
        const height = s.h * size;

        if (s.type === 'circle') {
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                left,
                top,
                width,
                height,
                borderRadius: 999,
                borderWidth: HEAD_STROKE_FRAC * size,
                borderColor: mainColor,
              }}
            />
          );
        }
        if (s.type === 'outline') {
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                left,
                top,
                width,
                height,
                borderRadius: s.rFrac * Math.min(width, height),
                borderWidth: OUTLINE_STROKE_FRAC * size,
                borderColor: mainColor,
              }}
            />
          );
        }
        if (s.type === 'dome') {
          const topRadius = s.topRFrac * Math.min(width, height);
          const bottomRadius = s.bottomRFrac * Math.min(width, height);
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                left,
                top,
                width,
                height,
                borderTopLeftRadius: topRadius,
                borderTopRightRadius: topRadius,
                borderBottomLeftRadius: bottomRadius,
                borderBottomRightRadius: bottomRadius,
                backgroundColor: mainColor,
              }}
            />
          );
        }
        if (s.type === 'blob' || s.type === 'shadow') {
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                left,
                top,
                width,
                height,
                borderRadius: 999,
                backgroundColor: s.type === 'blob' ? blobColor : shadowColor,
              }}
            />
          );
        }
        if (s.type === 'prop') {
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                left,
                top,
                width,
                height,
                borderRadius: s.rFrac * Math.min(width, height),
                backgroundColor: propColor,
              }}
            />
          );
        }
        // 'bar' — the figure itself (body parts, chair, desk, cap brim, etc.)
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left,
              top,
              width,
              height,
              borderRadius: s.rFrac * Math.min(width, height),
              backgroundColor: mainColor,
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { position: 'relative', overflow: 'hidden' },
});
