"use client";
import { useEffect } from "react";

/**
 * Registers the offline service worker and asks the browser to keep our
 * localStorage from being evicted. Both are progressive enhancements —
 * everything works if they're unsupported or rejected.
 */
export function PWARegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    if ("serviceWorker" in navigator) {
      const register = () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {
          // Offline support unavailable — app still works online.
        });
      };
      if (document.readyState === "complete") register();
      else {
        window.addEventListener("load", register);
        return () => window.removeEventListener("load", register);
      }
    }
  }, []);

  useEffect(() => {
    // Reduces the chance of the browser clearing saved habits under storage
    // pressure. Silently unsupported on iOS Safari.
    if (typeof navigator !== "undefined" && navigator.storage?.persist) {
      navigator.storage.persisted?.().then((already) => {
        if (!already) void navigator.storage.persist().catch(() => {});
      }).catch(() => {});
    }
  }, []);

  return null;
}
