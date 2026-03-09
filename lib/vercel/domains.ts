const VERCEL_API_BASE = "https://api.vercel.com";

function getHeaders(): HeadersInit {
    const token = process.env.VERCEL_API_TOKEN;
    if (!token) throw new Error("VERCEL_API_TOKEN is not configured");
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
}

function teamQuery(): string {
    const teamId = process.env.VERCEL_TEAM_ID;
    return teamId ? `?teamId=${teamId}` : "";
}

function projectId(): string {
    const id = process.env.VERCEL_PROJECT_ID;
    if (!id) throw new Error("VERCEL_PROJECT_ID is not configured");
    return id;
}

export interface VercelDomainResponse {
    name: string;
    apexName: string;
    projectId: string;
    verified: boolean;
    verification?: Array<{
        type: string;
        domain: string;
        value: string;
        reason: string;
    }>;
    error?: { code: string; message: string };
}

export interface VercelDomainConfig {
    configuredBy: "CNAME" | "A" | null;
    acceptedChallenges?: string[];
    misconfigured: boolean;
}

/**
 * Register a domain with the Vercel project so it can receive traffic.
 * This must be called in addition to the user pointing DNS records.
 */
export async function addDomainToVercel(domain: string): Promise<{ data: VercelDomainResponse | null; error: string | null }> {
    try {
        const res = await fetch(
            `${VERCEL_API_BASE}/v10/projects/${projectId()}/domains${teamQuery()}`,
            {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ name: domain }),
            }
        );

        const body = await res.json();

        if (!res.ok) {
            if (body?.error?.code === "domain_already_in_use") {
                return { data: null, error: `Domain "${domain}" is already in use by another Vercel project.` };
            }
            return { data: null, error: body?.error?.message || `Vercel API error (${res.status})` };
        }

        return { data: body as VercelDomainResponse, error: null };
    } catch (err) {
        console.error("addDomainToVercel error:", err);
        return { data: null, error: (err as Error).message };
    }
}

/**
 * Remove a domain from the Vercel project.
 */
export async function removeDomainFromVercel(domain: string): Promise<{ error: string | null }> {
    try {
        const res = await fetch(
            `${VERCEL_API_BASE}/v9/projects/${projectId()}/domains/${encodeURIComponent(domain)}${teamQuery()}`,
            {
                method: "DELETE",
                headers: getHeaders(),
            }
        );

        if (!res.ok && res.status !== 404) {
            const body = await res.json().catch(() => null);
            return { error: body?.error?.message || `Vercel API error (${res.status})` };
        }

        return { error: null };
    } catch (err) {
        console.error("removeDomainFromVercel error:", err);
        return { error: (err as Error).message };
    }
}

/**
 * Check domain configuration status on Vercel (SSL, DNS config).
 */
export async function getVercelDomainConfig(domain: string): Promise<{ data: VercelDomainConfig | null; error: string | null }> {
    try {
        const res = await fetch(
            `${VERCEL_API_BASE}/v6/domains/${encodeURIComponent(domain)}/config${teamQuery()}`,
            {
                method: "GET",
                headers: getHeaders(),
            }
        );

        if (!res.ok) {
            const body = await res.json().catch(() => null);
            return { data: null, error: body?.error?.message || `Vercel API error (${res.status})` };
        }

        const body = await res.json();
        return {
            data: {
                configuredBy: body.configuredBy ?? null,
                acceptedChallenges: body.acceptedChallenges,
                misconfigured: body.misconfigured ?? false,
            },
            error: null,
        };
    } catch (err) {
        console.error("getVercelDomainConfig error:", err);
        return { data: null, error: (err as Error).message };
    }
}

/**
 * Get the current domain registration info from the Vercel project.
 */
