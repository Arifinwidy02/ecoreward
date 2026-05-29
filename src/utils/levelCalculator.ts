export function calculateLevel(totalPointsEarned: number): number {
  return Math.floor(Math.sqrt(totalPointsEarned / 100)) + 1;
}

export function pointsForNextLevel(currentLevel: number): number {
  return currentLevel * currentLevel * 100;
}

export function progressToNextLevel(totalPointsEarned: number): number {
  const currentLevel = calculateLevel(totalPointsEarned);
  const currentRequired = (currentLevel - 1) * (currentLevel - 1) * 100;
  const nextRequired = currentLevel * currentLevel * 100;
  return Math.min((totalPointsEarned - currentRequired) / (nextRequired - currentRequired), 1);
}
