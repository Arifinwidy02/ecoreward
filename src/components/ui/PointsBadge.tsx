import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  points: number;
  size?: 'small' | 'large';
}

export function PointsBadge({ points, size = 'small' }: Props) {
  const isLarge = size === 'large';
  return (
    <View style={[styles.container, isLarge && styles.containerLarge]}>
      <Text style={styles.icon}>{'🌟'}</Text>
      <Text style={[styles.text, isLarge && styles.textLarge]}>
        {points.toLocaleString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  containerLarge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 24,
  },
  icon: { fontSize: 14, marginRight: 4 },
  text: { fontSize: 14, fontWeight: '700', color: '#2E7D32' },
  textLarge: { fontSize: 24 },
});
