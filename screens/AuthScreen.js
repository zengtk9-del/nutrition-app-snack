import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../utils/supabaseClient';
import { APP_VERSION } from '../utils/appVersion';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

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
        const { error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) throw error;
        setInfoMsg('Account created! You can log in now.');
        setMode('login');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        // On success, App.js's auth listener takes over automatically and
        // switches to the main app — nothing else to do here.
      }
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nutrition</Text>
      <Text style={styles.subtitle}>
        {mode === 'signup' ? 'Create an account' : 'Log in to your account'}
      </Text>

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

      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
      {infoMsg ? <Text style={styles.info}>{infoMsg}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{mode === 'signup' ? 'Sign Up' : 'Log In'}</Text>
        )}
      </TouchableOpacity>

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
  versionText: { textAlign: 'center', color: '#bbb', fontSize: 12, marginTop: 24 },
});
