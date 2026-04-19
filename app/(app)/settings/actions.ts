"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";

const displayNameSchema = z
    .string()
    .trim()
    .max(50)
    .transform((v) => (v.length > 0 ? v : null));

export async function updateDisplayNameAction(
    raw: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
    const { user } = await requireUser();
    const parsed = displayNameSchema.safeParse(raw);
    if (!parsed.success) {
        return { ok: false, error: "Name must be 50 characters or fewer." };
    }
    await db.update(users).set({ displayName: parsed.data }).where(eq(users.id, user.id));
    revalidatePath("/settings");
    revalidatePath("/library");
    return { ok: true };
}
