"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface CreateBlogInput {
    brand_id: string;
    title: string;
    slug: string;
    content: any;
    excerpt?: string | null;
    featured_image?: string | null;
    is_published?: boolean;
}

export async function createBlog(input: CreateBlogInput) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { data: null, error: "Unauthorized" };
    }

    const { data, error } = await supabase
        .from("blogs")
        .insert({
            user_id: user.id,
            brand_id: input.brand_id,
            title: input.title,
            slug: input.slug,
            content: input.content,
            excerpt: input.excerpt,
            featured_image: input.featured_image,
            is_published: input.is_published ?? false,
        })
        .select()
        .single();

    if (error) {
        console.error("Create blog error:", error);
        return { data: null, error: error.message };
    }

    revalidatePath("/dashboard/blogs");
    revalidatePath(`/dashboard/brands/${input.brand_id}`);
    return { data, error: null };
}

export async function updateBlog(id: string, updates: Partial<CreateBlogInput>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { data: null, error: "Unauthorized" };
    }

    const { data, error } = await supabase
        .from("blogs")
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

    if (error) {
        console.error("Update blog error:", error);
        return { data: null, error: error.message };
    }

    revalidatePath("/dashboard/blogs");
    revalidatePath(`/dashboard/blogs/${id}`);
    return { data, error: null };
}

export async function deleteBlog(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    const { error } = await supabase
        .from("blogs")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) {
        console.error("Delete blog error:", error);
        return { error: error.message };
    }

    revalidatePath("/dashboard/blogs");
    return { error: null };
}

export async function getBlogs(brandId?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { data: [], error: "Unauthorized" };
    }

    let query = supabase
        .from("blogs")
        .select(`
            *,
            brands (
                name
            )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (brandId) {
        query = query.eq("brand_id", brandId);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Get blogs error:", error);
        return { data: [], error: error.message };
    }

    return { data: data ?? [], error: null };
}

export async function getBlog(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { data: null, error: "Unauthorized" };
    }

    const { data, error } = await supabase
        .from("blogs")
        .select(`
            *,
            brands (
                name
            )
        `)
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (error) {
        console.error("Get blog error:", error);
        return { data: null, error: error.message };
    }

    return { data, error: null };
}

export async function getBlogBySlug(brandId: string, slug: string) {
    const supabase = await createClient();
    try {
        const { data, error } = await supabase
            .from("blogs")
            .select("*, brand:brands(*)")
            .eq("brand_id", brandId)
            .eq("slug", slug)
            .eq("is_published", true)
            .maybeSingle();

        if (error) throw error;
        return { data, error: null };
    } catch (error: any) {
        console.error("getBlogBySlug error:", error);
        return { data: null, error: error.message };
    }
}

export async function getPublicBlogs(brandId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("blogs")
        .select("id, title, slug, excerpt, featured_image, created_at, brand_id")
        .eq("brand_id", brandId)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("getPublicBlogs error:", error);
        return { data: [], error: error.message };
    }
    return { data: data || [], error: null };
}
