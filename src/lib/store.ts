import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { todayISO } from "@/lib/dates";
import type {
  ExerciseDay,
  Meal,
  MealKind,
  MealQuality,
  MealSlot,
  MonthTotals,
  Movement,
  MovementKind,
  StudySession,
  TimerState,
} from "@/lib/types";
import { EXTRA_SLOT, MEAL_SLOTS } from "@/lib/types";

type MovementDoc = {
  _id: ObjectId;
  date: string;
  kind: MovementKind;
  amount: number;
  note: string;
};

type TimerDoc = {
  _id: "current";
  running: boolean;
  startedAt: string | null;
  accumulatedMs: number;
  topic: string;
};

type SessionDoc = {
  _id: ObjectId;
  date: string;
  subject: string;
  topic: string;
  durationMs: number;
  createdAt: Date;
};

const EMPTY_TIMER: TimerDoc = {
  _id: "current",
  running: false,
  startedAt: null,
  accumulatedMs: 0,
  topic: "",
};

function elapsedMs(timer: TimerDoc, now = Date.now()) {
  let total = timer.accumulatedMs;
  if (timer.running && timer.startedAt) {
    total += now - new Date(timer.startedAt).getTime();
  }
  return Math.max(0, total);
}

function toTimer(timer: TimerDoc): TimerState {
  return {
    running: timer.running,
    startedAt: timer.startedAt,
    accumulatedMs: timer.accumulatedMs,
    topic: timer.topic,
    elapsedMs: elapsedMs(timer),
  };
}

function toMovement(doc: MovementDoc): Movement {
  return {
    id: doc._id.toHexString(),
    date: doc.date,
    kind: doc.kind,
    amount: doc.amount,
    note: doc.note,
  };
}

export async function listMovements(month: string): Promise<Movement[]> {
  const docs = await findMovements({ $gte: `${month}-01`, $lte: `${month}-31` });
  return docs;
}

async function findMovements(date: { $gte: string; $lte: string }) {
  const db = await getDb();
  const docs = await db
    .collection<MovementDoc>("movements")
    .find({ date })
    .sort({ date: -1, _id: -1 })
    .toArray();
  return docs.map(toMovement);
}

export function totalsFrom(movements: Movement[]): MonthTotals {
  const totals = { ganancia: 0, gasto: 0, inversion: 0, resultado: 0 };
  for (const movement of movements) {
    totals[movement.kind] += movement.amount;
  }
  totals.resultado = totals.ganancia - totals.gasto - totals.inversion;
  return totals;
}

export async function addMovement(input: {
  date: string;
  kind: MovementKind;
  amount: number;
  note: string;
}) {
  const db = await getDb();
  await db.collection("movements").insertOne({
    ...input,
    createdAt: new Date(),
  });
}

