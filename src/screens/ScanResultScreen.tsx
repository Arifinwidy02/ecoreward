import React, {useEffect, useState, useMemo} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {ScanStackParamList} from '../types/navigation';
import {WasteCategory, SmartNetbin} from '../types/models';
import {BinStatus, WasteCategoryName} from '../types/enums';
import {useAuthStore} from '../stores/useAuthStore';
import {useUserStore} from '../stores/useUserStore';
import {useBinStore} from '../stores/useBinStore';
import {getAllCategories} from '../services/categoryService';
import {submitScan} from '../services/scanService';
import {supabase} from '../services/supabase';
import {calculateEstimatedPoints} from '../utils/pointsCalculator';
import {ScanResultCard} from '../components/scan/ScanResultCard';
import {CategorySelector} from '../components/scan/CategorySelector';
import {LoadingOverlay} from '../components/ui/LoadingOverlay';
import {MIN_CONFIDENCE_THRESHOLD} from '../utils/constants';

type RouteParams = RouteProp<ScanStackParamList, 'ScanResult'>;

const FALLBACK_CATEGORIES: Record<WasteCategoryName, WasteCategory> = {
  [WasteCategoryName.ORGANIC]: {
    id: 'fallback-organic',
    name: WasteCategoryName.ORGANIC,
    points_per_kg: 10,
    estimated_avg_weight_kg: 0.5,
    icon_name: 'leaf',
    created_at: new Date().toISOString(),
  },
  [WasteCategoryName.PLASTIC]: {
    id: 'fallback-plastic',
    name: WasteCategoryName.PLASTIC,
    points_per_kg: 15,
    estimated_avg_weight_kg: 0.05,
    icon_name: 'bottle',
    created_at: new Date().toISOString(),
  },
  [WasteCategoryName.METAL]: {
    id: 'fallback-metal',
    name: WasteCategoryName.METAL,
    points_per_kg: 20,
    estimated_avg_weight_kg: 0.1,
    icon_name: 'cog',
    created_at: new Date().toISOString(),
  },
  [WasteCategoryName.GLASS]: {
    id: 'fallback-glass',
    name: WasteCategoryName.GLASS,
    points_per_kg: 12,
    estimated_avg_weight_kg: 0.3,
    icon_name: 'glass-wine',
    created_at: new Date().toISOString(),
  },
  [WasteCategoryName.PAPER]: {
    id: 'fallback-paper',
    name: WasteCategoryName.PAPER,
    points_per_kg: 8,
    estimated_avg_weight_kg: 0.1,
    icon_name: 'file',
    created_at: new Date().toISOString(),
  },
  [WasteCategoryName.INORGANIC]: {
    id: 'fallback-inorganic',
    name: WasteCategoryName.INORGANIC,
    points_per_kg: 12,
    estimated_avg_weight_kg: 0.2,
    icon_name: 'delete',
    created_at: new Date().toISOString(),
  },
  [WasteCategoryName.HAZARDOUS]: {
    id: 'fallback-hazardous',
    name: WasteCategoryName.HAZARDOUS,
    points_per_kg: 25,
    estimated_avg_weight_kg: 0.15,
    icon_name: 'hazard',
    created_at: new Date().toISOString(),
  },
};

const ALL_FALLBACK_CATEGORIES = Object.values(FALLBACK_CATEGORIES);

