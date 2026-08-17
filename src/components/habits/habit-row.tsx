"use client";
import { Check, Flame, RotateCcw, Zap } from "lucide-react";
import { CATEGORY_STYLES } from "@/lib/format";
import type { Habit } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * The core daily interaction: one tap completes, a second (or Undo) reverts.
 * Completion is never communicated by color alone — the box fills with a
 * check mark and the row text changes weight.
 */
export function HabitRow({
  habit,
  completed,
  streak,
  onToggle,
  compact,
}: {
  habit: Habit;
  completed: boolean;
  /** Habit-specific streak; shown when > 1. */
  streak?: number;
  onToggle: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all duration-200 sm:px-4",
        completed
          ? "border-moss/40 bg-moss-tint"
          : "border-line bg-raised hover:border-line-strong"
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={completed}
        aria-label={`${completed ? "Uncomplete" : "Complete"} ${habit.name}`}
        onClick={onToggle}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span
          aria-hidden="true"
          className={cn(
            "grid shrink-0 place-items-center rounded-md border-2 transition-all duration-150",
            compact ? "h-6 w-6" : "h-7 w-7",
            completed
              ? "border-moss bg-moss text-on-moss"
              : "border-line-strong bg-transparent text-transparent group-hover:border-moss/60"
          )}
        >
          {completed && (
            <span className="animate-pop-in">
              <Check size={compact ? 14 : 16} strokeWidth={3.2} />
            </span>
          )}
        </span>
        <span className="text-lg leading-none" aria-hidden="true">
          {habit.icon}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block truncate text-sm font-semibold transition-colors",
              completed ? "text-ink-faint line-through decoration-line-strong" : "text-ink"
            )}
          >
            {habit.name}
          </span>
          <span className="mt-0.5 hidden items-center gap-2 sm:flex">
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase",
                CATEGORY_STYLES[habit.category]
              )}
            >
              {habit.category}
            </span>
            {streak !== undefined && streak > 1 && (
              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-ember tabular-nums">
                <Flame size={11} aria-hidden="true" />
                {streak}
              </span>
            )}
          </span>
        </span>
      </button>

      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1 font-display text-[13px] font-bold tabular-nums",
          completed ? "text-leaf" : "text-ink-faint"
        )}
      >
        <Zap size={12} aria-hidden="true" />
        +{habit.xp} XP
      </span>

      {completed && (
        <button
          type="button"
          onClick={onToggle}
          aria-label={`Undo completion of ${habit.name}`}
          className="shrink-0 rounded-md p-1.5 text-ink-faint opacity-60 transition-all hover:bg-line/50 hover:text-ink group-hover:opacity-100"
        >
          <RotateCcw size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
