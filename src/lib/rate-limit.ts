import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { rateLimits } from "@/db/schema";

// Janela fixa e atômica (um único UPSERT). Falha fechada: se o banco cair, o erro sobe.
export async function hit(key: string, limit: number, windowSec: number) {
  const [r] = await getDb()
    .insert(rateLimits)
    .values({ key, count: 1, resetAt: sql`now() + make_interval(secs => ${windowSec})` })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`CASE WHEN ${rateLimits.resetAt} <= now() THEN 1 ELSE ${rateLimits.count} + 1 END`,
        resetAt: sql`CASE WHEN ${rateLimits.resetAt} <= now() THEN now() + make_interval(secs => ${windowSec}) ELSE ${rateLimits.resetAt} END`,
      },
    })
    .returning({ count: rateLimits.count, resetAt: rateLimits.resetAt });
  const retryAfter = Math.max(1, Math.ceil((r.resetAt.getTime() - Date.now()) / 1000));
  return { ok: r.count <= limit, retryAfter };
}

export async function clear(key: string) {
  await getDb().delete(rateLimits).where(eq(rateLimits.key, key));
}
