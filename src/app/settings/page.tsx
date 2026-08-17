"use client";
import {
  AlertTriangle,
  Database,
  Monitor,
  Moon,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { BackupPanel } from "@/components/settings/backup-panel";
import { Button } from "@/components/ui/button";
import { Card, CardLabel } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { StreakThreshold, ThemePreference } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useApp } from "@/state/app-store";

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: LucideIcon; hint: string }[] = [
  { value: "light", label: "Light", icon: Sun, hint: "Warm paper" },
  { value: "dark", label: "Dark", icon: Moon, hint: "Deep moss" },
  { value: "system", label: "System", icon: Monitor, hint: "Follow device" },
];

const THRESHOLDS: StreakThreshold[] = [50, 60, 70, 80, 90];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <CardLabel className="mb-4">{title}</CardLabel>
      {children}
    </Card>
  );
}

function Settings() {
  const { state, actions } = useApp();
  const [confirmClear, setConfirmClear] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!state) return null;
  const { settings } = state;

  return (
    <AppShell>
      <header className="mb-6">
        <p className="text-[11px] font-bold tracking-[0.16em] text-ink-faint uppercase">
          Preferences
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Settings
        </h1>
      </header>

      <div className="max-w-3xl space-y-4">
        <Section title="Appearance">
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Theme">
            {THEME_OPTIONS.map(({ value, label, icon: Icon, hint }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={settings.theme === value}
                onClick={() => actions.updateSettings({ theme: value })}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-lg border px-3 py-4 transition-all",
                  settings.theme === value
                    ? "border-moss bg-moss-soft shadow-sm"
                    : "border-line bg-surface hover:border-line-strong"
                )}
              >
                <Icon
                  size={18}
                  className={settings.theme === value ? "text-leaf" : "text-ink-faint"}
                  aria-hidden="true"
                />
                <span className="text-sm font-bold">{label}</span>
                <span className="text-[10px] font-semibold text-ink-faint">{hint}</span>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Week schedule">
          <div className="flex gap-2" role="radiogroup" aria-label="Week starts on">
            {(["Monday", "Sunday"] as const).map((day) => {
              const value = day === "Monday" ? 1 : 0;
              return (
                <button
                  key={day}
                  type="button"
                  role="radio"
                  aria-checked={settings.weekStart === value}
                  onClick={() => actions.updateSettings({ weekStart: value as 0 | 1 })}
                  className={cn(
                    "flex-1 rounded-lg border px-4 py-2.5 text-sm font-bold transition-all",
                    settings.weekStart === value
                      ? "border-moss bg-moss-soft text-leaf"
                      : "border-line bg-surface text-ink-soft hover:border-line-strong"
                  )}
                >
                  Starts {day}
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Streak rule">
          <p className="mb-3 text-sm text-ink-soft">
            A day keeps your streak alive when you complete at least this share
            of scheduled habits.
          </p>
          <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Streak threshold">
            {THRESHOLDS.map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={settings.streakThreshold === t}
                onClick={() => actions.updateSettings({ streakThreshold: t })}
                className={cn(
                  "rounded-lg border py-2.5 font-display text-sm font-bold tabular-nums transition-all",
                  settings.streakThreshold === t
                    ? "border-moss bg-moss text-on-moss shadow-sm"
                    : "border-line bg-surface text-ink-soft hover:border-line-strong"
                )}
              >
                {t}%
              </button>
            ))}
          </div>
          <p className="mt-3 flex items-start gap-1.5 text-[11px] font-semibold text-ink-faint">
            <AlertTriangle size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
            Changing the rule recalculates streaks across your whole history.
          </p>
        </Section>

        <Section title="Feedback">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold">Animations</p>
                <p className="text-xs text-ink-faint">XP counters, bars and check pops.</p>
              </div>
              <Switch
                checked={settings.animations}
                onChange={(v) => actions.updateSettings({ animations: v })}
                label="Toggle animations"
              />
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-line pt-3">
              <div>
                <p className="text-sm font-bold">Sound</p>
                <p className="text-xs text-ink-faint">Soft blips on complete, level-up and medals.</p>
              </div>
              <Switch
                checked={settings.sound}
                onChange={(v) => actions.updateSettings({ sound: v })}
                label="Toggle sound"
              />
            </div>
          </div>
        </Section>

        <Section title="Backup & transfer">
          <BackupPanel />
        </Section>

        <Section title="Data">
          <div className="flex flex-wrap gap-2">
            <Button variant="soft" onClick={() => actions.resetDemo()}>
              Reset demo data
            </Button>
            {confirmClear ? (
              <Button
                variant="danger"
                onClick={() => {
                  setConfirmClear(false);
                  actions.clearAll();
                }}
              >
                <AlertTriangle size={15} aria-hidden="true" />
                Really erase everything?
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  setConfirmClear(true);
                  if (timer.current) clearTimeout(timer.current);
                  timer.current = setTimeout(() => setConfirmClear(false), 3500);
                }}
              >
                Clear all data
              </Button>
            )}
          </div>
          <p className="mt-4 flex items-start gap-2 rounded-lg bg-surface px-3.5 py-3 text-[11px] leading-relaxed font-semibold text-ink-faint">
            <Database size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
            Everything is stored locally in this browser under a single
            versioned key. The storage layer is isolated, so cloud sync can be
            swapped in later without touching the app. Clearing data returns
            you to the first-launch setup.
          </p>
        </Section>
      </div>
    </AppShell>
  );
}

export default Settings;
