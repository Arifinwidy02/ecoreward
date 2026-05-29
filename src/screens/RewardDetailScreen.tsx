import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { ProfileStackParamList } from '../types/navigation';
import { Reward } from '../types/models';
import { getRewardById } from '../services/rewardService';
import { createRedemption } from '../services/transactionService';
import { useAuthStore } from '../stores/useAuthStore';
import { useUserStore } from '../stores/useUserStore';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';

type RouteParams = RouteProp<ProfileStackParamList, 'RewardDetail'>;

export function RewardDetailScreen() {
  const route = useRoute<RouteParams>();
  const session = useAuthStore((s) => s.session);
  const { profile, loadProfile } = useUserStore();
  const [reward, setReward] = useState<Reward | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRewardById(route.params.rewardId).then((r) => {
      setReward(r);
      setLoading(false);
    });
  }, [route.params.rewardId]);

  const handleRedeem = async () => {
    if (!reward || !session?.user?.id) return;
    try {
      await createRedemption({
        userId: session.user.id,
        rewardId: reward.id,
        pointsCost: reward.points_cost,
      });
      await loadProfile(session.user.id);
      Alert.alert('Berhasil!', `Anda telah menukar ${reward.name}`);
    } catch (error: any) {
      Alert.alert('Gagal', error.message || 'Silakan coba lagi.');
    }
  };

  if (loading) return <LoadingOverlay visible />;
  if (!reward) return <Text style={{ padding: 20, color: '#666' }}>Hadiah tidak ditemukan</Text>;

  const canAfford = ((profile?.points_balance ?? profile?.eco_points) ?? 0) >= reward.points_cost;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>{reward.name}</Text>
        <Text style={styles.desc}>{reward.description}</Text>
        <Text style={styles.cost}>{'🌟'} {reward.points_cost} Eco-Points</Text>
        <Text style={styles.stock}>
          Stok: {reward.stock === -1 ? 'Tidak terbatas' : reward.stock}
        </Text>
        <TouchableOpacity
          style={[styles.button, !canAfford && styles.buttonDisabled]}
          onPress={handleRedeem}
          disabled={!canAfford}
        >
          <Text style={styles.buttonText}>
            {canAfford ? 'Tukar Sekarang' : 'Poin Tidak Cukup'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  card: { backgroundColor: '#fff', padding: 20, margin: 12, borderRadius: 12 },
  name: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 8 },
  desc: { fontSize: 14, color: '#757575', marginBottom: 16, lineHeight: 20 },
  cost: { fontSize: 18, fontWeight: '700', color: '#2E7D32', marginBottom: 4 },
  stock: { fontSize: 14, color: '#9E9E9E', marginBottom: 20 },
  button: { backgroundColor: '#4CAF50', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#BDBDBD' },
  buttonText: { fontSize: 16, color: '#fff', fontWeight: '600' },
});
