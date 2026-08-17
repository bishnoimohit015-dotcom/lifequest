"use client";
import { Check } from "lucide-react";
import { useMemo } from "react";
import {
  dayOfMonth,
  daysInMonth,
  monthDayKeys,
  todayKey,
  weekdayOf,
  WEEKDAY_LETTERS_MON,
  WEEKDAY_LETTERS_SUN,
} from "@/lib/dates";
import { dayCounts, isScheduledOn } from "@/lib/streaks";
import type { Habit } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useApp } from "@/state/app-store";

const CELL = "h-9 w-8 sm:w-9";

/**
 * Sheets-inspired monthly tracker:
 * rows = habits, columns = days of the month, footer = daily score.
 * The habit column sticks while the grid scrolls horizontally on mobile.
 */
export function MonthGrid({ year, month0 }: { year: number; month0: number }) {
  const { state, actions } = useApp();
  const today = todayKey();

  const days = useMemo(() => monthDayKeys(year, month0), [year, month0]);
  const letters = state?.settings.weekStart === 0 ? WEEKDAY_LETTERS_SUN : WEEKDAY_LETTERS_MON;

  // Active habits plus paused habits that still have history this month.
  const habits: Habit[] = useMemo(() => {
    if (!state) return [];
    const monthKeys = new Set(days);
    return [...state.habits]
      .sort((a, b) => a.order - b.order)
      .filter(
        (h) =>
          h.active ||
          Object.keys(state.completions).some(
            (k) => monthKeys.has(k) && state.completions[k][h.id] !== undefined
          )
      );
  }, [state, days]);

  if (!state) return null;
  const threshold = state.settings.streakThreshold;
  const cols = daysInMonth(year, month0);

  return (
    <div className="overflow-x-auto scroll-thin rounded-xl border border-line bg-raised">
      <div style={{ minWidth: `${168 + cols * 36}px` }}>
        {/* Header row: day numbers */}
        <div
          className="grid border-b border-line bg-surface"
          style={{ gridTemplateColumns: `minmax(168px,1.4fr) repeat(${cols}, minmax(36px,1fr))` }}
        >
          <div className="sticky left-0 z-10 flex items-center border-r border-line bg-surface px-3 py-2">
            <span className="text-[10px] font-bold tracking-[0.16em] text-ink-faint uppercase">
              Habit
            </span>
          </div>
          {days.map((key) => {
            const isToday = key === today;
            const wd = weekdayOf(key);
            const letter =
              state.settings.weekStart === 0
                ? letters[wd]
                : letters[(wd + 6) % 7];
            return (
              <div
                key={key}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-1.5",
                  isToday && "bg-moss text-on-moss"
                )}
              >
                <span
                  className={cn(
                    "text-[9px] font-bold",
                    isToday ? "text-on-moss/80" : "text-ink-faint"
                  )}
                >
                  {letter}
                </span>
                <span className="font-display text-xs font-bold tabular-nums">
                  {dayOfMonth(key)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Habit rows */}
        {habits.map((habit) => (
          <div
            key={habit.id}
            className="grid border-b border-line last:border-b-0"
            style={{ gridTemplateColumns: `minmax(168px,1.4fr) repeat(${cols}, minmax(36px,1fr))` }}
          >
            <div className="sticky left-0 z-10 flex items-center gap-2 border-r border-line bg-raised px-3">
              <span className="text-base" aria-hidden="true">
                {habit.icon}
              </span>
              <div className="min-w-0">
                <p
                  className={cn(
                    "truncate text-xs font-bold",
                    habit.active ? "text-ink" : "text-ink-faint line-through"
                  )}
                >
                  {habit.name}
                </p>
                <p className="text-[9px] font-bold tracking-wide text-ink-faint uppercase">
                  +{habit.xp} XP
                </p>
              </div>
            </div>
            {days.map((key) => {
              const future = key > today;
              const completed = state.completions[key]?.[habit.id] !== undefined;
              const scheduled = isScheduledOn(habit, key);
              const isToday = key === today;

              if (future || (!scheduled && !completed)) {
                return (
                  <div
                    key={key}
                    aria-hidden="true"
                    className={cn(
                      "m-auto rounded-md border border-transparent",
                      CELL,
                      future ? "bg-line/30" : "bg-surface",
                      isToday && "ring-1 ring-moss/40 ring-inset"
                    )}
                  />
                );
              }

              return (
                <button
                  key={key}
                  type="button"
                  role="checkbox"
                  aria-checked={completed}
                  aria-label={`${habit.name} on ${key}: ${completed ? "completed" : "not completed"}`}
                  onClick={() => actions.toggleCompletion(habit.id, key)}
                  className={cn(
                    "m-auto grid place-items-center rounded-md border transition-all duration-150",
                    CELL,
                    completed
                      ? "border-moss bg-moss text-on-moss shadow-sm"
                      : "border-line-strong bg-surface text-transparent hover:border-moss/60 hover:bg-moss-tint",
                    isToday && "ring-1 ring-moss/40 ring-inset"
                  )}
                >
                  {completed ? (
                    <Check size={13} strokeWidth={3.2} className="animate-pop-in" />
                  ) : (
                    <Check size={13} strokeWidth={3.2} className="opacity-0" />
                  )}
                </button>
              );
            })}
          </div>
        ))}

        {/* Footer: daily score per day */}
        <div
          className="grid bg-surface"
          style={{ gridTemplateColumns: `minmax(168px,1.4fr) repeat(${cols}, minmax(36px,1fr))` }}
        >
          <div className="sticky left-0 z-10 flex items-center border-r border-line bg-surface px-3 py-2">
            <span className="text-[10px] font-bold tracking-[0.16em] text-ink-faint uppercase">
              Daily score
            </span>
          </div>
          {days.map((key) => {
            const future = key > today;
            const { pct } = dayCounts(state, key);
            return (
              <div key={key} className="flex items-center justify-center py-2">
                {future ? (
                  <span className="text-[10px] text-ink-faint" aria-hidden="true">
                    ·
                  </span>
                ) : (
                  <span
                    className={cn(
                      "rounded px-1 font-display text-[10px] font-bold tabular-nums",
                      pct === null && "text-ink-faint",
                      pct !== null && pct >= 100 && "bg-moss text-on-moss",
                      pct !== null && pct >= threshold && pct < 100 && "bg-moss-soft text-leaf",
                      pct !== null && pct > 0 && pct < threshold && "text-ink-soft",
                      pct !== null && pct === 0 && "text-danger/70"
                    )}
                  >
                    {pct === null ? "–" : `${Math.round(pct)}`}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
