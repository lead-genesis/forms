"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

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

    return { data, error: null };
}
