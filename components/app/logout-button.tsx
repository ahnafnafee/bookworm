"use client";

import { useTransition } from "react";
import { Loader2, LogOut } from "lucide-react";

import { logOutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
    const [isPending, startTransition] = useTransition();
    return (
        <Button
            variant="outline"
            onClick={() => startTransition(() => logOutAction())}
            disabled={isPending}
        >
            {isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
                <LogOut className="mr-2 size-4" />
            )}
            Log out
        </Button>
    );
}
