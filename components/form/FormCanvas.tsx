"use client";

import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Paintbrush, Loader2 } from "lucide-react";
import { FormStepRenderer, FormStep, StepType } from "./FormStepRenderer";
import { saveLead, verifyLeadSms, resendLeadSms } from "@/app/actions/leads";
import { BannerModal } from "../builder/BannerModal";

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
    banner?: string | null;
    smsVerification?: boolean;

    /** preview mode only — which step to display */
    activeStepId?: string;

    /** live mode — called after thank-you */
    onComplete?: () => void;

    /** builder mode — call back to update banner in parent state */
    onBannerChange?: (url: string | null) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FormCanvas({
    mode,
    steps,
    brand,
    formId,
    formName,
    webhookUrl,
    banner,
    smsVerification,
    activeStepId,
    onComplete,
    onBannerChange,
}: FormCanvasProps) {
    // ── Live mode state ────────────────────────────────────────────────────────
    const [liveStepId, setLiveStepId] = useState<string>(steps[0]?.id ?? "");
    const [history, setHistory] = useState<string[]>([]);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [submitted, setSubmitted] = useState(false);
    const [verifiedLeadId, setVerifiedLeadId] = useState<string | null>(null);
    const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const isSubmittingRef = useRef(false);

    // Determine current step based on mode
    const currentStepId = mode === "preview" ? (activeStepId ?? steps[0]?.id) : (liveStepId || steps[0]?.id);
    const currentStep = steps.find(s => s.id === currentStepId) || steps[0] || null;

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

        // TRIGGER SUBMISSION: If the NEXT step is SMS verification OR the NEXT step is Thank You (and SMS is disabled)
        // We want the lead created BEFORE they see these steps.
        // INTEGRITY CHECK: Don't trigger if we are ALREADY on the SMS step (prevents double trigger on verify success)
        const isArrivingAtSubmissionPoint =
            (nextStep?.type === "sms-verification" || nextStep?.type === "thank-you") &&
            currentStep.type !== "sms-verification" &&
            !submitted &&
            !isSubmittingRef.current;

        if (isArrivingAtSubmissionPoint && formId) {
            setIsLoading(true);
            isSubmittingRef.current = true;
            try {
                const res = await saveLead({ formId, answers });
                if (res.data?.id) {
                    setVerifiedLeadId(res.data.id);
                    // If it was just thank-you (no SMS), mark as submitted
                    if (nextStep?.type === "thank-you") {
                        setSubmitted(true);
                        onComplete?.();
                    }
                } else {
                    // Reset if failed so user can try again
                    isSubmittingRef.current = false;
                }
            } catch (e) {
                console.error("Save lead error:", e);
                isSubmittingRef.current = false;
            } finally {
                setIsLoading(false);
            }
        }

        setHistory(prev => [...prev, currentStepId]);
        setLiveStepId(nextId);
    }, [currentStep, currentStepId, resolveNextStep, answers, formId, steps, onComplete, submitted]);

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

    // ── SMS Verification handler ───────────────────────────────────────────
    const handleSmsVerify = useCallback(async (code: string) => {
        if (!verifiedLeadId) return { success: false, error: "Lead session lost" };
        const res = await verifyLeadSms(verifiedLeadId, code);
        if (res.success) {
            setSubmitted(true);
            goNext(); // Standard advance to thank-you
        }
        return res;
    }, [verifiedLeadId, goNext]);

    // ── Option select → immediate advance ──────────────────────────────────────
    const handleOptionSelect = useCallback((optionIndex: number) => {
        // Small delay so the user sees their selection
        setTimeout(() => goNext(optionIndex), 300);
    }, [goNext]);

    // ── Banner ─────────────────────────────────────────────────────────────────
    const bannerSrc = banner ?? brand?.banner_url ?? "/premium_banner_placeholder_1772712966572.png";

    // ── Progress ───────────────────────────────────────────────────────────────
    const showProgress = currentStep && currentStep.type !== "welcome" && currentStep.type !== "thank-you";
    const progressPct = steps.length > 0 ? ((currentIndex + 1) / steps.length) * 100 : 0;

    return (
        <div className="flex-1 overflow-y-auto pt-0 pb-20 relative no-scrollbar @container">
            {/* Banner */}
            <div className="h-[20vh] @sm:h-96 w-full overflow-hidden relative shrink-0 transition-all duration-500">
                <img
                    src={bannerSrc}
                    alt="Brand Banner"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-secondary/5" />

                {/* Floating Update Banner Button (Preview Mode) */}
                {mode === "preview" && (
                    <div className="absolute top-6 right-6 z-10">
                        <button
                            onClick={() => setIsBannerModalOpen(true)}
                            className="bg-background/95 backdrop-blur-md border border-border/60 rounded-full px-4 py-2 shadow-xl flex items-center gap-2 hover:bg-secondary transition-all active:scale-95 group"
                        >
                            <Paintbrush className="w-3.5 h-3.5 text-primary group-hover:rotate-12 transition-transform" />
                            <span className="text-xs font-bold tracking-tight">Update Banner</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Form Card overlapping the banner */}
            <div className="relative -mt-16 px-2 @sm:px-8">
                <div className="w-full max-w-xl mx-auto flex flex-col gap-4">
                    <div className="bg-background rounded-3xl shadow-2xl border border-border/40 min-h-[520px] flex flex-col mb-12 overflow-hidden relative">
                        {/* Back Button */}
                        {mode === "live" &&
                            history.length > 0 &&
                            currentStep?.type !== "thank-you" &&
                            currentStep?.type !== "welcome" && (
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

                        <div className="flex-1 p-6 @sm:p-10 @md:p-16 flex flex-col justify-center relative">
                            {isLoading && (
                                <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary animate-bounce">
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    </div>
                                    <p className="text-sm font-semibold tracking-tight text-foreground/80 animate-pulse">
                                        Submitting your details...
                                    </p>
                                </div>
                            )}

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
                                        onSmsVerify={handleSmsVerify}
                                        onSmsResend={async () => {
                                            if (!verifiedLeadId) return { success: false, error: "Lead ID not found" };
                                            return await resendLeadSms(verifiedLeadId);
                                        }}
                                        onOptionSelect={handleOptionSelect}
                                        leadId={verifiedLeadId}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Banner Update Modal */}
            {mode === "preview" && formId && onBannerChange && (
                <BannerModal
                    isOpen={isBannerModalOpen}
                    onClose={() => setIsBannerModalOpen(false)}
                    formId={formId}
                    currentBanner={banner ?? null}
                    onBannerChange={onBannerChange}
                />
            )}
        </div>
    );
}
