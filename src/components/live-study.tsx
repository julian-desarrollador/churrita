"use client";

import { useEffect, useState } from "react";
import { formatClock, formatDuration } from "@/lib/format";
import type { TimerState } from "@/lib/types";

export function LiveStudy({
  savedMs,
  timer,
}: {
  savedMs: number;
  timer: TimerState;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!timer.running) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [timer.running]);

  const live =
    timer.running && timer.startedAt
      ? Math.max(0, timer.accumulatedMs + (now - new Date(timer.startedAt).getTime()))
      : timer.elapsedMs;

  return (
    <>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{formatDuration(savedMs)}</p>
      {live >= 1000 ? (
        <p
          className={`mt-3 text-sm ${
            timer.running ? "rounded-2xl bg-leaf px-3 py-2" : "text-muted"
          }`}
        >
          {timer.running ? "En curso" : "Sin guardar"} · {formatClock(live)}
          {timer.topic ? ` · ${timer.topic}` : ""}
        </p>
      ) : null}
    </>
  );
}
