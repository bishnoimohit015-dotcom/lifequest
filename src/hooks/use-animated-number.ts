"use client";
import { useEffect, useRef, useState } from "react";

/** Tweens a number toward its latest value (ease-out cubic).
 *  Respects the user's "animations" preference via `enabled`. */
export function useAnimatedNumber(
  value: number,
  enabled: boolean,
  duration = 450
): number {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    const from = fromRef.current;
    fromRef.current = value;
    if (!enabled || from === value) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, enabled, duration]);

  return display;
}
