// "My Diet" — changing your diet without retaking the whole quiz.
//
// Reached from the button at the top of the Goals tab. Same full-screen
// takeover pattern as MacroGoalsScreen (no tab bar while it's open), and
// deliberately the SAME illustrated cards as the quiz's diet step rather
// than a second, plainer list: the options, the illustrations, the short
// descriptions and the "Learn more" sheet are all read straight from
// data/quizQuestions.js, so there is one place a diet's wording lives.
//
// What this screen does NOT do is recompute macros. Diet feeds two
// unrelated things — the carb/fat split in utils/goals.js, and the Log
// Food ordering in data/dietOrder.js — and only the second is safe to
// change on its own. Silently rewriting someone's calorie and macro
// targets because they tapped a button labelled "My Diet" would be a
// surprise; recalculating goals stays the quiz's job, and the hint under
// the title says so plainly.

import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import DietDetailModal from '../components/DietDetailModal';
import { QUIZ_STEPS, DIET_IMAGES, DIET_DETAILS } from '../data/quizQuestions';
import { DEFAULT_DIET } from '../data/dietOrder';

// The single source of truth for which diets exist and how they're worded
// — the same array the quiz renders. Pulled out by key rather than index
// so reordering QUIZ_STEPS can't silently point this at another question.
export const DIET_OPTIONS = QUIZ_STEPS.find((s) => s.key === 'diet').options;

// Label for a stored diet value, e.g. 'low_carb' -> 'Low-carb'. Used by
// the Goals tab's button as well as this screen. Falls back to the
// balanced label rather than rendering a raw key if the stored value is
// somehow unrecognised.
export function dietLabel(value) {
  const opt = DIET_OPTIONS.find((o) => o.value === value);
  if (opt) return opt.label;
  return DIET_OPTIONS.find((o) => o.value === DEFAULT_DIET)?.label || 'Balanced';
}

export default function DietPickerScreen({ diet = DEFAULT_DIET, onSave, onCancel }) {
  const [selected, setSelected] = useState(diet);
  // Which diet's "Learn more" sheet is open, if any. Never changes the
  // selection by itself — only the sheet's "Choose this diet" does, same
  // as in the quiz.
  const [learnMore, setLearnMore] = useState(null);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>My Diet</Text>
        <Text style={styles.hint}>
          This changes the order foods appear in on the Log Food tab so the ones you actually eat
          come first. Nothing is ever hidden, and your calorie and macro goals stay exactly as they
          are.
        </Text>

        {DIET_OPTIONS.map((opt) => {
          const isOn = selected === opt.value;
          const source = DIET_IMAGES[opt.value];
          if (!source) {
            throw new Error(
              `No image for diet option "${opt.value}" — add it to DIET_IMAGES in data/quizQuestions.js`
            );
          }
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.dietCard, isOn && styles.dietCardSelected]}
              onPress={() => setSelected(opt.value)}
              activeOpacity={0.8}
              accessibilityRole="radio"
              accessibilityState={{ selected: isOn }}
              accessibilityLabel={opt.label}
            >
              <View style={styles.dietIconWrap}>
                <Image
                  source={source}
                  style={styles.dietIconImage}
                  resizeMode="contain"
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                />
              </View>
              <View style={styles.dietTextCol}>
                <Text style={[styles.dietTitle, isOn && styles.dietTitleSelected]}>{opt.label}</Text>
                <Text style={[styles.dietDesc, isOn && styles.dietDescSelected]}>{opt.sub}</Text>
                {/* A separate touchable from the card, so tapping it opens
                    the sheet without also selecting the diet — RN fires
                    only the innermost pressed element, so no
                    stopPropagation equivalent is needed. */}
                <TouchableOpacity
                  style={styles.dietLearnMore}
                  onPress={() => setLearnMore(opt.value)}
                  accessibilityRole="button"
                  accessibilityLabel={`Learn more about ${opt.label}`}
                >
                  <Text style={[styles.dietLearnMoreText, isOn && styles.dietLearnMoreTextSelected]}>
                    Learn more
                  </Text>
                </TouchableOpacity>
              </View>
              {isOn ? (
                <View style={styles.dietCheck}>
                  <Text style={styles.dietCheckText}>✓</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.navRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        {/* Disabled when nothing changed, so the button always means
            something happened when it's tappable. */}
        <TouchableOpacity
          style={[styles.saveBtn, selected === diet && styles.saveBtnDisabled]}
          onPress={() => onSave(selected)}
          disabled={selected === diet}
        >
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      {learnMore ? (
        <DietDetailModal
          diet={{
            value: learnMore,
            label: DIET_OPTIONS.find((o) => o.value === learnMore)?.label,
            image: DIET_IMAGES[learnMore],
            ...DIET_DETAILS[learnMore],
          }}
          onClose={() => setLearnMore(null)}
          onChoose={() => {
            setSelected(learnMore);
            setLearnMore(null);
          }}
        />
      ) : null}
    </View>
  );
}

// Card styling is a deliberate copy of QuizScreen's diet cards rather than
// a shared component: the two screens want to look identical today, but
// the quiz's version is one branch of a generic step renderer and pulling
// it out would mean reworking that renderer for no behavioural gain. If a
// third place ever needs these cards, that's the time to extract them.
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7fa', padding: 16 },
  scrollContent: { paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#1a1a1a', marginBottom: 6, marginTop: 8 },
  hint: { fontSize: 15, color: '#777', marginBottom: 18, lineHeight: 21 },

  dietCard: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3e3e8',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  dietCardSelected: { backgroundColor: '#4f8ef7', borderColor: '#4f8ef7' },
  dietIconWrap: { width: 84, height: 84, marginRight: 14 },
  dietIconImage: { width: '100%', height: '100%' },
  dietTextCol: { flex: 1 },
  dietTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  dietTitleSelected: { color: '#fff' },
  dietDesc: { fontSize: 14, color: '#666', lineHeight: 19 },
  dietDescSelected: { color: '#eaf1ff' },
  dietLearnMore: { alignSelf: 'flex-start', marginTop: 6, paddingVertical: 4, paddingRight: 4 },
  dietLearnMoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4f8ef7',
    textDecorationLine: 'underline',
  },
  dietLearnMoreTextSelected: { color: '#fff' },
  dietCheck: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4f8ef7',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dietCheckText: { color: '#fff', fontSize: 13, fontWeight: '800' },

  navRow: { flexDirection: 'row', paddingTop: 12, gap: 10 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3e3e8',
  },
  cancelBtnText: { fontSize: 17, fontWeight: '600', color: '#555' },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#4f8ef7',
  },
  saveBtnDisabled: { backgroundColor: '#c7d8f7' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 17 },
});
