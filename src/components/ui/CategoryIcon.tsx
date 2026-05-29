import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FontAwesome5 as Icon } from './Icon';
import { WasteCategoryName } from '../../types/enums';
import { WASTE_CATEGORY_COLORS } from '../../utils/constants';

interface Props {
  category: WasteCategoryName;
  size?: number;
}

const ICON_MAP: Record<WasteCategoryName, string> = {
  [WasteCategoryName.ORGANIC]: 'leaf',
  [WasteCategoryName.PLASTIC]: 'wine-bottle',
  [WasteCategoryName.METAL]: 'can',
  [WasteCategoryName.GLASS]: 'wine-glass',
  [WasteCategoryName.PAPER]: 'newspaper',
  [WasteCategoryName.INORGANIC]: 'trash',
  [WasteCategoryName.HAZARDOUS]: 'radiation',
};

export function CategoryIcon({ category, size = 32 }: Props) {
  const color = WASTE_CATEGORY_COLORS[category] || '#9E9E9E';
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color + '20',
        },
      ]}
    >
      <Icon name={ICON_MAP[category] || 'question'} size={size * 0.5} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
