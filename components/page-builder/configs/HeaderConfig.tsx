"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { BrandPage } from "@/app/actions/pages";

interface HeaderConfigProps {
    data: any;
    brandPages?: BrandPage[];
    onDataChange: (key: string, value: any) => void;
}

export function HeaderConfig({ data, brandPages, onDataChange }: HeaderConfigProps) {
    const selectedPages = data?.navigation || [];
    const togglePage = (pageId: string) => {
        const newNav = selectedPages.includes(pageId)
            ? selectedPages.filter((id: string) => id !== pageId)
            : [...selectedPages, pageId];
        onDataChange('navigation', newNav);
    };

    return (
        <div className="space-y-6">
            <p className="text-xs text-zinc-500 bg-indigo-50 p-4 rounded-xl border border-indigo-100 leading-relaxed">
                Select which pages should appear in your site navigation. Your brand logo will be automatically included.
            </p>
            <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-500 ml-1">Navigation Links</label>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {brandPages?.map((page) => (
                        <button
                            key={page.id}
                            onClick={() => togglePage(page.id)}
                            className={cn(
                                "w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                                selectedPages.includes(page.id)
                                    ? "bg-zinc-900 border-zinc-900 text-white shadow-md"
                                    : "bg-white border-zinc-100 text-zinc-600 hover:border-zinc-200"
                            )}
                        >
                            <div className="flex flex-col">
                                <span className="text-xs font-bold">{page.title}</span>
                                <span className={cn("text-[9px] uppercase tracking-wider font-semibold opacity-60", selectedPages.includes(page.id) ? "text-zinc-300" : "text-zinc-400")}>
                                    /{page.slug}
                                </span>
                            </div>
                            {selectedPages.includes(page.id) && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                        </button>
                    ))}
                    {(!brandPages || brandPages.length === 0) && (
                        <div className="p-8 text-center border-2 border-dashed border-zinc-100 rounded-2xl">
                            <p className="text-xs text-zinc-400 italic">No other pages found for this brand.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
