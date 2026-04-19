import "server-only";

import { randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { and, eq, gt } from "drizzle-orm";

import { db } from "@/db";
import { sessions, users, type Session, type User } from "@/db/schema";
import { SESSION_COOKIE } from "./constants";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const ROTATE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

type AuthContext = { user: User; session: Session };

function generateSessionId(): string {
    return randomBytes(32).toString("base64url");
}

async function requestMeta() {
    const h = await headers();
    return {
        userAgent: h.get("user-agent")?.slice(0, 255) ?? null,
        ip: (h.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || null,
    };
}

async function setSessionCookie(id: string, expiresAt: Date) {
    const jar = await cookies();
    jar.set(SESSION_COOKIE, id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: expiresAt,
    });
}

export async function issueSession(userId: string): Promise<Session> {
    const id = generateSessionId();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    const meta = await requestMeta();
    const [row] = await db
        .insert(sessions)
        .values({ id, userId, expiresAt, userAgent: meta.userAgent, ip: meta.ip })
        .returning();
    if (!row) throw new Error("Failed to create session");
    await setSessionCookie(row.id, row.expiresAt);
    return row;
}

async function rotateSession(prev: Session): Promise<Session> {
    const id = generateSessionId();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    const meta = await requestMeta();
    const [row] = await db
        .insert(sessions)
        .values({
            id,
            userId: prev.userId,
            expiresAt,
            userAgent: meta.userAgent,
            ip: meta.ip,
        })
        .returning();
    if (!row) throw new Error("Failed to rotate session");
    await db.delete(sessions).where(eq(sessions.id, prev.id));
    await setSessionCookie(row.id, row.expiresAt);
    return row;
}

export const getCurrentUser = cache(async (): Promise<AuthContext | null> => {
    const jar = await cookies();
    const id = jar.get(SESSION_COOKIE)?.value;
    if (!id) return null;

    const rows = await db
        .select({ session: sessions, user: users })
        .from(sessions)
        .innerJoin(users, eq(users.id, sessions.userId))
        .where(and(eq(sessions.id, id), gt(sessions.expiresAt, new Date())))
        .limit(1);

    const row = rows[0];
    if (!row) return null;

    const ageMs = Date.now() - row.session.lastRotatedAt.getTime();
    if (ageMs > ROTATE_AFTER_MS) {
        try {
            const fresh = await rotateSession(row.session);
            return { user: row.user, session: fresh };
        } catch {
            // non-fatal — fall through with existing session
        }
    }
    return { user: row.user, session: row.session };
});

export async function requireUser(): Promise<AuthContext> {
    const ctx = await getCurrentUser();
    if (!ctx) throw new Error("UNAUTHENTICATED");
    return ctx;
}

export async function clearSessionCookie() {
    const jar = await cookies();
    const id = jar.get(SESSION_COOKIE)?.value;
    if (id) {
        await db.delete(sessions).where(eq(sessions.id, id));
    }
    jar.delete(SESSION_COOKIE);
}
