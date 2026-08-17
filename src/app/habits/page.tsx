"use client";
import {
  ArrowDown,
  ArrowUp,
  Flame,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
  Zap,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { HabitFormModal } from "@/components/habits/habit-form-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { CATEGORY_STYLES, describeFrequency } from "@/lib/format";
import { habitStreak } from "@/lib/streaks";
import type { Habit } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useApp } from "@/state/app-store";

function HabitManagerRow({
  habit,
  index,
  count,
  streak,
  onEdit,
}: {
  habit: Habit;
  index: number;
  count: number;
  streak: number;
  onEdit: () => void;
}) {
  const { actions } = useApp();
  const [confirming, setConfirming] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const askDelete = () => {
    setConfirming(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setConfirming(false), 3500);
  };

  return (
    <li
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-raised px-2 py-2.5 transition-colors sm:gap-3 sm:px-3",
        habit.active ? "border-line" : "border-dashed border-line opacity-70"
      )}
    >
      <span className="hidden text-ink-faint sm:block" aria-hidden="true">
        <GripVertical size={15} />
      </span>
      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => actions.moveHabit(habit.id, -1)}
          disabled={index === 0}
          aria-label={`Move ${habit.name} up`}
          className="rounded p-0.5 text-ink-faint transition-colors hover:bg-moss-tint hover:text-ink disabled:opacity-30"
        >
          <ArrowUp size={13} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => actions.moveHabit(habit.id, 1)}
          disabled={index === count - 1}
          aria-label={`Move ${habit.name} down`}
          className="rounded p-0.5 text-ink-faint transition-colors hover:bg-moss-tint hover:text-ink disabled:opacity-30"
        >
          <ArrowDown size={13} aria-hidden="true" />
        </button>
      </div>

      <span className="text-xl" aria-hidden="true">
        {habit.icon}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{habit.name}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold text-ink-faint">
          <span
            className={cn(
              "rounded px-1.5 py-0.5 font-bold tracking-wide uppercase",
              CATEGORY_STYLES[habit.category]
            )}
          >
            {habit.category}
          </span>
          <span className="inline-flex items-center gap-0.5 text-leaf tabular-nums">
            <Zap size={10} aria-hidden="true" />
            {habit.xp} XP
          </span>
          <span>{describeFrequency(habit.frequency)}</span>
          <span className="tabular-nums">{habit.target}×/wk</span>
          {streak > 1 && (
            <span className="inline-flex items-center gap-0.5 text-ember tabular-nums">
              <Flame size={10} aria-hidden="true" />
              {streak}
            </span>
          )}
        </p>
      </div>

      <Switch
        checked={habit.active}
        onChange={(next) => actions.updateHabit(habit.id, { active: next })}
        label={habit.active ? `Pause ${habit.name}` : `Resume ${habit.name}`}
      />

      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${habit.name}`}
        className="rounded-md p-2 text-ink-faint transition-colors hover:bg-moss-tint hover:text-ink"
      >
        <Pencil size={15} aria-hidden="true" />
      </button>

      {confirming ? (
        <Button
          size="sm"
          variant="danger"
          onClick={() => actions.deleteHabit(habit.id)}
        >
          Sure?
        </Button>
      ) : (
        <button
          type="button"
          onClick={askDelete}
          aria-label={`Delete ${habit.name}`}
          className="rounded-md p-2 text-ink-faint transition-colors hover:bg-danger-soft hover:text-danger"
        >
          <Trash2 size={15} aria-hidden="true" />
        </button>
      )}
    </li>
  );
}

function Habits() {
  const { state } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | undefined>(undefined);

  const sorted = useMemo(
    () => (state ? [...state.habits].sort((a, b) => a.order - b.order) : []),
    [state]
  );

  const streaks = useMemo(() => {
    const map = new Map<string, number>();
    if (state) for (const h of sorted) map.set(h.id, habitStreak(state, h.id));
    return map;
  }, [state, sorted]);

  if (!state) return null;
  const activeCount = sorted.filter((h) => h.active).length;
  const weeklyXP = sorted
    .filter((h) => h.active)
    .reduce((sum, h) => sum + h.xp * h.target, 0);

  return (
    <AppShell>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold tracking-[0.16em] text-ink-faint uppercase">
            {activeCount} active · {sorted.length - activeCount} paused
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Habits
          </h1>
          <p className="mt-1 text-sm font-medium text-ink-soft">
            Up to{" "}
            <span className="font-bold text-leaf tabular-nums">
              {weeklyXP.toLocaleString()} XP
            </span>{" "}
            available per week at current targets.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(undefined);
            setModalOpen(true);
          }}
        >
          <Plus size={16} aria-hidden="true" />
          New habit
        </Button>
      </header>

      {sorted.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-12 text-center">
          <p className="font-display text-lg font-semibold">No habits yet</p>
          <p className="max-w-sm text-sm text-ink-soft">
            Create your first habit to start earning XP. Small quests, done
            daily, compound into levels.
          </p>
          <Button
            onClick={() => {
              setEditing(undefined);
              setModalOpen(true);
            }}
          >
            <Plus size={16} aria-hidden="true" />
            Create a habit
          </Button>
        </Card>
      ) : (
        <ul className="space-y-2">
          {sorted.map((habit, i) => (
            <HabitManagerRow
              key={habit.id}
              habit={habit}
              index={i}
              count={sorted.length}
              streak={streaks.get(habit.id) ?? 0}
              onEdit={() => {
                setEditing(habit);
                setModalOpen(true);
              }}
            />
          ))}
        </ul>
      )}

      <HabitFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        habit={editing}
      />
    </AppShell>
  );
}

export default Habits;
