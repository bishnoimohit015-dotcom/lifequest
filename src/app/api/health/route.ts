import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * LifeQuest keeps all user data in the browser, so the app is healthy with or
 * without a database. We only report a failure when a DATABASE_URL *is*
 * configured but unreachable — that way deploys without a database (the
 * normal case on Vercel) still pass their healthcheck.
 */
export async function GET() {
  if (!process.env.DATABASE_URL) {
    return Response.json({ ok: true, app: "lifequest", db: "not-configured" });
  }

  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, app: "lifequest", db: "connected" });
  } catch {
    return Response.json(
      { ok: false, app: "lifequest", db: "unreachable" },
      { status: 500 }
    );
  }
}
