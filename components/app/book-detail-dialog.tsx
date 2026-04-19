"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { BookOpen, ExternalLink, Heart, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
    addToLibraryAction,
    addToWishlistAction,
    removeFromLibraryAction,
    removeFromWishlistAction,
} from "@/app/(app)/books/actions";
import { getBookDetailAction } from "@/app/(app)/books/details-action";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { BookDetail, BookSummary } from "@/lib/books/types";

export type DialogVariant =
    | { kind: "library" }
    | { kind: "wishlist" }
    | { kind: "search"; inLibrary: boolean; inWishlist: boolean };

type Props = {
    book: BookSummary;
    variant: DialogVariant;
    open: boolean;
    onOpenChange: (v: boolean) => void;
};

function stripHtml(html: string): string {
    return html
        .replace(/<br\s*\/?\s*>/gi, "\n")
        .replace(/<\/p>/gi, "\n\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function Meta({ label, value }: { label: string; value: string | number | null }) {
    if (value === null || value === "" || value === undefined) return null;
    return (
        <div className="flex gap-3 text-sm">
            <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
            <span className="min-w-0 flex-1">{value}</span>
        </div>
    );
}

export function BookDetailDialog({ book, variant, open, onOpenChange }: Props) {
    const [detail, setDetail] = useState<BookDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (!open) return;
        // Reset state and fetch fresh details whenever the dialog re-opens
        // with a different book. The state resets are intentional prep for
        // the async fetch that follows.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDetail(null);
        setLoadError(null);
        setLoading(true);
        let cancelled = false;
        getBookDetailAction(book.googleId)
            .then((res) => {
                if (cancelled) return;
                if (res.ok) setDetail(res.detail);
                else setLoadError(res.error);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [open, book.googleId]);

    const displayed: BookSummary = detail ?? book;
    const rating = detail?.rating ?? book.rating;
    const description = detail?.description ? stripHtml(detail.description) : null;

    function run(
        fn: () => Promise<{ ok: boolean; error?: string }>,
        success: string,
        closeAfter = true,
    ) {
        startTransition(async () => {
            const res = await fn();
            if (!res.ok) {
                toast.error(res.error ?? "Something went wrong.");
            } else {
                toast.success(success);
                if (closeAfter) onOpenChange(false);
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90dvh] flex-col gap-0 p-0 sm:max-w-2xl">
                <DialogHeader className="shrink-0 border-b px-5 py-4 pr-12 sm:px-6">
                    <DialogTitle className="text-left text-lg leading-tight sm:text-xl">
                        {displayed.title ?? "Untitled"}
                    </DialogTitle>
                    {displayed.authors ? (
                        <DialogDescription className="text-left">
                            {displayed.authors}
                        </DialogDescription>
                    ) : null}
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
                    <div className="grid grid-cols-[100px_1fr] gap-4 sm:grid-cols-[140px_1fr]">
                        <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-muted">
                            {displayed.thumbnail ? (
                                <Image
                                    src={displayed.thumbnail}
                                    alt=""
                                    fill
                                    sizes="140px"
                                    className="object-cover"
                                />
                            ) : null}
                        </div>

                        <div className="min-w-0 space-y-3">
                            {rating !== null ? (
                                <div className="flex items-center gap-1.5 text-sm">
                                    <Star className="size-4 fill-yellow-400 text-yellow-400" />
                                    <span className="font-medium">{rating.toFixed(1)}</span>
                                    {detail?.ratingsCount ? (
                                        <span className="text-muted-foreground">
                                            ({detail.ratingsCount.toLocaleString()})
                                        </span>
                                    ) : null}
                                </div>
                            ) : null}

                            <div className="space-y-1.5">
                                <Meta label="Publisher" value={detail?.publisher ?? null} />
                                <Meta label="Published" value={detail?.publishedDate ?? null} />
                                <Meta label="Pages" value={detail?.pageCount ?? null} />
                                <Meta label="Categories" value={displayed.categories} />
                                <Meta
                                    label="ISBN"
                                    value={detail?.isbn13 ?? detail?.isbn10 ?? null}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 border-t pt-4">
                        {loading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-4/5" />
                            </div>
                        ) : loadError ? (
                            <p className="text-sm text-muted-foreground">{loadError}</p>
                        ) : description ? (
                            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                                {description}
                            </p>
                        ) : (
                            <p className="text-sm italic text-muted-foreground">
                                No description available.
                            </p>
                        )}

                        {detail?.previewLink ? (
                            <a
                                href={detail.previewLink}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Preview on Google Books <ExternalLink className="size-3" />
                            </a>
                        ) : null}
                    </div>
                </div>

                <div
                    className="shrink-0 border-t bg-background px-5 py-3 sm:px-6 sm:py-4"
                    style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
                >
                    <div className="flex flex-wrap gap-2">
                        {variant.kind === "search" ? (
                            <>
                                <Button
                                    size="sm"
                                    className="flex-1 sm:flex-none"
                                    variant={variant.inLibrary ? "outline" : "default"}
                                    disabled={isPending || variant.inLibrary}
                                    onClick={() =>
                                        run(
                                            () => addToLibraryAction(book),
                                            "Added to library.",
                                        )
                                    }
                                >
                                    <BookOpen className="mr-1.5 size-4" />
                                    {variant.inLibrary ? "In library" : "Add to library"}
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex-1 sm:flex-none"
                                    variant="outline"
                                    disabled={isPending || variant.inWishlist}
                                    onClick={() =>
                                        run(
                                            () => addToWishlistAction(book),
                                            "Added to wishlist.",
                                        )
                                    }
                                >
                                    <Heart className="mr-1.5 size-4" />
                                    {variant.inWishlist ? "In wishlist" : "Add to wishlist"}
                                </Button>
                            </>
                        ) : null}

                        {variant.kind === "wishlist" ? (
                            <>
                                <Button
                                    size="sm"
                                    className="flex-1 sm:flex-none"
                                    disabled={isPending}
                                    onClick={() =>
                                        run(
                                            () => addToLibraryAction(book),
                                            "Moved to library.",
                                        )
                                    }
                                >
                                    <BookOpen className="mr-1.5 size-4" /> Move to library
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex-1 sm:flex-none"
                                    variant="outline"
                                    disabled={isPending}
                                    onClick={() =>
                                        run(
                                            () => removeFromWishlistAction(book.googleId),
                                            "Removed from wishlist.",
                                        )
                                    }
                                >
                                    <Trash2 className="mr-1.5 size-4" /> Remove
                                </Button>
                            </>
                        ) : null}

                        {variant.kind === "library" ? (
                            <Button
                                size="sm"
                                className="flex-1 sm:flex-none"
                                variant="outline"
                                disabled={isPending}
                                onClick={() =>
                                    run(
                                        () => removeFromLibraryAction(book.googleId),
                                        "Removed from library.",
                                    )
                                }
                            >
                                <Trash2 className="mr-1.5 size-4" /> Remove from library
                            </Button>
                        ) : null}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
