import { useState, useCallback } from 'react';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import { useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

export function useCamera() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const ensurePermission = useCallback(async (): Promise<boolean> => {
    if (hasPermission) return true;

    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request('android.permission.CAMERA');
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Izin Diperlukan', 'Kamera diperlukan untuk scan sampah.');
        return false;
      }
    }

    const result = await requestPermission();
    if (!result) {
      Alert.alert('Izin Diperlukan', 'Kamera diperlukan untuk scan sampah.');
      return false;
    }
    return true;
  }, [hasPermission, requestPermission]);

  const takePhoto = useCallback(
    async (camera: any): Promise<string | null> => {
      if (!camera) return null;
      try {
        const photo = await camera.takePhoto({ qualityPrioritization: 'quality' });
        const uri = `file://${photo.path}`;
        setPhotoUri(uri);
        return uri;
      } catch {
        Alert.alert('Gagal', 'Tidak dapat mengambil foto.');
        return null;
      }
    },
    [],
  );

  return { device, hasPermission, ensurePermission, takePhoto, photoUri, setPhotoUri };
}
