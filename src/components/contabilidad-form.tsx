"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { send } from "@/lib/api-client";
import { todayISO } from "@/lib/dates";
import { formatMoney, formatShortDate, parseAmount } from "@/lib/format";
import { totalsFrom } from "@/lib/totals";
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
  const [pendingItem, setPendingItem] = useState<Movement | null>(null);
  const [removed, setRemoved] = useState<string[]>([]);
  const [syncedMovements, setSyncedMovements] = useState(movements);
  if (syncedMovements !== movements) {
    setSyncedMovements(movements);
    setPendingItem(null);
    setRemoved((current) => current.filter((id) => movements.some((item) => item.id === id)));
  }

  const items = [
    ...movements.filter((item) => !removed.includes(item.id)),
    ...(pendingItem ? [pendingItem] : []),
  ].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const totals = totalsFrom(items);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const amountValue = parseAmount(amount);
    if (!kind || amountValue === null) {
      setError(kind ? "Revisá el monto" : "Elegí si es ganancia, gasto o inversión");
      return;
    }
    const optimistic: Movement = {
      id: `pending-${crypto.randomUUID()}`,
      date,
      kind,
      amount: amountValue,
      note: note.trim(),
    };
    const previous = { date, kind, amount, note };
    setPendingItem(optimistic);
    setAmount("");
    setNote("");
    setKind(null);
    setPending(true);
    setError("");
    try {
      await send("/api/movements", {
        method: "POST",
        body: JSON.stringify({ date: optimistic.date, kind: optimistic.kind, amount, note: optimistic.note }),
      });
      router.refresh();
    } catch (caught) {
      setPendingItem(null);
      setDate(previous.date);
      setKind(previous.kind);
      setAmount(previous.amount);
      setNote(previous.note);
      setError(caught instanceof Error ? caught.message : "No se pudo guardar");
    } finally {
      setPending(false);
    }
  }

  async function remove(id: string) {
    if (id.startsWith("pending-")) return;
    if (!window.confirm("¿Querés quitar este movimiento?")) return;
    setRemoved((current) => (current.includes(id) ? current : [...current, id]));
    setError("");
    try {
      await send(`/api/movements/${id}`, { method: "DELETE" });
      router.refresh();
    } catch (caught) {
      setRemoved((current) => current.filter((item) => item !== id));
      setError(caught instanceof Error ? caught.message : "No se pudo quitar");
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <Total label="Ganancias" value={totals.ganancia} />
        <Total label="Gastos" value={totals.gasto} />
        <Total label="Inversiones" value={totals.inversion} />
        <Total label="Resultado" value={totals.resultado} highlight />
      </div>
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
        {items.length === 0 ? (
          <p className="rounded-3xl bg-surface p-5 text-muted">Todavía no hay movimientos este mes.</p>
        ) : (
          items.map((movement) => (
            <article key={movement.id} className="flex items-center justify-between gap-3 rounded-3xl bg-surface px-5 py-4">
              <div>
                <p className="font-medium">{formatMoney(movement.amount)}</p>
                <p className="text-sm text-muted">
                  {KIND_LABELS[movement.kind]} · {formatShortDate(movement.date)}
                  {movement.note ? ` · ${movement.note}` : ""}
                </p>
              </div>
              {movement.id.startsWith("pending-") ? null : (
                <button
                  type="button"
                  className="rounded-2xl px-3 py-2 text-sm text-muted"
                  onClick={() => remove(movement.id)}
                >
                  Quitar
                </button>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}

function Total({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-3xl p-4 ${highlight ? "bg-leaf" : "bg-surface"}`}>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{formatMoney(value)}</p>
    </div>
  );
}
