import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { LogInForm } from "@/components/auth/login-form";
import { SignUpForm } from "@/components/auth/signup-form";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
    title: "Sign in",
    description: "Sign up or log in with your Bookworm account number.",
};

type Search = Promise<{ next?: string; tab?: string }>;

export default async function AuthenticatePage({ searchParams }: { searchParams: Search }) {
    const { next, tab } = await searchParams;
    const defaultTab = tab === "signup" ? "signup" : "login";

    return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 py-12">
            <Link href="/" className="inline-flex">
                <Image
                    src="/images/bookworm-logo.png"
                    alt="Bookworm"
                    width={1670}
                    height={392}
                    priority
                    className="h-14 w-auto sm:h-16 dark:invert"
                />
            </Link>

            <Card className="w-full max-w-md">
                <CardContent className="pt-6">
                    <Tabs defaultValue={defaultTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Log in</TabsTrigger>
                            <TabsTrigger value="signup">Sign up</TabsTrigger>
                        </TabsList>
                        <TabsContent value="login" className="pt-6">
                            <LogInForm next={next} />
                        </TabsContent>
                        <TabsContent value="signup" className="pt-6">
                            <SignUpForm />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <p className="max-w-sm text-balance text-center text-xs text-muted-foreground">
                Bookworm uses account numbers instead of emails and passwords. Keep yours safe —
                it&apos;s the only way in, and there is no recovery.
            </p>
        </main>
    );
}
