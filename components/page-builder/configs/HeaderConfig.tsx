"use client";

import React from "react";
import { Upload, Loader2, X, GripVertical, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandPage } from "@/app/actions/pages";
import { Reorder } from "framer-motion";

interface HeaderConfigProps {
    data: any;
    brandPages?: BrandPage[];
    onDataChange: (key: string, value: any) => void;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isUploading: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function HeaderConfig({ data, brandPages, onDataChange, onFileUpload, isUploading, fileInputRef }: HeaderConfigProps) {
    const selectedPageIds = data?.navigation || [];
    
    // Get the actual page objects for the selected IDs, in their saved order
    const navigationPages = selectedPageIds
        .map((id: string) => brandPages?.find(p => p.id === id))
        .filter(Boolean) as BrandPage[];

    // Only show published pages that aren't already in the navigation in the "available" list
    const availablePages = brandPages?.filter(p => p.is_published && !selectedPageIds.includes(p.id)) || [];

    const togglePage = (pageId: string) => {
        const newNav = selectedPageIds.includes(pageId)
            ? selectedPageIds.filter((id: string) => id !== pageId)
            : [...selectedPageIds, pageId];
        onDataChange('navigation', newNav);
    };

    const handleReorder = (newOrder: BrandPage[]) => {
        onDataChange('navigation', newOrder.map(p => p.id));
    };

    return (
        <div className="space-y-6">
            <p className="text-xs text-zinc-500 bg-indigo-50 p-4 rounded-xl border border-indigo-100 leading-relaxed">
                Customize your header logo and organize your site navigation links with drag-and-drop.
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

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-zinc-500 ml-1 border-b border-zinc-100 w-full pb-2 block">Navigation Settings</label>
                    <div className="flex items-center gap-4 px-1 pt-1">
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
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-[11px] font-bold text-zinc-500">Active Navigation</label>
                        <span className="text-[10px] text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full font-medium">Drag to reorder</span>
                    </div>
                    
                    <Reorder.Group 
                        axis="y" 
                        values={navigationPages} 
                        onReorder={handleReorder}
                        className="space-y-2"
                    >
                        {navigationPages.map((page) => (
                            <Reorder.Item 
                                key={page.id} 
                                value={page}
                                className="bg-white border border-zinc-200 rounded-xl p-3 flex items-center gap-3 shadow-sm hover:border-zinc-300 transition-colors group"
                            >
                                <GripVertical className="w-4 h-4 text-zinc-300 group-hover:text-zinc-400 cursor-grab active:cursor-grabbing" />
                                <div className="flex-1 flex flex-col min-w-0">
                                    <span className="text-xs font-bold text-zinc-900 truncate">{page.title}</span>
                                    <span className="text-[10px] text-zinc-500 font-mono tracking-tighter truncate opacity-70">/{page.slug}</span>
                                </div>
                                <button 
                                    onClick={() => togglePage(page.id)}
                                    className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </Reorder.Item>
                        ))}
                        {navigationPages.length === 0 && (
                            <div className="p-6 text-center border-2 border-dashed border-zinc-100 rounded-2xl">
                                <p className="text-[11px] text-zinc-400 italic">No links added to navigation yet.</p>
                            </div>
                        )}
                    </Reorder.Group>
                </div>

                <div className="space-y-3 pt-2">
                    <label className="text-[11px] font-bold text-zinc-500 px-1">Add Published Pages</label>
                    <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1">
                        {availablePages.map((page) => {
                            const isSelected = selectedPageIds.includes(page.id);
                            return (
                                <button
                                    key={page.id}
                                    onClick={() => togglePage(page.id)}
                                    className={cn(
                                        "flex items-center justify-between p-3 rounded-xl border transition-all text-left group",
                                        isSelected
                                            ? "bg-indigo-50 border-indigo-200 text-indigo-700 pointer-events-none opacity-50"
                                            : "bg-white border-zinc-100 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                                    )}
                                >
                                    <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold truncate">{page.title}</span>
                                            <span className="text-[8px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-bold uppercase tracking-wider border border-emerald-100/50">Published</span>
                                        </div>
                                        <span className="text-[10px] opacity-60 font-mono">/{page.slug}</span>
                                    </div>
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                                        isSelected 
                                            ? "bg-indigo-500 border-indigo-500 text-white" 
                                            : "border-zinc-200 bg-zinc-50 group-hover:border-zinc-300"
                                    )}>
                                        {isSelected ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 rotate-45 text-zinc-400" />}
                                    </div>
                                </button>
                            );
                        })}
                        {availablePages.length === 0 && (
                            <div className="p-8 text-center border-2 border-dashed border-zinc-100 rounded-2xl">
                                <p className="text-[11px] text-zinc-400 italic leading-relaxed">
                                    No published pages found.<br/>Publish some pages to add them to navigation.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

