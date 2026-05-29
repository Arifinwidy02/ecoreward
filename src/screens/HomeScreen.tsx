import React, {useEffect, useCallback, useState} from 'react';
import {View, ScrollView, Text, StyleSheet, RefreshControl} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {useAuthStore} from '../stores/useAuthStore';
import {useUserStore} from '../stores/useUserStore';
import {PointsCard} from '../components/home/PointsCard';
import {WasteChart} from '../components/home/WasteChart';
import {QuickActionButtons} from '../components/home/QuickActionButtons';
import {LoadingOverlay} from '../components/ui/LoadingOverlay';
import {getWasteByCategory, type CategoryWaste} from '../services/transactionService';
import {WASTE_CATEGORY_COLORS} from '../utils/constants';

const WASTE_NAME_MAP: Record<string, string> = {
  organic: 'Organik',
  plastic: 'Plastik',
  metal: 'Logam',
  glass: 'Kaca',
  paper: 'Kertas',
  inorganic: 'Anorganik',
  hazardous: 'B3',
};

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const session = useAuthStore(s => s.session);
  const {profile, isLoading, loadProfile, subscribeToProfile} = useUserStore();
  const [wasteCategories, setWasteCategories] = useState<CategoryWaste[]>([]);

  const userId = session?.user?.id;

  useEffect(() => {
    if (userId) {
      const unsub = subscribeToProfile(userId);
      return unsub;
    }
  }, [userId]);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    await loadProfile(userId);
    const data = await getWasteByCategory(userId);
    setWasteCategories(data);
  }, [userId, loadProfile]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  const realMap = new Map(wasteCategories.map(w => [w.category, w.kg]));

  const chartCategories = Object.entries(WASTE_CATEGORY_COLORS).map(([key, color]) => ({
    name: WASTE_NAME_MAP[key] || key,
    kg: realMap.get(key) ?? 0,
    color,
  }));

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchData}
          />
        }>
        <Text style={styles.greeting}>
          Halo, {profile?.full_name || 'Eco Warrior'}!
        </Text>
        <PointsCard
          points={profile?.points_balance ?? profile?.eco_points ?? 0}
          level={profile?.level ?? 1}
        />
        <WasteChart
          totalKg={profile?.total_waste_kg ?? 0}
          categories={chartCategories}
        />
        <QuickActionButtons />
        <View style={{height: 24}} />
      </ScrollView>
      <LoadingOverlay visible={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F5F5'},
  greeting: {fontSize: 20, fontWeight: '700', color: '#333', padding: 16},
});
