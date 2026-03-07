"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { FormCanvas } from "@/components/form/FormCanvas";
import { FormStep } from "@/components/form/FormStepRenderer";
import { getFormWithBrand, getFormSteps } from "@/app/actions/forms";
// Metadata moved to layout.tsx

export default function PublicFormPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const formId = params.id as string;
    const isPreviewSession = searchParams.get("preview") === "true";

    const [isLoading, setIsLoading] = useState(true);
    const [brand, setBrand] = useState<any>(null);
    const [steps, setSteps] = useState<FormStep[]>([]);
    const [webhookUrl, setWebhookUrl] = useState("");
    const [formName, setFormName] = useState("");
    const [error, setError] = useState(false);
    const [isInactive, setIsInactive] = useState(false);

    useEffect(() => {
        if (!formId) return;

        (async () => {
            setIsLoading(true);
            const [formRes, stepsRes] = await Promise.all([
                getFormWithBrand(formId),
                getFormSteps(formId),
            ]);

            if (formRes.error || !formRes.data) {
                setError(true);
                setIsLoading(false);
                return;
            }

            const form = formRes.data as any;

            if (form.status !== "active" && !isPreviewSession) {
                setIsInactive(true);
                setIsLoading(false);
                return;
            }

            setFormName(form.name ?? "");
            setWebhookUrl(form.webhook_url ?? "");
            if (form.brands) setBrand(form.brands);

            const loadedSteps: FormStep[] = (stepsRes.data as any[]).map(s => ({
                id: s.id,
                type: s.type,
                title: s.title,
                data: s.data ?? {},
            }));

            setSteps(loadedSteps);
            setIsLoading(false);
        })();
    }, [formId]);

    // Removed conflicting document.title useEffect

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

    if (isInactive) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="text-center space-y-3 max-w-sm px-6">
                    <div className="w-16 h-16 bg-secondary/30 rounded-2xl mx-auto flex items-center justify-center text-muted-foreground mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64A9 9 0 0 1 20.77 15" /><path d="M6.16 6.16a9 9 0 1 0 12.68 12.68" /><path d="M15 2.26A9 9 0 0 0 3.23 15" /><path d="m2 2 20 20" /></svg>
                    </div>
                    <h1 className="text-2xl font-bold">Form is inactive</h1>
                    <p className="text-sm text-muted-foreground">This lead form has been paused or disabled by the owner. Please check back later.</p>
                </div>
            </div>
        );
    }

    if (error || steps.length === 0) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold">Form not found</h1>
                    <p className="text-sm text-muted-foreground">This form may no longer be available.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary/5 flex flex-col">
            <div className="flex-1 flex flex-col">
                <FormCanvas
                    mode="live"
                    steps={steps}
                    brand={brand}
                    formId={formId}
                    webhookUrl={webhookUrl}
                />
            </div>

            <p className="text-center text-xs text-muted-foreground py-4">
                Powered by Genesis Flow
            </p>
        </div>
    );
}
