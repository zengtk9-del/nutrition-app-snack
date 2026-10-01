import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Vibration, Platform, StyleSheet } from 'react-native';
import { choose, commit, nudge, warn, fail, hapticsReport } from '../utils/haptics';
import { COLORS, RADIUS } from '../utils/theme';

// DIAGNOSTIC SCAFFOLDING (v0.6.2). Deleted once we know the answer.
//
// v0.6.1 added haptics and nothing buzzed. There are five plausible
// reasons and every one of them was built to be silent, so neither of
// us could tell them apart from where we were sitting:
//
//   1. the app is running on web, where this is off by design
//   2. expo-haptics did not load at all
//   3. it loaded, but the native side is not in this runtime, so every
//      call rejects with an UnavailabilityError
//   4. the calls go through fine and the PHONE is refusing
//   5. something about the way this app calls them
//
// v0.6.2 ANSWERED IT: ios, loaded, all three functions, every verb
// resolving ok, and no buzz. That is case 4, and Expo's own
// documentation lists exactly when the Taptic Engine does nothing and
// says nothing about it — Low Power Mode on, the user having turned
// the Taptic Engine off in Settings, the Camera active, or dictation
// active. Low Power Mode was ruled out from the screenshot (the
// battery glyph was not yellow).
//
// So this revision is about the last fork: is the phone's vibration
// hardware working at all? The three-pulse test below goes through
// AudioServices rather than UIFeedbackGenerator, which is a different
// path that the System Haptics switch does NOT silence — so it buzzing
// while the verbs do not is the signature of that switch being off.
//
// This panel separates them in about thirty seconds. The top half is
// what the module says about itself; the buttons fire one verb each and
// then print what became of it. The last button bypasses expo-haptics
// completely and shakes the phone through React Native's own Vibration
// API — if that one works and the others do not, the phone is fine and
// expo-haptics is the problem; if nothing works at all, it is the phone
// or its settings.
//
// Deliberately ugly. It is an instrument, not a feature.
const VERBS = [
  ['choose', choose],
  ['commit', commit],
  ['nudge', nudge],
  ['warn', warn],
  ['fail', fail],
];

// iOS ignores how long each pulse should be and always buzzes for about
// 400ms, but it does honour the GAPS — so on both platforms this is
// three separate buzzes over a second and a half, which is not
// something anyone holding the phone can be unsure about. One short
// buzz was, which is why "did the phone move?" went unanswered.
const SHAKE = Platform.OS === 'android'
  ? [0, 300, 200, 300, 200, 300]
  : [0, 1, 400, 1, 400, 1];

export default function HapticsCheck() {
  const [report, setReport] = useState(() => hapticsReport());
  const [raw, setRaw] = useState('');

  const run = async (name, verb) => {
    try {
      await verb();
    } catch (err) {
      /* a verb is not supposed to be able to throw; if it does, the
         report below will be missing this one and that says so */
    }
    setReport(hapticsReport());
  };

  const shake = () => {
    try {
      // Not a haptic — the vibration motor, which has been in React
      // Native since before haptics existed and needs no extra module.
      // iOS ignores the duration and gives a full alert buzz; Android
      // honours it, so 20ms there is a tick.
      Vibration.vibrate(SHAKE);
      setRaw('three long buzzes should be happening now, over about 1.5 seconds');
    } catch (err) {
      setRaw('Vibration.vibrate threw: ' + ((err && err.message) || err));
    }
  };

  return (
    <View style={s.box}>
      <Text style={s.title}>DIAGNOSTIC · haptics</Text>
      <Text style={s.line}>platform: {report.platform}</Text>
      <Text style={s.line}>expo-haptics loaded: {report.available ? 'yes' : 'NO'}</Text>
      {report.note ? <Text style={s.line}>note: {report.note}</Text> : null}
      <Text style={s.line}>functions: {report.exports}</Text>
      <Text style={s.line}>values: {report.enums}</Text>

      <View style={s.row}>
        {VERBS.map(([name, verb]) => (
          <TouchableOpacity key={name} style={s.btn} onPress={() => run(name, verb)}>
            <Text style={s.btnText}>{name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {VERBS.map(([name]) => (
        <Text key={name} style={s.line}>
          {name}: {report.outcomes[name] || '— not pressed yet'}
        </Text>
      ))}

      <TouchableOpacity style={[s.btn, s.rawBtn]} onPress={shake}>
        <Text style={s.btnText}>BUZZ x3 — the motor, not the Taptic Engine</Text>
      </TouchableOpacity>
      {raw ? <Text style={s.line}>{raw}</Text> : null}

      <Text style={s.foot}>
        Every verb says ok and nothing is felt → iOS is accepting the requests and discarding
        them. Settings → Sounds &amp; Haptics → System Haptics. Also: haptics are suppressed while
        the Camera or dictation is active.
      </Text>
      <Text style={s.foot}>
        If BUZZ x3 shakes the phone but the verbs do not, that switch is the answer. If BUZZ x3
        does nothing either, it is the phone rather than anything in here.
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  box: {
    marginTop: 18,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.textMuted,
    backgroundColor: COLORS.card,
  },
  title: { fontSize: 13, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  line: { fontSize: 11.5, color: COLORS.textSoft, lineHeight: 16 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 8 },
  btn: {
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.accent,
  },
  rawBtn: { alignSelf: 'flex-start', marginTop: 8, backgroundColor: COLORS.destructive },
  btnText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  foot: { fontSize: 11, color: COLORS.textMuted, lineHeight: 15, marginTop: 8, fontStyle: 'italic' },
});
