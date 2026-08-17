"use client";
import { Share, SquarePlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "@/state/app-store";

type Platform = "ios" | "other-mobile" | null;

/**
 * Subtle, dismissible tip shown only to mobile browser users who haven't
 * installed the app yet. Installing matters on iOS: it gives a fullscreen
 * app, an icon, and far more durable local storage.
 */
export function InstallHint() {
  const { state, actions } = useApp();
  const [platform, setPlatform] = useState<Platform>(null);

  useEffect(() => {
    const nav = navigator as Navigator & { standalone?: boolean };
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      nav.standalone === true;
    if (standalone) return;

    const ua = navigator.userAgent;
    const isIOS =
      /iPhone|iPad|iPod/i.test(ua) ||
      // iPadOS 13+ masquerades as desktop Safari
      (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    const isMobile = isIOS || /Android/i.test(ua);
    if (!isMobile) return;

    setPlatform(isIOS ? "ios" : "other-mobile");
  }, []);

  if (!platform || !state || state.meta.installHintDismissed) return null;

  return (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-moss/40 bg-moss-tint px-4 py-3 lg:hidden">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-moss-soft text-leaf">
        <SquarePlus size={16} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm font-bold tracking-tight">
          Install LifeQuest
        </p>
        {platform === "ios" ? (
          <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
            Tap{" "}
            <Share
              size={11}
              className="inline align-[-1px] text-leaf"
              aria-label="the Share button"
            />{" "}
            <strong className="font-bold">Share</strong> in Safari, then{" "}
            <strong className="font-bold">Add to Home Screen</strong> — it opens
            fullscreen and keeps your streak data safer.
          </p>
        ) : (
          <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
            Open your browser menu and choose{" "}
            <strong className="font-bold">Install app</strong> to run LifeQuest
            fullscreen and offline.
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={actions.dismissInstallHint}
        aria-label="Dismiss install tip"
        className="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-moss-soft hover:text-ink"
      >
        <X size={15} aria-hidden="true" />
      </button>
    </div>
  );
}
