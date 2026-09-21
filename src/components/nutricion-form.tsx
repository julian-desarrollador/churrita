"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { send } from "@/lib/api-client";
import {
  EXTRA_SLOT,
  MEAL_QUALITIES,
  MEAL_SLOTS,
  QUALITY_LABELS,
  SLOT_LABELS,
  type Meal,
  type MealQuality,
  type MealSlot,
} from "@/lib/types";
import { PrimaryButton, TextInput } from "@/components/ui";

const SLOT_META: Record<MealSlot, { caption: string; Icon: IconComponent }> = {
  desayuno: { caption: "Mañana", Icon: IconSunrise },
  almuerzo: { caption: "Mediodía", Icon: IconSun },
  merienda: { caption: "Tarde", Icon: IconCup },
  cena: { caption: "Noche", Icon: IconMoon },
};

type IconComponent = (props: { className?: string }) => React.ReactElement;

export function NutricionForm({ date, meals }: { date: string; meals: Meal[] }) {
  const router = useRouter();
  const [items, setItems] = useState(meals);
  const [openNotes, setOpenNotes] = useState<string[]>(() =>
    meals.filter((meal) => meal.note.trim()).map((meal) => meal.id),
  );
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const mains = items.filter((meal) => meal.slot !== EXTRA_SLOT);
  const extras = items.filter((meal) => meal.slot === EXTRA_SLOT);
  const marked = mains.filter((meal) => meal.quality).length;

  function update(id: string, patch: Partial<Meal>) {
    setItems((current) =>
      current.map((meal) => (meal.id === id ? { ...meal, ...patch } : meal)),
    );
    setSaved(false);
  }

  function addExtra() {
    setItems((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        slot: EXTRA_SLOT,
        quality: null,
        note: "",
        label: "",
      },
    ]);
    setSaved(false);
  }

  function removeExtra(id: string) {
    setItems((current) => current.filter((meal) => meal.id !== id));
    setSaved(false);
  }

  function showNote(id: string) {
    setOpenNotes((current) => (current.includes(id) ? current : [...current, id]));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    setSaved(false);
    try {
      const next = await send<{ meals: Meal[] }>("/api/meals", {
        method: "PUT",
        body: JSON.stringify({ date, meals: items }),
      });
      setItems(next.meals);
      setOpenNotes(next.meals.filter((meal) => meal.note.trim()).map((meal) => meal.id));
      setSaved(true);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo guardar");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <section className="overflow-hidden rounded-3xl border border-line bg-white">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-end justify-between gap-3">
            <p className="text-2xl font-semibold tabular-nums">{marked} de 4</p>
            <p className="pb-1 text-sm text-muted">Comidas del día</p>
          </div>
          <ul className="mt-3 grid grid-cols-4 gap-2">
            {mains.map((meal) => {
              const slot = meal.slot as MealSlot;
              return (
                <li key={meal.id}>
                  <span
                    className={`block h-1.5 rounded-full ${meal.quality ? "bg-leaf-strong" : "bg-line"}`}
                  />
                  <span
                    className={`mt-1.5 block text-center text-[11px] ${
                      meal.quality ? "font-medium text-foreground" : "text-muted"
                    }`}
                  >
                    {SLOT_LABELS[slot]}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {mains.map((meal) => {
          const slot = meal.slot as (typeof MEAL_SLOTS)[number];
          return (
            <MealBlock
              key={meal.id}
              title={SLOT_LABELS[slot]}
              caption={SLOT_META[slot].caption}
              icon={SLOT_META[slot].Icon}
              meal={meal}
              noteOpen={openNotes.includes(meal.id) || Boolean(meal.note.trim())}
              onShowNote={() => showNote(meal.id)}
              onChange={(patch) => update(meal.id, patch)}
            />
          );
        })}
      </section>

      <section className="overflow-hidden rounded-3xl border border-line bg-white">
        <div className="px-4 pt-4 pb-1">
          <h2 className="text-lg font-semibold">Entre comidas</h2>
          <p className="mt-1 text-sm text-muted">Si comiste algo entre medio</p>
        </div>
        {extras.map((meal) => (
          <MealBlock
            key={meal.id}
            title={meal.label || "Entre comidas"}
            caption=""
            icon={IconBite}
            meal={meal}
            named
            noteOpen={openNotes.includes(meal.id) || Boolean(meal.note.trim())}
            onShowNote={() => showNote(meal.id)}
            onChange={(patch) => update(meal.id, patch)}
            onRemove={() => removeExtra(meal.id)}
          />
        ))}
        <button
          type="button"
          onClick={addExtra}
          className="flex min-h-14 w-full items-center justify-center gap-2 border-t border-line text-sm font-medium"
        >
          <IconPlus />
          Agregar entre comidas
        </button>
      </section>

      {error ? <p className="text-sm text-muted">{error}</p> : null}
      {saved ? (
        <p className="rounded-2xl bg-leaf px-4 py-3 text-sm font-medium">Comidas guardadas.</p>
      ) : null}
      <PrimaryButton type="submit" className="w-full" disabled={pending}>
        {pending ? "Guardando..." : "Guardar comidas"}
      </PrimaryButton>
    </form>
  );
}

function MealBlock({
  title,
  caption,
  icon: Icon,
  meal,
  named = false,
  noteOpen,
  onShowNote,
  onChange,
  onRemove,
}: {
  title: string;
  caption: string;
  icon: IconComponent;
  meal: Meal;
  named?: boolean;
  noteOpen: boolean;
  onShowNote: () => void;
  onChange: (patch: Partial<Meal>) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="border-t border-line px-4 py-4">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
            meal.quality ? "bg-leaf text-foreground" : "bg-surface text-muted"
          }`}
        >
          <Icon />
        </span>
        <div className="min-w-0 flex-1">
          {named ? (
            <TextInput
              aria-label="Qué comiste"
              placeholder="Qué comiste"
              value={meal.label}
              onChange={(event) => onChange({ label: event.target.value })}
            />
          ) : (
            <>
              <p className="font-semibold">{title}</p>
              <p className="text-sm text-muted">{caption}</p>
            </>
          )}
        </div>
        {onRemove ? (
          <button type="button" onClick={onRemove} className="shrink-0 px-1 py-2 text-sm text-muted">
            Quitar
          </button>
        ) : meal.quality ? (
          <span className="shrink-0 rounded-full bg-leaf px-3 py-1 text-xs font-medium">
            {QUALITY_LABELS[meal.quality]}
          </span>
        ) : null}
      </div>
      <QualityPicker value={meal.quality} onChange={(quality) => onChange({ quality })} />
      {noteOpen ? (
        <TextInput
          className="mt-3"
          aria-label={`Nota de ${title}`}
          placeholder="Nota, si querés"
          value={meal.note}
          onChange={(event) => onChange({ note: event.target.value })}
        />
      ) : (
        <button type="button" onClick={onShowNote} className="mt-3 text-sm text-muted">
          Agregar nota
        </button>
      )}
    </div>
  );
}

function QualityPicker({
  value,
  onChange,
}: {
  value: MealQuality | null;
  onChange: (quality: MealQuality | null) => void;
}) {
  return (
    <div className="mt-3 grid grid-cols-3 gap-1 rounded-2xl bg-surface p-1" role="group" aria-label="Calidad">
      {MEAL_QUALITIES.map((quality) => {
        const active = value === quality;
        return (
          <button
            key={quality}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? null : quality)}
            className={`min-h-11 rounded-xl text-sm ${
              active
                ? quality === "buena"
                  ? "bg-leaf-strong font-semibold text-foreground"
                  : quality === "regular"
                    ? "bg-leaf font-medium text-foreground"
                    : "bg-white font-medium text-foreground shadow-sm"
                : "font-medium text-muted"
            }`}
          >
            {QUALITY_LABELS[quality]}
          </button>
        );
      })}
    </div>
  );
}

function IconSunrise({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
      <path d="M4 17h16" />
      <path d="M7 17a5 5 0 0 1 10 0" />
      <path d="M12 4v2.5" />
      <path d="M6.2 8.2 7.6 9.6" />
      <path d="M17.8 8.2 16.4 9.6" />
    </svg>
  );
}

function IconSun({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 4v2M12 18v2M4 12h2M18 12h2M6.4 6.4l1.4 1.4M16.2 16.2l1.4 1.4M17.6 6.4l-1.4 1.4M7.8 16.2l-1.4 1.4" />
    </svg>
  );
}

function IconCup({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9h10v5.2A3.8 3.8 0 0 1 12.2 18H9.8A3.8 3.8 0 0 1 6 14.2V9z" />
      <path d="M16 10.5h1.2a2.3 2.3 0 0 1 0 4.6H16" />
      <path d="M8.5 5.5c.3.8.4 1.2.4 2M11.5 5.5c.3.8.4 1.2.4 2" />
    </svg>
  );
}

function IconMoon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15.2 4.6A6.8 6.8 0 1 0 19.4 14 5.4 5.4 0 0 1 15.2 4.6z" />
    </svg>
  );
}

function IconBite({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5.5c2.2 1.6 3.2 3.4 3.2 6.2 0 3.2-1.8 6.8-3.2 6.8S8.8 14.9 8.8 11.7C8.8 8.9 9.8 7.1 12 5.5z" />
      <path d="M12 5.5c.2 1.6 1.3 2.4 2.6 2.2" />
    </svg>
  );
}

function IconPlus({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
      <path d="M12 6v12M6 12h12" />
    </svg>
  );
}
