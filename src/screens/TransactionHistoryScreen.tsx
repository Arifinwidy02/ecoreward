import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/useAuthStore';
import { useTransactionStore } from '../stores/useTransactionStore';
import { EmptyState } from '../components/ui/EmptyState';

type FilterType = 'all' | 'deposit' | 'redemption';

export function TransactionHistoryScreen() {
  const navigation = useNavigation<any>();
  const session = useAuthStore((s) => s.session);
  const { transactions, isLoading, loadTransactions } = useTransactionStore();
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    if (session?.user?.id) {
      loadTransactions(session.user.id, filter === 'all' ? undefined : filter);
    }
  }, [session?.user?.id, filter]);

  const filters: { label: string; value: FilterType }[] = [
    { label: 'Semua', value: 'all' },
    { label: 'Deposit', value: 'deposit' },
    { label: 'Penukaran', value: 'redemption' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterBtn, filter === f.value && styles.filterActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        refreshing={isLoading}
        onRefresh={() =>
          session?.user?.id &&
          loadTransactions(session.user.id, filter === 'all' ? undefined : filter)
        }
        ListEmptyComponent={
          <EmptyState icon="receipt" title="Belum ada transaksi" subtitle="Mulai scan sampah untuk mendapatkan poin!" />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('TransactionDetail', { transactionId: item.id })}
          >
            <View>
              <Text style={[styles.points, item.points_delta > 0 ? styles.positive : styles.negative]}>
                {item.points_delta > 0 ? '+' : ''}{item.points_delta} pts
              </Text>
              <Text style={styles.type}>
                {item.type === 'deposit' ? 'Deposit Sampah' : 'Tukar Hadiah'}
              </Text>
            </View>
            <Text style={styles.date}>
              {new Date(item.created_at).toLocaleDateString('id-ID')}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  filterRow: { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: '#fff' },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F5F5F5' },
  filterActive: { backgroundColor: '#4CAF50' },
  filterText: { fontSize: 14, color: '#666' },
  filterTextActive: { color: '#fff', fontWeight: '600' },
  item: { backgroundColor: '#fff', padding: 16, marginTop: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  points: { fontSize: 16, fontWeight: '700' },
  positive: { color: '#4CAF50' },
  negative: { color: '#F44336' },
  type: { fontSize: 13, color: '#666', marginTop: 2 },
  date: { fontSize: 13, color: '#9E9E9E' },
});
