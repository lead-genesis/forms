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

export async function updateUserProfile(userId: string, data: { first_name?: string; last_name?: string }) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", userId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/users");
    return { success: true, error: null };
}

export async function getTeamMembers() {
    try {
        const supabase = await createClient();
        const adminClient = createAdminClient();

        // 1. Get all profiles
        const { data: profiles, error: profileError } = await supabase
            .from("profiles")
            .select("*");

        if (profileError) throw profileError;

        // 2. Get all users from auth (using admin client)
        const { data: { users: authUsers }, error: authError } = await adminClient.auth.admin.listUsers();

        if (authError) throw authError;

        // 3. Merge profiles with auth user data (emails)
        const mergedUsers = (profiles || []).map(profile => {
            const authUser = authUsers?.find(u => u.id === profile.id);
            return {
                ...profile,
                email: authUser?.email || profile.email, // Use auth email if available
                role: profile.role || 'Member', // Default role if not set
                status: profile.status || 'Active'
            };
        });

        return { data: mergedUsers, error: null };
    } catch (error: any) {
        console.error("Error fetching team members:", error);
        return { data: [], error: error.message };
    }
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
