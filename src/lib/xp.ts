/**
 * Level curve — matches the product spec exactly and extends forever:
 *   L1: 0, L2: 100, L3: 250, L4: 450, L5: 700, L6: 1000, ...
 * Cumulative XP where level L begins: xpToReach(L) = 25·L·(L+1) − 50.
 */

export function xpToReach(level: number): number {
  const l = Math.max(1, Math.floor(level));
  return 25 * l * (l + 1) - 50;
}

/** XP needed to go from `level` to `level + 1`. */
export function getXPForNextLevel(level: number): number {
  return xpToReach(level + 1) - xpToReach(level);
}

export function calculateLevel(totalXP: number): number {
  if (totalXP <= 0) return 1;
  // Solve 25L^2 + 25L - 50 <= xp for L.
  let level = Math.floor((Math.sqrt(1 + (4 * (totalXP + 50)) / 25) - 1) / 2);
  if (level < 1) level = 1;
  // Safety net against floating point drift.
  while (xpToReach(level + 1) <= totalXP) level++;
  while (level > 1 && xpToReach(level) > totalXP) level--;
  return level;
}

export interface LevelInfo {
  level: number;
  totalXP: number;
  /** XP earned within the current level. */
  intoLevel: number;
  /** Total XP span of the current level. */
  span: number;
  /** XP still needed for the next level. */
  remaining: number;
  /** 0..100 progress inside the current level. */
  pct: number;
}

export function getLevelProgress(totalXP: number): LevelInfo {
  const level = calculateLevel(totalXP);
  const base = xpToReach(level);
  const span = getXPForNextLevel(level);
  const intoLevel = totalXP - base;
  return {
    level,
    totalXP,
    intoLevel,
    span,
    remaining: span - intoLevel,
    pct: span > 0 ? Math.min(100, Math.max(0, (intoLevel / span) * 100)) : 0,
  };
}

const TITLES: [number, string][] = [
  [1, "Novice"],
  [3, "Apprentice"],
  [5, "Contender"],
  [8, "Achiever"],
  [12, "Veteran"],
  [16, "Elite"],
  [20, "Master"],
  [25, "Grandmaster"],
  [30, "Legend"],
];

export function levelTitle(level: number): string {
  let title = TITLES[0][1];
  for (const [min, name] of TITLES) if (level >= min) title = name;
  return title;
}
