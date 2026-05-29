export enum WasteCategoryName {
  ORGANIC = 'organic',
  PLASTIC = 'plastic',
  METAL = 'metal',
  GLASS = 'glass',
  PAPER = 'paper',
  INORGANIC = 'inorganic',
  HAZARDOUS = 'hazardous',
}

export enum BinStatus {
  AVAILABLE = 'available',
  ALMOST_FULL = 'almost_full',
  FULL = 'full',
  MAINTENANCE = 'maintenance',
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  REDEMPTION = 'redemption',
}

export enum TransactionStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum VerificationMethod {
  PHOTO_ONLY = 'photo_only',
  SENSOR_CROSSCHECK = 'sensor_crosscheck',
}

export enum RewardType {
  MONEY = 'money',
  VOUCHER = 'voucher',
  GROCERIES = 'groceries',
  SEED = 'seed',
  FERTILIZER = 'fertilizer',
  OTHER = 'other',
}

export enum NotificationType {
  BIN_FULL = 'bin_full',
  WASTE_PROCESSED = 'waste_processed',
  REWARD_RECEIVED = 'reward_received',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  SYSTEM = 'system',
}
