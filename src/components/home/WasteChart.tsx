import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CategoryData {
  name: string;
  kg: number;
  color: string;
}

interface Props {
  totalKg: number;
  categories: CategoryData[];
}

export function WasteChart({ totalKg, categories }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Total Sampah Dipilah</Text>
      <Text style={styles.total}>{totalKg.toFixed(1)} kg</Text>
      <View style={styles.bars}>
        {categories.map((cat) => (
          <View key={cat.name} style={styles.barRow}>
            <View
              style={[
                styles.bar,
                {
                  flex: cat.kg / (totalKg || 1),
                  backgroundColor: cat.color,
                },
              ]}
            />
            <Text style={styles.label}>{cat.name}</Text>
            <Text style={styles.value}>{cat.kg.toFixed(1)} kg</Text>
          </View>
        ))}
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
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  total: { fontSize: 28, fontWeight: '800', color: '#2E7D32', marginBottom: 16 },
  bars: { gap: 8 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bar: { height: 12, borderRadius: 6, minWidth: 4 },
  label: { fontSize: 12, color: '#666', width: 70 },
  value: { fontSize: 12, fontWeight: '600', color: '#333' },
});
