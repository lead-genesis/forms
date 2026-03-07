"use client";

import { useState } from "react";
import { updatePassword } from "@/app/actions/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { sansFont } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    // Initialize Supabase client and check for session
    // This is critical for consuming the #access_token from the URL
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("Auth event:", event);
            if (event === "PASSWORD_RECOVERY") {
                console.log("Recovery session detected");
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({ password });

            if (error) {
                toast.error(error.message);
            } else {
                toast.success("Password updated successfully!");
                router.push("/dashboard");
            }
        } catch (error) {
            toast.error("An error occurred while updating your password.");
        } finally {
            setIsLoading(false);
        }

    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-8 bg-background">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <Link href="/" className="inline-flex items-center gap-2 mb-8">
                        <Logo />
                    </Link>
                    <h2 className={cn("text-3xl font-bold mb-2", sansFont)}>
                        Reset Password
                    </h2>
                    <p className="text-muted-foreground">
                        Enter your new password below.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none" htmlFor="password">New Password</label>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none" htmlFor="confirmPassword">Confirm Password</label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                        />
                    </div>

                    <Button className="w-full h-11 text-base group" type="submit" disabled={isLoading}>
                        {isLoading ? "Updating..." : "Update Password"}
                        {!isLoading && <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />}
                    </Button>
                </form>
            </div>
        </div>
    );
}
