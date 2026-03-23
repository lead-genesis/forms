"use client";

import React from "react";
import { FormStep } from "../FormStepRenderer";
import { cn } from "@/lib/utils";
import { sansFont } from "@/lib/design-system";
import { Button } from "@/components/ui/button";

interface InputStepProps {
    step: FormStep;
    answers: Record<string, any>;
    onAnswer?: (key: string, value: any) => void;
    onNext?: () => void;
    isPreview?: boolean;
}

export function InputStep({
    step,
    answers,
    onAnswer,
    onNext,
    isPreview
}: InputStepProps) {
    const { data } = step;

    const handleInputChange = (value: string) => {
        if (!isPreview && onAnswer) onAnswer(`${step.id}_input`, value);
    };

    return (
        <div className="space-y-5 w-full max-w-sm mx-auto">
            <h2 className={cn("text-xl @sm:text-2xl font-bold text-center", sansFont)}>
                {data.label || "Enter your answer"}
            </h2>
            {isPreview ? (
                <div className="h-10 w-full bg-secondary/40 rounded-lg border border-border/30" />
            ) : (
                <>
                    <input
                        type="text"
                        value={answers[`${step.id}_input`] ?? ""}
                        onChange={(e) => handleInputChange(e.target.value)}
                        placeholder={data.placeholder || "Type something..."}
                        className="w-full h-12 @lg:h-10 px-3 rounded-lg border border-border/50 bg-transparent text-base @lg:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/50"
                    />
                    <Button className="w-full rounded-full h-12 @lg:h-10 text-base @lg:text-sm font-semibold" onClick={onNext}>
                        Continue
                    </Button>
                </>
            )}
        </div>
    );
}
