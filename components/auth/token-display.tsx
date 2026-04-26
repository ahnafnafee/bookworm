"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Download, Printer } from "lucide-react";

import { savePasswordCredential } from "@/lib/auth/credential-store";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function TokenDisplay({ token }: { token: string }) {
    const router = useRouter();
    const [copied, setCopied] = useState(false);
    const [savedAck, setSavedAck] = useState(false);
    const [lossAck, setLossAck] = useState(false);
    const canContinue = savedAck && lossAck;

    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (!canContinue) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [canContinue]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(token);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            /* ignore */
        }
    };

    const handleDownload = () => {
        const blob = new Blob(
            [`Bookworm account number: ${token}\nSaved: ${new Date().toISOString()}\n`],
            { type: "text/plain" },
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "bookworm-account-number.txt";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handlePrint = () => window.print();

    return (
        <div className="flex flex-col gap-6">
            <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold tracking-tight">Your account number</h2>
                <p className="text-sm text-muted-foreground">
                    Save it now. There is no recovery — we don&apos;t store it, ask for an email,
                    or offer a reset. Treat it like a password.
                </p>
            </div>

            <div
                className="select-all rounded-lg border bg-muted/40 p-6 text-center font-mono text-2xl tracking-widest sm:text-3xl"
                aria-label="Account number"
            >
                {token}
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Button variant="outline" onClick={handleCopy} type="button">
                    {copied ? <Check className="mr-2 size-4" /> : <Copy className="mr-2 size-4" />}
                    {copied ? "Copied" : "Copy"}
                </Button>
                <Button variant="outline" onClick={handleDownload} type="button">
                    <Download className="mr-2 size-4" /> Download
                </Button>
                <Button variant="outline" onClick={handlePrint} type="button">
                    <Printer className="mr-2 size-4" /> Print
                </Button>
            </div>

            <div className="space-y-3 rounded-md border border-dashed p-4 text-sm">
                <Label className="flex items-start gap-3 font-normal">
                    <Checkbox
                        checked={savedAck}
                        onCheckedChange={(v) => setSavedAck(v === true)}
                    />
                    <span>I have saved this account number somewhere safe.</span>
                </Label>
                <Label className="flex items-start gap-3 font-normal">
                    <Checkbox
                        checked={lossAck}
                        onCheckedChange={(v) => setLossAck(v === true)}
                    />
                    <span>
                        I understand that if I lose it, my library cannot be recovered.
                    </span>
                </Label>
            </div>

            <Button
                type="button"
                size="lg"
                disabled={!canContinue}
                onClick={async () => {
                    await savePasswordCredential(token);
                    router.push("/library");
                }}
                className={cn(!canContinue && "cursor-not-allowed")}
            >
                Continue to library
            </Button>
        </div>
    );
}
