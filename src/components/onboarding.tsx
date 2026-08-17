"use client";
import { ArrowRight, Check, Flame, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { BrandMark } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { DEFAULT_HABITS } from "@/lib/default-habits";
import { CATEGORY_STYLES } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useApp } from "@/state/app-store";

const LOOP = [
  { label: "HABIT", icon: Check },
  { label: "XP", icon: Zap },
  { label: "LEVEL", icon: Sparkles },
  { label: "STREAK", icon: Flame },
];

export function Onboarding() {
  const { actions } = useApp();
  const [selected, setSelected] = useState<boolean[]>(() =>
    DEFAULT_HABITS.map(() => true)
  );
  const selectedCount = selected.filter(Boolean).length;

  const toggle = (i: number) =>
    setSelected((prev) => prev.map((v, j) => (j === i ? !v : v)));

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[minmax(0,44%)_minmax(0,56%)]">
      {/* Brand panel */}
      <section className="relative overflow-hidden bg-moss px-6 py-10 text-on-moss lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "radial-gradient(var(--on-moss) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-3">
            <BrandMark size={36} />
            <span className="font-display text-lg font-bold tracking-[0.18em]">
              LIFEQUEST
            </span>
          </div>
          <h1 className="mt-10 font-display text-4xl leading-[1.04] font-bold tracking-tight sm:text-5xl lg:mt-16 lg:text-[3.4rem]">
            Turn your life into a game.
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-on-moss/80">
            Complete real-life habits, earn XP, build streaks and level up.
            A minimalist daily tracker with light RPG progression — no noise,
            just momentum.
          </p>
        </div>

        <div className="relative mt-10 lg:mt-0">
          <div className="flex flex-wrap items-center gap-2">
            {LOOP.map(({ label, icon: Icon }, i) => (
              <span key={label} className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-on-moss/25 bg-on-moss/10 px-3 py-1.5 text-[11px] font-bold tracking-[0.14em]">
                  <Icon size={12} aria-hidden="true" />
                  {label}
                </span>
                {i < LOOP.length - 1 && (
                  <ArrowRight size={14} className="opacity-60" aria-hidden="true" />
                )}
              </span>
            ))}
          </div>
          <p className="mt-6 text-xs text-on-moss/60">
            Your progress lives in this browser — private by default.
          </p>
        </div>
      </section>

      {/* Habit picker */}
      <section className="px-5 py-8 sm:px-8 lg:overflow-y-auto lg:py-12">
        <div className="mx-auto w-full max-w-xl">
          <p className="text-[11px] font-bold tracking-[0.16em] text-ink-faint uppercase">
            Step 1 of 1
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">
            Choose your starting quests
          </h2>
          <p className="mt-1.5 text-sm text-ink-soft">
            Ten sensible defaults. Keep, drop — everything stays editable later.
          </p>

          <ul className="mt-6 space-y-2">
            {DEFAULT_HABITS.map((habit, i) => {
              const on = selected[i];
              return (
                <li key={habit.name}>
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    aria-pressed={on}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition-all duration-150",
                      on
                        ? "border-moss/50 bg-moss-tint shadow-sm"
                        : "border-line bg-raised opacity-70 hover:opacity-100"
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "grid h-5.5 w-5.5 shrink-0 place-items-center rounded-md border-2 transition-colors",
                        on ? "border-moss bg-moss text-on-moss" : "border-line-strong bg-transparent"
                      )}
                    >
                      {on && <Check size={13} strokeWidth={3.2} />}
                    </span>
                    <span className="text-lg" aria-hidden="true">
                      {habit.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {habit.name}
                      </span>
                      <span
                        className={cn(
                          "mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase",
                          CATEGORY_STYLES[habit.category]
                        )}
                      >
                        {habit.category}
                      </span>
                    </span>
                    <span className="font-display text-sm font-bold text-leaf tabular-nums">
                      +{habit.xp} XP
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-7 flex flex-col gap-2.5">
            <Button
              size="lg"
              disabled={selectedCount === 0}
              onClick={() =>
                actions.completeOnboarding({
                  mode: "selected",
                  selectedIndexes: selected
                    .map((v, i) => (v ? i : -1))
                    .filter((i) => i >= 0),
                })
              }
            >
              Start tracking
              <span className="rounded bg-on-moss/20 px-1.5 py-0.5 text-xs tabular-nums">
                {selectedCount}
              </span>
            </Button>
            <Button
              size="lg"
              variant="soft"
              onClick={() => actions.completeOnboarding({ mode: "demo" })}
            >
              <Sparkles size={16} aria-hidden="true" />
              Load demo data — 6 weeks of history
            </Button>
            <Button
              variant="ghost"
              onClick={() => actions.completeOnboarding({ mode: "empty" })}
            >
              Start with a blank slate
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
