"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { sansFont } from "@/lib/design-system";
import { Settings, Globe, Search, Share2, PanelRightClose } from "lucide-react";
import { BrandPage } from "@/app/actions/pages";

interface PageSettingsProps {
    page: BrandPage;
    onChange: (updates: Partial<BrandPage>) => void;
    onClose: () => void;
}

export function PageSettings({ page, onChange, onClose }: PageSettingsProps) {
    return (
        <div className="flex flex-col h-full bg-white">
            <div className="h-14 border-b border-zinc-50 flex items-center justify-between px-6 shrink-0 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-white">
                        <Settings className="w-4 h-4" />
                    </div>
                    <h2 className={cn("text-xs font-bold text-zinc-900 uppercase tracking-widest", sansFont)}>
                        Page Settings
                    </h2>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-zinc-50 rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                    <PanelRightClose className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 pb-32">
                {/* General Settings */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Globe className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">General</span>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-tight ml-1">Page Title</label>
                        <input
                            type="text"
                            value={page.title}
                            onChange={(e) => onChange({ title: e.target.value })}
                            placeholder="Home Page"
                            className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-tight ml-1">URL Slug</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium">/</span>
                            <input
                                type="text"
                                value={page.slug}
                                onChange={(e) => onChange({ slug: e.target.value })}
                                placeholder="home"
                                className="w-full bg-zinc-50 border-none rounded-xl pl-7 pr-4 py-3 text-sm focus:ring-2 focus:ring-zinc-900 transition-all font-medium placeholder:text-zinc-300"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-tight ml-1">Background Color</label>
                            <span className="text-[10px] font-mono text-zinc-400">{page.background_color || '#FFFFFF'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div
                                    className="w-10 h-10 rounded-xl border border-zinc-100 shadow-inner shrink-0"
                                    style={{ backgroundColor: page.background_color || '#FFFFFF' }}
                                />
                                <input
                                    type="color"
                                    value={page.background_color || "#FFFFFF"}
                                    onChange={(e) => onChange({ background_color: e.target.value })}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                            <input
                                type="text"
                                value={page.background_color || "#FFFFFF"}
                                onChange={(e) => onChange({ background_color: e.target.value })}
                                placeholder="#FFFFFF"
                                className="flex-1 bg-zinc-50 border-none rounded-xl px-4 py-2.5 text-xs font-mono focus:ring-2 focus:ring-zinc-900 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* SEO Settings */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Search className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">SEO & Metadata</span>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-tight ml-1">SEO Description</label>
                        <textarea
                            rows={4}
                            placeholder="Add a meta description for search engines..."
                            className="w-full bg-zinc-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-zinc-900 transition-all font-medium resize-none placeholder:text-zinc-300"
                        />
                    </div>
                </div>

                {/* Social Sharing */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Share2 className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Social Sharing</span>
                    </div>

                    <div className="aspect-[1.91/1] w-full bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-center p-6 group cursor-pointer hover:bg-zinc-100/50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-zinc-400 group-hover:scale-110 transition-transform">
                            <PlusIcon className="w-5 h-5" />
                        </div>
                        <p className="mt-3 text-[11px] font-bold text-zinc-500 group-hover:text-zinc-600 transition-colors uppercase">Upload OG Image</p>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-zinc-50/50 border-t border-zinc-100">
                <div className="bg-white p-4 rounded-2xl border border-zinc-100 space-y-3 shadow-sm">
                    <h4 className="text-[11px] font-bold text-zinc-900">Custom Domain</h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">To use a custom domain, first configure it in your brand settings.</p>
                    <button className="w-full py-2 bg-zinc-900 text-white rounded-xl text-[11px] font-bold hover:bg-zinc-800 transition-colors shadow-sm">
                        Manage Domains
                    </button>
                </div>
            </div>
        </div>
    );
}

function PlusIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 5v14" /><path d="M5 12h14" /></svg>
    );
}
