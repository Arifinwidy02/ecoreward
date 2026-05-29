import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

interface Props {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message }: Props) {
  if (!visible) return null;
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color="#4CAF50" />
        {message ? <Text style={styles.text}>{message}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  text: { fontSize: 14, color: '#666', marginTop: 8 },
});
