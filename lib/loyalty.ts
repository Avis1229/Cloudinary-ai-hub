export interface TierInfo {
  tier: string;
  min: number;
  max: number;
  next: string | null;
}

export const TIER_SEQUENCE: TierInfo[] = [
  { tier: 'Novice', min: 0, max: 500, next: 'Seeker' },
  { tier: 'Seeker', min: 501, max: 2000, next: 'Keeper' },
  { tier: 'Keeper', min: 2001, max: 5000, next: 'Sage' },
  { tier: 'Sage', min: 5001, max: Infinity, next: null },
];

export function getTier(points: number): string {
  for (const t of TIER_SEQUENCE) {
    if (points >= t.min && points <= t.max) return t.tier;
  }
  return 'Novice';
}

export function getProgress(points: number) {
  const currentTier = getTier(points);
  const info = TIER_SEQUENCE.find(t => t.tier === currentTier)!;
  let nextTierPoints = 0;
  let pointsToNextTier = 0;
  if (info.next) {
    const next = TIER_SEQUENCE.find(t => t.tier === info.next)!;
    nextTierPoints = next.min;
    pointsToNextTier = Math.max(0, next.min - points);
  }
  return { currentTier, nextTier: info.next, nextTierPoints, pointsToNextTier };
}

export function evaluateTierChange(oldTier: string | undefined, newPoints: number) {
  const newTier = getTier(newPoints);
  const changed = oldTier !== newTier;
  return { newTier, changed };
}
