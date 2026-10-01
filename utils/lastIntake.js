// The answers from the last intake quiz, kept on the device.
//
// What "See my personal report" on the Home tab reads (v0.6.0). It
// arrived in v0.5.7 as scaffolding -- a door into the report while the
// report was being redesigned -- and Damon kept it, on the grounds that
// re-reading your own plan without sitting through eleven questions is
// a real thing to want.
//
// THE ANSWERS, NOT THE REPORT. App.js rebuilds the report from these
// every time (buildProfile + generateGoalsReport, both pure), so a
// reopened report can never be a stale copy of one the current code
// would no longer produce. It also means this file stores the smallest
// thing that works: eleven answers, not a computed report.
//
// Before this, the quiz's answers were never stored anywhere. App.js
// kept them in component state, computed the report, persisted the two
// numbers that outlive the flow (TDEE and diet) and threw the rest away
// when the report closed.
//
// ASYNCSTORAGE, SO DEVICE-LOCAL, and that is the honest limit of it:
// saved goals follow the account to a second phone and this does not.
// Supabase would fix that and needs a table this app cannot create for
// itself. Worth doing if people turn out to use two devices; not worth
// blocking the feature on.
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'nutrition.lastIntake.v1';

// Neither of these ever throws. A convenience that can take the app down
// is worse than one that quietly does nothing, so both ends swallow
// their errors and log -- the cost of a failure here is one row missing
// from the Home tab.
export async function saveLastIntake(answers) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify({ at: Date.now(), answers }));
  } catch (err) {
    console.warn('Failed to store the last intake', err);
  }
}

export async function loadLastIntake() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.answers) return null;
    return parsed; // { at, answers }
  } catch (err) {
    console.warn('Failed to read the last intake', err);
    return null;
  }
}
