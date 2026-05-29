import React, { ComponentType } from 'react';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FA5Icon from 'react-native-vector-icons/FontAwesome5';

const MaterialCommunityIcons = MaterialIcon as unknown as ComponentType<{
  name: string;
  size?: number;
  color?: string;
  style?: object;
}>;

const FontAwesome5 = FA5Icon as unknown as ComponentType<{
  name: string;
  size?: number;
  color?: string;
  style?: object;
  solid?: boolean;
  light?: boolean;
  brand?: boolean;
}>;

export { MaterialCommunityIcons, FontAwesome5 };
