"use client";

import React from "react";
import { FormStep } from "../FormStepRenderer";
import { cn } from "@/lib/utils";
import { sansFont } from "@/lib/design-system";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

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
    isPreview
}: WelcomeStepProps) {
    const { data } = step;

    return (
        <div className="text-center space-y-5">
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
            <h1 className={cn("text-2xl @sm:text-3xl @md:text-4xl font-bold tracking-tight leading-tight", sansFont)}>
                {data.heading || "Welcome"}
            </h1>
            <p className="text-base text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {data.subheading || "Please fill out this form"}
            </p>
            <Button
                size="lg"
                className="rounded-full px-8 h-12 text-sm font-semibold mt-4 gap-2"
                onClick={() => !isPreview && onNext?.()}
                disabled={isPreview}
            >
                {data.buttonText || "Get Started"}
                <ArrowRight className="w-4 h-4" />
            </Button>
        </div>
    );
}
