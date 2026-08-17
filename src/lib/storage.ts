/**
 * Storage abstraction — the only module that talks to localStorage.
 * Swapping to Supabase later means replacing these functions.
 */
import { DEFAULT_SETTINGS, type AppState, type Settings } from "./types";

const STORAGE_KEY = "lifequest:v1";
const CURRENT_VERSION = 1;

const isBrowser = () => typeof window !== "undefined";

export function createFreshState(settings?: Partial<Settings>): AppState {
  return {
    version: CURRENT_VERSION,
    habits: [],
    completions: {},
    achievements: {},
    settings: { ...DEFAULT_SETTINGS, ...(settings ?? {}) },
    meta: {
      createdAt: new Date().toISOString(),
      onboarded: false,
      usedDemo: false,
    },
  };
}

/** Validates and fills in any missing fields on an untrusted state object. */
export function normalizeState(input: unknown): AppState | null {
  if (!input || typeof input !== "object") return null;
  const parsed = input as Partial<AppState>;
  if (parsed.version !== CURRENT_VERSION) return null;
  if (!Array.isArray(parsed.habits)) return null;
  if (!parsed.completions || typeof parsed.completions !== "object") return null;

  const base = createFreshState();
  return {
    version: CURRENT_VERSION,
    habits: parsed.habits,
    completions: parsed.completions,
    achievements: parsed.achievements ?? {},
    settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
    meta: { ...base.meta, ...parsed.meta },
  };
}

export function loadAppState(): AppState | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalizeState(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveAppState(state: AppState): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full / private mode — fail silently; app keeps working in memory.
  }
}

export function resetAppState(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Pretty-printed portable backup of everything the app knows. */
export function serializeBackup(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export type ImportResult =
  | { ok: true; state: AppState }
  | { ok: false; error: string };

export function parseBackup(json: string): ImportResult {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return { ok: false, error: "That doesn't look like valid JSON." };
  }
  const state = normalizeState(data);
  if (!state) {
    return {
      ok: false,
      error: "Not a LifeQuest backup (missing habits or wrong version).",
    };
  }
  return { ok: true, state };
}

export function backupFilename(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `lifequest-backup-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.json`;
}
