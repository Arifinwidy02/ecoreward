import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PointsBadge } from '../ui/PointsBadge';
import { LevelBadge } from '../ui/LevelBadge';
import { ProgressBar } from '../achievements/ProgressBar';
import { progressToNextLevel } from '../../utils/levelCalculator';

interface Props {
  points: number;
  level: number;
}

export function PointsCard({ points, level }: Props) {
  const progress = progressToNextLevel(points);

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <PointsBadge points={points} size="large" />
        <LevelBadge level={level} />
      </View>
      <View style={styles.progressSection}>
        <Text style={styles.progressLabel}>Progress ke Level {level + 1}</Text>
        <ProgressBar progress={progress} color="#4CAF50" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  progressSection: { gap: 6 },
  progressLabel: { fontSize: 12, color: '#9E9E9E' },
});
