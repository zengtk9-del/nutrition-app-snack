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
//   4. the calls go through fine and the PHONE is refusing — iOS's
//      Settings > Sounds & Haptics > System Haptics is off, or Low
//      Power Mode is on, both of which kill haptics stone dead with no
//      error anywhere
//   5. something about the way this app calls them
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
      Vibration.vibrate(Platform.OS === 'android' ? 20 : undefined);
      setRaw('called Vibration.vibrate — did the phone move?');
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
        <Text style={s.btnText}>plain RN Vibration (bypasses expo-haptics)</Text>
      </TouchableOpacity>
      {raw ? <Text style={s.line}>{raw}</Text> : null}

      <Text style={s.foot}>
        If every verb says ok and nothing moved: check iOS Settings → Sounds &amp; Haptics → System
        Haptics, and turn Low Power Mode off. Both silence haptics with no error.
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
