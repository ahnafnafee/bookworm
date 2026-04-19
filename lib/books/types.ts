export type BookSummary = {
    googleId: string;
    title: string | null;
    authors: string | null;
    thumbnail: string | null;
    categories: string | null;
    rating: number | null;
};

export type BookDetail = BookSummary & {
    description: string | null;
    publisher: string | null;
    publishedDate: string | null;
    pageCount: number | null;
    isbn13: string | null;
    isbn10: string | null;
    ratingsCount: number | null;
    previewLink: string | null;
    infoLink: string | null;
    language: string | null;
};

export type NytBestSeller = {
    title: string;
    author: string;
    description: string;
    bookImage: string | null;
    amazonUrl: string | null;
    rank: number;
};
