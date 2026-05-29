import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons as Icon } from '../ui/Icon';
import { Achievement } from '../../types/models';
import { ProgressBar } from './ProgressBar';

interface Props {
  achievement: Achievement;
  onPress: () => void;
}

export function AchievementCard({ achievement, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, achievement.unlocked && styles.unlockedCard]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, achievement.unlocked && styles.iconUnlocked]}>
        <Icon
          name={achievement.icon_name || 'trophy'}
          size={28}
          color={achievement.unlocked ? '#2E7D32' : '#BDBDBD'}
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{achievement.name}</Text>
        <Text style={styles.desc} numberOfLines={2}>
          {achievement.description}
        </Text>
        {!achievement.unlocked && (
          <View style={styles.progressSection}>
            <ProgressBar progress={achievement.progress} color="#4CAF50" height={6} />
            <Text style={styles.progressText}>
              {Math.round(achievement.progress * 100)}%
            </Text>
          </View>
        )}
        {achievement.unlocked && (
          <View style={styles.unlockedBadge}>
            <Icon name="check-circle" size={14} color="#2E7D32" />
            <Text style={styles.unlockedText}>
              {achievement.unlocked_at
                ? new Date(achievement.unlocked_at).toLocaleDateString('id-ID')
                : 'Terbuka'}
            </Text>
          </View>
        )}
      </View>
      <Icon name="chevron-right" size={20} color="#BDBDBD" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    gap: 12,
    opacity: 0.6,
  },
  unlockedCard: { opacity: 1 },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconUnlocked: { backgroundColor: '#E8F5E9' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#333' },
  desc: { fontSize: 12, color: '#757575', marginTop: 2 },
  progressSection: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  progressText: { fontSize: 11, color: '#9E9E9E', width: 36, textAlign: 'right' },
  unlockedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  unlockedText: { fontSize: 12, color: '#2E7D32', fontWeight: '600' },
});
