import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-line bg-raised shadow-[0_1px_2px_rgba(30,35,25,0.04)]",
        className
      )}
      {...props}
    />
  );
}

/** Small uppercase kicker label used across dashboard cards. */
export function CardLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[11px] font-bold tracking-[0.14em] text-ink-faint uppercase",
        className
      )}
    >
      {children}
    </p>
  );
}
