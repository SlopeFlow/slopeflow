import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '../theme';
import { signOut } from '../api/auth';

export default function ProfileScreen({ profile, onSignOut }) {
  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of SlopeFlow?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              onSignOut?.();
            } catch (e) {
              Alert.alert('Error', 'Could not log out. Try again.');
            }
          },
        },
      ]
    );
  };

  const expLevel = () => {
    const xp = profile?.xp ?? 0;
    if (xp < 50)  return { label: 'Fresh Drop',    next: 50,  color: colors.textMuted };
    if (xp < 150) return { label: 'Getting Footing', next: 150, color: colors.accent };
    if (xp < 300) return { label: 'Riding',          next: 300, color: colors.green };
    return              { label: 'Sharp',             next: null, color: colors.gold };
  };

  const level   = expLevel();
  const xp      = profile?.xp ?? 0;
  const streak  = profile?.streak ?? 0;
  const progress = level.next ? Math.min((xp / level.next) * 100, 100) : 100;

  return (
    <ScrollView style={styles.container}>

      {/* Avatar + name */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={36} color={colors.accent} />
        </View>
        <Text style={styles.name}>{profile?.name ?? 'Rider'}</Text>
        <Text style={styles.level}>{level.label}</Text>
      </View>

      {/* XP card */}
      <View style={styles.card}>
        <View style={styles.xpRow}>
          <Text style={styles.xpLabel}>XP</Text>
          <Text style={styles.xpValue}>{xp} {level.next ? `/ ${level.next}` : '(MAX)'}</Text>
        </View>
        <View style={styles.xpTrack}>
          <View style={[styles.xpFill, { width: `${progress}%`, backgroundColor: level.color }]} />
        </View>
        {level.next && (
          <Text style={styles.xpHint}>{level.next - xp} XP to next level</Text>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="flame" size={22} color={colors.gold} style={{ marginBottom: 4 }} />
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>DAY STREAK</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="flash" size={22} color={colors.accent} style={{ marginBottom: 4 }} />
          <Text style={styles.statValue}>{xp}</Text>
          <Text style={styles.statLabel}>TOTAL XP</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trophy-outline" size={22} color={colors.accent} style={{ marginBottom: 4 }} />
          <Text style={styles.statValue}>{profile?.interests?.length ?? 0}</Text>
          <Text style={styles.statLabel}>FOCUS AREAS</Text>
        </View>
      </View>

      {/* Profile details */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>PROFILE</Text>
        <DetailRow label="NAME"       value={profile?.name ?? '—'} />
        <DetailRow label="AGE"        value={profile?.age ?? '—'} />
        <DetailRow label="EXPERIENCE" value={profile?.experience ?? '—'} />
        <DetailRow label="INTERESTS"  value={profile?.interests?.join(', ') ?? '—'} />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>LOG OUT</Text>
      </TouchableOpacity>

      <Text style={styles.version}>SlopeFlow v0.1.0</Text>

    </ScrollView>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  avatarSection: { alignItems: 'center', paddingVertical: spacing.xl },
  avatar:        { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md, borderWidth: 2, borderColor: colors.accent },
  name:          { ...fonts.heading, fontSize: 24 },
  level:         { ...fonts.label, color: colors.accent, marginTop: 4 },
  card:          { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  xpRow:         { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  xpLabel:       { ...fonts.label, color: colors.accent },
  xpValue:       { ...fonts.label, color: colors.textPrimary },
  xpTrack:       { height: 6, backgroundColor: colors.border, borderRadius: 3, marginBottom: spacing.xs },
  xpFill:        { height: 6, borderRadius: 3 },
  xpHint:        { ...fonts.body, fontSize: 12 },
  statsRow:      { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statCard:      { flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  statValue:     { ...fonts.subhead, fontSize: 20 },
  statLabel:     { ...fonts.label, fontSize: 9, marginTop: 2 },
  sectionLabel:  { ...fonts.label, color: colors.accent, marginBottom: spacing.sm },
  detailRow:     { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  detailLabel:   { ...fonts.label },
  detailValue:   { ...fonts.body, color: colors.textPrimary, fontWeight: '600', textTransform: 'capitalize' },
  logoutBtn:     { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginBottom: spacing.md, borderWidth: 1, borderColor: colors.red },
  logoutText:    { color: colors.red, fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  version:       { ...fonts.body, fontSize: 11, textAlign: 'center', marginBottom: spacing.xl },
});
