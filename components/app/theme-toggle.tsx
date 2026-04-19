"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OPTIONS = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const current = mounted ? (theme ?? "system") : "system";
    const currentOption = OPTIONS.find((o) => o.value === current) ?? OPTIONS[2];
    const Icon = currentOption.icon;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <Icon className="mr-2 size-4" />
                    {currentOption.label}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {OPTIONS.map((o) => {
                    const OptionIcon = o.icon;
                    return (
                        <DropdownMenuItem key={o.value} onSelect={() => setTheme(o.value)}>
                            <OptionIcon className="mr-2 size-4" />
                            {o.label}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
