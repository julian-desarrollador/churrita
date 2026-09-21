import Link from "next/link";
import { DateField } from "@/components/date-field";
import {
  addDays,
  formatMonth,
  periodDates,
  shiftMonth,
  type HomeView,
} from "@/lib/dates";
import { formatWeekRange } from "@/lib/format";
import { homeHref } from "@/lib/home";

const VIEWS: { id: HomeView; label: string }[] = [
  { id: "dia", label: "Día" },
  { id: "semana", label: "Semana" },
  { id: "mes", label: "Mes" },
];

export function HomePeriod({
  view,
  date,
  today,
}: {
  view: HomeView;
  date: string;
  today: string;
}) {
  const period = periodDates(view, date);
  const includesToday = period.start <= today && today <= period.end;
  const title =
    view === "dia"
      ? date === today
        ? "Hoy"
        : "Día"
      : view === "semana"
        ? includesToday
          ? "Esta semana"
          : "Semana"
        : includesToday
          ? "Este mes"
          : "Mes";

  const periodLabel =
    view === "semana" ? formatWeekRange(period.start, period.end) : formatMonth(date.slice(0, 7));

  return (
    <div className="space-y-3">
      {view === "dia" ? (
        <DateField
          heading={title}
          value={date}
          navigateTo="/"
          extraQuery="vista=dia"
        />
      ) : (
        <div className="flex items-center justify-between gap-3">
          <h1 className="shrink-0 text-3xl font-semibold">{title}</h1>
          <RangeNav view={view} date={date} today={today} label={periodLabel} />
        </div>
      )}
      <nav aria-label="Período" className="grid grid-cols-3 gap-1 rounded-2xl bg-surface p-1">
        {VIEWS.map((item) => {
          const active = item.id === view;
          return (
            <Link
              key={item.id}
              href={homeHref(item.id, date, today)}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 items-center justify-center rounded-xl text-sm ${
                active ? "bg-leaf font-semibold" : "font-medium text-muted"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      {view !== "dia" && period.start > today ? (
        <p className="text-center text-sm text-muted">Este período todavía no empieza</p>
      ) : null}
    </div>
  );
}

function RangeNav({
  view,
  date,
  today,
  label,
}: {
  view: Exclude<HomeView, "dia">;
  date: string;
  today: string;
  label: string;
}) {
  const period = periodDates(view, date);
  const previous =
    view === "semana"
      ? addDays(period.start, -7)
      : `${shiftMonth(date.slice(0, 7), -1)}-01`;
  const next =
    view === "semana"
      ? addDays(period.start, 7)
      : `${shiftMonth(date.slice(0, 7), 1)}-01`;
  const noun = view === "semana" ? "Semana" : "Mes";

  return (
    <div className="flex min-w-0 items-center gap-0.5">
      <Link
        href={homeHref(view, previous, today)}
        aria-label={`${noun} anterior`}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg text-muted"
      >
        ‹
      </Link>
      <p className="min-w-0 text-right text-sm leading-snug text-muted">{label}</p>
      <Link
        href={homeHref(view, next, today)}
        aria-label={`${noun} siguiente`}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg text-muted"
      >
        ›
      </Link>
    </div>
  );
}
