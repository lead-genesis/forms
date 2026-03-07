"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { buildWebhookPayload } from "@/lib/webhook";

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

    try {
        const { data: form } = await supabase
            .from("forms")
            .select("name, webhook_url")
            .eq("id", input.formId)
            .single();

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

                const res = await fetch(form.webhook_url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) {
                    console.error(`Webhook error: received status ${res.status}`);
                }
            }
        }
    } catch (webhookError) {
        console.error("Webhook trigger error:", webhookError);
    }

    return { data, error: null };
}
