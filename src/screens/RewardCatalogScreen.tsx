import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Alert, ActivityIndicator, Text, BackHandler, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons as Icon } from '../components/ui/Icon';
import { useAuthStore } from '../stores/useAuthStore';
import { useUserStore } from '../stores/useUserStore';
import { Reward } from '../types/models';
import { getAllRewards } from '../services/rewardService';
import { createRedemption } from '../services/transactionService';
import { RewardCard } from '../components/rewards/RewardCard';
import { RedemptionModal } from '../components/rewards/RedemptionModal';
import { EmptyState } from '../components/ui/EmptyState';

export function RewardCatalogScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const fromTab = route.params?.fromTab as string | undefined;
  const session = useAuthStore((s) => s.session);
  const { profile, loadProfile } = useUserStore();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  const handleBack = useCallback(() => {
    if (fromTab) {
      navigation.getParent()?.navigate(fromTab);
    } else {
      navigation.goBack();
    }
    return true;
  }, [fromTab, navigation]);

  useEffect(() => {
    if (fromTab) {
      navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity onPress={handleBack} style={{ paddingLeft: 16 }}>
            <Icon name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
        ),
      });
    }
    BackHandler.addEventListener('hardwareBackPress', handleBack);

    getAllRewards()
      .then(setRewards)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, [fromTab, navigation, handleBack]);

  const handleRedeem = async () => {
    if (!selectedReward || !session?.user?.id) return;
    try {
      await createRedemption({
        userId: session.user.id,
        rewardId: selectedReward.id,
        pointsCost: selectedReward.points_cost,
      });
      await loadProfile(session.user.id);
      setModalVisible(false);
      Alert.alert('Berhasil!', `Anda telah menukar ${selectedReward.name}`);
    } catch (error: any) {
      Alert.alert('Gagal', error.message || 'Silakan coba lagi.');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 12, color: '#757575' }}>Memuat katalog...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5', padding: 24 }}>
        <EmptyState icon="alert-circle" title="Gagal memuat katalog" subtitle={error} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <FlatList
        data={rewards}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState icon="gift-off" title="Belum ada hadiah tersedia" />}
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item }) => (
          <RewardCard
            reward={item}
            userHasPoints={((profile?.points_balance ?? profile?.eco_points) ?? 0) >= item.points_cost}
            onPress={() => {
              setSelectedReward(item);
              setModalVisible(true);
            }}
          />
        )}
      />
      <RedemptionModal
        visible={modalVisible}
        reward={selectedReward}
        userPoints={profile?.points_balance ?? profile?.eco_points ?? 0}
        onConfirm={handleRedeem}
        onCancel={() => setModalVisible(false)}
      />
    </View>
  );
}
