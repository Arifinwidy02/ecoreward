import { supabase } from './supabase';
import type { Achievement } from '../types/models';

export async function getAllAchievements(): Promise<
  Pick<Achievement, 'id' | 'name' | 'description' | 'icon_name' | 'criteria' | 'created_at'>[]
> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('created_at');
  if (error) throw error;
  return data;
}

export async function getUserAchievements(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);
  if (error) throw error;
  return data.map((d) => d.achievement_id);
}
