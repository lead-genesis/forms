"use server";

import { createClient } from "@/lib/supabase/server";

async function getValidatedUser() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error("Unauthorized");
    }

    return { supabase, user };
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Form {
    id: string;
    name: string;
    status: string;
    webhook_url: string | null;
    created_at: string;
    brand_id: string;
    subdomain: string | null;
    views: number;
    banner: string | null;
    sms_verification: boolean;
    custom_page_title: string | null;
    custom_site_description: string | null;
    disclaimer: string | null;
}

export interface CreateFormInput {
    name: string;
    brand_id: string;
    userId?: string;
}

// ─── Forms ────────────────────────────────────────────────────────────────────

export async function createForm(input: CreateFormInput) {
    let supabase, user;
    try {
        const validated = await getValidatedUser();
        supabase = validated.supabase;
        user = validated.user;
    } catch (e) {
        return { data: null, error: "Unauthorized" };
    }
    const userId = user.id;

    // Fetch brand to get default banner
    const { data: brand } = await supabase
        .from("brands")
        .select("banner_url")
        .eq("id", input.brand_id)
        .single();
    const banner = brand?.banner_url || null;

    const { data, error } = await supabase
        .from("forms")
        .insert({
            user_id: userId,
            brand_id: input.brand_id,
            name: input.name.trim() || "New Lead Form",
            status: "draft",
            banner: banner,
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


export async function getForms() {
    let supabase, user;
    try {
        const validated = await getValidatedUser();
        supabase = validated.supabase;
        user = validated.user;
    } catch (e) {
        return { data: [], error: "Unauthorized" };
    }
    const uid = user.id;

    const { data, error } = await supabase
        .from("forms")
        .select(`*, brands (id, name, logo_url)`)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Get forms error:", error);
        return { data: [], error: error.message };
    }

    return { data: data ?? [], error: null };
}

/** Load a single form with its brand details (for the builder). */
export async function getForm(id: string) {
    console.log("[getForm] Fetching form with ID:", id);
    try {
        const supabase = await createClient();
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
            .eq("id", id)
            .single();

        if (error) {
            console.error(`[updateForm] Error updating form ${id}:`, error);
            return { data: null, error: error.message };
        }

        console.log("[getForm] Successfully fetched form:", data?.name);
        return { data, error: null };
    } catch (error: any) {
        console.error("[getForm] Caught exception:", error);
        return { data: null, error: error.message || "Unknown error" };
    }
}

/** Load a single form with its brand details by subdomain (for custom domains). */
export async function getFormBySubdomain(subdomain: string) {
    console.log("Fetching form by subdomain:", subdomain);
    const supabase = await createClient();

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
    console.log("[getFormSteps] Fetching steps for form ID:", formId);
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("form_steps")
            .select("*, forms(user_id)")
            .eq("form_id", formId)
            .order("order", { ascending: true });

        if (error) {
            console.error("[getFormSteps] Supabase error:", error);
            return { data: [], error: error.message };
        }

        console.log("[getFormSteps] Successfully fetched steps count:", data?.length);
        return { data: data ?? [], error: null };
    } catch (error: any) {
        console.error("[getFormSteps] Caught exception:", error);
        return { data: [], error: error.message || "Unknown error" };
    }
}

export interface CreateStepInput {
    formId: string;
    type: string;
    title: string;
    data: Record<string, any>;
    order: number;
}

export async function createStep(input: CreateStepInput) {
    try {
        const { supabase } = await getValidatedUser();
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
    } catch (error: any) {
        return { data: null, error: error.message || "Unauthorized" };
    }
}

export interface UpdateStepInput {
    title?: string;
    data?: Record<string, any>;
    order?: number;
}

export async function updateStep(stepId: string, input: UpdateStepInput) {
    try {
        const { supabase } = await getValidatedUser();
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
    } catch (error: any) {
        return { data: null, error: error.message || "Unauthorized" };
    }
}

export async function deleteStep(stepId: string) {
    try {
        const { supabase } = await getValidatedUser();
        const { error } = await supabase
            .from("form_steps")
            .delete()
            .eq("id", stepId);

        if (error) {
            console.error("Delete step error:", error);
            return { error: error.message };
        }

        return { error: null };
    } catch (error: any) {
        return { error: error.message || "Unauthorized" };
    }
}

/** Batch update step order after drag-to-reorder. */
export async function reorderSteps(updates: { id: string; order: number }[]) {
    try {
        const { supabase } = await getValidatedUser();

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
    } catch (error: any) {
        return { error: error.message || "Unauthorized" };
    }
}

// ─── Leads ────────────────────────────────────────────────────────────────────

export async function getLeadsByForm(formId: string) {
    try {
        const { supabase } = await getValidatedUser();
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
    } catch (error: any) {
        return { data: [], error: error.message || "Unauthorized" };
    }
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function incrementFormViews(formId: string) {
    try {
        const supabase = await createClient();

        // 1. Try atomic increment using RPC
        const { error: rpcError } = await supabase.rpc('increment_form_views', { f_id: formId });

        if (!rpcError) return { success: true };

        // 2. Fallback to basic update (non-atomic but reliable)
        const { data: form } = await supabase
            .from("forms")
            .select("views")
            .eq("id", formId)
            .single();

        if (form) {
            await supabase
                .from("forms")
                .update({ views: (form.views || 0) + 1 })
                .eq("id", formId);
        }

        return { success: true };
    } catch (error) {
        console.error("Increment views error:", error);
        return { success: false };
    }
}

// ─── Update Form ──────────────────────────────────────────────────────────────

export interface UpdateFormInput {
    name?: string;
    webhook_url?: string | null;
    status?: string;
    subdomain?: string | null;
    banner?: string | null;
    sms_verification?: boolean;
    custom_page_title?: string | null;
    custom_site_description?: string | null;
    disclaimer?: string | null;
}

export async function updateForm(formId: string, input: UpdateFormInput) {
    try {
        const { supabase, user } = await getValidatedUser();

        // 1. Handle SMS verification step side-effects
        if (input.sms_verification !== undefined) {
            const { data: currentForm } = await supabase
                .from("forms")
                .select("sms_verification")
                .eq("id", formId)
                .single();

            if (currentForm && currentForm.sms_verification !== input.sms_verification) {
                if (input.sms_verification) {
                    // Toggled ON: Add the step
                    const { data: steps } = await supabase
                        .from("form_steps")
                        .select("id, order, type")
                        .eq("form_id", formId)
                        .order("order", { ascending: true });

                    const thankYouStep = steps?.find(s => s.type === "thank-you");
                    const smsStepExists = steps?.some(s => s.type === "sms-verification");

                    if (!smsStepExists && thankYouStep) {
                        // Push thank-you step forward
                        await supabase
                            .from("form_steps")
                            .update({ order: thankYouStep.order + 1 })
                            .eq("id", thankYouStep.id);

                        // Insert SMS step
                        await supabase.from("form_steps").insert({
                            form_id: formId,
                            type: "sms-verification",
                            title: "SMS Verification",
                            data: {},
                            order: thankYouStep.order,
                        });
                    }
                } else {
                    // Toggled OFF: Remove the step
                    await supabase
                        .from("form_steps")
                        .delete()
                        .eq("form_id", formId)
                        .eq("type", "sms-verification");

                    // Re-order remaining steps to be compact
                    const { data: remainingSteps } = await supabase
                        .from("form_steps")
                        .select("id")
                        .eq("form_id", formId)
                        .order("order", { ascending: true });

                    if (remainingSteps) {
                        await Promise.all(
                            remainingSteps.map((s, i) =>
                                supabase.from("form_steps").update({ order: i }).eq("id", s.id)
                            )
                        );
                    }
                }
            }
        }

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
    } catch (error: any) {
        return { data: null, error: error.message || "Unauthorized" };
    }
}

// ─── Duplicate Form ───────────────────────────────────────────────────────────

/** 
 * Generates a unique subdomain by appending suffixes if needed.
 */
async function generateUniqueSubdomain(baseSubdomain: string): Promise<string> {
    const supabase = await createClient();

    let candidate = baseSubdomain;
    let attempt = 0;
    let isUnique = false;

    while (!isUnique && attempt < 10) {
        const { count, error } = await supabase
            .from("forms")
            .select("subdomain", { count: "exact", head: true })
            .eq("subdomain", candidate);

        if (error) {
            console.error("Error checking subdomain uniqueness:", error);
            // If error, we'll just try to append something random to be safe
            candidate = `${baseSubdomain}-${Math.random().toString(36).substring(2, 7)}`;
            break;
        }

        if (count === 0) {
            isUnique = true;
        } else {
            attempt++;
            candidate = `${baseSubdomain}-${attempt}`;
        }
    }

    // Final safety check if loop exhausted
    if (!isUnique) {
        candidate = `${baseSubdomain}-${Math.random().toString(36).substring(2, 7)}`;
    }

    return candidate;
}

/**
 * Robustly duplicates a form and all its steps.
 */
export async function duplicateForm(formId: string) {
    try {
        const { supabase } = await getValidatedUser();

        // 1. Fetch original form
        const { data: originalForm, error: fetchError } = await supabase
            .from("forms")
            .select("*")
            .eq("id", formId)
            .single();

        if (fetchError || !originalForm) {
            console.error("Fetch original form error:", fetchError);
            return { data: null, error: fetchError?.message || "Original form not found" };
        }

        // 2. Prepare new form data
        const newName = `${originalForm.name} (copy)`;
        const baseSubdomain = originalForm.subdomain ? `${originalForm.subdomain}-copy` : null;
        let newSubdomain = null;

        if (baseSubdomain) {
            newSubdomain = await generateUniqueSubdomain(baseSubdomain);
        }

        // 3. Insert new form
        const { data: newForm, error: insertError } = await supabase
            .from("forms")
            .insert({
                user_id: originalForm.user_id,
                brand_id: originalForm.brand_id,
                name: newName,
                status: "draft", // Always default to draft on copy
                webhook_url: originalForm.webhook_url,
                subdomain: newSubdomain,
                views: 0,
                banner: originalForm.banner,
                custom_page_title: originalForm.custom_page_title,
                custom_site_description: originalForm.custom_site_description,
                sms_verification: originalForm.sms_verification,
                disclaimer: originalForm.disclaimer,
            })
            .select()
            .single();

        if (insertError || !newForm) {
            console.error("Duplicate form insert error:", insertError);
            return { data: null, error: insertError?.message || "Failed to create duplicated form" };
        }

        // 4. Duplicate steps
        const { data: originalSteps, error: stepsError } = await supabase
            .from("form_steps")
            .select("*")
            .eq("form_id", formId)
            .order("order", { ascending: true });

        if (stepsError) {
            console.error("Fetch original steps error:", stepsError);
            return { data: newForm, error: `Form duplicated but steps failed: ${stepsError.message}` };
        }

        if (originalSteps && originalSteps.length > 0) {
            const stepsToInsert = originalSteps.map(step => ({
                form_id: newForm.id,
                type: step.type,
                title: step.title,
                data: step.data,
                order: step.order,
            }));

            const { error: batchInsertError } = await supabase
                .from("form_steps")
                .insert(stepsToInsert);

            if (batchInsertError) {
                console.error("Batch insert steps error:", batchInsertError);
                return { data: newForm, error: `Form duplicated but steps failed to insert: ${batchInsertError.message}` };
            }
        }

        return { data: newForm, error: null };
    } catch (error: any) {
        return { data: null, error: error.message || "Unauthorized" };
    }
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

// ─── Image Upload ─────────────────────────────────────────────────────────────

async function uploadImage(
    supabase: any,
    dataUrl: string,
    path: string
): Promise<string | null> {
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

export async function updateFormBanner(formId: string, dataUrl: string) {
    try {
        const { supabase, user } = await getValidatedUser();

        const filePath = `${user.id}/forms/${formId}/banner`;
        const bannerUrl = await uploadImage(supabase, dataUrl, filePath);

        if (!bannerUrl) {
            return { data: null, error: "Failed to upload image" };
        }

        const { data, error } = await supabase
            .from("forms")
            .update({ banner: bannerUrl })
            .eq("id", formId)
            .select()
            .single();

        if (error) {
            console.error("Update form banner error:", error);
            return { data: null, error: error.message };
        }

        return { data, error: null };
    } catch (error: any) {
        return { data: null, error: error.message || "Unauthorized" };
    }
}

