"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

export default function AuthCodeError() {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                // If we have a session (likely from the fragment), 
                // redirect to onboarding as intended
                router.push('/onboarding');
            } else {
                setIsChecking(false);
            }
        };

        checkSession();
    }, [router]);

    if (isChecking) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p>Verifying your invitation...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
            <p className="text-muted-foreground mb-8 max-w-md">
                The authentication link provided is invalid, has expired, or was already used.
                Please check your email for the latest invite or contact support.
            </p>
            <Button asChild className="rounded-full px-8">
                <Link href="/auth">Back to Login</Link>
            </Button>
        </div>
    );
}
