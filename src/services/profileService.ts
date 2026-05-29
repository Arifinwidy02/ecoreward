import { supabase } from './supabase';
import type { Profile } from '../types/models';

export async function getProfile(userId: string): Promise<Profile | null> {
  // Try RPC first (SECURITY DEFINER, bypasses RLS)
  try {
    const { data, error } = await supabase.rpc('get_user_profile', { p_user_id: userId });
    if (!error && data) {
      console.log('[ProfileService] getProfile via RPC:', data.eco_points, 'points');
      return data as Profile;
    }
    if (error) {
      console.warn('[ProfileService] RPC get_user_profile failed:', error.message);
    }
  } catch (e: any) {
    console.warn('[ProfileService] RPC get_user_profile exception:', e.message);
  }

  // Fallback: direct query
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('[ProfileService] Direct query error:', error.code, error.message);
    return null;
  }

  if (!data) {
    console.warn('[ProfileService] No profile found for user:', userId);
    return null;
  }

  console.log('[ProfileService] getProfile via direct query:', data.eco_points, 'points');
  return data;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'full_name' | 'avatar_url'>>,
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;
}

export async function addUserPoints(
  userId: string,
  points: number,
  weightKg: number,
): Promise<void> {
  const profile = await getProfile(userId);
  if (!profile) throw new Error('Profile not found');

  const currentBalance = profile.points_balance ?? profile.eco_points;
  const newBalance = currentBalance + points;
  const newWeight = profile.total_waste_kg + weightKg;
  const newLevel = Math.floor(Math.sqrt(newBalance / 100)) + 1;

  const { error } = await supabase
    .from('profiles')
    .update({
      eco_points: newBalance,
      points_balance: newBalance,
      total_waste_kg: newWeight,
      level: newLevel,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
  if (error) throw error;
}

export function subscribeProfile(userId: string, onUpdate: (profile: Profile) => void) {
  const channel = supabase
    .channel(`profile-${userId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
      (payload) => onUpdate(payload.new as Profile),
    )
    .subscribe();
  return () => {
    channel.unsubscribe();
  };
}
