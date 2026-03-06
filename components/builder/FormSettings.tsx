"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { sansFont } from "@/lib/design-system";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormStep } from "@/app/builder/page";
import { Terminal, Globe, Copy, Check, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { buildWebhookPayload } from "@/lib/webhook";

interface FormSettingsProps {
    formName: string;
    formId?: string | null;
    steps: FormStep[];
    webhookUrl: string;
    onWebhookChange: (url: string) => void;
}

import { testWebhookUrl } from "@/app/actions/forms";

export function FormSettings({ formName, formId, steps, webhookUrl, onWebhookChange }: FormSettingsProps) {
    const [copied, setCopied] = React.useState(false);
    const [testing, setTesting] = React.useState(false);

    // Build clean payload — exclude welcome/thank-you, show structured step data
    const sampleAnswers: Record<string, any> = {};
    steps.forEach(s => {
        if (s.type === "welcome" || s.type === "thank-you") return;
        if (s.type === "contact") {
            sampleAnswers["first_name"] = "Jane";
            sampleAnswers["last_name"] = "Doe";
            sampleAnswers["email"] = "jane@example.com";
            sampleAnswers["phone"] = "(555) 000-0000";
        } else if (s.type === "multi-choice") {
            sampleAnswers[`${s.id}_choice`] = 0;
        } else if (s.type === "input") {
            sampleAnswers[`${s.id}_input`] = "Sample answer";
        } else if (s.type === "address") {
            sampleAnswers[`${s.id}_address`] = "123 Main St, Sydney NSW 2000";
        }
    });

    const payload = buildWebhookPayload({
        formId: formId ?? "preview",
        formName,
        steps,
        answers: sampleAnswers,
    });

    const jsonPayload = JSON.stringify(payload, null, 2);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(jsonPayload);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const testWebhook = async () => {
        if (!webhookUrl) {
            toast.error("Enter a webhook URL first");
            return;
        }
        setTesting(true);
        try {
            const res = await testWebhookUrl(webhookUrl, payload);
            if (res.success) {
                toast.success(`Webhook responded ${res.status}`);
            } else {
                toast.error(res.error || `Webhook returned ${res.status}`);
            }
        } catch (e: any) {
            toast.error(`Webhook failed: ${e.message ?? "Network error"}`);
        } finally {
            setTesting(false);
        }
    };


    return (
        <div className="p-6 space-y-8">
            <div>
                <h3 className={cn("text-lg font-bold mb-1", sansFont)}>Form Settings</h3>
                <p className="text-xs text-muted-foreground">Configure global form behavior and integrations.</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Globe className="w-3 h-3 text-primary" />
                        <Label className="uppercase text-[10px] tracking-widest opacity-50 font-bold">Webhook URL</Label>
                    </div>
                    <Input
                        value={webhookUrl}
                        onChange={(e) => onWebhookChange(e.target.value)}
                        placeholder="https://n8n.your-domain.com/webhook/..."
                        className="bg-secondary/10 border-border/50"
                    />
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Every submission will be sent to this URL as a POST request with the form data.
                    </p>

                    {/* Test webhook button */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full rounded-lg gap-2 text-xs h-9"
                        onClick={testWebhook}
                        disabled={testing || !webhookUrl}
                    >
                        {testing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Zap className="w-3.5 h-3.5" />
                        )}
                        {testing ? "Sending..." : "Test Webhook"}
                    </Button>
                </div>

                <div className="h-px bg-border" />

                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                            <Terminal className="w-3 h-3 text-primary" />
                            <Label className="uppercase text-[10px] tracking-widest opacity-50 font-bold">Payload Preview</Label>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={copyToClipboard}
                        >
                            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        </Button>
                    </div>
                    <div className="relative group">
                        <pre className="p-4 rounded-xl bg-secondary/30 border border-border/50 text-[11px] font-mono overflow-x-auto max-h-[400px] no-scrollbar">
                            <code className="text-foreground/80">{jsonPayload}</code>
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}
