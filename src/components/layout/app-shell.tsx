"use client";
import {
  BarChart3,
  CalendarDays,
  Flame,
  LayoutDashboard,
  ListChecks,
  Settings,
  Sun,
  Trophy,
  User,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { levelTitle } from "@/lib/xp";
import { useApp } from "@/state/app-store";
import { InstallHint } from "@/components/layout/install-hint";
import { Onboarding } from "@/components/onboarding";
import { Progress } from "@/components/ui/progress";
import { ToastViewport } from "@/components/ui/toast";

const DESKTOP_NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/today", label: "Today", icon: Sun },
  { href: "/habits", label: "Habits", icon: ListChecks },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/settings", label: "Settings", icon: Settings },
];

const MOBILE_NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/today", label: "Today", icon: Sun },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/analytics", label: "Stats", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
];

export function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="32" height="32" rx="8" fill="var(--moss)" />
      <path
        d="M9.5 17.5l4.5 4.5 9-11"
        fill="none"
        stroke="var(--on-moss)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <div className="flex flex-col items-center gap-4">
        <BrandMark size={48} />
        <p className="font-display text-lg font-bold tracking-[0.25em] text-ink-soft">
          LIFEQUEST
        </p>
        <div className="h-1 w-32 overflow-hidden rounded-full bg-line">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-moss" />
        </div>
      </div>
    </div>
  );
}

function Sidebar() {
  const pathname = usePathname();
  const { stats } = useApp();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-surface lg:flex">
      <div className="flex items-center gap-3 px-5 pt-6 pb-5">
        <BrandMark />
        <div>
          <p className="font-display text-[17px] leading-tight font-bold tracking-tight">
            LifeQuest
          </p>
          <p className="text-[11px] font-medium tracking-wide text-ink-faint">
            life, gamified
          </p>
        </div>
      </div>

      <nav aria-label="Primary" className="flex-1 space-y-1 px-3">
        {DESKTOP_NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                active
                  ? "bg-moss-soft text-leaf"
                  : "text-ink-soft hover:bg-moss-tint hover:text-ink"
              )}
            >
              <Icon size={17} aria-hidden="true" />
              {label}
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-full bg-moss"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {stats && (
        <Link
          href="/profile"
          className="mx-3 mb-4 block rounded-xl border border-line bg-raised p-4 transition-colors hover:border-moss/40"
        >
          <div className="flex items-baseline justify-between">
            <p className="font-display text-2xl font-bold tracking-tight">
              LV {stats.levelInfo.level}
            </p>
            <p className="text-[11px] font-bold tracking-[0.12em] text-ink-faint uppercase">
              {levelTitle(stats.levelInfo.level)}
            </p>
          </div>
          <Progress
            value={stats.levelInfo.pct}
            className="mt-2.5"
            label={`Level progress: ${Math.round(stats.levelInfo.pct)}%`}
          />
          <div className="mt-2.5 flex items-center justify-between text-xs font-semibold text-ink-soft">
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Zap size={12} className="text-leaf" aria-hidden="true" />
              {stats.xp.toLocaleString()} XP
            </span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Flame size={12} className="text-ember" aria-hidden="true" />
              {stats.currentStreak} days
            </span>
          </div>
        </Link>
      )}
    </aside>
  );
}

function MobileHeader() {
  const { stats } = useApp();
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-surface/95 px-4 backdrop-blur-sm lg:hidden"
      style={{
        // Clears the notch / status bar when installed to the Home Screen.
        paddingTop: "env(safe-area-inset-top)",
        height: "calc(3.5rem + env(safe-area-inset-top))",
      }}
    >
      <Link href="/" className="flex items-center gap-2.5">
        <BrandMark size={28} />
        <span className="font-display text-base font-bold tracking-tight">
          LifeQuest
        </span>
      </Link>
      {stats && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-line bg-raised px-2.5 py-1 text-xs font-bold text-ink-soft tabular-nums">
            <Zap size={12} className="text-leaf" aria-hidden="true" />
            LV {stats.levelInfo.level}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-line bg-raised px-2.5 py-1 text-xs font-bold text-ink-soft tabular-nums">
            <Flame size={12} className="text-ember" aria-hidden="true" />
            {stats.currentStreak}
          </span>
        </div>
      )}
    </header>
  );
}

function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-sm lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-5">
        {MOBILE_NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold tracking-wide transition-colors",
                active ? "text-leaf" : "text-ink-faint hover:text-ink-soft"
              )}
            >
              <Icon size={20} aria-hidden="true" strokeWidth={active ? 2.4 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { state, ready, toasts, dismissToast } = useApp();

  if (!ready || !state) return <Splash />;
  if (!state.meta.onboarded) return <Onboarding />;

  return (
    <div className="min-h-dvh lg:pl-64">
      <a
        href="#main"
        className="sr-only z-[70] rounded-lg bg-moss px-4 py-2 text-on-moss focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Skip to content
      </a>
      <Sidebar />
      <MobileHeader />
      <main
        id="main"
        className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-6 pb-28 sm:px-6 lg:pt-10 lg:pb-16"
      >
        <InstallHint />
        {children}
      </main>
      <MobileNav />
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
