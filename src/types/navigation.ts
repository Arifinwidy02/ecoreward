import type { ClassificationResult } from './models';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
};

export type OnboardingStackParamList = {
  OnboardingSlides: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  ScanTab: undefined;
  MapTab: undefined;
  AchievementsTab: undefined;
  ProfileTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
};

export type ScanStackParamList = {
  Scan: undefined;
  ScanResult: {
    imageUri: string;
    classification: ClassificationResult;
  };
};

export type MapStackParamList = {
  Map: undefined;
  BinDetail: { binId: string };
};

export type AchievementsStackParamList = {
  Achievements: undefined;
  AchievementDetail: { achievementId: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  TransactionHistory: undefined;
  TransactionDetail: { transactionId: string };
  RewardCatalog: { fromTab?: string } | undefined;
  RewardDetail: { rewardId: string };
  Notifications: undefined;
  EditProfile: undefined;
};
