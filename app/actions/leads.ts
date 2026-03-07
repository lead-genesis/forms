"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { buildWebhookPayload } from "@/lib/webhook";
import { revalidatePath } from "next/cache";

function getClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

export async function saveLead(input: { formId: string; answers: Record<string, any> }) {
    const supabase = getClient();

    const { data, error } = await supabase
        .from("leads")
        .insert({
            form_id: input.formId,
            answers: input.answers,
        })
        .select()
        .single();

    if (error) {
        console.error("Save lead error:", error);
        return { data: null, error: error.message };
    }

    // FIRE AND FORGET - Optimization to reduce transition delay
    // We run the expensive operations (SMS, Webhooks) in the background
    (async () => {
        try {
            const { data: form } = await supabase
                .from("forms")
                .select("name, webhook_url, sms_verification, brands(name)")
                .eq("id", input.formId)
                .single();

            const brandName = (form?.brands as any)?.name || "Genesis Flow";

            if (form?.sms_verification) {
                const smsCode = Math.floor(1000 + Math.random() * 9000).toString();
                await supabase.from("leads").update({ sms_code: smsCode }).eq("id", data.id);

                const phoneNumber = input.answers.phone || input.answers.phoneNumber;
                if (phoneNumber) {
                    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-sms-verification`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
                        },
                        body: JSON.stringify({
                            phone: phoneNumber,
                            code: smsCode,
                            brandName: brandName,
                        }),
                    }).catch(err => console.error("SMS trigger error:", err));
                }
            }

            if (form?.webhook_url) {
                const { data: steps } = await supabase
                    .from("form_steps")
                    .select("id, title, type, data, order")
                    .eq("form_id", input.formId)
                    .order("order", { ascending: true });

                if (steps && steps.length > 0) {
                    const payload = buildWebhookPayload({
                        formId: input.formId,
                        formName: form.name,
                        steps,
                        answers: input.answers,
                    });

                    let webhookStatus = null;
                    let webhookResponse = null;

                    try {
                        const res = await fetch(form.webhook_url, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload),
                        });
                        webhookStatus = res.status;
                        const contentType = res.headers.get("content-type");
                        if (contentType && contentType.includes("application/json")) {
                            webhookResponse = await res.json();
                        } else {
                            webhookResponse = { text: await res.text() };
                        }
                    } catch (webhookFetchError: any) {
                        webhookStatus = 500;
                        webhookResponse = { error: webhookFetchError.message || "Failed to fetch" };
                    }

                    await supabase.from("leads").update({
                        webhook_status: webhookStatus,
                        webhook_response: webhookResponse,
                    }).eq("id", data.id);
                }
            }
        } catch (bgError) {
            console.error("Background lead tasks error:", bgError);
        }
    })();

    return { data, error: null };
}

export async function getDashboardLeads(userId?: string) {
    const supabase = getClient();
    const uid = userId ?? "00000000-0000-0000-0000-000000000001"; // Fallback to DEMO_USER_ID if needed

    const { data, error } = await supabase
        .from("leads")
        .select(`
            *,
            forms (
                name
            )
        `)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Get dashboard leads error:", error);
        return { data: [], error: error.message };
    }

    // Transform data to flatten form name
    const transformedLeads = (data ?? []).map(lead => ({
        ...lead,
        form_name: lead.forms?.name || "Unknown Form"
    }));

    return { data: transformedLeads, error: null };
}

export async function updateLead(leadId: string, answers: Record<string, any>) {
    const supabase = getClient();

    // Fetch current answers first to merge
    const { data: currentLead, error: fetchError } = await supabase
        .from("leads")
        .select("answers")
        .eq("id", leadId)
        .single();

    if (fetchError) return { success: false, error: fetchError.message };

    const { error } = await supabase
        .from("leads")
        .update({
            answers: { ...currentLead.answers, ...answers }
        })
        .eq("id", leadId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/leads");
    return { success: true, error: null };
}

export async function verifyLeadSms(leadId: string, code: string) {
    const supabase = getClient();

    const { data: lead, error: fetchError } = await supabase
        .from("leads")
        .select("sms_code")
        .eq("id", leadId)
        .single();

    if (fetchError || !lead) {
        return { success: false, error: "Lead not found" };
    }

    if (lead.sms_code === code) {
        const { error: updateError } = await supabase
            .from("leads")
            .update({ is_sms_verified: true })
            .eq("id", leadId);

        if (updateError) {
            return { success: false, error: "Failed to update verification status" };
        }

        return { success: true };
    }

    return { success: false, error: "Invalid verification code" };
}

export async function resendLeadSms(leadId: string) {
    const supabase = getClient();

    // 1. Fetch lead and related data
    const { data: lead, error: fetchError } = await supabase
        .from("leads")
        .select("*, forms(id, brands(name))")
        .eq("id", leadId)
        .single();

    if (fetchError || !lead) {
        console.error("Resend SMS fetch error:", fetchError);
        return { success: false, error: "Lead not found" };
    }

    const phoneNumber = lead.answers?.phone || lead.answers?.phoneNumber;
    if (!phoneNumber) {
        return { success: false, error: "Phone number not found for this lead" };
    }

    const brandName = (lead.forms as any)?.brands?.name || "Genesis Flow";

    // 2. Generate new code
    const newCode = Math.floor(1000 + Math.random() * 9000).toString();

    // 3. Update lead with new code
    const { error: updateError } = await supabase
        .from("leads")
        .update({ sms_code: newCode })
        .eq("id", leadId);

    if (updateError) {
        console.error("Resend SMS update error:", updateError);
        return { success: false, error: "Failed to update verification code" };
    }

    // 4. Trigger Edge Function
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-sms-verification`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
                phone: phoneNumber,
                code: newCode,
                brandName: brandName,
            }),
        });

        if (!res.ok) {
            const errData = await res.json();
            return { success: false, error: errData.error || "Failed to send SMS" };
        }

        return { success: true };
    } catch (e: any) {
        console.error("Resend SMS edge function error:", e);
        return { success: false, error: e.message || "Failed to trigger SMS" };
    }
}

