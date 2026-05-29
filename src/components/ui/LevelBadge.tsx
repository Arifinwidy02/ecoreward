import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  level: number;
}

export function LevelBadge({ level }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{'⬆'}</Text>
      <Text style={styles.text}>Level {level}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  icon: { fontSize: 14, marginRight: 4 },
  text: { fontSize: 14, fontWeight: '700', color: '#E65100' },
});
