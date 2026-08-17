import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  /** Accessible name — required, the control is icon-only. */
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-200",
        checked
          ? "border-moss bg-moss"
          : "border-line-strong bg-line/60",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-1/2 left-0.5 h-4.5 w-4.5 -translate-y-1/2 rounded-full bg-raised shadow transition-transform duration-200",
          checked && "translate-x-5"
        )}
      />
      <span className="sr-only">{checked ? "On" : "Off"}</span>
    </button>
  );
}
