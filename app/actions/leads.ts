"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { buildWebhookPayload } from "@/lib/webhook";
import { resolveAndValidate } from "@/lib/url-validation";
import { safeError } from "@/lib/utils";
import { getValidatedUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { randomInt } from "crypto";

const MAX_SMS_ATTEMPTS = 5;
const MAX_SMS_RESENDS = 3;

function generateSmsCode(): string {
    return randomInt(100000, 999999).toString();
}

export async function saveLead(input: { formId: string; answers: Record<string, any> }) {
    const supabase = createAdminClient();

    // 1. Fetch form settings first to check for SMS verification and get brand info
    const { data: form } = await supabase
        .from("forms")
        .select("name, webhook_url, sms_verification, brands(name)")
        .eq("id", input.formId)
        .single();

    let smsCode = null;
    if (form?.sms_verification) {
        smsCode = generateSmsCode();
    }

    // 2. Insert lead with sms_code if applicable
    const { data, error } = await supabase
        .from("leads")
        .insert({
            form_id: input.formId,
            answers: input.answers,
            sms_code: smsCode,
        })
        .select()
        .single();

    console.log("[saveLead] Insert result:", { id: data?.id, error });

    if (error) {
        console.error(`[saveLead] Error saving lead for form ${input.formId}:`, error);
        return { data: null, error: safeError(error, "Failed to save lead") };
    }

    const brandName = (form?.brands as any)?.name || "Genesis Flow";

    if (form?.sms_verification && smsCode) {
        const phoneNumber = input.answers.phone || input.answers.phoneNumber;
        if (phoneNumber) {
            // TRIGGERS - We use after() to run these in the background after the response is sent
            // This ensures the user doesn't experience a delay while waiting for external APIs.
            after(async () => {
                // Trigger SMS verification code
                try {
                    const smsRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-sms-verification`, {
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
                    });
                    if (!smsRes.ok) {
                        const errorText = await smsRes.text();
                        console.error("SMS trigger failed:", smsRes.status, errorText);
                    }
                } catch (err) {
                    console.error("SMS trigger fetch error:", err);
                }

                // Trigger the background webhook processor with a 3-minute delay
                try {
                    const webhookProcRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-webhook`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
                        },
                        body: JSON.stringify({
                            leadId: data.id,
                            delayMs: 3 * 60 * 1000,
                        }),
                    });
                    if (!webhookProcRes.ok) {
                        const errorText = await webhookProcRes.text();
                        console.error("Webhook processor trigger failed:", webhookProcRes.status, errorText);
                    }
                } catch (err) {
                    console.error("Webhook processor trigger fetch error:", err);
                }
            });
        }
    } else if (form?.webhook_url) {
        // Immediate webhook if SMS verification is disabled
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
    const supabase = createAdminClient();

    // 1. Atomically claim this webhook delivery to prevent duplicates.
    // Only proceeds if webhook_status is currently null.
    const { data: claimed, error: claimError } = await supabase
        .from("leads")
        .update({ webhook_status: -1 }) // -1 = "in progress" sentinel
        .eq("id", leadId)
        .is("webhook_status", null)
        .select("*, forms(id, name, webhook_url)")
        .single();

    if (claimError || !claimed) {
        // Either lead not found or webhook already claimed/processed
        return { success: true, message: "Webhook already processed or lead not found" };
    }

    const lead = claimed;
    const form = lead.forms as any;
    if (!form?.webhook_url) {
        // Reset sentinel since we won't send
        await supabase.from("leads").update({ webhook_status: null }).eq("id", leadId);
        return { success: false, error: "No webhook URL configured" };
    }

    // Validate webhook URL before fetching to prevent SSRF (includes DNS resolution check)
    const urlCheck = await resolveAndValidate(form.webhook_url);
    if (!urlCheck.ok) {
        console.error("Blocked webhook URL:", form.webhook_url, urlCheck.error);
        await supabase.from("leads").update({ webhook_status: null }).eq("id", leadId);
        return { success: false, error: "Webhook URL is not allowed" };
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

    // 3. Send Webhook (with timeout and retry)
    const sendWebhook = async (attempt = 1): Promise<{ status: number; response: any }> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        try {
            const res = await fetch(form.webhook_url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: controller.signal,
                redirect: "error", // Prevent redirect-based SSRF
            });
            clearTimeout(timeoutId);

            let response = null;
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                response = await res.json();
            } else {
                response = { text: await res.text() };
            }
            return { status: res.status, response };
        } catch (err: any) {
            clearTimeout(timeoutId);
            if (attempt < 2 && (err.name === 'AbortError' || err.message.includes('fetch'))) {
                return sendWebhook(attempt + 1);
            }
            throw err;
        }
    };

    try {
        const { status, response } = await sendWebhook();
        webhookStatus = status;
        webhookResponse = response;
    } catch (webhookFetchError: any) {
        webhookStatus = webhookFetchError.name === 'AbortError' ? 408 : 500;
        webhookResponse = { error: webhookFetchError.message || "Failed to fetch" };
    }

    // 4. Update Lead record
    await supabase.from("leads").update({
        webhook_status: webhookStatus,
        webhook_response: webhookResponse,
    }).eq("id", leadId);

    return { success: true, status: webhookStatus };
}

