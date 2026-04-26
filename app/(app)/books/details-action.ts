"use server";

import { requireUser } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { getGoogleBookDetail, resolveNytBook } from "@/lib/books/google";
import type { BookDetail, BookSummary } from "@/lib/books/types";

type DetailResult =
    | { ok: true; detail: BookDetail }
    | { ok: false; error: string };

type ResolveResult =
    | { ok: true; summary: BookSummary }
    | { ok: false; error: string };

export async function getBookDetailAction(googleId: string): Promise<DetailResult> {
    const { user } = await requireUser();
    if (!googleId || googleId.length > 64) return { ok: false, error: "Invalid book id." };
    const rl = await checkRateLimit(`detail:${user.id}`, 120, 60_000);
    if (!rl.ok) return { ok: false, error: "Too many requests." };
    try {
        const detail = await getGoogleBookDetail(googleId);
        if (!detail) return { ok: false, error: "Book not found." };
        return { ok: true, detail };
    } catch (err) {
        console.error(`[details-action] getGoogleBookDetail(${googleId}) threw:`, err);
        return { ok: false, error: "Could not load details." };
    }
}

export async function resolveNytBookAction(
    title: string,
    author: string,
): Promise<ResolveResult> {
    const { user } = await requireUser();
    if (!title || title.length > 300 || author.length > 300) {
        return { ok: false, error: "Invalid lookup." };
    }
    const rl = await checkRateLimit(`nyt-resolve:${user.id}`, 60, 60_000);
    if (!rl.ok) return { ok: false, error: "Too many requests." };
    try {
        const summary = await resolveNytBook(title, author);
        if (!summary) {
            return { ok: false, error: "Couldn't find this book in Google Books." };
        }
        return { ok: true, summary };
    } catch {
        return { ok: false, error: "Lookup failed." };
    }
}
