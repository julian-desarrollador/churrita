"use client";

import { useEffect, useState } from "react";
import { PrimaryButton } from "@/components/ui";

const STORAGE_KEY = "floriah.notice.nombre-gimnasio.v1";

const puntos = [
  "La app ahora se llama Floriah.",
  "En Ejercicio hay un botón Gimnasio.",
  "Nueva página Gimnasio. Pronto.",
];

export function OneTimeNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="floriah-notice-title"
        className="w-full max-w-md overflow-hidden rounded-3xl border border-line bg-white shadow-sm"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="border-b border-line bg-gradient-to-br from-leaf via-white to-white px-6 pb-5 pt-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-leaf-strong">
            <NoticeIcon />
          </span>
          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted">Actualización</p>
          <h2 id="floriah-notice-title" className="mt-1 text-xl font-semibold">
            Floriah tiene novedades
          </h2>
        </div>
        <ul className="space-y-3 px-6 py-5">
          {puntos.map((texto) => (
            <li key={texto} className="flex gap-3 text-sm leading-relaxed">
              <CheckIcon />
              <span>{texto}</span>
            </li>
          ))}
        </ul>
        <div className="px-6 pb-6">
          <PrimaryButton type="button" className="w-full" onClick={dismiss}>
            Entendido
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function NoticeIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 7.2c.2-1.6 1.4-2.8 2.8-3.2-.2 1.8-1.3 3-2.8 3.2z" />
      <path d="M12 8.2c-2.8-.2-5 1.8-5 4.6 0 3.2 2.2 6.4 5 6.4s5-3.2 5-6.4c0-2.8-2.2-4.8-5-4.6z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 shrink-0 text-leaf-strong"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.2 2.3 2.3 4.7-5" />
    </svg>
  );
}
