import React, { useEffect } from 'react';
import { View, SectionList, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/useAuthStore';
import { useUserStore } from '../stores/useUserStore';
import { useAchievementStore } from '../stores/useAchievementStore';
import { AchievementCard } from '../components/achievements/AchievementCard';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { EmptyState } from '../components/ui/EmptyState';

export function AchievementsScreen() {
  const navigation = useNavigation<any>();
  const session = useAuthStore((s) => s.session);
  const { profile, streak } = useUserStore();
  const { achievements, isLoading, loadAchievements } = useAchievementStore();

  useEffect(() => {
    if (session?.user?.id && profile) {
      loadAchievements(session.user.id, {
        totalKg: profile.total_waste_kg,
        currentStreak: streak?.current_streak ?? 0,
        uniqueCategoryCount: 0,
        level: profile.level,
      });
    }
  }, [session?.user?.id, profile, streak]);

  const unlocked = achievements.filter((a) => a.unlocked);
  const locked = achievements.filter((a) => !a.unlocked);

  const sections = [
    ...(unlocked.length > 0 ? [{ title: 'Terbuka', data: unlocked }] : []),
    ...(locked.length > 0 ? [{ title: 'Terkunci', data: locked }] : []),
  ];

  if (!isLoading && achievements.length === 0) {
    return <EmptyState icon="trophy-outline" title="Belum ada achievement" subtitle="Mulai scan sampah untuk membuka achievement!" />;
  }

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={isLoading} />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <AchievementCard
            achievement={item}
            onPress={() => navigation.navigate('AchievementDetail', { achievementId: item.id })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  listContent: { paddingVertical: 8 },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#757575',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
  },
});
