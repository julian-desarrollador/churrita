import { parseAmount } from "@/lib/format";
import { asKind, jsonError, one, validDate, validMonth } from "@/lib/http";
import { currentMonth } from "@/lib/dates";
import { addMovement, listMovements, totalsFrom } from "@/lib/store";

export async function GET(request: Request) {
  const month = one(new URL(request.url).searchParams.get("month"));
  const selected = validMonth(month) ? month : currentMonth();
  const movements = await listMovements(selected);
  return Response.json({
    month: selected,
    movements,
    totals: totalsFrom(movements),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const kind = asKind(body?.kind);
  const amount = parseAmount(String(body?.amount ?? ""));
  if (!validDate(body?.date) || !kind || amount === null) {
    return jsonError("Revisá la fecha, el tipo y el monto");
  }

  await addMovement({
    date: body.date,
    kind,
    amount,
    note: typeof body.note === "string" ? body.note.trim() : "",
  });
  return Response.json({ ok: true }, { status: 201 });
}
