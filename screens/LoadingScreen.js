import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Shown for a few seconds between finishing the quiz and seeing the report.
// There's no real computation happening here — the numbers are already
// calculated by the time App.js switches to this screen — it exists purely
// so the report doesn't just appear instantly, which would undercut the
// "we built this specifically for you" feeling the report is going for.
//
// The bar fills in randomly-sized, randomly-timed jumps instead of one
// smooth constant crawl, so it reads as real work happening rather than an
// obviously fake, perfectly even animation. It lands on 100% after roughly
// five seconds on average, though the exact time (and the pace along the
// way) varies a bit each time it runs, for that same reason.
//
// onDone is read through a ref (refreshed every render) rather than closed
// over directly, so the one-time setup effect below doesn't restart the
// whole loading sequence from 0% if App.js ever re-renders and passes a
// new inline callback while this screen is still showing — see
// components/DragSlider.js for the same pattern, used there for the same
// reason.
export default function LoadingScreen({ onDone, message = 'Creating your personal nutrition plan' }) {
  const [progress, setProgress] = useState(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    let cancelled = false;
    let current = 0;
    let timer = null;

    const tick = () => {
      if (cancelled) return;
      const step = 4 + Math.random() * 7; // 4-11% per jump
      current = Math.min(100, current + step);
      setProgress(current);
      if (current < 100) {
        const delay = 250 + Math.random() * 200; // 250-450ms between jumps
        timer = setTimeout(tick, delay);
      } else {
        // Hold on a full bar for a beat before handing off, so it doesn't
        // flash past 100% too quickly to actually notice.
        timer = setTimeout(() => {
          if (!cancelled && onDoneRef.current) onDoneRef.current();
        }, 400);
      }
    };

    timer = setTimeout(tick, 250 + Math.random() * 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{message}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.round(progress)}%` }]} />
      </View>
      <Text style={styles.percent}>{Math.round(progress)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7fa', justifyContent: 'center', alignItems: 'center', padding: 32 },
  title: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', textAlign: 'center', marginBottom: 24 },
  track: { width: '100%', height: 10, backgroundColor: '#e3e3e8', borderRadius: 5, overflow: 'hidden' },
  fill: { height: 10, backgroundColor: '#4f8ef7', borderRadius: 5 },
  percent: { fontSize: 15, color: '#999', marginTop: 10, fontWeight: '600' },
});
