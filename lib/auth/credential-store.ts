type PasswordCredentialCtor = new (data: {
    id: string;
    password: string;
    name?: string;
}) => Credential;

declare global {
    interface Window {
        PasswordCredential?: PasswordCredentialCtor;
    }
}

export async function savePasswordCredential(
    rawAccountNumber: string,
    displayName?: string | null,
): Promise<void> {
    if (typeof window === "undefined") return;
    const Ctor = window.PasswordCredential;
    if (!Ctor || !navigator.credentials?.store) return;
    try {
        const cred = new Ctor({
            id: displayName?.trim() || "Bookworm account",
            password: rawAccountNumber.replace(/\s/g, ""),
            name: "Bookworm",
        });
        await navigator.credentials.store(cred);
    } catch (err) {
        console.warn("[credential-store] failed:", err);
    }
}
