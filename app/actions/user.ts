"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updatePassword(password: string) {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, error: null };
}

export async function inviteUser(email: string) {
    console.log("Invitation request for:", email);
    console.log("Service Role Key exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    const supabase = createAdminClient();

    // Check if it's actually using the fallback
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.warn("CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing! Invitation will fail.");
    }
    // Check if the user already exists in auth.users would be good, 
    // but auth.admin.inviteUserByEmail handles conflicts.
    const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/onboarding`,
    });

    if (error) {
        console.error("Invite user error:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/users");
    return { success: true, error: null };
}

export async function updateProfile(data: { first_name?: string; last_name?: string; avatar_url?: string }) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", user.id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
    return { success: true, error: null };
}

export async function getCurrentUser() {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) return { user: null, profile: null };

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    return { user, profile };
}
