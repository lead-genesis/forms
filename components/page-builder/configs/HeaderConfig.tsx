"use client";

import React from "react";
import { Upload, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandPage } from "@/app/actions/pages";

interface HeaderConfigProps {
    data: any;
    brandPages?: BrandPage[];
    onDataChange: (key: string, value: any) => void;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isUploading: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function HeaderConfig({ data, brandPages, onDataChange, onFileUpload, isUploading, fileInputRef }: HeaderConfigProps) {
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
                Select which pages should appear in your site navigation and customize your header logo.
            </p>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-zinc-500 ml-1">Header Logo</label>
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={data?.customLogoUrl || ""}
                                onChange={(e) => onDataChange('customLogoUrl', e.target.value)}
                                placeholder="Paste logo URL..."
                                className={cn(
                                    "flex-1 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all",
                                    data?.customLogoUrl && !data.customLogoUrl.startsWith('http') && !data.customLogoUrl.startsWith('/') && "border-red-200 bg-red-50/30"
                                )}
                            />
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => {
                                    onFileUpload(e);
                                }}
                                className="hidden"
                                accept="image/*"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="px-3 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors disabled:opacity-50"
                            >
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            </button>
                        </div>

                        {data?.customLogoUrl && (
                            <div className="h-16 w-full rounded-xl border border-zinc-100 bg-zinc-50 overflow-hidden relative flex items-center justify-center p-4">
                                <img src={data.customLogoUrl} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                                <button
                                    onClick={() => onDataChange('customLogoUrl', '')}
                                    className="absolute top-1 right-1 p-1 bg-white/90 backdrop-blur shadow-sm rounded-lg text-zinc-500 hover:text-red-500 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4 px-1">
                    <div className="flex-1 space-y-1.5">
                        <div className="flex justify-between items-baseline">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Logo Size</span>
                            <span className="text-[10px] font-mono text-zinc-500">{data?.logoHeight || 32}px</span>
                        </div>
                        <input
                            type="range"
                            min="16"
                            max="80"
                            step="2"
                            value={data?.logoHeight || 32}
                            onChange={(e) => onDataChange('logoHeight', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                        />
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-500 ml-1">Navigation Links</label>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 px-1">
                        <div className="flex-1 space-y-1.5">
                            <div className="flex justify-between items-baseline">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Font Size</span>
                                <span className="text-[10px] font-mono text-zinc-500">{data?.navFontSize || 13}px</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="24"
                                step="1"
                                value={data?.navFontSize || 13}
                                onChange={(e) => onDataChange('navFontSize', parseInt(e.target.value))}
                                className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                            />
                        </div>
                    </div>

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
        </div>
    );
}
