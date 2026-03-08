"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { sansFont } from "@/lib/design-system";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Share2, Play, Save, Loader2, Check } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

interface BuilderHeaderProps {
    formName: string;
    onNameChange: (name: string) => void;
    brand?: { name: string; logo_url?: string | null };
    formId?: string | null;
    isSaving?: boolean;
    subdomain?: string;
    status?: string;
    onStatusChange?: (status: string) => void;
}

export function BuilderHeader({ formName, onNameChange, brand, formId, isSaving, subdomain, status, onStatusChange }: BuilderHeaderProps) {
    const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);

    const handlePreview = () => {
        if (!formId) {
            toast.error("Save your form first");
            return;
        }
        window.open(`/f/${formId}?preview=true`, "_blank");
    };

    const handleShare = () => {
        if (!formId) {
            toast.error("Save your form first");
            return;
        }

        const shareUrl = subdomain
            ? `https://${subdomain}.genesisflow.io`
            : `${window.location.origin}/f/${formId}`;

        window.open(shareUrl, "_blank");
        navigator.clipboard.writeText(shareUrl);
        toast.success("Link opened & copied to clipboard!");
    };

    const handlePublish = () => {
        if (onStatusChange) {
            onStatusChange("active");
            setIsPublishDialogOpen(false);
            toast.success("Form published successfully");
        }
    };

    return (
        <header className="h-16 border-b border-border bg-background px-6 flex items-center justify-between z-10 relative">
            <div className="flex items-center gap-4 z-20">
                <Button variant="ghost" size="icon" asChild className="rounded-full">
                    <Link href="/dashboard/forms">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <div className="h-6 w-px bg-border mx-2" />
                {brand && (
                    <div className="flex items-center gap-2">
                        {brand.logo_url ? (
                            <img src={brand.logo_url} alt={brand.name} className="w-6 h-6 rounded-md object-cover" />
                        ) : (
                            <div className="w-6 h-6 rounded-md bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                {brand.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <span className="text-xs font-medium text-muted-foreground">{brand.name}</span>
                        <span className="text-muted-foreground/40">/</span>
                    </div>
                )}
            </div>


            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xs px-4 text-center">
                <input
                    type="text"
                    value={formName}
                    onChange={(e) => onNameChange(e.target.value)}
                    className={cn(
                        "bg-transparent border-none focus:ring-0 text-sm font-bold p-0 w-full outline-none text-center",
                        sansFont
                    )}
                />
            </div>

            <div className="flex items-center gap-3 z-20">
                <div className="flex items-center gap-1.5 mr-2 text-[11px] font-medium text-muted-foreground/60 transition-opacity">
                    {isSaving ? (
                        <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Saving...</span>
                        </>
                    ) : (
                        <>
                            <Check className="w-3 h-3" />
                            <span>Saved</span>
                        </>
                    )}
                </div>

                {/* Status Toggle */}
                {onStatusChange && (
                    <div className="flex items-center gap-2 mr-2">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                            {status === "active" ? "Active" : "Draft"}
                        </span>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={status === "active"}
                            onClick={() => onStatusChange(status === "active" ? "draft" : "active")}
                            className={cn(
                                "relative w-9 h-5 flex shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none",
                                status === "active" ? "bg-emerald-500" : "bg-secondary"
                            )}
                        >
                            <span
                                className={cn(
                                    "absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200",
                                    status === "active" ? "translate-x-4" : "translate-x-0"
                                )}
                            />
                        </button>
                    </div>
                )}

                <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={handlePreview}>
                    <Play className="w-4 h-4" />
                    Preview
                </Button>
                <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                    Share
                </Button>

                <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="rounded-full gap-2 px-6">
                            <Save className="w-4 h-4" />
                            Publish
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Publish Form?</DialogTitle>
                            <DialogDescription>
                                This will make your form accessible to the public and start accepting leads.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4">
                            <Button variant="outline" onClick={() => setIsPublishDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handlePublish}>
                                Publish
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </header>
    );
}
