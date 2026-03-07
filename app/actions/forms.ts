"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function getClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.error("Supabase environment variables are missing!");
        // We return a dummy client that will fail cleanly rather than crashing the process
        return createSupabaseClient("https://placeholder.supabase.co", "placeholder");
    }

    return createSupabaseClient(url, key);
}

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateFormInput {
    name: string;
    brand_id: string;
    userId?: string;
}

// ─── Forms ────────────────────────────────────────────────────────────────────

export async function createForm(input: CreateFormInput) {
    const supabase = getClient();
    const userId = input.userId ?? DEMO_USER_ID;

    const { data, error } = await supabase
        .from("forms")
        .insert({
            user_id: userId,
            brand_id: input.brand_id,
            name: input.name.trim() || "New Lead Form",
            status: "draft",
        })
        .select()
        .single();

    if (error) {
        console.error("Create form error:", error);
        return { data: null, error: error.message };
    }

    // Seed default Welcome + Thank You steps
    await supabase.from("form_steps").insert([
        {
            form_id: data.id,
            type: "welcome",
            title: "Welcome Page",
            data: {
                heading: "Welcome to our form",
                subheading: "Please fill out the details below",
                buttonText: "Get Started",
            },
            order: 0,
        },
        {
            form_id: data.id,
            type: "thank-you",
            title: "Thank You Page",
            data: {
                message: "Thanks for your submission!",
                subtext: "We'll be in touch soon.",
            },
            order: 1,
        },
    ]);

    return { data, error: null };
}


export async function getForms(userId?: string) {
    const supabase = getClient();
    const uid = userId ?? DEMO_USER_ID;

    const { data, error } = await supabase
        .from("forms")
        .select(`*, brands (id, name, logo_url)`)
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Get forms error:", error);
        return { data: [], error: error.message };
    }

    return { data: data ?? [], error: null };
}

/** Load a single form with its brand details (for the builder). */
export async function getFormWithBrand(formId: string) {
    const supabase = getClient();

    const { data, error } = await supabase
        .from("forms")
        .select(`
            *,
            brands (
                id,
                name,
                logo_url,
                banner_url
            )
        `)
        .eq("id", formId)
        .single();

    if (error) {
        console.error("Get form error:", error);
        return { data: null, error: error.message };
    }

    return { data, error: null };
}

/** Load a single form with its brand details by subdomain (for custom domains). */
export async function getFormBySubdomain(subdomain: string) {
    console.log("Fetching form by subdomain:", subdomain);
    const supabase = getClient();

    const { data, error } = await supabase
        .from("forms")
        .select(`
            *,
            brands (
                id,
                name,
                logo_url,
                banner_url
            )
        `)
        .eq("subdomain", subdomain)
        .single();

    if (error) {
        console.error("Get form by subdomain error:", error);
        return { data: null, error: error.message };
    }

    console.log("Successfully fetched form:", data.name);
    return { data, error: null };
}

// ─── Form Steps ───────────────────────────────────────────────────────────────

export async function getFormSteps(formId: string) {
    console.log("Fetching steps for form ID:", formId);
    const supabase = getClient();

    const { data, error } = await supabase
        .from("form_steps")
        .select("*")
        .eq("form_id", formId)
        .order("order", { ascending: true });

    if (error) {
        console.error("Get form steps error:", error);
        return { data: [], error: error.message };
    }

    console.log(`Successfully fetched ${data?.length ?? 0} steps`);
    return { data: data ?? [], error: null };
}

export interface CreateStepInput {
    formId: string;
    type: string;
    title: string;
    data: Record<string, any>;
    order: number;
}

export async function createStep(input: CreateStepInput) {
    const supabase = getClient();

    const { data, error } = await supabase
        .from("form_steps")
        .insert({
            form_id: input.formId,
            type: input.type,
            title: input.title,
            data: input.data,
            order: input.order,
        })
        .select()
        .single();

    if (error) {
        console.error("Create step error:", error);
        return { data: null, error: error.message };
    }

    return { data, error: null };
}

export interface UpdateStepInput {
    title?: string;
    data?: Record<string, any>;
    order?: number;
}

export async function updateStep(stepId: string, input: UpdateStepInput) {
    const supabase = getClient();

    const { data, error } = await supabase
        .from("form_steps")
        .update(input)
        .eq("id", stepId)
        .select()
        .single();

    if (error) {
        console.error("Update step error:", error);
        return { data: null, error: error.message };
    }

    return { data, error: null };
}

export async function deleteStep(stepId: string) {
    const supabase = getClient();

    const { error } = await supabase
        .from("form_steps")
        .delete()
        .eq("id", stepId);

    if (error) {
        console.error("Delete step error:", error);
        return { error: error.message };
    }

    return { error: null };
}

/** Batch update step order after drag-to-reorder. */
export async function reorderSteps(updates: { id: string; order: number }[]) {
    const supabase = getClient();

    // Run all updates in parallel
    const results = await Promise.all(
        updates.map(({ id, order }) =>
            supabase
                .from("form_steps")
                .update({ order })
                .eq("id", id)
        )
    );

    const firstError = results.find(r => r.error);
    if (firstError?.error) {
        console.error("Reorder steps error:", firstError.error);
        return { error: firstError.error.message };
    }

    return { error: null };
}

// ─── Leads ────────────────────────────────────────────────────────────────────

export async function getLeadsByForm(formId: string) {
    const supabase = getClient();

    const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("form_id", formId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Get leads error:", error);
        return { data: [], error: error.message };
    }

    return { data: data ?? [], error: null };
}

// ─── Update Form ──────────────────────────────────────────────────────────────

export interface UpdateFormInput {
    name?: string;
    webhook_url?: string | null;
    status?: string;
    subdomain?: string | null;
}

export async function updateForm(formId: string, input: UpdateFormInput) {
    const supabase = getClient();

    const { data, error } = await supabase
        .from("forms")
        .update(input)
        .eq("id", formId)
        .select()
        .single();

    if (error) {
        console.error("Update form error:", error);
        return { data: null, error: error.message };
    }

    return { data, error: null };
}

// ─── Webhooks ─────────────────────────────────────────────────────────────────

export async function testWebhookUrl(url: string, payload: any) {
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            return { success: false, status: res.status, error: `Webhook returned ${res.status}` };
        }

        return { success: true, status: res.status };
    } catch (error: any) {
        console.error("Test webhook error:", error);
        return { success: false, error: error.message || "Network error" };
    }
}
