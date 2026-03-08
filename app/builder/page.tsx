"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { BuilderHeader } from "@/components/builder/BuilderHeader";
import { StepList } from "@/components/builder/StepList";
import { StepConfig } from "@/components/builder/StepConfig";
import { FormSettings } from "@/components/builder/FormSettings";
import { FormCanvas } from "@/components/form/FormCanvas";
import {
    getForm,
    getFormSteps,
    createStep,
    updateStep,
    reorderSteps,
    updateForm,
} from "@/app/actions/forms";
import { toast } from "sonner";
import { FormStep, StepType, defaultData, humanTitle } from "@/lib/builder";
import { ViewportToggle, ViewportMode } from "@/components/builder/ViewportToggle";
import { useFormAutosave } from "./hooks/useFormAutosave";

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
    const [subdomain, setSubdomain] = useState("");
    const [status, setStatus] = useState("draft");
    const [banner, setBanner] = useState<string | null>(null);
    const [smsVerification, setSmsVerification] = useState(false);
    const [customPageTitle, setCustomPageTitle] = useState("");
    const [customSiteDescription, setCustomSiteDescription] = useState("");
    const [viewport, setViewport] = useState<ViewportMode>("desktop");

    const { isSaving, debouncedSave, saveField } = useFormAutosave(formId);

    // Consolidate dynamic title updates
    useEffect(() => {
        const title = formName || "Form Builder";
        document.title = `${title} (Builder)`;
    }, [formName]);

    // ── Load form on mount ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!formId) {
            const defaults: FormStep[] = [
                { id: "1", type: "welcome", title: humanTitle("welcome"), data: defaultData("welcome") },
                { id: "2", type: "contact", title: humanTitle("contact"), data: defaultData("contact") },
                { id: "3", type: "thank-you", title: humanTitle("thank-you"), data: defaultData("thank-you") },
            ];
            setSteps(defaults);
            setCurrentStepId(defaults[0].id);
            return;
        }

        (async () => {
            setIsLoading(true);
            const [formRes, stepsRes] = await Promise.all([
                getForm(formId),
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
            setSubdomain(form.subdomain ?? "");
            setStatus(form.status ?? "draft");
            setBanner(form.banner ?? null);
            setSmsVerification(form.sms_verification ?? false);
            setCustomPageTitle(form.custom_page_title ?? "");
            setCustomSiteDescription(form.custom_site_description ?? "");
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

    const currentStep = steps.find(s => s.id === currentStepId) ?? steps[0];

    // ── Autosave Meta ────────────────────────────────────────────────────────
    const setFormNameWithSave = useCallback((name: string) => {
        setFormName(name);
        debouncedSave("name", name);
    }, [debouncedSave]);

    const setWebhookUrlWithSave = useCallback((url: string) => {
        setWebhookUrl(url);
        debouncedSave("webhook_url", url);
    }, [debouncedSave]);

    const setStatusWithSave = useCallback((newStatus: string) => {
        setStatus(newStatus);
        saveField("status", newStatus);
    }, [saveField]);

    const setSubdomainWithSave = useCallback((sub: string) => {
        setSubdomain(sub);
        debouncedSave("subdomain", sub);
    }, [debouncedSave]);

    const setCustomPageTitleWithSave = useCallback((title: string) => {
        setCustomPageTitle(title);
        debouncedSave("custom_page_title", title);
    }, [debouncedSave]);

    const setCustomSiteDescriptionWithSave = useCallback((desc: string) => {
        setCustomSiteDescription(desc);
        debouncedSave("custom_site_description", desc);
    }, [debouncedSave]);

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

        setSteps(prev => [...prev, newStep]);
        setCurrentStepId(tempId);

        if (!formId) return;

        const { data, error } = await createStep({
            formId,
            type,
            title: newStep.title,
            data: newStep.data,
            order: steps.length,
        });

        if (error || !data) {
            toast.error("Failed to create step");
            setSteps(prev => prev.filter(s => s.id !== tempId));
            return;
        }

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
    const stepDebounceRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    const updateStepData = useCallback((stepId: string, newData: any) => {
        setSteps(prev =>
            prev.map(s =>
                s.id === stepId ? { ...s, data: { ...s.data, ...newData } } : s
            )
        );

        if (!formId || stepId.startsWith("tmp_")) return;

        clearTimeout(stepDebounceRefs.current[stepId]);
        stepDebounceRefs.current[stepId] = setTimeout(async () => {
            const step = steps.find(s => s.id === stepId);
            if (step) {
                await updateStep(stepId, { data: { ...step.data, ...newData } });
            }
        }, 300);
    }, [formId, steps]);

    const updateStepTitle = useCallback((stepId: string, title: string) => {
        setSteps(prev =>
            prev.map(s => s.id === stepId ? { ...s, title } : s)
        );

        if (!formId || stepId.startsWith("tmp_")) return;

        clearTimeout(stepDebounceRefs.current[`${stepId}_title`]);
        stepDebounceRefs.current[`${stepId}_title`] = setTimeout(async () => {
            await updateStep(stepId, { title });
        }, 300);
    }, [formId]);

    const handleReorder = useCallback((reordered: FormStep[]) => {
        setSteps(reordered);
        if (!formId) return;
        const updates = reordered
            .map((s, i) => ({ id: s.id, order: i }))
            .filter(u => !u.id.startsWith("tmp_"));
        reorderSteps(updates);
    }, [formId]);

    const handleConfigUpdate = useCallback((data: any) => {
        if (!currentStep) return;
        if ("title" in data) {
            updateStepTitle(currentStep.id, data.title);
        } else {
            updateStepData(currentStep.id, data);
        }
    }, [currentStep, updateStepData, updateStepTitle]);

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

    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden">
            <BuilderHeader
                formName={formName}
                onNameChange={setFormNameWithSave}
                brand={brand ?? undefined}
                formId={formId}
                isSaving={isSaving}
                subdomain={subdomain}
                status={status}
                onStatusChange={setStatusWithSave}
            />

            <div className="flex flex-1 overflow-hidden">
                <aside className="w-80 border-r border-border bg-background overflow-y-auto hidden lg:block">
                    {currentStep && (
                        <StepConfig
                            step={currentStep}
                            allSteps={steps}
                            onUpdate={handleConfigUpdate}
                        />
                    )}
                </aside>

                <main className="flex-1 relative flex flex-col bg-secondary/20 overflow-hidden items-center justify-center">
                    <ViewportToggle viewport={viewport} setViewport={setViewport} />

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
                            formId={formId ?? undefined}
                            banner={banner}
                            onBannerChange={setBanner}
                            activeStepId={currentStepId}
                        />
                    </div>

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

                <aside className="w-80 border-l border-border bg-background overflow-y-auto hidden lg:block">
                    <FormSettings
                        formName={formName}
                        formId={formId}
                        steps={steps}
                        webhookUrl={webhookUrl}
                        onWebhookChange={setWebhookUrlWithSave}
                        subdomain={subdomain}
                        onSubdomainChange={setSubdomainWithSave}
                        smsVerification={smsVerification}
                        onSmsVerificationChange={setSmsVerification}
                        customPageTitle={customPageTitle}
                        onCustomPageTitleChange={setCustomPageTitleWithSave}
                        customSiteDescription={customSiteDescription}
                        onCustomSiteDescriptionChange={setCustomSiteDescriptionWithSave}
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
