"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { resolveNytBookAction } from "@/app/(app)/books/details-action";
import { BookDetailDialog } from "@/components/app/book-detail-dialog";
import type { BookSummary, NytBestSeller } from "@/lib/books/types";

type Props = {
    book: NytBestSeller;
    libraryIds: string[];
    wishlistIds: string[];
};

export function NytBookCard({ book, libraryIds, wishlistIds }: Props) {
    const [resolved, setResolved] = useState<BookSummary | null>(null);
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const librarySet = useMemo(() => new Set(libraryIds), [libraryIds]);
    const wishlistSet = useMemo(() => new Set(wishlistIds), [wishlistIds]);

    function handleClick() {
        if (resolved) {
            setOpen(true);
            return;
        }
        startTransition(async () => {
            const res = await resolveNytBookAction(book.title, book.author);
            if (!res.ok) {
                toast.error(res.error);
                return;
            }
            setResolved(res.summary);
            setOpen(true);
        });
    }

    return (
        <>
            <button
                type="button"
                onClick={handleClick}
                disabled={isPending}
                className="flex w-full gap-4 rounded-lg border bg-card p-4 text-left transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-70"
            >
                <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded bg-muted">
                    {book.bookImage ? (
                        <Image
                            src={book.bookImage}
                            alt=""
                            fill
                            sizes="80px"
                            className="object-cover"
                        />
                    ) : null}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            #{book.rank}
                        </span>
                        <h3 className="truncate font-medium leading-tight">{book.title}</h3>
                        {isPending ? (
                            <Loader2 className="size-3 shrink-0 animate-spin text-muted-foreground" />
                        ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground">{book.author}</p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                        {book.description}
                    </p>
                </div>
            </button>

            {resolved ? (
                <BookDetailDialog
                    book={resolved}
                    variant={{
                        kind: "search",
                        inLibrary: librarySet.has(resolved.googleId),
                        inWishlist: wishlistSet.has(resolved.googleId),
                    }}
                    open={open}
                    onOpenChange={setOpen}
                />
            ) : null}
        </>
    );
}
