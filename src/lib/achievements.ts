import {
  Flame,
  Footprints,
  Crown,
  Medal,
  ShieldCheck,
  Sparkles,
  Swords,
  Target,
  Trophy,
  Zap,
  CalendarCheck2,
  Sun,
  type LucideIcon,
} from "lucide-react";
import {
  averageDailyCompletion,
  hasPerfectDay,
  monthStats,
  totalCompletions,
  totalXP,
} from "./calculations";
import { currentStreak, longestStreak } from "./streaks";
import { calculateLevel } from "./xp";
import type { AppState } from "./types";

export interface AchievementStats {
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  monthPct: number | null;
  monthDaysElapsed: number;
  avgDaily: number | null;
  perfectDay: boolean;
  activeHabits: number;
}

export function computeAchievementStats(state: AppState): AchievementStats {
  const now = new Date();
  const month = monthStats(state, now.getFullYear(), now.getMonth());
  return {
    totalXP: totalXP(state),
    level: calculateLevel(totalXP(state)),
    currentStreak: currentStreak(state, state.settings.streakThreshold),
    longestStreak: longestStreak(state, state.settings.streakThreshold),
    totalCompletions: totalCompletions(state),
    monthPct: month.pct,
    monthDaysElapsed: now.getDate(),
    avgDaily: averageDailyCompletion(state, 30),
    perfectDay: hasPerfectDay(state, 5),
    activeHabits: state.habits.filter((h) => h.active).length,
  };
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  test: (s: AchievementStats) => boolean;
  /** Optional progress hint for locked cards. */
  progress?: (s: AchievementStats) => { current: number; goal: number };
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first-step",
    title: "First Step",
    description: "Complete your first habit.",
    icon: Footprints,
    test: (s) => s.totalCompletions >= 1,
    progress: (s) => ({ current: Math.min(s.totalCompletions, 1), goal: 1 }),
  },
  {
    id: "warming-up",
    title: "Warming Up",
    description: "Complete 50 habits in total.",
    icon: Sparkles,
    test: (s) => s.totalCompletions >= 50,
    progress: (s) => ({ current: Math.min(s.totalCompletions, 50), goal: 50 }),
  },
  {
    id: "century",
    title: "Century",
    description: "Earn 1,000 XP.",
    icon: Zap,
    test: (s) => s.totalXP >= 1000,
    progress: (s) => ({ current: Math.min(s.totalXP, 1000), goal: 1000 }),
  },
  {
    id: "xp-hunter",
    title: "XP Hunter",
    description: "Earn 5,000 XP.",
    icon: Trophy,
    test: (s) => s.totalXP >= 5000,
    progress: (s) => ({ current: Math.min(s.totalXP, 5000), goal: 5000 }),
  },
  {
    id: "rising",
    title: "Rising",
    description: "Reach Level 5.",
    icon: Target,
    test: (s) => s.level >= 5,
    progress: (s) => ({ current: Math.min(s.level, 5), goal: 5 }),
  },
  {
    id: "veteran",
    title: "Veteran",
    description: "Reach Level 10.",
    icon: Medal,
    test: (s) => s.level >= 10,
    progress: (s) => ({ current: Math.min(s.level, 10), goal: 10 }),
  },
  {
    id: "7-day-warrior",
    title: "7 Day Warrior",
    description: "Reach a 7-day streak.",
    icon: Flame,
    test: (s) => s.longestStreak >= 7,
    progress: (s) => ({ current: Math.min(s.longestStreak, 7), goal: 7 }),
  },
  {
    id: "30-day-warrior",
    title: "30 Day Warrior",
    description: "Reach a 30-day streak.",
    icon: ShieldCheck,
    test: (s) => s.longestStreak >= 30,
    progress: (s) => ({ current: Math.min(s.longestStreak, 30), goal: 30 }),
  },
  {
    id: "unstoppable",
    title: "Unstoppable",
    description: "Reach a 50-day streak.",
    icon: Swords,
    test: (s) => s.longestStreak >= 50,
    progress: (s) => ({ current: Math.min(s.longestStreak, 50), goal: 50 }),
  },
  {
    id: "consistency-king",
    title: "Consistency King",
    description: "Reach 90% completion in a month (after day 7).",
    icon: Crown,
    test: (s) => s.monthDaysElapsed >= 7 && (s.monthPct ?? 0) >= 90,
    progress: (s) => ({ current: Math.round(Math.min(s.monthPct ?? 0, 90)), goal: 90 }),
  },
  {
    id: "flawless",
    title: "Flawless",
    description: "Score 100% on a day with 5+ scheduled habits.",
    icon: Sun,
    test: (s) => s.perfectDay,
  },
  {
    id: "full-plate",
    title: "Full Plate",
    description: "Track 10 active habits at once.",
    icon: CalendarCheck2,
    test: (s) => s.activeHabits >= 10,
    progress: (s) => ({ current: Math.min(s.activeHabits, 10), goal: 10 }),
  },
];

/** Returns ids that are satisfied but not yet recorded as unlocked. */
export function evaluateAchievements(
  state: AppState,
  stats: AchievementStats
): string[] {
  const newly: string[] = [];
  for (const def of ACHIEVEMENTS) {
    if (state.achievements[def.id]) continue;
    if (def.test(stats)) newly.push(def.id);
  }
  return newly;
}
