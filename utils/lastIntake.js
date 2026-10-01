// The answers from the last intake quiz, kept on the device.
//
// DEV SCAFFOLDING (v0.5.7). This exists for the "Open Last Report" button
// on the Home tab, which is there so the report can be redesigned
// without answering eleven questions before every look at it. Damon
// asked for the button and said it will not be kept; when it goes, this
// file and its two call sites in App.js go with it.
//
// The quiz's answers have never been stored anywhere: App.js keeps them
// in component state, computes the report, persists the two numbers that
// outlive the flow (TDEE and diet) and throws the rest away when the
// report closes. So there is nothing to rebuild a report from after a
// reload -- hence this.
//
// AsyncStorage rather than Supabase: it is already a dependency (the
// auth session lives in it), it is device-local, and it needs no table
// and no migration for something that is going to be deleted.
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'nutrition.lastIntake.v1';

// Neither of these ever throws. A dev convenience that can break the app
// it is meant to help develop is worse than one that quietly does
// nothing, so both ends swallow their errors and log.
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
