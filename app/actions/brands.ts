"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { CreateBrandSchema, type CreateBrandInput } from "@/lib/schemas/brands";

// ─── Internal Helpers ─────────────────────────────────────────────────────────

async function uploadImage(
    dataUrl: string,
    path: string
): Promise<{ url: string | null; error: string | null }> {
    const supabase = await createClient();
    try {
        const [meta, base64] = dataUrl.split(",");
        if (!base64) throw new Error("Invalid image data");

        const mimeMatch = meta.match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";

        // Basic security check on mime type
        if (!mime.startsWith("image/")) {
            throw new Error("Invalid file type. Only images are allowed.");
        }

        const ext = mime.split("/")[1] ?? "jpg";
        const buffer = Buffer.from(base64, "base64");

        // Size limit: 5MB
        if (buffer.length > 5 * 1024 * 1024) {
            throw new Error("Image too large. Max size is 5MB.");
        }

        const filePath = `${path}.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from("brand-images")
            .upload(filePath, buffer, {
                contentType: mime,
                upsert: true,
                cacheControl: '3600'
            });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("brand-images").getPublicUrl(filePath);
        return { url: data.publicUrl, error: null };
    } catch (err: unknown) {
        const error = err as Error;
        console.error("Image upload error:", error);
        return { url: null, error: error.message };
    }
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function createBrand(rawInput: CreateBrandInput) {
    const supabase = await createClient();

    // 1. Initial auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { data: null, error: "Unauthorized: Please sign in to create a brand." };
    }

    // 2. Validate input
    const validation = CreateBrandSchema.safeParse(rawInput);
    if (!validation.success) {
        return { data: null, error: validation.error.issues[0].message };
    }
    const input = validation.data;

    const userId = user.id;
    const slug = `${userId}/${Date.now()}`;

    // 3. Optional image uploads
    try {
        const [logoResult, bannerResult] = await Promise.all([
            input.logoFile ? uploadImage(input.logoFile, `${slug}/logo`) : Promise.resolve({ url: null, error: null }),
            input.bannerFile ? uploadImage(input.bannerFile, `${slug}/banner`) : Promise.resolve({ url: null, error: null }),
        ]);

        if (logoResult.error) return { data: null, error: `Logo upload failed: ${logoResult.error}` };
        if (bannerResult.error) return { data: null, error: `Banner upload failed: ${bannerResult.error}` };

        // 4. Database insertion
        const { data, error } = await supabase
            .from("brands")
            .insert({
                user_id: userId,
                name: input.name,
                description: input.description ?? null,
                verticals: input.verticals ?? [],
                logo_url: logoResult.url,
                banner_url: bannerResult.url,
            })
            .select()
            .single();

        if (error) {
            console.error("Create brand error:", error);
            return { data: null, error: error.message };
        }

        // 5. Success side effects
        // Create default pages for the brand: index, blogs, privacy
        try {
            const { createDefaultBrandPages } = await import("./pages");
            await createDefaultBrandPages(data.id);
        } catch (pageErr) {
            console.error("Failed to create default brand pages:", pageErr);
            // We don't fail the whole brand creation if pages fail, but we log it
        }

        revalidatePath("/dashboard/brands");
        return { data, error: null };
    } catch (err: unknown) {
        console.error("createBrand exception:", err);
        return { data: null, error: "An unexpected error occurred." };
    }
}

export async function updateBrand(brandId: string, rawUpdates: Partial<CreateBrandInput>) {
    const supabase = await createClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: null, error: "Unauthorized" };

        const { data: existingBrand } = await supabase
            .from("brands")
            .select("custom_domain")
            .eq("id", brandId)
            .single();

        const oldDomain = existingBrand?.custom_domain || null;
        const newDomain = rawUpdates.custom_domain || null;
        const domainChanged = oldDomain !== newDomain;
        let vercelRegistered = false;
        let vercelSkipped = false;

        if (newDomain && !hasVercelConfig()) {
            vercelSkipped = true;
        }

        if (hasVercelConfig()) {
            const { addDomainPairToVercel, removeDomainPairFromVercel } = await import("@/lib/vercel/domains");

            if (domainChanged && oldDomain) {
                const removeResult = await removeDomainPairFromVercel(oldDomain);
                if (removeResult.errors.length) {
                    console.error("Failed to remove old domain pair from Vercel:", removeResult.errors);
                }
            }

            if (newDomain) {
                const pairResult = await addDomainPairToVercel(newDomain);
                if (pairResult.errors.length && !pairResult.registered.length) {
                    return { data: null, error: `Domain registration failed: ${pairResult.errors.join("; ")}` };
                }
                if (pairResult.registered.length) {
                    vercelRegistered = true;
                }
                if (pairResult.errors.length) {
                    console.warn("Partial domain pair registration:", pairResult.errors);
                }
            }
        }

        const updatePayload: Record<string, unknown> = {
                name: rawUpdates.name,
                description: rawUpdates.description,
                verticals: rawUpdates.verticals,
                custom_domain: rawUpdates.custom_domain,
                subdomain: rawUpdates.subdomain,
                seo_title: rawUpdates.seo_title,
                seo_description: rawUpdates.seo_description,
                og_image_url: rawUpdates.og_image_url || null,
                updated_at: new Date().toISOString()
        };
        if (rawUpdates.logo_url !== undefined) {
            updatePayload.logo_url = rawUpdates.logo_url || null;
        }
        if (rawUpdates.header_config !== undefined) {
            updatePayload.header_config = rawUpdates.header_config;
        }

        const { data, error } = await supabase
            .from("brands")
            .update(updatePayload)
            .eq("id", brandId)
            .select()
            .single();

        if (error) throw error;

        revalidatePath(`/dashboard/brands/${brandId}`);
        revalidatePath("/dashboard/brands");

        return { data, error: null, vercelRegistered, vercelSkipped };
    } catch (error: unknown) {
        const err = error as Error;
        console.error("updateBrand error:", err);
        return { data: null, error: err.message };
    }
}

export async function getBrands() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { data: [], error: "Unauthorized" };
    }

    const { data, error } = await supabase
        .from("brands")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Get brands error:", error);
        return { data: [], error: error.message };
    }

    return { data: data ?? [], error: null };
}

export async function getBrand(brandId: string) {
    const supabase = await createClient();
    try {
        const { data, error } = await supabase
            .from("brands")
            .select("*")
            .eq("id", brandId)
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error: unknown) {
        const err = error as Error;
        console.error("getBrand error:", err);
        return { data: null, error: err.message };
    }
}

export async function getBrandByDomain(host: string) {
    const supabase = await createClient();
    try {
        const cleanHost = host.toLowerCase().trim();
        const domainsToTry = [cleanHost];

        if (cleanHost.startsWith('www.')) {
            domainsToTry.push(cleanHost.replace(/^www\./, ''));
        } else {
            domainsToTry.push(`www.${cleanHost}`);
        }

        // Try custom domains first (both variants)
        const { data: customData } = await supabase
            .from("brands")
            .select("*")
            .in("custom_domain", domainsToTry)
            .single();

        if (customData) return { data: customData, error: null };

        // Try subdomain if host matches .genesisflow.io
        if (cleanHost.endsWith(".genesisflow.io")) {
            const subdomain = cleanHost.replace(".genesisflow.io", "").toLowerCase();
            const { data: subData } = await supabase
                .from("brands")
                .select("*")
                .eq("subdomain", subdomain)
                .single();
            if (subData) return { data: subData, error: null };
        }

        return { data: null, error: "Brand not found" };
    } catch (error: unknown) {
        const err = error as Error;
        console.error("getBrandByDomain error:", err);
        return { data: null, error: err.message };
    }
}

export async function updateBrandHeaderConfig(brandId: string, headerConfig: Record<string, unknown>) {
    const supabase = await createClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: null, error: "Unauthorized" };

        const { data, error } = await supabase
            .from("brands")
            .update({
                header_config: headerConfig,
                updated_at: new Date().toISOString()
            })
            .eq("id", brandId)
            .select()
            .single();

        if (error) throw error;

        revalidatePath(`/dashboard/brands/${brandId}`);
        return { data, error: null };
    } catch (error: unknown) {
        const err = error as Error;
        console.error("updateBrandHeaderConfig error:", err);
        return { data: null, error: err.message };
    }
}

function hasVercelConfig(): boolean {
    return !!(process.env.VERCEL_API_TOKEN && process.env.VERCEL_PROJECT_ID);
}

export async function verifyDomainDNS(domain: string) {
    const cleanDomain = domain.toLowerCase()
        .replace(/^https?:\/\//, '')
        .split('/')[0]
        .split(':')[0]
        .replace(/^www\./, '');

    const dns = await import("node:dns/promises");
    const EXPECTED_A = "216.198.79.1";

    try {
        const results = {
            a: false,
            cname: false,
            detectedA: [] as string[],
            detectedCname: [] as string[],
            errors: [] as string[],
            vercel: null as {
                configured: boolean;
                misconfigured: boolean;
                verified: boolean;
            } | null,
        };

        // Check A record for Apex
        try {
            const addresses = await dns.resolve4(cleanDomain);
            results.detectedA = addresses;
            results.a = addresses.includes(EXPECTED_A);
        } catch (e: unknown) {
            const err = e as { code?: string; message: string };
            if (err.code !== 'ENODATA' && err.code !== 'ENOTFOUND') {
                results.errors.push(`Apex A record lookup failed: ${err.message}`);
            }
        }

        // Check A record for WWW (www is a 308 redirect in Vercel — same A record as apex)
        const wwwDomain = `www.${cleanDomain}`;
        try {
            const wwwAddresses = await dns.resolve4(wwwDomain);
            results.detectedCname = wwwAddresses;
            results.cname = wwwAddresses.includes(EXPECTED_A);
        } catch (e: unknown) {
            const err = e as { code?: string; message: string };
            if (err.code !== 'ENODATA' && err.code !== 'ENOTFOUND') {
                results.errors.push(`WWW lookup failed: ${err.message}`);
            }
        }

        // Check Vercel platform status for both apex and www
        if (hasVercelConfig()) {
            try {
                const { getVercelDomainConfig, getVercelProjectDomain, verifyDomainOnVercel, getDomainPair } = await import("@/lib/vercel/domains");

                const domainToCheck = domain.toLowerCase().replace(/^https?:\/\//, '').split('/')[0].split(':')[0];
                const { apex, www } = getDomainPair(domainToCheck);

                const [apexConfig, apexDomain, wwwConfig, wwwDomain] = await Promise.all([
                    getVercelDomainConfig(apex),
                    getVercelProjectDomain(apex),
                    getVercelDomainConfig(www),
                    getVercelProjectDomain(www),
                ]);

                const apexConfigured = apexConfig.data?.configuredBy !== null && !(apexConfig.data?.misconfigured);
                const wwwConfigured = wwwConfig.data?.configuredBy !== null && !(wwwConfig.data?.misconfigured);
                const anyMisconfigured = (apexConfig.data?.misconfigured ?? false) || (wwwConfig.data?.misconfigured ?? false);

                let apexVerified = apexDomain.data?.verified ?? false;
                let wwwVerified = wwwDomain.data?.verified ?? false;

                // Auto-trigger verification if DNS is pointing correctly
                if (!apexVerified && results.a && apexDomain.data) {
                    const v = await verifyDomainOnVercel(apex);
                    apexVerified = v.data?.verified ?? false;
                }
                if (!wwwVerified && results.cname && wwwDomain.data) {
                    const v = await verifyDomainOnVercel(www);
                    wwwVerified = v.data?.verified ?? false;
                }

                results.vercel = {
                    configured: (apexConfigured || wwwConfigured) && !anyMisconfigured,
                    misconfigured: anyMisconfigured,
                    verified: apexVerified && wwwVerified,
                };

                if (anyMisconfigured) {
                    results.errors.push("Vercel reports one or both domain variants are misconfigured. Double-check your A records.");
                }

                // Surface verification challenges for whichever domain still needs it
                for (const [label, domainResult] of [["Apex", apexDomain], ["WWW", wwwDomain]] as const) {
                    const dr = domainResult as typeof apexDomain;
                    const isVerified = label === "Apex" ? apexVerified : wwwVerified;
                    if (!isVerified && dr.data?.verification?.length) {
                        const challenge = dr.data.verification[0];
                        results.errors.push(`${label} verification pending: Add a TXT record on "${challenge.domain}" with value "${challenge.value}".`);
                    }
                }
            } catch (vercelErr) {
                console.error("Vercel domain check failed (non-fatal):", vercelErr);
            }
        }

        return { data: results, error: null };
    } catch (error: unknown) {
        const err = error as Error;
        console.error("DNS verification error:", err);
        return { data: null, error: err.message };
    }
}
