import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { BottomNavBar } from '../components/ui/BottomNavBar';
import {
  MapStackParamList,
  ScanStackParamList,
  AchievementsStackParamList,
  ProfileStackParamList,
} from '../types/navigation';

// Real screen imports
import { MapScreen } from '../screens/MapScreen';
import { BinDetailScreen } from '../screens/BinDetailScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { ScanResultScreen } from '../screens/ScanResultScreen';
import { AchievementsScreen } from '../screens/AchievementsScreen';
import { AchievementDetailScreen } from '../screens/AchievementDetailScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { TransactionHistoryScreen } from '../screens/TransactionHistoryScreen';
import { TransactionDetailScreen } from '../screens/TransactionDetailScreen';
import { RewardCatalogScreen } from '../screens/RewardCatalogScreen';
import { RewardDetailScreen } from '../screens/RewardDetailScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';

const MapStack = createStackNavigator<MapStackParamList>();
const ScanStack = createStackNavigator<ScanStackParamList>();
const AchievementsStack = createStackNavigator<AchievementsStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

function MapStackNavigator() {
  return (
    <MapStack.Navigator>
      <MapStack.Screen name="Map" component={MapScreen} options={{ headerShown: false }} />
      <MapStack.Screen name="BinDetail" component={BinDetailScreen} options={{ title: 'Detail Bin' }} />
    </MapStack.Navigator>
  );
}

function ScanStackNavigator() {
  return (
    <ScanStack.Navigator>
      <ScanStack.Screen name="Scan" component={ScanScreen} options={{ headerShown: false }} />
      <ScanStack.Screen name="ScanResult" component={ScanResultScreen} options={{ title: 'Hasil Scan' }} />
    </ScanStack.Navigator>
  );
}

function AchievementsStackNavigator() {
  return (
    <AchievementsStack.Navigator>
      <AchievementsStack.Screen name="Achievements" component={AchievementsScreen} options={{ headerShown: false }} />
      <AchievementsStack.Screen name="AchievementDetail" component={AchievementDetailScreen} options={{ title: 'Detail Achievement' }} />
    </AchievementsStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="TransactionHistory" component={TransactionHistoryScreen} options={{ title: 'Riwayat Transaksi' }} />
      <ProfileStack.Screen name="TransactionDetail" component={TransactionDetailScreen} options={{ title: 'Detail Transaksi' }} />
      <ProfileStack.Screen name="RewardCatalog" component={RewardCatalogScreen} options={{ title: 'Katalog Hadiah' }} />
      <ProfileStack.Screen name="RewardDetail" component={RewardDetailScreen} options={{ title: 'Detail Hadiah' }} />
      <ProfileStack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifikasi' }} />
    </ProfileStack.Navigator>
  );
}

export { MapStackNavigator, ScanStackNavigator, AchievementsStackNavigator, ProfileStackNavigator };

export function MainNavigator() {
  return <BottomNavBar />;
}
