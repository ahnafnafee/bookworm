"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ITEMS } from "@/components/app/nav-items";
import { UserMenu } from "@/components/app/user-menu";
import { cn } from "@/lib/utils";

type Props = {
    user: { id: string; displayName: string | null };
};

export function Sidebar({ user }: Props) {
    const pathname = usePathname();

    return (
        <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r bg-background md:flex">
            <Link href="/library" className="flex items-center px-5 py-5">
                <Image
                    src="/images/bookworm-logo.png"
                    alt="Bookworm"
                    width={1670}
                    height={392}
                    className="h-9 w-auto dark:invert"
                />
            </Link>

            <nav className="flex-1 space-y-1 px-3 py-2">
                {NAV_ITEMS.map((item) => {
                    const active =
                        pathname === item.href || pathname.startsWith(item.href + "/");
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                active
                                    ? "bg-accent text-accent-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                            )}
                        >
                            <Icon className="size-4 shrink-0" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t p-3">
                <UserMenu user={user} />
            </div>
        </aside>
    );
}
