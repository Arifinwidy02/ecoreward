import { supabase } from './supabase';
import type { AppNotification } from '../types/models';

export async function getNotifications(
  userId: string,
  limit = 20,
  offset = 0,
): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return data;
}

export async function markAsRead(notificationIds: string[]): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .in('id', notificationIds);
  if (error) throw error;
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);
  if (error) throw error;
  return count ?? 0;
}
