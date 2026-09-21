import { currentMonth } from "@/lib/dates";
import { durationMsFromParts } from "@/lib/format";
import { jsonError, one, validDate, validMonth } from "@/lib/http";
import { addSession, listSessions } from "@/lib/store";

export async function GET(request: Request) {
  const month = one(new URL(request.url).searchParams.get("month"));
  const selected = validMonth(month) ? month : currentMonth();
  const sessions = await listSessions(selected);
  return Response.json({ month: selected, sessions });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const durationMs = durationMsFromParts(body?.hours, body?.minutes);
  if (!validDate(body?.date) || durationMs === null) {
    return jsonError("Revisá el día y el tiempo. Tiene que ser entre 1 minuto y 24 horas");
  }
  const topic = typeof body?.topic === "string" ? body.topic.trim() : "";
  if (topic.length > 80) return jsonError("El título es demasiado largo");

  await addSession({ date: body.date, topic, durationMs });
  return Response.json({ ok: true }, { status: 201 });
}
