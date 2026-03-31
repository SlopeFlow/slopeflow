import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { colors, fonts, spacing, radius } from '../theme';
import { signIn, signUp } from '../api/auth';

export default function AuthScreen({ onAuth }) {
  const [mode, setMode]       = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUp(email.trim(), password.trim());
        Alert.alert(
          'Check your email 📬',
          'We sent a confirmation link. Verify and come back to ride.',
        );
      } else {
        await signIn(email.trim(), password.trim());
        onAuth?.();
      }
    } catch (e) {
      Alert.alert('Oops', e.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Logo */}
      <View style={styles.logoWrap}>
        <Text style={styles.logoEmoji}>🏔</Text>
        <Text style={styles.logoText}>SlopeFlow</Text>
        <Text style={styles.tagline}>Read the mountain. Trade the line.</Text>
      </View>

      {/* Tab switcher */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, mode === 'signin' && styles.tabActive]}
          onPress={() => setMode('signin')}
        >
          <Text style={[styles.tabText, mode === 'signin' && styles.tabTextActive]}>
            SIGN IN
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, mode === 'signup' && styles.tabActive]}
          onPress={() => setMode('signup')}
        >
          <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>
            CREATE ACCOUNT
          </Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.inputLabel}>EMAIL</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.inputLabel}>PASSWORD</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPass}
          placeholder="Min 6 characters"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.submitBtn, (!email || !password || loading) && styles.submitDisabled]}
          onPress={submit}
          disabled={!email || !password || loading}
        >
          {loading
            ? <ActivityIndicator color={colors.bg} />
            : <Text style={styles.submitText}>
                {mode === 'signin' ? "DROP IN →" : "CREATE ACCOUNT →"}
              </Text>
          }
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        No real money. No risk. Just signal.
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: colors.bg, padding: spacing.lg, justifyContent: 'center' },
  logoWrap:       { alignItems: 'center', marginBottom: spacing.xl },
  logoEmoji:      { fontSize: 56, marginBottom: spacing.sm },
  logoText:       { ...fonts.heading, fontSize: 36, color: colors.accent },
  tagline:        { ...fonts.body, marginTop: spacing.sm, textAlign: 'center' },
  tabRow:         { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.md, padding: 4, marginBottom: spacing.lg },
  tab:            { flex: 1, padding: spacing.sm, borderRadius: radius.sm, alignItems: 'center' },
  tabActive:      { backgroundColor: colors.accent },
  tabText:        { ...fonts.label, color: colors.textMuted },
  tabTextActive:  { color: colors.bg },
  form:           { gap: spacing.sm },
  inputLabel:     { ...fonts.label, marginBottom: 4 },
  input:          { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, color: colors.textPrimary, fontSize: 15, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  submitBtn:      { backgroundColor: colors.accent, borderRadius: radius.md, padding: spacing.md + 2, alignItems: 'center', marginTop: spacing.sm },
  submitDisabled: { opacity: 0.4 },
  submitText:     { color: colors.bg, fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  footer:         { ...fonts.body, textAlign: 'center', marginTop: spacing.xl, fontSize: 13 },
});
