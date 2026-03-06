"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function getClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

export interface CreateBrandInput {
    name: string;
    description?: string;
    verticals?: string[];
    logoFile?: string | null;
    bannerFile?: string | null;
    userId?: string;
}

async function uploadImage(
    dataUrl: string,
    path: string
): Promise<string | null> {
    const supabase = getClient();
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

// Demo user id — replace with auth.uid() when Supabase auth is wired up
const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function createBrand(input: CreateBrandInput) {
    const supabase = getClient();
    const userId = input.userId ?? DEMO_USER_ID;
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

    return { data, error: null };
}

export async function getBrands(userId?: string) {
    const supabase = getClient();
    const uid = userId ?? DEMO_USER_ID;

    const { data, error } = await supabase
        .from("brands")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Get brands error:", error);
        return { data: [], error: error.message };
    }

    return { data: data ?? [], error: null };
}
