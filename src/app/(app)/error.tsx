"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-3xl bg-surface p-5">
      <h1 className="text-xl font-semibold">No se pudieron cargar los datos</h1>
      <p className="mt-2 text-muted">Probá de nuevo en un momento.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 min-h-12 rounded-2xl bg-leaf px-5 py-3 font-medium"
      >
        Reintentar
      </button>
    </div>
  );
}
