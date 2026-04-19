import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth/constants";

const PROTECTED = /^\/(library|search|wishlist|settings)(\/|$)/;
const AUTH_ROUTE = "/authenticate";

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const hasSession = req.cookies.has(SESSION_COOKIE);

    if (PROTECTED.test(pathname) && !hasSession) {
        const url = req.nextUrl.clone();
        url.pathname = AUTH_ROUTE;
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
    }

    if (pathname === AUTH_ROUTE && hasSession) {
        const url = req.nextUrl.clone();
        url.pathname = "/library";
        url.search = "";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|.*\\..*).*)"],
};
