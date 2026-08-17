import { WEEKDAY_LABELS, type Category, type Frequency } from "./types";

export function describeFrequency(f: Frequency): string {
  switch (f.type) {
    case "daily":
      return "Daily";
    case "weekdays":
      return "Weekdays";
    case "weekends":
      return "Weekends";
    case "custom": {
      const days = [...f.days].sort((a, b) => (a + 6) % 7 - ((b + 6) % 7));
      if (days.length === 7) return "Daily";
      if (days.length === 0) return "Never";
      return days.map((d) => WEEKDAY_LABELS[d]).join(" · ");
    }
  }
}

/** Muted category chip styling — kept inside the earthy palette. */
export const CATEGORY_STYLES: Record<Category, string> = {
  Fitness: "bg-moss-soft text-leaf",
  Learning: "bg-gold-soft text-gold",
  Health: "bg-ember-soft text-ember",
  Work: "bg-moss-tint text-ink-soft",
  Finance: "bg-gold-soft text-gold",
  Mindfulness: "bg-moss-soft text-leaf",
  Social: "bg-ember-soft text-ember",
  Other: "bg-line/50 text-ink-soft",
};
