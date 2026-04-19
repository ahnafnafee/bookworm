import type { ReactNode } from "react";

export function EmptyState({
    icon,
    title,
    description,
    children,
}: {
    icon?: ReactNode;
    title: string;
    description?: string;
    children?: ReactNode;
}) {
    return (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
            {icon ? <div className="text-muted-foreground">{icon}</div> : null}
            <div className="space-y-1">
                <h2 className="text-lg font-semibold">{title}</h2>
                {description ? (
                    <p className="max-w-md text-balance text-sm text-muted-foreground">
                        {description}
                    </p>
                ) : null}
            </div>
            {children}
        </div>
    );
}
