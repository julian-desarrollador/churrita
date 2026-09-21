import { jsonError } from "@/lib/http";
import { deleteMovement } from "@/lib/store";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const deleted = await deleteMovement(id);
  if (!deleted) return jsonError("No se encontró el movimiento", 404);
  return Response.json({ ok: true });
}
