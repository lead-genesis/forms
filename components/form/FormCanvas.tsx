"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { FormStepRenderer, FormStep, StepType } from "./FormStepRenderer";
import { saveLead } from "@/app/actions/leads";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Brand {
    name: string;
    logo_url?: string | null;
    banner_url?: string | null;
}

interface FormCanvasProps {
    mode: "preview" | "live";
    steps: FormStep[];
    brand?: Brand | null;
    formId?: string;
    formName?: string;
    webhookUrl?: string;

    /** preview mode only — which step to display */
    activeStepId?: string;

    /** live mode — called after thank-you */
    onComplete?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FormCanvas({
    mode,
    steps,
    brand,
    formId,
    formName,
    webhookUrl,
    activeStepId,
    onComplete,
}: FormCanvasProps) {
    // ── Live mode state ────────────────────────────────────────────────────────
    const [liveStepId, setLiveStepId] = useState<string>(steps[0]?.id ?? "");
    const [history, setHistory] = useState<string[]>([]);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [submitted, setSubmitted] = useState(false);

    // Determine current step based on mode
    const currentStepId = mode === "preview" ? (activeStepId ?? steps[0]?.id) : liveStepId;
    const currentStep = steps.find(s => s.id === currentStepId) ?? steps[0];
    const currentIndex = steps.findIndex(s => s.id === currentStepId);

    // ── Answer handler ─────────────────────────────────────────────────────────
    const handleAnswer = useCallback((key: string, value: any) => {
        setAnswers(prev => ({ ...prev, [key]: value }));
    }, []);

    // ── Resolve next step with logic ───────────────────────────────────────────
    const resolveNextStep = useCallback((step: FormStep, optionIndex?: number): string | null => {
        // Multi-choice: check per-option routing
        if (step.type === "multi-choice" && optionIndex !== undefined) {
            const opts = step.data?.options ?? [];
            const opt = typeof opts[optionIndex] === "object" ? opts[optionIndex] : null;
            if (opt?.nextStepId && steps.some(s => s.id === opt.nextStepId)) {
                return opt.nextStepId;
            }
        }

        // General logic check
        const nextId = step.data?.logic?.nextStepId;
        if (nextId && steps.some(s => s.id === nextId)) return nextId;

        // Default: next in order
        const idx = steps.findIndex(s => s.id === step.id);
        return idx < steps.length - 1 ? steps[idx + 1].id : null;
    }, [steps]);

    // ── Navigate to next step ──────────────────────────────────────────────────
    const goNext = useCallback(async (optionIndex?: number) => {
        if (!currentStep) return;

        const nextId = resolveNextStep(currentStep, optionIndex);
        if (!nextId) return;

        const nextStep = steps.find(s => s.id === nextId);

        // If we're arriving at thank-you, submit the data
        if (nextStep?.type === "thank-you" && !submitted) {
            setSubmitted(true);

            // Save lead to Supabase (which also triggers webhook internally)
            if (formId) {
                try {
                    await saveLead({ formId, answers });
                } catch (e) {
                    console.error("Save lead error:", e);
                }
            }
            onComplete?.();
        }

        setHistory(prev => [...prev, currentStepId]);
        setLiveStepId(nextId);
    }, [currentStep, currentStepId, resolveNextStep, answers, formId, webhookUrl, submitted, steps, onComplete]);

    // ── Navigate backward ──────────────────────────────────────────────────────
    const goBack = useCallback(() => {
        setHistory(prev => {
            if (prev.length === 0) return prev;
            const newHistory = [...prev];
            const prevId = newHistory.pop()!;
            setLiveStepId(prevId);
            return newHistory;
        });
    }, []);

    // ── Option select → immediate advance ──────────────────────────────────────
    const handleOptionSelect = useCallback((optionIndex: number) => {
        // Small delay so the user sees their selection
        setTimeout(() => goNext(optionIndex), 300);
    }, [goNext]);

    // ── Banner ─────────────────────────────────────────────────────────────────
    const bannerSrc = brand?.banner_url ?? "/premium_banner_placeholder_1772712966572.png";

    // ── Progress ───────────────────────────────────────────────────────────────
    const showProgress = currentStep && currentStep.type !== "welcome" && currentStep.type !== "thank-you";
    const progressPct = steps.length > 0 ? ((currentIndex + 1) / steps.length) * 100 : 0;

    return (
        <div className="flex-1 overflow-y-auto pt-0 pb-20 relative no-scrollbar @container">
            {/* Banner */}
            <div className="h-72 @sm:h-96 w-full overflow-hidden relative shrink-0 transition-all duration-500">
                <img
                    src={bannerSrc}
                    alt="Brand Banner"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-secondary/5" />
            </div>

            {/* Form Card overlapping the banner */}
            <div className="relative -mt-32 px-4 @sm:px-8">
                <div className="w-full max-w-xl mx-auto flex flex-col gap-4">
                    <div className="bg-background rounded-3xl shadow-2xl border border-border/40 min-h-[520px] flex flex-col mb-12 overflow-hidden relative">
                        {/* Back Button */}
                        {mode === "live" && history.length > 0 && currentStep?.type !== "thank-you" && (
                            <button
                                onClick={goBack}
                                className="absolute top-6 left-6 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-secondary/30 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                aria-label="Go back"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        )}

                        {/* Progress bar */}
                        {showProgress && (
                            <div className="w-full h-1.5 bg-secondary/20 relative">
                                <motion.div
                                    key={currentStepId}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPct}%` }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="h-full bg-primary"
                                />
                            </div>
                        )}

                        <div className="flex-1 p-6 @sm:p-10 @md:p-16 flex flex-col justify-center">
                            <AnimatePresence mode="wait">
                                {currentStep && (
                                    <FormStepRenderer
                                        key={currentStep.id}
                                        step={currentStep}
                                        allSteps={steps}
                                        mode={mode}
                                        brand={brand}
                                        answers={answers}
                                        onAnswer={handleAnswer}
                                        onNext={() => goNext()}
                                        onOptionSelect={handleOptionSelect}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
