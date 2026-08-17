"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { MonthGrid } from "@/components/calendar/month-grid";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { averageDailyCompletion, monthStats, weekStats } from "@/lib/calculations";
import { monthLabel, todayKey } from "@/lib/dates";
import { useApp } from "@/state/app-store";

function SummaryChips({ year, month0 }: { year: number; month0: number }) {
  const { state } = useApp();
  if (!state) return null;
  const month = monthStats(state, year, month0);
  const week = weekStats(state, todayKey(), state.settings.weekStart);
  const avg = averageDailyCompletion(state, 30);

  const items: { label: string; value: string }[] = [
    {
      label: "Monthly completion",
      value: month.pct === null ? "—" : `${Math.round(month.pct)}%`,
    },
    {
      label: "Weekly completion",
      value: week.pct === null ? "—" : `${Math.round(week.pct)}%`,
    },
    {
      label: "Avg daily (30d)",
      value: avg === null ? "—" : `${Math.round(avg)}%`,
    },
    { label: "Completed", value: `${month.completed}/${month.scheduled}` },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map(({ label, value }) => (
        <Card key={label} className="px-4 py-3">
          <p className="font-display text-xl font-bold text-leaf tabular-nums">{value}</p>
          <p className="mt-0.5 text-[10px] font-bold tracking-[0.12em] text-ink-faint uppercase">
            {label}
          </p>
        </Card>
      ))}
    </div>
  );
}

function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month0, setMonth0] = useState(now.getMonth());

  const prev = () => {
    if (month0 === 0) {
      setMonth0(11);
      setYear((y) => y - 1);
    } else setMonth0((m) => m - 1);
  };
  const next = () => {
    if (month0 === 11) {
      setMonth0(0);
      setYear((y) => y + 1);
    } else setMonth0((m) => m + 1);
  };
  const jumpToday = () => {
    setYear(now.getFullYear());
    setMonth0(now.getMonth());
  };

  return (
    <AppShell>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold tracking-[0.16em] text-ink-faint uppercase">
            Monthly tracker
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-[0.06em] uppercase sm:text-3xl">
            {monthLabel(year, month0)}
          </h1>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={prev} aria-label="Previous month">
            <ChevronLeft size={15} aria-hidden="true" />
          </Button>
          <Button variant="outline" size="sm" onClick={jumpToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={next} aria-label="Next month">
            <ChevronRight size={15} aria-hidden="true" />
          </Button>
        </div>
      </header>

      <div className="space-y-4">
        <SummaryChips year={year} month0={month0} />
        <MonthGrid key={`${year}-${month0}`} year={year} month0={month0} />

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-[11px] font-semibold text-ink-faint">
          <span className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded-sm bg-moss" aria-hidden="true" />
            Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded-sm border border-line-strong bg-surface" aria-hidden="true" />
            Missed / open
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded-sm bg-line/40" aria-hidden="true" />
            Not scheduled or future
          </span>
          <span className="ml-auto hidden sm:inline">
            Tap any cell up to today to toggle — backfilling awards XP once.
          </span>
        </div>
      </div>
    </AppShell>
  );
}

export default CalendarPage;
