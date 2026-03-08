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

async function checkIsAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    return profile?.role === "Administrator";
}

export async function inviteUser(email: string, firstName: string, lastName: string, role: string = 'Member') {
    // Authorization Check
    if (!(await checkIsAdmin())) {
        return { success: false, error: "Unauthorized: Admins only" };
    }

    console.log("Invitation request for:", email, firstName, lastName, role);

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return { success: false, error: "Server configuration error" };
    }

    try {
        const supabase = createAdminClient();

        const { data: inviteData, error } = await supabase.auth.admin.inviteUserByEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/onboarding`,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        // Create the profile immediately with the assigned role
        if (inviteData?.user) {
            const { error: profileError } = await supabase
                .from("profiles")
                .upsert({
                    id: inviteData.user.id,
                    email: email,
                    first_name: firstName,
                    last_name: lastName,
                    role: role, // Persist the assigned role
                    updated_at: new Date().toISOString(),
                });

            if (profileError) {
                console.error("Profile creation error:", profileError);
            }
        }

        revalidatePath("/dashboard/users");
        return { success: true, error: null };
    } catch (error: any) {
        return { success: false, error: error.message || "An unexpected error occurred." };
    }
}

export async function resendInvite(email: string) {
    // Authorization Check
    if (!(await checkIsAdmin())) {
        return { success: false, error: "Unauthorized: Admins only" };
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return { success: false, error: "Server configuration error" };
    }

    try {
        const supabase = createAdminClient();
        const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/onboarding`,
        });

        if (error) return { success: false, error: error.message };
        return { success: true, error: null };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateProfile(data: { first_name?: string; last_name?: string; avatar_url?: string }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
    return { success: true, error: null };
}

export async function updateUserProfile(userId: string, data: { first_name?: string; last_name?: string; role?: string }) {
    // Authorization Check: Admins can update anyone, users can only update themselves
    const isAdmin = await checkIsAdmin();
    const supabase = await createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    if (!isAdmin && currentUser?.id !== userId) {
        return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", userId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/users");
    return { success: true, error: null };
}

export async function getTeamMembers() {
    // Authorization Check
    if (!(await checkIsAdmin())) {
        return { success: false, error: "Unauthorized: Admins only" };
    }

    try {
        const adminClient = createAdminClient();

        // 1. Get all users from auth
        const { data: { users: authUsers }, error: authError } = await adminClient.auth.admin.listUsers();
        if (authError) throw authError;

        // 2. Get all profiles (including role)
        const { data: profiles, error: profileError } = await adminClient
            .from("profiles")
            .select("id, email, first_name, last_name, avatar_url, role, updated_at");

        const profileList = profiles || [];

        // 3. Merge auth users with profile data
        const mergedUsers = (authUsers || []).map(authUser => {
            const profile = profileList.find(p => p.id === authUser.id);
            return {
                id: authUser.id,
                email: profile?.email || authUser.email,
                first_name: profile?.first_name || null,
                last_name: profile?.last_name || null,
                avatar_url: profile?.avatar_url || null,
                role: profile?.role || 'Member', // Use database role
                status: authUser.confirmed_at ? 'Active' : 'Invited',
                last_sign_in: authUser.last_sign_in_at,
                updated_at: profile?.updated_at
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
