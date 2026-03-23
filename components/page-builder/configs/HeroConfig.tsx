"use client";

import React from "react";
import { Search, Globe, FileText, Layout, ExternalLink, Check, Upload, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandPage } from "@/app/actions/pages";
import { Form as BrandForm } from "@/app/actions/forms";

interface HeroConfigProps {
    data: any;
    onDataChange: (key: string, value: any) => void;
    onBatchDataChange?: (updates: Record<string, any>) => void;
    brandPages?: BrandPage[];
    brandForms?: BrandForm[];
    onFileUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isUploading?: boolean;
    fileInputRef?: React.RefObject<HTMLInputElement | null>;
}

export function HeroConfig({ data, onDataChange, onBatchDataChange, brandPages, brandForms, onFileUpload, isUploading, fileInputRef }: HeroConfigProps) {
    const [searchTerm, setSearchTerm] = React.useState("");

    const publishedPages = React.useMemo(() => {
        return (brandPages || []).filter(p => p.is_published);
    }, [brandPages]);

    const filteredContent = React.useMemo(() => {
        const term = searchTerm.toLowerCase();
        if (data?.buttonLinkType === 'page') {
            return publishedPages.filter(p =>
                p.title.toLowerCase().includes(term) ||
                p.slug.toLowerCase().includes(term)
            );
        }
        if (data?.buttonLinkType === 'form') {
            return (brandForms || []).filter(f =>
                f.name.toLowerCase().includes(term)
            );
        }
        return [];
    }, [data?.buttonLinkType, publishedPages, brandForms, searchTerm]);

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <label className="text-[11px] font-bold text-zinc-500 ml-1 uppercase tracking-wider">Orientation</label>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: 'left', label: 'Left' },
                        { id: 'right', label: 'Right' },
                        { id: 'background', label: 'BG' },
                    ].map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => onDataChange('orientation', opt.id)}
                            className={cn(
                                "py-2.5 rounded-xl border text-[11px] font-bold transition-all",
                                (data?.orientation || 'left') === opt.id
                                    ? "bg-zinc-900 border-zinc-900 text-white shadow-sm"
                                    : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200 hover:text-zinc-600"
                            )}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-500 ml-1 uppercase tracking-wider">Hero Image</label>
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={data?.imageUrl || ""}
                            onChange={(e) => onDataChange('imageUrl', e.target.value)}
                            placeholder="Paste image URL..."
                            className="flex-1 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                        />
                        {onFileUpload && fileInputRef && (
                            <>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={onFileUpload}
                                    className="hidden"
                                    accept="image/*"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="px-3 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-colors disabled:opacity-50"
                                >
                                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                </button>
                            </>
                        )}
                    </div>

                    {data?.imageUrl && (
                        <div className="aspect-video w-full rounded-xl border border-zinc-100 bg-zinc-50 overflow-hidden relative">
                            <img src={data.imageUrl} alt="Hero preview" className="w-full h-full object-cover" />
                            <button
                                onClick={() => onDataChange('imageUrl', '')}
                                className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur shadow-sm rounded-lg text-zinc-500 hover:text-red-500 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <label htmlFor="hero-heading" className="text-[11px] font-bold text-zinc-500 ml-1 uppercase tracking-wider">Heading</label>
                        <input
                            id="hero-heading"
                            type="text"
                            value={data?.heading || ""}
                            onChange={(e) => onDataChange('heading', e.target.value)}
                            placeholder="Your brand's heading"
                            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="hero-subheading" className="text-[11px] font-bold text-zinc-500 ml-1 uppercase tracking-wider">Subheading</label>
                        <textarea
                            id="hero-subheading"
                            value={data?.subheading || ""}
                            onChange={(e) => onDataChange('subheading', e.target.value)}
                            placeholder="Supporting description..."
                            rows={3}
                            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all resize-none"
                        />
                    </div>

                    {/* CTA Section */}
                    <div className="p-5 bg-zinc-50/50 rounded-2xl border border-zinc-100 space-y-5">
                        <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Call to Action</label>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label htmlFor="hero-button-text" className="text-[10px] font-bold text-zinc-400 ml-1 uppercase tracking-tight">Button Text</label>
                                <input
                                    id="hero-button-text"
                                    type="text"
                                    value={data?.buttonText || ""}
                                    onChange={(e) => onDataChange('buttonText', e.target.value)}
                                    placeholder="e.g. Get Started"
                                    className="w-full bg-white border border-zinc-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-400 ml-1 uppercase tracking-tight">Action Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: 'page', label: 'Local Page', icon: Globe },
                                        { id: 'form', label: 'Brand Form', icon: FileText },
                                        { id: 'external', label: 'External URL', icon: ExternalLink },
                                    ].map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => {
                                                if (onBatchDataChange) {
                                                    onBatchDataChange({ buttonLinkType: type.id, buttonLink: '' });
                                                } else {
                                                    onDataChange('buttonLinkType', type.id);
                                                    onDataChange('buttonLink', '');
                                                }
                                                setSearchTerm("");
                                            }}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[11px] font-bold transition-all",
                                                (data?.buttonLinkType || 'page') === type.id
                                                    ? "bg-zinc-900 border-zinc-900 text-white shadow-sm"
                                                    : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200 hover:text-zinc-600"
                                            )}
                                        >
                                            <type.icon className="w-3.5 h-3.5" />
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                {data?.buttonLinkType === 'external' ? (
                                    <div className="space-y-1.5">
                                        <label htmlFor="hero-destination-url" className="text-[10px] font-bold text-zinc-400 ml-1">Destination URL</label>
                                        <input
                                            id="hero-destination-url"
                                            type="url"
                                            value={data?.buttonLink || ""}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                // Block javascript: and data: URIs to prevent XSS
                                                if (/^\s*(javascript|data|vbscript):/i.test(val)) return;
                                                onDataChange('buttonLink', val);
                                            }}
                                            placeholder="https://..."
                                            className="w-full bg-white border border-zinc-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all text-zinc-900"
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="relative group">
                                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 group-focus-within:text-zinc-600 transition-colors" />
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder={data?.buttonLinkType === 'form' ? "Search brand forms..." : "Search brand pages..."}
                                                className="w-full bg-white border border-zinc-100 rounded-xl pl-10 pr-4 py-2.5 text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all outline-none text-zinc-900 placeholder:text-zinc-300"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 gap-1.5 max-h-[160px] overflow-y-auto pr-1 select-none custom-scrollbar">
                                            {filteredContent.map((item: any) => {
                                                const isSelected = data?.buttonLink === (data?.buttonLinkType === 'form' ? item.id : item.slug);
                                                return (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => onDataChange('buttonLink', data?.buttonLinkType === 'form' ? item.id : item.slug)}
                                                        className={cn(
                                                            "w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left",
                                                            isSelected
                                                                ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-[0_2px_10px_-4px_rgba(79,70,229,0.1)]"
                                                                : "bg-white border-zinc-100 text-zinc-600 hover:border-zinc-200 hover:bg-zinc-50"
                                                        )}
                                                    >
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-[11px] font-bold truncate leading-tight">
                                                                {data?.buttonLinkType === 'form' ? item.name : item.title}
                                                            </span>
                                                            <span className="text-[9px] font-mono opacity-50 truncate tracking-tight">
                                                                {data?.buttonLinkType === 'form' ? `#${item.id.slice(0, 8)}` : `/${item.slug}`}
                                                            </span>
                                                        </div>
                                                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" />}
                                                    </button>
                                                );
                                            })}
                                            {filteredContent.length === 0 && (
                                                <div className="p-4 text-center border-2 border-dashed border-zinc-100 rounded-2xl">
                                                    <p className="text-[10px] text-zinc-400 italic font-medium">No results found.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
