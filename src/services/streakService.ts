import { supabase } from './supabase';
import type { UserStreak } from '../types/models';

export async function getUserStreak(userId: string): Promise<UserStreak | null> {
  const { data, error } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) return null;
  return data;
}
