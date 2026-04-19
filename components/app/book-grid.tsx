export function BookGrid({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {children}
        </div>
    );
}

export function BookGridSkeleton({ count = 12 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="aspect-[2/3] animate-pulse rounded-lg border bg-muted/60"
                />
            ))}
        </div>
    );
}
