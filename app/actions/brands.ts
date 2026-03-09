"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface CreateBrandInput {
    name: string;
    description?: string;
    verticals?: string[];
    logoFile?: string | null;
    bannerFile?: string | null;
    custom_domain?: string | null;
    subdomain?: string | null;
}

async function uploadImage(
    dataUrl: string,
    path: string
): Promise<string | null> {
    const supabase = await createClient();
    try {
        const [meta, base64] = dataUrl.split(",");
        const mimeMatch = meta.match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
        const ext = mime.split("/")[1] ?? "jpg";
        const buffer = Buffer.from(base64, "base64");
        const filePath = `${path}.${ext}`;

        const { error } = await supabase.storage
            .from("brand-images")
            .upload(filePath, buffer, { contentType: mime, upsert: true });

        if (error) {
            console.error("Image upload error:", error);
            return null;
        }

        const { data } = supabase.storage.from("brand-images").getPublicUrl(filePath);
        return data.publicUrl;
    } catch (err) {
        console.error("Image upload exception:", err);
        return null;
    }
}

export async function createBrand(input: CreateBrandInput) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { data: null, error: "Unauthorized: Please sign in to create a brand." };
    }

    const userId = user.id;
    const slug = `${userId}/${Date.now()}`;

    const [logoUrl, bannerUrl] = await Promise.all([
        input.logoFile ? uploadImage(input.logoFile, `${slug}/logo`) : Promise.resolve(null),
        input.bannerFile ? uploadImage(input.bannerFile, `${slug}/banner`) : Promise.resolve(null),
    ]);

    const { data, error } = await supabase
        .from("brands")
        .insert({
            user_id: userId,
            name: input.name,
            description: input.description ?? null,
            verticals: input.verticals ?? [],
            logo_url: logoUrl,
            banner_url: bannerUrl,
        })
        .select()
        .single();

    if (error) {
        console.error("Create brand error:", error);
        return { data: null, error: error.message };
    }

    // Create default pages for the brand: index, blogs, privacy
    const { createDefaultBrandPages } = await import("./pages");
    await createDefaultBrandPages(data.id);

    revalidatePath("/dashboard/brands");
    return { data, error: null };
}

export async function updateBrand(brandId: string, updates: Partial<CreateBrandInput>) {
    const supabase = await createClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        const { data, error } = await supabase
            .from("brands")
            .update({
                name: updates.name,
                description: updates.description,
                verticals: updates.verticals,
                custom_domain: updates.custom_domain,
                subdomain: updates.subdomain,
                updated_at: new Date().toISOString()
            })
            .eq("id", brandId)
            .select()
            .single();

        if (error) throw error;
        revalidatePath(`/dashboard/brands/${brandId}`);
        return { data, error: null };
    } catch (error: any) {
        console.error("updateBrand error:", error);
        return { data: null, error: error.message };
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
    } catch (error: any) {
        console.error("getBrand error:", error);
        return { data: null, error: error.message };
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
    } catch (error: any) {
        console.error("getBrandByDomain error:", error);
        return { data: null, error: error.message };
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
        } catch (e: any) {
            if (e.code !== 'ENODATA' && e.code !== 'ENOTFOUND') {
                results.errors.push(`Apex A record lookup failed: ${e.message}`);
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
        } catch (e: any) {
            if (e.code !== 'ENODATA' && e.code !== 'ENOTFOUND') {
                results.errors.push(`WWW lookup failed: ${e.message}`);
            }
        }

        return { data: results, error: null };
    } catch (error: any) {
        console.error("DNS verification error:", error);
        return { data: null, error: error.message };
    }
}
