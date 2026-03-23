"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { CreateVerticalSchema, type CreateVerticalInput } from "@/lib/schemas/verticals";

export async function createVertical(rawInput: CreateVerticalInput) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { data: null, error: "Unauthorized: Please sign in to create a vertical." };
    }

    const validation = CreateVerticalSchema.safeParse(rawInput);
    if (!validation.success) {
        return { data: null, error: validation.error.issues[0].message };
    }
    const input = validation.data;

    const { data, error } = await supabase
        .from("verticals")
        .insert({
            name: input.name,
        })
        .select()
        .single();

    if (error) {
        console.error("Create vertical error:", error);
        return { data: null, error: error.message };
    }

    revalidatePath("/dashboard/verticals");
    return { data, error: null };
}

export async function getVerticals() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { data: [], error: "Unauthorized" };
    }

    const { data, error } = await supabase
        .from("verticals")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Get verticals error:", error);
        return { data: [], error: error.message };
    }

    return { data: data ?? [], error: null };
}
