"use client";
import { cn } from "@/lib/utils";

export interface BarDatum {
  label: string;
  value: number | null;
  hint?: string;
  highlight?: boolean;
}

/**
 * Lightweight bar chart built from divs — crisp at any width, animates on
 * mount, and exposes every value through title tooltips + an aria label.
 */
export function BarChart({
  data,
  height = 128,
  maxValue,
  threshold,
  ariaLabel,
  animate,
  formatValue = (v) => String(Math.round(v)),
}: {
  data: BarDatum[];
  height?: number;
  /** Scale max; defaults to 100 (percent charts). */
  maxValue?: number;
  /** Dashed reference line, in the same units as values. */
  threshold?: number;
  ariaLabel: string;
  animate: boolean;
  formatValue?: (v: number) => string;
}) {
  const max = maxValue ?? 100;
  return (
    <div>
      <div className="relative" style={{ height }} role="img" aria-label={ariaLabel}>
        {threshold !== undefined && (
          <div
            aria-hidden="true"
            className="absolute inset-x-0 z-10 border-t border-dashed border-line-strong"
            style={{ bottom: `${(threshold / max) * 100}%` }}
          >
            <span className="absolute -top-2 right-0 bg-raised px-1 text-[9px] font-bold text-ink-faint tabular-nums">
              {formatValue(threshold)}
            </span>
          </div>
        )}
        <div className="flex h-full items-end gap-[3px]">
          {data.map((d, i) => {
            const h =
              d.value === null ? 0 : Math.max(2, (d.value / max) * 100);
            return (
              <div key={i} className="group relative flex h-full flex-1 items-end">
                <div
                  title={d.hint ?? `${d.label}: ${d.value === null ? "no data" : formatValue(d.value)}`}
                  className={cn(
                    "w-full rounded-t-sm transition-colors",
                    d.value === null && "h-[3px] rounded-sm bg-line",
                    d.value !== null &&
                      (d.highlight
                        ? "bg-moss group-hover:bg-moss-hover"
                        : "bg-moss/70 group-hover:bg-moss"),
                    animate && d.value !== null && "animate-grow-bar"
                  )}
                  style={{
                    height: d.value === null ? undefined : `${h}%`,
                    animationDelay: animate ? `${i * 14}ms` : undefined,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-1.5 flex justify-between text-[9px] font-bold text-ink-faint tabular-nums">
        <span>{data[0]?.label}</span>
        {data.length > 4 && <span>{data[Math.floor(data.length / 2)]?.label}</span>}
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}

/** Horizontal per-habit bars, used for consistency comparisons. */
export function HBarList({
  rows,
  animate,
}: {
  rows: {
    key: string;
    icon: string;
    name: string;
    pct: number | null;
    detail: string;
  }[];
  animate: boolean;
}) {
  return (
    <ul className="space-y-2.5">
      {rows.map((row, i) => (
        <li key={row.key}>
          <div className="flex items-center justify-between gap-2">
            <p className="flex min-w-0 items-center gap-1.5 text-xs font-bold">
              <span aria-hidden="true">{row.icon}</span>
              <span className="truncate">{row.name}</span>
            </p>
            <p className="shrink-0 text-[11px] font-bold text-ink-soft tabular-nums">
              {row.pct === null ? "—" : `${Math.round(row.pct)}%`}
              <span className="ml-1.5 hidden font-semibold text-ink-faint sm:inline">
                {row.detail}
              </span>
            </p>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-line/60">
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none",
                (row.pct ?? 0) >= 80 ? "bg-moss" : (row.pct ?? 0) >= 50 ? "bg-moss/60" : "bg-ember"
              )}
              style={{ width: `${row.pct ?? 0}%` }}
              role="progressbar"
              aria-valuenow={Math.round(row.pct ?? 0)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${row.name}: ${Math.round(row.pct ?? 0)}% consistency`}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
