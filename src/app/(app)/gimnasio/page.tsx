import type { ReactNode } from "react";

export default function GimnasioPage() {
  return (
    <div className="gym-teaser relative overflow-hidden rounded-3xl border border-leaf-strong">
      <div
        aria-hidden
        className="gym-teaser-preview pointer-events-none select-none px-4 py-6"
      >
        <p className="text-3xl font-semibold">Gimnasio</p>
        <p className="mt-1 text-sm text-muted">Viernes, 17 de octubre</p>
        <p className="mt-4 text-lg font-semibold">Día de piernas</p>
        <div className="mt-4 space-y-3">
          <PreviewPerson name="Churrita">
            <PreviewLift name="Sentadilla" detail="×3 · 22,5 kg" />
            <PreviewLift name="Peso muerto" detail="×3 · 20 kg · 11 repes" />
            <PreviewLift name="Prensa" detail="×4 · 40 kg" />
          </PreviewPerson>
          <PreviewPerson name="Churrito">
            <PreviewLift name="Sentadilla" detail="×3 · 40 kg" />
            <PreviewLift name="Peso muerto" detail="×3 · 50 kg · 8 repes" />
            <PreviewLift name="Prensa" detail="×4 · 80 kg" />
          </PreviewPerson>
        </div>
      </div>

      <div aria-hidden className="gym-teaser-steam">
        <span />
        <span />
        <span />
      </div>
      <div aria-hidden className="gym-teaser-glow" />

      <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="gym-teaser-pill">Algo se está cocinando</p>
          <p className="mt-5 text-4xl font-semibold leading-tight">Nueva página Gimnasio.</p>
          <p className="gym-teaser-pronto mt-1 text-4xl font-semibold leading-tight">Pronto.</p>
        </div>
      </div>
    </div>
  );
}

function PreviewPerson({ name, children }: { name: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl bg-white/90 p-4 shadow-sm">
      <p className="text-sm text-muted">{name}</p>
      <ul className="mt-3 space-y-2">{children}</ul>
    </section>
  );
}

function PreviewLift({ name, detail }: { name: string; detail: string }) {
  return (
    <li>
      <p className="font-medium">{name}</p>
      <p className="text-sm text-muted">{detail}</p>
    </li>
  );
}
