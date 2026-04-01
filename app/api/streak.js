// Streak tracker — daily engagement persistence
import { supabase } from './supabase';

// Get user's current streak
export async function getStreak() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { data, error } = await supabase
      .from('profiles')
      .select('streak, last_active')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    const today = new Date().toISOString().split('T')[0];
    const lastActive = data?.last_active?.split('T')[0];

    // If last active was yesterday, streak continues
    // If today, streak is current
    // If older, streak resets
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastActive === today) return data.streak || 0;
    if (lastActive === yesterdayStr) return data.streak || 0;
    return 0; // streak broken
  } catch (e) {
    console.error('Get streak error:', e);
    return 0;
  }
}

// Mark today as active, increment streak if needed
export async function markActive() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    const { data: profile } = await supabase
      .from('profiles')
      .select('streak, last_active')
      .eq('id', user.id)
      .single();

    const lastActive = profile?.last_active?.split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = 1;
    if (lastActive === today) {
      newStreak = profile.streak || 1; // already marked today
    } else if (lastActive === yesterdayStr) {
      newStreak = (profile.streak || 0) + 1; // continue streak
    }

    await supabase
      .from('profiles')
      .update({ streak: newStreak, last_active: new Date().toISOString() })
      .eq('id', user.id);

    return newStreak;
  } catch (e) {
    console.error('Mark active error:', e);
  }
}
