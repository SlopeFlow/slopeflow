// ParentDashboard.js — Parent view: chores, escrow, approvals, payouts
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, FlatList, Modal, Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '../theme';
import {
  getChoreTemplates, getLinkedKids, assignChore, getAssignedChores,
  removeChore, getPendingCompletions, approveChoreCompletion,
  rejectChoreCompletion, getEscrow, setupEscrow, requestPayout
} from '../api/chores';

const CATEGORIES = ['daily', 'weekly', 'school', 'extra'];
const CATEGORY_LABELS = { daily: 'Daily', weekly: 'Weekly', school: 'School', extra: 'Extra Credit' };

export default function ParentDashboard() {
  const [kids, setKids]               = useState([]);
  const [selectedKid, setSelectedKid] = useState(null);
  const [templates, setTemplates]     = useState([]);
  const [assigned, setAssigned]       = useState([]);
  const [pending, setPending]         = useState([]);
  const [escrow, setEscrow]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState('chores'); // 'chores' | 'approvals' | 'escrow'
  const [showAddChore, setShowAddChore] = useState(false);
  const [customChoreName, setCustomChoreName] = useState('');
  const [customXP, setCustomXP]       = useState('');

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (selectedKid) loadKidData(selectedKid.kid_id); }, [selectedKid]);

  const loadData = async () => {
    try {
      const [kidsData, templatesData] = await Promise.all([
        getLinkedKids(),
        getChoreTemplates(),
      ]);
      setKids(kidsData);
      setTemplates(templatesData);
      if (kidsData.length > 0) setSelectedKid(kidsData[0]);
    } catch (e) {
      console.error('Parent dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadKidData = async (kidId) => {
    try {
      const [choreData, pendingData, escrowData] = await Promise.all([
        getAssignedChores(kidId),
        getPendingCompletions(kidId),
        getEscrow(kidId),
      ]);
      setAssigned(choreData);
      setPending(pendingData);
      setEscrow(escrowData);
    } catch (e) {
      console.error('Kid data load error:', e);
    }
  };

  const handleAssignChore = async (template) => {
    if (!selectedKid) return;
    try {
      await assignChore({
        kidId:      selectedKid.kid_id,
        templateId: template.id,
        xpValue:    template.suggested_xp,
        frequency:  template.category === 'daily' ? 'daily' : 'weekly',
      });
      await loadKidData(selectedKid.kid_id);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleAddCustomChore = async () => {
    if (!customChoreName.trim() || !customXP) return;
    try {
      await assignChore({
        kidId:      selectedKid.kid_id,
        customName: customChoreName.trim(),
        xpValue:    parseInt(customXP),
        frequency:  'weekly',
      });
      setCustomChoreName('');
      setCustomXP('');
      setShowAddChore(false);
      await loadKidData(selectedKid.kid_id);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleApprove = async (completionId) => {
    try {
      const xp = await approveChoreCompletion(completionId);
      Alert.alert('Approved!', `+${xp} XP awarded.`);
      await loadKidData(selectedKid.kid_id);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleReject = async (completionId) => {
    try {
      await rejectChoreCompletion(completionId);
      await loadKidData(selectedKid.kid_id);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handlePayout = async () => {
    if (!selectedKid) return;
    try {
      const result = await requestPayout(selectedKid.kid_id);
      const dollars = (result.amount_cents / 100).toFixed(2);
      Alert.alert(
        'Send via Venmo',
        `Send $${dollars} to @${result.venmoHandle} on Venmo, then mark as sent.`,
        [{ text: 'Got it' }]
      );
    } catch (e) {
      Alert.alert('Not yet', e.message);
    }
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );

  if (kids.length === 0) return (
    <View style={styles.center}>
      <Ionicons name="people-outline" size={48} color={colors.textMuted} style={{ marginBottom: spacing.md }} />
      <Text style={styles.emptyTitle}>No kids linked yet</Text>
      <Text style={styles.emptyText}>Ask your kid to share their SlopeFlow email so you can link accounts.</Text>
    </View>
  );

  const templatesByCategory = CATEGORIES.map(cat => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    items: templates.filter(t => t.category === cat),
  }));

  const assignedIds = assigned.map(a => a.template_id).filter(Boolean);

  return (
    <View style={styles.container}>

      {/* Kid selector */}
      {kids.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.kidRow}>
          {kids.map(k => (
            <TouchableOpacity
              key={k.kid_id}
              style={[styles.kidChip, selectedKid?.kid_id === k.kid_id && styles.kidChipActive]}
              onPress={() => setSelectedKid(k)}
            >
              <Text style={[styles.kidChipText, selectedKid?.kid_id === k.kid_id && { color: colors.bg }]}>
                {k.profiles?.name ?? 'Kid'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {['chores', 'approvals', 'escrow'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && { color: colors.bg }]}>
              {tab.toUpperCase()}
              {tab === 'approvals' && pending.length > 0 ? ` (${pending.length})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── CHORES TAB ── */}
      {activeTab === 'chores' && (
        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: spacing.xl }}>

          {/* Assigned chores */}
          <Text style={styles.sectionLabel}>ASSIGNED TO {selectedKid?.profiles?.name?.toUpperCase() ?? 'KID'}</Text>
          {assigned.length === 0 ? (
            <Text style={styles.emptyText}>No chores assigned yet. Add from the list below.</Text>
          ) : assigned.map(chore => (
            <View key={chore.id} style={styles.choreRow}>
              <View style={styles.choreLeft}>
                <Text style={styles.choreName}>{chore.displayName}</Text>
                <Text style={styles.choreXP}>+{chore.xp_value} XP · {chore.frequency}</Text>
              </View>
              <TouchableOpacity onPress={() => removeChore(chore.id).then(() => loadKidData(selectedKid.kid_id))}>
                <Ionicons name="close-circle-outline" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          ))}

          {/* Add custom chore */}
          <TouchableOpacity style={styles.addCustomBtn} onPress={() => setShowAddChore(true)}>
            <Ionicons name="add-circle-outline" size={18} color={colors.accent} />
            <Text style={styles.addCustomText}> Add custom chore</Text>
          </TouchableOpacity>

          {/* Master list */}
          {templatesByCategory.map(({ category, label, items }) => (
            <View key={category}>
              <Text style={styles.categoryLabel}>{label.toUpperCase()}</Text>
              {items.map(t => {
                const isAssigned = assignedIds.includes(t.id);
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.templateRow, isAssigned && styles.templateRowAssigned]}
                    onPress={() => !isAssigned && handleAssignChore(t)}
                    disabled={isAssigned}
                  >
                    <Text style={[styles.templateName, isAssigned && { color: colors.textMuted }]}>{t.name}</Text>
                    <View style={styles.templateRight}>
                      <Text style={styles.templateXP}>+{t.suggested_xp} XP</Text>
                      {isAssigned
                        ? <Ionicons name="checkmark-circle" size={18} color={colors.green} />
                        : <Ionicons name="add-circle-outline" size={18} color={colors.accent} />
                      }
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>
      )}

      {/* ── APPROVALS TAB ── */}
      {activeTab === 'approvals' && (
        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: spacing.xl }}>
          <Text style={styles.sectionLabel}>PENDING APPROVAL</Text>
          {pending.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-done-outline" size={40} color={colors.textMuted} style={{ marginBottom: spacing.sm }} />
              <Text style={styles.emptyText}>Nothing pending — you're all caught up.</Text>
            </View>
          ) : pending.map(c => {
            const choreName = c.assigned_chores?.custom_name ?? c.assigned_chores?.chore_templates?.name ?? 'Chore';
            const xp = c.assigned_chores?.xp_value ?? 0;
            return (
              <View key={c.id} style={styles.approvalCard}>
                <View style={styles.approvalLeft}>
                  <Text style={styles.approvalName}>{choreName}</Text>
                  <Text style={styles.approvalXP}>+{xp} XP if approved</Text>
                  <Text style={styles.approvalTime}>{new Date(c.completed_at).toLocaleDateString()}</Text>
                </View>
                <View style={styles.approvalBtns}>
                  <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(c.id)}>
                    <Ionicons name="close" size={18} color={colors.red} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(c.id)}>
                    <Ionicons name="checkmark" size={18} color={colors.bg} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* ── ESCROW TAB ── */}
      {activeTab === 'escrow' && (
        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: spacing.xl }}>
          <Text style={styles.sectionLabel}>ESCROW ACCOUNT</Text>
          {escrow ? (
            <>
              <View style={styles.escrowCard}>
                <View style={styles.escrowRow}>
                  <Text style={styles.escrowLabel}>FUNDED</Text>
                  <Text style={styles.escrowValue}>${(escrow.balance_cents / 100).toFixed(2)}</Text>
                </View>
                <View style={styles.escrowRow}>
                  <Text style={styles.escrowLabel}>EARNED</Text>
                  <Text style={[styles.escrowValue, { color: colors.green }]}>${(escrow.earned_cents / 100).toFixed(2)}</Text>
                </View>
                <View style={styles.escrowRow}>
                  <Text style={styles.escrowLabel}>XP THRESHOLD</Text>
                  <Text style={styles.escrowValue}>{escrow.xp_threshold} XP</Text>
                </View>
                <View style={styles.escrowRow}>
                  <Text style={styles.escrowLabel}>VENMO</Text>
                  <Text style={styles.escrowValue}>@{escrow.venmo_handle}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.payoutBtn} onPress={handlePayout}>
                <Ionicons name="cash-outline" size={18} color={colors.bg} style={{ marginRight: 6 }} />
                <Text style={styles.payoutBtnText}>RELEASE PAYOUT</Text>
              </TouchableOpacity>
            </>
          ) : (
            <EscrowSetup kidId={selectedKid?.kid_id} onSaved={() => loadKidData(selectedKid.kid_id)} />
          )}
        </ScrollView>
      )}

      {/* Custom chore modal */}
      <Modal visible={showAddChore} transparent animationType="slide" onRequestClose={() => setShowAddChore(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowAddChore(false)}>
          <Pressable style={styles.modalSheet} onPress={e => e.stopPropagation()}>
            <Text style={styles.modalTitle}>CUSTOM CHORE</Text>
            <TextInput
              style={styles.modalInput}
              value={customChoreName}
              onChangeText={setCustomChoreName}
              placeholder="Chore name..."
              placeholderTextColor={colors.textMuted}
              autoFocus
            />
            <TextInput
              style={styles.modalInput}
              value={customXP}
              onChangeText={setCustomXP}
              placeholder="XP value (e.g. 15)"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
            />
            <TouchableOpacity style={styles.modalSaveBtn} onPress={handleAddCustomChore}>
              <Text style={styles.modalSaveBtnText}>ADD CHORE</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

    </View>
  );
}

// ── Escrow Setup Form ─────────────────────────────────────────
function EscrowSetup({ kidId, onSaved }) {
  const [balance, setBalance]       = useState('');
  const [threshold, setThreshold]   = useState('100');
  const [venmo, setVenmo]           = useState('');

  const save = async () => {
    if (!balance || !venmo.trim()) {
      Alert.alert('Missing info', 'Enter the escrow amount and Venmo handle.');
      return;
    }
    try {
      await setupEscrow({
        kidId,
        balanceCents: Math.round(parseFloat(balance) * 100),
        xpThreshold:  parseInt(threshold) || 100,
        venmoHandle:  venmo.trim().replace('@', ''),
      });
      onSaved?.();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View style={styles.setupCard}>
      <Text style={styles.setupInfo}>Set up escrow to enable Venmo payouts when your kid hits their XP goal.</Text>
      <Text style={styles.inputLabel}>MONTHLY ESCROW AMOUNT ($)</Text>
      <TextInput style={styles.setupInput} value={balance} onChangeText={setBalance} placeholder="e.g. 50" placeholderTextColor={colors.textMuted} keyboardType="decimal-pad" />
      <Text style={styles.inputLabel}>XP NEEDED TO UNLOCK PAYOUT</Text>
      <TextInput style={styles.setupInput} value={threshold} onChangeText={setThreshold} placeholder="100" placeholderTextColor={colors.textMuted} keyboardType="number-pad" />
      <Text style={styles.inputLabel}>KID'S VENMO HANDLE</Text>
      <TextInput style={styles.setupInput} value={venmo} onChangeText={setVenmo} placeholder="@username" placeholderTextColor={colors.textMuted} autoCapitalize="none" />
      <TouchableOpacity style={styles.payoutBtn} onPress={save}>
        <Text style={styles.payoutBtnText}>SET UP ESCROW</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: colors.bg },
  center:             { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  scroll:             { flex: 1, padding: spacing.md },
  kidRow:             { flexGrow: 0, padding: spacing.sm },
  kidChip:            { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm, backgroundColor: colors.card },
  kidChipActive:      { backgroundColor: colors.accent, borderColor: colors.accent },
  kidChipText:        { ...fonts.label, color: colors.textSecondary },
  tabBar:             { flexDirection: 'row', backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  tab:                { flex: 1, padding: spacing.md, alignItems: 'center' },
  tabActive:          { backgroundColor: colors.accent },
  tabText:            { ...fonts.label, color: colors.textMuted, fontSize: 11 },
  sectionLabel:       { ...fonts.label, color: colors.accent, marginBottom: spacing.sm, marginTop: spacing.sm },
  categoryLabel:      { ...fonts.label, color: colors.textMuted, marginTop: spacing.md, marginBottom: spacing.xs },
  choreRow:           { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  choreLeft:          { flex: 1 },
  choreName:          { ...fonts.subhead, fontSize: 15 },
  choreXP:            { ...fonts.body, fontSize: 12, color: colors.accent, marginTop: 2 },
  templateRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.xs },
  templateRowAssigned:{ opacity: 0.5 },
  templateName:       { ...fonts.body, color: colors.textPrimary, flex: 1 },
  templateRight:      { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  templateXP:         { ...fonts.label, color: colors.accent },
  addCustomBtn:       { flexDirection: 'row', alignItems: 'center', padding: spacing.md, marginBottom: spacing.md },
  addCustomText:      { ...fonts.label, color: colors.accent },
  approvalCard:       { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  approvalLeft:       { flex: 1 },
  approvalName:       { ...fonts.subhead, fontSize: 15 },
  approvalXP:         { ...fonts.body, fontSize: 12, color: colors.accent, marginTop: 2 },
  approvalTime:       { ...fonts.body, fontSize: 11, color: colors.textMuted, marginTop: 2 },
  approvalBtns:       { flexDirection: 'row', gap: spacing.sm },
  rejectBtn:          { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colors.red, justifyContent: 'center', alignItems: 'center' },
  approveBtn:         { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.green, justifyContent: 'center', alignItems: 'center' },
  escrowCard:         { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  escrowRow:          { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  escrowLabel:        { ...fonts.label },
  escrowValue:        { ...fonts.subhead, fontSize: 15 },
  payoutBtn:          { backgroundColor: colors.accent, borderRadius: radius.md, padding: spacing.md, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.sm },
  payoutBtnText:      { color: colors.bg, fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  emptyState:         { alignItems: 'center', paddingVertical: spacing.xl },
  emptyTitle:         { ...fonts.subhead, marginBottom: spacing.sm },
  emptyText:          { ...fonts.body, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  setupCard:          { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md },
  setupInfo:          { ...fonts.body, marginBottom: spacing.md, lineHeight: 22 },
  inputLabel:         { ...fonts.label, marginBottom: 4, marginTop: spacing.sm },
  setupInput:         { backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.md, color: colors.textPrimary, fontSize: 15, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  modalOverlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalSheet:         { backgroundColor: colors.card, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.lg },
  modalTitle:         { ...fonts.label, color: colors.accent, marginBottom: spacing.md },
  modalInput:         { backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.md, color: colors.textPrimary, fontSize: 15, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  modalSaveBtn:       { backgroundColor: colors.accent, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  modalSaveBtnText:   { color: colors.bg, fontWeight: '900', fontSize: 14, letterSpacing: 1 },
});
