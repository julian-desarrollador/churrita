import { todayISO } from "@/lib/dates";
import { jsonError, one, validDate } from "@/lib/http";
import { clearExercise, getExercise, saveExercise } from "@/lib/store";

export async function GET(request: Request) {
  const date = one(new URL(request.url).searchParams.get("date"));
  const selected = validDate(date) ? date : todayISO();
  return Response.json(await getExercise(selected));
}

export async function DELETE(request: Request) {
  const date = one(new URL(request.url).searchParams.get("date"));
  if (!validDate(date)) return jsonError("Revisá el día");
  return Response.json(await clearExercise(date));
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  if (!validDate(body?.date) || typeof body?.didExercise !== "boolean") {
    return jsonError("Revisá el día y si hiciste ejercicio");
  }
  const exercise = await saveExercise({
    date: body.date,
    didExercise: body.didExercise,
    detail: typeof body.detail === "string" ? body.detail : "",
  });
  return Response.json(exercise);
}
