import React from 'react';
import { Marker } from 'react-native-maps';
import { View, StyleSheet } from 'react-native';
import { SmartNetbin } from '../../types/models';
import { BIN_MARKER_COLORS } from '../../utils/constants';

interface Props {
  bin: SmartNetbin;
  onPress: () => void;
}

export function BinMarker({ bin, onPress }: Props) {
  const color = BIN_MARKER_COLORS[bin.status] || '#9E9E9E';

  return (
    <Marker
      coordinate={{ latitude: bin.latitude, longitude: bin.longitude }}
      title={bin.name}
      description={`${bin.capacity_percent}% — ${bin.status}`}
      onPress={onPress}
    >
      <View style={[styles.marker, { backgroundColor: color }]}>
        <View style={styles.inner} />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  marker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  inner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
});
