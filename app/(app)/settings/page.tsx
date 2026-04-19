import type { Metadata } from "next";

import { DisplayNameForm } from "@/components/app/display-name-form";
import { LogoutButton } from "@/components/app/logout-button";
import { PageHeader } from "@/components/app/page-header";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const { user } = await requireUser();

    return (
        <>
            <PageHeader title="Settings" description="Manage your Bookworm account." />
            <div className="space-y-6 p-4 pb-24 sm:p-6 md:max-w-2xl md:pb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DisplayNameForm initial={user.displayName} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Account</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <div className="text-sm font-medium">Account number</div>
                            <p className="text-sm text-muted-foreground">
                                We don&apos;t store your 16-digit account number — only a hash of
                                it. Treat the copy you saved at signup as the only copy. If you
                                lose it, your library can&apos;t be recovered.
                            </p>
                        </div>
                        <Separator />
                        <div className="space-y-1">
                            <div className="text-sm font-medium">Member since</div>
                            <div className="text-sm text-muted-foreground">
                                {user.createdAt.toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </div>
                        </div>
                        {user.lastLoginAt ? (
                            <div className="space-y-1">
                                <div className="text-sm font-medium">Last login</div>
                                <div className="text-sm text-muted-foreground">
                                    {user.lastLoginAt.toLocaleString()}
                                </div>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Appearance</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Match your device or pick a side.
                        </div>
                        <ThemeToggle />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Session</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <LogoutButton />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
