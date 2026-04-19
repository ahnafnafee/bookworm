export function PageHeader({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-3 border-b px-4 py-5 sm:px-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                {description ? (
                    <p className="text-sm text-muted-foreground">{description}</p>
                ) : null}
            </div>
            {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
        </div>
    );
}
