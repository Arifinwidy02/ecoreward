import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons as Icon } from '../components/ui/Icon';
import { useRoute, RouteProp } from '@react-navigation/native';
import { AchievementsStackParamList } from '../types/navigation';
import { Achievement } from '../types/models';
import { useAuthStore } from '../stores/useAuthStore';
import { useUserStore } from '../stores/useUserStore';
import { useAchievementStore } from '../stores/useAchievementStore';
import { ProgressBar } from '../components/achievements/ProgressBar';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';

type RouteParams = RouteProp<AchievementsStackParamList, 'AchievementDetail'>;

const CRITERIA_LABELS: Record<string, string> = {
  deposit_count: 'Jumlah deposit',
  total_kg: 'Total kilogram sampah',
  streak_days: 'Hari berturut-turut',
  category_count: 'Kategori unik',
  level: 'Level',
};

export function AchievementDetailScreen() {
  const route = useRoute<RouteParams>();
  const session = useAuthStore((s) => s.session);
  const { profile, streak } = useUserStore();
  const { achievements, isLoading, loadAchievements } = useAchievementStore();

  const [achievement, setAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    if (session?.user?.id && profile) {
      loadAchievements(session.user.id, {
        totalKg: profile.total_waste_kg,
        currentStreak: streak?.current_streak ?? 0,
        uniqueCategoryCount: 0,
        level: profile.level,
      }).then(() => {
        // get fresh achievements after load
      });
    }
  }, [session?.user?.id, profile, streak]);

  useEffect(() => {
    const found = achievements.find((a) => a.id === route.params.achievementId);
    setAchievement(found || null);
  }, [achievements, route.params.achievementId]);

  if (isLoading || !achievement) {
    return <LoadingOverlay visible={isLoading || !achievement} />;
  }

  const criteriaLabel = CRITERIA_LABELS[achievement.criteria.type] || achievement.criteria.type;
  const currentValue = Math.round(achievement.progress * achievement.criteria.threshold);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, achievement.unlocked && styles.iconUnlocked]}>
          <Icon
            name={achievement.icon_name || 'trophy'}
            size={64}
            color={achievement.unlocked ? '#2E7D32' : '#BDBDBD'}
          />
        </View>
        <Text style={styles.name}>{achievement.name}</Text>
        <Text style={styles.desc}>{achievement.description}</Text>

        {achievement.unlocked && (
          <View style={styles.unlockedBanner}>
            <Icon name="check-circle" size={20} color="#2E7D32" />
            <Text style={styles.unlockedBannerText}>
              Terbuka pada {achievement.unlocked_at
                ? new Date(achievement.unlocked_at).toLocaleDateString('id-ID')
                : ''}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.criteriaTitle}>Kriteria</Text>
        <Text style={styles.criteriaText}>
          {criteriaLabel}: {currentValue} / {achievement.criteria.threshold}
        </Text>
        <ProgressBar progress={achievement.progress} color="#4CAF50" height={12} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { alignItems: 'center', padding: 32, backgroundColor: '#fff' },
  iconContainer: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  iconUnlocked: { backgroundColor: '#E8F5E9' },
  name: { fontSize: 22, fontWeight: '700', color: '#333', marginBottom: 8, textAlign: 'center' },
  desc: { fontSize: 14, color: '#757575', textAlign: 'center', lineHeight: 20 },
  unlockedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#E8F5E9', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 16,
  },
  unlockedBannerText: { fontSize: 14, color: '#2E7D32', fontWeight: '600' },
  card: { backgroundColor: '#fff', padding: 20, margin: 12, borderRadius: 12 },
  criteriaTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  criteriaText: { fontSize: 14, color: '#666', marginBottom: 12 },
});
