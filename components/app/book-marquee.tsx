import Image from "next/image";

import { cn } from "@/lib/utils";
import type { NytBestSeller } from "@/lib/books/types";

type Size = "sm" | "md";

type RowProps = {
    books: NytBestSeller[];
    reverse?: boolean;
    duration: string;
    delay?: string;
    size: Size;
    opacity: string;
};

function Row({ books, reverse, duration, delay = "0s", size, opacity }: RowProps) {
    const loop = [...books, ...books];
    const widthClass =
        size === "md"
            ? "w-16 sm:w-20 md:w-24"
            : "w-14 sm:w-16 md:w-20";
    return (
        <div
            className={cn(
                "flex w-max gap-2 sm:gap-3",
                reverse ? "animate-marquee-reverse" : "animate-marquee",
            )}
            style={
                {
                    "--marquee-duration": duration,
                    "--marquee-delay": delay,
                    opacity,
                } as React.CSSProperties
            }
        >
            {loop.map((b, i) => (
                <div
                    key={`${b.rank}-${i}`}
                    className={cn("shrink-0", widthClass)}
                    title={`${b.title} — ${b.author}`}
                >
                    <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-muted shadow-md ring-1 ring-black/10 dark:ring-white/10">
                        {b.bookImage ? (
                            <Image
                                src={b.bookImage}
                                alt=""
                                fill
                                sizes="(min-width: 768px) 96px, (min-width: 640px) 80px, 64px"
                                className="object-cover"
                                unoptimized
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center p-1 text-center text-[9px] leading-tight text-muted-foreground">
                                {b.title}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

type Props = {
    books: NytBestSeller[];
    variant: "top" | "bottom";
};

export function BookMarquee({ books, variant }: Props) {
    if (books.length < 3) return null;
    const isTop = variant === "top";

    return (
        <div
            className="marquee-container w-full overflow-hidden py-3 sm:py-4"
            aria-hidden="true"
            style={{
                maskImage:
                    "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
                WebkitMaskImage:
                    "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
            }}
        >
            <div className="flex flex-col gap-2 sm:gap-3">
                {isTop ? (
                    <>
                        <Row
                            books={books}
                            size="sm"
                            opacity="0.5"
                            duration="80s"
                            delay="-10s"
                        />
                        <Row
                            books={books}
                            reverse
                            size="md"
                            opacity="0.9"
                            duration="55s"
                            delay="-25s"
                        />
                    </>
                ) : (
                    <>
                        <Row
                            books={books}
                            size="md"
                            opacity="0.9"
                            duration="55s"
                            delay="-5s"
                        />
                        <Row
                            books={books}
                            reverse
                            size="sm"
                            opacity="0.5"
                            duration="80s"
                            delay="-30s"
                        />
                    </>
                )}
            </div>
        </div>
    );
}
