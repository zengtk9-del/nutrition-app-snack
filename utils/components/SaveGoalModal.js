import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';

// The naming prompt that appears when "Save These Goals" is tapped — both
// at the end of a quiz report (screens/ReportScreen.js) and at the end of
// "Set My Own Macro Goals" (screens/MacroGoalsScreen.js). Uses RN core
// Modal only, same "no extra native dependency" approach as
// components/DietDetailModal.js (the app's other modal).
//
// `defaultName` is what's already typed into the name bar when this
// opens — the quiz screen passes one of the three "My nutrition plan
// to ___" strings (see DEFAULT_GOAL_NAME in components/ReportPieces.js),
// the custom-goals screen passes '' so the bar starts empty. Either way
// it's fully editable — a quiz result's suggested name is a starting
// point, not a requirement.
//
// `onConfirm(name)` is expected to return a Promise — this component
// awaits it, showing a small "Saving…" state and disabling both buttons
// while it's in flight, and shows whatever error message it rejects with
// (or a generic fallback) without closing, so the user can just try
// again rather than losing what they typed. On success there's nothing
// further to do here: the screens that use this modal navigate away
// entirely once their save finishes (see their own onSaveGoal handlers),
// which unmounts this modal as a side effect.
//
// `atCap` swaps the whole modal over to a short "you're full" message
// instead of the name bar — Damon's call was to block saving a 6th goal
// rather than silently replacing an old one, so this is where that block
// actually shows up.
export default function SaveGoalModal({ visible, defaultName = '', atCap, onCancel, onConfirm }) {
  const [name, setName] = useState(defaultName);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Reset back to a clean slate every time this modal is (re)opened —
  // otherwise a previous attempt's typed text, error message, or
  // in-flight state could leak into the next time it's shown (e.g. after
  // retaking the quiz with a different result).
  useEffect(() => {
    if (visible) {
      setName(defaultName);
      setSubmitting(false);
      setSubmitError(null);
    }
  }, [visible, defaultName]);

  if (!visible) return null;

  const trimmedName = name.trim();
  const canSave = !atCap && trimmedName.length > 0 && !submitting;

  const handleSave = async () => {
    if (!canSave) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onConfirm(trimmedName);
    } catch (err) {
      setSubmitError((err && err.message) || 'Something went wrong saving this goal. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={submitting ? undefined : onCancel}
          accessibilityLabel="Close"
          accessibilityRole="button"
        />
        <View style={styles.card}>
          {atCap ? (
            <>
              <Text style={styles.title}>You've saved 5 goals</Text>
              <Text style={styles.body}>
                That's the most you can keep at once. Delete one from the Goals tab, then come back
                and save this one.
              </Text>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={onCancel}
                accessibilityRole="button"
                accessibilityLabel="Got it"
              >
                <Text style={styles.primaryBtnText}>Got it</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>Save this goal</Text>
              <Text style={styles.body}>Give it a name so you can find it again later.</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Name this goal"
                placeholderTextColor="#aaa"
                autoFocus
                editable={!submitting}
                maxLength={60}
              />
              {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onCancel}
                  disabled={submitting}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel"
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
                  onPress={handleSave}
                  disabled={!canSave}
                  accessibilityRole="button"
                  accessibilityLabel="Save"
                >
                  <Text style={styles.saveBtnText}>{submitting ? 'Saving…' : 'Save'}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: { width: '100%', maxWidth: 400, backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  title: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  body: { fontSize: 15, color: '#666', lineHeight: 21, marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#e3e3e8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  errorText: { color: '#e0533d', fontSize: 14, marginBottom: 8 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3e3e8',
  },
  cancelBtnText: { fontSize: 16, fontWeight: '600', color: '#555' },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center', backgroundColor: '#4f8ef7' },
  saveBtnDisabled: { backgroundColor: '#b9cdf0' },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  primaryBtn: { paddingVertical: 14, borderRadius: 10, alignItems: 'center', backgroundColor: '#4f8ef7', marginTop: 4 },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
