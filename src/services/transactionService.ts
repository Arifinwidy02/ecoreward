import { supabase } from './supabase';
import type { Transaction } from '../types/models';

export async function createDeposit(params: {
  userId: string;
  binId: string;
  categoryId: string;
  photoUri: string;
  weightKg: number;
  pointsEarned: number;
}): Promise<Transaction> {
  const filePath = `waste-photos/${params.userId}/${Date.now()}.jpg`;
  const blob = await fetch(params.photoUri).then((r) => r.blob());

  const { error: uploadError } = await supabase.storage
    .from('waste-photos')
    .upload(filePath, blob, { contentType: 'image/jpeg', upsert: false });
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from('waste-photos').getPublicUrl(filePath);

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: params.userId,
      bin_id: params.binId,
      category_id: params.categoryId,
      photo_url: urlData.publicUrl,
      weight_kg: params.weightKg,
      points_delta: params.pointsEarned,
      type: 'deposit',
      status: 'verified',
      verification_method: 'photo_only',
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function getTransactionsByUser(
  userId: string,
  type?: 'deposit' | 'redemption',
  limit = 20,
  offset = 0,
): Promise<Transaction[]> {
  let query = supabase
    .from('transactions')
    .select('*, category:waste_categories(*), bin:smart_netbins(*), reward:rewards(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (type) query = query.eq('type', type);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getTransactionById(transactionId: string): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, category:waste_categories(*), bin:smart_netbins(*), reward:rewards(*)')
    .eq('id', transactionId)
    .single();
  if (error) return null;
  return data;
}

export async function createRedemption(params: {
  userId: string;
  rewardId: string;
  pointsCost: number;
}): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: params.userId,
      reward_id: params.rewardId,
      points_delta: -params.pointsCost,
      type: 'redemption',
      status: 'verified',
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function getUserDepositCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('type', 'deposit')
    .eq('status', 'verified');
  if (error) throw error;
  return count ?? 0;
}

export interface CategoryWaste {
  category: string;
  kg: number;
}

export async function getWasteByCategory(userId: string): Promise<CategoryWaste[]> {
  try {
    const { data, error } = await supabase.rpc('get_user_waste_summary', { p_user_id: userId });
    if (error) throw error;
    if (!data || !Array.isArray(data)) return [];
    return data as CategoryWaste[];
  } catch (e: any) {
    console.warn('[TransactionService] getWasteByCategory failed:', e.message);
    return [];
  }
}
