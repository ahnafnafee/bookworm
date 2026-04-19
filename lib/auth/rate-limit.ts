import "server-only";

import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { rateLimits } from "@/db/schema";

export type RateLimitResult = { ok: boolean; remaining: number; resetAt: Date };

export async function checkRateLimit(
    key: string,
    limit: number,
    windowMs: number,
): Promise<RateLimitResult> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMs);

    const existing = (
        await db.select().from(rateLimits).where(eq(rateLimits.key, key)).limit(1)
    )[0];

    if (!existing || existing.windowStart < windowStart) {
        await db
            .insert(rateLimits)
            .values({ key, windowStart: now, count: 1 })
            .onConflictDoUpdate({
                target: rateLimits.key,
                set: { windowStart: now, count: 1 },
            });
        return { ok: true, remaining: limit - 1, resetAt: new Date(now.getTime() + windowMs) };
    }

    if (existing.count >= limit) {
        return {
            ok: false,
            remaining: 0,
            resetAt: new Date(existing.windowStart.getTime() + windowMs),
        };
    }

    await db
        .update(rateLimits)
        .set({ count: sql`${rateLimits.count} + 1` })
        .where(eq(rateLimits.key, existing.key));

    return {
        ok: true,
        remaining: Math.max(0, limit - existing.count - 1),
        resetAt: new Date(existing.windowStart.getTime() + windowMs),
    };
}
