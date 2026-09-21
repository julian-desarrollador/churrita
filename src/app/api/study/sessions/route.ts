import { currentMonth } from "@/lib/dates";
import { one, validMonth } from "@/lib/http";
import { listSessions } from "@/lib/store";

export async function GET(request: Request) {
  const month = one(new URL(request.url).searchParams.get("month"));
  const selected = validMonth(month) ? month : currentMonth();
  const sessions = await listSessions(selected);
  return Response.json({ month: selected, sessions });
}
