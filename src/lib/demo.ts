import { addDaysKey, todayKey } from "./dates";
import { DEFAULT_HABITS } from "./default-habits";
import { isScheduledOn } from "./streaks";
import { createFreshState } from "./storage";
import type { AppState, CompletionMap, Habit, Settings } from "./types";

/** Deterministic PRNG so "Reset Demo Data" always feels curated. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Realistic per-habit adherence for the unforced history window. */
const ADHERENCE = [0.8, 0.75, 0.82, 0.7, 0.85, 0.75, 0.7, 0.8, 0.9, 0.85];

const HISTORY_DAYS = 42; // six weeks — covers the previous month nicely
const FORCED_PERFECT_DAYS = 31; // guarantees a 31-day current streak

export function buildDemoState(settings?: Settings): AppState {
  const rng = mulberry32(1337);
  const today = todayKey();
  const start = addDaysKey(today, -(HISTORY_DAYS - 1));

  const habits: Habit[] = DEFAULT_HABITS.map((s, i) => ({
    id: `demo-${i + 1}`,
    name: s.name,
    icon: s.icon,
    category: s.category,
    xp: s.xp,
    frequency: s.frequency,
    target: s.target,
    active: true,
    createdAt: start,
    order: i,
  }));

  const completions: CompletionMap = {};
  for (let off = 0; off < HISTORY_DAYS; off++) {
    const key = addDaysKey(start, off);
    const daysAgo = HISTORY_DAYS - 1 - off;
    const forced = daysAgo < FORCED_PERFECT_DAYS;
    for (const [i, habit] of habits.entries()) {
      if (!isScheduledOn(habit, key)) continue;
      if (forced || rng() < ADHERENCE[i]) {
        (completions[key] ??= {})[habit.id] = habit.xp;
      }
    }
  }

  const state = createFreshState(settings);
  return {
    ...state,
    habits,
    completions,
    achievements: {}, // evaluated + recorded by the store on load
    meta: { ...state.meta, onboarded: true, usedDemo: true },
  };
}
