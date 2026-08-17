"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  computeAchievementStats,
  evaluateAchievements,
  ACHIEVEMENTS,
} from "@/lib/achievements";
import {
  monthStats,
  totalXP,
  weekStats,
  xpOnDay,
  type RangeStats,
} from "@/lib/calculations";
import { buildDemoState } from "@/lib/demo";
import { DEFAULT_HABITS, seedsToHabits } from "@/lib/default-habits";
import { todayKey } from "@/lib/dates";
import { sounds } from "@/lib/sound";
import {
  createFreshState,
  loadAppState,
  parseBackup,
  resetAppState,
  saveAppState,
  serializeBackup,
} from "@/lib/storage";
import {
  currentStreak,
  dayCounts,
  longestStreak,
  type DayCounts,
} from "@/lib/streaks";
import type { AppState, Habit, Settings } from "@/lib/types";
import { uid } from "@/lib/utils";
import { getLevelProgress, type LevelInfo } from "@/lib/xp";

export interface Toast {
  id: string;
  tone: "level" | "achievement" | "info";
  title: string;
  body?: string;
}

export interface DerivedStats {
  xp: number;
  levelInfo: LevelInfo;
  currentStreak: number;
  longestStreak: number;
  today: DayCounts;
  todayXP: number;
  week: RangeStats;
  month: RangeStats;
}

export type OnboardingChoice =
  | { mode: "demo" }
  | { mode: "empty" }
  | { mode: "selected"; selectedIndexes: number[] };

interface Actions {
  completeOnboarding(choice: OnboardingChoice): void;
  toggleCompletion(habitId: string, dateKey?: string): void;
  addHabit(data: Omit<Habit, "id" | "createdAt" | "order">): void;
  updateHabit(id: string, patch: Partial<Omit<Habit, "id">>): void;
  deleteHabit(id: string): void;
  moveHabit(id: string, dir: -1 | 1): void;
  updateSettings(patch: Partial<Settings>): void;
  resetDemo(): void;
  clearAll(): void;
  /** Portable JSON snapshot — used for device-to-device transfer. */
  exportBackup(): string;
  importBackup(json: string): { ok: boolean; error?: string };
  dismissInstallHint(): void;
}

interface AppContextValue {
  state: AppState | null;
  ready: boolean;
  stats: DerivedStats | null;
  toasts: Toast[];
  dismissToast(id: string): void;
  actions: Actions;
}

const AppContext = createContext<AppContextValue | null>(null);

