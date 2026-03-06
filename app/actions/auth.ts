"use server";

import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
    // Demo login logic or dummy success
    redirect("/dashboard");
    return { success: true, error: null as string | null };
}

export async function signUp(formData: FormData) {
    redirect("/onboarding");
    return { success: true, error: null as string | null };
}

export async function forgotPassword(email: string) {
    return { success: true, error: null as string | null };
}
