import { useState, useEffect } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';

interface LocationState {
  latitude: number;
  longitude: number;
}

export function useLocation() {
  const [currentLocation, setCurrentLocation] = useState<LocationState | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        'android.permission.ACCESS_FINE_LOCATION',
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        setHasPermission(false);
        return false;
      }
    }
    setHasPermission(true);
    return true;
  };

  const setLocation = (lat: number, lng: number) => {
    setCurrentLocation({ latitude: lat, longitude: lng });
  };

  return { currentLocation, hasPermission, requestPermission, setLocation };
}
