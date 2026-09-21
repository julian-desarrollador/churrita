import { durationMsFromParts } from "@/lib/format";
import { jsonError } from "@/lib/http";
import { deleteSession, updateSession } from "@/lib/store";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const deleted = await deleteSession(id);
  if (!deleted) return jsonError("No se encontró la sesión", 404);
  return Response.json({ ok: true });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const durationMs = durationMsFromParts(body?.hours, body?.minutes);
  if (durationMs === null) {
    return jsonError("Revisá el tiempo. Tiene que ser entre 1 minuto y 24 horas");
  }
  const topic = typeof body?.topic === "string" ? body.topic.trim() : "";
  if (topic.length > 80) return jsonError("El título es demasiado largo");

  const updated = await updateSession(id, { topic, durationMs });
  if (!updated) return jsonError("No se encontró la sesión", 404);
  return Response.json({ ok: true });
}
