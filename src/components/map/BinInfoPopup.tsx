import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Platform, Alert } from 'react-native';
import { SmartNetbin } from '../../types/models';
import { ProgressBar } from '../achievements/ProgressBar';
import { BIN_MARKER_COLORS } from '../../utils/constants';

interface Props {
  bin: SmartNetbin;
  onClose: () => void;
  onViewDetail: () => void;
  onReportFull: () => void;
}

export function BinInfoPopup({ bin, onClose, onViewDetail, onReportFull }: Props) {
  const color = BIN_MARKER_COLORS[bin.status] || '#9E9E9E';
  const statusLabel =
    bin.status === 'available'
      ? 'Tersedia'
      : bin.status === 'almost_full'
        ? 'Hampir Penuh'
        : bin.status === 'full'
          ? 'Penuh'
          : 'Maintenance';

  const openDirections = () => {
    const url = Platform.select({
      ios: `maps:0,0?q=${bin.name}@${bin.latitude},${bin.longitude}`,
      android: `geo:0,0?q=${bin.latitude},${bin.longitude}(${bin.name})`,
    });
    if (url) {
      Linking.openURL(url).catch(() =>
        Alert.alert('Gagal', 'Tidak dapat membuka aplikasi maps.'),
      );
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      <Text style={styles.name}>{bin.name}</Text>
      {bin.address ? <Text style={styles.address}>{bin.address}</Text> : null}

      <View style={styles.capacityRow}>
        <Text style={styles.capacityLabel}>Kapasitas: {bin.capacity_percent}%</Text>
        <Text style={[styles.statusBadge, { color }]}>{statusLabel}</Text>
      </View>

      <ProgressBar progress={bin.capacity_percent / 100} color={color} />

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.detailBtn} onPress={onViewDetail}>
          <Text style={styles.detailBtnText}>Detail</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.directionBtn} onPress={openDirections}>
          <Text style={styles.directionBtnText}>Rute ke Sini</Text>
        </TouchableOpacity>
        {bin.status === 'full' && (
          <TouchableOpacity style={styles.reportBtn} onPress={onReportFull}>
            <Text style={styles.reportBtnText}>Laporkan</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  closeBtn: { position: 'absolute', top: 12, right: 16, zIndex: 1 },
  closeText: { fontSize: 18, color: '#9E9E9E', fontWeight: '600' },
  name: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 4, paddingRight: 30 },
  address: { fontSize: 13, color: '#757575', marginBottom: 12 },
  capacityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  capacityLabel: { fontSize: 14, color: '#666' },
  statusBadge: { fontSize: 13, fontWeight: '600' },
  buttons: { flexDirection: 'row', gap: 8, marginTop: 12 },
  detailBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#F5F5F5', alignItems: 'center' },
  detailBtnText: { fontSize: 14, fontWeight: '600', color: '#333' },
  directionBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#4CAF50', alignItems: 'center' },
  directionBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  reportBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#FFF3E0', alignItems: 'center' },
  reportBtnText: { fontSize: 14, fontWeight: '600', color: '#E65100' },
});
