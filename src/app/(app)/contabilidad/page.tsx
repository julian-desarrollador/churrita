import { ContabilidadForm } from "@/components/contabilidad-form";
import { MonthSwitcher } from "@/components/month-switcher";
import { currentMonth, isMonth } from "@/lib/dates";
import { formatMoney } from "@/lib/format";
import { listMovements, totalsFrom } from "@/lib/store";

export default async function ContabilidadPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string | string[] }>;
}) {
  const params = await searchParams;
  const requested = first(params.mes);
  const month = isMonth(requested) ? requested : currentMonth();
  const movements = await listMovements(month);
  const totals = totalsFrom(movements);

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">Contabilidad</h1>
      <MonthSwitcher month={month} basePath="/contabilidad" />
      <div className="grid grid-cols-2 gap-3">
        <Total label="Ganancias" value={totals.ganancia} />
        <Total label="Gastos" value={totals.gasto} />
        <Total label="Inversiones" value={totals.inversion} />
        <Total label="Resultado" value={totals.resultado} highlight />
      </div>
      <ContabilidadForm movements={movements} />
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

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}
