import {
  addDaysKey,
  diffDays,
  todayKey,
  weekdayOf,
  type DateKey,
} from "./dates";
import type { AppState, Habit } from "./types";

/** Is this habit scheduled on this local date? Paused habits and days before
 *  the habit existed are never scheduled, so they can never count as missed. */
export function isScheduledOn(habit: Habit, key: DateKey): boolean {
  if (!habit.active) return false;
  if (key < habit.createdAt) return false;
  const wd = weekdayOf(key);
  switch (habit.frequency.type) {
    case "daily":
      return true;
    case "weekdays":
      return wd >= 1 && wd <= 5;
    case "weekends":
      return wd === 0 || wd === 6;
    case "custom":
      return habit.frequency.days.includes(wd);
  }
}

export interface DayCounts {
  scheduled: number;
  completed: number;
  /** null when nothing was scheduled that day. */
  pct: number | null;
}

/** Daily Score = completed scheduled / scheduled * 100. */
export function dayCounts(state: AppState, key: DateKey): DayCounts {
  let scheduled = 0;
  let completed = 0;
  const day = state.completions[key];
  for (const h of state.habits) {
    if (!isScheduledOn(h, key)) continue;
    scheduled++;
    if (day && day[h.id] !== undefined) completed++;
  }
  return {
    scheduled,
    completed,
    pct: scheduled > 0 ? (completed / scheduled) * 100 : null,
  };
}

/** A day "counts" for streaks when daily score >= threshold.
 *  Days with no scheduled habits never count (and never break). */
export function dayAchieved(
  state: AppState,
  key: DateKey,
  thresholdPct: number
): boolean {
  const { pct } = dayCounts(state, key);
  return pct !== null && pct >= thresholdPct;
}

/** First day the user could possibly have data: earliest habit creation or
 *  earliest completion. Streaks are never measured before this. */
export function dataStartKey(state: AppState): DateKey | null {
  let start: DateKey | null = null;
  const consider = (k: DateKey) => {
    if (start === null || k < start) start = k;
  };
  for (const h of state.habits) consider(h.createdAt);
  for (const k of Object.keys(state.completions)) consider(k);
  return start;
}

/** Consecutive achieved days ending today — or yesterday, if today is still
 *  in progress. Future dates are never counted. */
export function currentStreak(state: AppState, thresholdPct: number): number {
  const today = todayKey();
  let cursor = dayAchieved(state, today, thresholdPct)
    ? today
    : addDaysKey(today, -1);
  let streak = 0;
  while (dayAchieved(state, cursor, thresholdPct)) {
    streak++;
    cursor = addDaysKey(cursor, -1);
  }
  return streak;
}

export function longestStreak(state: AppState, thresholdPct: number): number {
  const start = dataStartKey(state);
  if (!start) return 0;
  const today = todayKey();
  const n = diffDays(start, today);
  let best = 0;
  let run = 0;
  for (let i = 0; i <= n; i++) {
    const key = addDaysKey(start, i);
    if (dayAchieved(state, key, thresholdPct)) {
      run++;
      if (run > best) best = run;
    } else {
      run = 0;
    }
  }
  return best;
}

/** Streak for one habit: consecutive scheduled-and-completed days.
 *  Non-scheduled days are skipped; an uncompleted scheduled day breaks. */
export function habitStreak(state: AppState, habitId: string): number {
  const habit = state.habits.find((h) => h.id === habitId);
  if (!habit) return 0;
  const today = todayKey();
  let cursor = today;
  // Today is allowed to be pending.
  if (isScheduledOn(habit, cursor) && !state.completions[cursor]?.[habitId]) {
    cursor = addDaysKey(cursor, -1);
  }
  let streak = 0;
  let guard = 0;
  while (guard++ < 4000) {
    if (cursor < habit.createdAt) break;
    if (!isScheduledOn(habit, cursor)) {
      cursor = addDaysKey(cursor, -1);
      continue;
    }
    if (state.completions[cursor]?.[habitId] !== undefined) {
      streak++;
      cursor = addDaysKey(cursor, -1);
    } else {
      break;
    }
  }
  return streak;
}
