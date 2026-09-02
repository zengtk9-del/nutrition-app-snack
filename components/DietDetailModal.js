import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  SafeAreaView,
} from 'react-native';
import RichText from './RichText';

// The diet step's "Learn more" bottom sheet — shows a larger version of the
// same illustration used on the card, the diet's title, and its longer
// rich-text description, plus a "Choose this diet" primary action. Uses RN
// core Modal + SafeAreaView only (same "no extra native dependency"
// approach as the rest of this app) — this is the first place in the app
// that needed a modal/bottom-sheet at all.
//
// Mounting pattern: QuizScreen.js only renders <DietDetailModal> at all
// when a diet's Learn More has been tapped (i.e. `diet` is truthy), rather
// than always rendering it with a `visible` boolean prop toggling on/off.
// That's a deliberate simplification — it sidesteps any chance of this
// component holding on to a stale `diet` reference while Modal's own close
// animation is still playing, at the cost of the sheet closing instantly
// rather than sliding down. Damon's spec doesn't require a close animation,
// so that trade-off is fine here.
//
// Opening/closing this never changes which diet is selected on the quiz
// step behind it — only pressing "Choose this diet" does that (see
// QuizScreen.js's onChoose wiring).
export default function DietDetailModal({ diet, onClose, onChoose }) {
  if (!diet) return null;

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessibilityLabel="Close diet details"
          accessibilityRole="button"
        />
        <SafeAreaView style={styles.sheetSafeArea}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Image
                source={diet.image}
                style={styles.image}
                resizeMode="contain"
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
              <Text style={styles.title}>{diet.label}</Text>
              <RichText
                text={diet.detailedDescription}
                boldPhrases={diet.boldPhrases}
                style={styles.description}
                boldStyle={styles.descriptionBold}
              />
            </ScrollView>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.chooseBtn}
                onPress={onChoose}
                accessibilityRole="button"
                accessibilityLabel={`Choose ${diet.label} diet`}
              >
                <Text style={styles.chooseBtnText}>Choose this diet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  // A fixed height (not a maxHeight cap) — this sheet's content (one image
  // + a paragraph) is usually shorter than 85% of the screen, so a maxHeight
  // just let it shrink-wrap down to roughly half the screen instead of
  // actually filling it, which is exactly the "not enough room for the
  // image and text" issue Damon reported. Fixing it at 78% (Damon asked for
  // 70-80%) means the sheet reliably takes up that much of the screen
  // regardless of how short or long a given diet's description is, with the
  // ScrollView below (styles.scroll, flex: 1) filling whatever's left after
  // the handle/title and scrolling internally on the rare description long
  // enough to need it.
  sheetSafeArea: { height: '78%', backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  sheet: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#ddd',
    marginBottom: 12,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 8 },
  image: { width: '100%', height: 240, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginBottom: 10 },
  description: { fontSize: 16, lineHeight: 23, color: '#444' },
  descriptionBold: { fontWeight: '700', color: '#1a1a1a' },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  closeBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3e3e8',
  },
  closeBtnText: { fontSize: 17, fontWeight: '600', color: '#555' },
  chooseBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#4f8ef7',
  },
  chooseBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});
