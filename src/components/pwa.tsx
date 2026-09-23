"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "churrita-install-hint";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
};

export function Pwa() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {});
    }

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone || localStorage.getItem(DISMISS_KEY) === "1") return;

    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (ios) queueMicrotask(() => setIosHint(true));

    function onPrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setIosHint(false);
    }

    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setInstallEvent(null);
    setIosHint(false);
  }

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    setInstallEvent(null);
  }

  if (!installEvent && !iosHint) return null;

  return (
    <div className="fixed inset-x-0 z-20 px-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3">
        <p className="flex-1 text-sm">
          {installEvent
            ? "Instalá Churrita en este dispositivo."
            : "Para tenerla en el inicio, tocá Compartir y después Agregar a inicio."}
        </p>
        {installEvent ? (
          <button
            type="button"
            className="shrink-0 rounded-full bg-leaf px-3 py-1.5 text-sm font-medium"
            onClick={install}
          >
            Instalar
          </button>
        ) : null}
        <button type="button" className="shrink-0 text-sm text-muted" onClick={dismiss}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
