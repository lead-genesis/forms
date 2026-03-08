"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { FormStep } from "@/lib/builder";
import { motion } from "framer-motion";
import { sansFont } from "@/lib/design-system";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

interface StepPreviewProps {
    step: FormStep;
    allSteps?: FormStep[];
    brandLogoUrl?: string | null;
    brandName?: string | null;
}

export function StepPreview({ step, allSteps = [], brandLogoUrl, brandName }: StepPreviewProps) {
    const { type, data } = step;

    const variants = {
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
        exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
    };

    const renderContent = () => {
        switch (type) {
            case "welcome":
                return (
                    <div className="text-center space-y-5">
                        {/* Brand logo */}
                        {(brandLogoUrl || brandName) && (
                            <div className="flex justify-center mb-2">
                                {brandLogoUrl ? (
                                    <img
                                        src={brandLogoUrl}
                                        alt={brandName ?? "Brand"}
                                        className="w-20 h-20 rounded-2xl object-cover shadow-sm border border-border/20"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center text-2xl font-bold text-muted-foreground">
                                        {brandName?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                        )}
                        <h1 className={cn("text-3xl md:text-4xl font-bold tracking-tight leading-tight", sansFont)}>
                            {data.heading || "Welcome"}
                        </h1>
                        <p className="text-base text-muted-foreground max-w-sm mx-auto leading-relaxed">
                            {data.subheading || "Please fill out this form"}
                        </p>
                        <Button size="lg" className="rounded-full px-8 h-12 text-sm font-semibold mt-4 gap-2">
                            {data.buttonText || "Get Started"}
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                );

            case "contact":
                return (
                    <div className="space-y-5 w-full max-w-sm mx-auto">
                        <h2 className={cn("text-2xl font-bold text-center mb-2", sansFont)}>Contact Details</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {["First Name", "Last Name"].map((label) => (
                                <div key={label} className="space-y-1.5">
                                    <span className="text-[11px] font-medium text-muted-foreground/70 pl-0.5">{label}</span>
                                    <div className="h-10 w-full bg-secondary/40 rounded-lg border border-border/30" />
                                </div>
                            ))}
                        </div>
                        {["Email Address", "Phone Number"].map((label) => (
                            <div key={label} className="space-y-1.5">
                                <span className="text-[11px] font-medium text-muted-foreground/70 pl-0.5">{label}</span>
                                <div className="h-10 w-full bg-secondary/40 rounded-lg border border-border/30" />
                            </div>
                        ))}
                        <Button className="w-full rounded-lg h-10 mt-2 text-sm font-semibold">Continue</Button>
                    </div>
                );

            case "multi-choice": {
                const rawOptions = data.options ?? ["Option 1", "Option 2", "Option 3"];
                const options: { label: string; nextStepId?: string | null }[] = rawOptions.map((o: any) =>
                    typeof o === "string" ? { label: o, nextStepId: null } : o
                );
                return (
                    <div className="space-y-5 w-full max-w-sm mx-auto">
                        <h2 className={cn("text-2xl font-bold text-center", sansFont)}>
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
                                return (
                                    <button
                                        key={i}
                                        className="w-full px-4 py-3 rounded-lg border border-border/50 hover:border-primary/40 hover:bg-primary/3 transition-all text-left flex items-center gap-3 group"
                                    >
                                        <div className="w-5 h-5 rounded-full border-2 border-border/50 group-hover:border-primary/50 shrink-0 flex items-center justify-center" />
                                        <span className="text-sm font-medium text-foreground/80 flex-1">{opt.label}</span>
                                        {routeStep && (
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
                        <h2 className={cn("text-2xl font-bold", sansFont)}>{data.message || "Thank You!"}</h2>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">{data.subtext || "Your details have been submitted."}</p>
                    </div>
                );

            default:
                return (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/30 border border-dashed border-border/50">
                            <span className="text-sm text-muted-foreground">Configure this <strong>{type.replace("-", " ")}</strong> step in the sidebar</span>
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
