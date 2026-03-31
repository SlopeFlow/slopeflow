// Auth helpers — sign up, sign in, sign out, save profile
import { supabase } from './supabase';

// ─── Sign up with email + password ───────────────────────────────────────────
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

// ─── Sign in ──────────────────────────────────────────────────────────────────
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// ─── Sign out ─────────────────────────────────────────────────────────────────
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ─── Get current session ──────────────────────────────────────────────────────
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ─── Save onboarding profile ──────────────────────────────────────────────────
export async function saveProfile({ name, age, experience, interests }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id:         user.id,
      name,
      age:        parseInt(age),
      experience,
      interests,
      updated_at: new Date().toISOString(),
    });
  if (error) throw error;
}

// ─── Get profile ──────────────────────────────────────────────────────────────
export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  if (error) throw error;
  return data;
}

// ─── Update XP + streak ───────────────────────────────────────────────────────
export async function addXP(amount = 10) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase
    .from('profiles')
    .select('xp, streak')
    .eq('id', user.id)
    .single();

  await supabase
    .from('profiles')
    .update({ xp: (profile?.xp ?? 0) + amount })
    .eq('id', user.id);
}
