import { CalendarMonth } from "@/components/calendar-month";
import { SessionList } from "@/components/session-list";
import { formatLongDate, shiftMonth } from "@/lib/dates";
import { formatShortDuration } from "@/lib/format";
import type { StudySession } from "@/lib/types";

export function StudyCalendar({
  month,
  selected,
  sessions,
}: {
  month: string;
  selected: string;
  sessions: StudySession[];
}) {
  const byDay = new Map<string, number>();
  for (const session of sessions) {
    byDay.set(session.date, (byDay.get(session.date) ?? 0) + session.durationMs);
  }
  const selectedSessions = sessions.filter((session) => session.date === selected);
  const [weekday, rest] = formatLongDate(selected).split(", ");

  return (
    <section className="rounded-3xl border border-line bg-white p-4">
      <CalendarMonth
        month={month}
        selected={selected}
        previousHref={`/estudio?mes=${shiftMonth(month, -1)}`}
        nextHref={`/estudio?mes=${shiftMonth(month, 1)}`}
        dayHref={(date) => `/estudio?mes=${date.slice(0, 7)}&dia=${date}`}
        caption={(date, inMonth) => {
          const duration = byDay.get(date) ?? 0;
          return inMonth && duration > 0 ? formatShortDuration(duration) : "";
        }}
        labelFor={(date) => {
          const duration = byDay.get(date) ?? 0;
          return duration > 0
            ? `${formatLongDate(date)}, ${formatShortDuration(duration)}`
            : formatLongDate(date);
        }}
      />

      <div className="mt-2 border-t border-line pt-4">
        <p className="text-lg font-semibold">{weekday}</p>
        <p className="text-sm text-muted">{rest}</p>
        <SessionList sessions={selectedSessions} />
      </div>
    </section>
  );
}
