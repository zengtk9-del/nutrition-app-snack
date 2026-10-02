import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Mascot from './Mascot';
import { MASCOT_SCENES, REPORT_BOARD } from '../data/brandArt';
import { COLORS, RADIUS, SPACE, FILL } from '../utils/theme';

// The report, as one template (v0.5.8).
//
// Six pages, one composition: a pale page with a progress bar and a
// title, a whiteboard filling most of it, and the broccoli standing at
// the board's lower-left with a pointer raised at it. Only what is
// written on the board changes. That is Damon's design pack's own
// instruction -- "use one shared reusable template in the finished app
// for pixel-perfect consistency" -- and it is also the only way six
// pages stay identical while the numbers on them differ per person.
//
// ---------------------------------------------------------------------
// THE BOARD IS DRAWN, NOT PHOTOGRAPHED
//
// The pack ships the board as an 853x1844 transparent PNG. This does not
// use it. A picture of a whiteboard cannot hold text -- it can only sit
// behind it -- and the moment the board has to be a container rather
// than a backdrop, three things follow:
//
//   1. Real profiles are longer than the sample one. "Cardio, Lifting,
//      Sports & Other Activities" already wraps to two lines in Damon's
//      own mockup, and a 4-digit calorie target is wider than a 3-digit
//      one. The board has to be able to GROW. A PNG frame would stretch
//      its own corners and tray doing it.
//   2. The mockups are drawn on a 426pt-wide canvas; the phone is 393.
//      Everything here is a multiple of the board's own width, so the
//      whole composition scales to whatever width it is given and the
//      teacher lands in the same place on every one.
//   3. It costs nothing to download.
//
// Every number this needs was measured off the pack's layers once and
// lives in REPORT_BOARD (data/brandArt.js). Nothing here guesses.
//
// ---------------------------------------------------------------------
// THE ONE RULE: THE BOTTOM-LEFT IS HIS
//
// He stands in front of the board's lower-left corner and his pointer
// reaches up and to the right across it. The pack states the rule as
// "full-width content only above y=48% of the canvas; anything lower
// must sit right of x=46%" -- which is a box in the board's bottom-left
// corner that nothing may be written in.
//
// `top` and `lower` are usually elements. Either may instead be a
// function of the board's own width, for the one page that has to size
// something against it -- the Daily Target ring, which is a circle and
// has to fit a board it cannot measure for itself.
//
// This template enforces it structurally rather than by asking each page
// to remember: the surface holds a TOP block and a LOWER block, the
// lower block is indented past him by REPORT_BOARD.keepW and is at least
// REPORT_BOARD.keepH tall, and the top block therefore cannot reach
// below the top of his box no matter how tall it gets. A page with no
// lower content still reserves the space, which is why pages 4 and 6
// have an empty lower board in the mockups and have one here too.
//
// Both figures are anchored to the board's BOTTOM, not its top, so the
// rule survives a board that grew to fit a long answer -- he is anchored
// to the bottom too, and the two move together.

// How far the board reaches past the page's own padding on each side.
// Damon's board sits about 8pt from the glass, tighter than the 16pt
// everything else on the page uses; without this it comes out
// noticeably smaller than the mockup and the text inside it pays for it.
export const STAGE_BLEED = 6;

// What the first render assumes, before onLayout has measured anything.
// Taken from the window rather than assumed to be a 393pt phone, so the
// board is the right size on the first frame on every device and
// onLayout only ever has to correct for the unusual (a split screen, a
// rotation). Read once, at module load: a Dimensions lookup per render
// would cost more than it could ever be worth here.
const DEFAULT_STAGE_W =
  Math.round(Dimensions.get('window').width) - 2 * (SPACE.screen - STAGE_BLEED);

// A long title drops a size rather than wrapping, which is what the
// mockups do: "Daily Target" is set big, "How We Built Your Plan" is
// visibly smaller and still one line.
const TITLE_BIG = 31;
const TITLE_SMALL = 24;
const TITLE_LONG = 18; // characters

