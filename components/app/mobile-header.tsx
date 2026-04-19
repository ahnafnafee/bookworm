import Image from "next/image";
import Link from "next/link";

import { UserMenu } from "@/components/app/user-menu";

type Props = {
    user: { id: string; displayName: string | null };
};

export function MobileHeader({ user }: Props) {
    return (
        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur md:hidden">
            <Link href="/library" className="inline-flex">
                <Image
                    src="/images/bookworm-logo.png"
                    alt="Bookworm"
                    width={1670}
                    height={392}
                    className="h-7 w-auto dark:invert"
                    priority
                />
            </Link>
            <div className="w-40">
                <UserMenu user={user} />
            </div>
        </header>
    );
}
