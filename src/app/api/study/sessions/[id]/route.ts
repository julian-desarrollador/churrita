import { jsonError } from "@/lib/http";
import { deleteSession } from "@/lib/store";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const deleted = await deleteSession(id);
  if (!deleted) return jsonError("No se encontró la sesión", 404);
  return Response.json({ ok: true });
}
