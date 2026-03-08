"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Paintbrush, Loader2 } from "lucide-react";
import { FormStepRenderer, FormStep } from "./FormStepRenderer";
import { verifyLeadSms, resendLeadSms } from "@/app/actions/leads";
import { BannerModal } from "../builder/BannerModal";
import { useFormCanvas } from "@/hooks/useFormCanvas";

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
    const {
        currentStepId,
        currentStep,
        currentIndex,
        answers,
        history,
        submitted,
        setSubmitted,
        verifiedLeadId,
        isLoading,
        handleAnswer,
        goNext,
        goBack
    } = useFormCanvas({ steps, mode, formId, onComplete, activeStepId });

    const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

    // ── SMS Verification handler ───────────────────────────────────────────
    const handleSmsVerify = async (code: string) => {
        if (!verifiedLeadId) return { success: false, error: "Lead session lost" };
        const res = await verifyLeadSms(verifiedLeadId, code);
        if (res.success) {
            setSubmitted(true);
            goNext(); // Standard advance to thank-you
        }
        return res;
    };

    // ── Option select → immediate advance ──────────────────────────────────────
    const handleOptionSelect = (optionIndex: number) => {
        // Small delay so the user sees their selection
        setTimeout(() => goNext(optionIndex), 300);
    };

    // ── Banner ─────────────────────────────────────────────────────────────────
    const bannerSrc = banner ?? brand?.banner_url ?? "/premium_banner_placeholder_1772712966572.png";

    // ── Progress ───────────────────────────────────────────────────────────────
    const showProgress = currentStep && currentStep.type !== "welcome" && currentStep.type !== "thank-you";
    const progressPct = steps.length > 0 ? ((currentIndex + 1) / steps.length) * 100 : 0;

    return (
        <div className="flex-1 overflow-y-auto pt-0 pb-20 relative no-scrollbar @container">
            {/* Banner */}
            <div className="h-[20vh] @lg:h-96 w-full overflow-hidden relative shrink-0 transition-all duration-500">
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
            <div className="relative -mt-16 px-2 @lg:px-8">
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

                        <div className="flex-1 p-6 @lg:p-10 @xl:p-16 flex flex-col justify-center relative">
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
