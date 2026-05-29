import { create } from 'zustand';
import type { Achievement } from '../types/models';
import { getAllAchievements, getUserAchievements } from '../services/achievementService';
import { calculateProgress } from '../utils/achievementChecker';
import { getUserDepositCount } from '../services/transactionService';

interface AchievementState {
  achievements: Achievement[];
  isLoading: boolean;
  loadAchievements: (
    userId: string,
    userStats: {
      totalKg: number;
      currentStreak: number;
      uniqueCategoryCount: number;
      level: number;
    },
  ) => Promise<void>;
}

export const useAchievementStore = create<AchievementState>((set) => ({
  achievements: [],
  isLoading: false,

  loadAchievements: async (userId, userStats) => {
    set({ isLoading: true });
    const [allAchievements, unlockedIds, depositCount] = await Promise.all([
      getAllAchievements(),
      getUserAchievements(userId),
      getUserDepositCount(userId),
    ]);

    const stats = { ...userStats, depositCount };

    const achievements: Achievement[] = allAchievements.map((a) => {
      const unlocked = unlockedIds.includes(a.id);
      return {
        ...a,
        criteria: a.criteria as Achievement['criteria'],
        unlocked,
        progress: unlocked ? 1 : calculateProgress(a.criteria as Achievement['criteria'], stats),
      };
    });

    set({ achievements, isLoading: false });
  },
}));
