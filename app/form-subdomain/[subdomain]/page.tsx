"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, notFound } from "next/navigation";
import { FormCanvas } from "@/components/form/FormCanvas";
import { FormStep } from "@/components/form/FormStepRenderer";
import { getFormBySubdomain, getFormSteps } from "@/app/actions/forms";
// Metadata moved to layout.tsx

export default function SubdomainFormPage() {
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
    const [error, setError] = useState(false);
    const [isInactive, setIsInactive] = useState(false);

    useEffect(() => {
        console.log("SubdomainFormPage mounted. Subdomain:", subdomain);
        console.log("Supabase URL present:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);

        if (!subdomain) return;

        (async () => {
            try {
                setIsLoading(true);
                setError(false);

                // First get the form by subdomain
                const formRes = await getFormBySubdomain(subdomain);

                if (formRes.error || !formRes.data) {
                    console.error("Subdomain form error:", formRes.error);
                    setError(true);
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
                    setError(true);
                    return;
                }

                setFormId(form.id);
                setFormName(form.name ?? "");
                setWebhookUrl(form.webhook_url ?? "");
                if (form.brands) setBrand(form.brands);

                const loadedSteps: FormStep[] = (stepsRes.data as any[] || []).map((s: any) => ({
                    id: s.id,
                    type: s.type,
                    title: s.title,
                    data: s.data ?? {},
                }));

                setSteps(loadedSteps);
            } catch (err) {
                console.error("Subdomain form crash:", err);
                setError(true);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [subdomain, isPreviewSession]);

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

    if (error || steps.length === 0 || !formId) {
        // #region agent log
        fetch('http://127.0.0.1:7584/ingest/1ce85303-de38-45f1-9b94-642ac7d98597', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '9dc2d2' }, body: JSON.stringify({ sessionId: '9dc2d2', runId: 'initial', hypothesisId: 'D', location: 'app/form-subdomain/[subdomain]/page.tsx:SubdomainFormPage:notFound', message: 'notFound called', data: { errorState: error, stepsLength: steps.length, formId }, timestamp: Date.now() }) }).catch(() => { });
        // #endregion
        notFound();
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
