import { BookOpen, Heart, Search } from "lucide-react";

export const NAV_ITEMS = [
    { href: "/library", label: "Library", icon: BookOpen },
    { href: "/search", label: "Search", icon: Search },
    { href: "/wishlist", label: "Wishlist", icon: Heart },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];
