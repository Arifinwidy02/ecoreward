import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, Platform, Alert } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { MapStackParamList } from '../types/navigation';
import { SmartNetbin } from '../types/models';
import { getBinById, reportFullBin } from '../services/binService';
import { useAuthStore } from '../stores/useAuthStore';
import { ProgressBar } from '../components/achievements/ProgressBar';
import { BIN_MARKER_COLORS } from '../utils/constants';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';

type RouteParams = RouteProp<MapStackParamList, 'BinDetail'>;

export function BinDetailScreen() {
  const route = useRoute<RouteParams>();
  const session = useAuthStore((s) => s.session);
  const [bin, setBin] = useState<SmartNetbin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBinById(route.params.binId).then((b) => {
      setBin(b);
      setLoading(false);
    });
  }, [route.params.binId]);

  const handleReportFull = async () => {
    if (!bin || !session?.user?.id) return;
    try {
      await reportFullBin(session.user.id, bin.id);
      Alert.alert('Terima Kasih', 'Laporan telah diterima.');
    } catch {
      Alert.alert('Gagal', 'Gagal mengirim laporan.');
    }
  };

  const openDirections = () => {
    if (!bin) return;
    const url = Platform.select({
      ios: `maps:0,0?q=${bin.name}@${bin.latitude},${bin.longitude}`,
      android: `geo:0,0?q=${bin.latitude},${bin.longitude}(${bin.name})`,
    });
    if (url) {
      Linking.openURL(url).catch(() => Alert.alert('Gagal', 'Tidak dapat membuka maps.'));
    }
  };

  if (loading) return <LoadingOverlay visible />;
  if (!bin) return <Text style={{ padding: 20, color: '#666' }}>Bin tidak ditemukan</Text>;

  const color = BIN_MARKER_COLORS[bin.status] || '#9E9E9E';
  const statusLabel =
    bin.status === 'available' ? 'Tersedia' : bin.status === 'almost_full' ? 'Hampir Penuh' : bin.status === 'full' ? 'Penuh' : 'Maintenance';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>{bin.name}</Text>
        {bin.address ? <Text style={styles.address}>{bin.address}</Text> : null}

        <View style={styles.statusRow}>
          <Text style={[styles.statusBadge, { color }]}>{statusLabel}</Text>
          <Text style={styles.capacity}>Kapasitas: {bin.capacity_percent}%</Text>
        </View>

        <ProgressBar progress={bin.capacity_percent / 100} color={color} height={12} />
      </View>

      <TouchableOpacity style={styles.directionBtn} onPress={openDirections}>
        <Text style={styles.directionBtnText}>Rute ke Sini</Text>
      </TouchableOpacity>

      {bin.status === 'full' && (
        <TouchableOpacity style={styles.reportBtn} onPress={handleReportFull}>
          <Text style={styles.reportBtnText}>Laporkan Bin Penuh</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  card: { backgroundColor: '#fff', padding: 20, margin: 12, borderRadius: 12 },
  name: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 4 },
  address: { fontSize: 14, color: '#757575', marginBottom: 16 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusBadge: { fontSize: 16, fontWeight: '600' },
  capacity: { fontSize: 14, color: '#666' },
  directionBtn: { backgroundColor: '#4CAF50', margin: 12, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  directionBtnText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  reportBtn: { backgroundColor: '#FFF3E0', marginHorizontal: 12, marginBottom: 12, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  reportBtnText: { fontSize: 16, color: '#E65100', fontWeight: '600' },
});