// --- The board's own colours ------------------------------------------
//
// Sampled off empty-whiteboard-positioned.png rather than eyeballed.
// Local rather than in utils/theme.js because they describe one object:
// nothing else in the app is a whiteboard, and promoting them would
// invite something else to use "the frame blue" for a button.
const BOARD = {
  frame: '#bcdffb',
  frameEdge: '#93c8f8',
  surface: '#fdfdfe',
  surfaceEdge: '#e9f2fc',
  tray: '#5ba0e7',
  marker: '#0a8ffb',
  markerEdge: '#0069f6',
  eraser: '#ffffff',
  eraserEdge: '#dde6f0',
};

export function ReportBoard({ top, lower, lowerAlign = 'center', topFill = false, testID = 'board' }) {
  const [stageW, setStageW] = useState(DEFAULT_STAGE_W);

  const G = REPORT_BOARD;
  const w = stageW * G.stageBoardW; // the board's width -- the unit for everything below
  const u = (k) => k * w;

  // His feet land below the tray. That overhang is reserved at the
  // bottom of the stage so he can be anchored to the stage's bottom
  // edge and still stand exactly that far below the board.
  const overhang = u(G.mascot.below);

  return (
    <View
      testID={testID}
      style={styles.stage}
      onLayout={(e) => {
        const next = Math.round(e.nativeEvent.layout.width);
        if (next && next !== stageW) setStageW(next);
      }}
    >
      <View style={{ marginLeft: u(-G.mascot.x), width: w }}>
        {/* The frame, and the white surface inside it. */}
        <View
          testID={`${testID}-frame`}
          style={[
            styles.frame,
            {
              minHeight: u(G.frameH),
              borderRadius: u(G.radius),
              paddingHorizontal: u(G.padX),
              paddingTop: u(G.padTop),
              paddingBottom: u(G.padBottom),
            },
          ]}
        >
          <View
            testID={`${testID}-surface`}
            style={[
              styles.surface,
              { borderRadius: u(G.surfaceRadius), padding: u(G.textPad) },
            ]}
          >
            {/* `topFill` hands the whole upper board to the top block
                and centres its contents in it, which is what a single
                big object -- the Daily Target page's ring -- wants; the
                ring is then centred in the space the mockup centres it
                in rather than pinned to the top of it with all the slack
                below. Everything else reads top-down and stays put. */}
            <View testID={`${testID}-top`} style={topFill && styles.topFill}>
              {typeof top === 'function' ? top(w) : top}
            </View>
            {/* Absorbs the slack when the page's content is shorter than
                the board. Without it a short page's top block would be
                pushed down by the lower block's reserved height instead
                of staying where the mockup puts it. */}
            {topFill ? null : <View style={styles.slack} />}
            <View
              testID={`${testID}-lower`}
              style={[
                styles.lower,
                {
                  marginLeft: u(G.keepW - G.padX - G.textPad),
                  minHeight: u(G.keepH - G.padBottom - G.textPad),
                  justifyContent: lowerAlign,
                },
              ]}
            >
              {typeof lower === 'function' ? lower(w) : lower}
            </View>
          </View>

          {/* The two things on the ledge. Their feet are the frame's own
              bottom edge, which is why both are `bottom: 0` rather than
              measured down from the top like the rest of the board. */}
          <View
            pointerEvents="none"
            style={[
              styles.marker,
              {
                left: u(G.marker.x),
                width: u(G.marker.w),
                height: u(G.marker.h),
                borderRadius: u(G.marker.h) / 3,
              },
            ]}
          />
          <View
            pointerEvents="none"
            style={[
              styles.eraser,
              {
                left: u(G.eraser.x),
                width: u(G.eraser.w),
                height: u(G.eraser.h),
                borderRadius: u(G.eraser.h) / 3,
              },
            ]}
          />
        </View>

        {/* The ledge. Pulled up a couple of points so no hairline of page
            shows between it and the frame above it. */}
        <View
          testID={`${testID}-tray`}
          style={[
            styles.tray,
            {
              height: u(G.trayH),
              marginTop: -u(5 / 708),
              borderBottomLeftRadius: u(G.radius) * 0.4,
              borderBottomRightRadius: u(G.radius) * 0.4,
            },
          ]}
        />
      </View>

      <View style={{ height: overhang }} />

      {/* Him, in front of it all. Anchored to the stage's bottom-left
          corner, which -- because the stage starts at his left edge and
          ends with his feet -- is exactly where the pack puts him.
          `layer` rather than a plain mascot on purpose: this is one
          specific drawing, not a pose the rotation may swap, and if the
          renderer ever fails, an empty space beside the board beats a
          waving broccoli stretched into a teacher's box. */}
      <Mascot
        layer
        source={MASCOT_SCENES.teacher}
        testID={`${testID}-teacher`}
        style={[styles.teacher, { width: u(G.mascot.w), height: u(G.mascot.h) }]}
      />
    </View>
  );
}

