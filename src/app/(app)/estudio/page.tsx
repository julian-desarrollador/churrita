import { StudyCalendar } from "@/components/study-calendar";
import { StudyTimer } from "@/components/study-timer";
import { currentMonth, isDate, isMonth, todayISO } from "@/lib/dates";
import { getTimer, listSessions } from "@/lib/store";

export default async function EstudioPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string | string[]; dia?: string | string[] }>;
}) {
  const params = await searchParams;
  const requestedMonth = first(params.mes);
  const month = isMonth(requestedMonth) ? requestedMonth : currentMonth();
  const requestedDay = first(params.dia);
  const today = todayISO();
  const selected =
    isDate(requestedDay) && requestedDay.startsWith(`${month}-`)
      ? requestedDay
      : today.startsWith(month)
        ? today
        : `${month}-01`;
  const [timer, sessions] = await Promise.all([getTimer(), listSessions(month)]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold">Estudio</h1>
        <p className="mt-1 text-muted">Nutrición</p>
      </div>
      <StudyTimer initial={timer} />
      <StudyCalendar month={month} selected={selected} sessions={sessions} />
    </div>
  );
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}