function computeDerived(state: AppState): DerivedStats {
  const today = todayKey();
  const now = new Date();
  const xp = totalXP(state);
  return {
    xp,
    levelInfo: getLevelProgress(xp),
    currentStreak: currentStreak(state, state.settings.streakThreshold),
    longestStreak: longestStreak(state, state.settings.streakThreshold),
    today: dayCounts(state, today),
    todayXP: xpOnDay(state, today),
    week: weekStats(state, today, state.settings.weekStart),
    month: monthStats(state, now.getFullYear(), now.getMonth()),
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Hydrate from storage once on mount (SSR-safe).
  useEffect(() => {
    setState(loadAppState() ?? createFreshState());
    setReady(true);
  }, []);

  // Persist on every change.
  useEffect(() => {
    if (ready && state) saveAppState(state);
  }, [ready, state]);

  const pushToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = uid();
    setToasts((prev) => [...prev.slice(-2), { ...toast, id }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Theme: apply class + follow system preference when set to "system".
  const theme = state?.settings.theme ?? "system";
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && mq.matches);
      document.documentElement.classList.toggle("dark", dark);
    };
    apply();
    if (theme === "system") {
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [theme]);

  // Animations preference: kill transitions/app keyframes app-wide.
  const animations = state?.settings.animations ?? true;
  useEffect(() => {
    document.documentElement.classList.toggle("no-anim", !animations);
  }, [animations]);

  const stats = useMemo(() => (state ? computeDerived(state) : null), [state]);

  // Level-up detection.
  const prevLevelRef = useRef<number | null>(null);
  useEffect(() => {
    if (!stats || !state) return;
    const level = stats.levelInfo.level;
    const prev = prevLevelRef.current;
    prevLevelRef.current = level;
    if (prev !== null && level > prev) {
      if (state.settings.sound) sounds.levelUp();
      pushToast({
        tone: "level",
        title: `LEVEL UP — you reached Level ${level}`,
        body: `${stats.levelInfo.remaining} XP to Level ${level + 1}. Keep going.`,
      });
    }
  }, [stats, state, pushToast]);

  // Achievement evaluation — records unlocks in state, toasts once each.
  useEffect(() => {
    if (!state || !state.meta.onboarded) return;
    const achStats = computeAchievementStats(state);
    const newly = evaluateAchievements(state, achStats);
    if (newly.length === 0) return;
    if (state.settings.sound) sounds.achievement();
    const first = ACHIEVEMENTS.find((a) => a.id === newly[0]);
    pushToast({
      tone: "achievement",
      title: first ? `Achievement — ${first.title}` : "Achievement unlocked",
      body:
        newly.length > 1
          ? first
            ? `${first.description} (+${newly.length - 1} more)`
            : `${newly.length} achievements unlocked`
          : first?.description,
    });
    const day = todayKey();
    setState((prev) =>
      prev
        ? {
            ...prev,
            achievements: {
              ...prev.achievements,
              ...Object.fromEntries(newly.map((id) => [id, day])),
            },
          }
        : prev
    );
  }, [state, pushToast]);

  const actions = useMemo<Actions>(() => {
    const withSound = (fn: () => void, play: keyof typeof sounds) => {
      fn();
      if (state?.settings.sound) sounds[play]();
    };
    return {
      completeOnboarding(choice) {
        setState((prev) => {
          const settings = prev?.settings;
          if (choice.mode === "demo") {
            return buildDemoState(settings);
          }
          const base = createFreshState(settings);
          if (choice.mode === "selected") {
            const seeds = DEFAULT_HABITS.filter((_, i) =>
              choice.selectedIndexes.includes(i)
            );
            base.habits = seedsToHabits(seeds);
          }
          return { ...base, meta: { ...base.meta, onboarded: true } };
        });
      },

      toggleCompletion(habitId, dateKey = todayKey()) {
        const current = state;
        if (!current) return;
        const habit = current.habits.find((h) => h.id === habitId);
        if (!habit) return;
        const already = current.completions[dateKey]?.[habitId] !== undefined;
        withSound(
          () =>
            setState((prev) => {
              if (!prev) return prev;
              const day = { ...(prev.completions[dateKey] ?? {}) };
              if (day[habitId] !== undefined) {
                delete day[habitId];
              } else {
                day[habitId] = habit.xp;
              }
              const completions = { ...prev.completions };
              if (Object.keys(day).length === 0) delete completions[dateKey];
              else completions[dateKey] = day;
              return { ...prev, completions };
            }),
          already ? "undo" : "complete"
        );
      },

      addHabit(data) {
        setState((prev) => {
          if (!prev) return prev;
          const order = prev.habits.length
            ? Math.max(...prev.habits.map((h) => h.order)) + 1
            : 0;
          const habit: Habit = {
            ...data,
            id: uid(),
            createdAt: todayKey(),
            order,
          };
          return { ...prev, habits: [...prev.habits, habit] };
        });
      },

      updateHabit(id, patch) {
        setState((prev) =>
          prev
            ? {
                ...prev,
                habits: prev.habits.map((h) =>
                  h.id === id ? { ...h, ...patch, id } : h
                ),
              }
            : prev
        );
      },

      deleteHabit(id) {
        // Past completions (and their XP) are kept — the history was earned.
        setState((prev) =>
          prev
            ? { ...prev, habits: prev.habits.filter((h) => h.id !== id) }
            : prev
        );
      },

      moveHabit(id, dir) {
        setState((prev) => {
          if (!prev) return prev;
          const sorted = [...prev.habits].sort((a, b) => a.order - b.order);
          const idx = sorted.findIndex((h) => h.id === id);
          const swap = idx + dir;
          if (idx < 0 || swap < 0 || swap >= sorted.length) return prev;
          const a = sorted[idx];
          const b = sorted[swap];
          return {
            ...prev,
            habits: prev.habits.map((h) => {
              if (h.id === a.id) return { ...h, order: b.order };
              if (h.id === b.id) return { ...h, order: a.order };
              return h;
            }),
          };
        });
      },

      updateSettings(patch) {
        setState((prev) =>
          prev ? { ...prev, settings: { ...prev.settings, ...patch } } : prev
        );
      },

      resetDemo() {
        setState((prev) => buildDemoState(prev?.settings));
        pushToast({ tone: "info", title: "Demo data loaded", body: "42 days of history, ready to explore." });
      },

      clearAll() {
        resetAppState();
        setState((prev) => createFreshState(prev?.settings));
        prevLevelRef.current = null;
      },

      exportBackup() {
        return state ? serializeBackup(state) : "";
      },

      importBackup(json) {
        const result = parseBackup(json);
        if (!result.ok) return { ok: false, error: result.error };
        // Level-up toasts shouldn't fire for imported history.
        prevLevelRef.current = null;
        setState(result.state);
        pushToast({
          tone: "info",
          title: "Backup restored",
          body: `${result.state.habits.length} habits and ${Object.keys(result.state.completions).length} tracked days.`,
        });
        return { ok: true };
      },

      dismissInstallHint() {
        setState((prev) =>
          prev
            ? { ...prev, meta: { ...prev.meta, installHintDismissed: true } }
            : prev
        );
      },
    };
  }, [state, pushToast]);

  const value = useMemo<AppContextValue>(
    () => ({ state, ready, stats, toasts, dismissToast, actions }),
    [state, ready, stats, toasts, dismissToast, actions]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
