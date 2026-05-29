import React from 'react';
import { View, TouchableOpacity, Text, FlatList, StyleSheet } from 'react-native';
import { WasteCategory } from '../../types/models';
import { CategoryIcon } from '../ui/CategoryIcon';

interface Props {
  categories: WasteCategory[];
  selectedId: string | null;
  onSelect: (category: WasteCategory) => void;
}

export function CategorySelector({ categories, selectedId, onSelect }: Props) {
  return (
    <FlatList
      data={categories}
      numColumns={4}
      keyExtractor={(item) => item.id}
      columnWrapperStyle={styles.row}
      scrollEnabled={false}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.item, selectedId === item.id && styles.selected]}
          onPress={() => onSelect(item)}
        >
          <CategoryIcon category={item.name} size={40} />
          <Text style={styles.label}>{item.name}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: { justifyContent: 'space-around', paddingHorizontal: 16, marginBottom: 8 },
  item: { alignItems: 'center', padding: 12, borderRadius: 8, borderWidth: 2, borderColor: 'transparent', width: 80 },
  selected: { borderColor: '#4CAF50', backgroundColor: '#E8F5E9' },
  label: { fontSize: 10, color: '#666', marginTop: 4, textAlign: 'center' },
});
