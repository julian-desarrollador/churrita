"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EditTimerButton } from "@/components/session-form";
import { send } from "@/lib/api-client";
import { formatDuration } from "@/lib/format";
import type { StudySession } from "@/lib/types";

export function SessionList({ sessions }: { sessions: StudySession[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [hidden, setHidden] = useState<string[]>([]);
  const [syncedSessions, setSyncedSessions] = useState(sessions);
  if (syncedSessions !== sessions) {
    setSyncedSessions(sessions);
    setHidden([]);
  }

  async function remove(id: string) {
    setHidden((current) => (current.includes(id) ? current : [...current, id]));
    setError("");
    try {
      await send(`/api/study/sessions/${id}`, { method: "DELETE" });
      router.refresh();
    } catch (caught) {
      setHidden((current) => current.filter((item) => item !== id));
      setError(caught instanceof Error ? caught.message : "No se pudo quitar");
    }
  }

  const visible = sessions.filter((session) => !hidden.includes(session.id));

  if (visible.length === 0) {
    return <p className="mt-2 text-sm text-muted">Este día no tiene estudio guardado.</p>;
  }

  return (
    <div className="mt-3 space-y-2">
      {visible.map((session) => (
        <article key={session.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3">
          <div>
            <p className="font-medium">{formatDuration(session.durationMs)}</p>
            <p className="text-sm text-muted">{session.topic || "Nutrición"}</p>
          </div>
          <div className="flex shrink-0 items-center">
            <EditTimerButton session={session} />
            <button type="button" className="px-2 text-sm text-muted" onClick={() => remove(session.id)}>
              Quitar
            </button>
          </div>
        </article>
      ))}
      {error ? <p className="text-sm text-muted">{error}</p> : null}
    </div>
  );
}
