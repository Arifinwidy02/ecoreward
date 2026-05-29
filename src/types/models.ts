import { BinStatus, TransactionStatus, TransactionType, VerificationMethod, RewardType, NotificationType, WasteCategoryName } from './enums';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  eco_points: number;
  points_balance: number;
  total_waste_kg: number;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface WasteCategory {
  id: string;
  name: WasteCategoryName;
  points_per_kg: number;
  estimated_avg_weight_kg: number | null;
  icon_name: string | null;
  created_at: string;
}

export interface SmartNetbin {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  capacity_percent: number;
  status: BinStatus;
  address: string | null;
  last_updated: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  bin_id: string | null;
  category_id: string | null;
  photo_url: string | null;
  weight_kg: number | null;
  points_delta: number;
  type: TransactionType;
  reward_id: string | null;
  status: TransactionStatus;
  verification_method: VerificationMethod;
  created_at: string;
  category?: WasteCategory;
  bin?: SmartNetbin;
  reward?: Reward;
}

export interface Achievement {
  id: string;
  name: string;
  description: string | null;
  icon_name: string | null;
  criteria: AchievementCriteria;
  created_at: string;
  unlocked: boolean;
  unlocked_at?: string;
  progress: number;
}

export interface AchievementCriteria {
  type: 'deposit_count' | 'total_kg' | 'streak_days' | 'category_count' | 'level';
  threshold: number;
  category_id?: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string | null;
  points_cost: number;
  type: RewardType;
  stock: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  type: NotificationType;
  read: boolean;
  data: Record<string, unknown> | null;
  created_at: string;
}

export interface UserStreak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_deposit_date: string | null;
  updated_at: string;
}

export interface ClassificationResult {
  category: WasteCategoryName;
  confidence: number;
  estimatedPoints: number;
  estimatedWeightKg: number;
  allProbabilities: Record<WasteCategoryName, number>;
}
