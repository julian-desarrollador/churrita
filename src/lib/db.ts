import { MongoClient, type Db } from "mongodb";

const INDEX_VERSION = 2;

const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
  mongoIndexes?: Promise<void>;
  mongoIndexVersion?: number;
};

export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  const name = process.env.MONGODB_DB;
  if (!uri || !name) {
    throw new Error("Faltan MONGODB_URI o MONGODB_DB");
  }

  if (!globalForMongo.mongoClient) {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
    await client.connect();
    globalForMongo.mongoClient = client;
  }

  const db = globalForMongo.mongoClient.db(name);
  if (globalForMongo.mongoIndexVersion !== INDEX_VERSION) {
    globalForMongo.mongoIndexes = ensureIndexes(db);
    globalForMongo.mongoIndexVersion = INDEX_VERSION;
  }
  await globalForMongo.mongoIndexes;
  return db;
}

async function ensureIndexes(db: Db) {
  const meals = db.collection("meals");
  const indexes = await meals.indexes();
  await Promise.all(
    indexes
      .filter(
        (index) =>
          index.name &&
          index.name !== "_id_" &&
          index.name !== "date_slot_mains_unique" &&
          Boolean(index.key?.date) &&
          Boolean(index.key?.slot),
      )
      .map((index) => meals.dropIndex(index.name as string)),
  );
  await Promise.all([
    db.collection("movements").createIndex({ date: 1 }),
    db.collection("study_sessions").createIndex({ date: 1 }),
    db.collection("exercise_days").createIndex({ date: 1 }, { unique: true }),
    meals.createIndex(
      { date: 1, slot: 1 },
      {
        unique: true,
        name: "date_slot_mains_unique",
        partialFilterExpression: {
          slot: { $in: ["desayuno", "almuerzo", "merienda", "cena"] },
        },
      },
    ),
  ]);
}
