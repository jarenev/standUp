import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { attachDatabasePool } from "@vercel/functions";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  __standUpPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__standUpPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    // Один serverless-инстанс не должен открывать десятки соединений с Neon.
    max: process.env.VERCEL ? 3 : 10,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
  });

if (process.env.VERCEL) {
  // Vercel Fluid Compute освобождает соединения перед заморозкой функции.
  attachDatabasePool(pool);
} else if (process.env.NODE_ENV !== "production") {
  globalForDb.__standUpPostgresqlPool = pool;
}

export const db = drizzle(pool);
