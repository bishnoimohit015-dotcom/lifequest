import { cn } from "@/lib/utils";
import { clamp } from "@/lib/utils";

export function Progress({
  value,
  className,
  barClassName,
  label,
}: {
  /** 0..100 */
  value: number;
  className?: string;
  barClassName?: string;
  /** Accessible label — progress is never communicated by color alone. */
  label?: string;
}) {
  const pct = clamp(value, 0, 100);
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? "Progress"}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-line/70", className)}
    >
      <div
        className={cn(
          "h-full rounded-full bg-moss transition-[width] duration-500 ease-out motion-reduce:transition-none",
          barClassName
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
