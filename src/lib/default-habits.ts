import type { Frequency, Habit } from "./types";
import { todayKey } from "./dates";

export interface HabitSeed {
  name: string;
  icon: string;
  category: Habit["category"];
  xp: number;
  frequency: Frequency;
  target: number;
}

/** First-launch defaults — every field is editable later. */
export const DEFAULT_HABITS: HabitSeed[] = [
  { name: "Wake up before 6 AM", icon: "🌅", category: "Health", xp: 20, frequency: { type: "daily" }, target: 7 },
  { name: "Gym", icon: "🏋️", category: "Fitness", xp: 30, frequency: { type: "custom", days: [1, 3, 5] }, target: 3 },
  { name: "DSA / Coding", icon: "💻", category: "Learning", xp: 40, frequency: { type: "custom", days: [1, 2, 3, 4, 5, 6] }, target: 6 },
  { name: "Project Work", icon: "🛠️", category: "Work", xp: 40, frequency: { type: "daily" }, target: 7 },
  { name: "Reading / Learning", icon: "📚", category: "Learning", xp: 20, frequency: { type: "daily" }, target: 7 },
  { name: "Meditation", icon: "🧘", category: "Mindfulness", xp: 15, frequency: { type: "daily" }, target: 7 },
  { name: "Social Media Detox", icon: "📵", category: "Mindfulness", xp: 25, frequency: { type: "weekdays" }, target: 5 },
  { name: "Budget Tracking", icon: "💰", category: "Finance", xp: 15, frequency: { type: "custom", days: [1, 5] }, target: 2 },
  { name: "Drink Water", icon: "💧", category: "Health", xp: 15, frequency: { type: "daily" }, target: 7 },
  { name: "Sleep 7+ hours", icon: "😴", category: "Health", xp: 20, frequency: { type: "daily" }, target: 7 },
];

export const HABIT_ICON_CHOICES = [
  "🌅", "🏋️", "💻", "🛠️", "📚", "🧘", "📵", "💰", "💧", "😴",
  "🏃", "🚴", "🥗", "✍️", "🎯", "🎸", "🗣️", "🧹", "🌿", "⏰",
];

export function seedsToHabits(seeds: HabitSeed[]): Habit[] {
  const createdAt = todayKey();
  return seeds.map((s, i) => ({
    id: `habit-${i + 1}-${s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
    name: s.name,
    icon: s.icon,
    category: s.category,
    xp: s.xp,
    frequency: s.frequency,
    target: s.target,
    active: true,
    createdAt,
    order: i,
  }));
}
