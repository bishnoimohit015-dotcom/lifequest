"use client";
import { Info, Sparkles, Trophy, X } from "lucide-react";
import { useEffect } from "react";
import type { Toast } from "@/state/app-store";
import { cn } from "@/lib/utils";

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 4500);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  const Icon =
    toast.tone === "level" ? Sparkles : toast.tone === "achievement" ? Trophy : Info;

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex w-full items-start gap-3 rounded-lg border bg-raised px-4 py-3 shadow-lg animate-toast-in lg:w-auto lg:min-w-80 lg:max-w-sm",
        toast.tone === "level" && "border-gold/50",
        toast.tone === "achievement" && "border-gold/40",
        toast.tone === "info" && "border-line-strong"
      )}
    >
      <span
        className={cn(
          "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md",
          toast.tone === "info"
            ? "bg-moss-soft text-leaf"
            : "bg-gold-soft text-gold"
        )}
      >
        <Icon size={16} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm leading-snug font-semibold tracking-tight">
          {toast.title}
        </p>
        {toast.body && (
          <p className="mt-0.5 text-xs leading-snug text-ink-soft">{toast.body}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="rounded p-1 text-ink-faint transition-colors hover:bg-moss-tint hover:text-ink"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

export function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-20 z-[60] flex flex-col items-center gap-2 lg:inset-x-auto lg:right-6 lg:bottom-6 lg:items-end"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
