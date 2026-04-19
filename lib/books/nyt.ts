import "server-only";

import { unstable_cache } from "next/cache";

import type { NytBestSeller } from "./types";

type NytResponse = {
    results?: {
        books?: Array<{
            rank: number;
            title: string;
            author: string;
            description: string;
            book_image?: string;
            amazon_product_url?: string;
        }>;
    };
};

const NYT_LIST = "hardcover-fiction";

async function fetchBestSellers(): Promise<NytBestSeller[]> {
    const key = process.env.NYT_API_KEY;
    if (!key) {
        console.warn("NYT_API_KEY not set; best-sellers will be empty.");
        return [];
    }
    const url = `https://api.nytimes.com/svc/books/v3/lists/current/${NYT_LIST}.json?api-key=${encodeURIComponent(key)}`;
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) {
        console.error(`NYT API error ${res.status}`);
        return [];
    }
    const data = (await res.json()) as NytResponse;
    return (data.results?.books ?? []).map((b) => ({
        rank: b.rank,
        title: b.title,
        author: b.author,
        description: b.description,
        bookImage: b.book_image ?? null,
        amazonUrl: b.amazon_product_url ?? null,
    }));
}

export const getBestSellers = unstable_cache(fetchBestSellers, ["nyt-best-sellers-v2"], {
    revalidate: 24 * 60 * 60,
    tags: ["nyt"],
});
