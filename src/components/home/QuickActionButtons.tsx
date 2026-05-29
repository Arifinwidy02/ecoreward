import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {MaterialCommunityIcons as Icon} from '../ui/Icon';
import {useNavigation} from '@react-navigation/native';

export function QuickActionButtons() {
  const navigation = useNavigation<any>();

  const actions = [
    {label: 'Cari Bin', icon: 'map-marker', route: 'MapTab'},
    {label: 'Scan Sampah', icon: 'camera', route: 'ScanTab'},
    {
      label: 'Tukar Hadiah',
      icon: 'gift',
      route: 'ProfileTab',
      params: {screen: 'RewardCatalog', params: {fromTab: 'HomeTab'}},
    },
  ];

  return (
    <View style={styles.container}>
      {actions.map(action => (
        <TouchableOpacity
          key={action.label}
          style={styles.button}
          onPress={() => {
            if (action.params) {
              navigation.navigate(action.route, action.params);
            } else {
              navigation.navigate(action.route);
            }
          }}>
          <Icon name={action.icon} size={28} color="#4CAF50" />
          <Text style={styles.label}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    flex: 1,
    marginHorizontal: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
});
