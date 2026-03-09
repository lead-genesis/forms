"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getSupabase() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error("Unauthorized: You must be signed in.");
    }

    return { supabase, user };
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BrandPage {
    id: string;
    brand_id: string;
    title: string;
    slug: string;
    type: 'landing' | 'blog' | 'content';
    is_published: boolean;
    is_index?: boolean;
    background_color?: string;
    created_at: string;
    updated_at: string;
}

export interface BrandSection {
    id: string;
    page_id: string;
    type: 'hero' | 'features' | 'text' | 'blog_content' | 'form_embed' | 'header';
    data: any;
    order: number;
    created_at: string;
}

// ─── Pages ────────────────────────────────────────────────────────────────────

export async function getBrandPages(brandId: string) {
    try {
        const { supabase } = await getSupabase();
        const { data, error } = await supabase
            .from("brand_pages")
            .select("*")
            .eq("brand_id", brandId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return { data: data as BrandPage[], error: null };
    } catch (error: any) {
        console.error("getBrandPages error:", error);
        return { data: [], error: error.message };
    }
}

export async function getPageWithSections(pageId: string) {
    try {
        const { supabase } = await getSupabase();

        const { data: page, error: pageError } = await supabase
            .from("brand_pages")
            .select("*, brand:brands(*)")
            .eq("id", pageId)
            .single();

        if (pageError) throw pageError;

        const { data: sections, error: sectionsError } = await supabase
            .from("brand_sections")
            .select("*")
            .eq("page_id", pageId)
            .order("order", { ascending: true });

        if (sectionsError) throw sectionsError;

        return {
            data: {
                ...page,
                sections: sections as BrandSection[]
            },
            error: null
        };
    } catch (error: any) {
        console.error("getPageWithSections error:", error);
        return { data: null, error: error.message };
    }
}

export interface CreatePageOptions {
    slug?: string;
    is_index?: boolean;
}

export async function createPage(
    brandId: string,
    title: string,
    type: BrandPage['type'] = 'landing',
    options: CreatePageOptions = {}
) {
    try {
        const { supabase } = await getSupabase();

        let slug = options.slug;
        if (slug == null) {
            slug = title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
        }
        if (type === 'landing' && title.toLowerCase() === 'home') {
            slug = 'index';
        }
        const isIndex = options.is_index ?? (slug === 'index' && type === 'landing');

        const insertPayload: Record<string, unknown> = {
            brand_id: brandId,
            title,
            slug: slug || `page-${Date.now()}`,
            type,
            is_published: false
        };
        if (isIndex) {
            insertPayload.is_index = true;
        }

        const { data, error } = await supabase
            .from("brand_pages")
            .insert(insertPayload)
            .select()
            .single();

        if (error) throw error;

        // Seed basic sections based on type
        if (type === 'landing') {
            await supabase.from("brand_sections").insert([
                {
                    page_id: data.id,
                    type: 'hero',
                    data: { heading: 'Welcome to ' + title, subheading: 'Catchy subheading here', buttonText: 'Get Started' },
                    order: 0
                }
            ]);
        }

        revalidatePath(`/dashboard/brands/${brandId}`);
        return { data: data as BrandPage, error: null };
    } catch (error: any) {
        console.error("createPage error:", error);
        return { data: null, error: error.message };
    }
}

/** Creates the default pages for a new brand: index, blogs, blog-post template, privacy. */
export async function createDefaultBrandPages(brandId: string) {
    const defaults: { title: string; slug: string; type: BrandPage['type']; is_index?: boolean }[] = [
        { title: "Home", slug: "index", type: "landing", is_index: true },
        { title: "Blogs", slug: "blogs", type: "content" },
        { title: "Blog Post", slug: "blog-post", type: "blog" },
        { title: "Privacy", slug: "privacy", type: "content" }
    ];
    for (const d of defaults) {
        const { error } = await createPage(brandId, d.title, d.type, {
            slug: d.slug,
            is_index: d.is_index
        });
        if (error) {
            console.error("createDefaultBrandPages:", d.slug, error);
        }
    }
    return { error: null };
}

export async function updatePage(pageId: string, updates: Partial<BrandPage>) {
    try {
        const { supabase } = await getSupabase();
        const { data, error } = await supabase
            .from("brand_pages")
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq("id", pageId)
            .select()
            .single();

        if (error) throw error;
        return { data: data as BrandPage, error: null };
    } catch (error: any) {
        console.error("updatePage error:", error);
        return { data: null, error: error.message };
    }
}

/** Set a page as the brand index (home). Clears is_index on all other pages in the same brand so only one index exists per brand. */
export async function setPageAsIndex(pageId: string) {
    try {
        const { supabase } = await getSupabase();
        const { data: page, error: fetchError } = await supabase
            .from("brand_pages")
            .select("brand_id")
            .eq("id", pageId)
            .single();

        if (fetchError || !page) {
            return { data: null, error: "Page not found" };
        }

        const brandId = page.brand_id as string;

        const { error: clearError } = await supabase
            .from("brand_pages")
            .update({ is_index: false, updated_at: new Date().toISOString() })
            .eq("brand_id", brandId);

        if (clearError) {
            return { data: null, error: clearError.message };
        }

        const { data, error } = await supabase
            .from("brand_pages")
            .update({ is_index: true, updated_at: new Date().toISOString() })
            .eq("id", pageId)
            .select()
            .single();

        if (error) throw error;
        revalidatePath(`/dashboard/brands/${brandId}`);
        return { data: data as BrandPage, error: null };
    } catch (error: any) {
        console.error("setPageAsIndex error:", error);
        return { data: null, error: error.message };
    }
}

export async function uploadPageImage(pageId: string, dataUrl: string): Promise<{ url: string | null; error: string | null }> {
    try {
        const { supabase } = await getSupabase();

        const [meta, base64] = dataUrl.split(",");
        const mimeMatch = meta.match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
        const ext = mime.split("/")[1] ?? "jpg";
        const buffer = Buffer.from(base64, "base64");

        const fileName = `${pageId}/${Date.now()}.${ext}`;
        const filePath = `pages/${fileName}`;

        const { error } = await supabase.storage
            .from("brand-images")
            .upload(filePath, buffer, { contentType: mime, upsert: true });

        if (error) throw error;

        const { data } = supabase.storage.from("brand-images").getPublicUrl(filePath);
        return { url: data.publicUrl, error: null };
    } catch (err: any) {
        console.error("Page image upload error:", err);
        return { url: null, error: err.message || "Failed to upload image" };
    }
}

// ─── Sections ─────────────────────────────────────────────────────────────────

export async function createSection(pageId: string, type: BrandSection['type'], order: number) {
    try {
        const { supabase } = await getSupabase();
        const { data, error } = await supabase
            .from("brand_sections")
            .insert({
                page_id: pageId,
                type,
                data: {},
                order
            })
            .select()
            .single();

        if (error) throw error;
        return { data: data as BrandSection, error: null };
    } catch (error: any) {
        console.error("createSection error:", error);
        return { data: null, error: error.message };
    }
}

export async function updateSection(sectionId: string, updates: Partial<BrandSection>) {
    try {
        const { supabase } = await getSupabase();
        const { data, error } = await supabase
            .from("brand_sections")
            .update(updates)
            .eq("id", sectionId)
            .select()
            .single();

        if (error) throw error;
        return { data: data as BrandSection, error: null };
    } catch (error: any) {
        console.error("updateSection error:", error);
        return { data: null, error: error.message };
    }
}

export async function deleteSection(sectionId: string) {
    try {
        const { supabase } = await getSupabase();
        const { error } = await supabase
            .from("brand_sections")
            .delete()
            .eq("id", sectionId);

        if (error) throw error;
        return { error: null };
    } catch (error: any) {
        console.error("deleteSection error:", error);
        return { error: error.message };
    }
}

export async function reorderSections(updates: { id: string; order: number }[]) {
    try {
        const { supabase } = await getSupabase();

        const results = await Promise.all(
            updates.map(({ id, order }) =>
                supabase
                    .from("brand_sections")
                    .update({ order })
                    .eq("id", id)
            )
        );

        const firstError = results.find((r: any) => r.error);
        if (firstError?.error) throw firstError.error;

        return { error: null };
    } catch (error: any) {
        console.error("reorderSections error:", error);
        return { error: error.message };
    }
}
