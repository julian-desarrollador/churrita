"use client";

import Link from "next/link";
import { usePendingHref } from "@/components/instant-navigation";
import { formatMonth, isMonth, shiftMonth } from "@/lib/dates";

export function MonthSwitcher({
  month,
  basePath,
}: {
  month: string;
  basePath: string;
}) {
  const pendingHref = usePendingHref();
  const shown = pendingMonth(pendingHref, basePath) ?? month;
  const previous = shiftMonth(shown, -1);
  const next = shiftMonth(shown, 1);

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`${basePath}?mes=${previous}`}
        aria-label={`Ver ${formatMonth(previous)}`}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface text-lg"
      >
        ‹
      </Link>
      <p className="min-w-0 flex-1 text-center font-medium">{formatMonth(shown)}</p>
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

function pendingMonth(href: string | null, basePath: string) {
  if (!href) return null;
  const url = new URL(href, "https://churrita.local");
  if (url.pathname !== basePath) return null;
  const month = url.searchParams.get("mes") ?? "";
  return isMonth(month) ? month : null;
}