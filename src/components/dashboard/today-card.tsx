"use client";
import { ChevronRight, Zap } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/state/app-store";
import { Card, CardLabel } from "@/components/ui/card";
import { Donut } from "@/components/dashboard/donut";

export function TodayCard() {
  const { stats } = useApp();
  if (!stats) return null;
  const pct = stats.today.pct ?? 0;

  return (
    <Card className="p-5 sm:p-6">
      <CardLabel>Today</CardLabel>
      <div className="mt-3 flex items-center gap-5">
        <Donut value={pct} label="Today's completion">
          <div className="text-center">
            <p className="font-display text-2xl font-bold tabular-nums">
              {Math.round(pct)}
              <span className="text-sm">%</span>
            </p>
          </div>
        </Donut>
        <div className="min-w-0 flex-1 space-y-2.5">
          <p className="text-sm font-semibold text-ink-soft">
            <span className="font-display text-lg font-bold text-ink tabular-nums">
              {stats.today.completed}
            </span>
            <span className="tabular-nums"> / {stats.today.scheduled}</span>{" "}
            completed
          </p>
          <p className="inline-flex items-center gap-1 font-display text-sm font-bold text-leaf tabular-nums">
            <Zap size={14} aria-hidden="true" />+{stats.todayXP} XP today
          </p>
          <Link
            href="/today"
            className="flex items-center gap-1 text-xs font-bold text-leaf transition-colors hover:text-moss-hover"
          >
            Open today&apos;s quests
            <ChevronRight size={13} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
