import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, Alert, Pressable
} from 'react-native';
import { colors, fonts, spacing, radius } from '../theme';
import { signOut } from '../api/auth';

export default function ProfileModal({ profile, onSignOut }) {
  const [visible, setVisible] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              setVisible(false);
              await signOut();
              onSignOut?.();
            } catch (e) {
              Alert.alert('Error', 'Could not log out.');
            }
          },
        },
      ]
    );
  };

  const xp     = profile?.xp ?? 0;
  const streak = profile?.streak ?? 0;
  const name   = profile?.name ?? 'Rider';
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <>
      {/* Avatar button in header */}
      <TouchableOpacity style={styles.avatarBtn} onPress={() => setVisible(true)}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>

            {/* Profile header */}
            <View style={styles.profileTop}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarLargeText}>{initials}</Text>
              </View>
              <View>
                <Text style={styles.profileName}>{name}</Text>
                <Text style={styles.profileSub}>🔥 {streak} streak · ⚡ {xp} xp</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Stats row */}
            <View style={styles.statsRow}>
              <StatPill label="XP"     value={xp} />
              <StatPill label="STREAK" value={`${streak}d`} />
              <StatPill label="LEVEL"  value={xp < 50 ? 'Fresh' : xp < 150 ? 'Footing' : 'Riding'} />
            </View>

            <View style={styles.divider} />

            {/* Logout */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutText}>LOG OUT</Text>
            </TouchableOpacity>

          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function StatPill({ label, value }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillValue}>{value}</Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarBtn:       { marginRight: 12 },
  avatar:          { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center' },
  avatarText:      { color: colors.bg, fontWeight: '900', fontSize: 13 },
  overlay:         { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 90, paddingRight: 12 },
  sheet:           { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, width: 240, borderWidth: 1, borderColor: colors.border },
  profileTop:      { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  avatarLarge:     { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center' },
  avatarLargeText: { color: colors.bg, fontWeight: '900', fontSize: 18 },
  profileName:     { ...fonts.subhead, fontSize: 16 },
  profileSub:      { ...fonts.body, fontSize: 12, marginTop: 2 },
  divider:         { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  statsRow:        { flexDirection: 'row', justifyContent: 'space-between', marginVertical: spacing.xs },
  pill:            { alignItems: 'center', flex: 1 },
  pillValue:       { ...fonts.subhead, fontSize: 15, color: colors.accent },
  pillLabel:       { ...fonts.label, fontSize: 9, marginTop: 2 },
  logoutBtn:       { padding: spacing.md, alignItems: 'center', borderRadius: radius.md, borderWidth: 1, borderColor: colors.red, marginTop: spacing.xs },
  logoutText:      { color: colors.red, fontWeight: '900', fontSize: 13, letterSpacing: 1 },
});
