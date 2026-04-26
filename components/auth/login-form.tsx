"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

import { logInAction } from "@/app/(auth)/actions";
import { savePasswordCredential } from "@/lib/auth/credential-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function formatAsTyped(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    const match = digits.match(/.{1,4}/g);
    return match ? match.join(" ") : "";
}

export function LogInForm({ next }: { next?: string }) {
    const [isPending, startTransition] = useTransition();
    const [value, setValue] = useState("");
    const [error, setError] = useState<string | null>(null);

    function onSubmit(formData: FormData) {
        setError(null);
        startTransition(async () => {
            const res = await logInAction(formData);
            if (!res.ok) {
                setError(res.error);
                return;
            }
            await savePasswordCredential(String(formData.get("token") ?? ""));
            window.location.assign(res.next);
        });
    }

    return (
        <form action={onSubmit} className="flex flex-col gap-4" method="post">
            <input
                type="text"
                name="username"
                value="Bookworm account"
                readOnly
                hidden
                autoComplete="username"
                aria-hidden="true"
                tabIndex={-1}
            />
            <div className="space-y-2">
                <Label htmlFor="token">Account number</Label>
                <Input
                    id="token"
                    name="token"
                    type="text"
                    inputMode="numeric"
                    autoComplete="current-password"
                    placeholder="1234 5678 9012 3456"
                    value={value}
                    onChange={(e) => setValue(formatAsTyped(e.target.value))}
                    className="font-mono tracking-widest"
                    required
                    disabled={isPending}
                />
                {next ? <input type="hidden" name="next" value={next} /> : null}
            </div>

            {error ? (
                <p className="text-sm text-destructive" role="alert">
                    {error}
                </p>
            ) : null}

            <Button type="submit" disabled={isPending || value.replace(/\D/g, "").length !== 16} size="lg">
                {isPending ? (
                    <>
                        <Loader2 className="mr-2 size-4 animate-spin" /> Logging in…
                    </>
                ) : (
                    "Log in"
                )}
            </Button>
        </form>
    );
}
