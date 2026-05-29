import { create } from 'zustand';
import type { Profile, UserStreak } from '../types/models';
import { getProfile, subscribeProfile } from '../services/profileService';
import { getUserStreak } from '../services/streakService';

interface UserState {
  profile: Profile | null;
  streak: UserStreak | null;
  isLoading: boolean;
  loadProfile: (userId: string) => Promise<void>;
  subscribeToProfile: (userId: string) => () => void;
  refreshStreak: (userId: string) => Promise<void>;
  addPointsLocal: (points: number, weightKg: number) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  streak: null,
  isLoading: false,

  loadProfile: async (userId: string) => {
    console.log('[UserStore] loadProfile called for:', userId);
    set({ isLoading: true });
    const [profile, streak] = await Promise.all([
      getProfile(userId),
      getUserStreak(userId),
    ]);
    console.log('[UserStore] Profile loaded:', profile?.eco_points, 'points, level:', profile?.level);
    set({ profile, streak, isLoading: false });
  },

  subscribeToProfile: (userId: string) => {
    return subscribeProfile(userId, (profile) => {
      set({ profile });
    });
  },

  refreshStreak: async (userId: string) => {
    const streak = await getUserStreak(userId);
    set({ streak });
  },

  addPointsLocal: (points: number, weightKg: number) => {
    const { profile } = get();
    if (!profile) return;
    const currentBalance = profile.points_balance ?? profile.eco_points;
    const newBalance = currentBalance + points;
    set({
      profile: {
        ...profile,
        eco_points: newBalance,
        points_balance: newBalance,
        total_waste_kg: profile.total_waste_kg + weightKg,
        level: Math.floor(Math.sqrt(newBalance / 100)) + 1,
      },
    });
  },
}));
