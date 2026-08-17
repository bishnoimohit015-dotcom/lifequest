"use client";
import {
  Award,
  CalendarRange,
  Flame,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useMemo } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { BarChart, HBarList } from "@/components/analytics/charts";
import { Card, CardLabel } from "@/components/ui/card";
import {
  averageDailyCompletion,
  habitConsistency,
  lastNDays,
  totalCompletions,
  weeklyXPSeries,
} from "@/lib/calculations";
import { formatKeyMedium } from "@/lib/dates";
import { useAnimatedNumber } from "@/hooks/use-animated-number";
import { useApp } from "@/state/app-store";

function StatTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: "moss" | "ember" | "gold";
}) {
  return (
    <Card className="p-4">
      <span
        className={
          "grid h-8 w-8 place-items-center rounded-md " +
          (accent === "ember"
            ? "bg-ember-soft text-ember"
            : accent === "gold"
              ? "bg-gold-soft text-gold"
              : "bg-moss-soft text-leaf")
        }
      >
        <Icon size={15} aria-hidden="true" />
      </span>
      <p className="mt-2.5 font-display text-2xl font-bold tracking-tight tabular-nums">
        {value}
      </p>
      <p className="mt-0.5 text-[10px] font-bold tracking-[0.12em] text-ink-faint uppercase">
        {label}
      </p>
    </Card>
  );
}

function Analytics() {
  const { state, stats } = useApp();

  const data = useMemo(() => {
    if (!state) return null;
    const daily = lastNDays(state, 30).map((d) => ({
      label: formatKeyMedium(d.key),
      value: d.counts.pct,
      hint: `${formatKeyMedium(d.key)} — ${d.counts.completed}/${d.counts.scheduled} quests (${d.counts.pct === null ? "rest day" : `${Math.round(d.counts.pct)}%`}) · +${d.xp} XP`,
    }));
    const weekly = weeklyXPSeries(state, 8, state.settings.weekStart).map((w) => ({
      label: w.label,
      value: w.xp,
      highlight: w.current,
      hint: `Week of ${w.label} — ${w.xp.toLocaleString()} XP${w.current ? " (in progress)" : ""}`,
    }));
    const consistency = habitConsistency(state, 30);
    const withData = consistency.filter((c) => c.pct !== null);
    return {
      daily,
      weekly,
      consistency,
      best: withData[0] ?? null,
      worst: withData.length > 1 ? withData[withData.length - 1] : null,
      avgDaily: averageDailyCompletion(state, 30),
      totalDone: totalCompletions(state),
    };
  }, [state]);

  if (!state || !stats || !data) return null;
  const animations = state.settings.animations;
  const weekMax = Math.max(...data.weekly.map((w) => w.value ?? 0), 100);

  return (
    <AppShell>
      <header className="mb-6">
        <p className="text-[11px] font-bold tracking-[0.16em] text-ink-faint uppercase">
          Performance
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Analytics
        </h1>
      </header>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatTile icon={Zap} label="Total XP" value={stats.xp.toLocaleString()} />
        <StatTile icon={Flame} label="Current streak" value={`${stats.currentStreak}d`} accent="ember" />
        <StatTile icon={ShieldCheck} label="Longest streak" value={`${stats.longestStreak}d`} />
        <StatTile icon={Award} label="Completions" value={data.totalDone.toLocaleString()} accent="gold" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <CardLabel>Daily completion</CardLabel>
              <p className="mt-1 text-xs font-semibold text-ink-faint">
                Last 30 days · dashed line = streak threshold ({state.settings.streakThreshold}%)
              </p>
            </div>
            <p className="font-display text-2xl font-bold text-leaf tabular-nums">
              {data.avgDaily === null ? "—" : `${Math.round(data.avgDaily)}%`}
            </p>
          </div>
          <BarChart
            data={data.daily}
            threshold={state.settings.streakThreshold}
            ariaLabel="Daily completion percentage over the last 30 days"
            animate={animations}
            formatValue={(v) => `${v}%`}
          />
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <CardLabel>XP per week</CardLabel>
              <p className="mt-1 text-xs font-semibold text-ink-faint">
                Last 8 weeks · highlighted = current week
              </p>
            </div>
            <p className="font-display text-2xl font-bold text-leaf tabular-nums">
              {data.weekly[data.weekly.length - 1]?.value.toLocaleString()}
            </p>
          </div>
          <BarChart
            data={data.weekly}
            maxValue={weekMax}
            ariaLabel="XP earned per week over the last 8 weeks"
            animate={animations}
            formatValue={(v) => v.toLocaleString()}
          />
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <CardLabel>Habit consistency</CardLabel>
              <p className="mt-1 text-xs font-semibold text-ink-faint">
                Completed / scheduled, last 30 days
              </p>
            </div>
            <CalendarRange size={18} className="text-ink-faint" aria-hidden="true" />
          </div>
          {data.consistency.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-soft">
              No active habits to measure yet.
            </p>
          ) : (
            <HBarList
              animate={animations}
              rows={data.consistency.map((c) => ({
                key: c.habitId,
                icon: c.icon,
                name: c.name,
                pct: c.pct,
                detail: `${c.completed}/${c.scheduled}`,
              }))}
            />
          )}
        </Card>

        <Card className="flex flex-col justify-between p-5 sm:p-6">
          <div>
            <CardLabel>Highlights</CardLabel>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 rounded-lg bg-moss-tint px-4 py-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-moss-soft text-leaf">
                  <TrendingUp size={16} aria-hidden="true" />
                </span>
                {data.best ? (
                  <p className="text-sm font-semibold">
                    <span className="font-display font-bold">Best habit:</span>{" "}
                    {data.best.icon} {data.best.name} —{" "}
                    <span className="text-leaf tabular-nums">{Math.round(data.best.pct ?? 0)}%</span>{" "}
                    over 30 days
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-ink-soft">Complete habits to reveal your best performer.</p>
                )}
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-surface px-4 py-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-ember-soft text-ember">
                  <TrendingDown size={16} aria-hidden="true" />
                </span>
                {data.worst ? (
                  <p className="text-sm font-semibold">
                    <span className="font-display font-bold">Needs love:</span>{" "}
                    {data.worst.icon} {data.worst.name} —{" "}
                    <span className="text-ember tabular-nums">{Math.round(data.worst.pct ?? 0)}%</span>{" "}
                    over 30 days
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-ink-soft">Not enough data for a weakest link.</p>
                )}
              </div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm font-semibold text-ink-soft">
            <div className="flex items-center justify-between">
              <span>Month</span>
              <span className="text-ink tabular-nums">
                {stats.month.pct === null ? "—" : `${Math.round(stats.month.pct)}%`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Week</span>
              <span className="text-ink tabular-nums">
                {stats.week.pct === null ? "—" : `${Math.round(stats.week.pct)}%`}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

export default Analytics;
