"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Loader2, Search as SearchIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchForm() {
    const router = useRouter();
    const params = useSearchParams();
    const [value, setValue] = useState(params.get("q") ?? "");
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setValue(params.get("q") ?? "");
    }, [params]);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        const q = value.trim();
        startTransition(() => {
            router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
        });
    }

    function clear() {
        setValue("");
        startTransition(() => router.push("/search"));
    }

    return (
        <form onSubmit={submit} className="relative flex w-full max-w-xl gap-2">
            <div className="relative flex-1">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="search"
                    name="q"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Search books, authors, ISBNs…"
                    className="pl-9 pr-9"
                    autoComplete="off"
                />
                {value ? (
                    <button
                        type="button"
                        onClick={clear}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                        aria-label="Clear search"
                    >
                        <X className="size-4" />
                    </button>
                ) : null}
            </div>
            <Button type="submit" disabled={isPending || value.trim().length === 0}>
                {isPending ? <Loader2 className="size-4 animate-spin" /> : "Search"}
            </Button>
        </form>
    );
}
