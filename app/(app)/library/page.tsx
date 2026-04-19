import { BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";

import { BookCard } from "@/components/app/book-card";
import { BookGrid } from "@/components/app/book-grid";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { books } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Library" };
export const dynamic = "force-dynamic";

export default async function LibraryPage() {
    const { user } = await requireUser();
    const rows = await db
        .select()
        .from(books)
        .where(eq(books.userId, user.id))
        .orderBy(desc(books.createdAt));

    const greeting = user.displayName?.trim()
        ? `Welcome back, ${user.displayName}`
        : "Your library";

    return (
        <>
            <PageHeader title={greeting} description={`${rows.length} book${rows.length === 1 ? "" : "s"} in your collection.`}>
                <Button asChild size="sm">
                    <Link href="/search">Find books</Link>
                </Button>
            </PageHeader>
            <div className="p-4 pb-24 sm:p-6 md:pb-6">
                {rows.length === 0 ? (
                    <EmptyState
                        icon={<BookOpen className="size-10" />}
                        title="Your library is empty"
                        description="Search for a title you've read, rate it, and build up your collection."
                    >
                        <Button asChild>
                            <Link href="/search">Find your first book</Link>
                        </Button>
                    </EmptyState>
                ) : (
                    <BookGrid>
                        {rows.map((b) => (
                            <BookCard
                                key={b.id}
                                book={{
                                    googleId: b.googleId,
                                    title: b.title,
                                    authors: b.authors,
                                    thumbnail: b.thumbnail,
                                    categories: b.categories,
                                    rating: b.rating,
                                }}
                                variant={{ kind: "library", rating: b.rating }}
                            />
                        ))}
                    </BookGrid>
                )}
            </div>
        </>
    );
}
