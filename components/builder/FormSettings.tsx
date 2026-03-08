"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { sansFont } from "@/lib/design-system";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormStep } from "@/lib/builder";
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
    subdomain: string;
    onSubdomainChange: (sub: string) => void;
    smsVerification: boolean;
    onSmsVerificationChange: (enabled: boolean) => void;
    customPageTitle: string;
    onCustomPageTitleChange: (title: string) => void;
    customSiteDescription: string;
    onCustomSiteDescriptionChange: (desc: string) => void;
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { testWebhookUrl, updateForm } from "@/app/actions/forms";
import { ShieldCheck, MessageSquare, Search } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export function FormSettings({
    formName,
    formId,
    steps,
    webhookUrl,
    onWebhookChange,
    subdomain,
    onSubdomainChange,
    smsVerification,
    onSmsVerificationChange,
    customPageTitle,
    onCustomPageTitleChange,
    customSiteDescription,
    onCustomSiteDescriptionChange
}: FormSettingsProps) {
    const [copied, setCopied] = React.useState(false);
    const [testing, setTesting] = React.useState(false);
    const [uploading, setUploading] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

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
        <div className="p-6 space-y-8 flex flex-col h-full">
            <div>
                <h3 className={cn("text-lg font-bold mb-1", sansFont)}>Form Settings</h3>
                <p className="text-xs text-muted-foreground">Configure global form behavior and integrations.</p>
            </div>

            <Tabs defaultValue="webhook" className="w-full flex-1 flex flex-col">
                <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0 h-auto gap-4 mb-6">
                    <TabsTrigger
                        value="webhook"
                        className="rounded-none border-b-2 border-transparent px-2 py-3 text-xs font-semibold data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none bg-transparent hover:text-foreground/80 transition-colors"
                    >
                        Webhook
                    </TabsTrigger>
                    <TabsTrigger
                        value="verification"
                        className="rounded-none border-b-2 border-transparent px-2 py-3 text-xs font-semibold data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none bg-transparent hover:text-foreground/80 transition-colors"
                    >
                        Verification
                    </TabsTrigger>
                    <TabsTrigger
                        value="seo"
                        className="rounded-none border-b-2 border-transparent px-2 py-3 text-xs font-semibold data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none bg-transparent hover:text-foreground/80 transition-colors"
                    >
                        SEO & Domain
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="webhook" className="space-y-6 mt-0">
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
                </TabsContent>


                <TabsContent value="verification" className="space-y-6 mt-0">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldCheck className="w-3 h-3 text-primary" />
                            <Label className="uppercase text-[10px] tracking-widest opacity-50 font-bold">Verification Settings</Label>
                        </div>

                        <div className="p-4 rounded-2xl bg-secondary/10 border border-border/50 space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-3.5 h-3.5 text-primary" />
                                        <span className="text-sm font-semibold text-foreground italic">SMS Verification</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-snug pr-4">
                                        Require users to verify their phone number via a 4-digit SMS code before completion.
                                    </p>
                                </div>
                                <Switch
                                    checked={smsVerification}
                                    onCheckedChange={(val: boolean) => {
                                        onSmsVerificationChange(val);
                                        if (formId) {
                                            updateForm(formId, { sms_verification: val });
                                        }
                                    }}
                                />
                            </div>

                            {smsVerification && (
                                <div className="pt-2 border-t border-border/30">
                                    <div className="flex gap-2 text-[10px] text-primary/80 bg-primary/5 p-2.5 rounded-lg border border-primary/10">
                                        <Zap className="w-3 h-3 shrink-0 mt-0.5" />
                                        <p>Verification is triggered automatically after the lead is saved (following contact details).</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-8 mt-0">
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                                <Globe className="w-3 h-3 text-primary" />
                                <Label className="uppercase text-[10px] tracking-widest opacity-50 font-bold">Custom Subdomain</Label>
                            </div>
                            <div className="flex rounded-md shadow-sm">
                                <Input
                                    value={subdomain}
                                    onChange={(e) => {
                                        // Remove special characters and spaces, keep lowercase
                                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                                        onSubdomainChange(val);
                                    }}
                                    placeholder="my-form"
                                    className="bg-secondary/10 border-border/50 rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0 border-r-0"
                                />
                                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-border/50 bg-muted text-muted-foreground sm:text-sm">
                                    .genesisflow.io
                                </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                Your form will be accessible at this subdomain. Only lowercase letters, numbers, and hyphens are allowed.
                            </p>
                        </div>

                        <div className="h-px bg-border/50" />

                        <div className="flex items-center gap-2 mb-1">
                            <Search className="w-3 h-3 text-primary" />
                            <Label className="uppercase text-[10px] tracking-widest opacity-50 font-bold">Search Metadata</Label>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-3">
                                <Label className="text-xs font-semibold italic text-foreground/70">Custom Page Title</Label>
                                <Input
                                    value={customPageTitle}
                                    onChange={(e) => onCustomPageTitleChange(e.target.value)}
                                    placeholder="e.g. Get your instant quote"
                                    className="bg-secondary/10 border-border/50"
                                />
                                <p className="text-[10px] text-muted-foreground leading-relaxed">
                                    This will appear in the browser tab and search results.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-xs font-semibold italic text-foreground/70">Custom Site Description</Label>
                                <Textarea
                                    value={customSiteDescription}
                                    onChange={(e) => onCustomSiteDescriptionChange(e.target.value)}
                                    placeholder="e.g. Fill out this 2-minute form to get a personalized quote for our services."
                                    className="bg-secondary/10 border-border/50 min-h-[100px] resize-none"
                                />
                                <p className="text-[10px] text-muted-foreground leading-relaxed">
                                    A brief summary that search engines and social platforms use for snippets.
                                </p>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
