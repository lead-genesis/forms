import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LinkIcon, CheckIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

interface SettingsTabProps {
    editName: string;
    setEditName: (v: string) => void;
    editWebhook: string;
    setEditWebhook: (v: string) => void;
    editStatus: string;
    setEditStatus: (v: string) => void;
    editSubdomain: string;
    setEditSubdomain: (v: string) => void;
    editVertical: string;
    setEditVertical: (v: string) => void;
    brandVerticals: string[];
    isSaving: boolean;
    onSave: () => void;
    shareUrl: string;
    copied: boolean;
    onCopyLink: () => void;
}

export function SettingsTab({
    editName,
    setEditName,
    editWebhook,
    setEditWebhook,
    editSubdomain,
    setEditSubdomain,
    editVertical,
    setEditVertical,
    brandVerticals,
    isSaving,
    onSave,
    shareUrl,
    copied,
    onCopyLink,
}: SettingsTabProps) {
    return (
        <div className="max-w-2xl space-y-4">
            {/* Form Name */}
            <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                            Form Name
                        </label>
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                        />
                    </div>

                    {/* Subdomain */}
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                            Custom Subdomain
                        </label>
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={editSubdomain}
                                onChange={(e) => setEditSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                placeholder="my-form"
                                className="w-full px-4 py-2.5 rounded-l-xl border border-r-0 border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors placeholder:text-muted-foreground/40"
                            />
                            <div className="px-4 py-2.5 bg-secondary/50 border border-border rounded-r-xl text-sm text-muted-foreground font-medium whitespace-nowrap">
                                .genesisflow.io
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Leave blank to use the default /f/[id] URL. Letters, numbers, and hyphens only. Be careful changing this as existing links will break.
                        </p>
                    </div>

                    {/* Webhook URL */}
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                            Webhook URL
                        </label>
                        <input
                            type="url"
                            value={editWebhook}
                            onChange={(e) => setEditWebhook(e.target.value)}
                            placeholder="https://your-webhook.com/endpoint"
                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors placeholder:text-muted-foreground/40"
                        />
                    </div>

                    {/* Vertical */}
                    {brandVerticals.length > 0 && (
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                                Vertical
                            </label>
                            <select
                                value={editVertical}
                                onChange={(e) => setEditVertical(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors appearance-none"
                            >
                                <option value="">Select a vertical…</option>
                                {brandVerticals.map((v) => (
                                    <option key={v} value={v}>{v}</option>
                                ))}
                            </select>
                            <p className="text-xs text-muted-foreground mt-2">
                                Assign a vertical from the brand's configured verticals.
                            </p>
                        </div>
                    )}

                    <button
                        onClick={onSave}
                        disabled={isSaving}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm active:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? "Saving…" : "Save Settings"}
                    </button>
                </CardContent>
            </Card>

            {/* Share Link */}
            <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                        Share Link
                    </label>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-secondary/20 text-sm text-muted-foreground overflow-hidden">
                            <LinkIcon className="w-4 h-4 shrink-0" />
                            <span className="truncate">{shareUrl}</span>
                        </div>
                        <button
                            onClick={onCopyLink}
                            className={cn(
                                "shrink-0 p-2.5 rounded-xl border transition-all duration-200",
                                copied
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                                    : "border-border hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                            )}
                            aria-label="Copy link"
                        >
                            {copied ? (
                                <CheckIcon className="w-4 h-4" />
                            ) : (
                                <ClipboardDocumentIcon className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
