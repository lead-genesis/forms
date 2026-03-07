import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        // Return a mock or null if env vars are missing during build/server-side
        // This prevents the @supabase/ssr from throwing early
        return createBrowserClient(
            "https://placeholder.supabase.co",
            "placeholder"
        );
    }

    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}
