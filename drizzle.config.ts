import { defineConfig } from "drizzle-kit";

try {
    process.loadEnvFile(".env.local");
} catch {
    // .env.local is optional; Vercel CI sets env vars directly.
}

const migrationsUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!migrationsUrl) {
    throw new Error(
        "DATABASE_URL_UNPOOLED (preferred) or DATABASE_URL must be set for drizzle-kit.",
    );
}

export default defineConfig({
    schema: "./db/schema.ts",
    out: "./db/migrations",
    dialect: "postgresql",
    casing: "snake_case",
    dbCredentials: { url: migrationsUrl },
    verbose: true,
    strict: true,
});
