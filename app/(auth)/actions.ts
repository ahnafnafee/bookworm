"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";
import { hashSecret, verifySecret } from "@/lib/auth/hash";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import {
    clearSessionCookie,
    getCurrentUser,
    issueSession,
} from "@/lib/auth/session";
import {
    formatAccountNumber,
    generateAccountNumber,
    normalizeAccountNumber,
    splitToken,
} from "@/lib/auth/token";

const SIGNUP_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 60_000;
const LOGIN_MAX = 10;
const ALLOWED_NEXT = /^\/(library|search|wishlist|settings)(\/|$|\?|#)/;

async function clientIp(): Promise<string> {
    const h = await headers();
    return (
        h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        h.get("x-real-ip") ||
        "unknown"
    );
}

function safeNext(raw: FormDataEntryValue | null): string {
    if (typeof raw !== "string") return "/library";
    // Reject protocol-relative URLs and backslash-prefixed paths that some
    // browsers interpret as cross-origin (e.g. "//evil.com", "/\\evil.com").
    if (raw.startsWith("//") || raw.startsWith("/\\")) return "/library";
    if (!ALLOWED_NEXT.test(raw)) return "/library";
    return raw;
}

const signUpSchema = z.object({
    displayName: z
        .string()
        .trim()
        .max(50)
        .optional()
        .transform((v) => (v && v.length > 0 ? v : null)),
});

export type SignUpResult =
    | { ok: true; token: string }
    | { ok: false; error: string };

export async function signUpAction(formData: FormData): Promise<SignUpResult> {
    const parsed = signUpSchema.safeParse({
        displayName: formData.get("displayName"),
    });
    if (!parsed.success) {
        return { ok: false, error: "Invalid name — keep it under 50 characters." };
    }

    const ip = await clientIp();
    const rl = await checkRateLimit(`signup:${ip}`, 20, 60 * 60_000);
    if (!rl.ok) {
        return { ok: false, error: "Too many sign-ups from this network. Try again later." };
    }

    for (let attempt = 0; attempt < SIGNUP_MAX_ATTEMPTS; attempt++) {
        const raw = generateAccountNumber();
        const { lookup, secret } = splitToken(raw);
        try {
            const tokenHash = await hashSecret(secret);
            const [user] = await db
                .insert(users)
                .values({
                    tokenLookup: lookup,
                    tokenHash,
                    displayName: parsed.data.displayName,
                })
                .returning();
            if (!user) throw new Error("Insert returned no row");
            await issueSession(user.id);
            return { ok: true, token: formatAccountNumber(raw) };
        } catch (err: unknown) {
            const code = (err as { code?: string } | null)?.code;
            if (code !== "23505") {
                throw err;
            }
            // unique violation on token_lookup — retry with a new token
        }
    }
    return { ok: false, error: "Could not allocate an account number — try again." };
}

export type LogInResult = { ok: false; error: string };

export async function logInAction(formData: FormData): Promise<LogInResult | void> {
    const ip = await clientIp();
    const rl = await checkRateLimit(`login:${ip}`, LOGIN_MAX, LOGIN_WINDOW_MS);
    if (!rl.ok) {
        return {
            ok: false,
            error: "Too many attempts. Wait a minute before trying again.",
        };
    }

    const raw = normalizeAccountNumber(String(formData.get("token") ?? ""));
    if (!raw) {
        return { ok: false, error: "Enter your 16-digit account number." };
    }

    const { lookup, secret } = splitToken(raw);
    const user = (
        await db.select().from(users).where(eq(users.tokenLookup, lookup)).limit(1)
    )[0];

    if (!user || !(await verifySecret(user.tokenHash, secret))) {
        return { ok: false, error: "Invalid account number." };
    }

    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
    await issueSession(user.id);

    redirect(safeNext(formData.get("next")));
}

export async function logOutAction(): Promise<void> {
    await clearSessionCookie();
    redirect("/authenticate");
}

export async function whoAmI() {
    return getCurrentUser();
}
