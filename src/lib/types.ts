/** Core domain types for LifeQuest. Kept UI-free so the data layer can be
 *  swapped (localStorage -> Supabase) without touching business logic. */

export type Category =
  | "Fitness"
  | "Learning"
  | "Health"
  | "Work"
  | "Finance"
  | "Mindfulness"
  | "Social"
  | "Other";

export const CATEGORIES: Category[] = [
  "Fitness",
  "Learning",
  "Health",
  "Work",
  "Finance",
  "Mindfulness",
  "Social",
  "Other",
];

/** JS weekday convention: 0 = Sunday ... 6 = Saturday */
export type Frequency =
  | { type: "daily" }
  | { type: "weekdays" }
  | { type: "weekends" }
  | { type: "custom"; days: number[] };

export interface Habit {
  id: string;
  name: string;
  /** Emoji chosen by the user — data, not decoration. */
  icon: string;
  category: Category;
  /** XP awarded per completion. */
  xp: number;
  frequency: Frequency;
  /** Weekly target, e.g. "3x per week". Informational. */
  target: number;
  /** Paused habits are excluded from scheduling. */
  active: boolean;
  /** Local date key (YYYY-MM-DD) of creation — never scheduled before this. */
  createdAt: string;
  /** Sort order inside lists. */
  order: number;
}

/**
 * Completion store: dateKey -> habitId -> xpEarned.
 * Presence of the entry === completed. Because XP is derived from this map,
 * duplicate XP is structurally impossible (complete -> undo -> complete
 * nets the exact same total).
 */
export type CompletionMap = Record<string, Record<string, number>>;

export type ThemePreference = "light" | "dark" | "system";
export type StreakThreshold = 50 | 60 | 70 | 80 | 90;

export interface Settings {
  theme: ThemePreference;
  /** 0 = Sunday, 1 = Monday */
  weekStart: 0 | 1;
  streakThreshold: StreakThreshold;
  animations: boolean;
  sound: boolean;
  name: string;
}

export interface AppState {
  version: 1;
  habits: Habit[];
  completions: CompletionMap;
  /** achievementId -> local date key it was unlocked */
  achievements: Record<string, string>;
  settings: Settings;
  meta: {
    createdAt: string;
    onboarded: boolean;
    usedDemo: boolean;
    /** Home Screen install tip dismissed (iOS/Android). */
    installHintDismissed?: boolean;
  };
}

export const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  weekStart: 1,
  streakThreshold: 80,
  animations: true,
  sound: true,
  name: "Adventurer",
};

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
