"use client";
import { Lock } from "lucide-react";
import { useMemo } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ACHIEVEMENTS, computeAchievementStats } from "@/lib/achievements";
import { cn } from "@/lib/utils";
import { useApp } from "@/state/app-store";

function Achievements() {
  const { state } = useApp();

  const rows = useMemo(() => {
    if (!state) return [];
    const stats = computeAchievementStats(state);
    return ACHIEVEMENTS.map((def) => {
      const unlockedAt = state.achievements[def.id] ?? null;
      return {
        def,
        unlockedAt,
        progress: def.progress && !unlockedAt ? def.progress(stats) : null,
      };
    }).sort(
      (a, b) =>
        Number(b.unlockedAt !== null) - Number(a.unlockedAt !== null) ||
        (b.unlockedAt ?? "").localeCompare(a.unlockedAt ?? "")
    );
  }, [state]);

  if (!state) return null;
  const unlockedCount = Object.keys(state.achievements).length;

  return (
    <AppShell>
      <header className="mb-6">
        <p className="text-[11px] font-bold tracking-[0.16em] text-ink-faint uppercase">
          {unlockedCount} of {ACHIEVEMENTS.length} unlocked
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Achievements
        </h1>
        <p className="mt-1 text-sm font-medium text-ink-soft">
          Unlocked automatically as your stats cross each mark.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(({ def, unlockedAt, progress }) => {
          const Icon = def.icon;
          const unlocked = unlockedAt !== null;
          return (
            <Card
              key={def.id}
              className={cn(
                "p-5 transition-all duration-200",
                unlocked
                  ? "border-gold/40 bg-raised"
                  : "border-dashed border-line bg-surface opacity-80"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={cn(
                    "grid h-10 w-10 place-items-center rounded-lg",
                    unlocked ? "bg-gold-soft text-gold" : "bg-line/40 text-ink-faint"
                  )}
                >
                  {unlocked ? (
                    <Icon size={18} aria-hidden="true" />
                  ) : (
                    <Lock size={16} aria-hidden="true" />
                  )}
                </span>
                {unlocked && (
                  <span className="rounded bg-gold-soft px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-gold uppercase">
                    {unlockedAt}
                  </span>
                )}
              </div>
              <p
                className={cn(
                  "mt-3 font-display text-[15px] font-bold tracking-[0.06em] uppercase",
                  !unlocked && "text-ink-soft"
                )}
              >
                {def.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                {def.description}
              </p>
              {progress && (
                <div className="mt-3">
                  <Progress
                    value={(progress.current / progress.goal) * 100}
                    className="h-1.5"
                    barClassName="bg-gold"
                    label={`${def.title} progress: ${progress.current} of ${progress.goal}`}
                  />
                  <p className="mt-1 text-[10px] font-bold text-ink-faint tabular-nums">
                    {progress.current.toLocaleString()} / {progress.goal.toLocaleString()}
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}

export default Achievements;
