import { redirect } from "next/navigation";

import { BottomNav } from "@/components/app/bottom-nav";
import { MobileHeader } from "@/components/app/mobile-header";
import { Sidebar } from "@/components/app/sidebar";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const ctx = await getCurrentUser();
    if (!ctx) redirect("/authenticate");

    const user = { id: ctx.user.id, displayName: ctx.user.displayName };

    return (
        <div className="flex min-h-dvh flex-col md:flex-row">
            <Sidebar user={user} />
            <div className="flex min-w-0 flex-1 flex-col">
                <MobileHeader user={user} />
                <main className="flex-1">{children}</main>
                <BottomNav />
            </div>
        </div>
    );
}
