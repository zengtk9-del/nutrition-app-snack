// What colour a score is shown in, and what it's called.
//
// Its own tiny file because two screens need it -- Today's provisional chip
// and History's per-day cards -- and a score that is amber on one screen and
// green on the other would be worse than no colour at all.
//
// The bands are wide on purpose. A score is a summary, not a grade, and
// four buckets is as much precision as a colour can honestly carry.
//
// Note what ISN'T here: no red for a single bad day, no failure language.
// "Way off" is the bottom of the scale, and it describes the day's numbers
// rather than the person who ate them.

import { COLORS } from './theme';

export function scoreTone(total) {
  if (total == null) return { label: '—', ink: COLORS.textMuted, soft: COLORS.line };
  if (total >= 90) return { label: 'Excellent', ink: COLORS.protein, soft: COLORS.proteinSoft };
  if (total >= 75) return { label: 'Good', ink: COLORS.protein, soft: COLORS.proteinSoft };
  if (total >= 55) return { label: 'Off target', ink: COLORS.carbs, soft: COLORS.carbsSoft };
  return { label: 'Way off', ink: COLORS.over, soft: COLORS.overSoft };
}

export default scoreTone;
