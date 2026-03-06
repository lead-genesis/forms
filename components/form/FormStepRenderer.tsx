"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { sansFont } from "@/lib/design-system";
import { motion } from "framer-motion";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StepType =
    | "welcome"
    | "multi-choice"
    | "address"
    | "input"
    | "contact"
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
    onOptionSelect?: (optionIndex: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FormStepRenderer({
    step,
    allSteps,
    mode,
    brand,
    answers = {},
    onAnswer,
    onNext,
    onOptionSelect,
}: FormStepRendererProps) {
    const { type, data } = step;
    const isPreview = mode === "preview";

    const variants = {
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
        exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
    };

    const handleInputChange = (key: string, value: any) => {
        if (!isPreview && onAnswer) onAnswer(key, value);
    };

    const renderContent = () => {
        switch (type) {
            case "welcome":
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

            case "contact":
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
                                            className="w-full h-10 px-3 rounded-lg border border-border/50 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/50"
                                        />
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
                                        className="w-full h-10 px-3 rounded-lg border border-border/50 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/50"
                                    />
                                )}
                            </div>
                        ))}
                        {!isPreview && (
                            <Button className="w-full rounded-lg h-10 mt-2 text-sm font-semibold" onClick={onNext}>
                                Continue
                            </Button>
                        )}
                        {isPreview && (
                            <Button className="w-full rounded-lg h-10 mt-2 text-sm font-semibold" disabled>Continue</Button>
                        )}

                        {data.optInText && (
                            <p className="text-[10px] text-muted-foreground/60 text-center px-4 leading-relaxed mt-2">
                                {data.optInText}
                            </p>
                        )}
                    </div>
                );

            case "multi-choice": {
                const rawOptions = data.options ?? ["Option 1", "Option 2", "Option 3"];
                const options: { label: string; nextStepId?: string | null }[] = rawOptions.map((o: any) =>
                    typeof o === "string" ? { label: o, nextStepId: null } : o
                );
                return (
                    <div className="space-y-5 w-full max-w-sm mx-auto">
                        <h2 className={cn("text-xl @sm:text-2xl font-bold text-center", sansFont)}>
                            {data.question || "Select an option"}
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

            case "input":
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
                                    onChange={(e) => handleInputChange(`${step.id}_input`, e.target.value)}
                                    placeholder={data.placeholder || "Type something..."}
                                    className="w-full h-10 px-3 rounded-lg border border-border/50 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/50"
                                />
                                <Button className="w-full rounded-lg h-10 text-sm font-semibold" onClick={onNext}>
                                    Continue
                                </Button>
                            </>
                        )}
                    </div>
                );

            case "address":
                return (
                    <div className="space-y-5 w-full max-w-sm mx-auto">
                        <h2 className={cn("text-xl @sm:text-2xl font-bold text-center", sansFont)}>
                            {data.label || "Where are you located?"}
                        </h2>
                        {isPreview ? (
                            <div className="h-10 w-full bg-secondary/40 rounded-lg border border-border/30" />
                        ) : (
                            <>
                                <input
                                    type="text"
                                    value={answers[`${step.id}_address`] ?? ""}
                                    onChange={(e) => handleInputChange(`${step.id}_address`, e.target.value)}
                                    placeholder="Start typing your address..."
                                    className="w-full h-10 px-3 rounded-lg border border-border/50 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/50"
                                />
                                <Button className="w-full rounded-lg h-10 text-sm font-semibold" onClick={onNext}>
                                    Continue
                                </Button>
                            </>
                        )}
                    </div>
                );

            case "thank-you":
                return (
                    <div className="text-center space-y-4">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
                            className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto"
                        >
                            <Check className="w-7 h-7" strokeWidth={3} />
                        </motion.div>
                        <h2 className={cn("text-xl @sm:text-2xl font-bold", sansFont)}>{data.message || "Thank You!"}</h2>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">{data.subtext || "Your details have been submitted."}</p>
                    </div>
                );

            default:
                return (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/30 border border-dashed border-border/50">
                            <span className="text-sm text-muted-foreground">Configure this <strong>{String(type).replace("-", " ")}</strong> step in the sidebar</span>
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
