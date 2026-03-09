"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { sansFont } from "@/lib/design-system";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Share2, Eye, Layout, Type, Image, Send, MoreHorizontal, Settings, Loader2, Check, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface PageBuilderHeaderProps {
    title: string;
    onTitleChange: (title: string) => void;
    onBack: () => void;
    isSaving?: boolean;
    status?: string;
    lastSaved?: string;
    onOpenSettings?: () => void;
    pageId: string;
}

export function PageBuilderHeader({
    title,
    onTitleChange,
    onBack,
    isSaving,
    status,
    lastSaved,
    onOpenSettings,
    pageId
}: PageBuilderHeaderProps) {
    const router = useRouter();

    const handlePreview = () => {
        window.open(`/preview/${pageId}`, '_blank');
    };

    const handleShare = () => {
        toast.info("Sharing functionality coming soon");
    };

    return (
        <header className="h-16 border-b border-border bg-white px-6 flex items-center justify-between z-10 relative">
            <div className="flex items-center gap-4 z-20">
                <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-zinc-50 transition-colors">
                    <ChevronLeft className="w-5 h-5 text-zinc-600" />
                </Button>
                <div className="h-6 w-px bg-zinc-100 mx-2" />
            </div>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm px-4 text-center">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    className={cn(
                        "bg-transparent border-none focus:ring-0 text-[13px] font-bold p-0 w-full outline-none text-center text-zinc-900",
                        sansFont
                    )}
                />
            </div>

            <div className="flex items-center gap-3 z-20">
                <div className="flex items-center gap-1.5 mr-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    {isSaving ? (
                        <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Saving</span>
                        </>
                    ) : (
                        <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>Last saved {lastSaved}</span>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="rounded-xl gap-2 text-zinc-600 hover:bg-zinc-50" onClick={handleShare}>
                        <Share2 className="w-4 h-4" />
                        Share
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-xl gap-2 text-zinc-600 hover:bg-zinc-50" onClick={onOpenSettings}>
                        <Settings className="w-4 h-4" />
                        Settings
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-xl px-4"
                        onClick={() => window.open(`/preview/${pageId}`, '_blank')}
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                    </Button>
                    <div className="w-px h-4 bg-zinc-100 mx-1" />
                    <Button
                        variant="default"
                        size="sm"
                        className="rounded-xl gap-2 px-6 bg-zinc-900 hover:bg-zinc-800 text-white shadow-xl shadow-zinc-200">
                        <Save className="w-4 h-4" />
                        Publish
                    </Button>
                </div>
            </div>
        </header>
    );
}
