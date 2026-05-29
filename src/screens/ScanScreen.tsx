import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { CameraView } from '../components/scan/CameraView';
import { useCamera } from '../hooks/useCamera';
import { useTFLite } from '../hooks/useTFLite';
import { useScanStore } from '../stores/useScanStore';
import { WasteCategoryName } from '../types/enums';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';

export function ScanScreen() {
  const navigation = useNavigation<any>();
  const { device, hasPermission, ensurePermission } = useCamera();
  const { isModelReady, modelLoadError, isClassifying, classify } = useTFLite();
  const { setImage, setClassification, reset } = useScanStore();

  const [permissionChecked, setPermissionChecked] = React.useState(false);

  React.useEffect(() => {
    ensurePermission().then(() => setPermissionChecked(true));
  }, []);

  useFocusEffect(
    useCallback(() => {
      reset();
    }, [reset]),
  );

  const handleCapture = useCallback(async (uri: string) => {
    setImage(uri);

    const result = await classify(uri);

    const classification = {
      category: result.category as WasteCategoryName,
      confidence: result.confidence,
      estimatedPoints: result.estimatedPoints,
      estimatedWeightKg: result.estimatedWeightKg,
      allProbabilities: result.allProbabilities as Record<WasteCategoryName, number>,
    };
    setClassification(classification);

    navigation.navigate('ScanResult', { imageUri: uri, classification });
  }, [classify, setImage, setClassification, navigation]);

  if (!permissionChecked) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Meminta izin kamera...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Izin Kamera Diperlukan</Text>
        <Text style={styles.errorText}>
          Izinkan akses kamera di pengaturan untuk memindai sampah.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={() => ensurePermission()}>
          <Text style={styles.permissionButtonText}>Berikan Izin</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Kamera Tidak Tersedia</Text>
        <Text style={styles.errorText}>Perangkat ini tidak memiliki kamera belakang.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={isClassifying} message="Mengidentifikasi sampah..." />
      {modelLoadError && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            Model AI belum tersedia, klasifikasi akan menggunakan mode dasar.
          </Text>
        </View>
      )}
      <CameraView onCapture={handleCapture} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', padding: 32 },
  loadingText: { color: '#fff', fontSize: 16 },
  errorTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 12 },
  errorText: { color: '#BDBDBD', fontSize: 14, textAlign: 'center', marginBottom: 24 },
  permissionButton: { backgroundColor: '#4CAF50', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 8 },
  permissionButtonText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  warningBanner: {
    position: 'absolute', top: 50, left: 16, right: 16, zIndex: 10,
    backgroundColor: 'rgba(255, 152, 0, 0.9)', padding: 10, borderRadius: 8,
  },
  warningText: { color: '#fff', fontSize: 13, textAlign: 'center' },
});
