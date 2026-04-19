import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    serverExternalPackages: ["@node-rs/argon2"],
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "books.google.com" },
            { protocol: "https", hostname: "books.googleusercontent.com" },
            { protocol: "https", hostname: "lh3.googleusercontent.com" },
            { protocol: "https", hostname: "storage.googleapis.com" },
            { protocol: "https", hostname: "*.nyt.com" },
            { protocol: "https", hostname: "static01.nyt.com" },
        ],
    },
};

export default nextConfig;
