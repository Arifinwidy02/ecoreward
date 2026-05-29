export const SUPABASE_URL = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'placeholder-key';

export const SPLASH_DURATION_MS = 2000;

export const ONBOARDING_SLIDES = [
  {
    id: "1",
    title: "Pilah Sampahmu",
    description:
      "Pisahkan sampah organik, plastik, logam, kaca, kertas, dan lainnya untuk lingkungan yang lebih bersih.",
    icon: "leaf",
  },
  {
    id: "2",
    title: "Scan & Dapatkan Poin",
    description:
      "Foto sampahmu, AI kami akan mengidentifikasi jenisnya dan kamu dapat Eco-Points!",
    icon: "camera",
  },
  {
    id: "3",
    title: "Tukar Hadiahmu",
    description:
      "Kumpulkan Eco-Points dan tukar dengan saldo, voucher, sembako, benih, atau pupuk.",
    icon: "gift",
  },
];

export const GOOGLE_MAPS_DEFAULT_REGION = {
  latitude: -6.9125,
  longitude: 107.6125,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export const BIN_MARKER_COLORS: Record<string, string> = {
  available: "#4CAF50",
  almost_full: "#FF9800",
  full: "#F44336",
  maintenance: "#9E9E9E",
};

export const WASTE_CATEGORY_COLORS: Record<string, string> = {
  organic: "#8BC34A",
  plastic: "#FF7043",
  metal: "#78909C",
  glass: "#26C6DA",
  paper: "#FFCA28",
  inorganic: "#9E9E9E",
  hazardous: "#E53935",
};

export const TFLITE_MODEL_PATH = "model.tflite";
export const TFLITE_INPUT_SIZE = 224;
export const MIN_CONFIDENCE_THRESHOLD = 0.6;
