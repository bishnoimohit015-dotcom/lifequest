"use client";
import { Flame, Medal, ShieldCheck, Trophy, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardLabel } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { levelTitle } from "@/lib/xp";
import { useApp } from "@/state/app-store";

function Profile() {
  const { state, stats, actions } = useApp();
  const [name, setName] = useState<string | null>(null);

  if (!state || !stats) return null;
  const displayName = name ?? state.settings.name;
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "A";
  const joined = new Date(state.meta.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const unlocked = Object.keys(state.achievements).length;

  const commitName = () => {
    if (name !== null && name.trim().length > 0) {
      actions.updateSettings({ name: name.trim() });
    }
    setName(null);
  };

  return (
    <AppShell>
      <header className="mb-6">
        <p className="text-[11px] font-bold tracking-[0.16em] text-ink-faint uppercase">
          Character sheet
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Profile
        </h1>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-moss font-display text-2xl font-bold text-on-moss">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              {name === null ? (
                <button
                  type="button"
                  onClick={() => setName(state.settings.name)}
                  className="group flex items-center gap-2 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-moss-tint"
                  aria-label={`Edit name, currently ${state.settings.name}`}
                >
                  <span className="truncate font-display text-xl font-bold tracking-tight">
                    {state.settings.name}
                  </span>
                  <span className="text-[10px] font-bold text-ink-faint opacity-0 transition-opacity group-hover:opacity-100">
                    EDIT
                  </span>
                </button>
              ) : (
                <form
                  className="flex items-center gap-1.5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    commitName();
                  }}
                >
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={commitName}
                    aria-label="Your name"
                    maxLength={30}
                    className="w-full min-w-0 rounded-md border border-moss bg-surface px-2 py-1 font-display text-lg font-bold"
                  />
                </form>
              )}
              <p className="mt-0.5 text-xs font-bold tracking-[0.14em] text-leaf uppercase">
                Level {stats.levelInfo.level} · {levelTitle(stats.levelInfo.level)}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-ink-faint">
                Questing since {joined}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-baseline justify-between">
              <p className="text-[11px] font-bold tracking-[0.14em] text-ink-faint uppercase">
                Level progress
              </p>
              <p className="text-xs font-bold text-ink-soft tabular-nums">
                {stats.levelInfo.remaining.toLocaleString()} XP to LV{" "}
                {stats.levelInfo.level + 1}
              </p>
            </div>
            <Progress
              value={stats.levelInfo.pct}
              className="mt-2"
              label={`Level progress ${Math.round(stats.levelInfo.pct)}%`}
            />
          </div>

          <div className="mt-6">
            <div className="flex items-baseline justify-between">
              <p className="text-[11px] font-bold tracking-[0.14em] text-ink-faint uppercase">
                Monthly consistency
              </p>
              <p className="font-display text-sm font-bold text-leaf tabular-nums">
                {stats.month.pct === null ? "—" : `${Math.round(stats.month.pct)}%`}
              </p>
            </div>
            <Progress
              value={stats.month.pct ?? 0}
              className="mt-2"
              barClassName="bg-leaf"
              label={`Monthly consistency ${Math.round(stats.month.pct ?? 0)}%`}
            />
          </div>
        </Card>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Card className="p-4 text-center">
              <Zap size={16} className="mx-auto text-leaf" aria-hidden="true" />
              <p className="mt-1.5 font-display text-xl font-bold tabular-nums">
                {stats.xp.toLocaleString()}
              </p>
              <p className="text-[10px] font-bold tracking-[0.1em] text-ink-faint uppercase">
                Total XP
              </p>
            </Card>
            <Card className="p-4 text-center">
              <Flame size={16} className="mx-auto text-ember" aria-hidden="true" />
              <p className="mt-1.5 font-display text-xl font-bold tabular-nums">
                {stats.currentStreak}d
              </p>
              <p className="text-[10px] font-bold tracking-[0.1em] text-ink-faint uppercase">
                Streak
              </p>
            </Card>
            <Card className="p-4 text-center">
              <ShieldCheck size={16} className="mx-auto text-leaf" aria-hidden="true" />
              <p className="mt-1.5 font-display text-xl font-bold tabular-nums">
                {stats.longestStreak}d
              </p>
              <p className="text-[10px] font-bold tracking-[0.1em] text-ink-faint uppercase">
                Longest
              </p>
            </Card>
            <Card className="p-4 text-center">
              <Medal size={16} className="mx-auto text-gold" aria-hidden="true" />
              <p className="mt-1.5 font-display text-xl font-bold tabular-nums">
                {unlocked}/{ACHIEVEMENTS.length}
              </p>
              <p className="text-[10px] font-bold tracking-[0.1em] text-ink-faint uppercase">
                Medals
              </p>
            </Card>
          </div>

          <Card className="p-5">
            <CardLabel>Latest medals</CardLabel>
            {unlocked === 0 ? (
              <p className="mt-3 text-sm text-ink-soft">
                No achievements yet — your first completion unlocks one.
              </p>
            ) : (
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {Object.entries(state.achievements)
                  .sort((a, b) => b[1].localeCompare(a[1]))
                  .slice(0, 6)
                  .map(([id, day]) => {
                    const def = ACHIEVEMENTS.find((a) => a.id === id);
                    if (!def) return null;
                    const Icon = def.icon;
                    return (
                      <li key={id} className="flex items-center gap-2.5 rounded-lg bg-moss-tint px-3 py-2.5">
                        <Trophy size={14} className="shrink-0 text-gold" aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold">{def.title}</p>
                          <p className="text-[10px] font-semibold text-ink-faint">{day}</p>
                        </div>
                        <Icon size={14} className="shrink-0 text-leaf" aria-hidden="true" />
                      </li>
                    );
                  })}
              </ul>
            )}
            <Link href="/achievements" className="mt-4 inline-block">
              <Button variant="soft" size="sm">
                View all achievements
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

export default Profile;
