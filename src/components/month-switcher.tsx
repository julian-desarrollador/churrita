import Link from "next/link";
import { formatMonth, shiftMonth } from "@/lib/dates";

export function MonthSwitcher({
  month,
  basePath,
}: {
  month: string;
  basePath: string;
}) {
  const previous = shiftMonth(month, -1);
  const next = shiftMonth(month, 1);

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`${basePath}?mes=${previous}`}
        aria-label={`Ver ${formatMonth(previous)}`}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface text-lg"
      >
        ‹
      </Link>
      <p className="min-w-0 flex-1 text-center font-medium">{formatMonth(month)}</p>
      <Link
        href={`${basePath}?mes=${next}`}
        aria-label={`Ver ${formatMonth(next)}`}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface text-lg"
      >
        ›
      </Link>
    </div>
  );
}