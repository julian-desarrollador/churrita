"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { send } from "@/lib/api-client";
import { todayISO } from "@/lib/dates";
import { formatMoney, formatShortDate } from "@/lib/format";
import { KIND_LABELS, MOVEMENT_KINDS, type Movement, type MovementKind } from "@/lib/types";
import { DateField } from "@/components/date-field";
import { Choice, Field, PrimaryButton, TextInput } from "@/components/ui";

export function ContabilidadForm({ movements }: { movements: Movement[] }) {
  const router = useRouter();
  const [date, setDate] = useState(todayISO());
  const [kind, setKind] = useState<MovementKind | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!kind) {
      setError("Elegí si es ganancia, gasto o inversión");
      return;
    }
    setPending(true);
    setError("");
    try {
      await send("/api/movements", {
        method: "POST",
        body: JSON.stringify({ date, kind, amount, note }),
      });
      setAmount("");
      setNote("");
      setKind(null);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo guardar");
    } finally {
      setPending(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("¿Querés quitar este movimiento?")) return;
    setError("");
    try {
      await send(`/api/movements/${id}`, { method: "DELETE" });
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo quitar");
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-4 rounded-3xl bg-surface p-5">
        <h2 className="text-lg font-semibold">Nuevo movimiento</h2>
        <DateField label="Fecha" value={date} onChange={setDate} />
        <div>
          <p className="mb-2 text-sm text-muted">Tipo</p>
          <div className="grid grid-cols-3 gap-2">
            {MOVEMENT_KINDS.map((option) => (
              <Choice key={option} active={kind === option} onClick={() => setKind(option)}>
                {KIND_LABELS[option]}
              </Choice>
            ))}
          </div>
        </div>
        <Field label="Monto">
          <TextInput
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
          />
        </Field>
        <Field label="Nota, si hace falta">
          <TextInput
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Opcional"
          />
        </Field>
        {error ? <p className="text-sm text-muted">{error}</p> : null}
        <PrimaryButton type="submit" className="w-full" disabled={pending}>
          {pending ? "Guardando..." : "Guardar"}
        </PrimaryButton>
      </form>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Movimientos</h2>
        {movements.length === 0 ? (
          <p className="rounded-3xl bg-surface p-5 text-muted">Todavía no hay movimientos este mes.</p>
        ) : (
          movements.map((movement) => (
            <article key={movement.id} className="flex items-center justify-between gap-3 rounded-3xl bg-surface px-5 py-4">
              <div>
                <p className="font-medium">{formatMoney(movement.amount)}</p>
                <p className="text-sm text-muted">
                  {KIND_LABELS[movement.kind]} · {formatShortDate(movement.date)}
                  {movement.note ? ` · ${movement.note}` : ""}
                </p>
              </div>
              <button
                type="button"
                className="rounded-2xl px-3 py-2 text-sm text-muted"
                onClick={() => remove(movement.id)}
              >
                Quitar
              </button>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
