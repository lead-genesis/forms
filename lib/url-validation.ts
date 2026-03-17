import { resolve } from "dns/promises";

/**
 * Validates that a webhook URL is safe to fetch from the server side.
 * Blocks private IPs, link-local, loopback, non-HTTP(S) schemes,
 * IPv6 private ranges, and cloud metadata endpoints.
 */
export function isAllowedWebhookUrl(raw: string): { ok: boolean; error?: string } {
    let url: URL;
    try {
        url = new URL(raw);
    } catch {
        return { ok: false, error: "Invalid URL" };
    }

    if (url.protocol !== "https:" && url.protocol !== "http:") {
        return { ok: false, error: "Only HTTP and HTTPS URLs are allowed" };
    }

    const hostname = url.hostname.toLowerCase();

    // Block localhost variants
    if (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "[::1]" ||
        hostname === "0.0.0.0"
    ) {
        return { ok: false, error: "Localhost URLs are not allowed" };
    }

    // Block private IPv4 ranges
    const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4Match) {
        const [, a, b] = ipv4Match.map(Number);
        if (
            a === 10 ||                          // 10.0.0.0/8
            (a === 172 && b >= 16 && b <= 31) ||  // 172.16.0.0/12
            (a === 192 && b === 168) ||            // 192.168.0.0/16
            (a === 169 && b === 254) ||            // 169.254.0.0/16 (link-local / cloud metadata)
            a === 127 ||                           // 127.0.0.0/8
            a === 0                                // 0.0.0.0/8
        ) {
            return { ok: false, error: "Private or reserved IP addresses are not allowed" };
        }
    }

    // Block IPv6 private/reserved ranges (bare or bracketed)
    const ipv6Raw = hostname.startsWith("[") ? hostname.slice(1, -1) : hostname;
    if (isPrivateIPv6(ipv6Raw)) {
        return { ok: false, error: "Private or reserved IP addresses are not allowed" };
    }

    // Block cloud metadata endpoints
    const blockedHosts = [
        "metadata.google.internal",
        "metadata.google.com",
        "metadata.azure.com",
        "instance-data.ec2.internal",
    ];
    if (blockedHosts.includes(hostname)) {
        return { ok: false, error: "Cloud metadata endpoints are not allowed" };
    }

    return { ok: true };
}

/**
 * Resolves the hostname to IP addresses and validates each one.
 * Call this before actually fetching to prevent DNS rebinding SSRF.
 */
export async function resolveAndValidate(raw: string): Promise<{ ok: boolean; error?: string }> {
    const staticCheck = isAllowedWebhookUrl(raw);
    if (!staticCheck.ok) return staticCheck;

    const url = new URL(raw);
    const hostname = url.hostname.replace(/^\[|\]$/g, "");

    // If it's already an IP literal, the static check is sufficient
    if (/^[\d.]+$/.test(hostname) || hostname.includes(":")) {
        return { ok: true };
    }

    try {
        const addresses = await resolve(hostname);
        for (const addr of addresses) {
            const ipCheck = isAllowedWebhookUrl(`${url.protocol}//${addr}/`);
            if (!ipCheck.ok) {
                return { ok: false, error: `Hostname resolves to blocked IP: ${addr}` };
            }
        }
    } catch {
        return { ok: false, error: "Could not resolve hostname" };
    }

    return { ok: true };
}

/** Check if an IPv6 address string is in a private/reserved range. */
function isPrivateIPv6(addr: string): boolean {
    if (!addr || !addr.includes(":")) return false;
    const normalized = addr.toLowerCase();
    return (
        normalized === "::1" ||                                    // loopback
        normalized === "::" ||                                     // unspecified
        normalized.startsWith("fc") || normalized.startsWith("fd") || // unique local (fc00::/7)
        normalized.startsWith("fe80") ||                           // link-local
        normalized.startsWith("::ffff:")                           // IPv4-mapped (e.g. ::ffff:127.0.0.1)
    );
}

/**
 * Options for safeFetch that prevent SSRF via redirects.
 * Use { redirect: "error" } or { redirect: "manual" } to prevent redirect-based bypasses.
 */
export const SAFE_FETCH_OPTIONS: RequestInit = {
    redirect: "error",
};
