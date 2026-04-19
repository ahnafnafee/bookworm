import type { Metadata } from "next";
import { eq } from "drizzle-orm";

import { BookCard } from "@/components/app/book-card";
import { BookGrid } from "@/components/app/book-grid";
import { EmptyState } from "@/components/app/empty-state";
import { NytBookCard } from "@/components/app/nyt-book-card";
import { PageHeader } from "@/components/app/page-header";
import { SearchForm } from "@/components/app/search-form";
import { db } from "@/db";
import { books, wishlist } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { searchGoogleBooks } from "@/lib/books/google";
import { getBestSellers } from "@/lib/books/nyt";

export const metadata: Metadata = { title: "Search" };
export const dynamic = "force-dynamic";

type Search = Promise<{ q?: string }>;

async function userCollections(userId: string) {
    const [libraryRows, wishlistRows] = await Promise.all([
        db.select({ googleId: books.googleId }).from(books).where(eq(books.userId, userId)),
        db.select({ googleId: wishlist.googleId }).from(wishlist).where(eq(wishlist.userId, userId)),
    ]);
    return {
        libraryIds: libraryRows.map((r) => r.googleId),
        wishlistIds: wishlistRows.map((r) => r.googleId),
    };
}

export default async function SearchPage({ searchParams }: { searchParams: Search }) {
    const { q } = await searchParams;
    const query = q?.trim();
    const { user } = await requireUser();
    const { libraryIds, wishlistIds } = await userCollections(user.id);
    const library = new Set(libraryIds);
    const wishes = new Set(wishlistIds);

    const results = query
        ? await searchGoogleBooks(query).catch(() => [])
        : [];
    const bestSellers = query ? [] : await getBestSellers();

    return (
        <>
            <PageHeader
                title="Search"
                description={query ? `Results for "${query}"` : "Discover new titles or browse the current NYT best sellers."}
            />
            <div className="flex flex-col gap-6 p-4 pb-24 sm:p-6 md:pb-6">
                <SearchForm />

                {query ? (
                    results.length === 0 ? (
                        <EmptyState
                            title="No results"
                            description={`Nothing matched "${query}". Try different keywords.`}
                        />
                    ) : (
                        <BookGrid>
                            {results.map((book) => (
                                <BookCard
                                    key={book.googleId}
                                    book={book}
                                    variant={{
                                        kind: "search",
                                        inLibrary: library.has(book.googleId),
                                        inWishlist: wishes.has(book.googleId),
                                    }}
                                />
                            ))}
                        </BookGrid>
                    )
                ) : (
                    <section className="flex flex-col gap-4">
                        <div className="space-y-1">
                            <h2 className="text-lg font-semibold">
                                NYT best sellers — Hardcover fiction
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Tap a book to see details and add it to your library or wishlist.
                            </p>
                        </div>
                        {bestSellers.length === 0 ? (
                            <EmptyState
                                title="Best sellers unavailable"
                                description="The NYT feed is temporarily unreachable. Search above for any book."
                            />
                        ) : (
                            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {bestSellers.map((b) => (
                                    <li key={`${b.rank}-${b.title}`}>
                                        <NytBookCard
                                            book={b}
                                            libraryIds={libraryIds}
                                            wishlistIds={wishlistIds}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                )}
            </div>
        </>
    );
}
