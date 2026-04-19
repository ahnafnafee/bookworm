"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ITEMS } from "@/components/app/nav-items";
import { cn } from "@/lib/utils";

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav
            className="sticky bottom-0 z-40 flex items-stretch border-t bg-background/95 backdrop-blur md:hidden"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            aria-label="Primary"
        >
            {NAV_ITEMS.map((item) => {
                const active =
                    pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
                            active
                                ? "text-foreground"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                        aria-current={active ? "page" : undefined}
                    >
                        <Icon className={cn("size-5", active && "fill-current")} />
                        <span>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
