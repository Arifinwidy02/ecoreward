import { create } from 'zustand';
import type { SmartNetbin } from '../types/models';
import { getAllBins, subscribeBins } from '../services/binService';

interface BinState {
  bins: SmartNetbin[];
  selectedBin: SmartNetbin | null;
  isLoading: boolean;
  loadBins: () => Promise<void>;
  subscribeToBins: () => () => void;
  setSelectedBin: (bin: SmartNetbin | null) => void;
}

export const useBinStore = create<BinState>((set) => ({
  bins: [],
  selectedBin: null,
  isLoading: false,

  loadBins: async () => {
    set({ isLoading: true });
    try {
      const bins = await getAllBins();
      set({ bins, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  subscribeToBins: () => {
    return subscribeBins((bins) => set({ bins }));
  },

  setSelectedBin: (bin) => set({ selectedBin: bin }),
}));
