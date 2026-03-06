"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { sansFont } from "@/lib/design-system";
import { BuilderHeader } from "@/components/builder/BuilderHeader";
import { StepList } from "@/components/builder/StepList";
import { StepConfig } from "@/components/builder/StepConfig";
import { FormSettings } from "@/components/builder/FormSettings";
import { FormCanvas } from "@/components/form/FormCanvas";
import {
    getFormWithBrand,
    getFormSteps,
    createStep,
    updateStep,
    reorderSteps,
    updateForm,
} from "@/app/actions/forms";
import { toast } from "sonner";

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
    /** true while the DB write is in-flight (optimistic) */
    _pending?: boolean;
}

/** Default `data` seeds per step type — used for both optimistic UI and DB insert */
function defaultData(type: StepType): Record<string, any> {
    switch (type) {
        case "welcome":
            return { heading: "Welcome to our form", subheading: "Please fill out the details below", buttonText: "Get Started" };
        case "contact":
            return { fields: ["first_name", "last_name", "email", "phone"] };
        case "multi-choice":
            return { question: "", options: ["Option 1", "Option 2"] };
        case "input":
            return { label: "", placeholder: "" };
        case "address":
            return { label: "Where are you located?" };
        case "thank-you":
            return { message: "Thanks for your submission!", subtext: "We'll be in touch soon." };
        default:
            return {};
    }
}

function humanTitle(type: StepType): string {
    switch (type) {
        case "welcome": return "Welcome Page";
        case "contact": return "Contact Details";
        case "multi-choice": return "Multi Choice";
        case "input": return "Text Input";
        case "address": return "Address";
        case "thank-you": return "Thank You Page";
        default: return type;
    }
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const DesktopIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="20" height="14" x="2" y="3" rx="2" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
    </svg>
);

const TabletIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="16" height="20" x="4" y="2" rx="2" />
        <path d="M12 18h.01" />
    </svg>
);

const MobileIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="10" height="18" x="7" y="3" rx="2" />
        <path d="M12 17h.01" />
    </svg>
);

// ─── Builder Page ─────────────────────────────────────────────────────────────

