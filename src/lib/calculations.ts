import {
  addDaysKey,
  diffDays,
  formatKeyMedium,
  monthDayKeys,
  startOfWeekKey,
  todayKey,
  type DateKey,
} from "./dates";
import { dayCounts, isScheduledOn, type DayCounts } from "./streaks";
import type { AppState } from "./types";

/** Total XP is always derived from completion data — single source of truth,
 *  so duplicate XP can never appear. */
export function totalXP(state: AppState): number {
  let xp = 0;
  for (const day of Object.values(state.completions)) {
    for (const v of Object.values(day)) xp += v;
  }
  return xp;
}

export function totalCompletions(state: AppState): number {
  let n = 0;
  for (const day of Object.values(state.completions)) n += Object.keys(day).length;
  return n;
}

export function xpOnDay(state: AppState, key: DateKey): number {
  const day = state.completions[key];
  if (!day) return 0;
  let xp = 0;
  for (const v of Object.values(day)) xp += v;
  return xp;
}

export interface RangeStats {
  scheduled: number;
  completed: number;
  /** null when nothing was scheduled in the range. */
  pct: number | null;
}

/** Aggregate stats over explicit day keys (days with nothing scheduled are
 *  naturally ignored). */
export function rangeStats(state: AppState, keys: DateKey[]): RangeStats {
  let scheduled = 0;
  let completed = 0;
  for (const key of keys) {
    const c = dayCounts(state, key);
    scheduled += c.scheduled;
    completed += c.completed;
  }
  return {
    scheduled,
    completed,
    pct: scheduled > 0 ? (completed / scheduled) * 100 : null,
  };
}

/** Stats for the week containing `key`, counting only elapsed days
 *  (up to today) so the current week isn't penalised for the future. */
export function weekStats(
  state: AppState,
  key: DateKey,
  weekStart: 0 | 1
): RangeStats {
  const start = startOfWeekKey(key, weekStart);
  const today = todayKey();
  const end = start < today ? (diffDays(start, today) < 6 ? today : addDaysKey(start, 6)) : start;
  const keys: DateKey[] = [];
  let cursor = start;
  while (cursor <= end) {
    keys.push(cursor);
    cursor = addDaysKey(cursor, 1);
  }
  return rangeStats(state, keys);
}

/** Stats for a calendar month; future days excluded. */
export function monthStats(
  state: AppState,
  year: number,
  month0: number
): RangeStats {
  const today = todayKey();
  const keys = monthDayKeys(year, month0).filter((k) => k <= today);
  return rangeStats(state, keys);
}

/** Per-day completion for the last `n` days, oldest first. */
export function lastNDays(
  state: AppState,
  n: number
): { key: DateKey; counts: DayCounts; xp: number }[] {
  const today = todayKey();
  const out: { key: DateKey; counts: DayCounts; xp: number }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const key = addDaysKey(today, -i);
    out.push({ key, counts: dayCounts(state, key), xp: xpOnDay(state, key) });
  }
  return out;
}

/** XP earned in each of the last `weeks` weeks (oldest first), labelled by
 *  the week's start date. Current week is partial — that's honest. */
export function weeklyXPSeries(
  state: AppState,
  weeks: number,
  weekStart: 0 | 1
): { label: string; xp: number; current: boolean }[] {
  const today = todayKey();
  const thisWeekStart = startOfWeekKey(today, weekStart);
  const out: { label: string; xp: number; current: boolean }[] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const start = addDaysKey(thisWeekStart, -7 * w);
    const end = addDaysKey(start, 6);
    let xp = 0;
    for (const [key, day] of Object.entries(state.completions)) {
      if (key >= start && key <= end) {
        for (const v of Object.values(day)) xp += v;
      }
    }
    out.push({ label: formatKeyMedium(start), xp, current: w === 0 });
  }
  return out;
}

export interface HabitConsistency {
  habitId: string;
  name: string;
  icon: string;
  scheduled: number;
  completed: number;
  pct: number | null;
}

/** Per-habit completion over the last `days` days (scheduled days only). */
export function habitConsistency(
  state: AppState,
  days: number
): HabitConsistency[] {
  const today = todayKey();
  const keys: DateKey[] = [];
  for (let i = days - 1; i >= 0; i--) keys.push(addDaysKey(today, -i));
  return state.habits
    .filter((h) => h.active)
    .map((h) => {
      let scheduled = 0;
      let completed = 0;
      for (const key of keys) {
        if (!isScheduledOn(h, key)) continue;
        scheduled++;
        if (state.completions[key]?.[h.id] !== undefined) completed++;
      }
      return {
        habitId: h.id,
        name: h.name,
        icon: h.icon,
        scheduled,
        completed,
        pct: scheduled > 0 ? (completed / scheduled) * 100 : null,
      };
    })
    .sort((a, b) => (b.pct ?? -1) - (a.pct ?? -1));
}

/** Average daily score over the last `days` days (days with scheduled > 0). */
export function averageDailyCompletion(state: AppState, days: number): number | null {
  const series = lastNDays(state, days);
  const values = series
    .map((d) => d.counts.pct)
    .filter((p): p is number => p !== null);
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Has the user ever scored 100% on a day with at least `minScheduled` habits? */
export function hasPerfectDay(state: AppState, minScheduled: number): boolean {
  for (const key of Object.keys(state.completions)) {
    const c = dayCounts(state, key);
    if (c.scheduled >= minScheduled && c.completed === c.scheduled) return true;
  }
  return false;
}
