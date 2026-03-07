"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { success: false, error: error.message };
    }

    redirect("/dashboard");
}

export async function signUp(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const first_name = formData.get("first_name") as string;
    const last_name = formData.get("last_name") as string;

    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name,
                last_name,
            },
        },
    });

    if (error) {
        return { success: false, error: error.message };
    }

    redirect("/onboarding");
}

export async function forgotPassword(email: string) {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/dashboard/settings`,
    });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, error: null };
}
