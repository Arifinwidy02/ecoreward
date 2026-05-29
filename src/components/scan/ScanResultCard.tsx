import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {WasteCategory} from '../../types/models';
import {ClassificationResult} from '../../types/models';
import {CategoryIcon} from '../ui/CategoryIcon';

interface Props {
  imageUri: string;
  classification: ClassificationResult;
  category: WasteCategory;
  estimatedPoints: number;
  estimatedWeightKg: number;
}

export function ScanResultCard({
  imageUri,
  classification,
  category,
  estimatedPoints,
  estimatedWeightKg,
}: Props) {
  return (
    <View style={styles.container}>
      <Image source={{uri: imageUri}} style={styles.image} />
      <View style={styles.info}>
        <CategoryIcon category={category.name} size={48} />
        <Text style={styles.categoryName}>
          {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
        </Text>
        <Text style={styles.confidence}>
          Confidence: {(classification.confidence * 100).toFixed(1)}%
        </Text>
        <Text style={styles.weight}>
          Estimasi berat: {estimatedWeightKg.toFixed(2)} kg
        </Text>
        <Text style={styles.points}>+{estimatedPoints} Eco-Points</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden'},
  image: {width: '100%', height: 200, backgroundColor: '#E0E0E0'},
  info: {padding: 20, alignItems: 'center', gap: 8},
  categoryName: {fontSize: 22, fontWeight: '700', color: '#333'},
  confidence: {fontSize: 14, color: '#757575'},
  weight: {fontSize: 15, color: '#666'},
  points: {fontSize: 24, fontWeight: '800', color: '#2E7D32', marginTop: 8},
});
