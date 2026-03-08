"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { sansFont } from "@/lib/design-system";
import { motion } from "framer-motion";
import { MessageSquare, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SmsVerificationStepProps {
    phoneNumber: string;
    onVerify?: (code: string) => Promise<{ success: boolean; error?: string }>;
    onResend?: () => Promise<{ success: boolean; error?: string }>;
    onSuccess?: () => void;
}

export function SmsVerificationStep({
    phoneNumber,
    onVerify,
    onResend,
    onSuccess
}: SmsVerificationStepProps) {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timer, setTimer] = useState(60);

    useEffect(() => {
        let interval: any;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleVerify = async () => {
        if (code.length !== 4) {
            setError("Please enter a 4-digit code");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await onVerify?.(code);
            if (res?.success) {
                onSuccess?.();
            } else {
                setError(res?.error || "Invalid code. Please try again.");
            }
        } catch (err) {
            setError("Verification failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0 || resending) return;

        setResending(true);
        setError(null);
        try {
            const res = await onResend?.();
            if (res?.success) {
                setTimer(60);
            } else {
                setError(res?.error || "Failed to resend code.");
            }
        } catch (err) {
            setError("Resend failed. Please try again.");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="space-y-8 w-full max-w-sm mx-auto text-center py-4">
            <div className="space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary mb-2">
                    <MessageSquare className="w-6 h-6" />
                </div>
                <h2 className={cn("text-2xl font-bold tracking-tight", sansFont)}>Almost Done! Enter SMS Code</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    We've sent a 4-digit code to <span className="font-semibold text-foreground whitespace-nowrap">{phoneNumber || "your phone"}</span>.
                </p>
            </div>

            <div className="flex flex-col items-center gap-6">
                <div className="relative">
                    <input
                        type="text"
                        maxLength={4}
                        value={code}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            if (val.length <= 4) setCode(val);
                            if (error) setError(null);
                        }}
                        autoFocus
                        placeholder="----"
                        className="w-48 h-16 text-center text-3xl font-bold tracking-[0.5em] pl-[0.5em] rounded-2xl border-2 border-border/50 bg-secondary/5 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-muted-foreground/20"
                    />
                </div>

                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs font-semibold text-destructive px-4 py-2 bg-destructive/10 rounded-lg flex items-center gap-2"
                    >
                        <AlertCircle className="w-3.5 h-3.5" />
                        {error}
                    </motion.p>
                )}

                <div className="w-full space-y-3">
                    <Button
                        type="button"
                        size="lg"
                        className="w-full rounded-xl h-12 text-sm font-bold shadow-lg shadow-primary/20"
                        onClick={handleVerify}
                        disabled={loading || code.length !== 4}
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Verify & Continue
                    </Button>

                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={timer > 0 || resending}
                        className={cn(
                            "text-xs font-semibold transition-colors flex items-center justify-center w-full py-2 rounded-lg",
                            timer > 0 || resending
                                ? "text-muted-foreground cursor-not-allowed opacity-50"
                                : "text-primary hover:text-primary/80 hover:bg-primary/5"
                        )}
                    >
                        {resending && <Loader2 className="w-3 h-3 animate-spin mr-2" />}
                        {timer > 0 ? `Resend code in ${timer}s` : "Resend code"}
                    </button>
                </div>
            </div>
        </div>
    );
}
