"use client";
import { Flame, ShieldCheck } from "lucide-react";
import { useApp } from "@/state/app-store";
import { Card, CardLabel } from "@/components/ui/card";

export function StreakCard() {
  const { state, stats } = useApp();
  if (!state || !stats) return null;

  return (
    <Card className="flex flex-col justify-between p-5 sm:p-6">
      <div>
        <CardLabel>Streak</CardLabel>
        <div className="mt-1.5 flex items-center gap-2.5">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-ember-soft text-ember">
            <Flame size={22} aria-hidden="true" />
          </span>
          <p className="font-display text-5xl font-bold tracking-tight tabular-nums">
            {stats.currentStreak}
          </p>
          <p className="text-sm leading-tight font-semibold text-ink-soft">
            day
            <br />
            streak
          </p>
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-leaf" aria-hidden="true" />
            Longest
          </span>
          <span className="tabular-nums">{stats.longestStreak} days</span>
        </div>
        <p className="text-[11px] leading-snug text-ink-faint">
          A day counts at {state.settings.streakThreshold}%+ of scheduled habits.
          Change the rule in Settings.
        </p>
      </div>
    </Card>
  );
}
