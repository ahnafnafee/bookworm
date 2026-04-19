"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { updateDisplayNameAction } from "@/app/(app)/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DisplayNameForm({ initial }: { initial: string | null }) {
    const [value, setValue] = useState(initial ?? "");
    const [isPending, startTransition] = useTransition();

    function save() {
        startTransition(async () => {
            const res = await updateDisplayNameAction(value);
            if (res.ok) toast.success("Display name updated.");
            else toast.error(res.error);
        });
    }

    return (
        <div className="flex flex-col gap-3">
            <Label htmlFor="displayName">Display name</Label>
            <div className="flex gap-2">
                <Input
                    id="displayName"
                    maxLength={50}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Optional"
                    disabled={isPending}
                />
                <Button onClick={save} disabled={isPending || value === (initial ?? "")}>
                    {isPending ? <Loader2 className="size-4 animate-spin" /> : "Save"}
                </Button>
            </div>
            <p className="text-xs text-muted-foreground">
                Only shown on your own screen. We don&apos;t use it for anything else.
            </p>
        </div>
    );
}
