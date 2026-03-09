"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { BrandPage } from "@/app/actions/pages";
import { Form as BrandForm } from "@/app/actions/forms";

export function HeroConfig({ data, brandPages, brandForms, onDataChange }: {
    data: any;
    brandPages?: BrandPage[];
    brandForms?: BrandForm[];
    onDataChange: (key: string, value: any) => void;
}) {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-500 ml-1">Heading</label>
                <input
                    type="text"
                    value={data?.heading || ""}
                    onChange={(e) => onDataChange('heading', e.target.value)}
                    placeholder="Enter main heading"
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                />
            </div>
            <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-500 ml-1">Subheading</label>
                <textarea
                    value={data?.subheading || ""}
                    onChange={(e) => onDataChange('subheading', e.target.value)}
                    placeholder="Enter subheading"
                    rows={3}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all resize-none"
                />
            </div>

            <div className="pt-4 border-t border-zinc-100">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m5 12 7-7 7 7" /><path d="M12 19V5" /></svg>
                    </div>
                    <span className="text-[11px] font-bold text-zinc-900 uppercase tracking-widest">Button Content</span>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-zinc-500 ml-1">Button Text</label>
                        <input
                            type="text"
                            value={data?.buttonText || ""}
                            onChange={(e) => onDataChange('buttonText', e.target.value)}
                            placeholder="Get Started"
                            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                        />
                    </div>

                    <div className="space-y-3 p-4 bg-zinc-50/50 rounded-2xl border border-zinc-100">
                        <div className="flex items-center justify-between gap-4">
                            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-tight">Action Type</label>
                            <div className="flex bg-white p-1 rounded-lg border border-zinc-200">
                                {[
                                    { id: 'external', label: 'URL' },
                                    { id: 'page', label: 'Page' },
                                    { id: 'form', label: 'Form' },
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => onDataChange('buttonLinkType', type.id)}
                                        className={cn(
                                            "py-1 px-3 rounded text-[10px] font-bold uppercase transition-all",
                                            (data?.buttonLinkType || 'external') === type.id
                                                ? "bg-zinc-900 text-white shadow-sm"
                                                : "text-zinc-400 hover:text-zinc-600"
                                        )}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            {(data?.buttonLinkType || 'external') === 'external' ? (
                                <input
                                    type="text"
                                    value={data?.buttonLink || ""}
                                    onChange={(e) => onDataChange('buttonLink', e.target.value)}
                                    placeholder="https://..."
                                    className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all shadow-sm"
                                />
                            ) : data?.buttonLinkType === 'page' ? (
                                <select
                                    value={data?.buttonLink || ""}
                                    onChange={(e) => onDataChange('buttonLink', e.target.value)}
                                    className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all shadow-sm"
                                >
                                    <option value="">Select a page...</option>
                                    {brandPages?.map(p => (
                                        <option key={p.id} value={p.slug}>{p.title} (/{p.slug})</option>
                                    ))}
                                </select>
                            ) : (
                                <select
                                    value={data?.buttonLink || ""}
                                    onChange={(e) => onDataChange('buttonLink', e.target.value)}
                                    className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all shadow-sm"
                                >
                                    <option value="">Select a form...</option>
                                    {brandForms?.map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
