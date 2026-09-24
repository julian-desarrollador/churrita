import { ContabilidadForm } from "@/components/contabilidad-form";
import { MonthSwitcher } from "@/components/month-switcher";
import { currentMonth, isMonth } from "@/lib/dates";
import { listMovements } from "@/lib/store";

export default async function ContabilidadPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string | string[] }>;
}) {
  const params = await searchParams;
  const requested = first(params.mes);
  const month = isMonth(requested) ? requested : currentMonth();
  const movements = await listMovements(month);

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">Contabilidad</h1>
      <MonthSwitcher month={month} basePath="/contabilidad" />
      <ContabilidadForm key={month} movements={movements} />
    </div>
  );
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}