// --- The page around the board ----------------------------------------
//
// Progress, page number, title, and the one full-width button at the
// bottom. Shared by the six pages and by the summary that follows them,
// so the seventh screen doesn't land on a different-looking page.
//
// BACK IS NOT IN THE MOCKUPS. They have one full-width Next and nothing
// else, but the screen it replaced let you go back, and losing that to a
// redesign would be a regression rather than a decision. So the button
// row stays exactly as drawn and Back becomes a small chevron beside the
// page number, where it is out of the way and still obvious.
export function ReportChrome({
  progress,
  pageLabel,
  title,
  onSkip,
  onBack,
  nextLabel,
  nextIcon = 'arrow-right',
  onNext,
  children,
  testID = 'report',
}) {
  return (
    <View testID={testID} style={styles.page}>
      {/* Texture, the same family as the quiz pages': a few pale discs
          well clear of anything you have to read. */}
      <View pointerEvents="none" style={FILL}>
        <View style={[styles.blob, { width: 150, height: 150, left: -46, top: 18 }]} />
        <View style={[styles.blob, { width: 128, height: 128, right: -28, top: 96 }]} />
        <View style={[styles.blob, { width: 96, height: 96, left: -34, bottom: 118 }]} />
        <View style={[styles.blob, { width: 140, height: 140, right: -40, bottom: 92 }]} />
      </View>

      {onSkip ? (
        <View style={styles.topRow}>
          <View style={styles.track}>
            <View
              testID={`${testID}-progress`}
              style={[styles.trackFill, { width: `${Math.round(progress * 100)}%` }]}
            />
          </View>
          <TouchableOpacity onPress={onSkip} activeOpacity={0.6} testID={`${testID}-skip`}>
            <Text style={styles.skip}>Skip to Summary</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {onBack || pageLabel ? (
        <View style={styles.labelRow}>
          {onBack ? (
            <TouchableOpacity
              onPress={onBack}
              activeOpacity={0.6}
              testID={`${testID}-back`}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.backChip}
            >
              <MaterialCommunityIcons name="chevron-left" size={20} color={COLORS.accent} />
            </TouchableOpacity>
          ) : null}
          {pageLabel ? <Text style={styles.pageLabel}>{pageLabel}</Text> : null}
        </View>
      ) : null}

      {/* A fixed band, not a line of text that happens to be as tall as
          it is. The page number's row has a Back chevron on five of the
          six pages and not on the first, and "How We Built Your Plan"
          is set smaller than "Daily Target" — left alone, the board
          would start 8pt further down on some pages than others, and
          pressing Next would twitch the whole composition. The pack
          calls this "the existing title band"; this is it. */}
      <View style={styles.titleBand}>
        <Text
          testID={`${testID}-title`}
          style={[styles.title, { fontSize: title.length > TITLE_LONG ? TITLE_SMALL : TITLE_BIG }]}
          numberOfLines={2}
        >
          {title}
        </Text>
      </View>

      <View style={styles.body}>{children}</View>

      <TouchableOpacity style={styles.next} onPress={onNext} activeOpacity={0.85} testID={`${testID}-next`}>
        <Text style={styles.nextText}>{nextLabel}</Text>
        {nextIcon ? <MaterialCommunityIcons name={nextIcon} size={20} color="#fff" /> : null}
      </TouchableOpacity>
    </View>
  );
}

// --- What a page writes on the board ----------------------------------
//
// Exported so the six pages share one set of sizes rather than each
// typing its own. Sized for the board's ~260pt of interior width on a
// 393pt phone, which is about 4% narrower than the mockups' canvas.
// Not invented: measured off the mockups. Each PNG's text was scanned
// for its line bands, the ink heights and line pitches read off them,
// and divided back down to this phone's width (393 of Damon's 426). So
// "heading 14 / 17" is what "Calories your body burns at complete rest
// (BMR)" is actually set at in page 2, not a guess that looks close.
export const boardText = StyleSheet.create({
  heading: { fontSize: 14, fontWeight: '800', color: COLORS.text, lineHeight: 17 },
  figure: { fontSize: 25, fontWeight: '900', color: COLORS.text, letterSpacing: -0.6 },
  figureUnit: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  blue: { color: COLORS.accent },
  body: { fontSize: 12, fontWeight: '500', color: COLORS.textSoft, lineHeight: 15.5 },
  big: { fontSize: 19, fontWeight: '500', color: COLORS.text, lineHeight: 26 },
  note: { fontSize: 11.5, fontWeight: '500', color: COLORS.textMuted, fontStyle: 'italic', lineHeight: 15 },
  rowLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSoft },
  rowValue: { fontSize: 13, fontWeight: '800', color: COLORS.text, textAlign: 'right' },
  divider: { height: 1, backgroundColor: '#eaf1fa' },
  panel: { backgroundColor: '#edf4fe', borderRadius: 12, padding: 11 },
});

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.bg, padding: SPACE.screen },
  blob: { position: 'absolute', backgroundColor: COLORS.blob, borderRadius: RADIUS.pill },

  topRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  track: {
    flex: 1,
    height: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: '#d5dfee',
    overflow: 'hidden',
    marginRight: 14,
  },
  trackFill: { height: 6, borderRadius: RADIUS.pill, backgroundColor: COLORS.accent },
  skip: { fontSize: 14, fontWeight: '700', color: COLORS.accent },

  labelRow: { flexDirection: 'row', alignItems: 'center', height: 22, marginTop: 8, gap: 4 },
  backChip: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.blob,
    marginLeft: -3,
  },
  pageLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },

  titleBand: { height: 44, justifyContent: 'flex-end', marginTop: 4 },
  title: { fontWeight: '800', letterSpacing: -0.5, color: COLORS.text },

  // Everything between the title and the button. `flex: 1` is what puts
  // the button on the bottom edge of the screen rather than under the
  // board, and what gives the mockup's generous air above and below it.
  body: { flex: 1 },

  // Reaches past the page's own padding so the board sits as close to
  // the glass as Damon's mockups put it.
  stage: { marginHorizontal: -STAGE_BLEED, marginTop: 12 },

  frame: {
    backgroundColor: BOARD.frame,
    borderWidth: 2,
    borderColor: BOARD.frameEdge,
    shadowColor: '#1d4d86',
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 7 },
    elevation: 4,
  },
  // flexBasis 'auto' with flexGrow 1 and no shrink, NOT `flex: 1`.
  // `flex: 1` sets flexBasis to 0, which tells the frame above it that
  // this box needs no height at all -- so a page with more on it than
  // the board has room for would quietly overflow the board instead of
  // making it taller. This says "as tall as what is written on me, and
  // fill any space left over", which is what lets the frame's
  // minHeight be a floor rather than a ceiling.
  surface: {
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: 'auto',
    backgroundColor: BOARD.surface,
    borderWidth: 1,
    borderColor: BOARD.surfaceEdge,
  },
  slack: { flexGrow: 1, flexShrink: 0 },
  topFill: { flexGrow: 1, flexShrink: 0, justifyContent: 'center' },
  lower: { flexShrink: 0 },

  marker: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: BOARD.marker,
    borderWidth: 1,
    borderColor: BOARD.markerEdge,
  },
  eraser: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: BOARD.eraser,
    borderWidth: 1,
    borderColor: BOARD.eraserEdge,
  },
  tray: { backgroundColor: BOARD.tray },

  teacher: { position: 'absolute', left: 0, bottom: 0 },

  next: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accent,
  },
  nextText: { fontSize: 18, fontWeight: '800', color: '#fff' },
});

export default ReportBoard;
