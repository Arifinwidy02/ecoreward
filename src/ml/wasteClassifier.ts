import { loadTensorflowModel } from 'react-native-fast-tflite';
import type { TfliteModel } from 'react-native-fast-tflite';
import { TFLITE_INPUT_SIZE, MIN_CONFIDENCE_THRESHOLD } from '../utils/constants';
import { WasteCategoryName } from '../types/enums';
import type { ClassificationResult } from '../types/models';
import labels from './labels.json';
import { preprocessImage } from '../utils/imageUtils';

let model: TfliteModel | null = null;

const ROBOFLOW_TO_DB: Record<string, WasteCategoryName> = {
  biological: WasteCategoryName.ORGANIC,
  battery: WasteCategoryName.HAZARDOUS,
  'brown glasses': WasteCategoryName.GLASS,
  cardboard: WasteCategoryName.PAPER,
  clothes: WasteCategoryName.INORGANIC,
  'green glass': WasteCategoryName.GLASS,
  metal: WasteCategoryName.METAL,
  paper: WasteCategoryName.PAPER,
  plastic: WasteCategoryName.PLASTIC,
  shoes: WasteCategoryName.INORGANIC,
  trash: WasteCategoryName.INORGANIC,
  'white glass': WasteCategoryName.GLASS,
};

function buildEmptyProbs(): Record<WasteCategoryName, number> {
  const probs = {} as Record<WasteCategoryName, number>;
  Object.values(WasteCategoryName).forEach((name) => { probs[name] = 0; });
  return probs;
}

function fallbackResult(): ClassificationResult {
  return {
    category: WasteCategoryName.INORGANIC,
    confidence: 0,
    estimatedPoints: 0,
    estimatedWeightKg: 0,
    allProbabilities: buildEmptyProbs(),
  };
}

function aggregateProbabilities(rawProbs: Float32Array): Record<WasteCategoryName, number> {
  const aggregated = buildEmptyProbs();
  const labelEntries = Object.entries(labels) as [string, string][];

  for (const [indexStr, roboflowClass] of labelEntries) {
    const prob = rawProbs[parseInt(indexStr, 10)] || 0;
    const dbCategory = ROBOFLOW_TO_DB[roboflowClass];
    if (dbCategory) {
      aggregated[dbCategory] += prob;
    }
  }

  return aggregated;
}

export async function loadModel(): Promise<void> {
  if (model) {
    console.log('[TFLite] Model already loaded');
    return;
  }
  try {
    console.log('[TFLite] Loading model from bundle...');
    model = await loadTensorflowModel(
      require('./model.tflite'),
      [],
    );
    console.log('[TFLite] Model loaded successfully, inputs:', model.inputs.length, 'outputs:', model.outputs.length);
  } catch (e: any) {
    model = null;
    console.warn('[TFLite] Model load FAILED:', e?.message || e);
    throw e;
  }
}

export async function classifyImage(imageUri: string): Promise<ClassificationResult> {
  console.log('[TFLite] classifyImage called');
  if (!model) {
    console.log('[TFLite] No model loaded, returning fallback');
    return fallbackResult();
  }

  try {
    console.log('[TFLite] Preprocessing image...');
    const inputBuffer = await preprocessImage(imageUri, TFLITE_INPUT_SIZE);
    const expectedBytes = TFLITE_INPUT_SIZE * TFLITE_INPUT_SIZE * 3 * 4;
    console.log('[TFLite] Preprocessing done, buffer:', inputBuffer.byteLength, 'bytes (expected:', expectedBytes, 'bytes)');

    console.log('[TFLite] Input sample (first 9 floats):', Array.from(new Float32Array(inputBuffer.slice(0, 36))).map(f => f.toFixed(3)));

    console.log('[TFLite] Running inference...');
    const outputs = await model.run([inputBuffer]);
    const rawProbs = new Float32Array(outputs[0]!);
    console.log('[TFLite] Raw output (12 classes):', Array.from(rawProbs).map(p => p.toFixed(4)));

    const aggregated = aggregateProbabilities(rawProbs);

    let bestCategory: WasteCategoryName = WasteCategoryName.INORGANIC;
    let bestConfidence = 0;
    for (const [cat, prob] of Object.entries(aggregated)) {
      if (prob > bestConfidence) {
        bestConfidence = prob;
        bestCategory = cat as WasteCategoryName;
      }
    }

    console.log('[TFLite] Aggregated (7 DB categories):', JSON.stringify(aggregated));
    console.log('[TFLite] Result:', bestCategory, 'confidence:', bestConfidence.toFixed(4));

    if (bestConfidence >= MIN_CONFIDENCE_THRESHOLD) {
      return {
        category: bestCategory,
        confidence: bestConfidence,
        estimatedPoints: 0,
        estimatedWeightKg: 0,
        allProbabilities: aggregated,
      };
    }

    console.log('[TFLite] Confidence', bestConfidence.toFixed(4), 'below threshold', MIN_CONFIDENCE_THRESHOLD);
    return {
      category: bestCategory,
      confidence: bestConfidence,
      estimatedPoints: 0,
      estimatedWeightKg: 0,
      allProbabilities: aggregated,
    };
  } catch (e: any) {
    console.error('[TFLite] Inference FAILED:', e?.message || e);
  }

  return fallbackResult();
}

export function unloadModel(): void {
  model = null;
}
