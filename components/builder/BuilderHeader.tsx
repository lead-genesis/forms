"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { sansFont } from "@/lib/design-system";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Share2, Play, Save, Loader2, Check } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface BuilderHeaderProps {
    formName: string;
    onNameChange: (name: string) => void;
    brand?: { name: string; logo_url?: string | null };
    formId?: string | null;
    isSaving?: boolean;
}

export function BuilderHeader({ formName, onNameChange, brand, formId, isSaving }: BuilderHeaderProps) {
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
        const url = `${window.location.origin}/f/${formId}?preview=true`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
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

                <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={handlePreview}>
                    <Play className="w-4 h-4" />
                    Preview
                </Button>
                <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                    Share
                </Button>
                <Button size="sm" className="rounded-full gap-2 px-6">
                    <Save className="w-4 h-4" />
                    Publish
                </Button>
            </div>
        </header>
    );
}
