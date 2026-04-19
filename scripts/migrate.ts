import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";

try {
    process.loadEnvFile(".env.local");
} catch {
    /* env is already loaded */
}

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
    console.error("DATABASE_URL_UNPOOLED or DATABASE_URL must be set");
    process.exit(1);
}

const sql = neon(url);
const dir = "./db/migrations";
const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

for (const file of files) {
    const content = readFileSync(join(dir, file), "utf8");
    const statements = content
        .split("--> statement-breakpoint")
        .map((s) => s.trim())
        .filter(Boolean);
    console.log(`\n→ ${file} (${statements.length} statements)`);
    for (const stmt of statements) {
        try {
            await sql.query(stmt);
            const first = stmt.split("\n")[0]?.slice(0, 72) ?? "";
            console.log(`  ✓ ${first}`);
        } catch (err: unknown) {
            const msg = (err as Error).message;
            if (msg.includes("already exists")) {
                const first = stmt.split("\n")[0]?.slice(0, 72) ?? "";
                console.log(`  ⏭  skipped (exists): ${first}`);
            } else {
                throw err;
            }
        }
    }
}
console.log("\n✔ migrations applied");
