import { WasteCategory } from '../types/models';

export function calculatePoints(category: WasteCategory, weightKg: number): number {
  return Math.round(category.points_per_kg * weightKg);
}

export function calculateEstimatedPoints(
  category: WasteCategory,
): { points: number; weightKg: number } {
  const weightKg = category.estimated_avg_weight_kg ?? 0.5;
  return {
    points: calculatePoints(category, weightKg),
    weightKg,
  };
}
