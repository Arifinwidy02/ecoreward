import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons as Icon } from '../ui/Icon';
import { Reward } from '../../types/models';
import { RewardType } from '../../types/enums';

interface Props {
  reward: Reward;
  onPress: () => void;
  userHasPoints: boolean;
}

const TYPE_ICONS: Record<RewardType, string> = {
  [RewardType.MONEY]: 'cash',
  [RewardType.VOUCHER]: 'ticket-percent',
  [RewardType.GROCERIES]: 'basket',
  [RewardType.SEED]: 'seed',
  [RewardType.FERTILIZER]: 'sprout',
  [RewardType.OTHER]: 'gift',
};

export function RewardCard({ reward, onPress, userHasPoints }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, !userHasPoints && styles.disabled]}
      onPress={onPress}
      disabled={!userHasPoints}
    >
      <Icon name={TYPE_ICONS[reward.type] || 'gift'} size={32} color="#4CAF50" />
      <View style={styles.info}>
        <Text style={styles.name}>{reward.name}</Text>
        <Text style={styles.desc}>{reward.description}</Text>
        <Text style={styles.cost}>{'🌟'} {reward.points_cost} Eco-Points</Text>
      </View>
      <Icon name="chevron-right" size={24} color="#BDBDBD" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 16, marginHorizontal: 16, marginVertical: 4, borderRadius: 12, gap: 12,
  },
  disabled: { opacity: 0.5 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: '#333' },
  desc: { fontSize: 13, color: '#757575', marginTop: 2 },
  cost: { fontSize: 14, fontWeight: '700', color: '#2E7D32', marginTop: 4 },
});
