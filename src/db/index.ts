import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * The LifeQuest UI is entirely client-side (localStorage), so the app can be
 * deployed anywhere without a database. The pool is therefore created lazily:
 * importing this module never throws, and only code that actually queries
 * (currently just /api/health) needs DATABASE_URL to be set.
 */
const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

function createPool(): Pool {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }
  const pool = new Pool({ connectionString: databaseUrl });
  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPostgresqlPool = pool;
  }
  return pool;
}

export function getPool(): Pool {
  return (globalForDb.__arenaNextJsPostgresqlPool ??= createPool());
}

/** Proxy so `db.execute(...)` resolves the pool only when first used. */
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop, receiver) {
    const instance = drizzle(getPool());
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
