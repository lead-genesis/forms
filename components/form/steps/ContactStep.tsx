"use client";

import React, { useState } from "react";
import { FormStep } from "../FormStepRenderer";
import { cn } from "@/lib/utils";
import { sansFont } from "@/lib/design-system";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { validateEmail, validatePhone, isRequired } from "@/lib/validation";

interface ContactStepProps {
    step: FormStep;
    answers: Record<string, any>;
    onAnswer?: (key: string, value: any) => void;
    onNext?: () => void;
    isPreview?: boolean;
}

export function ContactStep({
    step,
    answers,
    onAnswer,
    onNext,
    isPreview
}: ContactStepProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { data } = step;

    const handleInputChange = (key: string, value: string) => {
        if (!isPreview && onAnswer) onAnswer(key, value);
        if (errors[key]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[key];
                return newErrors;
            });
        }
    };

    const handleContinue = () => {
        const newErrors: Record<string, string> = {};
        if (!isRequired(answers.first_name)) newErrors.first_name = "Required";
        if (!isRequired(answers.last_name)) newErrors.last_name = "Required";

        if (!isRequired(answers.email)) {
            newErrors.email = "Required";
        } else if (!validateEmail(answers.email)) {
            newErrors.email = "Invalid email";
        }

        if (!isRequired(answers.phone)) {
            newErrors.phone = "Required";
        } else if (!validatePhone(answers.phone)) {
            newErrors.phone = "Invalid phone";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        onNext?.();
    };

    return (
        <div className="space-y-5 w-full max-w-sm mx-auto flex flex-col pt-4">
            <div className="flex flex-col items-center justify-center -translate-y-2">
                {data.showSpinner && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-3"
                    >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Loader2 className="w-5 h-5 animate-spin" />
                        </div>
                    </motion.div>
                )}
                <h2 className={cn("text-xl @sm:text-2xl font-bold text-center mb-2", sansFont)}>
                    {data.heading || "Contact Details"}
                </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {["first_name", "last_name"].map((field) => (
                    <div key={field} className="space-y-1.5">
                        <span className="text-[11px] font-medium text-muted-foreground/70 pl-0.5">
                            {field.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                        {isPreview ? (
                            <div className="h-10 w-full bg-secondary/40 rounded-lg border border-border/30" />
                        ) : (
                            <input
                                type="text"
                                value={answers[field] ?? ""}
                                onChange={(e) => handleInputChange(field, e.target.value)}
                                className={cn(
                                    "w-full h-12 @lg:h-10 px-3 rounded-lg border bg-transparent text-base @lg:text-sm focus:outline-none focus:ring-2 placeholder:text-muted-foreground/50",
                                    errors[field]
                                        ? "border-destructive focus:ring-destructive/20"
                                        : "border-border/50 focus:ring-primary/20 focus:border-primary"
                                )}
                            />
                        )}
                        {errors[field] && (
                            <p className="text-[10px] text-destructive font-medium pl-0.5 mt-0.5">{errors[field]}</p>
                        )}
                    </div>
                ))}
            </div>
            {["email", "phone"].map((field) => (
                <div key={field} className="space-y-1.5">
                    <span className="text-[11px] font-medium text-muted-foreground/70 pl-0.5">
                        {field === "email" ? "Email Address" : "Phone Number"}
                    </span>
                    {isPreview ? (
                        <div className="h-10 w-full bg-secondary/40 rounded-lg border border-border/30" />
                    ) : (
                        <input
                            type={field === "email" ? "email" : "tel"}
                            value={answers[field] ?? ""}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                            className={cn(
                                "w-full h-12 @lg:h-10 px-3 rounded-lg border bg-transparent text-base @lg:text-sm focus:outline-none focus:ring-2 placeholder:text-muted-foreground/50",
                                errors[field]
                                    ? "border-destructive focus:ring-destructive/20"
                                    : "border-border/50 focus:ring-primary/20 focus:border-primary"
                            )}
                        />
                    )}
                    {errors[field] && (
                        <p className="text-[10px] text-destructive font-medium pl-0.5 mt-0.5">{errors[field]}</p>
                    )}
                </div>
            ))}
            {!isPreview && (
                <Button className="w-full rounded-full h-12 @lg:h-10 mt-2 text-base @lg:text-sm font-semibold" onClick={handleContinue}>
                    Continue
                </Button>
            )}
            {isPreview && (
                <Button className="w-full rounded-full h-12 @lg:h-10 mt-2 text-base @lg:text-sm font-semibold" disabled>Continue</Button>
            )}

            {data.optInText && (
                <p className="text-[10px] text-muted-foreground/60 text-center px-4 leading-relaxed mt-2">
                    {data.optInText}
                </p>
            )}
        </div>
    );
}
