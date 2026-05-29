import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { ProfileStackParamList } from '../types/navigation';
import { Transaction } from '../types/models';
import { getTransactionById } from '../services/transactionService';
import { CategoryIcon } from '../components/ui/CategoryIcon';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';

type RouteParams = RouteProp<ProfileStackParamList, 'TransactionDetail'>;

export function TransactionDetailScreen() {
  const route = useRoute<RouteParams>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransactionById(route.params.transactionId).then((t) => {
      setTransaction(t);
      setLoading(false);
    });
  }, [route.params.transactionId]);

  if (loading) return <LoadingOverlay visible />;
  if (!transaction) return <Text style={{ padding: 20, color: '#666' }}>Transaksi tidak ditemukan</Text>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={[styles.points, transaction.points_delta > 0 ? styles.positive : styles.negative]}>
          {transaction.points_delta > 0 ? '+' : ''}{transaction.points_delta} Eco-Points
        </Text>
        <Text style={styles.type}>
          {transaction.type === 'deposit' ? 'Deposit Sampah' : 'Penukaran Hadiah'}
        </Text>
        <Text style={styles.status}>
          Status: {transaction.status === 'verified' ? 'Terverifikasi' : transaction.status === 'pending' ? 'Menunggu' : 'Ditolak'}
        </Text>
        <Text style={styles.date}>{new Date(transaction.created_at).toLocaleString('id-ID')}</Text>
      </View>

      {transaction.type === 'deposit' && transaction.category && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Detail Sampah</Text>
          <View style={styles.row}>
            <CategoryIcon category={transaction.category.name} />
            <View>
              <Text style={styles.categoryName}>{transaction.category.name}</Text>
              <Text style={styles.weight}>{transaction.weight_kg} kg</Text>
            </View>
          </View>
          {transaction.photo_url ? (
            <Image source={{ uri: transaction.photo_url }} style={styles.photo} />
          ) : null}
        </View>
      )}

      {transaction.type === 'redemption' && transaction.reward && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Hadiah Ditukar</Text>
          <Text style={styles.rewardName}>{transaction.reward.name}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  card: { backgroundColor: '#fff', padding: 20, margin: 12, borderRadius: 12 },
  points: { fontSize: 28, fontWeight: '800' },
  positive: { color: '#4CAF50' },
  negative: { color: '#F44336' },
  type: { fontSize: 16, color: '#333', marginTop: 4 },
  status: { fontSize: 14, color: '#9E9E9E', marginTop: 4 },
  date: { fontSize: 13, color: '#BDBDBD', marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  categoryName: { fontSize: 16, fontWeight: '600', color: '#333' },
  weight: { fontSize: 14, color: '#666', marginTop: 2 },
  photo: { width: '100%', height: 200, borderRadius: 8, marginTop: 12, backgroundColor: '#E0E0E0' },
  rewardName: { fontSize: 16, fontWeight: '600', color: '#333' },
});
