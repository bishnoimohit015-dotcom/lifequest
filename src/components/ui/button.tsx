import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "soft" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-moss text-on-moss hover:bg-moss-hover shadow-sm active:translate-y-px",
  outline:
    "border border-line-strong bg-transparent text-ink hover:bg-moss-tint hover:border-moss/50 active:translate-y-px",
  ghost: "text-ink-soft hover:bg-moss-tint hover:text-ink active:translate-y-px",
  soft: "bg-moss-soft text-leaf hover:bg-moss/20 active:translate-y-px",
  danger:
    "bg-danger-soft text-danger hover:bg-danger hover:text-on-moss active:translate-y-px",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-[15px] gap-2",
  icon: "h-9 w-9 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-150 select-none",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
