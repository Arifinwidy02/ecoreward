import { create } from 'zustand';
import type { ClassificationResult } from '../types/models';

interface ScanState {
  imageUri: string | null;
  classification: ClassificationResult | null;
  selectedBinId: string | null;
  isProcessing: boolean;
  error: string | null;
  setImage: (uri: string) => void;
  setClassification: (result: ClassificationResult) => void;
  setSelectedBin: (binId: string) => void;
  reset: () => void;
  setProcessing: (v: boolean) => void;
  setError: (e: string | null) => void;
}

const initialState = {
  imageUri: null,
  classification: null,
  selectedBinId: null,
  isProcessing: false,
  error: null,
};

export const useScanStore = create<ScanState>((set) => ({
  ...initialState,
  setImage: (uri) => set({ imageUri: uri, error: null }),
  setClassification: (result) => set({ classification: result }),
  setSelectedBin: (binId) => set({ selectedBinId: binId }),
  reset: () => set(initialState),
  setProcessing: (v) => set({ isProcessing: v }),
  setError: (e) => set({ error: e }),
}));
