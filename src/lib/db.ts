import "server-only";
import mongoose from "mongoose";

/** Demo mode: no MONGODB_URI → the site runs on in-memory seed data. */
export const isDemo = !process.env.MONGODB_URI;

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const g = globalThis as unknown as { __naaloraMongo?: Cache };
const cache: Cache = g.__naaloraMongo ?? (g.__naaloraMongo = { conn: null, promise: null });

/** One cached connection per serverless instance (and across dev hot reloads). */
export async function connectDB(): Promise<typeof mongoose> {
  if (isDemo) throw new Error("MONGODB_URI is not set (demo mode)");
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose
      .connect(process.env.MONGODB_URI as string, {
        dbName: process.env.MONGODB_DB || "naalora",
        bufferCommands: false,
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 8000,
      })
      .catch((err) => {
        cache.promise = null;
        throw err;
      });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
