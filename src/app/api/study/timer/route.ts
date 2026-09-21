import { jsonError } from "@/lib/http";
import {
  discardTimer,
  getTimer,
  pauseTimer,
  playTimer,
  rememberTopic,
  saveTimer,
} from "@/lib/store";

export async function GET() {
  return Response.json(await getTimer());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const action = body?.action;
  const topic = typeof body?.topic === "string" ? body.topic.trim() : "";

  if (action === "play") return Response.json(await playTimer(topic));
  if (action === "pause") return Response.json(await pauseTimer(topic));
  if (action === "topic") return Response.json(await rememberTopic(topic));
  if (action === "discard") return Response.json(await discardTimer(topic));
  if (action === "save") {
    const result = await saveTimer(topic);
    if (!result.saved) {
      return jsonError("Todavía no hay tiempo para guardar");
    }
    return Response.json(result.timer);
  }

  return jsonError("Acción desconocida");
}