export async function getVercelProjectDomain(domain: string): Promise<{ data: VercelDomainResponse | null; error: string | null }> {
    try {
        const res = await fetch(
            `${VERCEL_API_BASE}/v9/projects/${projectId()}/domains/${encodeURIComponent(domain)}${teamQuery()}`,
            {
                method: "GET",
                headers: getHeaders(),
            }
        );

        if (res.status === 404) {
            return { data: null, error: null };
        }

        if (!res.ok) {
            const body = await res.json().catch(() => null);
            return { data: null, error: body?.error?.message || `Vercel API error (${res.status})` };
        }

        const body = await res.json();
        return { data: body as VercelDomainResponse, error: null };
    } catch (err) {
        console.error("getVercelProjectDomain error:", err);
        return { data: null, error: (err as Error).message };
    }
}

// ─── Domain Pair Helpers ──────────────────────────────────────────────────────

/**
 * Given any domain input, return the apex and www variant.
 * The "primary" is whatever the user typed; the "secondary" is the counterpart.
 */
export function getDomainPair(domain: string): { primary: string; secondary: string; apex: string; www: string } {
    const clean = domain.toLowerCase().replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
    const isWww = clean.startsWith("www.");
    const apex = isWww ? clean.slice(4) : clean;
    const www = `www.${apex}`;
    return {
        primary: clean,
        secondary: isWww ? apex : www,
        apex,
        www,
    };
}

/**
 * Register both apex and www domains with Vercel.
 * The primary domain is added first, then the secondary is added with a redirect
 * to the primary so visitors hitting either URL reach the same destination.
 */
export async function addDomainPairToVercel(domain: string): Promise<{
    registered: string[];
    errors: string[];
}> {
    const { primary, secondary } = getDomainPair(domain);
    const registered: string[] = [];
    const errors: string[] = [];

    const addOne = async (name: string, redirect?: string) => {
        const existing = await getVercelProjectDomain(name);
        if (existing.data) {
            registered.push(name);
            return;
        }

        const body: Record<string, string> = { name };
        if (redirect) body.redirect = redirect;

        try {
            const res = await fetch(
                `${VERCEL_API_BASE}/v10/projects/${projectId()}/domains${teamQuery()}`,
                {
                    method: "POST",
                    headers: getHeaders(),
                    body: JSON.stringify(body),
                }
            );
            const json = await res.json();

            if (!res.ok) {
                if (json?.error?.code === "domain_already_in_use") {
                    errors.push(`"${name}" is already in use by another Vercel project.`);
                } else {
                    errors.push(`${name}: ${json?.error?.message || `Vercel API error (${res.status})`}`);
                }
                return;
            }
            registered.push(name);
        } catch (err) {
            errors.push(`${name}: ${(err as Error).message}`);
        }
    };

    // Primary first (no redirect)
    await addOne(primary);
    // Secondary redirects to primary
    await addOne(secondary, primary);

    return { registered, errors };
}

/**
 * Remove both apex and www domains from the Vercel project.
 */
export async function removeDomainPairFromVercel(domain: string): Promise<{ errors: string[] }> {
    const { apex, www } = getDomainPair(domain);
    const errors: string[] = [];

    for (const d of [apex, www]) {
        const result = await removeDomainFromVercel(d);
        if (result.error) {
            errors.push(`${d}: ${result.error}`);
        }
    }

    return { errors };
}

/**
 * Trigger domain verification on Vercel (after DNS is configured).
 */
export async function verifyDomainOnVercel(domain: string): Promise<{ data: VercelDomainResponse | null; error: string | null }> {
    try {
        const res = await fetch(
            `${VERCEL_API_BASE}/v9/projects/${projectId()}/domains/${encodeURIComponent(domain)}/verify${teamQuery()}`,
            {
                method: "POST",
                headers: getHeaders(),
            }
        );

        const body = await res.json();

        if (!res.ok) {
            return { data: null, error: body?.error?.message || `Vercel API error (${res.status})` };
        }

        return { data: body as VercelDomainResponse, error: null };
    } catch (err) {
        console.error("verifyDomainOnVercel error:", err);
        return { data: null, error: (err as Error).message };
    }
}
