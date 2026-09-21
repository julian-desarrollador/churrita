const TIME_ZONE = "America/Argentina/Buenos_Aires";

export function todayISO(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function currentMonth(now = new Date()) {
  return todayISO(now).slice(0, 7);
}

export function isDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isMonth(value: string) {
  return /^\d{4}-\d{2}$/.test(value);
}

export function shiftMonth(month: string, delta: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
  const nextYear = date.getUTCFullYear();
  const nextMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${nextYear}-${nextMonth}`;
}

export function formatLongDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  const label = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatMonth(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1, 15));
  const label = new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function daysInMonth(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
}

export function leadingBlankDays(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay();
  return (weekday + 6) % 7;
}

export function dateInMonth(month: string, day: number) {
  return `${month}-${String(day).padStart(2, "0")}`;
}

export const WEEKDAY_INITIALS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"] as const;

export type HomeView = "dia" | "semana" | "mes";

export function parseHomeView(value: string): HomeView {
  if (value === "semana" || value === "mes") return value;
  return "dia";
}

export function weekdayIndex(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return (weekday + 6) % 7;
}

export function addDays(iso: string, days: number) {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  const nextYear = date.getUTCFullYear();
  const nextMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
  const nextDay = String(date.getUTCDate()).padStart(2, "0");
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

export function weekDates(iso: string) {
  const start = addDays(iso, -weekdayIndex(iso));
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function monthDates(month: string) {
  return Array.from({ length: daysInMonth(month) }, (_, index) => dateInMonth(month, index + 1));
}

export function periodDates(view: HomeView, anchor: string) {
  if (view === "semana") {
    const dates = weekDates(anchor);
    return { start: dates[0], end: dates[6], dates };
  }
  if (view === "mes") {
    const dates = monthDates(anchor.slice(0, 7));
    return { start: dates[0], end: dates[dates.length - 1], dates };
  }
  return { start: anchor, end: anchor, dates: [anchor] };
}

export function daysForAverage(dates: string[], today: string) {
  const elapsed = dates.filter((date) => date <= today).length;
  return elapsed > 0 ? elapsed : dates.length;
}
