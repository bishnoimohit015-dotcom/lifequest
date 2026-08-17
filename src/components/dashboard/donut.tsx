"use client";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** SVG progress ring. Content is absolutely centered over the ring. */
export function Donut({
  value,
  size = 108,
  stroke = 9,
  className,
  children,
  label,
}: {
  /** 0..100 */
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
  children?: ReactNode;
  label: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div
      className={cn("relative inline-grid place-items-center", className)}
      role="img"
      aria-label={`${label}: ${Math.round(pct)}%`}
    >
      <svg width={size} height={size} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--line)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--moss)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * pct) / 100}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.25,1,0.4,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}
