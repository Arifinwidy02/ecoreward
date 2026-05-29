import { supabase } from './supabase';
import type { SmartNetbin } from '../types/models';

export async function getAllBins(): Promise<SmartNetbin[]> {
  const { data, error } = await supabase
    .from('smart_netbins')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
}

export async function getBinById(binId: string): Promise<SmartNetbin | null> {
  const { data, error } = await supabase
    .from('smart_netbins')
    .select('*')
    .eq('id', binId)
    .single();
  if (error) return null;
  return data;
}

export async function reportFullBin(userId: string, binId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title: 'Laporan Bin Penuh',
      body: 'Terima kasih telah melaporkan. Tim akan segera mengosongkan bin.',
      type: 'bin_full',
      data: { bin_id: binId },
    });
  if (error) throw error;
}

export function subscribeBins(onUpdate: (bins: SmartNetbin[]) => void) {
  const channel = supabase
    .channel('bins-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'smart_netbins' },
      async () => {
        const bins = await getAllBins();
        onUpdate(bins);
      },
    )
    .subscribe();
  return () => {
    channel.unsubscribe();
  };
}
