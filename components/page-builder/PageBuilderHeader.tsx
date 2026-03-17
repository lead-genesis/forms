"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { sansFont } from "@/lib/design-system";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Share2, Eye, Layout, Type, Image, Send, MoreHorizontal, Settings, Loader2, Check, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { BrandPage } from "@/app/actions/pages";
import { PageStatusToggle } from "@/components/PageStatusToggle";

function useRelativeTime(date?: Date) {
    const [now, setNow] = React.useState(() => Date.now());

    React.useEffect(() => {
        if (!date) return;
        const id = setInterval(() => setNow(Date.now()), 10_000);
        return () => clearInterval(id);
    }, [date]);

    if (!date) return "";

    const seconds = Math.floor((now - date.getTime()) / 1000);
    if (seconds < 10) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

interface PageBuilderHeaderProps {
    title: string;
    onTitleChange: (title: string) => void;
    onBack: () => void;
    isSaving?: boolean;
    status?: string;
    lastSavedAt?: Date;
    onOpenSettings?: () => void;
    pageId: string;
    brandPages?: BrandPage[];
    onPageSelect?: (pageId: string) => void;
    page?: BrandPage;
}

export function PageBuilderHeader({
    title,
    onTitleChange,
    onBack,
    isSaving,
    status,
    lastSavedAt,
    onOpenSettings,
    pageId,
    brandPages = [],
    onPageSelect,
    page
}: PageBuilderHeaderProps) {
    const router = useRouter();
    const lastSaved = useRelativeTime(lastSavedAt);

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

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 group">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    className={cn(
                        "bg-transparent border-none focus:ring-0 text-[13px] font-bold p-0 outline-none text-center text-zinc-900 min-w-[40px]",
                        sansFont
                    )}
                    style={{ width: `${Math.max(title.length * 8, 40)}px` }}
                />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="p-1 hover:bg-zinc-100 rounded-md transition-colors text-zinc-400">
                            <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-56 z-[200]">
                        <DropdownMenuLabel className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 py-1.5">
                            Brand Pages
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {brandPages.length > 0 ? (
                            brandPages.map((p) => (
                                <DropdownMenuItem
                                    key={p.id}
                                    onClick={() => onPageSelect?.(p.id)}
                                    className={cn(
                                        "flex items-center gap-2 cursor-pointer py-2",
                                        p.id === pageId && "bg-zinc-50 font-bold text-zinc-900"
                                    )}
                                >
                                    <div className={cn(
                                        "w-1.5 h-1.5 rounded-full shrink-0",
                                        p.id === pageId ? "bg-zinc-900" : "bg-transparent"
                                    )} />
                                    <span className="truncate">{p.title}</span>
                                    {p.is_index && (
                                        <span className="ml-auto text-[9px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded-full uppercase font-bold tracking-tight">Home</span>
                                    )}
                                </DropdownMenuItem>
                            ))
                        ) : (
                            <div className="px-2 py-4 text-center text-xs text-zinc-400">
                                No other pages found
                            </div>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
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
                    {page && <PageStatusToggle page={page} showLabel={false} />}
                </div>
            </div>
        </header>
    );
}
