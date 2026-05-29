import React, { useRef, useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';

interface Props {
  onCapture: (uri: string) => void;
}

export function CameraView({ onCapture }: Props) {
  const camera = useRef<Camera>(null);
  const device = useCameraDevice('back');

  const handleCapture = useCallback(async () => {
    if (!camera.current) return;
    const photo = await camera.current.takePhoto();
    onCapture(`file://${photo.path}`);
  }, [onCapture]);

  if (!device) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Kamera tidak tersedia</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive
        photo
      />
      <View style={styles.overlay}>
        <View style={styles.frame} />
      </View>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
          <View style={styles.captureInner} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' },
  errorText: { color: '#fff', fontSize: 16 },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  frame: { width: 280, height: 280, borderWidth: 2, borderColor: '#4CAF50', borderRadius: 16 },
  controls: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' },
  captureButton: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  captureInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff' },
});
