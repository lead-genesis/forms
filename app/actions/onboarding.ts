"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function completeOnboarding(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const first_name = formData.get("first_name") as string;
    const last_name = formData.get("last_name") as string;
    // We could store project_goals, target_specialty, etc. in profiles if we add columns
    // For now let's just save the name

    const { error } = await supabase
        .from("profiles")
        .upsert({
            id: user.id,
            first_name,
            last_name,
            updated_at: new Date().toISOString(),
        });

    if (error) {
        return { success: false, error: error.message };
    }

    redirect("/dashboard");
}
