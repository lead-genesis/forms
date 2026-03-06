"use server";

import { redirect } from "next/navigation";

export async function completeOnboarding(formData: FormData) {
    // Dummy success
    redirect("/dashboard");
    return { success: true, error: null as string | null };
}
