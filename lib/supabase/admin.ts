import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!key) {
        console.error("SUPABASE_SERVICE_ROLE_KEY is missing from environment variables!");
        // We throw so it doesn't fail silently with a "User not allowed" GoTrue error
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
    }

    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        key,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );
}
