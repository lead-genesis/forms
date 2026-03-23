"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { FormStep } from "@/lib/builder";
import { sansFont } from "@/lib/design-system";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowRight, Trash2 } from "lucide-react";
import { WelcomeConfig } from "./steps/WelcomeConfig";
import { ContactConfig } from "./steps/ContactConfig";
import { MultiChoiceConfig } from "./steps/MultiChoiceConfig";
import { InputConfig } from "./steps/InputConfig";
import { AddressConfig } from "./steps/AddressConfig";
import { ThankYouConfig } from "./steps/ThankYouConfig";
import { SmsVerificationConfig } from "./steps/SmsVerificationConfig";

interface StepConfigProps {
    step: FormStep;
    allSteps: FormStep[];
    onUpdate: (data: any) => void;
    onDelete?: (stepId: string) => void;
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function StepPicker({
    value,
    allSteps,
    currentStepId,
    onChange,
    label = "Then go to",
}: {
    value: string | null;
    allSteps: FormStep[];
    currentStepId: string;
    onChange: (id: string | null) => void;
    label?: string;
}) {
    const others = allSteps.filter(s => s.id !== currentStepId);
    return (
        <div className="flex items-center gap-2">
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
            <select
                value={value ?? ""}
                onChange={e => onChange(e.target.value || null)}
                className="flex-1 text-[12px] text-muted-foreground bg-secondary/30 border border-border/40 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
            >
                <option value="">{label === "Then go to" ? "Next step (default)" : "Next step"}</option>
                {others.map((s) => (
                    <option key={s.id} value={s.id}>
                        Step {allSteps.findIndex(x => x.id === s.id) + 1} — {s.title}
                    </option>
                ))}
            </select>
        </div>
    );
}

function LogicSection({
    step,
    allSteps,
    onUpdate,
}: {
    step: FormStep;
    allSteps: FormStep[];
    onUpdate: (data: any) => void;
}) {
    const isTerminal = step.type === "thank-you";
    if (isTerminal) return null;

    const nextStepId = step.data?.logic?.nextStepId ?? null;

    return (
        <div className="space-y-3 pt-4 border-t border-border/60">
            <Label className="uppercase text-[10px] tracking-widest opacity-50 font-bold flex items-center gap-1.5">
                <ArrowRight className="w-3 h-3" />
                Logic
            </Label>
            <StepPicker
                value={nextStepId}
                allSteps={allSteps}
                currentStepId={step.id}
                onChange={id => onUpdate({ logic: { ...(step.data?.logic ?? {}), nextStepId: id } })}
                label="Then go to"
            />
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function StepConfig({ step, allSteps, onUpdate, onDelete }: StepConfigProps) {
    const { type, data } = step;

    const renderFields = () => {
        switch (type) {
            case "welcome":
                return <WelcomeConfig data={data} onUpdate={onUpdate} />;
            case "contact":
                return <ContactConfig data={data} onUpdate={onUpdate} />;
            case "multi-choice":
                return <MultiChoiceConfig data={data} allSteps={allSteps} stepId={step.id} onUpdate={onUpdate} />;
            case "input":
                return <InputConfig data={data} onUpdate={onUpdate} />;
            case "address":
                return <AddressConfig data={data} onUpdate={onUpdate} />;
            case "thank-you":
                return <ThankYouConfig data={data} onUpdate={onUpdate} />;
            case "sms-verification":
                return <SmsVerificationConfig data={data} onUpdate={onUpdate} />;
            default:
                return (
                    <div className="p-4 bg-secondary/10 rounded-lg text-xs text-muted-foreground italic border border-border/50 text-center uppercase tracking-widest font-bold opacity-60">
                        {String(type).replace("-", " ")} settings coming soon
                    </div>
                );
        }
    };

    return (
        <div className="p-6 space-y-8">
            <div>
                <h3 className={cn("text-lg font-bold mb-1", sansFont)}>Step Settings</h3>
                <p className="text-xs text-muted-foreground">Configure how this step looks and behaves.</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <Label className="uppercase text-[10px] tracking-widest opacity-50 font-bold">Step Title</Label>
                    <Input
                        value={step.title}
                        onChange={(e) => onUpdate({ title: e.target.value })}
                        className="font-medium"
                    />
                </div>

                <div className="h-px bg-border" />

                <div className="space-y-4">
                    <Label className="uppercase text-[10px] tracking-widest opacity-50 font-bold">Content</Label>
                    {renderFields()}
                </div>

                {type !== "multi-choice" && (
                    <LogicSection step={step} allSteps={allSteps} onUpdate={onUpdate} />
                )}

                {/* Delete step */}
                {onDelete && (
                    <div className="pt-4 border-t border-border/60">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 gap-2 font-medium"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete Step
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete &ldquo;{step.title}&rdquo;?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently remove this step and all its configuration. Any logic pointing to this step will fall back to the default flow.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => onDelete(step.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}
            </div>
        </div>
    );
}
