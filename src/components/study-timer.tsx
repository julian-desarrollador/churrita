"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!timer.running) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [timer.running]);

  const shown = displayedMs(timer, now);

  async function act(action: "play" | "pause" | "save" | "discard") {
    setPending(true);
    setError("");
    setSaved(false);
    try {
      const next = await send<TimerState>("/api/study/timer", {
        method: "POST",
        body: JSON.stringify({ action, topic }),
      });
      setTimer(next);
      setNow(Date.now());
      if (action === "save") {
        setSaved(true);
        router.refresh();
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo guardar");
    } finally {
      setPending(false);
    }
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
          disabled={pending}
          onClick={() => act(timer.running ? "pause" : "play")}
        >
          {timer.running ? "Pausa" : "Play"}
        </PrimaryButton>
        <PrimaryButton
          type="button"
          className="bg-white hover:bg-leaf"
          disabled={pending}
          onClick={() => act("save")}
        >
          Guardar
        </PrimaryButton>
      </div>
      {!timer.running && shown >= 1000 ? (
        <button
          type="button"
          className="mt-3 text-sm text-muted"
          disabled={pending}
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

function displayedMs(timer: TimerState, now: number) {
  if (!timer.running || !timer.startedAt) return timer.elapsedMs;
  return Math.max(0, timer.accumulatedMs + (now - new Date(timer.startedAt).getTime()));
}
