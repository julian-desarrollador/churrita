export function PageSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <p className="sr-only">Cargando</p>
      <div className="h-9 w-40 animate-pulse rounded-2xl bg-surface" />
      <div className="h-14 animate-pulse rounded-2xl bg-surface" />
      <div className="h-40 animate-pulse rounded-3xl bg-surface" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-28 animate-pulse rounded-3xl bg-surface" />
        <div className="h-28 animate-pulse rounded-3xl bg-surface" />
      </div>
    </div>
  );
}
