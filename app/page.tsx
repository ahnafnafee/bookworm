import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { BookMarquee } from "@/components/app/book-marquee";
import { getCurrentUser } from "@/lib/auth/session";
import { getBestSellers } from "@/lib/books/nyt";
import type { NytBestSeller } from "@/lib/books/types";

export const dynamic = "force-dynamic";

export default async function Home() {
    const ctx = await getCurrentUser();
    if (ctx) redirect("/library");

    const bestSellers = await getBestSellers().catch(() => [] as NytBestSeller[]);
    return <Landing bestSellers={bestSellers} />;
}

function Landing({ bestSellers }: { bestSellers: NytBestSeller[] }) {
    const hasBooks = bestSellers.length >= 3;

    return (
        <main className="flex min-h-dvh flex-col">
            {hasBooks ? <BookMarquee books={bestSellers} variant="top" /> : null}

            <div className="flex flex-1 flex-col items-center justify-center gap-7 px-6 py-10 text-center">
                <Image
                    src="/images/bookworm-logo.png"
                    alt="Bookworm"
                    width={1670}
                    height={392}
                    priority
                    className="h-20 w-auto sm:h-24 md:h-28 dark:invert"
                />
                <div className="space-y-3">
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                        Your private book library
                    </h1>
                    <p className="mx-auto max-w-md text-balance text-muted-foreground">
                        No emails, no passwords — just an account number you keep somewhere safe.
                    </p>
                </div>
                <Link
                    href="/authenticate"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-7 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 ring-1 ring-primary/10 transition hover:bg-primary/90 hover:shadow-primary/30"
                >
                    Sign up or log in
                </Link>
                {hasBooks ? (
                    <p className="text-xs text-muted-foreground">
                        Framed by this week&apos;s NYT hardcover fiction best sellers.
                    </p>
                ) : null}
            </div>

            {hasBooks ? <BookMarquee books={bestSellers} variant="bottom" /> : null}
        </main>
    );
}
