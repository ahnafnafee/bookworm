import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

import { getBestSellers } from "@/lib/books/nyt";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Vercel Cron hits this once a day (schedule in vercel.json) to pre-warm the
 * NYT best-sellers cache so the first real visitor never pays the NYT latency.
 * Vercel sends `Authorization: Bearer $CRON_SECRET` automatically.
 */
export async function GET(req: Request) {
    const expected = process.env.CRON_SECRET;
    const received = req.headers.get("authorization");
    if (!expected || received !== `Bearer ${expected}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    revalidateTag("nyt");

    try {
        const books = await getBestSellers();
        return NextResponse.json({
            ok: true,
            count: books.length,
            at: new Date().toISOString(),
        });
    } catch (err) {
        return NextResponse.json(
            { ok: false, error: (err as Error).message },
            { status: 500 },
        );
    }
}
