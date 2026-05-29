import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/useAuthStore';
import { useBinStore } from '../stores/useBinStore';
import { SmartNetbin } from '../types/models';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { EmptyState } from '../components/ui/EmptyState';
import { reportFullBin } from '../services/binService';
import { BIN_MARKER_COLORS } from '../utils/constants';

export function MapScreen() {
  const navigation = useNavigation<any>();
  const session = useAuthStore((s) => s.session);
  const { bins, isLoading, loadBins, subscribeToBins } = useBinStore();

  useEffect(() => {
    loadBins();
    const unsub = subscribeToBins();
    return unsub;
  }, []);

  const handleReportFull = async (bin: SmartNetbin) => {
    if (!session?.user?.id) return;
    try {
      await reportFullBin(session.user.id, bin.id);
      Alert.alert('Terima Kasih', 'Laporan telah diterima.');
    } catch {
      Alert.alert('Gagal', 'Gagal mengirim laporan.');
    }
  };

  const statusLabel = (status: string) =>
    status === 'available' ? 'Tersedia' : status === 'almost_full' ? 'Hampir Penuh' : status === 'full' ? 'Penuh' : 'Maintenance';

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={isLoading} />
      <FlatList
        data={bins}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="map-marker-off" title="Data bin tidak tersedia" subtitle="Hubungkan ke Supabase untuk melihat Smart Netbin" />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('BinDetail', { binId: item.id })}
          >
            <View style={[styles.statusDot, { backgroundColor: BIN_MARKER_COLORS[item.status] || '#9E9E9E' }]} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              {item.address ? <Text style={styles.address}>{item.address}</Text> : null}
              <Text style={[styles.status, { color: BIN_MARKER_COLORS[item.status] }]}>
                {statusLabel(item.status)} — {item.capacity_percent}%
              </Text>
            </View>
            {item.status === 'full' && (
              <TouchableOpacity style={styles.reportBtn} onPress={() => handleReportFull(item)}>
                <Text style={styles.reportText}>Laporkan</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  list: { padding: 16 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#333' },
  address: { fontSize: 12, color: '#757575', marginTop: 2 },
  status: { fontSize: 13, fontWeight: '500', marginTop: 4 },
  reportBtn: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  reportText: { fontSize: 12, fontWeight: '600', color: '#E65100' },
});