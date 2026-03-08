import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AuthCodeError() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
            <p className="text-muted-foreground mb-8 max-w-md">
                The authentication code provided is invalid or has expired.
                Please try signing in again or contact support if the problem persists.
            </p>
            <Button asChild className="rounded-full px-8">
                <Link href="/auth">Back to Login</Link>
            </Button>
        </div>
    );
}
