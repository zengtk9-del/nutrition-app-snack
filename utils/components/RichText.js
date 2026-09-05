import React from 'react';
import { Text, StyleSheet } from 'react-native';

// Renders `text` as a single paragraph with each exact-substring phrase in
// `boldPhrases` shown as real bold text — no Markdown asterisks are ever
// shown to the user, since RN's <Text> doesn't parse Markdown on its own.
//
// How it works: for every phrase, find every place it occurs in `text`
// (case-sensitive, exact substring — this project always passes phrases
// copied verbatim from the same paragraph, so this is reliable), collect
// each occurrence as a {start, end} range, sort all ranges by start
// position, then walk the string once building alternating plain/bold
// <Text> segments. Overlapping ranges (which shouldn't happen given how
// boldPhrases is authored in data/quizQuestions.js, but could in theory if
// a phrase were a substring of another) are handled by simply skipping any
// range that starts before the point we've already rendered up to.
function buildSegments(text, boldPhrases) {
  if (!text) return [];
  if (!boldPhrases || boldPhrases.length === 0) {
    return [{ text, bold: false }];
  }

  const ranges = [];
  boldPhrases.forEach((phrase) => {
    if (!phrase) return;
    let fromIndex = 0;
    while (fromIndex <= text.length) {
      const idx = text.indexOf(phrase, fromIndex);
      if (idx === -1) break;
      ranges.push({ start: idx, end: idx + phrase.length });
      fromIndex = idx + phrase.length;
    }
  });
  ranges.sort((a, b) => a.start - b.start);

  const segments = [];
  let cursor = 0;
  ranges.forEach((range) => {
    if (range.start < cursor) return; // overlapping/duplicate — skip
    if (range.start > cursor) {
      segments.push({ text: text.slice(cursor, range.start), bold: false });
    }
    segments.push({ text: text.slice(range.start, range.end), bold: true });
    cursor = range.end;
  });
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), bold: false });
  }
  return segments;
}

export default function RichText({ text, boldPhrases, style, boldStyle }) {
  const segments = buildSegments(text, boldPhrases);
  return (
    <Text style={style}>
      {segments.map((seg, i) =>
        seg.bold ? (
          <Text key={i} style={[styles.bold, boldStyle]}>
            {seg.text}
          </Text>
        ) : (
          <Text key={i}>{seg.text}</Text>
        )
      )}
    </Text>
  );
}

const styles = StyleSheet.create({
  bold: { fontWeight: '700' },
});
