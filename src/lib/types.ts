export const MOVEMENT_KINDS = ["ganancia", "gasto", "inversion"] as const;
export const MEAL_SLOTS = ["desayuno", "almuerzo", "merienda", "cena"] as const;
export const MEAL_QUALITIES = ["mala", "regular", "buena"] as const;
export const EXTRA_SLOT = "extra" as const;

export type MovementKind = (typeof MOVEMENT_KINDS)[number];
export type MealSlot = (typeof MEAL_SLOTS)[number];
export type MealKind = MealSlot | typeof EXTRA_SLOT;
export type MealQuality = (typeof MEAL_QUALITIES)[number];

export type Movement = {
  id: string;
  date: string;
  kind: MovementKind;
  amount: number;
  note: string;
};

export type MonthTotals = {
  ganancia: number;
  gasto: number;
  inversion: number;
  resultado: number;
};

export type TimerState = {
  running: boolean;
  startedAt: string | null;
  accumulatedMs: number;
  topic: string;
  elapsedMs: number;
};

export type StudySession = {
  id: string;
  date: string;
  subject: string;
  topic: string;
  durationMs: number;
};

export type ExerciseDay = {
  date: string;
  didExercise: boolean;
  detail: string;
  saved: boolean;
};

export type Meal = {
  id: string;
  slot: MealKind;
  quality: MealQuality | null;
  note: string;
  label: string;
};

export const KIND_LABELS: Record<MovementKind, string> = {
  ganancia: "Ganancia",
  gasto: "Gasto",
  inversion: "Inversión",
};

export const SLOT_LABELS: Record<MealSlot, string> = {
  desayuno: "Desayuno",
  almuerzo: "Almuerzo",
  merienda: "Merienda",
  cena: "Cena",
};

export const QUALITY_LABELS: Record<MealQuality, string> = {
  mala: "Mala",
  regular: "Regular",
  buena: "Buena",
};
