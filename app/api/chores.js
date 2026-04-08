// chores.js — Chore management API
// Handles assigned chores, completions, escrow, and payouts

import { supabase } from './supabase';

// ── CHORE TEMPLATES ──────────────────────────────────────────

export async function getChoreTemplates() {
  const { data, error } = await supabase
    .from('chore_templates')
    .select('*')
    .order('category')
    .order('name');
  if (error) throw error;
  return data;
}

// ── FAMILY LINK ──────────────────────────────────────────────

export async function linkKid(kidEmail) {
  // Find kid's user id by email via profiles table
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', kidEmail)
    .single();
  if (error || !profile) throw new Error('No account found for that email.');

  const { data: { user } } = await supabase.auth.getUser();

  const { error: linkError } = await supabase
    .from('family_links')
    .insert({ parent_id: user.id, kid_id: profile.id });
  if (linkError) throw linkError;

  return profile.id;
}

export async function getLinkedKids() {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('family_links')
    .select('kid_id, profiles!family_links_kid_id_fkey(name, email)')
    .eq('parent_id', user.id);
  if (error) throw error;
  return data;
}

export async function getLinkedParent() {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('family_links')
    .select('parent_id, profiles!family_links_parent_id_fkey(name, email)')
    .eq('kid_id', user.id)
    .single();
  if (error) return null;
  return data;
}

// ── ASSIGNED CHORES ──────────────────────────────────────────

export async function assignChore({ kidId, templateId, customName, xpValue, frequency }) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('assigned_chores')
    .insert({
      parent_id:   user.id,
      kid_id:      kidId,
      template_id: templateId ?? null,
      custom_name: customName ?? null,
      xp_value:    xpValue,
      frequency,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getAssignedChores(kidId) {
  const { data, error } = await supabase
    .from('assigned_chores')
    .select('*, chore_templates(name, category)')
    .eq('kid_id', kidId)
    .eq('is_active', true)
    .order('created_at');
  if (error) throw error;
  return data.map(c => ({
    ...c,
    displayName: c.custom_name ?? c.chore_templates?.name ?? 'Chore',
    category:    c.chore_templates?.category ?? 'custom',
  }));
}

export async function removeChore(choreId) {
  const { error } = await supabase
    .from('assigned_chores')
    .update({ is_active: false })
    .eq('id', choreId);
  if (error) throw error;
}

// ── CHORE COMPLETIONS ────────────────────────────────────────

export async function submitChoreCompletion(choreId) {
  const { data: { user } } = await supabase.auth.getUser();

  // Get chore details
  const { data: chore } = await supabase
    .from('assigned_chores')
    .select('parent_id, xp_value')
    .eq('id', choreId)
    .single();

  const { data, error } = await supabase
    .from('chore_completions')
    .insert({
      chore_id:  choreId,
      kid_id:    user.id,
      parent_id: chore.parent_id,
      status:    'pending',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getPendingCompletions(kidId) {
  // For parent — see what kid has submitted
  const { data, error } = await supabase
    .from('chore_completions')
    .select('*, assigned_chores(custom_name, xp_value, chore_templates(name))')
    .eq('kid_id', kidId)
    .eq('status', 'pending')
    .order('completed_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function approveChoreCompletion(completionId) {
  // Parent approves → kid gets XP
  const { data: completion } = await supabase
    .from('chore_completions')
    .select('kid_id, assigned_chores(xp_value)')
    .eq('id', completionId)
    .single();

  const xp = completion.assigned_chores.xp_value;

  // Update completion
  await supabase
    .from('chore_completions')
    .update({ status: 'approved', xp_awarded: xp, reviewed_at: new Date() })
    .eq('id', completionId);

  // Award XP to kid's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('xp')
    .eq('id', completion.kid_id)
    .single();

  await supabase
    .from('profiles')
    .update({ xp: (profile.xp ?? 0) + xp })
    .eq('id', completion.kid_id);

  return xp;
}

export async function rejectChoreCompletion(completionId) {
  await supabase
    .from('chore_completions')
    .update({ status: 'rejected', reviewed_at: new Date() })
    .eq('id', completionId);
}

// ── ESCROW ───────────────────────────────────────────────────

export async function getEscrow(kidId) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('escrow_accounts')
    .select('*')
    .eq('parent_id', user.id)
    .eq('kid_id', kidId)
    .single();
  if (error) return null;
  return data;
}

export async function getMyEscrow() {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('escrow_accounts')
    .select('*')
    .eq('kid_id', user.id)
    .single();
  if (error) return null;
  return data;
}

export async function setupEscrow({ kidId, balanceCents, xpThreshold, venmoHandle }) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('escrow_accounts')
    .upsert({
      parent_id:      user.id,
      kid_id:         kidId,
      balance_cents:  balanceCents,
      xp_threshold:   xpThreshold,
      venmo_handle:   venmoHandle,
      payout_method:  'venmo',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── PAYOUTS ──────────────────────────────────────────────────

export async function requestPayout(kidId) {
  const { data: { user } } = await supabase.auth.getUser();

  const escrow = await getEscrow(kidId);
  if (!escrow) throw new Error('No escrow account found.');

  const { data: profile } = await supabase
    .from('profiles')
    .select('xp')
    .eq('id', kidId)
    .single();

  if ((profile.xp ?? 0) < escrow.xp_threshold) {
    throw new Error(`Kid needs ${escrow.xp_threshold} XP to unlock payout. Current: ${profile.xp ?? 0}`);
  }

  const amount = Math.min(escrow.earned_cents, escrow.balance_cents);
  if (amount <= 0) throw new Error('No funds available to release.');

  const { data, error } = await supabase
    .from('payouts')
    .insert({
      escrow_id:    escrow.id,
      parent_id:    user.id,
      kid_id:       kidId,
      amount_cents: amount,
      xp_at_payout: profile.xp,
      status:       'pending',
    })
    .select()
    .single();
  if (error) throw error;
  return { ...data, venmoHandle: escrow.venmo_handle };
}