function BuilderContent() {
    const searchParams = useSearchParams();
    const formId = searchParams.get("formId");

    const [isLoading, setIsLoading] = useState(!!formId);
    const [formName, setFormName] = useState("New Lead Form");
    const [brand, setBrand] = useState<{ name: string; logo_url?: string | null; banner_url?: string | null } | null>(null);
    const [steps, setSteps] = useState<FormStep[]>([]);
    const [currentStepId, setCurrentStepId] = useState<string>("");
    const [webhookUrl, setWebhookUrl] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");

    // Debounce refs: map of stepId → timeout handle
    const debounceRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    // ── Load form on mount ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!formId) {
            // No DB form — use in-memory defaults
            const defaults: FormStep[] = [
                { id: "1", type: "welcome", title: "Welcome Page", data: defaultData("welcome") },
                { id: "2", type: "contact", title: "Contact Details", data: defaultData("contact") },
                { id: "3", type: "thank-you", title: "Thank You Page", data: defaultData("thank-you") },
            ];
            setSteps(defaults);
            setCurrentStepId(defaults[0].id);
            return;
        }

        (async () => {
            setIsLoading(true);
            const [formRes, stepsRes] = await Promise.all([
                getFormWithBrand(formId),
                getFormSteps(formId),
            ]);

            if (formRes.error || !formRes.data) {
                toast.error("Could not load form");
                setIsLoading(false);
                return;
            }

            const form = formRes.data as any;
            setFormName(form.name ?? "Untitled Form");
            setWebhookUrl(form.webhook_url ?? "");
            if (form.brands) setBrand(form.brands);

            const loadedSteps: FormStep[] = (stepsRes.data as any[]).map(s => ({
                id: s.id,
                type: s.type as StepType,
                title: s.title,
                data: s.data ?? {},
            }));

            setSteps(loadedSteps);
            setCurrentStepId(loadedSteps[0]?.id ?? "");
            setIsLoading(false);
        })();
    }, [formId]);

    // ── Update Page Title Dynamically ──────────────────────────────────────────
    // Moving this to a JSX <title> tag to avoid Next.js App Router metadata overriding it

    const currentStep = steps.find(s => s.id === currentStepId) ?? steps[0];

    // ── Autosave Meta ────────────────────────────────────────────────────────
    const setFormNameWithSave = useCallback((name: string) => {
        setFormName(name);
        if (!formId) return;

        clearTimeout(debounceRefs.current["form_meta"]);
        debounceRefs.current["form_meta"] = setTimeout(async () => {
            setIsSaving(true);
            await updateForm(formId, { name });
            setIsSaving(false);
        }, 500);
    }, [formId]);

    const setWebhookUrlWithSave = useCallback((url: string) => {
        setWebhookUrl(url);
        if (!formId) return;

        clearTimeout(debounceRefs.current["form_meta_webhook"]);
        debounceRefs.current["form_meta_webhook"] = setTimeout(async () => {
            setIsSaving(true);
            await updateForm(formId, { webhook_url: url });
            setIsSaving(false);
        }, 500);
    }, [formId]);

    // ── Add Step (optimistic) ──────────────────────────────────────────────────
    const addStep = useCallback(async (type: StepType) => {
        const tempId = `tmp_${Math.random().toString(36).substr(2, 9)}`;
        const newStep: FormStep = {
            id: tempId,
            type,
            title: humanTitle(type),
            data: defaultData(type),
            _pending: true,
        };

        // 1. Optimistically add to UI
        setSteps(prev => [...prev, newStep]);
        setCurrentStepId(tempId);

        if (!formId) return; // no-DB mode, keep temp ID

        // 2. Persist to Supabase
        setIsSaving(true);
        const { data, error } = await createStep({
            formId,
            type,
            title: newStep.title,
            data: newStep.data,
            order: steps.length, // append at end
        });
        setIsSaving(false);

        if (error || !data) {
            toast.error("Failed to create step");
            // Roll back optimistic step
            setSteps(prev => prev.filter(s => s.id !== tempId));
            return;
        }

        // 3. Replace temp ID with real DB id
        setSteps(prev =>
            prev.map(s =>
                s.id === tempId
                    ? { id: data.id, type: data.type as StepType, title: data.title, data: data.data }
                    : s
            )
        );
        setCurrentStepId(data.id);
    }, [formId, steps.length]);

    // ── Update Step Data (debounced) ───────────────────────────────────────────
    const updateStepData = useCallback((stepId: string, newData: any) => {
        // Merge locally immediately
        setSteps(prev =>
            prev.map(s =>
                s.id === stepId ? { ...s, data: { ...s.data, ...newData } } : s
            )
        );

        if (!formId || stepId.startsWith("tmp_")) return;

        // Debounce DB write by 300ms
        clearTimeout(debounceRefs.current[stepId]);
        debounceRefs.current[stepId] = setTimeout(async () => {
            setIsSaving(true);
            const step = steps.find(s => s.id === stepId);
            if (step) {
                await updateStep(stepId, { data: { ...step.data, ...newData } });
            }
            setIsSaving(false);
        }, 300);
    }, [formId, steps]);

    // ── Update Step Title (debounced) ──────────────────────────────────────────
    const updateStepTitle = useCallback((stepId: string, title: string) => {
        setSteps(prev =>
            prev.map(s => s.id === stepId ? { ...s, title } : s)
        );

        if (!formId || stepId.startsWith("tmp_")) return;

        clearTimeout(debounceRefs.current[`${stepId}_title`]);
        debounceRefs.current[`${stepId}_title`] = setTimeout(async () => {
            setIsSaving(true);
            await updateStep(stepId, { title });
            setIsSaving(false);
        }, 300);
    }, [formId]);

    // ── Reorder Steps ──────────────────────────────────────────────────────────
    const handleReorder = useCallback((reordered: FormStep[]) => {
        setSteps(reordered);

        if (!formId) return;

        // Batch update order in Supabase (skip temp/pending steps)
        const updates = reordered
            .map((s, i) => ({ id: s.id, order: i }))
            .filter(u => !u.id.startsWith("tmp_"));

        setIsSaving(true);
        reorderSteps(updates).finally(() => setIsSaving(false));
    }, [formId]);

    // ── StepConfig unified onUpdate — handles title separately ─────────────────
    const handleConfigUpdate = useCallback((data: any) => {
        if (!currentStep) return;
        if ("title" in data) {
            updateStepTitle(currentStep.id, data.title);
        } else {
            updateStepData(currentStep.id, data);
        }
    }, [currentStep, updateStepData, updateStepTitle]);

    // ── Loading State ──────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading form…</p>
                </div>
            </div>
        );
    }

    // Banner: use brand banner if available, else fallback placeholder
    const bannerSrc = brand?.banner_url ?? "/premium_banner_placeholder_1772712966572.png";

    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden">
            <title>Builder - FormState</title>
            {/* Header */}
            <BuilderHeader
                formName={formName}
                onNameChange={setFormNameWithSave}
                brand={brand ?? undefined}
                formId={formId}
                isSaving={isSaving}
            />

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Step Settings */}
                <aside className="w-80 border-r border-border bg-background overflow-y-auto hidden lg:block">
                    {currentStep && (
                        <StepConfig
                            step={currentStep}
                            allSteps={steps}
                            onUpdate={handleConfigUpdate}
                        />
                    )}
                </aside>

                {/* Main Canvas */}
                <main className="flex-1 relative flex flex-col bg-secondary/20 overflow-hidden items-center justify-center">
                    {/* Viewport Toggle */}
                    <div className="absolute top-6 left-6 z-40 bg-background/95 backdrop-blur-md border border-border/60 rounded-full p-1.5 shadow-sm flex items-center gap-1">
                        <button
                            onClick={() => setViewport("desktop")}
                            className={cn(
                                "p-2 rounded-full transition-all duration-200",
                                viewport === "desktop"
                                    ? "bg-foreground text-background shadow-sm"
                                    : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                            )}
                            title="Desktop View"
                        >
                            <DesktopIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewport("tablet")}
                            className={cn(
                                "p-2 rounded-full transition-all duration-200",
                                viewport === "tablet"
                                    ? "bg-foreground text-background shadow-sm"
                                    : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                            )}
                            title="Tablet View"
                        >
                            <TabletIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewport("mobile")}
                            className={cn(
                                "p-2 rounded-full transition-all duration-200",
                                viewport === "mobile"
                                    ? "bg-foreground text-background shadow-sm"
                                    : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                            )}
                            title="Mobile View"
                        >
                            <MobileIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <div
                        className={cn(
                            "flex-1 w-full bg-background transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden relative",
                            viewport === "desktop" && "max-w-full h-full",
                            viewport === "tablet" && "max-w-[768px] lg:my-8 rounded-[2rem] border border-border shadow-2xl h-[calc(100%-4rem)] max-h-[1024px]",
                            viewport === "mobile" && "max-w-[390px] lg:my-10 rounded-[3rem] border-[8px] border-zinc-950 shadow-2xl h-[calc(100%-5rem)] max-h-[844px] ring-1 ring-border/20"
                        )}
                    >
                        <FormCanvas
                            mode="preview"
                            steps={steps}
                            brand={brand}
                            activeStepId={currentStepId}
                        />
                    </div>

                    {/* Step Navigation */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 w-auto min-w-[300px] max-w-[95%] pointer-events-none">
                        <div className="pointer-events-auto">
                            <StepList
                                steps={steps}
                                currentStepId={currentStepId}
                                onStepSelect={setCurrentStepId}
                                onAddStep={addStep}
                                onStepsReorder={handleReorder}
                            />
                        </div>
                    </div>
                </main>

                {/* Right Sidebar - Form Settings */}
                <aside className="w-80 border-l border-border bg-background overflow-y-auto hidden lg:block">
                    <FormSettings
                        formName={formName}
                        formId={formId}
                        steps={steps}
                        webhookUrl={webhookUrl}
                        onWebhookChange={setWebhookUrlWithSave}
                    />
                </aside>
            </div>
        </div>
    );
}

export default function BuilderPage() {
    return (
        <React.Suspense fallback={
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading form…</p>
                </div>
            </div>
        }>
            <BuilderContent />
        </React.Suspense>
    );
}
