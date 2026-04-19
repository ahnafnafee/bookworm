"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

import { signUpAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TokenDisplay } from "@/components/auth/token-display";

export function SignUpForm() {
    const [isPending, startTransition] = useTransition();
    const [token, setToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    function onSubmit(formData: FormData) {
        setError(null);
        startTransition(async () => {
            const res = await signUpAction(formData);
            if (res.ok) {
                setToken(res.token);
            } else {
                setError(res.error);
            }
        });
    }

    if (token) {
        return <TokenDisplay token={token} />;
    }

    return (
        <form action={onSubmit} className="flex flex-col gap-4">
            <div className="space-y-2">
                <Label htmlFor="displayName">Display name (optional)</Label>
                <Input
                    id="displayName"
                    name="displayName"
                    type="text"
                    maxLength={50}
                    placeholder="Anything you want to be called"
                    autoComplete="nickname"
                    disabled={isPending}
                />
                <p className="text-xs text-muted-foreground">
                    We don&apos;t ask for an email. On signup you&apos;ll get a 16-digit account
                    number — that&apos;s your only credential.
                </p>
            </div>

            {error ? (
                <p className="text-sm text-destructive" role="alert">
                    {error}
                </p>
            ) : null}

            <Button type="submit" disabled={isPending} size="lg">
                {isPending ? (
                    <>
                        <Loader2 className="mr-2 size-4 animate-spin" /> Generating…
                    </>
                ) : (
                    "Generate my account number"
                )}
            </Button>
        </form>
    );
}
