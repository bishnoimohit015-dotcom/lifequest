"use client";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";
import { HABIT_ICON_CHOICES } from "@/lib/default-habits";
import { WEEKDAY_LABELS, CATEGORIES, type Category, type Frequency, type Habit } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useApp } from "@/state/app-store";

const FREQ_OPTIONS: { value: Frequency["type"]; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekdays", label: "Weekdays" },
  { value: "weekends", label: "Weekends" },
  { value: "custom", label: "Custom days" },
];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-bold tracking-[0.14em] text-ink-faint uppercase">
        {label}
      </p>
      {children}
    </div>
  );
}

export function HabitFormModal({
  open,
  onClose,
  habit,
}: {
  open: boolean;
  onClose: () => void;
  /** When provided, the modal edits this habit; otherwise it creates one. */
  habit?: Habit;
}) {
  const { actions } = useApp();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(HABIT_ICON_CHOICES[0]);
  const [category, setCategory] = useState<Category>("Health");
  const [xp, setXp] = useState(20);
  const [freqType, setFreqType] = useState<Frequency["type"]>("daily");
  const [customDays, setCustomDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [target, setTarget] = useState(7);
  const [active, setActive] = useState(true);
  const [touched, setTouched] = useState(false);

  // Reset the form whenever the modal opens.
  useEffect(() => {
    if (!open) return;
    setTouched(false);
    if (habit) {
      setName(habit.name);
      setIcon(habit.icon);
      setCategory(habit.category);
      setXp(habit.xp);
      setFreqType(habit.frequency.type);
      setCustomDays(
        habit.frequency.type === "custom" ? [...habit.frequency.days] : [1, 2, 3, 4, 5]
      );
      setTarget(habit.target);
      setActive(habit.active);
    } else {
      setName("");
      setIcon(HABIT_ICON_CHOICES[0]);
      setCategory("Health");
      setXp(20);
      setFreqType("daily");
      setCustomDays([1, 2, 3, 4, 5]);
      setTarget(7);
      setActive(true);
    }
  }, [open, habit]);

  const nameInvalid = name.trim().length === 0;

  const save = () => {
    setTouched(true);
    if (nameInvalid) return;
    const frequency: Frequency =
      freqType === "custom"
        ? { type: "custom", days: [...customDays].sort((a, b) => a - b) }
        : { type: freqType };
    const data = {
      name: name.trim(),
      icon,
      category,
      xp,
      frequency,
      target,
      active,
    };
    if (habit) actions.updateHabit(habit.id, data);
    else actions.addHabit(data);
    onClose();
  };

  const toggleDay = (d: number) =>
    setCustomDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={habit ? "Edit habit" : "New habit"}
      wide
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <Field label="Name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Morning run"
            aria-invalid={touched && nameInvalid}
            className={cn(
              "w-full rounded-lg border bg-surface px-3.5 py-2.5 text-sm font-medium placeholder:text-ink-faint focus:border-moss",
              touched && nameInvalid ? "border-danger" : "border-line-strong"
            )}
          />
          {touched && nameInvalid && (
            <p className="mt-1 text-xs font-semibold text-danger">
              Give this habit a name.
            </p>
          )}
        </Field>

        <Field label="Icon">
          <div className="grid grid-cols-10 gap-1.5" role="radiogroup" aria-label="Habit icon">
            {HABIT_ICON_CHOICES.map((emoji) => (
              <button
                key={emoji}
                type="button"
                role="radio"
                aria-checked={icon === emoji}
                aria-label={`Icon ${emoji}`}
                onClick={() => setIcon(emoji)}
                className={cn(
                  "grid h-9 place-items-center rounded-lg border text-lg transition-all",
                  icon === emoji
                    ? "border-moss bg-moss-soft shadow-sm"
                    : "border-line bg-surface hover:border-line-strong"
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm font-medium focus:border-moss"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Weekly target">
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={7}
                step={1}
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                aria-label="Weekly target"
                className="flex-1 accent-(--moss)"
              />
              <span className="w-14 rounded-md bg-moss-soft px-2 py-1 text-center font-display text-sm font-bold text-leaf tabular-nums">
                {target}×/wk
              </span>
            </div>
          </Field>
        </div>

        <Field label={`XP reward — ${xp} XP per completion`}>
          <input
            type="range"
            min={5}
            max={100}
            step={5}
            value={xp}
            onChange={(e) => setXp(Number(e.target.value))}
            aria-label="XP reward"
            className="w-full accent-(--moss)"
          />
          <div className="flex justify-between text-[10px] font-bold text-ink-faint tabular-nums">
            <span>5</span>
            <span>50</span>
            <span>100</span>
          </div>
        </Field>

        <Field label="Frequency">
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Frequency">
            {FREQ_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={freqType === opt.value}
                onClick={() => setFreqType(opt.value)}
                className={cn(
                  "rounded-lg border px-3.5 py-2 text-xs font-bold transition-colors",
                  freqType === opt.value
                    ? "border-moss bg-moss text-on-moss"
                    : "border-line-strong bg-surface text-ink-soft hover:border-moss/50"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {freqType === "custom" && (
            <div className="mt-2.5 flex flex-wrap gap-1.5" role="group" aria-label="Custom days">
              {WEEKDAY_LABELS.map((label, d) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={customDays.includes(d)}
                  onClick={() => toggleDay(d)}
                  className={cn(
                    "relative h-9 w-11 rounded-lg border text-xs font-bold transition-colors",
                    customDays.includes(d)
                      ? "border-moss bg-moss-soft text-leaf"
                      : "border-line bg-surface text-ink-faint hover:border-line-strong"
                  )}
                >
                  {label}
                  {customDays.includes(d) && (
                    <Check
                      size={10}
                      strokeWidth={3.5}
                      className="absolute top-0.5 right-1"
                      aria-hidden="true"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </Field>

        <div className="flex items-center justify-between rounded-lg border border-line bg-surface px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Active</p>
            <p className="text-xs text-ink-faint">
              Paused habits stop being scheduled; history is kept.
            </p>
          </div>
          <Switch
            checked={active}
            onChange={setActive}
            label={active ? "Pause habit" : "Activate habit"}
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{habit ? "Save changes" : "Create habit"}</Button>
        </div>
      </form>
    </Modal>
  );
}
