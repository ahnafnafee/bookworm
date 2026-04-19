"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { BookOpen, Heart, MoreHorizontal, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
    addToLibraryAction,
    addToWishlistAction,
    rateBookAction,
    removeFromLibraryAction,
    removeFromWishlistAction,
} from "@/app/(app)/books/actions";
import { BookDetailDialog, type DialogVariant } from "@/components/app/book-detail-dialog";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { BookSummary } from "@/lib/books/types";

type CardVariant =
    | { kind: "library"; rating: number | null }
    | { kind: "wishlist" }
    | { kind: "search"; inLibrary: boolean; inWishlist: boolean };

type Props = {
    book: BookSummary;
    variant: CardVariant;
};

function toDialogVariant(v: CardVariant): DialogVariant {
    if (v.kind === "library") return { kind: "library" };
    if (v.kind === "wishlist") return { kind: "wishlist" };
    return v;
}

function StarRating({
    rating,
    onChange,
    disabled,
}: {
    rating: number;
    onChange: (v: number) => void;
    disabled?: boolean;
}) {
    const [hover, setHover] = useState<number | null>(null);
    const displayed = hover ?? rating;
    return (
        <div className="flex items-center gap-0.5" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    disabled={disabled}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => onChange(n === rating ? 0 : n)}
                    className="p-0.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
                    aria-label={`${n} star${n === 1 ? "" : "s"}`}
                    aria-checked={rating === n}
                    role="radio"
                >
                    <Star
                        className={cn(
                            "size-4",
                            n <= displayed ? "fill-yellow-400 text-yellow-400" : "",
                        )}
                    />
                </button>
            ))}
        </div>
    );
}

export function BookCard({ book, variant }: Props) {
    const [isPending, startTransition] = useTransition();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [optimisticRating, setOptimisticRating] = useState<number>(
        variant.kind === "library" ? (variant.rating ?? 0) : 0,
    );

    function run(fn: () => Promise<{ ok: boolean; error?: string }>, success: string) {
        startTransition(async () => {
            const res = await fn();
            if (!res.ok) toast.error(res.error ?? "Something went wrong.");
            else toast.success(success);
        });
    }

    return (
        <>
            <article className="group flex flex-col gap-3 rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
                <button
                    type="button"
                    onClick={() => setDialogOpen(true)}
                    className="flex flex-col gap-3 rounded-sm text-left transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`View details for ${book.title ?? "this book"}`}
                >
                    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-muted">
                        {book.thumbnail ? (
                            <Image
                                src={book.thumbnail}
                                alt=""
                                fill
                                sizes="(min-width: 1024px) 16vw, (min-width: 768px) 25vw, 45vw"
                                className="object-cover transition-transform group-hover:scale-[1.02]"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                                No cover
                            </div>
                        )}
                    </div>

                    <div className="flex min-h-[3rem] flex-col gap-0.5">
                        <h3 className="line-clamp-2 text-sm font-medium leading-tight">
                            {book.title ?? "Untitled"}
                        </h3>
                        {book.authors ? (
                            <p className="line-clamp-1 text-xs text-muted-foreground">
                                {book.authors}
                            </p>
                        ) : null}
                    </div>
                </button>

                {variant.kind === "library" ? (
                    <div className="flex items-center justify-between">
                        <StarRating
                            rating={optimisticRating}
                            disabled={isPending}
                            onChange={(v) => {
                                setOptimisticRating(v);
                                run(
                                    () => rateBookAction(book.googleId, v === 0 ? null : v),
                                    v === 0 ? "Rating cleared." : `Rated ${v} star${v === 1 ? "" : "s"}.`,
                                );
                            }}
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-destructive"
                            disabled={isPending}
                            onClick={() =>
                                run(
                                    () => removeFromLibraryAction(book.googleId),
                                    "Removed from library.",
                                )
                            }
                            aria-label="Remove from library"
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                ) : null}

                {variant.kind === "wishlist" ? (
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            className="flex-1"
                            disabled={isPending}
                            onClick={() =>
                                run(() => addToLibraryAction(book), "Moved to library.")
                            }
                        >
                            <BookOpen className="mr-1.5 size-3.5" /> Own it
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-destructive"
                            disabled={isPending}
                            onClick={() =>
                                run(
                                    () => removeFromWishlistAction(book.googleId),
                                    "Removed from wishlist.",
                                )
                            }
                            aria-label="Remove from wishlist"
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                ) : null}

                {variant.kind === "search" ? (
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant={variant.inLibrary ? "outline" : "default"}
                            className="flex-1"
                            disabled={isPending || variant.inLibrary}
                            onClick={() =>
                                run(() => addToLibraryAction(book), "Added to library.")
                            }
                        >
                            <BookOpen className="mr-1.5 size-3.5" />
                            {variant.inLibrary ? "In library" : "Library"}
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-8"
                                    aria-label="More"
                                >
                                    <MoreHorizontal className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    disabled={isPending || variant.inWishlist}
                                    onSelect={() =>
                                        run(
                                            () => addToWishlistAction(book),
                                            "Added to wishlist.",
                                        )
                                    }
                                >
                                    <Heart className="mr-2 size-4" />
                                    {variant.inWishlist ? "In wishlist" : "Add to wishlist"}
                                </DropdownMenuItem>
                                {variant.inWishlist ? (
                                    <DropdownMenuItem
                                        disabled={isPending}
                                        onSelect={() =>
                                            run(
                                                () => removeFromWishlistAction(book.googleId),
                                                "Removed from wishlist.",
                                            )
                                        }
                                    >
                                        <Trash2 className="mr-2 size-4" /> Remove from wishlist
                                    </DropdownMenuItem>
                                ) : null}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ) : null}
            </article>

            <BookDetailDialog
                book={book}
                variant={toDialogVariant(variant)}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
        </>
    );
}
