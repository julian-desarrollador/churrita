import Link from "next/link";
import { HomePeriod } from "@/components/home-period";
import { LiveStudy } from "@/components/live-study";
import {
  isDate,
  parseHomeView,
  periodDates,
  todayISO,
  WEEKDAY_INITIALS,
  weekdayIndex,
  type HomeView,
} from "@/lib/dates";
import { formatAverage, formatDuration } from "@/lib/format";
import { summarizeRange } from "@/lib/home";
import {
  getMeals,
  getTimer,
  listExerciseBetween,
  listMealsBetween,
  listSessionsBetween,
} from "@/lib/store";
import { EXTRA_SLOT, MEAL_QUALITIES, QUALITY_LABELS, SLOT_LABELS } from "@/lib/types";

const cardClass = "block rounded-3xl bg-surface p-4";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string | string[]; fecha?: string | string[] }>;
}) {
  const params = await searchParams;
  const today = todayISO();
  const requested = first(params.fecha);
  const date = isDate(requested) ? requested : today;
  const view = parseHomeView(first(params.vista));
  const period = periodDates(view, date);
  const [sessions, exercises, meals, timer] = await Promise.all([
    listSessionsBetween(period.start, period.end),
    listExerciseBetween(period.start, period.end),
    view === "dia" ? getMeals(date) : listMealsBetween(period.start, period.end),
    view === "dia" && date === today ? getTimer() : Promise.resolve(null),
  ]);
  const studyMs = sessions.reduce((sum, session) => sum + session.durationMs, 0);
  const summary =
    view === "dia"
      ? null
      : summarizeRange({
          dates: period.dates,
          today,
          studyMs,
          exercises,
          meals,
        });
  const dayExercise = exercises.find((item) => item.date === date);

  return (
    <div className="space-y-4">
      <HomePeriod view={view} date={date} today={today} />

      {view === "dia" ? (
        <div className="grid grid-cols-2 gap-3">
          <Link href={areaHref("estudio", date, view)} className={cardClass}>
            <p className="text-sm text-muted">Estudio</p>
            {timer ? (
              <LiveStudy savedMs={studyMs} timer={timer} />
            ) : (
              <p className="mt-2 text-2xl font-semibold tabular-nums">{formatDuration(studyMs)}</p>
            )}
          </Link>
          <Link href={areaHref("ejercicio", date, view)} className={cardClass}>
            <p className="text-sm text-muted">Ejercicio</p>
            <p
              className={`mt-2 text-2xl font-semibold ${
                dayExercise?.didExercise ? "inline-block rounded-2xl bg-leaf px-3 py-1" : ""
              }`}
            >
              {!dayExercise ? "Sin marcar" : dayExercise.didExercise ? "Sí" : "No"}
            </p>
            {dayExercise?.detail ? (
              <p className="mt-1 line-clamp-2 text-sm text-muted">{dayExercise.detail}</p>
            ) : null}
          </Link>
        </div>
      ) : summary ? (
        <>
          <Link href={areaHref("estudio", date, view)} className={cardClass}>
            <p className="text-sm text-muted">Estudio</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-2xl font-semibold tabular-nums">{formatDuration(summary.studyMs)}</p>
                <p className="mt-1 text-sm text-muted">Total</p>
              </div>
              <div>
                <p className="text-2xl font-semibold tabular-nums">
                  {formatDuration(summary.studyAverageMs)}
                </p>
                <p className="mt-1 text-sm text-muted">Promedio por día</p>
              </div>
            </div>
          </Link>
          <Link href={areaHref("ejercicio", date, view)} className={cardClass}>
            <p className="text-sm text-muted">Ejercicio</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {summary.exerciseYes} de {summary.divisor}
            </p>
            <p className="mt-1 text-sm text-muted">Días con ejercicio</p>
            {summary.exercisePerWeek != null && view === "mes" ? (
              <p className="mt-1 text-sm text-muted">
                Promedio {formatAverage(summary.exercisePerWeek)} días por semana
              </p>
            ) : null}
            {view === "semana" ? (
              <ul className="mt-4 grid grid-cols-7 gap-1 text-center">
                {period.dates.map((day) => {
                  const marked = exercises.find((item) => item.date === day);
                  return (
                    <li key={day}>
                      <p className="text-[11px] text-muted">{WEEKDAY_INITIALS[weekdayIndex(day)]}</p>
                      <p
                        className={`mt-1 rounded-xl py-1 text-xs font-medium ${
                          marked?.didExercise ? "bg-leaf" : "text-muted"
                        }`}
                      >
                        {!marked ? "—" : marked.didExercise ? "Sí" : "No"}
                      </p>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </Link>
        </>
      ) : null}

      <Link href={areaHref("nutricion", date, view)} className={cardClass}>
        {view === "dia" ? (
          <DayMeals meals={meals} />
        ) : summary ? (
          <>
            <div className="flex items-end justify-between gap-3">
              <p className="text-sm text-muted">Nutrición</p>
              <p className="text-2xl font-semibold tabular-nums">
                {formatAverage(summary.mealAverage)} de 4
              </p>
            </div>
            <p className="mt-1 text-sm text-muted">Promedio por día</p>
            {summary.qualityLabel ? (
              <p className="mt-1 text-sm">Calidad promedio: {summary.qualityLabel}</p>
            ) : (
              <p className="mt-1 text-sm text-muted">Sin comidas marcadas</p>
            )}
            <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
              {MEAL_QUALITIES.map((quality) => (
                <div key={quality}>
                  <dt className="text-muted">{QUALITY_LABELS[quality]}</dt>
                  <dd className="mt-1 font-medium tabular-nums">{summary.qualityCounts[quality]}</dd>
                </div>
              ))}
            </dl>
            {summary.extrasCount > 0 ? (
              <p className="mt-3 text-sm text-muted">
                {summary.extrasCount} entre comidas
              </p>
            ) : null}
          </>
        ) : null}
      </Link>
    </div>
  );
}

function DayMeals({
  meals,
}: {
  meals: Awaited<ReturnType<typeof getMeals>>;
}) {
  const mains = meals.filter((meal) => meal.slot !== EXTRA_SLOT);
  const extras = meals.filter((meal) => meal.slot === EXTRA_SLOT);
  const marked = mains.filter((meal) => meal.quality);

  return (
    <>
      <div className="flex items-end justify-between gap-3">
        <p className="text-sm text-muted">Nutrición</p>
        <p className="text-2xl font-semibold tabular-nums">{marked.length} de 4</p>
      </div>
      <ul className="mt-4 grid grid-cols-4 gap-2 text-center">
        {mains.map((meal) => (
          <li key={meal.id}>
            <p className="text-[11px] text-muted">
              {SLOT_LABELS[meal.slot as keyof typeof SLOT_LABELS]}
            </p>
            <p
              className={`mt-1 rounded-xl py-1 text-xs font-medium ${
                meal.quality ? "bg-leaf" : "text-muted"
              }`}
            >
              {meal.quality ? QUALITY_LABELS[meal.quality] : "—"}
            </p>
          </li>
        ))}
      </ul>
      {extras.length > 0 ? (
        <div className="mt-4 border-t border-line pt-3">
          <p className="mb-2 text-[11px] text-muted">Entre comidas</p>
          <ul className="grid grid-cols-2 gap-2 text-center min-[420px]:grid-cols-4">
            {extras.map((meal) => (
              <li key={meal.id}>
                <p className="truncate text-[11px] text-muted">{meal.label || "Entre comidas"}</p>
                <p
                  className={`mt-1 rounded-xl py-1 text-xs font-medium ${
                    meal.quality ? "bg-leaf" : "text-muted"
                  }`}
                >
                  {meal.quality ? QUALITY_LABELS[meal.quality] : "—"}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}

function areaHref(area: "estudio" | "ejercicio" | "nutricion", date: string, view: HomeView = "dia") {
  const month = date.slice(0, 7);
  if (area === "estudio") {
    return view === "dia" ? `/estudio?mes=${month}&dia=${date}` : `/estudio?mes=${month}`;
  }
  if (view === "dia") return `/${area}?fecha=${date}`;
  return `/${area}`;
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}
