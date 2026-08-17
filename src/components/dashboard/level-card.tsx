"use client";
import { ChevronRight, Zap } from "lucide-react";
import Link from "next/link";
import { useAnimatedNumber } from "@/hooks/use-animated-number";
import { levelTitle } from "@/lib/xp";
import { useApp } from "@/state/app-store";
import { Card, CardLabel } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function LevelCard() {
  const { state, stats } = useApp();
  const animations = state?.settings.animations ?? true;
  const xp = useAnimatedNumber(stats?.xp ?? 0, animations);
  const remaining = useAnimatedNumber(stats?.levelInfo.remaining ?? 0, animations);
  if (!stats) return null;
  const { levelInfo } = stats;

  return (
    <Card className="relative overflow-hidden p-5 sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-moss-soft blur-2xl"
      />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <CardLabel>Level</CardLabel>
          <div className="mt-1 flex items-baseline gap-3">
            <p className="font-display text-6xl font-bold tracking-tight tabular-nums">
              {levelInfo.level}
            </p>
            <span className="rounded-md bg-moss-soft px-2 py-1 text-[11px] font-bold tracking-[0.14em] text-leaf uppercase">
              {levelTitle(levelInfo.level)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <CardLabel>Total XP</CardLabel>
          <p className="mt-1 inline-flex items-center gap-1.5 font-display text-3xl font-bold text-leaf tabular-nums">
            <Zap size={20} aria-hidden="true" />
            {xp.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="relative mt-5">
        <Progress
          value={levelInfo.pct}
          className="h-3"
          label={`${Math.round(levelInfo.pct)}% of the way to Level ${levelInfo.level + 1}`}
        />
        <div className="mt-2 flex items-center justify-between text-xs font-semibold text-ink-soft">
          <span className="tabular-nums">
            {levelInfo.intoLevel.toLocaleString()} / {levelInfo.span.toLocaleString()} XP
          </span>
          <span className="tabular-nums">{remaining.toLocaleString()} XP to Level {levelInfo.level + 1}</span>
        </div>
      </div>

      <Link
        href="/analytics"
        className="relative mt-4 inline-flex items-center gap-1 text-xs font-bold text-leaf transition-colors hover:text-moss-hover"
      >
        See how you earn XP
        <ChevronRight size={13} aria-hidden="true" />
      </Link>
    </Card>
  );
}
