"use client";

import React from "react";
import { FormStep } from "../FormStepRenderer";
import { cn } from "@/lib/utils";
import { sansFont } from "@/lib/design-system";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Lock } from "lucide-react";

interface WelcomeStepProps {
    step: FormStep;
    brand?: { name: string; logo_url?: string | null } | null;
    onNext?: () => void;
    isPreview?: boolean;
}

export function WelcomeStep({
    step,
    brand,
    onNext,
    isPreview,
}: WelcomeStepProps) {
    const { data } = step;

    return (
        <div className="text-center space-y-6 flex flex-col items-center">
            {/* Brand logo */}
            {brand && (brand.logo_url || brand.name) && (
                <div className="flex justify-center mb-2">
                    {brand.logo_url ? (
                        <img
                            src={brand.logo_url}
                            alt={brand.name ?? "Brand"}
                            className="w-20 h-20 rounded-2xl object-cover shadow-sm border border-border/20"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center text-2xl font-bold text-muted-foreground">
                            {brand.name?.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
            )}

            <div className="space-y-4">
                <h1 className={cn("text-2xl @sm:text-3xl @md:text-4xl font-bold tracking-tight leading-tight", sansFont)}>
                    {data.heading || "Welcome"}
                </h1>
                <p className="text-base text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    {data.subheading || "Please fill out this form"}
                </p>
            </div>

            <Button
                size="lg"
                className="rounded-full px-8 h-12 text-sm font-semibold mt-2 gap-2 w-full @sm:w-auto"
                onClick={() => !isPreview && onNext?.()}
                disabled={isPreview}
            >
                {data.buttonText || "Get Started"}
                <ArrowRight className="w-4 h-4" />
            </Button>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-8 pt-6 border-t border-border/10 w-full mt-6">
                <div className="flex flex-col items-center gap-1.5 group">
                    <div className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center transition-colors group-hover:bg-secondary/50">
                        <Lock className="w-5 h-5 text-muted-foreground/80" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 leading-tight">
                        256-Bit SSL<br />Encrypted
                    </span>
                </div>
                <div className="flex flex-col items-center gap-1.5 group">
                    <div className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center transition-colors group-hover:bg-secondary/50 relative">
                        <ShieldCheck className="w-5 h-5 text-muted-foreground/80" />
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[6px] font-black mt-[1px] text-muted-foreground/40">AUS</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 leading-tight">
                        Privacy Act 1988<br />Compliant
                    </span>
                </div>
            </div>
        </div>
    );
}
