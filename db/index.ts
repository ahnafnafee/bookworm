import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "./schema";

type Db = NeonHttpDatabase<typeof schema>;

let cached: Db | null = null;

function getDb(): Db {
    if (cached) return cached;
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error(
            "DATABASE_URL is not set. Provision Neon via the Vercel Marketplace and add it to .env.local.",
        );
    }
    const sql = neon(connectionString);
    cached = drizzle({ client: sql, schema, casing: "snake_case" });
    return cached;
}

export const db = new Proxy({} as Db, {
    get(_target, prop) {
        const real = getDb() as unknown as Record<PropertyKey, unknown>;
        const value = real[prop];
        return typeof value === "function" ? (value as (...a: unknown[]) => unknown).bind(real) : value;
    },
}) as Db;

export { schema };
