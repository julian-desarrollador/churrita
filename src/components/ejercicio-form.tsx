"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { send } from "@/lib/api-client";
import type { ExerciseDay } from "@/lib/types";
import { Choice, Field, PrimaryButton, TextInput } from "@/components/ui";

export function EjercicioForm({ exercise }: { exercise: ExerciseDay }) {
  const router = useRouter();
  const [didExercise, setDidExercise] = useState<boolean | null>(
    exercise.saved ? exercise.didExercise : null,
  );
  const [detail, setDetail] = useState(exercise.detail);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (didExercise === null) {
      setError("Marcá si hiciste ejercicio o no");
      return;
    }
    setPending(true);
    setError("");
    setSaved(false);
    try {
      await send("/api/exercise", {
        method: "PUT",
        body: JSON.stringify({
          date: exercise.date,
          didExercise,
          detail: didExercise ? detail : "",
        }),
      });
      setSaved(true);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo guardar");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-3xl bg-surface p-5">
      <div className="grid grid-cols-2 gap-2">
        <Choice active={didExercise === true} onClick={() => setDidExercise(true)}>
          Sí
        </Choice>
        <Choice active={didExercise === false} onClick={() => setDidExercise(false)}>
          No
        </Choice>
      </div>
      {didExercise ? (
        <Field label="Qué hiciste, si querés">
          <TextInput
            value={detail}
            placeholder="Pecho, hombro, tríceps"
            onChange={(event) => setDetail(event.target.value)}
          />
        </Field>
      ) : null}
      {error ? <p className="text-sm text-muted">{error}</p> : null}
      {saved ? <p className="text-sm">Guardado.</p> : null}
      <PrimaryButton type="submit" className="w-full" disabled={pending}>
        {pending ? "Guardando..." : "Guardar"}
      </PrimaryButton>
    </form>
  );
}
