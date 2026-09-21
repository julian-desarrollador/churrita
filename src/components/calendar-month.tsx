import Link from "next/link";
import {
  dateInMonth,
  daysInMonth,
  formatLongDate,
  formatMonth,
  leadingBlankDays,
  shiftMonth,
  todayISO,
} from "@/lib/dates";

const WEEKDAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

export function CalendarMonth({
  month,
  selected,
  previousHref,
  nextHref,
  onPrevious,
  onNext,
  dayHref,
  onDay,
  caption,
  labelFor,
}: {
  month: string;
  selected: string;
  previousHref?: string;
  nextHref?: string;
  onPrevious?: () => void;
  onNext?: () => void;
  dayHref?: (date: string) => string;
  onDay?: (date: string) => void;
  caption?: (date: string, inMonth: boolean) => string;
  labelFor?: (date: string) => string;
}) {
  const today = todayISO();
  const cells = monthCells(month);

  return (
    <>
      <div className="mb-3 flex items-center gap-2">
        <Step
          label="Mes anterior"
          symbol="‹"
          href={previousHref}
          onClick={onPrevious}
        />
        <p className="min-w-0 flex-1 text-center font-medium">{formatMonth(month)}</p>
        <Step label="Mes siguiente" symbol="›" href={nextHref} onClick={onNext} />
      </div>

      <div className="grid grid-cols-7 text-center text-[11px] tracking-wide text-muted">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((cell) => {
          const isToday = cell.date === today;
          const isSelected = cell.date === selected;
          const className = `flex h-14 flex-col items-center justify-start pt-1 ${
            cell.inMonth ? "text-foreground" : "text-muted/40"
          }`;
          const body = (
            <>
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                  isSelected ? "bg-leaf font-semibold" : isToday ? "ring-2 ring-leaf-strong" : ""
                }`}
              >
                {cell.day}
              </span>
              <span className="mt-0.5 h-3 text-[10px] leading-none text-muted">
                {caption?.(cell.date, cell.inMonth) ?? ""}
              </span>
            </>
          );
          const label = labelFor?.(cell.date) ?? formatLongDate(cell.date);
          if (dayHref) {
            return (
              <Link
                key={cell.date}
                href={dayHref(cell.date)}
                aria-current={isToday ? "date" : undefined}
                aria-label={label}
                className={className}
              >
                {body}
              </Link>
            );
          }
          return (
            <button
              key={cell.date}
              type="button"
              onClick={() => onDay?.(cell.date)}
              aria-current={isToday ? "date" : undefined}
              aria-pressed={isSelected}
              aria-label={label}
              className={className}
            >
              {body}
            </button>
          );
        })}
      </div>
    </>
  );
}

function Step({
  label,
  symbol,
  href,
  onClick,
}: {
  label: string;
  symbol: string;
  href?: string;
  onClick?: () => void;
}) {
  const className = "flex h-9 w-9 items-center justify-center rounded-full text-lg text-muted";
  if (href) {
    return (
      <Link href={href} aria-label={label} className={className}>
        {symbol}
      </Link>
    );
  }
  return (
    <button type="button" aria-label={label} onClick={onClick} className={className}>
      {symbol}
    </button>
  );
}

function monthCells(month: string) {
  const blanks = leadingBlankDays(month);
  const count = daysInMonth(month);
  const previous = shiftMonth(month, -1);
  const previousCount = daysInMonth(previous);
  const cells: { date: string; day: number; inMonth: boolean }[] = [];

  for (let index = blanks; index > 0; index -= 1) {
    const day = previousCount - index + 1;
    cells.push({ date: dateInMonth(previous, day), day, inMonth: false });
  }
  for (let day = 1; day <= count; day += 1) {
    cells.push({ date: dateInMonth(month, day), day, inMonth: true });
  }
  const next = shiftMonth(month, 1);
  let day = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ date: dateInMonth(next, day), day, inMonth: false });
    day += 1;
  }
  return cells;
}
