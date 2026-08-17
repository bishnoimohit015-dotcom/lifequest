"use client";
import { lastNDays } from "@/lib/calculations";
import { useApp } from "@/state/app-store";
import { Card, CardLabel } from "@/components/ui/card";

/** Completion sparkline for the last 14 days. */
function Sparkline({ values }: { values: (number | null)[] }) {
  const W = 120;
  const H = 36;
  const step = values.length > 1 ? W / (values.length - 1) : W;
  const pts = values.map((v, i) => {
    const y = v === null ? H : H - (v / 100) * (H - 4) - 2;
    return `${(i * step).toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-9 w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="var(--moss)"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function MonthCard() {
  const { state, stats } = useApp();
  if (!state || !stats) return null;
  const monthPct = stats.month.pct;
  const weekPct = stats.week.pct;
  const series = lastNDays(state, 14).map((d) => d.counts.pct);

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between">
        <CardLabel>This month</CardLabel>
        <p className="font-display text-3xl font-bold text-leaf tabular-nums">
          {monthPct === null ? "—" : `${Math.round(monthPct)}%`}
        </p>
      </div>
      <div className="mt-3">
        <Sparkline values={series} />
        <p className="mt-1 text-[11px] font-semibold text-ink-faint">
          Daily completion — last 14 days
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs font-semibold text-ink-soft">
        <span>This week</span>
        <span className="tabular-nums">
          {weekPct === null ? "—" : `${Math.round(weekPct)}%`}
        </span>
      </div>
    </Card>
  );
}
