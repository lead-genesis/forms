"use client";

import React from "react";
import { FormStep } from "../FormStepRenderer";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { sansFont } from "@/lib/design-system";

interface MultiChoiceStepProps {
    step: FormStep;
    allSteps: FormStep[];
    answers: Record<string, any>;
    onAnswer?: (key: string, value: any) => void;
    onOptionSelect?: (optionIndex: number) => void;
    isPreview?: boolean;
}

export function MultiChoiceStep({
    step,
    allSteps,
    answers,
    onAnswer,
    onOptionSelect,
    isPreview
}: MultiChoiceStepProps) {
    const rawOptions = step.data.options ?? ["Option 1", "Option 2", "Option 3"];
    const options: { label: string; nextStepId?: string | null }[] = rawOptions.map((o: any) =>
        typeof o === "string" ? { label: o, nextStepId: null } : o
    );

    return (
        <div className="space-y-5 w-full max-w-sm mx-auto">
            <h2 className={cn("text-xl @sm:text-2xl font-bold text-center", sansFont)}>
                {step.data.question || "Select an option"}
            </h2>
            <div className="grid gap-2.5">
                {options.map((opt, i) => {
                    const routeStep = opt.nextStepId
                        ? allSteps.find(s => s.id === opt.nextStepId)
                        : null;
                    const routeIndex = routeStep
                        ? allSteps.findIndex(s => s.id === opt.nextStepId) + 1
                        : null;
                    const isSelected = answers[`${step.id}_choice`] === i;

                    return (
                        <button
                            key={i}
                            onClick={() => {
                                if (!isPreview) {
                                    onAnswer?.(`${step.id}_choice`, i);
                                    onOptionSelect?.(i);
                                }
                            }}
                            className={cn(
                                "w-full px-4 py-3 rounded-lg border transition-all text-left flex items-center gap-3 group",
                                isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-border/50 hover:border-primary/40 hover:bg-primary/3"
                            )}
                        >
                            <div className={cn(
                                "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center",
                                isSelected
                                    ? "border-primary bg-primary"
                                    : "border-border/50 group-hover:border-primary/50"
                            )}>
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-sm font-medium text-foreground/80 flex-1">{opt.label}</span>
                            {isPreview && routeStep && (
                                <span className="shrink-0 flex items-center gap-1 text-[10px] font-semibold text-primary/70 bg-primary/8 border border-primary/15 px-2 py-0.5 rounded-full">
                                    → Step {routeIndex}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
