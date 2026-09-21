import { DateField } from "@/components/date-field";
import { EjercicioForm } from "@/components/ejercicio-form";
import { isDate, todayISO } from "@/lib/dates";
import { getExercise } from "@/lib/store";

export default async function EjercicioPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string | string[] }>;
}) {
  const params = await searchParams;
  const requested = first(params.fecha);
  const date = isDate(requested) ? requested : todayISO();
  const exercise = await getExercise(date);

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">Ejercicio</h1>
      <DateField label="Día" value={date} navigateTo="/ejercicio" />
      <EjercicioForm key={date} exercise={exercise} />
    </div>
  );
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}
