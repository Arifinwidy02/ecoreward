import { useState, useEffect, useCallback, useRef } from 'react';
import { loadModel, classifyImage, unloadModel } from '../ml/wasteClassifier';
import type { ClassificationResult } from '../types/models';

const MODEL_LOAD_TIMEOUT_MS = 10000;

export function useTFLite() {
  const [isModelReady, setIsModelReady] = useState(false);
  const [modelLoadError, setModelLoadError] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const timeoutId = setTimeout(() => {
      if (mountedRef.current) {
        console.warn('[useTFLite] Model load timed out after', MODEL_LOAD_TIMEOUT_MS, 'ms');
        setModelLoadError(true);
      }
    }, MODEL_LOAD_TIMEOUT_MS);

    loadModel()
      .then(() => {
        if (mountedRef.current) {
          clearTimeout(timeoutId);
          setIsModelReady(true);
        }
      })
      .catch((err: unknown) => {
        if (mountedRef.current) {
          clearTimeout(timeoutId);
          console.warn('[useTFLite] TFLite model not available:', (err as any)?.message || err);
          setModelLoadError(true);
        }
      });

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
      unloadModel();
    };
  }, []);

  const classify = useCallback(async (imageUri: string): Promise<ClassificationResult> => {
    setIsClassifying(true);
    try {
      const result = await classifyImage(imageUri);
      return result;
    } finally {
      setIsClassifying(false);
    }
  }, []);

  return { isModelReady, modelLoadError, isClassifying, classify };
}
