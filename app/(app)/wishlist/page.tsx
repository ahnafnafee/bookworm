import { Heart } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";

import { BookCard } from "@/components/app/book-card";
import { BookGrid } from "@/components/app/book-grid";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { wishlist } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Wishlist" };
export const dynamic = "force-dynamic";

export default async function WishlistPage() {
    const { user } = await requireUser();
    const rows = await db
        .select()
        .from(wishlist)
        .where(eq(wishlist.userId, user.id))
        .orderBy(desc(wishlist.createdAt));

    return (
        <>
            <PageHeader
                title="Wishlist"
                description={`${rows.length} book${rows.length === 1 ? "" : "s"} you want to read.`}
            >
                <Button asChild size="sm" variant="outline">
                    <Link href="/search">Find books</Link>
                </Button>
            </PageHeader>
            <div className="p-4 pb-24 sm:p-6 md:pb-6">
                {rows.length === 0 ? (
                    <EmptyState
                        icon={<Heart className="size-10" />}
                        title="Your wishlist is empty"
                        description="Save books you want to read later. Move them to your library once you've read them."
                    >
                        <Button asChild>
                            <Link href="/search">Browse books</Link>
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
                                variant={{ kind: "wishlist" }}
                            />
                        ))}
                    </BookGrid>
                )}
            </div>
        </>
    );
}
