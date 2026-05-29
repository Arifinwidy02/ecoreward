import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Reward } from '../../types/models';

interface Props {
  visible: boolean;
  reward: Reward | null;
  userPoints: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function RedemptionModal({ visible, reward, userPoints, onConfirm, onCancel }: Props) {
  if (!reward) return null;
  const canAfford = userPoints >= reward.points_cost;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Konfirmasi Penukaran</Text>
          <Text style={styles.rewardName}>{reward.name}</Text>
          <Text style={styles.cost}>Harga: {'🌟'} {reward.points_cost} Eco-Points</Text>
          <Text style={styles.balance}>Poin Anda: {'🌟'} {userPoints}</Text>
          {!canAfford && <Text style={styles.error}>Poin tidak mencukupi</Text>}
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, !canAfford && styles.confirmDisabled]}
              onPress={onConfirm}
              disabled={!canAfford}
            >
              <Text style={styles.confirmText}>Tukar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '85%' },
  title: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 16 },
  rewardName: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  cost: { fontSize: 16, color: '#2E7D32', fontWeight: '600', marginBottom: 4 },
  balance: { fontSize: 14, color: '#757575', marginBottom: 8 },
  error: { fontSize: 14, color: '#F44336', fontWeight: '600', marginBottom: 8 },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 16 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#BDBDBD', alignItems: 'center' },
  cancelText: { fontSize: 16, color: '#666' },
  confirmBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#4CAF50', alignItems: 'center' },
  confirmDisabled: { backgroundColor: '#BDBDBD' },
  confirmText: { fontSize: 16, color: '#fff', fontWeight: '600' },
});
