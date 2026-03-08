"use client";

import React from "react";
import { motion } from "framer-motion";
import { WelcomeStep } from "./steps/WelcomeStep";
import { ContactStep } from "./steps/ContactStep";
import { MultiChoiceStep } from "./steps/MultiChoiceStep";
import { InputStep } from "./steps/InputStep";
import { AddressStep } from "./steps/AddressStep";
import { SmsVerificationStep } from "./steps/SmsVerificationStep";
import { ThankYouStep } from "./steps/ThankYouStep";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StepType =
    | "welcome"
    | "multi-choice"
    | "address"
    | "input"
    | "contact"
    | "sms-verification"
    | "thank-you";

export interface FormStep {
    id: string;
    type: StepType;
    title: string;
    data: any;
    _pending?: boolean;
}

interface FormStepRendererProps {
    step: FormStep;
    allSteps: FormStep[];
    mode: "preview" | "live";
    brand?: { name: string; logo_url?: string | null } | null;
    answers?: Record<string, any>;
    onAnswer?: (key: string, value: any) => void;
    onNext?: () => void;
    onSmsVerify?: (code: string) => Promise<{ success: boolean; error?: string }>;
    onSmsResend?: () => Promise<{ success: boolean; error?: string }>;
    onOptionSelect?: (optionIndex: number) => void;
    leadId?: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * FormStepRenderer acts as a router for specialized form step components.
 * This decomposition improves maintainability and reduces the footprint of this file.
 */
export function FormStepRenderer({
    step,
    allSteps,
    mode,
    brand,
    answers = {},
    onAnswer,
    onNext,
    onSmsVerify,
    onSmsResend,
    onOptionSelect,
}: FormStepRendererProps) {
    const isPreview = mode === "preview";

    const variants = {
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
        exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
    };

    const renderContent = () => {
        switch (step.type) {
            case "welcome":
                return (
                    <WelcomeStep
                        step={step}
                        brand={brand}
                        onNext={onNext}
                        isPreview={isPreview}
                    />
                );

            case "contact":
                return (
                    <ContactStep
                        step={step}
                        answers={answers}
                        onAnswer={onAnswer}
                        onNext={onNext}
                        isPreview={isPreview}
                    />
                );

            case "multi-choice":
                return (
                    <MultiChoiceStep
                        step={step}
                        allSteps={allSteps}
                        answers={answers}
                        onAnswer={onAnswer}
                        onOptionSelect={onOptionSelect}
                        isPreview={isPreview}
                    />
                );

            case "input":
                return (
                    <InputStep
                        step={step}
                        answers={answers}
                        onAnswer={onAnswer}
                        onNext={onNext}
                        isPreview={isPreview}
                    />
                );

            case "address":
                return (
                    <AddressStep
                        step={step}
                        answers={answers}
                        onAnswer={onAnswer}
                        onNext={onNext}
                        isPreview={isPreview}
                    />
                );

            case "sms-verification":
                return (
                    <SmsVerificationStep
                        phoneNumber={answers.phone || answers.phoneNumber || ""}
                        onVerify={onSmsVerify}
                        onResend={onSmsResend}
                        onSuccess={onNext}
                    />
                );

            case "thank-you":
                return <ThankYouStep step={step} />;

            default:
                return (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/30 border border-dashed border-border/50">
                            <span className="text-sm text-muted-foreground">
                                Step type <strong>{step.type}</strong> not implemented
                            </span>
                        </div>
                    </div>
                );
        }
    };

    return (
        <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col justify-center min-h-[300px]"
        >
            {renderContent()}
        </motion.div>
    );
}


