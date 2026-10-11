import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { commit, fail, nudge } from '../utils/haptics';
import { supabase } from '../utils/supabaseClient';
import { APP_VERSION } from '../utils/appVersion';

// Sign in, sign up, and confirm an address (v0.7.6).
//
// ---------------------------------------------------------------------
// A CODE, NOT A LINK, AND THAT IS THE WHOLE DESIGN
//
// Supabase's default confirmation email contains a URL. Tapping it opens
// the phone's BROWSER, which is not this app, and getting back again
// needs deep linking: a custom scheme or universal links, an association
// file, and a real build -- Expo Go hands out `exp://` URLs that a
// confirmation link does not survive. That would have meant leaving
// Snack behind to ship a login screen.
//
// So the signup email template is set to send `{{ .Token }}` instead of
// `{{ .ConfirmationURL }}` and the user types the six digits in here.
// No browser, no deep link, no build. Supabase's own reference documents
// exactly this under "Verify Signup One-Time Password":
//
//     supabase.auth.verifyOtp({ email, token, type: 'email' })
//
// `type: 'email'` is what the reference's signup example passes. Older
// community answers say 'signup' and some say 'magiclink'; the reference
// is the one to trust.
//
// ---------------------------------------------------------------------
// IT WORKS WITH THE SUPABASE TOGGLE EITHER WAY, ON PURPOSE
//
// "Confirm email" is off on the project today and turning it on needs a
// domain and an SMTP provider first. Rather than ship a screen that only
// makes sense after that, this one reads what signUp actually returned
// and does the right thing:
//
//   a session came back  -> confirmations are OFF. The address is
//                           implicitly confirmed, App.js's auth listener
//                           sees the session and the app opens. Nothing
//                           to confirm, no code screen.
//   a user, no session   -> confirmations are ON. A code is in the
//                           inbox; show the code screen.
//
// So this can ship now and the toggle can be flipped whenever the domain
// is ready, with no second code change. It also means the old
// "Account created! You can log in now." is gone: with confirmations off
// it was never seen (the app had already opened behind it), and with
// them on it was a lie.
export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'verify'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  // Seconds until Resend is allowed again. Supabase rate-limits these
  // per project, and a user who taps Resend four times has spent the
  // whole project's hourly allowance on themselves.
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef(null);

  // How many digits Supabase is configured to send. Six is the default;
  // if the project ever changes it, change it here too — the field would
  // otherwise silently truncate what the user typed.
  const CODE_LENGTH = 6;
  const RESEND_COOLDOWN_S = 60;

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    timerRef.current = setTimeout(() => setCooldown((n) => n - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [cooldown]);

  // Supabase speaks in its own strings and most of them are fine to show
  // ("Invalid login credentials" says what happened). These three are
  // not: they are about a flow the user is in the middle of, and the raw
  // text does not tell them what to do next. Everything else falls
  // through unchanged rather than being hidden behind a guess.
  const readable = (err) => {
    const m = (err && err.message) || '';
    if (/expired|invalid/i.test(m) && /token|otp|code/i.test(m)) {
      return 'That code is wrong or has expired. Check the latest email, or send a new code.';
    }
    if (/rate limit|too many/i.test(m)) {
      return 'Too many attempts for now. Wait a minute and try again.';
    }
    if (/email not confirmed/i.test(m)) {
      return 'This address has not been confirmed yet.';
    }
    return m || 'Something went wrong. Please try again.';
  };

  const isUnconfirmed = (err) => /email not confirmed/i.test((err && err.message) || '');

  const startCooldown = () => setCooldown(RESEND_COOLDOWN_S);

  const goVerify = (message) => {
    setCode('');
    setMode('verify');
    setErrorMsg('');
    setInfoMsg(message);
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    setInfoMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both an email and a password.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) throw error;

        // ALREADY REGISTERED, which Supabase deliberately hides.
        //
        // With confirmations on, signing up with an address that already
        // has a confirmed account returns success and a user object, so
        // that an attacker cannot use this form to discover who has an
        // account. The giveaway is that the user comes back with no
        // identities. Without this check the app tells someone it made
        // them an account on an address that was never theirs, and then
        // the code they are waiting for never arrives.
        //
        // The check only catches CONFIRMED duplicates -- an address that
        // signed up and never confirmed still returns an identity, and
        // looks like a fresh signup. That one is harmless here: a new
        // code is sent and confirming it finishes the original signup.
        const identities = data && data.user && data.user.identities;
        if (Array.isArray(identities) && identities.length === 0) {
          setMode('login');
          setPassword('');
          setInfoMsg('That address already has an account. Log in instead.');
          return;
        }

        // Confirmations off: a session came back and App.js's listener is
        // already opening the app behind this screen.
        if (data && data.session) return;

        commit();
        startCooldown();
        goVerify(`We sent a ${CODE_LENGTH}-digit code to ${email.trim()}.`);
        return;
      }

      if (mode === 'verify') {
        if (!code.trim()) {
          setErrorMsg('Enter the code from your email.');
          return;
        }
        const { error } = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: code.trim(),
          type: 'email',
        });
        if (error) throw error;
        // A session comes back with it, so App.js's listener takes over
        // from here and this screen goes away.
        commit();
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      // On success, App.js's auth listener takes over automatically and
      // switches to the main app — nothing else to do here.
    } catch (err) {
      // SIGNING IN TO AN UNCONFIRMED ACCOUNT IS NOT A DEAD END.
      //
      // Anyone who closed the app between signing up and typing the code
      // comes back to the login screen, and Supabase answers their
      // correct password with "Email not confirmed". Left alone that is
      // the end of the road: no way to reach the code screen, no way to
      // ask for a new code, and the account is stranded. Sending them to
      // the code screen is the whole rescue.
      //
      // No code is sent automatically. They probably still have the
      // first email, and a resend on every failed login would spend the
      // project's hourly allowance on someone who did not ask for it.
      if (isUnconfirmed(err)) {
        fail();
        goVerify('Confirm this address to finish. Enter the code we emailed you, or send a new one.');
        return;
      }
      // The one screen where a failure is routine rather than a bug —
      // a mistyped password — and the one where the phone is usually
      // being looked at anyway. Still worth feeling.
      fail();
      setErrorMsg(readable(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim() });
      if (error) throw error;
      nudge();
      startCooldown();
      setInfoMsg(`A new code is on its way to ${email.trim()}.`);
    } catch (err) {
      fail();
      setErrorMsg(readable(err));
      // Still hold the line: a failed resend is usually the rate limit,
      // and letting them hammer it makes that worse rather than better.
      startCooldown();
    } finally {
      setLoading(false);
    }
  };

  const leaveVerify = () => {
    setCode('');
    setErrorMsg('');
    setInfoMsg('');
    setMode('login');
  };

  const verifying = mode === 'verify';
  const title = verifying ? 'Check your email'
    : mode === 'signup' ? 'Create an account' : 'Log in to your account';
  const action = verifying ? 'Confirm' : mode === 'signup' ? 'Sign Up' : 'Log In';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nutrition</Text>
      <Text style={styles.subtitle}>{title}</Text>

      {verifying ? (
        <>
          <Text style={styles.sentTo}>
            Enter the {CODE_LENGTH}-digit code sent to{'\n'}
            <Text style={styles.sentToEmail}>{email.trim()}</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.codeInput]}
            placeholder={'0'.repeat(CODE_LENGTH)}
            placeholderTextColor="#c9ccd4"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            maxLength={CODE_LENGTH}
            value={code}
            onChangeText={(t) => setCode(t.replace(/[^0-9]/g, ''))}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </>
      )}

      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
      {infoMsg ? <Text style={styles.info}>{infoMsg}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{action}</Text>
        )}
      </TouchableOpacity>

      {verifying ? (
        <>
          <TouchableOpacity onPress={handleResend} disabled={cooldown > 0 || loading}>
            <Text style={[styles.switchModeText, cooldown > 0 && styles.switchModeMuted]}>
              {cooldown > 0 ? `Send a new code in ${cooldown}s` : 'Send a new code'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={leaveVerify}>
            <Text style={[styles.switchModeText, styles.switchModeQuiet]}>
              Use a different address
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          onPress={() => {
            setErrorMsg('');
            setInfoMsg('');
            setMode(mode === 'signup' ? 'login' : 'signup');
          }}
        >
          <Text style={styles.switchModeText}>
            {mode === 'signup' ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Same reasoning/rule as DashboardScreen.js's version line — a
          little version number so Damon can tell at a glance whether the
          code he just pasted into Snack actually took effect, bumped on
          every delivered change (see utils/appVersion.js). This is the
          first screen shown before logging in, so it's the earliest place
          in the app that number is visible. */}
      <Text style={styles.versionText}>v{APP_VERSION}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7fa', padding: 24, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: '700', color: '#1a1a1a', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#777', textAlign: 'center', marginBottom: 24 },
  sentTo: { fontSize: 14, color: '#777', textAlign: 'center', marginBottom: 16, lineHeight: 20 },
  sentToEmail: { color: '#1a1a1a', fontWeight: '600' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e3e3e8',
  },
  // Six digits read as a code rather than a word: big, spaced and
  // centred, so a transposed pair is visible before it is submitted.
  codeInput: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 8,
    textAlign: 'center',
    paddingVertical: 14,
  },
  error: { color: '#e0533d', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  info: { color: '#3fb27f', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  button: {
    backgroundColor: '#4f8ef7',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  switchModeText: { color: '#4f8ef7', textAlign: 'center', marginTop: 16, fontSize: 14 },
  switchModeMuted: { color: '#aab2c0' },
  switchModeQuiet: { color: '#8b94a8', marginTop: 12 },
  versionText: { textAlign: 'center', color: '#bbb', fontSize: 12, marginTop: 24 },
});
