"use client";

import React from "react";
import { AlignLeft, AlignRight, Image as ImageIcon, Upload, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroConfigProps {
    data: any;
    onDataChange: (key: string, value: any) => void;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isUploading: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function HeroConfig({ data, onDataChange, onFileUpload, isUploading, fileInputRef }: HeroConfigProps) {
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
            <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-zinc-500 ml-1">Button Link</label>
                    <input
                        type="text"
                        value={data?.buttonLink || ""}
                        onChange={(e) => onDataChange('buttonLink', e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                    />
                </div>
            </div>

            <div className="h-px bg-zinc-100 my-4" />

            <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-500 ml-1">Hero Image</label>
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={data?.imageUrl || ""}
                            onChange={(e) => onDataChange('imageUrl', e.target.value)}
                            placeholder="Paste image URL..."
                            className={cn(
                                "flex-1 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all",
                                data?.imageUrl && !data.imageUrl.startsWith('http') && !data.imageUrl.startsWith('/') && "border-red-200 bg-red-50/30"
                            )}
                        />
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
                            className="px-3 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors disabled:opacity-50"
                        >
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        </button>
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

            <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-500 ml-1">Image Orientation</label>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: 'left', icon: AlignLeft, label: 'Left' },
                        { id: 'right', icon: AlignRight, label: 'Right' },
                        { id: 'background', icon: ImageIcon, label: 'Back' },
                    ].map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => onDataChange('orientation', opt.id)}
                            className={cn(
                                "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all",
                                (data?.orientation || 'background') === opt.id
                                    ? "bg-zinc-900 border-zinc-900 text-white shadow-md shadow-zinc-200"
                                    : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200 hover:text-zinc-600"
                            )}
                        >
                            <opt.icon className="w-4 h-4" />
                            <span className="text-[9px] font-bold uppercase tracking-tight">{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-500 ml-1">Font Color</label>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div
                            className="w-10 h-10 rounded-xl border border-zinc-100 shadow-inner shrink-0"
                            style={{ backgroundColor: data?.fontColor || '#18181b' }}
                        />
                        <input
                            type="color"
                            value={data?.fontColor || "#18181b"}
                            onChange={(e) => onDataChange('fontColor', e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                    <input
                        type="text"
                        value={data?.fontColor || "#18181b"}
                        onChange={(e) => onDataChange('fontColor', e.target.value)}
                        placeholder="#000000"
                        className="flex-1 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                    />
                </div>
            </div>
        </div>
    );
}
