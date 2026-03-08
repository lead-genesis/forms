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
            // Trigger SMS verification code asynchronously
            fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-sms-verification`, {
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

            // Trigger the background webhook processor with a 3-minute delay
            // This ensures the webhook fires after 3 mins even if the user never verifies.
            fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-webhook`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                    leadId: data.id,
                    delayMs: 3 * 60 * 1000,
                }),
            }).catch(err => console.error("Webhook processor trigger error:", err));
        }
    } else if (form?.webhook_url) {
        // Immediate webhook if SMS verification is disabled
        // We await this to ensure it's delivered reliably before the server action finishes
        await triggerLeadWebhook(data.id);
    }

    return { data, error: null };
}

/**
 * Centrally manages webhook delivery for a lead.
 * Includes a "sent" check to prevent duplicate deliveries between
 * the immediate verification trigger and the 3-minute fallback.
 */
export async function triggerLeadWebhook(leadId: string) {
    const supabase = getClient();

    // 1. Fetch lead and form data to check if already sent
    const { data: lead, error: leadError } = await supabase
        .from("leads")
        .select("*, forms(id, name, webhook_url)")
        .eq("id", leadId)
        .single();

    if (leadError || !lead) {
        console.error("Trigger webhook lead fetch error:", leadError);
        return { success: false, error: "Lead not found" };
    }

    if (lead.webhook_status !== null) {
        // Webhook already attempted or sent
        return { success: true, message: "Webhook already processed" };
    }

    const form = lead.forms as any;
    if (!form?.webhook_url) {
        return { success: false, error: "No webhook URL configured" };
    }

    // 2. Build payload
    const { data: steps } = await supabase
        .from("form_steps")
        .select("id, title, type, data, order")
        .eq("form_id", form.id)
        .order("order", { ascending: true });

    const payload = buildWebhookPayload({
        formId: form.id,
        formName: form.name,
        steps: steps || [],
        answers: lead.answers,
        isSmsVerified: lead.is_sms_verified ?? false,
        smsVerifiedDate: lead.sms_verified_date,
    });

    let webhookStatus = null;
    let webhookResponse = null;

    // 3. Send Webhook
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

    // 4. Update Lead record
    await supabase.from("leads").update({
        webhook_status: webhookStatus,
        webhook_response: webhookResponse,
    }).eq("id", leadId);

    return { success: true, status: webhookStatus };
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
            .update({
                is_sms_verified: true,
                sms_verified_date: new Date().toISOString()
            })
            .eq("id", leadId);

        if (updateError) {
            return { success: false, error: "Failed to update verification status" };
        }

        // Trigger webhook immediately on successful verification
        // This will be awaited to ensure delivery
        await triggerLeadWebhook(leadId);

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

