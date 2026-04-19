"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { LogOut, Monitor, Moon, Settings as SettingsIcon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { logOutAction } from "@/app/(auth)/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
    user: { id: string; displayName: string | null };
};

function initial(name: string | null, id: string): string {
    if (name && name.trim().length > 0) return name.trim()[0]!.toUpperCase();
    return id[0]!.toUpperCase();
}

export function UserMenu({ user }: Props) {
    const [isPending, startTransition] = useTransition();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // next-themes: defer rendering the actual theme icon until after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => setMounted(true), []);

    const label = user.displayName?.trim() || "Account";
    const currentTheme = mounted ? (theme ?? "system") : "system";
    const ThemeIcon =
        currentTheme === "dark" ? Moon : currentTheme === "light" ? Sun : Monitor;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-md p-2 text-left text-sm transition-colors hover:bg-accent"
                >
                    <Avatar className="size-8">
                        <AvatarFallback>{initial(user.displayName, user.id)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{label}</div>
                        <div className="truncate text-xs text-muted-foreground">
                            Token-secured
                        </div>
                    </div>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{label}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            No email on file
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/settings">
                        <SettingsIcon className="mr-2 size-4" /> Settings
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <ThemeIcon className="mr-2 size-4" /> Theme
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup
                            value={currentTheme}
                            onValueChange={setTheme}
                        >
                            <DropdownMenuRadioItem value="light">
                                <Sun className="mr-2 size-4" /> Light
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="dark">
                                <Moon className="mr-2 size-4" /> Dark
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="system">
                                <Monitor className="mr-2 size-4" /> System
                            </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    disabled={isPending}
                    onSelect={(e) => {
                        e.preventDefault();
                        startTransition(() => logOutAction());
                    }}
                >
                    <LogOut className="mr-2 size-4" />
                    {isPending ? "Logging out…" : "Log out"}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
