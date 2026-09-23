"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { send } from "@/lib/api-client";
import { formatClock } from "@/lib/format";
import type { TimerState } from "@/lib/types";
import { PrimaryButton, TextInput } from "@/components/ui";

export function StudyTimer({ initial }: { initial: TimerState }) {
  const router = useRouter();
  const [timer, setTimer] = useState(initial);
  const [topic, setTopic] = useState(initial.topic);
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const revision = useRef(0);
  const chain = useRef(Promise.resolve());
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!timer.running) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [timer.running]);

  const shown = displayedMs(timer, now);

  function act(action: "play" | "pause" | "save" | "discard") {
    const now = Date.now();
    const current = timer;
    if (action === "save" && displayedMs(current, now) < 1000) {
      setSaved(false);
      setError("Todavía no hay tiempo para guardar");
      return;
    }
    const rev = ++revision.current;
    const at = new Date(now).toISOString();
    setError("");
    setSaved(action === "save");
    setNow(now);
    setTimer(optimisticTimer(current, action, topic, now));
    chain.current = chain.current.catch(() => undefined).then(async () => {
      try {
        const next = await send<TimerState>("/api/study/timer", {
          method: "POST",
          body: JSON.stringify({ action, topic, at }),
        });
        if (!mounted.current || revision.current !== rev) return;
        setTimer(next);
        setNow(Date.now());
        if (action === "save") router.refresh();
      } catch (caught) {
        if (!mounted.current || revision.current !== rev) return;
        setSaved(false);
        setError(caught instanceof Error ? caught.message : "No se pudo guardar");
        try {
          const fresh = await send<TimerState>("/api/study/timer");
          if (mounted.current && revision.current === rev) setTimer(fresh);
        } catch {
          // El reloj local sigue hasta que vuelva la conexión.
        }
      }
    });
  }

  return (
    <div className={`rounded-3xl p-5 ${timer.running ? "bg-leaf" : "bg-surface"}`}>
      <p className="text-5xl font-semibold tabular-nums tracking-tight">{formatClock(shown)}</p>
      <label className="mt-5 block">
        <span className="mb-2 block text-sm text-muted">Tema, si querés</span>
        <TextInput
          value={topic}
          placeholder="Bioquímica"
          onChange={(event) => setTopic(event.target.value)}
        />
      </label>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <PrimaryButton
          type="button"
          className={timer.running ? "bg-white hover:bg-white" : ""}
          onClick={() => act(timer.running ? "pause" : "play")}
        >
          {timer.running ? "Pausa" : "Play"}
        </PrimaryButton>
        <PrimaryButton
          type="button"
          className="bg-white hover:bg-leaf"
          onClick={() => act("save")}
        >
          Guardar
        </PrimaryButton>
      </div>
      {!timer.running && shown >= 1000 ? (
        <button
          type="button"
          className="mt-3 text-sm text-muted"
          onClick={() => act("discard")}
        >
          Descartar este tiempo
        </button>
      ) : null}
      {saved ? <p className="mt-3 text-sm">Sesión guardada en el día de hoy.</p> : null}
      {error ? <p className="mt-3 text-sm">{error}</p> : null}
    </div>
  );
}

function optimisticTimer(
  timer: TimerState,
  action: "play" | "pause" | "save" | "discard",
  topic: string,
  now: number,
): TimerState {
  const elapsed = displayedMs(timer, now);
  if (action === "play") {
    if (timer.running) return { ...timer, topic };
    return {
      running: true,
      startedAt: new Date(now).toISOString(),
      accumulatedMs: timer.accumulatedMs,
      elapsedMs: elapsed,
      topic,
    };
  }
  if (action === "pause") {
    return {
      running: false,
      startedAt: null,
      accumulatedMs: elapsed,
      elapsedMs: elapsed,
      topic,
    };
  }
  return {
    running: false,
    startedAt: null,
    accumulatedMs: 0,
    elapsedMs: 0,
    topic,
  };
}

function displayedMs(timer: TimerState, now: number) {
  if (!timer.running || !timer.startedAt) return timer.elapsedMs;
  return Math.max(0, timer.accumulatedMs + (now - new Date(timer.startedAt).getTime()));
}
