/**
 * All date handling uses LOCAL calendar dates and string keys "YYYY-MM-DD".
 * We never round-trip through UTC parsing, so "August 16" always stays
 * August 16 regardless of timezone. Month lengths, leap years and
 * navigation are handled by local `new Date(y, m, d)` arithmetic.
 */

export type DateKey = string;

const pad = (n: number) => String(n).padStart(2, "0");

export function toKey(d: Date): DateKey {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromKey(key: DateKey): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0); // noon avoids DST edge cases
}

export function todayKey(): DateKey {
  return toKey(new Date());
}

export function addDaysKey(key: DateKey, days: number): DateKey {
  const d = fromKey(key);
  d.setDate(d.getDate() + days);
  return toKey(d);
}

/** Whole-day difference b - a in local calendar days. */
export function diffDays(a: DateKey, b: DateKey): number {
  return Math.round((fromKey(b).getTime() - fromKey(a).getTime()) / 86_400_000);
}

/** 0 = Sunday ... 6 = Saturday */
export function weekdayOf(key: DateKey): number {
  return fromKey(key).getDay();
}

export function daysInMonth(year: number, month0: number): number {
  return new Date(year, month0 + 1, 0).getDate();
}

/** All day keys of a month, chronological. */
export function monthDayKeys(year: number, month0: number): DateKey[] {
  const n = daysInMonth(year, month0);
  const keys: DateKey[] = [];
  for (let d = 1; d <= n; d++) keys.push(`${year}-${pad(month0 + 1)}-${pad(d)}`);
  return keys;
}

export function startOfWeekKey(key: DateKey, weekStart: 0 | 1): DateKey {
  const wd = weekdayOf(key);
  const offset = weekStart === 1 ? (wd + 6) % 7 : wd;
  return addDaysKey(key, -offset);
}

/** Inclusive range of day keys, chronological. */
export function eachDayKey(from: DateKey, to: DateKey): DateKey[] {
  const n = diffDays(from, to);
  const keys: DateKey[] = [];
  for (let i = 0; i <= n; i++) keys.push(addDaysKey(from, i));
  return keys;
}

/**
 * Calendar grid for a month: weeks (rows) of day keys, padded with nulls.
 * weekStart: 0 = Sunday-first, 1 = Monday-first.
 */
export function monthGrid(
  year: number,
  month0: number,
  weekStart: 0 | 1
): (DateKey | null)[][] {
  const first = `${year}-${pad(month0 + 1)}-01`;
  const total = daysInMonth(year, month0);
  const lead =
    weekStart === 1
      ? (weekdayOf(first) + 6) % 7
      : weekdayOf(first);
  const cells: (DateKey | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (const k of monthDayKeys(year, month0)) cells.push(k);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (DateKey | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function monthLabel(year: number, month0: number): string {
  return `${MONTHS_LONG[month0]} ${year}`;
}

export function formatKeyLong(key: DateKey): string {
  return fromKey(key).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatKeyMedium(key: DateKey): string {
  return fromKey(key).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function dayOfMonth(key: DateKey): number {
  return fromKey(key).getDate();
}

export const WEEKDAY_LETTERS_SUN = ["S", "M", "T", "W", "T", "F", "S"];
export const WEEKDAY_LETTERS_MON = ["M", "T", "W", "T", "F", "S", "S"];
