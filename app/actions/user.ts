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
        const adminClient = createAdminClient();

        // 1. Get all users from auth (using admin client)
        const { data: { users: authUsers }, error: authError } = await adminClient.auth.admin.listUsers();
        if (authError) throw authError;

        // 2. Get all profiles (using admin client to bypass RLS)
        const { data: profiles, error: profileError } = await adminClient
            .from("profiles")
            .select("*");

        const profileList = profiles || [];

        // 3. Merge auth users with profile data
        const mergedUsers = (authUsers || []).map(authUser => {
            const profile = profileList.find(p => p.id === authUser.id);
            return {
                id: authUser.id,
                email: authUser.email,
                first_name: profile?.first_name || null,
                last_name: profile?.last_name || null,
                avatar_url: profile?.avatar_url || null,
                role: (profile as any)?.role || 'Member',
                status: authUser.confirmed_at ? 'Active' : 'Invited',
                last_sign_in: authUser.last_sign_in_at
            };
        });

        return { data: mergedUsers, error: null };
    } catch (error: any) {
        console.error("Error fetching team members:", error);
        // Fallback to basic profiles fetch if admin client fails
        try {
            const supabase = await createClient();
            const { data: profiles } = await supabase.from("profiles").select("*");
            if (profiles && profiles.length > 0) {
                return {
                    data: profiles.map(p => ({
                        ...p,
                        email: (p as any).email || 'No email access',
                        role: (p as any).role || 'Member',
                        status: 'Active'
                    })),
                    error: null
                };
            }
        } catch (e) {
            console.error("Fallback fetch failed:", e);
        }
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
