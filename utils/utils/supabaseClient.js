// Sets up the connection to Supabase (our backend: accounts + database).
//
// The URL and publishable key below are both meant to be public — they're
// safe to ship inside the app. Supabase protects your actual data using
// "row level security" rules on the database side, not by keeping these
// values secret. (The separate "secret key" from the dashboard is the one
// that must NEVER go in app code — we're not using that one here.)

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vlznfvwzwtpemxaulhhk.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_tkFUc19Xz22GOzhHSJ9Fyw_vBVqsmcs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    // Store login sessions on the device using AsyncStorage (same tool we
    // already use for saving meals/goals), so users stay logged in between
    // app opens instead of having to sign in every time.
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