const DUMMY_BINS: SmartNetbin[] = [
  {
    id: 'dummy-bin-1',
    name: 'Smart Bin A - Depan Minimarket',
    latitude: -6.9147,
    longitude: 107.6098,
    capacity_percent: 35,
    status: BinStatus.AVAILABLE,
    address: 'Jl. Raya No. 10',
    last_updated: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'dummy-bin-2',
    name: 'Smart Bin B - Taman Kota',
    latitude: -6.9175,
    longitude: 107.612,
    capacity_percent: 60,
    status: BinStatus.AVAILABLE,
    address: 'Taman Kota, Area Timur',
    last_updated: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'dummy-bin-3',
    name: 'Smart Bin C - Dekat Halte Bus',
    latitude: -6.92,
    longitude: 107.605,
    capacity_percent: 15,
    status: BinStatus.AVAILABLE,
    address: 'Halte Bus Transit',
    last_updated: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
];

export function ScanResultScreen() {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<any>();
  const {imageUri, classification} = route.params;
  const session = useAuthStore(s => s.session);
  const {profile, loadProfile, addPointsLocal} = useUserStore();
  const {bins, loadBins} = useBinStore();

  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<WasteCategory | null>(null);
  const [selectedBinId, setSelectedBinId] = useState<string | null>(null);
  const [isAIUnsure, setIsAIUnsure] = useState(
    classification.confidence < MIN_CONFIDENCE_THRESHOLD,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableBins = useMemo(() => {
    const dbBins = bins.filter(b => b.status !== 'maintenance');
    const combined = [...dbBins];
    for (const dummy of DUMMY_BINS) {
      if (!combined.find(b => b.id === dummy.id)) {
        combined.push(dummy);
      }
    }
    return combined;
  }, [bins]);

  useEffect(() => {
    const fallbackCat = FALLBACK_CATEGORIES[classification.category];
    if (fallbackCat) {
      setSelectedCategory(fallbackCat);
      setCategories(ALL_FALLBACK_CATEGORIES);
    }
    loadBins();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const cats = await getAllCategories();
      if (cats.length > 0) {
        setCategories(cats);
        const matched = cats.find(
          (c: WasteCategory) => c.name === classification.category,
        );
        if (matched) {
          setSelectedCategory(matched);
        }
      }
    } catch (err) {
      console.warn(
        'Failed to fetch categories from DB, using fallback:',
        (err as any)?.message,
      );
    }
  };

  const handleCategorySelect = (cat: WasteCategory) => {
    setSelectedCategory(cat);
    setIsAIUnsure(false);
  };

  const handleConfirm = async () => {
    if (!selectedCategory || !selectedBinId) {
      Alert.alert(
        'Lengkapi Data',
        'Pilih kategori sampah dan Smart Netbin tujuan.',
      );
      return;
    }

    const userId = session?.user?.id || 'dummy-user-id';

    setIsSubmitting(true);
    try {
      const {points, weightKg} = calculateEstimatedPoints(selectedCategory);
      console.log('🚀 ~ handleConfirm ~ selectedCategory:', selectedCategory);

      const {data: sessionData, error: sessionErr} =
        await supabase.auth.getSession();
      console.log(
        '[ScanResult] Supabase session check:',
        sessionData?.session ? 'authenticated' : 'no session',
        sessionErr?.message || '',
      );

      try {
        console.log('[ScanResult] Submitting scan to Supabase...');
        console.log(
          '[ScanResult] Payload:',
          JSON.stringify({
            userId,
            binId: selectedBinId,
            category: selectedCategory.name,
            confidence: classification.confidence,
            pointsEarned: points,
            weightKg,
          }),
        );
        const result = await submitScan({
          userId,
          binId: selectedBinId,
          category: selectedCategory.name,
          confidence: classification.confidence,
          pointsEarned: points,
          weightKg,
          photoUri: imageUri,
        });
        console.log(
          '[ScanResult] Scan submitted successfully:',
          JSON.stringify(result),
        );
        await loadProfile(userId);
      } catch (supabaseErr: any) {
        console.error(
          '[ScanResult] Supabase error:',
          JSON.stringify(
            {
              message: supabaseErr.message,
              code: supabaseErr.code,
              details: supabaseErr.details,
              hint: supabaseErr.hint,
            },
            null,
            2,
          ),
        );
        console.warn('[ScanResult] Supabase unavailable, using local state');
        addPointsLocal(points, weightKg);
      }

      Alert.alert(
        'Deposit Berhasil!',
        `+${points} Eco-Points telah ditambahkan.\nKategori: ${
          selectedCategory.name
        }\nBin: ${
          availableBins.find(b => b.id === selectedBinId)?.name || selectedBinId
        }`,
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.popToTop();
              navigation.getParent()?.navigate('HomeTab');
            },
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        'Gagal',
        error.message || 'Gagal menyimpan deposit. Silakan coba lagi.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const matchedCat = selectedCategory;
  const points = matchedCat ? calculateEstimatedPoints(matchedCat).points : 0;
  const weight = matchedCat ? calculateEstimatedPoints(matchedCat).weightKg : 0;
  const selectedBin = availableBins.find(b => b.id === selectedBinId);

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={isSubmitting} message="Menyimpan deposit..." />
      <ScrollView>
        {matchedCat && (
          <ScanResultCard
            imageUri={imageUri}
            classification={classification}
            category={matchedCat}
            estimatedPoints={points}
            estimatedWeightKg={weight}
          />
        )}

        {isAIUnsure && (
          <View style={styles.manualSection}>
            <Text style={styles.manualTitle}>
              AI kurang yakin (confidence:{' '}
              {(classification.confidence * 100).toFixed(0)}%)
            </Text>
            <Text style={styles.manualSubtitle}>
              Pilih kategori secara manual:
            </Text>
            <CategorySelector
              categories={categories}
              selectedId={selectedCategory?.id || null}
              onSelect={handleCategorySelect}
            />
          </View>
        )}

        <View style={styles.binSection}>
          <Text style={styles.sectionTitle}>Pilih Smart Netbin Tujuan</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.binList}>
            {availableBins.map(bin => (
              <TouchableOpacity
                key={bin.id}
                style={[
                  styles.binItem,
                  selectedBinId === bin.id && styles.binSelected,
                ]}
                onPress={() => setSelectedBinId(bin.id)}>
                <Text style={styles.binName} numberOfLines={2}>
                  {bin.name}
                </Text>
                <Text style={styles.binStatus}>
                  {bin.status === 'available'
                    ? '🟢 Tersedia'
                    : bin.status === 'almost_full'
                    ? '🟡 Hampir Penuh'
                    : '🔴 Penuh'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {selectedCategory && selectedBin && (
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Ringkasan Deposit</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Kategori</Text>
              <Text style={styles.summaryValue}>{selectedCategory.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Bin Tujuan</Text>
              <Text style={styles.summaryValue}>{selectedBin.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Estimasi Berat</Text>
              <Text style={styles.summaryValue}>{weight.toFixed(2)} kg</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Estimasi Poin</Text>
              <Text style={styles.summaryValueHighlight}>
                +{points} Eco-Points
              </Text>
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              (!selectedCategory || !selectedBinId) && styles.disabledButton,
            ]}
            onPress={handleConfirm}
            disabled={!selectedCategory || !selectedBinId || isSubmitting}>
            <Text style={styles.confirmText}>Konfirmasi Deposit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F5F5'},
  manualSection: {
    backgroundColor: '#FFF8E1',
    padding: 16,
    margin: 12,
    borderRadius: 12,
  },
  manualTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 4,
  },
  manualSubtitle: {fontSize: 13, color: '#666', marginBottom: 12},
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  binSection: {padding: 16},
  binList: {flexDirection: 'row'},
  binItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    width: 140,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  binSelected: {borderColor: '#4CAF50', backgroundColor: '#E8F5E9'},
  binName: {fontSize: 13, fontWeight: '600', color: '#333'},
  binStatus: {fontSize: 11, color: '#666', marginTop: 4},
  summarySection: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {fontSize: 14, color: '#666'},
  summaryValue: {fontSize: 14, color: '#333', fontWeight: '500'},
  summaryValueHighlight: {fontSize: 14, color: '#4CAF50', fontWeight: '700'},
  buttonContainer: {padding: 16, paddingBottom: 32},
  confirmButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {backgroundColor: '#BDBDBD'},
  confirmText: {fontSize: 16, color: '#fff', fontWeight: '600'},
});
