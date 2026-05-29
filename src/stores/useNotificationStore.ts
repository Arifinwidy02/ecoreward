import { create } from 'zustand';
import type { AppNotification } from '../types/models';
import {
  getNotifications,
  markAsRead,
  getUnreadCount,
} from '../services/notificationService';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  loadNotifications: (userId: string) => Promise<void>;
  markNotificationsAsRead: (ids: string[]) => Promise<void>;
  refreshUnreadCount: (userId: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  loadNotifications: async (userId: string) => {
    set({ isLoading: true });
    const [notifications, count] = await Promise.all([
      getNotifications(userId),
      getUnreadCount(userId),
    ]);
    set({ notifications, unreadCount: count, isLoading: false });
  },

  markNotificationsAsRead: async (ids: string[]) => {
    await markAsRead(ids);
    set((state) => ({
      notifications: state.notifications.map((n) =>
        ids.includes(n.id) ? { ...n, read: true } : n,
      ),
      unreadCount: Math.max(0, state.unreadCount - ids.length),
    }));
  },

  refreshUnreadCount: async (userId: string) => {
    const count = await getUnreadCount(userId);
    set({ unreadCount: count });
  },
}));
