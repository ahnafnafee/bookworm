"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { books, wishlist } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import type { BookSummary } from "@/lib/books/types";

const bookSchema = z.object({
    googleId: z.string().min(1).max(64),
    title: z.string().max(500).nullable(),
    authors: z.string().max(500).nullable(),
    thumbnail: z.string().url().max(2048).nullable(),
    categories: z.string().max(500).nullable(),
    rating: z.number().min(0).max(5).nullable(),
});

type ActionResult = { ok: true } | { ok: false; error: string };

function invalidate() {
    revalidatePath("/library");
    revalidatePath("/wishlist");
    revalidatePath("/search");
}

export async function addToLibraryAction(input: BookSummary): Promise<ActionResult> {
    const parsed = bookSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid book data." };
    const { user } = await requireUser();
    try {
        await db
            .insert(books)
            .values({ ...parsed.data, userId: user.id })
            .onConflictDoNothing({ target: [books.userId, books.googleId] });
        await db
            .delete(wishlist)
            .where(and(eq(wishlist.userId, user.id), eq(wishlist.googleId, parsed.data.googleId)));
        invalidate();
        return { ok: true };
    } catch {
        return { ok: false, error: "Could not add book." };
    }
}

export async function addToWishlistAction(input: BookSummary): Promise<ActionResult> {
    const parsed = bookSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid book data." };
    const { user } = await requireUser();
    try {
        await db
            .insert(wishlist)
            .values({ ...parsed.data, userId: user.id })
            .onConflictDoNothing({ target: [wishlist.userId, wishlist.googleId] });
        invalidate();
        return { ok: true };
    } catch {
        return { ok: false, error: "Could not add to wishlist." };
    }
}

export async function removeFromLibraryAction(googleId: string): Promise<ActionResult> {
    if (!googleId) return { ok: false, error: "Missing book id." };
    const { user } = await requireUser();
    await db
        .delete(books)
        .where(and(eq(books.userId, user.id), eq(books.googleId, googleId)));
    invalidate();
    return { ok: true };
}

export async function removeFromWishlistAction(googleId: string): Promise<ActionResult> {
    if (!googleId) return { ok: false, error: "Missing book id." };
    const { user } = await requireUser();
    await db
        .delete(wishlist)
        .where(and(eq(wishlist.userId, user.id), eq(wishlist.googleId, googleId)));
    invalidate();
    return { ok: true };
}

export async function rateBookAction(
    googleId: string,
    rating: number | null,
): Promise<ActionResult> {
    if (!googleId) return { ok: false, error: "Missing book id." };
    if (rating !== null && (rating < 0 || rating > 5)) {
        return { ok: false, error: "Rating must be between 0 and 5." };
    }
    const { user } = await requireUser();
    await db
        .update(books)
        .set({ rating })
        .where(and(eq(books.userId, user.id), eq(books.googleId, googleId)));
    invalidate();
    return { ok: true };
}
