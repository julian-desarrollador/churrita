import { DateField } from "@/components/date-field";
import { NutricionForm } from "@/components/nutricion-form";
import { isDate, todayISO } from "@/lib/dates";
import { getMeals } from "@/lib/store";

export default async function NutricionPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string | string[] }>;
}) {
  const params = await searchParams;
  const requested = first(params.fecha);
  const date = isDate(requested) ? requested : todayISO();
  const meals = await getMeals(date);

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">Nutrición</h1>
      <DateField value={date} navigateTo="/nutricion" />
      <NutricionForm key={date} date={date} meals={meals} />
    </div>
  );
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}
