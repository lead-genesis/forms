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

        // Note: For partial updates, we might want a different schema or safeParse(updates) with some fields optional
        // simplified here but in a real enterprise app we'd be more granular
        const { data, error } = await supabase
            .from("brands")
            .update({
                name: rawUpdates.name,
                description: rawUpdates.description,
                verticals: rawUpdates.verticals,
                custom_domain: rawUpdates.custom_domain,
                subdomain: rawUpdates.subdomain,
                updated_at: new Date().toISOString()
            })
            .eq("id", brandId)
            .select()
            .single();

        if (error) throw error;

        revalidatePath(`/dashboard/brands/${brandId}`);
        revalidatePath("/dashboard/brands");

        return { data, error: null };
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
        .eq("user_id", user.id)
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

export async function verifyDomainDNS(domain: string) {
    // Basic sanitization: remove protocol and paths
    const cleanDomain = domain.toLowerCase()
        .replace(/^https?:\/\//, '')
        .split('/')[0]
        .split(':')[0]
        .replace(/^www\./, ''); // Get apex for checks

    const dns = await import("node:dns/promises");
    const EXPECTED_A = "76.76.21.21";
    const EXPECTED_CNAME = "cname.genesisflow.io";

    try {
        const results = {
            a: false,
            cname: false,
            detectedA: [] as string[],
            detectedCname: [] as string[],
            errors: [] as string[]
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

        // Check CNAME for WWW
        const wwwDomain = `www.${cleanDomain}`;
        try {
            // First check the CNAME record itself
            const cnames = await dns.resolveCname(wwwDomain);
            results.detectedCname = cnames;
            const cnameMatches = cnames.some(c => c === EXPECTED_CNAME || c.endsWith(EXPECTED_CNAME));

            // Then check ultimate resolution (follow the chain to the IP)
            const finalAddresses = await dns.resolve4(wwwDomain);
            const ipMatches = finalAddresses.includes(EXPECTED_A);

            // Verified only if BOTH the name matches and it points to our IP
            results.cname = cnameMatches && ipMatches;

            if (cnameMatches && !ipMatches) {
                results.errors.push(`WWW points to ${EXPECTED_CNAME} but that domain is currently misconfigured (points to incorrect IP ${finalAddresses[0]})`);
            }
        } catch (e: unknown) {
            const err = e as { code?: string; message: string };
            if (err.code !== 'ENODATA' && err.code !== 'ENOTFOUND') {
                results.errors.push(`WWW lookup failed: ${err.message}`);
            }
        }

        return { data: results, error: null };
    } catch (error: unknown) {
        const err = error as Error;
        console.error("DNS verification error:", err);
        return { data: null, error: err.message };
    }
}
