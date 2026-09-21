import { isDate, isMonth } from "@/lib/dates";
import {
  EXTRA_SLOT,
  MEAL_QUALITIES,
  MEAL_SLOTS,
  MOVEMENT_KINDS,
  type Meal,
  type MealQuality,
  type MealSlot,
  type MovementKind,
} from "@/lib/types";

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function one(value: string | string[] | null) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export function asKind(value: unknown): MovementKind | null {
  return MOVEMENT_KINDS.includes(value as MovementKind)
    ? (value as MovementKind)
    : null;
}

export function asSlot(value: unknown): MealSlot | null {
  return MEAL_SLOTS.includes(value as MealSlot) ? (value as MealSlot) : null;
}

export function asQuality(value: unknown): MealQuality | null {
  if (value === null || value === "") return null;
  return MEAL_QUALITIES.includes(value as MealQuality)
    ? (value as MealQuality)
    : null;
}

export function validDate(value: unknown) {
  return typeof value === "string" && isDate(value);
}

export function validMonth(value: unknown) {
  return typeof value === "string" && isMonth(value);
}

export function asMeals(value: unknown): Meal[] | null {
  if (!Array.isArray(value) || value.length < MEAL_SLOTS.length) return null;
  const meals: Meal[] = [];
  for (const slot of MEAL_SLOTS) {
    const item = value.find(
      (entry) => entry && typeof entry === "object" && entry.slot === slot,
    );
    if (!item) return null;
    const quality = asQuality(item.quality);
    if (item.quality && !quality) return null;
    meals.push({
      id: slot,
      slot,
      quality,
      note: typeof item.note === "string" ? item.note : "",
      label: "",
    });
  }
  for (const item of value) {
    if (!item || typeof item !== "object" || item.slot !== EXTRA_SLOT) continue;
    const quality = asQuality(item.quality);
    if (item.quality && !quality) return null;
    meals.push({
      id: typeof item.id === "string" && item.id ? item.id : crypto.randomUUID(),
      slot: EXTRA_SLOT,
      quality,
      note: typeof item.note === "string" ? item.note : "",
      label: typeof item.label === "string" ? item.label : "",
    });
  }
  return meals;
}
