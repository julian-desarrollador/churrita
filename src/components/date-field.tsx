"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarMonth } from "@/components/calendar-month";
import { formatLongDate, shiftMonth, todayISO } from "@/lib/dates";

export function DateField({
  value,
  onChange,
  navigateTo,
  extraQuery,
  label,
  heading,
}: {
  value: string;
  onChange?: (next: string) => void;
  navigateTo?: string;
  extraQuery?: string;
  label?: string;
  heading?: string;
}) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => value.slice(0, 7));

  useEffect(() => {
    setMonth(value.slice(0, 7));
  }, [value]);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(date: string) {
    onChange?.(date);
    if (navigateTo) {
      const params = new URLSearchParams(extraQuery ?? "");
      params.set("fecha", date);
      router.push(`${navigateTo}?${params}`);
    }
    setOpen(false);
  }

  const today = todayISO();
  const calendar = open ? (
    <>
      <div className="mt-3 rounded-3xl border border-line bg-white p-4">
        <CalendarMonth
          month={month}
          selected={value}
          onPrevious={() => setMonth((current) => shiftMonth(current, -1))}
          onNext={() => setMonth((current) => shiftMonth(current, 1))}
          onDay={choose}
        />
      </div>
      {!heading && value !== today ? (
        <button type="button" onClick={() => choose(today)} className="mt-2 w-full text-sm text-muted">
          Ir a hoy
        </button>
      ) : null}
    </>
  ) : null;

  if (heading) {
    return (
      <div ref={rootRef}>
        <div className="flex items-center justify-between gap-3">
          <h1 className="shrink-0 text-3xl font-semibold">{heading}</h1>
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
            className="min-w-0 text-right text-sm leading-snug text-muted"
          >
            {formatLongDate(value)}
          </button>
        </div>
        {calendar}
      </div>
    );
  }

  return (
    <div ref={rootRef}>
      {label ? <span className="mb-2 block text-sm text-muted">{label}</span> : null}
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-12 w-full items-center justify-between rounded-2xl border border-line bg-white px-4 py-3 text-left"
      >
        <span>{formatLongDate(value)}</span>
        <span className="text-sm text-muted">{open ? "Cerrar" : "Elegir"}</span>
      </button>
      {calendar}
    </div>
  );
}
