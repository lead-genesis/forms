"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, notFound } from "next/navigation";
import { FormCanvas } from "@/components/form/FormCanvas";
import { FormStep } from "@/components/form/FormStepRenderer";
import { ScriptInjector } from "@/components/form/ScriptInjector";
import { getFormBySubdomain, getFormSteps, incrementFormViews } from "@/app/actions/forms";
// Metadata moved to layout.tsx

function SubdomainFormPageContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    // In our middleware we rewrite to /form-subdomain/[subdomain]
    const subdomain = params.subdomain as string;
    const isPreviewSession = searchParams.get("preview") === "true";

    const [isLoading, setIsLoading] = useState(true);
    const [brand, setBrand] = useState<any>(null);
    const [steps, setSteps] = useState<FormStep[]>([]);
    const [webhookUrl, setWebhookUrl] = useState("");
    const [formName, setFormName] = useState("");
    const [formId, setFormId] = useState("");
    const [banner, setBanner] = useState<string | null>(null);
    const [smsVerification, setSmsVerification] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isInactive, setIsInactive] = useState(false);
    const [disclaimer, setDisclaimer] = useState("");
    const [customCode, setCustomCode] = useState("");

    useEffect(() => {
        console.log("SubdomainFormPage mounted. Subdomain:", subdomain);
        console.log("Supabase URL present:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);

        if (!subdomain) return;

        (async () => {
            try {
                setIsLoading(true);
                setError(null);

                // First get the form by subdomain
                const formRes = await getFormBySubdomain(subdomain);

                if (formRes.error || !formRes.data) {
                    console.error("Subdomain form error:", formRes.error);
                    setError(String(formRes.error || "Form not found"));
                    return;
                }

                const form = formRes.data as any;

                if (form.status !== "active" && !isPreviewSession) {
                    setIsInactive(true);
                    return;
                }

                // Now get the steps using the actual form ID
                const stepsRes = await getFormSteps(form.id);

                if (stepsRes.error) {
                    console.error("Steps fetch error:", stepsRes.error);
                    setError(String(stepsRes.error));
                    return;
                }

                setFormId(form.id);
                setFormName(form.name ?? "");
                setWebhookUrl(form.webhook_url ?? "");
                setBanner(form.banner ?? null);
                setSmsVerification(form.sms_verification ?? false);
                setDisclaimer(form.disclaimer ?? "");
                setCustomCode(form.custom_code ?? "");
                if (form.brands) setBrand(form.brands);

                const loadedSteps: FormStep[] = (stepsRes.data as any[] || []).map((s: any) => ({
                    id: s.id,
                    type: s.type,
                    title: s.title,
                    data: s.data ?? {},
                }));

                setSteps(loadedSteps);

                // Increment views if it's a real visit
                if (!isPreviewSession && form.status === "active") {
                    await incrementFormViews(form.id);
                }
            } catch (err) {
                console.error("Subdomain form crash:", err);
                setError(String(err));
            } finally {
                setIsLoading(false);
            }
        })();
    }, [subdomain, isPreviewSession]);

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

    if (error || steps.length === 0 || !formId) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="text-center space-y-3 max-w-sm px-6">
                    <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl mx-auto flex items-center justify-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    </div>
                    <h1 className="text-2xl font-bold">Form Not Found</h1>
                    <p className="text-sm text-muted-foreground">We couldn't find the form you were looking for. It may have been deleted or moved.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary/5 flex flex-col">
            {customCode && <ScriptInjector html={customCode} />}
            <div className="flex-1 flex flex-col">
                <FormCanvas
                    mode="live"
                    steps={steps}
                    brand={brand}
                    formId={formId}
                    webhookUrl={webhookUrl}
                    banner={banner}
                    smsVerification={smsVerification}
                    disclaimer={disclaimer}
                />
            </div>
        </div>
    );
}

export default function SubdomainFormPage() {
    return (
        <React.Suspense fallback={
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading form…</p>
                </div>
            </div>
        }>
            <SubdomainFormPageContent />
        </React.Suspense>
    );
}
