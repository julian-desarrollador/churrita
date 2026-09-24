import { daysForAverage, type HomeView } from "@/lib/dates";
import { EXTRA_SLOT, type MealKind, type MealQuality } from "@/lib/types";

const QUALITY_SCORE: Record<MealQuality, number> = {
  mala: 1,
  regular: 2,
  buena: 3,
};

export function homeHref(view: HomeView, date: string, today: string) {
  if (view === "dia" && date === today) return "/";
  return `/?${new URLSearchParams({ vista: view, fecha: date })}`;
}

export function qualityLabelFromScore(score: number) {
  if (score < 1.5) return "Mala";
  if (score < 2.5) return "Regular";
  return "Buena";
}

export function summarizeRange(input: {
  dates: string[];
  today: string;
  studyMs: number;
  todayStudyMs: number;
  exercises: { didExercise: boolean }[];
  meals: { slot: MealKind; quality: MealQuality | null }[];
}) {
  const divisor = daysForAverage(input.dates, input.today);
  const closedDays = input.dates.filter((date) => date < input.today).length;
  const todayInPeriod = input.dates.includes(input.today);
  const studyAverageWithoutTodayMs =
    todayInPeriod && closedDays > 0
      ? Math.max(0, input.studyMs - input.todayStudyMs) / closedDays
      : null;
  const exerciseYes = input.exercises.filter((day) => day.didExercise).length;
  const mainsMarked = input.meals.filter((meal) => meal.slot !== EXTRA_SLOT && meal.quality).length;
  const extrasCount = input.meals.filter((meal) => meal.slot === EXTRA_SLOT).length;
  const qualityCounts: Record<MealQuality, number> = { mala: 0, regular: 0, buena: 0 };
  let qualitySum = 0;
  let qualityN = 0;
  for (const meal of input.meals) {
    if (!meal.quality) continue;
    qualityCounts[meal.quality] += 1;
    qualitySum += QUALITY_SCORE[meal.quality];
    qualityN += 1;
  }
  const qualityAverage = qualityN > 0 ? qualitySum / qualityN : null;
  return {
    divisor,
    studyMs: input.studyMs,
    studyAverageMs: input.studyMs / divisor,
    studyAverageWithoutTodayMs,
    exerciseYes,
    exercisePerWeek: divisor >= 7 ? (exerciseYes * 7) / divisor : null,
    mealAverage: mainsMarked / divisor,
    qualityLabel: qualityAverage == null ? null : qualityLabelFromScore(qualityAverage),
    qualityCounts,
    extrasCount,
  };
}