export async function deleteMovement(id: string) {
  if (!ObjectId.isValid(id)) return false;
  const db = await getDb();
  const result = await db
    .collection("movements")
    .deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

async function readTimer(): Promise<TimerDoc> {
  const db = await getDb();
  const doc = await db.collection<TimerDoc>("study_timer").findOne({ _id: "current" });
  return doc ?? EMPTY_TIMER;
}

async function writeTimer(timer: TimerDoc) {
  const db = await getDb();
  await db.collection<TimerDoc>("study_timer").updateOne(
    { _id: "current" },
    { $set: timer },
    { upsert: true },
  );
}

export async function getTimer() {
  return toTimer(await readTimer());
}

export async function playTimer(topic: string) {
  const timer = await readTimer();
  if (!timer.running) {
    timer.running = true;
    timer.startedAt = new Date().toISOString();
  }
  timer.topic = topic;
  await writeTimer(timer);
  return toTimer(timer);
}

export async function pauseTimer(topic: string) {
  const timer = await readTimer();
  if (timer.running && timer.startedAt) {
    timer.accumulatedMs = elapsedMs(timer);
    timer.running = false;
    timer.startedAt = null;
  }
  timer.topic = topic;
  await writeTimer(timer);
  return toTimer(timer);
}

export async function rememberTopic(topic: string) {
  const db = await getDb();
  await db.collection<TimerDoc>("study_timer").updateOne(
    { _id: "current" },
    { $set: { topic } },
    { upsert: true },
  );
  return getTimer();
}

export async function discardTimer(topic: string) {
  const reset: TimerDoc = {
    _id: "current",
    running: false,
    startedAt: null,
    accumulatedMs: 0,
    topic,
  };
  await writeTimer(reset);
  return toTimer(reset);
}

export async function deleteSession(id: string) {
  if (!ObjectId.isValid(id)) return false;
  const db = await getDb();
  const result = await db
    .collection("study_sessions")
    .deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

export async function addSession(input: {
  date: string;
  topic: string;
  durationMs: number;
}) {
  const db = await getDb();
  await db.collection("study_sessions").insertOne({
    date: input.date,
    subject: "Nutrición",
    topic: input.topic.trim(),
    durationMs: input.durationMs,
    createdAt: new Date(),
  });
}

export async function updateSession(
  id: string,
  input: { topic: string; durationMs: number },
) {
  if (!ObjectId.isValid(id)) return false;
  const db = await getDb();
  const result = await db.collection<SessionDoc>("study_sessions").updateOne(
    { _id: new ObjectId(id) },
    { $set: { topic: input.topic.trim(), durationMs: input.durationMs } },
  );
  return result.matchedCount === 1;
}

export async function saveTimer(topic: string) {
  const timer = await readTimer();
  timer.topic = topic;
  const durationMs = elapsedMs(timer);
  if (durationMs < 1000) {
    await writeTimer(timer);
    return { timer: toTimer(timer), saved: false as const };
  }

  const db = await getDb();
  await db.collection("study_sessions").insertOne({
    date: todayISO(),
    subject: "Nutrición",
    topic: topic.trim(),
    durationMs,
    createdAt: new Date(),
  });
  const reset: TimerDoc = {
    _id: "current",
    running: false,
    startedAt: null,
    accumulatedMs: 0,
    topic,
  };
  await writeTimer(reset);
  return { timer: toTimer(reset), saved: true as const };
}

export async function listSessions(month: string): Promise<StudySession[]> {
  return findSessions({ $gte: `${month}-01`, $lte: `${month}-31` });
}

export async function listSessionsBetween(start: string, end: string) {
  return findSessions({ $gte: start, $lte: end });
}

async function findSessions(date: { $gte: string; $lte: string }) {
  const db = await getDb();
  const docs = await db
    .collection<SessionDoc>("study_sessions")
    .find({ date })
    .sort({ date: 1, createdAt: 1 })
    .toArray();
  return docs.map((doc) => ({
    id: doc._id.toHexString(),
    date: doc.date,
    subject: doc.subject,
    topic: doc.topic,
    durationMs: doc.durationMs,
  }));
}

export async function studyMsOn(date: string) {
  const sessions = await listSessions(date.slice(0, 7));
  return sessions
    .filter((session) => session.date === date)
    .reduce((sum, session) => sum + session.durationMs, 0);
}

type ExerciseDoc = {
  date: string;
  didExercise: boolean;
  detail?: string;
};

export async function listExerciseBetween(start: string, end: string) {
  const db = await getDb();
  const docs = await db
    .collection<ExerciseDoc>("exercise_days")
    .find({ date: { $gte: start, $lte: end } })
    .toArray();
  return docs.map((doc) => ({
    date: doc.date,
    didExercise: Boolean(doc.didExercise),
    detail: doc.detail ?? "",
  }));
}

export async function getExercise(date: string): Promise<ExerciseDay> {
  const db = await getDb();
  const doc = await db.collection<ExerciseDay>("exercise_days").findOne({ date });
  if (!doc) {
    return { date, didExercise: false, detail: "", saved: false };
  }
  return {
    date,
    didExercise: doc.didExercise,
    detail: doc.detail ?? "",
    saved: true,
  };
}

export async function clearExercise(date: string) {
  const db = await getDb();
  await db.collection("exercise_days").deleteOne({ date });
  return getExercise(date);
}

export async function saveExercise(input: {
  date: string;
  didExercise: boolean;
  detail: string;
}) {
  const db = await getDb();
  await db.collection("exercise_days").updateOne(
    { date: input.date },
    {
      $set: {
        date: input.date,
        didExercise: input.didExercise,
        detail: input.detail.trim(),
      },
    },
    { upsert: true },
  );
  return getExercise(input.date);
}

type MealDoc = {
  _id: ObjectId;
  date: string;
  slot: MealKind;
  quality: MealQuality | null;
  note: string;
  label?: string;
};

export type MealRecord = Meal & { date: string };

export async function listMealsBetween(start: string, end: string): Promise<MealRecord[]> {
  const db = await getDb();
  const docs = await db
    .collection<MealDoc>("meals")
    .find({ date: { $gte: start, $lte: end } })
    .toArray();
  return docs.map((meal) => ({
    id: meal._id.toHexString(),
    date: meal.date,
    slot: meal.slot,
    quality: (meal.quality ?? null) as MealQuality | null,
    note: meal.note ?? "",
    label: meal.label ?? "",
  }));
}

export async function getMeals(date: string): Promise<Meal[]> {
  const db = await getDb();
  const docs = await db.collection<MealDoc>("meals").find({ date }).toArray();
  const mains = MEAL_SLOTS.map((slot) => {
    const found = docs.find((meal) => meal.slot === slot);
    return {
      id: slot,
      slot,
      quality: (found?.quality ?? null) as MealQuality | null,
      note: found?.note ?? "",
      label: "",
    };
  });
  const extras = docs
    .filter((meal) => meal.slot === EXTRA_SLOT)
    .map((meal) => ({
      id: meal._id.toHexString(),
      slot: EXTRA_SLOT,
      quality: (meal.quality ?? null) as MealQuality | null,
      note: meal.note ?? "",
      label: meal.label ?? "",
    }));
  return [...mains, ...extras];
}

export async function saveMeals(date: string, meals: Meal[]) {
  const db = await getDb();
  const collection = db.collection<MealDoc>("meals");
  const mains = meals.filter((meal) => meal.slot !== EXTRA_SLOT);
  const extras = meals.filter((meal) => meal.slot === EXTRA_SLOT);

  await Promise.all(
    mains.map((meal) => {
      if (!meal.quality && !meal.note.trim()) {
        return collection.deleteOne({ date, slot: meal.slot as MealSlot });
      }
      return collection.updateOne(
        { date, slot: meal.slot as MealSlot },
        {
          $set: {
            date,
            slot: meal.slot as MealSlot,
            quality: meal.quality,
            note: meal.note.trim(),
            label: "",
          },
        },
        { upsert: true },
      );
    }),
  );

  await collection.deleteMany({ date, slot: EXTRA_SLOT });
  const toInsert = extras
    .map((meal) => ({
      label: meal.label.trim(),
      quality: meal.quality,
      note: meal.note.trim(),
      id: meal.id,
    }))
    .filter((meal) => meal.label || meal.quality || meal.note);
  if (toInsert.length > 0) {
    await collection.insertMany(
      toInsert.map((meal) => ({
        _id: ObjectId.isValid(meal.id) ? new ObjectId(meal.id) : new ObjectId(),
        date,
        slot: EXTRA_SLOT,
        quality: meal.quality,
        note: meal.note,
        label: meal.label,
      })),
    );
  }

  return getMeals(date);
}
