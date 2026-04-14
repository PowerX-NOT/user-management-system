import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

export async function connectDb(uri) {
  mongoose.set("strictQuery", true);
  if (!uri) {
    if (process.env.NODE_ENV === "production") throw new Error("Missing MONGODB_URI");
    const mem = await MongoMemoryServer.create();
    await mongoose.connect(mem.getUri(), { dbName: "ums" });
    // eslint-disable-next-line no-console
    console.log(`Connected to in-memory MongoDB: ${mem.getUri()}`);
    return;
  }

  const isLocalMongo =
    uri.includes("localhost:27017") || uri.includes("127.0.0.1:27017") || uri.includes("0.0.0.0:27017");

  try {
    await mongoose.connect(uri, isLocalMongo ? { serverSelectionTimeoutMS: 1500 } : undefined);
  } catch (err) {
    if (process.env.NODE_ENV === "production") throw err;
    // eslint-disable-next-line no-console
    console.warn("Failed to connect to MONGODB_URI, falling back to in-memory MongoDB");
    const mem = await MongoMemoryServer.create();
    await mongoose.connect(mem.getUri(), { dbName: "ums" });
    // eslint-disable-next-line no-console
    console.log(`Connected to in-memory MongoDB: ${mem.getUri()}`);
  }
}

