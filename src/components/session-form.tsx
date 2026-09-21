"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState, type FormEvent } from "react";
import { Field, PrimaryButton, TextInput } from "@/components/ui";
import { send } from "@/lib/api-client";
import { formatLongDate } from "@/lib/dates";
import { durationParts } from "@/lib/format";
import type { StudySession } from "@/lib/types";

export function LoadTimerButton({ date }: { date: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="mt-1 shrink-0 rounded-full border border-line bg-white px-3 py-1.5 text-sm font-medium"
        onClick={() => setOpen(true)}
      >
        Cargar timer
      </button>
      {open ? (
        <TimerDialog date={date} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}

export function EditTimerButton({ session }: { session: StudySession }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Editar"
        className="flex h-9 w-9 items-center justify-center rounded-full text-muted"
        onClick={() => setOpen(true)}
      >
        <PencilIcon />
      </button>
      {open ? (
        <TimerDialog
          date={session.date}
          session={session}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

function TimerDialog({
  date,
  session,
  onClose,
}: {
  date: string;
  session?: StudySession;
  onClose: () => void;
}) {
  const router = useRouter();
  const titleId = useId();
  const initial = session ? durationParts(session.durationMs) : { hours: "", minutes: "" };
  const [topic, setTopic] = useState(session?.topic ?? "");
  const [hours, setHours] = useState(initial.hours);
  const [minutes, setMinutes] = useState(initial.minutes);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, pending]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const body = JSON.stringify({
        date,
        topic,
        hours: hours.trim() === "" ? 0 : hours.trim(),
        minutes: minutes.trim() === "" ? 0 : minutes.trim(),
      });
      if (session) {
        await send(`/api/study/sessions/${session.id}`, { method: "PATCH", body });
      } else {
        await send("/api/study/sessions", { method: "POST", body });
      }
      router.refresh();
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo guardar");
      setPending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-foreground/30 p-4 sm:items-center"
      onClick={() => {
        if (!pending) onClose();
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-3xl bg-white p-5 shadow-sm"
        onClick={(event) => event.stopPropagation()}
        onSubmit={save}
      >
        <h2 id={titleId} className="text-xl font-semibold">
          {session ? "Editar timer" : "Cargar timer"}
        </h2>
        <p className="mt-1 text-sm text-muted">{formatLongDate(date)}</p>
        <div className="mt-4 space-y-4">
          <Field label="Título">
            <TextInput
              autoFocus
              value={topic}
              placeholder="Bioquímica"
              maxLength={80}
              onChange={(event) => setTopic(event.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Horas">
              <TextInput
                inputMode="numeric"
                value={hours}
                placeholder="1"
                onChange={(event) => setHours(event.target.value)}
              />
            </Field>
            <Field label="Minutos">
              <TextInput
                inputMode="numeric"
                value={minutes}
                placeholder="30"
                onChange={(event) => setMinutes(event.target.value)}
              />
            </Field>
          </div>
        </div>
        {error ? <p className="mt-3 text-sm">{error}</p> : null}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="min-h-12 rounded-2xl border border-line font-medium"
            disabled={pending}
            onClick={onClose}
          >
            Cancelar
          </button>
          <PrimaryButton type="submit" disabled={pending}>
            Guardar
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}

function PencilIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 20h4l10.2-10.2a1.6 1.6 0 0 0 0-2.3l-1.7-1.7a1.6 1.6 0 0 0-2.3 0L4 16v4z" />
      <path d="m13.2 6.8 4 4" />
    </svg>
  );
}
