import { AchievementCriteria } from '../types/models';

export function evaluateCriteria(
  criteria: AchievementCriteria,
  userStats: {
    depositCount: number;
    totalKg: number;
    currentStreak: number;
    uniqueCategoryCount: number;
    level: number;
  },
): boolean {
  switch (criteria.type) {
    case 'deposit_count':
      return userStats.depositCount >= criteria.threshold;
    case 'total_kg':
      return userStats.totalKg >= criteria.threshold;
    case 'streak_days':
      return userStats.currentStreak >= criteria.threshold;
    case 'category_count':
      return userStats.uniqueCategoryCount >= criteria.threshold;
    case 'level':
      return userStats.level >= criteria.threshold;
    default:
      return false;
  }
}

export function calculateProgress(
  criteria: AchievementCriteria,
  userStats: {
    depositCount: number;
    totalKg: number;
    currentStreak: number;
    uniqueCategoryCount: number;
    level: number;
  },
): number {
  const current = (() => {
    switch (criteria.type) {
      case 'deposit_count': return userStats.depositCount;
      case 'total_kg': return userStats.totalKg;
      case 'streak_days': return userStats.currentStreak;
      case 'category_count': return userStats.uniqueCategoryCount;
      case 'level': return userStats.level;
      default: return 0;
    }
  })();
  return Math.min(current / criteria.threshold, 1);
}
