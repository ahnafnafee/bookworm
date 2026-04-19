import "server-only";

import { hash, verify } from "@node-rs/argon2";

// Argon2id is the default algorithm for @node-rs/argon2.
const OPTIONS = {
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
} as const;

export function hashSecret(secret: string): Promise<string> {
    return hash(secret, OPTIONS);
}

export function verifySecret(stored: string, secret: string): Promise<boolean> {
    return verify(stored, secret);
}
