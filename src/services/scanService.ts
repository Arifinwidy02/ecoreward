import {supabase} from './supabase';
import RNFS from 'react-native-fs';
import {DepositIntent} from '../types/models';

export interface SubmitScanParams {
  userId: string;
  binId: string;
  category: string;
  confidence: number;
  pointsEarned: number;
  weightKg: number;
  photoUri: string;
}

export interface SubmitScanResult {
  transactionId: string;
  pointsEarned: number;
  balanceBefore: number;
  balanceAfter: number;
}

export interface CreateDepositIntentParams {
  userId: string;
  binId: string;
  categoryId: string;
  estimatedWeightKg: number;
  maxExpectedWeightKg: number;
  photoUri: string;
}

async function tryUploadPhoto(
  userId: string,
  photoUri: string,
): Promise<string | null> {
  try {
    const actualPath = photoUri.startsWith('file://')
      ? photoUri.slice(7)
      : photoUri;
    const filePath = `waste-photos/${userId}/${Date.now()}.jpg`;
    const base64 = await RNFS.readFile(actualPath, 'base64');
    const bytes = base64ToBytes(base64);
    const {error} = await supabase.storage
      .from('waste-photos')
      .upload(filePath, bytes as any, {
        contentType: 'image/jpeg',
        upsert: false,
      });
    if (error) throw error;
    const {data: urlData} = supabase.storage
      .from('waste-photos')
      .getPublicUrl(filePath);
    console.log('[ScanService] Photo uploaded:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (e: any) {
    console.warn('[ScanService] Photo upload skipped:', e.message);
    return null;
  }
}

function base64ToBytes(base64: string): Uint8Array {
  const binaryStr = global.atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}

export async function createDepositIntent(
  params: CreateDepositIntentParams,
): Promise<DepositIntent> {
  const photoUrl = await tryUploadPhoto(params.userId, params.photoUri);

  const {data, error} = await supabase
    .from('deposit_intents')
    .insert({
      user_id: params.userId,
      bin_id: params.binId,
      category_id: params.categoryId,
      photo_url: photoUrl,
      estimated_weight_kg: params.estimatedWeightKg,
      max_expected_weight_kg: params.maxExpectedWeightKg,
      status: 'pending',
    })
    .select('*')
    .single();

  if (error) throw error;
  console.log('[ScanService] Deposit intent created:', data.id);
  return data as DepositIntent;
}

export async function pollDepositIntent(
  intentId: string,
): Promise<DepositIntent> {
  const {data, error} = await supabase
    .from('deposit_intents')
    .select('*')
    .eq('id', intentId)
    .single();

  if (error) throw error;
  return data as DepositIntent;
}

export async function cancelDepositIntent(intentId: string): Promise<void> {
  const {error} = await supabase
    .from('deposit_intents')
    .update({status: 'cancelled'})
    .eq('id', intentId);

  if (error) throw error;
}

export async function submitScan(
  params: SubmitScanParams,
): Promise<SubmitScanResult> {
  console.log('[ScanService] ======== submitScan START ========');

  const photoUrl = await tryUploadPhoto(params.userId, params.photoUri);

  try {
    console.log('[ScanService] Trying submit_scan RPC...');
    const {data, error} = await supabase.rpc('submit_scan', {
      p_user_id: params.userId,
      p_category: params.category,
      p_confidence: params.confidence,
      p_points_earned: params.pointsEarned,
      p_weight_kg: params.weightKg,
      p_photo_url: photoUrl,
      p_bin_id: params.binId || null,
      p_category_id: null,
    });

    if (error) throw error;

    const result = data as Record<string, unknown>;
    console.log('[ScanService] RPC success:', JSON.stringify(result));
    console.log('[ScanService] ======== submitScan SUCCESS (RPC) ========');
    return {
      transactionId: result.transaction_id as string,
      pointsEarned: result.points_earned as number,
      balanceBefore: result.balance_before as number,
      balanceAfter: result.balance_after as number,
    };
  } catch (rpcErr: any) {
    console.error('[ScanService] submit_scan FAILED:', rpcErr.message);
    throw rpcErr;
  }
}
