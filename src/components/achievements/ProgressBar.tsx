import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  progress: number;
  color?: string;
  height?: number;
}

export function ProgressBar({ progress, color = '#4CAF50', height = 8 }: Props) {
  const clamped = Math.min(Math.max(progress, 0), 1);
  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clamped * 100}%`,
            backgroundColor: color,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { backgroundColor: '#E0E0E0', overflow: 'hidden' },
  fill: { height: '100%' },
});
