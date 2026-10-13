import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { commit, fail, nudge } from '../utils/haptics';
import { supabase } from '../utils/supabaseClient';
import { APP_VERSION } from '../utils/appVersion';

// Sign in, sign up, confirm an address, and reset a forgotten password
// (v0.7.6, reset added in v0.7.9).
//
// ---------------------------------------------------------------------
// THE RESET FLOW, AND WHY IT IS TWO SCREENS RATHER THAN THREE
//
// 'forgot' asks for an address and sends a code. 'reset' then takes the
// code AND the new password on one screen, submitted together.
//
// That pairing is not a shortcut, it is the point. Verifying a recovery
// code signs the user in -- Supabase creates a real session the moment
// verifyOtp succeeds. Splitting the code and the password across two
// taps would leave a window where someone is logged in, believes they
// have reset their password, and has not: close the app there and the
// old password is still the live one. Doing both in a single submit
// closes that window, and App.js's PASSWORD_RECOVERY hold keeps this
// screen mounted across it so a failed save still has somewhere to say
// so.
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
// `recovering` is App.js telling this screen that a reset code has been
// accepted and a session now exists, but the new password has not been
// saved yet. `onRecoveryDone` releases that hold.
export default function AuthScreen({ recovering = false, onRecoveryDone }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [code, setCode] = useState('');
  // 'login' | 'signup' | 'verify' | 'forgot' | 'reset'
  const [mode, setMode] = useState('login');
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

  // What the project's Auth settings currently demand, mirrored here only
  // to WORD the error below -- Supabase itself does the enforcing, so a
  // mismatch makes a sentence stale, never lets a bad password through.
  // The real figure is read out of Supabase's own text whenever it states
  // one, so this is a fallback rather than the source of truth.
  const PASSWORD_MIN = 10;

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    timerRef.current = setTimeout(() => setCooldown((n) => n - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [cooldown]);

  // Normally this screen is already sitting in 'reset' when the hold goes
  // on, because it never unmounted. This is for the case where it did --
  // a reload mid-reset -- so the user lands back on the password field
  // instead of a login form that would refuse to do anything useful.
  useEffect(() => {
    if (recovering) setMode('reset');
  }, [recovering]);

  // A REJECTED PASSWORD IS NOT A WALL OF PUNCTUATION (v0.7.8).
  //
  // Supabase's weak-password message spells out every permitted symbol,
  // so it arrives looking like this:
  //
  //   "Password should contain at least one character of each:
  //    abcdefghijklmnopqrstuvwxyz, ABCDEFGHIJKLMNOPQRSTUVWXYZ,
  //    0123456789, !@#$%^&*()_+-=[]{};'\:"|<>?,./`~."
  //
  // Now that the project asks for ten characters and all four character
  // classes, a good share of people will fail their first attempt, and
  // that paragraph is the first thing the app ever says to them.
  //
  // The library gives us something much better than the text. supabase-js
  // raises an AuthWeakPasswordError carrying `reasons`: a string array
  // drawn from 'length', 'characters' and 'pwned' (read off
  // @supabase/auth-js 2.117.3 -- lib/errors.js builds the error, lib/
  // types.js lists the three values -- rather than guessed). Those drive
  // the wording. The raw text is consulted for one thing only: the actual
  // minimum length, so this sentence stays true if that setting is ever
  // changed in the dashboard.
  const isWeakPassword = (err) =>
    !!err && (err.name === 'AuthWeakPasswordError' || err.code === 'weak_password');

  const weakPasswordText = (err) => {
    const reasons = err && Array.isArray(err.reasons) ? err.reasons : [];

    // Only reachable once the project is on a paid plan, where Supabase
    // checks passwords against known breaches. Handled now so that the
    // day the plan changes, this message is already correct.
    if (reasons.includes('pwned')) {
      return 'That password has turned up in a known data breach. Please pick a different one.';
    }

    const stated = ((err && err.message) || '').match(/at least (\d+) characters/i);
    const min = stated ? stated[1] : PASSWORD_MIN;

    const needs = [];
    if (reasons.includes('length')) needs.push(`at least ${min} characters`);
    if (reasons.includes('characters')) {
      needs.push('a capital letter, a lowercase letter, a number and a symbol');
    }

    // `reasons` can legitimately arrive empty. Say something true rather
    // than inventing a rule that may not be the one that failed.
    if (!needs.length) {
      return 'That password is not strong enough. Try a longer one with letters, numbers and a symbol.';
    }
    return `Your password needs ${needs.join(', including ')}.`;
  };

  // Supabase speaks in its own strings and most of them are fine to show
  // ("Invalid login credentials" says what happened). These are not: they
  // are about a flow the user is in the middle of, and the raw text does
  // not tell them what to do next. Everything else falls through
  // unchanged rather than being hidden behind a guess.
  const readable = (err) => {
    const m = (err && err.message) || '';
    if (isWeakPassword(err)) {
      return weakPasswordText(err);
    }
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

  const goForgot = () => {
    setCode('');
    setNewPassword('');
    setErrorMsg('');
    setInfoMsg('');
    setMode('forgot');
  };

  const goReset = (message) => {
    setCode('');
    setNewPassword('');
    setMode('reset');
    setErrorMsg('');
    setInfoMsg(message);
  };

  // Backing out of a reset. If a code was already accepted there is a
  // live session behind this screen, and simply returning to the login
  // form would drop the user into the app still on their old password --
  // the opposite of what "cancel" should mean. Signing out first is the
  // honest undo. If that call fails the session survives and they land
  // in the app anyway, which is no worse than closing and reopening,
  // and is not a hole: that session is legitimately theirs.
  const leaveFlow = async () => {
    if (recovering) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        // Nothing to add — the screen returns to login either way.
      }
      if (onRecoveryDone) onRecoveryDone();
    }
    setCode('');
    setNewPassword('');
    setPassword('');
    setErrorMsg('');
    setInfoMsg('');
    setMode('login');
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    setInfoMsg('');

    // Only the two password-bearing modes need both fields. 'forgot' has
    // no password box at all and 'reset' uses its own, so the old
    // unconditional check would have blocked both of them outright.
    if ((mode === 'login' || mode === 'signup') && (!email.trim() || !password)) {
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

      // FORGOT PASSWORD, STEP ONE: ask for a code.
      //
      // The message deliberately says "if that address has an account".
      // Supabase returns success whether or not one exists, so that this
      // form cannot be used to find out who has registered, and the
      // wording has to match that or it quietly undoes the protection.
      if (mode === 'forgot') {
        if (!email.trim()) {
          setErrorMsg('Enter the email address for your account.');
          return;
        }
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
        if (error) throw error;
        commit();
        startCooldown();
        goReset(`If ${email.trim()} has an account, a ${CODE_LENGTH}-digit code is on its way.`);
        return;
      }

      // FORGOT PASSWORD, STEP TWO: code and new password together.
      //
      // One screen and one tap, because the gap between them is the
      // dangerous part: verifying the code already signs the user in, so
      // any pause there leaves an account half-reset.
      if (mode === 'reset') {
        if (!code.trim()) {
          setErrorMsg('Enter the code from your email.');
          return;
        }
        if (!newPassword) {
          setErrorMsg('Choose a new password.');
          return;
        }

        // Skipped on a retry. A one-time code is spent the moment it is
        // accepted, so if the first attempt verified but the password
        // would not save -- too short, say -- running this again would
        // answer "that code is wrong or has expired" and strand someone
        // who did nothing wrong. `recovering` is App.js's record that
        // the code already did its job.
        if (!recovering) {
          const { error } = await supabase.auth.verifyOtp({
            email: email.trim(),
            token: code.trim(),
            type: 'recovery',
          });
          if (error) throw error;
        }

        const { error: saveErr } = await supabase.auth.updateUser({ password: newPassword });
        if (saveErr) throw saveErr;

        commit();
        // Releases App.js's hold; the session is already in place, so the
        // app opens straight away.
        if (onRecoveryDone) onRecoveryDone();
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
      // Same button, two different senders. A reset code does not come
      // from resend() -- that is for confirmations -- so asking for one
      // means asking for the recovery email again.
      const { error } = mode === 'reset'
        ? await supabase.auth.resetPasswordForEmail(email.trim())
        : await supabase.auth.resend({ type: 'signup', email: email.trim() });
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
  const forgetting = mode === 'forgot';
  const resetting = mode === 'reset';
  // Both code screens share the digits field; only 'reset' puts a
  // password box underneath it.
  const codeEntry = verifying || resetting;

  const title = verifying ? 'Check your email'
    : forgetting ? 'Reset your password'
    : resetting ? 'Choose a new password'
    : mode === 'signup' ? 'Create an account'
    : 'Log in to your account';

  const action = verifying ? 'Confirm'
    : forgetting ? 'Send code'
    : resetting ? 'Save new password'
    : mode === 'signup' ? 'Sign Up'
    : 'Log In';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nutrition</Text>
      <Text style={styles.subtitle}>{title}</Text>

      {codeEntry ? (
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
            returnKeyType={resetting ? 'next' : 'done'}
            onSubmitEditing={resetting ? undefined : handleSubmit}
          />
          {resetting ? (
            <TextInput
              style={styles.input}
              placeholder="New password"
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              value={newPassword}
              onChangeText={setNewPassword}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          ) : null}
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
          {/* No password box when all we are asking for is the address
              to send a code to. */}
          {forgetting ? null : (
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          )}
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

      {codeEntry ? (
        <>
          <TouchableOpacity onPress={handleResend} disabled={cooldown > 0 || loading}>
            <Text style={[styles.switchModeText, cooldown > 0 && styles.switchModeMuted]}>
              {cooldown > 0 ? `Send a new code in ${cooldown}s` : 'Send a new code'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={resetting ? leaveFlow : leaveVerify} disabled={loading}>
            <Text style={[styles.switchModeText, styles.switchModeQuiet]}>
              {resetting ? 'Back to log in' : 'Use a different address'}
            </Text>
          </TouchableOpacity>
        </>
      ) : forgetting ? (
        <TouchableOpacity onPress={leaveFlow} disabled={loading}>
          <Text style={[styles.switchModeText, styles.switchModeQuiet]}>Back to log in</Text>
        </TouchableOpacity>
      ) : (
        <>
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
          {/* Only on the login screen: offering a password reset from the
              signup form would be answering a question nobody asked. */}
          {mode === 'login' ? (
            <TouchableOpacity onPress={goForgot}>
              <Text style={[styles.switchModeText, styles.switchModeQuiet]}>
                Forgot your password?
              </Text>
            </TouchableOpacity>
          ) : null}
        </>
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
