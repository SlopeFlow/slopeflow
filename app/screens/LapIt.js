// LapIt.js — Kid's recovery screen: complete chores to earn back XP
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert, RefreshControl,
  TextInput, Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '../theme';
import { getAssignedChores, submitChoreCompletion, getMyEscrow } from '../api/chores';
import { supabase } from '../api/supabase';

export default function LapIt() {
  const [chores, setChores]       = useState([]);
  const [escrow, setEscrow]       = useState(null);
  const [xp, setXP]               = useState(0);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitted, setSubmitted] = useState([]); // ids submitted this session

  const load = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const [profileData, escrowData] = await Promise.all([
        supabase.from('profiles').select('xp').eq('id', user.id).single(),
        getMyEscrow(),
      ]);

      setXP(profileData.data?.xp ?? 0);
      setEscrow(escrowData);

      // Get chores assigned to me
      const choreData = await getAssignedChores(user.id);
      setChores(choreData);
    } catch (e) {
      console.error('LapIt load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (chore) => {
    if (submitted.includes(chore.id)) return;
    Alert.alert(
      'Mark as complete?',
      `Submit "${chore.displayName}" for parent approval. You'll get +${chore.xp_value} XP when approved.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            try {
              await submitChoreCompletion(chore.id);
              setSubmitted(prev => [...prev, chore.id]);
              Alert.alert('Submitted!', 'Your parent will review and approve. XP coming soon.');
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  const xpToThreshold = escrow ? Math.max(0, escrow.xp_threshold - xp) : null;
  const progress = escrow ? Math.min((xp / escrow.xp_threshold) * 100, 100) : 0;

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.accent} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.label}>RECOVERY MODE</Text>
        <Text style={styles.heading}>LAP IT</Text>
        <Text style={styles.sub}>Complete chores to earn back XP and unlock your payout.</Text>
      </View>

      {/* XP Progress card */}
      <View style={styles.xpCard}>
        <View style={styles.xpRow}>
          <View>
            <Text style={styles.xpLabel}>YOUR XP</Text>
            <Text style={styles.xpValue}>{xp}</Text>
          </View>
          {escrow && (
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.xpLabel}>PAYOUT THRESHOLD</Text>
              <Text style={styles.xpValue}>{escrow.xp_threshold}</Text>
            </View>
          )}
        </View>

        {escrow && (
          <>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            {xpToThreshold > 0 ? (
              <Text style={styles.xpHint}>{xpToThreshold} XP to unlock Venmo payout</Text>
            ) : (
              <View style={styles.unlocked}>
                <Ionicons name="checkmark-circle" size={16} color={colors.green} />
                <Text style={styles.unlockedText}> Payout unlocked — ask your parent to send it!</Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Chores list */}
      <Text style={styles.sectionLabel}>AVAILABLE CHORES</Text>

      {chores.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="list-outline" size={40} color={colors.textMuted} style={{ marginBottom: spacing.sm }} />
          <Text style={styles.emptyText}>No chores assigned yet.{'\n'}Your parent needs to set them up.</Text>
        </View>
      ) : chores.map(chore => {
        const isSubmitted = submitted.includes(chore.id);
        return (
          <View key={chore.id} style={styles.choreCard}>
            <View style={styles.choreLeft}>
              <Text style={styles.choreName}>{chore.displayName}</Text>
              <Text style={styles.choreFreq}>{chore.frequency}</Text>
            </View>
            <View style={styles.choreRight}>
              <View style={styles.xpBadge}>
                <Ionicons name="flash" size={12} color={colors.bg} />
                <Text style={styles.xpBadgeText}>+{chore.xp_value} XP</Text>
              </View>
              <TouchableOpacity
                style={[styles.submitBtn, isSubmitted && styles.submitBtnDone]}
                onPress={() => handleSubmit(chore)}
                disabled={isSubmitted}
              >
                {isSubmitted
                  ? <Ionicons name="time-outline" size={16} color={colors.textMuted} />
                  : <Text style={styles.submitBtnText}>DONE</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {/* Info footer */}
      <View style={styles.footer}>
        <Ionicons name="information-circle-outline" size={14} color={colors.textMuted} />
        <Text style={styles.footerText}> Your parent approves completions before XP is awarded.</Text>
      </View>

      {/* Parent invite */}
      {!escrow && (
        <View style={styles.inviteCard}>
          <Ionicons name="people-outline" size={28} color={colors.accent} style={{ marginBottom: spacing.sm }} />
          <Text style={styles.inviteTitle}>Link a Parent</Text>
          <Text style={styles.inviteText}>
            Ask your parent to download SlopeFlow, create an account, and enter your invite code below.
          </Text>
          <InviteCode />
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  center:         { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' },
  header:         { marginBottom: spacing.lg },
  label:          { ...fonts.label, color: colors.accent },
  heading:        { ...fonts.heading, fontSize: 28, marginTop: 2 },
  sub:            { ...fonts.body, marginTop: spacing.sm, lineHeight: 22 },
  xpCard:         { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg, borderLeftWidth: 3, borderLeftColor: colors.accent },
  xpRow:          { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  xpLabel:        { ...fonts.label, color: colors.textMuted },
  xpValue:        { ...fonts.heading, fontSize: 32, color: colors.accent },
  progressTrack:  { height: 6, backgroundColor: colors.border, borderRadius: 3, marginBottom: spacing.sm },
  progressFill:   { height: 6, backgroundColor: colors.accent, borderRadius: 3 },
  xpHint:         { ...fonts.body, fontSize: 12, color: colors.textMuted },
  unlocked:       { flexDirection: 'row', alignItems: 'center' },
  unlockedText:   { ...fonts.body, fontSize: 13, color: colors.green },
  sectionLabel:   { ...fonts.label, color: colors.accent, marginBottom: spacing.sm },
  choreCard:      { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  choreLeft:      { flex: 1 },
  choreName:      { ...fonts.subhead, fontSize: 15 },
  choreFreq:      { ...fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 2, textTransform: 'capitalize' },
  choreRight:     { alignItems: 'flex-end', gap: spacing.sm },
  xpBadge:        { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.accent, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  xpBadgeText:    { color: colors.bg, fontWeight: '800', fontSize: 11 },
  submitBtn:      { backgroundColor: colors.green, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  submitBtnDone:  { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  submitBtnText:  { color: colors.bg, fontWeight: '900', fontSize: 11, letterSpacing: 1 },
  emptyState:     { alignItems: 'center', paddingVertical: spacing.xl },
  emptyText:      { ...fonts.body, color: colors.textMuted, textAlign: 'center', lineHeight: 22, marginTop: spacing.sm },
  footer:         { flexDirection: 'row', alignItems: 'center', padding: spacing.md, marginTop: spacing.md },
  footerText:     { ...fonts.body, fontSize: 12, color: colors.textMuted, flex: 1 },
  inviteCard:     { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.lg, marginTop: spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: colors.accent + '44', marginBottom: spacing.xl },
  inviteTitle:    { ...fonts.subhead, fontSize: 18, marginBottom: spacing.sm },
  inviteText:     { ...fonts.body, textAlign: 'center', lineHeight: 22, marginBottom: spacing.md, color: colors.textSecondary },
  inviteCodeBox:  { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, gap: spacing.md },
  inviteCodeText: { ...fonts.heading, fontSize: 28, color: colors.accent, letterSpacing: 6, flex: 1, textAlign: 'center' },
  shareBtn:       { backgroundColor: colors.accent, borderRadius: radius.md, padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.md, width: '100%' },
  shareBtnText:   { color: colors.bg, fontWeight: '900', fontSize: 13, letterSpacing: 1 },
});

// ── Invite Code Component ─────────────────────────────────────
function InviteCode() {
  const [code, setCode] = useState(null);

  useEffect(() => {
    generateCode();
  }, []);

  const generateCode = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    // Use last 6 chars of user ID as invite code — simple and unique enough
    const shortCode = user.id.replace(/-/g, '').slice(0, 6).toUpperCase();
    setCode(shortCode);
  };

  const handleShare = () => {
    if (!code) return;
    Share.share({
      message: `Join me on SlopeFlow! Download the app and enter my invite code: ${code} to link as my parent.`,
      title: 'SlopeFlow Parent Invite',
    });
  };

  if (!code) return null;

  return (
    <>
      <View style={styles.inviteCodeBox}>
        <Text style={styles.inviteCodeText}>{code}</Text>
        <Ionicons name="copy-outline" size={20} color={colors.textMuted} />
      </View>
      <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
        <Ionicons name="share-outline" size={16} color={colors.bg} style={{ marginRight: 6 }} />
        <Text style={styles.shareBtnText}>SHARE INVITE</Text>
      </TouchableOpacity>
    </>
  );
}