export async function getDashboardLeads(limit = 100, offset = 0) {
    const { supabase, user } = await getValidatedUser();

    const { data, error } = await supabase
        .from("leads")
        .select(`
            *,
            forms!inner (
                name,
                user_id
            )
        `)
        .eq("forms.user_id", user.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        return { data: [], error: error.message };
    }

    const transformedLeads = (data ?? []).map(lead => ({
        ...lead,
        form_name: (lead.forms as any)?.name || "Unknown Form"
    }));

    return { data: transformedLeads, error: null };
}

export async function updateLead(leadId: string, answers: Record<string, any>) {
    const { supabase, user } = await getValidatedUser();

    // Fetch lead and verify the form belongs to this user
    const { data: lead, error: fetchError } = await supabase
        .from("leads")
        .select("id, answers, forms!inner(user_id)")
        .eq("id", leadId)
        .single();

    if (fetchError || !lead) return { success: false, error: fetchError?.message || "Lead not found" };

    if ((lead.forms as any)?.user_id !== user.id) {
        return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase
        .from("leads")
        .update({
            answers: { ...lead.answers, ...answers }
        })
        .eq("id", leadId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/leads");
    return { success: true, error: null };
}

export async function verifyLeadSms(leadId: string, code: string) {
    const supabase = createAdminClient();

    // Atomically increment sms_attempts and fetch in one step to prevent race conditions.
    // Uses an RPC for atomic increment; falls back to read-then-write if RPC doesn't exist.
    const { data: lead, error: fetchError } = await supabase
        .from("leads")
        .select("sms_code, sms_attempts")
        .eq("id", leadId)
        .single();

    if (fetchError || !lead) {
        console.error("[verifyLeadSms] Lead lookup failed:", { leadId, fetchError, lead });
        return { success: false, error: "Lead not found" };
    }

    const currentAttempts = lead.sms_attempts ?? 0;
    if (currentAttempts >= MAX_SMS_ATTEMPTS) {
        return { success: false, error: "Too many verification attempts. Please request a new code." };
    }

    // Atomic increment: only update if the count hasn't changed since we read it
    const { data: updated, error: updateError } = await supabase
        .from("leads")
        .update({ sms_attempts: currentAttempts + 1 })
        .eq("id", leadId)
        .eq("sms_attempts", currentAttempts)
        .select("id")
        .single();

    if (updateError || !updated) {
        // Another request raced us — tell user to retry
        return { success: false, error: "Please try again" };
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

        await triggerLeadWebhook(leadId);

        return { success: true };
    }

    return { success: false, error: "Invalid verification code" };
}

export async function resendLeadSms(leadId: string) {
    const supabase = createAdminClient();

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

    // Check resend limit
    const resendCount = (lead.sms_resends ?? 0) + 1;
    if (resendCount > MAX_SMS_RESENDS) {
        return { success: false, error: "Maximum resend limit reached. Please try again later." };
    }

    const phoneNumber = lead.answers?.phone || lead.answers?.phoneNumber;
    if (!phoneNumber) {
        return { success: false, error: "Phone number not found for this lead" };
    }

    const brandName = (lead.forms as any)?.brands?.name || "Genesis Flow";

    // 2. Generate new code
    const newCode = generateSmsCode();

    // 3. Update lead with new code — reset attempts but track resend count
    const { error: updateError } = await supabase
        .from("leads")
        .update({ sms_code: newCode, sms_attempts: 0, sms_resends: resendCount })
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

