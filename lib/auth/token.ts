import "server-only";

import { randomInt } from "node:crypto";

export const TOKEN_DIGITS = 16;
export const TOKEN_LOOKUP_LENGTH = 6;

export function generateAccountNumber(): string {
    let out = "";
    for (let i = 0; i < TOKEN_DIGITS; i++) {
        out += randomInt(0, 10).toString();
    }
    return out;
}

export function splitToken(raw: string): { lookup: string; secret: string } {
    return {
        lookup: raw.slice(0, TOKEN_LOOKUP_LENGTH),
        secret: raw.slice(TOKEN_LOOKUP_LENGTH),
    };
}

export function formatAccountNumber(raw: string): string {
    const match = raw.match(/.{1,4}/g);
    return match ? match.join(" ") : raw;
}

export function normalizeAccountNumber(input: string): string | null {
    const digits = input.replace(/\D/g, "");
    return new RegExp(`^\\d{${TOKEN_DIGITS}}$`).test(digits) ? digits : null;
}
