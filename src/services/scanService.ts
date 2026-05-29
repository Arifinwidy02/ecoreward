import { supabase } from './supabase';
import RNFS from 'react-native-fs';

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

async function tryUploadPhoto(userId: string, photoUri: string): Promise<string | null> {
  try {
    const actualPath = photoUri.startsWith('file://') ? photoUri.slice(7) : photoUri;
    const filePath = `waste-photos/${userId}/${Date.now()}.jpg`;
    const base64 = await RNFS.readFile(actualPath, 'base64');
    const bytes = base64ToBytes(base64);
    const { error } = await supabase.storage
      .from('waste-photos')
      .upload(filePath, bytes as any, { contentType: 'image/jpeg', upsert: false });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('waste-photos').getPublicUrl(filePath);
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

export async function submitScan(params: SubmitScanParams): Promise<SubmitScanResult> {
  console.log('[ScanService] ======== submitScan START ========');

  const photoUrl = await tryUploadPhoto(params.userId, params.photoUri);

  // RPC handles waste_categories upsert internally — no need to lookup category_id
  try {
    console.log('[ScanService] Trying submit_scan RPC...');
    const { data, error } = await supabase.rpc('submit_scan', {
      p_user_id: params.userId,
      p_category: params.category,
      p_confidence: params.confidence,
      p_points_earned: params.pointsEarned,
      p_weight_kg: params.weightKg,
      p_photo_url: photoUrl,
      p_bin_id: null,
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
