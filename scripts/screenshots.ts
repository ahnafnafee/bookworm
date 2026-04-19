import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import puppeteer, { type Browser, type Page } from "puppeteer";

const BASE = process.env.SCREENSHOT_URL ?? "http://localhost:3000";
const OUT = resolve("public/images");

const DESKTOP = { width: 1440, height: 900, deviceScaleFactor: 2 };
const MOBILE = { width: 390, height: 844, deviceScaleFactor: 2 };

type Shot = {
    name: string;
    url: string;
    viewport: typeof DESKTOP;
    theme: "light" | "dark";
    waitMs?: number;
    fullPage?: boolean;
    setup?: (page: Page) => Promise<void>;
};

const SHOTS: Shot[] = [
    {
        name: "screenshot-landing-desktop-light",
        url: "/",
        viewport: DESKTOP,
        theme: "light",
        waitMs: 1500,
    },
    {
        name: "screenshot-landing-desktop-dark",
        url: "/",
        viewport: DESKTOP,
        theme: "dark",
        waitMs: 1500,
    },
    {
        name: "screenshot-landing-mobile-light",
        url: "/",
        viewport: MOBILE,
        theme: "light",
        waitMs: 1500,
    },
    {
        name: "screenshot-landing-mobile-dark",
        url: "/",
        viewport: MOBILE,
        theme: "dark",
        waitMs: 1500,
    },
    {
        name: "screenshot-auth-desktop-light",
        url: "/authenticate",
        viewport: DESKTOP,
        theme: "light",
        waitMs: 800,
    },
    {
        name: "screenshot-auth-desktop-dark",
        url: "/authenticate",
        viewport: DESKTOP,
        theme: "dark",
        waitMs: 800,
    },
];

async function withPage(
    browser: Browser,
    theme: "light" | "dark",
    viewport: typeof DESKTOP,
    fn: (page: Page) => Promise<void>,
) {
    const page = await browser.newPage();
    await page.emulateMediaFeatures([
        { name: "prefers-color-scheme", value: theme },
        { name: "prefers-reduced-motion", value: "reduce" },
    ]);
    await page.setViewport(viewport);
    // Seed localStorage so next-themes picks the right theme on first paint.
    await page.evaluateOnNewDocument((t) => {
        try {
            window.localStorage.setItem("theme", t);
        } catch {
            /* ignore */
        }
    }, theme);
    try {
        await fn(page);
    } finally {
        await page.close();
    }
}

async function run() {
    await mkdir(OUT, { recursive: true });
    const browser = await puppeteer.launch({ headless: true });
    try {
        for (const shot of SHOTS) {
            console.log(`→ ${shot.name}`);
            await withPage(browser, shot.theme, shot.viewport, async (page) => {
                await page.goto(`${BASE}${shot.url}`, { waitUntil: "networkidle0", timeout: 60_000 });
                if (shot.setup) await shot.setup(page);
                if (shot.waitMs) await new Promise((r) => setTimeout(r, shot.waitMs));
                const out = resolve(OUT, `${shot.name}.png`);
                await page.screenshot({
                    path: out as `${string}.png`,
                    fullPage: shot.fullPage ?? false,
                    type: "png",
                });
            });
        }
    } finally {
        await browser.close();
    }
    console.log(`\n✔ ${SHOTS.length} screenshots written to ${OUT}`);
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
