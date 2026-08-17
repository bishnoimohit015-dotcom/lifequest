"use client";
import { ListPlus, Trophy } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { LevelCard } from "@/components/dashboard/level-card";
import { MonthCard } from "@/components/dashboard/month-card";
import { StreakCard } from "@/components/dashboard/streak-card";
import { TodayCard } from "@/components/dashboard/today-card";
import { HabitRow } from "@/components/habits/habit-row";
import { Button } from "@/components/ui/button";
import { Card, CardLabel } from "@/components/ui/card";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { formatKeyLong, todayKey } from "@/lib/dates";
import { isScheduledOn, habitStreak } from "@/lib/streaks";
import { useApp } from "@/state/app-store";

function QuestList() {
  const { state, actions } = useApp();
  const today = todayKey();

  const scheduled = useMemo(() => {
    if (!state) return [];
    return state.habits
      .filter((h) => h.active && isScheduledOn(h, today))
      .sort((a, b) => a.order - b.order);
  }, [state, today]);

  const streaks = useMemo(() => {
    const map = new Map<string, number>();
    if (state) for (const h of scheduled) map.set(h.id, habitStreak(state, h.id));
    return map;
  }, [state, scheduled]);

  if (!state) return null;

  if (scheduled.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        <p className="font-display text-lg font-semibold">No quests scheduled today</p>
        <p className="max-w-sm text-sm text-ink-soft">
          Add a habit to start earning XP — or check your calendar for rest days.
        </p>
        <Link href="/habits">
          <Button variant="soft">
            <ListPlus size={16} aria-hidden="true" />
            Manage habits
          </Button>
        </Link>
      </Card>
    );
  }

  const done = scheduled.filter(
    (h) => state.completions[today]?.[h.id] !== undefined
  ).length;

  return (
    <section aria-labelledby="quests-heading">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 id="quests-heading" className="font-display text-lg font-bold tracking-tight">
            Today&apos;s quests
          </h2>
          <p className="text-xs font-semibold text-ink-faint tabular-nums">
            {done} of {scheduled.length} complete
          </p>
        </div>
        <Link
          href="/today"
          className="text-xs font-bold text-leaf transition-colors hover:text-moss-hover"
        >
          Full view →
        </Link>
      </div>
      <div className="space-y-2">
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
    </section>
  );
}

function RecentAchievements() {
  const { state } = useApp();
  if (!state) return null;
  const unlocked = Object.entries(state.achievements)
    .sort((a, b) => b[1].localeCompare(a[1]))
    .slice(0, 3);

  return (
    <section aria-labelledby="recent-ach-heading">
      <div className="mb-3 flex items-end justify-between">
        <h2 id="recent-ach-heading" className="font-display text-lg font-bold tracking-tight">
          Recent achievements
        </h2>
        <Link
          href="/achievements"
          className="text-xs font-bold text-leaf transition-colors hover:text-moss-hover"
        >
          All {ACHIEVEMENTS.length} →
        </Link>
      </div>
      {unlocked.length === 0 ? (
        <Card className="flex items-center gap-3 p-5 text-sm text-ink-soft">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gold-soft text-gold">
            <Trophy size={16} aria-hidden="true" />
          </span>
          Complete your first habit to unlock achievements.
        </Card>
      ) : (
        <div className="grid gap-2 sm:grid-cols-3">
          {unlocked.map(([id, day]) => {
            const def = ACHIEVEMENTS.find((a) => a.id === id);
            if (!def) return null;
            const Icon = def.icon;
            return (
              <Card key={id} className="flex items-center gap-3 p-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gold-soft text-gold">
                  <Icon size={16} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold">{def.title}</p>
                  <p className="text-[11px] font-semibold text-ink-faint">{day}</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Dashboard() {
  const today = todayKey();
  return (
    <AppShell>
      <header className="mb-6">
        <p className="text-[11px] font-bold tracking-[0.16em] text-ink-faint uppercase">
          {formatKeyLong(today)}
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Dashboard
        </h1>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LevelCard />
        </div>
        <StreakCard />
        <TodayCard />
        <div className="lg:col-span-2">
          <MonthCard />
        </div>
      </div>

      <div className="mt-8 space-y-8">
        <QuestList />
        <RecentAchievements />
      </div>
    </AppShell>
  );
}

export default Dashboard;
