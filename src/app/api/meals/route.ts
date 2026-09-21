import { todayISO } from "@/lib/dates";
import { asMeals, jsonError, one, validDate } from "@/lib/http";
import { getMeals, saveMeals } from "@/lib/store";

export async function GET(request: Request) {
  const date = one(new URL(request.url).searchParams.get("date"));
  const selected = validDate(date) ? date : todayISO();
  return Response.json({ date: selected, meals: await getMeals(selected) });
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  const meals = asMeals(body?.meals);
  if (!validDate(body?.date) || !meals) {
    return jsonError("Revisá el día y las comidas");
  }
  return Response.json({
    date: body.date,
    meals: await saveMeals(body.date, meals),
  });
}
