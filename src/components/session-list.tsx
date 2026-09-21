"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { send } from "@/lib/api-client";
import { formatDuration } from "@/lib/format";
import type { StudySession } from "@/lib/types";

export function SessionList({ sessions }: { sessions: StudySession[] }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function remove(id: string) {
    setError("");
    try {
      await send(`/api/study/sessions/${id}`, { method: "DELETE" });
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo quitar");
    }
  }

  if (sessions.length === 0) {
    return <p className="mt-2 text-sm text-muted">Este día no tiene estudio guardado.</p>;
  }

  return (
    <div className="mt-3 space-y-2">
      {sessions.map((session) => (
        <article key={session.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3">
          <div>
            <p className="font-medium">{formatDuration(session.durationMs)}</p>
            <p className="text-sm text-muted">{session.topic || "Nutrición"}</p>
          </div>
          <button type="button" className="text-sm text-muted" onClick={() => remove(session.id)}>
            Quitar
          </button>
        </article>
      ))}
      {error ? <p className="text-sm text-muted">{error}</p> : null}
    </div>
  );
}
