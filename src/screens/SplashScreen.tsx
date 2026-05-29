import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SPLASH_DURATION_MS } from '../utils/constants';

interface Props {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: Props) {
  useEffect(() => {
    const timer = setTimeout(onFinish, SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>{'♻'}</Text>
      <Text style={styles.title}>EcoReward</Text>
      <Text style={styles.subtitle}>Waste to Wealth</Text>
      <ActivityIndicator size="small" color="#4CAF50" style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  logo: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: '800', color: '#2E7D32' },
  subtitle: { fontSize: 16, color: '#66BB6A', marginTop: 4 },
  spinner: { marginTop: 32 },
});
