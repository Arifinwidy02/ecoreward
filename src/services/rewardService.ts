import { supabase } from './supabase';
import type { Reward } from '../types/models';

export async function getAllRewards(): Promise<Reward[]> {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('is_active', true)
    .order('points_cost');
  if (error) throw error;
  return data;
}

export async function getRewardById(rewardId: string): Promise<Reward | null> {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('id', rewardId)
    .single();
  if (error) return null;
  return data;
}
