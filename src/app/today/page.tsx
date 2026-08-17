"use client";
import { Flame, Moon, Zap } from "lucide-react";
import { useMemo } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { HabitRow } from "@/components/habits/habit-row";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { lastNDays } from "@/lib/calculations";
import {
  dayOfMonth,
  formatKeyLong,
  todayKey,
  WEEKDAY_LETTERS_SUN,
} from "@/lib/dates";
import { describeFrequency } from "@/lib/format";
import type { Habit } from "@/lib/types";
import { dayAchieved, habitStreak, isScheduledOn } from "@/lib/streaks";
import { cn } from "@/lib/utils";
import { useApp } from "@/state/app-store";

function WeekStrip() {
  const { state } = useApp();
  const today = todayKey();
  if (!state) return null;
  const days = lastNDays(state, 7);
  const threshold = state.settings.streakThreshold;

  return (
    <ol className="grid grid-cols-7 gap-1.5" aria-label="Last seven days">
      {days.map(({ key, counts }) => {
        const isToday = key === today;
        const achieved = dayAchieved(state, key, threshold);
        const partial = !achieved && counts.completed > 0;
        return (
          <li
            key={key}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-lg border py-2.5",
              isToday ? "border-moss/60 bg-moss-tint" : "border-line bg-raised"
            )}
          >
            <span className="text-[10px] font-bold text-ink-faint">
              {WEEKDAY_LETTERS_SUN[new Date(key + "T12:00:00").getDay()]}
            </span>
            <span className="font-display text-sm font-bold tabular-nums">
              {dayOfMonth(key)}
            </span>
            <span
              aria-hidden="true"
              className={cn(
                "h-2.5 w-2.5 rounded-full border-2",
                achieved
                  ? "border-moss bg-moss"
                  : partial
                    ? "border-moss bg-transparent"
                    : "border-line-strong bg-transparent"
              )}
            />
            <span className="sr-only">
              {key}: {counts.completed} of {counts.scheduled} completed
              {achieved ? ", streak day" : ""}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Today() {
  const { state, stats, actions } = useApp();
  const today = todayKey();

  const { scheduled, resting } = useMemo(() => {
    if (!state) return { scheduled: [] as Habit[], resting: [] as Habit[] };
    const sorted = [...state.habits].sort((a, b) => a.order - b.order);
    return {
      scheduled: sorted.filter((h) => isScheduledOn(h, today)),
      resting: sorted.filter((h) => !h.active || !isScheduledOn(h, today)),
    };
  }, [state, today]);

  const streaks = useMemo(() => {
    const map = new Map<string, number>();
    if (state) for (const h of scheduled) map.set(h.id, habitStreak(state, h.id));
    return map;
  }, [state, scheduled]);

  if (!state || !stats) return null;
  const pct = stats.today.pct ?? 0;

  return (
    <AppShell>
      <header className="mb-6">
        <p className="text-[11px] font-bold tracking-[0.16em] text-ink-faint uppercase">
          {formatKeyLong(today)}
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Today&apos;s Quests
        </h1>
      </header>

      <Card className="mb-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <div>
            <p className="font-display text-3xl font-bold tabular-nums">
              {stats.today.completed}
              <span className="text-lg text-ink-faint"> / {stats.today.scheduled}</span>
            </p>
            <p className="text-[11px] font-bold tracking-[0.12em] text-ink-faint uppercase">
              completed
            </p>
          </div>
          <div>
            <p className="inline-flex items-center gap-1.5 font-display text-3xl font-bold text-leaf tabular-nums">
              <Zap size={22} aria-hidden="true" />+{stats.todayXP}
            </p>
            <p className="text-[11px] font-bold tracking-[0.12em] text-ink-faint uppercase">
              XP today
            </p>
          </div>
          <div>
            <p className="inline-flex items-center gap-1.5 font-display text-3xl font-bold text-ember tabular-nums">
              <Flame size={22} aria-hidden="true" />
              {stats.currentStreak}
            </p>
            <p className="text-[11px] font-bold tracking-[0.12em] text-ink-faint uppercase">
              day streak
            </p>
          </div>
          <div className="min-w-40 flex-1">
            <div className="flex items-baseline justify-between">
              <p className="text-[11px] font-bold tracking-[0.12em] text-ink-faint uppercase">
                Daily score
              </p>
              <p className="font-display text-sm font-bold tabular-nums">
                {Math.round(pct)}%
              </p>
            </div>
            <Progress value={pct} className="mt-2" label={`Daily score ${Math.round(pct)}%`} />
          </div>
        </div>
      </Card>

      <div className="mb-6">
        <WeekStrip />
      </div>

      {scheduled.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 p-10 text-center">
          <Moon size={28} className="text-ink-faint" aria-hidden="true" />
          <p className="font-display text-lg font-semibold">Rest day</p>
          <p className="max-w-sm text-sm text-ink-soft">
            Nothing is scheduled today. Streaks only measure days that have quests.
          </p>
        </Card>
      ) : (
        <div className="space-y-2" role="list" aria-label="Scheduled habits">
          {scheduled.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              completed={state.completions[today]?.[habit.id] !== undefined}
              streak={streaks.get(habit.id)}
              onToggle={() => actions.toggleCompletion(habit.id)}
            />
          ))}
        </div>
      )}

      {resting.length > 0 && (
        <section className="mt-8" aria-labelledby="resting-heading">
          <h2
            id="resting-heading"
            className="mb-3 text-[11px] font-bold tracking-[0.16em] text-ink-faint uppercase"
          >
            Not scheduled today
          </h2>
          <div className="space-y-1.5">
            {resting.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center gap-3 rounded-lg border border-dashed border-line px-4 py-2.5 opacity-70"
              >
                <span className="text-base" aria-hidden="true">
                  {habit.icon}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink-soft">
                  {habit.name}
                </span>
                <span className="text-[11px] font-bold text-ink-faint">
                  {habit.active ? describeFrequency(habit.frequency) : "Paused"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}

export default Today;
