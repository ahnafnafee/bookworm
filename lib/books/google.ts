import "server-only";

import { unstable_cache } from "next/cache";

import type { BookDetail, BookSummary } from "./types";

type ImageLinks = {
    thumbnail?: string;
    smallThumbnail?: string;
    small?: string;
    medium?: string;
    large?: string;
    extraLarge?: string;
};

type GoogleBooksVolume = {
    id: string;
    volumeInfo?: {
        title?: string;
        authors?: string[];
        categories?: string[];
        averageRating?: number;
        ratingsCount?: number;
        description?: string;
        publisher?: string;
        publishedDate?: string;
        pageCount?: number;
        language?: string;
        previewLink?: string;
        infoLink?: string;
        industryIdentifiers?: Array<{ type: string; identifier: string }>;
        imageLinks?: ImageLinks;
    };
};

type GoogleBooksResponse = { items?: GoogleBooksVolume[] };

function toHttps(url?: string): string | null {
    if (!url) return null;
    return url.replace(/^http:\/\//, "https://");
}

function pickBestImage(links?: ImageLinks): string | null {
    if (!links) return null;
    return toHttps(
        links.extraLarge ??
            links.large ??
            links.medium ??
            links.small ??
            links.thumbnail ??
            links.smallThumbnail,
    );
}

function volumeToSummary(item: GoogleBooksVolume): BookSummary {
    const info = item.volumeInfo ?? {};
    return {
        googleId: item.id,
        title: info.title ?? null,
        authors: info.authors?.join(", ") ?? null,
        categories: info.categories?.join(", ") ?? null,
        thumbnail: pickBestImage(info.imageLinks),
        rating: info.averageRating ?? null,
    };
}

function volumeToDetail(item: GoogleBooksVolume): BookDetail {
    const info = item.volumeInfo ?? {};
    const isbn13 =
        info.industryIdentifiers?.find((i) => i.type === "ISBN_13")?.identifier ?? null;
    const isbn10 =
        info.industryIdentifiers?.find((i) => i.type === "ISBN_10")?.identifier ?? null;
    return {
        ...volumeToSummary(item),
        description: info.description ?? null,
        publisher: info.publisher ?? null,
        publishedDate: info.publishedDate ?? null,
        pageCount: info.pageCount ?? null,
        isbn13,
        isbn10,
        ratingsCount: info.ratingsCount ?? null,
        previewLink: toHttps(info.previewLink) ?? null,
        infoLink: toHttps(info.infoLink) ?? null,
        language: info.language ?? null,
    };
}

const FIELD_PREFIX_RE = /\b(intitle|inauthor|isbn|subject|inpublisher):/i;

function preprocessQuery(raw: string): string {
    const trimmed = raw.trim();
    if (!trimmed) return trimmed;
    if (FIELD_PREFIX_RE.test(trimmed)) return trimmed;
    const stripped = trimmed.replace(/["']/g, "");
    return `"${stripped}"`;
}

function normalizeForDedup(s: string | null): string {
    return (s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function firstAuthor(authors: string | null): string {
    return authors?.split(",")[0]?.trim() ?? "";
}

function score(b: BookSummary): number {
    return (b.thumbnail ? 10 : 0) + (b.rating ?? 0);
}

function dedupAndRank(items: BookSummary[]): BookSummary[] {
    const seen = new Map<string, BookSummary>();
    for (const item of items) {
        if (!item.title) continue;
        const key = `${normalizeForDedup(item.title)}|${normalizeForDedup(firstAuthor(item.authors))}`;
        const existing = seen.get(key);
        if (!existing || score(item) > score(existing)) {
            seen.set(key, item);
        }
    }
    return Array.from(seen.values()).sort((a, b) => {
        const thumbDiff = (b.thumbnail ? 1 : 0) - (a.thumbnail ? 1 : 0);
        if (thumbDiff !== 0) return thumbDiff;
        return (b.rating ?? 0) - (a.rating ?? 0);
    });
}

async function fetchVolumes(
    query: string,
    limit: number,
    startIndex = 0,
): Promise<GoogleBooksVolume[]> {
    const params = new URLSearchParams({
        q: query,
        maxResults: String(limit),
        startIndex: String(startIndex),
        printType: "books",
        orderBy: "relevance",
    });
    const key = process.env.GOOGLE_BOOKS_API_KEY;
    if (key) params.set("key", key);

    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?${params}`, {
        headers: { accept: "application/json" },
    });
    if (!res.ok) throw new Error(`Google Books API ${res.status}`);
    const data = (await res.json()) as GoogleBooksResponse;
    return data.items ?? [];
}

async function performSearch(rawQuery: string): Promise<BookSummary[]> {
    const query = preprocessQuery(rawQuery);
    if (!query) return [];
    const items = await fetchVolumes(query, 40);
    return dedupAndRank(items.map(volumeToSummary));
}

async function performDetailFetch(googleId: string): Promise<BookDetail | null> {
    const params = new URLSearchParams();
    const key = process.env.GOOGLE_BOOKS_API_KEY;
    if (key) params.set("key", key);
    const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(googleId)}?${params}`,
        { headers: { accept: "application/json" } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as GoogleBooksVolume;
    return volumeToDetail(data);
}

async function performNytResolve(title: string, author: string): Promise<BookSummary | null> {
    const cleanTitle = title.replace(/"/g, "").trim();
    const cleanAuthor = author.replace(/"/g, "").split(/[,&]|\band\b/i)[0]!.trim();
    const query = `intitle:"${cleanTitle}"${cleanAuthor ? ` inauthor:"${cleanAuthor}"` : ""}`;
    const items = await fetchVolumes(query, 10);
    if (items.length === 0) return null;
    return dedupAndRank(items.map(volumeToSummary))[0] ?? null;
}

export const searchGoogleBooks = unstable_cache(performSearch, ["google-books-search-v2"], {
    revalidate: 600,
    tags: ["google-books"],
});

export const getGoogleBookDetail = unstable_cache(performDetailFetch, ["google-books-detail-v1"], {
    revalidate: 60 * 60 * 24,
    tags: ["google-books"],
});

export const resolveNytBook = unstable_cache(performNytResolve, ["google-books-nyt-v1"], {
    revalidate: 60 * 60 * 24 * 7,
    tags: ["google-books"],
});
